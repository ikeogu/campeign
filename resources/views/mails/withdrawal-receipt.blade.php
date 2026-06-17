@extends('mails.layout')

@section('content')

{{-- Title --}}
<h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Withdrawal Successful</h2>
<p style="margin:0 0 28px;font-size:14px;color:#6b7280;">Your withdrawal has been processed. See details below.</p>

{{-- Amount highlight --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#16a34a;">Amount Paid to Your Bank</p>
            <p style="margin:0;font-size:36px;font-weight:800;color:#15803d;">&#8358;{{ $net_amount }}</p>
        </td>
    </tr>
</table>

{{-- Beneficiary details --}}
<p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-bottom:1px solid #f3f4f6;padding-bottom:8px;">Beneficiary Details</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:13px;color:#6b7280;width:45%;">Account Name</td>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:13px;font-weight:600;color:#111827;text-align:right;">{{ $account_name }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:13px;color:#6b7280;">Account Number</td>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:13px;font-weight:600;color:#111827;font-family:monospace;text-align:right;">{{ $account_number }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;font-size:13px;color:#6b7280;">Bank</td>
        <td style="padding:9px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">{{ $bank_name }}</td>
    </tr>
</table>

{{-- Amount breakdown --}}
<p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-bottom:1px solid #f3f4f6;padding-bottom:8px;">Amount Breakdown</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border-radius:8px;padding:4px 16px;margin-bottom:24px;">
    <tr>
        <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;font-size:13px;color:#6b7280;">Gross Withdrawal</td>
        <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;font-size:13px;font-weight:600;color:#374151;text-align:right;">&#8358;{{ $gross_amount }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;font-size:13px;color:#6b7280;">Platform Fee</td>
        <td style="padding:9px 0;border-bottom:1px dashed #e5e7eb;font-size:13px;font-weight:600;color:#374151;text-align:right;">– &#8358;{{ $fee_amount }}</td>
    </tr>
    <tr>
        <td style="padding:12px 0 9px;font-size:14px;font-weight:700;color:#111827;">Net Paid to Bank</td>
        <td style="padding:12px 0 9px;font-size:14px;font-weight:700;color:#15803d;text-align:right;">&#8358;{{ $net_amount }}</td>
    </tr>
</table>

{{-- Transaction info --}}
<p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-bottom:1px solid #f3f4f6;padding-bottom:8px;">Transaction Info</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:13px;color:#6b7280;">Reference</td>
        <td style="padding:9px 0;border-bottom:1px solid #f9fafb;font-size:12px;font-family:monospace;font-weight:600;color:#111827;text-align:right;">{{ $reference }}</td>
    </tr>
    <tr>
        <td style="padding:9px 0;font-size:13px;color:#6b7280;">Date &amp; Time</td>
        <td style="padding:9px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">{{ $date }}</td>
    </tr>
</table>

@if($narration && $narration !== '—')
{{-- Narration --}}
<p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-bottom:1px solid #f3f4f6;padding-bottom:8px;">Description / Post Shared</p>
<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;font-size:13px;color:#374151;line-height:1.6;margin-bottom:24px;">
    {{ $narration }}
</div>
@endif

{{-- Footer note --}}
<p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;text-align:center;">
    Funds typically reflect in your bank account within minutes. If you have any issues, contact us at
    <a href="mailto:info@gigsandcampaigns.com" style="color:#CC5500;text-decoration:none;">info@gigsandcampaigns.com</a>.
</p>

@endsection
