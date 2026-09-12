export type ThemeMode = 'light' | 'dark';

export interface User {
  id: number;
  username: string;
  full_name: string;
  chuc_danh: string;
  role: 'ADMIN' | 'MANAGEMENT' | 'KCS' | 'KHO' | 'WORKER';
  pin_code: string;
  phone?: string;
}

export interface TCCSChiTieu {
  id: string;
  ten_chi_tieu: string;
  don_vi?: string;
  tieu_chuan: string;
  kieu_kiem_tra: 'SO_SANH_SO' | 'NGOAI_QUAN' | 'VAN_BAN';
  min_val?: number;
  max_val?: number;
  val_exact?: number;
  tolerance?: number;
}

export interface TCCSBang {
  ma_tccs: string;
  ten_tccs: string;
  nhom: 'XUONG' | 'MEN' | 'NHIEN_LIEU' | 'BAO_BI_PHU_TRO';
  ten_hang_hoa: string;
  ten_goi_khac?: string;
  ngoai_quan: string[];
  chi_tieu: TCCSChiTieu[];
  bao_quan?: string[];
}

export interface BM0307ChiTieuResult {
  chi_tieu_id: string;
  ten_chi_tieu: string;
  tieu_chuan: string;
  ket_qua_kcs: string;
  danh_gia: 'DAT' | 'KHONG_DAT' | 'CHUA_DO';
}

export interface BM0307Record {
  id: string;
  so_phieu: string;
  ngay_kiem_tra: string;
  loai_hang: 'NHAP_KHO' | 'MAU_THU' | 'LOAI_KHAC';
  nha_cung_cap: string;
  hop_dong_so?: string;
  so_xe_bien_so?: string;
  ma_tccs: string;
  ten_hang_hoa: string;
  so_luong_nhap: number;
  don_vi_tinh: string;
  ngoai_quan_kcs: {
    nhan_mac: string;
    tinh_trang_bao_goi: string;
    mau_sac: string;
    thong_tin_khac?: string;
  };
  ket_qua_chi_tieu: BM0307ChiTieuResult[];
  ket_luan: 'DAT' | 'KHONG_DAT' | 'HA_CAP_TRU_TIEN';
  ghi_chu_xu_ly: string;
  trang_thai_duyet: 'CHO_DUYET' | 'DA_DUYET_5_CAP' | 'TU_CHOI';
  chu_ky: {
    nguoi_giao_hang?: { ten: string; ngay?: string; da_ky: boolean };
    nguoi_kiem_tra?: { ten: string; ngay?: string; da_ky: boolean };
    phu_trach_kcs?: { ten: string; ngay?: string; da_ky: boolean };
    bo_phan_su_dung?: { ten: string; ngay?: string; da_ky: boolean };
    lanh_dao_duyet?: { ten: string; ngay?: string; da_ky: boolean };
  };
  ngay_tao: string;
}

export interface KhoNVLItem {
  id: string;
  ma_nvl: string;
  ten_nvl: string;
  nhom: 'XUONG' | 'MEN' | 'NHIEN_LIEU' | 'BAO_BI';
  don_vi_tinh: string;
  ton_kho: number;
  ton_an_toan_min: number;
  ton_an_toan_max: number;
  lo_moi_nhat?: {
    ngay_nhap: string;
    so_phieu: string;
    do_am?: number;
    do_co?: number;
    mkn?: number;
    nha_cung_cap: string;
  };
}

export interface SanLuongItem {
  ngay: string;
  ca: 'CA_1' | 'CA_2' | 'CA_3';
  san_luong_m2: number;
  ty_le_loai_1: number;
  ty_le_loai_2: number;
  ty_le_ha_loai: number;
  ty_le_phe_pham: number;
  top_loi: { ten_loi: string; ty_le_pt: number }[];
}
