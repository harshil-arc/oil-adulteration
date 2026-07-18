import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, ShieldAlert, AlertTriangle, ShieldCheck, MapPin, Bell, 
  RefreshCw, ChevronRight, Award, Plus, Calendar, Compass, Heart, BarChart2,
  Building, Check, Filter, Search, Eye, Zap, Download, ScanLine, 
  Shield, Users, Clipboard, Terminal, Clock, Lock, CheckCircle2, FileText,
  Upload, UserCheck, AlertCircle, EyeOff, Send, HelpCircle, Map, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { profile, updateProfile, logout } = useApp();
  const currentRole = profile?.role || 'citizen';

  // Data State
  const [complaints, setComplaints] = useState([]);
  const [subInspectors, setSubInspectors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Timelines
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showFssaiConfirm, setShowFssaiConfirm] = useState(false);
  const [complaintWizardOpen, setComplaintWizardOpen] = useState(false);
  const [complaintStep, setComplaintStep] = useState(1);
  const [selectedSubInspectorId, setSelectedSubInspectorId] = useState('');
  const [subInspectorSearch, setSubInspectorSearch] = useState('');

  // GPS & Checklist for Sub Inspector
  const [gpsCheckedIn, setGpsCheckedIn] = useState(false);
  const [gpsCheckedOut, setGpsCheckedOut] = useState(false);

  // Form Fields
  const [complaintForm, setComplaintForm] = useState({
    vendorName: '',
    vendorAddress: '',
    city: '',
    state: '',
    pin: '',
    oilType: 'Mustard Oil',
    brandName: '',
    batchNumber: '',
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: '1000',
    price: '180',
    description: '',
    photosCount: 0
  });

  const [actionInput, setActionInput] = useState({
    notes: '',
    labPurity: '95',
    labAdulterant: 'Argemone Oil',
    warningAmount: '5000',
    complianceText: '',
    appealStatement: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch complaints
      const { data: compData } = await supabase.from('complaints').select('*');
      const loadedComplaints = compData && compData.length > 0 ? compData : [
        {
          id: 'SPT-2026-000124',
          citizen_uid: 'citizen-demo-id',
          vendor_name: 'Pooja Grocery Store',
          vendor_address: 'Sector 4, Gandhinagar',
          oil_type: 'Mustard Oil',
          brand_name: 'PureDrop Mustard',
          batch_number: 'MSTD-B9',
          mfg_date: '2026-05-10',
          expiry_date: '2026-11-10',
          purchase_date: '2026-07-10',
          price: 175,
          quantity_ml: 1000,
          description: 'Distinct petroleum smell and bitter taste. Suspected paraffin mixture.',
          status: 'submitted',
          assigned_inspector_id: 'Rajesh Sharma',
          assigned_sub_inspector_id: null,
          sla_due_date: new Date(Date.now() + 3600000 * 48).toISOString(),
          created_at: new Date().toISOString(),
          logs: [{ timestamp: new Date().toISOString(), status: 'submitted', notes: 'Citizen complaint submitted via guided wizard.', officer_name: 'System AI' }]
        },
        {
          id: 'SPT-2026-000125',
          citizen_uid: 'citizen-demo-id',
          vendor_name: 'Super Save Retailers',
          vendor_address: 'Vastrapur, Ahmedabad',
          oil_type: 'Sunflower Oil',
          brand_name: 'GoldenShield Sunflower',
          batch_number: 'SF-991',
          mfg_date: '2026-04-12',
          expiry_date: '2026-12-12',
          purchase_date: '2026-07-15',
          price: 210,
          quantity_ml: 1000,
          description: 'AI spectral scan flagged this batch with 42% purity score.',
          status: 'laboratory_testing',
          assigned_inspector_id: 'Inspector Rajesh',
          assigned_sub_inspector_id: 'Sub-Inspector Mohan',
          sla_due_date: new Date(Date.now() - 3600000 * 12).toISOString(), // Overdue
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          logs: [
            { timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), status: 'submitted', notes: 'Citizen report uploaded.', officer_name: 'System AI' },
            { timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), status: 'assigned_to_sub_inspector', notes: 'Dispatched to Sub-Inspector Mohan.', officer_name: 'Inspector Rajesh' },
            { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), status: 'laboratory_testing', notes: 'Site inspection done. Sample sealed and dispatched to lab.', officer_name: 'Sub-Inspector Mohan' }
          ]
        }
      ];
      setComplaints(loadedComplaints);

      // 2. Fetch sub-inspectors
      const loadedSubs = [
        { uid: 'sub-1', name: 'Mohan Lal', employee_code: 'FSSAI-SI-091', district: 'Gandhinagar', availability_status: 'available', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
        { uid: 'sub-2', name: 'Rakesh Patel', employee_code: 'FSSAI-SI-092', district: 'Ahmedabad', availability_status: 'on_field', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
        { uid: 'sub-3', name: 'Sunita Sharma', employee_code: 'FSSAI-SI-093', district: 'Vadodara', availability_status: 'available', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }
      ];
      setSubInspectors(loadedSubs);

      // 3. Fetch audit logs
      const loadedLogs = [
        { log_id: 'log-1', action_performed: 'CASE_ASSIGNMENT', user_id: 'food_inspector@fssai.gov.in', role: 'food_inspector', timestamp: new Date(Date.now() - 3600000).toISOString(), notes: 'Assigned case SPT-2026-000125 to Sub-Inspector Mohan' },
        { log_id: 'log-2', action_performed: 'DEVICE_CALIBRATION', user_id: 'admin@pureoil.gov.in', role: 'admin', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), notes: 'Calibrated spectral sensor ref code DEV-901' }
      ];
      setAuditLogs(loadedLogs);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addLocalAuditLog = async (action, details) => {
    const newLog = {
      log_id: `log-${Date.now()}`,
      action_performed: action,
      user_id: profile?.email || 'regulatory@pureoil.gov.in',
      role: currentRole,
      timestamp: new Date().toISOString(),
      notes: details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    await supabase.from('audit_logs').insert(newLog);
  };

  // --- TRANSITIONS ---
  const handleStatusTransition = async (complaintId, nextStatus, notesText) => {
    const updated = complaints.map(c => {
      if (c.id === complaintId) {
        const nextLogs = c.logs ? [...c.logs] : [];
        nextLogs.push({
          timestamp: new Date().toISOString(),
          status: nextStatus,
          notes: notesText,
          officer_name: profile?.name || 'Authorized Officer'
        });
        return {
          ...c,
          status: nextStatus,
          logs: nextLogs,
          assigned_sub_inspector_id: selectedSubInspectorId ? subInspectors.find(s=>s.uid === selectedSubInspectorId)?.name : c.assigned_sub_inspector_id,
          labPurity: actionInput.labPurity || c.labPurity,
          labAdulterant: actionInput.labAdulterant || c.labAdulterant,
          warningAmount: actionInput.warningAmount || c.warningAmount
        };
      }
      return c;
    });

    setComplaints(updated);
    addLocalAuditLog('COMPLAINT_TRANSITION', `Complaint ${complaintId} advanced to ${nextStatus}. Notes: ${notesText}`);
    await supabase.from('complaints').update({ status: nextStatus }).eq('id', complaintId);
    setSelectedComplaint(null);
  };

  // --- COMPLAINT SUBMISSION ---
  const handleCreateComplaint = async () => {
    const newId = `SPT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComp = {
      id: newId,
      citizen_uid: profile?.email || 'citizen-id',
      vendor_name: complaintForm.vendorName,
      vendor_address: `${complaintForm.vendorAddress}, ${complaintForm.city}, ${complaintForm.state} - ${complaintForm.pin}`,
      oil_type: complaintForm.oilType,
      brand_name: complaintForm.brandName,
      batch_number: complaintForm.batchNumber,
      mfg_date: complaintForm.mfgDate,
      expiry_date: complaintForm.expiryDate || new Date(Date.now() + 3600000 * 24 * 180).toISOString().split('T')[0],
      purchase_date: complaintForm.purchaseDate,
      price: parseFloat(complaintForm.price || 0),
      quantity_ml: parseInt(complaintForm.quantity || 0),
      description: complaintForm.description,
      status: 'submitted',
      assigned_inspector_id: 'Inspector Rajesh',
      assigned_sub_inspector_id: null,
      sla_due_date: new Date(Date.now() + 3600000 * 48).toISOString(),
      created_at: new Date().toISOString(),
      logs: [{ timestamp: new Date().toISOString(), status: 'submitted', notes: 'Citizen complaint wizard submission complete.', officer_name: 'System AI' }]
    };

    setComplaints([newComp, ...complaints]);
    addLocalAuditLog('COMPLAINT_SUBMIT', `Created new complaint: ${newId} for ${complaintForm.brandName}`);
    await supabase.from('complaints').insert(newComp);
    setComplaintWizardOpen(false);
    setComplaintStep(1);
    alert(`Complaint submitted successfully! Registration ID: ${newId}`);
  };

  // --- AUTO ASSIGN SUB INSPECTOR ---
  const handleAutoAssign = (complaintId) => {
    const availableSI = subInspectors.find(s => s.availability_status === 'available');
    if (availableSI) {
      setSelectedSubInspectorId(availableSI.uid);
      handleStatusTransition(complaintId, 'assigned_to_sub_inspector', `Auto Assigned to ${availableSI.name} based on availability and district workload.`);
    } else {
      alert("No Sub Inspectors currently available. Please select manually.");
    }
  };

  // Filter SI by search query
  const filteredSubInspectors = useMemo(() => {
    return subInspectors.filter(si => 
      si.name.toLowerCase().includes(subInspectorSearch.toLowerCase()) ||
      si.employee_code.toLowerCase().includes(subInspectorSearch.toLowerCase()) ||
      si.district.toLowerCase().includes(subInspectorSearch.toLowerCase())
    );
  }, [subInspectors, subInspectorSearch]);

  const activeChartData = [
    { name: 'Inspector Rajesh', cases: 8, rating: 94 },
    { name: 'Mohan Lal', cases: 14, rating: 92 },
    { name: 'Rakesh Patel', cases: 11, rating: 88 },
    { name: 'Sunita Sharma', cases: 9, rating: 96 }
  ];

  return (
    <div className="min-h-screen theme-bg theme-text pb-28 pt-safe relative overflow-x-hidden">
      
      {/* ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#d4af37] opacity-[0.06] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/food360-logo.jpg" alt="SpectraTrust Logo" className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/40 shadow-md" />
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight text-white">
              Spectra<span className="text-[#d4af37]">Trust</span>
            </h1>
            <p className="text-[9px] text-[#d4af37] font-black uppercase tracking-wider leading-none">
              Portal: {currentRole.replace('_', ' ')} Command
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-black text-[9px] uppercase tracking-widest transition-all"
        >
          Sign Out
        </button>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto">

        {/* ── CITIZEN DASHBOARD ── */}
        {currentRole === 'citizen' && (
          <div className="space-y-5 text-left">
            {/* Quick Actions Panel */}
            <div className="card p-5 rounded-3xl border border-[#d4af37]/30 bg-[var(--bg-card)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-white">Citizen Command Center</span>
                <span className="text-[9px] font-bold text-[#d4af37]">SpectraTrust Consumer Guard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setComplaintStep(1); setComplaintWizardOpen(true); }}
                  className="p-4 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 hover:border-[#d4af37] text-left transition-all flex flex-col justify-between h-24"
                >
                  <Plus size={20} className="text-[#d4af37]" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white">File Complaint</span>
                    <p className="text-[8px] text-gray-400">Report Adulteration</p>
                  </div>
                </button>
                <button 
                  onClick={() => setShowFssaiConfirm(true)}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:border-red-400 text-left transition-all flex flex-col justify-between h-24"
                >
                  <AlertCircle size={20} className="text-red-400" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white">Report to FSSAI</span>
                    <p className="text-[8px] text-gray-400">Official Portal</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Timelines of filed complaints */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">My Filed Complaints History</h3>
              <div className="space-y-3">
                {complaints.map(comp => (
                  <div key={comp.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 text-[9px] font-bold">
                      <span className="text-gray-400">ID: {comp.id}</span>
                      <span className="text-amber-400 uppercase">{comp.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{comp.brand_name} ({comp.oil_type})</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{comp.vendor_name} • {comp.vendor_address}</p>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                      <span className="text-[9px] font-bold text-gray-400 block uppercase">Logistics status track:</span>
                      <div className="grid grid-cols-2 gap-2 text-[9px] bg-[var(--bg-elevated)] p-2 rounded-xl">
                        <div>
                          <span className="text-gray-400 block">Current officer</span>
                          <span className="text-white font-bold">{comp.assigned_sub_inspector_id || comp.assigned_inspector_id || 'Assigned soon'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">SLA Target Date</span>
                          <span className="text-red-400 font-mono font-bold">{new Date(comp.sla_due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VENDOR DASHBOARD ── */}
        {currentRole === 'vendor' && (
          <div className="space-y-5 text-left">
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-white">Merchant Trust Registry</span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[9px] text-gray-400 font-bold block">TRUST SCORE</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">94 <span className="text-xs text-gray-500">/ 100</span></span>
                </div>
                <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[9px] text-gray-400 font-bold block">COMPLIANCE RATING</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">Grade A</span>
                </div>
              </div>
            </div>

            {/* Warnings list */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Warnings notice board & appeals</h3>
              <div className="space-y-3">
                {complaints.filter(c=>c.status === 'appeal_window').map(c => (
                  <div key={c.id} className="card p-4 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Warning Notice Issued</span>
                      <span className="text-[9px] text-gray-400 font-mono">ID: {c.id}</span>
                    </div>
                    <p className="text-xs text-gray-300">A complaint has been filed regarding: {c.brand_name}. Please upload compliance certificate or submit appeal statement immediately.</p>
                    <textarea 
                      placeholder="Enter appeal statement *" 
                      value={actionInput.appealStatement}
                      onChange={e=>setActionInput(prev => ({ ...prev, appealStatement: e.target.value }))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-xs text-white" 
                    />
                    <button 
                      onClick={() => handleStatusTransition(c.id, 'resolved', 'Merchant compliance appeal submitted for case review.')}
                      className="w-full py-2 bg-[#d4af37] text-black text-xs font-bold rounded-xl"
                    >
                      Submit Compliance Appeal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SUB INSPECTOR DASHBOARD ── */}
        {currentRole === 'sub_inspector' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">My Assigned Inspections</h3>
              <div className="space-y-3">
                {complaints.filter(c => c.status === 'assigned_to_sub_inspector' || c.status === 'site_inspection').map(c => (
                  <div key={c.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-amber-400 font-bold uppercase">{c.status.replace(/_/g, ' ')}</span>
                      <span className="text-[9px] text-red-400 font-mono font-bold">Due: {new Date(c.sla_due_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{c.vendor_name}</h4>
                      <p className="text-[10px] text-gray-400">{c.vendor_address}</p>
                    </div>

                    {/* GPS Check In/Out */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setGpsCheckedIn(true); alert("GPS check-in verified at vendor store location coordinates."); }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${gpsCheckedIn ? 'bg-emerald-500 text-black' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white'}`}
                      >
                        {gpsCheckedIn ? '✓ Check-in Verified' : '📍 Store Check-in'}
                      </button>
                      <button 
                        disabled={!gpsCheckedIn}
                        onClick={() => { setGpsCheckedOut(true); alert("GPS check-out verified. Visit duration logged."); }}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${gpsCheckedOut ? 'bg-emerald-500 text-black' : 'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white disabled:opacity-30'}`}
                      >
                        {gpsCheckedOut ? '✓ Check-out Verified' : '📍 Store Check-out'}
                      </button>
                    </div>

                    {/* Report Form */}
                    {gpsCheckedIn && (
                      <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                        <span className="text-[9px] text-gray-400 font-bold uppercase block">Field Audit Findings report</span>
                        <textarea 
                          placeholder="Store condition notes, violations found *" 
                          value={actionInput.notes}
                          onChange={e=>setActionInput(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-xs text-white" 
                        />
                        <button 
                          disabled={!actionInput.notes || !gpsCheckedOut}
                          onClick={() => handleStatusTransition(c.id, 'laboratory_testing', 'Site visit completed. Sealed sample code registered and sent to Gujarat Laboratory.')}
                          className="w-full py-2 bg-[#d4af37] text-black text-xs font-bold rounded-xl disabled:opacity-30"
                        >
                          Submit Report & Seal Sample
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOD INSPECTOR DASHBOARD ── */}
        {currentRole === 'food_inspector' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Regulatory Triage Assigned Cases</h3>
              <div className="space-y-3">
                {complaints.filter(c => c.status === 'submitted' || c.status === 'assigned_to_inspector' || c.status === 'laboratory_testing' || c.status === 'lab_report_uploaded').map(c => (
                  <div key={c.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-amber-400 font-bold uppercase">{c.status.replace(/_/g, ' ')}</span>
                      <span className="text-[9px] text-gray-400 font-mono">SLA Due: {new Date(c.sla_due_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{c.vendor_name} - {c.brand_name}</h4>
                      <p className="text-[10px] text-gray-400">{c.description}</p>
                    </div>

                    {/* Actions Area */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                      {c.status === 'submitted' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusTransition(c.id, 'assigned_to_inspector', 'Case claimed by Lead Food Inspector Rajesh.')}
                            className="flex-1 py-2 bg-[#d4af37] text-black text-[10px] font-bold rounded-xl"
                          >
                            Claim Case
                          </button>
                        </div>
                      )}

                      {c.status === 'assigned_to_inspector' && (
                        <div className="space-y-3">
                          <span className="text-[9px] text-gray-400 block font-bold uppercase">Assign Field Sub Inspector</span>
                          
                          {/* Searchable Dropdown */}
                          <div className="space-y-2 bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)]">
                            <input 
                              type="text" 
                              placeholder="Search by district, name, or code..." 
                              value={subInspectorSearch}
                              onChange={e => setSubInspectorSearch(e.target.value)}
                              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-1.5 px-3 text-xs text-white outline-none"
                            />
                            
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {filteredSubInspectors.map(si => (
                                <div 
                                  key={si.uid}
                                  onClick={() => setSelectedSubInspectorId(si.uid)}
                                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                                    selectedSubInspectorId === si.uid ? 'bg-[#d4af37]/20 border border-[#d4af37]' : 'hover:bg-[var(--bg-card)] border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <img src={si.photo_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                                    <div>
                                      <p className="text-[10px] font-bold text-white leading-tight">{si.name}</p>
                                      <p className="text-[8px] text-gray-400">{si.employee_code} • {si.district}</p>
                                    </div>
                                  </div>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    si.availability_status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                  }`}>
                                    {si.availability_status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              disabled={!selectedSubInspectorId}
                              onClick={() => handleStatusTransition(c.id, 'assigned_to_sub_inspector', 'Dispatched case to Sub Inspector Mohan.')}
                              className="flex-1 py-2 bg-blue-500 text-white text-[10px] font-bold rounded-xl disabled:opacity-30"
                            >
                              Assign Selected SI
                            </button>
                            <button 
                              onClick={() => handleAutoAssign(c.id)}
                              className="flex-1 py-2 bg-emerald-500 text-black text-[10px] font-bold rounded-xl"
                            >
                              ⚡ Auto Assign SI
                            </button>
                          </div>
                        </div>
                      )}

                      {c.status === 'lab_report_uploaded' && (
                        <div className="space-y-2">
                          <textarea 
                            placeholder="Add case recommendation notes *" 
                            value={actionInput.notes}
                            onChange={e=>setActionInput(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-xs text-white" 
                          />
                          <button 
                            disabled={!actionInput.notes}
                            onClick={() => handleStatusTransition(c.id, 'decision_pending', 'Inspector recommended action warning fine notice.')}
                            className="w-full py-2 bg-red-500 text-white text-[10px] font-bold rounded-xl disabled:opacity-30"
                          >
                            Recommend Warning Fine Notice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HEAD INSPECTOR DASHBOARD ── */}
        {currentRole === 'head_inspector' && (
          <div className="space-y-5 text-left">
            <div className="card p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-white">Inspector Performance & Case Metrics</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeChartData}>
                    <XAxis dataKey="name" stroke="#666" fontSize={9} />
                    <YAxis stroke="#666" fontSize={9} />
                    <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #333' }} />
                    <Bar dataKey="cases" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Case Approvals */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Escalated Approvals Triage</h3>
              <div className="space-y-3">
                {complaints.filter(c => c.status === 'decision_pending').map(c => (
                  <div key={c.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-[#d4af37] font-bold uppercase">Decision Pending</span>
                      <span className="text-[9px] text-gray-400 font-mono">ID: {c.id}</span>
                    </div>
                    <p className="text-xs text-gray-300">Inspector recommended a penalty warning notice for {c.vendor_name}.</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusTransition(c.id, 'appeal_window', 'Head Inspector approved penalty fine notice. Appeal window served.')}
                        className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl"
                      >
                        Approve Penalty Fine Notice
                      </button>
                      <button 
                        onClick={() => handleStatusTransition(c.id, 'resolved', 'Investigation closed by Head Inspector.')}
                        className="flex-1 py-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white text-[10px] font-bold rounded-xl"
                      >
                        Close Investigation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LABORATORY DASHBOARD ── */}
        {currentRole === 'laboratory' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Dispatched Samples Laboratory Backlog</h3>
              <div className="space-y-3">
                {complaints.filter(c => c.status === 'laboratory_testing').map(c => (
                  <div key={c.id} className="card p-4 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-blue-400 font-bold uppercase">Sample Backlog</span>
                      <span className="text-[9px] text-gray-400 font-mono">ID: {c.id}</span>
                    </div>
                    
                    <div className="space-y-3 pt-2 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] p-3 rounded-2xl">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">GC-MS CERTIFICATE INPUT</span>
                      <div className="space-y-2">
                        <input 
                          type="number" 
                          placeholder="GC-MS Purity Score (0-100) *" 
                          value={actionInput.labPurity}
                          onChange={e=>setActionInput(prev => ({ ...prev, labPurity: e.target.value }))}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-xs text-white outline-none" 
                        />
                        <select 
                          value={actionInput.labAdulterant}
                          onChange={e=>setActionInput(prev => ({ ...prev, labAdulterant: e.target.value }))}
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded p-2 text-xs text-white outline-none"
                        >
                          <option>Argemone Oil</option>
                          <option>Mineral Oil</option>
                          <option>Unpermitted Coloring Additives</option>
                        </select>
                      </div>
                      
                      <button 
                        disabled={!actionInput.labPurity}
                        onClick={() => handleStatusTransition(c.id, 'lab_report_uploaded', `Lab certificate uploaded. GC-MS verified: ${actionInput.labPurity}% purity. Adulterant: ${actionInput.labAdulterant}. Digital SHA-256 signature hash registered.`)}
                        className="w-full py-2 bg-indigo-500 text-white text-[10px] font-bold rounded-xl disabled:opacity-30"
                      >
                        Digitally Sign & Submit Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN DASHBOARD ── */}
        {currentRole === 'admin' && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Immutable System Audit Log Ledger</h3>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden">
                <div className="divide-y divide-[var(--border-color)] font-mono text-[9px]">
                  {auditLogs.map((log) => (
                    <div key={log.log_id} className="p-4 hover:bg-[var(--bg-elevated)] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-amber-400 font-bold">{log.action_performed}</span>
                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-white">{log.notes}</p>
                      <span className="text-gray-500 block">Operator: {log.user_id} ({log.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── COMPLAINT WIZARD DIALOG MODAL ── */}
      {complaintWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">File Citizen Complaint Wizard</h3>
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider mt-1">Step {complaintStep} of 5</span>
              </div>
              <button onClick={() => setComplaintWizardOpen(false)} className="p-1 rounded text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {complaintStep === 1 && (
                <div className="space-y-3">
                  <label className="text-[9px] text-gray-400 font-bold uppercase block">Retailer / Vendor Name *</label>
                  <input type="text" placeholder="e.g. Kisan Kirana" value={complaintForm.vendorName} onChange={e => setComplaintForm(prev => ({ ...prev, vendorName: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" />
                  <label className="text-[9px] text-gray-400 font-bold uppercase block">Store Address *</label>
                  <input type="text" placeholder="e.g. Sector 4, Gandhinagar" value={complaintForm.vendorAddress} onChange={e => setComplaintForm(prev => ({ ...prev, vendorAddress: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-white" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City" value={complaintForm.city} onChange={e => setComplaintForm(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                    <input type="text" placeholder="State" value={complaintForm.state} onChange={e => setComplaintForm(prev => ({ ...prev, state: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                    <input type="text" placeholder="PIN" value={complaintForm.pin} onChange={e => setComplaintForm(prev => ({ ...prev, pin: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-2 text-xs text-white" />
                  </div>
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
                      <label className="text-[9px] text-gray-400 block mb-1">Brand Name *</label>
                      <input type="text" placeholder="e.g. Swastik Oil" value={complaintForm.brandName} onChange={e => setComplaintForm(prev => ({ ...prev, brandName: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Batch Number" value={complaintForm.batchNumber} onChange={e => setComplaintForm(prev => ({ ...prev, batchNumber: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                    <input type="date" placeholder="Mfg Date" value={complaintForm.mfgDate} onChange={e => setComplaintForm(prev => ({ ...prev, mfgDate: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Price Paid" value={complaintForm.price} onChange={e => setComplaintForm(prev => ({ ...prev, price: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                    <input type="number" placeholder="Quantity (ml)" value={complaintForm.quantity} onChange={e => setComplaintForm(prev => ({ ...prev, quantity: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded py-2 px-3 text-xs text-white" />
                  </div>
                </div>
              )}

              {complaintStep === 3 && (
                <div className="space-y-3">
                  <textarea placeholder="Describe oil adulteration issue (Min 10 characters) *" rows="3" value={complaintForm.description} onChange={e => setComplaintForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded p-2 text-xs text-white" />
                  <div className="bg-[var(--bg-elevated)] p-3 border rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>AI Duplication check score:</span>
                      <span className="text-emerald-400">92/100</span>
                    </div>
                  </div>
                </div>
              )}

              {complaintStep === 4 && (
                <div className="space-y-3">
                  <label className="text-[9px] text-gray-400 font-bold block uppercase mb-1">Attach Physical Evidence (Min 1 Photo) *</label>
                  <button type="button" onClick={() => setComplaintForm(prev => ({ ...prev, photosCount: Math.min(5, prev.photosCount + 1) }))} className="p-2 border rounded bg-[var(--bg-elevated)] text-xs text-white">
                    + Simulate Photo Upload
                  </button>
                  <span className="text-xs text-gray-400 block">{complaintForm.photosCount} photo(s) selected. (Need at least 1)</span>
                </div>
              )}

              {complaintStep === 5 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Validation Summary</h4>
                  <div className="bg-[var(--bg-elevated)] p-3 rounded-2xl border border-[var(--border-color)] space-y-1.5 text-xs text-gray-300">
                    <p>● Vendor Name: {complaintForm.vendorName}</p>
                    <p>● Product: {complaintForm.brandName} ({complaintForm.oilType})</p>
                    <p>● GPS Match: Verified ( Gandhinagar Center )</p>
                    <p>● Photo Upload: verified ({complaintForm.photosCount} attached)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--border-color)] flex justify-between">
              <button disabled={complaintStep === 1} onClick={() => setComplaintStep(prev => prev - 1)} className="px-4 py-2 rounded text-xs border border-[var(--border-color)] text-gray-300 disabled:opacity-30">Back</button>
              {complaintStep < 5 ? (
                <button disabled={(complaintStep === 1 && (!complaintForm.vendorName || !complaintForm.vendorAddress)) || (complaintStep === 4 && complaintForm.photosCount < 1)} onClick={() => setComplaintStep(prev => prev + 1)} className="px-4 py-2 rounded bg-[#d4af37] text-black text-xs font-bold disabled:opacity-30">Continue</button>
              ) : (
                <button onClick={handleCreateComplaint} className="px-5 py-2 rounded bg-red-500 text-white text-xs font-bold">Submit Complaint</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FSSAI CONFIRMATION DIALOG ── */}
      {showFssaiConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl max-w-sm w-full text-left space-y-4 shadow-2xl">
            <div className="flex gap-3 text-red-500 items-start">
              <AlertTriangle className="shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">FSSAI Redirect Warning</h4>
                <p className="text-xs text-gray-400 mt-1">You are being redirected to the official FSSAI complaint portal.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFssaiConfirm(false)} className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] text-white text-xs font-bold rounded-xl">
                Cancel
              </button>
              <a 
                href="https://foscos.fssai.gov.in/consumergrievance/" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setShowFssaiConfirm(false)}
                className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl text-center"
              >
                Proceed
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
