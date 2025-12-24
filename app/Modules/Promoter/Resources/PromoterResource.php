<?php

namespace App\Modules\Promoter\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromoterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'first_name'     => $this->first_name,
            'last_name'      => $this->last_name,
            'social_handles' => $this->social_handles,
            'follower_count' => $this->follower_count,
            'platforms'      => $this->platforms,
        ];
    }
}
