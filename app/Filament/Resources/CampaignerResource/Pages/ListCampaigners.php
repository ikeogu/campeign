<?php

namespace App\Filament\Resources\CampaignerResource\Pages;

use App\Filament\Resources\CampaignerResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCampaigners extends ListRecords
{
    protected static string $resource = CampaignerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
