<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Look up an internal exam result by roll + registration number.
     *
     * Replace the stub data below with a real Eloquent query once the
     * students/results tables exist. The shape returned must match the
     * ResultData interface in welcome.tsx:
     *
     *   { name, father, course, subjects: [{ name, marks, total }] }
     */
    public function internal(Request $request): RedirectResponse
    {
        $request->validate([
            'roll' => ['required', 'string', 'max:30'],
            'reg'  => ['required', 'string', 'max:30'],
        ]);

        $result = $this->findInternal(
            $request->string('roll')->trim()->value(),
            $request->string('reg')->trim()->value(),
        );

        if ($result === null) {
            return back()->with('result_error', 'نتیجہ نہیں ملا۔ رول نمبر اور رجسٹریشن نمبر دوبارہ چیک کریں۔');
        }

        return back()->with('result_data', $result);
    }

    /**
     * Look up a Wifaq ul Madaris result by roll + registration number.
     */
    public function wifaq(Request $request): RedirectResponse
    {
        $request->validate([
            'roll' => ['required', 'string', 'max:30'],
            'reg'  => ['required', 'string', 'max:30'],
        ]);

        $result = $this->findWifaq(
            $request->string('roll')->trim()->value(),
            $request->string('reg')->trim()->value(),
        );

        if ($result === null) {
            return back()->with('wifaq_error', 'نتیجہ نہیں ملا۔ رول نمبر اور رجسٹریشن نمبر دوبارہ چیک کریں۔');
        }

        return back()->with('wifaq_data', $result);
    }

    // ─── Stub lookup — replace with Eloquent queries ─────────────────────────

    private function findInternal(string $roll, string $reg): ?array
    {
        // TODO: query the results table, e.g.:
        // return Result::with('subjects')
        //     ->where('roll_number', $roll)
        //     ->where('registration_number', $reg)
        //     ->where('exam_type', 'internal')
        //     ->first()
        //     ?->toResultArray();

        // Demo record — remove once the database is wired up.
        $demo = [
            '2026-001' => [
                'REG-2026-0001' => [
                    'name'     => 'احمد علی',
                    'father'   => 'محمد اکرم',
                    'course'   => 'درسِ نظامی، سال اول',
                    'subjects' => [
                        ['name' => 'قرآن کریم', 'marks' => 98, 'total' => 100],
                        ['name' => 'حدیث',       'marks' => 95, 'total' => 100],
                        ['name' => 'فقہ',         'marks' => 97, 'total' => 100],
                        ['name' => 'عربی',        'marks' => 96, 'total' => 100],
                        ['name' => 'اردو',         'marks' => 94, 'total' => 100],
                        ['name' => 'انگریزی',    'marks' => 100, 'total' => 100],
                    ],
                ],
            ],
        ];

        return $demo[$roll][$reg] ?? null;
    }

    private function findWifaq(string $roll, string $reg): ?array
    {
        // TODO: query the wifaq_results table or call the Wifaq API.

        // Demo record — remove once the database is wired up.
        $demo = [
            'WM-2026-001' => [
                'WRG-2026-0001' => [
                    'name'     => 'زید حسن',
                    'father'   => 'حسن علی',
                    'course'   => 'شہادۃ العالمیہ',
                    'subjects' => [
                        ['name' => 'قرآن کریم', 'marks' => 97, 'total' => 100],
                        ['name' => 'حدیث',       'marks' => 96, 'total' => 100],
                        ['name' => 'فقہ',         'marks' => 95, 'total' => 100],
                        ['name' => 'عربی',        'marks' => 92, 'total' => 100],
                        ['name' => 'منطق',        'marks' => 94, 'total' => 100],
                        ['name' => 'تفسیر',      'marks' => 98, 'total' => 100],
                    ],
                ],
            ],
        ];

        return $demo[$roll][$reg] ?? null;
    }
}
