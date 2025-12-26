<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Optional: block banned users
        if (($user->is_banned ?? false) === true) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Your account has been banned.',
            ]);
        }

        /**
         * If email verification is enabled:
         * - not verified users should be redirected to verification notice
         * NOTE: 'verified' middleware will also protect routes,
         * but this makes UX cleaner after login.
         */
        if (method_exists($user, 'hasVerifiedEmail') && !$user->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        // ✅ Admin redirect
        if (($user->role ?? null) === 'admin') {
            // If you set admin routes: name('admin.dashboard')
            if (Route::has('admin.dashboard')) {
                return redirect()->intended(route('admin.dashboard'));
            }

            // fallback if route name not present
            return redirect()->intended('/admin');
        }

        // Default redirect (reader/author)
        return redirect()->intended(route('home'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
