<?php

namespace App\Modules\Promoter\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'submissions' => ['required', 'array'],
            'submissions.*.link' => ['required', 'url', Rule::unique('promoter_submissions', 'link')],
            'submissions.*.proof' => ['nullable', 'file', 'mimes:jpg,png,mp4,mov,avi', 'max:5120'],
            'submissions.*.platform' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'submissions.required' => 'You must submit at least one post.',
            'submissions.*.link.required' => 'The post link is required.',
            'submissions.*.link.url' => 'The post link must be a valid URL.',
            'submissions.*.link.unique' => 'You have already submitted this post link.',
            'submissions.*.proof.file' => 'The proof must be a valid file.',
            'submissions.*.proof.mimes' => 'The proof must be a file of type: jpg, png, mp4, mov, avi.',
            'submissions.*.proof.max' => 'The proof may not be greater than 5MB.',
            'submissions.*.platform.required' => 'The platform is required.',
        ];
    }
}
