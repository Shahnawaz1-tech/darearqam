<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Handle a contact form submission from the welcome page.
     *
     * Currently logs the message and flashes a success indicator back to the
     * page. Replace the logger call with Mail::to(...)->send(...) or any other
     * notification once the mail driver is configured.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'phone'   => ['required', 'string', 'max:30'],
            'topic'   => ['required', 'string', 'max:50'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        // TODO: dispatch a notification or queued job here, e.g.:
        // Mail::to(config('mail.from.address'))->send(new ContactMessage($validated));
        // For now, log it so nothing is silently lost.
        logger()->info('Welcome page contact form submission', $validated);

        return back()->with('contact_success', true);
    }
}
