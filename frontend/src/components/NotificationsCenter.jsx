import { X, AlertTriangle, ShieldAlert, BellRing, Info, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationsCenter({ onClose }) {
  const { t } = useTranslation();

  // Simulated notifications
  const notifications = [
    {
      id: 1,
      type: 'critical',
      title: 'FSSAI Regional Alert',
      message: 'High incidence of Argemone Oil adulteration detected in Mustard Oil batches in your region. Test your stock immediately.',
      date: '2 hours ago',
      icon: ShieldAlert,
      link: 'https://fssai.gov.in/notifications'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Recent Scan Flagged',
      message: 'Your last test on "Mustard Oil" showed 42% deviation (Moderate Risk). We recommend discontinuing use.',
      date: '1 day ago',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'info',
      title: 'Device Maintenance',
      message: 'Your ESP32 sensor lens was last cleaned 30 days ago. Wipe with isopropyl alcohol for maximum accuracy.',
      date: '3 days ago',
      icon: BellRing
    },
    {
      id: 4,
      type: 'update',
      title: 'New Oil Baseline Available',
      message: 'The central database updated the natural density range for Olive Oil (Extra Virgin).',
      date: '1 week ago',
      icon: Info
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex animate-fade-in sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Drawer (Mobile) / Modal (Desktop) */}
      <div className="absolute bottom-0 left-0 right-0 sm:relative sm:w-full sm:max-w-md sm:h-[80vh] sm:rounded-3xl bg-[var(--bg-page)] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-[var(--border-color)] flex flex-col max-h-[85vh] animate-slide-up pb-safe z-10">
        
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[var(--border-color)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-xl font-bold theme-text flex items-center gap-2">
              <BellRing className="text-[#d4af37]" size={20} />
              Notifications
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 uppercase tracking-widest font-bold">
              {notifications.length} Unread Alerts
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-[var(--bg-elevated)] rounded-full text-[var(--text-muted)] hover:text-[#d4af37] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            const isCrit = notif.type === 'critical';
            const isWarn = notif.type === 'warning';
            
            return (
              <div 
                key={notif.id} 
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border transition-colors cursor-pointer group ${
                  isCrit ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' : 
                  isWarn ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' : 
                  'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-[#d4af37]/50'
                }`}
              >
                {/* Unread indicator text */}
                <span className="absolute top-4 right-4 text-[9px] text-[var(--text-muted)] font-medium">
                  {notif.date}
                </span>

                <div className="flex items-start gap-3 mt-1">
                  <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${
                    isCrit ? 'bg-red-500/20 text-red-500' :
                    isWarn ? 'bg-amber-500/20 text-amber-500' :
                    'bg-[#d4af37]/20 text-[#d4af37]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 pr-10">
                    <h4 className={`text-sm font-black mb-1 leading-tight ${
                      isCrit ? 'text-red-500' :
                      isWarn ? 'text-amber-500' :
                      'theme-text'
                    }`}>{notif.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {notif.message}
                    </p>
                    
                    {notif.link && (
                      <a 
                        href={notif.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:text-[#f5c842]"
                      >
                        <ExternalLink size={12} /> Read Official Notice
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] text-center">
          <button 
            onClick={onClose}
            className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] hover:text-[#d4af37] transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
}
