@extends('mails.layout')

@section('content')

<p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">Hi there,</p>

<p style="margin:0;font-size:15px;color:#374151;line-height:1.8;">{{ $body }}</p>

@endsection
