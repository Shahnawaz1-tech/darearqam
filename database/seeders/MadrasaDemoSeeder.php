<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Exam;
use App\Models\Fee;
use App\Models\HifzLog;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\LeaveRequest;
use App\Models\PointEvent;
use App\Models\MadrasaClass;
use App\Models\Notice;
use App\Models\Resource;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentRemark;
use App\Models\Subject;
use App\Models\Thread;
use App\Models\ThreadMessage;
use App\Models\TimetableSlot;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use App\Tenancy\TenantContext;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MadrasaDemoSeeder extends Seeder
{
    private const PASSWORD  = 'password';
    private const MADRASA   = 'Dar-e-Arqam Demo Madrasa';

    // ── Urdu names ───────────────────────────────────────────────────────────

    private array $maleStudentNames = [
        'احمد علی', 'محمد عمر', 'عبداللہ خان', 'بلال احمد', 'زید حسین',
        'حمزہ رضا', 'یوسف اقبال', 'طلحہ فاروق', 'عثمان شاہ', 'سفیان ملک',
        'نعمان طارق', 'اویس کریم', 'عبدالرحمان', 'فیصل عمران', 'خالد محمود',
        'سعد اللہ', 'واجد حسن', 'ارسلان خان', 'جنید احمد', 'شہزاد علی',
        'عاصم نور', 'رمضان گل', 'تیمور اختر', 'قاسم ندیم', 'حارث حیدر',
        'مصطفیٰ رؤف', 'صہیب انور', 'علی رضا', 'آدم فیاض', 'بکر صدیق',
        'عمران زبیر', 'سلمان چودھری', 'اسامہ شیخ', 'نادر محمود', 'شعیب صادق',
        'روحان انصاری', 'اشفاق مغل', 'مازن الیاس', 'واثق امین', 'صدام ریاض',
        'عماد گیلانی', 'ریحان سلطان', 'ضیاء الحق', 'فرقان نجمی', 'اقبال یاسین',
        'معاذ حنیف', 'وقاص کمال', 'نبیل اشرف', 'سجاد میر', 'تقدیر باجوہ',
    ];

    private array $fatherNames = [
        'محمد اکرم', 'علی احمد', 'حسین خان', 'فاروق احمد', 'اختر علی',
        'رضا محمود', 'اقبال خان', 'عمران فاروق', 'خان محمد', 'طارق ملک',
        'کریم بخش', 'شاہ محمد', 'ندیم احمد', 'حیدر علی', 'نور محمد',
        'اللہ بخش', 'حسن خان', 'ارشاد احمد', 'احسان اللہ', 'ظفر علی',
        'نجم الدین', 'رؤف میاں', 'انور علی', 'فیاض احمد', 'صادق خان',
    ];

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Demo data must not be seeded in production.');
        }

        $this->command?->info('Seeding madrasa demo data…');

        // ── 1. Tenant ─────────────────────────────────────────────────────
        $tenant = Tenant::firstOrCreate(['name' => self::MADRASA]);

        // ── 2. Users / staff accounts ─────────────────────────────────────
        $adminUser = $this->upsertUser(
            'admin@darearqam.test',
            'قاری محمد عارف',
            Tenant::ROLE_OWNER,
            $tenant,
        );
        $staffUser = $this->upsertUser(
            'teacher@darearqam.test',
            'مولانا عبدالرحمان',
            Tenant::ROLE_STAFF,
            $tenant,
        );
        $studentUser = $this->upsertUser('student@darearqam.test', 'طالب علم احمد', Tenant::ROLE_STUDENT, $tenant);
        $this->upsertUser('parent@darearqam.test', 'والدین ولی', Tenant::ROLE_PARENT, $tenant, true);

        // Extra staff
        foreach ([
            ['ustadyahya@darearqam.test',  'استاد یحییٰ',  Tenant::ROLE_STAFF],
            ['ustadibrahim@darearqam.test', 'استاد ابراہیم', Tenant::ROLE_STAFF],
        ] as [$email, $name, $role]) {
            $this->upsertUser($email, $name, $role, $tenant);
        }

        // ── 3. Boot tenant context (required by BelongsToTenant trait) ────
        $ctx = app(TenantContext::class);
        /** @var \Illuminate\Database\Eloquent\Collection<int, Tenant> $tenantCollection */
        $tenantCollection = Tenant::where('id', $tenant->id)->get();
        $ctx->initialize($tenantCollection, $tenant);

        // ── 4. Classes ───────────────────────────────────────────────────
        $classData = [
            ['name' => 'ناظرہ — جماعت اول',          'type' => 'nazra',          'session' => '2026'],
            ['name' => 'ناظرہ — جماعت دوم',           'type' => 'nazra',          'session' => '2026'],
            ['name' => 'حفظ — صبح',                    'type' => 'hifz',           'session' => '2026'],
            ['name' => 'حفظ — شام',                    'type' => 'hifz',           'session' => '2026'],
            ['name' => 'تجوید — بنیادی',               'type' => 'tajweed',        'session' => '2026'],
            ['name' => 'درسِ نظامی — سال اول',         'type' => 'dars_e_nizami',  'session' => '2026'],
            ['name' => 'درسِ نظامی — سال دوم',         'type' => 'dars_e_nizami',  'session' => '2026'],
            ['name' => 'درسِ نظامی — سال سوم',         'type' => 'dars_e_nizami',  'session' => '2026'],
            ['name' => 'عربی زبان — ابتدائی',          'type' => 'arabic',         'session' => '2026'],
            ['name' => 'عصری مضامین — جماعت ششم',      'type' => 'modern',         'session' => '2026'],
        ];

        $classes = [];
        foreach ($classData as $cd) {
            $classes[] = MadrasaClass::firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $cd['name']],
                ['type' => $cd['type'], 'session' => $cd['session'], 'is_active' => true],
            );
        }

        // Link the demo teacher to two classes through the admin-managed pivot.
        foreach ([$classes[0]->id, $classes[2]->id] as $classId) {
            DB::table('teacher_class')->updateOrInsert(
                ['tenant_id' => $tenant->id, 'user_id' => $staffUser->id, 'class_id' => $classId, 'course_id' => null],
                ['created_at' => now(), 'updated_at' => now()],
            );
        }

        // ── 5. Subjects per class ────────────────────────────────────────
        $subjectMap = [
            'nazra'         => [['قرآنِ کریم', 100, 40], ['تجوید', 50, 20]],
            'hifz'          => [['حفظ', 100, 60], ['دہرائی', 100, 60], ['تجوید', 50, 25]],
            'tajweed'       => [['قواعد تجوید', 100, 40], ['عملی تجوید', 100, 40]],
            'dars_e_nizami' => [
                ['قرآنِ کریم', 100, 40], ['حدیث', 100, 40], ['فقہ', 100, 40],
                ['عربی زبان', 100, 40], ['عقیدہ', 100, 40], ['تاریخ', 100, 40],
            ],
            'arabic'        => [['نحو', 100, 40], ['صرف', 100, 40], ['مطالعہ', 50, 20]],
            'modern'        => [['اردو', 100, 40], ['انگریزی', 100, 40], ['ریاضی', 100, 40], ['سائنس', 100, 40]],
        ];

        $subjectsByClass = [];
        foreach ($classes as $cls) {
            $subjects = $subjectMap[$cls->type] ?? $subjectMap['dars_e_nizami'];
            $subjectsByClass[$cls->id] = [];
            foreach ($subjects as [$sName, $total, $pass]) {
                $subjectsByClass[$cls->id][] = Subject::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'class_id' => $cls->id, 'name' => $sName],
                    ['total_marks' => $total, 'passing_marks' => $pass],
                );
            }
        }

        // ── 6. Students ──────────────────────────────────────────────────
        $students = [];
        $namePool  = $this->maleStudentNames;
        $fatherPool = $this->fatherNames;
        shuffle($namePool);

        $genders = ['male', 'male', 'male', 'female'];
        $statuses = ['active', 'active', 'active', 'active', 'active', 'inactive'];
        $roll = 1;

        foreach ($classes as $cls) {
            // 4–8 students per class
            $count = random_int(4, 8);
            for ($i = 0; $i < $count; $i++) {
                $name = $namePool[($roll - 1) % count($namePool)];
                $father = $fatherPool[($roll - 1) % count($fatherPool)];
                $admitDate = Carbon::create(2024, random_int(1, 9), random_int(1, 28));

                $student = Student::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'roll_number' => sprintf('%04d', $roll)],
                    [
                        'class_id'            => $cls->id,
                        'name'                => $name,
                        'father_name'         => $father,
                        'registration_number' => 'REG-2026-' . sprintf('%04d', $roll),
                        'gender'              => $genders[array_rand($genders)],
                        'status'              => $statuses[array_rand($statuses)],
                        'admission_date'      => $admitDate->toDateString(),
                        'session'             => '2026',
                        'phone'               => '0300' . rand(1000000, 9999999),
                    ],
                );

                $students[] = $student;
                $roll++;
            }
        }

        $this->command?->info('  ✓ ' . count($students) . ' students created.');

        $demoStudent = collect($students)->first(fn (Student $student) => $student->status === 'active');
        if ($demoStudent) {
            $demoStudent->update(['user_id' => $studentUser->id]);
        }

        // ── 7. Exams ─────────────────────────────────────────────────────
        $examsByClass = [];
        foreach ($classes as $cls) {
            $examsByClass[$cls->id] = Exam::firstOrCreate(
                ['tenant_id' => $tenant->id, 'class_id' => $cls->id, 'title' => 'سالانہ امتحان 2026'],
                [
                    'type'         => in_array($cls->type, ['dars_e_nizami']) ? 'wifaq' : 'annual',
                    'exam_date'    => Carbon::create(2026, 2, 15)->toDateString(),
                    'session'      => '2026',
                    'is_published' => true,
                ],
            );
        }

        // ── 8. Results ───────────────────────────────────────────────────
        $grades = ['A+', 'A+', 'A', 'A', 'A', 'B', 'B', 'C'];

        foreach ($students as $student) {
            if ($student->status !== 'active') {
                continue;
            }
            $exam     = $examsByClass[$student->class_id] ?? null;
            $subjects = $subjectsByClass[$student->class_id] ?? [];
            if (! $exam || empty($subjects)) {
                continue;
            }

            foreach ($subjects as $subject) {
                $total    = $subject->total_marks;
                $obtained = (int) round($total * (random_int(60, 100) / 100));
                $pct      = ($obtained / $total) * 100;
                $grade    = match (true) {
                    $pct >= 90 => 'A+',
                    $pct >= 80 => 'A',
                    $pct >= 70 => 'B',
                    $pct >= 60 => 'C',
                    default    => 'D',
                };

                Result::firstOrCreate(
                    [
                        'tenant_id'  => $tenant->id,
                        'exam_id'    => $exam->id,
                        'student_id' => $student->id,
                        'subject_id' => $subject->id,
                    ],
                    ['marks_obtained' => $obtained, 'grade' => $grade],
                );
            }
        }

        $this->command?->info('  ✓ Results recorded.');

        // ── 9. Attendance (last 14 days) ─────────────────────────────────
        $activeStudents = Student::active()->get();
        $today = Carbon::today();

        for ($day = 13; $day >= 0; $day--) {
            $date = $today->copy()->subDays($day);
            // Skip Friday (5)
            if ($date->dayOfWeek === Carbon::FRIDAY) {
                continue;
            }

            foreach ($activeStudents as $student) {
                $rand = random_int(1, 10);
                $status = match (true) {
                    $rand <= 7  => 'present',
                    $rand === 8 => 'absent',
                    $rand === 9 => 'late',
                    default     => 'excused',
                };

                Attendance::firstOrCreate(
                    [
                        'tenant_id'  => $tenant->id,
                        'student_id' => $student->id,
                        'class_id'   => $student->class_id,
                        'date'       => $date->toDateString(),
                    ],
                    [
                        'status'    => $status,
                        'marked_by' => $staffUser->id,
                    ],
                );
            }
        }

        $this->command?->info('  ✓ Attendance marked for last 14 days.');

        // ── 10. Fees (current + last month) ──────────────────────────────
        $months = [
            Carbon::today()->subMonth()->format('Y-m'),
            Carbon::today()->format('Y-m'),
        ];

        foreach ($activeStudents as $student) {
            foreach ($months as $month) {
                $isPaid   = random_int(0, 1) === 1;
                $amount   = random_int(500, 2000) * 100; // in smallest unit (paisa)
                $dueDate  = Carbon::createFromFormat('Y-m', $month)->endOfMonth()->toDateString();

                Fee::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'student_id' => $student->id, 'month' => $month],
                    [
                        'title'       => 'ماہانہ فیس — ' . Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                        'amount'      => $amount,
                        'paid_amount' => $isPaid ? $amount : 0,
                        'status'      => $isPaid ? 'paid' : 'pending',
                        'due_date'    => $dueDate,
                        'paid_date'   => $isPaid ? $dueDate : null,
                    ],
                );
            }
        }

        $this->command?->info('  ✓ Fee records created.');

        if ($demoStudent) {
            $courseNames = [
                ['Nazra Recitation', ['Nazra','Tajweed']],
                ['Hifz Track', ['Hifz','Revision']],
                ['Dars-e-Nizami Arabic', ['Arabic','Grammar']],
                ['Modern Studies', ['English','Science','Math']],
            ];
            $courses = [];
            foreach ($courseNames as $index => [$title, $tags]) {
                $course = Course::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'class_id' => $demoStudent->class_id, 'title' => $title],
                    ['teacher_id' => $staffUser->id, 'tags' => $tags],
                );
                $courses[] = $course;
                CourseProgress::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'student_id' => $demoStudent->id, 'course_id' => $course->id],
                    ['percent' => [72, 58, 64, 81][$index]],
                );
            }

            foreach ($courses as $index => $course) {
                TimetableSlot::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'class_id' => $demoStudent->class_id, 'weekday' => Carbon::today()->dayOfWeekIso, 'starts_at' => sprintf('%02d:00:00', 8 + $index)],
                    ['course_id' => $course->id, 'teacher_id' => $staffUser->id, 'ends_at' => sprintf('%02d:40:00', 8 + $index), 'room' => 'Room '.($index + 1), 'topic' => 'Weekly lesson', 'live_url' => $index === 0 ? 'https://example.test/lesson' : null],
                );
            }

            $homeworkTitles = [
                ['Nazra revision', 'pending'], ['Surah practice', 'submitted'], ['Arabic exercise', 'graded'],
                ['Weekly hifz sabqi', 'late'], ['Science worksheet', 'pending'], ['Tajweed rules', 'submitted'],
            ];
            foreach ($homeworkTitles as $index => [$title, $status]) {
                $homework = Homework::firstOrCreate(
                    ['tenant_id' => $tenant->id, 'class_id' => $demoStudent->class_id, 'title' => $title],
                    ['course_id' => $courses[$index % 4]->id, 'description' => 'Complete this assignment and submit your work.', 'due_at' => Carbon::now()->addDays($index - 2)],
                );
                HomeworkSubmission::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'homework_id' => $homework->id, 'student_id' => $demoStudent->id],
                    ['status' => $status, 'submitted_at' => $status === 'pending' ? null : Carbon::now()->subDays(1), 'text' => $status === 'pending' ? null : 'Submitted for teacher review.'],
                );
            }

            foreach (range(0, 6) as $index) {
                Attendance::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'student_id' => $demoStudent->id, 'class_id' => $demoStudent->class_id, 'date' => $weekStart = Carbon::today()->subDays(6 - $index)->toDateString()],
                    ['status' => $index === 5 ? 'absent' : 'present', 'marked_by' => $staffUser->id],
                );
            }

            foreach ([
                ['sabaq','Surah 2','Ayah 142','excellent','Clear recitation'],
                ['sabqi','Surah 1','Ayah 1','good','Improve pace'],
                ['manzil','Surah 36','Ayah 83','excellent','Strong recall'],
                ['sabaq','Surah 3','Ayah 200','good','Revise makharij'],
                ['sabqi','Surah 67','Ayah 30','needs_work','Repeat pronunciation'],
            ] as $index => [$type,$from,$to,$rating,$remarks]) {
                HifzLog::create([
                    'student_id' => $demoStudent->id,
                    'teacher_id' => $staffUser->id,
                    'date' => Carbon::today()->subDays($index),
                    'type' => $type,
                    'from_ref' => $from,
                    'to_ref' => $to,
                    'rating' => $rating,
                    'remarks' => $remarks,
                ]);
            }

            PointEvent::create(['student_id' => $demoStudent->id, 'points' => 120, 'reason' => 'Homework on time', 'date' => Carbon::today()]);
            PointEvent::create(['student_id' => $demoStudent->id, 'points' => 80, 'reason' => 'Attendance streak', 'date' => Carbon::today()->subDays(2)]);
            PointEvent::create(['student_id' => $demoStudent->id, 'points' => 95, 'reason' => 'Hifz target', 'date' => Carbon::today()->subDays(4)]);

            foreach ([
                ['behaviour','Shows respect and helps classmates.'],
                ['cleanliness','Maintains a tidy desk and classroom area.'],
                ['punctuality','Arrives prepared for daily assembly.'],
            ] as [$category,$body]) {
                StudentRemark::create(['student_id' => $demoStudent->id, 'teacher_id' => $staffUser->id, 'category' => $category, 'body' => $body, 'date' => Carbon::today()]);
            }

            LeaveRequest::create(['student_id' => $demoStudent->id, 'from_date' => Carbon::today()->addDays(3), 'to_date' => Carbon::today()->addDays(4), 'reason' => 'Family event', 'status' => 'pending']);

            foreach ([
                ['notes','Daily Nazra Notes'], ['books','Library Reading'], ['files','Shared Worksheets'],
                ['past_papers','Past Exam Papers'], ['audio','Tajweed Audio'], ['forms','Leave Application'],
            ] as $index => [$category,$title]) {
                Resource::create(['class_id' => $demoStudent->class_id, 'category' => $category, 'title' => $title, 'file_path' => 'demo/resource-'.$index.'.pdf', 'uploaded_by' => $staffUser->id]);
            }

            foreach ([
                ['محمد اکرم', 'message', 'Hifz revision', 'My son is finding it difficult to revise Surah 67. Please advise.'],
                ['علی احمد', 'whatsapp', 'Homework help', 'Please share the worksheet discussed in today’s class.'],
                ['فاروق احمد', 'email', 'Attendance question', 'Could you confirm whether my child was marked present today?'],
            ] as $index => [$guardian, $channel, $subject, $body]) {
                DB::table('parent_messages')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'class_id' => $demoStudent->class_id, 'student_id' => $demoStudent->id, 'guardian_name' => $guardian, 'subject' => $subject],
                    ['channel' => $channel, 'body' => $body, 'direction' => 'in', 'read_at' => null, 'replied_to_id' => null, 'created_at' => Carbon::now()->subMinutes(30 * ($index + 1)), 'updated_at' => now()],
                );
            }

            foreach ([
                ['Question','Tajweed revision'],
                ['Answer','Homework guidance'],
                ['Notice','Friday assembly'],
            ] as $index => [$tag,$title]) {
                $thread = Thread::create(['class_id' => $demoStudent->class_id, 'author_id' => $staffUser->id, 'tag' => strtolower($tag), 'title' => $title]);
                ThreadMessage::create(['thread_id' => $thread->id, 'author_id' => $staffUser->id, 'body' => 'Please prepare and bring your revision notes.']);
            }
        }

        // ── 11. Notices ──────────────────────────────────────────────────
        $noticeData = [
            [
                'title'        => 'سالانہ امتحان کا آغاز ۱۵ فروری سے',
                'body'         => 'تمام طلبہ کو اطلاع دی جاتی ہے کہ سالانہ امتحانات ۱۵ فروری ۲۰۲۶ سے شروع ہوں گے۔ تمام طلبہ وقت پر حاضر ہوں اور اپنی رول سلپ ساتھ لائیں۔',
                'type'         => 'exam',
                'is_published' => true,
                'published_at' => Carbon::today()->subDays(5)->toDateString(),
            ],
            [
                'title'        => 'ماہانہ فیس جمع کرانے کی آخری تاریخ',
                'body'         => 'جنوری ۲۰۲۶ کی ماہانہ فیس جمع کرانے کی آخری تاریخ ۳۱ جنوری ہے۔ تاخیر پر جرمانہ عائد ہوگا۔',
                'type'         => 'fee',
                'is_published' => true,
                'published_at' => Carbon::today()->subDays(10)->toDateString(),
            ],
            [
                'title'        => 'نئے داخلوں کا اعلان — سیشن ۲۰۲۶',
                'body'         => 'مدرسہ دارِ ارقم میں سیشن ۲۰۲۶–۲۰۲۷ کے لیے داخلے شروع ہوگئے ہیں۔ درخواست فارم آفس سے حاصل کریں۔',
                'type'         => 'admission',
                'is_published' => true,
                'published_at' => Carbon::today()->subDays(14)->toDateString(),
            ],
            [
                'title'        => 'جمعۃ المبارک کی وجہ سے چھٹی',
                'body'         => 'ہر جمعہ کو مدرسے میں تعلیمی تعطیل رہے گی۔ تمام طلبہ گھروں میں اپنا سبق یاد کریں۔',
                'type'         => 'holiday',
                'is_published' => true,
                'published_at' => Carbon::today()->subDays(2)->toDateString(),
            ],
            [
                'title'        => 'والدین کے ساتھ ملاقات — ۲۰ جنوری',
                'body'         => 'تمام والدین کو درخواست ہے کہ ۲۰ جنوری ۲۰۲۶ کو مدرسے میں تشریف لائیں اور اپنے بچوں کی تعلیمی کارکردگی کے بارے میں اساتذہ سے گفتگو کریں۔',
                'type'         => 'general',
                'is_published' => true,
                'published_at' => Carbon::today()->subDay()->toDateString(),
            ],
            [
                'title'        => 'ہفتہ وار ٹیسٹ — ہر ہفتے ہفتہ کو',
                'body'         => 'تمام کلاسوں میں ہفتہ وار ٹیسٹ ہر ہفتہ کے دن صبح ۸ بجے لیا جائے گا۔ طلبہ اپنا سبق تیار رکھیں۔',
                'type'         => 'exam',
                'is_published' => true,
                'published_at' => Carbon::today()->toDateString(),
            ],
            [
                'title'        => 'فوری اطلاع: کل مدرسہ بند رہے گا',
                'body'         => 'علاقے میں بارش کی پیش گوئی کی وجہ سے کل مدرسہ بند رہے گا۔ اگلے دن معمول کے مطابق کلاسیں ہوں گی۔',
                'type'         => 'urgent',
                'is_published' => false,
                'published_at' => null,
            ],
        ];

        foreach ($noticeData as $nd) {
            Notice::firstOrCreate(
                ['tenant_id' => $tenant->id, 'title' => $nd['title']],
                array_merge($nd, ['created_by' => $adminUser->id]),
            );
        }

        $this->command?->info('  ✓ Notices posted.');

        $this->command?->info('');
        $this->command?->info('══════════════════════════════════════════');
        $this->command?->info('  Demo data seeded successfully!');
        $this->command?->info('');
        $this->command?->info('  Login credentials (password: password)');
        $this->command?->info('  Admin   : admin@darearqam.test');
        $this->command?->info('  Staff   : teacher@darearqam.test');
        $this->command?->info('  Student : student@darearqam.test');
        $this->command?->info('  Parent  : parent@darearqam.test');
        $this->command?->info('══════════════════════════════════════════');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function upsertUser(
        string $email,
        string $name,
        string $role,
        Tenant $tenant,
        bool $isParent = false,
    ): User {
        $user = User::firstOrNew(['email' => $email]);
        $user->name              = $name;
        $user->password          = Hash::make(self::PASSWORD);
        $user->email_verified_at = Carbon::now();
        $user->is_parent_account = $isParent;
        $user->save();

        if (! $tenant->users()->whereKey($user->id)->exists()) {
            $tenant->users()->attach($user->id, ['role' => $role]);
        }

        return $user;
    }
}
