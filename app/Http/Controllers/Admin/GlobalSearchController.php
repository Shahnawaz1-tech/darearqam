<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\MadrasaClass;
use App\Models\Notice;
use App\Models\Student;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    /**
     * Unified real-time search across all admin modules.
     */
    public function __invoke(Request $request, TenantContext $tenantContext): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));
        $category = $request->input('category', 'all');

        $quickActions = [
            [
                'id'          => 'action-add-student',
                'title'       => 'Enroll New Student',
                'subtitle'    => 'Add a new student admission record',
                'category'    => 'actions',
                'url'         => '/admin/students?action=create',
                'badge'       => 'Action',
                'icon'        => 'UserPlus',
            ],
            [
                'id'          => 'action-attendance',
                'title'       => 'Mark Attendance',
                'subtitle'    => 'Record student and staff daily attendance',
                'category'    => 'actions',
                'url'         => '/admin/attendance',
                'badge'       => 'Action',
                'icon'        => 'CalendarCheck',
            ],
            [
                'id'          => 'action-fees',
                'title'       => 'Record Fee Collection',
                'subtitle'    => 'Process fee payment and print voucher',
                'category'    => 'actions',
                'url'         => '/admin/fees',
                'badge'       => 'Action',
                'icon'        => 'Wallet',
            ],
            [
                'id'          => 'action-new-notice',
                'title'       => 'Publish Announcement / Notice',
                'subtitle'    => 'Broadcast new notice to madrasa notice board',
                'category'    => 'actions',
                'url'         => '/admin/notices',
                'badge'       => 'Action',
                'icon'        => 'Bell',
            ],
            [
                'id'          => 'action-classes',
                'title'       => 'Manage Classes & Sections',
                'subtitle'    => 'View class roster, capacity and teachers',
                'category'    => 'actions',
                'url'         => '/admin/classes',
                'badge'       => 'Action',
                'icon'        => 'BookOpen',
            ],
            [
                'id'          => 'action-staff',
                'title'       => 'Manage Teachers & Staff',
                'subtitle'    => 'Staff directory, role assignments & attendance',
                'category'    => 'actions',
                'url'         => '/admin/staff',
                'badge'       => 'Action',
                'icon'        => 'Users',
            ],
            [
                'id'          => 'action-dashboard',
                'title'       => 'Dashboard Overview',
                'subtitle'    => 'Analytics, stats, and real-time summaries',
                'category'    => 'actions',
                'url'         => '/admin/dashboard',
                'badge'       => 'Action',
                'icon'        => 'LayoutDashboard',
            ],
        ];

        // If query is empty or 1 char, return quick actions and top recommendations
        if (mb_strlen($q) < 2) {
            return response()->json([
                'query'   => $q,
                'total'   => count($quickActions),
                'results' => [
                    'actions'  => $quickActions,
                    'students' => [],
                    'staff'    => [],
                    'classes'  => [],
                    'fees'     => [],
                    'notices'  => [],
                ],
            ]);
        }

        $results = [
            'actions'  => [],
            'students' => [],
            'staff'    => [],
            'classes'  => [],
            'fees'     => [],
            'notices'  => [],
        ];

        // Filter matching quick actions
        if ($category === 'all' || $category === 'actions') {
            $results['actions'] = array_values(array_filter($quickActions, function ($act) use ($q) {
                return str_contains(strtolower($act['title']), strtolower($q))
                    || str_contains(strtolower($act['subtitle']), strtolower($q));
            }));
        }

        // 1. Students Search
        if ($category === 'all' || $category === 'students') {
            $results['students'] = Student::query()
                ->with('class:id,name')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                        ->orWhere('roll_number', 'like', "%{$q}%")
                        ->orWhere('father_name', 'like', "%{$q}%")
                        ->orWhere('registration_number', 'like', "%{$q}%");
                })
                ->limit(6)
                ->get()
                ->map(fn ($s) => [
                    'id'       => "student-{$s->id}",
                    'title'    => $s->name,
                    'subtitle' => 'Roll: '.($s->roll_number ?? 'N/A').' • Class: '.($s->class?->name ?? 'Unassigned').' • Father: '.($s->father_name ?? 'N/A'),
                    'category' => 'students',
                    'url'      => '/admin/students?search='.urlencode($s->name),
                    'badge'    => ucfirst($s->status ?? 'active'),
                    'icon'     => 'GraduationCap',
                ])
                ->all();
        }

        // 2. Staff / Teachers Search
        if ($category === 'all' || $category === 'staff') {
            $tenant = $tenantContext->current();
            $staffQuery = $tenant
                ? $tenant->users()
                : User::query();

            $results['staff'] = $staffQuery
                ->where(function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%");
                })
                ->limit(5)
                ->get()
                ->map(fn ($u) => [
                    'id'       => "staff-{$u->id}",
                    'title'    => $u->name,
                    'subtitle' => $u->email.($u->phone ? " • {$u->phone}" : ''),
                    'category' => 'staff',
                    'url'      => '/admin/staff',
                    'badge'    => ucfirst($u->pivot->role ?? 'Staff'),
                    'icon'     => 'UserRound',
                ])
                ->all();
        }

        // 3. Classes Search
        if ($category === 'all' || $category === 'classes') {
            $results['classes'] = MadrasaClass::query()
                ->where('name', 'like', "%{$q}%")
                ->orWhere('session', 'like', "%{$q}%")
                ->orWhere('type', 'like', "%{$q}%")
                ->limit(5)
                ->get()
                ->map(fn ($c) => [
                    'id'       => "class-{$c->id}",
                    'title'    => $c->name,
                    'subtitle' => 'Session: '.($c->session ?? 'Current').' • Type: '.ucfirst($c->type ?? 'General'),
                    'category' => 'classes',
                    'url'      => '/admin/classes',
                    'badge'    => 'Class',
                    'icon'     => 'BookOpen',
                ])
                ->all();
        }

        // 4. Fees Search
        if ($category === 'all' || $category === 'fees') {
            $results['fees'] = Fee::query()
                ->with('student:id,name,roll_number')
                ->where(function ($query) use ($q) {
                    $query->where('month', 'like', "%{$q}%")
                        ->orWhere('status', 'like', "%{$q}%")
                        ->orWhereHas('student', fn ($sq) => $sq->where('name', 'like', "%{$q}%"));
                })
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($f) => [
                    'id'       => "fee-{$f->id}",
                    'title'    => ($f->student?->name ?? 'Student').' Fee',
                    'subtitle' => 'Month: '.$f->month.' • Rs. '.number_format($f->amount).' (Paid: '.number_format($f->paid_amount).')',
                    'category' => 'fees',
                    'url'      => '/admin/fees',
                    'badge'    => ucfirst($f->status ?? 'pending'),
                    'icon'     => 'Wallet',
                ])
                ->all();
        }

        // 5. Notices Search
        if ($category === 'all' || $category === 'notices') {
            $results['notices'] = Notice::query()
                ->where('title', 'like', "%{$q}%")
                ->orWhere('type', 'like', "%{$q}%")
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($n) => [
                    'id'       => "notice-{$n->id}",
                    'title'    => $n->title,
                    'subtitle' => 'Category: '.ucfirst($n->type).' • Published: '.($n->published_at?->toDateString() ?? 'Draft'),
                    'category' => 'notices',
                    'url'      => '/admin/notices',
                    'badge'    => ucfirst($n->type),
                    'icon'     => 'Bell',
                ])
                ->all();
        }

        $totalCount = count($results['actions'])
            + count($results['students'])
            + count($results['staff'])
            + count($results['classes'])
            + count($results['fees'])
            + count($results['notices']);

        return response()->json([
            'query'   => $q,
            'total'   => $totalCount,
            'results' => $results,
        ]);
    }
}
