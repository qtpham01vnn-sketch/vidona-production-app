import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { LoginPage } from './pages/LoginPage';
import { TrangChu } from './pages/TrangChu';
import { NhapKhoBM0307Page } from './pages/NhapKhoBM0307Page';
import { TraCuuTCCSPage } from './pages/TraCuuTCCSPage';
import { KhoNVLPage } from './pages/KhoNVLPage';
import { SanLuongPage } from './pages/SanLuongPage';
import { TroLyAIPage } from './pages/TroLyAIPage';
import { QuanLyTaiKhoanPage } from './pages/QuanLyTaiKhoanPage';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('bm0307');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'trang-chu':
        return <TrangChu onNavigate={setCurrentPage} />;
      case 'bm0307':
        return <NhapKhoBM0307Page />;
      case 'tccs':
        return <TraCuuTCCSPage />;
      case 'kho':
        return <KhoNVLPage />;
      case 'san-luong':
        return <SanLuongPage />;
      case 'tai-khoan':
        return <QuanLyTaiKhoanPage />;
      case 'ai':
        return <TroLyAIPage />;
      default:
        return <NhapKhoBM0307Page />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0b1329] text-slate-900 dark:text-slate-100">
      {/* Sidebar Desktop & Mobile Drawer */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          onSelectPage={setCurrentPage}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 p-3 sm:p-5 md:p-6">
          {renderContent()}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onOpenMenu={() => setIsMobileOpen(true)}
        />
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
