import React from 'react';
import { 
  ClipboardCheck, 
  Wrench, 
  Headphones, 
  ShieldCheck, 
  RefreshCw, 
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Zap,
  Phone
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';

interface ServicesSectionProps {
  onBookService: (serviceName?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onBookService }) => {
  return (
    <section id="services-section" className="py-16 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#004b87] border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs">
            <Wrench className="w-3.5 h-3.5" />
            <span>Turnkey Engineering & Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            End-to-End Power Backup & Maintenance Services
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            We don't just sell power systems—we handle the complete lifecycle from on-site load assessment to electrical installation, 24x7 breakdown repairs, AMC, and doorstep scrap exchange.
          </p>
        </div>

        {/* 6 Services Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {COMPANY_DATA.services.map((svc, idx) => (
            <div
              key={svc.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 hover:border-blue-400/60 shadow-xs hover:shadow-2xl card-hover-lift transition-all duration-300 flex flex-col justify-between group h-full"
            >
              <div>
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004b87] border border-blue-200/60 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#004b87] group-hover:text-white transition-all duration-300 shadow-xs">
                    {svc.id === 'presales' && <ClipboardCheck className="w-6 h-6" />}
                    {svc.id === 'installation' && <Wrench className="w-6 h-6" />}
                    {svc.id === 'aftersales' && <Headphones className="w-6 h-6" />}
                    {svc.id === 'amc' && <ShieldCheck className="w-6 h-6" />}
                    {svc.id === 'exchange' && <RefreshCw className="w-6 h-6" />}
                    {svc.id === 'payments' && <CreditCard className="w-6 h-6" />}
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#004b87] transition-colors mb-1 leading-snug">
                  {svc.title}
                </h3>
                <div className="text-xs font-black text-[#ea580c] mb-3">
                  {svc.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {svc.description}
                </p>

                {/* Key Points Checklist */}
                <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
                  {svc.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action Button */}
              <button
                onClick={() => onBookService(svc.title)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-[#004b87] hover:bg-[#004b87] hover:text-white text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 mt-auto active:scale-98 shadow-xs"
              >
                <span>Request {svc.title.split(' ')[0]} Assistance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* AMC & Doorstep Trade-in Banner */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-slate-950 via-[#003b66] to-[#004b87] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none hidden md:block">
            <ShieldCheck className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 shadow-xs">
              Preventive Maintenance & Breakdown SLA
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Protect Your Equipment With Our Comprehensive AMC
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Zero downtime guaranteed. Our certified electrical engineers provide scheduled 6-month checkups, distilled water top-ups, terminal cleaning, and 2-hour emergency on-site response in Chennai.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                onClick={() => onBookService('AMC Site Inspection & Battery Exchange')}
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-7 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-orange-950/40 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>Book AMC / Battery Exchange Visit</span>
              </button>
              <a
                href="tel:+919500087723"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 text-center active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Hotline: +91 9500087723</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
