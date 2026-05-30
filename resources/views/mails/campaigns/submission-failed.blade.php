@extends('mails.layout')

@section('content')

{{-- Badge --}}
<p style="margin:0 0 24px;">
    <span style="display:inline-block;padding:4px 14px;background-color:#fef2f2;color:#b91c1c;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;border-radius:99px;border:1px solid #fca5a5;">
        Submission Rejected
    </span>
</p>

<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1a1a4e;line-height:1.3;">
    Your submission was not accepted.
</h2>

<p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.8;">
    Unfortunately your submission for the campaign <strong style="color:#1a1a4e;">"{{ $campaign->title }}"</strong> did not meet the required standards and has been rejected.
</p>

{{-- Info box --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border-radius:12px;margin-bottom:28px;border:1px solid #e5e7eb;">
    <tr>
        <td style="padding:16px 20px;">
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                You can review the campaign requirements and submit a new proof of work. Make sure your post is visible, public, and matches the brief exactly.
            </p>
        </td>
    </tr>
</table>

{{-- CTA --}}
<table cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:12px;background-color:#CC5500;">
            <a href="{{ route('promoter.gigs.index') }}"
               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:13px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;border-radius:12px;">
                Browse Other Gigs
            </a>
        </td>
    </tr>
</table>

@endsection
