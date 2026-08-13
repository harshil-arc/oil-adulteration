import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function AdminProtectedRoute({ children }) {
  const { session, loadingSession } = useApp();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data: dbProfile } = await supabase
          .from('users')
          .select('*')
          .eq('uid', session.user.id)
          .single();
        if (dbProfile?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error verifying admin status:', err);
        setIsAdmin(false);
      }
    };
    checkRole();
  }, [session]);

  if (loadingSession || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#333] border-t-[#d4af37] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
