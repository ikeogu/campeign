<?php

namespace App\Filament\Resources\CampaignerResource\Pages;

use App\Filament\Resources\CampaignerResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCampaigner extends EditRecord
{
    protected static string $resource = CampaignerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
