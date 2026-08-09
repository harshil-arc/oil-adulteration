import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Download, X, Award, CheckCircle2, Zap, Tag, Thermometer, Activity, MapPin, Clock, Printer, FileText, Image as ImageIcon } from 'lucide-react';
import { saveCertificateToFirebase } from '../lib/firestoreSensorService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CertificateModal({ isOpen, onClose, scanData }) {
  const certRef = useRef(null);
  const [tokenNumber, setTokenNumber] = useState('');
  const [isSavedToFirebase, setIsSavedToFirebase] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');

  useEffect(() => {
    if (isOpen && scanData) {
      // Auto-generate Token Number if not present
      const generatedToken = scanData.tokenNumber || `TK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setTokenNumber(generatedToken);

      const purity = scanData.result?.purityPercentage ?? 92.5;
      const isPure = purity >= 80;

      const certPayload = {
        tokenNumber: generatedToken,
        oilName: scanData.selectedOil?.oilName || 'Mustard Oil',
        purityPercentage: Number(purity.toFixed(1)),
        quality: isPure ? 'Safe' : 'Unsafe',
        reportNo: scanData.reportNo || `STR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        deviceId: scanData.deviceId || 'ESP32-SPECTRA-01',
        temperature: scanData.sensorData?.temp || 28.4,
        spectralReading: scanData.result?.primaryIndicator || '680nm / 0.42 Abs',
        timestamp: scanData.timestamp || new Date().toISOString(),
        location: scanData.location || 'Gujarat Inspection Hub'
      };

      // Save to Firebase RTDB & Firestore database automatically
      saveCertificateToFirebase(certPayload).then(() => {
        setIsSavedToFirebase(true);
      }).catch(err => {
        console.warn('Firebase cert auto-save fallback:', err);
      });
    }
  }, [isOpen, scanData]);

  if (!isOpen || !scanData) return null;

  const {
    selectedOil = { oilName: 'Mustard Oil' },
    result = { purityPercentage: 92.5, adulterationPercentage: 7.5, confidenceScore: 95.8, tier: 'pure', primaryIndicator: '680nm / 0.42 Abs' },
    sensorData = { ch610: 420, ch680: 310, ch730: 890, ch810: 950, ch860: 920, ch940: 870, temp: 28.4 },
    reportNo = `STR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    deviceId = 'ESP32-SPECTRA-01',
    timestamp = '9 Aug 2026, 11:55 pm',
    location = 'Gujarat Inspection Hub'
  } = scanData;

  const purityVal = scanData.result?.purityPercentage ?? 92.5;
  const isPure = purityVal >= 80;

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    setDownloadFormat('pdf');
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#faf8ff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${tokenNumber}.pdf`);
    } catch (e) {
      console.error('PDF generation failed, launching print fallback:', e);
      window.print();
    } finally {
      setIsDownloading(false);
      setDownloadFormat('');
    }
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    setDownloadFormat('png');
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#faf8ff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Certificate_${tokenNumber}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Image download error:', e);
    } finally {
      setIsDownloading(false);
      setDownloadFormat('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-6">
        
        {/* Modal Top Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-900 text-white gap-2">
          <div className="flex items-center gap-2">
            <Award className="text-[#004ac6]" size={20} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block leading-tight">Digital Purity Certificate</span>
              <span className="text-[10px] text-gray-400 font-mono">Token: {tokenNumber}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {isSavedToFirebase && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} /> Saved to Firebase
              </span>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-[#004ac6] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Download PDF document"
            >
              <FileText size={14} /> {isDownloading && downloadFormat === 'pdf' ? 'Creating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 hover:bg-gray-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Download PNG Image"
            >
              <ImageIcon size={14} /> {isDownloading && downloadFormat === 'png' ? 'Creating PNG...' : 'Download PNG'}
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Print Certificate"
            >
              <Printer size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DIGITAL CERTIFICATE TEMPLATE (MATCHING screen.png & code.html) */}
        <div 
          ref={certRef} 
          className="p-6 sm:p-12 bg-[#faf8ff] text-[#131b2e] relative font-sans"
          style={{
            backgroundImage: 'radial-gradient(#c3c6d7 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Main White Card Container */}
          <div className="max-w-3xl mx-auto bg-white border border-[#c3c6d7] shadow-sm relative p-6 sm:p-12 rounded-lg">
            
            {/* Watermark / Seal Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
              <ShieldCheck size={380} className="text-[#004ac6]" />
            </div>

            {/* Top Category Label */}
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#004ac6]">
                SPECTRAL OIL ANALYSIS
              </span>
            </div>

            {/* Certificate Header */}
            <div className="text-left mb-8 border-b-2 border-[#131b2e] pb-6 relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight uppercase mb-1">
                CERTIFICATE OF SPECTRAL ANALYSIS
              </h1>
              <p className="font-mono text-xs text-[#434655]">
                Official Record of Spectral Testing Protocol
              </p>
            </div>

            {/* Overall Status Highlight Box */}
            <div className="mb-8 bg-[#f2f3ff] border border-[#004ac6] p-6 rounded-md relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[11px] font-bold text-[#004ac6] uppercase mb-1">Primary Assessment</p>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#131b2e] uppercase">OIL PURITY STATUS</h3>
              </div>
              <div className="w-full md:w-auto flex-1 md:flex-none border-b-2 border-[#004ac6] border-dashed min-w-[220px] text-center pb-1 font-mono text-lg font-bold">
                <span className={isPure ? 'text-emerald-700 font-extrabold' : 'text-red-600 font-extrabold'}>
                  {isPure ? `PURE & SAFE (${purityVal.toFixed(1)}%)` : `ADULTERATED (${purityVal.toFixed(1)}%)`}
                </span>
              </div>
            </div>

            {/* Technical Data Grid */}
            <div className="mb-8 relative z-10">
              <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider border-b-2 border-[#131b2e] pb-2 mb-6">
                Technical Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-xs">
                
                {/* Spectral Reading */}
                <div className="flex items-end justify-between border-b border-[#c3c6d7] pb-2 px-1">
                  <span className="text-[#434655] font-medium flex items-center gap-2">
                    <Activity size={14} className="text-[#004ac6]" /> Spectral Reading
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[#131b2e] border-b border-dashed border-[#c3c6d7] text-right inline-block min-w-[100px]">
                      {result.primaryIndicator || '680nm / 0.42 Abs'}
                    </span>
                    <span className="font-mono text-[10px] text-[#434655]">nm/abs</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex items-end justify-between border-b border-[#c3c6d7] pb-2 px-1">
                  <span className="text-[#434655] font-medium flex items-center gap-2">
                    <Thermometer size={14} className="text-[#004ac6]" /> Temperature
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[#131b2e] border-b border-dashed border-[#c3c6d7] text-right inline-block min-w-[80px]">
                      {sensorData.temp || 28.4}
                    </span>
                    <span className="font-mono text-[10px] text-[#434655]">°C</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-end justify-between border-b border-[#c3c6d7] pb-2 px-1">
                  <span className="text-[#434655] font-medium flex items-center gap-2">
                    <Clock size={14} className="text-[#004ac6]" /> Time
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[#131b2e] border-b border-dashed border-[#c3c6d7] text-right inline-block min-w-[120px]">
                      {timestamp}
                    </span>
                    <span className="font-mono text-[10px] text-[#434655]">UTC</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-end justify-between border-b border-[#c3c6d7] pb-2 px-1">
                  <span className="text-[#434655] font-medium flex items-center gap-2">
                    <MapPin size={14} className="text-[#004ac6]" /> Location
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[#131b2e] border-b border-dashed border-[#c3c6d7] text-right inline-block min-w-[130px]">
                      {location}
                    </span>
                  </div>
                </div>

                {/* Report Token Number */}
                <div className="flex items-end justify-between border-b border-[#c3c6d7] pb-2 px-1 md:col-span-2">
                  <span className="text-[#434655] font-medium flex items-center gap-2">
                    <Tag size={14} className="text-[#004ac6]" /> Report Token Number
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-[#434655] mr-1">REF:</span>
                    <span className="font-mono font-bold text-[#004ac6] border-b border-dashed border-[#004ac6] text-right inline-block min-w-[160px]">
                      {tokenNumber}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Official Indian Flag Seal Emblem */}
            <div className="mt-12 pt-6 border-t border-[#c3c6d7] flex flex-col items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow-md flex flex-col mb-2 relative shrink-0">
                {/* Saffron */}
                <div className="h-1/3 w-full bg-[#FF9933]" />
                {/* White with Ashoka Chakra */}
                <div className="h-1/3 w-full bg-white flex items-center justify-center relative">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#000080] fill-none stroke-current stroke-[1.5]">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="7" x2="12" y2="17" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="8.46" y1="8.46" x2="15.54" y2="15.54" />
                    <line x1="8.46" y1="15.54" x2="15.54" y2="8.46" />
                  </svg>
                </div>
                {/* India Green */}
                <div className="h-1/3 w-full bg-[#138808]" />
              </div>
              <div className="text-center font-mono text-[10px] text-[#434655]">
                <p className="font-bold text-[#131b2e]">Digital Seal Authentication</p>
                <p>Verification Token: <span className="font-bold text-[#004ac6]">{tokenNumber}</span></p>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="max-w-3xl mx-auto mt-6 pt-4 border-t-2 border-[#131b2e] flex flex-col sm:flex-row justify-center sm:justify-between items-center text-[11px] text-[#434655] font-mono gap-2">
            <div className="flex items-center gap-4 mx-auto">
              <span>Verification Token: {tokenNumber}</span>
              <span>•</span>
              <span>Digital Seal Authentication</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
