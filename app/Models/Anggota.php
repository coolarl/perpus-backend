<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anggota extends Model
{
    use HasFactory;
    protected $guarded = [];

    // Tambahkan 2 fungsi ini:
    public function kunjungan()
    {
        return $this->hasMany(Kunjungan::class);
    }

    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class);
    }
}