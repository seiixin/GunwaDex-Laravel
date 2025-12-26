<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'alpha_dash',
                'unique:users,username',
            ],
            'display_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            // keep Laravel default name in sync
            'name' => $validated['display_name'],

            'username' => $validated['username'],
            'display_name' => $validated['display_name'],
            'role' => 'reader',

            'email' => $validated['email'],
            'password' => $validated['password'], // auto-hashed because of casts()
        ]);

        // email verification relies on this event
        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
