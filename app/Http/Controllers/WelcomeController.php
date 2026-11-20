<?php

namespace App\Http\Controllers;

use App\Models\GalleryImage;
use App\Models\MadrasaClass;
use App\Models\Notice;
use App\Models\PositionHolder;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return to_route('dashboard');
        }

        $tenantId = config('madrasa.public_tenant_id');
        $tenantId = is_numeric($tenantId) && (int) $tenantId > 0 ? (int) $tenantId : null;

        $stats = ['students' => 0, 'teachers' => 0, 'depts' => 0];
        $notices = collect();
        $positionHolders = collect();
        $gallery = collect();

        if ($tenantId !== null) {
            $stats = [
                'students' => Student::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)->where('status', 'active')->count(),
                'teachers' => DB::table('tenant_user')
                    ->where('tenant_id', $tenantId)->whereIn('role', ['staff', 'member'])->count(),
                'depts' => MadrasaClass::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)->where('is_active', true)->distinct()->count('type'),
            ];

            $notices = Notice::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->where('is_published', true)
                ->latest('published_at')
                ->limit(5)
                ->get(['id', 'title', 'type', 'published_at'])
                ->map(fn (Notice $notice): array => [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'type' => $notice->type,
                    'date' => $notice->published_at?->toDateString(),
                    'is_new' => $notice->published_at !== null && $notice->published_at->greaterThanOrEqualTo(Carbon::today()->subDays(7)),
                ]);

            $positionHolders = PositionHolder::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)->where('is_published', true)
                ->orderByDesc('is_featured')->orderBy('rank')->limit(4)
                ->get()->map(fn (PositionHolder $holder): array => $holder->toPublicArray());

            $gallery = GalleryImage::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)->where('is_published', true)
                ->orderBy('sort')->limit(12)
                ->get()->map(fn (GalleryImage $image): array => $image->toPublicArray());
        }

        return Inertia::render('welcome', [
            'stats' => $stats,
            'notices' => $notices->values(),
            'positionHolders' => $positionHolders->values(),
            'gallery' => $gallery->values(),
        ]);
    }
}
