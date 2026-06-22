<?php

namespace App\Http\Clients;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DojahClient
{
    private string $appId;
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->appId     = config('services.dojah.app_id', '');
        $this->secretKey = config('services.dojah.secret_key', '');
        $this->baseUrl   = config('services.dojah.base_url', 'https://api.dojah.io');
    }

    public function verifyBvn(string $bvn): array
    {
        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/api/v1/kyc/bvn", ['bvn' => $bvn]);

        Log::info('[Dojah] BVN verify', ['status' => $response->status()]);

        return $response->json() ?? [];
    }

    public function verifyNin(string $nin): array
    {
        $response = Http::withHeaders($this->headers())
            ->get("{$this->baseUrl}/api/v1/kyc/nin", ['nin' => $nin]);

        Log::info('[Dojah] NIN verify', ['status' => $response->status()]);

        return $response->json() ?? [];
    }

    /**
     * Extract full name from a Dojah response.
     * BVN entity uses first_name / last_name; NIN uses firstname / surname.
     */
    public function extractName(array $response, string $idType): ?string
    {
        $entity = $response['entity'] ?? [];

        [$first, $middle, $last] = $idType === 'bvn'
            ? [
                $entity['first_name']  ?? '',
                $entity['middle_name'] ?? '',
                $entity['last_name']   ?? '',
            ]
            : [
                $entity['firstname']   ?? '',
                $entity['middlename']  ?? '',
                $entity['surname']     ?? '',
            ];

        $parts = array_filter([trim($first), trim($middle), trim($last)]);

        return $parts ? implode(' ', $parts) : null;
    }

    private function headers(): array
    {
        return [
            'AppId'         => $this->appId,
            'Authorization' => $this->secretKey,
            'Accept'        => 'application/json',
        ];
    }
}
