<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserStatus
{


    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
  public function handle($request, Closure $next)
    {
        
        if (Auth::check() && Auth::user()->activo == 0) {
            Auth::logout(); 
            return redirect('/login')->withErrors([
                'email' => 'Tu cuenta está desactivada. Contacta al administrador.'
            ]);
        }

        return $next($request);
    }
    
}
