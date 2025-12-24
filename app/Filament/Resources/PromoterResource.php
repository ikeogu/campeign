<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PromoterResource\Pages;
use App\Filament\Resources\PromoterResource\RelationManagers;
use App\Models\Promoter;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

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
                    ->wrap(),

                Tables\Columns\TextColumn::make('social_handles')
                    ->label('Social Handles')
                    ->formatStateUsing(function ($state) {
                        if (!is_array($state)) {
                            $state = json_decode($state, true);

                            return collect($state)
                            ->map(
                                fn($handle, $platform) =>
                                ucfirst($platform) . ': ' . $handle
                            )
                            ->implode(' | ');

                        }


                        return collect($state)
                            ->map(
                                fn($handle, $platform) =>
                                ucfirst($platform) . ': ' . $handle
                            )
                            ->implode(' | ');
                    })
                    ->wrap(),



                /* Tables\Columns\IconColumn::make('is_approved')
                ->boolean()
                ->label('Approved'),

            Tables\Columns\TextColumn::make('approved_at')
                ->dateTime()
                ->label('Approved At')
                ->toggleable(isToggledHiddenByDefault: true), */
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
