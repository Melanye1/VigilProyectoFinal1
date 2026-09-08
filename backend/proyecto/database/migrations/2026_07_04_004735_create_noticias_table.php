<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
 public function up(): void
    {
        Schema::create('noticias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('cuerpo');
            $table->string('imagen'); // Guarda solo el nombre del archivo .webp (ej: abc123xyz.webp)
            $table->boolean('es_destacada')->default(false); // Define si va al banner principal o a recientes
            $table->timestamps(); // Genera automatically 'created_at' y 'updated_at'
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('noticias');
    }
};
