import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, ShieldCheck, Printer, Save, X, Plus, 
  Trash2, AlertTriangle, Lock
} from 'lucide-react';
import { BM0307Record, BM0307ChiTieuResult, TCCSBang } from '../../types';
import { getStoredTCCS } from '../../services/tccsData';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

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

interface DynamicBM0307Props {
  initialData?: BM0307Record;
  onSave: (record: BM0307Record) => void;
  onClose: () => void;
}

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

  // Ký duyệt 5 cấp
  const [chuKy, setChuKy] = useState({
    nguoi_giao_hang: initialData?.chu_ky?.nguoi_giao_hang || { da_ky: true, ten: 'Trần Ngọc Triển', ngay: '08:15 12/09/2026' },
    nguoi_kiem_tra: initialData?.chu_ky?.nguoi_kiem_tra || { da_ky: true, ten: 'Nguyễn Ngọc Thiện', ngay: '08:30 12/09/2026' },
    phu_trach_kcs: initialData?.chu_ky?.phu_trach_kcs || { da_ky: true, ten: 'Vũ Văn Bảy', ngay: '08:45 12/09/2026' },
    bo_phan_su_dung: initialData?.chu_ky?.bo_phan_su_dung || { da_ky: true, ten: 'Lê Văn Quản Đốc', ngay: '09:00 12/09/2026' },
    lanh_dao_duyet: initialData?.chu_ky?.lanh_dao_duyet || { da_ky: true, ten: 'Nguyễn Văn Viện', ngay: '09:15 12/09/2026' }
  });

  const [pinInput, setPinInput] = useState('');
  const [signingRole, setSigningRole] = useState<string | null>(null);

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
    const list = [...chiTieuList];
    list[idx].ket_qua_kcs = val;
    list[idx].danh_gia = 'DAT';
    setChiTieuList(list);
  };

  const handleAddChiTieu = () => {
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
    setChiTieuList(chiTieuList.filter((_, i) => i !== idx));
  };

  const handleSignPIN = (roleKey: 'phu_trach_kcs' | 'bo_phan_su_dung' | 'lanh_dao_duyet') => {
    if (!pinInput) return;
    let valid = false;
    let signerName = user?.full_name || 'Người Ký';

    if (roleKey === 'phu_trach_kcs' && (pinInput === '3333' || pinInput === '0179')) {
      valid = true;
      signerName = 'Vũ Văn Bảy (TP KTCN)';
    } else if (roleKey === 'bo_phan_su_dung' && (pinInput === '4444' || pinInput === '0179')) {
      valid = true;
      signerName = 'Lê Văn Quản Đốc (Quản Đốc PX)';
    } else if (roleKey === 'lanh_dao_duyet' && (pinInput === '0179')) {
      valid = true;
      signerName = 'Nguyễn Văn Viện (Ban Giám Đốc)';
    }

    if (valid) {
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
      setChuKy(prev => ({
        ...prev,
        [roleKey]: { da_ky: true, ten: signerName, ngay: nowStr }
      }));
      setSigningRole(null);
      setPinInput('');
    } else {
      alert('Mã PIN không đúng cho quyền hạn này!');
    }
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
              onChange={(e) => handleSelectTCCS(e.target.value)}
              className="text-xs font-bold py-1 px-2 rounded border"
            >
              {tccsList.map(t => (
                <option key={t.ma_tccs} value={t.ma_tccs}>
                  {t.ten_tccs} ({t.nhom})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 shadow"
            >
              <Printer size={14} /> In / PDF (Chuẩn 1 Trang A4)
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

        {/* TỜ PHIẾU BM.03.07 CHUẨN A4 ĐỘC QUYỀN IN */}
        {/* TỜ PHIẾU BM.03.07 CHUẨN A4 ĐỘC QUYỀN IN (TỰ ĐỘNG CO GIÃN HÀI HÒA THEO SỐ LƯỢNG CHỈ TIÊU) */}
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
            <div className="font-bold text-[11px] text-sky-600 dark:text-sky-400">I. Thông tin chung (General informations)</div>
            
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
                            checked={loaiHangHoa === 'NHAP_KHO'} 
                            onChange={() => setLoaiHangHoa('NHAP_KHO')} 
                          />
                          <span>☑ Nhập kho (Input materials)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="loaiHangHoa" 
                            checked={loaiHangHoa === 'MAU_THU'} 
                            onChange={() => setLoaiHangHoa('MAU_THU')} 
                          />
                          <span>☐ Mẫu thử (Test sample)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="loaiHangHoa" 
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
                        onChange={(e) => setNhaCungCap(e.target.value)} 
                        className="w-full font-bold"
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
                        onChange={(e) => setSoHopDong(e.target.value)} 
                        className="w-full font-medium"
                        placeholder="Số HĐ / Đơn đặt hàng..."
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-500 dark:text-slate-400 py-0.5 px-2">Ngày lấy mẫu / Nhập kho & Biển số xe</td>
                    <td className="py-0.5 px-2">
                      <div className="flex gap-4">
                        <input 
                          type="date" 
                          value={ngayNhap} 
                          onChange={(e) => setNgayNhap(e.target.value)} 
                          className="font-medium"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-slate-500 dark:text-slate-400">Số xe/Biển số:</span>
                          <input 
                            type="text" 
                            value={soXe} 
                            onChange={(e) => setSoXe(e.target.value)} 
                            className="flex-1 font-bold"
                            placeholder="VD: 60C-889.92"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PHẦN II: KẾT QUẢ KIỂM TRA (Test results) */}
          <div className="space-y-1.5">
            <div className="font-bold text-[11px] text-sky-600 dark:text-sky-400">II. Kết quả kiểm tra (Test results)</div>

            {/* II.1: Ngoại quan */}
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">2.1. Kiểm tra ngoại quan (General checking)</div>
              <div className="border border-inherit rounded-lg overflow-hidden">
                <table className="table-custom text-[11px]">
                  <thead>
                    <tr>
                      <th className="w-8 text-center py-0.5 px-1">TT</th>
                      <th className="w-1/3 py-0.5 px-2">Nội Dung Kiểm Tra</th>
                      <th className="py-0.5 px-2">Kết Quả Thực Tế Đạt Được</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center font-bold py-0.5">1</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400 py-0.5 px-2">Nhãn mác (Label checking)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.nhan_mac} 
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, nhan_mac: e.target.value })} 
                          className="w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold py-0.5">2</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400 py-0.5 px-2">Tình trạng bao gói (Package checking)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.tinh_trang_bao_goi} 
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, tinh_trang_bao_goi: e.target.value })} 
                          className="w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold py-0.5">3</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400 py-0.5 px-2">Màu sắc (Color checking by sight)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.mau_sac} 
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, mau_sac: e.target.value })} 
                          className="w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center font-bold py-0.5">4</td>
                      <td className="font-semibold text-slate-600 dark:text-slate-400 py-0.5 px-2">Thông tin khác (Other informations)</td>
                      <td className="py-0.5 px-2">
                        <input 
                          type="text" 
                          value={ngoaiQuan.thong_tin_khac} 
                          onChange={(e) => setNgoaiQuan({ ...ngoaiQuan, thong_tin_khac: e.target.value })} 
                          className="w-full"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* II.2: Bảng thông số kỹ thuật động theo TCCS */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="text-[10.5px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <span>2.2. Kiểm tra các thông số, đặc tính kỹ thuật (Technical parameter checking)</span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-500 font-bold border border-sky-500/30">
                    Theo {selectedTCCS?.ten_tccs || 'TCCS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddChiTieu}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500/30 flex items-center gap-1 border border-sky-500/30 no-print"
                >
                  <Plus size={11} /> Thêm chỉ tiêu
                </button>
              </div>

              {/* General Material info */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 grid grid-cols-3 gap-2 text-[11px] mb-1">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px]">Tên Hàng Hóa / Vật Tư:</label>
                  <input 
                    type="text" 
                    value={tenHangHoa} 
                    onChange={(e) => setTenHangHoa(e.target.value)} 
                    className="w-full font-bold text-sky-600 dark:text-sky-400" 
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px]">Đơn Vị Tính (Units):</label>
                  <input 
                    type="text" 
                    value={donVi} 
                    onChange={(e) => setDonVi(e.target.value)} 
                    className="w-full font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Số Lượng Nhập (Quantity):</label>
                  <input 
                    type="number" 
                    value={soLuongNhap} 
                    onChange={(e) => setSoLuongNhap(Number(e.target.value))} 
                    className="w-full font-bold text-emerald-600 dark:text-emerald-400" 
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
                      <th className="w-7 text-center py-0.5 px-1 no-print">Xóa</th>
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
                            onChange={(e) => {
                              const list = [...chiTieuList];
                              list[idx].ten_chi_tieu = e.target.value;
                              setChiTieuList(list);
                            }} 
                            className="w-full font-semibold"
                            placeholder="Tên chỉ tiêu..."
                          />
                        </td>
                        <td className="py-0.5 px-2">
                          <input 
                            type="text" 
                            value={item.tieu_chuan} 
                            onChange={(e) => {
                              const list = [...chiTieuList];
                              list[idx].tieu_chuan = e.target.value;
                              setChiTieuList(list);
                            }} 
                            className="w-full font-mono text-sky-600 dark:text-sky-400"
                            placeholder="Quy chuẩn..."
                          />
                        </td>
                        <td className="py-0.5 px-2">
                          <input 
                            type="text" 
                            value={item.ket_qua_kcs} 
                            onChange={(e) => handleUpdateKetQua(idx, e.target.value)} 
                            className="w-full font-bold text-emerald-600 dark:text-emerald-400"
                            placeholder="Số đo thực tế..."
                          />
                        </td>
                        <td className="text-center py-0.5">
                          <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                            item.danh_gia === 'DAT' 
                              ? 'text-emerald-600 bg-emerald-500/15 border border-emerald-500/30' 
                              : 'text-rose-600 bg-rose-500/15 border border-rose-500/30'
                          }`}>
                            {item.danh_gia === 'DAT' ? 'Đạt' : 'K.Đạt'}
                          </span>
                        </td>
                        <td className="text-center py-0.5 no-print">
                          <button
                            type="button"
                            onClick={() => handleRemoveChiTieu(idx)}
                            className="text-rose-500 hover:text-rose-400 p-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        </td>
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
                onChange={(e) => setBienPhapXuLy(e.target.value)}
                rows={1}
                className="w-full text-[11px] font-medium"
                placeholder="Ghi nhận xét và kết luận..."
              />
            </div>
          </div>

          {/* CHỮ KÝ 5 CẤP BẢO MẬT */}
          <div className="pt-1.5 border-t border-inherit space-y-1">
            <div className="text-center text-[9.5px] text-slate-400 italic">
              Ngày {new Date(ngayNhap).getDate()} tháng {new Date(ngayNhap).getMonth() + 1} năm {new Date(ngayNhap).getFullYear()}
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              
              {/* 1. Phê duyệt */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 flex flex-col justify-between min-h-[95px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Phê duyệt<br/><span className="text-[8.5px] font-normal text-slate-500">(Ban Giám Đốc)</span></div>
                {chuKy.lanh_dao_duyet?.da_ky ? (
                  <div className="my-0.5 p-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px]">
                    ✓ ĐÃ DUYỆT
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSigningRole('lanh_dao_duyet')}
                    className="my-0.5 py-0.5 px-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[9.5px] no-print"
                  >
                    🔒 Ký (PIN 0179)
                  </button>
                )}
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">{chuKy.lanh_dao_duyet?.ten || 'Nguyễn Văn Viện'}</div>
              </div>

              {/* 2. Bộ phận sử dụng */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 flex flex-col justify-between min-h-[95px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Bộ phận sử dụng<br/><span className="text-[8.5px] font-normal text-slate-500">(Quản Đốc PX)</span></div>
                {chuKy.bo_phan_su_dung?.da_ky ? (
                  <div className="my-0.5 p-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px]">
                    ✓ ĐÃ DUYỆT
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSigningRole('bo_phan_su_dung')}
                    className="my-0.5 py-0.5 px-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[9.5px] no-print"
                  >
                    🔒 Ký (PIN 4444)
                  </button>
                )}
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">{chuKy.bo_phan_su_dung?.ten || 'Lê Văn Quản Đốc'}</div>
              </div>

              {/* 3. Phụ trách KTCN */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 flex flex-col justify-between min-h-[95px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Phụ trách KTCN<br/><span className="text-[8.5px] font-normal text-slate-500">(Trưởng Phòng KTCN)</span></div>
                {chuKy.phu_trach_kcs?.da_ky ? (
                  <div className="my-0.5 p-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px]">
                    ✓ ĐÃ DUYỆT
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSigningRole('phu_trach_kcs')}
                    className="my-0.5 py-0.5 px-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[9.5px] no-print"
                  >
                    🔒 Ký (PIN 3333)
                  </button>
                )}
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">{chuKy.phu_trach_kcs?.ten || 'Vũ Văn Bảy'}</div>
              </div>

              {/* 4. Người kiểm tra */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 flex flex-col justify-between min-h-[95px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Người kiểm tra<br/><span className="text-[8.5px] font-normal text-slate-500">(KCS Nghiệm Thu)</span></div>
                <div className="my-0.5 p-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold print-stamp text-[9.5px]">
                  ✓ ĐÃ KIỂM TRA
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">{chuKy.nguoi_kiem_tra?.ten}</div>
              </div>

              {/* 5. Người giao hàng */}
              <div className="p-1.5 rounded-lg border border-inherit bg-slate-100 dark:bg-slate-800/40 flex flex-col justify-between min-h-[95px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Người giao hàng<br/><span className="text-[8.5px] font-normal text-slate-500">(Đại Diện NCC)</span></div>
                <div className="my-0.5 p-0.5 rounded bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold print-stamp text-[9.5px]">
                  ✓ ĐÃ BÀN GIAO
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 text-[9.5px]">{chuKy.nguoi_giao_hang?.ten}</div>
              </div>

            </div>

            {/* Nơi gửi (Distribution List) CHUẨN THEO ẢNH 1 BIỂU MẪU GỐC ISO BM.03.07 */}
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

        {/* Modal nhập mã PIN để ký (ẨN KHI IN) */}
        {signingRole && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 no-print">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-base text-slate-100 mb-1">Xác Thực Ký Duyệt Bằng Mã PIN</h3>
              <p className="text-xs text-slate-400 mb-4">
                Nhập mã PIN 4 số của bạn để đóng dấu ký điện tử lên phiếu BM.03.07
              </p>
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSignPIN(signingRole as any);
                  }
                }}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-400 font-bold mb-4 focus:border-sky-400 outline-none"
                placeholder="••••"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSigningRole(null); setPinInput(''); }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleSignPIN(signingRole as any)}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
                >
                  Xác Nhận Ký
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
