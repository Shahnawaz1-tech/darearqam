<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoticeController extends Controller
{
    public function index(): Response
    {
        $notices = Notice::latest('published_at')
            ->get(['id', 'title', 'body', 'type', 'is_published', 'published_at'])
            ->map(fn ($n) => [
                'id'           => $n->id,
                'title'        => $n->title,
                'body'         => $n->body,
                'type'         => $n->type,
                'is_published' => $n->is_published,
                'published_at' => $n->published_at?->toDateString(),
            ]);

        return Inertia::render('admin/notices', ['notices' => $notices]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:200'],
            'body'         => ['nullable', 'string', 'max:5000'],
            'type'         => ['required', 'in:general,exam,holiday,fee,admission,urgent'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        Notice::create($validated + ['created_by' => $request->user()->id]);

        return back()->with('success', 'Notice published.');
    }

    public function update(Request $request, Notice $notice): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:200'],
            'body'         => ['nullable', 'string', 'max:5000'],
            'type'         => ['required', 'in:general,exam,holiday,fee,admission,urgent'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
        ]);

        $notice->update($validated);
        return back()->with('success', 'Notice updated.');
    }

    public function destroy(Notice $notice): RedirectResponse
    {
        $notice->delete();
        return back()->with('success', 'Notice deleted.');
    }
}
