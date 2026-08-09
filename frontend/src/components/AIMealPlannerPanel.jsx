import { useState, useRef, useEffect } from 'react';
import {
  Bot, Sparkles, Send, RefreshCw, Key, X, ChevronDown, ChevronUp,
  Utensils, MessageSquare, Calendar, ShoppingBag, AlertCircle,
  CheckCircle2, Loader2, Copy, ThumbsUp, Zap, ExternalLink
} from 'lucide-react';
import {
  generateAIMealPlan,
  chatWithNutritionist,
  generatePantryMealIdeas,
  getHFToken,
  setHFToken,
  clearHFToken,
  HF_TOKEN_KEY
} from '../services/huggingFaceService';

// ─── Markdown-like renderer (simple) ─────────────────────────────────────────
function AIMessage({ text, model }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('# ')) return <h3 key={i} className="font-bold text-amber-400 text-sm mt-2">{line.slice(2)}</h3>;
        if (line.startsWith('## ') || line.startsWith('**') && line.endsWith('**')) {
          const content = line.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
          return <h4 key={i} className="font-semibold text-amber-300 text-xs mt-2">{content}</h4>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <div key={i} className="flex gap-1.5 text-xs text-gray-300"><span className="text-amber-400 mt-0.5">•</span><span>{line.slice(2)}</span></div>;
        }
        if (/^\d+\./.test(line)) {
          return <div key={i} className="flex gap-1.5 text-xs text-gray-300"><span className="text-amber-400 font-bold min-w-[14px]">{line.match(/^\d+/)[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
        }
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded text-amber-300">$1</code>');
        return <p key={i} className="text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
      {model && (
        <div className="pt-1 border-t border-gray-800 mt-2">
          <span className="text-[10px] text-gray-600">Powered by {model.split('/').pop()}</span>
        </div>
      )}
    </div>
  );
}

// ─── Token Setup Modal ────────────────────────────────────────────────────────
function TokenSetupModal({ onSave, onClose }) {
  const [token, setToken] = useState(getHFToken());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    if (!token.trim()) return;
    setHFToken(token.trim());
    onSave(token.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Key size={18} /> Setup Free HuggingFace AI
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4 text-xs text-gray-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={13} /> 100% FREE — No credit card needed</div>
            <p>HuggingFace provides free AI inference. You just need a free account and API token.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">How to get your free token:</p>
            <ol className="space-y-1 list-none">
              <li className="flex gap-2"><span className="text-amber-400 font-bold">1.</span> Go to <a href="https://huggingface.co/join" target="_blank" rel="noreferrer" className="text-amber-400 underline">huggingface.co/join</a> (free signup)</li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">2.</span> Click your profile → Settings → Access Tokens</li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">3.</span> Click "New Token" → Role: Read → Create</li>
              <li className="flex gap-2"><span className="text-amber-400 font-bold">4.</span> Copy the token (starts with <code className="bg-gray-800 px-1 rounded text-amber-300">hf_</code>)</li>
            </ol>
          </div>

          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">Your HuggingFace Token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-xl text-xs ${testResult.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {testResult.message}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!token.trim()}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Activate AI
            </button>
          </div>

          <p className="text-gray-600 text-[10px] text-center">Token is stored only in your browser's localStorage. Never sent to our servers.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main AI Panel ────────────────────────────────────────────────────────────
export default function AIMealPlannerPanel({ healthProfile, pantryItems, scoredRecipes }) {
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'mealplan' | 'pantry'
  const [hfToken, setHfTokenState] = useState(getHFToken());
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([
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
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Meal Plan state
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [planModel, setPlanModel] = useState(null);
  const [isPlanGenerating, setIsPlanGenerating] = useState(false);

  // Pantry Ideas state
  const [pantryIdeas, setPantryIdeas] = useState(null);
  const [isPantryGenerating, setIsPantryGenerating] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleTokenSave = (token) => {
    setHfTokenState(token);
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: '✅ **AI Activated!** Your HuggingFace token has been saved. I\'m now ready to generate personalized meal plans and answer your nutrition questions. What would you like to know?',
      model: null
    }]);
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
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${err.message}\n\nPlease check your HuggingFace token or try again in a moment. Free models can be busy sometimes.`,
        model: null
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!hfToken) { setShowTokenModal(true); return; }
    setIsPlanGenerating(true);
    setGeneratedPlan(null);
    try {
      const { plan, model } = await generateAIMealPlan(healthProfile, scoredRecipes, hfToken);
      setGeneratedPlan(plan);
      setPlanModel(model);
    } catch (err) {
      setGeneratedPlan(`❌ Error: ${err.message}\n\nPlease check your token and try again.`);
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
      setPantryIdeas({ text: ideas, model });
    } catch (err) {
      setPantryIdeas({ text: `❌ Error: ${err.message}`, model: null });
    } finally {
      setIsPantryGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const quickPrompts = [
    `Best foods for ${healthProfile.medicalConditions?.[0] || 'healthy lifestyle'}`,
    `What to eat for ${healthProfile.goal}?`,
    `Indian breakfast ideas under 300 calories`,
    `Foods to avoid with ${healthProfile.medicalConditions?.[0] || 'diabetes'}`,
    `Vegetarian protein sources`,
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d1117] to-[#161b22] border border-amber-500/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Bot size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                SpectraTrust AI Nutritionist
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">FREE</span>
              </h2>
              <p className="text-[11px] text-gray-400">Powered by HuggingFace Open-Source AI Models</p>
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
              title="Setup API Token"
            >
              <Key size={14} />
            </button>
          </div>
        </div>

        {!hfToken && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-300">
              <strong>Setup needed:</strong> Add your free HuggingFace API token to activate AI.{' '}
              <button onClick={() => setShowTokenModal(true)} className="underline font-semibold">
                Get free token →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1">
        {[
          { id: 'chat', label: 'AI Chat', icon: MessageSquare },
          { id: 'mealplan', label: 'Generate Plan', icon: Calendar },
          { id: 'pantry', label: 'Pantry Ideas', icon: Utensils },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── CHAT MODE ────────────────────────────────────────────────────── */}
      {activeMode === 'chat' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col" style={{ height: '480px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-black" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-black text-xs font-medium rounded-tr-sm'
                    : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-tl-sm'
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
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-black" />
                </div>
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="text-amber-400 animate-spin" />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-[var(--border-color)] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setChatInput(prompt)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border-color)] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
              placeholder={hfToken ? "Ask about nutrition, recipes, meal timing..." : "Add HuggingFace token to chat..."}
              disabled={!hfToken || isGenerating}
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
            <button
              onClick={handleChat}
              disabled={!chatInput.trim() || isGenerating || !hfToken}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black disabled:opacity-40 disabled:cursor-not-allowed hover:from-amber-400 hover:to-yellow-500 transition-all"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* ── MEAL PLAN MODE ───────────────────────────────────────────────── */}
      {activeMode === 'mealplan' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={16} className="text-amber-400" />
                AI Personalized Day Plan
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Based on your profile: {healthProfile.goal} • {healthProfile.dietPreference} • {healthProfile.medicalConditions?.join(', ') || 'No conditions'}
              </p>
            </div>
            <button
              onClick={handleGenerateMealPlan}
              disabled={isPlanGenerating || !hfToken}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {isPlanGenerating
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Sparkles size={13} /> Generate Plan</>
              }
            </button>
          </div>

          {/* Profile Summary Cards */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Goal', value: healthProfile.goal, color: 'amber' },
              { label: 'BMI', value: `${(healthProfile.weight / ((healthProfile.height / 100) ** 2)).toFixed(1)}`, color: 'emerald' },
              { label: 'Diet', value: healthProfile.dietPreference, color: 'sky' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-2 text-center`}>
                <div className={`text-${color}-400 font-bold text-sm`}>{value}</div>
                <div className="text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {!hfToken && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <button onClick={() => setShowTokenModal(true)} className="text-xs text-amber-400 font-semibold underline flex items-center gap-1 mx-auto">
                <Key size={12} /> Setup free HuggingFace token to generate AI meal plans
              </button>
            </div>
          )}

          {isPlanGenerating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Sparkles size={24} className="text-amber-400 animate-pulse" />
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Generating your personalized meal plan...</div>
              <div className="text-xs text-[var(--text-muted)]">AI is analyzing your health profile and conditions</div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {generatedPlan && !isPlanGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Plan Generated Successfully
                </span>
                <button
                  onClick={() => copyToClipboard(generatedPlan)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-all"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-4 max-h-80 overflow-y-auto">
                <AIMessage text={generatedPlan} model={planModel} />
              </div>
              <button
                onClick={handleGenerateMealPlan}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/10 transition-all"
              >
                <RefreshCw size={12} /> Regenerate Plan
              </button>
            </div>
          )}

          {!generatedPlan && !isPlanGenerating && (
            <div className="text-center py-6 text-[var(--text-muted)] text-xs">
              <Calendar size={32} className="mx-auto mb-2 text-gray-600" />
              <p>Click "Generate Plan" for an AI-crafted meal plan tailored to your health profile, conditions, and goals.</p>
            </div>
          )}
        </div>
      )}

      {/* ── PANTRY IDEAS MODE ────────────────────────────────────────────── */}
      {activeMode === 'pantry' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Utensils size={16} className="text-amber-400" />
                Pantry-Based AI Meal Ideas
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                AI suggests meals from your {pantryItems.length} pantry ingredients
              </p>
            </div>
            <button
              onClick={handlePantryIdeas}
              disabled={isPantryGenerating || !hfToken || pantryItems.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs hover:from-amber-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPantryGenerating
                ? <><Loader2 size={13} className="animate-spin" /> Thinking...</>
                : <><Zap size={13} /> Get Ideas</>
              }
            </button>
          </div>

          {/* Pantry Ingredients Preview */}
          <div className="flex flex-wrap gap-1.5">
            {pantryItems.slice(0, 12).map((item, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {item}
              </span>
            ))}
            {pantryItems.length > 12 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                +{pantryItems.length - 12} more
              </span>
            )}
          </div>

          {!hfToken && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <button onClick={() => setShowTokenModal(true)} className="text-xs text-amber-400 font-semibold underline flex items-center gap-1 mx-auto">
                <Key size={12} /> Setup free HuggingFace token first
              </button>
            </div>
          )}

          {isPantryGenerating && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Utensils size={20} className="text-amber-400 animate-pulse" />
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Generating meal ideas...</div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {pantryIdeas && !isPantryGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> AI Meal Ideas Ready
                </span>
                <button
                  onClick={() => copyToClipboard(pantryIdeas.text)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-4 max-h-80 overflow-y-auto">
                <AIMessage text={pantryIdeas.text} model={pantryIdeas.model} />
              </div>
            </div>
          )}

          {!pantryIdeas && !isPantryGenerating && (
            <div className="text-center py-6 text-[var(--text-muted)] text-xs">
              <ShoppingBag size={32} className="mx-auto mb-2 text-gray-600" />
              <p>AI will suggest 5 creative meals you can make right now using your pantry ingredients, tailored to your health conditions.</p>
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
