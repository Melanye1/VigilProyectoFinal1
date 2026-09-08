<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactMessage;
class ContactMessageController extends Controller
{
public function store(Request $request) {
    // 1. Guardar en la base de datos
    $msg = ContactMessage::create($request->all());
    
    // 2. Retornar éxito
    return response()->json(['success' => true]);
}

// app/Http/Controllers/ContactMessageController.php
public function index()
    {
        try {
            $mensajes = ContactMessage::all();
            return response()->json($mensajes);
        } catch (\Exception $e) {
            // Esto te devolverá el error exacto si algo falla
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
