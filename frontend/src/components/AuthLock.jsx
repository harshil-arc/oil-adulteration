import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Delete, ChevronRight } from 'lucide-react';

export default function AuthLock({ children }) {
  const { settings } = useApp();
  const [isLocked, setIsLocked] = useState(!!settings.appPin);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLocked(!!settings.appPin);
  }, [settings.appPin]);

  const handlePress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === settings.appPin) {
          setIsLocked(false);
          setPin('');
        } else {
          setError(true);
          setTimeout(() => {
            setError(false);
            setPin('');
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  if (!isLocked) return children;

  return (
    <div className="fixed inset-0 z-[999] bg-[#000000] flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center border border-[#d4af37]/30 shadow-glow-gold">
          <Lock className="text-[#d4af37]" size={32} />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-white tracking-widest uppercase">PureOil Secure</h1>
          <p className="text-xs text-gray-500 font-bold mt-1">Enter 4-digit PIN to unlock</p>
        </div>
      </div>

      <div className={`flex gap-4 mb-16 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 border-[#333] transition-all duration-200 ${pin.length > i ? 'bg-[#d4af37] border-[#d4af37] scale-110 shadow-glow-gold' : ''} ${error ? 'border-red-500 bg-red-500' : ''}`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handlePress(num)}
            className="w-16 h-16 rounded-full bg-[#141414] border border-[#333] text-xl font-bold text-white hover:bg-[#1c1c1c] active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handlePress(0)}
          className="w-16 h-16 rounded-full bg-[#141414] border border-[#333] text-xl font-bold text-white hover:bg-[#1c1c1c] active:scale-95 transition-all"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="w-16 h-16 flex items-center justify-center text-gray-400 hover:text-white"
        >
          <Delete size={24} />
        </button>
      </div>

      <button onClick={() => window.location.reload()} className="mt-12 text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-[#d4af37] transition-colors">
        Forgot PIN? Contact Admin
      </button>
    </div>
  );
}
