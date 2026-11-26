<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user() === null) {
            return false;
        }

        Gate::authorize('create', \App\Models\Student::class);

        return true;
    }

    public function rules(): array
    {
        return $this->studentRules();
    }

    public function studentRules(): array
    {
        $tenantId = app(\App\Tenancy\TenantContext::class)->current()?->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'first_name' => ['nullable', 'string', 'max:60'],
            'last_name' => ['nullable', 'string', 'max:60'],
            'father_name' => ['nullable', 'string', 'max:100'],
            'mother_name' => ['nullable', 'string', 'max:100'],
            'guardian_name' => ['nullable', 'string', 'max:100'],
            'guardian_relationship' => ['nullable', 'string', 'max:50'],
            'guardian_phone' => ['nullable', 'string', 'max:32'],
            'guardian_email' => ['nullable', 'email', 'max:150'],
            'guardian_address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'string', 'max:32'],
            'class_id' => ['nullable', 'integer', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', 'integer', Rule::exists('student_sections', 'id')->where('tenant_id', $tenantId)],
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('tenant_id', $tenantId)],
            'assigned_teacher_id' => ['nullable', 'integer', 'exists:users,id'],
            'roll_number' => ['nullable', 'string', 'max:30'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:150'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'blood_group' => ['nullable', 'string', 'max:10'],
            'nationality' => ['nullable', 'string', 'max:80'],
            'religion' => ['nullable', 'string', 'max:80'],
            'address' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:80'],
            'province' => ['nullable', 'string', 'max:80'],
            'country' => ['nullable', 'string', 'max:80'],
            'admission_date' => ['nullable', 'date'],
            'session' => ['nullable', 'string', 'max:20'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'department' => ['nullable', 'string', 'max:100'],
            'study_program' => ['nullable', 'string', 'max:100'],
            'enrollment_type' => ['nullable', 'string', 'max:30'],
            'previous_school' => ['nullable', 'string', 'max:150'],
            'previous_class' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'pending_admission', 'inactive', 'suspended', 'transferred', 'graduated', 'withdrawn'])],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
