import { useState, useEffect } from 'react';
import { ShieldAlert, Send, Camera, MapPin } from 'lucide-react';
import { getShops, submitComplaint } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function ReportPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    shop_id: '',
    description: '',
    contact_info: ''
  });
  const [readingSource, setReadingSource] = useState('auto');

  useEffect(() => {
    getShops().then(res => setShops(res.data?.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shop_id || !formData.description) {
      alert("Please select a shop and provide a description.");
      return;
    }
    
    setLoading(true);
    try {
      await submitComplaint(formData);
      alert("Complaint submitted successfully. It is now pending verification.");
      navigate('/map');
    } catch (err) {
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col gap-2">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
          <ShieldAlert size={24} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Report Adulterated Oil</h1>
        <p className="text-sm text-gray-500">
          Help us maintain a pure ecosystem. Verified reports will instantly update the national map to warn others.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
        
        {/* Purity Reading Source */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            Purity Reading Source
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setReadingSource('auto')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                readingSource === 'auto' 
                ? 'border-[#1d9e75] bg-[#e8f5f0] text-[#1d9e75] shadow-sm shadow-[#1d9e75]/10' 
                : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-current opacity-80">
                <span className="text-sm">📡</span>
              </div>
              <span className="text-[11px] font-bold tracking-wide">Sensor Auto-fill</span>
            </button>

            <button 
              type="button"
              onClick={() => setReadingSource('manual')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-none ${
                readingSource === 'manual' 
                ? 'border-[#f59e0b] bg-amber-50 text-amber-600 shadow-sm shadow-amber-500/10' 
                : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-current opacity-80">
                <span className="text-sm">✍️</span>
              </div>
              <span className="text-[11px] font-bold tracking-wide">Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Shop Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            Seller / Shop Location
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-[#e8ede8] text-sm text-gray-800 outline-none focus:border-[#1d9e75] focus:ring-4 focus:ring-[#1d9e75]/10 appearance-none font-medium transition-all"
              value={formData.shop_id}
              onChange={e => setFormData({ ...formData, shop_id: e.target.value })}
            >
              <option value="" disabled>Select a detected shop...</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name} ({shop.oil_type})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            Details & Visual Evidence
          </label>
          <textarea 
            placeholder="Describe the issue... (e.g. 'Oil smells like petroleum, very thin consistency')"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-[#e8ede8] text-sm text-gray-800 outline-none focus:border-[#1d9e75] focus:ring-4 focus:ring-[#1d9e75]/10 min-h-[110px] resize-none font-medium transition-all"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Contact Info (Optional) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
            Your Contact Info (Optional)
          </label>
          <input 
            type="text"
            placeholder="Phone or Email for follow-up"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-[#e8ede8] text-sm text-gray-800 outline-none focus:border-[#1d9e75] focus:ring-4 focus:ring-[#1d9e75]/10 font-medium transition-all"
            value={formData.contact_info}
            onChange={e => setFormData({ ...formData, contact_info: e.target.value })}
          />
        </div>

        {/* Photo Upload Mock */}
        <button type="button" className="card flex items-center justify-center gap-3 py-5 border-2 border-dashed border-[#e8ede8] bg-gray-50/50 hover:bg-gray-100 transition-colors shadow-none mt-1">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
            <Camera size={14} className="text-gray-400" />
          </div>
          <span className="text-[13px] font-bold text-gray-500">Attach Photo Evidence</span>
        </button>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-4 mt-4 shadow-xl shadow-[#1d9e75]/20 text-sm tracking-wide"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={16} />
              Submit Official Report
            </>
          )}
        </button>

      </form>
    </div>
  );
}
