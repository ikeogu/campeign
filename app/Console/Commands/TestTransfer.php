<?php

namespace App\Console\Commands;

use App\Http\Clients\PayazaClient;
use Illuminate\Console\Command;
use Twilio\TwiML\Voice\Pay;

class TestTransfer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-transfer';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(PayazaClient $payazaClient): void
    {
        $this->info('Test transfer command');

        $data = [
            'refund_amount' => 18900.00,
            'transaction_reference' => 'PTS0142024119162548937013273',
            'account_number' => '4030628377',
            'refund_reason' => 'Test refund',
            'bank_code' => '322',
            'bank_name' => 'PREMIUM TRUST  BANK',
            'account_name' => 'Payaza(Smartsend Finance)',
            'narration' => 'Test narration',
        ];

        $payazaClient->getAccountNameEnquiry($data);
    }
}