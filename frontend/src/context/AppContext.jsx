import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'pureoil_settings';
const PROFILE_KEY = 'pureoil_profile';

const defaultSettings = {
  notifications: true,
  language: 'English',
  connectionMethod: 'Bluetooth',
  darkMode: true,
};

const defaultProfile = {
  name: 'Inspector Admin',
  email: 'admin@pureoil.gov.in',
  phone: '+91 98765 43210',
  badgeId: 'FSSAI-2024-001',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch { return defaultSettings; }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch { return defaultProfile; }
  });

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateProfile = (data) => {
    setProfile(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ settings, updateSetting, profile, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
