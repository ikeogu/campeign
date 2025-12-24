<?php

namespace App\Filament\Resources\CampaignResource\Pages;

use App\Filament\Resources\CampaignResource;
use Filament\Resources\Pages\Page;
use App\Models\Campaign;

class ViewCampaignSubmissions extends Page
{
    protected static string $resource = CampaignResource::class;

    protected static string $view = 'filament.campaign.submissions';

    public Campaign $record;

    public function mount(Campaign $record): void
    {
        $this->record = $record;
    }
}
