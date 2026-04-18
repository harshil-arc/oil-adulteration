import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const OfflineContext = createContext();

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    // Check pending queues
    const checkQueue = () => {
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      setPendingSync(queue.length > 0);
    };
    checkQueue();

    const handleOnline = async () => {
      setIsOnline(true);
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      
      if (queue.length > 0) {
        try {
          // Trigger bulk sync
          await axios.post('http://localhost:5000/api/syncPwa', { queuedLogs: queue });
          localStorage.removeItem('offlineQueue');
          setPendingSync(false);
          console.log('[OfflineSync] Successfully pushed cached data to server.');
        } catch (error) {
          console.error('[OfflineSync] Failed to sync data', error);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to add data either directly or to cache
  const logData = async (type, payload) => {
    if (isOnline) {
      // Direct push based on type
      if (type === 'surplus') {
        await axios.post('http://localhost:5000/api/platform/surplus', payload); // Assuming this endpoint would exist in full implementation
      }
    } else {
      // Cache
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      queue.push({ type, payload, timestamp: new Date().toISOString() });
      localStorage.setItem('offlineQueue', JSON.stringify(queue));
      setPendingSync(true);
    }
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSync, logData }}>
      {children}
    </OfflineContext.Provider>
  );
};
