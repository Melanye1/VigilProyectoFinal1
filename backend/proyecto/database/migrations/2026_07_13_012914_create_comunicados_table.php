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
    Schema::create('comunicados', function (Blueprint $table) {
        $table->id();
        $table->string('titulo');
        $table->text('cuerpo');
        $table->string('usuario_creador'); // <-- Agregamos el nombre del administrador que lo creó
        $table->timestamps(); // <-- Esto genera 'created_at' (fecha y hora exacta de creación)
    });
}
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comunicados');
    }
};
