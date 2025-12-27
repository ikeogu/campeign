<?php

namespace App\Http\Clients;

use App\Interfaces\PaymentGateWayInterface;
use Illuminate\Http\Client\PendingRequest;
use App\Dtos\PaystackPayoutDto;

class PaystackClient extends PendingRequest implements PaymentGateWayInterface
{


  public function createRecipient(array $data)
  {
    $payload = [
      'type' => 'nuban',
      'name' => $data['bank_name'],
      'account_number' => $data['account_number'],
      'bank_code' => $data['bank_code'],
      'currency' => 'NGN',
      'description' => "Processing withdrawal for {$data['bank_name']}",
      'metadata' => [
        'reference' => $data['reference']
      ]
    ];

    $response = $this->post('transferrecipient', $payload);
    return $response->json('data');
  }

  public function payout(array $data)
  {

    $recipant = $this->createRecipient($data);

    if (!$recipant['recipient_code']) {
      return false;
    }
    $data = [
      'source' => 'balance',
      'amount' => $data['amount'],
      'recipient' => $recipant['recipient_code'],
      'reason' => $data['narration'],
      'currency' => 'NGN',
      'reference' => $data['reference'],
      'metadata' => [
        'reference' => $data['reference']
      ]
    ];

    $response =  $this->post('transfer', $data);

    // I stopped here!
    if ($response->json('status') == true)
      return PaystackPayoutDto::fromArray($response->json('data'));
  }

  public function payin(array $data)
  {

    $response =  $this->post('transaction/initialize', $data);

    return $response;
  }

  public function refund(array $data)
  {
    return $this->post('refund', $data);
  }

  public function getBanks()
  {
    $response =  $this->get('bank?country=Nigeria');
    return $response->json();
  }

  public function resolveAccountNumber(string $accountNumber, string $bankCode)
  {
    $response =  $this->get("bank/resolve?account_number=$accountNumber&bank_code=$bankCode");
    return $response->json();
  }

  public function checkBalance()
  {
    $response =  $this->get('balance');
    return $response->json('data');
  }
}
