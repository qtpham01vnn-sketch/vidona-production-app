-- =========================================================================
-- VIDONA CERAMIC PRODUCTION PXSX 4.0 - DATABASE SCHEMA CHO SUPABASE
-- Chạy đoạn SQL này trong mục 'SQL Editor' trên Supabase Dashboard
-- =========================================================================

-- 1. BẢNG PHIẾU KIỂM TRA NHẬP KHO BM.03.07
CREATE TABLE IF NOT EXISTS public.vidona_bm0307 (
  id TEXT PRIMARY KEY,
  so_phieu TEXT NOT NULL,
  ngay_kiem_tra TEXT NOT NULL,
  loai_hang TEXT DEFAULT 'NHAP_KHO',
  nha_cung_cap TEXT NOT NULL,
  hop_dong_so TEXT,
  so_xe_bien_so TEXT,
  ma_tccs TEXT,
  ten_hang_hoa TEXT NOT NULL,
  so_luong_nhap NUMERIC DEFAULT 0,
  don_vi_tinh TEXT,
  ngoai_quan_kcs JSONB DEFAULT '{}'::jsonb,
  ket_qua_chi_tieu JSONB DEFAULT '[]'::jsonb,
  ket_luan TEXT DEFAULT 'DAT',
  ghi_chu_xu_ly TEXT,
  trang_thai_duyet TEXT DEFAULT 'CHO_DUYET',
  chu_ky JSONB DEFAULT '{}'::jsonb,
  ngay_tao TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG BỘ TIÊU CHUẨN CƠ SỞ (TCCS TC.09.01)
CREATE TABLE IF NOT EXISTS public.vidona_tccs (
  id TEXT PRIMARY KEY,
  ma_tccs TEXT NOT NULL,
  ten_bang TEXT NOT NULL,
  nhom_nl TEXT NOT NULL,
  mo_ta TEXT,
  danh_sach_chi_tieu JSONB DEFAULT '[]'::jsonb,
  ngay_cap_nhat TEXT,
  nguoi_tao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG QUẢN LÝ TỒN KHO NGUYÊN VẬT LIỆU
CREATE TABLE IF NOT EXISTS public.vidona_kho_nvl (
  id TEXT PRIMARY KEY,
  ma_nvl TEXT NOT NULL,
  ten_nvl TEXT NOT NULL,
  nhom TEXT NOT NULL,
  don_vi_tinh TEXT NOT NULL,
  ton_kho NUMERIC DEFAULT 0,
  ton_an_toan_min NUMERIC DEFAULT 0,
  ton_an_toan_max NUMERIC DEFAULT 0,
  lo_moi_nhat JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG SẢN LƯỢNG & LỖI HẠ LOẠI (PARETO)
CREATE TABLE IF NOT EXISTS public.vidona_san_luong (
  id TEXT PRIMARY KEY,
  ngay TEXT NOT NULL,
  ca TEXT NOT NULL,
  san_luong_m2 NUMERIC DEFAULT 0,
  ty_le_loai_1 NUMERIC DEFAULT 0,
  ty_le_loai_2 NUMERIC DEFAULT 0,
  ty_le_ha_loai NUMERIC DEFAULT 0,
  ty_le_phe_pham NUMERIC DEFAULT 0,
  top_loi JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) & Cho phép quyền đọc/ghi công khai cho ứng dụng qua anon key
ALTER TABLE public.vidona_bm0307 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vidona_tccs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vidona_kho_nvl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vidona_san_luong ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on vidona_bm0307" ON public.vidona_bm0307;
CREATE POLICY "Allow anon all on vidona_bm0307" ON public.vidona_bm0307 FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vidona_tccs" ON public.vidona_tccs;
CREATE POLICY "Allow anon all on vidona_tccs" ON public.vidona_tccs FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vidona_kho_nvl" ON public.vidona_kho_nvl;
CREATE POLICY "Allow anon all on vidona_kho_nvl" ON public.vidona_kho_nvl FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vidona_san_luong" ON public.vidona_san_luong;
CREATE POLICY "Allow anon all on vidona_san_luong" ON public.vidona_san_luong FOR ALL TO anon USING (true) WITH CHECK (true);
