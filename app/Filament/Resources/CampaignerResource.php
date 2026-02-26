<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CampaignerResource\Pages;
use App\Filament\Resources\CampaignerResource\RelationManagers;
use App\Models\Campaigner;
use App\Modules\Campeigner\Notifications\CampaignerApprovedNotification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;

class CampaignerResource extends Resource
{
    protected static ?string $model = Campaigner::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
     protected static ?string $navigationLabel = 'Advertisers';
      protected static ?string $modelLabel = 'Advertiser';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Business Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'email')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn($record) => $record !== null)
                            ->helperText('The user account that owns this campaigner profile'),

                        Forms\Components\TextInput::make('company_name')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('e.g. Acme Digital Ltd'),

                        Forms\Components\TextInput::make('industry')
                            ->required()
                            ->maxLength(150)
                            ->placeholder('e.g. Fintech, E-commerce, SaaS'),

                        Forms\Components\Textarea::make('bio')
                            ->rows(4)
                            ->maxLength(1000)
                            ->placeholder('Short description of the company'),
                    ])
                    ->columns(2),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company_name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('industry')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('user.email')
                    ->label('Owner Email')
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M d, Y')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean()
                    ->label('Approved')

            ])
            ->filters([
                Tables\Filters\SelectFilter::make('industry')
                    ->options(
                        Campaigner::query()
                            ->select('industry')
                            ->distinct()
                            ->pluck('industry', 'industry')
                            ->toArray()
                    ),
            ])
            ->actions([

                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn(Campaigner $record) => ! $record->is_approved)
                    ->requiresConfirmation()
                    ->action(fn(Campaigner $record) => static::approveCampaigner($record)),

            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
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
            'index' => Pages\ListCampaigners::route('/'),
            'create' => Pages\CreateCampaigner::route('/create'),
            'edit' => Pages\EditCampaigner::route('/{record}/edit'),
        ];
    }

    protected static function approveCampaigner(Campaigner $campaigner): void
    {
        $user = Auth::user();
        $campaigner->approve($user);

        $campaigner->user->notify(
            new CampaignerApprovedNotification()
        );

        \Filament\Notifications\Notification::make()
            ->title('Campaigner approved successfully')
            ->success()
            ->send();
    }
}
