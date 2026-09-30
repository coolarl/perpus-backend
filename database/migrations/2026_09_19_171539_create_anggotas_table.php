<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('anggotas', function (Blueprint $table) {
        $table->id();
        // Menggunakan string karena NIS/NIP bisa diawali angka 0
        $table->string('nomor_induk', 30)->unique(); 
        $table->string('nama_lengkap');
        // Membedakan pengunjung sesuai flowchart
        $table->enum('tipe', ['guru', 'siswa']); 
        $table->boolean('status_aktif')->default(true); 
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggotas');
    }
};
