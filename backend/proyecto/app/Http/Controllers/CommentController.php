<?php

namespace App\Http\Controllers;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
 public function indexApi()
{
    $comments = Comment::whereNull('parent_id')
                        ->with('replies')
                        ->latest()
                        ->get();

    return response()->json($comments);
}
public function destroy($id)
{
    $comentario = Comment::findOrFail($id);
    $comentario->delete();

    return response()->json([
        'status' => 'success',
        'message' => 'Comentario eliminado correctamente'
    ], 200);
}
/**
 * Guarda el comentario anónimo enviado desde el HTML Puro
 */
public function storeAnonymousApi(Request $request)
{
    $request->validate([
        'content' => 'required|string|max:500',
    ]);

    $comment = Comment::create([
        'content' => $request->content,
        'parent_id' => null,
        'is_admin' => false,
    ]);

   return response()->json($comment, 201); // 👈 ¡Cambia el 21 por 201!
}
public function responderAdmin(Request $request, $id)
{
    // Validamos el campo que viene desde el JavaScript
    $request->validate([
        'respuesta_admin' => 'required|string|max:1000'
    ]);

    // Buscamos el comentario por su ID
   $comentario = Comment::findOrFail($id);

    // Asignamos la respuesta y guardamos
    $comentario->respuesta_admin = $request->respuesta_admin;
    $comentario->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Respuesta añadida correctamente',
        'data' => $comentario
    ], 200);
}
}
