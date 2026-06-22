<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'opay' => [
        'base_url'    => env('OPAY_BASE_URL', 'https://testapi.opaycheckout.com'),
        'private_key' => env('OPAY_PRIVATE_KEY'),
        'public_key'  => env('OPAY_PUBLIC_KEY'),
        'merchant_id' => env('OPAY_MERCHANT_ID'),
    ],

    'paystack' => [
        'base_url'   => env('PAYSTACK_BASE_URL'),
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
    ],

    'payment_gateway' => env('PAYMENT_GATEWAY', 'opay'),

    'dojah' => [
        'base_url'   => env('DOJAH_BASE_URL', 'https://api.dojah.io'),
        'app_id'     => env('DOJAH_APP_ID'),
        'secret_key' => env('DOJAH_SECRET_KEY'),
    ],

];
