<x-filament::page>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold">Promoter Submissions — {{ $record->title }}</h2>
            <p class="text-sm text-gray-500 mt-1">
                Min. followers required:
                <strong>{{ $record->min_followers ? number_format((int) $record->min_followers) : '—' }}</strong>
                &nbsp;·&nbsp;
                Slots: <strong>{{ $record->available_slots }} / {{ $record->target_shares }}</strong> remaining
                @if ($record->is_trial)
                    &nbsp;·&nbsp;
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Trial</span>
                @endif
            </p>
        </div>
    </div>

    <div class="overflow-x-auto bg-white rounded-xl shadow border">
        <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-700">
                <tr>
                    <th class="px-4 py-3 text-left">Promoter</th>
                    <th class="px-4 py-3 text-left">Email</th>
                    <th class="px-4 py-3 text-left">Followers</th>
                    <th class="px-4 py-3 text-left">Platform</th>
                    <th class="px-4 py-3 text-left">Post Link</th>
                    <th class="px-4 py-3 text-left">Proof</th>
                    <th class="px-4 py-3 text-left">Submission</th>
                    <th class="px-4 py-3 text-left">Verification</th>
                    <th class="px-4 py-3 text-left">Checks</th>
                    <th class="px-4 py-3 text-left">Submitted At</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($record->submissions as $submission)
                    @php
                        $promoter      = $submission->user?->promoter;
                        $followerCount = (int) ($promoter?->follower_count ?? 0);
                        $minFollowers  = (int) ($record->min_followers ?? 0);
                        $belowMin      = $minFollowers > 0 && $followerCount < $minFollowers;
                        $verStatus     = optional($submission->verification)->status;
                    @endphp
                    <tr class="border-t {{ $belowMin ? 'bg-red-50' : '' }}">
                        <td class="px-4 py-3 font-medium">
                            {{ $promoter ? trim($promoter->first_name . ' ' . $promoter->last_name) : '—' }}
                            @if ($belowMin)
                                <span class="ml-1 text-xs text-red-600 font-semibold" title="Below follower requirement">⚠</span>
                            @endif
                        </td>

                        <td class="px-4 py-3 text-gray-500">
                            {{ $submission->user?->email ?? '—' }}
                        </td>

                        <td class="px-4 py-3 {{ $belowMin ? 'text-red-600 font-semibold' : '' }}">
                            {{ number_format($followerCount) }}
                        </td>

                        <td class="px-4 py-3 capitalize">
                            {{ $submission->platform ?? '—' }}
                        </td>

                        <td class="px-4 py-3">
                            @if ($submission->link)
                                <a href="{{ $submission->link }}" target="_blank" class="text-primary-600 underline">
                                    View Post
                                </a>
                            @else
                                —
                            @endif
                        </td>

                        <td class="px-4 py-3">
                            @if ($submission->full_proof_url)
                                <a href="{{ $submission->full_proof_url }}" target="_blank" class="text-primary-600 underline">
                                    View Proof
                                </a>
                            @else
                                —
                            @endif
                        </td>

                        <td class="px-4 py-3">
                            <x-filament::badge
                                :color="match($submission->status) {
                                    'approved' => 'success',
                                    'rejected' => 'danger',
                                    default    => 'warning'
                                }"
                            >
                                {{ $submission->status }}
                            </x-filament::badge>
                        </td>

                        <td class="px-4 py-3">
                            <x-filament::badge
                                :color="match($verStatus) {
                                    'verified' => 'success',
                                    'failed'   => 'danger',
                                    'pending'  => 'warning',
                                    default    => 'gray'
                                }"
                            >
                                {{ $verStatus ?? 'pending' }}
                            </x-filament::badge>
                        </td>

                        <td class="px-4 py-3">
                            {{ optional($submission->verification)->checks ?? 0 }}
                        </td>

                        <td class="px-4 py-3 text-gray-500">
                            {{ $submission->created_at?->format('M d, Y H:i') ?? '—' }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="10" class="px-4 py-8 text-center text-gray-400">
                            No submissions yet.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</x-filament::page>
