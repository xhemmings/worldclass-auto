'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, HardHat } from 'lucide-react';

export default function TechLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/technician/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) { router.push('/technician/dashboard'); }
    else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || 'Invalid credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm">WC</span>
          <div>
            <p className="text-white font-black text-lg leading-tight">WorldClass Auto</p>
            <p className="text-gray-500 text-xs">Technician Portal</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <div className="flex items-center gap-2 mb-6">
            <HardHat size={16} className="text-primary" />
            <h1 className="text-white font-bold">Technician Sign In</h1>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 rounded-lg px-4 py-2.5">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-700 text-xs mt-6">Staff access only · WorldClass Auto Service Ltd.</p>
      </div>
    </div>
  );
}
