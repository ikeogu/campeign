@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fff4ed;color:#CC5500;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #ffc899;">
        New Gig
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    "{{ $campaign->title }}" just went live.
</h2>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
    Hi {{ $user->promoter->first_name ?? $user->name }},
</p>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    A new campaign is open for submissions. Share it on your platforms before the slots fill up.
</p>

{{-- Gig details --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border-radius:12px;padding:0;margin-bottom:28px;">
    <tr>
        <td style="padding:20px 24px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Payout per share</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">₦{{ number_format($campaign->payout, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Open slots</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">{{ number_format($campaign->available_slots) }}</td>
                </tr>
                @if($campaign->min_followers)
                <tr>
                    <td style="padding:8px 0;font-size:13px;color:#6b7280;">Minimum followers</td>
                    <td align="right" style="padding:8px 0;font-size:13px;font-weight:700;color:#1a1a4e;">{{ number_format((int) $campaign->min_followers) }}</td>
                </tr>
                @endif
                @if(!empty($campaign->platforms))
                <tr>
                    <td style="padding:14px 0 8px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;">Platforms</td>
                    <td align="right" style="padding:14px 0 8px;border-top:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#1a1a4e;">{{ implode(', ', (array) $campaign->platforms) }}</td>
                </tr>
                @endif
            </table>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.7;">
    Slots are first-come, first-served — the sooner you submit, the better your chance of getting paid.
</p>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('promoter.gigs.show', $campaign->id) }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                View Gig
            </a>
        </td>
    </tr>
</table>

@endsection
