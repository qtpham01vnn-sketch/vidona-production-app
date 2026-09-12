-- =========================================================================
-- VIDONA CERAMIC PRODUCTION PXSX 4.0 - DATABASE SCHEMA BỔ SUNG NHÂN SỰ
-- Chạy đoạn SQL này trong mục 'SQL Editor' trên Supabase Dashboard
-- =========================================================================

-- 5. BẢNG TÀI KHOẢN & NHÂN SỰ
CREATE TABLE IF NOT EXISTS public.vidona_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  ma_nv TEXT,
  full_name TEXT NOT NULL,
  chuc_danh TEXT NOT NULL,
  phong_ban TEXT,
  role TEXT NOT NULL DEFAULT 'WORKER',
  pin_code TEXT NOT NULL,
  password TEXT DEFAULT '123',
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG YÊU CẦU KÍCH HOẠT & CẤP PIN (DÀNH CHO NGƯỜI MỚI ĐĂNG KÝ)
CREATE TABLE IF NOT EXISTS public.vidona_activation_requests (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  ma_nv TEXT,
  email TEXT NOT NULL,
  so_dien_thoai TEXT NOT NULL,
  phong_ban TEXT,
  chuc_vu TEXT,
  ly_do TEXT,
  trang_thai TEXT DEFAULT 'CHO_DUYET',
  ngay_gui TIMESTAMPTZ DEFAULT NOW(),
  pin_cap TEXT
);

-- Bật Row Level Security (RLS) & Phân quyền cho anon key
ALTER TABLE public.vidona_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vidona_activation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on vidona_users" ON public.vidona_users;
CREATE POLICY "Allow anon all on vidona_users" ON public.vidona_users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vidona_activation_requests" ON public.vidona_activation_requests;
CREATE POLICY "Allow anon all on vidona_activation_requests" ON public.vidona_activation_requests FOR ALL TO anon USING (true) WITH CHECK (true);
