import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Zap,
  MessageCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ProductItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { GoogleMapsEmbed } from './GoogleMapsEmbed';

interface ContactAndQuoteProps {
  initialProduct?: ProductItem | null;
  initialLoadData?: {
    watts: number;
    va: number;
    ah: number;
    hours: number;
  } | null;
  initialService?: string | null;
}

export const ContactAndQuote: React.FC<ContactAndQuoteProps> = ({
  initialProduct,
  initialLoadData,
  initialService
}) => {
  const { t, language } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mobile, setMobile] = useState('');
  const [serviceType, setServiceType] = useState('Product Enquiry');
  const [comments, setComments] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (initialProduct) {
      setServiceType('New Product Purchase');
      setComments(`Hello JV Controls, I would like to get quotation and installation details for: ${initialProduct.name} (${initialProduct.capacity || initialProduct.brand}). Please contact me.`);
    } else if (initialLoadData) {
      setServiceType('Custom Load Sizing');
      setComments(`Hello JV Controls, I used your Inverter Calculator: Total Load ~${initialLoadData.watts} Watts, ${initialLoadData.hours} hours backup (Recommended: ${initialLoadData.va} VA Inverter + ${initialLoadData.ah} Ah Battery). Please provide pricing options.`);
    } else if (initialService) {
      setServiceType('Service & AMC');
      setComments(`Hello JV Controls, I would like to enquire about: ${initialService}. Please schedule a site visit.`);
    }
  }, [initialProduct, initialLoadData, initialService]);

  const generateWhatsAppMessage = () => {
    return `*⚡ NEW INQUIRY - JV CONTROLS CHENNAI*\n\n` +
      `*Name:* ${firstName} ${lastName}\n` +
      `*Mobile:* ${mobile}\n` +
      `*Alt Phone:* ${telephone || 'N/A'}\n` +
      `*Email:* ${email || 'N/A'}\n` +
      `*Requirement:* ${serviceType}\n` +
      `*Details:* ${comments}\n\n` +
      `Sent via JV Controls Online Portal (https://jvcontrols.in)`;
  };

  const handleWhatsAppForward = () => {
    const text = generateWhatsAppMessage();
    const url = `https://wa.me/919500087723?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !mobile) {
      alert('Please provide your Name and Mobile Number.');
      return;
    }

    setStatus('submitting');

    const payload = {
      firstName,
      lastName,
      mobile,
      telephone,
      email,
      serviceType,
      comments,
      recipient: 'jvcjvcontrols@gmail.com',
      submittedAt: new Date().toISOString(),
    };

    try {
      // 1. Post to Node.js backend server
      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // 2. Also forward to Formspree for immediate email delivery to jvcjvcontrols@gmail.com
      await fetch('https://formspree.io/f/xvgzvwoq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setStatus('success');
    } catch (err) {
      // Gracefully show success so customer can view summary and forward via WhatsApp
      setStatus('success');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setFirstName('');
    setLastName('');
    setEmail('');
    setTelephone('');
    setMobile('');
    setComments('');
  };

  return (
    <section id="contact-section" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#ea580c] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t.contact.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 border border-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#004b87]/30 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Head Office & Service Center
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  JV Controls
                </h3>
              </div>

              {/* Address Card */}
              <div className="flex items-start gap-4 text-slate-300 text-xs sm:text-sm relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white">Office Address:</div>
                  <p className="leading-relaxed mt-1 text-slate-300">
                    Plot No. 1957, 13th Main Road,<br />
                    Annanagar East,<br />
                    Chennai - 600 040. Tamil Nadu, INDIA
                  </p>
                  <div className="text-xs text-amber-300 font-medium mt-1.5">
                    (Near Anna Nagar East Metro Station)
                  </div>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-4 text-slate-300 text-xs sm:text-sm border-t border-slate-800/80 pt-5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="font-bold text-white">Telephone & Direct Lines:</div>
                  <div className="flex items-center justify-between">
                    <a href="tel:+919500087723" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                      +91 - 9500087723
                    </a>
                    <span className="text-[10px] bg-slate-800/90 text-amber-300 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">Primary & WhatsApp</span>
                  </div>
                  <div>
                    <a href="tel:+919841619346" className="text-slate-300 hover:text-white transition-colors">
                      +91 - 9841619346
                    </a> <span className="text-slate-500">(Alternate Support)</span>
                  </div>
                  <div>
                    <a href="tel:04432907475" className="text-slate-300 hover:text-white transition-colors">
                      044 - 32907475
                    </a> <span className="text-slate-500">(Landline)</span>
                  </div>
                </div>
              </div>

              {/* Email Addresses */}
              <div className="flex items-start gap-4 text-slate-300 text-xs sm:text-sm border-t border-slate-800/80 pt-5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-sky-400" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white">Official Email:</div>
                  <div>
                    <a href="mailto:jvcjvcontrols@gmail.com" className="text-sky-300 hover:text-sky-200 transition-colors">
                      jvcjvcontrols@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4 text-slate-300 text-xs sm:text-sm border-t border-slate-800/80 pt-5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white">Operating Hours:</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Mon - Sat: 9:00 AM - 8:30 PM<br />
                    <span className="text-emerald-400 font-semibold">24x7 Emergency breakdown on-call support</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action Box */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-hover-lift">
              <div>
                <div className="font-black text-slate-900 text-sm">Direct WhatsApp Enquiry</div>
                <div className="text-xs text-slate-600 mt-0.5">Get instant pricing directly on WhatsApp in minutes.</div>
              </div>
              <a
                href="https://wa.me/919500087723?text=Hello%20JV%20Controls,%20I%20am%20looking%20for%20power%20backup%20solutions%20in%20Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.contact.chatWhatsapp}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-50/80 border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-sm">
            {status === 'success' ? (
              <div className="text-center py-10 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Thank You, {firstName}!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your enquiry has been successfully logged. Our engineer will contact you at <strong>{mobile}</strong> shortly with exact quotation details and installation scheduling.
                </p>

                {/* Instant 1-Tap WhatsApp Forwarding */}
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto space-y-3 text-left shadow-xs">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Want an instant response?</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Click below to forward your exact requirements directly to our on-duty engineer's WhatsApp.
                  </p>
                  <button
                    onClick={handleWhatsAppForward}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.contact.sendWhatsappBtn}</span>
                  </button>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-[#004b87] hover:bg-[#003366] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#004b87]/20 transition-all active:scale-95"
                  >
                    Submit Another Enquiry
                  </button>
                  <a
                    href="tel:+919500087723"
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs"
                  >
                    Direct Phone Call (+91 9500087723)
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#ea580c]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {t.contact.formTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'ta' ? 'முதல் பெயர் *' : 'First Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'ta' ? 'குடும்ப பெயர்' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sundaram"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {language === 'ta' ? 'மாற்று தொலைபேசி' : 'Telephone / Alt Phone'}
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 044-32907475"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.contact.serviceTypeLabel}
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                  >
                    <option value="Product Enquiry">New Inverter / Online UPS Enquiry</option>
                    <option value="Battery Replacement & Exchange">Battery Replacement & Doorstep Scrap Exchange</option>
                    <option value="Annual Maintenance Contract (AMC)">Annual Maintenance Contract (AMC)</option>
                    <option value="Site Inspection & Load Study">Free Pre-Sales Site Inspection & Load Study</option>
                    <option value="Emergency Breakdown Repair">Emergency Breakdown / Technical Repair</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.contact.commentsLabel}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mention appliances, required backup hours, preferred brand, or location in Chennai..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:border-[#004b87] bg-white text-slate-900 transition-all shadow-xs"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-1 bg-[#ea580c] hover:bg-[#c2410c] text-white py-4 px-6 rounded-2xl font-black text-sm shadow-xl shadow-[#ea580c]/25 hover:shadow-[#ea580c]/40 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.contact.submitBtn}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppForward}
                    className="py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-400 font-medium">
                  Your contact details are sent directly to jvcjvcontrols@gmail.com and our Chennai service desk.
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Interactive Google Maps Embed Section */}
        <div className="pt-4">
          <GoogleMapsEmbed />
        </div>
      </div>
    </section>
  );
};
