@php
    $images = $getRecord()->images;
@endphp

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    @forelse ($images as $image)
        <div class="rounded-lg overflow-hidden border shadow-sm">
            <img
                src="{{ \Illuminate\Support\Facades\Storage::url($image->file_path) }}"
                class="w-full h-40 object-cover"
                alt="Campaign Image"
            >
        </div>
    @empty
        <p class="text-sm text-gray-500 italic col-span-full">
            No images uploaded for this campaign.
        </p>
    @endforelse
</div>
