@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fff4ed;color:#CC5500;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #ffc899;">
        Wallet Funded
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    Your wallet has been topped up.
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
    Hi {{ $customerName ?? 'there' }},
</p>

<p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.8;">
    The funds below have been added to your Gigs &amp; Campaigns wallet and are ready to use immediately.
</p>

{{-- Amount highlight --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="background-color:#fff4ed;border-radius:12px;padding:24px;text-align:center;border:1px solid #ffc899;">
            <p style="margin:0;font-size:36px;font-weight:900;color:#CC5500;letter-spacing:-1px;">
                ₦{{ number_format($amount / 100, 2) }}
            </p>
            <p style="margin:6px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#CC5500;">
                Amount Credited
            </p>
        </td>
    </tr>
</table>

{{-- Transaction details --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border-radius:12px;margin-bottom:28px;">
    <tr>
        <td style="padding:20px 24px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Reference</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;font-family:monospace;">{{ $reference }}</td>
                </tr>
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Payment Method</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">{{ ucfirst($channel) }}</td>
                </tr>
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Date</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">
                        {{ \Carbon\Carbon::parse($paidAt)->format('d M Y, g:i A') }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:8px 0 4px;font-size:13px;color:#6b7280;">Status</td>
                    <td align="right" style="padding:8px 0 4px;font-size:13px;font-weight:900;color:#CC5500;">Successful</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ $dashboardUrl ?? route('wallet.index') }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                View Wallet
            </a>
        </td>
    </tr>
</table>

@endsection
