<?php
namespace App\Http\Controllers\Student;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SubmitHomeworkRequest;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
class HomeworkSubmissionController extends Controller
{
    public function __invoke(SubmitHomeworkRequest $request, Homework $homework): RedirectResponse
    {
        $student=Student::where('user_id',$request->user()->id)->firstOrFail();
        abort_unless((int)$homework->class_id === (int)$student->class_id,403);
        $path=$request->file('file')?->store('student/homework','public');
        HomeworkSubmission::updateOrCreate(
            ['homework_id'=>$homework->id,'student_id'=>$student->id],
            ['tenant_id'=>app(\App\Tenancy\TenantContext::class)->current()->id,'status'=>now()->lt($homework->due_at)?'submitted':'late','submitted_at'=>now(),'file_path'=>$path,'text'=>$request->validated('text')]
        );
        return back()->with('success','Homework submitted.');
    }
}
