<?php

namespace App\Filament\Resources\AmbassadorResource\Pages;

use App\Filament\Resources\AmbassadorResource;
use Filament\Resources\Pages\ListRecords;

class ListAmbassadors extends ListRecords
{
    protected static string $resource = AmbassadorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No CreateAction — ambassadors are existing users promoted via
            // the Edit form, not created fresh from this resource.
        ];
    }
}
