import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import { 
  X, 
  ShieldCheck, 
  Users, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ isOpen, onClose }) => {
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'tickets' | 'users'>('inquiries');

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (isOpen && token) {
      loadAdminData();
    }
  }, [isOpen, token]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch(apiUrl('/api/admin/stats'), { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch Inquiries
      const inqRes = await fetch(apiUrl('/api/admin/inquiries'), { headers });
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setInquiries(inqData.inquiries || []);
      }

      // Fetch Tickets
      const tixRes = await fetch(apiUrl('/api/admin/tickets'), { headers });
      if (tixRes.ok) {
        const tixData = await tixRes.json();
        setTickets(tixData.tickets || []);
      }

      // Fetch Users
      const usersRes = await fetch(apiUrl('/api/admin/users'), { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.users || []);
      }
    } catch (e) {
      console.error('Failed to load admin portal data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === id || item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((item) => (item._id === id || item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  if (!isOpen) return null;

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.mobile?.includes(searchQuery) ||
      inq.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || inq.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Filter tickets
  const filteredTickets = tickets.filter((tix) => {
    const matchesSearch =
      tix.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tix.mobile?.includes(searchQuery) ||
      tix.equipmentType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || tix.priority === filterStatus || tix.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Admin Header */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-white/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  JV Controls Admin Management Portal
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as: <strong className="text-amber-300">{user?.email}</strong> (Anna Nagar East, Chennai HQ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 ml-auto sm:ml-0">
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold border border-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Stats Strip */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-[#004b87]">{stats?.totalInquiries ?? inquiries.length}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Inquiries</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-[#ea580c]">{stats?.newInquiries ?? inquiries.filter(i => i.status === 'NEW').length}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">New Leads</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-rose-600">{stats?.emergencyTickets ?? tickets.filter(t => t.priority === 'emergency').length}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Emergency AMC</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-2xl font-black text-emerald-600">{stats?.totalUsers ?? usersList.length}</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Registered Users</div>
          </div>
        </div>

        {/* Filter and Tab Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('inquiries');
                setFilterStatus('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-[#004b87] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('tickets');
                setFilterStatus('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'tickets'
                  ? 'bg-[#004b87] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              AMC Tickets ({tickets.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                setFilterStatus('ALL');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'users'
                  ? 'bg-[#004b87] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Users ({usersList.length})
            </button>
          </div>

          {/* Search & Filter Inputs */}
          {activeTab !== 'users' && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
              </div>

              {activeTab === 'inquiries' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              )}

              {activeTab === 'tickets' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none"
                >
                  <option value="ALL">All Priority</option>
                  <option value="emergency">ðŸš¨ Emergency</option>
                  <option value="routine">ðŸ› ï¸ Routine</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Data Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
              <span className="text-xs font-bold">Querying MongoDB Database...</span>
            </div>
          ) : activeTab === 'inquiries' ? (
            filteredInquiries.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold">No customer inquiries found</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq, idx) => (
                  <div
                    key={inq._id || idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{inq.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{inq.inquiryId}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <a href={`tel:${inq.mobile}`} className="text-[#004b87] font-bold hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#ea580c]" /> {inq.mobile}
                          </a>
                          {inq.email && (
                            <a href={`mailto:${inq.email}`} className="text-slate-500 hover:underline flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {inq.email}
                            </a>
                          )}
                          <span>Area: {inq.location || 'Chennai'}</span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status || 'NEW'}
                          onChange={(e) => handleUpdateInquiryStatus(inq._id || inq.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors focus:outline-none ${
                            inq.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : inq.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="NEW">Status: NEW</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>

                        <a
                          href={`https://wa.me/91${inq.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20JV%20Controls%20Chennai%20regarding%20your%20inquiry`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div><strong>Requirement:</strong> {inq.serviceType}</div>
                      {inq.product && (
                        <div><strong>Product:</strong> {typeof inq.product === 'string' ? inq.product : inq.product.name}</div>
                      )}
                      {inq.comments && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 italic">
                          "{inq.comments}"
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Logged At: {new Date(inq.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'tickets' ? (
            filteredTickets.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold">No AMC or emergency tickets found</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((tix, idx) => (
                  <div
                    key={tix._id || idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            tix.priority === 'emergency'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {tix.priority === 'emergency' ? 'ðŸš¨ EMERGENCY' : 'ðŸ› ï¸ ROUTINE'}
                          </span>
                          <span className="text-xs font-black text-slate-900">{tix.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{tix.ticketId}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <a href={`tel:${tix.mobile}`} className="text-[#004b87] font-bold hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#ea580c]" /> {tix.mobile}
                          </a>
                          <span>Location: {tix.address || 'Chennai'}</span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={tix.status || 'DISPATCH_PENDING'}
                          onChange={(e) => handleUpdateTicketStatus(tix._id || tix.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-300 bg-white text-slate-800 focus:outline-none"
                        >
                          <option value="DISPATCH_PENDING">DISPATCH_PENDING</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>

                        <a
                          href={`https://wa.me/91${tix.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(tix.name)},%20this%20is%20JV%20Controls%20Chennai%20engineer%20regarding%20ticket%20${tix.ticketId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div><strong>Equipment:</strong> {tix.equipmentType} {tix.brandCapacity ? `(${tix.brandCapacity})` : ''}</div>
                      {tix.issueDescription && (
                        <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-rose-950 italic">
                          "{tix.issueDescription}"
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Dispatched At: {new Date(tix.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            usersList.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-bold">No registered users</div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {usersList.map((u, idx) => (
                      <tr key={u._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{u.name}</td>
                        <td className="p-3 font-medium text-slate-600">{u.email}</td>
                        <td className="p-3">{u.mobile}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.isVerified ? 'Verified' : 'Pending OTP'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};


