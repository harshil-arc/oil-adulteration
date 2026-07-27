import { useState } from 'react';
import { Bot, X, Send, Sparkles, Clock, Utensils, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function AiCookingAssistantDrawer({ isOpen, onClose, activeRecipe, onApplyParameterChange }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your SpectraTrust AI Cooking Assistant. Ask me anything about ingredient swaps, quick cooking time adjustments, oil safety, or nutrition tweaks!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    "I don't have onions",
    "I only have 15 minutes",
    "Can I use mustard oil?",
    "How to make this higher protein?",
    "Is this safe for diabetes?"
  ];

  const handleSendQuery = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputQuery('');

    // Generate AI response logic
    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();

      if (q.includes('onion')) {
        reply = "No onions? No problem! You can substitute with chopped leeks, finely minced cabbage, or a pinch of Hing (Asafoetida) in warm oil for an authentic savory aroma.";
      } else if (q.includes('15 minutes') || q.includes('time') || q.includes('quick')) {
        reply = "Got 15 minutes? I recommend par-boiling veggies or using pre-soaked sprouts and cooking on medium-high flame with mustard oil to retain crunch!";
        if (onApplyParameterChange) onApplyParameterChange({ cookingTimeMin: 15 });
      } else if (q.includes('oil') || q.includes('mustard')) {
        reply = "SpectraTrust Verified Cold-Pressed Mustard Oil is ideal! It has a high smoke point (250°C) and rich MUFA/omega-3 profile. Heat to 170°C before tempering spices.";
      } else if (q.includes('protein')) {
        reply = "To boost protein by +10g, toss in 50g crumbled Tofu, boiled Chana, or a spoonful of roasted pumpkin seeds!";
      } else if (q.includes('diabetes')) {
        reply = "This recipe is optimized with low GI complex carbs and high fiber (>5g), helping prevent rapid postprandial glucose spikes.";
      } else {
        reply = `For ${activeRecipe?.name || 'this dish'}, ensure you follow controlled flame temperature and use SpectraTrust verified oil for maximum safety and flavor!`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#161b22] border-l border-amber-500/30 z-50 shadow-2xl flex flex-col justify-between animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">SpectraTrust AI Cooking Assistant</h3>
            <p className="text-[10px] text-gray-400">Context-Aware Real-time Cooking Guidance</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              m.sender === 'user' 
                ? 'bg-amber-500 text-black font-semibold rounded-br-none' 
                : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none leading-relaxed'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggestion Chips & Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/90 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(qp)}
              className="bg-gray-800 hover:bg-gray-700 text-amber-300 border border-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              {qp}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
            placeholder="Ask AI assistant..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSendQuery()}
            className="p-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
