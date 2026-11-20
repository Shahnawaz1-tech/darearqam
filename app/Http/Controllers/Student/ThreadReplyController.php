<?php
namespace App\Http\Controllers\Student;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ReplyThreadRequest;
use App\Models\Student;
use App\Models\Thread;
use App\Models\ThreadMessage;
use Illuminate\Http\RedirectResponse;
class ThreadReplyController extends Controller
{
    public function __invoke(ReplyThreadRequest $request, Thread $thread): RedirectResponse
    {
        $student=Student::where('user_id',$request->user()->id)->firstOrFail();
        abort_unless($thread->class_id===null || (int)$thread->class_id === (int)$student->class_id,403);
        ThreadMessage::create(['thread_id'=>$thread->id,'author_id'=>$request->user()->id,'body'=>$request->validated('body')]);
        return back()->with('success','Reply posted.');
    }
}
