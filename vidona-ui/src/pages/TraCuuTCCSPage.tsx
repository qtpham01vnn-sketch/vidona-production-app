import React, { useState, useRef } from 'react';
import { 
  getStoredTCCS, saveStoredTCCS, addOrUpdateTCCS, deleteTCCS, resetTCCSToDefault 
} from '../services/tccsData';
import { TCCSBang, TCCSChiTieu } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Search, Plus, Download, Upload, Trash2, Edit3, 
  ChevronDown, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, X, FileSpreadsheet, FileText, Check
} from 'lucide-react';
import { downloadTCCSExcelTemplate, processMultiTCCSFiles, FileImportResult } from '../services/tccsFileImportService';

export const TraCuuTCCSPage: React.FC = () => {
  const { theme } = useTheme();
  const [tccsList, setTccsList] = useState<TCCSBang[]>(getStoredTCCS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'XUONG' | 'MEN' | 'BAO_BI_PHU_TRO' | 'NHIEN_LIEU'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal Sửa/Thêm state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTccs, setEditingTccs] = useState<Partial<TCCSBang> | null>(null);

  // Modal Import Multi-Files state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importTab, setImportTab] = useState<'FILES' | 'PASTE_JSON'>('FILES');
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [fileResults, setFileResults] = useState<FileImportResult[]>([]);
  const [pendingExtractedItems, setPendingExtractedItems] = useState<TCCSBang[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lọc danh sách
  const filteredList = tccsList.filter(item => {
    const matchTab = activeTab === 'ALL' || item.nhom === activeTab;
    const matchSearch = 
      item.ten_tccs.toLowerCase().includes(search.toLowerCase()) ||
      item.ten_hang_hoa.toLowerCase().includes(search.toLowerCase()) ||
      item.ma_tccs.toLowerCase().includes(search.toLowerCase()) ||
      (item.ten_goi_khac && item.ten_goi_khac.toLowerCase().includes(search.toLowerCase())) ||
      item.chi_tieu.some(c => c.ten_chi_tieu.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  // Mở modal thêm mới
  const handleAddNew = () => {
    setEditingTccs({
      ma_tccs: `TC-NEW-${Date.now().toString().slice(-4)}`,
      ten_tccs: '',
      nhom: 'XUONG',
      ten_hang_hoa: '',
      ten_goi_khac: '',
      ngoai_quan: [''],
      chi_tieu: [
        { id: 'ct_1', ten_chi_tieu: 'Độ ẩm (%)', tieu_chuan: '≤ 25.0 %', kieu_kiem_tra: 'SO_SANH_SO' }
      ]
    });
    setShowModal(true);
  };

  // Mở modal sửa
  const handleEdit = (tccs: TCCSBang, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTccs(JSON.parse(JSON.stringify(tccs)));
    setShowModal(true);
  };

  // Xóa TCCS
  const handleDelete = (maTccs: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa tiêu chuẩn ${maTccs}?`)) {
      const updated = deleteTCCS(maTccs);
      setTccsList(updated);
    }
  };

  // Lưu TCCS từ modal
  const handleSaveTccs = () => {
    if (!editingTccs?.ten_hang_hoa || !editingTccs?.ma_tccs) {
      alert('Vui lòng nhập đầy đủ Mã TCCS và Tên hàng hóa!');
      return;
    }
    const fullItem: TCCSBang = {
      ma_tccs: editingTccs.ma_tccs,
      ten_tccs: editingTccs.ten_tccs || editingTccs.ten_hang_hoa,
      nhom: editingTccs.nhom || 'XUONG',
      ten_hang_hoa: editingTccs.ten_hang_hoa,
      ten_goi_khac: editingTccs.ten_goi_khac || '',
      ngoai_quan: (editingTccs.ngoai_quan || []).filter(s => s.trim().length > 0),
      chi_tieu: (editingTccs.chi_tieu || []).filter(c => c.ten_chi_tieu.trim().length > 0)
    };
    const updated = addOrUpdateTCCS(fullItem);
    setTccsList(updated);
    setShowModal(false);
    setEditingTccs(null);
  };

  // Xuất file JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tccsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TCCS_TC0901_VIDONA_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Xử lý khi người dùng chọn nhiều file Excel / Docx / JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsProcessingFiles(true);
    try {
      const results = await processMultiTCCSFiles(e.target.files);
      setFileResults(results);

      const allItems: TCCSBang[] = [];
      results.forEach(r => {
        if (r.success) {
          allItems.push(...r.items);
        }
      });
      setPendingExtractedItems(allItems);
    } catch (err: any) {
      alert('Lỗi xử lý file: ' + err.message);
    }
    setIsProcessingFiles(false);
  };

  // Xác nhận nạp dữ liệu từ các file đã tải lên
  const handleConfirmFileImport = () => {
    if (pendingExtractedItems.length === 0) {
      alert('Chưa có bảng tiêu chuẩn nào được trích xuất từ file!');
      return;
    }

    const current = [...tccsList];
    let addedCount = 0;
    let updatedCount = 0;

    pendingExtractedItems.forEach(item => {
      const idx = current.findIndex(t => t.ma_tccs === item.ma_tccs || t.ten_hang_hoa.toLowerCase() === item.ten_hang_hoa.toLowerCase());
      if (idx >= 0) {
        current[idx] = item;
        updatedCount++;
      } else {
        current.push(item);
        addedCount++;
      }
    });

    saveStoredTCCS(current);
    setTccsList(current);
    setShowImportModal(false);
    setFileResults([]);
    setPendingExtractedItems([]);
    alert(`✓ Nạp thành công: Thêm mới ${addedCount} bảng, cập nhật ${updatedCount} bảng TCCS vào hệ thống!`);
  };

  // Import từ mã JSON dán trực tiếp
  const handleImportSubmit = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        alert('Dữ liệu JSON phải là một mảng danh sách các bảng TCCS!');
        return;
      }
      saveStoredTCCS(parsed);
      setTccsList(parsed);
      setShowImportModal(false);
      setImportJsonText('');
      alert(`Đã cập nhật thành công ${parsed.length} bảng tiêu chuẩn TCCS!`);
    } catch (e) {
      alert('Mã JSON không hợp lệ! Vui lòng kiểm tra lại cấu trúc.');
    }
  };

  // Khôi phục mặc định
  const handleReset = () => {
    if (confirm('Khôi phục lại toàn bộ danh mục 38 bảng tiêu chuẩn TC.09.01 gốc của nhà máy?')) {
      const reset = resetTCCSToDefault();
      setTccsList(reset);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            📑 Bảng Tra Cứu Tiêu Chuẩn Cơ Sở (TC.09.01)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản trị & tra cứu định mức nghiệm thu KCS cho toàn bộ nguyên nhiên vật liệu nhà máy Vidona
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddNew}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus size={15} /> + Thêm TCCS Mới
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Upload size={14} /> 📥 Import TCCS (Excel/Word)
          </button>
          <button
            onClick={handleExportData}
            className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={14} /> Xuất File
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 font-semibold text-xs"
            title="Khôi phục danh mục gốc"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* SEARCH & TABS */}
      <div className="glass-panel p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Gõ tìm theo tên nguyên liệu, mã TCCS, thành phần (VD: Pallet, Đất sét, 300x600, Bã điều, Frit...)..."
              className="w-full pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất Cả ({tccsList.length})
            </button>
            <button
              onClick={() => setActiveTab('XUONG')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'XUONG' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Xương ({tccsList.filter(t => t.nhom === 'XUONG').length})
            </button>
            <button
              onClick={() => setActiveTab('MEN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'MEN' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Men & Hóa Chất ({tccsList.filter(t => t.nhom === 'MEN').length})
            </button>
            <button
              onClick={() => setActiveTab('BAO_BI_PHU_TRO')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'BAO_BI_PHU_TRO' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bao Bì & Pallet ({tccsList.filter(t => t.nhom === 'BAO_BI_PHU_TRO').length})
            </button>
            <button
              onClick={() => setActiveTab('NHIEN_LIEU')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'NHIEN_LIEU' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nhiên Liệu ({tccsList.filter(t => t.nhom === 'NHIEN_LIEU').length})
            </button>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BẢNG TCCS */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 italic">
            Không tìm thấy bảng TCCS nào phù hợp từ khóa "{search}"
          </div>
        ) : (
          filteredList.map((tccs) => {
            const isExpanded = expandedId === tccs.ma_tccs;
            return (
              <div 
                key={tccs.ma_tccs}
                className="glass-panel rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Header Card */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : tccs.ma_tccs)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {tccs.ten_tccs}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                          {tccs.ma_tccs}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          Nhóm: <b className="text-slate-700 dark:text-slate-300">{tccs.nhom}</b>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tên hàng hóa: <span className="font-semibold text-slate-700 dark:text-slate-200">{tccs.ten_hang_hoa}</span>
                        {tccs.ten_goi_khac && <span className="italic"> ({tccs.ten_goi_khac})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono hidden md:inline">
                      {tccs.chi_tieu.length} chỉ tiêu
                    </span>
                    <button
                      onClick={(e) => handleEdit(tccs, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
                      title="Sửa TCCS này"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(tccs.ma_tccs, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                      title="Xóa TCCS này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 text-xs">
                    
                    {/* Ngoại quan */}
                    {tccs.ngoai_quan && tccs.ngoai_quan.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Quy cách ngoại quan & cảm quan:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tccs.ngoai_quan.map((nq, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 text-[11.5px]">
                              <CheckCircle2 size={12} /> {nq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bảng chỉ tiêu */}
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Bảng chỉ tiêu kỹ thuật chấp nhận:
                      </span>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-inherit">
                            <tr>
                              <th className="p-2 w-12 text-center">TT</th>
                              <th className="p-2">Chỉ Tiêu Kỹ Thuật (Norms)</th>
                              <th className="p-2 font-mono">Tiêu Chuẩn Chấp Nhận (TCCS)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit">
                            {tccs.chi_tieu.map((ct, idx) => (
                              <tr key={ct.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                                <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                                <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{ct.ten_chi_tieu}</td>
                                <td className="p-2 font-bold font-mono text-sky-700 dark:text-sky-400">{ct.tieu_chuan}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL THÊM / SỬA TCCS */}
      {showModal && editingTccs && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-4 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg text-gradient">
                {editingTccs.ma_tccs ? `Chỉnh Sửa: ${editingTccs.ten_hang_hoa || editingTccs.ma_tccs}` : '+ Thêm Tiêu Chuẩn Cơ Sở Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Mã TCCS (*):</label>
                <input
                  type="text"
                  value={editingTccs.ma_tccs || ''}
                  onChange={(e) => setEditingTccs({ ...editingTccs, ma_tccs: e.target.value })}
                  placeholder="VD: TC-XU-01, TC-BB-30..."
                  className="w-full font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Phân Nhóm (*):</label>
                <select
                  value={editingTccs.nhom || 'XUONG'}
                  onChange={(e) => setEditingTccs({ ...editingTccs, nhom: e.target.value as any })}
                  className="w-full font-bold"
                >
                  <option value="XUONG">Xương (Đất, đá, tràng thạch)</option>
                  <option value="MEN">Men & Hóa chất</option>
                  <option value="BAO_BI_PHU_TRO">Bao bì & Phụ trợ (Pallet, Carton...)</option>
                  <option value="NHIEN_LIEU">Nhiên liệu (Than, Vỏ điều...)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">Tên Hàng Hóa / Nguyên Liệu (*):</label>
                <input
                  type="text"
                  value={editingTccs.ten_hang_hoa || ''}
                  onChange={(e) => setEditingTccs({ ...editingTccs, ten_hang_hoa: e.target.value, ten_tccs: e.target.value })}
                  placeholder="VD: Đất Sét Vĩnh Cửu, Vỏ Hộp Carton 300x600 mm..."
                  className="w-full font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold block mb-1">Tên Gọi Khác / Ký Hiệu Mỏ (nếu có):</label>
                <input
                  type="text"
                  value={editingTccs.ten_goi_khac || ''}
                  onChange={(e) => setEditingTccs({ ...editingTccs, ten_goi_khac: e.target.value })}
                  placeholder="VD: PND VC (01, 02...), Vỏ hộp 30x60..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Ngoại quan items */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold">Yêu Cầu Ngoại Quan / Cảm Quan:</span>
                <button
                  type="button"
                  onClick={() => setEditingTccs({ ...editingTccs, ngoai_quan: [...(editingTccs.ngoai_quan || []), ''] })}
                  className="text-sky-400 hover:underline font-bold text-[11px]"
                >
                  + Thêm gạch đầu dòng
                </button>
              </div>
              {(editingTccs.ngoai_quan || []).map((nq, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={nq}
                    onChange={(e) => {
                      const list = [...(editingTccs.ngoai_quan || [])];
                      list[idx] = e.target.value;
                      setEditingTccs({ ...editingTccs, ngoai_quan: list });
                    }}
                    placeholder="VD: Dạng cục rời, màu trắng xám khi ẩm..."
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const list = (editingTccs.ngoai_quan || []).filter((_, i) => i !== idx);
                      setEditingTccs({ ...editingTccs, ngoai_quan: list });
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Chỉ tiêu items */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold">Danh Sách Chỉ Tiêu Nghiệm Thu:</span>
                <button
                  type="button"
                  onClick={() => setEditingTccs({
                    ...editingTccs,
                    chi_tieu: [
                      ...(editingTccs.chi_tieu || []),
                      { id: `ct_${Date.now()}`, ten_chi_tieu: '', tieu_chuan: '', kieu_kiem_tra: 'VAN_BAN' }
                    ]
                  })}
                  className="text-sky-400 hover:underline font-bold text-[11px]"
                >
                  + Thêm chỉ tiêu
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(editingTccs.chi_tieu || []).map((ct, idx) => (
                  <div key={ct.id || idx} className="flex gap-2 items-center">
                    <span className="text-slate-400 font-mono w-5 text-center">{idx + 1}</span>
                    <input
                      type="text"
                      value={ct.ten_chi_tieu}
                      onChange={(e) => {
                        const list = [...(editingTccs.chi_tieu || [])];
                        list[idx].ten_chi_tieu = e.target.value;
                        setEditingTccs({ ...editingTccs, chi_tieu: list });
                      }}
                      placeholder="Tên chỉ tiêu (VD: Chiều dài (mm), Độ ẩm (%))"
                      className="flex-1 font-semibold"
                    />
                    <input
                      type="text"
                      value={ct.tieu_chuan}
                      onChange={(e) => {
                        const list = [...(editingTccs.chi_tieu || [])];
                        list[idx].tieu_chuan = e.target.value;
                        setEditingTccs({ ...editingTccs, chi_tieu: list });
                      }}
                      placeholder="Quy chuẩn (VD: 610 ± 1 mm)"
                      className="w-36 font-mono text-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const list = (editingTccs.chi_tieu || []).filter((_, i) => i !== idx);
                        setEditingTccs({ ...editingTccs, chi_tieu: list });
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTccs}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Lưu Tiêu Chuẩn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT TCCS NÂNG CẤP ĐA FILE EXCEL / WORD / JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl p-6 space-y-4 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-300'
          }`}>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-gradient">📥 Import Danh Mục Tiêu Chuẩn TCCS</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tải lên file Excel (.xlsx), Word (.docx) hoặc JSON để nạp tự động vào hệ thống</p>
              </div>
              <button onClick={() => { setShowImportModal(false); setFileResults([]); setPendingExtractedItems([]); }} className="p-1 rounded text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Tabs chọn phương thức import */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setImportTab('FILES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  importTab === 'FILES' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileSpreadsheet size={15} /> 📁 Chọn File Excel / Word (Nhiều file cùng lúc)
              </button>
              <button
                onClick={() => setImportTab('PASTE_JSON')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  importTab === 'PASTE_JSON' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText size={15} /> 📋 Dán Mã JSON Cấu Hình
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD (EXCEL, WORD, JSON) */}
            {importTab === 'FILES' && (
              <div className="space-y-4 text-xs">
                
                {/* Khu vực Tải File Mẫu Excel */}
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <FileSpreadsheet size={16} /> Chưa có file mẫu chuẩn?
                    </div>
                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400 mt-0.5">
                      Tải file Excel mẫu được định dạng sẵn cột Chỉ Tiêu & Tiêu Chuẩn để điền dữ liệu nhanh chóng.
                    </p>
                  </div>
                  <button
                    onClick={downloadTCCSExcelTemplate}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow shrink-0"
                  >
                    <Download size={13} /> Tải File Mẫu Excel (.xlsx)
                  </button>
                </div>

                {/* Dropzone Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-indigo-400/50 hover:border-indigo-500 rounded-2xl text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/20 transition-all space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.docx,.doc,.json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload size={24} />
                  </div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Bấm để chọn file hoặc kéo thả nhiều file vào đây
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hỗ trợ: <b>Excel (.xlsx, .xls)</b>, <b>Word (.docx)</b>, <b>JSON (.json)</b>. Có thể chọn nhiều file cùng lúc!
                  </p>
                </div>

                {/* Trạng thái trích xuất file */}
                {isProcessingFiles && (
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 font-bold text-center animate-pulse">
                    ⏳ Đang phân tích và bóc tách các bảng tiêu chuẩn từ file...
                  </div>
                )}

                {/* Kết quả trích xuất từng file */}
                {fileResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Danh sách file đã chọn ({fileResults.length} file):</span>
                      <span className="text-emerald-500 font-mono">Trích xuất tổng cộng: {pendingExtractedItems.length} bảng TCCS</span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {fileResults.map((res, i) => (
                        <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          res.success 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          <div className="flex items-center gap-2">
                            {res.success ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                            <span className="font-semibold">{res.fileName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-mono">{res.fileType}</span>
                          </div>
                          <div className="font-bold text-xs">
                            {res.success ? `✓ Trích xuất ${res.itemCount} bảng` : `⚠️ ${res.error}`}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preview các bảng TCCS được trích xuất */}
                    {pendingExtractedItems.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="font-bold block text-slate-800 dark:text-slate-200">
                          Xem trước các bảng TCCS sẵn sàng nạp ({pendingExtractedItems.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                          {pendingExtractedItems.map((it, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[11px] font-medium">
                              <b>{it.ma_tccs}</b>: {it.ten_hang_hoa} ({it.chi_tieu.length} chỉ tiêu)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: PASTE JSON */}
            {importTab === 'PASTE_JSON' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">
                  Dán nội dung JSON danh mục TCCS đã xuất từ thiết bị khác để đồng bộ nhanh:
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={8}
                  placeholder="Dán mã JSON danh mục TCCS tại đây..."
                  className="w-full font-mono text-xs p-3"
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setFileResults([]); setPendingExtractedItems([]); }}
                className="px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
              
              {importTab === 'FILES' ? (
                <button
                  type="button"
                  disabled={pendingExtractedItems.length === 0}
                  onClick={handleConfirmFileImport}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <Check size={15} /> Xác Nhận Nạp {pendingExtractedItems.length} Bảng Vào Hệ Thống
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!importJsonText.trim()}
                  onClick={handleImportSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-40"
                >
                  Nạp Dữ Liệu JSON
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
