@extends('mails.layout')

@section('content')
<div className="status-badge" style="background: #ecfdf5; color: #059669;">Submission Rejected</div>
<h2 style="margin-top: 15px;">Proof of Work Rejected</h2>
<p>Sadly! your submission for  <strong>{{ $campaign->title }}</strong>., was rejected.</p>

<p>You can resubmit a new proof again</p>


<a href="{{ route('campaigns.submissions.index', $campaign->id) }}" className="button"
    style="background-color: #111827;">Review Proof</a>
@endsection
