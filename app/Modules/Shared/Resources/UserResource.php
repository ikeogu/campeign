<?php

namespace App\Modules\Shared\Resources;

use App\Modules\Campeigner\Resources\CampeignerResource;
use App\Modules\Promoter\Resources\PromoterResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'email'      => $this->email,
            'user_type'  => $this->user_type,
            'promoter'   => new PromoterResource($this->whenLoaded('promoter')),
            'advertizer' => new CampeignerResource($this->whenLoaded('campeigner')),
        ];
    }
}
