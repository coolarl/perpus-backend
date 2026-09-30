import React, { useState } from 'react';
import api from './api'; // Pastikan path ini benar mengarah ke konfigurasi axios-mu

export default function AddBorrower() {
  // State untuk menampung isian form, termasuk telepon dan alamat yang baru kita buat
  const [formData, setFormData] = useState({
    tipe: 'siswa', // Default pilihan radio button
    nomor_induk: '',
    nama_lengkap: '',
    telepon: '',
    alamat: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk input teks biasa
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi khusus untuk radio button
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, tipe: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    api
      .post('/anggota', formData)
      .then((response) => {
        alert('Sukses: Peminjam baru berhasil didaftarkan!');
        // Kosongkan form kembali setelah sukses
        setFormData({
          tipe: 'siswa',
          nomor_induk: '',
          nama_lengkap: '',
          telepon: '',
          alamat: '',
        });
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          alert('Gagal: ' + error.response.data.message);
        } else {
          alert('Terjadi kesalahan saat menyimpan data ke server.');
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Peminjam</h1>
      </div>

      {/* Card Form */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 rounded-t-lg">
          <h2 className="text-lg font-bold text-slate-800">Tambah Peminjam Baru</h2>
          <p className="text-sm text-slate-500 mt-1">Daftarkan profil peminjam agar dapat melakukan transaksi peminjaman buku.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Radio Kategori */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Kategori Peminjam</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-blue-600 transition-colors">
                <input type="radio" name="tipe" value="siswa" checked={formData.tipe === 'siswa'} onChange={handleRadioChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                Siswa
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-blue-600 transition-colors">
                <input type="radio" name="tipe" value="guru" checked={formData.tipe === 'guru'} onChange={handleRadioChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                Guru
              </label>
            </div>
          </div>

          {/* Input Nomor Induk */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Induk (NIS/NIP)</label>
            <input
              type="text"
              name="nomor_induk"
              required
              value={formData.nomor_induk}
              onChange={handleInputChange}
              placeholder="Masukkan Nomor Induk"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="nama_lengkap"
              required
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Masukkan Nama Lengkap Sesuai Identitas"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {/* Input Telepon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon / WhatsApp</label>
            <input
              type="text"
              name="telepon"
              value={formData.telepon}
              onChange={handleInputChange}
              placeholder="08xxxxxxxxxx"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {/* Input Alamat (Textarea) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Tinggal</label>
            <textarea
              name="alamat"
              rows={3}
              value={formData.alamat}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-6 flex justify-start gap-3 border-t border-slate-100">
            <button
              type="button"
              // Tombol batal akan mereset form ke kosong
              onClick={() => setFormData({ tipe: 'siswa', nomor_induk: '', nama_lengkap: '', telepon: '', alamat: '' })}
              className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Peminjam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
