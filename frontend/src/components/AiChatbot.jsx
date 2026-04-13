import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertTriangle, ShieldCheck, FileText, Trash2, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'pureoil_chat_history';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are PureOil AI, an expert assistant embedded in a mobile app used by FSSAI food safety inspectors in India. 
Your role is to help with oil adulteration detection, interpret sensor readings, explain FSSAI regulations, identify adulterants, and guide inspectors in the field.
Be concise, technically accurate, and use markdown bold (**text**) for key values. Never make up sensor data. If unsure, say so.`;

const DEFAULT_GREETING = {
  id: 'init',
  sender: 'ai',
  text: "Hello Inspector! I'm your PureOil AI Assistant powered by Grok. I can help interpret sensor readings, explain FSSAI regulations, or identify adulterants. What do you need help with?"
};

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [DEFAULT_GREETING];
}

function saveHistory(msgs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch (_) {}
}

export default function AiChatbot({ onClose }) {
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [longPressId, setLongPressId] = useState(null);
  const messagesEndRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // ── Grok API call ──────────────────────────────────────────
  const callGroq = async (conversationHistory) => {
    if (!GROQ_API_KEY) throw new Error('NO_KEY');

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory
        .filter(m => m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
    ];

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: apiMessages,
        stream: false,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const detail = errData?.error?.message || errData?.message || JSON.stringify(errData);
      console.error('Groq API error:', res.status, errData);
      throw new Error(detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || 'No response received.';
  };

  // ── Send handler ───────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    setError('');

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    try {
    const aiText = await callGroq(updated);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
    } catch (err) {
      if (err.message === 'NO_KEY') {
        setError('No Groq API key found. Add VITE_GROQ_API_KEY to your .env file and restart the dev server.');
      } else if (err.message?.toLowerCase().includes('invalid api key') || err.message?.toLowerCase().includes('incorrect api key')) {
        setError('Invalid Groq API key. Get a free key from console.groq.com → API Keys.');
      } else if (err.message?.toLowerCase().includes('rate limit')) {
        setError('Rate limit reached. Please wait a moment and try again.');
      } else {
        setError(`AI error: ${err.message}`);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // ── Clear all history ──────────────────────────────────────
  const handleClearAll = () => {
    const fresh = [DEFAULT_GREETING];
    setMessages(fresh);
    saveHistory(fresh);
    setShowClearConfirm(false);
  };

  // ── Delete single message ──────────────────────────────────
  const handleDeleteMessage = (id) => {
    setMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      // Always keep at least the greeting
      return next.length === 0 ? [DEFAULT_GREETING] : next;
    });
    setLongPressId(null);
  };

  // ── Long-press support ─────────────────────────────────────
  const startLongPress = (id) => {
    longPressTimer.current = setTimeout(() => setLongPressId(id), 500);
  };
  const cancelLongPress = () => clearTimeout(longPressTimer.current);

  // ── Render bold text ───────────────────────────────────────
  const renderText = (text) =>
    text.split('**').map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-[#d4af37]">{part}</strong> : part
    );

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col md:p-4 animate-fade-in backdrop-blur-md">
      <div className="w-full h-full md:h-auto md:max-w-xl md:mx-auto bg-[#0a0a0a] md:rounded-3xl border border-[#333] flex flex-col shadow-[0_0_40px_rgba(212,175,55,0.1)] overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-black flex items-center justify-center relative shadow-glow-gold">
              <Sparkles size={20} fill="currentColor" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                PureOil Assistant
                <span className="px-1.5 py-0.5 rounded uppercase tracking-widest text-[8px] bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">Grok</span>
              </h2>
              <p className="text-gray-400 text-xs">AI Inspector Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Clear history button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 bg-[#1c1c1c] rounded-full text-gray-400 hover:text-red-400 transition-colors"
              title="Clear chat history"
            >
              <RotateCcw size={16} />
            </button>
            <button onClick={onClose} className="p-2 bg-[#1c1c1c] rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="text-center py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-[#1c1c1c] px-3 py-1 rounded-full border border-[#333]">
              FSSAI Inspector Mode · Hold message to delete
            </span>
          </div>

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative`}>
              <div
                onMouseDown={() => startLongPress(msg.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(msg.id)}
                onTouchEnd={cancelLongPress}
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm cursor-pointer select-none ${
                  msg.sender === 'user'
                    ? 'bg-[#1c1c1c] border border-[#333] text-white rounded-tr-sm'
                    : 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-gray-100 rounded-tl-sm'
                } ${longPressId === msg.id ? 'ring-2 ring-red-500/50' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">PureOil AI</span>
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-wrap">{renderText(msg.text)}</div>
              </div>

              {/* Delete bubble on long-press */}
              {longPressId === msg.id && (
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className={`absolute ${msg.sender === 'user' ? 'left-0' : 'right-0'} -top-3 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10`}
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Pills */}
        {!isTyping && messages.length < 3 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
            <button onClick={() => setInput('What are FSSAI limits for Mustard Oil?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
              <ShieldCheck size={12} /> FSSAI Limits
            </button>
            <button onClick={() => setInput('What was my last scan result?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
              <FileText size={12} /> Last Scan
            </button>
            <button onClick={() => setInput('How is Argemone oil detected?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
              <AlertTriangle size={12} /> Argemone
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#333] bg-[#0a0a0a]">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message PureOil AI..."
              disabled={isTyping}
              className="w-full bg-[#1c1c1c] border border-[#333] text-white rounded-full py-4 pl-5 pr-14 outline-none text-sm focus:border-[#d4af37] transition-colors placeholder:text-gray-600 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-10 h-10 bg-[#d4af37] text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-[#333] disabled:text-gray-500 transition-all hover:brightness-110 active:scale-95"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
          <p className="text-center text-[9px] text-gray-500 mt-3 font-medium">PureOil AI may make mistakes. Verify critical actions with FSSAI reports.</p>
        </div>
      </div>

      {/* Clear All Confirm Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-[#141414] border border-[#333] rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Delete all chat history?</h3>
            <p className="text-gray-400 text-sm mb-6">This cannot be undone. All messages will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 rounded-xl font-bold bg-[#1c1c1c] text-white border border-[#333]">
                Cancel
              </button>
              <button onClick={handleClearAll} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss long-press overlay */}
      {longPressId && (
        <div className="fixed inset-0 z-[150]" onClick={() => setLongPressId(null)} />
      )}
    </div>
  );
}
