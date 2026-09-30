<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;

class AnggotaController extends Controller
{
   public function index()
    {
        $anggota = Anggota::withCount(['kunjungan', 'peminjaman'])->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $anggota
        ]);
    }

   public function store(Request $request)
    {
        $request->validate([
            'nomor_induk' => 'required|unique:anggotas',
            'nama_lengkap' => 'required',
            'tipe' => 'required|in:siswa,guru',
            // Tambahan validasi baru:
            'telepon' => 'nullable|string',
            'alamat' => 'nullable|string'
        ]);

        $anggota = Anggota::create($request->all());
        return response()->json(['status' => 'success', 'data' => $anggota], 201);
    }

    public function update(Request $request, $id)
    {
        $anggota = Anggota::find($id);
        if (!$anggota) return response()->json(['message' => 'Not found'], 404);

        $request->validate([
            'nomor_induk' => 'required|unique:anggotas,nomor_induk,' . $id,
            'nama_lengkap' => 'required',
            'tipe' => 'required|in:siswa,guru',
            // Tambahan validasi baru:
            'telepon' => 'nullable|string',
            'alamat' => 'nullable|string'
        ]);

        $anggota->update($request->all());
        return response()->json(['status' => 'success', 'data' => $anggota]);
    }

    public function destroy($id)
    {
        $anggota = Anggota::find($id);
        if ($anggota) $anggota->delete();
        return response()->json(['status' => 'success']);
    }
}