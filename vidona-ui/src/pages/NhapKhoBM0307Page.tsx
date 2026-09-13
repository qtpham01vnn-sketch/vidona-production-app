import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Filter, Search, Printer, Edit, Trash2, 
  CheckCircle2, XCircle, AlertTriangle, Download, RefreshCw, Layers,
  ChevronRight, Calendar, User, Truck, ShieldCheck, Clock
} from 'lucide-react';
import { BM0307Record } from '../types';
import { getBM0307Records, saveBM0307Record, fetchBM0307FromSupabase } from '../services/storageService';
import { DynamicBM0307 } from '../components/bm0307/DynamicBM0307';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const NhapKhoBM0307Page: React.FC = () => {
  const { user, canCreateBM0307, isWorker } = useAuth();
  const { theme } = useTheme();

  const [records, setRecords] = useState<BM0307Record[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected' | 'completed'>('all');
  
  // Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [kcsStatusFilter, setKcsStatusFilter] = useState<'all' | 'DAT' | 'KHONG_DAT'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BM0307Record | undefined>(undefined);

  const loadData = async () => {
    const list = getBM0307Records();
    setRecords(list);
    try {
      const cloudList = await fetchBM0307FromSupabase();
      if (cloudList && cloudList.length > 0) {
        setRecords(cloudList);
      }
    } catch (e) {
      console.warn('Could not sync from cloud:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    setEditingRecord(undefined);
    setShowModal(true);
  };

  const handleEdit = (rec: BM0307Record) => {
    setEditingRecord(rec);
    setShowModal(true);
  };

  const handleSave = async (savedRec: BM0307Record) => {
    setRecords(prev => {
      const idx = prev.findIndex(r => r.id === savedRec.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedRec;
        return next;
      }
      return [savedRec, ...prev];
    });

    setActiveTab('all');
    setFromDate('');
    setToDate('');
    setSupplierSearch('');
    setMaterialSearch('');
    setKcsStatusFilter('all');

    setShowModal(false);
    await saveBM0307Record(savedRec);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isApproved5 = r.chu_ky?.lanh_dao_duyet?.da_ky;
      const isRejected = r.ket_luan === 'KHONG_DAT';
      
      if (activeTab === 'completed' && !isApproved5) return false;
      if (activeTab === 'pending' && (isApproved5 || isRejected)) return false;
      if (activeTab === 'rejected' && !isRejected) return false;

      if (supplierSearch && !r.nha_cung_cap.toLowerCase().includes(supplierSearch.toLowerCase())) {
        return false;
      }

      if (materialSearch && !r.ten_hang_hoa.toLowerCase().includes(materialSearch.toLowerCase())) {
        return false;
      }

      if (kcsStatusFilter !== 'all' && r.ket_luan !== kcsStatusFilter) {
        return false;
      }

      if (fromDate && r.ngay_kiem_tra < fromDate) return false;
      if (toDate && r.ngay_kiem_tra > toDate) return false;

      return true;
    });
  }, [records, activeTab, supplierSearch, materialSearch, kcsStatusFilter, fromDate, toDate]);

  const getDuyetBadge = (r: BM0307Record) => {
    if (r.chu_ky?.lanh_dao_duyet?.da_ky) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck size={13} /> ✓ ĐÃ DUYỆT (5/5)
        </span>
      );
    } else if (r.chu_ky?.bo_phan_su_dung?.da_ky) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
          <Clock size={13} /> Chờ Cấp 5 (Sếp Duyệt)
        </span>
      );
    } else if (r.chu_ky?.phu_trach_kcs?.da_ky) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
          <Clock size={13} /> Chờ Cấp 4 (Quản Đốc)
        </span>
      );
    } else if (r.chu_ky?.nguoi_kiem_tra?.da_ky) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Clock size={13} /> Chờ Cấp 3 (P.KTCN)
        </span>
      );
    } else if (r.chu_ky?.nguoi_giao_hang?.da_ky) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Clock size={13} /> Chờ Cấp 2 (KCS Ktra)
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1">
          <Clock size={13} /> Chờ Cấp 1 (P.KHTH Lập)
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Phiếu Nhập Kho & KCS (BM.03.07)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quy trình kiểm soát chất lượng & ký duyệt 5 cấp điện tử theo TCCS TC.09.01
            </p>
          </div>
        </div>

        {canCreateBM0307 && (
          <button
            onClick={handleCreateNew}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
          >
            <Plus size={18} /> + Lập Phiếu BM.03.07 Mới
          </button>
        )}
      </div>

      {/* FILTER BOX */}
      <div className="glass-panel p-3.5 sm:p-5 rounded-2xl space-y-3">
        
        {/* Thanh tìm kiếm nhanh & Nút mở rộng bộ lọc */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              value={materialSearch} 
              onChange={(e) => setMaterialSearch(e.target.value)} 
              placeholder="Tìm nhanh tên hàng, mã TCCS, pallet..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              showFilters 
                ? 'bg-sky-600 text-white border-sky-600' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Filter size={14} /> <span className="hidden sm:inline">Bộ Lọc</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl border text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Bộ lọc chi tiết (Collapsible on mobile) */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 text-xs border-t border-inherit">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">📅 Từ Ngày</label>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">📅 Đến Ngày</label>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">🏢 Nhà Cung Cấp</label>
              <input 
                type="text" 
                value={supplierSearch} 
                onChange={(e) => setSupplierSearch(e.target.value)} 
                placeholder="VD: DNTN Gỗ, Hưng Phát..."
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">⚖️ Đánh Giá KCS</label>
              <select 
                value={kcsStatusFilter} 
                onChange={(e) => setKcsStatusFilter(e.target.value as any)}
                className="w-full text-xs font-semibold"
              >
                <option value="all">Tất Cả Kết Quả</option>
                <option value="DAT">🟢 Đạt Tiêu Chuẩn</option>
                <option value="KHONG_DAT">🔴 Không Đạt / Hạ Cấp</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab lọc trạng thái - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'all' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất Cả ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'pending' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⏳ Chờ Duyệt ({records.filter(r => !r.chu_ky?.lanh_dao_duyet?.da_ky && r.ket_luan !== 'KHONG_DAT').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'rejected' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ❌ Lỗi ({records.filter(r => r.ket_luan === 'KHONG_DAT').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'completed' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ✓ Đã Duyệt ({records.filter(r => r.chu_ky?.lanh_dao_duyet?.da_ky).length})
          </button>
        </div>
      </div>

      {/* 📱 1. MOBILE CARDS VIEW (HIỂN THỊ ĐẸP, RÕ RÀNG TRÊN ĐIỆN THOẠI) */}
      <div className="block lg:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-500 italic glass-panel rounded-2xl">
            Không tìm thấy phiếu nào
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div 
              key={r.id}
              onClick={() => handleEdit(r)}
              className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono font-black text-base text-sky-600 dark:text-sky-400">
                    {r.so_phieu}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {new Date(r.ngay_kiem_tra).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div>
                  {r.ket_luan === 'DAT' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      🟢 Đạt
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                      🔴 K.Đạt
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {r.ten_hang_hoa}
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>NCC: <strong>{r.nha_cung_cap}</strong></span>
                  <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">TCCS: {r.ma_tccs}</span>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm pt-1">
                  SL: {r.so_luong_nhap.toLocaleString('vi-VN')} {r.don_vi_tinh}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>{getDuyetBadge(r)}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(r); }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <Edit size={13} /> Ký / Xem
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 2. DESKTOP TABLE VIEW (HIỂN THỊ CHI TIẾT TRÊN MÁY TÍNH) */}
      <div className="hidden lg:block glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Layers size={16} className="text-sky-600 dark:text-sky-400" />
            <span>Danh Sách Phiếu Nhập Kho & KCS ({filteredRecords.length} Phiếu)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom text-xs">
            <thead>
              <tr>
                <th className="w-24 text-center">Số Phiếu</th>
                <th className="w-28">Ngày Nhập</th>
                <th>Nhà Cung Cấp</th>
                <th>Tên Hàng Hóa</th>
                <th className="text-right">Khối Lượng</th>
                <th className="text-center w-28">Đánh Giá KCS</th>
                <th className="text-center w-40">Tiến Độ Duyệt</th>
                <th className="text-center w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 italic">
                    Không tìm thấy phiếu BM.03.07 nào phù hợp bộ lọc
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="text-center font-bold text-sky-600 dark:text-sky-400">
                      <button 
                        onClick={() => handleEdit(r)}
                        className="hover:underline font-mono text-sm"
                      >
                        {r.so_phieu}
                      </button>
                    </td>
                    <td className="text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(r.ngay_kiem_tra).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="font-semibold text-slate-900 dark:text-slate-200">
                      {r.nha_cung_cap}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{r.ten_hang_hoa}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">TCCS: {r.ma_tccs}</div>
                    </td>
                    <td className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {r.so_luong_nhap.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{r.don_vi_tinh}</span>
                    </td>
                    <td className="text-center">
                      {r.ket_luan === 'DAT' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          🟢 Đạt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                          🔴 K.Đạt
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {getDuyetBadge(r)}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400"
                          title="Xem / In / Ký duyệt"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          title="Chỉnh sửa phiếu"
                        >
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BIỂU MẪU ĐỘNG BM.03.07 CHUẨN A4 */}
      {showModal && (
        <DynamicBM0307
          initialData={editingRecord}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
};
