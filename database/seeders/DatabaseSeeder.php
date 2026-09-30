<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Buku;
use App\Models\Anggota;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        User::create([
            'name' => 'Super Admin',
            'username' => 'admin',
            'email' => 'admin@perpus.com',
            'password' => Hash::make('rahasia123'), 
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Petugas Jaga',
            'username' => 'petugas',
            'email' => 'petugas@perpus.com',
            'password' => Hash::make('rahasia123'),
            'role' => 'petugas'
        ]);

    }
}