<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buku;
use App\Models\Peminjaman;
use App\Models\Kunjungan;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $hariIni = Carbon::today();

        // 1. Hitung Statistik
        $totalBuku = Buku::count();
        $peminjamAktif = Peminjaman::where('status', 'dipinjam')->count();
        $pengunjungHariIni = Kunjungan::whereDate('created_at', $hariIni)->count();
        
        // Buku terlambat: statusnya masih dipinjam, tapi tenggat waktunya sudah lewat dari hari ini
        $bukuTerlambat = Peminjaman::where('status', 'dipinjam')
                                   ->whereDate('tenggat_waktu', '<', $hariIni)
                                   ->count();

        // 2. Ambil 5 Transaksi Peminjaman Terbaru
        $peminjamanTerbaru = Peminjaman::with(['anggota', 'buku'])
                                       ->latest()
                                       ->take(5)
                                       ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_buku' => $totalBuku,
                    'peminjam_aktif' => $peminjamAktif,
                    'pengunjung_hari_ini' => $pengunjungHariIni,
                    'buku_terlambat' => $bukuTerlambat
                ],
                'peminjaman_terbaru' => $peminjamanTerbaru
            ]
        ]);
    }
}