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
    public function up()
{
    Schema::create('comments', function (Blueprint $table) {
        $table->id();
        // Para armar el hilo: apunta al ID del comentario principal
        $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
        // 0 = Anónimo de la Web, 1 = Respuesta del Admin desde el Dashboard
        $table->boolean('is_admin')->default(false); 
        $table->text('content');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comments');
    }
};
