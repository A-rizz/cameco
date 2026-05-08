<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PasswordRequestsController extends Controller
{
    /**
     * Show all pending and historical password reset requests.
     */
    public function index()
    {
        $requests = PasswordResetRequest::with('user')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'user_id'      => $r->user_id,
                'user_name'    => $r->user?->name,
                'user_email'   => $r->user?->email,
                'status'       => $r->status,
                'reason'       => $r->reason,
                'processed_at' => $r->processed_at,
                'created_at'   => $r->created_at,
            ]);

        return Inertia::render('Admin/PasswordResetRequests', [
            'requests' => $requests,
        ]);
    }

    /**
     * Generate a new random password for the user and mark the request done.
     */
    public function process(Request $request, PasswordResetRequest $passwordRequest)
    {
        if ($passwordRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $newPassword = Str::password(12, true, true, false);

        $user = User::findOrFail($passwordRequest->user_id);
        $user->update(['password' => Hash::make($newPassword)]);

        $passwordRequest->update([
            'status'       => 'completed',
            'processed_at' => now(),
            'processed_by' => $request->user()->id,
        ]);

        return back()->with([
            'success'      => "Password reset for {$user->name}.",
            'new_password' => $newPassword, // shown once in the UI
        ]);
    }

    /**
     * Reject a request without changing the password.
     */
    public function reject(Request $request, PasswordResetRequest $passwordRequest)
    {
        if ($passwordRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been processed.');
        }

        $passwordRequest->update([
            'status'       => 'rejected',
            'reason'       => $request->input('reason'),
            'processed_at' => now(),
            'processed_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Request rejected.');
    }
}
