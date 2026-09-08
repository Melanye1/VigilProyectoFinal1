<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;
    

    protected $fillable = ['parent_id', 'is_admin', 'content','respuesta_admin'];

    /**
     * Obtiene las respuestas asociadas a este comentario (El hilo).
     */
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    /**
     * Obtiene el comentario padre al que pertenece esta respuesta (opcional).
     */
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }
}
