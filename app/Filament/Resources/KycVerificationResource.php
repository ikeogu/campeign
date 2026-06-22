<?php

namespace App\Filament\Resources;

use App\Filament\Resources\KycVerificationResource\Pages;
use App\Models\KycVerification;
use App\Notifications\NotifyAnythingNotification;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class KycVerificationResource extends Resource
{
    protected static ?string $model = KycVerification::class;

    protected static ?string $navigationIcon  = 'heroicon-o-identification';
    protected static ?string $navigationLabel = 'KYC Verifications';
    protected static ?string $navigationGroup = 'Compliance';
    protected static ?int    $navigationSort  = 1;

    public static function getNavigationBadge(): ?string
    {
        $count = KycVerification::where('status', 'pending')->count();
        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(\Filament\Forms\Form $form): \Filament\Forms\Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->modifyQueryUsing(fn(Builder $q) => $q->with('user.promoter', 'user.campaigner'))
            ->columns([
                Tables\Columns\TextColumn::make('user.email')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('user.role')
                    ->label('Role')
                    ->badge()
                    ->color(fn(string $state) => match($state) {
                        'promoter'   => 'info',
                        'campaigner' => 'warning',
                        default      => 'gray',
                    })
                    ->formatStateUsing(fn(string $state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('id_type')
                    ->label('Type')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn(string $state) => strtoupper($state)),

                Tables\Columns\TextColumn::make('verified_name')
                    ->label('Name on ID')
                    ->searchable(),

                Tables\Columns\TextColumn::make('name_match_score')
                    ->label('Name Match')
                    ->formatStateUsing(fn($state) => $state !== null ? "{$state}%" : '—')
                    ->color(fn($state) => match(true) {
                        $state === null  => 'gray',
                        $state >= 70     => 'success',
                        $state >= 50     => 'warning',
                        default          => 'danger',
                    }),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn(string $state) => match($state) {
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default    => 'warning',
                    })
                    ->formatStateUsing(fn(string $state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending'  => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),

                SelectFilter::make('id_type')
                    ->label('ID Type')
                    ->options(['bvn' => 'BVN', 'nin' => 'NIN']),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Approve KYC')
                    ->modalDescription(fn(KycVerification $r) =>
                        "Approve identity for {$r->user->email} ({$r->verified_name})?"
                    )
                    ->visible(fn(KycVerification $r) => $r->status !== 'approved')
                    ->action(function (KycVerification $record) {
                        $record->update([
                            'status'      => 'approved',
                            'reviewed_by' => Auth::id(),
                            'reviewed_at' => now(),
                        ]);

                        $record->user?->notify(new NotifyAnythingNotification(
                            'Identity Verified ✓',
                            "Your identity has been verified successfully. You can now withdraw funds without restrictions."
                        ));

                        Notification::make()->title('KYC approved')->success()->send();
                    }),

                Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Reject KYC')
                    ->modalDescription('Provide a reason — this will be included in the user\'s notification.')
                    ->form([
                        Textarea::make('admin_note')
                            ->label('Rejection reason')
                            ->required()
                            ->rows(3),
                    ])
                    ->visible(fn(KycVerification $r) => $r->status !== 'rejected')
                    ->action(function (KycVerification $record, array $data) {
                        $record->update([
                            'status'      => 'rejected',
                            'admin_note'  => $data['admin_note'],
                            'reviewed_by' => Auth::id(),
                            'reviewed_at' => now(),
                        ]);

                        $record->user?->notify(new NotifyAnythingNotification(
                            'Identity Verification Rejected',
                            "Your KYC submission was not approved.\n\nReason: {$data['admin_note']}\n\n"
                            . "Please resubmit with correct details or contact support."
                        ));

                        Notification::make()->title('KYC rejected')->danger()->send();
                    }),
            ])
            ->emptyStateHeading('No KYC submissions')
            ->emptyStateDescription('Submissions will appear here once users verify their identity.');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListKycVerifications::route('/'),
        ];
    }
}
