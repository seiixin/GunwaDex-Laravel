<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        // supports your enum('reader','author','admin')
        if (($user->role ?? null) !== 'admin') {
            abort(403, 'Admins only.');
        }

        // Optional: block banned users
        if (($user->is_banned ?? false) === true) {
            abort(403, 'Account is banned.');
        }

        return $next($request);
    }
}
