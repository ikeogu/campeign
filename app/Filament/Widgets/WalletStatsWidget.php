<?php

namespace App\Filament\Widgets;

use App\Models\Transaction;
use App\Models\Wallet;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class WalletStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalBalance = Wallet::sum('balance');

        $totalWallets = Wallet::count();

        $walletsWithBalance = Wallet::where('balance', '>', 0)->count();

        $totalCredited = Transaction::where('type', 'credit')
            ->where('status', 'successful')
            ->sum('amount');

        $totalWithdrawn = Transaction::where('type', 'debit')
            ->whereIn('status', ['successful', 'processing'])
            ->sum('amount');

        $pendingWithdrawals = Transaction::where('type', 'debit')
            ->whereIn('status', ['pending', 'processing'])
            ->where('channel', 'withdrawal')
            ->sum('amount');

        $pendingCount = Transaction::where('type', 'debit')
            ->whereIn('status', ['pending', 'processing'])
            ->where('channel', 'withdrawal')
            ->count();

        return [
            Stat::make('Total Wallet Balance', '₦' . number_format($totalBalance / 100, 2))
                ->description("{$walletsWithBalance} of {$totalWallets} wallets have funds")
                ->descriptionIcon('heroicon-m-wallet')
                ->color('success'),

            Stat::make('Total Funded (All Time)', '₦' . number_format($totalCredited / 100, 2))
                ->description('Sum of all successful wallet credits')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('info'),

            Stat::make('Total Withdrawn (All Time)', '₦' . number_format($totalWithdrawn / 100, 2))
                ->description('Sum of all successful & processing debits')
                ->descriptionIcon('heroicon-m-arrow-trending-down')
                ->color('warning'),

            Stat::make('Pending Withdrawals', '₦' . number_format($pendingWithdrawals / 100, 2))
                ->description("{$pendingCount} withdrawal(s) awaiting processing")
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingCount > 0 ? 'danger' : 'gray'),
        ];
    }
}
