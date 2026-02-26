<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CampaignResource\Pages;
use App\Filament\Resources\CampaignResource\RelationManagers;
use App\Models\Campaign;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\ViewField;

class CampaignResource extends Resource
{
    protected static ?string $model = Campaign::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Campaign Details')
                    ->schema([
                        TextInput::make('title')->disabled(),
                        Textarea::make('description')->disabled(),

                        TextInput::make('payout')->disabled(),
                        TextInput::make('target_shares')->disabled(),

                        TextInput::make('total_budget')->disabled(),

                        TextInput::make('status')->disabled(),
                    ])
                    ->columns(2),

                Section::make('Campaign Media')
                    ->visible(fn($context) => $context === 'view')
                    ->schema([
                        ViewField::make('images')
                            ->view('filament.campaign.campaign-images'),
                    ]),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(30),

                Tables\Columns\TextColumn::make('user.email')
                    ->label('Campaigner')
                    ->searchable(),

                Tables\Columns\TextColumn::make('platforms')
                    ->label('Platforms')
                    ->formatStateUsing(
                        fn($state) =>
                        is_array($state)
                            ? collect($state)->map(fn($p) => ucfirst($p))->implode(', ')
                            : $state
                    )
                    ->wrap(),

                Tables\Columns\TextColumn::make('target_shares')
                    ->label('Target Shares')
                    ->sortable(),

                Tables\Columns\TextColumn::make('payout')
                    ->label('Payout / Share')
                    ->money('NGN'),

                Tables\Columns\TextColumn::make('total_budget')
                    ->label('Total Budget')
                    ->money('NGN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('shares_completed')
                    ->label('Shares Done')
                    ->state(fn(Campaign $record) => $record->shares_completed)
                    ->sortable(
                        query: function ($query, string $direction) {
                            $query->withCount([
                                'submissions as shares_completed' => function ($q) {
                                    $q->whereHas('verification', function ($q) {
                                        $q->where('status', 'verified');
                                    });
                                },
                            ])->orderBy('shares_completed', $direction);
                        }
                    ),

                Tables\Columns\TextColumn::make('available_slots')
                    ->label('Shares Left')
                    ->state(fn(Campaign $record) => $record->available_slots)
                    ->sortable(),


                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'pending',
                        'warning'   => 'funded',
                        'info'      => 'approved',
                        'success'   => 'live',
                        'gray'      => 'completed',
                    ])
                    ->sortable(),
                Tables\Columns\TextColumn::make('images_count')
                    ->counts('images')
                    ->label('Assets'),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M d, Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Campaign Status')
                    ->options([
                        'pending'   => 'Pending',
                        'funded'    => 'Funded',
                        'approved'  => 'Approved',
                        'live'      => 'Live',
                        'completed' => 'Completed',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('viewShares')
                    ->label('View Shares')
                    ->icon('heroicon-o-eye')
                    ->color('primary')
                    ->url(
                        fn($record) =>
                        CampaignResource::getUrl('submissions', ['record' => $record])
                    ),



                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn(Campaign $record) => $record->status === 'funded')
                    ->action(
                        fn(Campaign $record) =>
                        $record->update(['status' => 'approved'])
                    ),

                Tables\Actions\Action::make('goLive')
                    ->label('Go Live')
                    ->icon('heroicon-o-play')
                    ->color('info')
                    ->visible(fn(Campaign $record) => $record->status === 'approved')
                    ->action(
                        fn(Campaign $record) =>
                        $record->update(['status' => 'live'])
                    ),
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
            'index' => Pages\ListCampaigns::route('/'),
            'create' => Pages\CreateCampaign::route('/create'),
            'edit' => Pages\EditCampaign::route('/{record}/edit'),
            'view'   => Pages\ViewCampaign::route('/{record}'),
            'submissions' => Pages\ViewCampaignSubmissions::route('/{record}/submissions'),
        ];
    }
}
