@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fff4ed;color:#CC5500;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #ffc899;">
        Account Approved
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    You're approved — let's launch your first campaign.
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
    Hi {{ $campaigner->company_name }},
</p>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    Your advertiser account on Gigs &amp; Campaigns has been approved. You can now create campaigns, set your budget, and have thousands of promoters sharing your content across social media.
</p>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('campaigns.create') }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                Create Your First Campaign
            </a>
        </td>
    </tr>
</table>

@endsection
