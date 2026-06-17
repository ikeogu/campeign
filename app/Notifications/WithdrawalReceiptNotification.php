<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalReceiptNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Transaction $transaction) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $meta          = $this->transaction->metadata ?? [];
        $grossKobo     = (int) $this->transaction->amount;
        $feeKobo       = (int) ($meta['fee_kobo'] ?? 0);
        $netPayoutKobo = (int) ($meta['net_payout_kobo'] ?? $grossKobo);

        return (new MailMessage)
            ->subject('Withdrawal Receipt – ₦' . number_format($netPayoutKobo / 100, 2))
            ->view('mails.withdrawal-receipt', [
                'reference'      => $this->transaction->reference,
                'date'           => $this->transaction->created_at->format('d M Y, H:i'),
                'account_name'   => $meta['account_name'] ?? '—',
                'account_number' => $meta['account_number'] ?? '—',
                'bank_name'      => $meta['bank_name'] ?? ($meta['bank_code'] ?? '—'),
                'gross_amount'   => number_format($grossKobo / 100, 2),
                'fee_amount'     => number_format($feeKobo / 100, 2),
                'net_amount'     => number_format($netPayoutKobo / 100, 2),
                'narration'      => $meta['narration'] ?? $this->transaction->description ?? '—',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
