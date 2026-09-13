import React, { useState, useEffect } from 'react';
import { 
  getKhoNVL, saveKhoNVL, getBM0307Records, syncAllApprovedBM0307ToKho 
} from '../services/storageService';
import { KhoNVLItem, BM0307Record } from '../types';
import { 
  Layers, AlertTriangle, CheckCircle2, TrendingDown, Plus, 
  ArrowDownLeft, ArrowUpRight, RefreshCw, FileText, Info, Edit3, X, Save,
  Search, Package, Flame, Sparkles, Box
} from 'lucide-react';

export const KhoNVLPage: React.FC = () => {
  const [items, setItems] = useState<KhoNVLItem[]>([]);
  const [editingItem, setEditingItem] = useState<KhoNVLItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [newItem, setNewItem] = useState<Partial<KhoNVLItem>>({
    ma_nvl: '',
    ten_nvl: '',
    nhom: 'XUONG',
    don_vi_tinh: 'Tấn',
    ton_kho: 0,
    ton_an_toan_min: 50,
    ton_an_toan_max: 500
  });

  const loadData = () => {
    // 1. Tự động đồng bộ các phiếu BM.03.07 đã ký duyệt 5/5 vào Kho
    syncAllApprovedBM0307ToKho();
    // 2. Lấy danh sách kho cập nhật nhất
    const list = getKhoNVL();
    setItems(list);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Filter items
  const filteredItems = items.filter(it => {
    if (activeGroup !== 'ALL' && it.nhom !== activeGroup) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = it.ten_nvl.toLowerCase().includes(q);
      const matchMa = it.ma_nvl.toLowerCase().includes(q);
      if (!matchName && !matchMa) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header & Data Flow Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="text-sky-600 dark:text-sky-400" size={24} />
            Quản Lý Xuất - Nhập - Tồn Kho Nguyên Vật Liệu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tự động liên thông 100% với Phiếu Nhập Kho BM.03.07 đã duyệt 5 cấp & lưu vết chỉ số kỹ thuật thực tế.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Đồng bộ lại từ các phiếu BM.03.07"
          >
            <RefreshCw size={15} /> Làm Mới / Đồng Bộ
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus size={16} /> + Thêm Vật Tư Kho
          </button>
        </div>
      </div>

      {/* GIẢI THÍCH NGUỒN GỐC SỐ LIỆU TỒN KHO */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900/20 via-blue-900/15 to-indigo-900/20 border border-sky-500/30 text-xs space-y-2 text-slate-800 dark:text-slate-200">
        <div className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-sm">
          <Info size={16} /> Nguồn gốc & Cơ chế cập nhật số liệu Tồn kho:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11.5px]">
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-inherit">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownLeft size={14} /> 1. Nhập Kho Tự Động (BM.03.07)
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              Khi phiếu <b>BM.03.07</b> được ký duyệt hoàn tất 5/5, hệ thống tự động cộng dồn số lượng nhập vào kho và cập nhật các chỉ số thực tế (Độ ẩm %, Độ co %, MKN %).
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

      {/* FILTER & TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveGroup('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeGroup === 'ALL'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất Cả ({items.length})
          </button>
          <button
            onClick={() => setActiveGroup('BAO_BI')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeGroup === 'BAO_BI'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package size={13} /> Bao Bì & Pallet ({items.filter(i => i.nhom === 'BAO_BI').length})
          </button>
          <button
            onClick={() => setActiveGroup('XUONG')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeGroup === 'XUONG'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box size={13} /> Nhóm Xương ({items.filter(i => i.nhom === 'XUONG').length})
          </button>
          <button
            onClick={() => setActiveGroup('MEN')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeGroup === 'MEN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={13} /> Nhóm Men ({items.filter(i => i.nhom === 'MEN').length})
          </button>
          <button
            onClick={() => setActiveGroup('NHIEN_LIEU')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeGroup === 'NHIEN_LIEU'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame size={13} /> Nhiên Liệu ({items.filter(i => i.nhom === 'NHIEN_LIEU').length})
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên vật tư, mã TCCS..."
            className="pl-8 pr-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 text-xs w-full sm:w-60 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Grid danh sách nguyên vật liệu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 italic glass-panel rounded-2xl">
            Không tìm thấy vật tư nào trong nhóm này
          </div>
        ) : (
          filteredItems.map(item => {
            const isLow = item.ton_kho <= item.ton_an_toan_min;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 relative group hover:border-sky-500/40 transition-all shadow-sm"
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
                      Mã: <span className="font-bold text-sky-600 dark:text-sky-400">{item.ma_nvl}</span> | Nhóm: <span className="font-semibold uppercase">{item.nhom}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {item.ton_kho.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.don_vi_tinh}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Tồn Min: {item.ton_an_toan_min.toLocaleString()} | Max: {item.ton_an_toan_max.toLocaleString()}</div>
                  </div>
                </div>

                {item.lo_moi_nhat && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Lô nhập gần nhất ({item.lo_moi_nhat.ngay_nhap})</span>
                      <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">Phiếu: {item.lo_moi_nhat.so_phieu}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">NCC: <strong>{item.lo_moi_nhat.nha_cung_cap}</strong></div>
                    {(item.lo_moi_nhat.do_am !== undefined || item.lo_moi_nhat.do_co !== undefined || item.lo_moi_nhat.mkn !== undefined) && (
                      <div className="flex flex-wrap gap-3 pt-1 font-mono font-bold text-sky-700 dark:text-sky-300 text-[11px]">
                        {item.lo_moi_nhat.do_am !== undefined && <span className="bg-sky-500/10 px-2 py-0.5 rounded">Độ ẩm: {item.lo_moi_nhat.do_am}%</span>}
                        {item.lo_moi_nhat.do_co !== undefined && <span className="bg-indigo-500/10 px-2 py-0.5 rounded">Độ co: {item.lo_moi_nhat.do_co}%</span>}
                        {item.lo_moi_nhat.mkn !== undefined && <span className="bg-purple-500/10 px-2 py-0.5 rounded">MKN: {item.lo_moi_nhat.mkn}%</span>}
                      </div>
                    )}
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
          })
        )}
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

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => handleUpdateTonKho(editingItem)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
              >
                <Save size={14} /> Lưu Thay Đổi
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
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm Nguyên Vật Liệu Mới Vào Kho</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Mã Vật Tư / TCCS:</label>
                <input 
                  type="text"
                  value={newItem.ma_nvl}
                  onChange={(e) => setNewItem({ ...newItem, ma_nvl: e.target.value })}
                  placeholder="Ví dụ: TC-BB-30, DS_VC..."
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Tên Nguyên Vật Liệu:</label>
                <input 
                  type="text"
                  value={newItem.ten_nvl}
                  onChange={(e) => setNewItem({ ...newItem, ten_nvl: e.target.value })}
                  placeholder="Ví dụ: Bao Bì Carton 300x600 mm..."
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Nhóm:</label>
                  <select
                    value={newItem.nhom}
                    onChange={(e) => setNewItem({ ...newItem, nhom: e.target.value as any })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="XUONG">Xương</option>
                    <option value="MEN">Men</option>
                    <option value="BAO_BI">Bao Bì & Pallet</option>
                    <option value="NHIEN_LIEU">Nhiên Liệu</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Đơn Vị Tính:</label>
                  <input 
                    type="text"
                    value={newItem.don_vi_tinh}
                    onChange={(e) => setNewItem({ ...newItem, don_vi_tinh: e.target.value })}
                    placeholder="Tấn, Cái, Kg..."
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Tồn Ban Đầu:</label>
                  <input 
                    type="number"
                    value={newItem.ton_kho}
                    onChange={(e) => setNewItem({ ...newItem, ton_kho: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-bold text-sky-600"
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
                <div>
                  <label className="font-bold block mb-1">Tồn Max:</label>
                  <input 
                    type="number"
                    value={newItem.ton_an_toan_max}
                    onChange={(e) => setNewItem({ ...newItem, ton_an_toan_max: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
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
