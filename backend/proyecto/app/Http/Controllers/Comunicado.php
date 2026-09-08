<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comunicado as ComunicadoModel;
class Comunicado extends Controller
{
public function index()
    {
        // Esto evita que busque el método dentro del controlador
        $comunicados = ComunicadoModel::orderBy('id', 'desc')->get();
        return response()->json($comunicados, 200);
    }

    /**
     * Guardar un nuevo comunicado (POST)
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'cuerpo' => 'required|string',
            'usuario_creador' => 'required|string|max:255',
        ]);

        $comunicado = ComunicadoModel::create($request->all());
        return response()->json($comunicado, 201);
    }

    /**
     * Actualizar un comunicado existente (PUT)
     */
    public function update(Request $request, $id)
    {
        $comunicado = ComunicadoModel::find($id);
        if (!$comunicado) {
            return response()->json(['message' => 'Comunicado no encontrado'], 404);
        }

        $comunicado->update($request->all());
        return response()->json($comunicado, 200);
    }

    /**
     * Eliminar un comunicado (DELETE)
     */
    public function destroy($id)
    {
        $comunicado = ComunicadoModel::find($id);
        if (!$comunicado) {
            return response()->json(['message' => 'Comunicado no encontrado'], 404);
        }

        $comunicado->delete();
        return response()->json(['message' => 'Eliminado con éxito'], 200);
    }
}
