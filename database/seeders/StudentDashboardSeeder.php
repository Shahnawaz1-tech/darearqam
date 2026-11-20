<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StudentDashboardSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        $tenant = Tenant::query()->where('name', 'Dar-e-Arqam Demo Madrasa')->first();
        $user = User::query()->where('email', 'student@darearqam.test')->first();
        if (! $tenant || ! $user) {
            $this->command?->warn('Student dashboard samples skipped; run the madrasa demo seeder first.');
            return;
        }

        $student = DB::table('students')->where('tenant_id', $tenant->id)->where('status', 'active')->orderBy('id')->first();
        $teacher = DB::table('tenant_user')->where('tenant_id', $tenant->id)->whereIn('role', ['staff', 'member'])->value('user_id');
        if (! $student || ! $student->class_id) {
            return;
        }
        DB::table('students')->where('id', $student->id)->update(['user_id' => $user->id]);

        $now = Carbon::now('Asia/Karachi');
        $tenantId = $tenant->id;
        $classId = $student->class_id;
        $courses = [];
        foreach ([
            ['قرآنِ کریم', ['Quran', 'Tajweed'], 72],
            ['حفظ القرآن', ['Hifz', 'Revision'], 48],
            ['فقہ اسلامی', ['Fiqh', 'Dars-e-Nizami'], 64],
            ['عربی زبان', ['Arabic', 'Grammar'], 37],
        ] as [$title, $tags, $percent]) {
            DB::table('courses')->updateOrInsert(
                ['tenant_id' => $tenantId, 'class_id' => $classId, 'title' => $title],
                ['teacher_id' => $teacher, 'cover_path' => null, 'tags' => json_encode($tags), 'updated_at' => $now, 'created_at' => $now],
            );
            $courseId = DB::table('courses')->where('tenant_id', $tenantId)->where('class_id', $classId)->where('title', $title)->value('id');
            $courses[] = ['id' => $courseId, 'title' => $title, 'percent' => $percent];
            DB::table('course_progress')->updateOrInsert(
                ['tenant_id' => $tenantId, 'student_id' => $student->id, 'course_id' => $courseId],
                ['percent' => $percent, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        $weekday = $now->dayOfWeek;
        $slotTitles = ['تجوید', 'قرآنِ کریم', 'فقہ', 'عربی'];
        foreach ($slotTitles as $index => $title) {
            $courseId = $courses[$index % count($courses)]['id'];
            $start = $now->copy()->addMinutes(20 + ($index * 70));
            DB::table('timetable_slots')->updateOrInsert(
                ['tenant_id' => $tenantId, 'class_id' => $classId, 'weekday' => $weekday, 'room' => 'کمرہ '.($index + 1)],
                ['course_id' => $courseId, 'starts_at' => $start->format('H:i:s'), 'ends_at' => $start->copy()->addHour()->format('H:i:s'), 'teacher_id' => $teacher, 'live_url' => null, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        foreach ([
            ['مشقِ قرآن', 'سورۃ الملک کی تلاوت دہرائیں۔', 1, 'pending'],
            ['تجوید کا سبق', 'قواعدِ مد کی مشق مکمل کریں۔', 2, 'submitted'],
            ['فقہ کا خلاصہ', 'باب الطہارہ کے اہم نکات لکھیں۔', 3, 'late'],
            ['عربی الفاظ', 'سبق کے نئے الفاظ یاد کریں۔', 4, 'graded'],
            ['حفظ کی دہرائی', 'آج کا منزل سبق دہرائیں۔', 5, 'pending'],
            ['مختصر سوالات', 'سبق کے سوالات کے جواب لکھیں۔', 6, 'pending'],
        ] as $index => [$title, $description, $days, $status]) {
            DB::table('homework')->updateOrInsert(
                ['tenant_id' => $tenantId, 'class_id' => $classId, 'title' => $title],
                ['course_id' => $courses[$index % count($courses)]['id'], 'description' => $description, 'due_at' => $now->copy()->addDays($days)->setTime(17, 0), 'attachment_path' => null, 'updated_at' => $now, 'created_at' => $now],
            );
            $homeworkId = DB::table('homework')->where('tenant_id', $tenantId)->where('class_id', $classId)->where('title', $title)->value('id');
            DB::table('homework_submissions')->updateOrInsert(
                ['tenant_id' => $tenantId, 'homework_id' => $homeworkId, 'student_id' => $student->id],
                ['status' => $status, 'submitted_at' => in_array($status, ['submitted', 'graded']) ? $now->copy()->subDay() : null, 'file_path' => null, 'text' => null, 'marks' => $status === 'graded' ? 18 : null, 'feedback' => $status === 'graded' ? 'اچھی کوشش۔' : null, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        foreach ([
            ['استاد سے سوال', 'کیا اگلے سبق میں بھی یہ قاعدہ شامل ہوگا؟', 'question'],
            ['سبق کی رہنمائی', 'کل کے سبق کے لیے صفحہ ۱۲ بھی دہرائیں۔', 'notice'],
            ['اچھی پیش رفت', 'اس ہفتے حفظ کی دہرائی بہتر رہی۔', 'answer'],
        ] as [$title, $message, $tag]) {
            DB::table('threads')->updateOrInsert(
                ['tenant_id' => $tenantId, 'class_id' => $classId, 'title' => $title],
                ['author_id' => $teacher, 'tag' => $tag, 'updated_at' => $now, 'created_at' => $now],
            );
            $threadId = DB::table('threads')->where('tenant_id', $tenantId)->where('class_id', $classId)->where('title', $title)->value('id');
            DB::table('thread_messages')->updateOrInsert(
                ['tenant_id' => $tenantId, 'thread_id' => $threadId, 'author_id' => $teacher],
                ['body' => $message, 'tag' => $tag, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        $logSamples = [
            ['sabaq', 'پارہ ۲۹، سورۃ الملک آیت ۱', 'آیت ۱۰', 'excellent'],
            ['sabqi', 'پارہ ۲۸، سورۃ المجادلہ', 'سورۃ الحشر', 'good'],
            ['manzil', 'پارہ ۱، سورۃ البقرہ', 'آیت ۵۰', 'good'],
            ['sabaq', 'پارہ ۲۹، سورۃ الملک آیت ۱۱', 'آیت ۲۰', 'good'],
            ['sabqi', 'پارہ ۲۷، سورۃ الذاریات', 'سورۃ القمر', 'needs_work'],
        ];
        foreach ($logSamples as $index => [$type, $from, $to, $rating]) {
            $date = $now->copy()->subDays(4 - $index)->toDateString();
            DB::table('hifz_logs')->updateOrInsert(
                ['tenant_id' => $tenantId, 'student_id' => $student->id, 'date' => $date, 'type' => $type, 'from_ref' => $from],
                ['to_ref' => $to, 'rating' => $rating, 'remarks' => null, 'teacher_id' => $teacher, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        foreach ($courses as $index => $course) {
            DB::table('student_remarks')->updateOrInsert(
                ['tenant_id' => $tenantId, 'student_id' => $student->id, 'category' => ['رفتار', 'صفائی', 'وقت کی پابندی'][$index % 3], 'date' => $now->copy()->subDays($index)->toDateString()],
                ['teacher_id' => $teacher, 'body' => ['کلاس میں خوش اخلاقی کا مظاہرہ کیا۔', 'اپنی کتابوں کا اچھا خیال رکھتا ہے۔', 'وقت پر سبق میں شریک ہوتا ہے۔'][$index % 3], 'updated_at' => $now, 'created_at' => $now],
            );
        }

        foreach (['notes' => 'سبق کے نوٹس', 'books' => 'مطالعے کی کتاب', 'shared' => 'مشترکہ فائل', 'papers' => 'پرانے پرچے', 'audio' => 'تلاوت آڈیو', 'forms' => 'درخواست فارم'] as $category => $title) {
            DB::table('resources')->updateOrInsert(
                ['tenant_id' => $tenantId, 'class_id' => $classId, 'category' => $category, 'title' => $title],
                ['file_path' => 'resources/sample.pdf', 'uploaded_by' => $teacher, 'updated_at' => $now, 'created_at' => $now],
            );
        }

        foreach ([['حاضری کی پابندی', 10], ['سبق وقت پر مکمل کیا', 15], ['حفظ کا ہدف پورا کیا', 20]] as $index => [$reason, $points]) {
            DB::table('point_events')->updateOrInsert(
                ['tenant_id' => $tenantId, 'student_id' => $student->id, 'reason' => $reason],
                ['points' => $points, 'date' => $now->copy()->subDays($index)->toDateString(), 'updated_at' => $now, 'created_at' => $now],
            );
        }
    }
}
