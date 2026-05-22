<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PasswordResetRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // Check if there's already a pending request
        $existing = \App\Models\PasswordResetRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('status', 'You already have a pending reset request. Please wait for the superadmin to process it.');
        }

        \App\Models\PasswordResetRequest::create([
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        return back()->with('status', 'Your password reset request has been sent to the superadmin.');
    }}
