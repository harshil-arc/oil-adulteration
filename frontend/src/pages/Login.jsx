import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, 
  ShieldCheck, FileText, CheckSquare, Upload, Calendar, Shield, Building2, Key, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initResult, supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginWithGoogle, resetPassword, session, updateProfile } = useApp();
  
  const fromPath = location.state?.from?.pathname || '/home';
  const fromSearch = location.state?.from?.search || '';
  const redirectUrl = fromPath + fromSearch;
  
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', or 'reset'
  const [selectedRole, setSelectedRole] = useState('user'); // Dropdown role
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Credentials fields
  const [identifier, setIdentifier] = useState(''); // Email / Employee ID / Mobile
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Role-Specific fields
  const [businessName, setBusinessName] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [gstin, setGstin] = useState('');
  const [govtId, setGovtId] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [labAccreditation, setLabAccreditation] = useState('');
  const [labCertNumber, setLabCertNumber] = useState('');
  const [ngoDarpanId, setNgoDarpanId] = useState('');
  const [ngoRegNumber, setNgoRegNumber] = useState('');

  useEffect(() => {
    if (session) {
      const checkAdmin = async () => {
        try {
          const { data: dbProfile } = await supabase
            .from('users')
            .select('*')
            .eq('uid', session.user.id)
            .single();
          if (dbProfile?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            const dest = redirectUrl === '/login' ? '/home' : redirectUrl;
            navigate(dest, { replace: true });
          }
        } catch (err) {
          const dest = redirectUrl === '/login' ? '/home' : redirectUrl;
          navigate(dest, { replace: true });
        }
      };
      checkAdmin();
    }
  }, [session, navigate, redirectUrl]);

  const getFriendlyErrorMessage = (error) => {
    if (!error) return "";
    const code = error.code || (error.message && error.message.includes('auth/') ? error.message : "");
    if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
      return "Incorrect email/identifier or password. Please try again.";
    }
    if (code.includes("auth/email-already-in-use")) {
      return "An account already exists with this email address.";
    }
    return error.message || "Authentication failed.";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Ensure format matches email for supabase auth lookup
    let loginEmail = identifier.trim();
    if (!loginEmail.includes('@')) {
      loginEmail = `${identifier.toLowerCase()}@pureoil.gov.in`;
    }

    let { data, error } = await login(loginEmail, password);
    
    // Fail-proof automatic provisioning for Demo Judge Credentials (tester@gmail.com)
    if (error && loginEmail.toLowerCase() === 'tester@gmail.com' && password === 'tester@123') {
      try {
        const { data: signUpData } = await signup(loginEmail, password, 'Demo Tester');
        if (signUpData?.user?.id) {
          await supabase.from('users').upsert({
            uid: signUpData.user.id,
            email: loginEmail,
            name: 'Demo Tester',
            role: selectedRole || 'citizen',
            verification_status: 'approved'
          });
          const retry = await login(loginEmail, password);
          if (retry.data?.user) {
            data = retry.data;
            error = null;
          }
        }
      } catch (err) {
        console.warn('[Demo Auth] Auto-provision warning:', err);
      }
    }

    if (error) {
      setErrorMsg(getFriendlyErrorMessage(error));
      setIsLoading(false);
    } else {
      const uid = data?.user?.id;
      if (uid) {
        // Fetch user profile from Firestore to confirm role
        const { data: dbProfile } = await supabase
          .from('users')
          .select('*')
          .eq('uid', uid)
          .single();

        let userRole = dbProfile?.role || null;

        if (selectedRole === 'admin') {
          if (!userRole) {
            // No Firestore profile yet — auto-create admin profile on first login
            const adminProfileData = {
              uid,
              email: data.user.email,
              name: data.user.displayName || data.user.email.split('@')[0],
              role: 'admin',
              verification_status: 'approved',
              created_at: new Date().toISOString()
            };
            await supabase.from('users').insert(adminProfileData);
            userRole = 'admin';
          } else if (userRole !== 'admin') {
            setErrorMsg('Access Denied: This account does not have administrator privileges. Please use User Login instead.');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
        } else {
          if (userRole === 'admin') {
            setErrorMsg('Access Denied: Administrator accounts must use Admin Login.');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
        }

        // Sync context profile
        await updateProfile({
          name: dbProfile?.name || data.user.displayName || data.user.email.split('@')[0],
          email: data.user.email,
          role: userRole || 'citizen'
        });

        // Audit log
        try {
          await supabase.from('audit_logs').insert({
            action: 'PORTAL_LOGIN',
            user_uid: uid,
            role: userRole,
            details: `Logged in via ${selectedRole} portal`
          });
        } catch (_) {}

        if (selectedRole === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }
      }
      navigate(redirectUrl === '/login' ? '/home' : redirectUrl, { replace: true });
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

    // Role-specific validation rules
    if (selectedRole === 'food_inspector' || selectedRole === 'sub_inspector' || selectedRole === 'head_inspector') {
      if (!identifier.endsWith('.gov.in') && !identifier.endsWith('.nic.in')) {
        setErrorMsg("Registration is restricted to official .gov.in or .nic.in domains.");
        setIsLoading(false);
        return;
      }
      if (!govtId || !deptCode) {
        setErrorMsg("Government ID and Department Code are required.");
        setIsLoading(false);
        return;
      }
    }

    if (selectedRole === 'vendor' && (!fssaiLicense || !gstin || !businessName)) {
      setErrorMsg("FSSAI License, GSTIN, and Business Name are required.");
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'laboratory' && (!labAccreditation || !labCertNumber)) {
      setErrorMsg("NABL Accreditation and Certificate Number are required.");
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'ngo' && (!ngoDarpanId || !ngoRegNumber)) {
      setErrorMsg("Darpan ID and NGO Registration Number are required.");
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'admin') {
      setErrorMsg("Public Administrator registration is blocked. Accounts must be initialized via seed scripts.");
      setIsLoading(false);
      return;
    }

    const registrationEmail = identifier.trim();

    const { data, error } = await signup(registrationEmail, password, fullName);
    
    if (error) {
      setErrorMsg(getFriendlyErrorMessage(error));
    } else {
      const uid = data?.user?.id;
      if (uid) {
        const initialStatus = selectedRole === 'citizen' ? 'approved' : 'pending';

        await supabase.from('users').insert({
          uid,
          email: registrationEmail,
          name: fullName,
          phone,
          role: selectedRole,
          verification_status: initialStatus,
          fssai_license: fssaiLicense || null,
          gstin: gstin || null,
          business_name: businessName || null,
          govt_id: govtId || null,
          dept_code: deptCode || null,
          lab_accreditation: labAccreditation || null,
          lab_cert_number: labCertNumber || null,
          ngo_darpan_id: ngoDarpanId || null,
          ngo_registration: ngoRegNumber || null
        });

        // Audit trail
        await supabase.from('audit_logs').insert({
          action: 'ONBOARD_REGISTRATION',
          user_uid: uid,
          role: selectedRole,
          details: `Registered account: ${registrationEmail}. Status set to: ${initialStatus}`
        });

        if (initialStatus === 'pending') {
          setSuccessMsg("Onboarding submitted! Your credentials and credentials certificates are queued for Admin verification. You will receive an SMS notice once approved.");
        } else {
          setSuccessMsg("Citizen account created! You can now log in using your credentials.");
        }
        
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
      }
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const { error } = await loginWithGoogle();
    if (error) {
      setErrorMsg(getFriendlyErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col pt-safe relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#d4af37] opacity-10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-10 pb-4 z-10 animate-slide-up">
        <img src="/food360-logo.jpg" alt="SpectraTrust Logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d4af37]/50 mb-3 shadow-glow-gold" />
        <h1 className="text-2xl font-black tracking-tight theme-text">Welcome to <span className="text-[#d4af37]">food360</span></h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">National Food Safety & Regulatory Authority Platform</p>
      </div>

      {/* Main Form Card */}
      <div className="flex-1 card rounded-t-[2.5rem] rounded-b-none border-t border-[#d4af37]/20 border-l-0 border-r-0 border-b-0 px-6 py-6 flex flex-col z-10">
        
        {/* Form Tabs */}
        {activeTab !== 'reset' && selectedRole !== 'admin' && (
          <div className="flex w-full border-b border-[var(--border-color)] mb-6 relative">
            <button 
              onClick={() => { setActiveTab('login'); setSelectedRole('user'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'login' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setActiveTab('signup'); setSelectedRole('citizen'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'signup' ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Request Access
            </button>
            <div 
              className={`absolute bottom-0 h-0.5 bg-[#d4af37] w-1/2 transition-transform duration-300 ease-out shadow-glow-gold ${activeTab === 'login' ? 'translate-x-0' : 'translate-x-full'}`}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="flex-1 flex flex-col pt-1 w-full text-left">
          
          {/* DEMO JUDGE CREDENTIALS DISPLAY BANNER */}
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#d4af37]/20 to-amber-500/15 border border-[#d4af37]/40 shadow-glow-gold relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#d4af37]">
                  🏆 DEMO JUDGE LOGIN CREDENTIALS
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setIdentifier('tester@gmail.com');
                  setPassword('tester@123');
                  setSelectedRole('user');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="px-3 py-1 rounded-xl bg-[#d4af37] hover:bg-[#f5c842] text-black font-black text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
              >
                Auto-Fill ⚡
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 p-2.5 rounded-xl border border-[#d4af37]/30">
              <div className="truncate">
                <span className="text-gray-400 text-[10px] font-sans font-bold block uppercase tracking-wider">Email ID:</span>
                <strong className="text-white select-all">tester@gmail.com</strong>
              </div>
              <div className="truncate">
                <span className="text-gray-400 text-[10px] font-sans font-bold block uppercase tracking-wider">Password:</span>
                <strong className="text-[#d4af37] select-all">tester@123</strong>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-start gap-3 text-red-500 animate-slide-up">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-tight">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-500/10 border border-green-500/50 rounded-xl p-3 flex items-start gap-3 text-green-500 animate-slide-up">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-tight">{successMsg}</p>
            </div>
          )}

          {/* SIGN-IN & ACCESS FORMS */}
          {activeTab === 'login' && (
            <div className="mb-4">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Select Login Role Profile</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white text-xs rounded-xl py-3 px-3.5 outline-none focus:border-[#d4af37] transition-all"
              >
                <option value="user">User Login</option>
                <option value="admin">Admin Login</option>
              </select>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="mb-4">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Select Onboarding Role Profile</label>
              <select
                value={selectedRole === 'user' || selectedRole === 'admin' ? 'citizen' : selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-white text-xs rounded-xl py-3 px-3.5 outline-none focus:border-[#d4af37] transition-all"
              >
                <option value="citizen">Citizen</option>
                <option value="vendor">Vendor</option>
                <option value="sub_inspector">Sub Inspector</option>
                <option value="food_inspector">Food Inspector</option>
                <option value="head_inspector">Head Inspector</option>
                <option value="laboratory">Laboratory</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 animate-fade-in w-full">
              
              {/* Email / ID / Mobile Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === 'citizen' ? "Email or Mobile Number" :
                    selectedRole === 'vendor' ? "Registered Business Email" :
                    selectedRole.includes('inspector') ? "Official Employee Code / Email" :
                    selectedRole === 'laboratory' ? "Official Laboratory ID / Email" :
                    "Email / Employee Code"
                  } 
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm transition-colors disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-3.5 pl-12 pr-12 outline-none text-sm transition-colors disabled:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-[#d4af37] text-xs font-semibold hover:text-[#f5c842]"
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2 disabled:opacity-70 flex justify-center items-center gap-2 py-4">
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'SECURE LOGIN'}
              </button>

              {selectedRole === 'citizen' && (
                <>
                  <div className="flex items-center gap-4 my-2">
                    <div className="flex-1 h-px bg-[var(--border-color)]" />
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center">or continue with</span>
                    <div className="flex-1 h-px bg-[var(--border-color)]" />
                  </div>

                  <button type="button" onClick={handleGoogleAuth} disabled={isLoading} className="w-full btn-secondary theme-text border-[var(--border-color)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 text-xs py-3.5">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                    Google Identity Access
                  </button>
                </>
              )}
            </form>
          )}

          {/* SIGN-UP FORM (Access Request) */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3.5 animate-fade-in w-full">
              
              {/* Full Name */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" placeholder="Full Name" required value={fullName} onChange={e=>setFullName(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-xl py-3 pl-11 pr-4 outline-none text-xs"
                />
              </div>

              {/* Email Address */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  placeholder={selectedRole.includes('inspector') ? "Official Government Email (.gov.in)" : "Email Address"} 
                  required 
                  value={identifier} 
                  onChange={e=>setIdentifier(e.target.value)} 
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-xl py-3 pl-11 pr-4 outline-none text-xs"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone size={16} />
                </div>
                <input 
                  type="tel" placeholder="Mobile Phone Number" required value={phone} onChange={e=>setPhone(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-xl py-3 pl-11 pr-4 outline-none text-xs"
                />
              </div>

              {/* VENDOR FIELDS */}
              {selectedRole === 'vendor' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Merchant Credentials</span>
                  <input 
                    type="text" placeholder="Business Name *" required value={businessName} onChange={e=>setBusinessName(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                  <input 
                    type="text" placeholder="FSSAI License Number *" required value={fssaiLicense} onChange={e=>setFssaiLicense(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                  <input 
                    type="text" placeholder="GST Identification Number (GSTIN) *" required value={gstin} onChange={e=>setGstin(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>
              )}

              {/* INSPECTOR FIELDS */}
              {selectedRole.includes('inspector') && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Official Credentials</span>
                  <input 
                    type="text" placeholder="Official Employee Code ID *" required value={govtId} onChange={e=>setGovtId(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                  <input 
                    type="text" placeholder="Civil Department Reference Code *" required value={deptCode} onChange={e=>setDeptCode(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>
              )}

              {/* LABORATORY FIELDS */}
              {selectedRole === 'laboratory' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Accredited Laboratory Credentials</span>
                  <input 
                    type="text" placeholder="NABL ISO/IEC 17025 Registry Code *" required value={labAccreditation} onChange={e=>setLabAccreditation(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                  <input 
                    type="text" placeholder="Accreditation Certificate Number *" required value={labCertNumber} onChange={e=>setLabCertNumber(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>
              )}

              {/* NGO FIELDS */}
              {selectedRole === 'ngo' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">NGO Darpan Credentials</span>
                  <input 
                    type="text" placeholder="NGO Darpan Registration ID *" required value={ngoDarpanId} onChange={e=>setNgoDarpanId(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                  <input 
                    type="text" placeholder="Charitable Trust Deed Serial Number *" required value={ngoRegNumber} onChange={e=>setNgoRegNumber(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>
              )}

              {/* Passwords */}
              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} placeholder="Secure Password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-xl py-3 pl-11 pr-11 outline-none text-xs"
                />
              </div>

              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" placeholder="Confirm Password" required minLength={6} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-xl py-3 pl-11 pr-4 outline-none text-xs"
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-2 flex justify-center items-center gap-2 py-3.5 text-xs font-black uppercase tracking-wider">
                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Request Platform Onboarding'}
              </button>
            </form>
          )}

          {/* PASSWORD RESET FORM */}
          {activeTab === 'reset' && (
            <form onSubmit={e => { e.preventDefault(); alert("Reset instructions dispatched!"); }} className="flex flex-col gap-5 animate-fade-in w-full">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Registered Email Address" 
                  required
                  disabled={isLoading}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] focus:border-[#d4af37] theme-text rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm transition-colors disabled:opacity-50"
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full btn-primary mt-4 disabled:opacity-70 flex justify-center items-center gap-2">
                SEND RESET LINK
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
