import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X, Trash2, Edit3 } from 'lucide-react';
import api from '../api';

interface AnggotaItem {
  id: number;
  nomor_induk: string;
  nama_lengkap: string;
  tipe: string;
}

export default function DaftarAnggota() {
  const [anggota, setAnggota] = useState<AnggotaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State baru untuk membedakan mode Edit dan Tambah
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nomor_induk: '',
    nama_lengkap: '',
    tipe: 'siswa',
  });

  const fetchAnggota = () => {
    setLoading(true);
    api
      .get('/anggota')
      .then((response) => {
        setAnggota(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Gagal mengambil data anggota:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnggota();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi saat tombol "Tambah Buku Baru" diklik
  const handleAddClick = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ nomor_induk: '', nama_lengkap: '', tipe: 'siswa' });
    setIsModalOpen(true);
  };

  // Fungsi saat tombol "Pensil (Edit)" diklik
  const handleEditClick = (item: AnggotaItem) => {
    setIsEditMode(true);
    setEditId(item.id);
    setFormData({
      nomor_induk: item.nomor_induk,
      nama_lengkap: item.nama_lengkap || '',
      tipe: item.tipe,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Jika mode edit, gunakan PUT. Jika tambah, gunakan POST.
    const apiRequest = isEditMode ? api.put(`/anggota/${editId}`, formData) : api.post('/anggota', formData);

    apiRequest
      .then(() => {
        setIsModalOpen(false);
        fetchAnggota();
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
    const isConfirm = window.confirm('Apakah Anda yakin ingin menghapus ini?');
    if (isConfirm) {
      api
        .delete(`/anggota/${id}`)
        .then(() => fetchAnggota())
        .catch((error) => alert('Terjadi kesalahan saat menghapus.'));
    }
  };

  const formatKategori = (kategori: string) => {
    if (kategori === 'siswa') return 'Siswa';
    if (kategori === 'guru') return 'Guru';
    return kategori;
  };

  //   const getStatusBadge = (status: string) => {
  //     const s = status.toLowerCase();
  //     if (s === 'tersedia') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  //     if (s === 'dipinjam') return 'bg-amber-50 text-amber-700 border-amber-200';
  //     if (s === 'hilang' || s === 'proses') return 'bg-blue-50 text-blue-700 border-blue-200';
  //     return 'bg-slate-100 text-slate-700 border-slate-200';
  //   };
  const filteredAnggota = anggota.filter((item) => {
    // 1. Ubah inputan pencarian jadi huruf kecil semua biar nggak sensitif huruf besar/kecil
    const keyword = searchQuery.toLowerCase();

    // 2. Cek apakah judul ATAU kode buku mengandung keyword tersebut
    const matchJudul = item.nama_lengkap.toLowerCase().includes(keyword);
    const matchKode = item.nomor_induk.toLowerCase().includes(keyword);

    // 3. Kembalikan true jika salah satu cocok
    return matchJudul || matchKode;
  });
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Anggota</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data anggota.</p>
        </div>
        <button onClick={handleAddClick} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
          <Plus className="w-4 h-4" />
          Tambah Anggota Baru
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
                <th className="px-6 py-4 font-medium">Nomor Induk</th>
                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
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
              ) : filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data Anggota.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.nama_lengkap}</td>
                    <td className="px-6 py-4 text-slate-700">{item.nomor_induk}</td>
                    <td className="px-6 py-4 text-slate-600">{formatKategori(item.tipe)}</td>
                    {/* <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                    </td> */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
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
              <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Induk</label>
                <input type="text" name="nomor_induk" required value={formData.nomor_induk} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <select name="tipe" required value={formData.tipe} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select name="kategori" required value={formData.kategori} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="lks_paket">LKS / Paket</option>
                    <option value="referensi">Referensi</option>
                    <option value="karya_fiksi">Karya Fiksi</option>
                  </select>
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="tersedia">Tersedia</option>
                    <option value="dipinjam">Dipinjam</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </div> */}
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
    </div>
  );
}
