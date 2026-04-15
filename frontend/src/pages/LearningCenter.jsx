import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, PlayCircle, BookOpen, AlertCircle, 
  Search, X, CheckCircle2, TrendingUp, FlaskConical,
  Cpu, Thermometer, Info, ChevronDown
} from 'lucide-react';

const SubScreenNav = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-page)]/90 backdrop-blur-md z-40">
      <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h1 className="theme-text font-bold tracking-widest uppercase text-sm">
        {title}
      </h1>
    </div>
  );
};

// --- REAL DATA ---

const VIDEOS = [
  { 
    id: 'v1', 
    title: "The Silent Killer: Harms of Adulterated Oil", 
    duration: "4:15", 
    difficulty: "Beginner", 
    tags: ['Health', 'Risks'], 
    category: "Awareness",
    ytId: "kjfNnLV3uXg"
  },
  { 
    id: 'v2', 
    title: "How to Detect Oil Adulteration at Home", 
    duration: "6:30", 
    difficulty: "Beginner", 
    tags: ['DIY', 'Food Safety'], 
    category: "Awareness",
    ytId: "oHFawxJuAb8"
  },
  { 
    id: 'v3', 
    title: "PureOil App Training: Hardware Setup", 
    duration: "5:05", 
    difficulty: "Intermediate", 
    tags: ['Hardware', 'ESP32'], 
    category: "Operations",
    ytId: "1Z6zS3x4vHw"
  },
  { 
    id: 'v4', 
    title: "Taking a Proper Spectral Reading", 
    duration: "7:20", 
    difficulty: "Intermediate", 
    tags: ['Scanning', 'Spectra'], 
    category: "Operations",
    ytId: "M_eX1w-6AFI"
  },
  { 
    id: 'v5', 
    title: "What is Argemone Oil Adulteration?", 
    duration: "5:45", 
    difficulty: "Advanced", 
    tags: ['Toxins', 'Argemone'], 
    category: "Science",
    ytId: "gdmPNAAmiUY"
  },
  { 
    id: 'v6', 
    title: "Understanding Spectrometry Analytics", 
    duration: "10:15", 
    difficulty: "Advanced", 
    tags: ['Spectroscopy', 'Data'], 
    category: "Science",
    ytId: "bHQqvYy5KYo"
  }
];

const MANUALS = [
  { 
    title: "App User Manual v2.4", 
    icon: BookOpen, 
    desc: "Complete operational guide to the PureOil app.",
    content: `
      <h2>1. Initial Setup</h2>
      <p>Ensure your ESP32 device is powered on. Navigate to the "Scan" section in the app, select Bluetooth or Local Network, and pair the device. Once connected, the dashboard will show a "Streaming" status.</p>
      
      <h2>2. Taking a Reading</h2>
      <p>Submerge the spectral probe fully into the oil sample. Wait for the density and wavelength graphs to stabilize (usually 5-10 seconds) before tapping the "Save DB" or "Analyze" button.</p>

      <h2>3. Interpreting Results</h2>
      <p>The system compares the live spectral signature against a database of pure oils. A deviation over 5% on the optical transmission curve strongly indicates adulterants or degraded oil (e.g. reused frying oil).</p>
    `
  },
  { 
    title: "Safety & Hygiene Guidelines", 
    icon: AlertCircle, 
    desc: "Handling hazardous samples and probe cleaning.",
    content: `
      <h2>Crucial Probe Hygiene</h2>
      <p>Cross-contamination is the #1 cause of false positives. You MUST clean the spectral probe with an isopropyl alcohol wipe and dry it completely with a microfiber cloth between EVERY single oil sample.</p>
      
      <h2>Handling Hazardous Adulterants</h2>
      <p>Some black-market edible oils are adulterated with industrial lubricants, argemone oil (which causes dropsy), or banned synthetic dyes (Metanil Yellow). Always wear nitrile gloves when collecting samples in the field.</p>
    `
  },
  { 
    title: "Standard Testing Procedure (SOP)", 
    icon: FlaskConical, 
    desc: "FSSAI aligned operating procedure.",
    content: `
      <h2>1. Sample Collection</h2>
      <p>Collect at least 50ml of the target oil in a clean, transparent, and dry glass beaker.</p>
      
      <h2>2. Baseline Calibration</h2>
      <p>If changing environments, establish a baseline by scanning distilled water or a known 100% pure sample of the target oil. Tap "Calibrate Baseline" in the app menu.</p>
      
      <h2>3. Execution</h2>
      <p>Analyze the 50ml sample. Ensure no ambient sunlight directly hits the spectral photodiode during the scan, as external UV/IR radiation can skew the wavelength data.</p>
    `
  },
  { 
    title: "Device Troubleshooting", 
    icon: Info, 
    desc: "Fixing common connection & sensor issues.",
    content: `
      <h2>ESP32 Not Connecting?</h2>
      <p>Check if the blue LED on the ESP32 is flashing (pairing mode). If it's solid, it might be connected to another device. Press the 'RST' button on the board to reboot it.</p>
      
      <h2>Wavelength shows '0' or erratic values</h2>
      <p>The I2C connection to the spectral sensor might be loose, or the sensor surface is heavily coated in opaque debris. Clean the sensor lens. If using a custom breadboard, check the SCL and SDA jumper wires.</p>

      <h2>Database 'Save Failed' Error</h2>
      <p>Ensure you have an active internet connection. If the device is on a local Wi-Fi without internet, switch your phone back to 4G/5G mobile data before attempting to sync to the Cloud.</p>
    `
  }
];

const SENSORS = [
  { 
    title: "Temperature Sensor (DS18B20 / DHT)", 
    icon: Thermometer, 
    short: "Compensates for oil viscosity and optical baseline shifts.", 
    details: "Why is Temperature critical? Oil density decreases as temperature rises (thermal expansion). Furthermore, the optical refractive index of oil changes significantly with heat. If we scan oil at 40°C but compare it to a 20°C database, the result will falsely flag as adulterated. Our system reads the core temperature of the sample and applies a mathematical correction matrix (Normalizing to 25°C equivalent) before analysis." 
  },
  { 
    title: "Load Cell (Density / Specific Gravity)", 
    icon: TrendingUp, 
    short: "Measures mass against fixed volume to detect foreign oils.", 
    details: "Different oils have unique specific gravity ranges (e.g. pure mustard oil is ~0.910 g/cm³, whereas castrol or mineral oil might be higher or lower). The load cell securely measures the exact mass of the testing chamber. Combined with a fixed volume limit line, it dynamically calculates precise density. Argemone or cheap palm oil mixed into premium oils will shift this delicate density balance immediately." 
  },
  { 
    title: "Multispectral Optical Sensor", 
    icon: Cpu, 
    short: "The core technology: Analyzing light absorption signatures.", 
    details: "This sensor blasts a known spectrum of light (covering UV, Visible, and near-IR bands) through the oil sample. Different molecular structures absorb specific wavelengths. Pure Cold-Pressed oil has a very specific absorption 'fingerprint'. Synthetic dyes, recycled burnt oil, and chemical adulterants cause abnormal spikes in the 430nm-480nm wavelength bands. The app matches this fingerprint against the Supabase neural database." 
  }
];

const QUICK_HELP = [
  { q: "How to perform a fast field scan?", a: "Power on the hardware. Open PureOil app > 'Scan' > 'Bluetooth' > Pair. Submerge the probe in the oil up to the marked line. Wait 5 seconds for the readings to stabilize. Tap 'Save DB' to finalize." },
  { q: "The result is 'Inconclusive'. What now?", a: "This happens when the confidence score is between 40% and 60%. It usually means the probe was dirty, or the sample is a mix of highly similar oils (like sunflower and safflower). Clean the probe with an alcohol wipe and retry. If still inconclusive, a lab test is required." },
  { q: "What are the most common scanning mistakes?", a: "1. Failing to wipe the sensor lens between tests (causes cross-contamination data bleeding). 2. Testing oil under bright, direct sunlight (IR/UV rays from the sun enter the sensor and corrupt the spectral reading). 3. Testing oil while it is actively boiling on a stove." }
];

// --- COMPONENTS ---

export default function LearningCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [expandedSensor, setExpandedSensor] = useState(null);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const [activeManual, setActiveManual] = useState(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('pureoil_learning_progress');
    if (saved) {
      setCompletedVideos(JSON.parse(saved));
    }
  }, []);

  // Save progress
  const markComplete = (id) => {
    if (!completedVideos.includes(id)) {
      const newProgress = [...completedVideos, id];
      setCompletedVideos(newProgress);
      localStorage.setItem('pureoil_learning_progress', JSON.stringify(newProgress));
    }
  };

  const watchVideo = (vid) => {
    setActiveVideo(vid);
    // Mark as watched after 5 seconds of opening the modal (simulating learning engagement)
    setTimeout(() => markComplete(vid.id), 5000);
  };

  const progressPercent = Math.round((completedVideos.length / VIDEOS.length) * 100) || 0;

  const filteredVideos = VIDEOS.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Group by category for display
  const categorizedVideos = {
    Awareness: filteredVideos.filter(v => v.category === 'Awareness'),
    Operations: filteredVideos.filter(v => v.category === 'Operations'),
    Science: filteredVideos.filter(v => v.category === 'Science'),
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] pb-20 animate-fade-in relative z-20">
      <SubScreenNav title="Training Academy" />

      <div className="p-5 flex flex-col gap-10">
        
        {/* 1. PROGRESS DASHBOARD */}
        <div className="card border-[var(--border-color)] bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <BookOpen size={100} className="text-[#C8952A]" />
          </div>
          <div className="relative z-10 p-5">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-[#C8952A] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Academy Progress</h2>
                <div className="flex items-baseline gap-1">
                  <p className="theme-text text-3xl font-black">{progressPercent}</p>
                  <p className="theme-text text-xl font-bold opacity-50">%</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-xs theme-text font-black">{completedVideos.length} / {VIDEOS.length}</p>
                 <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Modules Done</p>
              </div>
            </div>
            <div className="w-full h-3 bg-black/50 border border-[#333] rounded-full overflow-hidden p-[1px]">
               <div 
                 className="h-full bg-gradient-to-r from-[#C8952A] to-[#f5c842] rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
        </div>

        {/* 2. SEARCH & FILTER */}
        <div className="flex flex-col gap-3">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text opacity-70 ml-1">Video Modules</h3>
           <div className="relative w-full">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
             <input 
               type="text" 
               placeholder="Search videos, topics..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-[var(--bg-elevated)] text-white border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#C8952A] focus:bg-[#1a1a1a] text-sm transition-all"
             />
             {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
                 <X size={16} />
               </button>
             )}
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Awareness', 'Operations', 'Science'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setFilterCategory(cat)}
                   className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors shrink-0 ${
                     filterCategory === cat 
                       ? 'bg-[#C8952A] text-black border-[#C8952A] shadow-[0_0_15px_rgba(200,149,42,0.3)]' 
                       : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[#C8952A]/50'
                   }`}
                 >
                   {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* 3. VIDEO TRAINING PATHS */}
        <div className="flex flex-col gap-8">
           {Object.entries(categorizedVideos).map(([category, videos]) => {
             if (videos.length === 0) return null;
             return (
               <div key={category} className="animate-fade-in">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] theme-text mb-3 ml-1 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#C8952A]" />
                   {category} Path
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {videos.map(vid => {
                     const isDone = completedVideos.includes(vid.id);
                     return (
                       <div 
                         key={vid.id} 
                         onClick={() => watchVideo(vid)}
                         className={`card p-3 border-[var(--border-color)] hover:border-[#C8952A] cursor-pointer transition-all flex gap-4 items-center group relative overflow-hidden ${isDone ? 'bg-[#1c1c1c]/40 border-green-500/20' : 'bg-[var(--bg-elevated)]'}`}
                       >
                         {/* Thumbnail */}
                         <div className={`w-28 h-18 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 border border-[#333] group-hover:border-[#C8952A] bg-[url('https://img.youtube.com/vi/${vid.ytId}/mqdefault.jpg')] bg-cover bg-center`}>
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-0"></div>
                            <PlayCircle size={28} className={isDone ? "text-green-400 z-10" : "text-white opacity-80 group-hover:scale-110 transition-transform z-10 shadow-lg shadow-black"} />
                         </div>
                         
                         <div className="flex-1 min-w-0 pr-6">
                           <h4 className={`font-bold text-sm truncate ${isDone ? 'text-gray-300' : 'theme-text'}`}>{vid.title}</h4>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">{vid.difficulty}</span>
                             <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                             <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{vid.duration}</span>
                           </div>
                           <div className="flex gap-1.5 mt-2 overflow-x-hidden">
                             {vid.tags.map(tag => (
                               <span key={tag} className="px-1.5 py-0.5 rounded-md border border-[#333] bg-black/50 text-[8px] font-bold uppercase text-gray-400 whitespace-nowrap">{tag}</span>
                             ))}
                           </div>
                         </div>
                         
                         {isDone && (
                           <div className="absolute top-1/2 -translate-y-1/2 right-3">
                             <CheckCircle2 size={18} className="text-green-500" />
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })}
        </div>

        {/* 4. MANUALS & GUIDES (RICH TEXT) */}
        <div className="pt-4 border-t border-[var(--border-color)]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text opacity-70 mb-4 ml-1">Documentation Portal</h3>
           <div className="grid grid-cols-2 gap-3">
             {MANUALS.map((doc, idx) => (
               <div 
                 key={idx} 
                 onClick={() => setActiveManual(doc)}
                 className="card p-5 border-[var(--border-color)] bg-[var(--bg-elevated)] flex flex-col items-center text-center gap-3 hover:border-[#C8952A] cursor-pointer transition-all active:scale-[0.98]"
               >
                 <div className="p-3 bg-[#111] rounded-full border border-[#333]">
                   <doc.icon size={20} className="text-[#C8952A]" />
                 </div>
                 <div>
                   <h4 className="font-bold text-xs theme-text mb-1">{doc.title}</h4>
                   <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">{doc.desc}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* 5. SENSOR LEARNING */}
        <div className="pt-4 border-t border-[var(--border-color)]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text opacity-70 mb-4 ml-1">Internal Hardware Logic</h3>
           <div className="flex flex-col gap-3">
              {SENSORS.map((sensor, idx) => (
                 <div key={idx} className="card p-0 border-[var(--border-color)] bg-[var(--bg-elevated)] overflow-hidden">
                   <div 
                     onClick={() => setExpandedSensor(expandedSensor === idx ? null : idx)}
                     className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-black border border-[#333] text-[#C8952A] flex items-center justify-center shadow-inner">
                            <sensor.icon size={18} />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm theme-text">{sensor.title}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5 max-w-[200px]">{sensor.short}</p>
                         </div>
                      </div>
                      <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform duration-300 ${expandedSensor === idx ? 'rotate-180 text-[#C8952A]' : ''}`} />
                   </div>
                   {expandedSensor === idx && (
                     <div className="p-5 pt-2 border-t border-[var(--border-color)] bg-[#111] animate-fade-in">
                       <p className="text-xs text-gray-300 leading-relaxed font-medium">{sensor.details}</p>
                     </div>
                   )}
                 </div>
              ))}
           </div>
        </div>

        {/* 6. FIELD QUICK HELP */}
        <div className="pt-4 border-t border-[var(--border-color)]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] theme-text opacity-70 mb-4 ml-1">Field Quick-Help (FAQ)</h3>
           <div className="flex flex-col gap-2">
              {QUICK_HELP.map((help, idx) => (
                 <div key={idx} className="card p-0 border-[var(--border-color)] bg-[var(--bg-elevated)]">
                    <div 
                     onClick={() => setExpandedHelp(expandedHelp === idx ? null : idx)}
                     className={`p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 transition-colors text-xs font-bold ${expandedHelp === idx ? 'text-[#C8952A]' : 'theme-text'}`}
                    >
                      <span className="pr-4">{help.q}</span>
                      <ChevronDown size={16} className={`shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${expandedHelp === idx ? 'rotate-180 text-[#C8952A]' : ''}`} />
                    </div>
                    {expandedHelp === idx && (
                      <div className="p-4 pt-0 border-t border-black bg-[#111] animate-fade-in">
                        <p className="pt-3 text-xs text-gray-400 leading-relaxed">{help.a}</p>
                      </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        <p className="text-center text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] py-8 opacity-30">
           PureOil Academy v1.0
        </p>

      </div>

      {/* --- VIDEO MODAL (REAL YT EMBED) --- */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fade-in">
           <div className="flex justify-between items-center p-4 border-b border-[#333] bg-[#0a0a0a]">
             <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#C8952A]">Training Media Viewer</span>
             </div>
             <button onClick={() => setActiveVideo(null)} className="p-2 bg-[#1c1c1c] rounded-full text-white hover:bg-red-500 transition-colors">
               <X size={16} />
             </button>
           </div>
           
           <div className="flex-1 bg-black flex items-center justify-center p-0 md:p-4">
             <div className="w-full max-w-4xl aspect-video bg-black relative">
               <iframe 
                 className="absolute inset-0 w-full h-full"
                 src={`https://www.youtube.com/embed/${activeVideo.ytId}?autoplay=1&rel=0&modestbranding=1`}
                 title={activeVideo.title}
                 frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
             </div>
           </div>
           
           <div className="p-6 bg-[#0a0a0a] border-t border-[#333] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
             <h2 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{activeVideo.title}</h2>
             <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
               <span className="px-2 py-0.5 bg-[#1c1c1c] rounded border border-[#333] uppercase tracking-wider font-bold text-[9px] text-blue-400">{activeVideo.category}</span>
               <span className="px-2 py-0.5 bg-[#1c1c1c] rounded border border-[#333] uppercase tracking-wider font-bold text-[9px] text-gray-300">{activeVideo.duration}</span>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed">
               Video progress is automatically tracked. Closing this viewer will return you to the academy dashboard.
             </p>
           </div>
        </div>
      )}

      {/* --- MANUALS MODAL (RICH TEXT RENDERER) --- */}
      {activeManual && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center animate-fade-in" onClick={() => setActiveManual(null)}>
           <div className="w-full md:max-w-2xl h-[85vh] md:h-[70vh] bg-[#0a0a0a] border border-[#333] md:rounded-3xl rounded-t-[2rem] p-0 pb-safe shadow-2xl flex flex-col animate-slide-up" onClick={e=>e.stopPropagation()}>
              
              <div className="flex justify-between items-center p-6 border-b border-[#333] bg-[#111] rounded-t-[2rem] md:rounded-t-3xl">
                 <div className="flex items-center gap-4">
                   <div className="p-2 bg-[#1c1c1c] border border-[#333] rounded-xl text-[#C8952A]">
                     <activeManual.icon size={20} />
                   </div>
                   <div>
                      <h2 className="text-base font-bold text-white leading-tight">{activeManual.title}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-[#C8952A] font-bold mt-0.5">Official Document</p>
                   </div>
                 </div>
                 <button onClick={() => setActiveManual(null)} className="p-2 bg-[#1c1c1c] rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                 {/* Prose styling using generic Tailwind classes since @tailwindcss/typography might not be installed */}
                 <div 
                   className="text-gray-300 text-sm leading-relaxed 
                              [&>h2]:text-[#C8952A] [&>h2]:text-sm [&>h2]:font-black [&>h2]:uppercase [&>h2]:tracking-widest [&>h2]:mt-8 [&>h2]:mb-3 [&>h2:first-child]:mt-0
                              [&>p]:mb-6 [&>p:last-child]:mb-0"
                   dangerouslySetInnerHTML={{ __html: activeManual.content }} 
                 />
              </div>

           </div>
        </div>
      )}

    </div>
  );
}
