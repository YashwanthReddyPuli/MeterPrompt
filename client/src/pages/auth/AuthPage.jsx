import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, RefreshCw, LogIn, UserPlus, Terminal, Shield, ArrowRight } from 'lucide-react';
import logoIcon from '../../assets/logo-icon.svg';

export default function AuthPage({ authMode, setAuthMode, setCurrentRoute }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let res;
    if (authMode === 'login') {
      res = await login(form.email, form.password);
    } else {
      res = await register(form.name, form.email, form.password, form.role);
    }

    if (res && res.success) {
      if (form.role === 'admin' || (res.user && res.user.role === 'admin')) {
        setCurrentRoute('console-overview');
      } else {
        setCurrentRoute('console-overview');
      }
    } else {
      setError(res ? res.message : 'An error occurred during authentication.');
    }
    setLoading(false);
  };

  return (
    <div className="py-10 max-w-md mx-auto">
      <div className="bg-white border border-zinc-300 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <img src={logoIcon} alt="MeterPrompt Icon" className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-[#1e1f24] tracking-tight">
            {authMode === 'login' ? 'Sign In to MeterPrompt' : 'Create Developer Account'}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {authMode === 'login' ? 'Access your API keys, metered usage, and subscription plans' : 'Get started with instant AI proxy keys & tiered plans'}
          </p>
        </div>

        {/* HIGH-CONTRAST SEGMENTED TAB SWITCHER */}
        <div className="flex bg-zinc-200/70 p-1 rounded-xl border border-zinc-300 text-xs font-bold">
          <button 
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              authMode === 'login' 
                ? 'bg-white text-zinc-900 font-bold shadow-sm border border-zinc-200/80' 
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              authMode === 'register' 
                ? 'bg-white text-zinc-900 font-bold shadow-sm border border-zinc-200/80' 
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            Register
          </button>
        </div>

        {/* HIGH-CONTRAST ERROR BANNER */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed font-medium animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="font-extrabold text-[#1e1f24] block mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 text-sm font-medium outline-none transition-all duration-150 focus:outline-none focus-visible:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20"
                placeholder="Jane Developer"
              />
            </div>
          )}

          <div>
            <label className="font-extrabold text-[#1e1f24] block mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 text-sm font-medium outline-none transition-all duration-150 focus:outline-none focus-visible:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20"
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label className="font-extrabold text-[#1e1f24] block mb-1">Password</label>
            <input 
              type="password" 
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 text-sm font-medium outline-none transition-all duration-150 focus:outline-none focus-visible:outline-none focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20"
              placeholder="••••••••"
            />
          </div>

          {/* PREMIUM TWO-TILE ROLE SELECTOR */}
          {authMode === 'register' && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-zinc-700">
                Account Role Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Developer Option */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'customer' })}
                  className={`relative flex flex-col justify-between p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer border-2 ${
                    form.role === 'customer'
                      ? 'border-[#5865f2] bg-[#5865f2]/5 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`font-mono text-sm font-bold ${form.role === 'customer' ? 'text-[#5865f2]' : 'text-zinc-600'}`}>
                      &gt;_
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        form.role === 'customer' ? 'border-[#5865f2]' : 'border-zinc-300'
                      }`}
                    >
                      {form.role === 'customer' && <span className="w-2 h-2 rounded-full bg-[#5865f2]" />}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 leading-tight">Developer</p>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                      Access API gateway &amp; subscribe to tiers
                    </p>
                  </div>
                </button>

                {/* Billing Admin Option */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'admin' })}
                  className={`relative flex flex-col justify-between p-3.5 rounded-xl text-left transition-all duration-150 cursor-pointer border-2 ${
                    form.role === 'admin'
                      ? 'border-[#5865f2] bg-[#5865f2]/5 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Shield className={`w-4 h-4 ${form.role === 'admin' ? 'text-[#5865f2]' : 'text-zinc-600'}`} />
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        form.role === 'admin' ? 'border-[#5865f2]' : 'border-zinc-300'
                      }`}
                    >
                      {form.role === 'admin' && <span className="w-2 h-2 rounded-full bg-[#5865f2]" />}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 leading-tight">Billing Admin</p>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                      Manage plan tiers, dunning &amp; platform MRR
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-[#5865f2]/25 hover:shadow-lg hover:shadow-[#5865f2]/35 flex items-center justify-center gap-2 mt-4 text-xs active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
