<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static ?string $navigationIcon  = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationLabel = 'Transactions';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int    $navigationSort  = 1;

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
                ->whereHas('wallet.user')
                ->with('wallet.user')
            )
            ->columns([
                Tables\Columns\TextColumn::make('wallet.user.email')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->icon('heroicon-m-user'),

                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->color(fn(string $state) => match($state) {
                        'credit' => 'success',
                        'debit'  => 'danger',
                        default  => 'gray',
                    })
                    ->formatStateUsing(fn(string $state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(fn($state, Transaction $record) =>
                        ($record->type === 'debit' ? '−' : '+') . '₦' . number_format($state / 100, 2)
                    )
                    ->color(fn(Transaction $record) => $record->type === 'credit' ? 'success' : 'danger')
                    ->weight(\Filament\Support\Enums\FontWeight::Bold)
                    ->sortable(),

                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(45)
                    ->tooltip(fn(Transaction $record) => $record->description),

                Tables\Columns\TextColumn::make('reference')
                    ->label('Reference')
                    ->searchable()
                    ->copyable()
                    ->fontFamily(\Filament\Support\Enums\FontFamily::Mono)
                    ->size(\Filament\Tables\Columns\TextColumn\TextColumnSize::ExtraSmall),

                Tables\Columns\TextColumn::make('channel')
                    ->label('Channel')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn(?string $state) => ucfirst($state ?? '—')),

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
                    ->label('Date')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Type')
                    ->options([
                        'credit' => 'Credit (In)',
                        'debit'  => 'Debit (Out)',
                    ]),

                SelectFilter::make('status')
                    ->options([
                        'pending'    => 'Pending',
                        'processing' => 'Processing',
                        'successful' => 'Successful',
                        'failed'     => 'Failed',
                        'reversed'   => 'Reversed',
                    ]),

                SelectFilter::make('channel')
                    ->options([
                        'wallet'     => 'Wallet',
                        'paystack'   => 'Paystack',
                        'withdrawal' => 'Withdrawal',
                        'refund'     => 'Refund',
                    ]),
            ])
            ->actions([])
            ->bulkActions([])
            ->emptyStateHeading('No transactions found')
            ->emptyStateDescription('No transactions match the current filters.');
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