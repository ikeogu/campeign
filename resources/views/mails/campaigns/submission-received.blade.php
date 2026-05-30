@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fff4ed;color:#CC5500;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #ffc899;">
        New Submission
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    A promoter just submitted proof of work.
</h2>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    A promoter has completed a task for your campaign <strong style="color:#1a1a4e;">"{{ $campaign->title }}"</strong>. Review their submission to confirm it meets your brand standards.
</p>

{{-- Info box --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff4ed;border-radius:12px;margin-bottom:28px;border:1px solid #ffc899;">
    <tr>
        <td style="padding:16px 20px;">
            <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
                <strong>You have 48 hours</strong> to review and dispute this submission. After that, the payout is automatically released to the promoter.
            </p>
        </td>
    </tr>
</table>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('campaigns.submissions.index', $campaign->id) }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                Review Submission
            </a>
        </td>
    </tr>
</table>

@endsection
