<?php

namespace App\Filament\Widgets;

use App\Models\Campaign;
use App\Models\PlatformLedgerAccount;
use App\Models\Wallet;
use App\Modules\Shared\Services\PlatformLedgerService;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * Answers "of everything sitting in our one payment-gateway purse right
 * now, how much is actually ours?" — see PlatformLedgerService.
 */
class PlatformLedgerWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $feeRevenue = PlatformLedgerAccount::where('key', PlatformLedgerService::MANAGEMENT_FEE_REVENUE)->first()?->balance ?? 0;
        $promoterPayable = PlatformLedgerAccount::where('key', PlatformLedgerService::PROMOTER_PAYABLE)->first()?->balance ?? 0;
        $allWalletBalances = Wallet::sum('balance');
        $totalCollected = Campaign::whereNotNull('ledger_recorded_at')->sum('total_budget') * 100;

        return [
            Stat::make('Management Fee Revenue', '₦' . number_format($feeRevenue / 100, 2))
                ->description('Safe to spend — net of every referral/ambassador payout')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make('Promoter Payable', '₦' . number_format($promoterPayable / 100, 2))
                ->description('Not ours — still owed to promoters for incomplete campaign slots')
                ->descriptionIcon('heroicon-m-lock-closed')
                ->color('warning'),

            Stat::make('All User Wallet Balances', '₦' . number_format($allWalletBalances / 100, 2))
                ->description('Already credited to real people, not yet withdrawn by them')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),

            Stat::make('Total Ever Collected', '₦' . number_format($totalCollected / 100, 2))
                ->description('Sum of total_budget across all funded campaigns — should roughly track your gateway purse')
                ->descriptionIcon('heroicon-m-arrow-down-tray')
                ->color('gray'),
        ];
    }
}
