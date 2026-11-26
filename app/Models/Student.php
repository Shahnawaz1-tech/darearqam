<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int         $id
 * @property int         $tenant_id
 * @property int|null    $class_id
 * @property int|null    $user_id
 * @property string      $name
 * @property string|null $father_name
 * @property string|null $roll_number
 * @property string|null $registration_number
 * @property string      $status  active|inactive|graduated|dropped
 * @property string|null $session
 * @property string|null $admission_date
 */
class Student extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'class_id', 'user_id', 'name', 'father_name', 'roll_number',
        'registration_number', 'date_of_birth', 'gender', 'phone',
        'address', 'photo', 'b_form', 'status', 'admission_date', 'session',
        'admission_number', 'first_name', 'last_name', 'email', 'blood_group',
        'nationality', 'religion', 'city', 'province', 'country', 'mother_name',
        'guardian_name', 'guardian_relationship', 'guardian_phone', 'guardian_email',
        'guardian_address', 'emergency_contact', 'academic_year', 'department',
        'study_program', 'enrollment_type', 'previous_school', 'previous_class',
        'assigned_teacher_id', 'branch_id', 'section_id', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'date_of_birth'  => 'date',
        'admission_date' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * @return BelongsTo<MadrasaClass, $this>
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(MadrasaClass::class, 'class_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fees(): HasMany
    {
        return $this->hasMany(Fee::class);
    }

    /**
     * @return HasMany<Attendance, $this>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(StudentSection::class, 'section_id');
    }

    public function guardians(): HasMany
    {
        return $this->hasMany(StudentGuardian::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(StudentStatusHistory::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(StudentActivityLog::class);
    }

    public function hifzEnrollment(): HasOne
    {
        return $this->hasOne(StudentHifzEnrollment::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
