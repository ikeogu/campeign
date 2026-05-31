<?php

namespace App\Filament\Resources\WalletResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class TransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'transactions';
    protected static ?string $title       = 'Transaction History';

    public function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('type')
                    ->colors([
                        'success' => 'credit',
                        'danger'  => 'debit',
                    ])
                    ->formatStateUsing(fn($state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(fn($state, $record) =>
                        ($record->type === 'debit' ? '−' : '+') . '₦' . number_format($state / 100, 2)
                    )
                    ->color(fn($record) => $record->type === 'credit' ? 'success' : 'danger')
                    ->weight(\Filament\Support\Enums\FontWeight::Bold)
                    ->sortable(),

                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(50)
                    ->tooltip(fn($record) => $record->description)
                    ->wrap(),

                Tables\Columns\TextColumn::make('reference')
                    ->label('Reference')
                    ->copyable()
                    ->searchable()
                    ->fontFamily(\Filament\Support\Enums\FontFamily::Mono)
                    ->size(\Filament\Tables\Columns\TextColumn\TextColumnSize::ExtraSmall),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'successful',
                        'info'    => 'processing',
                        'warning' => 'pending',
                        'danger'  => fn($state) => in_array($state, ['failed', 'reversed']),
                    ])
                    ->formatStateUsing(fn($state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('channel')
                    ->label('Channel')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn($state) => ucfirst($state ?? '—')),
            ])
            ->filters([
                SelectFilter::make('type')
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
            ])
            ->emptyStateHeading('No transactions yet')
            ->emptyStateDescription('This wallet has no recorded transactions.');
    }
}
