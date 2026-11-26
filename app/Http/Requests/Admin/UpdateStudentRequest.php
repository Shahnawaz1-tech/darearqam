<?php

namespace App\Http\Requests\Admin;

use Illuminate\Support\Facades\Gate;

class UpdateStudentRequest extends StoreStudentRequest
{
    public function authorize(): bool
    {
        if ($this->user() === null) {
            return false;
        }

        Gate::authorize('update', $this->route('student'));

        return true;
    }

    public function rules(): array
    {
        return $this->studentRules();
    }
}
