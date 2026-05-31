<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WalletResource\Pages;
use App\Filament\Resources\WalletResource\RelationManagers;
use App\Models\Wallet;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class WalletResource extends Resource
{
    protected static ?string $model = Wallet::class;

    protected static ?string $navigationIcon  = 'heroicon-o-wallet';
    protected static ?string $navigationLabel = 'Customer Wallets';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int    $navigationSort  = 2;

    protected static ?string $recordTitleAttribute = 'id';

    // ── Navigation badge: count wallets with a non-zero balance ──────────────
    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('balance', '>', 0)->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    // ── Main wallet list table ────────────────────────────────────────────────
    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('balance', 'desc')
            ->modifyQueryUsing(
                fn(Builder $q) => $q->with(['user.promoter', 'user.campaigner'])
                    ->withCount('transactions')
                    ->withSum(['transactions as total_credited' => fn($q) =>
                        $q->where('type', 'credit')->where('status', 'successful')
                    ], 'amount')
                    ->withSum(['transactions as total_debited' => fn($q) =>
                        $q->where('type', 'debit')->whereIn('status', ['successful', 'processing'])
                    ], 'amount')
            )
            ->columns([
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->icon('heroicon-m-envelope'),

                Tables\Columns\TextColumn::make('display_name')
                    ->label('Name')
                    ->getStateUsing(fn(Wallet $record) =>
                        $record->user?->promoter?->full_name
                        ?? $record->user?->campaigner?->company_name
                        ?? '—'
                    )
                    ->searchable(query: fn(Builder $q, string $search) =>
                        $q->whereHas('user.promoter', fn($q) =>
                            $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                        )->orWhereHas('user.campaigner', fn($q) =>
                            $q->where('company_name', 'like', "%{$search}%")
                        )
                    ),

                Tables\Columns\BadgeColumn::make('user.role')
                    ->label('Role')
                    ->colors([
                        'warning' => 'promoter',
                        'info'    => 'campaigner',
                        'danger'  => 'admin',
                    ])
                    ->sortable(),

                Tables\Columns\TextColumn::make('balance')
                    ->label('Balance')
                    ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                    ->sortable()
                    ->color(fn($state) => $state > 0 ? 'success' : 'gray')
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),

                Tables\Columns\TextColumn::make('total_credited')
                    ->label('Total In')
                    ->formatStateUsing(fn($state) => '₦' . number_format(($state ?? 0) / 100, 2))
                    ->color('success'),

                Tables\Columns\TextColumn::make('total_debited')
                    ->label('Total Out')
                    ->formatStateUsing(fn($state) => '₦' . number_format(($state ?? 0) / 100, 2))
                    ->color('danger'),

                Tables\Columns\TextColumn::make('transactions_count')
                    ->label('Txns')
                    ->sortable()
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last Activity')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->since(),
            ])
            ->filters([
                SelectFilter::make('role')
                    ->label('User Role')
                    ->relationship('user', 'role')
                    ->options([
                        'promoter'   => 'Promoter',
                        'campaigner' => 'Advertiser',
                    ]),

                Tables\Filters\Filter::make('has_balance')
                    ->label('Has Balance')
                    ->query(fn(Builder $q) => $q->where('balance', '>', 0))
                    ->toggle(),

                Tables\Filters\Filter::make('zero_balance')
                    ->label('Zero Balance')
                    ->query(fn(Builder $q) => $q->where('balance', '=', 0))
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->label('View Transactions'),
            ])
            ->bulkActions([]);
    }

    // ── Wallet detail infolist ────────────────────────────────────────────────
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Wallet Overview')
                    ->columns(4)
                    ->schema([
                        Infolists\Components\TextEntry::make('user.email')
                            ->label('Email')
                            ->copyable()
                            ->icon('heroicon-m-envelope'),

                        Infolists\Components\TextEntry::make('display_name')
                            ->label('Name')
                            ->getStateUsing(fn(Wallet $record) =>
                                $record->user?->promoter?->full_name
                                ?? $record->user?->campaigner?->company_name
                                ?? '—'
                            ),

                        Infolists\Components\TextEntry::make('user.role')
                            ->label('Role')
                            ->badge()
                            ->color(fn(string $state) => match($state) {
                                'promoter'   => 'warning',
                                'campaigner' => 'info',
                                default      => 'gray',
                            }),

                        Infolists\Components\TextEntry::make('balance')
                            ->label('Current Balance')
                            ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                            ->color('success')
                            ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                            ->weight(\Filament\Support\Enums\FontWeight::Bold),
                    ]),

                Infolists\Components\Section::make('Totals')
                    ->columns(3)
                    ->schema([
                        Infolists\Components\TextEntry::make('total_in')
                            ->label('Total Funded (Credits)')
                            ->getStateUsing(fn(Wallet $record) =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'credit')
                                        ->where('status', 'successful')
                                        ->sum('amount') / 100,
                                    2
                                )
                            )
                            ->color('success'),

                        Infolists\Components\TextEntry::make('total_out')
                            ->label('Total Withdrawn (Debits)')
                            ->getStateUsing(fn(Wallet $record) =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'debit')
                                        ->whereIn('status', ['successful', 'processing'])
                                        ->sum('amount') / 100,
                                    2
                                )
                            )
                            ->color('danger'),

                        Infolists\Components\TextEntry::make('pending_total')
                            ->label('Pending Withdrawals')
                            ->getStateUsing(fn(Wallet $record) =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'debit')
                                        ->where('status', 'pending')
                                        ->sum('amount') / 100,
                                    2
                                )
                            )
                            ->color('warning'),
                    ]),
            ]);
    }

    public static function getRelationManagers(): array
    {
        return [
            RelationManagers\TransactionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWallets::route('/'),
            'view'  => Pages\ViewWallet::route('/{record}'),
        ];
    }
}
