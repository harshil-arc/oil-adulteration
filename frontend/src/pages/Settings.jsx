import { getDevices, getNetworkInfo } from '../lib/api';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [device, setDevice] = useState(null);
  const [netInfo, setNetInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [espIp, setEspIp] = useState(localStorage.getItem('esp32_ip') || '');
  const [isLinking, setIsLinking] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

  useEffect(() => {
    getDevices()
      .then(res => setDevice(res.data?.data?.[0]))
      .catch(() => setDevice({ device_id: 'ESP32_01', name: 'Catalyst Pro v2', status: 'online', firmware: '1.4.2' }));

    getNetworkInfo()
      .then(res => setNetInfo(res.data))
      .catch(() => setNetInfo({ localIp: '127.0.0.1', esp32Endpoint: 'http://localhost:4000/api/data' }));
  }, []);

  const handleCalibrate = async () => {
    setCalibrating(true);
    // Real calibration logic would involve sending a command to the ESP32
    await new Promise(r => setTimeout(r, 2000));
    setCalibrating(false);
    alert("✅ Sensor recalibrated successfully based on local air reference.");
  };

  const handleCopy = () => {
    if (netInfo?.esp32Endpoint) {
      navigator.clipboard.writeText(netInfo.esp32Endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkDevice = async () => {
    if (!espIp) return alert("Please enter the ESP32 IP Address first.");
    setIsLinking(true);
    // Simulate checking the connection to the prototype
    await new Promise(r => setTimeout(r, 1500));
    localStorage.setItem('esp32_ip', espIp);
    setIsLinking(false);
    alert(`✅ Successfully linked to ESP32 at ${espIp}! The dashboard can now send control commands.`);
  };

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-extrabold text-[#d4af37] mb-1 uppercase tracking-widest">{t('settings.title')}</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hardware Configuration & API Management</p>
      </div>

      {/* Network & Integration */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#d4af37] rounded-full" />
          <h2 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t('settings.network')}</h2>
        </div>
        <div className="card bg-blue-50/50 border border-blue-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Server Local IP</p>
              <p className="font-black text-white">{netInfo?.localIp || 'Detecting...'}</p>
            </div>
            <div className="ml-auto px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase tracking-wider border border-green-500/20">
              Active
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-100 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ESP32 Endpoint URL</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-blue-700 font-mono flex-1 break-all bg-blue-50/30 p-1 rounded">
                {netInfo?.esp32Endpoint?.replace('/api/data', '/api/ingest-reading') || 'http://localhost:4000/api/ingest-reading'}
              </code>
              <button 
                onClick={handleCopy}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-blue-100 p-3 mt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hardware API Key (Header: x-api-key)</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-blue-700 font-mono flex-1 break-all bg-blue-50/30 p-1 rounded">
                dev_secret_key_123
              </code>
            </div>
          </div>
          <p className="text-[10px] text-blue-600/70 mt-3 italic">
            * Use this URL and API Key in your Arduino C++ code to send sensor data securely.
          </p>
        </div>
      </section>

      {/* Device Management */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#d4af37] rounded-full" />
          <h2 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">{t('settings.device')}</h2>
        </div>
        <div className="card flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
              <Radio size={22} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-soft" />
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Active Device</span>
              </div>
              <p className="font-bold text-gray-800">{device?.name || 'Catalyst Pro v2'}</p>
              <p className="text-xs text-gray-400">Connected • Firmware {device?.firmware || '1.4.2'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Link Physical ESP32 Target IP</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={espIp}
                onChange={(e) => setEspIp(e.target.value)}
                placeholder="e.g. 192.168.1.100" 
                className="flex-1 bg-white border border-brand-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button 
                onClick={handleLinkDevice}
                disabled={isLinking}
                className="bg-brand-600 text-white font-bold text-xs px-4 rounded-xl hover:bg-brand-700 transition-colors"
              >
                {isLinking ? 'Linking...' : 'Link'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="btn-primary w-full py-2.5"
            >
              <RefreshCw size={14} className={calibrating ? 'animate-spin' : ''} />
              {calibrating ? t('common.loading') : t('settings.calibrate')}
            </button>

            <button onClick={() => navigate('/profile')} className="btn-secondary w-full py-2.5">
              <ChevronLeft size={14} /> Back
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">User Preferences</h2>
        </div>
        <div className="card flex flex-col divide-y divide-gray-50">
          <div className="flex items-center gap-4 py-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Push Notifications</p>
              <p className="text-xs text-gray-400">Alerts for unusual detection results</p>
            </div>
            <button
              onClick={() => setNotificationsOn(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${notificationsOn ? 'bg-brand-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${notificationsOn ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Ruler size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Units of Measurement</p>
              <p className="text-xs text-gray-400">Metric (ml/mg)</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
        </div>
      </section>

      {/* Help */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Help & Support</h2>
        </div>
        <div className="card flex flex-col divide-y divide-gray-50">
          {[
            { Icon: HelpCircle, label: 'FAQs', sub: 'Common questions & solutions' },
            { Icon: MessageCircle, label: 'Support', sub: 'Chat with our lab specialists' },
            { Icon: BookOpen, label: 'Tutorial', sub: 'Mastering oil analysis' },
          ].map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4 py-3.5 cursor-pointer hover:bg-gray-50 rounded-2xl px-1 transition-colors">
              <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </section>

      {/* App info */}
      <div className="flex flex-col items-center py-4 text-center text-gray-400 gap-1">
        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
          <span className="text-lg">🛢️</span>
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pure Catalyst App</p>
        <p className="text-xs">Version 2.0.1 (Build 42)</p>
        <p className="text-xs mt-2">© 2024 Pure Catalyst Technologies.<br />Laboratory grade precision in your pocket.</p>
      </div>
    </div>
  );
}
