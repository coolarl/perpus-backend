import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X, Trash2, Edit3, ArrowRightLeft } from 'lucide-react';
import api from '../api';

interface BukuItem {
  id: number;
  kode_buku: string;
  judul: string;
  kategori: string;
  status: string;
  penulis?: string;
}

export default function DaftarBuku() {
  const [buku, setBuku] = useState<BukuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk membedakan mode Edit dan Tambah
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    kode_buku: '',
    judul: '',
    penulis: '',
    kategori: 'lks_paket',
    status: 'tersedia',
  });
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null); // Menyimpan info buku yang mau dipinjam
  const [borrowFormData, setBorrowFormData] = useState({
    nomor_induk: '',
    tanggal_pinjam: new Date().toISOString().split('T')[0], // Hari ini otomatis YYYY-MM-DD
    tenggat_waktu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default +7 hari
  });

  const fetchBuku = () => {
    setLoading(true);
    api
      .get('/buku')
      .then((response) => {
        setBuku(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Gagal mengambil data buku:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBuku();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi saat tombol "Tambah Buku Baru" diklik
  const handleAddClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ kode_buku: '', judul: '', penulis: '', kategori: 'lks_paket', status: 'tersedia' });
    setIsModalOpen(true);
  };

  // Fungsi saat tombol "Pensil (Edit)" diklik
  const handleEditClick = (item: BukuItem) => {
    setIsEditMode(true);
    setEditId(item.id);
    setFormData({
      kode_buku: item.kode_buku,
      judul: item.judul,
      penulis: item.penulis || '',
      kategori: item.kategori,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Jika mode edit, gunakan PUT. Jika tambah, gunakan POST.
    const apiRequest = isEditMode ? api.put(`/buku/${editId}`, formData) : api.post('/buku', formData);

    apiRequest
      .then(() => {
        setIsModalOpen(false);
        fetchBuku();
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          alert('Gagal: ' + error.response.data.message);
        } else {
          alert('Terjadi kesalahan sistem.');
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id: number) => {
    const isConfirm = window.confirm('Apakah Anda yakin ingin menghapus buku ini?');
    if (isConfirm) {
      api
        .delete(`/buku/${id}`)
        .then(() => fetchBuku())
        .catch((error) => alert('Terjadi kesalahan saat menghapus buku.'));
    }
  };

  const formatKategori = (kategori: string) => {
    if (kategori === 'lks_paket') return 'LKS / Paket';
    if (kategori === 'referensi') return 'Referensi';
    if (kategori === 'karya_fiksi') return 'Karya Fiksi';
    return kategori;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'tersedia') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'dipinjam') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'hilang' || s === 'proses') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };
  const filteredBuku = buku.filter((item) => {
    // 1. Ubah inputan pencarian jadi huruf kecil semua biar nggak sensitif huruf besar/kecil
    const keyword = searchQuery.toLowerCase();

    // 2. Cek apakah judul ATAU kode buku mengandung keyword tersebut
    const matchJudul = item.judul.toLowerCase().includes(keyword);
    const matchKode = item.kode_buku.toLowerCase().includes(keyword);

    // 3. Kembalikan true jika salah satu cocok
    return matchJudul || matchKode;
  });
  const handleBorrowClick = (buku: any) => {
    if (buku.status !== 'tersedia') {
      alert('Buku ini tidak bisa dipinjam karena statusnya: ' + buku.status);
      return;
    }
    setSelectedBook(buku);
    setBorrowFormData({ ...borrowFormData, nomor_induk: '' });
    setIsBorrowModalOpen(true);
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    api
      .post('/peminjaman', {
        ...borrowFormData,
        buku_id: selectedBook.id,
      })
      .then(() => {
        alert('Sukses: Buku berhasil dipinjamkan!');
        setIsBorrowModalOpen(false);
        fetchBuku(); // Refresh tabel buku agar statusnya langsung berubah jadi 'dipinjam'
      })
      .catch((error) => {
        alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      })
      .finally(() => setIsSubmitting(false));
  };
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Buku</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data buku fisik di perpustakaan.</p>
        </div>
        <button onClick={handleAddClick} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
          <Plus className="w-4 h-4" />
          Tambah Buku Baru
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau kode buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Kode Buku</th>
                <th className="px-6 py-4 font-medium">Judul Buku</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredBuku.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data buku.
                  </td>
                </tr>
              ) : (
                filteredBuku.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.kode_buku}</td>
                    <td className="px-6 py-4 text-slate-700">{item.judul}</td>
                    <td className="px-6 py-4 text-slate-600">{formatKategori(item.kategori)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleBorrowClick(item)} title="Pinjamkan Buku" className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        {/* Tombol Edit Aktif */}
                        <button onClick={() => handleEditClick(item)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              {/* Judul modal berubah dinamis */}
              <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Data Buku' : 'Tambah Buku Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Buku</label>
                <input type="text" name="kode_buku" required value={formData.kode_buku} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Buku</label>
                <input type="text" name="judul" required value={formData.judul} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Penulis / Penerbit</label>
                <input type="text" name="penulis" required value={formData.penulis} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select name="kategori" required value={formData.kategori} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="lks_paket">LKS / Paket</option>
                    <option value="referensi">Referensi</option>
                    <option value="karya_fiksi">Karya Fiksi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="tersedia">Tersedia</option>
                    <option value="dipinjam">Dipinjam</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Peminjaman Buku */}
      {isBorrowModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Pinjamkan Buku</h2>
              <button onClick={() => setIsBorrowModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBorrowSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800 mb-4">
                Meminjamkan: <strong>{selectedBook.judul}</strong> ({selectedBook.kode_buku})
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Induk Peminjam</label>
                <input
                  type="text"
                  required
                  value={borrowFormData.nomor_induk}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, nomor_induk: e.target.value })}
                  placeholder="Masukkan NIS/NIP"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Pinjam</label>
                  <input
                    type="date"
                    required
                    value={borrowFormData.tanggal_pinjam}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, tanggal_pinjam: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tenggat Kembali</label>
                  <input
                    type="date"
                    required
                    value={borrowFormData.tenggat_waktu}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, tenggat_waktu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsBorrowModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  {isSubmitting ? 'Memproses...' : 'Pinjamkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
