import React, { useState } from 'react';
import { BookOpen, Lock, Mail } from 'lucide-react';
import api from './api';

interface LoginProps {
  onLogin: (userData: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Tembak API Login Laravel
    api
      .post('/login', { email, password })
      .then((res) => {
        // Simpan tiket dan identitas ke brankas browser
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data));

        // Beri tahu App.tsx bahwa login sukses
        onLogin(res.data.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Gagal terhubung ke server.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-950 px-8 py-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900/50 mb-4">
            <BookOpen className="text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PerpusAdmin</h1>
          <p className="text-indigo-200 text-sm mt-2">Sistem Informasi Manajemen Perpustakaan</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="admin@perpus.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
              {loading ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
