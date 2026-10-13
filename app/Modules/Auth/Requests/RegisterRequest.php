<?php

namespace App\Modules\Auth\Requests;

use App\Models\Promoter;
use App\Models\PromoterSocialHandle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
                'website'      => ['nullable'],
                'industry'     => ['required', 'string'],
            ]);
        }

        return $rules;
    }

    /**
     * Reject registration up front if a submitted handle is already
     * registered to a different promoter — the database unique constraint
     * on promoter_social_handles is the real enforcement (see
     * Promoter::syncSocialHandleRows()), this is just the friendly,
     * pre-save version of the same check.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('user_type') !== 'promoter') {
                return;
            }

            $pairs = Promoter::pairPlatformsAndHandles(
                (array) $this->input('platforms', []),
                (array) $this->input('social_handles', []),
            );

            foreach ($pairs as $pair) {
                if ($conflict = PromoterSocialHandle::findConflictingPromoter($pair['platform'], $pair['handle'])) {
                    $validator->errors()->add(
                        'social_handles',
                        "The {$pair['platform']} handle \"{$pair['handle']}\" is already registered to another account.",
                    );
                }
            }
        });
    }
}
