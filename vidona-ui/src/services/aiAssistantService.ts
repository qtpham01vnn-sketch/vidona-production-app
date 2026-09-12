import { getStoredTCCS } from './tccsData';
import { getBM0307Records } from './storageService';
import { TCCSBang, BM0307Record } from '../types';

export interface AIResponse {
  text: string;
  suggestions?: string[];
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function tokenize(text: string): string[] {
  const clean = removeVietnameseTones(text);
  const words = clean.split(/[\s,+/_.()-]+/).filter(w => w.length > 0);
  const ngrams: string[] = [...words];
  // add 2-grams
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]} ${words[i+1]}`);
  }
  // add 3-grams
  for (let i = 0; i < words.length - 2; i++) {
    ngrams.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
  }
  return ngrams;
}

export function queryAITechnical(userQuery: string): AIResponse {
  const q = userQuery.trim();
  if (!q) {
    return {
      text: 'Vui lòng nhập nội dung cần tra cứu về tiêu chuẩn TC.09.01 hoặc kiểm tra chất lượng lô hàng!',
      suggestions: ['📦 Tiêu chuẩn Bã vỏ điều', '🪵 Tiêu chuẩn Pallet gỗ 1 mặt', '📦 Bao bì carton 300x600']
    };
  }

  const qClean = removeVietnameseTones(q);
  const qTokens = tokenize(q);
  const tccsList = getStoredTCCS();
  const bmRecords = getBM0307Records();

  // 1. Kiểm tra câu hỏi về Lô hàng Không Đạt / Trừ Ẩm / Hạ Cấp / Báo Cáo Chất Lượng
  if (
    qClean.includes('khong dat') || 
    qClean.includes('ha cap') || 
    qClean.includes('tru am') || 
    qClean.includes('hom nay') || 
    qClean.includes('bao cao lo') ||
    qClean.includes('lo hang loi') ||
    qClean.includes('lo loi')
  ) {
    const nonPassRecords = bmRecords.filter(r => r.ket_luan !== 'DAT' || r.trang_thai_duyet === 'TU_CHOI');
    if (nonPassRecords.length === 0) {
      return {
        text: `✅ **Báo Cáo Tình Hình Chất Lượng NVL Nhập Kho:**\n\nHiện tại hệ thống **không ghi nhận lô hàng nào bị đánh Không Đạt** hoặc bị Trả Về. Tất cả các lô nguyên vật liệu và vật tư nhập kho gần nhất đều đạt chuẩn TC.09.01 và đã hoàn tất quy trình nghiệm thu KCS!`,
        suggestions: ['📋 Xem tiêu chuẩn Bã vỏ điều', '📦 Tiêu chuẩn Vỏ hộp carton 300x600', '🪵 Tiêu chuẩn Pallet gỗ 1 mặt']
      };
    }

    let report = `📊 **BÁO CÁO CÁC LÔ HÀNG KHÔNG ĐẠT / HẠ CẤP / TRỪ ẨM (HỆ THỐNG KHO & KCS):**\n\n`;
    report += `Hiện ghi nhận **${nonPassRecords.length} lô hàng** có chỉ số cần lưu ý / vượt tiêu chuẩn TC.09.01:\n\n`;

    nonPassRecords.forEach((r, idx) => {
      report += `### **${idx + 1}. Phiếu: ${r.so_phieu} - ${r.ten_hang_hoa}**\n`;
      report += `- 🏢 **Nhà cung cấp:** ${r.nha_cung_cap}\n`;
      report += `- 📅 **Ngày kiểm tra:** ${r.ngay_kiem_tra} | **Số lượng:** ${r.so_luong_nhap} ${r.don_vi_tinh}\n`;
      report += `- ⚠️ **Chỉ tiêu không đạt:**\n`;
      const failed = r.ket_qua_chi_tieu.filter(c => c.danh_gia === 'KHONG_DAT');
      if (failed.length > 0) {
        failed.forEach(f => {
          report += `  • **${f.ten_chi_tieu}:** Thực tế đo **${f.ket_qua_kcs}** (Chuẩn TCCS: \`${f.tieu_chuan}\`)\n`;
        });
      } else {
        report += `  • Độ ẩm vượt định mức quy chuẩn.\n`;
      }
      report += `- 📋 **Kết luận & Phương án xử lý của TP.KTCN / Quản Đốc:**\n  _${r.ghi_chu_xu_ly || 'Đã duyệt hạ cấp / trừ ẩm theo biên bản.'}_\n\n`;
    });

    return {
      text: report,
      suggestions: [
        '🧪 Tiêu chuẩn Bã vỏ điều',
        '📦 Tiêu chuẩn Bao bì Carton 300x600',
        '🪵 Tiêu chuẩn Pallet gỗ 1 mặt'
      ]
    };
  }

  // 2. Specialized High-Priority Matchers for Ambiguous Queries
  // Check Frit specifically
  if (qClean.includes('frit')) {
    const fritTCCS = tccsList.find(t => t.ten_hang_hoa.toLowerCase().includes('frit') || t.ma_tccs.includes('12'));
    if (fritTCCS) return formatTCCSResponse(fritTCCS, tccsList);
  }

  // Check Ke góc nhựa specifically
  if (qClean.includes('ke goc') || qClean.includes('ke nhua') || (qClean.includes('ke') && qClean.includes('goc'))) {
    const keTCCS = tccsList.find(t => t.ten_hang_hoa.toLowerCase().includes('ke góc') || t.ten_tccs.toLowerCase().includes('ke góc'));
    if (keTCCS) return formatTCCSResponse(keTCCS, tccsList);
  }

  // Check specific Carton sizes
  const sizes = ['300x600', '600x600', '400x800', '500x500', '400x600', '30x60', '60x60', '40x80', '50x50', '40x60'];
  for (const s of sizes) {
    if (qClean.includes(s)) {
      const normSize = s.replace('30x60', '300x600').replace('60x60', '600x600').replace('40x80', '400x800').replace('50x50', '500x500').replace('40x60', '400x600');
      // If user asks for carton/bao bi/hop
      if (qClean.includes('carton') || qClean.includes('bao bi') || qClean.includes('hop') || qClean.includes('thung') || qClean.includes('market') || qClean.includes('vo')) {
        const cartonTCCS = tccsList.find(t => t.ten_hang_hoa.includes(normSize) && (t.ten_hang_hoa.includes('Carton') || t.ten_hang_hoa.includes('Bao Bì')));
        if (cartonTCCS) return formatTCCSResponse(cartonTCCS, tccsList);
      }
      // If user asks for ke goc
      if (qClean.includes('ke') || qClean.includes('goc')) {
        const keTCCS = tccsList.find(t => t.ten_hang_hoa.includes('Ke Góc'));
        if (keTCCS) return formatTCCSResponse(keTCCS, tccsList);
      }
      // If user asks for nan nep
      if (qClean.includes('nep') || qClean.includes('nan')) {
        const nepTCCS = tccsList.find(t => t.ten_hang_hoa.includes('Nan Nẹp'));
        if (nepTCCS) return formatTCCSResponse(nepTCCS, tccsList);
      }
    }
  }

  // 3. General Full-Text Scoring
  const scoredTCCS = tccsList.map(t => {
    let score = 0;
    const tenHangClean = removeVietnameseTones(t.ten_hang_hoa);
    const tenTccsClean = removeVietnameseTones(t.ten_tccs);
    const tenGoiKhacClean = removeVietnameseTones(t.ten_goi_khac || '');
    const ngoaiQuanClean = removeVietnameseTones((t.ngoai_quan || []).join(' '));
    const chiTieuClean = removeVietnameseTones(t.chi_tieu.map(c => c.ten_chi_tieu + ' ' + c.tieu_chuan).join(' '));
    
    const allDocText = `${tenHangClean} ${tenTccsClean} ${tenGoiKhacClean} ${ngoaiQuanClean} ${chiTieuClean}`;

    for (const token of qTokens) {
      if (token.length < 2) continue;
      if (['tieu', 'chuan', 'nhap', 'kho', 'ntn', 'the', 'nao', 'cho', 'voi', 'la', 'gi', 'hoi', 'xem', 'bao', 'nhieu', 'quy', 'dinh', 'hang', 'hoa'].includes(token)) {
        continue;
      }

      if (tenHangClean === token) score += 60;
      else if (tenHangClean.includes(token)) score += 30;
      else if (tenGoiKhacClean.includes(token)) score += 25;
      else if (tenTccsClean.includes(token)) score += 20;
      else if (ngoaiQuanClean.includes(token)) score += 8;
      else if (chiTieuClean.includes(token)) score += 6;
    }

    return { tccs: t, score };
  });

  scoredTCCS.sort((a, b) => b.score - a.score);
  const bestMatch = scoredTCCS[0];

  if (bestMatch && bestMatch.score >= 15) {
    return formatTCCSResponse(bestMatch.tccs, tccsList);
  }

  // 4. Default suggestion list
  const topSuggestions = tccsList.slice(0, 4).map(item => `🔍 ${item.ten_hang_hoa}`);
  return {
    text: `Tôi đã tìm kiếm trong toàn bộ **38 Bảng Tiêu Chuẩn Cơ Sở TC.09.01** nhưng chưa tìm thấy mục nào khớp chính xác với từ khóa "${q}".\n\nBạn có thể thử tra cứu theo các danh mục vật tư phổ biến dưới đây:`,
    suggestions: [
      '🧪 Tiêu chuẩn Frit Men F0118',
      '📐 Ke Góc Nhựa 300x600 / 600x600',
      '📦 Bao bì carton 300x600',
      '🔥 Tiêu chuẩn Bã vỏ điều',
      '🪵 Tiêu chuẩn Pallet gỗ 1 mặt'
    ]
  };
}

function formatTCCSResponse(t: TCCSBang, allList: TCCSBang[]): AIResponse {
  let res = `Dưới đây là tiêu chuẩn chấp nhận đối với **${t.ten_hang_hoa}** theo quy định của Công ty Cổ phần Gạch Men Vidona:\n\n`;
  
  const icon = t.nhom.includes('BAO_BI') ? '📦' : (t.nhom === 'MEN' ? '🧪' : (t.nhom === 'XUONG' ? '⛏️' : '🔥'));
  res += `${icon} **Tiêu Chuẩn Chấp Nhận Đối Với ${t.ten_hang_hoa.toUpperCase()}**\n`;
  res += `*(Mã tiêu chuẩn: \`${t.ma_tccs}\` | ${t.ten_tccs})*\n\n`;

  res += `### **1. Thông tin hàng hóa và nhà cung cấp:**\n`;
  res += `- 🔹 **Tên hàng hóa:** ${t.ten_hang_hoa}\n`;
  res += `- 🔹 **Tên gọi khác / Mã hiệu:** ${t.ten_goi_khac || 'Không'}\n`;
  res += `- 🔹 **Nhà cung cấp:** Áp dụng đối với tất cả các nhà cung cấp cho Nhà máy Vidona\n\n`;

  res += `### **2. Yêu cầu ngoại quan & cảm quan:**\n`;
  if (t.ngoai_quan && t.ngoai_quan.length > 0) {
    t.ngoai_quan.forEach(nq => {
      res += `- 📍 ${nq}\n`;
    });
  } else {
    res += `- 📍 Đầy đủ nhãn mác, bao gói nguyên vẹn, không ẩm ướt rách vỡ.\n`;
  }
  res += `\n`;

  res += `### **3. Bảng chỉ tiêu & Thông số kỹ thuật chi tiết:**\n`;
  t.chi_tieu.forEach((ct) => {
    res += `- 📐 **${ct.ten_chi_tieu}:** \`${ct.tieu_chuan}\`\n`;
  });
  res += `\n`;

  res += `### **4. Bảo quản & Hướng dẫn kiểm tra nghiệm thu:**\n`;
  res += `- 📝 **Phương pháp lấy mẫu:** Lấy mẫu ngẫu nhiên khi xe hàng cập bến kho Vidona theo quy trình ISO TC.09.01.\n`;
  res += `- 📝 **Xử lý khi không đạt:** Khi có bất kỳ chỉ tiêu nào vượt dung sai, KCS lập biên bản không đạt trên biểu mẫu **BM.03.07**, báo cáo Trưởng Phòng KTCN và Quản Đốc xử lý trả về hoặc lập phương án trừ ẩm / hạ cấp.\n`;

  const otherSuggestions = allList
    .filter(other => other.ma_tccs !== t.ma_tccs)
    .slice(0, 3)
    .map(other => `🔍 ${other.ten_hang_hoa}`);

  return {
    text: res,
    suggestions: [
      '📊 Kiểm tra các lô Không Đạt hôm nay',
      ...otherSuggestions
    ]
  };
}
