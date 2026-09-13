import { User, ActivationRequest } from '../types';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', ma_nv: 'VD-001', full_name: 'Nguyễn Văn Viện', chuc_danh: 'Ban Giám Đốc', phong_ban: 'Ban Giám Đốc', role: 'ADMIN', pin_code: '0179', password: '123', phone: '0901234567', email: 'vien.nv@vidona.vn', is_active: true },
  { id: '2', username: 'quanly', ma_nv: 'VD-002', full_name: 'Lê Văn Quản Đốc', chuc_danh: 'Quản Đốc Phân Xưởng', phong_ban: 'Phân Xưởng Men', role: 'MANAGEMENT', pin_code: '4444', password: '123', phone: '0912345678', email: 'quandoc@vidona.vn', is_active: true },
  { id: '3', username: 'tp_ktcn', ma_nv: 'VD-003', full_name: 'Vũ Văn Bảy', chuc_danh: 'Trưởng Phòng KTCN', phong_ban: 'Phòng Kỹ Thuật Công Nghệ', role: 'MANAGEMENT', pin_code: '3333', password: '123', phone: '0987654321', email: 'bay.vv@vidona.vn', is_active: true },
  { id: '4', username: 'kcs_nhanvien', ma_nv: 'VD-004', full_name: 'Nguyễn Ngọc Thiệu', chuc_danh: 'KCS Kiểm Tra Nguyên Liệu', phong_ban: 'Tổ KCS', role: 'KCS', pin_code: '1234', password: '123', phone: '0978123456', email: 'thieu.nn@vidona.vn', is_active: true },
  { id: '5', username: 'thukho', ma_nv: 'VD-005', full_name: 'Trần Văn Kho', chuc_danh: 'P.KHTH / Thủ Kho Lập Phiếu', phong_ban: 'Phòng KHTH & Kho', role: 'KHO', pin_code: '2222', password: '123', phone: '0934567890', email: 'kho.tv@vidona.vn', is_active: true },
  { id: '6', username: 'congnhan', ma_nv: 'VD-006', full_name: 'Trần Thị Bình', chuc_danh: 'Công Nhân Tổ Men', phong_ban: 'Tổ Men', role: 'WORKER', pin_code: '5678', password: '123', phone: '0965432198', email: 'binh.tt@vidona.vn', is_active: true }
];

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem('vidona_users_list_v2');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('vidona_users_list_v2', JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const saveStoredUsers = async (users: User[]): Promise<void> => {
  localStorage.setItem('vidona_users_list_v2', JSON.stringify(users));
  try {
    for (const u of users) {
      await supabase.from('vidona_users').upsert(u);
    }
  } catch (e) {
    console.warn('Could not sync users to Supabase:', e);
  }
};

export const fetchUsersFromSupabase = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase.from('vidona_users').select('*');
    if (!error && data && data.length > 0) {
      localStorage.setItem('vidona_users_list_v2', JSON.stringify(data));
      return data as User[];
    } else if (!error && (!data || data.length === 0)) {
      const init = getStoredUsers();
      for (const u of init) {
        await supabase.from('vidona_users').upsert(u);
      }
      return init;
    }
  } catch (e) {
    console.warn('Network error fetching users:', e);
  }
  return getStoredUsers();
};

export const findUserByCredentials = (identifier: string, passOrPin: string, isPinMode: boolean): User | null => {
  const users = getStoredUsers();
  const idLower = identifier.trim().toLowerCase();
  
  if (isPinMode) {
    return users.find(u => (u.pin_code === passOrPin || u.password === passOrPin) && (u.is_active !== false)) || null;
  }

  return users.find(u => {
    const matchId = 
      u.username.toLowerCase() === idLower ||
      (u.ma_nv && u.ma_nv.toLowerCase() === idLower) ||
      (u.email && u.email.toLowerCase() === idLower) ||
      (u.phone && u.phone === identifier.trim());
    const matchPass = (u.password && u.password === passOrPin) || u.pin_code === passOrPin;
    return matchId && matchPass && (u.is_active !== false);
  }) || null;
};

// Activation Requests
export const getStoredActivationRequests = (): ActivationRequest[] => {
  const data = localStorage.getItem('vidona_activation_requests');
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return [];
};

export const submitActivationRequest = async (req: Omit<ActivationRequest, 'id' | 'trang_thai' | 'ngay_gui'>): Promise<{ success: boolean; message: string }> => {
  const list = getStoredActivationRequests();
  const newReq: ActivationRequest = {
    ...req,
    id: 'req-' + Date.now(),
    trang_thai: 'CHO_DUYET',
    ngay_gui: new Date().toISOString()
  };
  list.unshift(newReq);
  localStorage.setItem('vidona_activation_requests', JSON.stringify(list));

  try {
    await supabase.from('vidona_activation_requests').upsert(newReq);
  } catch (e) {
    console.warn('Could not sync request to Supabase:', e);
  }

  return {
    success: true,
    message: 'Yêu cầu của bạn đã được gửi đến Ban Quản Trị thành công! Mã PIN và thông tin đăng nhập sẽ được kích hoạt sau khi duyệt.'
  };
};

export const approveActivationRequest = async (reqId: string, assignedRole: User['role'], pin: string): Promise<void> => {
  const reqList = getStoredActivationRequests();
  const req = reqList.find(r => r.id === reqId);
  if (!req) return;

  req.trang_thai = 'DA_DUYET';
  req.pin_cap = pin;
  localStorage.setItem('vidona_activation_requests', JSON.stringify(reqList));

  // Tạo tài khoản User mới
  const users = getStoredUsers();
  const newUser: User = {
    id: 'usr-' + Date.now(),
    username: req.ma_nv ? req.ma_nv.toLowerCase() : (req.email.split('@')[0] || ('user' + Date.now().toString().slice(-4))),
    ma_nv: req.ma_nv || ('VD-' + Date.now().toString().slice(-3)),
    full_name: req.full_name,
    chuc_danh: req.chuc_vu || 'Nhân Viên',
    phong_ban: req.phong_ban,
    role: assignedRole,
    pin_code: pin,
    password: '123',
    phone: req.so_dien_thoai,
    email: req.email,
    is_active: true
  };
  users.push(newUser);
  await saveStoredUsers(users);

  try {
    await supabase.from('vidona_activation_requests').upsert(req);
    await supabase.from('vidona_users').upsert(newUser);
  } catch (e) {
    console.warn('Supabase sync error:', e);
  }
};

// Tải file mẫu Excel nhân sự
export const downloadNhanSuExcelTemplate = (): void => {
  const headers = [
    'Mã Nhân Viên (*)',
    'Họ Và Tên (*)',
    'Tên Đăng Nhập',
    'Chức Danh (*)',
    'Phòng Ban / Phân Xưởng (*)',
    'Vai Trò (*: ADMIN, MANAGEMENT, KCS, KHO, WORKER)',
    'Mã PIN (4 Số)',
    'Mật Khẩu',
    'Số Điện Thoại',
    'Email'
  ];

  const sampleData = [
    ['VD-010', 'Hoàng Văn Thắng', 'thang.hv', 'Kỹ Thuật Viên Men', 'Phân Xưởng Men', 'KCS', '1122', '123', '0912345601', 'thang.hv@vidona.vn'],
    ['VD-011', 'Phạm Quốc Tuấn', 'tuan.pq', 'Trưởng Ban Điều Hành', 'Ban Giám Đốc', 'ADMIN', '9999', '123', '0909999888', 'tuan.pq@vidona.vn'],
    ['VD-012', 'Đặng Minh Tâm', 'tam.dm', 'Thủ Kho Nguyên Liệu A', 'Kho Vật Tư', 'KHO', '3344', '123', '0988776655', 'tam.dm@vidona.vn'],
    ['VD-013', 'Nguyễn Thị Hoa', 'hoa.nt', 'Công Nhân Lò Nung', 'Tổ Lò Nung', 'WORKER', '5566', '123', '0977665544', 'hoa.nt@vidona.vn']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 24 }, { wch: 26 },
    { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Nhan_Su');
  XLSX.writeFile(wb, 'Mau_Danh_Sach_Nhan_Su_Vidona.xlsx');
};

// Import Đa File Excel nhân sự
export const parseNhanSuExcelFiles = async (files: File[]): Promise<{ importedUsers: User[]; count: number; errors: string[] }> => {
  const importedUsers: User[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (!rows || rows.length < 2) continue;

        const headerRow = rows[0].map(h => (h ? String(h).toLowerCase().trim() : ''));
        const maNvIdx = headerRow.findIndex(h => h.includes('mã') && (h.includes('nv') || h.includes('nhân viên')));
        const tenIdx = headerRow.findIndex(h => h.includes('tên') || h.includes('họ') || h.includes('họ và tên'));
        const usernameIdx = headerRow.findIndex(h => h.includes('đăng nhập') || h.includes('user'));
        const chucDanhIdx = headerRow.findIndex(h => h.includes('chức') || h.includes('vị trí'));
        const phongBanIdx = headerRow.findIndex(h => h.includes('phòng') || h.includes('bộ phận') || h.includes('xưởng'));
        const roleIdx = headerRow.findIndex(h => h.includes('vai trò') || h.includes('role') || h.includes('quyền'));
        const pinIdx = headerRow.findIndex(h => h.includes('pin'));
        const passIdx = headerRow.findIndex(h => h.includes('mật khẩu') || h.includes('pass'));
        const phoneIdx = headerRow.findIndex(h => h.includes('thoại') || h.includes('sđt') || h.includes('phone'));
        const emailIdx = headerRow.findIndex(h => h.includes('email') || h.includes('thư'));

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0 || !row[tenIdx >= 0 ? tenIdx : 1]) continue;

          const fullName = String(row[tenIdx >= 0 ? tenIdx : 1] || '').trim();
          if (!fullName) continue;

          const maNv = maNvIdx >= 0 && row[maNvIdx] ? String(row[maNvIdx]).trim() : ('VD-' + Math.floor(100 + Math.random() * 900));
          const username = usernameIdx >= 0 && row[usernameIdx] ? String(row[usernameIdx]).trim() : maNv.toLowerCase();
          const chucDanh = chucDanhIdx >= 0 && row[chucDanhIdx] ? String(row[chucDanhIdx]).trim() : 'Nhân Viên';
          const phongBan = phongBanIdx >= 0 && row[phongBanIdx] ? String(row[phongBanIdx]).trim() : 'Phân Xưởng Sản Xuất';
          
          let roleRaw = roleIdx >= 0 && row[roleIdx] ? String(row[roleIdx]).toUpperCase().trim() : 'WORKER';
          let role: User['role'] = 'WORKER';
          if (roleRaw.includes('ADMIN') || roleRaw.includes('GIÁM ĐỐC')) role = 'ADMIN';
          else if (roleRaw.includes('MANAGEMENT') || roleRaw.includes('QUẢN ĐỐC') || roleRaw.includes('TRƯỞNG PHÒNG')) role = 'MANAGEMENT';
          else if (roleRaw.includes('KCS')) role = 'KCS';
          else if (roleRaw.includes('KHO')) role = 'KHO';

          const pinCode = pinIdx >= 0 && row[pinIdx] ? String(row[pinIdx]).trim() : Math.floor(1000 + Math.random() * 9000).toString();
          const password = passIdx >= 0 && row[passIdx] ? String(row[passIdx]).trim() : '123';
          const phone = phoneIdx >= 0 && row[phoneIdx] ? String(row[phoneIdx]).trim() : '';
          const email = emailIdx >= 0 && row[emailIdx] ? String(row[emailIdx]).trim() : '';

          importedUsers.push({
            id: 'usr-' + Date.now() + '-' + r,
            username,
            ma_nv: maNv,
            full_name: fullName,
            chuc_danh: chucDanh,
            phong_ban: phongBan,
            role,
            pin_code: pinCode,
            password,
            phone,
            email,
            is_active: true
          });
        }
      }
    } catch (err: any) {
      errors.push(`Lỗi đọc file ${file.name}: ${err?.message || err}`);
    }
  }

  if (importedUsers.length > 0) {
    const existing = getStoredUsers();
    for (const newUser of importedUsers) {
      const idx = existing.findIndex(u => (u.ma_nv && u.ma_nv === newUser.ma_nv) || u.username === newUser.username);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...newUser };
      } else {
        existing.push(newUser);
      }
    }
    await saveStoredUsers(existing);
  }

  return {
    importedUsers,
    count: importedUsers.length,
    errors
  };
};
