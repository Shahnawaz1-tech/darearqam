<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class HomeworkSubmissionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'text' => ['required_without:file', 'nullable', 'string', 'max:5000'],
            'file' => ['required_without:text', 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png,docx', 'max:5120'],
        ];
    }
}
