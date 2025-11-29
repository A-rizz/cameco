<?php

namespace App\Http\Requests\HR\Leave;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        // Only HR Manager should be allowed to approve/reject via this request
        if ($user && method_exists($user, 'hasRole')) {
            return $user->hasRole('HR Manager');
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject',
            'approval_comments' => 'nullable|string|max:1000',
        ];
    }
}
