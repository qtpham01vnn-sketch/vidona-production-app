import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, ShieldCheck, Printer, Save, X, Plus, 
  Trash2, AlertTriangle, Lock, UserCheck, Clock, ShieldAlert, KeyRound
} from 'lucide-react';
import { BM0307Record, BM0307ChiTieuResult, TCCSBang } from '../../types';
import { getStoredTCCS } from '../../services/tccsData';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getStoredUsers } from '../../services/userService';

// Helper chuyển số thành chữ tiếng Việt chuẩn xác
function docSoThanhChuVN(so: number): string {
  if (isNaN(so) || so === 0) return 'Không';
  const ChuSo = [' không ', ' một ', ' hai ', ' ba ', ' bốn ', ' năm ', ' sáu ', ' bảy ', ' tám ', ' chín '];
  const Tien = ['', ' ngàn', ' triệu', ' tỷ', ' ngàn tỷ', ' triệu tỷ'];

  let str = Math.round(so).toString();
  let result = '';
  
  function DocSo3ChuSo(baso: number): string {
    let tram = Math.floor(baso / 100);
    let chuc = Math.floor((baso % 100) / 10);
    let donvi = baso % 10;
    let ketqua = '';
    if (tram === 0 && chuc === 0 && donvi === 0) return '';
    if (tram !== 0) {
      ketqua += ChuSo[tram] + ' trăm ';
      if (chuc === 0 && donvi !== 0) ketqua += ' lẻ ';
    }
    if (chuc !== 0 && chuc !== 1) {
      ketqua += ChuSo[chuc] + ' mươi';
      if (chuc === 0 && donvi !== 0) ketqua = ketqua + ' lẻ ';
    }
    if (chuc === 1) ketqua += ' mười ';
    switch (donvi) {
      case 1:
        if (chuc !== 0 && chuc !== 1) ketqua += ' mốt ';
        else ketqua += ChuSo[donvi];
        break;
      case 5:
        if (chuc === 0) ketqua += ChuSo[donvi];
        else ketqua += ' lăm ';
        break;
      default:
        if (donvi !== 0) ketqua += ChuSo[donvi];
        break;
    }
    return ketqua;
  }

  let positionDigit = str.length;
  if (positionDigit === 0) return '';

  let Lan = 0;
  while (positionDigit > 0) {
    let SoTien = 0;
    if (positionDigit >= 3) {
      SoTien = parseInt(str.substring(positionDigit - 3, positionDigit), 10);
      positionDigit -= 3;
    } else {
      SoTien = parseInt(str.substring(0, positionDigit), 10);
      positionDigit = 0;
    }
    if (SoTien > 0) {
      let KetQuaDoc = DocSo3ChuSo(SoTien);
      result = KetQuaDoc + Tien[Lan] + result;
    }
    Lan++;
  }

  result = result.trim().replace(/\s+/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Helper đánh giá thông minh kết quả đo KCS so với quy chuẩn TCCS (Hỗ trợ cả số đơn, số cặp A/B và 3 chiều AxBxC)
function evalChiTieu(tieuChuanStr: string, valStr: string): 'DAT' | 'KHONG_DAT' {
  if (!valStr || !tieuChuanStr) return 'DAT';
  const tc = tieuChuanStr.trim();
  const val = valStr.trim();

  // Trích xuất dung sai nếu có (ví dụ: ± 1, +/- 2, ± 0.5)
  const mTol = tc.match(/(?:±|\+\/-)\s*([\d\.]+)/);
  const tol = mTol ? parseFloat(mTol[1]) : 0.0;

  // Lấy phần tiêu chuẩn trước dấu dung sai
  const baseTc = tc.split(/(?:±|\+\/-)/)[0].trim();

  // 1. Trường hợp số cặp phân tách bằng dấu gạch chéo '/' (ví dụ: 75/82 ± 1 mm, 76/72 ± 1 mm)
  if (baseTc.includes('/') && val.includes('/')) {
    const tcParts = baseTc.match(/[\d\.]+/g);
    const valParts = val.match(/[\d\.]+/g);
    if (tcParts && valParts && tcParts.length === valParts.length && tcParts.length > 0) {
      for (let i = 0; i < tcParts.length; i++) {
        const tNum = parseFloat(tcParts[i]);
        const vNum = parseFloat(valParts[i]);
        const minV = tNum - tol;
        const maxV = tNum + tol;
        if (isNaN(vNum) || vNum < minV || vNum > maxV) {
          return 'KHONG_DAT';
        }
      }
      return 'DAT';
    }
  }

  // 2. Trường hợp kích thước 3 chiều hoặc phân tách bằng 'x', 'X', '*' (ví dụ: 54x72x77 ± 1 mm, 600x600x10)
  if (/[xX\*]/.test(baseTc) && /[xX\*]/.test(val)) {
    const tcParts = baseTc.match(/[\d\.]+/g);
    const valParts = val.match(/[\d\.]+/g);
    if (tcParts && valParts && tcParts.length === valParts.length && tcParts.length > 0) {
      for (let i = 0; i < tcParts.length; i++) {
        const tNum = parseFloat(tcParts[i]);
        const vNum = parseFloat(valParts[i]);
        const minV = tNum - tol;
        const maxV = tNum + tol;
        if (isNaN(vNum) || vNum < minV || vNum > maxV) {
          return 'KHONG_DAT';
        }
      }
      return 'DAT';
    }
  }

  // 3. Trường hợp số đơn có dung sai ± (ví dụ: 610 ± 1 mm, 60 ± 1 mm, 1100 ± 5 mm)
  if (mTol) {
    const mBase = baseTc.match(/[\d\.]+/);
    if (mBase) {
      const baseVal = parseFloat(mBase[0]);
      const minV = baseVal - tol;
      const maxV = baseVal + tol;
      const mVal = val.match(/[-+]?[\d\.]+/);
      if (mVal) {
        const vNum = parseFloat(mVal[0]);
        if (!isNaN(vNum)) {
          return (vNum >= minV && vNum <= maxV) ? 'DAT' : 'KHONG_DAT';
        }
      }
    }
  }

  // 4. Trường hợp dải khoảng A ÷ B hoặc A - B (ví dụ: 3.0 ÷ 8.5 %, 72 ÷ 80)
  const mRange = tc.match(/([\d\.]+)\s*(?:÷|~|-|đến)\s*([\d\.]+)/);
  if (mRange) {
    const minV = parseFloat(mRange[1]);
    const maxV = parseFloat(mRange[2]);
    const mVal = val.match(/[-+]?[\d\.]+/);
    if (mVal) {
      const vNum = parseFloat(mVal[0]);
      if (!isNaN(vNum)) {
        return (vNum >= minV && vNum <= maxV) ? 'DAT' : 'KHONG_DAT';
      }
    }
  }

  // 5. Trường hợp <= X hoặc ≤ X (ví dụ: ≤ 25.0 %, <= 10.0 %)
  const mLe = tc.match(/(?:<=|≤|<)\s*([\d\.]+)/);
  if (mLe) {
    const maxV = parseFloat(mLe[1]);
    const mVal = val.match(/[-+]?[\d\.]+/);
    if (mVal) {
      const vNum = parseFloat(mVal[0]);
      if (!isNaN(vNum)) {
        return vNum <= maxV ? 'DAT' : 'KHONG_DAT';
      }
    }
  }

  // 6. Trường hợp >= X hoặc ≥ X (ví dụ: ≥ 170 g/cái, >= 50)
  const mGe = tc.match(/(?:>=|≥|>)\s*([\d\.]+)/);
  if (mGe) {
    const minV = parseFloat(mGe[1]);
    const mVal = val.match(/[-+]?[\d\.]+/);
    if (mVal) {
      const vNum = parseFloat(mVal[0]);
      if (!isNaN(vNum)) {
        return vNum >= minV ? 'DAT' : 'KHONG_DAT';
      }
    }
  }

  return 'DAT';
}

interface DynamicBM0307Props {
  initialData?: BM0307Record;
  onSave: (record: BM0307Record) => void;
  onClose: () => void;
}

type RoleKeyType = 'nguoi_giao_hang' | 'nguoi_kiem_tra' | 'phu_trach_kcs' | 'bo_phan_su_dung' | 'lanh_dao_duyet';

export const DynamicBM0307: React.FC<DynamicBM0307Props> = ({ initialData, onSave, onClose }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Dynamic TCCS List from storage
  const [tccsList, setTccsList] = useState<TCCSBang[]>([]);
  const [selectedMaTCCS, setSelectedMaTCCS] = useState<string>(initialData?.ma_tccs || 'TC-BB-28');
  const [selectedTCCS, setSelectedTCCS] = useState<TCCSBang | undefined>(undefined);

  const [soPhieu, setSoPhieu] = useState(initialData?.so_phieu || `${new Date().getDate()}/${new Date().getMonth() + 1}/${Math.floor(10 + Math.random() * 89)}`);
  const [ngayNhap, setNgayNhap] = useState(initialData?.ngay_kiem_tra || new Date().toISOString().split('T')[0]);
  const [nhaCungCap, setNhaCungCap] = useState(initialData?.nha_cung_cap || 'DNTN Chế Biến Gỗ Đồng Nai');
  const [soHopDong, setSoHopDong] = useState(initialData?.hop_dong_so || '08/2026/HĐ-VIDONA');
  const [soXe, setSoXe] = useState(initialData?.so_xe_bien_so || '60C-889.92');
  const [loaiHangHoa, setLoaiHangHoa] = useState<'NHAP_KHO' | 'MAU_THU' | 'LOAI_KHAC'>(initialData?.loai_hang || 'NHAP_KHO');

  const [tenHangHoa, setTenHangHoa] = useState(initialData?.ten_hang_hoa || 'Pallet Gỗ 1 Mặt (Bảng 28)');
  const [donVi, setDonVi] = useState(initialData?.don_vi_tinh || 'Cái');
  const [soLuongNhap, setSoLuongNhap] = useState<number>(initialData?.so_luong_nhap || 500);

  // Ngoại quan 4 dòng chuẩn
  const [ngoaiQuan, setNgoaiQuan] = useState({
    nhan_mac: initialData?.ngoai_quan_kcs?.nhan_mac || 'Đầy đủ nhãn mác nhà sản xuất',
    tinh_trang_bao_goi: initialData?.ngoai_quan_kcs?.tinh_trang_bao_goi || 'Bao bì nguyên vẹn, pallet chắc chắn',
    mau_sac: initialData?.ngoai_quan_kcs?.mau_sac || 'Gỗ sáng màu, không ẩm mốc mục nát',
    thong_tin_khac: initialData?.ngoai_quan_kcs?.thong_tin_khac || 'Hàng nhập kho chính thức'
  });

  // Bảng chỉ tiêu kiểm tra
  const [chiTieuList, setChiTieuList] = useState<BM0307ChiTieuResult[]>(initialData?.ket_qua_chi_tieu || []);

  // Kết luận & Biện pháp xử lý
  const [ketLuanKcs, setKetLuanKcs] = useState<'DAT' | 'KHONG_DAT' | 'HA_CAP_TRU_TIEN'>(initialData?.ket_luan || 'DAT');
  const [bienPhapXuLy, setBienPhapXuLy] = useState(initialData?.ghi_chu_xu_ly || 'Nan gỗ tràm thẳng, đinh đóng 2 đinh/điểm chắc chắn, đủ tiêu chuẩn nhập kho.');

  // KHỞI TẠO CHỮ KÝ 5 CẤP:
  // Nếu là phiếu mới (initialData == null) -> BẮT BUỘC toàn bộ da_ky: false, không ký sẵn!
  const [chuKy, setChuKy] = useState({
    nguoi_giao_hang: initialData?.chu_ky?.nguoi_giao_hang || { da_ky: false, ten: '', ngay: '' },
    nguoi_kiem_tra: initialData?.chu_ky?.nguoi_kiem_tra || { da_ky: false, ten: '', ngay: '' },
    phu_trach_kcs: initialData?.chu_ky?.phu_trach_kcs || { da_ky: false, ten: '', ngay: '' },
    bo_phan_su_dung: initialData?.chu_ky?.bo_phan_su_dung || { da_ky: false, ten: '', ngay: '' },
    lanh_dao_duyet: initialData?.chu_ky?.lanh_dao_duyet || { da_ky: false, ten: '', ngay: '' }
  });

  // State Modal Ký
  const [signingRole, setSigningRole] = useState<RoleKeyType | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [customSignerName, setCustomSignerName] = useState('');
  const [signError, setSignError] = useState('');

  // TRẠNG THÁI KHÓA FORM TỪNG CẤP ĐỂ BẢO MẬT DỮ LIỆU
  const isLockedStep1 = Boolean(chuKy.nguoi_giao_hang?.da_ky);
  const isLockedStep2 = Boolean(chuKy.nguoi_kiem_tra?.da_ky);
  const isLockedStep3 = Boolean(chuKy.phu_trach_kcs?.da_ky);
  const isLockedStep4 = Boolean(chuKy.bo_phan_su_dung?.da_ky);
  const isLockedFinal = Boolean(chuKy.lanh_dao_duyet?.da_ky);

  useEffect(() => {
    const list = getStoredTCCS();
    setTccsList(list);
    const targetMa = initialData?.ma_tccs || (list.some(t => t.ma_tccs === 'TC-BB-28') ? 'TC-BB-28' : list[0]?.ma_tccs);
    setSelectedMaTCCS(targetMa);
    const found = list.find(t => t.ma_tccs === targetMa);
    setSelectedTCCS(found);

    if (!initialData?.ket_qua_chi_tieu || initialData.ket_qua_chi_tieu.length === 0) {
      if (found) {
        setTenHangHoa(found.ten_hang_hoa);
        setChiTieuList(found.chi_tieu.map((c, i) => ({
          chi_tieu_id: c.id || `ct-${i}`,
          ten_chi_tieu: c.ten_chi_tieu,
          tieu_chuan: c.tieu_chuan,
          ket_qua_kcs: c.val_exact !== undefined ? String(c.val_exact) : '',
          danh_gia: 'DAT'
        })));
      }
    }
  }, []);

  // Xử lý khi chọn bảng TCCS mới
  const handleSelectTCCS = (maTCCS: string) => {
    if (isLockedStep2 || isLockedFinal) return;
    setSelectedMaTCCS(maTCCS);
    const tccs = tccsList.find(t => t.ma_tccs === maTCCS);
    setSelectedTCCS(tccs);
    if (tccs) {
      setTenHangHoa(tccs.ten_hang_hoa);
      if (tccs.ma_tccs.includes('BB-33') || tccs.ma_tccs.includes('BB-34') || tccs.ma_tccs.includes('BB-35') || tccs.ma_tccs.includes('BB-36') || tccs.ma_tccs.includes('BB-37') || tccs.ma_tccs.includes('BB-28')) {
        setDonVi('Cái');
      } else if (tccs.nhom === 'XUONG' || tccs.nhom === 'MEN') {
        setDonVi('Tấn');
      }
      setChiTieuList(tccs.chi_tieu.map((c, i) => ({
        chi_tieu_id: c.id || `ct-${i}`,
        ten_chi_tieu: c.ten_chi_tieu,
        tieu_chuan: c.tieu_chuan,
        ket_qua_kcs: c.val_exact !== undefined ? String(c.val_exact) : '',
        danh_gia: 'DAT'
      })));
    }
  };

  const handleUpdateKetQua = (idx: number, val: string) => {
    if (isLockedStep2 || isLockedFinal) return;
    const list = [...chiTieuList];
    list[idx].ket_qua_kcs = val;
    
    // Đánh giá tự động theo chuẩn TCCS
    const autoEval = evalChiTieu(list[idx].tieu_chuan, val);
    list[idx].danh_gia = autoEval;
    setChiTieuList(list);

    // Tự động điều chỉnh kết luận tổng thể nếu có chỉ tiêu không đạt
    const hasFail = list.some(c => c.danh_gia === 'KHONG_DAT');
    if (hasFail) {
      if (ketLuanKcs === 'DAT') setKetLuanKcs('KHONG_DAT');
    } else {
      if (ketLuanKcs === 'KHONG_DAT') setKetLuanKcs('DAT');
    }
  };

  // Người dùng bấm trực tiếp vào nút Đánh Giá để chỉnh sửa thủ công Đạt / Không Đạt
  const handleToggleDanhGia = (idx: number) => {
    if (isLockedStep2 || isLockedFinal) return;
    const list = [...chiTieuList];
    const current = list[idx].danh_gia || 'DAT';
    list[idx].danh_gia = current === 'DAT' ? 'KHONG_DAT' : 'DAT';
    setChiTieuList(list);

    const hasFail = list.some(c => c.danh_gia === 'KHONG_DAT');
    if (hasFail) {
      if (ketLuanKcs === 'DAT') setKetLuanKcs('KHONG_DAT');
    } else {
      if (ketLuanKcs === 'KHONG_DAT') setKetLuanKcs('DAT');
    }
  };

  const handleAddChiTieu = () => {
    if (isLockedStep2 || isLockedFinal) return;
    setChiTieuList([
      ...chiTieuList,
      {
        chi_tieu_id: `ct-${Date.now()}`,
        ten_chi_tieu: '',
        tieu_chuan: '',
        ket_qua_kcs: '',
        danh_gia: 'DAT'
      }
    ]);
  };

  const handleRemoveChiTieu = (idx: number) => {
    if (isLockedStep2 || isLockedFinal) return;
    setChiTieuList(chiTieuList.filter((_, i) => i !== idx));
  };

  // KIỂM TRA ĐIỀU KIỆN TUẦN TỰ 5 CẤP (KHÔNG ĐƯỢC VƯỢT CẤP)
  const checkCanSign = (roleKey: RoleKeyType): { allowed: boolean; reason?: string } => {
    if (roleKey === 'nguoi_giao_hang') {
      return { allowed: true };
    }
    if (roleKey === 'nguoi_kiem_tra') {
      if (!chuKy.nguoi_giao_hang?.da_ky) {
        return { allowed: false, reason: 'Cấp 1: Người giao hàng (NCC/Kho) chưa ký bàn giao! Bắt buộc Người giao hàng phải ký trước.' };
      }
      return { allowed: true };
    }
    if (roleKey === 'phu_trach_kcs') {
      if (!chuKy.nguoi_kiem_tra?.da_ky) {
        return { allowed: false, reason: 'Cấp 2: Người kiểm tra (KCS Nghiệm thu) chưa ký kết quả! Bắt buộc KCS phải kiểm tra và ký trước.' };
      }
      return { allowed: true };
    }
    if (roleKey === 'bo_phan_su_dung') {
      if (!chuKy.phu_trach_kcs?.da_ky) {
        return { allowed: false, reason: 'Cấp 3: Phụ trách KTCN (Trưởng phòng KTCN) chưa ký duyệt! Không được ký vượt cấp.' };
      }
      return { allowed: true };
    }
    if (roleKey === 'lanh_dao_duyet') {
      if (!chuKy.bo_phan_su_dung?.da_ky) {
        return { allowed: false, reason: 'Cấp 4: Bộ phận sử dụng (Quản Đốc Phân Xưởng) chưa ký tiếp nhận! Không được duyệt vượt cấp.' };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: 'Quyền hạn không hợp lệ' };
  };

  // Mở modal ký
  const handleOpenSignModal = (roleKey: RoleKeyType) => {
    const check = checkCanSign(roleKey);
    if (!check.allowed) {
      alert(`⚠️ QUY TRÌNH DUYỆT TUẦN TỰ:\n${check.reason}`);
      return;
    }

    setSigningRole(roleKey);
    setSignError('');
    setPinInput('');

    // Khởi tạo tên mặc định
    if (roleKey === 'nguoi_giao_hang') {
      setCustomSignerName(chuKy.nguoi_giao_hang?.ten || (nhaCungCap ? `Đại diện ${nhaCungCap}` : 'Đại diện NCC'));
    } else {
      setCustomSignerName(user?.full_name ? `${user.full_name} (${user.chuc_danh || user.role})` : '');
    }
  };

  // Thực hiện ký sau khi xác thực
  const handleConfirmSign = () => {
    if (!signingRole) return;
    setSignError('');

    const allUsers = getStoredUsers();
    let signerName = customSignerName.trim();

    // 1. Cấp 1: Người giao hàng
    if (signingRole === 'nguoi_giao_hang') {
      if (!signerName) {
        setSignError('Vui lòng nhập họ tên người giao hàng / đại diện NCC!');
        return;
      }
    } 
    // 2. Các Cấp 2, 3, 4, 5 cần xác thực PIN của người ký hoặc tài khoản đang đăng nhập
    else {
      if (!pinInput) {
        setSignError('Vui lòng nhập mã PIN bảo mật cá nhân (4 số)!');
        return;
      }

      // Xác thực PIN: khớp mã PIN của user hiện tại, hoặc PIN của bất kỳ user nào có role phù hợp, hoặc Master PIN 0179
      let matchedUser = allUsers.find(u => u.pin_code === pinInput && u.is_active !== false);
      const isMasterPin = (pinInput === '0179');

      if (!matchedUser && !isMasterPin) {
        setSignError('Mã PIN không chính xác! Vui lòng kiểm tra lại.');
        return;
      }

      // Kiểm tra thẩm quyền cấp duyệt
      if (signingRole === 'nguoi_kiem_tra') {
        // Cấp 2: KCS hoặc Admin
        if (!isMasterPin && matchedUser && matchedUser.role !== 'KCS' && matchedUser.role !== 'ADMIN') {
          setSignError(`Tài khoản "${matchedUser.full_name}" không có quyền KCS nghiệm thu!`);
          return;
        }
        if (!signerName) {
          signerName = matchedUser ? `${matchedUser.full_name} (KCS)` : (user?.full_name ? `${user.full_name} (KCS)` : 'KCS Nghiệm Thu');
        }
      } else if (signingRole === 'phu_trach_kcs') {
        // Cấp 3: Phụ trách KTCN / TP KTCN / Admin
        if (!isMasterPin && matchedUser && matchedUser.role !== 'MANAGEMENT' && matchedUser.role !== 'ADMIN') {
          setSignError(`Tài khoản "${matchedUser.full_name}" không có quyền Phụ trách KTCN!`);
          return;
        }
        if (!signerName) {
          signerName = matchedUser ? `${matchedUser.full_name} (TP KTCN)` : 'Vũ Văn Bảy (Trưởng Phòng KTCN)';
        }
      } else if (signingRole === 'bo_phan_su_dung') {
        // Cấp 4: Quản đốc PX / Quản lý / Admin
        if (!isMasterPin && matchedUser && matchedUser.role !== 'MANAGEMENT' && matchedUser.role !== 'ADMIN') {
          setSignError(`Tài khoản "${matchedUser.full_name}" không có quyền Quản Đốc Phân Xưởng!`);
          return;
        }
        if (!signerName) {
          signerName = matchedUser ? `${matchedUser.full_name} (Quản Đốc PX)` : 'Lê Văn Quản Đốc (Quản Đốc PX)';
        }
      } else if (signingRole === 'lanh_dao_duyet') {
        // Cấp 5: Ban Giám Đốc / Admin
        if (!isMasterPin && matchedUser && matchedUser.role !== 'ADMIN') {
          setSignError(`Chỉ có Ban Giám Đốc (ADMIN) mới có quyền Phê duyệt cấp 5!`);
          return;
        }
        if (!signerName) {
          signerName = matchedUser ? `${matchedUser.full_name} (Ban Giám Đốc)` : 'Nguyễn Văn Viện (Ban Giám Đốc)';
        }
      }
    }

    const now = new Date();
    const nowStr = `${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString('vi-VN')}`;

    setChuKy(prev => ({
      ...prev,
      [signingRole]: {
        da_ky: true,
        ten: signerName,
        ngay: nowStr
      }
    }));

    setSigningRole(null);
    setPinInput('');
    setCustomSignerName('');
  };

  const handleSaveForm = () => {
    const isApprovedAll = chuKy.lanh_dao_duyet?.da_ky;
    const record: BM0307Record = {
      id: initialData?.id || `BM0307-${Date.now()}`,
      so_phieu: soPhieu,
      ngay_kiem_tra: ngayNhap,
      loai_hang: loaiHangHoa,
      nha_cung_cap: nhaCungCap,
      hop_dong_so: soHopDong,
      so_xe_bien_so: soXe,
      ma_tccs: selectedMaTCCS,
      ten_hang_hoa: tenHangHoa,
      so_luong_nhap: soLuongNhap,
      don_vi_tinh: donVi,
      ngoai_quan_kcs: ngoaiQuan,
      ket_qua_chi_tieu: chiTieuList,
      ket_luan: ketLuanKcs,
      ghi_chu_xu_ly: bienPhapXuLy,
      trang_thai_duyet: isApprovedAll ? 'DA_DUYET_5_CAP' : (ketLuanKcs === 'KHONG_DAT' ? 'TU_CHOI' : 'CHO_DUYET'),
      chu_ky: chuKy,
      ngay_tao: initialData?.ngay_tao || new Date().toISOString()
    };
    onSave(record);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
      <div className={`w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden border ${
        theme === 'dark' ? 'bg-[#0f172a] text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-300'
      }`}>
        
        {/* Modal Top Bar (ẨN HOÀN TOÀN KHI IN) */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 no-print ${
          theme === 'dark' ? 'bg-[#1e293b]/70 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Chọn Bảng TCCS:</span>
            <select
              value={selectedMaTCCS}
              disabled={isLockedStep2 || isLockedFinal}
              onChange={(e) => handleSelectTCCS(e.target.value)}
              className="text-xs font-bold py-1 px-2 rounded border bg-white dark:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {tccsList.map(t => (
                <option key={t.ma_tccs} value={t.ma_tccs}>
                  {t.ten_tccs} ({t.nhom})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isLockedFinal && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={14} /> ĐÃ KHÓA HOÀN TOÀN 5 CẤP
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 shadow"
            >
              <Printer size={14} /> In / PDF (A4 Chuẩn)
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-md"
            >
              <Save size={14} /> Lưu Phiếu
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CẢNH BÁO BẢO MẬT & KHÓA DỮ LIỆU */}
        {isLockedStep2 && !isLockedFinal && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2 no-print">
            <Lock size={14} />
            <span>KCS đã ký xác nhận kiểm tra. Các thông số chỉ tiêu kỹ thuật (2.1 & 2.2) đã được <strong>khóa an toàn</strong>, không thể sửa đổi để đảm bảo tính pháp lý.</span>
          </div>
        )}

        {/* TỜ PHIẾU BM.03.07 CHUẨN A4 ĐỘC QUYỀN IN */}
        <div 
          id="print-bm0307-a4" 
          className={`p-4 sm:p-6 md:p-8 bg-white text-slate-900 dark:bg-[#0f172a] dark:text-slate-100 flex flex-col justify-between ${
            chiTieuList.length <= 4 ? 'space-y-4 print-spacious' : (chiTieuList.length <= 8 ? 'space-y-2.5 print-standard' : 'space-y-1.5 print-compact')
          }`}
        >
          
          {/* HEADER BIỂU MẪU */}
          <div className="border-b border-inherit pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-black text-xs sm:text-sm tracking-tight uppercase text-gradient">
                  CÔNG TY CỔ PHẦN GẠCH MEN VIDONA
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">KCN Gò Dầu, Xã Phước Thái, Huyện Long Thành, Tỉnh Đồng Nai</p>
                <p className="text-[9.5px] text-slate-400 italic">Nhà máy sản xuất Gạch Ceramic & Porcelain Cao Cấp</p>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">BM.03.07</div>
                <div className="text-[9.5px] text-slate-500 dark:text-slate-400">Ngày BH: 01/02/2024</div>
                <div className="text-[9.5px] text-slate-500 dark:text-slate-400">Lần BH: 02 (TCCS)</div>
              </div>
            </div>

            <div className="text-center mt-1">
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-gradient">
                PHIẾU KIỂM TRA CHẤT LƯỢNG NGUYÊN NHIÊN LIỆU, VẬT TƯ
              </h1>
              <p className="text-[10px] italic text-slate-500 dark:text-slate-400">(QUALITY CONTROL RECORD OF INPUT MATERIALS, GOODS)</p>
              <div className="text-[11px] font-bold mt-0.5 text-sky-600 dark:text-sky-400">
                Số phiếu (No.): <span className="underline font-mono text-xs sm:text-sm">{soPhieu}</span>
              </div>
            </div>
          </div>

          {/* PHẦN I: THÔNG TIN CHUNG (General informations) */}
          <div className="space-y-0.5">
            <div className="font-bold text-[11px] text-sky-600 dark:text-sky-400 flex items-center justify-between">
              <span>I. Thông tin chung (General informations)</span>
              {isLockedFinal && <span className="text-[9.5px] text-slate-400 italic font-normal">🔒 Đã khóa bảo mật</span>}
            </div>
            
            <div className="border border-inherit rounded-lg overflow-hidden">
              <table className="table-custom text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-1/3 font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Loại hàng hóa kiểm tra (Kind of checking goods)</td>
                    <td className="w-2/3 py-0.5 px-2">
                      <div className="flex flex-wrap gap-4 font-medium">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="loaiHangHoa" 
                            disabled={isLockedStep1 || isLockedFinal}
                            checked={loaiHangHoa === 'NHAP_KHO'} 
                            onChange={() => setLoaiHangHoa('NHAP_KHO')} 
                          />
                          <span>☑ Nhập kho (Input materials)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="loaiHangHoa" 
                            disabled={isLockedStep1 || isLockedFinal}
                            checked={loaiHangHoa === 'MAU_THU'} 
                            onChange={() => setLoaiHangHoa('MAU_THU')} 
                          />
                          <span>☐ Mẫu thử (Test sample)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="loaiHangHoa" 
                            disabled={isLockedStep1 || isLockedFinal}
                            checked={loaiHangHoa === 'LOAI_KHAC'} 
                            onChange={() => setLoaiHangHoa('LOAI_KHAC')} 
                          />
                          <span>☐ Khác (Others)</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Nhà cung cấp (Supplier)</td>
                    <td className="py-0.5 px-2">
                      <input 
                        type="text" 
                        value={nhaCungCap} 
                        disabled={isLockedStep1 || isLockedFinal}
                        onChange={(e) => setNhaCungCap(e.target.value)} 
                        className="w-full font-bold disabled:bg-transparent"
                        placeholder="Nhập tên nhà cung cấp..."
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Đơn đặt hàng, hợp đồng số (No. Order, Contract)</td>
                    <td className="py-0.5 px-2">
                      <input 
                        type="text" 
                        value={soHopDong} 
                        disabled={isLockedStep1 || isLockedFinal}
                        onChange={(e) => setSoHopDong(e.target.value)} 
                        className="w-full font-medium disabled:bg-transparent"
                        placeholder="Số HĐ / Đơn đặt hàng..."
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Ngày lấy mẫu / Nhập kho & Biển số xe</td>
                    <td className="py-0.5 px-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-[10px]">Ngày:</span>
                          <input 
                            type="date" 
                            value={ngayNhap} 
                            disabled={isLockedStep1 || isLockedFinal}
                            onChange={(e) => setNgayNhap(e.target.value)} 
                            className="font-medium disabled:bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-[10px]">Xe:</span>
                          <input 
                            type="text" 
                            value={soXe} 
                            disabled={isLockedStep1 || isLockedFinal}
                            onChange={(e) => setSoXe(e.target.value)} 
                            className="font-medium disabled:bg-transparent"
                            placeholder="Biển số xe..."
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PHẦN II: NỘI DUNG KIỂM TRA (Checking contents) */}
          <div className="space-y-1">
            <div className="font-bold text-[11px] text-sky-600 dark:text-sky-400 flex items-center justify-between">
              <span>II. Nội dung kiểm tra (Checking contents)</span>
              {isLockedStep2 && <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">🔒 Đã khóa theo biên bản KCS</span>}
            </div>

            {/* 2.1 Ngoại quan */}
            <div className="space-y-0.5">
              <div className="text-[10.5px] font-bold text-sky-600 dark:text-sky-400">2.1. Ngoại quan (Appearance)</div>
              <div className="border border-inherit rounded-lg overflow-hidden">
                <table className="table-custom text-[11px]">
                  <tbody>
                    <tr>
                      <td className="w-1/3 font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Nhãn mác (Labels)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.nhan_mac} 
                          disabled={isLockedStep2 || isLockedFinal}
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, nhan_mac: e.target.value })} 
                          className="w-full disabled:bg-transparent" 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Tình trạng bao gói (Packing status)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.tinh_trang_bao_goi} 
                          disabled={isLockedStep2 || isLockedFinal}
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, tinh_trang_bao_goi: e.target.value })} 
                          className="w-full disabled:bg-transparent" 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Màu sắc (Color)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.mau_sac} 
                          disabled={isLockedStep2 || isLockedFinal}
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, mau_sac: e.target.value })} 
                          className="w-full disabled:bg-transparent" 
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Thông tin khác (Other information)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.thong_tin_khac} 
                          disabled={isLockedStep2 || isLockedFinal}
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, thong_tin_khac: e.target.value })} 
                          className="w-full disabled:bg-transparent" 
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2.2 Thông số kỹ thuật */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <div className="text-[10.5px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <span>2.2. Kiểm tra các thông số, đặc tính kỹ thuật (Technical parameter checking)</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-500 font-bold border border-sky-500/30">
                    Theo {selectedTCCS?.ten_tccs || 'TCCS'}
                  </span>
                </div>
                {!isLockedStep2 && !isLockedFinal && (
                  <button
                    type="button"
                    onClick={handleAddChiTieu}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500/30 flex items-center gap-1 border border-sky-500/30 no-print"
                  >
                    <Plus size={11} /> Thêm chỉ tiêu
                  </button>
                )}
              </div>

              {/* General Material info */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 grid grid-cols-3 gap-2 text-[11px] mb-1">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px]">Tên Hàng Hóa / Vật Tư:</label>
                  <input 
                    type="text" 
                    value={tenHangHoa} 
                    disabled={isLockedStep2 || isLockedFinal}
                    onChange={(e) => setTenHangHoa(e.target.value)} 
                    className="w-full font-bold text-sky-600 dark:text-sky-400 disabled:bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px]">Đơn Vị Tính (Units):</label>
                  <input 
                    type="text" 
                    value={donVi} 
                    disabled={isLockedStep2 || isLockedFinal}
                    onChange={(e) => setDonVi(e.target.value)} 
                    className="w-full font-medium disabled:bg-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Số Lượng Nhập (Quantity):</label>
                  <input 
                    type="number" 
                    value={soLuongNhap} 
                    disabled={isLockedStep2 || isLockedFinal}
                    onChange={(e) => setSoLuongNhap(Number(e.target.value))} 
                    className="w-full font-bold text-emerald-600 dark:text-emerald-400 disabled:bg-transparent" 
                  />
                </div>
              </div>

              {/* Detailed Table */}
              <div className="border border-inherit rounded-lg overflow-x-auto">
                <table className="table-custom text-[11px]">
                  <thead>
                    <tr>
                      <th className="w-7 text-center py-0.5 px-1">TT</th>
                      <th className="w-2/5 py-0.5 px-2">Chỉ Tiêu Kiểm Tra (Norms)</th>
                      <th className="w-1/4 py-0.5 px-2">Tiêu Chuẩn Chấp Nhận (TCCS)</th>
                      <th className="w-1/5 py-0.5 px-2">Kết Quả (KCS Đo)</th>
                      <th className="w-14 text-center py-0.5 px-1">Đánh Giá</th>
                      {!isLockedStep2 && !isLockedFinal && <th className="w-7 text-center py-0.5 px-1 no-print">Xóa</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {chiTieuList.map((item, idx) => (
                      <tr key={item.chi_tieu_id || idx}>
                        <td className="text-center font-bold text-slate-500 py-0.5">{idx + 1}</td>
                        <td className="py-0.5 px-2">
                          <input 
                            type="text" 
                            value={item.ten_chi_tieu} 
                            disabled={isLockedStep2 || isLockedFinal}
                            onChange={(e) => {
                              const list = [...chiTieuList];
                              list[idx].ten_chi_tieu = e.target.value;
                              setChiTieuList(list);
                            }} 
                            className="w-full font-semibold disabled:bg-transparent"
                            placeholder="Tên chỉ tiêu..."
                          />
                        </td>
                        <td className="py-0.5 px-2">
                          <input 
                            type="text" 
                            value={item.tieu_chuan} 
                            disabled={isLockedStep2 || isLockedFinal}
                            onChange={(e) => {
                              const list = [...chiTieuList];
                              list[idx].tieu_chuan = e.target.value;
                              setChiTieuList(list);
                            }} 
                            className="w-full font-mono text-sky-600 dark:text-sky-400 disabled:bg-transparent"
                            placeholder="Quy chuẩn..."
                          />
                        </td>
                        <td className="py-0.5 px-2">
                          <input 
                            type="text" 
                            value={item.ket_qua_kcs} 
                            disabled={isLockedStep2 || isLockedFinal}
                            onChange={(e) => handleUpdateKetQua(idx, e.target.value)} 
                            className="w-full font-bold text-emerald-600 dark:text-emerald-400 disabled:bg-transparent"
                            placeholder="Số đo thực tế..."
                          />
                        </td>
                        <td className="text-center py-0.5">
                          <button
                            type="button"
                            disabled={isLockedStep2 || isLockedFinal}
                            onClick={() => handleToggleDanhGia(idx)}
                            title={isLockedStep2 || isLockedFinal ? 'Đã khóa biên bản KCS' : 'Bấm để đổi nhanh Đạt / Không Đạt'}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              item.danh_gia === 'DAT' 
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30' 
                                : 'text-rose-600 dark:text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 font-black'
                            } disabled:opacity-75 disabled:cursor-not-allowed`}
                          >
                            {item.danh_gia === 'DAT' ? '🟢 Đạt' : '🔴 K.Đạt'}
                          </button>
                        </td>
                        {!isLockedStep2 && !isLockedFinal && (
                          <td className="text-center py-0.5 no-print">
                            <button
                              type="button"
                              onClick={() => handleRemoveChiTieu(idx)}
                              className="text-rose-500 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 size={11} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PHẦN III: KẾT LUẬN (Result) */}
          <div className="space-y-1 pt-1 border-t border-inherit">
            <div className="font-bold text-[11px] text-sky-600 dark:text-sky-400">III. Kết luận (Result)</div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="ketLuanKcs" 
                  disabled={isLockedStep2 || isLockedFinal}
                  checked={ketLuanKcs === 'DAT'} 
                  onChange={() => setKetLuanKcs('DAT')} 
                />
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Đạt (Pass) - Cho phép nhập kho
                </span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="ketLuanKcs" 
                  disabled={isLockedStep2 || isLockedFinal}
                  checked={ketLuanKcs === 'KHONG_DAT'} 
                  onChange={() => setKetLuanKcs('KHONG_DAT')} 
                />
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle size={13} /> Không đạt (Failure) - Trả về
                </span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="ketLuanKcs" 
                  disabled={isLockedStep2 || isLockedFinal}
                  checked={ketLuanKcs === 'HA_CAP_TRU_TIEN'} 
                  onChange={() => setKetLuanKcs('HA_CAP_TRU_TIEN')} 
                />
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={13} /> Hạ cấp / Trừ ẩm / Chờ xử lý
                </span>
              </label>
            </div>

            <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/30 text-[11px]">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Số lượng nhập: <span className="font-bold text-emerald-600 dark:text-emerald-400">{soLuongNhap.toLocaleString()} {donVi}</span>
                <span className="italic text-slate-500 dark:text-slate-400 ml-2">
                  (Bằng chữ: <strong>{docSoThanhChuVN(soLuongNhap)} {donVi}</strong>)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                Ý kiến kết luận & Biện pháp xử lý của P.KTCN / KCS:
              </label>
              <textarea
                value={bienPhapXuLy}
                disabled={isLockedStep3 || isLockedFinal}
                onChange={(e) => setBienPhapXuLy(e.target.value)}
                rows={1}
                className="w-full text-[11px] font-medium disabled:bg-transparent"
                placeholder="Ghi nhận xét và kết luận..."
              />
            </div>
          </div>

          {/* CHỮ KÝ 5 CẤP TUẦN TỰ THEO CHUẨN ISO BM.03.07 */}
          <div className="pt-1.5 border-t border-inherit space-y-1">
            <div className="flex justify-between items-center text-[9.5px] text-slate-400 italic">
              <div>* Quy trình duyệt 5 cấp ký điện tử tuần tự (Không được vượt cấp)</div>
              <div>Ngày {new Date(ngayNhap).getDate()} tháng {new Date(ngayNhap).getMonth() + 1} năm {new Date(ngayNhap).getFullYear()}</div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              
              {/* CẤP 5: Phê duyệt (Ban Giám Đốc) */}
              <div className={`p-1.5 rounded-lg border border-inherit flex flex-col justify-between min-h-[105px] transition-all ${
                chuKy.lanh_dao_duyet?.da_ky 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : (chuKy.bo_phan_su_dung?.da_ky ? 'bg-sky-500/10 border-sky-500/30 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/40 opacity-70')
              }`}>
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Phê duyệt<br/>
                  <span className="text-[8.5px] font-normal text-slate-500 dark:text-slate-400">(Cấp 5: Sếp Phê Duyệt / BGĐ)</span>
                </div>
                
                {chuKy.lanh_dao_duyet?.da_ky ? (
                  <div className="my-0.5 p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px] flex flex-col items-center">
                    <span>✓ ĐÃ PHÊ DUYỆT</span>
                    <span className="text-[8px] font-normal opacity-80">{chuKy.lanh_dao_duyet.ngay}</span>
                  </div>
                ) : (
                  <div className="my-0.5 no-print">
                    {chuKy.bo_phan_su_dung?.da_ky ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSignModal('lanh_dao_duyet')}
                        className="w-full py-1 px-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[9.5px] shadow-sm flex items-center justify-center gap-1"
                      >
                        ✍️ Ký Phê Duyệt
                      </button>
                    ) : (
                      <span className="text-[8.5px] text-slate-400 italic flex items-center justify-center gap-0.5 py-1">
                        <Clock size={10} /> Chờ Cấp 4 ký
                      </span>
                    )}
                  </div>
                )}

                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">
                  {chuKy.lanh_dao_duyet?.ten || (chuKy.lanh_dao_duyet?.da_ky ? 'Ban Giám Đốc' : '(Chưa ký)')}
                </div>
              </div>

              {/* CẤP 4: Bộ phận sử dụng (Quản Đốc PX) */}
              <div className={`p-1.5 rounded-lg border border-inherit flex flex-col justify-between min-h-[105px] transition-all ${
                chuKy.bo_phan_su_dung?.da_ky 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : (chuKy.phu_trach_kcs?.da_ky ? 'bg-sky-500/10 border-sky-500/30 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/40 opacity-70')
              }`}>
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Bộ phận sử dụng<br/>
                  <span className="text-[8.5px] font-normal text-slate-500 dark:text-slate-400">(Cấp 4: Quản Đốc PX Sử Dụng)</span>
                </div>

                {chuKy.bo_phan_su_dung?.da_ky ? (
                  <div className="my-0.5 p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px] flex flex-col items-center">
                    <span>✓ ĐÃ TIẾP NHẬN</span>
                    <span className="text-[8px] font-normal opacity-80">{chuKy.bo_phan_su_dung.ngay}</span>
                  </div>
                ) : (
                  <div className="my-0.5 no-print">
                    {chuKy.phu_trach_kcs?.da_ky ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSignModal('bo_phan_su_dung')}
                        className="w-full py-1 px-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[9.5px] shadow-sm flex items-center justify-center gap-1"
                      >
                        ✍️ Ký Tiếp Nhận
                      </button>
                    ) : (
                      <span className="text-[8.5px] text-slate-400 italic flex items-center justify-center gap-0.5 py-1">
                        <Clock size={10} /> Chờ Cấp 3 ký
                      </span>
                    )}
                  </div>
                )}

                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">
                  {chuKy.bo_phan_su_dung?.ten || (chuKy.bo_phan_su_dung?.da_ky ? 'Quản Đốc PX' : '(Chưa ký)')}
                </div>
              </div>

              {/* CẤP 3: Phụ trách KTCN (Trưởng phòng KTCN / Tổ trưởng KCS) */}
              <div className={`p-1.5 rounded-lg border border-inherit flex flex-col justify-between min-h-[105px] transition-all ${
                chuKy.phu_trach_kcs?.da_ky 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : (chuKy.nguoi_kiem_tra?.da_ky ? 'bg-sky-500/10 border-sky-500/30 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/40 opacity-70')
              }`}>
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Phụ trách KTCN<br/>
                  <span className="text-[8.5px] font-normal text-slate-500 dark:text-slate-400">(Cấp 3: Phụ Trách KCS / P.KTCN)</span>
                </div>

                {chuKy.phu_trach_kcs?.da_ky ? (
                  <div className="my-0.5 p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px] flex flex-col items-center">
                    <span>✓ ĐÃ DUYỆT KTCN</span>
                    <span className="text-[8px] font-normal opacity-80">{chuKy.phu_trach_kcs.ngay}</span>
                  </div>
                ) : (
                  <div className="my-0.5 no-print">
                    {chuKy.nguoi_kiem_tra?.da_ky ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSignModal('phu_trach_kcs')}
                        className="w-full py-1 px-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[9.5px] shadow-sm flex items-center justify-center gap-1"
                      >
                        ✍️ Ký Duyệt KTCN
                      </button>
                    ) : (
                      <span className="text-[8.5px] text-slate-400 italic flex items-center justify-center gap-0.5 py-1">
                        <Clock size={10} /> Chờ Cấp 2 ký
                      </span>
                    )}
                  </div>
                )}

                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">
                  {chuKy.phu_trach_kcs?.ten || (chuKy.phu_trach_kcs?.da_ky ? 'P.KTCN' : '(Chưa ký)')}
                </div>
              </div>

              {/* CẤP 2: Người kiểm tra (KCS Nghiệm Thu) */}
              <div className={`p-1.5 rounded-lg border border-inherit flex flex-col justify-between min-h-[105px] transition-all ${
                chuKy.nguoi_kiem_tra?.da_ky 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : (chuKy.nguoi_giao_hang?.da_ky ? 'bg-sky-500/10 border-sky-500/30 shadow-sm' : 'bg-slate-100 dark:bg-slate-800/40 opacity-70')
              }`}>
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Người kiểm tra<br/>
                  <span className="text-[8.5px] font-normal text-slate-500 dark:text-slate-400">(Cấp 2: KCS Đo Kiểm & Kết Luận)</span>
                </div>

                {chuKy.nguoi_kiem_tra?.da_ky ? (
                  <div className="my-0.5 p-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px] flex flex-col items-center">
                    <span>✓ ĐÃ KIỂM TRA</span>
                    <span className="text-[8px] font-normal opacity-80">{chuKy.nguoi_kiem_tra.ngay}</span>
                  </div>
                ) : (
                  <div className="my-0.5 no-print">
                    {chuKy.nguoi_giao_hang?.da_ky ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSignModal('nguoi_kiem_tra')}
                        className="w-full py-1 px-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-[9.5px] shadow-sm flex items-center justify-center gap-1"
                      >
                        ✍️ Ký KCS Xác Nhận
                      </button>
                    ) : (
                      <span className="text-[8.5px] text-slate-400 italic flex items-center justify-center gap-0.5 py-1">
                        <Clock size={10} /> Chờ Cấp 1 ký
                      </span>
                    )}
                  </div>
                )}

                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">
                  {chuKy.nguoi_kiem_tra?.ten || (chuKy.nguoi_kiem_tra?.da_ky ? 'KCS' : '(Chưa ký)')}
                </div>
              </div>

              {/* CẤP 1: Người giao hàng (Đại Diện NCC / Tiếp nhận) */}
              <div className={`p-1.5 rounded-lg border border-inherit flex flex-col justify-between min-h-[105px] transition-all ${
                chuKy.nguoi_giao_hang?.da_ky 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-sky-500/10 border-sky-500/30 shadow-sm'
              }`}>
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Người giao hàng<br/>
                  <span className="text-[8.5px] font-normal text-slate-500 dark:text-slate-400">(Cấp 1: P.KHTH Lập Phiếu)</span>
                </div>

                {chuKy.nguoi_giao_hang?.da_ky ? (
                  <div className="my-0.5 p-1 rounded bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold print-stamp text-[9.5px] flex flex-col items-center">
                    <span>✓ ĐÃ BÀN GIAO</span>
                    <span className="text-[8px] font-normal opacity-80">{chuKy.nguoi_giao_hang.ngay}</span>
                  </div>
                ) : (
                  <div className="my-0.5 no-print">
                    <button
                      type="button"
                      onClick={() => handleOpenSignModal('nguoi_giao_hang')}
                      className="w-full py-1 px-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-bold text-[9.5px] shadow-sm flex items-center justify-center gap-1"
                    >
                      ✍️ Ký Bàn Giao (P.KHTH)
                    </button>
                  </div>
                )}

                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">
                  {chuKy.nguoi_giao_hang?.ten || (chuKy.nguoi_giao_hang?.da_ky ? 'Người Giao' : '(Chưa ký)')}
                </div>
              </div>

            </div>

            {/* Nơi gửi (Distribution List) CHUẨN THEO BIỂU MẪU GỐC ISO BM.03.07 */}
            <div className="pt-1 mt-0.5 text-[7pt] leading-[1.2] text-left text-slate-800 dark:text-slate-200 font-serif">
              <div className="italic font-bold">Nơi gửi:</div>
              <div className="italic pl-0.5 space-y-0.2 text-[6.8pt]">
                <div>B. TGĐ/ B. G. D (b/cáo) (Report);</div>
                <div>P. KHTH/ P & P Dept;</div>
                <div>PX. CĐ-NL/ M, E & E Dept;</div>
                <div>P. KT-CN/ Technology Dept;</div>
                <div>Phòng/Phân xưởng/ Department.</div>
              </div>
            </div>
          </div>

        </div>

        {/* MODAL KÝ ĐIỆN TỬ BẢO MẬT THEO CẤP (ẨN KHI IN) */}
        {signingRole && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 no-print">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md text-left shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {signingRole === 'nguoi_giao_hang' && 'Ký Bàn Giao (P.KHTH) (Cấp 1 - Đại Diện NCC)'}
                      {signingRole === 'nguoi_kiem_tra' && 'Ký Đo Kiểm & Đánh Giá (Cấp 2: KCS Nghiệm Thu)'}
                      {signingRole === 'phu_trach_kcs' && 'Ký Duyệt Kỹ Thuật (Cấp 3: Phụ Trách KCS / P.KTCN)'}
                      {signingRole === 'bo_phan_su_dung' && 'Ký Tiếp Nhận Sản Xuất (Cấp 4: Quản Đốc PX)'}
                      {signingRole === 'lanh_dao_duyet' && 'Phê Duyệt Nhập Kho (Cấp 5: Sếp Phê Duyệt / BGĐ)'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Quy trình ký điện tử chuẩn kiểm soát chất lượng ISO</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSigningRole(null); setPinInput(''); setSignError(''); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {signError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                  <span>{signError}</span>
                </div>
              )}

              {/* Thông tin người ký */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Họ & Tên Người Ký:
                  </label>
                  <input
                    type="text"
                    value={customSignerName}
                    onChange={(e) => setCustomSignerName(e.target.value)}
                    placeholder="Nhập họ tên người ký..."
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold focus:border-sky-400 outline-none text-xs"
                  />
                </div>

                {signingRole !== 'nguoi_giao_hang' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><KeyRound size={13} className="text-amber-400" /> Nhập Mã PIN Cá Nhân (4 Số):</span>
                      <span className="text-[10px] text-slate-500">Mã PIN tài khoản đang đăng nhập</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      autoFocus
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmSign();
                      }}
                      placeholder="••••"
                      className="w-full text-center text-xl tracking-[0.4em] font-mono py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-400 font-bold focus:border-sky-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setSigningRole(null); setPinInput(''); setSignError(''); }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSign}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Xác Nhận Đóng Dấu Ký
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
