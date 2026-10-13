<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One normalized row per handle a Promoter has registered — mirrors
 * Promoter.social_handles (which stays the source of truth for display)
 * purely so "the same profile on two accounts" can be enforced with a real
 * database unique constraint on (platform, normalized_handle).
 */
class PromoterSocialHandle extends Model
{
    use HasUlids;

    protected $fillable = [
        'promoter_id',
        'platform',
        'handle',
        'normalized_handle',
    ];

    public function promoter(): BelongsTo
    {
        return $this->belongsTo(Promoter::class);
    }

    /**
     * Collapse a platform + handle (which might be a bare @handle or a full
     * profile/post URL) down to a lowercase, punctuation-stripped form for
     * matching. "@JohnDoe", "johndoe", and "https://instagram.com/johndoe/"
     * should all normalize to the same thing.
     */
    public static function normalizeHandle(string $platform, string $handle): string
    {
        $handle = trim($handle);

        if (filter_var($handle, FILTER_VALIDATE_URL)) {
            $extracted = self::extractFromUrl($handle);
            if ($extracted !== null && strcasecmp($extracted['platform'], trim($platform)) === 0) {
                $handle = $extracted['handle'];
            } else {
                // Still a URL but not one of the shapes we can parse a
                // username out of — fall back to the last non-empty path
                // segment, which is the closest generic approximation.
                $path = parse_url($handle, PHP_URL_PATH) ?? '';
                $segments = array_values(array_filter(explode('/', $path)));
                $handle = end($segments) ?: $handle;
            }
        }

        return strtolower(trim($handle, " \t\n\r\0\x0B@/"));
    }

    /**
     * Try to pull {platform, handle} out of a post URL, for the subset of
     * platform/link shapes that actually carry a username in the path.
     * Returns null for shapes that don't (Instagram post links, YouTube
     * links, Facebook share/watch/reel/story/group links, short links,
     * etc.) — there is no username to recover from those, period; callers
     * should treat null as "ownership can't be auto-verified for this
     * link," not as "no match."
     */
    public static function extractFromUrl(string $url): ?array
    {
        $patterns = [
            // https://x.com/username/status/123... or twitter.com/username/status/123...
            'twitter'  => '#(?:twitter\.com|x\.com)/(\w+)/status/\d{10,20}#i',
            // https://tiktok.com/@username/video/123...
            'tiktok'   => '#tiktok\.com/@([\w.-]+)/video/\d{15,25}#i',
            // https://facebook.com/username/posts/123... or /username/videos/123...
            // Note: this also matches "/groups/<name>/posts/..." with <name>
            // being the group, not the poster — an acceptable conservative
            // gap (it fails the match rather than wrongly confirming it).
            'facebook' => '#facebook\.com/([^/]+)/(?:posts|videos)/\d+#i',
            // https://linkedin.com/posts/username_activity-123...
            'linkedin' => '#linkedin\.com/posts/([A-Za-z0-9-]+)_activity#i',
        ];

        foreach ($patterns as $platform => $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return ['platform' => $platform, 'handle' => $matches[1]];
            }
        }

        return null;
    }

    /**
     * Find another promoter who already owns this (platform, handle),
     * excluding the given promoter (for edits). Null means no conflict.
     */
    public static function findConflictingPromoter(string $platform, string $handle, ?string $excludePromoterId = null): ?Promoter
    {
        $normalized = self::normalizeHandle($platform, $handle);

        $row = self::where('platform', strtolower(trim($platform)))
            ->where('normalized_handle', $normalized)
            ->when($excludePromoterId, fn ($q) => $q->where('promoter_id', '!=', $excludePromoterId))
            ->first();

        return $row?->promoter;
    }
}
