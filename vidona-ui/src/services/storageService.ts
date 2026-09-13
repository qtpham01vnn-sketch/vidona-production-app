import { BM0307Record, KhoNVLItem, SanLuongItem, TCCSBang } from '../types';
import { DANH_MUC_TCCS_41 } from './tccsData';
import { supabase } from './supabaseClient';

export const DEFAULT_BM0307_RECORDS: BM0307Record[] = [
  {
    id: 'BM0307-2026-001',
    so_phieu: '26/09/PL-01',
    ngay_kiem_tra: '2026-09-12',
    loai_hang: 'NHAP_KHO',
    nha_cung_cap: 'DNTN Chế Biến Gỗ Đồng Nai',
    hop_dong_so: 'HD-2026/PL-09',
    so_xe_bien_so: '60C-889.92',
    ma_tccs: 'TC-BB-01',
    ten_hang_hoa: 'Pallet Gỗ 1 Mặt (Xếp Hộp Gạch)',
    so_luong_nhap: 500,
    don_vi_tinh: 'Cái',
    ngoai_quan_kcs: {
      nhan_mac: 'Đầy đủ nhãn mác nhà sản xuất',
      tinh_trang_bao_goi: 'Gỗ khô ráo, đai kiện chắc chắn',
      mau_sac: 'Màu gỗ tràm sáng, không mục mọt',
      thong_tin_khac: 'Đạt yêu cầu xếp gạch 600x600'
    },
    ket_qua_chi_tieu: [
      { chi_tieu_id: 'nan_tren_dai', ten_chi_tieu: 'Mặt trên 11-12 nan: Chiều dài (mm)', tieu_chuan: '1100 ± 5 mm', ket_qua_kcs: '1102', danh_gia: 'DAT' },
      { chi_tieu_id: 'nan_tren_rong', ten_chi_tieu: 'Mặt trên 11-12 nan: Chiều rộng (mm)', tieu_chuan: '72 ÷ 80 ± 2 mm', ket_qua_kcs: '76', danh_gia: 'DAT' },
      { chi_tieu_id: 'nan_tren_day', ten_chi_tieu: 'Mặt trên 11-12 nan: Chiều dày (mm)', tieu_chuan: '16 ± 1 mm', ket_qua_kcs: '16.2', danh_gia: 'DAT' },
      { chi_tieu_id: 'nan_tren_kc', ten_chi_tieu: 'Mặt trên 11-12 nan: Khoảng cách nan (mm)', tieu_chuan: '20 ÷ 30 ± 2 mm', ket_qua_kcs: '25', danh_gia: 'DAT' },
      { chi_tieu_id: 'do_dai', ten_chi_tieu: '04 Thanh đố chịu lực: Chiều dài (mm)', tieu_chuan: '1100 ± 5 mm', ket_qua_kcs: '1098', danh_gia: 'DAT' },
      { chi_tieu_id: 'do_rong', ten_chi_tieu: '04 Thanh đố chịu lực: Chiều rộng (mm)', tieu_chuan: '85 ÷ 90 ± 5 mm', ket_qua_kcs: '88', danh_gia: 'DAT' },
      { chi_tieu_id: 'do_day', ten_chi_tieu: '04 Thanh đố chịu lực: Chiều dày (mm)', tieu_chuan: '35 ÷ 40 ± 1 mm', ket_qua_kcs: '38', danh_gia: 'DAT' }
    ],
    ket_luan: 'DAT',
    ghi_chu_xu_ly: 'Nan gỗ tràm thẳng, đinh đóng 2 đinh/điểm chắc chắn, đủ tiêu chuẩn nhập kho.',
    trang_thai_duyet: 'DA_DUYET_5_CAP',
    chu_ky: {
      nguoi_giao_hang: { ten: 'Trần Ngọc Triển', ngay: '2026-09-12 08:30', da_ky: true },
      nguoi_kiem_tra: { ten: 'Nguyễn Ngọc Thiệu', ngay: '2026-09-12 09:15', da_ky: true },
      phu_trach_kcs: { ten: 'Vũ Văn Bảy', ngay: '2026-09-12 09:45', da_ky: true },
      bo_phan_su_dung: { ten: 'Lê Văn Quản Đốc', ngay: '2026-09-12 10:00', da_ky: true },
      lanh_dao_duyet: { ten: 'Nguyễn Văn Viện', ngay: '2026-09-12 10:30', da_ky: true }
    },
    ngay_tao: '2026-09-12T08:30:00Z'
  },
  {
    id: 'BM0307-2026-002',
    so_phieu: '26/09/DS-04',
    ngay_kiem_tra: '2026-09-12',
    loai_hang: 'NHAP_KHO',
    nha_cung_cap: 'Mỏ Sét Vĩnh Cửu - Đồng Nai',
    hop_dong_so: 'HD-2026/VC-11',
    so_xe_bien_so: '60C-123.45',
    ma_tccs: 'TC-XUONG-01',
    ten_hang_hoa: 'Đất Sét Vĩnh Cửu',
    so_luong_nhap: 42.5,
    don_vi_tinh: 'Tấn',
    ngoai_quan_kcs: {
      nhan_mac: 'Hàng mỏ nguyên khai',
      tinh_trang_bao_goi: 'Xe thùng phủ bạt',
      mau_sac: 'Trắng xám, dẻo ẩm',
      thong_tin_khac: 'Có ít sỏi nhỏ mép thùng xe'
    },
    ket_qua_chi_tieu: [
      { chi_tieu_id: 'do_am', ten_chi_tieu: 'Độ ẩm (%)', tieu_chuan: '≤ 25.0 %', ket_qua_kcs: '27.4', danh_gia: 'KHONG_DAT' },
      { chi_tieu_id: 'ton_sang_r063', ten_chi_tieu: 'Tồn sàng R0.063mm (%)', tieu_chuan: '≤ 10.0 %', ket_qua_kcs: '8.2', danh_gia: 'DAT' },
      { chi_tieu_id: 'do_co', ten_chi_tieu: 'Độ co (%)', tieu_chuan: '3.0 ÷ 8.5 %', ket_qua_kcs: '6.5', danh_gia: 'DAT' },
      { chi_tieu_id: 'mkn', ten_chi_tieu: 'Mất sau nung - MKN (%)', tieu_chuan: '≤ 8.0 %', ket_qua_kcs: '7.2', danh_gia: 'DAT' }
    ],
    ket_luan: 'HA_CAP_TRU_TIEN',
    ghi_chu_xu_ly: 'Độ ẩm thực tế 27.4% (vượt chuẩn 2.4%). Trưởng phòng KTCN và Quản đốc đồng ý cho nhập bãi xưởng A2 nhưng trừ 2.4% khối lượng ẩm thanh toán.',
    trang_thai_duyet: 'DA_DUYET_5_CAP',
    chu_ky: {
      nguoi_giao_hang: { ten: 'Lê Văn Tài', ngay: '2026-09-12 11:00', da_ky: true },
      nguoi_kiem_tra: { ten: 'Nguyễn Ngọc Thiệu', ngay: '2026-09-12 11:30', da_ky: true },
      phu_trach_kcs: { ten: 'Vũ Văn Bảy', ngay: '2026-09-12 11:45', da_ky: true },
      bo_phan_su_dung: { ten: 'Lê Văn Quản Đốc', ngay: '2026-09-12 12:00', da_ky: true },
      lanh_dao_duyet: { ten: 'Nguyễn Văn Viện', ngay: '2026-09-12 13:00', da_ky: true }
    },
    ngay_tao: '2026-09-12T11:00:00Z'
  }
];

export const DEFAULT_KHO_NVL: KhoNVLItem[] = [
  { id: '1', ma_nvl: 'DS_VC', ten_nvl: 'Đất Sét Vĩnh Cửu', nhom: 'XUONG', don_vi_tinh: 'Tấn', ton_kho: 450.5, ton_an_toan_min: 150, ton_an_toan_max: 800, lo_moi_nhat: { ngay_nhap: '2026-09-12', so_phieu: '26/09/DS-04', do_am: 27.4, do_co: 6.5, mkn: 7.2, nha_cung_cap: 'Mỏ Sét Vĩnh Cửu' } },
  { id: '2', ma_nvl: 'DS_BD', ten_nvl: 'Đất Sét Bình Dương', nhom: 'XUONG', don_vi_tinh: 'Tấn', ton_kho: 280.0, ton_an_toan_min: 100, ton_an_toan_max: 500, lo_moi_nhat: { ngay_nhap: '2026-09-10', so_phieu: '26/09/DS-02', do_am: 24.1, do_co: 5.8, mkn: 6.9, nha_cung_cap: 'Mỏ Bình Dương' } },
  { id: '3', ma_nvl: 'TT_AG', ten_nvl: 'Tràng Thạch An Giang', nhom: 'XUONG', don_vi_tinh: 'Tấn', ton_kho: 620.0, ton_an_toan_min: 200, ton_an_toan_max: 1000, lo_moi_nhat: { ngay_nhap: '2026-09-11', so_phieu: '26/09/TT-01', do_am: 8.5, do_co: 6.2, mkn: 1.8, nha_cung_cap: 'Cty Khoáng Sản AG' } },
  { id: '4', ma_nvl: 'FRIT_F0118', ten_nvl: 'Frit F0118 (Men lót)', nhom: 'MEN', don_vi_tinh: 'Tấn', ton_kho: 85.0, ton_an_toan_min: 30, ton_an_toan_max: 150, lo_moi_nhat: { ngay_nhap: '2026-09-08', so_phieu: '26/09/FR-03', do_am: 2.1, nha_cung_cap: 'Colorobbia VN' } },
  { id: '5', ma_nvl: 'PALLET_1100', ten_nvl: 'Pallet Gỗ 1 Mặt 1100x1100', nhom: 'BAO_BI', don_vi_tinh: 'Cái', ton_kho: 1250, ton_an_toan_min: 500, ton_an_toan_max: 3000, lo_moi_nhat: { ngay_nhap: '2026-09-12', so_phieu: '26/09/PL-01', nha_cung_cap: 'DNTN Gỗ Đồng Nai' } }
];

export const DEFAULT_SAN_LUONG: SanLuongItem[] = [
  { ngay: '2026-09-12', ca: 'CA_1', san_luong_m2: 4200, ty_le_loai_1: 94.5, ty_le_loai_2: 3.8, ty_le_ha_loai: 1.2, ty_le_phe_pham: 0.5, top_loi: [{ ten_loi: 'Nứt cạnh mộc', ty_le_pt: 0.8 }, { ten_loi: 'Châm kim men', ty_le_pt: 0.4 }] },
  { ngay: '2026-09-12', ca: 'CA_2', san_luong_m2: 4350, ty_le_loai_1: 95.1, ty_le_loai_2: 3.2, ty_le_ha_loai: 1.1, ty_le_phe_pham: 0.6, top_loi: [{ ten_loi: 'Cong góc', ty_le_pt: 0.6 }, { ten_loi: 'Châm kim men', ty_le_pt: 0.5 }] },
  { ngay: '2026-09-11', ca: 'CA_1', san_luong_m2: 4180, ty_le_loai_1: 93.8, ty_le_loai_2: 4.2, ty_le_ha_loai: 1.4, ty_le_phe_pham: 0.6, top_loi: [{ ten_loi: 'Lệch màu men', ty_le_pt: 0.9 }, { ten_loi: 'Nứt cạnh', ty_le_pt: 0.5 }] }
];

// Lấy danh sách BM0307 (Local first + Async Supabase Sync)
export const getBM0307Records = (): BM0307Record[] => {
  const data = localStorage.getItem('vidona_bm0307');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return DEFAULT_BM0307_RECORDS;
    }
  }
  return DEFAULT_BM0307_RECORDS;
};

// Đồng bộ từ Supabase về LocalStorage với cơ chế Merge an toàn tuyệt đối
export const fetchBM0307FromSupabase = async (): Promise<BM0307Record[]> => {
  try {
    const { data, error } = await supabase
      .from('vidona_bm0307')
      .select('*')
      .order('ngay_tao', { ascending: false });

    if (error) {
      console.warn('Supabase fetch BM0307 error (using local):', error.message);
      return getBM0307Records();
    }

    const localRecords = getBM0307Records();
    const map = new Map<string, BM0307Record>();

    // 1. Giữ các phiếu từ local
    for (const r of localRecords) {
      if (r && r.id) map.set(r.id, r);
    }

    // 2. Gộp các phiếu từ Cloud
    if (data && Array.isArray(data)) {
      for (const r of data as BM0307Record[]) {
        if (r && r.id) map.set(r.id, r);
      }
    }

    const merged = Array.from(map.values()).sort((a, b) => (b.ngay_tao || '').localeCompare(a.ngay_tao || ''));
    localStorage.setItem('vidona_bm0307', JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Network error, fallback to local BM0307:', err);
    return getBM0307Records();
  }
};

export const getKhoNVL = (): KhoNVLItem[] => {
  const data = localStorage.getItem('vidona_kho_nvl');
  if (data) {
    try { return JSON.parse(data); } catch { return DEFAULT_KHO_NVL; }
  }
  return DEFAULT_KHO_NVL;
};

export const saveKhoNVL = async (items: KhoNVLItem[]) => {
  localStorage.setItem('vidona_kho_nvl', JSON.stringify(items));
  try {
    for (const item of items) {
      await supabase.from('vidona_kho_nvl').upsert(item);
    }
  } catch (e) {
    console.warn('Could not sync KhoNVL to Supabase:', e);
  }
};

export const updateKhoFromBM0307 = (record: BM0307Record) => {
  if (record.ket_luan === 'KHONG_DAT') return;
  const khoList = getKhoNVL();
  
  let item = khoList.find(k => 
    record.ten_hang_hoa.toLowerCase().includes(k.ten_nvl.toLowerCase()) || 
    k.ten_nvl.toLowerCase().includes(record.ten_hang_hoa.toLowerCase())
  );

  const doAmCt = record.ket_qua_chi_tieu.find(c => c.ten_chi_tieu.toLowerCase().includes('độ ẩm') || c.chi_tieu_id === 'do_am');
  const doCoCt = record.ket_qua_chi_tieu.find(c => c.ten_chi_tieu.toLowerCase().includes('độ co') || c.chi_tieu_id === 'do_co');
  const mknCt = record.ket_qua_chi_tieu.find(c => c.ten_chi_tieu.toLowerCase().includes('mkn') || c.ten_chi_tieu.toLowerCase().includes('mất sau nung') || c.chi_tieu_id === 'mkn');

  const doAmVal = doAmCt ? parseFloat(doAmCt.ket_qua_kcs) : undefined;
  const doCoVal = doCoCt ? parseFloat(doCoCt.ket_qua_kcs) : undefined;
  const mknVal = mknCt ? parseFloat(mknCt.ket_qua_kcs) : undefined;

  if (item) {
    item.ton_kho = (item.ton_kho || 0) + Number(record.so_luong_nhap);
    item.lo_moi_nhat = {
      ngay_nhap: record.ngay_kiem_tra,
      so_phieu: record.so_phieu,
      do_am: isNaN(doAmVal as any) ? undefined : doAmVal,
      do_co: isNaN(doCoVal as any) ? undefined : doCoVal,
      mkn: isNaN(mknVal as any) ? undefined : mknVal,
      nha_cung_cap: record.nha_cung_cap
    };
    khoList.push({
      id: 'nvl-' + Date.now(),
      ma_nvl: record.ma_tccs || ('VT_' + Date.now().toString().slice(-4)),
      ten_nvl: record.ten_hang_hoa,
      nhom: 'XUONG',
      don_vi_tinh: record.don_vi_tinh,
      ton_kho: Number(record.so_luong_nhap),
      ton_an_toan_min: 50,
      ton_an_toan_max: 500,
      lo_moi_nhat: {
        ngay_nhap: record.ngay_kiem_tra,
        so_phieu: record.so_phieu,
        do_am: isNaN(doAmVal as any) ? undefined : doAmVal,
        do_co: isNaN(doCoVal as any) ? undefined : doCoVal,
        mkn: isNaN(mknVal as any) ? undefined : mknVal,
        nha_cung_cap: record.nha_cung_cap
      }
    });
  }

  saveKhoNVL(khoList);
};

export const saveBM0307Record = async (record: BM0307Record) => {
  const list = getBM0307Records();
  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }
  localStorage.setItem('vidona_bm0307', JSON.stringify(list));

  // Tự động đẩy lên Supabase Cloud
  try {
    await supabase.from('vidona_bm0307').upsert(record);
  } catch (e) {
    console.warn('Could not sync record to Supabase:', e);
  }

  if (record.trang_thai_duyet === 'DA_DUYET_5_CAP' || record.chu_ky.lanh_dao_duyet?.da_ky) {
    updateKhoFromBM0307(record);
  }

  return list;
};

export const getSanLuong = (): SanLuongItem[] => {
  const data = localStorage.getItem('vidona_san_luong');
  if (data) {
    try { return JSON.parse(data); } catch { return DEFAULT_SAN_LUONG; }
  }
  return DEFAULT_SAN_LUONG;
};

// Đồng bộ Bộ TCCS lên Supabase Cloud
export const syncTCCSToSupabase = async (tccsList: TCCSBang[]) => {
  try {
    for (const b of tccsList) {
      await supabase.from('vidona_tccs').upsert(b);
    }
  } catch (e) {
    console.warn('Could not sync TCCS to Supabase:', e);
  }
};

export const fetchTCCSFromSupabase = async (): Promise<TCCSBang[] | null> => {
  try {
    const { data, error } = await supabase.from('vidona_tccs').select('*');
    if (!error && data && data.length > 0) {
      return data as TCCSBang[];
    }
  } catch (e) {
    console.warn('Error fetching TCCS from Supabase:', e);
  }
  return null;
};
