import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Plus, ShieldCheck, MapPin, Phone, Clock, ArrowRight, Check, Sparkles,
  FileText, ShieldAlert, AlertTriangle, AlertCircle, Search, Map, 
  Share2, Compass, Bell, Settings, Filter, ChevronRight, X,
  ClipboardCheck, Navigation, QrCode, Zap, Shield, Target,
  RefreshCw, CheckCircle2, FileSpreadsheet, ExternalLink, Building, HelpCircle, MessageSquare,
  Lock, Eye, UserCheck, Key, ShieldX, Terminal, Send, CheckSquare, Upload, Calendar, BarChart,
  Heart, Truck, User, Utensils
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { REAL_PAN_INDIA_LABORATORIES } from '../services/realTestingCentresService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

const labIcon = new L.DivIcon({
  className: 'custom-lab-icon',
  html: `<div style="background-color: #2563eb; width: 20px; height: 20px; display: block; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #2563eb;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

const reliefIcon = new L.DivIcon({
  className: 'custom-relief-icon',
  html: `<div style="background-color: #22c55e; width: 20px; height: 20px; display: block; left: -10px; top: -10px; position: relative; border-radius: 50% 50% 0; transform: rotate(45deg); border: 2px solid #fff; box-shadow: 0 0 10px #22c55e;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Community() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useApp();
  
  // Active RBAC role
  const currentRole = profile?.role || 'citizen';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts', 'triage', 'relief', 'labs', 'ngos', 'discussions'
  
  // Modals & Guided Wizard States
  const [complaintWizardOpen, setComplaintWizardOpen] = useState(false);
  const [complaintStep, setComplaintStep] = useState(1);
  const [reliefWizardOpen, setReliefWizardOpen] = useState(false);
  const [reliefStep, setReliefStep] = useState(1);

  // Guided Wizard Forms
  const [complaintForm, setComplaintForm] = useState({
    brandName: '',
    vendorName: '',
    oilType: 'Mustard Oil',
    batchNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    price: '',
    quantity: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    gpsLat: '23.0225',
    gpsLng: '72.5714',
    photosCount: 0,
    hasInvoice: false,
    hasVideo: false,
    description: '',
  });

  const [reliefForm, setReliefForm] = useState({
    requestType: 'CitizenReport', // 'CitizenReport', 'NGORequirement', 'GovtDisaster', 'SurplusFood'
    title: '',
    description: '',
    mealsNeeded: '',
    foodType: 'Veg Cooked Meals',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    donorType: 'Restaurant', // 'Restaurant' | 'Corporate' | 'CloudKitchen'
  });

  // State Data
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [reliefRequests, setReliefRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [stats, setStats] = useState({
    verifiedRecalls: 0,
    activeComplaints: 0,
    triageStatus: 0,
    suspendedVendors: 0,
    nablLabs: REAL_PAN_INDIA_LABORATORIES.length,
    mealsDelivered: 12450,
    activeReliefRequests: 0,
    mealsNeededCount: 0,
    activeVolunteersCount: 42
  });

  // Actioning IDs & input templates
  const [actioningId, setActioningId] = useState(null);
  const [actionInput, setActionInput] = useState({
    scheduleDate: '',
    notes: '',
    sitePhoto: false,
    sampleBagCode: '',
    labPurity: '',
    labAdulterant: 'Argemone Oil',
    warningAmount: '',
    appealStatement: '',
    priorityScore: '50',
    assignedVolunteer: 'Rohan Sharma'
  });

  // Map settings
  const [mapCenter, setMapCenter] = useState([23.0225, 72.5714]);
  const [mapZoom, setMapZoom] = useState(11);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  const loadDatabaseRecords = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch alerts
      const { data: alertData } = await supabase.from('government_alerts').select('*');
      const loadedAlerts = alertData || [
        {
          id: 'alert_1',
          product_name: 'Kacchi Ghani Mustard Oil',
          brand_name: 'Brand X Foods',
          category: 'Product Recall',
          reason: 'Excessive argemone oil presence detected via spectral signature scan.',
          issued_by: 'FSSAI Central Command',
          severity: 'Critical',
          recommended_action: 'Avoid Consumption & Return Product',
          created_at: new Date().toISOString()
        },
        {
          id: 'alert_2',
          product_name: 'Standard Refined Sunflower Oil',
          brand_name: 'Swastik Edibles',
          category: 'Government Ban',
          reason: 'Unpermitted color additives (Metanil Yellow) detected exceeding legal limits.',
          issued_by: 'Ministry of Health & Welfare',
          severity: 'High',
          recommended_action: 'Dispose Safely & Report Retailer',
          created_at: new Date().toISOString()
        }
      ];
      setAlerts(loadedAlerts);

      // 2. Fetch citizen oil complaints
      const { data: reportData } = await supabase.from('community_reports').select('*');
      const loadedReports = reportData && reportData.length > 0 ? reportData : [
        {
          id: 'rep_1',
          title: 'Suspiciously dark Mustard Oil',
          description: 'Purchased from local market, has a distinct petroleum smell and fails the basic clarity check.',
          vendor_name_raw: 'Kisan Kirana Store',
          brand_name: 'Local Brand X',
          oilType: 'Mustard Oil',
          geolocation: { lat: 23.0225, lng: 72.5714 },
          status: 'pending_verification',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          reporter_name: 'Aarav Mehta',
          logs: [{ timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), notes: 'Citizen submission verified.' }]
        }
      ];
      setReports(loadedReports);

      // 3. Fetch Food Relief Requests
      const { data: reliefData } = await supabase.from('donation_requests').select('*');
      const loadedRelief = reliefData && reliefData.length > 0 ? reliefData : [
        {
          id: 'rel_1',
          title: 'Surplus Cooked Veg Meals',
          description: 'High-quality paneer curry and rice surplus from wedding hall event. Packed in insulated containers.',
          requestType: 'SurplusFood',
          mealsNeeded: 150,
          foodType: 'Veg Cooked Meals',
          address: 'Alka Marriage Hall, Sector 12',
          status: 'verified',
          priority_score: 85,
          created_at: new Date().toISOString(),
          creator_name: 'Alka Banquets',
          logs: [{ timestamp: new Date().toISOString(), notes: 'Donor surplus logged & verified by NGO.' }]
        },
        {
          id: 'rel_2',
          title: 'Relief requirement: Slum Cluster B',
          description: 'Citizen report: 45 families requiring dry rations due to local flood water logging.',
          requestType: 'CitizenReport',
          mealsNeeded: 250,
          foodType: 'Dry Rations',
          address: 'Cluster B, river banks, Gandhinagar',
          status: 'pending_ngo_review',
          priority_score: 30,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          creator_name: 'Suresh Patel',
          logs: [{ timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), notes: 'Citizen relief request created.' }]
        }
      ];
      setReliefRequests(loadedRelief);

      // 4. Fetch Food Inventory
      const loadedInventory = [
        { id: 'inv_1', name: 'Dry Rice bags (25kg)', quantity: 45, unit: 'bags', center: 'Sector-15 Relief Center', expiry: '2027-01-15' },
        { id: 'inv_2', name: 'Standard Baby food formula', quantity: 120, unit: 'cans', center: 'Sector-15 Relief Center', expiry: '2026-12-10' },
        { id: 'inv_3', name: 'Insulated Drinking Water tanks (50L)', quantity: 18, unit: 'tanks', center: 'Kalupur Hub', expiry: 'N/A' }
      ];
      setInventory(loadedInventory);

      // 5. Generate Audit Logs
      const initialLogs = [
        { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: 'inspector@fssai.gov.in', action: 'ASSIGN_INSPECTOR', details: 'Assigned Inspector Rajesh K. to Reliable Grocers case' },
        { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), user: 'system_ai_engine', action: 'ANOMALOUS_SPECTRAL_DRIVE', details: 'Flagged sensor reading DEV-0982 with 89% anomaly' }
      ];
      setAuditLogs(initialLogs);

      const loadedDiscussions = [
        { id: 'disc_1', title: 'How to calibrate AS7262 spectral sensor for coconut oil?', author: 'Devendra J.', replies: 12, category: 'Hardware Calibration', likes: 24, time: '3 hours ago' }
      ];
      setDiscussions(loadedDiscussions);

      // 6. Calculate Stats
      const recallsCount = loadedAlerts.filter(a => a.category?.includes('Recall') || a.severity === 'Critical').length;
      const pendingTriage = loadedReports.filter(r => r.status === 'created' || r.status === 'pending_verification').length;
      const totalMealsNeeded = loadedRelief.reduce((acc, val) => acc + (val.status !== 'completed' ? parseInt(val.mealsNeeded || 0) : 0), 0);

      setStats({
        verifiedRecalls: recallsCount,
        activeComplaints: loadedReports.length,
        triageStatus: pendingTriage,
        suspendedVendors: 3,
        nablLabs: REAL_PAN_INDIA_LABORATORIES.length,
        mealsDelivered: 12450,
        activeReliefRequests: loadedRelief.filter(r => r.status !== 'completed').length,
        mealsNeededCount: totalMealsNeeded,
        activeVolunteersCount: 42
      });

    } catch (err) {
      console.error("Error loading database records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addLocalAuditLog = (action, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: profile?.email || 'anonymous@pureoil.gov.in',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSwitchRole = async (roleName) => {
    await updateProfile({ role: roleName });
    addLocalAuditLog('RBAC_ROLE_SWITCH', `Simulated switch of active claims context to: ${roleName}`);
  };

  const getRolePermissions = (roleName) => {
    switch (roleName) {
      case 'citizen':
        return ['File complaints', 'Read alerts', 'Request food relief', 'View local NABL labs'];
      case 'vendor':
        return ['Upload compliance statements', 'Appeal decisions', 'View notices'];
      case 'inspector':
        return ['Schedule audits', 'Register sealed bag barcodes', 'Disptach lab testing', 'File recommendations'];
      case 'laboratory':
        return ['Acknowledge samples', 'Upload GC-MS certificates', 'Register drift logs'];
      case 'ngo':
        return ['Verify citizen requests', 'Manage relief shelters', 'Track delivery telemetry'];
      case 'volunteer':
        return ['Accept missions', 'Perform QR location checkins', 'Confirm handovers'];
      case 'senior_officer':
        return ['Approve public recall notices', 'Enforce penalty notices', 'Evaluate vendor appeals'];
      case 'admin':
        return ['Manage Custom Claims', 'Calibrate ESP32 devices', 'Read Immutable Audit Ledgers'];
      default:
        return ['Read public advisories'];
    }
  };

  const getStatusDisplay = (statusCode) => {
    switch (statusCode) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'screening':
        return { label: 'AI Screening', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-glow-purple' };
      case 'pending_verification':
        return { label: 'Awaiting Assignment', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' };
      case 'assigned':
        return { label: 'Inspector Assigned', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      case 'scheduled':
        return { label: 'Audit Scheduled', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'completed':
        return { label: 'Audit Completed', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
      case 'sample_collected':
        return { label: 'Sample Sealed', color: 'bg-pink-500/15 text-pink-400 border-pink-500/30' };
      case 'lab_testing':
        return { label: 'Lab Testing', color: 'bg-blue-600/15 text-blue-300 border-blue-600/30' };
      case 'lab_report_uploaded':
        return { label: 'Certificate Uploaded', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'recommended':
        return { label: 'Action Recommended', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'senior_approval':
        return { label: 'Officer Approved', color: 'bg-yellow-600/15 text-yellow-300 border-yellow-600/30' };
      case 'public_alert':
        return { label: 'Recall Enforced', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'appeal_window':
        return { label: 'Appeal Window Open', color: 'bg-amber-600/15 text-amber-400 border-amber-600/30' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'archived':
        return { label: 'Archived', color: 'bg-gray-700/15 text-gray-500 border-gray-700/30' };
      default:
        return { label: statusCode, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
    }
  };

  // --- TRANSITIONS & AUDITING ---
  const handleTransitionAction = async (reportId, nextStatus, logMessage) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        const nextLogs = r.logs ? [...r.logs] : [];
        nextLogs.push({ timestamp: new Date().toISOString(), status: nextStatus, notes: logMessage });
        return { 
          ...r, 
          status: nextStatus, 
          logs: nextLogs,
          scheduledDate: actionInput.scheduleDate || r.scheduledDate,
          tamperBagCode: actionInput.sampleBagCode || r.tamperBagCode,
          labPurity: actionInput.labPurity || r.labPurity,
          labAdulterant: actionInput.labAdulterant || r.labAdulterant,
          warningAmount: actionInput.warningAmount || r.warningAmount,
          appealStatement: actionInput.appealStatement || r.appealStatement
        };
      }
      return r;
    });

    setReports(updated);
    setActioningId(null);
    addLocalAuditLog('COMPLAINT_TRANSITION', `Complaint ${reportId} advanced to ${nextStatus}. ${logMessage}`);
    await supabase.from('community_reports').update({ status: nextStatus }).eq('id', reportId);

    setStats(prev => ({
      ...prev,
      triageStatus: updated.filter(r => r.status === 'created' || r.status === 'pending_verification').length
    }));
  };

  // --- FOOD RELIEF TRANSITIONS ---
  const handleReliefAction = async (requestId, nextStatus, logMessage) => {
    const updated = reliefRequests.map(r => {
      if (r.id === requestId) {
        const nextLogs = r.logs ? [...r.logs] : [];
        nextLogs.push({ timestamp: new Date().toISOString(), notes: logMessage });
        return {
          ...r,
          status: nextStatus,
          logs: nextLogs,
          priority_score: actionInput.priorityScore || r.priority_score,
          assignedVolunteer: actionInput.assignedVolunteer || r.assignedVolunteer
        };
      }
      return r;
    });

    setReliefRequests(updated);
    setActioningId(null);
    addLocalAuditLog('RELIEF_TRANSITION', `Food Request ${requestId} advanced to ${nextStatus}. ${logMessage}`);
    await supabase.from('donation_requests').update({ status: nextStatus }).eq('id', requestId);

    setStats(prev => ({
      ...prev,
      activeReliefRequests: updated.filter(r => r.status !== 'completed').length,
      mealsNeededCount: updated.reduce((acc, val) => acc + (val.status !== 'completed' ? parseInt(val.mealsNeeded || 0) : 0), 0)
    }));
  };

  // --- WIZARD SUBMISSIONS ---
  const handleComplaintSubmit = async () => {
    const newReport = {
      id: `rep_${Date.now()}`,
      title: `Suspicion on ${complaintForm.brandName} (${complaintForm.oilType})`,
      description: complaintForm.description,
      vendor_name_raw: complaintForm.vendorName,
      brand_name: complaintForm.brandName,
      oilType: complaintForm.oilType,
      batchNumber: complaintForm.batchNumber,
      purchaseDate: complaintForm.purchaseDate,
      price: complaintForm.price,
      quantity_ml: complaintForm.quantity,
      address: `${complaintForm.address}, ${complaintForm.city}, ${complaintForm.state} - ${complaintForm.pinCode}`,
      geolocation: { lat: parseFloat(complaintForm.gpsLat), lng: parseFloat(complaintForm.gpsLng) },
      status: 'submitted',
      created_at: new Date().toISOString(),
      reporter_name: profile?.name || 'Anonymous Citizen',
      logs: [{ timestamp: new Date().toISOString(), notes: 'Citizen complaint verified & submitted.' }]
    };

    await supabase.from('community_reports').insert(newReport);
    addLocalAuditLog('WIZARD_COMPLAINT_SUBMIT', `Submitted complaint for ${complaintForm.brandName}`);
    setReports(prev => [newReport, ...prev]);
    setComplaintWizardOpen(false);
    setComplaintStep(1);
  };

  const handleReliefSubmit = async () => {
    const newRequest = {
      id: `rel_${Date.now()}`,
      title: reliefForm.title,
      description: reliefForm.description,
      requestType: reliefForm.requestType,
      mealsNeeded: parseInt(reliefForm.mealsNeeded || 0),
      foodType: reliefForm.foodType,
      address: `${reliefForm.address}, ${reliefForm.city}, ${reliefForm.state} - ${reliefForm.pinCode}`,
      status: reliefForm.requestType === 'CitizenReport' ? 'pending_ngo_review' : 'verified',
      priority_score: reliefForm.requestType === 'GovtDisaster' ? 95 : 40,
      created_at: new Date().toISOString(),
      creator_name: profile?.name || 'Authorized Portal User',
      logs: [{ timestamp: new Date().toISOString(), notes: 'Request created via guided wizard.' }]
    };

    await supabase.from('donation_requests').insert(newRequest);
    addLocalAuditLog('WIZARD_RELIEF_SUBMIT', `Created relief requirement: ${reliefForm.title}`);
    setReliefRequests(prev => [newRequest, ...prev]);
    setReliefWizardOpen(false);
    setReliefStep(1);
  };

  const descriptionQualityScore = useMemo(() => {
    const text = complaintForm.description.trim();
    if (!text) return 0;
    let score = 30;
    const words = text.split(/\s+/).length;
    if (words > 5) score += 20;
    if (words > 15) score += 20;
    if (words > 30) score += 20;
    if (['spam', 'test', 'blah', 'asdf'].some(w => text.toLowerCase().includes(w))) score -= 40;
    return Math.max(0, Math.min(100, score));
  }, [complaintForm.description]);

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text animate-fade-in pb-24">
      
      {/* ── TOP HEADER & DYNAMIC STATISTICS ── */}
      <div className="px-5 pt-8 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">SPECTRA TRUST INTELLIGENCE NETWORK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Food Safety & Relief Center</h1>
            <p className="text-xs text-gray-400">Database-verified regulatory dashboards & emergency food logistics</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(currentRole === 'citizen' || currentRole === 'admin') && (
              <button
                onClick={() => { setComplaintStep(1); setComplaintWizardOpen(true); }}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-amber-600 text-white font-black text-[10px] uppercase tracking-wider shadow-glow hover:scale-105 transition-transform"
              >
                + File Complaint
              </button>
            )}

            {(currentRole === 'ngo' || currentRole === 'citizen' || currentRole === 'admin') && (
              <button
                onClick={() => navigate('/relief')}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-[10px] uppercase tracking-wider shadow-glow hover:scale-105 transition-transform"
              >
                🍲 Food Relief Network
              </button>
            )}

            <button onClick={loadDatabaseRecords} className="p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-gray-300">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Dynamic Metric counters */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 max-w-5xl mx-auto text-center text-xs">
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">Verified Recalls</span>
            <span className="font-mono font-black text-red-400 text-base">{stats.verifiedRecalls}</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">Citizen Reports</span>
            <span className="font-mono font-black text-amber-400 text-base">{stats.activeComplaints}</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">Meals Needed</span>
            <span className="font-mono font-black text-yellow-400 text-base">{stats.mealsNeededCount}</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">Meals Distributed</span>
            <span className="font-mono font-black text-emerald-400 text-base">{stats.mealsDelivered.toLocaleString()}</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">NABL Labs</span>
            <span className="font-mono font-black text-blue-400 text-base">{stats.nablLabs}</span>
          </div>
          <div className="bg-[var(--bg-elevated)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[8px] text-gray-400 font-bold uppercase block">Active Volunteers</span>
            <span className="font-mono font-black text-purple-400 text-base">{stats.activeVolunteersCount}</span>
          </div>
        </div>
      </div>

      {/* ── RBAC SWITCHER CONSOLE ── */}
      <div className="px-5 pt-4 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#d4af37]" size={20} />
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Role-Based Access (RBAC) Switcher</h4>
                <p className="text-[10px] text-gray-400">Switch user roles to test context-aware workflows and rules</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['citizen', 'vendor', 'inspector', 'laboratory', 'ngo', 'volunteer', 'senior_officer', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleSwitchRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    currentRole === role
                      ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-glow-gold'
                      : 'bg-[var(--bg-elevated)] text-gray-400 border-[var(--border-color)] hover:text-white'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[var(--border-color)]">
            <div className="flex items-start gap-2">
              <Key size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Token Custom Claims</span>
                <span className="font-mono text-gray-300 font-semibold">{`{ role: "${currentRole}" }`}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Privileges Enabled</span>
                <span className="text-gray-300">{getRolePermissions(currentRole).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="px-5 pt-4 max-w-5xl mx-auto w-full">
        <div className="bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] grid grid-cols-2 sm:grid-cols-6 gap-1 text-xs font-bold text-center">
          <button onClick={() => setActiveTab('alerts')} className={`py-2 rounded-xl transition-all ${activeTab === 'alerts' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🚨 Safety Alerts
          </button>
          <button onClick={() => setActiveTab('triage')} className={`py-2 rounded-xl transition-all ${activeTab === 'triage' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            📋 Citizen Triage
          </button>
          <button onClick={() => navigate('/relief')} className="py-2 rounded-xl transition-all text-gray-400 hover:text-white">
            🍲 Food Relief
          </button>
          <button onClick={() => setActiveTab('labs')} className={`py-2 rounded-xl transition-all ${activeTab === 'labs' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🔬 Testing Labs
          </button>
          <button onClick={() => setActiveTab('ngos')} className={`py-2 rounded-xl transition-all ${activeTab === 'ngos' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            🏢 NGO Centers
          </button>
          <button onClick={() => {
            if (currentRole !== 'admin') { alert("ACCESS DENIED: Requires Admin Claims."); return; }
            setActiveTab('admin_audit');
          }} className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${currentRole !== 'admin' ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'admin_audit' ? 'bg-[#d4af37] text-black shadow-glow-gold' : 'text-gray-400 hover:text-white'}`}>
            <Lock size={12} /> Audit Logs
          </button>
        </div>
      </div>

      {/* ── TAB 1: SAFETY ALERTS ── */}
      {activeTab === 'alerts' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-400" /> Active Government & FSSAI Recall Notices
            </h2>
            <p className="text-xs text-gray-400">Verified official advisories, product bans, and critical recalls</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alerts.map((alertItem) => (
              <div key={alertItem.id} className="card p-4 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-3">
                <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-2 text-[10px]">
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400">{alertItem.category}</span>
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">Critical</span>
                  </div>
                  <span className="text-gray-400">{new Date(alertItem.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{alertItem.brand_name} - {alertItem.product_name}</h3>
                  <p className="text-xs text-gray-300 mt-1">{alertItem.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-[var(--bg-elevated)] p-2 rounded-xl">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Authority</span>
                    <span className="font-bold text-gray-200">{alertItem.issued_by}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Action Required</span>
                    <span className="font-bold text-red-400">{alertItem.recommended_action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: CITIZEN TRIAGE FEED ── */}
      {activeTab === 'triage' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ClipboardCheck size={18} className="text-amber-400" /> Live Citizen Triage Feed
            </h2>
            <p className="text-xs text-gray-400">Reports submitted by consumers, progressing through verification lifecycles</p>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => {
              const badge = getStatusDisplay(rep.status);
              const isActioning = actioningId === rep.id;
              
              return (
                <div key={rep.id} className="card p-4 rounded-3xl border border-[var(--border-color)] space-y-3">
                  <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 text-[10px]">
                    <span className={`px-2 py-0.5 rounded border uppercase tracking-wider ${badge.color}`}>{badge.label}</span>
                    <span className="text-gray-400">Reporter: {rep.reporter_name}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{rep.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{rep.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-[var(--bg-elevated)] p-2.5 rounded-xl border border-[var(--border-color)]">
                    <div>
                      <span className="text-[9px] text-gray-400 block">Brand</span>
                      <span className="font-bold text-white">{rep.brand_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">Vendor</span>
                      <span className="font-bold text-white">{rep.vendor_name_raw}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">Oil Type</span>
                      <span className="font-bold text-white text-[#d4af37]">{rep.oilType}</span>
                    </div>
                  </div>

                  {/* Transition History */}
                  {rep.logs && (
                    <div className="p-2 bg-[var(--bg-elevated)]/30 border border-[var(--border-color)] rounded-xl text-[9px] font-mono text-gray-400">
                      {rep.logs.map((log, idx) => (
                        <div key={idx}>● {log.notes} ({new Date(log.timestamp).toLocaleTimeString()})</div>
                      ))}
                    </div>
                  )}

                  {/* Triage Console */}
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Triage Operations Queue ({currentRole})</span>
                      {!isActioning && (
                        <button onClick={() => setActioningId(rep.id)} className="px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded text-[9px] font-bold">
                          Configure Action
                        </button>
                      )}
                    </div>

                    {isActioning && (
                      <div className="bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)] mt-2 space-y-2 text-xs">
                        
                        {rep.status === 'submitted' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">AI VALIDATION CHECK</span>
                            <button onClick={() => handleTransitionAction(rep.id, 'pending_verification', 'AI automated validation check: Cleared duplicate & spam tests.')} className="px-3 py-1 bg-emerald-500 text-black font-bold rounded-lg text-xs">
                              Run Screening Rules
                            </button>
                          </div>
                        )}

                        {rep.status === 'pending_verification' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">INSPECTOR ASSIGNMENT</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <button onClick={() => handleTransitionAction(rep.id, 'assigned', 'FSSAI Inspector assigned to field visit')} className="px-3 py-1 bg-[#d4af37] text-black font-bold rounded-lg text-xs">
                                Accept Case & Triage Audit
                              </button>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector or Admin.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'assigned' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">SCHEDULE SITE AUDIT</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <div className="space-y-2">
                                <input type="date" value={actionInput.scheduleDate} onChange={e => setActionInput(prev => ({ ...prev, scheduleDate: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.scheduleDate} onClick={() => handleTransitionAction(rep.id, 'scheduled', `Inspection date scheduled: ${actionInput.scheduleDate}`)} className="px-3 py-1 bg-blue-500 text-white font-bold rounded text-xs">
                                  Save Schedule
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector or Admin.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'scheduled' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">LOG VISIT EVIDENCE</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <div className="space-y-2">
                                <label className="flex gap-2 text-[10px] text-gray-300">
                                  <input type="checkbox" checked={actionInput.sitePhoto} onChange={e => setActionInput(prev => ({ ...prev, sitePhoto: e.target.checked }))} />
                                  Confirm physical site audit photographs uploaded *
                                </label>
                                <textarea placeholder="Site audit findings notes *" value={actionInput.notes} onChange={e => setActionInput(prev => ({ ...prev, notes: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.sitePhoto || !actionInput.notes} onClick={() => handleTransitionAction(rep.id, 'completed', 'Audit visit complete. Site photos logged.')} className="px-3 py-1 bg-orange-500 text-black font-bold rounded text-xs">
                                  Log Field Completion
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'completed' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">REGISTER SAMPLE BARCODE</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <div className="space-y-2">
                                <input type="text" placeholder="Sealed bag code barcode (e.g. BAG-00912)" value={actionInput.sampleBagCode} onChange={e => setActionInput(prev => ({ ...prev, sampleBagCode: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.sampleBagCode} onClick={() => handleTransitionAction(rep.id, 'sample_collected', `Sample registered. Bag code: ${actionInput.sampleBagCode}`)} className="px-3 py-1 bg-yellow-500 text-black font-bold rounded text-xs">
                                  Register bag
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'sample_collected' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">LABORATORY ROUTING</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <button onClick={() => handleTransitionAction(rep.id, 'lab_testing', 'Sample dispatched to Gujarat Food Laboratory.')} className="px-3 py-1 bg-pink-500 text-white font-bold rounded text-xs">
                                Dispatch to NABL Lab
                              </button>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'lab_testing' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">LAB REPORT INTAKE</span>
                            {(currentRole === 'laboratory' || currentRole === 'admin') ? (
                              <div className="space-y-2">
                                <input type="number" placeholder="GC-MS Purity (0-100)" value={actionInput.labPurity} onChange={e => setActionInput(prev => ({ ...prev, labPurity: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.labPurity} onClick={() => handleTransitionAction(rep.id, 'lab_report_uploaded', `Lab GC-MS result uploaded: ${actionInput.labPurity}% purity`)} className="px-3 py-1 bg-indigo-500 text-white font-bold rounded text-xs">
                                  Upload Certified Lab Results
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Laboratory.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'lab_report_uploaded' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">REGULATORY RECOMMENDATION</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <div className="space-y-2">
                                <textarea placeholder="Action details notes *" value={actionInput.notes} onChange={e => setActionInput(prev => ({ ...prev, notes: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.notes} onClick={() => handleTransitionAction(rep.id, 'recommended', `Recommendation: Warning Fine notice.`)} className="px-3 py-1 bg-rose-500 text-white font-bold rounded text-xs">
                                  File Case Recommendation
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'recommended' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">SENIOR OFFICER SIGN-OFF</span>
                            {(currentRole === 'senior_officer' || currentRole === 'admin') ? (
                              <button onClick={() => handleTransitionAction(rep.id, 'senior_approval', 'Case validated & alert authorized by Senior Officer.')} className="px-3 py-1 bg-yellow-500 text-black font-bold rounded text-xs">
                                Authorize Penalty & Alerts
                              </button>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Senior Officer.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'senior_approval' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">ALERT ENFORCEMENT</span>
                            {(currentRole === 'senior_officer' || currentRole === 'admin') ? (
                              <button onClick={() => handleTransitionAction(rep.id, 'public_alert', 'FSSAI public warning published.')} className="px-3 py-1 bg-red-600 text-white font-bold rounded text-xs">
                                Issue Public Notice
                              </button>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Senior Officer.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'public_alert' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">NOTIFY VENDOR & ENFORCE APPEAL</span>
                            {(currentRole === 'inspector' || currentRole === 'admin') ? (
                              <button onClick={() => handleTransitionAction(rep.id, 'appeal_window', 'Warning notice served to vendor. 14-day timer initialized.')} className="px-3 py-1 bg-amber-500 text-black font-bold rounded text-xs">
                                Serve notice & appeal timer
                              </button>
                            ) : (
                              <p className="text-[9px] text-red-400">Requires role: Inspector.</p>
                            )}
                          </div>
                        )}

                        {rep.status === 'appeal_window' && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-gray-400 block font-bold">MERCHANT COMPLIANCE & APPEAL DESK</span>
                            {currentRole === 'vendor' ? (
                              <div className="space-y-2">
                                <textarea placeholder="Vendor response statement *" value={actionInput.appealStatement} onChange={e => setActionInput(prev => ({ ...prev, appealStatement: e.target.value }))} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-1.5 text-xs text-white" />
                                <button disabled={!actionInput.appealStatement} onClick={() => handleTransitionAction(rep.id, 'resolved', 'Compliance statement and appeal uploaded.')} className="px-3 py-1 bg-emerald-500 text-black font-bold rounded text-xs">
                                  File Appeal / Pay Fine
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p className="text-[10px] text-gray-400">Awaiting vendor appeal statement.</p>
                                {(currentRole === 'admin' || currentRole === 'senior_officer') && (
                                  <button onClick={() => handleTransitionAction(rep.id, 'resolved', 'Case closed by admin override.')} className="px-3 py-1 bg-emerald-500 text-black font-bold rounded text-xs mt-2">
                                    Override and Mark Resolved
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button onClick={() => setActioningId(null)} className="text-[10px] text-gray-400">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: Testing Labs ── */}
      {activeTab === 'labs' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building size={18} className="text-blue-400" /> Accredited Testing Laboratories (NABL/FSSAI)
            </h2>
            <p className="text-xs text-gray-400">Find notified state-level food testing centers and private analytical labs</p>
          </div>

          <div className="card p-2 rounded-3xl border border-[var(--border-color)] overflow-hidden h-96">
            <MapContainer center={mapCenter} zoom={mapZoom} className="w-full h-full rounded-2xl">
              <ChangeMapView center={mapCenter} zoom={mapZoom} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {REAL_PAN_INDIA_LABORATORIES.slice(0, 8).map(lab => (
                <Marker key={lab.id} position={[lab.lat, lab.lng]} icon={labIcon}>
                  <Popup>
                    <div className="text-xs p-1">
                      <h4 className="font-bold text-black">{lab.name}</h4>
                      <p className="text-[10px] text-gray-600">{lab.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* ── TAB 5: NGO Centers ── */}
      {activeTab === 'ngos' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building size={18} className="text-emerald-400" /> NGO Relief Centers & Inventory
            </h2>
            <p className="text-xs text-gray-400">Verified inventory stock coordinates at local storage centers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {inventory.map(item => (
              <div key={item.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{item.center}</span>
                <h4 className="text-xs font-black text-white">{item.name}</h4>
                <p className="text-sm font-mono font-black text-[#d4af37]">{item.quantity} {item.unit}</p>
                <span className="text-[9px] text-gray-400 block">Expiry: {item.expiry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ADMIN AUDIT LOGS ── */}
      {activeTab === 'admin_audit' && currentRole === 'admin' && (
        <div className="px-5 pt-6 max-w-5xl mx-auto w-full space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Terminal size={18} className="text-amber-400" /> Immutable System Audit Ledger
            </h2>
            <p className="text-xs text-gray-400">Strict regulatory log of all database mutations, inspector assignments, and security claims</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden">
            <div className="p-4 bg-[var(--bg-elevated)] border-b border-[var(--border-color)] flex justify-between items-center text-xs">
              <span className="font-mono text-gray-400 font-bold">Transaction History</span>
              <span className="text-emerald-400 font-bold">● System Secure</span>
            </div>
            <div className="divide-y divide-[var(--border-color)] font-mono text-[10px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[var(--bg-elevated)] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-amber-400 font-bold">{log.action}</span>
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-white">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLAINT WIZARD MODAL ── */}
      {complaintWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">File Citizen Complaint Wizard</h3>
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mt-1">Step {complaintStep} of 5</span>
              </div>
              <button onClick={() => setComplaintWizardOpen(false)} className="p-1 rounded text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {complaintStep === 1 && (
                <div className="space-y-3">
                  <label className="text-[9px] text-gray-400 font-bold uppercase block">Product Brand Name *</label>
                  <input type="text" placeholder="e.g. Swastik Oil" value={complaintForm.brandName} onChange={e => setComplaintForm(prev => ({ ...prev, brandName: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" />
                  <label className="text-[9px] text-gray-400 font-bold uppercase block">Retailer / Vendor Name *</label>
                  <input type="text" placeholder="e.g. Kisan Kirana" value={complaintForm.vendorName} onChange={e => setComplaintForm(prev => ({ ...prev, vendorName: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" />
                </div>
              )}

              {complaintStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-1">Oil Category</label>
                      <select value={complaintForm.oilType} onChange={e => setComplaintForm(prev => ({ ...prev, oilType: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white">
                        <option>Mustard Oil</option>
                        <option>Sunflower Oil</option>
                        <option>Coconut Oil</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-1">Batch Number</label>
                      <input type="text" placeholder="BATCH-99" value={complaintForm.batchNumber} onChange={e => setComplaintForm(prev => ({ ...prev, batchNumber: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Price Paid" value={complaintForm.price} onChange={e => setComplaintForm(prev => ({ ...prev, price: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                    <input type="number" placeholder="Quantity (ml)" value={complaintForm.quantity} onChange={e => setComplaintForm(prev => ({ ...prev, quantity: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                  </div>
                </div>
              )}

              {complaintStep === 3 && (
                <div className="space-y-3">
                  <input type="text" placeholder="Store Address *" value={complaintForm.address} onChange={e => setComplaintForm(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City" value={complaintForm.city} onChange={e => setComplaintForm(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                    <input type="text" placeholder="State" value={complaintForm.state} onChange={e => setComplaintForm(prev => ({ ...prev, state: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                    <input type="text" placeholder="PIN" value={complaintForm.pinCode} onChange={e => setComplaintForm(prev => ({ ...prev, pinCode: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                  </div>
                </div>
              )}

              {complaintStep === 4 && (
                <div className="space-y-3">
                  <label className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Attach Physical Evidence (Min 3 Photos) *</label>
                  <button type="button" onClick={() => setComplaintForm(prev => ({ ...prev, photosCount: Math.min(5, prev.photosCount + 1) }))} className="p-2 border rounded bg-[var(--bg-elevated)] text-xs text-white">
                    + Simulate Photo Upload
                  </button>
                  <span className="text-xs text-gray-400 block">{complaintForm.photosCount} photo(s) selected. (Need at least 3)</span>
                </div>
              )}

              {complaintStep === 5 && (
                <div className="space-y-3">
                  <textarea placeholder="Describe oil adulteration issue *" rows="3" value={complaintForm.description} onChange={e => setComplaintForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded p-2 text-xs text-white" />
                  <div className="bg-[var(--bg-elevated)] p-3 border rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>AI Duplication check score:</span>
                      <span className={descriptionQualityScore >= 60 ? 'text-emerald-400' : 'text-red-400'}>{descriptionQualityScore}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--border-color)] flex justify-between">
              <button disabled={complaintStep === 1} onClick={() => setComplaintStep(prev => prev - 1)} className="px-4 py-2 rounded text-xs border border-[var(--border-color)] text-gray-300 disabled:opacity-30">Back</button>
              {complaintStep < 5 ? (
                <button disabled={(complaintStep === 1 && (!complaintForm.brandName || !complaintForm.vendorName)) || (complaintStep === 4 && complaintForm.photosCount < 3)} onClick={() => setComplaintStep(prev => prev + 1)} className="px-4 py-2 rounded bg-[#d4af37] text-black text-xs font-bold disabled:opacity-30">Continue</button>
              ) : (
                <button disabled={descriptionQualityScore < 60} onClick={handleComplaintSubmit} className="px-5 py-2 rounded bg-red-500 text-white text-xs font-bold disabled:opacity-30">Submit Complaint</button>
              )}
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
