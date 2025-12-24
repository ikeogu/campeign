<x-filament::page>
    <h2 class="text-2xl font-bold mb-6">
        Promoter Submissions — {{ $record->title }}
    </h2>

    <div class="overflow-x-auto bg-white rounded-xl shadow border">
        <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-700">
                <tr>
                    <th class="px-4 py-3 text-left">Promoter</th>
                    <th class="px-4 py-3 text-left">Post Link</th>
                    <th class="px-4 py-3 text-left">Status</th>
                    <th class="px-4 py-3 text-left">Checks</th>
                    <th class="px-4 py-3 text-left">Verified At</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($record->submissions as $submission)
                    <tr class="border-t">
                        <td class="px-4 py-3">
                            {{ $submission->user->email }}
                        </td>

                        <td class="px-4 py-3">
                            <a href="{{ $submission->link }}"
                               target="_blank"
                               class="text-primary-600 underline">
                                View Post
                            </a>
                        </td>

                        <td class="px-4 py-3">
                            <x-filament::badge
                                :color="match(optional($submission->verification)->status) {
                                    'verified' => 'success',
                                    'failed' => 'danger',
                                    'pending' => 'warning',
                                    default => 'gray'
                                }"
                            >
                                {{ optional($submission->verification)->status ?? 'pending' }}
                            </x-filament::badge>
                        </td>

                        <td class="px-4 py-3">
                            {{ optional($submission->verification)->checks ?? 0 }}
                        </td>

                        <td class="px-4 py-3">
                            {{ optional($submission->verification)->first_verified_at?->format('M d, Y H:i') ?? '—' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</x-filament::page>
