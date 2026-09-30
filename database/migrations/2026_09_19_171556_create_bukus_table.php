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
       Schema::create('bukus', function (Blueprint $table) {
        $table->id();
        $table->string('kode_buku', 20)->unique();
        $table->string('judul');
        $table->enum('kategori', ['lks_paket', 'referensi', 'karya_fiksi']); 
        $table->string('penulis')->nullable();
        $table->string('penerbit')->nullable();
        $table->year('tahun_terbit')->nullable();
        $table->enum('status', ['tersedia', 'dipinjam', 'hilang'])->default('tersedia'); 
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bukus');
    }
};
