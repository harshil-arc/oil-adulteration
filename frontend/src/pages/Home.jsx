import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, ChevronRight, AlertTriangle, CheckCircle, Droplets, Flag, X, MapPin, Camera, FileBarChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AiChatbot from '../components/AiChatbot';

export default function Home() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [reportForm, setReportForm] = useState({ shopName: '', address: '', oilType: '', description: '', attachedReadingId: '' });
  const [proofPhoto, setProofPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('analysis_results').select('*').order('timestamp', { ascending: false }).limit(5)
      .then(({data}) => { 
        if (data) setReadings(data);
        setLoading(false);
      });
      
    // Quick real-time sub
    const channel = supabase.channel('home_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analysis_results' }, (payload) => {
        setReadings(prev => [payload.new, ...prev].slice(0, 5));
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalScans = readings.length; // usually would be a count query, but mock for now
  const safeScans = readings.filter(r => r.quality !== 'Unsafe').length;
  const unsafeScans = readings.filter(r => r.quality === 'Unsafe').length;

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate getting geolocation for the shop (randomizing slightly around a center point for demo map)
    const lat = 22.9734 + (Math.random() - 0.5) * 5;
    const lng = 78.6569 + (Math.random() - 0.5) * 5;

    try {
      // 1. Insert Shop as 'adulterated'
      const { data: shopData, error: shopErr } = await supabase.from('shops').insert([{
        name: reportForm.shopName,
        address: reportForm.address, // Added loosely, schema has latitude/longitude/name/oil_type/status
        latitude: lat,
        longitude: lng,
        oil_type: reportForm.oilType,
        status: 'adulterated',
        trust_score: 20
      }]).select().single();

      if (shopData) {
        // 2. Insert Complaint
        await supabase.from('complaints').insert([{
          shop_id: shopData.id,
          description: `Reading ID: ${reportForm.attachedReadingId}\n${reportForm.description}`,
          status: 'pending',
          lat: lat,
          lng: lng,
          image_url: proofPhoto ? 'uploaded_proof.jpg' : null
        }]);
      }
      
      setShowReport(false);
      setReportForm({ shopName: '', address: '', oilType: '', description: '', attachedReadingId: '' });
      setProofPhoto(null);
      alert("Report submitted successfully! The shop has been flagged for FSSAI verification.");
    } catch (e) {
      console.error(e);
      alert("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Hey, Inspector 👋</h1>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-[#333] flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#d4af37] rounded-full shadow-glow-gold" />
          </button>
          <button onClick={() => setShowAiChat(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/20 transition-colors shadow-glow-gold text-nowrap">
            <Sparkles size={14} fill="currentColor" />
            ASK AI
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[20px] p-6 shadow-glow-gold border border-[#d4af37]/30 bg-[#141414]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-4">
            <Sparkles size={10} />
            AI Powered
          </div>
          <h2 className="text-3xl font-black text-white mb-2 leading-tight">Test Your Oil</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[200px] leading-relaxed">
            Detect adulterants instantly with your ESP32 sensor.
          </p>
          <button 
            onClick={() => navigate('/scan')}
            className="btn-primary w-fit pr-4"
          >
            <span>START SCAN</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-[#333]">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Scans</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : totalScans}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-[#d4af37]/20">
          <p className="text-[9px] font-bold text-[#d4af37] uppercase tracking-widest mb-1">Safe</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : safeScans}</p>
        </div>
        <div className="card flex flex-col items-center justify-center py-4 px-2 hover:bg-[#1c1c1c] transition-colors border-red-500/20">
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">Unsafe</p>
          <p className="text-2xl font-black text-white">{loading ? '-' : unsafeScans}</p>
        </div>
      </div>

      {/* Report Adulterated Oil Button */}
      <button 
        onClick={() => setShowReport(true)}
        className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 border border-red-500/30 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white transition-colors shadow-sm"
      >
        <Flag size={18} />
        Report Adulterated Oil
      </button>

      {/* Recent Scans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Scans</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-[#f5c842]"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
             <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-[#333] border-t-[#d4af37] rounded-full animate-spin"/></div>
          ) : readings.length === 0 ? (
            <div className="card border-dashed border-[#333] bg-transparent flex flex-col items-center justify-center py-8">
              <Droplets size={32} className="text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No scans yet.</p>
              <button onClick={() => navigate('/scan')} className="text-[#d4af37] text-xs font-bold uppercase mt-2">Tap Start Scan to begin</button>
            </div>
          ) : (
            readings.map(scan => {
              const isSafe = scan.quality !== 'Unsafe';
              const badgeClass = isSafe ? 'badge-safe' : 'badge-unsafe';
              const StatusIcon = isSafe ? CheckCircle : AlertTriangle;

              return (
                <div key={scan.id} className="card border-[#333] p-4 flex items-center justify-between hover:bg-[#1c1c1c] transition-colors shadow-none cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSafe ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{scan.oil_type || 'Unknown Sample'}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(scan.timestamp).toLocaleDateString()} • {scan.vendor || 'Unknown Vendor'}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] ${badgeClass}`}>
                    {scan.quality}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report Modal / Bottom Sheet */}
      {showReport && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end animate-fade-in backdrop-blur-sm px-0 pb-0" onClick={() => setShowReport(false)}>
           <div className="w-full max-w-md mx-auto bg-[#0a0a0a] border-t border-red-500/30 rounded-t-[2.5rem] p-6 pb-safe animate-slide-up relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <AlertTriangle className="text-red-500" size={24} /> 
                     File Report
                   </h2>
                   <p className="text-gray-400 text-xs mt-1">Submit vendor details for FSSAI verification</p>
                 </div>
                 <button onClick={() => setShowReport(false)} className="p-2 bg-[#1c1c1c] rounded-full text-gray-400 hover:text-white">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={submitReport} className="flex flex-col gap-4">
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Shop / Vendor Name</label>
                   <input required value={reportForm.shopName} onChange={e=>setReportForm({...reportForm, shopName: e.target.value})} placeholder="e.g. Raju Oil Store" className="w-full bg-[#1c1c1c] border border-[#333] text-white focus:border-[#d4af37] rounded-2xl py-3 px-4 outline-none text-sm placeholder:text-gray-600" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Location / Address</label>
                   <div className="relative">
                     <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input required value={reportForm.address} onChange={e=>setReportForm({...reportForm, address: e.target.value})} placeholder="Area or exact address" className="w-full bg-[#1c1c1c] border border-[#333] text-white focus:border-[#d4af37] rounded-2xl py-3 pl-10 pr-4 outline-none text-sm placeholder:text-gray-600" />
                   </div>
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Oil Type</label>
                   <input required value={reportForm.oilType} onChange={e=>setReportForm({...reportForm, oilType: e.target.value})} placeholder="e.g. Mustard, Palm, Ghee" className="w-full bg-[#1c1c1c] border border-[#333] text-white focus:border-[#d4af37] rounded-2xl py-3 px-4 outline-none text-sm placeholder:text-gray-600" />
                 </div>
                 <div className="mb-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Complaint Description</label>
                   <textarea required value={reportForm.description} onChange={e=>setReportForm({...reportForm, description: e.target.value})} rows="2" placeholder="What is the issue? Visual adulteration, smell, failed test?" className="w-full bg-[#1c1c1c] border border-[#333] text-white focus:border-[#d4af37] rounded-2xl py-3 px-4 outline-none text-sm placeholder:text-gray-600 resize-none"></textarea>
                 </div>

                 {/* Photo Proof Upload */}
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Photo Evidence (Optional)</label>
                   <div className="w-full bg-[#1c1c1c] border border-[#333] border-dashed rounded-2xl py-4 flex flex-col items-center justify-center relative hover:border-[#d4af37] transition-colors cursor-pointer">
                     <Camera size={24} className="text-gray-500 mb-2" />
                     <p className="text-xs text-gray-400 font-bold tracking-wide">{proofPhoto ? proofPhoto.name : 'Tap to capture or upload'}</p>
                     <input type="file" accept="image/*" onChange={(e) => setProofPhoto(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                 </div>

                 {/* Attach Reading */}
                 <div className="mb-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-1 block">Attach Sensor Reading (Optional)</label>
                   <div className="relative">
                     <FileBarChart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                     <select value={reportForm.attachedReadingId} onChange={e=>setReportForm({...reportForm, attachedReadingId: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#333] text-white focus:border-[#d4af37] rounded-2xl py-3 pl-10 pr-4 outline-none text-sm appearance-none">
                       <option value="">-- No reading attached --</option>
                       {readings.filter(r => r.quality === 'Unsafe').map(r => (
                         <option key={r.id} value={r.id}>
                           {r.oil_type} ({r.quality}) - {new Date(r.timestamp).toLocaleDateString()}
                         </option>
                       ))}
                     </select>
                     <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none rotate-90" />
                   </div>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full bg-red-500 text-white font-bold py-4 rounded-[20px] shadow-[0_4px_20px_rgba(239,68,68,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2">
                   {submitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
                   {!submitting && <ChevronRight size={18} />}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* AI Chatbot Overlay */}
      {showAiChat && <AiChatbot onClose={() => setShowAiChat(false)} />}
    </div>
  );
}
