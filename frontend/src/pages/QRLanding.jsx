import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Smartphone, QrCode } from 'lucide-react';
import ProtocolSelector from './scan/ProtocolSelector';

export default function QRLanding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product_id');
  
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSplashActive, setIsSplashActive] = useState(!!productId);

  useEffect(() => {
    // Check if device is desktop
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
    
    if (!isMobile && productId) {
      setIsDesktop(true);
    }
    
    // If valid mobile deep-link, show splash and proceed
    if (isMobile && productId) {
      // 1. Save product ID for later auto-selection in the app
      localStorage.setItem('scanned_product_id', productId);
      
      // 2. Play splash screen for 2.5 seconds to build trust
      const timer = setTimeout(() => {
        setIsSplashActive(false);
        // remove query param without refreshing
        window.history.replaceState({}, '', '/scan');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [productId]);

  // Desktop Fallback UI
  if (isDesktop && productId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-8 text-center animate-fade-in">
         <div className="w-20 h-20 bg-[var(--bg-elevated)] border border-[#333] rounded-2xl flex items-center justify-center mb-6">
            <Smartphone size={40} className="text-[#C8952A]" />
         </div>
         <h1 className="text-2xl font-black theme-text tracking-wider uppercase mb-2">Mobile Device Required</h1>
         <p className="text-sm text-gray-500 max-w-sm mb-8">
           It looks like you scanned a PureOil product QR code from a desktop browser. Please scan the QR code using your mobile phone's camera to initiate hardware testing.
         </p>
         <button onClick={() => { setIsDesktop(false); setIsSplashActive(false); window.history.replaceState({}, '', '/scan'); }} className="btn-primary">
           Continue to App Anyway
         </button>
      </div>
    );
  }

  // Mobile Deep Link Splash UI
  if (isSplashActive) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center animate-fade-in px-8 text-center pb-safe">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
         
         <div className="w-24 h-24 bg-gradient-to-br from-[#f5c842] to-[#d4af37] rounded-[2rem] flex items-center justify-center shadow-glow-gold rotate-12 mb-8 animate-[pulse_2s_ease-in-out_infinite]">
            <QrCode size={48} className="text-black -rotate-12" />
         </div>
         
         <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">PureOil<span className="text-[#C8952A]">.</span></h1>
         <p className="text-xs text-[#C8952A] font-bold uppercase tracking-[0.2em] mb-12">Product Target Locked</p>
         
         <div className="flex flex-col items-center gap-4 w-full max-w-xs transition-opacity duration-500">
            <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-full animate-[shimmer_1.5s_infinite] origin-left" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Initializing Hardware Link...</p>
         </div>
      </div>
    );
  }

  // Normal /scan UI (ProtocolSelector)
  return <ProtocolSelector />;
}
