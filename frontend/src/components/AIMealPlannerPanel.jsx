import { useState, useRef, useEffect } from 'react';
import {
  Bot, Sparkles, Send, RefreshCw, Key, X, ChevronDown, ChevronUp,
  Utensils, MessageSquare, Calendar, ShoppingBag, AlertCircle,
  CheckCircle2, Loader2, Copy, ThumbsUp, Zap, ExternalLink, History,
  Trash2, Eye, ArrowRight, BookOpen, Clock, Heart, ShieldCheck
} from 'lucide-react';
import {
  generateAIMealPlan,
  chatWithNutritionist,
  generatePantryMealIdeas,
  getHFToken,
  setHFToken,
  clearHFToken,
  extractMatchedRecipesFromPlan
} from '../services/huggingFaceService';

// Simple Markdown-like renderer for AI messages
function AIMessage({ text, model }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1 font-sans">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('# ')) return <h3 key={i} className="font-bold text-amber-400 text-sm mt-2">{line.slice(2)}</h3>;
        if (line.startsWith('## ') || (line.startsWith('**') && line.endsWith('**'))) {
          const content = line.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
          return <h4 key={i} className="font-semibold text-amber-300 text-xs mt-2">{content}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-1.5 text-xs text-gray-300">
              <span className="text-amber-400 mt-0.5">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <div key={i} className="flex gap-1.5 text-xs text-gray-300">
              <span className="text-amber-400 font-bold min-w-[14px]">{line.match(/^\d+/)[0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded text-amber-300">$1</code>');
        return <p key={i} className="text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
      {model && (
        <div className="pt-1 border-t border-gray-800/80 mt-2">
          <span className="text-[10px] text-gray-500 font-mono">Powered by {model.split('/').pop()}</span>
        </div>
      )}
    </div>
  );
}

// Token Setup Modal
function TokenSetupModal({ onSave, onClose }) {
  const [token, setToken] = useState(getHFToken());

  const handleSave = () => {
    if (!token.trim()) return;
    setHFToken(token.trim());
    onSave(token.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Key size={18} /> Setup Free HuggingFace AI
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-3 text-xs text-gray-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={13} /> 100% FREE — No Credit Card Needed</div>
            <p>HuggingFace provides free AI inference. Create a free account and copy your access token.</p>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-white">Quick steps to get token:</p>
            <ol className="space-y-1 list-none">
              <li className="flex gap-2"><span className="text-amber-400 font-bold">1.</span> Sign up at <a href="https://huggingface.co/join" target="_blank" rel="noreferrer" className="text-amber-400 underline">huggingface.co/join</a></li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">2.</span> Profile → Settings → Access Tokens</li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">3.</span> Create token with <strong>Inference</strong> preset</li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">4.</span> Copy token (starts with <code className="bg-gray-800 px-1 rounded text-amber-300">hf_</code>)</li>
            </ol>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-medium">Your HuggingFace API Token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 text-xs">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!token.trim()}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs disabled:opacity-50"
            >
              Save & Activate AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIMealPlannerPanel({ healthProfile, pantryItems, scoredRecipes, onLoadAiSuggestedMeals, onSelectRecipeDetail }) {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'mealplan' | 'pantry' | 'history'
  const [hfToken, setHfTokenState] = useState(getHFToken());
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Persistent State Loaders
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('spectra_ai_chat_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        role: 'assistant',
        content: `👋 Hi! I'm your **SpectraTrust AI Nutritionist**, powered by free HuggingFace AI models.

I can help you with:
• 🍽️ **Personalized meal plans** based on your health profile
• 💬 **Nutrition questions** about Indian food
• 🥗 **Recipe ideas** from your pantry
• ⚠️ **Disease-specific dietary advice**

${!getHFToken() ? '⚠️ Please add your free HuggingFace API token to get started!' : 'Ask me anything about your nutrition goals!'}`,
        model: null
      }
    ];
  });

  const [conversationHistory, setConversationHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef(null);

  // Saved Meal Plan History
  const [planHistory, setPlanHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('spectra_ai_plan_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Current Generated Plan
  const [generatedPlan, setGeneratedPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('spectra_ai_latest_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [planModel, setPlanModel] = useState(null);
  const [isPlanGenerating, setIsPlanGenerating] = useState(false);
  const [matchedRecipesForPlan, setMatchedRecipesForPlan] = useState([]);

  // Pantry state
  const [pantryIdeas, setPantryIdeas] = useState(null);
  const [isPantryGenerating, setIsPantryGenerating] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spectra_ai_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('spectra_ai_plan_history', JSON.stringify(planHistory));
    } catch (e) {}
  }, [planHistory]);

  useEffect(() => {
    if (generatedPlan) {
      try {
        localStorage.setItem('spectra_ai_latest_plan', JSON.stringify(generatedPlan));
      } catch (e) {}
    }
  }, [generatedPlan]);

  // Update matched recipes when plan or database changes
  useEffect(() => {
    if (generatedPlan && scoredRecipes?.length > 0) {
      const matched = extractMatchedRecipesFromPlan(generatedPlan, scoredRecipes);
      setMatchedRecipesForPlan(matched);
    }
  }, [generatedPlan, scoredRecipes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleTokenSave = (token) => {
    setHfTokenState(token);
    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '✅ **AI Activated!** Your HuggingFace token has been saved. What would you like to plan today?',
        model: null
      }
    ]);
  };

  // Quota usage tracker state
  const dailyTokenLimit = 50000;
  const [tokenUsage, setTokenUsage] = useState(() => {
    try {
      const saved = localStorage.getItem('spectra_hf_token_usage');
      const savedDate = localStorage.getItem('spectra_hf_token_usage_date');
      const today = new Date().toDateString();
      if (savedDate !== today) {
        localStorage.setItem('spectra_hf_token_usage_date', today);
        localStorage.setItem('spectra_hf_token_usage', '0');
        return 0;
      }
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const updateTokenUsage = (amount) => {
    setTokenUsage(prev => {
      const newVal = prev + amount;
      localStorage.setItem('spectra_hf_token_usage', newVal.toString());
      return newVal;
    });
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isGenerating) return;
    if (!hfToken) { setShowTokenModal(true); return; }

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsGenerating(true);

    const newHistory = [...conversationHistory, { role: 'user', content: userMsg }];

    try {
      const { reply, model } = await chatWithNutritionist(userMsg, healthProfile, newHistory, hfToken);
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply, model }]);
      setConversationHistory([...newHistory, { role: 'assistant', content: reply }]);
      
      const estTokens = Math.round((userMsg.length + reply.length) / 4) + 150;
      updateTokenUsage(estTokens);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${err.message}`,
        model: null
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const [currentPlanMode, setCurrentPlanMode] = useState('standard'); // 'standard' | 'pantry'

  const handleGenerateMealPlan = async (mode = 'standard') => {
    if (!hfToken) { setShowTokenModal(true); return; }
    setIsPlanGenerating(true);
    setGeneratedPlan(null);
    setCurrentPlanMode(mode);
    try {
      const isPantryMode = mode === 'pantry';
      const { plan, model } = await generateAIMealPlan(healthProfile, scoredRecipes, hfToken, { isPantryMode, pantryItems });
      setGeneratedPlan(plan);
      setPlanModel(model);

      const matched = extractMatchedRecipesFromPlan(plan, scoredRecipes);
      setMatchedRecipesForPlan(matched);

      // Save to plan history
      const historyItem = {
        id: `plan-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        planText: plan,
        model,
        mode: isPantryMode ? 'Meal Pantry Plan' : 'AI Health Plan',
        matchedRecipes: matched.map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine, mealType: r.mealType, image: r.image })),
        goal: healthProfile.goal
      };

      setPlanHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      
      const estTokens = Math.round(plan.length / 4) + 800;
      updateTokenUsage(estTokens);
    } catch (err) {
      setGeneratedPlan(`❌ Error generating plan: ${err.message}`);
    } finally {
      setIsPlanGenerating(false);
    }
  };

  const handlePantryIdeas = async () => {
    if (!hfToken) { setShowTokenModal(true); return; }
    setIsPantryGenerating(true);
    setPantryIdeas(null);
    try {
      const { ideas, model } = await generatePantryMealIdeas(pantryItems, healthProfile, hfToken);
      const text = ideas.text || ideas;
      setPantryIdeas({ text, model });
      
      const estTokens = Math.round(text.length / 4) + 400;
      updateTokenUsage(estTokens);
    } catch (err) {
      setPantryIdeas({ text: `❌ Error: ${err.message}`, model: null });
    } finally {
      setIsPantryGenerating(false);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Clear all AI chat history?')) {
      setChatMessages([]);
      localStorage.removeItem('spectra_ai_chat_messages');
    }
  };

  const clearPlanHistory = () => {
    if (window.confirm('Clear all saved AI meal plans history?')) {
      setPlanHistory([]);
      localStorage.removeItem('spectra_ai_plan_history');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('📋 Copied to clipboard!');
  };

  const quickPrompts = [
    `Best foods for ${healthProfile.medicalConditions?.[0] || 'healthy lifestyle'}`,
    `What to eat for ${healthProfile.goal}?`,
    `Indian breakfast ideas under 300 calories`,
    `Foods to avoid with ${healthProfile.medicalConditions?.[0] || 'diabetes'}`,
    `Vegetarian protein sources`,
  ];

  const quotaPercentage = Math.max(0, 100 - (tokenUsage / dailyTokenLimit) * 100);

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0d1117] to-[#161b22] border border-amber-500/30 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-black">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                SpectraTrust AI Advisor & Meal Planner
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Persistent Storage
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">Context-Aware AI Guidance • HuggingFace API Powered</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hfToken ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-semibold">AI Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[11px] text-red-400 font-semibold">No Token</span>
              </div>
            )}
            <button
              onClick={() => setShowTokenModal(true)}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
              title="API Key Settings"
            >
              <Key size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ⚡ HuggingFace API Token Quota Tracker */}
      {hfToken && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-md space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              HuggingFace API Token Free Quota Remaining
            </span>
            <span className="font-bold text-amber-400">
              {Math.max(0, dailyTokenLimit - tokenUsage).toLocaleString()} / {dailyTokenLimit.toLocaleString()} tokens left
            </span>
          </div>

          <div className="w-full bg-[var(--bg-input)] rounded-full h-2.5 overflow-hidden border border-[var(--border-color)]">
            <div 
              className={`h-full transition-all duration-700 rounded-full ${
                quotaPercentage > 50 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20' 
                  : quotaPercentage > 20 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-sm shadow-amber-500/20' 
                  : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-sm shadow-rose-500/20 animate-pulse'
              }`}
              style={{ width: `${quotaPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
            <span>Free Tier Reset: Quota resets automatically in 24 hours</span>
            <button 
              onClick={() => { if(window.confirm('Reset local token tracker count?')) { setTokenUsage(0); localStorage.setItem('spectra_hf_token_usage', '0'); } }}
              className="hover:text-amber-400 transition-all font-semibold flex items-center gap-0.5 underline cursor-pointer"
            >
              Reset Counter
            </button>
          </div>
        </div>
      )}

      {/* Main Mode Navigation Bar */}
      <div className="flex gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 text-xs">
        {[
          { id: 'chat', label: 'AI Chat Bot', icon: MessageSquare },
          { id: 'mealplan', label: 'AI Meal Planner', icon: Calendar },
          { id: 'pantry', label: 'Pantry Ideas', icon: Utensils },
          { id: 'history', label: `Saved History (${planHistory.length})`, icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold transition-all ${
              activeMode === id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md shadow-amber-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── MODE 1: CHAT BOT ────────────────────────────────────────────── */}
      {activeMode === 'chat' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col shadow-md" style={{ height: '500px' }}>
          <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)]">
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Bot size={14} /> Saved Conversation ({chatMessages.length} messages)
            </span>
            <button onClick={clearChatHistory} className="hover:text-red-400 text-[11px] transition-all flex items-center gap-1">
              <Trash2 size={12} /> Clear Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 mt-0.5 text-black">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black text-xs font-medium rounded-tr-sm shadow-md'
                    : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-tl-sm shadow-sm'
                }`}>
                  {msg.role === 'user'
                    ? <p className="text-xs">{msg.content}</p>
                    : <AIMessage text={msg.content} model={msg.model} />
                  }
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 text-black">
                  <Bot size={14} />
                </div>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="text-amber-400 animate-spin" />
                  <span className="text-xs text-gray-400">Consulting AI Nutritionist...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-2 border-t border-[var(--border-color)] flex gap-1.5 overflow-x-auto no-scrollbar bg-[var(--bg-elevated)]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setChatInput(prompt)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all shrink-0 font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-[var(--border-color)] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
              placeholder={hfToken ? "Ask about diet, nutrition, or meal prep..." : "Add HuggingFace API key..."}
              disabled={!hfToken || isGenerating}
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
              onClick={handleChat}
              disabled={!chatInput.trim() || isGenerating || !hfToken}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold disabled:opacity-40 hover:from-amber-400 transition-all"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* ── MODE 2: AI MEAL PLANNER & DETAILED RECIPES INTEGRATION ─────────── */}
      {activeMode === 'mealplan' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-5 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                AI Generated Day Plan & Recipe Integration
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Tailored for {healthProfile.name} • {healthProfile.goal} • {healthProfile.dietPreference}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleGenerateMealPlan('standard')}
                disabled={isPlanGenerating || !hfToken}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs hover:from-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                {isPlanGenerating && currentPlanMode === 'standard' ? (
                  <><Loader2 size={14} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={14} /> Generate AI Health Plan</>
                )}
              </button>

              <button
                onClick={() => handleGenerateMealPlan('pantry')}
                disabled={isPlanGenerating || !hfToken || pantryItems.length === 0}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold text-xs hover:from-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                title={`Generate meal plan matching your ${pantryItems.length} active pantry ingredients`}
              >
                {isPlanGenerating && currentPlanMode === 'pantry' ? (
                  <><Loader2 size={14} className="animate-spin" /> Matching Pantry...</>
                ) : (
                  <><Utensils size={14} /> Meal Pantry Plan ({pantryItems.length})</>
                )}
              </button>
            </div>
          </div>

          {/* Profile Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-semibold">Target Goal</div>
              <div className="font-bold text-amber-400 truncate">{healthProfile.goal}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-semibold">Conditions</div>
              <div className="font-bold text-emerald-400 truncate">{healthProfile.medicalConditions?.join(', ') || 'None'}</div>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-semibold">Diet Type</div>
              <div className="font-bold text-sky-400 truncate">{healthProfile.dietPreference}</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-gray-400 font-semibold">Allergies</div>
              <div className="font-bold text-rose-400 truncate">{healthProfile.allergies?.join(', ') || 'None'}</div>
            </div>
          </div>

          {isPlanGenerating && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Sparkles size={24} className="text-amber-400 animate-pulse" />
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">Formulating Clinical AI Meal Plan...</div>
              <div className="text-xs text-[var(--text-muted)]">Matching against 81+ recipes & biometric parameters</div>
            </div>
          )}

          {/* Generated Plan View */}
          {generatedPlan && !isPlanGenerating && (
            <div className="space-y-4 animate-fade-in">
              {/* PRIMARY CALL TO ACTION BUTTON TO LOAD IN INTELLIGENT PLANNER */}
              {matchedRecipesForPlan.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-black">
                  <div>
                    <div className="font-black text-sm flex items-center gap-1.5">
                      <Sparkles size={16} /> Detailed Recipe Information Ready ({matchedRecipesForPlan.length} Dishes)
                    </div>
                    <p className="text-xs font-semibold opacity-90">
                      View real authentic dish photos, macros, step-by-step instructions & cooking workspace on the Intelligent Planner grid!
                    </p>
                  </div>
                  <button
                    onClick={() => onLoadAiSuggestedMeals(matchedRecipesForPlan)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-black text-amber-300 hover:bg-gray-900 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap border border-amber-500/40"
                  >
                    Load in Intelligent Planner <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Preview Cards of AI Suggested Dishes */}
              {matchedRecipesForPlan.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                    <span>Suggested Dishes Preview ({matchedRecipesForPlan.length})</span>
                    <span className="text-[11px] text-gray-400">Click any card to open full recipe modal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {matchedRecipesForPlan.map(recipe => (
                      <div
                        key={recipe.id}
                        onClick={() => onSelectRecipeDetail && onSelectRecipeDetail(recipe)}
                        className="bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer group transition-all p-2.5 flex items-center gap-3"
                      >
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-amber-400 uppercase truncate">{recipe.cuisine} • {recipe.mealType}</div>
                          <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{recipe.name}</h4>
                          <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-2">
                            <span>🔥 {recipe.macros?.calories || recipe.calories} kcal</span>
                            <span>💪 {recipe.macros?.protein || recipe.protein}g P</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Text Plan Output */}
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <BookOpen size={14} /> Full AI Nutritionist Plan Output
                  </span>
                  <button onClick={() => copyToClipboard(generatedPlan)} className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]">
                    <Copy size={12} /> Copy Text
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto pr-1">
                  <AIMessage text={generatedPlan} model={planModel} />
                </div>
              </div>
            </div>
          )}

          {!generatedPlan && !isPlanGenerating && (
            <div className="text-center py-8 text-[var(--text-muted)] text-xs space-y-2">
              <Calendar size={36} className="mx-auto text-amber-500/40" />
              <p className="font-semibold">Click "Generate New AI Day Plan" to create a personalized meal plan.</p>
              <p className="text-[11px] text-gray-500">Your generated plans will be saved automatically in history.</p>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 3: PANTRY IDEAS ────────────────────────────────────────── */}
      {activeMode === 'pantry' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Utensils size={16} className="text-amber-400" />
                Pantry-Based AI Meal Ideas
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                AI meal suggestions utilizing your {pantryItems.length} active pantry ingredients
              </p>
            </div>
            <button
              onClick={handlePantryIdeas}
              disabled={isPantryGenerating || !hfToken || pantryItems.length === 0}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs hover:from-amber-400 transition-all disabled:opacity-50"
            >
              {isPantryGenerating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              <span className="ml-1">Get Ideas</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {pantryItems.map((item, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {typeof item === 'string' ? item : item.name}
              </span>
            ))}
          </div>

          {pantryIdeas && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-4 space-y-2">
              <AIMessage text={pantryIdeas.text} model={pantryIdeas.model} />
            </div>
          )}
        </div>
      )}

      {/* ── MODE 4: SAVED HISTORY LOG ───────────────────────────────────── */}
      {activeMode === 'history' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <History size={16} className="text-amber-400" />
                Saved AI Plan & Chat History Log ({planHistory.length} Saved Plans)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Access and re-load any previous AI generated meal plan into the Intelligent Planner anytime
              </p>
            </div>
            {planHistory.length > 0 && (
              <button onClick={clearPlanHistory} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-semibold">
                <Trash2 size={13} /> Clear Plan History
              </button>
            )}
          </div>

          {planHistory.length === 0 ? (
            <div className="text-center py-10 text-xs text-[var(--text-muted)] space-y-2">
              <History size={36} className="mx-auto text-gray-600" />
              <p>No saved AI meal plans found. Generate your first plan to start saving history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {planHistory.map((item, idx) => {
                const matched = (item.matchedRecipes || []).map(r => scoredRecipes?.find(sr => sr.id === r.id || sr.name === r.name) || r);

                return (
                  <div key={item.id || idx} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">Plan #{planHistory.length - idx}</span>
                        <span className="text-gray-500">• {item.timestamp}</span>
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {item.goal || 'Health Plan'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setPlanHistory(prev => prev.filter(p => p.id !== item.id));
                        }}
                        className="text-gray-500 hover:text-red-400 transition-all"
                        title="Delete Plan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Button to Load This Historical Plan in Intelligent Planner */}
                    {matched.length > 0 && (
                      <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs">
                        <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                          <Sparkles size={14} /> {matched.length} Dishes Saved in this AI Plan
                        </span>
                        <button
                          onClick={() => onLoadAiSuggestedMeals(matched)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold rounded-lg text-[11px] hover:from-amber-400 transition-all flex items-center gap-1"
                        >
                          Load in Intelligent Planner <ArrowRight size={12} />
                        </button>
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto text-xs pr-1">
                      <AIMessage text={item.planText} model={item.model} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Token Setup Modal */}
      {showTokenModal && (
        <TokenSetupModal
          onSave={handleTokenSave}
          onClose={() => setShowTokenModal(false)}
        />
      )}
    </div>
  );
}
