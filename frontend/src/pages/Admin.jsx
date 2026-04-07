import { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, UserCheck, Shield, Activity, MapPin } from 'lucide-react';
import { getComplaints, verifyComplaint, rejectComplaint } from '../lib/api';

export default function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await getComplaints();
      setComplaints(res.data?.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleVerify = async (id) => {
    try {
      await verifyComplaint(id);
      fetchComplaints(); // refresh list
    } catch (e) {
      alert("Verification failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectComplaint(id);
      fetchComplaints();
    } catch (e) {
      alert("Rejection failed");
    }
  };

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;

  const getStatusColor = (status) => {
    if (status === 'verified') return 'bg-red-500 text-white shadow-md shadow-red-500/20';
    if (status === 'rejected') return 'bg-gray-200 text-gray-600';
    return 'bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/20';
  };

  return (
    <div className="px-5 pt-6 pb-6 flex flex-col gap-6 animate-slide-up">
      {/* Header Profile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Control</h1>
          <p className="text-[10px] text-[#1d9e75] font-bold uppercase tracking-widest mt-0.5">National Dispatch Center</p>
        </div>
        <div className="relative w-11 h-11 bg-gradient-to-tr from-[#0c3f2f] to-[#1d9e75] rounded-full flex items-center justify-center shadow-lg shadow-[#1d9e75]/20 border-2 border-white">
          <span className="text-white font-bold text-sm">AD</span>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-[#e0f2ec] to-[#f7f9f7] border border-[#a2d7c2] flex flex-col relative overflow-hidden">
          <div className="absolute -right-3 -top-3 text-[#74c3a4]/30">
            <AlertTriangle size={64} />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#177e5e] mb-1 z-10">Pending Active</p>
          <p className="text-3xl font-extrabold text-[#0c3f2f] z-10">{loading ? '-' : pendingCount}</p>
        </div>
        
        <div className="card bg-gradient-to-br from-[#0c3f2f] to-[#115f46] text-white border border-[#177e5e] flex flex-col relative overflow-hidden shadow-xl shadow-[#1d9e75]/10">
          <div className="absolute -right-3 -top-3 text-[#177e5e]/50">
            <Shield size={64} />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#a2d7c2] mb-1 z-10">Verified Cases</p>
          <p className="text-3xl font-extrabold text-white z-10">{loading ? '-' : verifiedCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 mb-[-8px]">
        <h2 className="font-bold text-gray-800 text-sm">Action Queue</h2>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md">
          <Activity size={12} className="text-green-600" />
          <span className="text-[10px] font-bold text-green-700 uppercase">Live Sync</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-[#a2d7c2] border-t-[#1d9e75] rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center card bg-[#f7f9f7] border border-[#e8ede8] shadow-sm">
          <div className="w-20 h-20 bg-[#e0f2ec] rounded-full flex items-center justify-center mb-4 relative">
            <ShieldCheck size={40} className="text-[#1d9e75] z-10" />
            <div className="absolute inset-0 bg-[#1d9e75] rounded-full animate-ping opacity-20"></div>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-1.5">All Clear</h3>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[250px]">
            There are zero pending cases across the national grid. The market remains secure.
          </p>
        </div>
      ) : (
        /* Complaint Queue */
        <div className="flex flex-col gap-4">
          {complaints.map(comp => {
            const isMock = false;
            const statusDisplay = comp.status === 'verified' ? 'Critical' : comp.status === 'pending' ? 'Pending' : 'Resolved';
            const statusColor = comp.status === 'pending' ? 'bg-[#fef9c3] text-[#b45309]' : comp.status === 'verified' ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#e0f2ec] text-[#177e5e]';
            const initial = comp.shops?.name?.charAt(0) || 'U';

            return (
            <div key={comp.id} className="card relative overflow-hidden border border-[#e8ede8] p-0 shadow-sm transition-all hover:shadow-md">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm leading-tight">
                        {comp.shops ? comp.shops.name : 'Unknown Location'}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {new Date(comp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-black text-gray-800">{comp.purity || '--'}<span className="text-[10px] text-gray-400">%</span></p>
                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusDisplay}
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#f7f9f7] rounded-xl p-3 my-2 border border-[#e8ede8]">
                  <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                    "{comp.description}"
                  </p>
                </div>
                
                {comp.status === 'pending' && !isMock && (
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleVerify(comp.id)}
                      className="flex-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      Verify Risk
                    </button>
                    <button 
                      onClick={() => handleReject(comp.id)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-2.5 rounded-xl transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Grid Security Banner */}
      <div className="mt-2 card bg-[#1d9e75] border-transparent shadow-[#1d9e75]/20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck size={18} />
          <span className="text-xs font-bold tracking-widest uppercase">Grid Security Status</span>
        </div>
        <div className="bg-[#177e5e] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest border border-[#46af85]">
          Nominal
        </div>
      </div>
    </div>
  );
}
