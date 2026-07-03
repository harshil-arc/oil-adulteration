import { useState } from 'react';
import { Sparkles, X, Send, Bot, Dumbbell, Zap } from 'lucide-react';
import { askAiFitnessCoach } from '../services/fitnessService';

export default function AiFitnessCoachDrawer({ isOpen, onClose, currentWorkout, onWorkoutAdapted }) {
  const [userPrompt, setUserPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: '👋 Hi! I am your SpectraTrust AI Fitness Coach. How can I tailor your workout session today?' }
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'I have knee pain.',
    'I only have 20 minutes.',
    'I don\'t have dumbbells.',
    'I\'m feeling tired today.'
  ];

  const handleSendPrompt = (textToSend) => {
    const promptText = textToSend || userPrompt;
    if (!promptText.trim()) return;

    // Add user message
    const userMsg = { role: 'user', text: promptText };
    setChatHistory(prev => [...prev, userMsg]);
    setUserPrompt('');

    // Process AI Coach response
    setTimeout(() => {
      const res = askAiFitnessCoach(promptText, currentWorkout);
      setChatHistory(prev => [...prev, { role: 'assistant', text: res.response }]);
      if (onWorkoutAdapted && res.modifiedWorkout) {
        onWorkoutAdapted(res.modifiedWorkout);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[#d4af37]/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2">
            <Bot className="text-[#d4af37]" size={20} />
            <div>
              <h3 className="text-sm font-black text-white">AI Fitness Coach Assistant</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Real-Time Adaptive Workout Modifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="p-3 bg-[var(--bg-elevated)] border-b border-[var(--border-color)] flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => handleSendPrompt(p)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] text-[#d4af37] border border-[#d4af37]/30 font-bold hover:bg-[#d4af37] hover:text-black transition-all shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-[#d4af37] text-black font-extrabold ml-auto'
                  : 'bg-[var(--bg-elevated)] text-gray-200 border border-[var(--border-color)] mr-auto'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex gap-2">
          <input
            type="text"
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
            placeholder="Ask AI Coach (e.g. 'I have back pain')..."
            className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
          />
          <button
            onClick={() => handleSendPrompt()}
            className="px-4 py-2 bg-[#d4af37] text-black rounded-xl font-black text-xs hover:scale-105 transition-transform"
          >
            <Send size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
