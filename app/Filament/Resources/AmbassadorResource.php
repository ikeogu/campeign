<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AmbassadorResource\Pages;
use App\Models\Transaction;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AmbassadorResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';
    protected static ?string $navigationLabel = 'Ambassadors';
    protected static ?string $modelLabel = 'Ambassador';
    protected static ?string $pluralModelLabel = 'Ambassadors';

    /**
     * Every user is a potential ambassador (any account already has a
     * referral_code) — this resource lists all users so an admin can
     * promote one to ambassador and set their rate, not just the ones
     * already flagged.
     */
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Account')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->disabled(),
                        Forms\Components\TextInput::make('referral_code')
                            ->label('Referral Code / Vanity Link')
                            ->readOnly(fn (Forms\Get $get) => ! $get('is_ambassador'))
                            ->required()
                            ->minLength(3)
                            ->maxLength(20)
                            ->regex('/^[A-Za-z0-9_-]+$/')
                            ->unique(ignoreRecord: true)
                            ->validationMessages([
                                'regex' => 'Only letters, numbers, hyphens and underscores — no spaces (it goes straight into a URL).',
                            ])
                            ->helperText(fn (Forms\Get $get) => $get('is_ambassador')
                                ? 'Editable since this user is an ambassador — pick something memorable (e.g. JOHNDOE). Shared as /register?ref=' . '{code}.'
                                : 'Auto-generated for every user and shared as /register?ref=' . '{code}. Turn on Ambassador to set a custom vanity code instead.'),

                        Forms\Components\TextInput::make('referral_link')
                            ->label('Full Referral Link')
                            ->disabled()
                            ->dehydrated(false)
                            ->helperText('Use the copy button on the Ambassadors list to grab this link quickly.')
                            ->formatStateUsing(fn (?User $record) => $record
                                ? rtrim(config('app.url'), '/') . '/register?ref=' . $record->referral_code
                                : null),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Ambassador Commission')
                    ->description('When enabled, this user earns a percentage of the total ad spend on every campaign funded by anyone they referred — for as long as this stays on, with no cap on how many campaigns.')
                    ->schema([
                        Forms\Components\Toggle::make('is_ambassador')
                            ->label('Ambassador')
                            ->live()
                            ->helperText('Overrides the standard referral-bonus split for this user\'s referrals.'),

                        Forms\Components\TextInput::make('ambassador_commission_rate')
                            ->label('Commission Rate (%)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('%')
                            ->visible(fn (Forms\Get $get) => (bool) $get('is_ambassador'))
                            ->required(fn (Forms\Get $get) => (bool) $get('is_ambassador'))
                            ->helperText('e.g. 5 = 5% of total campaign spend, credited to their wallet each time a referral funds a campaign.'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('referral_code')
                    ->label('Referral Code')
                    ->searchable(),

                Tables\Columns\TextColumn::make('referral_link')
                    ->label('Referral Link')
                    ->getStateUsing(fn (User $record) => rtrim(config('app.url'), '/') . '/register?ref=' . $record->referral_code)
                    ->copyable()
                    ->copyMessage('Referral link copied')
                    ->limit(30),

                Tables\Columns\IconColumn::make('is_ambassador')
                    ->label('Ambassador')
                    ->boolean(),

                Tables\Columns\TextColumn::make('ambassador_commission_rate')
                    ->label('Rate')
                    ->formatStateUsing(fn (?float $state) => $state !== null ? number_format($state, 2) . '%' : '—'),

                Tables\Columns\TextColumn::make('referrals_count')
                    ->label('Referrals')
                    ->counts('referrals')
                    ->sortable(),

                Tables\Columns\TextColumn::make('lifetime_commission')
                    ->label('Lifetime Commission Paid')
                    ->getStateUsing(function (User $record): string {
                        $kobo = Transaction::whereHas('wallet', fn ($q) => $q->where('user_id', $record->id))
                            ->where('channel', 'ambassador_commission')
                            ->sum('amount');

                        return '₦' . number_format($kobo / 100, 2);
                    }),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_ambassador')
                    ->label('Ambassador status'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('is_ambassador', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAmbassadors::route('/'),
            'edit' => Pages\EditAmbassador::route('/{record}/edit'),
        ];
    }
}
