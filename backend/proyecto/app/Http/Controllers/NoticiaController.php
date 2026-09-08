<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Noticia;
class NoticiaController extends Controller
{
 public function obtenerNoticasAPI()
    {
        $noticiaDestacada = Noticia::where('es_destacada', true)->latest()->first();
        $noticiasRecientes = Noticia::where('id', '!=', $noticiaDestacada?->id)->latest()->get();

        return response()->json([
            'destacada' => $noticiaDestacada,
            'recientes' => $noticiasRecientes
        ]);
    }

    // 2. GUARDAR NUEVA NOTICIA
    public function guardarNoticiaAPI(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'cuerpo' => 'required|string',
            'imagen' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        try {
            $noticia = new Noticia();
            $noticia->titulo = $request->input('titulo');
            $noticia->cuerpo = $request->input('cuerpo');
            $noticia->es_destacada = false;

            if ($request->hasFile('imagen')) {
                $file = $request->file('imagen');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('storage/imagenes'), $filename);
                $noticia->imagen = $filename;
            }

            $noticia->save();
            return response()->json(['success' => true, 'message' => 'Noticia guardada con éxito']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al guardar', 'error' => $e->getMessage()], 500);
        }
    }

 
// 3. ACTUALIZAR NOTICIA EXISTENTE
    public function actualizarNoticiaAPI(Request $request, $id)
    {
        $noticia = Noticia::find($id);
        if (!$noticia) {
            return response()->json(['success' => false, 'message' => 'Noticia no encontrada'], 404);
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'cuerpo' => 'required|string',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        try {
            $noticia->titulo = $request->input('titulo');
            $noticia->cuerpo = $request->input('cuerpo');

            if ($request->hasFile('imagen')) {
                // Usamos funciones nativas de PHP limpias
                if (!empty($noticia->imagen)) {
                    $rutaVieja = public_path('storage/imagenes/' . $noticia->imagen);
                    if (is_file($rutaVieja)) {
                        @unlink($rutaVieja); // Borra el archivo viejo de forma segura
                    }
                }

                $file = $request->file('imagen');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('storage/imagenes'), $filename);
                $noticia->imagen = $filename;
            }

            $noticia->save();
            return response()->json(['success' => true, 'message' => 'Noticia actualizada con éxito']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }

    // 4. ELIMINAR NOTICIA PERMANENTEMENTE
    public function eliminarNoticiaAPI($id)
    {
        $noticia = Noticia::find($id);
        if (!$noticia) {
            return response()->json(['success' => false, 'message' => 'Noticia no encontrada'], 404);
        }

        try {
            // Eliminación física usando PHP puro sin importar clases
            if (!empty($noticia->imagen)) {
                $rutaImagen = public_path('storage/imagenes/' . $noticia->imagen);
                if (is_file($rutaImagen)) {
                    @unlink($rutaImagen); // Elimina el archivo del disco
                }
            }

            $noticia->delete();
            return response()->json(['success' => true, 'message' => 'Noticia eliminada correctamente']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }
}
