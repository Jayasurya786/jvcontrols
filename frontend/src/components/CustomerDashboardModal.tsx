import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  LogOut, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewInquiryClick: () => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
  onNewInquiryClick,
}) => {
  const { user, token, logout } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'tickets'>('inquiries');

  useEffect(() => {
    if (isOpen && token) {
      fetchUserData();
    }
  }, [isOpen, token]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries || []);
        setTickets(data.tickets || []);
      }
    } catch (e) {
      console.error('Failed to load user inquiries/tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header Bar */}
        <div className="p-6 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shrink-0">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#004b87]/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#004b87] to-blue-500 flex items-center justify-center text-white shadow-lg border border-white/20">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Verified Member
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {user.mobile}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 ml-auto sm:ml-0">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold border border-slate-800 transition-colors"
              title="Sign Out"
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

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black tracking-tight border-b-2 transition-all ${
                activeTab === 'inquiries'
                  ? 'border-[#004b87] text-[#004b87]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Quotations ({inquiries.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black tracking-tight border-b-2 transition-all ${
                activeTab === 'tickets'
                  ? 'border-[#004b87] text-[#004b87]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>AMC & Service Requests ({tickets.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onNewInquiryClick();
            }}
            className="text-xs font-bold text-[#ea580c] hover:underline"
          >
            + Request New Quote
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
              <span className="text-xs font-bold">Loading your history from database...</span>
            </div>
          ) : activeTab === 'inquiries' ? (
            inquiries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-800">No quotation requests found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't requested any product quotations or load assessments yet.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNewInquiryClick();
                  }}
                  className="px-5 py-2.5 bg-[#004b87] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Explore Catalog & Request Quote
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq, idx) => (
                  <div
                    key={inq._id || idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {inq.inquiryId || `INQ-${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {inq.serviceType || 'Product Enquiry'}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        inq.status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : inq.status === 'IN_PROGRESS' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {inq.status || 'NEW'}
                      </span>
                    </div>

                    {inq.product && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <strong>Product:</strong> {typeof inq.product === 'string' ? inq.product : inq.product.name}
                      </div>
                    )}

                    {inq.comments && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{inq.comments}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Area: {inq.location || 'Chennai'}</span>
                      <span>Logged: {new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            tickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-800">No service tickets recorded</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Need maintenance, battery top-up, or emergency UPS breakdown dispatch?
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((tix, idx) => (
                  <div
                    key={tix._id || idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {tix.ticketId || `SRV-${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {tix.equipmentType} {tix.brandCapacity ? `(${tix.brandCapacity})` : ''}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tix.priority === 'emergency'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {tix.priority === 'emergency' ? 'ðŸš¨ Emergency' : 'ðŸ› ï¸ Routine'}
                      </span>
                    </div>

                    {tix.issueDescription && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{tix.issueDescription}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Status: <strong className="text-slate-700">{tix.status}</strong></span>
                      <span>Dispatched: {new Date(tix.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};



