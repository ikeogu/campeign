<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class Promoter extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'social_handles',
        'platforms',
        'follower_count'
    ];

    protected $casts = [
        'follower_count' => 'integer',
        'social_handles' => 'array',
        'platforms'      => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function socialHandleRows(): HasMany
    {
        return $this->hasMany(PromoterSocialHandle::class);
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Normalize two parallel arrays (platforms[], social_handles[] — the
     * shape the registration form submits) into the canonical
     * [{platform, handle}, ...] shape also used by the profile-edit form.
     * Having one canonical shape, built in one place, is what let the two
     * entry points silently disagree on this for so long.
     */
    public static function pairPlatformsAndHandles(array $platforms, array $handles): array
    {
        $count = min(count($platforms), count($handles));

        return collect(range(0, $count - 1))
            ->map(fn ($i) => ['platform' => (string) $platforms[$i], 'handle' => (string) $handles[$i]])
            ->all();
    }

    /**
     * Rewrite this promoter's normalized handle rows to match its current
     * social_handles (canonical [{platform, handle}, ...] shape). Call
     * this any time social_handles is saved. Throws if a handle now
     * collides with another promoter's — that should already have been
     * caught by validation before this runs; this is the last-resort,
     * race-condition safety net, enforced for real by the database's
     * unique constraint.
     *
     * @throws ValidationException if a handle collides with another promoter
     */
    public function syncSocialHandleRows(): void
    {
        $pairs = collect($this->social_handles ?? [])
            ->filter(fn ($entry) => is_array($entry) && !empty($entry['platform']) && !empty($entry['handle']));

        try {
            $this->socialHandleRows()->delete();

            foreach ($pairs as $pair) {
                $this->socialHandleRows()->create([
                    'platform'          => strtolower(trim($pair['platform'])),
                    'handle'            => $pair['handle'],
                    'normalized_handle' => PromoterSocialHandle::normalizeHandle($pair['platform'], $pair['handle']),
                ]);
            }
        } catch (QueryException $e) {
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                throw ValidationException::withMessages([
                    'social_handles' => 'One of these social handles is already registered to another account.',
                ]);
            }

            throw $e;
        }
    }
}
