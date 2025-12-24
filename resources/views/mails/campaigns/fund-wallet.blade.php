@extends('mails.layout')

@section('content')
    <div className="status-badge">Action Required</div>
    <h2 style="margin-top: 15px;">Launch Your Campaign: "{{ $campaign->title }}"</h2>
    <p>Hello {{ $user->campaigner->company_name }},</p>
    <p>Your campaign has been successfully created! To push it live and start reaching thousands of promoters, you need to fund your wallet.</p>

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
                <td style="padding-top: 10px; font-weight: bold; font-size: 18px;">Total Needed:</td>
                <td align="right" style="padding-top: 10px; font-weight: bold; font-size: 18px; color: #16a34a;">₦{{ number_format($campaign->total_budget, 2) }}</td>
            </tr>
        </table>
    </div>

    <p>Once funded, your campaign will be visible to promoters on their dashboards immediately.</p>

    <a href="{{ route('wallet.index') }}" className="button">Fund Wallet Now</a>
@endsection
