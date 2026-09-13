import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Target, Beaker, FileText, Package, 
  BookOpen, ChevronDown, ChevronRight, UserCheck, Users,
  LogOut, Sun, Moon, Bot, LineChart, Smartphone, Download, X, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    dieuhanh: true,
    kho_kcs: true,
    tccs: true,
    troly_ai: true
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaGuide, setShowPwaGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      setShowPwaGuide(true);
    }
  };

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNav = (page: string) => {
    onSelectPage(page);
    setIsMobileOpen(false);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">🔴 Admin Quản Trị</span>;
      case 'MANAGEMENT': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">🟡 Ban Quản Lý</span>;
      case 'KCS': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">🟢 KCS Kiểm Tra</span>;
      case 'KHO': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">🟣 Thủ Kho NVL</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">🟢 Nhân Viên</span>;
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 w-72 max-w-[85vw]
        flex flex-col border-r transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme === 'dark' ? 'bg-[#0b1329]/95 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              V
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                <span className="text-gradient">VIDONA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30">PXSX 4.0</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Công Ty Cổ Phần Gạch Men Vidona</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3 m-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{user.chuc_danh}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/40 text-xs">
              {getRoleBadge(user.role)}
              <button 
                onClick={logout}
                className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                title="Đăng xuất"
              >
                <LogOut size={13} /> Thoát
              </button>
            </div>
          </div>
        )}

        {/* 📱 NÚT CÀI ĐẶT ỨNG DỤNG (PWA) */}
        <div className="px-3 mb-2">
          <button
            onClick={handleInstallClick}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-500/20 transition-all border border-emerald-400/30"
          >
            <Smartphone size={15} />
            <span>{isInstalled ? '✓ Đã Cài Đặt Ứng Dụng' : '📱 Cài Đặt Ứng Dụng (PWA)'}</span>
          </button>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
          
          {/* Module 1: ĐIỀU HÀNH & TỔNG QUAN */}
          <div className="rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle('dieuhanh')}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard size={15} className="text-blue-600 dark:text-blue-400" /> 📊 ĐIỀU HÀNH & TỔNG QUAN
              </span>
              {expanded.dieuhanh ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expanded.dieuhanh && (
              <div className="mt-1 ml-3 pl-2 border-l border-blue-500/20 space-y-1">
                <button
                  onClick={() => handleNav('trang-chu')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'trang-chu' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  Dashboard Tổng Quan
                </button>
                <button
                  onClick={() => handleNav('san-luong')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'san-luong' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  Sản Lượng & Lỗi Hạ Loại (Pareto)
                </button>
              </div>
            )}
          </div>

          {/* Module 2: KHO & KCS NGUYÊN LIỆU (BM.03.07) */}
          <div className="rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle('kho_kcs')}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-sky-700 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <Package size={15} className="text-emerald-600 dark:text-emerald-400" /> 📦 KHO & KCS NGUYÊN VẬT LIỆU
              </span>
              {expanded.kho_kcs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expanded.kho_kcs && (
              <div className="mt-1 ml-3 pl-2 border-l border-emerald-500/30 space-y-1">
                <button
                  onClick={() => handleNav('bm0307')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    currentPage === 'bm0307' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 border-l-2 border-sky-500 font-extrabold' 
                      : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span>Phiếu Nhập Kho (BM.03.07)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">TCCS</span>
                </button>
                <button
                  onClick={() => handleNav('kho')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'kho' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  Quản Lý Tồn Kho NVL & Chỉ Số
                </button>
              </div>
            )}
          </div>

          {/* Module 3: BỘ TIÊU CHUẨN CƠ SỞ (TC.09.01) */}
          <div className="rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle('tccs')}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen size={15} className="text-purple-600 dark:text-purple-400" /> 🧪 BỘ TIÊU CHUẨN KỸ THUẬT
              </span>
              {expanded.tccs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expanded.tccs && (
              <div className="mt-1 ml-3 pl-2 border-l border-purple-500/20 space-y-1">
                <button
                  onClick={() => handleNav('tccs')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                    currentPage === 'tccs' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span>Bộ TCCS TC.09.01</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold">41 Bảng</span>
                </button>
              </div>
            )}
          </div>

          {/* Module 4: TRỢ LÝ AI TC.09 */}
          <div className="rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle('troly_ai')}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bot size={15} className="text-sky-600 dark:text-sky-400" /> 🤖 TRỢ LÝ KỸ THUẬT AI
              </span>
              {expanded.troly_ai ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {expanded.troly_ai && (
              <div className="mt-1 ml-3 pl-2 border-l border-sky-500/20 space-y-1">
                <button
                  onClick={() => handleNav('ai')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'ai' 
                      ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  Trợ Lý AI TC.09 (Hỏi Đáp & Soát Lỗi)
                </button>
              </div>
            )}
          </div>

          {/* Module 5: QUẢN LÝ NHÂN SỰ & TÀI KHOẢN (CHỈ DUY NHẤT ADMIN) */}
          {user?.role === 'ADMIN' && (
            <div className="rounded-lg overflow-hidden">
              <button 
                onClick={() => toggle('nhansu')}
                className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users size={15} className="text-indigo-600 dark:text-indigo-400" /> 👥 QUẢN TRỊ & NHÂN SỰ
                </span>
                {expanded.nhansu ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expanded.nhansu && (
                <div className="mt-1 ml-3 pl-2 border-l border-indigo-500/20 space-y-1">
                  <button
                    onClick={() => handleNav('tai-khoan')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      currentPage === 'tai-khoan' 
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-400 font-bold border-l-2 border-sky-500' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span>Quản Lý Tài Khoản & Cấp PIN</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold">Admin</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-inherit text-center text-[11px] text-slate-500">
          VIDONA Production © 2026
        </div>
      </aside>

      {/* MODAL HƯỚNG DẪN CÀI ĐẶT PWA */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-slate-100 shadow-2xl relative">
            <button 
              onClick={() => setShowPwaGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Smartphone size={26} />
            </div>

            <h3 className="font-extrabold text-lg text-white mb-2">Cài Đặt Ứng Dụng Vidona PXSX</h3>
            <p className="text-xs text-slate-300 mb-4">
              Cài đặt ứng dụng trực tiếp lên màn hình điện thoại hoặc máy tính để mở nhanh không cần gõ link:
            </p>

            <div className="space-y-3 text-xs bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="flex gap-2.5">
                <span className="font-bold text-sky-400 shrink-0">💻 Trên Máy Tính:</span>
                <span>Nhìn lên thanh địa chỉ của trình duyệt Chrome/Edge, bấm biểu tượng <b className="text-emerald-400">⊕ Cài đặt</b> hoặc chọn Menu 3 chấm ➔ <b>Cài đặt ứng dụng</b>.</span>
              </div>
              <div className="flex gap-2.5">
                <span className="font-bold text-emerald-400 shrink-0">📱 Android (Chrome):</span>
                <span>Bấm nút Menu 3 chấm góc phải trên ➔ Chọn <b>"Thêm vào Màn hình chính"</b> hoặc <b>"Cài đặt ứng dụng"</b>.</span>
              </div>
              <div className="flex gap-2.5">
                <span className="font-bold text-amber-400 shrink-0">🍏 iPhone (Safari):</span>
                <span>Bấm nút <b>Chia sẻ</b> (mũi tên hướng lên ở dưới cùng) ➔ Chọn <b>"Thêm vào MH chính" (Add to Home Screen)</b>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowPwaGuide(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Đã Hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
