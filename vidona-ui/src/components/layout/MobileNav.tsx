import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileSpreadsheet, BookOpen, Layers, LineChart, Bot, PhoneCall } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const NAV_ITEMS = [
    { to: '/', label: 'Tổng Quan', icon: Layers },
    { to: '/nhap-kho-bm0307', label: 'BM.03.07', icon: FileSpreadsheet },
    { to: '/tra-cuu-tccs', label: 'TCCS 41', icon: BookOpen },
    { to: '/kho-nvl', label: 'Kho NVL', icon: Layers },
    { to: '/san-luong', label: 'Sản Lượng', icon: LineChart },
    { to: '/tro-ly-ai', label: 'Trợ Lý AI', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition text-[11px] font-bold ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
