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
            background: #fff7f3;
            color: #1a1a1a;
            padding: 40px 20px;
        }

        .receipt {
            max-width: 580px;
            margin: 0 auto;
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 4px 28px rgba(204,85,0,.12);
            overflow: hidden;
            border: 1px solid #ffe8d9;
        }

        /* ── Header ───────────────────────────────────── */
        .receipt-header {
            background: #CC5500;
            color: #fff;
            padding: 28px 36px 24px;
            position: relative;
        }

        .receipt-header .logo-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .receipt-header .logo-row img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #fff;
            padding: 3px;
            object-fit: contain;
        }

        .receipt-header .brand-text .name {
            font-size: 15px;
            font-weight: 800;
            letter-spacing: .3px;
            line-height: 1.2;
        }

        .receipt-header .brand-text .tagline {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            opacity: .75;
            margin-top: 2px;
        }

        .receipt-header .divider {
            border: none;
            border-top: 1px solid rgba(255,255,255,.25);
            margin-bottom: 20px;
        }

        .receipt-header .label {
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            opacity: .75;
            margin-bottom: 6px;
        }

        .receipt-header .amount-block {
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .receipt-header .currency {
            font-size: 24px;
            font-weight: 600;
            opacity: .85;
        }

        .receipt-header .amount {
            font-size: 52px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -1px;
        }

        .badge {
            display: inline-block;
            margin-top: 14px;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .6px;
        }

        .badge-success { background: rgba(255,255,255,.25); color: #fff; border: 1px solid rgba(255,255,255,.4); }
        .badge-pending { background: rgba(255,200,0,.2);   color: #fff; border: 1px solid rgba(255,200,0,.4); }
        .badge-failed  { background: rgba(255,80,80,.2);   color: #fff; border: 1px solid rgba(255,80,80,.4); }

        /* ── Body ─────────────────────────────────────── */
        .receipt-body {
            padding: 28px 36px;
        }

        .section-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #CC5500;
            margin-bottom: 10px;
            margin-top: 24px;
            padding-bottom: 6px;
            border-bottom: 2px solid #fff0e8;
        }

        .section-label:first-child { margin-top: 0; }

        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 9px 0;
            border-bottom: 1px solid #fdf0e8;
            gap: 12px;
        }

        .row:last-child { border-bottom: none; }

        .row .label {
            font-size: 13px;
            color: #888;
            flex-shrink: 0;
        }

        .row .value {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a1a;
            text-align: right;
            word-break: break-word;
        }

        .row .value.mono {
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }

        .narration-box {
            background: #fff7f3;
            border: 1px solid #ffe8d9;
            border-left: 3px solid #CC5500;
            border-radius: 6px;
            padding: 14px 16px;
            font-size: 13px;
            color: #374151;
            line-height: 1.6;
            margin-top: 8px;
        }

        /* ── Amount breakdown card ─────────────────────── */
        .amount-breakdown {
            background: #fff7f3;
            border: 1px solid #ffe8d9;
            border-radius: 10px;
            padding: 0 16px;
            margin-top: 8px;
            overflow: hidden;
        }

        .amount-breakdown .row {
            border-bottom: 1px dashed #ffe0cc;
        }

        .amount-breakdown .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            margin-top: 4px;
            border-top: 2px solid #CC5500;
        }

        .amount-breakdown .total-row .label {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a1a;
        }

        .amount-breakdown .total-row .value {
            font-size: 15px;
            font-weight: 800;
            color: #CC5500;
        }

        /* ── Footer ───────────────────────────────────── */
        .receipt-footer {
            background: #CC5500;
            padding: 16px 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }

        .receipt-footer .ref {
            font-size: 11px;
            color: rgba(255,255,255,.75);
            font-family: 'Courier New', monospace;
        }

        .receipt-footer .date {
            font-size: 11px;
            color: rgba(255,255,255,.75);
        }

        .company-note {
            text-align: center;
            font-size: 11px;
            color: #aaa;
            margin-top: 18px;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .receipt { box-shadow: none; border-radius: 0; border: none; }
            .print-btn { display: none !important; }
            .company-note { display: none; }
        }

        .print-btn {
            display: block;
            max-width: 580px;
            margin: 20px auto 0;
            padding: 13px;
            background: #CC5500;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            text-align: center;
            letter-spacing: .3px;
        }

        .print-btn:hover { background: #aa4400; }
    </style>
</head>
<body>

<div class="receipt">

    {{-- Header --}}
    <div class="receipt-header">
        <div class="logo-row">
            <img src="{{ asset('logo/android-chrome-192x192.png') }}" alt="Gigs and Campaigns LTD">
            <div class="brand-text">
                <div class="name">Gigs and Campaigns LTD</div>
                <div class="tagline">Spread the Word</div>
            </div>
        </div>

        <hr class="divider">

        <div class="label">Amount Paid to Bank</div>
        <div class="amount-block">
            <span class="currency">₦</span>
            <span class="amount">{{ $net_amount }}</span>
        </div>

        <span class="badge badge-{{ $status === 'successful' ? 'success' : ($status === 'failed' ? 'failed' : 'pending') }}">
            {{ ucfirst($status) }}
        </span>
    </div>

    {{-- Body --}}
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
            <div class="row" style="border-bottom:none;">
                <span class="label">Platform Fee</span>
                <span class="value">– ₦{{ $fee_amount }}</span>
            </div>
            <div class="total-row">
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

    {{-- Footer --}}
    <div class="receipt-footer">
        <span class="ref">Ref: {{ $reference }}</span>
        <span class="date">{{ $date }}</span>
    </div>

</div>

<p class="company-note">
    &copy; {{ date('Y') }} Gigs and Campaigns LTD &nbsp;·&nbsp; Lagos, Nigeria &nbsp;·&nbsp; info@gigsandcampaigns.com
</p>

<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

</body>
</html>
