import React from 'react';
import { getSanLuong } from '../services/storageService';
import { LineChart, BarChart2, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SanLuongPage: React.FC = () => {
  const items = getSanLuong();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LineChart className="text-emerald-600" size={24} />
          Dashboard Sản Lượng & Phân Tích Lỗi Hạ Loại
        </h1>
        <p className="text-xs text-slate-500">Theo dõi sản lượng ra lò và biểu đồ Pareto top các nguyên nhân gây lỗi hạ loại gạch</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400">Sản Lượng Hôm Nay</div>
          <div className="text-2xl font-black text-blue-600 mt-1">8,550 m²</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">2 Ca sản xuất</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400">Tỷ Lệ Loại 1</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Vượt mục tiêu +0.8%</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400">Tỷ Lệ Hạ Loại</div>
          <div className="text-2xl font-black text-amber-500 mt-1">1.15%</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Kiểm soát tốt</div>
        </div>
        <div className="p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-400">Tỷ Lệ Phế Phẩm</div>
          <div className="text-2xl font-black text-red-500 mt-1">0.55%</div>
          <div className="text-[11px] text-red-500 font-semibold mt-1">Dưới ngưỡng cho phép</div>
        </div>
      </div>

      {/* Top Defect Causes (Pareto Analysis) */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
          Biểu Đồ Top Nguyên Nhân Lỗi Hạ Loại Gạch (Pareto)
        </h3>

        <div className="space-y-3">
          {[
            { ten: '1. Nứt mộc / Sứt cạnh', pt: 42, color: 'bg-red-500' },
            { ten: '2. Châm kim / Rỗ bề mặt men', pt: 28, color: 'bg-amber-500' },
            { ten: '3. Cong vênh góc gạch', pt: 18, color: 'bg-blue-500' },
            { ten: '4. Lệch tông màu men', pt: 12, color: 'bg-indigo-500' },
          ].map(l => (
            <div key={l.ten} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span>{l.ten}</span>
                <span>{l.pt}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${l.color} rounded-full`} style={{ width: `${l.pt}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
