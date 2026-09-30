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
       Schema::create('kunjungan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('anggota_id')->constrained('anggotas')->onDelete('cascade');
        $table->enum('tujuan', ['membaca', 'meminjam', 'mengembalikan']);
        $table->timestamps(); 
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungans');
    }
};
