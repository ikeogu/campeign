<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Withdrawal Receipt – {{ $reference }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f4f6f9;
            color: #1a1a2e;
            padding: 40px 20px;
        }

        .receipt {
            max-width: 580px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,.10);
            overflow: hidden;
        }

        .receipt-header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 32px 36px 24px;
        }

        .receipt-header .brand {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: .5px;
            margin-bottom: 4px;
        }

        .receipt-header .subtitle {
            font-size: 13px;
            opacity: .65;
            margin-bottom: 20px;
        }

        .receipt-header .amount-block {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .receipt-header .currency {
            font-size: 22px;
            font-weight: 500;
            opacity: .8;
        }

        .receipt-header .amount {
            font-size: 46px;
            font-weight: 700;
            line-height: 1;
        }

        .badge {
            display: inline-block;
            margin-top: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .badge-success { background: #22c55e; color: #fff; }
        .badge-pending { background: #f59e0b; color: #fff; }
        .badge-failed  { background: #ef4444; color: #fff; }

        .receipt-body {
            padding: 28px 36px;
        }

        .section-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 12px;
            margin-top: 24px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f0f0f0;
        }

        .section-label:first-child { margin-top: 0; }

        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 9px 0;
            border-bottom: 1px solid #f7f7f7;
            gap: 12px;
        }

        .row:last-child { border-bottom: none; }

        .row .label {
            font-size: 13px;
            color: #6b7280;
            flex-shrink: 0;
        }

        .row .value {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a2e;
            text-align: right;
            word-break: break-word;
        }

        .row .value.mono {
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }

        .narration-box {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px 16px;
            font-size: 13px;
            color: #374151;
            line-height: 1.6;
            margin-top: 8px;
        }

        .amount-breakdown {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin-top: 8px;
        }

        .amount-breakdown .row {
            border-bottom: 1px dashed #e5e7eb;
        }

        .amount-breakdown .row:last-child {
            border-bottom: none;
            margin-top: 6px;
            padding-top: 12px;
            border-top: 2px solid #e5e7eb;
        }

        .amount-breakdown .row:last-child .label,
        .amount-breakdown .row:last-child .value {
            font-weight: 700;
            font-size: 14px;
            color: #111827;
        }

        .receipt-footer {
            background: #f9fafb;
            border-top: 1px solid #f0f0f0;
            padding: 18px 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .receipt-footer .ref {
            font-size: 12px;
            color: #9ca3af;
            font-family: 'Courier New', monospace;
        }

        .receipt-footer .date {
            font-size: 12px;
            color: #9ca3af;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .receipt { box-shadow: none; border-radius: 0; }
            .print-btn { display: none !important; }
        }

        .print-btn {
            display: block;
            max-width: 580px;
            margin: 20px auto 0;
            padding: 12px;
            background: #1a1a2e;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
            letter-spacing: .3px;
        }

        .print-btn:hover { background: #16213e; }
    </style>
</head>
<body>

<div class="receipt">

    <div class="receipt-header">
        <div class="brand">Gigs and Campaigns LTD</div>
        <div class="subtitle">Withdrawal Receipt</div>

        <div class="amount-block">
            <span class="currency">₦</span>
            <span class="amount">{{ $net_amount }}</span>
        </div>

        <span class="badge badge-{{ $status === 'successful' ? 'success' : ($status === 'failed' ? 'failed' : 'pending') }}">
            {{ ucfirst($status) }}
        </span>
    </div>

    <div class="receipt-body">

        <div class="section-label">Beneficiary Details</div>

        <div class="row">
            <span class="label">Account Name</span>
            <span class="value">{{ $account_name }}</span>
        </div>
        <div class="row">
            <span class="label">Account Number</span>
            <span class="value mono">{{ $account_number }}</span>
        </div>
        <div class="row">
            <span class="label">Bank</span>
            <span class="value">{{ $bank_name }}</span>
        </div>
        <div class="row">
            <span class="label">Recipient Email</span>
            <span class="value">{{ $user_email }}</span>
        </div>

        <div class="section-label">Amount Breakdown</div>

        <div class="amount-breakdown">
            <div class="row">
                <span class="label">Gross Withdrawal</span>
                <span class="value">₦{{ $gross_amount }}</span>
            </div>
            <div class="row">
                <span class="label">Platform Fee</span>
                <span class="value">– ₦{{ $fee_amount }}</span>
            </div>
            <div class="row">
                <span class="label">Net Paid to Bank</span>
                <span class="value">₦{{ $net_amount }}</span>
            </div>
        </div>

        <div class="section-label">Transaction Info</div>

        <div class="row">
            <span class="label">Reference</span>
            <span class="value mono">{{ $reference }}</span>
        </div>
        <div class="row">
            <span class="label">Date &amp; Time</span>
            <span class="value">{{ $date }}</span>
        </div>

        @if($narration && $narration !== '—')
        <div class="section-label">Description / Post Shared</div>
        <div class="narration-box">{{ $narration }}</div>
        @endif

    </div>

    <div class="receipt-footer">
        <span class="ref">Ref: {{ $reference }}</span>
        <span class="date">{{ $date }}</span>
    </div>

</div>

<p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">
    &copy; {{ date('Y') }} Gigs and Campaigns LTD &nbsp;|&nbsp; Lagos, Nigeria &nbsp;|&nbsp; info@gigsandcampaigns.com
</p>

<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

</body>
</html>
