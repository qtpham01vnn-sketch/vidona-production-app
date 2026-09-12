import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ChevronRight } from 'lucide-react';
import { queryAITechnical, AIResponse } from '../services/aiAssistantService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  suggestions?: string[];
}

export const TroLyAIPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Xin chào! 👋 Tôi là **Trợ Lý Kỹ Thuật AI - Vidona Ceramic**.\n\nTôi sẵn sàng hỗ trợ tra cứu chính xác toàn bộ **41 Bảng Tiêu Chuẩn TC.09.01** (Đất sét, tràng thạch, frit, bao bì từng size, pallet...) và tự động quét dữ liệu các lô hàng **KHÔNG ĐẠT / HẠ CẤP** từ biểu mẫu BM.03.07!`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '📦 Tiêu chuẩn bao bì 300x600',
        '🪵 Tiêu chuẩn Pallet gỗ 1 mặt',
        '⛏️ Độ ẩm Đất Sét Vĩnh Cửu',
        '📊 Hôm nay có lô nào Không Đạt không?'
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAsk = (qText?: string) => {
    const q = (qText || query).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!qText) setQuery('');
    setIsLoading(true);

    setTimeout(() => {
      const res: AIResponse = queryAITechnical(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.text,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 350);
  };

  // Helper để format Markdown đơn giản nhưng đẹp mắt
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Header 3
          if (line.startsWith('### ')) {
            return (
              <div key={idx} className="font-bold text-sky-700 dark:text-sky-400 text-sm mt-2 border-b border-sky-500/20 pb-0.5">
                {line.replace('### ', '')}
              </div>
            );
          }

          // Header 2 or Title
          if (line.startsWith('**') && line.endsWith('**') && line.length < 80) {
            return (
              <div key={idx} className="font-extrabold text-blue-800 dark:text-blue-300 text-sm mt-1">
                {line.replace(/\*\*/g, '')}
              </div>
            );
          }

          // Bullet points
          if (line.startsWith('- ') || line.startsWith('• ')) {
            const clean = line.replace(/^[-•]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-sky-500 font-bold shrink-0">•</span>
                <span dangerouslySetInnerHTML={{ __html: parseInlineMd(clean) }} />
              </div>
            );
          }

          return (
            <div key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMd(line) }} />
          );
        })}
      </div>
    );
  };

  const parseInlineMd = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600 dark:text-slate-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-bold">$1</code>');
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="text-sky-500" size={26} />
            Trợ Lý Kỹ Thuật AI Vidona
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tra cứu tức thì 41 bảng TCCS TC.09.01 & Tự động đối soát các lô Không Đạt
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {m.sender === 'user' ? (
                <>
                  <span className="text-[10px] text-slate-400">{m.time}</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Bạn</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <Sparkles size={12} /> Trợ Lý AI Vidona
                  </span>
                  <span className="text-[10px] text-slate-400">{m.time}</span>
                </>
              )}
            </div>

            <div className={`p-4 rounded-2xl max-w-[92%] sm:max-w-[85%] shadow-sm ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
            }`}>
              {m.sender === 'user' ? (
                <div className="text-xs sm:text-sm whitespace-pre-wrap">{m.text}</div>
              ) : (
                renderFormattedText(m.text)
              )}

              {/* Suggestions Chips */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 w-full mb-0.5">Gợi ý tra cứu tiếp theo:</span>
                  {m.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleAsk(sug.replace(/^[🔍📦🪵⛏️🧪📊]\s*/, ''))}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-600 border border-sky-200 dark:border-slate-600 transition flex items-center gap-1 shadow-xs"
                    >
                      {sug} <ChevronRight size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-sky-500 font-bold p-3 bg-sky-500/10 rounded-2xl max-w-xs animate-pulse">
            <Bot size={16} className="animate-spin" /> Đang tra cứu cơ sở dữ liệu TC.09.01...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Nhập câu hỏi (VD: tiêu chuẩn bao bì 300x600, Pallet gỗ 1 mặt, độ ẩm đất sét, lô không đạt...)..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          onClick={() => handleAsk()}
          disabled={isLoading}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          <Send size={16} /> Gửi
        </button>
      </div>
    </div>
  );
};
