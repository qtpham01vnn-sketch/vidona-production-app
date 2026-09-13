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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl lg:hidden no-print safe-area-bottom">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onSelectPage(item.key)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-extrabold bg-sky-50 dark:bg-sky-950/60 scale-105'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] leading-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Nút mở Menu đầy đủ */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-all"
      >
        <Menu size={19} className="stroke-[1.8]" />
        <span className="text-[10px] leading-tight">Thêm</span>
      </button>
    </nav>
  );
};
