<?php

namespace App\Notifications;

use App\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignProofFailedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        private readonly Campaign $campaign,
        private string $status,
        private ?string $reason = null
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Submission Rejected : ' . $this->campaign->title)
            ->view('mails.campaigns.submission-failed', [
                'campaign' => $this->campaign,
                'reason'   => $this->reason,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $body = 'Your submission for "' . $this->campaign->title . '" was ' . $this->status . '.';

        if ($this->reason) {
            $body .= ' Reason: ' . $this->reason;
        }

        return [
            'type'       => 'submission_rejected',
            'title'      => 'Submission Rejected',
            'body'       => $body,
            'reason'     => $this->reason,
            'action_url' => route('promoter.submissions'),
        ];
    }
}
