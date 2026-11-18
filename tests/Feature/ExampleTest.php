<?php

test('guests see the welcome page', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});
