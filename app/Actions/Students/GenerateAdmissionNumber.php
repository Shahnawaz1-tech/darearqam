<?php

namespace App\Actions\Students;

use App\Models\Student;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class GenerateAdmissionNumber
{
    public function handle(Tenant $tenant, ?string $academicYear = null): string
    {
        return DB::transaction(function () use ($tenant, $academicYear): string {
            $year = $academicYear
                ? preg_replace('/[^0-9]/', '', substr($academicYear, 0, 4))
                : now()->format('Y');

            if (! is_string($year) || $year === '') {
                $year = now()->format('Y');
            }

            $sequence = Student::withTrashed()
                ->where('tenant_id', $tenant->id)
                ->count() + 1;

            do {
                $number = sprintf('DEA-%d-%s-%04d', $tenant->id, $year, $sequence);
                $exists = Student::withTrashed()
                    ->where('tenant_id', $tenant->id)
                    ->where('admission_number', $number)
                    ->exists();
                $sequence++;
            } while ($exists);

            return $number;
        });
    }
}
