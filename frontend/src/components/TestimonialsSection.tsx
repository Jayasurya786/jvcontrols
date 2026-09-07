import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Building, ShieldCheck, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  companyOrArea: string;
  location: string;
  system: string;
  rating: number;
  badge: string;
  reviewEn: string;
  reviewTa: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Dr. S. K. Narayanan',
    title: 'Director & Chief Radiologist',
    companyOrArea: 'Precision Diagnostic Center',
    location: 'Anna Nagar East, Chennai',
    system: 'APC Smart-UPS RT 5kVA with External Battery Pack',
    rating: 5,
    badge: 'Healthcare Clinic Client',
    reviewEn:
      'We run sensitive ultrasound and diagnostic ultrasound machines that cannot tolerate even a millisecond of voltage surge or power drop. JV Controls installed an APC 5kVA Online UPS system that delivers pure sine wave power 24/7. Their team handled the copper earthing and load testing with extreme professionalism.',
    reviewTa:
      'எங்கள் ஸ்கேன் மையத்தில் அல்ட்ராசவுண்ட் மெஷின்களுக்கு மின்தடை அல்லது வோல்டேஜ் ஏற்ற இறக்கம் துளியும் ஏற்படக்கூடாது. JV Controls அமைத்துத் தந்த APC 5kVA Online UPS மிகச் சிறப்பாக இயங்குகிறது. அவர்களின் தொழில்நுட்ப சேவை மிகவும் பாராட்டுக்குரியது.',
  },
  {
    id: '2',
    name: 'Ramesh Krishnan',
    title: 'Head of IT Infrastructure',
    companyOrArea: 'Acuity Tech Solutions',
    location: 'Ambattur Industrial Estate, Chennai',
    system: 'Delta Ultron 20kVA Online UPS + 40-Block Amaron Quanta Bank',
    rating: 5,
    badge: 'Corporate Data Center',
    reviewEn:
      'For our server room hosting 12 rack servers, downtime is not an option. JV Controls supplied a 20kVA Delta 3-phase UPS paired with a heavy-duty Amaron Quanta SMF battery rack. They also manage our 24x7 AMC. Highly recommended for enterprise power solutions in Chennai!',
    reviewTa:
      'எங்களின் 12 சர்வர் ரேக்குகளுக்கு JV Controls வழங்கிய 20kVA Delta UPS மற்றும் Amaron Quanta பேட்டரி அமைப்பு சிறப்பான பேக்கப் தருகிறது. சென்னை நிறுவனங்களுக்கு இவர்களின் 24x7 AMC சேவை மிகவும் நம்பகமானது.',
  },
  {
    id: '3',
    name: 'Meenakshi Sundaram',
    title: 'Independent Villa Owner',
    companyOrArea: 'Residential Customer',
    location: '2nd Avenue, Anna Nagar East, Chennai',
    system: 'Microtek Pure Sine Wave Inverter + 150Ah Exide Tubular',
    rating: 5,
    badge: 'Residential Villa Client',
    reviewEn:
      'I replaced my noisy square-wave inverter with a Microtek Pure Sine Wave system and Exide Tall Tubular battery from JV Controls. There is absolutely zero fan humming, and my home Wi-Fi and work laptops never disconnect during power cuts. Doorstep delivery was completed in just 4 hours!',
    reviewTa:
      'பழைய இன்வெர்ட்டருக்கு பதில் மைக்ரோடெக் பியூர் சைன் வேவ் மற்றும் எக்ஸைடு 150Ah பேட்டரியை JV Controls மூலம் வாங்கினேன். மின்விசிறிகளில் சத்தம் இல்லை, கணினி மற்றும் வைஃபை தடையின்றி இயங்குகிறது. 4 மணி நேரத்திற்குள் வீட்டிற்கே வந்து பொருத்தித் தந்தனர்.',
  },
  {
    id: '4',
    name: 'K. Balaji',
    title: 'Managing Director',
    companyOrArea: 'Balaji Precision Tooling Works',
    location: 'Guindy Industrial Area, Chennai',
    system: '10kVA Online UPS + AMC Annual Contract',
    rating: 5,
    badge: 'Manufacturing & AMC Partner',
    reviewEn:
      'We operate CNC laser cutting machines where voltage drops ruin expensive workpieces. JV Controls provides our industrial UPS and is on a proactive AMC contract. Whenever we call for distilled water top-ups or preventive health tests, their engineer arrives within 2 hours.',
    reviewTa:
      'எங்கள் CNC இயந்திரங்களுக்கு JV Controls வழங்கிய 10kVA Online UPS மிக சிறப்பான பாதுகாப்பு அளிக்கிறது. வழக்கமான பராமரிப்பு மற்றும் அவசர தேவைகளுக்கு 2 மணி நேரத்திற்குள் இவர்களின் பொறியாளர் நேரில் வந்து விடுகிறார்.',
  },
  {
    id: '5',
    name: 'Priya Anand',
    title: 'Principal Architect',
    companyOrArea: 'Studio Urban Architecture',
    location: 'T. Nagar, Chennai',
    system: 'Luminous Cruze 2kVA High-Capacity Inverter',
    rating: 5,
    badge: 'Design Studio Client',
    reviewEn:
      'JV Controls gave us genuine advice instead of trying to oversell. They calculated our design studio load accurately for our high-end 3D rendering workstations and large-format plotters. Excellent follow-up service and fair pricing.',
    reviewTa:
      'எங்கள் ஆர்கிடெக்ட் ஸ்டுடியோ கணினிகள் மற்றும் பிரிண்டர்களுக்கு சரியான லோட் கணக்கிட்டு Luminous Cruze இன்வெர்ட்டரை பரிந்துரைத்தனர். மிக நியாயமான விலை மற்றும் உடனடி ஆதரவு.',
  },
];

export const TestimonialsSection: React.FC = () => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3.5 border border-amber-400/20 shadow-xs">
            <Quote className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வாடிக்கையாளர் கருத்துக்கள்' : 'Real Customer Reviews'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {language === 'ta'
              ? 'சென்னை வாடிக்கையாளர்களின் அனுபவம் & நற்சான்றிதழ்'
              : 'Trusted by Hospitals, IT Centers & Homes in Chennai'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {language === 'ta'
              ? 'அண்ணா நகர், அம்பத்தூர், கிண்டி மற்றும் தி.நகர் பகுதிகளில் எங்கள் UPS மற்றும் இன்வெர்ட்டர் அமைப்புகளை பயன்படுத்தும் வாடிக்கையாளர்கள்.'
              : 'Read how our Online UPS, Inverters, and heavy-duty battery banks protect mission-critical operations daily.'}
          </p>
        </div>

        {/* Testimonial Active Card with Smooth Transition */}
        <div
          className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Quote Icon Background */}
          <Quote className="absolute top-6 right-6 w-16 h-16 text-slate-800/50 pointer-events-none" />

          {/* Rating Stars & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-xs font-black text-amber-300">5.0 / 5.0 Verified Review</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{current.badge}</span>
            </span>
          </div>

          {/* Review Text */}
          <blockquote className="text-base sm:text-xl text-slate-100 font-medium leading-relaxed italic mb-8">
            "{language === 'ta' ? current.reviewTa : current.reviewEn}"
          </blockquote>

          {/* Client Details Footer */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-base sm:text-lg font-black text-white">{current.name}</div>
              <div className="text-xs sm:text-sm text-slate-400">
                {current.title} • <span className="text-slate-300 font-semibold">{current.companyOrArea}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-amber-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {current.location}
                </span>
                <span>•</span>
                <span className="text-slate-300">System: <strong>{current.system}</strong></span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 border border-slate-700/50"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white transition-all shadow-md shadow-orange-950/30 active:scale-95"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

