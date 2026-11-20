<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PublicWelcomeContentSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        $tenantId = config('madrasa.public_tenant_id');
        $tenant = is_numeric($tenantId)
            ? Tenant::query()->find((int) $tenantId)
            : Tenant::query()->where('name', 'Dar-e-Arqam Demo Madrasa')->first();

        if (! $tenant) {
            $this->command?->warn('Welcome sample content skipped: configure MADRASA_PUBLIC_TENANT_ID or seed the demo madrasa first.');

            return;
        }

        $assetRoot = database_path('seeders/assets');
        foreach (File::allFiles($assetRoot) as $asset) {
            $relativePath = $asset->getRelativePathname();
            $destination = storage_path('app/public/'.$relativePath);

            if (! File::exists($destination)) {
                File::ensureDirectoryExists(dirname($destination));
                File::copy($asset->getPathname(), $destination);
            }
        }

        $now = now();
        foreach ([
            ['name' => 'احمد علی', 'father' => 'محمد اکرم', 'course' => 'درسِ نظامی، سال اول', 'marks' => 580, 'total' => 600, 'exam' => 'internal', 'rank' => 1, 'quote' => 'الحمدللہ، اساتذہ کی رہنمائی سے کامیابی ملی۔', 'is_featured' => true, 'photo_path' => 'gallery/s2.jpg'],
            ['name' => 'زید حسن', 'father' => 'حسن علی', 'course' => 'حفظ القرآن', 'marks' => 565, 'total' => 600, 'exam' => 'wifaq', 'rank' => 2, 'quote' => null, 'is_featured' => false, 'photo_path' => 'gallery/s3.jpg'],
            ['name' => 'بلال احمد', 'father' => 'فاروق احمد', 'course' => 'درسِ نظامی، سال دوم', 'marks' => 548, 'total' => 600, 'exam' => 'internal', 'rank' => 3, 'quote' => null, 'is_featured' => false, 'photo_path' => 'gallery/s4.jpg'],
        ] as $holder) {
            DB::table('position_holders')->updateOrInsert(
                ['tenant_id' => $tenant->id, 'name' => $holder['name']],
                [...$holder, 'tenant_id' => $tenant->id, 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            );
        }

        foreach ([
            ['label' => 'قرآن کی تعلیم', 'category' => 'quran', 'layout' => 'tall', 'path' => 'gallery/s2.jpg'],
            ['label' => 'مسجد نبوی کا منظر', 'category' => 'campus', 'layout' => 'wide', 'path' => 'hero/hero-1.jpg'],
            ['label' => 'طلبہ کی سرگرمیاں', 'category' => 'events', 'layout' => 'normal', 'path' => 'gallery/s6.jpg'],
            ['label' => 'تعلیمی نشست', 'category' => 'quran', 'layout' => 'normal', 'path' => 'gallery/s3.jpg'],
            ['label' => 'اساتذہ کی تقریب', 'category' => 'events', 'layout' => 'wide', 'path' => 'gallery/s4.jpg'],
            ['label' => 'مدرسے کی مسجد', 'category' => 'campus', 'layout' => 'normal', 'path' => 'hero/hero-3.jpg'],
        ] as $index => $image) {
            DB::table('gallery_images')->updateOrInsert(
                ['tenant_id' => $tenant->id, 'label' => $image['label']],
                [...$image, 'tenant_id' => $tenant->id, 'sort' => $index + 1, 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            );
        }
    }
}
