<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Buku;
use App\Models\Kunjungan;
use App\Models\Peminjaman;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // Ambil filter bulan & tahun dari React, defaultnya bulan & tahun saat ini
        $bulan = $request->query('bulan', date('m'));
        $tahun = $request->query('tahun', date('Y'));
        $tipe = $request->query('tipe', 'Laporan Bulanan Buku');

        if ($tipe === 'Laporan Bulanan Buku') {
            // Tampilkan semua buku, dan hitung berapa kali dipinjam pada bulan & tahun tersebut
            $data = Buku::withCount(['peminjaman' => function ($query) use ($bulan, $tahun) {
                $query->whereMonth('tanggal_pinjam', $bulan)->whereYear('tanggal_pinjam', $tahun);
            }])->get();
            
        } elseif ($tipe === 'Laporan Pengunjung') {
            $data = Kunjungan::with('anggota')
                ->whereMonth('created_at', $bulan)->whereYear('created_at', $tahun)
                ->get();
                
        } elseif ($tipe === 'Laporan Peminjam') {
            $data = Peminjaman::with(['anggota', 'buku'])
                ->whereMonth('tanggal_pinjam', $bulan)->whereYear('tanggal_pinjam', $tahun)
                ->get();
        } elseif ($tipe === 'Rekap Seluruh Buku') {
            $data = Buku::withCount('peminjaman')->get();
        } else {
            $data = [];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}