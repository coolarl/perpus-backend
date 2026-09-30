import React, { useState, useEffect } from 'react';
import { Search, Download, X, Trash2, Edit3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from './api';

interface AnggotaItem {
  id: number;
  nomor_induk: string;
  nama_lengkap: string;
  tipe: string;
  kunjungan_count?: number;
  peminjaman_count?: number;
}

export default function UserList({ initialTab = 'Data Siswa' }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const [anggota, setAnggota] = useState<AnggotaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nomor_induk: '',
    nama_lengkap: '',
    tipe: 'siswa',
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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

  // Fungsi handleAddClick SUDAH DIHAPUS

  // Fungsi Edit tetap dipertahankan
  const handleEditClick = (item: AnggotaItem) => {
    setEditId(item.id);
    setFormData({
      nomor_induk: item.nomor_induk,
      nama_lengkap: item.nama_lengkap,
      tipe: item.tipe,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Karena ini sekarang khusus Edit, kita langsung pakai PUT
    api
      .put(`/anggota/${editId}`, formData)
      .then(() => {
        setIsModalOpen(false);
        fetchAnggota();
      })
      .catch((error) => {
        alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan sistem'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      api
        .delete(`/anggota/${id}`)
        .then(() => fetchAnggota())
        .catch(() => alert('Terjadi kesalahan saat menghapus data.'));
    }
  };

  const filteredAnggota = anggota.filter((item) => {
    if (activeTab === 'Data Guru' && item.tipe !== 'guru') return false;
    if (activeTab === 'Data Siswa' && item.tipe !== 'siswa') return false;

    const keyword = searchQuery.toLowerCase();
    return item.nama_lengkap.toLowerCase().includes(keyword) || item.nomor_induk.toLowerCase().includes(keyword);
  });
  const handleExportExcel = () => {
    if (filteredAnggota.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }
    const excelData = filteredAnggota.map((item, index) => ({
      No: index + 1,
      'ID / NIS / NIP': item.nomor_induk,
      'Nama Lengkap': item.nama_lengkap,
      Kategori: item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1),
      'Total Kunjungan': item.kunjungan_count || 0,
      'Total Meminjam': item.peminjaman_count || 0,
      Status: 'Aktif',
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'Data Guru' ? 'Data Guru' : activeTab === 'Data Siswa' ? 'Data Siswa' : 'Rekap Harian');
    worksheet['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }];
    const fileName = activeTab === 'Data Guru' ? 'Data_Guru.xlsx' : activeTab === 'Data Siswa' ? 'Data_Siswa.xlsx' : 'Rekap_Harian.xlsx';
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Pengguna Perpustakaan</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen data peminjam dan pengunjung harian.</p>
        </div>
        <button onClick={handleExportExcel} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium">
          <Download size={16} />
          Ekspor Data
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex border-b border-slate-200 px-2 sm:px-6">
          {['Data Guru', 'Data Siswa', 'Rekap Harian'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Cari di ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end w-full sm:w-auto">
            <span className="text-sm text-slate-500">Menampilkan {filteredAnggota.length} entri</span>
            {/* Tombol Tambah dihapus dari sini */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID / NIS / NIP</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4 text-center">Kategori</th>
                <th className="px-6 py-4 text-center">Total Kunjungan</th>
                <th className="px-6 py-4 text-center">Total Meminjam</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data di tab ini.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.nomor_induk}</td>
                    <td className="px-6 py-4 text-slate-700">{item.nama_lengkap}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{item.tipe.charAt(0).toUpperCase() + item.tipe.slice(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{item.kunjungan_count || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{item.peminjaman_count || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Aktif</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(item)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Edit Data Pengguna</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">ID / NIS / NIP</label>
                <input type="text" name="nomor_induk" required value={formData.nomor_induk} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori (Tipe)</label>
                <select name="tipe" required value={formData.tipe} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                </select>
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
