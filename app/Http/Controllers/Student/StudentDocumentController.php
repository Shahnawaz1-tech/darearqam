<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Result;
use App\Models\Student;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class StudentDocumentController extends Controller
{
    public function idCard(): Response
    {
        $student = $this->student();
        $className = $student->class?->name ?? 'Student';
        $lines = ['MADRASA DAR-E-ARQAM GURGURI', 'STUDENT ID CARD', 'Name: '.$student->name, 'Roll: '.($student->roll_number ?? '-'), 'Class: '.$className];
        return $this->pdf($lines, 'student-id-card.pdf');
    }

    public function result(Exam $exam): Response
    {
        $student = $this->student();
        abort_unless($exam->is_published && (int) $exam->class_id === (int) $student->class_id, 404);
        $results = Result::query()->with('subject')->where('exam_id', $exam->id)->where('student_id', $student->id)->get();
        abort_if($results->isEmpty(), 404);
        $lines = ['MADRASA DAR-E-ARQAM GURGURI', 'RESULT CARD: '.$exam->title, 'Student: '.$student->name];
        foreach ($results as $result) {
            $lines[] = ($result->subject?->name ?? 'Subject').': '.$result->marks_obtained.' / '.($result->subject?->total_marks ?? 0);
        }
        return $this->pdf($lines, 'result-card-'.$exam->id.'.pdf');
    }

    private function student(): Student
    {
        $student = Student::query()->where('user_id', auth()->id())->first();
        abort_unless($student !== null, 403);
        return $student;
    }

    /** Generates a small text-only PDF without adding a package dependency. */
    private function pdf(array $lines, string $filename): Response
    {
        $text = "BT\n/F1 16 Tf\n50 790 Td\n";
        foreach ($lines as $index => $line) {
            $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $line) ?: 'Student record';
            $ascii = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $ascii);
            if ($index > 0) $text .= "0 -28 Td\n/F1 12 Tf\n";
            $text .= '('.$ascii.") Tj\n";
        }
        $text .= "ET";
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($text).">>\nstream\n{$text}\nendstream",
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n{$object}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) $pdf .= sprintf('%010d 00000 n ', $offset)."\n";
        $pdf .= 'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
        return response($pdf, 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.$filename.'"']);
    }
}
