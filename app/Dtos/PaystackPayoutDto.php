<?php

namespace App\Dtos;

use App\Dtos\BaseDto;


readonly class PaystackPayoutDto extends BaseDto
{
  public function __construct(

    public string $domain,
    public int $amount,
    public string $currency,
    public string $reference,
    public string $source,
    public string $reason,
    public string $status,
    public string $transfer_code,
    public int $id,
    public int $integration,
    public int $request,
    public int $recipient,
    public string $createdAt,
    public string $updatedAt,
    public ?string $failures = null,
    public ?string $titan_code = null,
    public ?string $transferred_at = null,
    public ?string $source_details = null,
    public array  $transfersessionid = [],
    public array  $transfertrials = []
  ) {}
}