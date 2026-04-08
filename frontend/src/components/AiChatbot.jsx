import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AiChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello Inspector! I'm your PureOil Assistant. I can help interpret recent spectral readings, FSSAI regulations, or analyze testing data. What do you need help with?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mock Intelligence Logic tailored for the Oil Adulteration scope
  const generateMockResponse = async (userText) => {
    const query = userText.toLowerCase();
    
    // Quick delay for realism
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

    if (query.includes('fssai') || query.includes('regulation')) {
      return "According to FSSAI guidelines, Mustard Oil must have a refractive index between 1.4646 to 1.4662. Any traces of Argemone oil are strictly prohibited and immediately classified as a severe health risk (Unsafe).";
    }
    
    if (query.includes('argemone') || query.includes('mineral oil')) {
      return "Argemone oil is a toxic adulterant often mixed with Mustard oil to reduce costs. Our ESP32 sensor detects Argemone by analyzing the distinct UV-Vis spectrum deviation from pure mustard oil baselines. If detected, issue an immediate stop-sale.";
    }

    if (query.includes('recent') || query.includes('last scan') || query.includes('status')) {
      try {
        const { data } = await supabase.from('analysis_results').select('oil_type, quality').order('timestamp', { ascending: false }).limit(1).single();
        if (data) {
           return `Your most recent scan was for ${data.oil_type}. The quality was marked as **${data.quality}**. If it was Unsafe, I recommend generating an official report by tapping the "Report" button on the home screen.`;
        }
      } catch (e) {
        // fallback
      }
      return "I'm having trouble fetching your recent scans right now, but your sensor appears to be connected. Try running a new test!";
    }

    if (query.includes('hello') || query.includes('hi')) {
      return "Hello! I am ready to assist with your field inspections. You can ask me about adulterants, or checking recent test results.";
    }

    // Default response answering intelligently about the app
    return "Based on current sensor calibration, I recommend ensuring the oil sample is completely sealed in the testing vial to prevent external light interference. Do you need help bringing up the testing protocol guide?";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const aiText = await generateMockResponse(userMsg.text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
  };

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
                 <h2 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">PureOil Assistant <span className="px-1.5 py-0.5 rounded uppercase tracking-widest text-[8px] bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">Beta</span></h2>
                 <p className="text-gray-400 text-xs">AI Inspector Support</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-[#1c1c1c] rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="text-center py-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-[#1c1c1c] px-3 py-1 rounded-full border border-[#333]">Official FSSAI Mode</span>
            </div>

            {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#1c1c1c] border border-[#333] text-white rounded-tr-sm' 
                      : 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-gray-100 rounded-tl-sm'
                  }`}>
                     {msg.sender === 'ai' && (
                       <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                          <Sparkles size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">PureOil AI</span>
                       </div>
                     )}
                     <div className="leading-relaxed whitespace-pre-wrap">{msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#d4af37]">{part}</strong> : part)}</div>
                  </div>
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
            <div ref={messagesEndRef} />
         </div>

         {/* Suggested Pills */}
         {!isTyping && messages.length < 3 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setInput('What are the FSSAI limits for Mustard Oil?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
                <ShieldCheck size={12} /> FSSAI Guidelines
              </button>
              <button onClick={() => setInput('What was my last scan result?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
                <FileText size={12} /> Recent Scan
              </button>
              <button onClick={() => setInput('How to detect Argemone oil?')} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:bg-[#333] flex items-center gap-1.5">
                <AlertTriangle size={12} /> Argemone Rules
              </button>
            </div>
         )}

         {/* Input Box */}
         <div className="p-4 border-t border-[#333] bg-[#0a0a0a]">
            <form onSubmit={handleSend} className="relative flex items-center">
               <input 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Message PureOil AI..."
                 className="w-full bg-[#1c1c1c] border border-[#333] text-white rounded-full py-4 pl-5 pr-14 outline-none text-sm focus:border-[#d4af37] transition-colors placeholder:text-gray-600"
               />
               <button 
                 type="submit" 
                 disabled={!input.trim() || isTyping}
                 className="absolute right-2 w-10 h-10 bg-[#d4af37] text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-[#333] disabled:text-gray-500 transition-all hover:brightness-110 active:scale-95"
               >
                  <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
               </button>
            </form>
            <p className="text-center text-[9px] text-gray-500 mt-3 font-medium">PureOil AI can make mistakes. Verify critical actions with sensory reports.</p>
         </div>

       </div>
    </div>
  );
}
