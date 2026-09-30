<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            // Tambahkan kolom tanggal_kembali (boleh kosong/nullable karena kalau lagi dipinjam ya belum ada tanggal baliknya)
            $table->date('tanggal_kembali')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropColumn('tanggal_kembali');
        });
    }
};