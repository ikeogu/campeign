<?php

enum CampaignStatus: string {
    case Pending = 'pending';
    case Funded = 'funded';
    case Approved = 'approved';
    case Live = 'live';
    case Completed = 'completed';
}
