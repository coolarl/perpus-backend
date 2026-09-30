import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LayoutDashboard, Users, BookOpen, UserCheck, FileText, ChevronDown, ChevronRight, Menu, Library, ClockAlert } from 'lucide-react';

import api from './api';

import AddVisitor from './AddVisitor';
import AddBorrower from './AddBorrower';
import Login from './Login';
import UserList from './UserList';
import BookStatus from './BookStatus';
import ReportPage from './ReportPage';
import DaftarBuku from './components/DaftarBuku';

interface SidebarItemProps {
  icon: React.ElementType;
  title: string;
  active?: boolean;
  subItems?: string[];
  onSubItemClick?: (item: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, title, active = false, subItems = [], onSubItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems.length > 0;

  return (
    <div className="mb-1">
      <button
        onClick={() => (hasSubItems ? setIsOpen(!isOpen) : onSubItemClick && onSubItemClick(title))}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
          active ? 'bg-indigo-800 text-white font-medium border-l-4 border-blue-400 rounded-r-md rounded-l-none' : 'text-indigo-200 hover:bg-indigo-900 hover:text-white rounded-md border-l-4 border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={active ? 'text-blue-400' : 'text-indigo-400'} />
          <span>{title}</span>
        </div>
        {hasSubItems && (isOpen ? <ChevronDown size={16} className={active ? 'text-indigo-300' : 'text-indigo-400'} /> : <ChevronRight size={16} className={active ? 'text-indigo-300' : 'text-indigo-400'} />)}
      </button>

      {hasSubItems && isOpen && (
        <div className="mt-1 ml-9 flex flex-col gap-1 border-l border-indigo-800">
          {subItems.map((item, idx) => (
            <button key={idx} onClick={() => onSubItemClick && onSubItemClick(item)} className="text-left px-4 py-1.5 text-sm text-indigo-300 hover:text-white hover:bg-indigo-900/50 rounded-md transition-colors">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');

  const [dashboardData, setDashboardData] = useState({
    stats: { total_buku: 0, peminjam_aktif: 0, pengunjung_hari_ini: 0, buku_terlambat: 0 },
    peminjaman_terbaru: [] as any[],
  });

  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activePage === 'Dashboard' && isAuthenticated) {
      api
        .get('/dashboard')
        .then((res) => setDashboardData(res.data.data))
        .catch((err) => console.error('Gagal memuat dashboard:', err));
    }
  }, [activePage, isAuthenticated]);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      setActivePage('Daftar Buku');
      alert(`Mencari: "${searchQuery}". (Fitur pencarian di Daftar Buku dapat dikembangkan lebih lanjut)`);
      setSearchQuery('');
    }
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  const stats = [
    { title: 'Total Buku', value: dashboardData.stats.total_buku, icon: Library, colorClass: 'bg-blue-100 text-blue-600' },
    { title: 'Peminjam Aktif', value: dashboardData.stats.peminjam_aktif, icon: Users, colorClass: 'bg-purple-100 text-purple-600' },
    { title: 'Pengunjung Hari Ini', value: dashboardData.stats.pengunjung_hari_ini, icon: UserCheck, colorClass: 'bg-emerald-100 text-emerald-600' },
    { title: 'Buku Terlambat', value: dashboardData.stats.buku_terlambat, icon: ClockAlert, colorClass: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-950 border-r border-indigo-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-400" size={24} />
            <span className="text-lg font-bold text-white tracking-tight">PerpusAdmin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <SidebarItem icon={LayoutDashboard} title="Dashboard" active={activePage === 'Dashboard'} onSubItemClick={setActivePage} />

          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-indigo-400/70 uppercase tracking-wider">Manajemen</div>
          <SidebarItem
            icon={Users}
            title="Peminjam"
            subItems={['Tambah Peminjam', 'Data Guru', 'Data Siswa', 'Rekap Harian']}
            onSubItemClick={setActivePage}
            active={['Tambah Peminjam', 'Data Guru', 'Data Siswa', 'Rekap Harian'].includes(activePage)}
          />
          <SidebarItem icon={BookOpen} title="Buku" subItems={['Daftar Buku', 'Status Buku']} onSubItemClick={setActivePage} active={['Daftar Buku', 'Status Buku'].includes(activePage)} />
          <SidebarItem
            icon={UserCheck}
            title="Pengunjung"
            subItems={['Tambah Pengunjung', 'Data Guru', 'Data Siswa', 'Rekap Harian']}
            onSubItemClick={setActivePage}
            active={['Tambah Pengunjung', 'Data Guru', 'Data Siswa', 'Rekap Harian'].includes(activePage)}
          />

          {user?.role === 'admin' && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-indigo-400/70 uppercase tracking-wider">Laporan</div>
              <SidebarItem
                icon={FileText}
                title="Laporan"
                subItems={['Laporan Bulanan Buku', 'Laporan Pengunjung', 'Laporan Peminjam']}
                onSubItemClick={setActivePage}
                active={['Laporan Bulanan Buku', 'Laporan Pengunjung', 'Laporan Peminjam'].includes(activePage)}
              />
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar DINAMIS */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 relative z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari lalu tekan Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Tombol Notifikasi */}
            <button onClick={() => setShowNotif(!showNotif)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={18} />
              {/* Badge merah muncul jika ada buku terlambat */}
              {dashboardData.stats.buku_terlambat > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotif && (
              <div className="absolute top-14 right-12 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 font-semibold text-sm text-slate-800">Notifikasi</div>
                <div className="px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                  {dashboardData.stats.buku_terlambat > 0 ? `⚠️ Terdapat ${dashboardData.stats.buku_terlambat} buku yang terlambat dikembalikan!` : '✅ Semua buku dikembalikan tepat waktu.'}
                </div>
                <div className="px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">📚 {dashboardData.stats.peminjam_aktif} buku sedang dipinjam saat ini.</div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <button onClick={() => setShowLogoutModal(true)} title="Logout" className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name || 'Admin'}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        {activePage === 'Dashboard' && (
          <main className="flex-1 overflow-auto p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header Title */}
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas sistem perpustakaan.</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 flex items-center shadow-sm">
                      <div className={`p-3 rounded-lg mr-4 ${stat.colorClass}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">{stat.title}</div>
                        <div className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Section */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-900">Peminjaman Terbaru</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Nama Peminjam</th>
                        <th className="px-6 py-4 font-semibold">Kategori</th>
                        <th className="px-6 py-4 font-semibold">Judul Buku</th>
                        <th className="px-6 py-4 font-semibold">Tgl Pinjam</th>
                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dashboardData.peminjaman_terbaru.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            Belum ada transaksi peminjaman.
                          </td>
                        </tr>
                      ) : (
                        dashboardData.peminjaman_terbaru.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.anggota?.nama_lengkap || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize">{row.anggota?.tipe || '-'}</td>
                            <td className="px-6 py-4 min-w-[200px] text-slate-900">{row.buku?.judul || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{row.tanggal_pinjam}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                  row.status === 'dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        )}

        {activePage === 'Daftar Buku' && (
          <main className="flex-1 overflow-auto flex flex-col">
            <DaftarBuku />
          </main>
        )}

        {activePage === 'Tambah Pengunjung' && (
          <main className="flex-1 overflow-auto flex flex-col">
            <AddVisitor />
          </main>
        )}

        {activePage === 'Tambah Peminjam' && (
          <main className="flex-1 overflow-auto flex flex-col">
            <AddBorrower />
          </main>
        )}

        {['Data Guru', 'Data Siswa', 'Rekap Harian'].includes(activePage) && (
          <main className="flex-1 overflow-auto flex flex-col">
            <UserList key={activePage} initialTab={activePage} />
          </main>
        )}

        {activePage === 'Status Buku' && (
          <main className="flex-1 overflow-auto flex flex-col">
            <BookStatus />
          </main>
        )}

        {['Laporan Bulanan Buku', 'Laporan Pengunjung', 'Laporan Peminjam', 'Laporan'].includes(activePage) && (
          <main className="flex-1 overflow-auto flex flex-col">
            <ReportPage key={activePage} initialReportType={activePage === 'Laporan' ? 'Laporan Bulanan Buku' : activePage} />
          </main>
        )}

        {/* Fallback for other pages */}
        {activePage !== 'Dashboard' &&
          activePage !== 'Daftar Buku' &&
          activePage !== 'Status Buku' &&
          activePage !== 'Tambah Pengunjung' &&
          activePage !== 'Tambah Peminjam' &&
          !['Data Guru', 'Data Siswa', 'Rekap Harian'].includes(activePage) &&
          !['Laporan Bulanan Buku', 'Laporan Pengunjung', 'Laporan Peminjam', 'Laporan'].includes(activePage) && (
            <main className="flex-1 overflow-auto p-4 lg:p-8 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium text-slate-900">{activePage}</h2>
                <p className="text-sm text-slate-500 mt-1">Halaman dalam tahap pengembangan.</p>
              </div>
            </main>
          )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* MODAL KONFIRMASI LOGOUT KUSTOM */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <User size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Keluar dari Sistem?</h3>
            <p className="text-sm text-slate-500">Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk mengakses panel admin.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm">
                Batal
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setShowLogoutModal(false);
                  setIsAuthenticated(false);
                  setUser(null);
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors text-sm shadow-sm shadow-rose-200"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
