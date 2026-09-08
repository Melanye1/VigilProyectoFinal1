<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Excepciones del Registro
        'register',
        'http://127.0.0.1:8000/register',
        '*register*',
'comentarios/anonimo','comunicados','/comunicados',
'comentarios/*',
        // Excepciones del Login
        'login',
        'http://127.0.0.1:8000/login','galeria',
        'galeria/*',
        '*login*', 'usuarios/*',
'comunicados/*','mensajes',
        // 🔥 EXCEPCIONES PARA EL MÓDULO DE NOTICIAS (WEB.PHP)
        'noticias',          // Libera el guardar (POST /noticias)
        'noticias/*',        // 🔥 CLAVE: Libera actualizar y borrar (POST o DELETE /noticias/2)
        '*noticias*',        // Cobertura global por si acaso

        'v1/*', 
    ];}