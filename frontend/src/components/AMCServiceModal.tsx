import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, Clock, Phone, Send, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AMCServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AMCServiceModal: React.FC<AMCServiceModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [priority, setPriority] = useState<'emergency' | 'routine'>('emergency');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [equipmentType, setEquipmentType] = useState('Online UPS');
  const [brandCapacity, setBrandCapacity] = useState('');
  const [address, setAddress] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleWhatsAppDispatch = () => {
    const priorityText = priority === 'emergency' ? '🚨 EMERGENCY BREAKDOWN (URGENT)' : '🛠️ ROUTINE AMC / SERVICE';
    const message = `*JV CONTROLS SERVICE TICKET*\n\n` +
      `*Priority:* ${priorityText}\n` +
      `*Name:* ${name || 'Customer'}\n` +
      `*Mobile:* ${mobile}\n` +
      `*Equipment:* ${equipmentType} (${brandCapacity || 'Standard'})\n` +
      `*Address / Location:* ${address || 'Chennai'}\n` +
      `*Issue Details:* ${issueDescription || 'Immediate site inspection required.'}\n\n` +
      `Please dispatch an engineer immediately.`;

    const url = `https://wa.me/919500087723?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Please fill in your Name and Mobile Number.');
      return;
    }

    // Log ticket to Node.js backend server
    fetch('/api/amc-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority,
        name,
        mobile,
        equipmentType,
        brandCapacity,
        address,
        issueDescription,
        submittedAt: new Date().toISOString(),
      }),
    }).catch(() => {});

    setSubmitted(true);
    // Also trigger WhatsApp lead dispatch
    handleWhatsAppDispatch();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              priority === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-[#005696]'
            }`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {t.amc.title}
              </h2>
              <p className="text-xs text-slate-500">
                {t.amc.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
            aria-label="Close AMC service modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Service Ticket Dispatched!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your request has been forwarded to our on-duty service engineer. We will contact you at <strong>{mobile}</strong>.
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleWhatsAppDispatch}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Direct Chat</span>
                </button>
                <a
                  href="tel:+919500087723"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call Emergency Hotline (+91 9500087723)</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Priority Toggle Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Urgency Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('emergency')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      priority === 'emergency'
                        ? 'border-rose-500 bg-rose-50/70 text-rose-950 shadow-sm ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs sm:text-sm text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                        {t.amc.emergencyBadge}
                      </span>
                      {priority === 'emergency' && (
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-rose-900/80 mt-1 font-medium">
                      Power down / Continuous beep / &lt; 2h dispatch in Chennai
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('routine')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      priority === 'routine'
                        ? 'border-[#004b87] bg-sky-50/70 text-slate-900 shadow-sm ring-2 ring-[#004b87]/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs sm:text-sm text-[#004b87] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#004b87]" />
                        {t.amc.routineBadge}
                      </span>
                      {priority === 'routine' && (
                        <span className="w-2 h-2 rounded-full bg-[#004b87]"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      Water top-up / Battery health test / Scheduled AMC renewal
                    </p>
                  </button>
                </div>
              </div>

              {/* Equipment Type & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.amc.equipmentLabel} *
                  </label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                  >
                    <option value="Online UPS (Single Phase / 3-Phase)">Online UPS (1-Phase / 3-Phase)</option>
                    <option value="Home / Office Inverter">Home / Office Inverter</option>
                    <option value="Industrial Battery Bank">Industrial Tubular / SMF Battery Bank</option>
                    <option value="Servo Voltage Stabilizer">Servo Voltage Stabilizer</option>
                    <option value="Other Electrical Equipment">Other Electrical Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.amc.brandLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. APC 5kVA, Microtek 1000VA, Exide 150Ah"
                    value={brandCapacity}
                    onChange={(e) => setBrandCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                  />
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.contact.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.contact.mobileLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9500087723"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                  />
                </div>
              </div>

              {/* Address / Location in Chennai */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Address in Chennai *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot No 24, 2nd Avenue, Anna Nagar East, Chennai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                />
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Description / Specific Request *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe symptoms: e.g. Beeping red error LED, battery not charging, low backup time, AMC contract renewal quote..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-800 shadow-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98 ${
                    priority === 'emergency'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                      : 'bg-[#004b87] hover:bg-[#003366] shadow-[#004b87]/25'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{t.amc.dispatchNow}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDispatch}
                  className="py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>24x7 Emergency helpline directly connecting you with JV Controls Chennai engineers.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

