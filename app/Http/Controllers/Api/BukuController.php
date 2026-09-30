<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Buku;
use Illuminate\Http\Request;

class BukuController extends Controller
{
    // 1. Menampilkan Daftar Buku
    public function index()
    {
        // Mengambil semua data buku, diurutkan dari yang terbaru
        $buku = Buku::latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $buku
        ]);
    }

    // 2. Menyimpan Buku Baru
  public function store(Request $request)
    {
        // Validasi data yang masuk dari React
        $request->validate([
            // UBAH DI SINI: pastikan merujuk ke tabel 'bukus'
            'kode_buku' => 'required|unique:bukus', 
            'judul' => 'required',
            'kategori' => 'required|in:lks_paket,referensi,karya_fiksi',
        ]);

        // Simpan ke database
        $buku = Buku::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil ditambahkan!',
            'data' => $buku
        ], 201);
    }

    // 3. Menghapus Buku
    public function destroy($id)
    {
        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku tidak ditemukan'
            ], 404);
        }

        $buku->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil dihapus!'
        ]);
    }

    // 4. Mengubah Data Buku (Update)
    public function update(Request $request, $id)
    {
        $buku = Buku::find($id);

        if (!$buku) {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku tidak ditemukan'
            ], 404);
        }

        // Validasi data
        // Perhatikan kode_buku: kita tambahkan pengecualian ID agar bisa menyimpan kode yang sama milik buku ini sendiri
        $request->validate([
            'kode_buku' => 'required|unique:bukus,kode_buku,' . $id,
            'judul' => 'required',
            'kategori' => 'required|in:lks_paket,referensi,karya_fiksi',
            'status' => 'required|in:tersedia,dipinjam,hilang'
        ]);

        $buku->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data buku berhasil diperbarui!',
            'data' => $buku
        ]);
    }
}