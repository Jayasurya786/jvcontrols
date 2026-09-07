import React, { useState } from 'react';
import { Camera, ZoomIn, X, MapPin, CheckCircle, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GalleryItem {
  id: string;
  title: string;
  category: 'ups' | 'inverter' | 'battery' | 'amc';
  image: string;
  location: string;
  descriptionEn: string;
  descriptionTa: string;
  specs: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'APC Smart-UPS RT 10kVA Server Room Rack',
    category: 'ups',
    image: './images/apc/1.png',
    location: 'IT Park, OMR Chennai',
    descriptionEn: 'Redundant Online Double-Conversion UPS installation with external battery cabinet for critical cloud servers.',
    descriptionTa: 'கிளவுட் சர்வர்களுக்கான APC 10kVA Online UPS மற்றும் கூடுதல் பேட்டரி பேக் அமைப்பு.',
    specs: '10000VA / 8000W • 192V DC Bus • N+1 Architecture',
  },
  {
    id: 'g2',
    title: 'Industrial Servo Stabilizer & Distribution Hub',
    category: 'amc',
    image: './images/stabz_hd.jpg',
    location: 'Ambattur Industrial Estate',
    descriptionEn: '3-Phase oil-cooled automatic servo voltage stabilizer for CNC machinery protection against severe line fluctuations.',
    descriptionTa: 'தொழிற்சாலை CNC இயந்திரங்களுக்கான 3-Phase ஆயில் கூல்டு சர்வோ வோல்டேஜ் ஸ்டெபிலைசர்.',
    specs: '50 kVA 3-Phase • Microcontroller Servo Control',
  },
  {
    id: 'g3',
    title: 'High-Discharge Industrial SMF Battery Bank',
    category: 'battery',
    image: './images/Products_Rocket_Bat.jpg',
    location: 'Private Hospital, Anna Nagar',
    descriptionEn: 'Multi-tier powder-coated battery rack hosting 32 blocks of 12V 100Ah VRLA batteries for ICU backup.',
    descriptionTa: 'தீவிர சிகிச்சைப் பிரிவுக்கான 32 பிளாக் 12V 100Ah SMF பேட்டரி ரேக் அமைப்பு.',
    specs: '32 x 12V 100Ah SMF • Heavy Duty Copper Interlinks',
  },
  {
    id: 'g4',
    title: 'Microtek Pure Sine Wave Residential Setup',
    category: 'inverter',
    image: './images/micro.jpg',
    location: 'Anna Nagar West Extension',
    descriptionEn: 'Pure Sine Wave home inverter installation paired with Exide 150Ah Tall Tubular battery in protective trolley.',
    descriptionTa: 'வீடுகளுக்கான மைக்ரோடெக் பியூர் சைன் வேவ் இன்வெர்ட்டர் மற்றும் எக்ஸைடு 150Ah பேட்டரி அமைப்பு.',
    specs: '1050VA 12V • 150Ah Tubular • 6-8 Hours Backup',
  },
  {
    id: 'g5',
    title: 'Modular High-Density UPS Battery Modules',
    category: 'ups',
    image: './images/apc/2.png',
    location: 'Corporate Bank Branch, Anna Salai',
    descriptionEn: 'Hot-swappable battery module array ensuring zero-downtime battery replacement during bank operating hours.',
    descriptionTa: 'வங்கி கிளைகளுக்கான ஹாட்-ஸ்வாப் செய்யக்கூடிய உயர் அடர்த்தி பேட்டரி தொகுதிகள்.',
    specs: 'Zero Downtime Hot-Swappable • Flame Retardant ABS',
  },
  {
    id: 'g6',
    title: 'Luminous Eco Volt High-Efficiency Inverter',
    category: 'inverter',
    image: './images/lumunus.jpg',
    location: 'Apartment Complex, Kilpauk',
    descriptionEn: 'Smart battery charging technology with adaptive multi-stage charging extending battery life by 40%.',
    descriptionTa: 'ஸ்மார்ட் சார்ஜிங் வசதியுடன் கூடிய லுமினஸ் ஈகோ வோல்ட் ஹோம் இன்வெர்ட்டர் அமைப்பு.',
    specs: '1500VA 24V • Dual Battery Sizing',
  },
  {
    id: 'g7',
    title: 'Enterprise Server Data Line Surge Network',
    category: 'ups',
    image: './images/apc/8.png',
    location: 'Fintech Hub, Taramani',
    descriptionEn: 'Precision power distribution units and RJ45 gigabit surge suppression integration for mission-critical networking.',
    descriptionTa: 'நெட்வொர்க் சுவிட்சுகளுக்கான துல்லியமான பவர் விநியோகம் மற்றும் சர்ஜ் பாதுகாப்பு.',
    specs: 'Transient Voltage Surge Suppression • Gigabit Rated',
  },
  {
    id: 'g8',
    title: 'Telecom Grade VRLA Sealed Battery Rack',
    category: 'battery',
    image: './images/Products_Panasonic_Bat.jpg',
    location: 'Broadband Hub, Chennai Central',
    descriptionEn: 'Deep discharge resistant VRLA battery array tested and certified for continuous 100% duty cycle.',
    descriptionTa: 'தொடர் பயன்பாட்டிற்கான விசேஷ சீல்டு VRLA பேட்டரி அமைப்பு.',
    specs: 'AGM VRLA Technology • Zero Acid Mist Emission',
  },
];

export const GallerySection: React.FC<{ onOpenQuote: () => void }> = ({ onOpenQuote }) => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'ups' | 'inverter' | 'battery' | 'amc'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const categories = [
    { id: 'all', labelEn: 'All Installations', labelTa: 'அனைத்து அமைப்புகள்' },
    { id: 'ups', labelEn: 'Online UPS & Data Centers', labelTa: 'Online UPS & டேட்டா சென்டர்' },
    { id: 'inverter', labelEn: 'Home & Office Inverters', labelTa: 'இன்வெர்ட்டர் அமைப்புகள்' },
    { id: 'battery', labelEn: 'Industrial Battery Banks', labelTa: 'பேட்டரி ரேக்குகள்' },
    { id: 'amc', labelEn: 'Stabilizers & AMC Works', labelTa: 'ஸ்டெபிலைசர்கள் & AMC' },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs">
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'நிறுவல் புகைப்பட தொகுப்பு' : 'Field Installations Showcase'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'ta'
              ? 'சென்னையில் நாங்கள் அமைத்த பவர் சிஸ்டம்கள்'
              : 'Real-World Installations Across Chennai'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {language === 'ta'
              ? 'மருத்துவமனைகள், வங்கிகள், தொழிற்சாலைகள் மற்றும் வீடுகளில் எங்கள் பொறியாளர்களால் வெற்றிகரமாக நிறுவப்பட்ட உபகரணங்கள்.'
              : 'Take a tour of our certified Online UPS racks, heavy-duty battery banks, and residential power backups engineered by JV Controls.'}
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 sm:gap-2.5 pb-2 mb-8 no-scrollbar snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#004b87] text-white shadow-lg shadow-blue-900/30 ring-2 ring-[#004b87]/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              {language === 'ta' ? cat.labelTa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-2xl card-hover-lift hover:border-blue-400/50 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-white to-slate-50/80 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-md bg-[#004b87] text-white uppercase tracking-wider shadow-xs">
                  {item.category.toUpperCase()}
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mb-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#005696] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-medium">
                  {item.specs}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white rounded-full transition-colors z-10 shadow-sm"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-slate-100 p-8 flex items-center justify-center max-h-80 overflow-hidden">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-72 object-contain"
              />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                <MapPin className="w-4 h-4" />
                <span>Installed at {selectedPhoto.location}</span>
              </div>

              <h3 className="text-lg font-black text-slate-900">{selectedPhoto.title}</h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {language === 'ta' ? selectedPhoto.descriptionTa : selectedPhoto.descriptionEn}
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Technical Rating: <strong>{selectedPhoto.specs}</strong></span>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    onOpenQuote();
                  }}
                  className="flex-1 py-3 px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-950/20 active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>Request Installation Quote Like This</span>
                </button>
                <a
                  href="tel:+919500087723"
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center active:scale-98"
                >
                  Call Engineer (+91 9500087723)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

