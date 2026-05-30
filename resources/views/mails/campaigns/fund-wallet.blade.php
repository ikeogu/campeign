@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fef9c3;color:#854d0e;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #fde68a;">
        Action Required
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    Fund your wallet to go live.
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
    Hi {{ $user->campaigner->company_name }},
</p>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    Your campaign <strong style="color:#1a1a4e;">"{{ $campaign->title }}"</strong> has been created. Fund your wallet to make it live and start receiving shares from promoters.
</p>

{{-- Budget breakdown --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border-radius:12px;margin-bottom:28px;">
    <tr>
        <td style="padding:20px 24px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Campaign Budget</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">₦{{ number_format($campaign->base_budget, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Management Fee (3%)</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">₦{{ number_format($campaign->management_fee, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding:14px 0 8px;border-top:1px solid #e5e7eb;font-size:15px;font-weight:900;color:#1a1a4e;">Total Needed</td>
                    <td align="right" style="padding:14px 0 8px;border-top:1px solid #e5e7eb;font-size:18px;font-weight:900;color:#CC5500;">₦{{ number_format($campaign->total_budget, 2) }}</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.7;">
    Once funded, your campaign goes live immediately and promoters can start sharing.
</p>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('wallet.index') }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                Fund Wallet Now
            </a>
        </td>
    </tr>
</table>

@endsection
