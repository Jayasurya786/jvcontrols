import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Factory, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BrandBadgesSection: React.FC = () => {
  const { language } = useLanguage();

  const brands = [
    {
      name: 'APC by Schneider Electric',
      roleEn: 'Authorized Online UPS Partner',
      roleTa: 'அங்கீகரிக்கப்பட்ட Online UPS பார்ட்னர்',
      badge: 'Elite Partner',
      color: 'bg-emerald-600',
    },
    {
      name: 'Microtek International',
      roleEn: 'Premier Channel Partner',
      roleTa: 'முதன்மை சேனல் பார்ட்னர்',
      badge: 'Certified Partner',
      color: 'bg-blue-700',
    },
    {
      name: 'Luminous Power Technologies',
      roleEn: 'Authorized Inverter Dealer',
      roleTa: 'அங்கீகரிக்கப்பட்ட இன்வெர்ட்டர் டீலர்',
      badge: 'Platinum Dealer',
      color: 'bg-sky-600',
    },
    {
      name: 'Exide Industries Ltd.',
      roleEn: 'Authorized Tubular Battery Store',
      roleTa: 'அங்கீகரிக்கப்பட்ட எக்ஸைடு பேட்டரி விற்பனையகம்',
      badge: 'Authorized Stockist',
      color: 'bg-rose-700',
    },
    {
      name: 'Amaron Quanta (Amara Raja)',
      roleEn: 'Industrial SMF VRLA Specialist',
      roleTa: 'தொழில்துறை SMF பேட்டரி நிபுணர்',
      badge: 'QS 9000 Certified',
      color: 'bg-green-700',
    },
    {
      name: 'Delta Power Solutions / Vertiv',
      roleEn: 'Enterprise UPS Solution Provider',
      roleTa: 'எண்டர்பிரைஸ் UPS தீர்வு பார்ட்னர்',
      badge: 'Enterprise Partner',
      color: 'bg-indigo-700',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-100 to-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'ta' ? 'அதிகாரப்பூர்வ டீலர்ஷிப்' : 'Direct Manufacturer Authorization'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'ta'
              ? 'அங்கீகரிக்கப்பட்ட பிராண்ட் பார்ட்னர்ஷிப் சான்றுகள்'
              : 'Certified Dealerships & Quality Credentials'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {language === 'ta'
              ? 'எங்களிடம் வாங்கும் ஒவ்வொரு உபகரணமும் 100% நேரடி தொழிற்சாலை உத்தரவாதத்துடன் வழங்கப்படுகிறது.'
              : 'Every unit sold by JV Controls comes with genuine manufacturer barcodes, authentic warranty registration cards, and factory-sealed packaging.'}
          </p>
        </div>

        {/* Brand Badges Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {brands.map((b, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-400/60 card-hover-lift flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base group-hover:text-[#004b87] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-[#004b87] transition-colors shrink-0">
                    <Factory className="w-4 h-4" />
                  </div>
                  <span>{b.name}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-9">
                  {language === 'ta' ? b.roleTa : b.roleEn}
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shrink-0 shadow-xs ${b.color}`}
              >
                {b.badge}
              </span>
            </div>
          ))}
        </div>

        {/* Trust Badges Strip */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center sm:items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">100% Factory Sealed</div>
              <div className="text-xs text-slate-400 mt-0.5">Original packaging with verified serial numbers.</div>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Direct On-Site Warranty</div>
              <div className="text-xs text-slate-400 mt-0.5">Official manufacturer service across Tamil Nadu.</div>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Doorstep Battery Exchange</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant fair scrap buyback value for old batteries.</div>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-400/10 text-orange-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">24x7 AMC Support</div>
              <div className="text-xs text-slate-400 mt-0.5">2-hour emergency response within Chennai.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

