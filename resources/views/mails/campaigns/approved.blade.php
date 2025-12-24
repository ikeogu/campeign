@extends('mails.layout')

@section('content')
    <div className="status-badge" style="background: #f0fdf4; color: #16a34a;">Milestone Reached</div>
    <h2 style="margin-top: 15px;">Account Approved! 🚀</h2>
    <p>Congratulations {{ $campaigner->company_name }},</p>
    <p>Your campaigner account has been approved. You can now create and manage campaigns on our platform.</p>
    <a href="{{ route('campaigns.create') }}" className="button">Start New Campaign</a>
@endsection
