import React from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const GoogleMapsEmbed: React.FC = () => {
  const { t, language } = useLanguage();

  const mapsSearchUrl =
    'https://www.google.com/maps/search/?api=1&query=Plot+No.+1957,+13th+Main+Road,+Annanagar+East,+Chennai+-+600+040';

  // OpenStreetMap / Google Maps embed query
  const embedUrl =
    'https://maps.google.com/maps?q=13.0882,80.2185+(JV+Controls+Annanagar+East+Chennai)&t=&z=15&ie=UTF8&iwloc=B&output=embed';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg card-hover-lift">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#004b87]/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{language === 'ta' ? 'அமைவிடம் & கூகுள் மேப்' : 'Verified Google Maps Location'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
            JV Controls Head Office & Experience Center
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600 040. Tamil Nadu, INDIA
          </p>
        </div>

        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#ea580c]/25 transition-all shrink-0 active:scale-95 relative z-10"
        >
          <Navigation className="w-4 h-4" />
          <span>{t.contact.directionsBtn}</span>
        </a>
      </div>

      {/* Interactive Map Iframe */}
      <div className="relative w-full h-72 sm:h-88 bg-slate-100">
        <iframe
          title="JV Controls Anna Nagar East Chennai Location"
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

        {/* Floating Quick Pin Card */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xl text-xs hidden sm:block">
          <div className="font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Anna Nagar East Center</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Near Anna Nagar East Metro Station</div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#ea580c] shrink-0" />
          <span><strong>Mon - Sat:</strong> 9:00 AM - 8:30 PM</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>In-Person:</strong> Live Demo & Load Testing</span>
        </div>
        <a href="tel:+919500087723" className="flex items-center gap-2.5 hover:text-[#004b87] font-semibold transition-colors">
          <Phone className="w-4 h-4 text-[#004b87] shrink-0" />
          <span><strong>Hotline:</strong> +91 9500087723</span>
        </a>
      </div>
    </div>
  );
};

