import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, BookOpen, Layers, LineChart, Bot, ShieldCheck, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { getBM0307Records, getKhoNVL, getSanLuong } from '../services/storageService';

interface TrangChuProps {
  onNavigate?: (page: string) => void;
}

export const TrangChu: React.FC<TrangChuProps> = ({ onNavigate }) => {
  const records = getBM0307Records();
  const khoNVL = getKhoNVL();
  const sanLuong = getSanLuong();

  const passedCount = records.filter(r => r.ket_luan === 'DAT').length;
  const warningCount = records.filter(r => r.ket_luan !== 'DAT').length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold mb-3">
            <ShieldCheck size={14} className="text-emerald-300" /> Hệ Thống Quản Lý Sản Xuất & KCS Vidona
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Chào Mừng Đến Với VIDONA PXSX 4.0
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
            Tối ưu hóa quy trình kiểm soát chất lượng nguyên vật liệu theo <strong>TCCS TC.09.01</strong>, biểu mẫu <strong>BM.03.07 động</strong>, quản lý kho thông minh và trợ lý AI tra cứu chuyên biệt.
          </p>
        </div>
      </div>

      {/* Quick KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Phiếu BM.03.07 Đã Lập</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{records.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">✓ {passedCount} Lô Đạt Chuẩn</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Lô Cần Xử Lý / Hạ Cấp</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{warningCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Đã xử lý trừ ẩm / phạt</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Sản Lượng Ra Lò Ca 1</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">4,200 m²</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Tỷ lệ Loại 1: 94.5%</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Bộ Tiêu Chuẩn TCCS</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">41 Bảng</div>
          <div className="text-[11px] text-indigo-500 font-semibold mt-1">TC.09.01 Lần 02</div>
        </div>
      </div>

      {/* Main Module Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate?.('bm0307')}
          className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <FileSpreadsheet size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Phiếu Nhập Kho BM.03.07 Động</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Tự động load bảng thông số Pallet, Frit, Đất sét theo TCCS, so khớp 2 cột Xanh/Đỏ và duyệt 5 cấp.
          </p>
          <div className="text-xs font-bold text-blue-600 flex items-center gap-1">Vào lập phiếu <ArrowRight size={14} /></div>
        </div>

        <div
          onClick={() => onNavigate?.('tccs')}
          className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Tra Cứu TCCS (TC.09.01)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Xem toàn bộ 41 bảng tiêu chuẩn chấp nhận nguyên vật liệu, pallet, bao bì và quy chuẩn kỹ thuật.
          </p>
          <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">Xem chi tiết <ArrowRight size={14} /></div>
        </div>

        <div
          onClick={() => onNavigate?.('ai')}
          className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-sky-500 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Bot size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Trợ Lý AI Tra Cứu & Báo Cáo Lỗi</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Hỏi nhanh TCCS nguyên liệu và tự động quét lọc danh sách các lô Không Đạt theo Ngày / Tháng / Năm.
          </p>
          <div className="text-xs font-bold text-sky-600 flex items-center gap-1">Trò chuyện với AI <ArrowRight size={14} /></div>
        </div>
      </div>
    </div>
  );
};
