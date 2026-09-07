import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Zap, 
  Loader2,
  Package,
  Calculator,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import { ProductItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface QuoteCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  loadData?: {
    watts: number;
    va: number;
    ah: number;
    hours: number;
  } | null;
  service?: string | null;
}

export const QuoteCallbackModal: React.FC<QuoteCallbackModalProps> = ({
  isOpen,
  onClose,
  product,
  loadData,
  service,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [requirementType, setRequirementType] = useState('Product Quotation');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (product) {
      setRequirementType('New Product Purchase');
      setNotes(`Quotation requested for: ${product.name} (${product.capacity || product.brand}). Doorstep installation in Chennai.`);
    } else if (loadData) {
      setRequirementType('Inverter & Battery Sizing');
      setNotes(`Calculated Load: ~${loadData.watts}W, ${loadData.hours}h continuous backup. Recommended: ${loadData.va}VA Inverter + ${loadData.ah}Ah Battery.`);
    } else if (service) {
      setRequirementType('Service & AMC');
      setNotes(`Service inquiry: ${service}.`);
    } else {
      setRequirementType('General Enquiry');
      setNotes('');
    }
    setStatus('idle');
  }, [product, loadData, service, isOpen]);

  if (!isOpen) return null;

  const generateWhatsAppMessage = () => {
    let details = notes;
    if (product) {
      details = `Product: ${product.name} (${product.capacity || product.brand})\n${notes}`;
    } else if (loadData) {
      details = `Load: ~${loadData.watts}W (${loadData.hours}h backup)\nInverter: ${loadData.va}VA | Battery: ${loadData.ah}Ah\n${notes}`;
    }

    return `*⚡ QUOTATION / CALLBACK REQUEST - JV CONTROLS*\n\n` +
      `*Customer Name:* ${name || 'Customer'}\n` +
      `*Mobile:* ${mobile}\n` +
      `*Email:* ${email || 'N/A'}\n` +
      `*Chennai Area:* ${location || 'Chennai'}\n` +
      `*Requirement:* ${requirementType}\n` +
      `*Details:* ${details}\n\n` +
      `Sent via JV Controls Online Portal (https://jvcontrols.in)`;
  };

  const handleWhatsAppSubmit = () => {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/919500087723?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Please provide your Name and Mobile Number.');
      return;
    }

    setStatus('submitting');

    const payload = {
      name,
      mobile,
      email,
      location,
      requirementType,
      notes,
      product: product ? product.name : null,
      loadData: loadData || null,
      service: service || null,
      recipient: 'jvcjvcontrols@gmail.com',
      submittedAt: new Date().toISOString(),
    };

    try {
      // 1. Log to Node.js server
      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // 2. Also forward to Formspree
      await fetch('https://formspree.io/f/xvgzvwoq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      setStatus('success');
    } catch {
      setStatus('success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#e65100] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                {language === 'ta' ? 'இலவச விலைப்புள்ளி & திரும்ப அழைப்பு' : 'Request Quotation / Callback'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ta' ? 'சென்னையில் உடனடி பொறியாளர் ஆலோசனை' : 'Direct consultation from JV Controls Annanagar East'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {status === 'success' ? (
            <div className="text-center py-6 sm:py-8 space-y-3 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">
                {language === 'ta' ? `நன்றி, ${name}!` : `Thank You, ${name}!`}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {language === 'ta'
                  ? `உங்கள் கோரிக்கை பதிவு செய்யப்பட்டுள்ளது. எங்கள் பொறியாளர் உங்களை விரைவில் ${mobile} எண்ணில் அழைப்பார்.`
                  : `Your inquiry has been received. Our power engineer will contact you at ${mobile} with quotation and installation options.`}
              </p>

              {/* 1-Tap WhatsApp Forward */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2 max-w-sm mx-auto mt-2">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Instant WhatsApp Follow-up</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Tap below to open WhatsApp directly with our Chennai team:
                </p>
                <button
                  onClick={handleWhatsAppSubmit}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp (+91 9500087723)</span>
                </button>
              </div>

              <div className="pt-3 flex justify-center gap-2.5">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-colors"
                >
                  Close Window
                </button>
                <a
                  href="tel:+919500087723"
                  className="px-5 py-2.5 bg-[#004b87] hover:bg-[#003366] text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Call Primary Hotline</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Context Summary Cards */}
              {product && (
                <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 border border-sky-100 flex items-center justify-center shadow-xs">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase text-[#004b87] tracking-wider">{product.brand}</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                    {product.capacity && (
                      <div className="text-[11px] font-semibold text-slate-600">{product.capacity}</div>
                    )}
                  </div>
                </div>
              )}

              {loadData && (
                <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center gap-2.5 text-xs text-orange-950">
                  <Calculator className="w-5 h-5 text-[#ea580c] shrink-0" />
                  <div>
                    <span className="font-black">Load Calculation: </span>
                    <span>~{loadData.watts}W ({loadData.hours}h Backup) • Recommended: <strong>{loadData.va}VA Inverter</strong> + <strong>{loadData.ah}Ah Battery</strong></span>
                  </div>
                </div>
              )}

              {service && !product && !loadData && (
                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center gap-2.5 text-xs text-purple-950">
                  <Wrench className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <span className="font-black">Service Requested: </span>
                    <span>{service}</span>
                  </div>
                </div>
              )}

              {/* Name & Mobile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 shadow-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9500087723"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Email & Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 shadow-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Area / Location in Chennai
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anna Nagar, Ambattur, T. Nagar"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Requirements / Questions
                </label>
                <textarea
                  rows={2}
                  placeholder="Appliance details, existing battery exchange, delivery timeline..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 shadow-xs transition-all"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-1 py-3.5 px-5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#ea580c]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Instant Callback</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppSubmit}
                  className="py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>

              {/* Trust Badge Footer */}
              <div className="pt-1 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Primary Helpline: <strong>+91 9500087723</strong> • Doorstep site study in Chennai</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

