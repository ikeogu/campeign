<?php

namespace App\Filament\Resources\ProofResource\Pages;

use App\Filament\Resources\ProofResource;
use App\Modules\Promoter\Services\PostVerificationService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditProof extends EditRecord
{
    protected static string $resource = ProofResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * The status field on this form is a plain Select — saving it directly
     * would just overwrite the `status` column without touching the wallet,
     * so approving/rejecting from here has to go through the same
     * PostVerificationService the row actions use. Anything else (already
     * approved/rejected being changed again, or reopened back to pending)
     * would need a wallet reversal the service doesn't support, so that's
     * blocked instead of silently leaving the wallet wrong.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        $originalStatus = $this->record->getOriginal('status');
        $newStatus = $data['status'] ?? $originalStatus;

        if ($newStatus === $originalStatus) {
            return $data;
        }

        if ($originalStatus !== 'pending') {
            Notification::make()
                ->title('Status change not allowed')
                ->body("This submission is already {$originalStatus}. Reversing it needs a manual wallet correction — use the Approve/Reject actions only on Pending submissions.")
                ->danger()
                ->send();

            $this->halt();
        }

        $service = app(PostVerificationService::class);

        if ($newStatus === 'approved') {
            $views = filled($data['views'] ?? null) ? (int) $data['views'] : null;

            $service->approvePost($this->record, $views);

            // approvePost() already persisted status/views — drop them so the
            // default save below doesn't duplicate the wallet credit.
            unset($data['status'], $data['views']);

            return $data;
        }

        if ($newStatus === 'rejected') {
            $service->rejectPost($this->record, $data['rejection_reason'] ?? null);

            unset($data['status'], $data['rejection_reason']);

            return $data;
        }

        // Reopening a pending submission to some other status isn't a
        // supported flow.
        Notification::make()
            ->title('Status change not allowed')
            ->body('Submissions can only move from Pending to Approved or Rejected.')
            ->danger()
            ->send();

        $this->halt();
    }
}
