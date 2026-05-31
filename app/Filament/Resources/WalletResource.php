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

    // ── Main wallet list ──────────────────────────────────────────────────────
    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('balance', 'desc')
            ->modifyQueryUsing(
                // Keep only simple eager-loading; aggregate columns use getStateUsing
                fn(Builder $q) => $q->with(['user', 'user.promoter', 'user.campaigner'])
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
                    ->getStateUsing(fn(Wallet $record): string =>
                        $record->user?->promoter?->full_name
                        ?? $record->user?->campaigner?->company_name
                        ?? '—'
                    )
                    ->searchable(query: fn(Builder $q, string $search) =>
                        $q->whereHas('user.promoter', fn($q) =>
                            $q->whereRaw("CONCAT(first_name,' ',last_name) LIKE ?", ["%{$search}%"])
                        )->orWhereHas('user.campaigner', fn($q) =>
                            $q->where('company_name', 'like', "%{$search}%")
                        )
                    ),

                Tables\Columns\TextColumn::make('user.role')
                    ->label('Role')
                    ->badge()
                    ->color(fn(?string $state) => match($state) {
                        'promoter'   => 'warning',
                        'campaigner' => 'info',
                        'admin'      => 'danger',
                        default      => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('balance')
                    ->label('Current Balance')
                    ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                    ->sortable()
                    ->color(fn($state) => $state > 0 ? 'success' : 'gray')
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),

                // Total credited — queried per-row to avoid withSum/withCount conflicts
                Tables\Columns\TextColumn::make('total_in')
                    ->label('Total In')
                    ->getStateUsing(fn(Wallet $record): string =>
                        '₦' . number_format(
                            $record->transactions()
                                ->where('type', 'credit')
                                ->where('status', 'successful')
                                ->sum('amount') / 100,
                            2
                        )
                    )
                    ->color('success'),

                Tables\Columns\TextColumn::make('total_out')
                    ->label('Total Out')
                    ->getStateUsing(fn(Wallet $record): string =>
                        '₦' . number_format(
                            $record->transactions()
                                ->where('type', 'debit')
                                ->whereIn('status', ['successful', 'processing'])
                                ->sum('amount') / 100,
                            2
                        )
                    )
                    ->color('danger'),

                Tables\Columns\TextColumn::make('txn_count')
                    ->label('Txns')
                    ->getStateUsing(fn(Wallet $record): int =>
                        $record->transactions()->count()
                    )
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last Activity')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->since(),
            ])
            ->filters([
                SelectFilter::make('user_role')
                    ->label('User Role')
                    ->query(fn(Builder $q, array $data) =>
                        $data['value']
                            ? $q->whereHas('user', fn($q) => $q->where('role', $data['value']))
                            : $q
                    )
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

                        Infolists\Components\TextEntry::make('holder_name')
                            ->label('Name')
                            ->getStateUsing(fn(Wallet $record): string =>
                                $record->user?->promoter?->full_name
                                ?? $record->user?->campaigner?->company_name
                                ?? '—'
                            ),

                        Infolists\Components\TextEntry::make('user.role')
                            ->label('Role')
                            ->badge()
                            ->color(fn(?string $state) => match($state) {
                                'promoter'   => 'warning',
                                'campaigner' => 'info',
                                default      => 'gray',
                            }),

                        Infolists\Components\TextEntry::make('balance')
                            ->label('Current Balance')
                            ->formatStateUsing(fn($state) => '₦' . number_format($state / 100, 2))
                            ->color('success')
                            ->weight(\Filament\Support\Enums\FontWeight::Bold),
                    ]),

                Infolists\Components\Section::make('Transaction Summary')
                    ->columns(3)
                    ->schema([
                        Infolists\Components\TextEntry::make('info_total_in')
                            ->label('Total Funded (Credits)')
                            ->getStateUsing(fn(Wallet $record): string =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'credit')
                                        ->where('status', 'successful')
                                        ->sum('amount') / 100,
                                    2
                                )
                            )
                            ->color('success'),

                        Infolists\Components\TextEntry::make('info_total_out')
                            ->label('Total Withdrawn')
                            ->getStateUsing(fn(Wallet $record): string =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'debit')
                                        ->whereIn('status', ['successful', 'processing'])
                                        ->sum('amount') / 100,
                                    2
                                )
                            )
                            ->color('danger'),

                        Infolists\Components\TextEntry::make('info_pending')
                            ->label('Pending Withdrawals')
                            ->getStateUsing(fn(Wallet $record): string =>
                                '₦' . number_format(
                                    $record->transactions()
                                        ->where('type', 'debit')
                                        ->whereIn('status', ['pending', 'processing'])
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
