import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  ChevronDown, 
  Zap, 
  Calculator, 
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldAlert,
  Languages,
  Wrench,
  Cpu,
  Battery,
  ShieldCheck,
  ArrowRight,
  User as UserIcon,
  LogIn,
  LogOut
} from 'lucide-react';
import { COMPANY_DATA } from '../data/companyData';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string, categoryFilter?: string, brandFilter?: string) => void;
  onOpenQuoteModal: () => void;
  onOpenAMCModal?: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onOpenPortal?: () => void;
  onOpenCustomerDashboard?: () => void;
  onOpenAdminPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onSelectTab, 
  onOpenQuoteModal,
  onOpenAMCModal,
  onOpenAuthModal,
  onOpenPortal,
  onOpenCustomerDashboard,
  onOpenAdminPortal
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePortalClick = () => {
    if (onOpenPortal) {
      onOpenPortal();
    } else if (isAdmin && onOpenAdminPortal) {
      onOpenAdminPortal();
    } else if (onOpenCustomerDashboard) {
      onOpenCustomerDashboard();
    }
  };
  
  // Mobile accordion states
  const [mobileProductsOpen, setMobileProductsOpen] = useState(true);
  const [mobileUpsOpen, setMobileUpsOpen] = useState(false);
  const [mobileInverterOpen, setMobileInverterOpen] = useState(false);
  const [mobileTubularOpen, setMobileTubularOpen] = useState(false);
  const [mobileSmfOpen, setMobileSmfOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (tab: string, cat?: string, brand?: string) => {
    onSelectTab(tab, cat, brand);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 transition-all duration-300">
      {/* Top Notification / Hotline Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-3 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left info: Address & Emergency */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                Plot 1957, 13th Main Rd, Annanagar East, Chennai - 600040
              </span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>24x7 Emergency Service</span>
            </span>
          </div>

          {/* Right info: Direct Phones & Language Pill */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold ml-auto">
            <a 
              href="tel:+919500087723" 
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors py-0.5 group"
            >
              <Phone className="w-3 h-3 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="font-bold">+91 9500087723</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a 
              href="tel:+919841619346" 
              className="hover:text-white transition-colors py-0.5 hidden sm:inline text-slate-400 hover:text-slate-200"
            >
              <span>+91 9841619346</span>
            </a>

            {/* Language Switcher Pill in Top Bar */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 transition-all hover:border-amber-400/50 active:scale-95 ml-1 shadow-xs"
              title="Switch to Tamil / English"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Top Bar Auth Status / Sign In */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-slate-800">
                <button
                  onClick={handlePortalClick}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-sky-950 text-sky-300 border border-sky-600/40 hover:bg-sky-900'
                  }`}
                  title={isAdmin ? 'Open Admin & Customer Portal' : 'Open My Portal'}
                >
                  {isAdmin ? (
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                  ) : (
                    <UserIcon className="w-3 h-3 text-sky-400" />
                  )}
                  <span className="max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded-sm">ADM</span>
                  )}
                </button>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-slate-800">
                <button
                  onClick={() => onOpenAuthModal?.('login')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <UserIcon className="w-3 h-3 text-amber-400" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div 
        className={`bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300 ${
          isScrolled ? 'py-2.5 shadow-md shadow-slate-900/5' : 'py-3.5 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Brand Logo (High-contrast typography with modern energy badge) */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#004b87] via-[#005fa8] to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#004b87] uppercase leading-none">
                  JV <span className="text-[#ea580c]">Controls</span>
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                Clean Power Systems • Chennai
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Visible on xl: >= 1280px) */}
          <nav className="hidden xl:flex items-center gap-1 font-medium text-sm text-slate-700">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'home' 
                  ? 'text-[#005696] font-bold bg-sky-50 shadow-xs' 
                  : 'hover:text-[#005696] hover:bg-slate-100/70'
              }`}
            >
              {t.nav.home}
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'about' 
                  ? 'text-[#005696] font-bold bg-sky-50 shadow-xs' 
                  : 'hover:text-[#005696] hover:bg-slate-100/70'
              }`}
            >
              {t.nav.about}
            </button>

            {/* Comprehensive Products Mega-Dropdown */}
            <div className="relative group py-2">
              <button
                onClick={() => handleNavClick('products')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'products' 
                    ? 'text-[#005696] font-bold bg-sky-50' 
                    : 'hover:text-[#005696] hover:bg-slate-100/70'
                }`}
              >
                <span>{t.nav.products}</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-slate-400" />
              </button>

              {/* Mega Dropdown Menu */}
              <div className="absolute top-full left-0 w-[680px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 grid grid-cols-2 gap-4">
                {/* 1. Online UPS */}
                <div className="p-3.5 rounded-xl hover:bg-sky-50/60 border border-transparent hover:border-sky-100 transition-all">
                  <div className="flex items-center gap-2 text-[#005696] font-bold text-sm mb-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>Online UPS Systems</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Double-conversion zero transfer time for critical IT & hospitals.
                  </p>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick('products', 'ups', 'APC')}
                      className="block w-full text-left text-slate-700 hover:text-[#005696] font-medium py-0.5"
                    >
                      • APC Smart-UPS RT (1kVA - 20kVA)
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'ups', 'Delta')}
                      className="block w-full text-left text-slate-700 hover:text-[#005696] font-medium py-0.5"
                    >
                      • Delta Ultron & Amplon Series
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'ups')}
                      className="block w-full text-left text-slate-700 hover:text-[#005696] font-medium py-0.5"
                    >
                      • 3-Phase Industrial UPS & Stabilizers
                    </button>
                  </div>
                </div>

                {/* 2. Inverters */}
                <div className="p-3.5 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-100 transition-all">
                  <div className="flex items-center gap-2 text-[#e65100] font-bold text-sm mb-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Home & Commercial Inverters</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Pure sine wave quiet operation for fans, computers, and lighting.
                  </p>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick('products', 'inverter', 'Microtek')}
                      className="block w-full text-left text-slate-700 hover:text-[#e65100] font-medium py-0.5"
                    >
                      • Microtek Pure Sine Wave (650VA - 2.5kVA)
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'inverter', 'Luminous')}
                      className="block w-full text-left text-slate-700 hover:text-[#e65100] font-medium py-0.5"
                    >
                      • Luminous Eco Volt & Cruze Series
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'inverter')}
                      className="block w-full text-left text-slate-700 hover:text-[#e65100] font-medium py-0.5"
                    >
                      • Crompton, Mahindra & Su-Kam
                    </button>
                  </div>
                </div>

                {/* 3. Tubular Batteries */}
                <div className="p-3.5 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1.5">
                    <Battery className="w-4 h-4" />
                    <span>Deep-Cycle Tubular Batteries</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Long life, heavy cyclic duty with doorstep old battery exchange.
                  </p>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick('products', 'tubular-battery', 'Exide')}
                      className="block w-full text-left text-slate-700 hover:text-emerald-700 font-medium py-0.5"
                    >
                      • Exide Inva Tubular (100Ah - 220Ah)
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'tubular-battery', 'SF')}
                      className="block w-full text-left text-slate-700 hover:text-emerald-700 font-medium py-0.5"
                    >
                      • SF Sonic / SF Exide Powerbox
                    </button>
                  </div>
                </div>

                {/* 4. SMF VRLA Batteries */}
                <div className="p-3.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-100 transition-all">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sealed SMF / VRLA Batteries</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Maintenance-free sealed batteries for UPS and telecom racks.
                  </p>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => handleNavClick('products', 'smf-battery', 'Amaron')}
                      className="block w-full text-left text-slate-700 hover:text-purple-700 font-medium py-0.5"
                    >
                      • Amaron Quanta (QS 9000 Certified)
                    </button>
                    <button
                      onClick={() => handleNavClick('products', 'smf-battery', 'Exide')}
                      className="block w-full text-left text-slate-700 hover:text-purple-700 font-medium py-0.5"
                    >
                      • Exide Powersafe SMF (7Ah - 100Ah)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'services' 
                  ? 'text-[#005696] font-bold bg-sky-50 shadow-xs' 
                  : 'hover:text-[#005696] hover:bg-slate-100/70'
              }`}
            >
              {t.nav.services}
            </button>

            {/* Load Calculator Pill */}
            <button
              onClick={() => handleNavClick('calculator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'calculator' 
                  ? 'text-white bg-[#e65100] shadow-md shadow-orange-900/20' 
                  : 'text-[#e65100] bg-orange-50 hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{t.nav.calculator}</span>
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === 'contact' 
                  ? 'text-[#005696] font-bold bg-sky-50 shadow-xs' 
                  : 'hover:text-[#005696] hover:bg-slate-100/70'
              }`}
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Desktop Right Actions (xl and up) */}
          <div className="hidden xl:flex items-center gap-2.5 shrink-0">
            {/* Unified Auth / Portal Action Pill */}
            {user ? (
              <div className={`flex items-center gap-1 border rounded-xl p-1 shadow-xs ${
                isAdmin 
                  ? 'bg-amber-50 border-amber-300/80' 
                  : 'bg-sky-50 border-sky-200/80'
              }`}>
                <button
                  onClick={handlePortalClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    isAdmin
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs'
                      : 'text-[#005696] hover:bg-sky-100/60'
                  }`}
                  title={isAdmin ? 'Open Admin & Customer Portal' : 'Open My Portal'}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isAdmin ? 'bg-white text-amber-800' : 'bg-[#005696] text-white'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                      Admin
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.('login')}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>
            )}

            {onOpenAMCModal && (
              <button
                onClick={onOpenAMCModal}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl font-bold text-xs transition-colors shadow-xs"
              >
                <Wrench className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'ta' ? 'அவசர AMC' : 'Book AMC'}</span>
              </button>
            )}

            <button
              onClick={onOpenQuoteModal}
              className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-900/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>{t.nav.requestQuote}</span>
            </button>
          </div>

          {/* Tablet & Mobile Right Action Hub (Visible below xl) */}
          <div className="xl:hidden flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <button
                onClick={handlePortalClick}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                  isAdmin 
                    ? 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white ring-2 ring-amber-300' 
                    : 'bg-[#005696] text-white'
                }`}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.('login')}
                className="p-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                title="Sign In"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
              </button>
            )}

            {onOpenAMCModal && (
              <button
                onClick={onOpenAMCModal}
                className="hidden sm:flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold"
              >
                <Wrench className="w-3.5 h-3.5 text-rose-600" />
                <span>AMC</span>
              </button>
            )}

            <button
              onClick={onOpenQuoteModal}
              className="flex items-center gap-1 bg-[#ea580c] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95"
            >
              <Zap className="w-3 h-3 text-amber-200 fill-amber-200" />
              <span>Quote</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-700 hover:text-[#005696] rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors active:scale-95 ml-0.5"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Mobile Drawer Modal (100% responsive, zero clipping) */}
      {mobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header with Close Button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004b87] to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <div className="font-black text-[#004b87] text-base uppercase leading-none">
                    JV <span className="text-[#ea580c]">Controls</span>
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase mt-0.5">
                    Chennai Power Solutions
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <Languages className="w-3.5 h-3.5 text-[#005696]" />
                  <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Drawer User Status / Auth Quick Actions */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
              {user ? (
                <div className="flex items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-xs ${
                      isAdmin ? 'bg-gradient-to-tr from-amber-600 to-orange-600' : 'bg-[#004b87]'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isAdmin && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">Admin</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handlePortalClick();
                      }}
                      className={`p-2 rounded-lg text-xs font-bold shadow-xs text-white ${
                        isAdmin ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#004b87] hover:bg-[#003b6b]'
                      }`}
                      title={isAdmin ? 'Open Admin & Customer Portal' : 'Open My Portal'}
                    >
                      {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal?.('login');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 shadow-xs active:scale-95 transition-all"
                >
                  <UserIcon className="w-4 h-4 text-[#004b87]" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>

            {/* Scrollable Navigation Items */}
            <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  activeTab === 'home' ? 'bg-sky-50 text-[#005696]' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.nav.home}
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  activeTab === 'about' ? 'bg-sky-50 text-[#005696]' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.nav.about}
              </button>

              {/* Products Accordion Section */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden my-2">
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 font-bold text-sm text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#005696]" />
                    <span>{t.nav.products}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileProductsOpen && (
                  <div className="p-2 bg-white space-y-1 border-t border-slate-100 text-xs">
                    {/* Online UPS */}
                    <div className="p-2 rounded-xl bg-slate-50/70">
                      <div className="font-bold text-[#005696] mb-1 flex items-center justify-between">
                        <span>Online UPS Systems</span>
                        <button
                          onClick={() => handleNavClick('products', 'ups')}
                          className="text-[10px] text-sky-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="pl-2 space-y-1 text-slate-600">
                        <button onClick={() => handleNavClick('products', 'ups', 'APC')} className="block hover:text-[#005696]">
                          • APC Smart-UPS RT (1kVA - 20kVA)
                        </button>
                        <button onClick={() => handleNavClick('products', 'ups', 'Delta')} className="block hover:text-[#005696]">
                          • Delta Ultron & Amplon Series
                        </button>
                      </div>
                    </div>

                    {/* Inverters */}
                    <div className="p-2 rounded-xl bg-slate-50/70">
                      <div className="font-bold text-[#e65100] mb-1 flex items-center justify-between">
                        <span>Home & Office Inverters</span>
                        <button
                          onClick={() => handleNavClick('products', 'inverter')}
                          className="text-[10px] text-orange-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="pl-2 space-y-1 text-slate-600">
                        <button onClick={() => handleNavClick('products', 'inverter', 'Microtek')} className="block hover:text-[#e65100]">
                          • Microtek Pure Sine Wave
                        </button>
                        <button onClick={() => handleNavClick('products', 'inverter', 'Luminous')} className="block hover:text-[#e65100]">
                          • Luminous Eco Volt & Cruze
                        </button>
                      </div>
                    </div>

                    {/* Tubular Batteries */}
                    <div className="p-2 rounded-xl bg-slate-50/70">
                      <div className="font-bold text-emerald-800 mb-1 flex items-center justify-between">
                        <span>Deep-Cycle Tubular Batteries</span>
                        <button
                          onClick={() => handleNavClick('products', 'tubular-battery')}
                          className="text-[10px] text-emerald-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="pl-2 space-y-1 text-slate-600">
                        <button onClick={() => handleNavClick('products', 'tubular-battery', 'Exide')} className="block hover:text-emerald-800">
                          • Exide Inva Tubular Series
                        </button>
                        <button onClick={() => handleNavClick('products', 'tubular-battery', 'SF')} className="block hover:text-emerald-800">
                          • SF Sonic Powerhouse
                        </button>
                      </div>
                    </div>

                    {/* SMF Batteries */}
                    <div className="p-2 rounded-xl bg-slate-50/70">
                      <div className="font-bold text-purple-800 mb-1 flex items-center justify-between">
                        <span>Sealed SMF / VRLA Batteries</span>
                        <button
                          onClick={() => handleNavClick('products', 'smf-battery')}
                          className="text-[10px] text-purple-600 hover:underline"
                        >
                          View All
                        </button>
                      </div>
                      <div className="pl-2 space-y-1 text-slate-600">
                        <button onClick={() => handleNavClick('products', 'smf-battery', 'Amaron')} className="block hover:text-purple-800">
                          • Amaron Quanta (QS 9000)
                        </button>
                        <button onClick={() => handleNavClick('products', 'smf-battery', 'Exide')} className="block hover:text-purple-800">
                          • Exide Powersafe SMF
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('services')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  activeTab === 'services' ? 'bg-sky-50 text-[#005696]' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.nav.services}
              </button>

              <button
                onClick={() => handleNavClick('calculator')}
                className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-[#e65100] bg-orange-50 border border-orange-200 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>{t.nav.calculator}</span>
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  activeTab === 'contact' ? 'bg-sky-50 text-[#005696]' : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.nav.contact}
              </button>
            </div>

            {/* Mobile Footer Action Panel */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2.5 shrink-0">
              {onOpenAMCModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAMCModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-xl font-bold text-xs shadow-xs"
                >
                  <Wrench className="w-4 h-4 text-rose-600" />
                  <span>{t.nav.amcService}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 active:scale-[0.98] transition-all"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>{t.nav.requestQuote}</span>
              </button>

              <a
                href="tel:+919500087723"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Hotline: +91 9500087723</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
