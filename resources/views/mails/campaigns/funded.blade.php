@extends('mails.layout')

@section('content')
    <div style="background: #dcfce7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; color: #166534; font-weight: 600;">
        ✓ Campaign Funded
    </div>

    <h2 style="margin-top: 15px; margin-bottom: 10px;">Campaign Funded: "{{ $campaign->title }}"</h2>

    <p>Hello {{ $user->campaigner->company_name }},</p>

    <p>Great news! Your campaign has been successfully funded and is now <strong>live</strong>. Your campaign is visible to promoters on their dashboards and ready to receive submissions.</p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <table width="100%">
            <tr>
                <td style="color: #6b7280;">Campaign Budget:</td>
                <td align="right" style="font-weight: bold;">₦{{ number_format($campaign->base_budget, 2) }}</td>
            </tr>
            <tr>
                <td style="color: #6b7280;">Management Fee (3%):</td>
                <td align="right" style="font-weight: bold;">₦{{ number_format($campaign->management_fee, 2) }}</td>
            </tr>
            <tr style="border-top: 1px solid #d1d5db;">
                <td style="padding-top: 10px; font-weight: bold; font-size: 18px;">Total Funded:</td>
                <td align="right" style="padding-top: 10px; font-weight: bold; font-size: 18px; color: #16a34a;">₦{{ number_format($campaign->total_budget, 2) }}</td>
            </tr>
        </table>
    </div>

    <p>You can now monitor your campaign performance and manage submissions from your dashboard.</p>

@endsection
