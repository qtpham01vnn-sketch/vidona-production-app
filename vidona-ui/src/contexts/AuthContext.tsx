import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredUsers, findUserByCredentials, fetchUsersFromSupabase } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loginByPin: (pin: string) => boolean;
  loginByPassword: (identifier: string, pass: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isManagement: boolean;
  isKCS: boolean;
  isKho: boolean;
  isWorker: boolean;
  // Permissions
  canEditBM0307: boolean;
  canCreateBM0307: boolean;
  canApproveStep5: boolean;
  canApproveStep4: boolean;
  canApproveStep3: boolean;
  canEditTCCS: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginByPin: () => false,
  loginByPassword: () => false,
  logout: () => {},
  isAdmin: false,
  isManagement: false,
  isKCS: false,
  isKho: false,
  isWorker: false,
  canEditBM0307: false,
  canCreateBM0307: false,
  canApproveStep5: false,
  canApproveStep4: false,
  canApproveStep3: false,
  canEditTCCS: false,
  canManageUsers: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vidona_user_current');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    fetchUsersFromSupabase();
  }, []);

  const loginByPin = (pin: string): boolean => {
    const found = findUserByCredentials('', pin, true);
    if (found) {
      setUser(found);
      localStorage.setItem('vidona_user_current', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const loginByPassword = (identifier: string, pass: string): boolean => {
    const found = findUserByCredentials(identifier, pass, false);
    if (found) {
      setUser(found);
      localStorage.setItem('vidona_user_current', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vidona_user_current');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.ma_nv === 'VD-001';
  const isManagement = user?.role === 'MANAGEMENT' && !isAdmin;
  const isKCS = user?.role === 'KCS';
  const isKho = user?.role === 'KHO' || user?.ma_nv === 'VD-005';
  const isWorker = user?.role === 'WORKER';

  // Specific Granular Permissions CHUẨN XÁC THEO QUY TRÌNH NHÀ MÁY:
  // 1. Chỉ DUY NHẤT ADMIN được quản lý tài khoản & cấp PIN & xóa tài khoản
  const canManageUsers = isAdmin;

  // 2. Chỉ DUY NHẤT P.KHTH / THỦ KHO (VD-005) hoặc ADMIN được bấm "+ Lập Phiếu BM.03.07 Mới"
  // Quản Đốc PX (VD-002), TP.KTCN (VD-003), KCS (VD-004), Công Nhân (VD-006) KHÔNG ĐƯỢC LẬP PHIẾU MỚI
  const canCreateBM0307 = isKho || isAdmin;

  const canEditTCCS = isAdmin;
  const canApproveStep5 = isAdmin;
  const canApproveStep4 = user?.username === 'quanly' || user?.ma_nv === 'VD-002';
  const canApproveStep3 = user?.username === 'tp_ktcn' || user?.ma_nv === 'VD-003';
  const canEditBM0307 = isKho || isKCS || isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      loginByPin,
      loginByPassword,
      logout,
      isAdmin,
      isManagement,
      isKCS,
      isKho,
      isWorker,
      canEditBM0307,
      canCreateBM0307,
      canApproveStep5,
      canApproveStep4,
      canApproveStep3,
      canEditTCCS,
      canManageUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
