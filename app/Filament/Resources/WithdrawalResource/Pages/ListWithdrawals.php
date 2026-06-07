<?php

namespace App\Filament\Resources\WithdrawalResource\Pages;

use App\Filament\Resources\WithdrawalResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;

class ListWithdrawals extends ListRecords
{
    protected static string $resource = WithdrawalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportPendingCsv')
                ->label('Export Pending CSV')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('warning')
                ->url(route('admin.withdrawals.export-csv'))
                ->openUrlInNewTab(),
        ];
    }
}
