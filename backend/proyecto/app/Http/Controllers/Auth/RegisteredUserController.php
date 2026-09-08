<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
public function store(LoginRequest $request)
{
    // 1. Primero autenticamos las credenciales normales
    $request->authenticate();

    // 2. UNA VEZ AUTENTICADO, verificamos el estado
    if (auth()->user()->activo == 0) {
        auth()->logout(); // Cerramos la sesión inmediatamente
        
        // Retornamos un error específico
        throw \Illuminate\Validation\ValidationException::withMessages([
            'email' => 'Tu cuenta ha sido desactivada. Contacta al administrador.',
        ]);
    }

    $request->session()->regenerate();

    return redirect()->intended(RouteServiceProvider::HOME);
}
    public function index() {
        return response()->json(User::all());
    }

    // Obtener un usuario específico
    public function show($id) {
        return response()->json(User::findOrFail($id));
    }

    // Actualizar usuario
    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        
        if (!empty($request->password)) {
            $user->password = Hash::make($request->password);
        }
        
        $user->save();
        return response()->json(['message' => 'Usuario actualizado']);
    }

  // En tu controlador de toggle
public function toggleStatus(Request $request, $id) {
    $user = User::findOrFail($id);
    $user->activo = $request->activo;
    $user->save();

    // Lógica extra: Si lo acabas de desactivar, forzar cierre de sesión
    if ($user->activo == 0) {
        // Esto invalida las sesiones del usuario si usas el driver 'database'
        \Illuminate\Support\Facades\DB::table('sessions')->where('user_id', $user->id)->delete();
    }

    return response()->json(['message' => 'Estado cambiado']);
}

    // Eliminar usuario
    public function destroy($id) {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}