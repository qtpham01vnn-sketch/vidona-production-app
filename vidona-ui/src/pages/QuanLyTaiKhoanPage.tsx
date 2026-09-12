import React, { useState, useEffect, useRef } from 'react';
import { User, ActivationRequest } from '../types';
import { 
  getStoredUsers, saveStoredUsers, fetchUsersFromSupabase,
  getStoredActivationRequests, approveActivationRequest,
  downloadNhanSuExcelTemplate, parseNhanSuExcelFiles
} from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, UserPlus, FileSpreadsheet, Download, Search, Edit3, Trash2, 
  Lock, Unlock, CheckCircle2, XCircle, AlertCircle, RefreshCw, X, Shield, 
  KeyRound, Mail, Phone, Building2, UserCheck, Layers
} from 'lucide-react';

export const QuanLyTaiKhoanPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [activationRequests, setActivationRequests] = useState<ActivationRequest[]>(getStoredActivationRequests);
  const [activeTab, setActiveTab] = useState<'USERS' | 'REQUESTS'>('USERS');

  // Filter & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal Add/Edit User
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  // Modal Import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Approve Request
  const [approvingReq, setApprovingReq] = useState<ActivationRequest | null>(null);
  const [assignRole, setAssignRole] = useState<User['role']>('KCS');
  const [assignPin, setAssignPin] = useState('');

  const loadData = async () => {
    const list = getStoredUsers();
    setUsers(list);
    setActivationRequests(getStoredActivationRequests());
    try {
      const cloudUsers = await fetchUsersFromSupabase();
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    } catch (e) {
      console.warn('Sync users error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = 
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.ma_nv && u.ma_nv.toLowerCase().includes(search.toLowerCase())) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      u.chuc_danh.toLowerCase().includes(search.toLowerCase()) ||
      (u.phong_ban && u.phong_ban.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  const pendingRequests = activationRequests.filter(r => r.trang_thai === 'CHO_DUYET');

  const handleOpenAddUser = () => {
    setEditingUser({
      id: 'usr-' + Date.now(),
      ma_nv: 'VD-' + Math.floor(100 + Math.random() * 900),
      username: '',
      full_name: '',
      chuc_danh: 'Nhân Viên',
      phong_ban: 'Phân Xưởng Men',
      role: 'KCS',
      pin_code: Math.floor(1000 + Math.random() * 9000).toString(),
      password: '123',
      phone: '',
      email: '',
      is_active: true
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.full_name || !editingUser.pin_code) return;

    const list = [...users];
    const usernameFinal = editingUser.username?.trim() || editingUser.ma_nv?.toLowerCase() || ('user' + Date.now().toString().slice(-4));
    const userToSave: User = {
      id: editingUser.id || ('usr-' + Date.now()),
      username: usernameFinal,
      ma_nv: editingUser.ma_nv?.trim() || 'VD-000',
      full_name: editingUser.full_name.trim(),
      chuc_danh: editingUser.chuc_danh?.trim() || 'Nhân Viên',
      phong_ban: editingUser.phong_ban || 'Phân Xưởng Men',
      role: editingUser.role || 'WORKER',
      pin_code: editingUser.pin_code.trim(),
      password: editingUser.password || '123',
      phone: editingUser.phone?.trim() || '',
      email: editingUser.email?.trim() || '',
      is_active: editingUser.is_active !== false
    };

    const idx = list.findIndex(u => u.id === userToSave.id);
    if (idx >= 0) {
      list[idx] = userToSave;
    } else {
      list.push(userToSave);
    }

    setUsers(list);
    await saveStoredUsers(list);
    setShowUserModal(false);
  };

  const handleToggleActive = async (u: User) => {
    const updated = users.map(item => item.id === u.id ? { ...item, is_active: !item.is_active } : item);
    setUsers(updated);
    await saveStoredUsers(updated);
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUser?.id) {
      alert('Không thể xóa tài khoản của chính bạn!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.full_name}" (${u.ma_nv})?`)) return;
    const filtered = users.filter(item => item.id !== u.id);
    setUsers(filtered);
    await saveStoredUsers(filtered);
  };

  const handleApprove = async () => {
    if (!approvingReq) return;
    const pin = assignPin || Math.floor(1000 + Math.random() * 9000).toString();
    await approveActivationRequest(approvingReq.id, assignRole, pin);
    setApprovingReq(null);
    loadData();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    setImportErrors([]);
    setImportedCount(null);

    const res = await parseNhanSuExcelFiles(Array.from(files));
    setIsProcessingFiles(false);
    setImportedCount(res.count);
    setImportErrors(res.errors);
    if (res.count > 0) {
      loadData();
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">🔴 Admin Quản Trị</span>;
      case 'MANAGEMENT': return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">🟡 Ban Quản Lý</span>;
      case 'KCS': return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">🟢 KCS Kiểm Tra</span>;
      case 'KHO': return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">🟣 Thủ Kho NVL</span>;
      default: return <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">⚪ Công Nhân</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Users className="text-blue-600 dark:text-sky-400" size={28} />
            Quản Lý Tài Khoản & Nhân Sự PXSX
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân quyền 5 cấp vai trò, duyệt yêu cầu cấp mã PIN và Import danh sách nhân viên từ nhiều file Excel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadNhanSuExcelTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center gap-2 shadow-sm transition"
            title="Tải file Excel mẫu để điền danh sách nhân viên"
          >
            <Download size={15} className="text-blue-600" />
            <span>Tải File Mẫu Excel</span>
          </button>

          <button
            onClick={() => { setShowImportModal(true); setImportedCount(null); setImportErrors([]); }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center gap-2 shadow-sm transition"
          >
            <FileSpreadsheet size={15} />
            <span>📥 Import Đa File Excel</span>
          </button>

          <button
            onClick={handleOpenAddUser}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition"
          >
            <UserPlus size={15} />
            <span>+ Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={15} />
          <span>Danh Sách Nhân Viên ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'REQUESTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail size={15} />
          <span>Yêu Cầu Kích Hoạt Cấp PIN</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'USERS' ? (
        <>
          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="sm:col-span-2 relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo Mã NV, Họ tên, SĐT, Email, Chức danh, Phòng ban..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">-- Tất Cả Vai Trò ({users.length}) --</option>
                <option value="ADMIN">🔴 Admin Quản Trị</option>
                <option value="MANAGEMENT">🟡 Ban Quản Lý (Quản đốc, TP)</option>
                <option value="KCS">🟢 KCS Kiểm Tra</option>
                <option value="KHO">🟣 Thủ Kho NVL</option>
                <option value="WORKER">⚪ Công Nhân Tổ Men</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Mã NV / User</th>
                    <th className="py-3.5 px-4">Họ Và Tên</th>
                    <th className="py-3.5 px-4">Chức Danh & Phòng Ban</th>
                    <th className="py-3.5 px-4">Vai Trò Phân Quyền</th>
                    <th className="py-3.5 px-4 text-center">Mã PIN (Xưởng)</th>
                    <th className="py-3.5 px-4 text-center">Mật Khẩu</th>
                    <th className="py-3.5 px-4">Liên Hệ</th>
                    <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        <div>{u.ma_nv || '---'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">@{u.username}</div>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                        {u.full_name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{u.chuc_danh}</div>
                        <div className="text-[10px] text-slate-400">{u.phong_ban}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-black text-blue-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700">
                          {u.pin_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {u.password || '123'}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {u.phone && <div className="text-slate-600 dark:text-slate-300">📞 {u.phone}</div>}
                        {u.email && <div className="text-slate-400 truncate max-w-[140px]">✉️ {u.email}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            <XCircle size={13} /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded-lg ${u.is_active !== false ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'} dark:hover:bg-slate-800`}
                            title={u.is_active !== false ? 'Khóa tài khoản' : 'Mở khóa'}
                          >
                            {u.is_active !== false ? <Lock size={15} /> : <Unlock size={15} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* TAB YÊU CẦU CẤP TÀI KHOẢN */
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Danh Sách Yêu Cầu Cấp Tài Khoản Mới</h3>
              <p className="text-xs text-slate-500">Dành cho nhân sự mới đăng ký từ link app</p>
            </div>
          </div>

          {activationRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Hiện tại chưa có yêu cầu cấp tài khoản nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Họ Và Tên</th>
                    <th className="py-3 px-4">Mã NV Đề Xuất</th>
                    <th className="py-3 px-4">Email & SĐT</th>
                    <th className="py-3 px-4">Phòng Ban / Vị Trí</th>
                    <th className="py-3 px-4">Lý Do Truy Cập</th>
                    <th className="py-3 px-4">Ngày Gửi</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {activationRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{req.full_name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sky-600">{req.ma_nv || '---'}</td>
                      <td className="py-3 px-4">
                        <div>✉️ {req.email}</div>
                        <div>📞 {req.so_dien_thoai}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{req.phong_ban}</div>
                        <div className="text-[10px] text-slate-400">{req.chuc_vu || 'Nhân viên'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {req.ly_do || '---'}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {new Date(req.ngay_gui).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {req.trang_thai === 'DA_DUYET' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-600">
                            ✓ Đã Duyệt (PIN: {req.pin_cap})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 animate-pulse">
                            ⏳ Chờ Duyệt
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {req.trang_thai === 'CHO_DUYET' && (
                          <button
                            onClick={() => {
                              setApprovingReq(req);
                              setAssignPin(Math.floor(1000 + Math.random() * 9000).toString());
                              setAssignRole('KCS');
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                          >
                            ✓ Duyệt & Cấp PIN
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / SỬA TÀI KHOẢN */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck size={22} className="text-blue-600" />
              {editingUser.id?.toString().startsWith('usr-') ? 'Thêm Nhân Viên Mới' : 'Chỉnh Sửa Thông Tin Nhân Viên'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Nhân Viên (*):</label>
                  <input
                    type="text"
                    required
                    value={editingUser.ma_nv || ''}
                    onChange={e => setEditingUser({ ...editingUser, ma_nv: e.target.value })}
                    placeholder="VD: VD-008"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Đăng Nhập:</label>
                  <input
                    type="text"
                    value={editingUser.username || ''}
                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="VD: nam.nv"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và Tên (*):</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ''}
                  onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="VD: Nguyễn Văn Nam"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chức Danh (*):</label>
                  <input
                    type="text"
                    required
                    value={editingUser.chuc_danh || ''}
                    onChange={e => setEditingUser({ ...editingUser, chuc_danh: e.target.value })}
                    placeholder="VD: Nhân Viên KCS"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng Ban / Phân Xưởng:</label>
                  <select
                    value={editingUser.phong_ban || 'Phân Xưởng Men'}
                    onChange={e => setEditingUser({ ...editingUser, phong_ban: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Phân Xưởng Men">Phân Xưởng Men</option>
                    <option value="Phân Xưởng Xương">Phân Xưởng Xương</option>
                    <option value="Phòng Kỹ Thuật Công Nghệ">Phòng Kỹ Thuật Công Nghệ</option>
                    <option value="Tổ KCS">Tổ KCS</option>
                    <option value="Kho Vật Tư Nguyên Liệu">Kho Vật Tư Nguyên Liệu</option>
                    <option value="Ban Giám Đốc">Ban Giám Đốc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vai Trò Phân Quyền (*):</label>
                  <select
                    value={editingUser.role || 'KCS'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="ADMIN">🔴 ADMIN (Giám Đốc)</option>
                    <option value="MANAGEMENT">🟡 MANAGEMENT (Quản Đốc / TP)</option>
                    <option value="KCS">🟢 KCS (Kiểm Tra)</option>
                    <option value="KHO">🟣 KHO (Thủ Kho)</option>
                    <option value="WORKER">⚪ WORKER (Công Nhân)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã PIN 4 Số (*):</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editingUser.pin_code || ''}
                    onChange={e => setEditingUser({ ...editingUser, pin_code: e.target.value })}
                    placeholder="1234"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-center text-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mật Khẩu:</label>
                  <input
                    type="text"
                    value={editingUser.password || '123'}
                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="123"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số Điện Thoại:</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="user@vidona.vn"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT ĐA FILE EXCEL NHÂN SỰ */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Import Nhân Sự Bằng File Excel</h3>
                <p className="text-xs text-slate-500">Hỗ trợ chọn nhiều file (.xlsx, .xls, .csv) cùng lúc</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl p-6 text-center cursor-pointer transition"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet size={36} className="mx-auto text-emerald-500 mb-2" />
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Bấm để chọn file Excel hoặc Kéo thả nhiều file vào đây
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Hệ thống tự nhận diện các cột: Mã NV, Họ tên, Chức danh, Phòng ban, Mã PIN, Vai trò...
                </div>
              </div>

              {isProcessingFiles && (
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-bold text-center animate-pulse">
                  Đang phân tích các file Excel và đồng bộ tài khoản...
                </div>
              )}

              {importedCount !== null && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs space-y-1">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    <span>Đã Import Thành Công {importedCount} Nhân Viên!</span>
                  </div>
                  <p className="text-[11px]">Dữ liệu đã được nạp vào hệ thống và đồng bộ lên Supabase Cloud.</p>
                </div>
              )}

              {importErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs space-y-1 max-h-32 overflow-y-auto">
                  <div className="font-bold">Một số cảnh báo:</div>
                  {importErrors.map((err, i) => <div key={i}>• {err}</div>)}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={downloadNhanSuExcelTemplate}
                  className="text-blue-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Download size={13} /> Tải file mẫu .xlsx
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DUYỆT YÊU CẦU CẤP TÀI KHOẢN */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setApprovingReq(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <UserCheck size={22} className="text-emerald-500" />
              Phê Duyệt & Cấp Mã PIN
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 mb-4">
              <div>Họ và tên: <b className="text-slate-900 dark:text-white">{approvingReq.full_name}</b></div>
              <div>Mã NV: <b className="font-mono text-sky-600">{approvingReq.ma_nv || 'Tự sinh'}</b></div>
              <div>Email: {approvingReq.email} | SĐT: {approvingReq.so_dien_thoai}</div>
              <div>Phòng ban: {approvingReq.phong_ban} ({approvingReq.chuc_vu || 'Nhân viên'})</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gán Vai Trò Phân Quyền (*):</label>
                <select
                  value={assignRole}
                  onChange={e => setAssignRole(e.target.value as User['role'])}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="KCS">🟢 KCS (Đo kiểm & Lập phiếu BM.03.07)</option>
                  <option value="MANAGEMENT">🟡 Ban Quản Lý (Quản đốc / Phụ trách KCS)</option>
                  <option value="KHO">🟣 Thủ Kho (Nhập kho NVL)</option>
                  <option value="WORKER">⚪ Công Nhân (Tra cứu TCCS & Xem sản lượng)</option>
                  <option value="ADMIN">🔴 ADMIN (Ban Giám Đốc)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cấp Mã PIN 4 Số (*):</label>
                <input
                  type="text"
                  maxLength={4}
                  value={assignPin}
                  onChange={e => setAssignPin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-black text-center text-emerald-600 text-base"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setApprovingReq(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow"
                >
                  Xác Nhận Kích Hoạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
