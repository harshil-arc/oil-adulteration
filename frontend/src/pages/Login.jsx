import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Droplets, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogle, session } = useApp();
  
  const fromPath = location.state?.from?.pathname || '/home';
  const fromSearch = location.state?.from?.search || '';
  const redirectUrl = fromPath + fromSearch;
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (session) navigate(redirectUrl);
  }, [session, navigate, redirectUrl]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await login(email, password);
    
    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      navigate(redirectUrl);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const { error } = await signup(email, password, fullName);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Account created! PLEASE CHECK YOUR EMAIL to verify your account before logging in (or disable 'Confirm email' in Supabase Settings).");
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const { error } = await loginWithGoogle();
    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col pt-safe relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#d4af37] opacity-10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-12 pb-8 z-10 animate-slide-up">
        <div className="w-16 h-16 bg-gradient-to-br from-[#f5c842] to-[#d4af37] text-[#0a0a0a] rounded-2xl flex items-center justify-center shadow-glow-gold mb-4 rotate-12">
          <Droplets size={32} fill="currentColor" strokeWidth={1} className="-rotate-12" />
        </div>
        <h1 className="text-3xl font-black tracking-tight theme-text">Pure<span className="text-[#d4af37]">Oil</span></h1>
      </div>

      {/* Main Card */}
      <div className="flex-1 card rounded-t-[2.5rem] rounded-b-none border-t border-[#d4af37]/20 border-l-0 border-r-0 border-b-0 px-6 py-8 flex flex-col z-10">
        
        {/* Tabs */}
        <div className="flex w-full border-b border-[var(--border-color)] mb-8 relative">
          <button 
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'login' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setActiveTab('signup')}
            className={`flex-1 pb-4 text-sm font-bold tracking-widest uppercase transition-colors ${activeTab === 'signup' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Sign Up
          </button>
          {/* Active Indicator */}
          <div 
            className={`absolute bottom-0 h-0.5 bg-[#d4af37] w-1/2 transition-transform duration-300 ease-out shadow-glow-gold ${activeTab === 'login' ? 'translate-x-0' : 'translate-x-full'}`}
          />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col pt-2 w-full">
          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-3 text-red-500 animate-slide-up">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-tight">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-500/10 border border-green-500/50 rounded-xl p-3 flex items-start gap-3 text-green-500 animate-slide-up">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-tight">{successMsg}</p>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 animate-fade-in w-full">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-4 pl-12 pr-4 outline-none transition-colors disabled:opacity-50"
                />
              </div>

              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-4 pl-12 pr-12 outline-none transition-colors disabled:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-[#d4af37] text-sm font-semibold hover:text-[#f5c842] transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-4 disabled:opacity-70 flex justify-center items-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'LOGIN'}
              </button>

              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>

              <button type="button" onClick={handleGoogleAuth} disabled={isLoading} className="w-full btn-secondary theme-text border-[var(--border-color)] hover:bg-[var(--bg-elevated)] disabled:opacity-50">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4 animate-fade-in w-full">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" placeholder="Full Name" required value={fullName} onChange={e=>setFullName(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-colors text-sm disabled:opacity-50"
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" placeholder="Email Address" required value={email} onChange={e=>setEmail(e.target.value)} disabled={isLoading}
                  className="w-full bg-[#1c1c1c] border border-[#333] focus:border-[#d4af37] text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-colors text-sm disabled:opacity-50"
                />
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" placeholder="Phone Number" required value={phone} onChange={e=>setPhone(e.target.value)} disabled={isLoading}
                  className="w-full bg-[#1c1c1c] border border-[#333] focus:border-[#d4af37] text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-colors text-sm disabled:opacity-50"
                />
              </div>

              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} placeholder="Password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-3.5 pl-11 pr-11 outline-none transition-colors text-sm disabled:opacity-50"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative mb-2">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" placeholder="Confirm Password" required minLength={6} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} disabled={isLoading}
                  className="w-full bg-[#1c1c1c] border border-[#333] focus:border-[#d4af37] text-white rounded-2xl py-3.5 pl-11 pr-4 outline-none transition-colors text-sm disabled:opacity-50"
                />
              </div>

              <label className="flex items-start gap-3 my-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" className="peer sr-only" required />
                  <div className="w-5 h-5 rounded border-2 border-[#333] peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] transition-all flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#0a0a0a] scale-0 peer-checked:scale-100 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                <span className="text-xs text-gray-400 leading-tight">
                  I agree to the <span className="text-[#d4af37]">Terms & Conditions</span> and <span className="text-[#d4af37]">Privacy Policy</span>
                </span>
              </label>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2 flex justify-center items-center gap-2 disabled:opacity-70">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
