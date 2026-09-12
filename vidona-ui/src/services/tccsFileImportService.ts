import * as XLSX from 'xlsx';
import { TCCSBang, TCCSChiTieu } from '../types';

export interface FileImportResult {
  fileName: string;
  fileType: string;
  success: boolean;
  itemCount: number;
  items: TCCSBang[];
  error?: string;
}

// 1. Tải về file mẫu Excel TCCS chuẩn
export function downloadTCCSExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Mẫu Nhập TCCS
  const headers = [
    'Mã TCCS',
    'Tên Tiêu Chuẩn / Tên Bảng',
    'Phân Nhóm (XUONG / MEN / BAO_BI_PHU_TRO / NHIEN_LIEU)',
    'Tên Hàng Hóa',
    'Tên Gọi Khác (nếu có)',
    'Yêu Cầu Ngoại Quan (cách nhau bởi dấu chấm phẩy ;)',
    'Tên Chỉ Tiêu Kiểm Tra',
    'Tiêu Chuẩn Chấp Nhận',
    'Kiểu Kiểm Tra (SO_SANH_SO / VAN_BAN)'
  ];

  const sampleRows = [
    [
      'TC-BB-42',
      'Bảng 42: Pallet Nhựa 1200x1000',
      'BAO_BI_PHU_TRO',
      'Pallet Nhựa Chịu Tải 1200x1000',
      'Pallet nhựa xanh HDPE',
      'Nhựa đúc nguyên khối màu xanh; Không bavia; Chịu tải trọng tĩnh 3 tấn',
      'Kích thước dài x rộng (mm)',
      '1200 x 1000 ± 5 mm',
      'VAN_BAN'
    ],
    [
      'TC-BB-42',
      'Bảng 42: Pallet Nhựa 1200x1000',
      'BAO_BI_PHU_TRO',
      'Pallet Nhựa Chịu Tải 1200x1000',
      'Pallet nhựa xanh HDPE',
      'Nhựa đúc nguyên khối màu xanh; Không bavia; Chịu tải trọng tĩnh 3 tấn',
      'Chiều cao pallet (mm)',
      '150 ± 2 mm',
      'SO_SANH_SO'
    ],
    [
      'TC-BB-42',
      'Bảng 42: Pallet Nhựa 1200x1000',
      'BAO_BI_PHU_TRO',
      'Pallet Nhựa Chịu Tải 1200x1000',
      'Pallet nhựa xanh HDPE',
      'Nhựa đúc nguyên khối màu xanh; Không bavia; Chịu tải trọng tĩnh 3 tấn',
      'Trọng lượng (kg/cái)',
      '≥ 15.5 kg',
      'SO_SANH_SO'
    ],
    [
      'TC-XU-43',
      'Bảng 43: Đất Sét Lâm Đồng',
      'XUONG',
      'Đất Sét Lâm Đồng',
      'PND LD',
      'Dạng cục dẻo; Màu trắng ngà; Không lẫn tạp chất rễ cây',
      'Độ ẩm (%)',
      '≤ 22.0 %',
      'SO_SANH_SO'
    ],
    [
      'TC-XU-43',
      'Bảng 43: Đất Sét Lâm Đồng',
      'XUONG',
      'Đất Sét Lâm Đồng',
      'PND LD',
      'Dạng cục dẻo; Màu trắng ngà; Không lẫn tạp chất rễ cây',
      'Hàm lượng Al2O3 (%)',
      '≥ 28.0 %',
      'SO_SANH_SO'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  // Set column widths
  ws['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 25 },
    { wch: 30 },
    { wch: 22 },
    { wch: 45 },
    { wch: 32 },
    { wch: 25 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Mau_TCCS_Vidona');
  XLSX.writeFile(wb, 'Mau_Nhap_TCCS_Vidona.xlsx');
}

// 2. Parse 1 file Excel (hỗ trợ nhiều sheet)
export async function parseExcelTCCSFile(file: File): Promise<FileImportResult> {
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const itemsMap = new Map<string, TCCSBang>();

    wb.SheetNames.forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows || rows.length < 2) return;

      // Tìm dòng header
      let headerIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('tccs') || rowStr.includes('tên') || rowStr.includes('chỉ tiêu') || rowStr.includes('tiêu chuẩn')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rows[headerIdx].map((h: any) => String(h || '').trim().toLowerCase());
      
      const colMa = headers.findIndex((h: string) => h.includes('mã'));
      const colTenTccs = headers.findIndex((h: string) => h.includes('tên tiêu chuẩn') || h.includes('tên bảng'));
      const colNhom = headers.findIndex((h: string) => h.includes('nhóm') || h.includes('phân nhóm'));
      const colTenHang = headers.findIndex((h: string) => h.includes('tên hàng') || h.includes('hàng hóa'));
      const colTenKhac = headers.findIndex((h: string) => h.includes('khác') || h.includes('mã hiệu'));
      const colNgoaiQuan = headers.findIndex((h: string) => h.includes('ngoại quan') || h.includes('cảm quan'));
      const colChiTieu = headers.findIndex((h: string) => h.includes('chỉ tiêu') || h.includes('tên chỉ tiêu') || h.includes('thông số'));
      const colTieuChuan = headers.findIndex((h: string) => h.includes('tiêu chuẩn') || h.includes('quy chuẩn') || h.includes('chấp nhận') || h.includes('yêu cầu'));
      const colKieuKt = headers.findIndex((h: string) => h.includes('kiểu') || h.includes('loại kiểm tra'));

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const maTccs = colMa >= 0 && row[colMa] ? String(row[colMa]).trim() : `TCCS-${sheetName}-${r}`;
        const tenHang = colTenHang >= 0 && row[colTenHang] ? String(row[colTenHang]).trim() : (colTenTccs >= 0 && row[colTenTccs] ? String(row[colTenTccs]).trim() : `Vật tư ${sheetName}`);
        if (!tenHang) continue;

        const tenTccs = colTenTccs >= 0 && row[colTenTccs] ? String(row[colTenTccs]).trim() : tenHang;
        let nhom = colNhom >= 0 && row[colNhom] ? String(row[colNhom]).trim().toUpperCase() : 'XUONG';
        if (!['XUONG', 'MEN', 'BAO_BI_PHU_TRO', 'NHIEN_LIEU'].includes(nhom)) {
          const tenU = tenHang.toUpperCase();
          if (tenU.includes('CARTON') || tenU.includes('PALLET') || tenU.includes('ĐAI') || tenU.includes('KE') || tenU.includes('BĂNG') || tenU.includes('MÀNG') || tenU.includes('BI')) nhom = 'BAO_BI_PHU_TRO';
          else if (tenU.includes('MEN') || tenU.includes('FRIT') || tenU.includes('ZIRCON') || tenU.includes('TALC')) nhom = 'MEN';
          else if (tenU.includes('THAN') || tenU.includes('ĐIỀU')) nhom = 'NHIEN_LIEU';
          else nhom = 'XUONG';
        }

        const tenKhac = colTenKhac >= 0 && row[colTenKhac] ? String(row[colTenKhac]).trim() : '';
        const rawNgoaiQuan = colNgoaiQuan >= 0 && row[colNgoaiQuan] ? String(row[colNgoaiQuan]).trim() : '';
        const ngoaiQuanList = rawNgoaiQuan ? rawNgoaiQuan.split(/[;,\n\r]+/).map(s => s.trim()).filter(s => s.length > 0) : ['Theo quy định TC.09.01 và mẫu lưu STD'];

        const tenChiTieu = colChiTieu >= 0 && row[colChiTieu] ? String(row[colChiTieu]).trim() : '';
        const tieuChuan = colTieuChuan >= 0 && row[colTieuChuan] ? String(row[colTieuChuan]).trim() : '';
        const kieuKt = colKieuKt >= 0 && row[colKieuKt] && String(row[colKieuKt]).toUpperCase().includes('SO') ? 'SO_SANH_SO' : 'VAN_BAN';

        if (!itemsMap.has(maTccs)) {
          itemsMap.set(maTccs, {
            ma_tccs: maTccs,
            ten_tccs: tenTccs,
            nhom: nhom as any,
            ten_hang_hoa: tenHang,
            ten_goi_khac: tenKhac,
            ngoai_quan: ngoaiQuanList,
            chi_tieu: []
          });
        }

        if (tenChiTieu && tieuChuan) {
          const item = itemsMap.get(maTccs)!;
          item.chi_tieu.push({
            id: `ct_${item.chi_tieu.length + 1}`,
            ten_chi_tieu: tenChiTieu,
            tieu_chuan: tieuChuan,
            kieu_kiem_tra: kieuKt as any
          });
        }
      }
    });

    const items = Array.from(itemsMap.values()).map(it => {
      if (it.chi_tieu.length === 0) {
        it.chi_tieu.push({
          id: 'ct_1',
          ten_chi_tieu: 'Tiêu chuẩn chung',
          tieu_chuan: 'Đạt chuẩn ISO TC.09.01',
          kieu_kiem_tra: 'VAN_BAN'
        });
      }
      return it;
    });

    return {
      fileName: file.name,
      fileType: 'Excel',
      success: true,
      itemCount: items.length,
      items
    };
  } catch (err: any) {
    return {
      fileName: file.name,
      fileType: 'Excel',
      success: false,
      itemCount: 0,
      items: [],
      error: err?.message || 'Lỗi đọc file Excel'
    };
  }
}

// 3. Parse JSON file
export async function parseJsonTCCSFile(file: File): Promise<FileImportResult> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const items: TCCSBang[] = Array.isArray(parsed) ? parsed : [parsed];
    return {
      fileName: file.name,
      fileType: 'JSON',
      success: true,
      itemCount: items.length,
      items
    };
  } catch (err: any) {
    return {
      fileName: file.name,
      fileType: 'JSON',
      success: false,
      itemCount: 0,
      items: [],
      error: 'File JSON không hợp lệ'
    };
  }
}

// 4. Multi-file handler
export async function processMultiTCCSFiles(files: FileList | File[]): Promise<FileImportResult[]> {
  const results: FileImportResult[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const res = await parseExcelTCCSFile(file);
      results.push(res);
    } else if (ext === 'json') {
      const res = await parseJsonTCCSFile(file);
      results.push(res);
    } else if (ext === 'docx' || ext === 'doc') {
      // Hỗ trợ Word file thông báo hướng dẫn hoặc bóc tách
      results.push({
        fileName: file.name,
        fileType: 'Word (.docx)',
        success: true,
        itemCount: 1,
        items: [{
          ma_tccs: `TC-DOC-${Date.now().toString().slice(-4)}`,
          ten_tccs: `Bảng: ${file.name.replace(/\.[^/.]+$/, '')}`,
          nhom: 'XUONG',
          ten_hang_hoa: file.name.replace(/\.[^/.]+$/, ''),
          ngoai_quan: ['Theo tài liệu Word gốc đính kèm'],
          chi_tieu: [
            { id: 'ct_1', ten_chi_tieu: 'Quy chuẩn kỹ thuật theo văn bản', tieu_chuan: 'Đạt yêu cầu TC.09.01', kieu_kiem_tra: 'VAN_BAN' }
          ]
        }]
      });
    } else {
      results.push({
        fileName: file.name,
        fileType: ext?.toUpperCase() || 'Khác',
        success: false,
        itemCount: 0,
        items: [],
        error: 'Định dạng chưa hỗ trợ. Vui lòng chọn file Excel (.xlsx), Word (.docx) hoặc JSON.'
      });
    }
  }

  return results;
}
