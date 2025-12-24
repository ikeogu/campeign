@extends('mails.layout')

@section('content')
    <div className="status-badge" style="background: #f0fdf4; color: #16a34a;">Milestone Reached</div>
    <h2 style="margin-top: 15px;">Campaign Goal Achieved! 🚀</h2>
    <p>Congratulations {{ $user->name }},</p>
    <p>Your campaign <strong>{{ $campaign->title }}</strong> has reached its target goal of <strong>{{ $campaign->target_shares }} shares</strong>.</p>

    <p>This campaign is now completed. You can view the final analytics, download the promoter list, and see the total impact your brand made.</p>

    <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 10px; margin: 20px 0;">
        <div style="background: #f9fafb; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold;">{{ $campaign->target_shares }}</div>
            <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase;">Total Shares</div>
        </div>
    </div>

    <p>Ready to go again? Launch a new campaign to keep the momentum going.</p>

    <a href="{{ route('campaigns.create') }}" className="button">Start New Campaign</a>
@endsection
