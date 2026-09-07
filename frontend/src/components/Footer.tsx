import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string, cat?: string, brand?: string) => void;
  onOpenQuoteModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenQuoteModal }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs sm:text-sm border-t border-slate-800/80 select-none relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#004b87]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 relative z-10">
        
        {/* Brand Summary Column */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#004b87] to-[#002b4d] flex items-center justify-center text-white shadow-lg shadow-[#004b87]/30 border border-white/20">
              <Zap className="w-6 h-6 text-amber-400 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white uppercase tracking-tight">
                JV <span className="text-[#ea580c]">Controls</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Clean Power Solutions & Engineering
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            JV Controls delivers verified, clean power solutions and mission-critical uptime for corporate enterprises, healthcare, industries, and residential premises across Chennai and Tamil Nadu.
          </p>

          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Authorized Strategic Partners
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              APC by Schneider Electric • Delta / Vertiv • Microtek • Luminous • Exide • SF Sonic • Amaron Quanta • Crompton Greaves • Su-Kam
            </p>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2.5">
            Quick Navigation
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button 
                onClick={() => onNavClick('home')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('about')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>About Us</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('products', 'ups')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Online UPS</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('products', 'inverter')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Inverters</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('products', 'tubular-battery')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Tubular Battery</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('products', 'smf-battery')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>SMF Battery</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('services')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Services & AMC</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('calculator')}
                className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-amber-400 font-bold"
              >
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Calculator</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavClick('contact')}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Contact Us</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Specialized Services */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2.5">
            Engineering Services
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>Pre-Sales Site Load Assessment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>Turnkey UPS Installation & Commissioning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>Comprehensive Annual Maintenance (AMC)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>Doorstep Old Battery Buyback & Scrap Trade-In</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>Doorstep Card Swipe & Instant Digital Payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ea580c] font-black">•</span>
              <span>24x7 Emergency Breakdown Field Support</span>
            </li>
          </ul>
        </div>

        {/* Direct Contact Info */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2.5">
            Chennai Headquarters
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">JV Controls</strong><br />
                # 1, Kujji 2nd Street,<br />
                Annanagar East,<br />
                Chennai - 600 102. Tamil Nadu, INDIA
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div>
                  <a href="tel:+919500087723" className="text-amber-400 font-bold hover:underline">
                    +91 - 9500087723
                  </a> <span className="text-[10px] bg-slate-800 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-bold ml-1">(Primary)</span>
                </div>
                <div>
                  <a href="tel:+919841619346" className="text-slate-300 hover:underline">
                    +91 - 9841619346
                  </a> <span className="text-[10px] text-slate-500">(Alternate)</span>
                </div>
                <div>
                  <a href="tel:04432907475" className="text-slate-300 hover:underline">
                    044 - 32907475
                  </a> <span className="text-[10px] text-slate-500">(Landline)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-slate-800/80">
              <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <a href="mailto:jvcjvcontrols@gmail.com" className="text-slate-300 hover:underline">
                  jvcjvcontrols@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-slate-900 border-t border-slate-800 py-6 text-[11px] sm:text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            Copyright © {new Date().getFullYear()} <span className="text-slate-300 font-bold">JV Controls</span>. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Annanagar East, Chennai - 600 040</span>
            <span>•</span>
            <button onClick={onOpenQuoteModal} className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors">
              Request Fast Quote
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
