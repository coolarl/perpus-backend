import React, { useState } from 'react';
import api from './api';

const AddVisitor = () => {
  const [formData, setFormData] = useState({
    jenis_pengunjung: 'Siswa',
    nomor_induk: '',
    nama_lengkap: '',
    tujuan_kunjungan: 'Membaca',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    api
      .post('/kunjungan', formData)
      .then(() => {
        alert('Sukses: Data pengunjung berhasil dicatat!');
        setFormData({
          jenis_pengunjung: 'Siswa',
          nomor_induk: '',
          nama_lengkap: '',
          tujuan_kunjungan: 'Membaca',
        });
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          alert('Gagal: ' + error.response.data.message);
        } else {
          alert('Terjadi kesalahan saat menyimpan data pengunjung.');
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 lg:p-8 bg-slate-50 flex-1 w-full font-sans flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pengunjung</h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-medium text-slate-900">Tambah Pengunjung</h2>
            <p className="text-sm text-slate-500 mt-1">Masukkan data pengunjung baru ke dalam catatan buku tamu perpustakaan.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Jenis Pengunjung (Radio) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Pengunjung</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="jenis_pengunjung" value="Siswa" checked={formData.jenis_pengunjung === 'Siswa'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">Siswa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="jenis_pengunjung" value="Guru" checked={formData.jenis_pengunjung === 'Guru'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">Guru</span>
                </label>
              </div>
            </div>

            {/* Nomor Induk */}
            <div>
              <label htmlFor="nomorInduk" className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Induk (NIS/NIP)
              </label>
              <input
                type="text"
                id="nomorInduk"
                name="nomor_induk"
                value={formData.nomor_induk}
                onChange={handleChange}
                placeholder="Masukkan Nomor Induk"
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 transition-colors"
                required
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="namaLengkap"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Masukkan Nama Lengkap"
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 transition-colors"
                required
              />
            </div>

            {/* Tujuan Kunjungan */}
            <div>
              <label htmlFor="tujuanKunjungan" className="block text-sm font-medium text-slate-700 mb-1">
                Tujuan Kunjungan
              </label>
              <select
                id="tujuanKunjungan"
                name="tujuan_kunjungan"
                value={formData.tujuan_kunjungan}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-colors"
                required
              >
                <option value="Membaca">Membaca</option>
                <option value="Meminjam">Meminjam</option>
                <option value="Mengembalikan">Mengembalikan</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormData({ jenis_pengunjung: 'Siswa', nomor_induk: '', nama_lengkap: '', tujuan_kunjungan: 'Membaca' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVisitor;
