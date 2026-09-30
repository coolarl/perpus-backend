<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('anggotas', function (Blueprint $table) {
            // Menambahkan kolom telepon dan alamat, boleh kosong (nullable)
            $table->string('telepon')->nullable()->after('nama_lengkap');
            $table->text('alamat')->nullable()->after('telepon');
        });
    }

    public function down()
    {
        Schema::table('anggotas', function (Blueprint $table) {
            // Kalau di-rollback, kolom ini dibuang
            $table->dropColumn(['telepon', 'alamat']);
        });
    }
};