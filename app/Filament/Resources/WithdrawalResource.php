<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WithdrawalResource\Pages;
use App\Models\Transaction;
use App\Notifications\NotifyAnythingNotification;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\BulkAction;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WithdrawalResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon  = 'heroicon-o-arrow-up-right';
    protected static ?string $navigationLabel = 'Withdrawals';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int    $navigationSort  = 2;

    // Badge shows count of withdrawals that need attention (pending or processing)
    public static function getNavigationBadge(): ?string
    {
        $count = Transaction::where('type', 'debit')
            ->where('channel', 'withdrawal')
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(
                fn(Builder $query) => $query
                    ->where('type', 'debit')
                    ->where('channel', 'withdrawal')
                    ->with('wallet.user')
            )
            ->columns([
                Tables\Columns\TextColumn::make('wallet.user.email')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                    ->weight(\Filament\Support\Enums\FontWeight::Bold)
                    ->sortable(),

                Tables\Columns\TextColumn::make('net_payout')
                    ->label('Net to Bank')
                    ->getStateUsing(fn(Transaction $record): string =>
                        '₦' . number_format(
                            (int) ($record->metadata['net_payout_kobo'] ?? $record->amount) / 100,
                            2
                        )
                    )
                    ->color('success'),

                Tables\Columns\TextColumn::make('bank_name')
                    ->label('Bank')
                    ->getStateUsing(fn(Transaction $record): string =>
                        $record->metadata['bank_name'] ?? $record->metadata['bank_code'] ?? '—'
                    )
                    ->searchable(query: fn($query, $search) =>
                        $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.bank_name')) LIKE ?", ["%{$search}%"])
                    ),

                Tables\Columns\TextColumn::make('bank_account')
                    ->label('Bank Account')
                    ->getStateUsing(fn(Transaction $record): string =>
                        ($record->metadata['account_name'] ?? '—') . "\n" .
                        ($record->metadata['account_number'] ?? '') .
                        ($record->metadata['bank_code'] ? ' (' . $record->metadata['bank_code'] . ')' : '')
                    )
                    ->wrap(),

                Tables\Columns\TextColumn::make('reference')
                    ->label('Reference')
                    ->searchable()
                    ->copyable()
                    ->fontFamily(\Filament\Support\Enums\FontFamily::Mono)
                    ->size(\Filament\Tables\Columns\TextColumn\TextColumnSize::ExtraSmall),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn(string $state) => match($state) {
                        'successful'           => 'success',
                        'processing'           => 'info',
                        'failed', 'reversed'   => 'danger',
                        default                => 'warning',
                    })
                    ->formatStateUsing(fn(string $state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Requested At')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'    => 'Pending',
                        'processing' => 'Processing',
                        'successful' => 'Successful',
                        'failed'     => 'Failed',
                        'reversed'   => 'Reversed',
                    ]),
            ])
            ->actions([
                Action::make('mark_successful')
                    ->label('Mark Successful')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Mark as Successful')
                    ->modalDescription(fn(Transaction $record) =>
                        "Mark the ₦" . number_format($record->amount / 100, 2) .
                        " withdrawal for {$record->wallet->user->email} as successful? The user will be notified."
                    )
                    ->modalSubmitActionLabel('Yes, Mark Successful')
                    ->visible(fn(Transaction $record) =>
                        in_array($record->status, ['pending', 'processing'])
                    )
                    ->action(function (Transaction $record) {
                        $record->update(['status' => 'successful']);

                        $user = $record->wallet?->user;
                        if ($user) {
                            $user->notify(new NotifyAnythingNotification(
                                'Withdrawal Successful',
                                "Your withdrawal of ₦" . number_format($record->amount / 100, 2) .
                                " (ref: {$record->reference}) has been processed successfully.\n\n" .
                                "The funds should reflect in your bank account shortly."
                            ));
                        }

                        Notification::make()
                            ->title('Withdrawal marked as successful')
                            ->body('₦' . number_format($record->amount / 100, 2) . ' — ' . ($user?->email ?? 'unknown'))
                            ->success()
                            ->send();
                    }),

                Action::make('revert')
                    ->label('Revert')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Revert Withdrawal')
                    ->modalDescription(fn(Transaction $record) =>
                        "This will refund ₦" . number_format($record->amount / 100, 2) .
                        " back to {$record->wallet->user->email}'s wallet and mark the transaction as reversed. This cannot be undone."
                    )
                    ->modalSubmitActionLabel('Yes, Revert')
                    ->visible(fn(Transaction $record) =>
                        in_array($record->status, ['pending', 'processing'])
                    )
                    ->action(fn(Transaction $record) => static::revertWithdrawal($record)),
            ])
            ->bulkActions([
                BulkAction::make('mark_successful')
                    ->label('Mark as Successful')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Mark Selected as Successful')
                    ->modalDescription('This will mark all selected processing withdrawals as successful and notify each user. Only "processing" transactions will be updated — others will be skipped.')
                    ->modalSubmitActionLabel('Yes, Mark Successful')
                    ->deselectRecordsAfterCompletion()
                    ->action(function (Collection $records) {
                        $marked  = 0;
                        $skipped = 0;

                        foreach ($records as $record) {
                            if ($record->status !== 'processing') {
                                $skipped++;
                                continue;
                            }

                            $record->update(['status' => 'successful']);

                            $user = $record->wallet?->user;
                            if ($user) {
                                $user->notify(new NotifyAnythingNotification(
                                    'Withdrawal Successful',
                                    "Your withdrawal of ₦" . number_format($record->amount / 100, 2) .
                                    " (ref: {$record->reference}) has been processed successfully.\n\n" .
                                    "The funds should reflect in your bank account shortly."
                                ));
                            }

                            $marked++;
                        }

                        Notification::make()
                            ->title("Done: {$marked} marked successful, {$skipped} skipped")
                            ->success()
                            ->send();
                    }),

                BulkAction::make('revert_selected')
                    ->label('Revert Selected')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Revert Selected Withdrawals')
                    ->modalDescription('This will refund all selected pending/processing withdrawals back to the users\' wallets. This cannot be undone.')
                    ->modalSubmitActionLabel('Yes, Revert All')
                    ->deselectRecordsAfterCompletion()
                    ->action(function (Collection $records) {
                        $reverted = 0;
                        $skipped  = 0;

                        foreach ($records as $record) {
                            if (! in_array($record->status, ['pending', 'processing'])) {
                                $skipped++;
                                continue;
                            }
                            static::revertWithdrawal($record) ? $reverted++ : $skipped++;
                        }

                        Notification::make()
                            ->title("Done: {$reverted} reverted, {$skipped} skipped")
                            ->success()
                            ->send();
                    }),
            ])
            ->emptyStateHeading('No withdrawals found')
            ->emptyStateDescription('No withdrawal transactions match the current filters.');
    }

    protected static function revertWithdrawal(Transaction $record): bool
    {
        try {
            DB::transaction(function () use ($record) {
                $record->wallet->increment('balance', $record->amount);
                $record->update(['status' => 'reversed']);

                $user = $record->wallet->user;
                $user->notify(new NotifyAnythingNotification(
                    'Withdrawal Reversed — Funds Returned',
                    "Your withdrawal of ₦" . number_format($record->amount / 100, 2) .
                    " (ref: {$record->reference}) has been reversed.\n\n" .
                    "The full amount has been credited back to your wallet.\n\n" .
                    "You may attempt a new withdrawal at any time."
                ));
            });

            Notification::make()
                ->title('Withdrawal reversed')
                ->body('₦' . number_format($record->amount / 100, 2) . ' returned to ' . $record->wallet->user->email)
                ->success()
                ->send();

            return true;

        } catch (\Throwable $e) {
            Log::error('Failed to revert withdrawal', [
                'transaction_id' => $record->id,
                'error'          => $e->getMessage(),
            ]);

            Notification::make()
                ->title('Revert failed')
                ->body($e->getMessage())
                ->danger()
                ->send();

            return false;
        }
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWithdrawals::route('/'),
        ];
    }
}
