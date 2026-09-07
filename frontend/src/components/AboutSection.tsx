import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Phone,
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

interface AboutSectionProps {
  onContactClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  return (
    <section id="about-section" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/70 text-[#004b87] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-[#004b87]" />
            <span>Chennai's Premier Power Engineering Authority</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            About JV Controls
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Delivering clean, dependable, and high-efficiency power protection systems for corporate campuses, medical facilities, data centers, and residences across Tamil Nadu.
          </p>
        </div>

        {/* Main Grid: 1 col on mobile/tablet portrait, 2 cols on lg desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
              <img
                src="./images/jvc_hq.png"
                alt="JV Controls HQ & Experience Center - Annanagar East, Chennai"
                className="w-full h-72 sm:h-80 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-6 text-white">
                <div>
                  <div className="text-lg font-black tracking-tight text-white">JV Controls HQ & Experience Center</div>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                    <span># 1, Kujji 2nd Street, Annanagar East, Chennai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {COMPANY_DATA.stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm text-center card-hover-lift transition-all duration-300 hover:border-[#004b87]/30 hover:shadow-md">
                  <div className="text-2xl sm:text-3xl font-black text-[#004b87] tracking-tight">{stat.value}</div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                Increasing uptime for critical applications with GREEN UPS & heavy-duty industrial storage
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>JV Controls</strong> delivers certified engineering solutions for mission-critical power stability and maximum uptime across Tamil Nadu through <strong>GREEN UPS architectures</strong> and <strong>high-efficiency certified industrial battery arrays</strong>.
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                We are authorized distributors dealing with global benchmark Online UPS systems including <strong>APC by Schneider Electric</strong>, <strong>Delta Power Solutions</strong>, and <strong>Vertiv / Emerson</strong>. Our inverter portfolio features trusted household and commercial mainstays: <strong>Microtek</strong>, <strong>Luminous</strong>, <strong>Crompton Greaves</strong>, <strong>Mahindra</strong>, <strong>Su-Kam</strong>, and <strong>Tribal</strong>.
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                For energy storage, we supply 100% factory-sealed deep-cycle tubular and SMF VRLA batteries from <strong>Amaron Quanta</strong> (manufactured under stringent QS 9000 & ISO norms), <strong>Exide Industries</strong>, and <strong>SF Sonic / SF Exide</strong>.
              </p>
            </div>

            {/* Core Values Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium">100% Genuine, factory-sealed units directly from manufacturers</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium">Free pre-sales load inspection and custom rating selection</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium">24x7 emergency response with rapid on-site engineer dispatch</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs card-hover-lift">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium">Doorstep old battery buyback credit and instant digital payment</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onContactClick}
                className="bg-[#004b87] hover:bg-[#003366] text-white px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-[#004b87]/20 active:scale-[0.98] transition-all text-center"
              >
                Contact Our Chennai Team
              </button>
              <a
                href="tel:+919500087723"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-[#ea580c] hover:text-[#ea580c] px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 text-center shadow-xs"
              >
                <Phone className="w-4 h-4 text-[#ea580c]" />
                <span>Call Hotline: +91 9500087723</span>
              </a>
            </div>
          </div>
        </div>

        {/* Authorized Brands Strip */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-slate-200">
          <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
            Authorized Brands & Strategic Technology Partners
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {COMPANY_DATA.authorizedBrands.map((brand, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs card-hover-lift hover:border-[#004b87]/40 hover:text-[#004b87] transition-all cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
