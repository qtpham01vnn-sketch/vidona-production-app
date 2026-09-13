import React from 'react';
import { LayoutDashboard, FileText, Package, BookOpen, Menu } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  onOpenMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onSelectPage, onOpenMenu }) => {
  const NAV_ITEMS = [
    { key: 'trang-chu', label: 'Tổng Quan', icon: LayoutDashboard },
    { key: 'bm0307', label: 'BM.03.07', icon: FileText },
    { key: 'kho', label: 'Kho NVL', icon: Package },
    { key: 'tccs', label: 'TCCS 41', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-[#0b1329]/98 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl lg:hidden no-print safe-area-bottom">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelectPage(item.key)}
            className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-black bg-sky-50 dark:bg-sky-950/70 scale-105 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-xs leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* Nút mở Menu đầy đủ */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-1.5 py-1.5 px-3 rounded-2xl text-slate-500 dark:text-slate-400 font-semibold hover:text-sky-600 dark:hover:text-sky-400 transition-all"
      >
        <Menu size={22} className="stroke-[1.8]" />
        <span className="text-xs leading-none">Thêm</span>
      </button>
    </nav>
  );
};
