<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class LeaveRequestForm extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'from_date' => ['required', 'date', 'after_or_equal:today'],
            'to_date' => ['required', 'date', 'after_or_equal:from_date'],
            'reason' => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }
}
