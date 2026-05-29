<?php

enum CampaignStatus: string {
    case Pending   = 'pending';
    case Funded    = 'funded';
    case Approved  = 'approved';
    case Live      = 'live';
    case Paused    = 'paused';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
}
