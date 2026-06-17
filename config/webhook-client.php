<?php

use App\Modules\Webhook\Handlers\OpayWebhookProcessor;
use App\Modules\Webhook\Handlers\PaystackWebhookProcessor;
use App\Modules\Webhook\Validators\OpaySignatureValidator;
use App\Modules\Webhook\Validators\PaystackSignatureValidator;

return [
    'configs' => [
        [
            'name'                  => 'opay',
            'signing_secret'        => env('OPAY_PRIVATE_KEY'),
            'signature_header_name' => 'MerchantId', // not used by OpaySignatureValidator (sig is in body)
            'signature_validator'   => OpaySignatureValidator::class,
            'webhook_profile'       => \Spatie\WebhookClient\WebhookProfile\ProcessEverythingWebhookProfile::class,
            'webhook_response'      => \Spatie\WebhookClient\WebhookResponse\DefaultRespondsTo::class,
            'webhook_model'         => \Spatie\WebhookClient\Models\WebhookCall::class,
            'store_headers'         => [],
            'process_webhook_job'   => OpayWebhookProcessor::class,
        ],
        [
            'name'                  => 'paystack',
            'signing_secret'        => env('PAYSTACK_SECRET_KEY'),
            'signature_header_name' => 'X-Paystack-Signature',
            'signature_validator'   => PaystackSignatureValidator::class,
            'webhook_profile'       => \Spatie\WebhookClient\WebhookProfile\ProcessEverythingWebhookProfile::class,
            'webhook_response'      => \Spatie\WebhookClient\WebhookResponse\DefaultRespondsTo::class,
            'webhook_model'         => \Spatie\WebhookClient\Models\WebhookCall::class,
            'store_headers'         => [],
            'process_webhook_job'   => PaystackWebhookProcessor::class,
        ],
    ],

    'delete_after_days'            => 30,
    'add_unique_token_to_route_name' => false,
];
