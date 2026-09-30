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
       Schema::create('peminjaman', function (Blueprint $table) {
        $table->id();
        // Foreign key ke anggota dan buku
        $table->foreignId('anggota_id')->constrained('anggotas')->onDelete('cascade');
        $table->foreignId('buku_id')->constrained('bukus')->onDelete('cascade');
        
        $table->date('tanggal_pinjam');
        $table->date('tenggat_waktu');
        $table->date('tanggal_dikembalikan')->nullable(); // Kosong jika belum dikembalikan
        
        $table->enum('status', ['dipinjam', 'dikembalikan', 'terlambat'])->default('dipinjam');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjamen');
    }
};
