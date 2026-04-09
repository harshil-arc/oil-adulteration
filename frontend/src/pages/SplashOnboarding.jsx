import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SplashOnboarding() {
  const navigate = useNavigate();
  const { session } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (session) {
      navigate('/home');
      return;
    }
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, [session, navigate]);

  const slides = [
    {
      title: "Oil Adulteration is Invisible",
      subtitle: "Detect hidden impurities, harmful chemicals, and mixed cheap oils with lab-grade accuracy.",
      Icon: Droplets,
    },
    {
      title: "Connect Your ESP32 Device",
      subtitle: "Pair your PureOil hardware via Bluetooth or WiFi to seamlessly sync real-time spectra data.",
      Icon: Zap,
    },
    {
      title: "Get Results in Seconds",
      subtitle: "Instantly know if your cooking oil is 100% pure or heavily adulterated, right on your screen.",
      Icon: CheckCircle2,
    }
  ];

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-[80px]" />
        
        <div className="flex flex-col items-center justify-center z-10 animate-slide-up">
          <div className="w-24 h-24 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-[#0a0a0a] rounded-[2rem] flex items-center justify-center shadow-glow-gold mb-6 rotate-12 transition-transform">
            <Droplets size={48} fill="currentColor" strokeWidth={1} className="-rotate-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Pure<span className="text-[#d4af37]">Oil</span></h1>
          <p className="text-[#9ca3af] font-medium tracking-wide uppercase text-xs">Know What You Consume</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pt-safe animate-fade-in">
      {/* Top Bar */}
      <div className="flex justify-end p-5">
        <button 
          onClick={() => navigate('/login')}
          className="text-[#9ca3af] text-sm font-bold uppercase tracking-wider hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative px-6 mt-8">
        <div className="flex-1 flex flex-col items-center text-center max-w-sm mx-auto">
          {/* Icon Stage */}
          <div className="w-full aspect-square relative flex items-center justify-center mb-10">
            <div className="absolute inset-0 bg-[#d4af37] opacity-5 blur-[60px] rounded-full" />
            <div className="relative z-10 w-48 h-48 card flex items-center justify-center rotate-3 border-[#d4af37]/20 shadow-glow-gold">
              {(() => {
                const ActiveIcon = slides[currentSlide].Icon;
                return <ActiveIcon size={80} className="text-[#d4af37] -rotate-3 drop-shadow-lg" strokeWidth={1.5} />;
              })()}
            </div>
          </div>

          {/* Text Content */}
          <div className="min-h-[140px]">
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[#9ca3af] text-sm leading-relaxed px-4">
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pb-12 pt-8 flex flex-col items-center gap-8">
          {/* Dots */}
          <div className="flex gap-2.5">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-[#d4af37] shadow-glow-gold' : 'w-2 bg-[#333]'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full">
            {currentSlide === slides.length - 1 ? (
              <button 
                onClick={() => navigate('/login')}
                className="w-full btn-primary animate-slide-up"
              >
                <span>Get Started</span>
              </button>
            ) : (
              <div className="flex gap-3 relative justify-center items-center w-full min-h-[56px]">
                <button 
                  onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                  className="w-full btn-primary absolute inset-0 z-10"
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
