<?php

namespace App\Modules\Campeigner\Controllers;

use App\Http\Clients\PaystackClient;
use App\Http\Controllers\ApiController;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Campeigner\Notifications\CampaignFundedNotification;
use App\Modules\Shared\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CampaignController extends ApiController
{
    public function __construct(
        protected readonly PaystackClient $paystackGatewayInterface,
    ) {}


    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $campaigns = $user->campaigns()
            ->withCount('submissions')
            ->with('images')
            ->orderBy('id', 'desc')
            ->get();

        $campaigns->transform(function ($campaign) {
            $campaign->image_urls = $campaign->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('storage/' . $image->file_path), // Adjust 'path' and 'asset()' as per your storage setup
                ];
            });
            // Remove the raw 'images' relationship to clean up the data sent to Inertia,
            // unless you specifically need it.
            unset($campaign->images);
            return $campaign;
        });

        return Inertia::render('Advertiser/Campaigns/Index', [
            'campaigns' => $campaigns
        ]);
    }

    public function create()
    {
        return Inertia::render('Advertiser/Campaigns/Create');
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $isTrial = $request->boolean('is_trial');

        if ($isTrial && $user->campaigns()->where('is_trial', true)->exists()) {
            return back()->withErrors(['is_trial' => 'You have already used your one free trial campaign.'])->withInput();
        }

        // Detect PHP-level upload errors before validation runs.
        // These happen when the server rejects the file (e.g. upload_max_filesize in php.ini),
        // which Laravel's 'file' rule can only report as "failed to upload" without context.
        foreach ($request->file('files', []) as $index => $file) {
            if ($file && $file->getError() !== UPLOAD_ERR_OK) {
                $hint = match ($file->getError()) {
                    UPLOAD_ERR_INI_SIZE   => 'The file exceeds the server\'s upload_max_filesize limit (~' . ini_get('upload_max_filesize') . ').',
                    UPLOAD_ERR_FORM_SIZE  => 'The file exceeds the MAX_FILE_SIZE set in the form.',
                    UPLOAD_ERR_PARTIAL    => 'The file was only partially uploaded. Please try again.',
                    UPLOAD_ERR_NO_FILE    => 'No file was received by the server. Ensure the form is submitted as multipart/form-data.',
                    UPLOAD_ERR_NO_TMP_DIR => 'Server misconfiguration: no temporary upload directory.',
                    UPLOAD_ERR_CANT_WRITE => 'Server failed to write the file to disk.',
                    default               => 'File upload failed (PHP error code ' . $file->getError() . ').',
                };
                return back()->withErrors(["files.{$index}" => $hint])->withInput();
            }
        }

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'category'      => 'nullable|string',
            'platforms'     => 'required|array',
            'platforms.*'   => 'string',
            'payout'        => $isTrial ? 'nullable|numeric' : 'required|numeric|min:1',
            'target_shares' => $isTrial ? 'nullable|integer' : 'required|integer|min:1',
            'files'         => 'required|array',
            'files.*'       => [
                'file',
                'mimes:jpg,jpeg,png,mp4,mov,avi,webm',
                'max:51200',
            ],
            'total_budget'   => ['nullable', 'numeric', 'min:0'],
            'management_fee' => ['nullable', 'numeric', 'min:0'],
            'base_budget'    => ['nullable', 'numeric', 'min:0'],
            'min_followers'  => ['required', 'string'],
            'is_trial'       => ['nullable', 'boolean'],
        ], [
            'files.*.file'  => 'Each upload must be a valid file.',
            'files.*.mimes' => 'Allowed formats: jpg, jpeg, png, mp4, mov, avi, webm.',
            'files.*.max'   => 'Each file must be 50 MB or smaller.',
        ]);

        // Force trial values server-side so they cannot be tampered with.
        if ($isTrial) {
            $validated['payout']         = 200;
            $validated['target_shares']  = 5;
            $validated['base_budget']    = 1000;
            $validated['management_fee'] = 0;
            $validated['total_budget']   = 1000;
        }

        /*  abort_if(
            $user->campaigner && ! $user->campaigner->is_approved,
            403,
            'Your campaigner account is pending approval.'
        ); */


        DB::transaction(function () use ($validated, $user, $request, $isTrial) {
            $campaign = $user->campaigns()->create([
                'title'          => $validated['title'],
                'description'    => $validated['description'] ?? null,
                'platforms'      => $validated['platforms'],
                'category'       => $validated['category'],
                'payout'         => $validated['payout'],
                'target_shares'  => $validated['target_shares'],
                'total_budget'   => $validated['total_budget'] ?? 0,
                'status'         => $isTrial ? 'live' : 'pending',
                'is_trial'       => $isTrial,
                'management_fee' => $validated['management_fee'] ?? null,
                'base_budget'    => $validated['base_budget'] ?? null,
                'min_followers'  => $validated['min_followers'],
            ]);

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $filePath = $file->store('campaigns', 'public');

                    $campaign->images()->create([
                        'file_path' => $filePath,
                    ]);
                }
            }
        });

        $message = $isTrial
            ? 'Trial campaign launched! Up to 5 promoters can now pick it up.'
            : 'Campaign created successfully';

        return redirect()->route('campaigns.index')->with('success', $message);
    }

    public function edit(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to edit this campaign.');
        }
        $campaign->load('images');

        $campaign->image_urls = $campaign->images->map(function ($image) {
            return [
                'id' => $image->id,
                'url' => asset('storage/' . $image->file_path),
            ];
        });

        unset($campaign->images);
        return Inertia::render('Advertiser/Campaigns/Edit', [
            'campaign' => $campaign
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to update this campaign.');
        }

        foreach ($request->file('new_files', []) as $index => $file) {
            if ($file && $file->getError() !== UPLOAD_ERR_OK) {
                $hint = match ($file->getError()) {
                    UPLOAD_ERR_INI_SIZE   => 'The file exceeds the server\'s upload_max_filesize limit (~' . ini_get('upload_max_filesize') . ').',
                    UPLOAD_ERR_FORM_SIZE  => 'The file exceeds the MAX_FILE_SIZE set in the form.',
                    UPLOAD_ERR_PARTIAL    => 'The file was only partially uploaded. Please try again.',
                    UPLOAD_ERR_NO_FILE    => 'No file was received by the server. Ensure the form is submitted as multipart/form-data.',
                    UPLOAD_ERR_NO_TMP_DIR => 'Server misconfiguration: no temporary upload directory.',
                    UPLOAD_ERR_CANT_WRITE => 'Server failed to write the file to disk.',
                    default               => 'File upload failed (PHP error code ' . $file->getError() . ').',
                };
                return back()->withErrors(["new_files.{$index}" => $hint])->withInput();
            }
        }

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'platforms'     => 'required|array',
            'category'      => 'nullable|string',
            'platforms.*'   => 'string',
            'payout'        => 'required|numeric|min:1',
            'target_shares' => 'required|integer|min:1',
            'status'        => 'nullable|string',
            'new_files'     => 'nullable|array',
            'new_files.*'   => [
                'file',
                'mimes:jpg,jpeg,png,mp4,mov,avi,webm',
                'max:51200',
            ],
            'remove_files'   => 'nullable|array',
            'remove_files.*' => 'integer|exists:campaign_images,id',
            'total_budget'   => ['required', 'numeric', 'min:0'],
            'management_fee' => ['nullable', 'numeric', 'min:0'],
            'base_budget'    => ['nullable', 'numeric', 'min:0'],
            'min_followers'  => ['required', 'string'],
        ], [
            'new_files.*.file'  => 'Each upload must be a valid file.',
            'new_files.*.mimes' => 'Allowed formats: jpg, jpeg, png, mp4, mov, avi, webm.',
            'new_files.*.max'   => 'Each file must be 50 MB or smaller.',
        ]);

        $campaign->update([
            'title'         => $validated['title'],
            'description'   => $validated['description'] ?? null,
            'platforms'      => $validated['platforms'],
            'payout'        => $validated['payout'],
            'target_shares' => $validated['target_shares'],
            'category'      => $validated['category'],
            //'target_budget' => $validated['target_budget'],
            'status'        => $validated['status'],
            'total_budget' => $validated['total_budget'],
            'management_fee'  => $validated['management_fee'] ?? null,
            'base_budget'  => $validated['base_budget'] ?? null,
            'min_followers'  => $validated['min_followers'],
        ]);


        // DELETE SELECTED FILES
        if (!empty($validated['remove_files'])) {
            $imagesToDelete = $campaign->images()->whereIn('id', $validated['remove_files'])->get();

            foreach ($imagesToDelete as $img) {
                Storage::disk('public')->delete($img->file_path);
                $img->delete();
            }
        }

        // ADD NEW IMAGES
        if ($request->hasFile('new_files')) {
            foreach ($request->file('new_files') as $file) {
                $filePath = $file->store('campaigns', 'public');

                $campaign->images()->create([
                    'file_path' => $filePath,
                ]);
            }
        }

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign updated successfully');
    }

    public function destroy(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to delete this campaign.');
        }

        $refundMessage = 'Campaign deleted successfully.';

        DB::transaction(function () use ($campaign, &$refundMessage) {
            $user   = $campaign->user;
            $wallet = $user->wallet;

            // Only attempt a refund if a successful payment exists.
            $payment = $campaign->payment()->where('status', 'success')->first();

            if ($payment) {
                // Funded amount is stored in kobo in CampaignPayment.
                $totalFundedKobo = (int) $payment->amount;

                // PromoterEarning.amount is in naira — multiply to convert to kobo.
                $paidOutNaira = (float) $campaign->completedPayouts()->sum('amount');
                $paidOutKobo  = (int) round($paidOutNaira * 100);

                // Unused balance after honouring all completed payouts.
                $unusedKobo = max(0, $totalFundedKobo - $paidOutKobo);

                if ($unusedKobo > 0) {
                    // 2% cancellation fee applied to unused balance.
                    $feeKobo    = (int) round($unusedKobo * 0.02);
                    $refundKobo = $unusedKobo - $feeKobo;

                    // Credit the refund.
                    $wallet->increment('balance', $refundKobo);
                    $wallet->transactions()->create([
                        'type'        => 'credit',
                        'amount'      => $refundKobo,
                        'reference'   => 'REFUND_' . Str::uuid(),
                        'description' => "Cancellation refund – {$campaign->title}",
                        'status'      => 'successful',
                        'metadata'    => [
                            'campaign_id'        => $campaign->id,
                            'total_funded_kobo'  => $totalFundedKobo,
                            'paid_to_promoters'  => $paidOutKobo,
                            'unused_kobo'        => $unusedKobo,
                            'cancellation_fee'   => $feeKobo,
                            'refund_kobo'        => $refundKobo,
                        ],
                    ]);

                    // Record the 2% fee as a separate debit for audit trail.
                    $wallet->transactions()->create([
                        'type'        => 'debit',
                        'amount'      => $feeKobo,
                        'reference'   => 'FEE_' . Str::uuid(),
                        'description' => "2% cancellation fee – {$campaign->title}",
                        'status'      => 'successful',
                        'metadata'    => [
                            'campaign_id' => $campaign->id,
                            'fee_rate'    => '2%',
                            'unused_kobo' => $unusedKobo,
                        ],
                    ]);

                    $refundNaira = number_format($refundKobo / 100, 2);
                    $feeNaira    = number_format($feeKobo / 100, 2);
                    $refundMessage = "Campaign deleted. ₦{$refundNaira} has been refunded to your wallet (₦{$feeNaira} cancellation fee deducted).";
                }
            }

            $campaign->delete();
        });

        return redirect()->route('campaigns.index')->with('success', $refundMessage);
    }

    public function fundCampaign(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to fund this campaign.');
        }

        $userBalance = Auth::user()->wallet->balance ?? 0.00;
        return Inertia::render('Advertiser/Campaigns/FundCampaign', [
            'campaign' => $campaign,
            'user_balance' => $userBalance / 100,
        ]);
    }

    public function processFunding(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to fund this campaign.');
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        if ($campaign->status === 'live') {
            return back()->with('error', 'This campaign is already funded.');
        }

        /** @var User $user */
        $user = Auth::user();
        $wallet = $user->wallet;

        $amountInCents = (int) ($validated['amount'] * 100);

        // Wallet sufficient → instant funding

        if ($wallet->balance >= $amountInCents) {
            $this->fundFromWallet($user, $campaign, $amountInCents);

            return Inertia::render('Advertiser/Campaigns/FundSuccess', [
                'campaign' => $campaign->fresh(),
            ]);
        }

        $response = $this->initiateGatewayPayment($user, $campaign, $amountInCents);

        if (!$response) {
            return back()->withErrors(['amount' => 'Failed to initiate gateway payment.']);
        }

        if (is_array($response) && $response['type'] === 'opay') {
            return back()->with('opay_payment', $response['payment']);
        }

        return back()->with('error', 'Unexpected payment response.');
    }

    private function fundFromWallet(User $user, Campaign $campaign, int $amountInCents)
    {
        DB::transaction(function () use ($user, $campaign, $amountInCents) {
            $wallet = $user->wallet;

            $reference = 'CMP_' . Str::uuid();

            // Debit wallet
            $wallet->decrement('balance', $amountInCents);

            $wallet->transactions()->create([
                'type'        => 'debit',
                'amount'      => $amountInCents,
                'reference'   => $reference,
                'description' => "Campaign funding ({$campaign->id})",
                'metadata'    => [
                    'campaign_id' => $campaign->id,
                ],
            ]);

            // Record payment
            $campaign->payment()->create([
                'user_id'   => $user->id,
                'reference' => $reference,
                'amount'    => $amountInCents,
                'status'    => 'success',
                'channel'   => 'wallet',
            ]);

            // Mark campaign funded
            $campaign->update(['status' => 'live']);
        });

        // Notify campaign owner
        $campaign->user->notify(new CampaignFundedNotification($campaign));
    }




    private function initiateGatewayPayment(User $user, Campaign $campaign, int $amountInCents)
    {
        $reference = 'CMP_' . Str::uuid();

        $payment = $campaign->payment()->create([
            'user_id'   => $user->id,
            'reference' => $reference,
            'amount'    => $amountInCents,
            'status'    => 'pending',
            'channel'   => 'opay',
        ]);

        $response = $this->paystackGatewayInterface->payin([
            'email'        => $user->email,
            'userId'       => $user->id,
            'amount'       => $amountInCents,
            'reference'    => $reference,
            'callback_url' => url('/api/webhook/opay'),
        ]);

        if (($response['code'] ?? '') !== '00000') {
            return null;
        }

        $data       = $response['data'] ?? [];
        $nextAction = $data['nextAction'] ?? [];

        // Store OPay orderNo for status polling
        if (! empty($data['orderNo'])) {
            $payment->update(['gateway_data' => ['opay_order_no' => $data['orderNo']]]);
        }

        return [
            'type'    => 'opay',
            'payment' => [
                'bank_account' => $nextAction['transferAccountNumber'] ?? null,
                'bank_name'    => $nextAction['transferBankName'] ?? 'OPay Digital Services',
                'amount'       => $amountInCents / 100,
                'reference'    => $data['reference'] ?? $reference,
                'order_no'     => $data['orderNo'] ?? null,
                'expires_at'   => isset($nextAction['expiredTimestamp'])
                    ? date('d M Y, H:i', (int) $nextAction['expiredTimestamp'])
                    : null,
            ],
        ];
    }


    public function promoterSubmissions(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to view these submissions.');
        }

        $submissions = $campaign->submissions()
            ->with('user:id,email')
            ->latest()
            ->get();


        return Inertia::render('Advertiser/Campaigns/Submissions', [
            'campaign' => $campaign,
            'submissions' => $submissions,
        ]);
    }

    public function handleGatewayCallback(Request $request, Campaign $campaign)
    {
        $reference = $request->query('reference');

        if (! $reference) {
            return redirect()->route('campaigns.index')->with('error', 'Missing payment reference.');
        }

        $body   = $this->paystackGatewayInterface->verifyTransaction($reference);
        $status = $body['data']['status'] ?? null;

        if ($status === 'SUCCESS') {
            app(PaymentService::class)->handleChargeSuccess(['reference' => $reference]);
            return Inertia::render('Advertiser/Campaigns/FundSuccess', ['campaign' => $campaign]);
        }

        if (in_array($status, ['FAIL', 'CLOSE'])) {
            return redirect()->route('campaigns.index')->with('error', 'Payment was not completed.');
        }

        // Still PENDING — payment not yet confirmed
        return redirect()->route('campaigns.fund', $campaign->id)
            ->with('info', 'Payment is still pending. Please complete the bank transfer and check back.');
    }

    public function updateStatus(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            return redirect()->route('campaigns.index')
                ->with('error', 'You are not allowed to update this campaign.');
        }

        $request->validate([
            'status' => ['required', 'string', 'in:pending,paused,cancelled'],
        ]);

        $campaign->update(['status' => $request->status]);

        return redirect()
            ->route('campaigns.index')
            ->with('success', 'Campaign updated successfully.');
    }
}
