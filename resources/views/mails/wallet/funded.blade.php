<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wallet Funded Successfully</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #4CAF50;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .success-icon {
            text-align: center;
            margin-bottom: 20px;
        }
        .success-icon svg {
            width: 80px;
            height: 80px;
        }
        .greeting {
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .transaction-details {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #333333;
        }
        .detail-value {
            color: #666666;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            text-align: center;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            text-align: center;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #999999;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>{{ config('app.name') }}</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Success Icon -->
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                    <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <!-- Greeting -->
            <div class="greeting">
                Hello {{ $customerName ?? 'Valued Customer' }},
            </div>

            <!-- Message -->
            <div class="message">
                Great news! Your wallet has been funded successfully. The funds are now available in your account and ready to use.
            </div>

            <!-- Amount -->
            <div class="amount">
                ₦{{ number_format($amount / 100, 2) }}
            </div>

            <!-- Transaction Details -->
            <div class="transaction-details">
                <div class="detail-row">
                    <span class="detail-label">Transaction Reference:</span>
                    <span class="detail-value">{{ $reference }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">₦{{ number_format($amount / 100, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">{{ ucfirst($channel) }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($paidAt)->format('F j, Y - g:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: #4CAF50; font-weight: 600;">Successful</span>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="button-container">
                <a href="{{ $dashboardUrl ?? url('/wallet') }}" class="button">View Wallet Balance</a>
            </div>

            <!-- Additional Message -->
            <div class="message" style="font-size: 14px;">
                If you have any questions or concerns about this transaction, please don't hesitate to contact our support team.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.<br>
                <a href="{{ url('/') }}">Visit our website</a> |
            </p>
        </div>
    </div>
</body>
</html>
