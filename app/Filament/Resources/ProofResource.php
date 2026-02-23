<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProofResource\Pages;
use App\Models\PromoterSubmission;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Builder;

class ProofResource extends Resource
{
    protected static ?string $model = PromoterSubmission::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-check';
    protected static ?string $navigationLabel = 'Proof Submissions';
    protected static ?string $modelLabel = 'Proof Submission';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Submission Details')
                    ->schema([
                        Forms\Components\TextInput::make('proof_link')
                            ->label('Proof Link')
                            ->url()
                            ->disabled(),

                        Forms\Components\TextInput::make('platform')
                            ->label('Platform')
                            ->disabled(),

                        Forms\Components\TextInput::make('link')
                            ->label('Post Link')
                            ->url()
                            ->disabled(),

                        Forms\Components\Select::make('status')
                            ->options([
                                'pending'  => 'Pending',
                                'approved' => 'Approved',
                                'rejected' => 'Rejected',
                            ])
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Relations')
                    ->schema([
                        Forms\Components\Placeholder::make('campaign_title')
                            ->label('Campaign')
                            ->content(fn($record) => $record?->campaign?->title ?? '-'),

                        Forms\Components\Placeholder::make('promoter_name')
                            ->label('Promoter')
                            ->content(
                                fn($record) =>
                                trim(($record?->user?->promoter?->first_name ?? '') . ' ' .
                                 ($record?->user?->promoter?->last_name ?? '')) ?: '-'
                            ),

                        Forms\Components\Placeholder::make('platforms')
                            ->label('Platforms')
                            ->content(
                                fn($record) =>
                                is_array($record?->user?->promoter?->platforms)
                                    ? implode(', ', $record->user->promoter->platforms)
                                    : ($record?->user?->promoter?->platforms ?? '-')
                            ),

                        Forms\Components\Placeholder::make('follower_count')
                            ->label('Follower Count')
                            ->content(
                                fn($record) =>
                                number_format($record?->user?->promoter?->follower_count ?? 0)
                            ),

                        Forms\Components\Placeholder::make('social_handles')
                            ->label('Social Handles')
                            ->content(
                                fn($record) =>
                                is_array($record?->user?->promoter?->social_handles)
                                    ? implode(', ', $record->user->promoter->social_handles)
                                    : ($record?->user?->promoter?->social_handles ?? '-')
                            ),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(
                fn(Builder $query) =>
                $query->with(['user.promoter', 'campaign', 'verification'])
                    ->latest()
            )
            ->columns([
                Tables\Columns\TextColumn::make('user.promoter.first_name')
                    ->label('Promoter')
                    ->formatStateUsing(
                        fn($record) =>
                        $record->user?->promoter?->first_name . ' ' . $record->user?->promoter?->last_name
                    )
                    ->searchable(query: function (Builder $query, string $search) {
                        $query->whereHas('user.promoter', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                    })
                    ->sortable(query: function (Builder $query, string $direction) {
                        $query->join('promoters', 'promoters.user_id', '=', 'promoter_submissions.user_id')
                            ->orderBy('promoters.first_name', $direction);
                    }),
                /*
                Tables\Columns\TextColumn::make('user.promoter.platforms')
                    ->label('Platforms')
                    ->badge(), */

                Tables\Columns\TextColumn::make('user.promoter.follower_count')
                    ->label('Followers')
                    ->numeric()
                    ->sortable(query: function (Builder $query, string $direction) {
                        $query->join('promoters', 'promoters.user_id', '=', 'promoter_submissions.user_id')
                            ->orderBy('promoters.follower_count', $direction);
                    }),

                Tables\Columns\TextColumn::make('campaign.title')
                    ->label('Campaign')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('platform')
                    ->label('Platform')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('link')
                    ->label('Post Link')
                    ->url(fn($record) => $record->link)
                    ->openUrlInNewTab()
                    ->limit(30),

                Tables\Columns\TextColumn::make('full_proof_url')
                    ->label('Proof')
                    ->url(fn($record) => $record->full_proof_url)
                    ->openUrlInNewTab()
                    ->limit(30),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger'  => 'rejected',
                    ]),

                Tables\Columns\TextColumn::make('verification.status')
                    ->label('Verification')
                    ->badge()
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'verified',
                        'danger'  => 'failed',
                    ]),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'  => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),

                SelectFilter::make('platform')
                    ->relationship('campaign', 'title'),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(fn($record) => $record->update(['status' => 'approved'])),

                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(fn($record) => $record->update(['status' => 'rejected'])),

                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('approve_all')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(fn($records) => $records->each->update(['status' => 'approved'])),

                    Tables\Actions\BulkAction::make('reject_all')
                        ->label('Reject Selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(fn($records) => $records->each->update(['status' => 'rejected'])),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProofs::route('/'),
            'create' => Pages\CreateProof::route('/create'),
            'edit'   => Pages\EditProof::route('/{record}/edit'),
        ];
    }
}
