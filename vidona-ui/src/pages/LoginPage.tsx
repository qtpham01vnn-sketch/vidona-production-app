import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../contexts/AuthContext';
import { Lock, UserCheck, Shield, KeyRound, Building2, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginByPin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (pinCode: string) => {
    if (loginByPin(pinCode)) {
      setError('');
    } else {
      setError('Mã PIN không chính xác. Vui lòng thử lại!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 mx-auto flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-500/30">
            V
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">VIDONA PXSX</h1>
          <p className="text-xs text-slate-500">Cổng Đăng Nhập Quản Lý KCS & Kho Nguyên Liệu</p>
        </div>

        {/* PIN Input */}
        <form onSubmit={e => { e.preventDefault(); handleLogin(pin); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nhập Mã PIN 4 Số Của Bạn:
            </label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => { setPin(e.target.value); setError(''); }}
                placeholder="••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center tracking-[0.5em] text-xl font-black focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 font-semibold text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition"
          >
            Đăng Nhập Vào Hệ Thống
          </button>
        </form>

        {/* Quick Test Presets */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
            ⚡ Mã PIN Đăng Nhập Nhanh Theo Vai Trò
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {PRESET_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => handleLogin(u.pin_code)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-left transition"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">{u.full_name}</div>
                <div className="text-[10px] text-blue-600 font-mono font-bold">PIN: {u.pin_code}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
