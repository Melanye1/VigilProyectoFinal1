<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
 public function store(LoginRequest $request) 
{
    // 1. Autentica las credenciales
    $request->authenticate();

    // 2. VALIDACIÓN DEL ESTADO (Aquí es donde el sistema "observa" si está activo)
    if (Auth::user()->activo == 0) {
        Auth::guard('web')->logout(); // Cierra la sesión inmediatamente
        
        return response()->json([
            'status' => 'error',
            'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        ], 403); // 403 Forbidden
    }

    // 3. Si es activo, regenera la sesión y continúa
    $request->session()->regenerate();

    return response()->json([
        'status' => 'success',
        'message' => 'Sesión iniciada correctamente.'
    ], 200);
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
