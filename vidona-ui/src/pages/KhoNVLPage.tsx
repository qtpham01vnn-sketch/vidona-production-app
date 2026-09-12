import React, { useState } from 'react';
import { getKhoNVL, saveKhoNVL, getBM0307Records } from '../services/storageService';
import { KhoNVLItem, BM0307Record } from '../types';
import { 
  Layers, AlertTriangle, CheckCircle2, TrendingDown, Plus, 
  ArrowDownLeft, ArrowUpRight, RefreshCw, FileText, Info, Edit3, X, Save
} from 'lucide-react';

export const KhoNVLPage: React.FC = () => {
  const [items, setItems] = useState<KhoNVLItem[]>(getKhoNVL);
  const [bmRecords] = useState<BM0307Record[]>(getBM0307Records);
  const [editingItem, setEditingItem] = useState<KhoNVLItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Partial<KhoNVLItem>>({
    ma_nvl: '',
    ten_nvl: '',
    nhom: 'XUONG',
    don_vi_tinh: 'Tấn',
    ton_kho: 0,
    ton_an_toan_min: 50,
    ton_an_toan_max: 500
  });

  const handleUpdateTonKho = (updated: KhoNVLItem) => {
    const list = items.map(it => it.id === updated.id ? updated : it);
    setItems(list);
    saveKhoNVL(list);
    setEditingItem(null);
  };

  const handleAddNewItem = () => {
    if (!newItem.ten_nvl || !newItem.ma_nvl) {
      alert('Vui lòng nhập Tên nguyên vật liệu và Mã NVL!');
      return;
    }
    const item: KhoNVLItem = {
      id: `nvl-${Date.now()}`,
      ma_nvl: newItem.ma_nvl.trim().toUpperCase(),
      ten_nvl: newItem.ten_nvl.trim(),
      nhom: newItem.nhom || 'XUONG',
      don_vi_tinh: newItem.don_vi_tinh || 'Tấn',
      ton_kho: Number(newItem.ton_kho) || 0,
      ton_an_toan_min: Number(newItem.ton_an_toan_min) || 0,
      ton_an_toan_max: Number(newItem.ton_an_toan_max) || 0
    };
    const list = [...items, item];
    setItems(list);
    saveKhoNVL(list);
    setShowAddModal(false);
    setNewItem({ ma_nvl: '', ten_nvl: '', nhom: 'XUONG', don_vi_tinh: 'Tấn', ton_kho: 0, ton_an_toan_min: 50, ton_an_toan_max: 500 });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header & Data Flow Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="text-blue-600 dark:text-blue-400" size={24} />
            Quản Lý Xuất - Nhập - Tồn Kho Nguyên Vật Liệu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lưu vết chỉ số kỹ thuật thực tế (Độ ẩm %, Độ co %, MKN %) phục vụ bài phối liệu & theo dõi tồn an toàn.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto transition-all"
        >
          <Plus size={16} /> + Thêm Vật Tư Kho
        </button>
      </div>

      {/* GIẢI THÍCH NGUỒN GỐC SỐ LIỆU TỒN KHO */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 via-sky-900/15 to-indigo-900/20 border border-blue-500/30 text-xs space-y-2 text-slate-800 dark:text-slate-200">
        <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-sm">
          <Info size={16} /> Nguồn gốc & Cơ chế cập nhật số liệu Tồn kho:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11.5px]">
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-inherit">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownLeft size={14} /> 1. Nhập Kho Tự Động (BM.03.07)
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              Khi phiếu <b>BM.03.07</b> được ký duyệt hoàn tất, hệ thống tự động cộng số lượng nhập vào kho và cập nhật các chỉ số thực tế (Độ ẩm %, Độ co %, MKN %).
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-inherit">
            <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <ArrowUpRight size={14} /> 2. Trừ Tồn Xuất Phối Liệu
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              Liên thông với đơn mẻ phối liệu xưởng men/xương để tự động trừ tồn kho theo bài phối thực tế từng ca.
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-inherit">
            <div className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
              <Edit3 size={14} /> 3. Điều Chỉnh Số Dư Ban Đầu
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              Thủ kho/Quản lý có thể bấm <b>"Sửa Tồn"</b> trên từng thẻ vật tư để cân đối số dư thực tế ban đầu tại nhà máy.
            </div>
          </div>
        </div>
      </div>

      {/* Grid danh sách nguyên vật liệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => {
          const isLow = item.ton_kho <= item.ton_an_toan_min;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    {item.ten_nvl}
                    {isLow && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle size={10} /> Dưới mức min
                      </span>
                    )}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {item.ma_nvl} | Nhóm: <span className="font-semibold">{item.nhom}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {item.ton_kho.toLocaleString('vi-VN')} <span className="text-xs font-semibold">{item.don_vi_tinh}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Tồn Min: {item.ton_an_toan_min} | Max: {item.ton_an_toan_max}</div>
                </div>
              </div>

              {item.lo_moi_nhat && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Lô nhập gần nhất ({item.lo_moi_nhat.ngay_nhap})</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{item.lo_moi_nhat.so_phieu}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">NCC: {item.lo_moi_nhat.nha_cung_cap}</div>
                  <div className="flex flex-wrap gap-3 pt-1 font-mono font-bold text-blue-700 dark:text-blue-300 text-[11px]">
                    {item.lo_moi_nhat.do_am !== undefined && <span className="bg-blue-500/10 px-2 py-0.5 rounded">Độ ẩm: {item.lo_moi_nhat.do_am}%</span>}
                    {item.lo_moi_nhat.do_co !== undefined && <span className="bg-indigo-500/10 px-2 py-0.5 rounded">Độ co: {item.lo_moi_nhat.do_co}%</span>}
                    {item.lo_moi_nhat.mkn !== undefined && <span className="bg-purple-500/10 px-2 py-0.5 rounded">MKN: {item.lo_moi_nhat.mkn}%</span>}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 size={13} /> Sửa Tồn & Mức An Toàn
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Sửa Tồn Kho */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Điều Chỉnh Tồn Kho: {editingItem.ten_nvl}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Số lượng tồn kho hiện tại ({editingItem.don_vi_tinh}):</label>
                <input 
                  type="number"
                  value={editingItem.ton_kho}
                  onChange={(e) => setEditingItem({ ...editingItem, ton_kho: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Tồn an toàn Min:</label>
                  <input 
                    type="number"
                    value={editingItem.ton_an_toan_min}
                    onChange={(e) => setEditingItem({ ...editingItem, ton_an_toan_min: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tồn an toàn Max:</label>
                  <input 
                    type="number"
                    value={editingItem.ton_an_toan_max}
                    onChange={(e) => setEditingItem({ ...editingItem, ton_an_toan_max: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={() => handleUpdateTonKho(editingItem)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Save size={14} /> Lưu Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Vật Tư Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">+ Thêm Nguyên Vật Liệu / Vật Tư Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tên Nguyên Vật Liệu / Hàng Hóa:</label>
                <input 
                  type="text"
                  placeholder="VD: Đất Sét Bảo Lộc, Vỏ Thùng Carton 600x600..."
                  value={newItem.ten_nvl}
                  onChange={(e) => setNewItem({ ...newItem, ten_nvl: e.target.value })}
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Mã NVL:</label>
                  <input 
                    type="text"
                    placeholder="VD: DS_BL, CT_600..."
                    value={newItem.ma_nvl}
                    onChange={(e) => setNewItem({ ...newItem, ma_nvl: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Phân Nhóm:</label>
                  <select 
                    value={newItem.nhom}
                    onChange={(e) => setNewItem({ ...newItem, nhom: e.target.value as any })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="XUONG">Xương (Đất, Đá, Tràng thạch)</option>
                    <option value="MEN">Men & Frit</option>
                    <option value="BAO_BI">Vật tư bao bì & Pallet</option>
                    <option value="PHU_GIA">Phụ gia & Hóa chất</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">ĐVT:</label>
                  <input 
                    type="text"
                    placeholder="Tấn, Cái, Kg..."
                    value={newItem.don_vi_tinh}
                    onChange={(e) => setNewItem({ ...newItem, don_vi_tinh: e.target.value })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tồn Ban Đầu:</label>
                  <input 
                    type="number"
                    value={newItem.ton_kho}
                    onChange={(e) => setNewItem({ ...newItem, ton_kho: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tồn Min:</label>
                  <input 
                    type="number"
                    value={newItem.ton_an_toan_min}
                    onChange={(e) => setNewItem({ ...newItem, ton_an_toan_min: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewItem}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Plus size={14} /> Thêm Vào Kho
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
