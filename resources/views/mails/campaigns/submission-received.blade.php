@extends('emails.layout')

@section('content')
    <div className="status-badge" style="background: #ecfdf5; color: #059669;">New Submission</div>
    <h2 style="margin-top: 15px;">Proof of Work Received</h2>
    <p>Great news! A promoter has just completed a task for your campaign: <strong>{{ $campaign->title }}</strong>.</p>

    <p>Please review the link and screenshot provided to ensure it meets your brand standards. You have 48 hours to dispute the submission before payment is automatically released.</p>

    <div style="border-left: 4px solid #db2777; padding-left: 20px; font-style: italic; color: #6b7280;">
        "I've shared the brand launch on my Twitter and Instagram handles with 5k+ followers!"
    </div>

    <a href="{{ route('advertiser.submissions.show', $campaign->id) }}" className="button" style="background-color: #111827;">Review Proof</a>
@endsection
