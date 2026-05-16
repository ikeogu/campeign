<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
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

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static ?string $navigationLabel = 'Pending Withdrawals';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 1;

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
                    ->where('status', 'pending')
                    ->with('wallet.user')
            )
            ->columns([
                Tables\Columns\TextColumn::make('wallet.user.email')
                    ->label('User')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Amount (₦)')
                    ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                    ->sortable(),

                Tables\Columns\TextColumn::make('reference')
                    ->label('Reference')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(40)
                    ->tooltip(fn($record) => $record->description),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'successful',
                        'danger'  => ['failed', 'reversed'],
                    ]),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Requested At')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'    => 'Pending',
                        'reversed'   => 'Reversed',
                        'successful' => 'Successful',
                        'failed'     => 'Failed',
                    ]),
            ])
            ->actions([
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
                    ->visible(fn(Transaction $record) => $record->status === 'pending' && $record->type === 'debit')
                    ->action(fn(Transaction $record) => static::revertTransaction($record)),
            ])
            ->bulkActions([
                BulkAction::make('revert_selected')
                    ->label('Revert Selected')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Revert Selected Withdrawals')
                    ->modalDescription('This will refund all selected pending withdrawals back to the users\' wallets. This cannot be undone.')
                    ->modalSubmitActionLabel('Yes, Revert All')
                    ->deselectRecordsAfterCompletion()
                    ->action(function (Collection $records) {
                        $reverted = 0;
                        $skipped  = 0;

                        foreach ($records as $record) {
                            if ($record->status !== 'pending' || $record->type !== 'debit') {
                                $skipped++;
                                continue;
                            }
                            static::revertTransaction($record) ? $reverted++ : $skipped++;
                        }

                        Notification::make()
                            ->title("Done: {$reverted} reverted, {$skipped} skipped")
                            ->success()
                            ->send();
                    }),
            ])
            ->emptyStateHeading('No pending withdrawals')
            ->emptyStateDescription('All withdrawal transactions have been processed.');
    }

    protected static function revertTransaction(Transaction $record): bool
    {
        try {
            DB::transaction(function () use ($record) {
                $record->wallet->increment('balance', $record->amount);

                $record->update(['status' => 'reversed']);

                $user = $record->wallet->user;

                $user->notify(new NotifyAnythingNotification(
                    'Withdrawal Reversed — Funds Returned',
                    "Hi {$user->email},\n\n" .
                    "Your withdrawal of ₦" . number_format($record->amount / 100, 2) .
                    " (ref: {$record->reference}) could not be processed and has been reversed.\n\n" .
                    "The full amount has been credited back to your wallet.\n\n" .
                    "You may attempt a new withdrawal at any time. We apologise for the inconvenience."
                ));
            });

            Notification::make()
                ->title('Transaction reversed successfully')
                ->body("₦" . number_format($record->amount / 100, 2) . " returned to {$record->wallet->user->email}")
                ->success()
                ->send();

            return true;
        } catch (\Throwable $e) {
            Log::error('Failed to revert transaction', [
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
            'index' => Pages\ListTransactions::route('/'),
        ];
    }
}
