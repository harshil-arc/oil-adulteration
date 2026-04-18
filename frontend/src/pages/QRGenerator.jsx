import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Link as LinkIcon, QrCode as QrCodeIcon, Share2, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const SubScreenNav = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 p-5 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-page)]/90 backdrop-blur-md z-40">
      <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[var(--bg-elevated)] theme-text transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h1 className="theme-text font-bold tracking-widest uppercase text-sm">
        {title}
      </h1>
    </div>
  );
};

export default function QRGenerator() {
  const [productId, setProductId] = useState('BCH-9942');
  const targetUrl = 'https://spectratrust-oil-purity-finder.vercel.app';
  const qrRef = useRef();

  const handleDownload = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `PureOil-QR-${productId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const finalUrl = `${targetUrl}/scan?product_id=${productId}`;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] animate-fade-in relative z-20 pb-20">
      <SubScreenNav title="QR Code Generator" />

      <div className="p-5 flex flex-col gap-6">
        
        {/* Intro */}
        <div className="text-center py-4">
           <div className="w-16 h-16 bg-[#C8952A]/10 text-[#C8952A] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C8952A]/30">
             <QrCodeIcon size={32} />
           </div>
           <h2 className="text-xl font-black theme-text uppercase tracking-widest">Hardware Link Engine</h2>
           <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
             Generate deep-linked QR codes for physical product packaging. Scanning these will instantly launch the app's hardware scanner.
           </p>
        </div>

         {/* Input Controls */}
        <div className="card p-5 border-[var(--border-color)] bg-[var(--bg-elevated)] flex flex-col gap-4">
           
           <div>
             <label className="text-[10px] uppercase font-black tracking-widest text-[#C8952A] mb-2 block">Product / Batch ID</label>
             <div className="relative">
               <Share2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
               <input 
                 type="text" 
                 value={productId}
                 onChange={e => setProductId(e.target.value)}
                 placeholder="e.g. BCH-1234"
                 className="w-full bg-[#111] border border-[#333] rounded-xl py-3 pl-10 pr-4 text-sm text-white font-bold tracking-wider focus:border-[#C8952A] outline-none uppercase"
               />
             </div>
           </div>
        </div>

        {/* Live Preview */}
        <div className="card p-6 border-[var(--border-color)] flex flex-col items-center justify-center bg-[#111]">
           <div className="mb-6 p-4 bg-white rounded-2xl relative" ref={qrRef}>
              <QRCodeCanvas 
                value={finalUrl} 
                size={220} 
                level={"H"}
                includeMargin={true}
                imageSettings={{
                  src: "https://www.svgrepo.com/show/511116/oil.svg",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
           </div>
           <p className="text-[10px] text-gray-500 break-all text-center max-w-full px-4 mb-2 font-mono">
             {finalUrl}
           </p>
           <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest mb-6">
             <Smartphone size={14} /> iOS & Android Ready
           </div>
           
           <button onClick={handleDownload} className="w-full bg-gradient-to-r from-[#d4af37] to-[#f5c842] text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
             <Download size={18} />
             Download For Print (PNG)
           </button>
        </div>

      </div>
    </div>
  );
}
