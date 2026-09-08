<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Galeria;
use Illuminate\Support\Facades\File;

class GaleriaController extends Controller
{
   // En GaleriaController.php
public function obtenerGaleriaAPI() {
    // latest() ordena por fecha, get() trae todo
    return response()->json(\App\Models\Galeria::latest()->get());
}
public function guardarFotoAPI(Request $request) 
{
    // Validar datos básicos
    $request->validate([
        'titulo' => 'required',
        'imagen' => 'required|image'
    ]);

    // Definir ruta
    $path = public_path('storage/galeria/');
    
    // Crear carpeta si no existe (usando ruta absoluta)
    if (!\Illuminate\Support\Facades\File::exists($path)) {
        \Illuminate\Support\Facades\File::makeDirectory($path, 0755, true);
    }

    // Procesar imagen
    $filename = time() . '.webp';
    $img = imagecreatefromstring(file_get_contents($request->file('imagen')->getRealPath()));
    imagewebp($img, $path . $filename, 75);
    imagedestroy($img);

    // Guardar en BD (incluyendo 'estado' para evitar el error de campo obligatorio)
    \App\Models\Galeria::create([
        'titulo' => $request->titulo,
        'imagen' => $filename,
        'estado' => 'Publicada' 
    ]);

    return response()->json(['success' => true]);
}
}
