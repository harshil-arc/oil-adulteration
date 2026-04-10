import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import i18n from '../i18n';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'pureoil_settings';
const PROFILE_KEY = 'pureoil_profile';

const defaultSettings = {
  notifications: true,
  language: 'en',
  connectionMethod: 'Bluetooth',
  darkMode: true,
  appPin: null, // null means no lock
  dataSharing: false,
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

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [liveData, setLiveData] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    socket.on('device_status', (data) => {
      setDeviceStatus(data.status);
    });

    socket.on('live_tensor_data', (data) => {
      setDeviceStatus('online');
      setLiveData(data);
      
      // Auto-disconnect if no data for 10s (REQR 7)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setDeviceStatus('offline');
        setLiveData(null);
      }, 10000);
    });

    return () => {
      socket.off('device_status');
      socket.off('live_tensor_data');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Supabase Auth Management
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Sync email and name from Supabase user metadata
        updateProfile({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
        });
      }
      setLoadingSession(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        updateProfile({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync Theme & Language with Root
  useEffect(() => {
    // 1. AMOLED Dark Mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f3f4f6';
    }

    // 2. Multilingual Switch
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.darkMode, settings.language]);

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

  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signup = async (email, password, fullName) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
  };

  const loginWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/home'
      }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ 
      settings, updateSetting, 
      profile, updateProfile,
      deviceStatus, liveData,
      session, user, loadingSession,
      login, signup, loginWithGoogle, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
