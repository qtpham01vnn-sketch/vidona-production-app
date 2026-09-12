import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, KeyRound, Building2, Factory, Mail, Phone, Send, CheckCircle2, AlertCircle, X, Shield } from 'lucide-react';
import { submitActivationRequest, INITIAL_USERS } from '../services/userService';

export const LoginPage: React.FC = () => {
  const { loginByPin, loginByPassword } = useAuth();
  
  const [tab, setTab] = useState<'PASSWORD' | 'PIN'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Modal Yêu Cầu Kích Hoạt (Người mới bấm link)
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [reqFullName, setReqFullName] = useState('');
  const [reqMaNv, setReqMaNv] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqDept, setReqDept] = useState('Phân Xưởng Men');
  const [reqTitle, setReqTitle] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqSuccessMsg, setReqSuccessMsg] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'PASSWORD') {
      if (!identifier.trim()) {
        setError('Vui lòng nhập Tên đăng nhập / Số điện thoại / Mã NV!');
        return;
      }
      if (!password.trim()) {
        setError('Vui lòng nhập Mật khẩu!');
        return;
      }
      const ok = loginByPassword(identifier, password);
      if (!ok) {
        setError('Thông tin đăng nhập hoặc mật khẩu không đúng!');
      }
    } else {
      if (!pin || pin.length < 4) {
        setError('Vui lòng nhập đủ 4 chữ số Mã PIN!');
        return;
      }
      const ok = loginByPin(pin);
      if (!ok) {
        setError('Mã PIN không chính xác. Vui lòng thử lại!');
      }
    }
  };

  const handleSendActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqEmail.trim() || !reqPhone.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!');
      return;
    }
    setReqLoading(true);
    const res = await submitActivationRequest({
      full_name: reqFullName.trim(),
      ma_nv: reqMaNv.trim(),
      email: reqEmail.trim(),
      so_dien_thoai: reqPhone.trim(),
      phong_ban: reqDept,
      chuc_vu: reqTitle.trim(),
      ly_do: reqReason.trim()
    });
    setReqLoading(false);
    setReqSuccessMsg(res.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a1128] via-[#101f42] to-[#0a1128]">
      <div className="w-full max-w-[440px] bg-white dark:bg-[#111827] rounded-[28px] p-7 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-3">
            <Lock size={26} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            VIDONA PXSX
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hệ Thống Quản Lý Phối Liệu Xưởng & Cổng Công Dân Số
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-5 border border-slate-200/80 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => { setTab('PASSWORD'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'PASSWORD'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={15} />
            <span>Văn Phòng (Mật Khẩu)</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setTab('PIN'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'PIN'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Factory size={15} />
            <span>PIN Nhanh 4 Số (Xưởng)</span>
          </button>
        </div>

        {/* Form Đăng Nhập */}
        <form onSubmit={handleLogin} className="space-y-4">
          {tab === 'PASSWORD' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên đăng nhập / Số điện thoại / Mã NV
                </label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    placeholder="VD: VD-001, admin, 0901234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-center mb-1">
                Nhập Mã PIN 4 Chữ Số Của Bạn:
              </label>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
                  placeholder="••••"
                  autoFocus
                  className="w-full bg-transparent text-center font-mono text-3xl tracking-[0.6em] font-black text-white focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Nhập mã PIN 4 chữ số cá nhân đã được cấp để đăng nhập nhanh
              </p>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all"
          >
            ĐĂNG NHẬP HỆ THỐNG
          </button>
        </form>

        {/* Link gửi yêu cầu cấp tài khoản */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => { setShowActivationModal(true); setReqSuccessMsg(''); setError(''); }}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5"
          >
            <span>📩 Chưa có tài khoản? Gửi yêu cầu kích hoạt & Cấp PIN</span>
          </button>
        </div>

        {/* Gợi ý test nhanh */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>⚡ Tài khoản mẫu thử nghiệm:</span>
            <span className="text-emerald-500">Pass: 123</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div>• BGĐ: <b className="text-sky-600 font-mono">0179</b> (admin)</div>
            <div>• Quản đốc: <b className="text-sky-600 font-mono">4444</b> (quanly)</div>
            <div>• TP.KTCN: <b className="text-sky-600 font-mono">3333</b> (tp_ktcn)</div>
            <div>• KCS: <b className="text-sky-600 font-mono">1234</b> (kcs_nhanvien)</div>
            <div>• Thủ kho: <b className="text-sky-600 font-mono">2222</b> (thukho)</div>
            <div>• Công nhân: <b className="text-sky-600 font-mono">5678</b> (congnhan)</div>
          </div>
        </div>
      </div>

      {/* MODAL GỬI YÊU CẦU KÍCH HOẠT & CẤP TÀI KHOẢN CHO NGƯỜI MỚI */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowActivationModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Gửi Yêu Cầu Cấp Tài Khoản & Mã PIN</h3>
                <p className="text-xs text-slate-500">Dành cho nhân sự mới tham gia hệ thống sản xuất Vidona</p>
              </div>
            </div>

            {reqSuccessMsg ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 space-y-3 text-center">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <h4 className="font-bold text-sm">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs">{reqSuccessMsg}</p>
                <button
                  onClick={() => setShowActivationModal(false)}
                  className="mt-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow"
                >
                  Đóng & Quay Lại Đăng Nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendActivation} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên (*):</label>
                    <input
                      type="text"
                      required
                      value={reqFullName}
                      onChange={e => setReqFullName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Nhân Viên (nếu có):</label>
                    <input
                      type="text"
                      value={reqMaNv}
                      onChange={e => setReqMaNv(e.target.value)}
                      placeholder="VD: VD-108"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email nhận thông báo (*):</label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={e => setReqEmail(e.target.value)}
                      placeholder="email@vidona.vn"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại (*):</label>
                    <input
                      type="tel"
                      required
                      value={reqPhone}
                      onChange={e => setReqPhone(e.target.value)}
                      placeholder="09xxxxxxxx"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng ban / Phân xưởng (*):</label>
                    <select
                      value={reqDept}
                      onChange={e => setReqDept(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="Phân Xưởng Men">Phân Xưởng Men</option>
                      <option value="Phân Xưởng Xương">Phân Xưởng Xương</option>
                      <option value="Phòng Kỹ Thuật Công Nghệ">Phòng Kỹ Thuật Công Nghệ</option>
                      <option value="Tổ KCS">Tổ KCS</option>
                      <option value="Kho Vật Tư Nguyên Liệu">Kho Vật Tư Nguyên Liệu</option>
                      <option value="Ban Giám Đốc">Ban Giám Đốc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Chức danh / Vị trí:</label>
                    <input
                      type="text"
                      value={reqTitle}
                      onChange={e => setReqTitle(e.target.value)}
                      placeholder="VD: Nhân viên KCS, Công nhân..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý do / Công việc cần truy cập:</label>
                  <textarea
                    rows={2}
                    value={reqReason}
                    onChange={e => setReqReason(e.target.value)}
                    placeholder="Ghi rõ phân xưởng hoặc nhiệm vụ kiểm tra..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowActivationModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={reqLoading}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow flex items-center gap-2"
                  >
                    <Send size={15} />
                    <span>{reqLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu Kích Hoạt'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
