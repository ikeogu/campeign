<?php

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
        $userType = $this->input('user_type');   // get incoming request value

        $rules = [
            'user_type' => ['required', 'in:promoter,advertizer'],
        ];

        if ($userType === 'promoter') {
            $rules = array_merge($rules, [
                'first_name'     => ['required', 'string'],
                'last_name'      => ['required', 'string'],
                'social_handles' => ['required', 'array'],
                'social_handles.*' => ['string'],     // each handle
                'follower_count' => ['required', 'integer'],
                'platforms'      => ['required', 'array'],
                'platforms.*'    => ['string'],       // e.g. instagram, twitter
            ]);
        } elseif ($userType === 'advertizer') {

            $rules = array_merge($rules, [
                'company_name' => ['required', 'string'],
                'bio'  => ['nullable', 'string'],
                'website'      => ['nullable', 'url'],
                'industry'     => ['required', 'string'],
            ]);
        }

        return $rules;
    }
}
