@extends('mails.layout')

@section('content')
    <div className="status-badge" style="background: #ecfdf5; color: #059669;">New Submission</div>
    <h2 style="margin-top: 15px;">Proof of Work Received</h2>
    <p>Great news! A promoter has just completed a task for your campaign: <strong>{{ $campaign->title }}</strong>.</p>

    <p>Please review the link and screenshot provided to ensure it meets your brand standards. You have 48 hours to dispute the submission before payment is automatically released.</p>


    <a href="{{ route('campaigns.submissions.index', $campaign->id) }}" className="button" style="background-color: #111827;">Review Proof</a>
@endsection
