<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PromoterResource\Pages;
use App\Filament\Resources\PromoterResource\RelationManagers;
use App\Models\Promoter;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Filament\Forms\Components\TextInput;
use Illuminate\Database\Eloquent\Builder;
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
