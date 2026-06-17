<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WithdrawalExportController extends Controller
{
    public function receipt(Transaction $transaction): Response
    {
        abort_unless(
            $transaction->type === 'debit' && $transaction->channel === 'withdrawal',
            404
        );

        $transaction->load('wallet.user');

        $meta         = $transaction->metadata ?? [];
        $grossKobo    = (int) $transaction->amount;
        $feeKobo      = (int) ($meta['fee_kobo'] ?? 0);
        $netPayoutKobo = (int) ($meta['net_payout_kobo'] ?? $grossKobo);

        $data = [
            'reference'      => $transaction->reference,
            'date'           => $transaction->created_at->format('d M Y, H:i'),
            'status'         => $transaction->status,
            'user_email'     => $transaction->wallet?->user?->email ?? '—',
            'account_name'   => $meta['account_name'] ?? '—',
            'account_number' => $meta['account_number'] ?? '—',
            'bank_name'      => $meta['bank_name'] ?? ($meta['bank_code'] ?? '—'),
            'gross_amount'   => number_format($grossKobo / 100, 2),
            'fee_amount'     => number_format($feeKobo / 100, 2),
            'net_amount'     => number_format($netPayoutKobo / 100, 2),
            'narration'      => $meta['narration'] ?? $transaction->description ?? '—',
        ];

        return response()->view('admin.withdrawal-receipt', $data);
    }

    public function pendingCsv(): StreamedResponse
    {
        $transactions = Transaction::query()
            ->where('type', 'debit')
            ->where('channel', 'withdrawal')
            ->where('status', 'pending')
            ->with('wallet.user')
            ->orderBy('created_at')
            ->get();

        $filename = 'paystack-bulk-transfer-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Transfer Amount',
                'Transfer Note (Optional)',
                'Transfer Reference (Optional)',
                'Recipient Code (This overrides all other details if available)',
                'Bank Code or Slug',
                'Account Number',
                'Account Name (Optional)',
                'Email Address (Optional)',
            ]);

            foreach ($transactions as $tx) {
                $meta      = $tx->metadata ?? [];
                $netKobo   = (int) ($meta['net_payout_kobo'] ?? $tx->amount);
                $amountNaira = number_format($netKobo / 100, 2, '.', '');

                fputcsv($handle, [
                    $amountNaira,
                    $meta['narration'] ?? 'Wallet withdrawal',
                    $tx->reference,
                    '', // Recipient Code — we store raw bank details, not Paystack recipient codes
                    $meta['bank_code'] ?? '',
                    $meta['account_number'] ?? '',
                    $meta['account_name'] ?? '',
                    $tx->wallet?->user?->email ?? '',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
