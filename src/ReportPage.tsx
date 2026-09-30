import React, { useState, useEffect } from 'react';
import { Calendar, FileDown, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from './api';

const ReportPage = ({ initialReportType = 'Laporan Bulanan Buku' }: { initialReportType?: string }) => {
  const [reportType, setReportType] = useState(initialReportType);

  // State untuk API filter & data
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const daftarTahun = [2024, 2025, 2026, 2027];

  const reportOptions = ['Laporan Bulanan Buku', 'Laporan Pengunjung', 'Laporan Peminjam', 'Rekap Seluruh Buku'];

  const currentType = reportOptions.find((opt) => opt.includes(reportType) || reportType.includes(opt)) || 'Laporan Bulanan Buku';

  useEffect(() => {
    setReportType(initialReportType);
  }, [initialReportType]);

  const fetchReport = () => {
    setLoading(true);
    api
      .get('/laporan', {
        params: {
          tipe: currentType,
          bulan: bulan.toString().padStart(2, '0'),
          tahun: tahun,
        },
      })
      .then((res) => setData(res.data.data))
      .catch((err) => console.error('Gagal mengambil laporan:', err))
      .finally(() => setLoading(false));
  };

  // Otomatis ambil data saat filter berubah
  useEffect(() => {
    fetchReport();
  }, [currentType, bulan, tahun]);

  // Metrik dinamis berdasarkan data API
  const getMetrics = () => {
    if (currentType === 'Laporan Pengunjung') {
      const total = data.length;
      const unik = new Set(data.map((item) => item.anggota_id)).size;
      return [
        { label: 'Total Kunjungan', value: `${total} Kali` },
        { label: 'Pengunjung Unik', value: `${unik} Orang` },
        { label: 'Periode', value: `${namaBulan[bulan - 1]} ${tahun}` },
      ];
    } else if (currentType === 'Laporan Peminjam') {
      const total = data.length;
      const kembali = data.filter((item) => item.status === 'dikembalikan').length;
      return [
        { label: 'Total Transaksi Pinjam', value: `${total} Transaksi` },
        { label: 'Sudah Dikembalikan', value: `${kembali} Buku` },
        { label: 'Masih Dipinjam', value: `${total - kembali} Buku` },
      ];
    } else {
      // Default: Laporan Bulanan Buku
      const totalDipinjam = data.reduce((sum, item) => sum + (item.peminjaman_count || 0), 0);
      const totalBuku = data.length;
      return [
        { label: 'Total Judul Buku', value: `${totalBuku} Judul` },
        { label: 'Total Pergerakan Pinjam', value: `${totalDipinjam} Kali` },
        { label: 'Periode', value: `${namaBulan[bulan - 1]} ${tahun}` },
      ];
    }
  };

  const handlePrint = () => {
    window.print();
  };
  const handleDownloadExcel = () => {
    if (data.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    let excelData: any[] = [];

    if (currentType === 'Laporan Pengunjung') {
      excelData = data.map((row, index) => ({
        No: index + 1,
        Tanggal: row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-',
        'Nama Pengunjung': row.anggota?.nama_lengkap || '-',
        Kategori: row.anggota?.tipe || '-',
        Tujuan: row.tujuan || '-',
      }));
    } else if (currentType === 'Laporan Peminjam') {
      excelData = data.map((row, index) => ({
        No: index + 1,
        Peminjam: row.anggota?.nama_lengkap || '-',
        Buku: row.buku?.judul || '-',
        'Tgl Pinjam': row.tanggal_pinjam || '-',
        Status: row.status || '-',
      }));
    } else if (currentType === 'Rekap Seluruh Buku') {
      const totalJudul = data.length;
      const sedangDipinjam = data.filter((b) => b.status === 'dipinjam').length;
      return [
        { label: 'Total Judul Terdaftar', value: `${totalJudul} Judul` },
        { label: 'Sirkulasi (Sedang Dipinjam)', value: `${sedangDipinjam} Buku` },
        { label: 'Tersedia di Rak', value: `${totalJudul - sedangDipinjam} Buku` },
      ];
    } else {
      excelData = data.map((row, index) => ({
        No: index + 1,
        'Kode Buku': row.kode_buku || '-',
        'Judul Buku': row.judul || '-',
        'Total Dipinjam': row.peminjaman_count || 0,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');

    // Lebar kolom Excel
    worksheet['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 20 }];

    // Nama file
    const namaFile = currentType.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

    XLSX.writeFile(workbook, `${namaFile}_${namaBulan[bulan - 1]}_${tahun}.xlsx`);
  };

  return (
    <div className="p-4 lg:p-8 bg-slate-50 flex-1 w-full font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="print:hidden">
          <h1 className="text-2xl font-semibold text-slate-900">Laporan & Rekapitulasi</h1>
          <p className="text-sm text-slate-500 mt-1">Pusat pencetakan dan analisis data sistem perpustakaan.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 print:hidden">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="reportType" className="block text-sm font-medium text-slate-700 mb-1.5">
                Jenis Laporan
              </label>
              <select
                id="reportType"
                value={currentType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {reportOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bulan</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <select
                  value={bulan}
                  onChange={(e) => setBulan(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {namaBulan.map((nama, idx) => (
                    <option key={idx} value={idx + 1}>
                      {nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 w-full md:w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {daftarTahun.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={fetchReport}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getMetrics().map((metric, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center shadow-sm print:border-black print:shadow-none">
              <span className="text-sm font-medium text-slate-500 print:text-black">{metric.label}</span>
              <span className="text-xl font-bold text-slate-900 mt-1.5 print:text-black">{metric.value}</span>
            </div>
          ))}
        </div>

        {/* Report Table Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:border-none print:shadow-none">
          {/* Table Toolbar Actions */}
          <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <h2 className="text-base font-semibold text-slate-900">Hasil Laporan: {currentType}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadExcel}
                disabled={loading || data.length === 0}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown size={16} className="text-emerald-600" />
                Download Excel
              </button>
              <button onClick={handlePrint} className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                <Printer size={16} />
                Cetak Laporan (PDF)
              </button>
            </div>
          </div>

          {/* Judul Khusus Print */}
          <div className="hidden print:block mb-4 text-center">
            <h2 className="text-2xl font-bold uppercase">{currentType}</h2>
            <p className="text-sm mt-1">
              Periode: {namaBulan[bulan - 1]} {tahun}
            </p>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 print:text-black">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs print:bg-transparent print:border-black print:border-b-2">
                {/* Header dinamis tergantung jenis laporan */}
                {currentType === 'Laporan Pengunjung' ? (
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16 text-center">No</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Nama Pengunjung</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Tujuan</th>
                  </tr>
                ) : currentType === 'Laporan Peminjam' ? (
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16 text-center">No</th>
                    <th className="px-6 py-4 font-semibold">Peminjam</th>
                    <th className="px-6 py-4 font-semibold">Buku</th>
                    <th className="px-6 py-4 font-semibold">Tgl Pinjam</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16 text-center">No</th>
                    <th className="px-6 py-4 font-semibold">Kode Buku</th>
                    <th className="px-6 py-4 font-semibold">Judul Buku</th>
                    <th className="px-6 py-4 font-semibold text-center">Total Dipinjam (Bulan Ini)</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-slate-200 print:divide-black">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data transaksi di periode ini.
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white print:bg-transparent">
                      <td className="px-6 py-4 text-center font-medium">{idx + 1}</td>

                      {/* Isi tabel dinamis */}
                      {currentType === 'Laporan Pengunjung' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{row.anggota?.nama_lengkap || '-'}</td>
                          <td className="px-6 py-4 capitalize">{row.anggota?.tipe || '-'}</td>
                          <td className="px-6 py-4 capitalize">{row.tujuan}</td>
                        </>
                      ) : currentType === 'Laporan Peminjam' ? (
                        <>
                          <td className="px-6 py-4 font-medium text-slate-900">{row.anggota?.nama_lengkap || '-'}</td>
                          <td className="px-6 py-4 text-slate-700">{row.buku?.judul || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{row.tanggal_pinjam}</td>
                          <td className="px-6 py-4 text-center capitalize">{row.status}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-slate-700">{row.kode_buku}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{row.judul}</td>
                          <td className="px-6 py-4 text-center font-bold text-blue-600 print:text-black">{row.peminjaman_count} kali</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Print */}
          <div className="hidden print:block mt-12 pr-12 text-right text-black">
            <p className="text-sm mb-16">
              Mengetahui,
              <br />
              Kepala Perpustakaan
            </p>
            <p className="text-sm font-bold underline">( ................................... )</p>
          </div>

          {/* Pagination Footer (Disembunyikan saat print) */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 print:hidden">
            <div className="hidden sm:block">
              <p className="text-sm text-slate-600">
                Menampilkan <span className="font-medium text-slate-900">{data.length}</span> baris data rekapitulasi.
              </p>
            </div>
            <div className="flex-1 sm:flex-none flex justify-end">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 border border-slate-300 bg-slate-50 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white">1</button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 border border-slate-300 bg-slate-50 cursor-not-allowed">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
