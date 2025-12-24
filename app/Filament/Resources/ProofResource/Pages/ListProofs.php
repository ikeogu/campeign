<?php

namespace App\Filament\Resources\ProofResource\Pages;

use App\Filament\Resources\ProofResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProofs extends ListRecords
{
    protected static string $resource = ProofResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
