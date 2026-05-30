@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fff4ed;color:#CC5500;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #ffc899;">
        Campaign Completed
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    Goal reached — "{{ $campaign->title }}" is complete.
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
    Hi {{ $user->name }},
</p>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    Your campaign has hit its target of <strong style="color:#1a1a4e;">{{ number_format($campaign->target_shares) }} shares</strong>. The budget has been fully distributed to promoters.
</p>

{{-- Stat box --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="padding:24px;background-color:#fff4ed;border-radius:12px;text-align:center;border:1px solid #ffc899;">
            <p style="margin:0;font-size:36px;font-weight:900;color:#CC5500;">{{ number_format($campaign->target_shares) }}</p>
            <p style="margin:6px 0 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#CC5500;">Total Shares Completed</p>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.7;">
    Ready to keep the momentum going? Launch a new campaign to reach even more people.
</p>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('campaigns.create') }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                Launch Another Campaign
            </a>
        </td>
    </tr>
</table>

@endsection
