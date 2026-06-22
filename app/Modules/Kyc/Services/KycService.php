<?php

namespace App\Modules\Kyc\Services;

use App\Http\Clients\DojahClient;
use App\Models\KycVerification;
use App\Models\User;

class KycService
{
    public function __construct(private readonly DojahClient $dojah) {}

    /**
     * Submit a KYC request against Dojah and persist the result.
     *
     * Returns ['status' => 'approved'|'pending'|'failed', 'message' => '...']
     * - approved  → Dojah confirmed identity, name matched (promoters) or entity returned (advertisers)
     * - pending   → Dojah confirmed identity but promoter name match was low (<70%); admin reviews
     * - failed    → Dojah returned no entity or an error
     */
    public function submit(User $user, string $idType, string $idNumber): array
    {
        $response = $idType === 'bvn'
            ? $this->dojah->verifyBvn($idNumber)
            : $this->dojah->verifyNin($idNumber);

        if (empty($response['entity'])) {
            $errorMsg = $response['error'] ?? $response['message'] ?? null;
            return [
                'status'  => 'failed',
                'message' => $errorMsg
                    ?? 'Could not verify your ' . strtoupper($idType) . '. Please check the number and try again.',
            ];
        }

        $verifiedName = $this->dojah->extractName($response, $idType);

        if (!$verifiedName) {
            return [
                'status'  => 'failed',
                'message' => 'Identity found but name could not be read. Please contact support.',
            ];
        }

        // Advertisers (campaigners): Dojah returned a valid entity → auto-approve.
        // The AML control for advertisers is at payout-account registration time
        // (account name must match this verified_name).
        if ($user->role !== 'promoter') {
            $this->upsertRecord($user, $idType, $idNumber, $verifiedName, 100, 'approved');
            return [
                'status'  => 'approved',
                'message' => "Identity verified. Welcome, {$verifiedName}!",
            ];
        }

        // Promoters: compare verified name against their registered first+last name.
        $registeredName = trim(
            ($user->promoter?->first_name ?? '') . ' ' . ($user->promoter?->last_name ?? '')
        );
        $score = $this->matchScore($verifiedName, $registeredName);

        if ($score >= 70) {
            $this->upsertRecord($user, $idType, $idNumber, $verifiedName, $score, 'approved');
            return [
                'status'  => 'approved',
                'message' => "Identity verified. Welcome, {$verifiedName}!",
            ];
        }

        // Low match → pending for admin review
        $this->upsertRecord($user, $idType, $idNumber, $verifiedName, $score, 'pending');
        return [
            'status'  => 'pending',
            'message' => 'Your identity has been submitted and is under review. We will notify you within 24 hours.',
        ];
    }

    /**
     * Token-sort both names before comparing to handle ordering differences
     * like "IKEOGU EMMANUEL" vs "Emmanuel Ikeogu".
     */
    private function matchScore(string $a, string $b): int
    {
        $normalize = static function (string $name): string {
            $tokens = preg_split('/\s+/', strtolower(trim($name)));
            sort($tokens);
            return implode(' ', $tokens);
        };

        similar_text($normalize($a), $normalize($b), $percent);
        return (int) round($percent);
    }

    private function upsertRecord(
        User   $user,
        string $idType,
        string $idNumber,
        string $verifiedName,
        int    $score,
        string $status
    ): void {
        KycVerification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'status'           => $status,
                'id_type'          => $idType,
                'id_number'        => $idNumber,
                'verified_name'    => $verifiedName,
                'name_match_score' => $score,
                'reviewed_at'      => $status === 'approved' ? now() : null,
                'admin_note'       => null,
            ]
        );
    }
}
