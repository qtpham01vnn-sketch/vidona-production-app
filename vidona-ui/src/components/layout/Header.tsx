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
    <header className={`sticky top-0 z-30 h-14 border-b flex items-center justify-between px-3 sm:px-4 transition-colors ${
      theme === 'dark' 
        ? 'bg-[#0f172a]/90 backdrop-blur border-slate-800 text-slate-100' 
        : 'bg-white/90 backdrop-blur border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl lg:hidden text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Mở menu điều hướng"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm lg:hidden shadow-sm">
            V
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-gradient">VIDONA PXSX</span>
          <span className="hidden lg:inline text-xs text-slate-400 font-normal pl-2 border-l border-slate-700/30">
            Hệ Thống Số Hóa Quản Lý Phân Xưởng & KCS
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onSelectPage('ai')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 transition-colors"
        >
          <Bot size={15} /> <span className="hidden sm:inline">Trợ Lý AI</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Đổi giao diện Sáng / Tối"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span className="hidden md:inline">{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
        </button>

        {user && (
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-700/40">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold leading-tight truncate max-w-[120px]">{user.full_name}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.chuc_danh}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
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
