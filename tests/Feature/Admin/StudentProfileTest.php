<?php

use App\Models\Student;
use App\Models\StudentDocument;
use App\Models\Tenant;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('student profile displays only a tenant student and uploads a document', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Profile Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);
    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $student = Student::create([
        'name' => 'Profile Student',
        'gender' => 'male',
        'status' => 'active',
        'admission_number' => 'DEA-PROFILE-001',
    ]);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.show', $student))
        ->assertOk();

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->post(route('admin.students.documents.store', $student), [
            'type' => 'b_form',
            'title' => 'Student B-Form',
            'file' => UploadedFile::fake()->create('b-form.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasNoErrors();

    $document = StudentDocument::firstOrFail();
    expect($document->tenant_id)->toBe($tenant->id)
        ->and($document->student_id)->toBe($student->id);
    Storage::disk('public')->assertExists($document->file_path);
});

test('cross tenant student profile returns not found', function () {
    $admin = User::factory()->create();
    $tenant = Tenant::create(['name' => 'Selected Profile Madrasa']);
    $tenant->users()->attach($admin->id, ['role' => Tenant::ROLE_OWNER]);

    $foreignTenant = Tenant::create(['name' => 'Foreign Profile Madrasa']);
    app(TenantContext::class)->initialize(new Collection([$foreignTenant]), $foreignTenant);
    $foreignStudent = Student::create([
        'name' => 'Foreign Profile Student',
        'gender' => 'female',
        'status' => 'active',
    ]);

    app(TenantContext::class)->initialize(new Collection([$tenant]), $tenant);

    $this->actingAs($admin)
        ->withSession(['current_tenant_id' => $tenant->id])
        ->get(route('admin.students.show', $foreignStudent))
        ->assertNotFound();
});
