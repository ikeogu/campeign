<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WithdrawalExportController extends Controller
{
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
