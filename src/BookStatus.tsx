import React, { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import api from './api';

export default function BookStatus() {
  const [peminjamanList, setPeminjamanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk filter tab: 'Semua', 'Dipinjam', 'Dikembalikan'
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPeminjaman = () => {
    setLoading(true);
    api
      .get('/peminjaman')
      .then((response) => {
        setPeminjamanList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Gagal mengambil data peminjaman:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const handleReturnBook = (id: number, judulBuku: string) => {
    if (window.confirm(`Apakah Anda yakin menerima pengembalian buku "${judulBuku}"?`)) {
      // Tembak endpoint PUT yang baru saja kita buat di Laravel
      api
        .put(`/peminjaman/${id}`)
        .then(() => {
          alert('Buku berhasil dikembalikan!');
          fetchPeminjaman();
        })
        .catch((error) => {
          alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
        });
    }
  };

  const filteredData = peminjamanList.filter((item) => {
    // 1. Filter berdasarkan Tab (Status)
    if (activeFilter === 'Dipinjam' && item.status !== 'dipinjam') return false;
    if (activeFilter === 'Dikembalikan' && item.status !== 'dikembalikan') return false;

    // 2. Filter berdasarkan Kotak Pencarian (Judul, Kode Buku, atau Nama Peminjam)
    const keyword = searchQuery.toLowerCase();
    const judulMatch = item.buku?.judul.toLowerCase().includes(keyword) || false;
    const kodeMatch = item.buku?.kode_buku.toLowerCase().includes(keyword) || false;
    const namaMatch = item.anggota?.nama_lengkap.toLowerCase().includes(keyword) || false;

    return judulMatch || kodeMatch || namaMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Status Buku / Sirkulasi</h1>
        <p className="text-sm text-slate-500 mt-1">Pantau pergerakan, peminjaman, dan pengembalian koleksi perpustakaan.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Top Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Tabs Filter */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium mr-2">Filter:</span>
            {['Semua', 'Dipinjam', 'Dikembalikan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-full border transition-colors ${activeFilter === tab ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari buku atau nama peminjam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Kode Buku</th>
                <th className="px-6 py-4">Judul Buku</th>
                <th className="px-6 py-4">Peminjam</th>
                <th className="px-6 py-4">Tgl Pinjam</th>
                <th className="px-6 py-4">Tenggat Waktu</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Memuat data sirkulasi...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada catatan peminjaman dengan status <strong>{activeFilter}</strong>.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{item.buku?.kode_buku || '-'}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.buku?.judul || 'Buku Dihapus'}</td>
                    <td className="px-6 py-4 text-slate-700">{item.anggota?.nama_lengkap || 'Anggota Dihapus'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.tanggal_pinjam}</td>
                    <td className="px-6 py-4 text-slate-600">{item.tenggat_waktu}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.status === 'dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Tombol aksi HANYA muncul kalau bukunya masih berstatus dipinjam */}
                      {item.status === 'dipinjam' ? (
                        <button
                          onClick={() => handleReturnBook(item.id, item.buku?.judul)}
                          title="Terima Pengembalian Buku"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md font-medium text-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Kembalikan
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Tuntas</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
