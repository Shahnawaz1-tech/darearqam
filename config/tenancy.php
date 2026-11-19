<?php

return [
    'domain' => env('TENANCY_DOMAIN', 'localhost'),

    'central_domains' => array_filter(array_map(
        'trim',
        explode(',', env('TENANCY_CENTRAL_DOMAINS', 'localhost,127.0.0.1')),
    )),

    'platform_admin_emails' => array_filter(array_map(
        'strtolower',
        array_map('trim', explode(',', env('TENANCY_PLATFORM_ADMIN_EMAILS', ''))),
    )),
];
