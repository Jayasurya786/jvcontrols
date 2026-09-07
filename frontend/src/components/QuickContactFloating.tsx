import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

export const QuickContactFloating: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none select-none">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="pointer-events-auto p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1 active:scale-95 duration-200"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${COMPANY_DATA.whatsappNumber}?text=Hello%20JV%20Controls,%20I%20am%20looking%20for%20inverter%20/%20UPS%20/%20battery%20solutions%20in%20Chennai.`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3.5 sm:px-4.5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-600/40 transition-all duration-300 hover:-translate-y-1.5 active:scale-95 group border-2 border-white/20"
        aria-label="Chat on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-black tracking-wide hidden sm:inline group-hover:inline">
          WhatsApp Us
        </span>
      </a>

      {/* Direct Call Floating Button */}
      <a
        href="tel:+919500087723"
        className="pointer-events-auto relative flex items-center gap-2.5 bg-[#004b87] hover:bg-[#003366] active:bg-[#002244] text-white p-3.5 sm:px-4.5 sm:py-3.5 rounded-full shadow-2xl shadow-[#004b87]/40 transition-all duration-300 hover:-translate-y-1.5 active:scale-95 group border-2 border-white/20"
        aria-label="Call JV Controls Hotline"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ea580c]"></span>
        </span>
        <Phone className="w-5 h-5" />
        <span className="text-xs font-black tracking-wide hidden sm:inline group-hover:inline">
          +91 9500087723
        </span>
      </a>
    </div>
  );
};
