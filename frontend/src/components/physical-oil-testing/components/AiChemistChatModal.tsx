import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  FlaskConical, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface AiChemistChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AiChemistChatModal: React.FC<AiChemistChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I am your **PureOil AI Food Chemist**.\n\nYou can ask me anything about home physical oil testing, interpreting unusual test results (foaming, color change, solidifying layers), or detecting specific adulterants like Metanil Yellow dye, Argemone oil, or mineral paraffin. What would you like to verify today?",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = [
    "How does the Yellow Mustard Oil Acid test work?",
    "Why does pure coconut oil turn solid in winter?",
    "What is the danger of Argemone oil in mustard oil?",
    "How can I tell if my Desi Ghee has Dalda or Vanaspati?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt.trim();
    if (!query || isLoading) return;

    const userMsg: Message = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { 
            role: 'model', 
            text: "Based on standard FSSAI testing protocols: If your oil shows separate liquid layers upon refrigeration, acrid choking smoke at low heat, or turns bright pink in the acid test, it is adulterated and unsafe to consume." 
          }
        ]);
      }
    } catch (e: any) {
      console.warn('Gemini chat request failed:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "Pure cooking oils have characteristic fatty acid profiles and smoke points. For instant testing:\n- **Freezing Test**: Refrigerate for 2-3 hours; pure solidifies uniformly.\n- **Mustard Dye Test**: Shake 5mL oil with 5mL conc HCl or strong vinegar; pink/red lower layer reveals toxic Metanil yellow."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[680px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">PureOil AI Food Chemist</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Zero-Device Home Testing & Chemical Consultation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isModel ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isModel ? 'bg-cyan-100 border border-cyan-300 text-cyan-800' : 'bg-amber-500 text-slate-950 font-bold'
                }`}>
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isModel
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs whitespace-pre-line'
                    : 'bg-amber-500 text-slate-950 font-medium font-sans shadow-2xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 border border-cyan-300 text-cyan-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-cyan-800 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                <span>AI Chemist is analyzing food safety data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 transition-all cursor-pointer font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-chemist-input"
              type="text"
              placeholder="Ask about a specific test, symptom, or oil type..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-hidden focus:border-amber-500 shadow-2xs"
            />
            <button
              id="ai-chemist-send-btn"
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
