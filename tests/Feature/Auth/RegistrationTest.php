<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('registration screen can be rendered', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('auth/register'));
});

test('parents can register without being assigned to a tenant', function () {
    Notification::fake();

    $this->post(route('register.store'), [
        'name' => 'Ayesha Khan',
        'email' => 'PARENT@EXAMPLE.COM',
        'phone' => '03001234567',
        'password' => 'password',
        'password_confirmation' => 'password',
        'is_parent_account' => false,
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'parent@example.com')->firstOrFail();

    $this->assertAuthenticatedAs($user);
    $this->assertModelExists($user);
    expect($user->phone)->toBe('03001234567')
        ->and($user->is_parent_account)->toBeTrue()
        ->and(Hash::check('password', $user->password))->toBeTrue()
        ->and($user->tenants()->exists())->toBeFalse()
        ->and($user->toArray())->not->toHaveKey('phone')
        ->and($user->toArray())->not->toHaveKey('is_parent_account');

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('phone number is optional during parent registration', function () {
    Notification::fake();

    $this->post(route('register.store'), [
        'name' => 'Ayesha Khan',
        'email' => 'parent@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'parent@example.com')->firstOrFail();

    expect($user->phone)->toBeNull();
});

test('registration requires a name email and confirmed password', function () {
    $this->from(route('register'))
        ->post(route('register.store'))
        ->assertSessionHasErrors([
            'name' => 'The name field is required.',
            'email' => 'The email field is required.',
            'password' => 'The password field is required.',
        ]);

    $this->assertDatabaseCount('users', 0);
});

test('registration rejects an email address already in use', function () {
    User::factory()->create(['email' => 'parent@example.com']);

    $this->from(route('register'))
        ->post(route('register.store'), [
            'name' => 'Ayesha Khan',
            'email' => 'parent@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasErrors([
            'email' => 'The email has already been taken.',
        ]);
});

test('registration rejects mismatched password confirmation', function () {
    $this->from(route('register'))
        ->post(route('register.store'), [
            'name' => 'Ayesha Khan',
            'email' => 'parent@example.com',
            'password' => 'password',
            'password_confirmation' => 'different-password',
        ])
        ->assertSessionHasErrors([
            'password' => 'The password field confirmation does not match.',
        ]);

    $this->assertDatabaseCount('users', 0);
});

test('registration rejects an overlong phone number', function () {
    $this->from(route('register'))
        ->post(route('register.store'), [
            'name' => 'Ayesha Khan',
            'email' => 'parent@example.com',
            'phone' => str_repeat('1', 33),
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasErrors([
            'phone' => 'The phone field must not be greater than 32 characters.',
        ]);

    $this->assertDatabaseCount('users', 0);
});
