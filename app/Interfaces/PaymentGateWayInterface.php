<?php

namespace App\Interfaces;

interface PaymentGateWayInterface
{
    public function payout(array $data);

    public function payin(array $data);

    public function refund(array $data);

    public function getBanks();

    public function resolveAccountNumber(string $accountNumber, string $bankCode);

    public function checkBalance();

}
