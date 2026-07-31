import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Clock, Utensils, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function fetchGroqCookingResponse(conversationHistory, activeRecipe) {
  const activeKey = import.meta.env.VITE_GROQ_API_KEY || '';
  if (!activeKey) return null;

  const recipeDetails = activeRecipe
    ? `Current Dish/Recipe: "${activeRecipe.name || 'Custom Dish'}". ${activeRecipe.ingredients ? `Ingredients: ${activeRecipe.ingredients.join(', ')}.` : ''}`
    : `General cooking mode.`;

  const systemPrompt = `You are SpectraTrust AI Cooking Assistant, an expert real-time culinary AI embedded in a smart cooking app.
Context: ${recipeDetails}

Guidelines:
1. Always respond directly and dynamically to the user's LATEST message.
2. If the user greets you ("hi", "hello", "hey"), greet them back warmly and ask what cooking adjustments or ingredient help they need.
3. For ingredient substitutions, timing adjustments, heat control, or nutrition tweaks, provide precise, concise, and practical advice.
4. Keep responses brief (2-4 sentences max) and use markdown bold (**text**) for key ingredients and temperature numbers.`;

  const pastMessages = conversationHistory.filter(m => m.id !== 'init');
  const recent = pastMessages.slice(-8);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...recent.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))
  ];

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${activeKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: apiMessages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.3
    })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content;
}

export default function AiCookingAssistantDrawer({ isOpen, onClose, activeRecipe, onApplyParameterChange }) {
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: `Hello! I am your SpectraTrust AI Cooking Assistant. Ask me anything about ingredient swaps, quick cooking time adjustments, oil safety, or nutrition tweaks!`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    "I don't have onions",
    "I only have 15 minutes",
    "Can I use mustard oil?",
    "How to make this higher protein?",
    "Is this safe for diabetes?"
  ];

  const handleSendQuery = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsTyping(true);

    try {
      // 1. Try real Groq AI response first
      const aiReply = await fetchGroqCookingResponse(updatedMessages, activeRecipe);

      if (aiReply) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReply }]);

        // Check if query requested time change for app parameter callbacks
        const qLower = query.toLowerCase();
        if ((qLower.includes('15 minute') || qLower.includes('quick')) && onApplyParameterChange) {
          onApplyParameterChange({ cookingTimeMin: 15 });
        }
        return;
      }
    } catch (err) {
      console.warn('Groq Cooking Assistant API fallback used:', err);
    } finally {
      setIsTyping(false);
    }

    // 2. Intelligent Dynamic Fallback (if API unavailable)
    const q = query.toLowerCase();
    let reply = "";

    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings')) {
      reply = `Hello! 👋 How can I assist you with your cooking today? Ask me about ingredient substitutes, flame temperatures, or oil safety!`;
    } else if (q.includes('onion')) {
      reply = "No onions? You can substitute with chopped leeks, finely minced cabbage, or a pinch of Hing (Asafoetida) in warm oil for an authentic savory aroma.";
    } else if (q.includes('15 minutes') || q.includes('time') || q.includes('quick')) {
      reply = "Got 15 minutes? Par-boil vegetables or use pre-soaked ingredients, and cook on medium-high flame with high-smoke-point oil to retain crunch!";
      if (onApplyParameterChange) onApplyParameterChange({ cookingTimeMin: 15 });
    } else if (q.includes('oil') || q.includes('mustard')) {
      reply = "SpectraTrust Verified Cold-Pressed Oil is ideal! Heat oil to ~170°C before tempering spices for maximum flavor and safety.";
    } else if (q.includes('protein')) {
      reply = "To boost protein by +10g, toss in 50g crumbled Tofu, paneer, boiled Chana, or roasted pumpkin seeds!";
    } else if (q.includes('diabetes')) {
      reply = "This recipe is optimized with low GI complex carbs and high fiber (>5g) to prevent glucose spikes.";
    } else {
      reply = `I can help you optimize ${activeRecipe?.name || 'your dish'}! Tell me what ingredients you have, how much time you have, or ask about oil purity and temperatures.`;
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
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
          <div key={m.id || idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              m.sender === 'user' 
                ? 'bg-amber-500 text-black font-semibold rounded-br-none' 
                : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none leading-relaxed'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-none p-3 text-amber-400 text-xs flex items-center gap-2">
              <Sparkles size={14} className="animate-spin" />
              <span>Cooking AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips & Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/90 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(qp)}
              disabled={isTyping}
              className="bg-gray-800 hover:bg-gray-700 text-amber-300 border border-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap disabled:opacity-50"
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
            disabled={isTyping}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-60"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || isTyping}
            className="p-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

