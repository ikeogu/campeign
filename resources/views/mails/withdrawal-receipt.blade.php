@extends('mails.layout')

@section('content')

{{-- Title --}}
<h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#CC5500;">Withdrawal Successful</h2>
<p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.5;">Your withdrawal has been processed. Here's your receipt — keep it for your records.</p>

{{-- Amount highlight card --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="background:#CC5500;border-radius:12px;padding:24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.75);">Amount Paid to Your Bank</p>
            <p style="margin:0;font-size:40px;font-weight:800;color:#ffffff;line-height:1;letter-spacing:-1px;">&#8358;{{ $net_amount }}</p>
        </td>
    </tr>
</table>

{{-- Beneficiary --}}
<p style="margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#CC5500;border-bottom:2px solid #fff0e8;padding-bottom:7px;">Beneficiary Details</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;color:#888888;width:45%;">Account Name</td>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">{{ $account_name }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;color:#888888;">Account Number</td>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;font-weight:700;color:#1a1a1a;font-family:'Courier New',monospace;text-align:right;">{{ $account_number }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;font-size:13px;color:#888888;">Bank</td>
        <td style="padding:9px 0;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">{{ $bank_name }}</td>
    </tr>
</table>

{{-- Amount breakdown --}}
<p style="margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#CC5500;border-bottom:2px solid #fff0e8;padding-bottom:7px;">Amount Breakdown</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7f3;border:1px solid #ffe8d9;border-radius:10px;margin-bottom:24px;">
    <tr>
        <td style="padding:11px 16px;border-bottom:1px dashed #ffe0cc;font-size:13px;color:#888888;">Gross Withdrawal</td>
        <td style="padding:11px 16px;border-bottom:1px dashed #ffe0cc;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;">&#8358;{{ $gross_amount }}</td>
    </tr>
    <tr>
        <td style="padding:11px 16px;border-bottom:1px dashed #ffe0cc;font-size:13px;color:#888888;">Platform Fee</td>
        <td style="padding:11px 16px;border-bottom:1px dashed #ffe0cc;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;">– &#8358;{{ $fee_amount }}</td>
    </tr>
    <tr>
        <td style="padding:13px 16px 11px;border-top:2px solid #CC5500;font-size:14px;font-weight:800;color:#1a1a1a;">Net Paid to Bank</td>
        <td style="padding:13px 16px 11px;border-top:2px solid #CC5500;font-size:15px;font-weight:800;color:#CC5500;text-align:right;">&#8358;{{ $net_amount }}</td>
    </tr>
</table>

{{-- Transaction info --}}
<p style="margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#CC5500;border-bottom:2px solid #fff0e8;padding-bottom:7px;">Transaction Info</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;color:#888888;">Reference</td>
        <td style="padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:12px;font-family:'Courier New',monospace;font-weight:700;color:#1a1a1a;text-align:right;">{{ $reference }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;font-size:13px;color:#888888;">Date &amp; Time</td>
        <td style="padding:9px 0;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">{{ $date }}</td>
    </tr>
</table>

@if($narration && $narration !== '—')
<p style="margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#CC5500;border-bottom:2px solid #fff0e8;padding-bottom:7px;">Description / Post Shared</p>
<div style="background:#fff7f3;border:1px solid #ffe8d9;border-left:3px solid #CC5500;border-radius:6px;padding:14px 16px;font-size:13px;color:#374151;line-height:1.6;margin-bottom:24px;">
    {{ $narration }}
</div>
@endif

{{-- Footer note --}}
<p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.7;text-align:center;">
    Funds typically reflect in your bank account within minutes.<br>
    Questions? Email us at <a href="mailto:info@gigsandcampaigns.com" style="color:#CC5500;text-decoration:none;font-weight:600;">info@gigsandcampaigns.com</a>
</p>

@endsection
