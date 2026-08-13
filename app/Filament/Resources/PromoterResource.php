<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PromoterResource\Pages;
use App\Filament\Resources\PromoterResource\RelationManagers;
use App\Models\Promoter;
use App\Notifications\NotifyAnythingNotification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PromoterResource extends Resource
{
    protected static ?string $model = Promoter::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('first_name')
                    ->label('First Name')
                    ->searchable(),

                Tables\Columns\TextColumn::make('last_name')
                    ->label('Last Name')
                    ->searchable(),

                Tables\Columns\TextColumn::make('user.email')
                    ->label('User')
                    ->searchable(),

                Tables\Columns\TextColumn::make('follower_count')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('user.is_active')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (?bool $state) => $state === false ? 'Deactivated' : 'Active')
                    ->color(fn (?bool $state) => $state === false ? 'danger' : 'success'),
            /*
                Tables\Columns\TextColumn::make('platforms')
                    ->label('Platforms')
                    ->formatStateUsing(
                        function ($state) {
                            if (!is_array($state)) {
                                $state = json_decode($state, true);
                            }
                            return implode(', ', $state);
                        }
                    )
                    ->wrap(), */

            Tables\Columns\TextColumn::make('social_handles')
                ->label('Social Handles')
                ->formatStateUsing(function ($state) {
                    if (empty($state)) {
                        return '-';
                    }

                    // Decode JSON if needed
                    if (is_string($state)) {
                        $state = json_decode($state, true);
                    }

                    if (!is_array($state)) {
                        return '-';
                    }

                    // Handle the format: {"facebook": "Victory Erazua", "tiktok": "techativeDera"}
                    return collect($state)
                        ->map(function ($handle, $platform) {
                            return ucfirst($platform) . ': ' . $handle;
                        })
                        ->filter()
                        ->implode(' | ') ?: '-';
                })
                ->wrap()


                /* Tables\Columns\IconColumn::make('is_approved')
                ->boolean()
                ->label('Approved'),

            Tables\Columns\TextColumn::make('approved_at')
                ->dateTime()
                ->label('Approved At')
                ->toggleable(isToggledHiddenByDefault: true), */
            ])
            ->filters([
                Filter::make('follower_range')
                    ->label('Min. Follower Count')
                    ->form([
                        TextInput::make('min')
                            ->label('At least')
                            ->numeric()
                            ->placeholder('e.g. 1000'),
                        TextInput::make('max')
                            ->label('At most')
                            ->numeric()
                            ->placeholder('e.g. 50000'),
                    ])
                    ->query(function (Builder $query, array $data) {
                        return $query
                            ->when($data['min'], fn($q) => $q->where('follower_count', '>=', (int) $data['min']))
                            ->when($data['max'], fn($q) => $q->where('follower_count', '<=', (int) $data['max']));
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];
                        if ($data['min'] ?? null) {
                            $indicators[] = 'Followers ≥ ' . number_format((int) $data['min']);
                        }
                        if ($data['max'] ?? null) {
                            $indicators[] = 'Followers ≤ ' . number_format((int) $data['max']);
                        }
                        return $indicators;
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('deactivate')
                    ->label('Deactivate')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn (Promoter $record) => (bool) $record->user?->is_active)
                    ->requiresConfirmation()
                    ->modalHeading('Deactivate Account')
                    ->modalDescription(fn (Promoter $record) => "This immediately blocks {$record->user?->email} from submitting proof, requesting withdrawals, and using the platform.")
                    ->form([
                        Textarea::make('reason')
                            ->label('Reason (shown to the user)')
                            ->rows(3),
                    ])
                    ->action(function (Promoter $record, array $data) {
                        $record->user->deactivate(Auth::user(), $data['reason'] ?? null);

                        $record->user->notify(new NotifyAnythingNotification(
                            'Your Account Has Been Deactivated',
                            'Your account has been deactivated.' . (!empty($data['reason']) ? " Reason: {$data['reason']}" : '')
                                . "\n\nContact support if you believe this is a mistake."
                        ));

                        Notification::make()->title('Account deactivated')->success()->send();
                    }),

                Tables\Actions\Action::make('activate')
                    ->label('Activate')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Promoter $record) => ! $record->user?->is_active)
                    ->requiresConfirmation()
                    ->modalHeading('Reactivate Account')
                    ->action(function (Promoter $record) {
                        $record->user->reactivate();

                        $record->user->notify(new NotifyAnythingNotification(
                            'Your Account Has Been Reactivated',
                            'Your account has been reactivated. You can now use the platform as normal.'
                        ));

                        Notification::make()->title('Account reactivated')->success()->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPromoters::route('/'),
            'create' => Pages\CreatePromoter::route('/create'),
            'edit' => Pages\EditPromoter::route('/{record}/edit'),
        ];
    }
}
