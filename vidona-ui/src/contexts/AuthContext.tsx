import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loginByPin: (pin: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isManagement: boolean;
  isKCS: boolean;
  isKho: boolean;
}

export const PRESET_USERS: User[] = [
  { id: 1, username: 'admin', full_name: 'Nguyễn Văn Viện', chuc_danh: 'Ban Giám Đốc (Phê duyệt)', role: 'ADMIN', pin_code: '0179', phone: '0901234567' },
  { id: 2, username: 'quanly', full_name: 'Lê Văn Quản Đốc', chuc_danh: 'Quản Đốc Phân Xưởng', role: 'MANAGEMENT', pin_code: '4444', phone: '0912345678' },
  { id: 3, username: 'tp_ktcn', full_name: 'Vũ Văn Bảy', chuc_danh: 'Trưởng Phòng KTCN', role: 'MANAGEMENT', pin_code: '3333', phone: '0987654321' },
  { id: 4, username: 'kcs_nhanvien', full_name: 'Nguyễn Ngọc Thiệu', chuc_danh: 'KCS Kiểm Tra Nguyên Liệu', role: 'KCS', pin_code: '1234', phone: '0978123456' },
  { id: 5, username: 'thukho', full_name: 'Trần Văn Kho', chuc_danh: 'Thủ Kho Nguyên Liệu', role: 'KHO', pin_code: '2222', phone: '0934567890' },
  { id: 6, username: 'congnhan', full_name: 'Trần Thị Bình', chuc_danh: 'Công Nhân Tổ Men', role: 'WORKER', pin_code: '5678', phone: '0965432198' }
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginByPin: () => false,
  logout: () => {},
  isAdmin: false,
  isManagement: false,
  isKCS: false,
  isKho: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vidona_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return PRESET_USERS[0];
  });

  const loginByPin = (pin: string) => {
    const found = PRESET_USERS.find(u => u.pin_code === pin);
    if (found) {
      setUser(found);
      localStorage.setItem('vidona_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vidona_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManagement = user?.role === 'MANAGEMENT' || isAdmin;
  const isKCS = user?.role === 'KCS' || isManagement;
  const isKho = user?.role === 'KHO' || isManagement;

  return (
    <AuthContext.Provider value={{ user, loginByPin, logout, isAdmin, isManagement, isKCS, isKho }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
