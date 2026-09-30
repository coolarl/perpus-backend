<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class KunjunganController extends Controller
{
    public function index()
    {
        $kunjungan = Kunjungan::latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $kunjungan
        ]);
    }

 public function store(Request $request)
    {
        $request->validate([
            'nomor_induk' => 'required',
            'tujuan_kunjungan' => 'required|in:Membaca,Meminjam,Mengembalikan',
        ]);

        $anggota = \App\Models\Anggota::where('nomor_induk', $request->nomor_induk)->first();

        if (!$anggota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nomor Induk tidak ditemukan. Pengunjung harus terdaftar sebagai anggota dulu!'
            ], 404);
        }

        $kunjungan = Kunjungan::create([
            'anggota_id' => $anggota->id,
            'tujuan' => strtolower($request->tujuan_kunjungan) 
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data kunjungan berhasil dicatat!',
            'data' => $kunjungan
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $kunjungan = Kunjungan::find($id);

        if (!$kunjungan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'jenis_pengunjung' => 'required|in:Siswa,Guru',
            'nomor_induk' => 'required',
            'nama_lengkap' => 'required',
            'tujuan_kunjungan' => 'required|in:Membaca,Meminjam,Mengembalikan',
        ]);

        $kunjungan->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil diperbarui!',
            'data' => $kunjungan
        ]);
    }

    // 3. Menghapus Buku
    public function destroy($id)
    {
        $kunjungan = Kunjungan::find($id);

        if (!$kunjungan) {
            return response()->json([
                'status' => 'error',
                'message' => 'tidak ditemukan'
            ], 404);
        }

        $kunjungan->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'berhasil dihapus!'
        ]);
    }
}
