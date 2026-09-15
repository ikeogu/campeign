<?php

namespace App\Filament\Resources\AmbassadorResource\Pages;

use App\Filament\Resources\AmbassadorResource;
use Filament\Resources\Pages\EditRecord;

class EditAmbassador extends EditRecord
{
    protected static string $resource = AmbassadorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No DeleteAction — this edits a User record; deleting accounts
            // isn't a concern of the ambassador backoffice screen.
        ];
    }
}
