<?php
namespace App\Http\Controllers\Student;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreLeaveRequest;
use App\Models\LeaveRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
class LeaveRequestController extends Controller
{
    public function __invoke(StoreLeaveRequest $request): RedirectResponse
    {
        $student=Student::where('user_id',$request->user()->id)->firstOrFail();
        LeaveRequest::create(['student_id'=>$student->id,'from_date'=>$request->validated('from'),'to_date'=>$request->validated('to'),'reason'=>$request->validated('reason'),'status'=>'pending']);
        return back()->with('success','Leave request submitted.');
    }
}
