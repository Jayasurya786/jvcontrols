import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Lightbulb, 
  Fan, 
  Tv, 
  Monitor, 
  Laptop, 
  Refrigerator, 
  Wifi, 
  BatteryCharging, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  HelpCircle,
  RotateCcw,
  RefreshCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ApplianceConfig {
  id: string;
  nameEn: string;
  nameTa: string;
  wattage: number;
  icon: any;
  defaultCount: number;
}

const APPLIANCES: ApplianceConfig[] = [
  { id: 'lights', nameEn: 'LED / CFL Bulbs', nameTa: 'LED / CFL பல்புகள்', wattage: 20, icon: Lightbulb, defaultCount: 4 },
  { id: 'fans', nameEn: 'Ceiling Fans', nameTa: 'மின்விசிறிகள்', wattage: 75, icon: Fan, defaultCount: 3 },
  { id: 'tv', nameEn: 'LED Television (32" - 55")', nameTa: 'LED தொலைக்காட்சி', wattage: 100, icon: Tv, defaultCount: 1 },
  { id: 'desktop', nameEn: 'Desktop PC & Monitor', nameTa: 'கணினி & மானிட்டர்', wattage: 200, icon: Monitor, defaultCount: 0 },
  { id: 'laptop', nameEn: 'Laptop / Mobile Charger', nameTa: 'லேப்டாப் / மொபைல் சார்ஜர்', wattage: 65, icon: Laptop, defaultCount: 1 },
  { id: 'fridge', nameEn: 'Single-Door Refrigerator', nameTa: 'குளிர்சாதனப் பெட்டி (பிரிட்ஜ்)', wattage: 250, icon: Refrigerator, defaultCount: 0 },
  { id: 'wifi', nameEn: 'Wi-Fi Router & Setup Box', nameTa: 'வைஃபை ரூட்டர் & செட் டாப் பாக்ஸ்', wattage: 25, icon: Wifi, defaultCount: 1 },
];

const PRESETS = [
  {
    nameEn: '1 BHK Essential',
    nameTa: '1 BHK அத்தியாவசியம்',
    counts: { lights: 3, fans: 2, tv: 1, desktop: 0, laptop: 1, fridge: 0, wifi: 1 },
    hours: 3
  },
  {
    nameEn: '2-3 BHK Standard',
    nameTa: '2-3 BHK வழக்கமானது',
    counts: { lights: 5, fans: 3, tv: 1, desktop: 0, laptop: 2, fridge: 0, wifi: 1 },
    hours: 4
  },
  {
    nameEn: 'Small Office / Clinic',
    nameTa: 'சிறு அலுவலகம் / கிளினிக்',
    counts: { lights: 6, fans: 4, tv: 0, desktop: 2, laptop: 2, fridge: 0, wifi: 2 },
    hours: 3
  }
];

interface LoadCalculatorProps {
  onQuoteWithCalculatedLoad?: (watts: number, va: number, ah: number, hours: number) => void;
}

export const LoadCalculator: React.FC<LoadCalculatorProps> = ({
  onQuoteWithCalculatedLoad
}) => {
  const { t, language } = useLanguage();
  const [counts, setCounts] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    APPLIANCES.forEach((app) => {
      initial[app.id] = app.defaultCount;
    });
    return initial;
  });

  const [desiredHours, setDesiredHours] = useState<number>(4);

  const updateCount = (id: string, delta: number) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setCounts({ ...preset.counts });
    setDesiredHours(preset.hours);
  };

  const resetCalculator = () => {
    const initial: { [key: string]: number } = {};
    APPLIANCES.forEach((app) => {
      initial[app.id] = app.defaultCount;
    });
    setCounts(initial);
    setDesiredHours(4);
  };

  // Total continuous running watts
  const totalWatts = useMemo(() => {
    return APPLIANCES.reduce((sum, app) => {
      return sum + (counts[app.id] || 0) * app.wattage;
    }, 0);
  }, [counts]);

  // Recommended Inverter VA = Watts / Power Factor (0.7) with 20% safety headroom
  const recommendedVA = useMemo(() => {
    if (totalWatts === 0) return 0;
    const va = (totalWatts / 0.7) * 1.2;
    if (va <= 650) return 650;
    if (va <= 850) return 850;
    if (va <= 1000) return 1000;
    if (va <= 1400) return 1400;
    if (va <= 1500) return 1500;
    if (va <= 2000) return 2000;
    return Math.ceil(va / 500) * 500;
  }, [totalWatts]);

  // Recommended Battery Ah = (Total Watts * Hours) / (Battery Volts * Inverter Efficiency 0.8)
  const recommendedAh = useMemo(() => {
    if (totalWatts === 0) return 0;
    const voltage = recommendedVA >= 1400 ? 24 : 12;
    const ahRaw = (totalWatts * desiredHours) / (voltage * 0.8);
    if (ahRaw <= 100) return 100;
    if (ahRaw <= 130) return 130;
    if (ahRaw <= 150) return 150;
    if (ahRaw <= 180) return 180;
    if (ahRaw <= 200) return 200;
    return 220;
  }, [totalWatts, desiredHours, recommendedVA]);

  const recommendedBatterySystem = recommendedVA >= 1400 ? '24V (2 Batteries in Series)' : '12V (1 Battery)';

  return (
    <section id="calculator-section" className="py-16 sm:py-20 bg-gradient-to-b from-white to-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.calculator.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t.calculator.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t.calculator.subtitle}
          </p>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              {language === 'ta' ? 'மாதிரி அமைப்புகள்:' : 'Quick Presets:'}
            </span>
            {PRESETS.map((p, pIdx) => (
              <button
                key={pIdx}
                onClick={() => applyPreset(p)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#004b87] text-xs font-bold transition-all border border-slate-200/90 hover:border-blue-300 shadow-xs active:scale-95"
              >
                {language === 'ta' ? p.nameTa : p.nameEn}
              </button>
            ))}
            <button
              onClick={resetCalculator}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-xs"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Appliance Selection Grid */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>1. Select Appliances to Run Simultaneously</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Tap + / - to adjust quantity</span>
            </div>

            <div className="space-y-3">
              {APPLIANCES.map((app) => {
                const Icon = app.icon;
                const count = counts[app.id] || 0;
                const isSelected = count > 0;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-400/60 bg-blue-50/30 shadow-xs'
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-gradient-to-tr from-[#004b87] to-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          {language === 'ta' ? app.nameTa : app.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                          <span>~{app.wattage} Watts each</span>
                          {count > 0 && (
                            <span className="font-extrabold text-[#004b87]">
                              = {count * app.wattage} W
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stepper Buttons (40px touch targets for mobile) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      <button
                        onClick={() => updateCount(app.id, -1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-base flex items-center justify-center transition-colors select-none active:scale-95 shadow-xs"
                        aria-label={`Decrease ${app.nameEn}`}
                      >
                        -
                      </button>
                      <span className="w-7 sm:w-8 text-center font-black text-slate-900 text-sm sm:text-base">
                        {count}
                      </span>
                      <button
                        onClick={() => updateCount(app.id, 1)}
                        className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-[#004b87] font-black text-base flex items-center justify-center transition-colors select-none active:scale-95 shadow-xs"
                        aria-label={`Increase ${app.nameEn}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desired Backup Hours Slider */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. {t.calculator.backupHours}</span>
                </label>
                <span className="text-xs sm:text-sm font-extrabold text-[#004b87] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 self-start sm:self-auto shadow-xs">
                  {desiredHours} {language === 'ta' ? 'மணி நேர பேக்கப்' : 'Hours of Continuous Power'}
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={desiredHours}
                onChange={(e) => setDesiredHours(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004b87]"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
                <span>2 Hrs</span>
                <span>4 Hrs (Standard)</span>
                <span>6 Hrs</span>
                <span>8 Hrs</span>
                <span>10 Hrs (Deep)</span>
              </div>
            </div>
          </div>

          {/* Sizing Results Panel (Sticky on desktop with high-tech glowing border) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#002f52] to-[#001d33] text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 lg:sticky lg:top-28 border border-white/10 backdrop-blur-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 shadow-xs">
                {language === 'ta' ? 'பரிந்துரைக்கப்படும் அளவு' : 'Recommended Configuration'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2.5 tracking-tight">
                {language === 'ta' ? 'தேவையான இன்வெர்ட்டர் & பேட்டரி' : 'Recommended System Sizing'}
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Total Wattage */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300">{t.calculator.estimatedWatts}</div>
                  <div className="text-xs text-slate-400">Sum of selected appliances</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {totalWatts} <span className="text-xs text-amber-400 font-normal">Watts</span>
                </div>
              </div>

              {/* Recommended Inverter VA */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300">{t.calculator.recommendedInverter}</div>
                  <div className="text-xs text-amber-300 font-semibold mt-0.5">
                    Pure Sine Wave Technology
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  {recommendedVA > 0 ? `${recommendedVA} VA` : '0 VA'}
                </div>
              </div>

              {/* Recommended Battery Ah */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300">{t.calculator.recommendedBattery}</div>
                  <div className="text-xs text-emerald-300 font-semibold mt-0.5">
                    {recommendedBatterySystem}
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {recommendedAh > 0 ? `${recommendedAh} Ah` : '0 Ah'}
                </div>
              </div>
            </div>

            {/* Scrap Buyback Banner */}
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
              <RefreshCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Have an old battery?</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Exchange your dead/old battery for an instant scrap discount of ₹2,000 – ₹2,500 on new Exide or Amaron purchases!
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                if (onQuoteWithCalculatedLoad) {
                  onQuoteWithCalculatedLoad(totalWatts, recommendedVA, recommendedAh, desiredHours);
                }
              }}
              disabled={totalWatts === 0}
              className="w-full py-4 px-6 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-sm shadow-xl shadow-orange-950/40 hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              <span>{t.calculator.quoteThisLoad}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Includes doorstep delivery, unboxing, cabling, and certified testing in Chennai.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
