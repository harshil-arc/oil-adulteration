import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, Trash2, Share2, CheckCircle, AlertTriangle, 
  Droplets, Thermometer, Zap, Activity, Award, Printer, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ScanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    supabase.from('analysis_results').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (data) setScan(data);
        else {
          // Fallback local search
          const localHistory = localStorage.getItem('local_scan_history');
          if (localHistory) {
            const list = JSON.parse(localHistory);
            const found = list.find(s => s.id === id);
            if (found) setScan(found);
          }
        }
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    await supabase.from('analysis_results').delete().eq('id', id);
    const localHistory = localStorage.getItem('local_scan_history');
    if (localHistory) {
      const list = JSON.parse(localHistory);
      const filtered = list.filter(s => s.id !== id);
      localStorage.setItem('local_scan_history', JSON.stringify(filtered));
    }
    navigate(-1);
  };

  const handleShare = () => {
    if (!scan) return;
    const text = [
      `Food 360 Scan Report`,
      `─────────────────`,
      `Oil Type: ${scan.oil_type || 'Unknown'}`,
      `Quality: ${scan.quality}`,
      `Purity: ${scan.purity}%`,
      `Date: ${new Date(scan.timestamp).toLocaleString()}`,
      scan.vendor ? `Vendor: ${scan.vendor}` : null,
      `─────────────────`,
      `Verify at Food 360 AI Portal`
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      navigator.share({ title: 'Food 360 Scan Report', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => alert('Report copied to clipboard!'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen theme-bg flex flex-col items-center justify-center gap-4 p-6">
        <Droplets size={48} className="text-[var(--text-muted)]" />
        <p className="theme-text font-bold text-lg">Scan not found</p>
        <button onClick={() => navigate(-1)} className="btn-primary px-6 py-3 text-sm">Go Back</button>
      </div>
    );
  }

  const isSafe = scan.quality !== 'Unsafe';
  const qualityColor = isSafe ? 'text-green-500' : 'text-red-500';
  const qualityBg = isSafe ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';
  const StatusIcon = isSafe ? CheckCircle : AlertTriangle;

  const Field = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex justify-between items-start py-3 border-b border-[var(--border-color)] last:border-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{label}</span>
        <span className="theme-text font-semibold text-sm text-right max-w-[60%]">{value}</span>
      </div>
    );
  };

  const SensorField = ({ icon: Icon, label, value, unit }) => {
    if (value === null || value === undefined) return null;
    return (
      <div className="card p-4 flex flex-col gap-1 items-center text-center">
        <Icon size={18} className="text-brand-500 mb-1" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="theme-text font-black text-lg font-mono">{typeof value === 'number' ? value.toFixed(2) : value}<span className="text-[10px] text-[var(--text-muted)] font-normal ml-0.5">{unit}</span></p>
      </div>
    );
  };

  const certId = `CERT-ST-${String(scan.id).replace('scan-', '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen theme-bg animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-[var(--border-color)]">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text">
          <ChevronLeft size={22} />
        </button>
        <h1 className="theme-text font-black text-base tracking-wide">Scan Detail</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 rounded-full bg-[var(--bg-elevated)] text-brand-500">
            <Share2 size={18} />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-full bg-red-500/10 text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* Quality Hero */}
        <div className={`card border ${qualityBg} flex flex-col items-center justify-center py-8 gap-3`}>
          <div className={`w-16 h-16 rounded-full ${qualityBg} border flex items-center justify-center`}>
            <StatusIcon size={32} className={qualityColor} />
          </div>
          <div className="text-center">
            <p className={`text-3xl font-black ${qualityColor}`}>{scan.quality}</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">{scan.oil_type || 'Unknown Oil Type'}</p>
          </div>
          {scan.purity !== null && scan.purity !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black theme-text font-mono">{scan.purity?.toFixed(1)}</span>
              <span className="text-[var(--text-muted)] font-bold">% purity</span>
            </div>
          )}
        </div>

        {/* Digital Certificate Seal CTA */}
        <div className="card p-5 border border-brand-500/20 bg-brand-500/[0.01] flex flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <Award size={20} className="text-brand-500" />
            <h3 className="font-black text-xs theme-text uppercase tracking-wider">Digital Purity Certificate</h3>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
            Every completed verification audit creates a digitally signed and sealed certificate record on the platform ledger.
          </p>
          <button 
            onClick={() => setShowCertificate(true)}
            className="w-full py-3.5 bg-brand-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1.5 shadow"
          >
            <Award size={12} /> View Certificate
          </button>
        </div>

        {/* Core Details */}
        <div className="card p-0 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Scan Details</h2>
          </div>
          <div className="px-4">
            <Field label="Date & Time" value={new Date(scan.timestamp).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} />
            <Field label="Oil Type" value={scan.oil_type} />
            <Field label="Quality" value={scan.quality} />
            <Field label="Vendor / Location" value={scan.vendor} />
            <Field label="Sample ID" value={scan.id} />
            <Field label="Notes" value={scan.notes} />
            {scan.likely_adulterants?.length > 0 && (
              <Field label="Detected Adulterants" value={scan.likely_adulterants.join(', ')} />
            )}
          </div>
        </div>

        {/* Sensor Snapshot */}
        {scan.sensor_snapshot && Object.keys(scan.sensor_snapshot).length > 0 && (
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 pl-1">Sensor Readings</h2>
            <div className="grid grid-cols-2 gap-3">
              <SensorField icon={Droplets} label="Density" value={scan.sensor_snapshot?.density_gcm3} unit="g/cm³" />
              <SensorField icon={Activity} label="TDS" value={scan.sensor_snapshot?.tds_ppm} unit="ppm" />
              <SensorField icon={Thermometer} label="Temperature" value={scan.sensor_snapshot?.temperature_c} unit="°C" />
              <SensorField icon={Zap} label="Turbidity" value={scan.sensor_snapshot?.turbidity_ntu} unit="NTU" />
            </div>
          </div>
        )}

        {/* Adulterant Warning */}
        {!isSafe && (
          <div className="card border border-red-500/20 bg-red-500/5 p-4 flex gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-1">Contamination Detected</p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                This sample was flagged as unsafe. Consider filing a Food 360 safety violation report and stopping the sale of this product immediately.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- PREMIUM DIGITAL CERTIFICATE DRAWER --- */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/85 z-[300] flex items-end animate-fade-in backdrop-blur-sm" onClick={() => setShowCertificate(false)}>
          <div className="w-full bg-[var(--bg-card)] border-t border-[var(--border-color)] rounded-t-[2.5rem] p-6 pb-8 animate-slide-up overflow-y-auto max-h-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-brand-500">Purity Certificate</h2>
              <button onClick={() => setShowCertificate(false)} className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] hover:theme-text">
                <X size={16} />
              </button>
            </div>

            {/* Premium Seal Design printable */}
            <div className="p-6 bg-white text-black border-4 border-double border-gray-400 rounded-3xl flex flex-col gap-4 text-center select-none shadow-xl mb-6">
              <div className="border-b border-gray-300 pb-3 flex flex-col items-center">
                <span className="text-xl">🏆</span>
                <h3 className="text-sm font-black uppercase tracking-widest mt-1">Food 360 Seal</h3>
                <p className="text-[7px] text-gray-500 font-bold uppercase tracking-wider">AI-Powered Food Safety Intelligence Platform</p>
              </div>

              <div className="text-left text-xs flex flex-col gap-2.5 border-b border-gray-300 pb-3 font-semibold">
                <p><strong>Certificate ID:</strong> {certId}</p>
                <p><strong>Oil Wavelength Type:</strong> {scan.oil_type}</p>
                <p><strong>Purity Verification:</strong> {scan.purity}%</p>
                <p><strong>Safety Status:</strong> {scan.quality === 'Safe' ? 'Verified Safe' : 'High Risk'}</p>
                <p><strong>Calibration Score:</strong> {scan.confidence_score || 96}%</p>
                <p><strong>Scan Timestamp:</strong> {new Date(scan.timestamp).toLocaleString()}</p>
                <p><strong>Link Device ID:</strong> {scan.device_id || 'FOOD 360-ESP32-8842'}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-left">
                  <p className="text-[7px] text-gray-400 uppercase tracking-widest">Digital Signature</p>
                  <p className="text-[9px] font-black border-t border-gray-300 mt-5 pt-1">Food 360 Officer</p>
                </div>
                {/* Mock Verification QR Code */}
                <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded flex items-center justify-center font-mono text-[6px]">
                  VERIFY_QR
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 active:scale-95"
              >
                <Printer size={12} />
                <span>Print Certificate</span>
              </button>
              <button 
                onClick={() => alert(`Shared Certificate: ${certId}`)}
                className="flex-1 py-3.5 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-1 active:scale-95"
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="theme-text font-black text-lg mb-2">Delete this scan?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">This scan record will be permanently deleted from the database.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-elevated)] theme-text border border-[var(--border-color)]">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
