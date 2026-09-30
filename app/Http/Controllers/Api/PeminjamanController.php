<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Models\Buku; 
use Illuminate\Http\Request;

class PeminjamanController extends Controller
{
    public function index()
    {
        $peminjaman = Peminjaman::with(['anggota', 'buku'])->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $peminjaman
        ]);
    }

   public function store(Request $request)
    {
        $request->validate([
            'nomor_induk' => 'required', 
            'buku_id' => 'required|exists:bukus,id',
            'tanggal_pinjam' => 'required|date',
            'tenggat_waktu' => 'required|date|after_or_equal:tanggal_pinjam',
        ]);

        $anggota = \App\Models\Anggota::where('nomor_induk', $request->nomor_induk)->first();

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nomor Induk tidak ditemukan. Pastikan peminjam sudah terdaftar!'
            ], 404);
        }

        $buku = \App\Models\Buku::find($request->buku_id);
        if ($buku->status !== 'tersedia') {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku ini sedang tidak tersedia (sedang dipinjam/hilang).'
            ], 400); 
        }

        $peminjaman = \App\Models\Peminjaman::create([
            'anggota_id' => $anggota->id,
            'buku_id' => $request->buku_id,
            'tanggal_pinjam' => $request->tanggal_pinjam,
            'tenggat_waktu' => $request->tenggat_waktu,
            'status' => 'dipinjam'
        ]);

        $buku->update(['status' => 'dipinjam']);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi peminjaman berhasil dicatat!',
            'data' => $peminjaman
        ], 201);
    }
    public function update(Request $request, $id)
    {
        $peminjaman = Peminjaman::find($id);

        if (!$peminjaman) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data transaksi tidak ditemukan.'
            ], 404);
        }

        if ($peminjaman->status === 'dikembalikan') {
            return response()->json([
                'status' => 'error',
                'message' => 'Buku ini sudah dikembalikan sebelumnya.'
            ], 400);
        }

        $peminjaman->update([
            'status' => 'dikembalikan',
            'tanggal_kembali' => now()->toDateString() 
        ]);

        $buku = \App\Models\Buku::find($peminjaman->buku_id);
        if ($buku) {
            $buku->update(['status' => 'tersedia']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Buku berhasil dikembalikan ke perpustakaan!',
            'data' => $peminjaman
        ]);
    }
}