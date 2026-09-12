import React from 'react';
import { Menu, Sun, Moon, LogOut, Shield, Bot, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onSelectPage: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onSelectPage }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`sticky top-0 z-20 h-14 border-b flex items-center justify-between px-4 transition-colors ${
      theme === 'dark' 
        ? 'bg-[#0f172a]/90 backdrop-blur border-slate-800 text-slate-100' 
        : 'bg-white/90 backdrop-blur border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-lg md:hidden text-sky-400 hover:bg-slate-800/40"
          title="Mở menu"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-400">
          <span>Hệ Thống Số Hóa Quản Lý Phân Xưởng Sản Xuất & KCS</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectPage('ai')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition-colors"
        >
          <Bot size={14} /> Tra Cứu TCCS AI
        </button>

        <button
          onClick={toggleTheme}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Đổi giao diện Sáng / Tối"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
        </button>

        {user && (
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-700/40">
            <div className="text-right">
              <div className="text-xs font-bold leading-tight">{user.full_name}</div>
              <div className="text-[10px] text-slate-400">{user.chuc_danh}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
