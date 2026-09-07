import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  RefreshCw,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroSliderProps {
  onExploreProducts: () => void;
  onOpenCalculator: () => void;
  onOpenQuoteModal: () => void;
}

const SLIDES = [
  {
    image: './images/slide4_hd.jpg',
    badgeEn: 'Certified Power Partner in Chennai',
    badgeTa: 'சென்னையின் அங்கீகரிக்கப்பட்ட பவர் பார்ட்னர்',
    titleEn: 'Clean & Uninterrupted Power Solutions',
    titleTa: 'தடையில்லா தூய மின்சக்தி தீர்வுகள்',
    highlightEn: 'Online UPS & Heavy Inverters',
    highlightTa: 'Online UPS & இன்வெர்ட்டர்கள்',
    descriptionEn: 'Providing mission-critical power systems for corporate IT parks, hospitals, educational institutions, and residences across Tamil Nadu. Genuine APC, Vertiv, Delta, and Microtek solutions.',
    descriptionTa: 'கார்ப்பரேட் ஐடி பூங்காக்கள், மருத்துவமனைகள், தொழிற்சாலைகள் மற்றும் வீடுகளுக்கான உயர்தர APC, Delta, Vertiv மற்றும் Microtek மின் காப்பு தீர்வுகள்.',
    ctaPrimaryEn: 'Explore Online UPS',
    ctaPrimaryTa: 'Online UPS காண்க',
    categoryTarget: 'ups'
  },
  {
    image: './images/slide2_hd.jpg',
    badgeEn: 'Extended Backup Tubular & SMF Series',
    badgeTa: 'நீண்ட நேரம் இயங்கும் டியூப்ளர் & SMF பேட்டரிகள்',
    titleEn: 'Maximum Backup Hours During Power Outages',
    titleTa: 'மின்தடையிலும் நீண்ட நேர பேக்கப் உத்திரவாதம்',
    highlightEn: 'Exide, SF Sonic & Amaron Quanta',
    highlightTa: 'எக்ஸைடு & அமரான் குவாண்டா',
    descriptionEn: 'Heavy-duty deep-cycle tubular batteries and sealed maintenance-free (SMF) batteries designed to handle severe summer cuts with rapid recharge technology.',
    descriptionTa: 'வேகமாக சார்ஜ் ஆகும் அதிநவீன டீப்-சைக்கிள் டியூப்ளர் மற்றும் சீல்டு மெயின்டனன்ஸ் ஃப்ரீ (SMF) பேட்டரிகள்.',
    ctaPrimaryEn: 'Browse Batteries',
    ctaPrimaryTa: 'பேட்டரிகளை காண்க',
    categoryTarget: 'tubular-battery'
  },
  {
    image: './images/slide3_hd.jpg',
    badgeEn: 'Turnkey Support & Certified Engineers',
    badgeTa: 'டோர்ஸ்டெப் சேவை & சான்றளிக்கப்பட்ட பொறியாளர்கள்',
    titleEn: 'Complete Lifecycle Support & Doorstep AMC',
    titleTa: 'முழுமையான சர்வீஸ் & டோர்ஸ்டெப் AMC',
    highlightEn: 'Exchange Old Batteries for Instant Scrap Value',
    highlightTa: 'பழைய பேட்டரிக்கு உடனடி கழிவு மதிப்பு',
    descriptionEn: 'Free site load study, safe positioning, turnkey electrical commissioning, 24x7 emergency breakdown response, and portable card swipe machines right at your doorstep.',
    descriptionTa: 'இலவச சுமை ஆய்வு, பாதுகாப்பான நிறுவுதல், 24x7 அவசர பழுதுநீக்கல் மற்றும் வீட்டுக்கே வரும் ஸ்வைப் மெஷின் வசதி.',
    ctaPrimaryEn: 'Book Site Inspection',
    ctaPrimaryTa: 'இலவச ஆய்வு பதிவு',
    categoryTarget: 'services'
  }
];

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onExploreProducts,
  onOpenCalculator,
  onOpenQuoteModal
}) => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white select-none">
      {/* Background Slides */}
      <div className="relative min-h-[500px] sm:min-h-[540px] lg:min-h-[600px] flex items-center">
        {SLIDES.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.titleEn}
              className="w-full h-full object-cover object-center brightness-[0.28] scale-105 transition-transform duration-7000 ease-out"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Subtle multi-layer gradient overlay for high contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>
        ))}

        {/* Slide Foreground Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24 z-10 w-full">
          <div className="max-w-3xl">
            {/* Modern Glass Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-bold mb-4 sm:mb-6 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{language === 'ta' ? slide.badgeTa : slide.badgeEn}</span>
            </div>

            {/* Main Responsive Heading with High-Tech Font Scaling */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white mb-4 sm:mb-5">
              {language === 'ta' ? slide.titleTa : slide.titleEn}{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 mt-1.5">
                {language === 'ta' ? slide.highlightTa : slide.highlightEn}
              </span>
            </h1>

            {/* Clean Description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-7 sm:mb-9 leading-relaxed max-w-2xl font-normal">
              {language === 'ta' ? slide.descriptionTa : slide.descriptionEn}
            </p>

            {/* Action Buttons - Responsive on Mobile/Tablet */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onExploreProducts}
                className="flex items-center justify-center gap-2.5 bg-[#004b87] hover:bg-[#003866] text-white px-7 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-950/50 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
              >
                <span>{language === 'ta' ? slide.ctaPrimaryTa : slide.ctaPrimaryEn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCalculator}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-4 rounded-2xl font-bold text-sm backdrop-blur-md transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{t.calculator.title}</span>
              </button>

              <button
                onClick={onOpenQuoteModal}
                className="flex items-center justify-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-950/40 hover:shadow-orange-600/30 transition-all hover:-translate-y-1 active:scale-[0.98]"
              >
                <span>{t.hero.quoteBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Left & Right Slide Controls */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust & Guarantee Banner with Elevated Glass Cards */}
      <div className="border-t border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-5 sm:py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white tracking-tight">{t.hero.statDealers}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">APC, Delta, Microtek, Exide</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white tracking-tight">{t.hero.statUptime}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pure Sine Wave Inverters</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white tracking-tight">{t.hero.statSupport}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Annanagar East Service Hub</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white tracking-tight">Doorstep Battery Buyback</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Old Battery Scrap Discount</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
