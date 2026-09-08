<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
class Noticia extends Model
{
   

    use HasFactory;

    protected $fillable = ['titulo', 'cuerpo', 'imagen', 'es_destacada'];

   
    public function getMesAnioAttribute()
    {
        return Carbon::parse($this->created_at)->locale('es')->isoFormat('MMM YYYY');
    }

 
    public function getDiaAttribute()
    {
        return Carbon::parse($this->created_at)->format('d');
    }
}
