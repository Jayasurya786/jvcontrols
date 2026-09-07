export type Language = 'en' | 'ta';

export interface TranslationDictionary {
  nav: {
    home: string;
    products: string;
    calculator: string;
    services: string;
    about: string;
    contact: string;
    amcService: string;
    requestQuote: string;
    compare: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleHighlight: string;
    titleEnd: string;
    subtitle: string;
    exploreBtn: string;
    calcBtn: string;
    quoteBtn: string;
    statDealers: string;
    statUptime: string;
    statInstallations: string;
    statSupport: string;
  };
  catalog: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allBrands: string;
    allCategories: string;
    inStock: string;
    viewSpecs: string;
    getQuote: string;
    compareBtn: string;
    comparing: string;
    downloadSpec: string;
  };
  calculator: {
    badge: string;
    title: string;
    subtitle: string;
    presetHome: string;
    presetOffice: string;
    presetMedical: string;
    backupHours: string;
    estimatedWatts: string;
    recommendedInverter: string;
    recommendedBattery: string;
    quoteThisLoad: string;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    bookService: string;
    emergencyCall: string;
    doorstepExchange: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    officeAddress: string;
    phoneLines: string;
    primaryMobile: string;
    operatingHours: string;
    chatWhatsapp: string;
    formTitle: string;
    nameLabel: string;
    mobileLabel: string;
    emailLabel: string;
    serviceTypeLabel: string;
    commentsLabel: string;
    submitBtn: string;
    sendWhatsappBtn: string;
    directionsBtn: string;
  };
  amc: {
    title: string;
    subtitle: string;
    emergencyTitle: string;
    emergencyBadge: string;
    routineBadge: string;
    equipmentLabel: string;
    brandLabel: string;
    dispatchNow: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      calculator: 'Load Calculator',
      services: 'Services & AMC',
      about: 'About Us',
      contact: 'Contact',
      amcService: 'Book Service / AMC',
      requestQuote: 'Request a Quote',
      compare: 'Compare',
    },
    hero: {
      badge: 'Authorized Power Solutions & Battery Store in Chennai',
      titleStart: 'Uninterrupted Power for',
      titleHighlight: 'Critical Applications',
      titleEnd: 'Across Tamil Nadu',
      subtitle: 'Official authorized distributors for APC by Schneider Electric, Delta/Vertiv, Microtek, Luminous, Exide, and Amaron Quanta. 100% genuine units with 24x7 emergency service.',
      exploreBtn: 'Explore Products',
      calcBtn: 'Calculate Inverter Load',
      quoteBtn: 'Get Instant Quotation',
      statDealers: 'Authorized Brands',
      statUptime: 'Guaranteed Uptime',
      statInstallations: 'Successful Installations',
      statSupport: 'Emergency Support',
    },
    catalog: {
      badge: 'Authorized Equipment & Battery Store',
      title: 'Certified Power Systems & Storage Solutions',
      subtitle: 'Every model includes official manufacturer warranty, doorstep installation support in Chennai, and emergency 24x7 service guarantees.',
      searchPlaceholder: 'Search models, brands, kVA rating (e.g. 10000VA, Microtek, Quanta, Pure Sine)...',
      allBrands: 'All Brands',
      allCategories: 'All Systems',
      inStock: 'In Stock',
      viewSpecs: 'Full Specs & Load',
      getQuote: 'Quote',
      compareBtn: '+ Compare',
      comparing: 'Comparing',
      downloadSpec: 'Download Spec Sheet',
    },
    calculator: {
      badge: 'Interactive Power Sizing',
      title: 'Inverter & Battery Load Calculator',
      subtitle: 'Select your home appliances or office devices to automatically compute the exact Inverter VA rating and Battery Ah capacity needed.',
      presetHome: '1-2 BHK Home',
      presetOffice: 'Small Office',
      presetMedical: 'Clinic / Lab',
      backupHours: 'Desired Backup Duration',
      estimatedWatts: 'Total Running Load',
      recommendedInverter: 'Recommended Inverter',
      recommendedBattery: 'Recommended Battery',
      quoteThisLoad: 'Request Quote for this Setup',
    },
    services: {
      badge: 'Doorstep Power Engineering',
      title: 'Professional UPS & Inverter Services in Chennai',
      subtitle: 'From annual maintenance contracts (AMC) to doorstep battery exchange and emergency breakdown repairs, our factory-trained engineers keep your power alive.',
      bookService: 'Book AMC / Service',
      emergencyCall: '24x7 Emergency Helpline',
      doorstepExchange: 'Doorstep Battery Scrap Buyback',
    },
    contact: {
      badge: 'Chennai Office & Enquiry Desk',
      title: 'Contact Us & Request a Free Quotation',
      subtitle: 'Have questions about battery sizing, UPS ratings, or doorstep AMC? Fill out the form below or call our Annanagar East office directly.',
      officeAddress: 'Office & Service Center',
      phoneLines: 'Telephone & Direct Lines',
      primaryMobile: 'Primary Mobile & WhatsApp',
      operatingHours: 'Operating Hours',
      chatWhatsapp: 'Chat on WhatsApp',
      formTitle: 'Online Enquiry & Callback Form',
      nameLabel: 'Your Name *',
      mobileLabel: 'Mobile Number *',
      emailLabel: 'Email Address',
      serviceTypeLabel: 'Requirement Type',
      commentsLabel: 'Comments / Specific Requirements *',
      submitBtn: 'Submit Request to JV Controls',
      sendWhatsappBtn: 'Send via WhatsApp (+91 9500087723)',
      directionsBtn: 'Get Directions in Google Maps',
    },
    amc: {
      title: 'Request AMC or Breakdown Service',
      subtitle: 'Fast doorstep technician visit across Chennai for Online UPS, Inverters, and Battery banks.',
      emergencyTitle: 'Emergency Breakdown? We dispatch technicians within 2 hours in Chennai.',
      emergencyBadge: 'Emergency Breakdown',
      routineBadge: 'Routine AMC / Inspection',
      equipmentLabel: 'Equipment Type',
      brandLabel: 'Brand & Capacity',
      dispatchNow: 'Dispatch Service Engineer',
    },
  },
  ta: {
    nav: {
      home: 'முகப்பு',
      products: 'தயாரிப்புகள்',
      calculator: 'சுமை கணக்கீடு',
      services: 'சேவைகள் & AMC',
      about: 'எங்களை பற்றி',
      contact: 'தொடர்புக்கு',
      amcService: 'சேவை / AMC பதிவு செய்க',
      requestQuote: 'விலைப்புள்ளி பெறுக',
      compare: 'ஒப்பிடுக',
    },
    hero: {
      badge: 'சென்னையின் நம்பகமான இன்வெர்ட்டர் & பேட்டரி விற்பனையகம்',
      titleStart: 'தடையில்லா மின்சாரம் தரும்',
      titleHighlight: 'நம்பகமான தீர்வுகள்',
      titleEnd: 'தமிழ்நாடு முழுவதும்',
      subtitle: 'APC, Delta, Microtek, Luminous, Exide மற்றும் Amaron Quanta நிறுவனங்களின் அங்கீகரிக்கப்பட்ட அதிகாரப்பூர்வ டீலர். 100% அசல் தயாரிப்புகள் மற்றும் 24x7 அவசர சேவை.',
      exploreBtn: 'தயாரிப்புகளை காண்க',
      calcBtn: 'இன்வெர்ட்டர் சுமை கணக்கிடுங்கள்',
      quoteBtn: 'உடனடி விலைப்புள்ளி பெறுக',
      statDealers: 'அங்கீகரிக்கப்பட்ட பிராண்டுகள்',
      statUptime: 'தடையில்லா மின்சாரம்',
      statInstallations: 'வெற்றிகரமான அமைப்புகள்',
      statSupport: 'அவசர தொழில்நுட்ப உதவி',
    },
    catalog: {
      badge: 'அங்கீகரிக்கப்பட்ட உபகரணங்கள் மற்றும் பேட்டரிகள்',
      title: 'உயர்தர மின் காப்பு & பேட்டரி அமைப்புகள்',
      subtitle: 'ஒவ்வொரு தயாரிப்பும் அதிகாரப்பூர்வ தயாரிப்பாளர் உத்தரவாதம் மற்றும் சென்னையில் இலவச டோர்ஸ்டெப் டெலிவரி மற்றும் பொருத்தலுடன் கிடைக்கிறது.',
      searchPlaceholder: 'மாடல்கள், பிராண்டுகள், kVA அளவை தேடுங்கள் (எ.கா. Microtek, Quanta, Pure Sine)...',
      allBrands: 'அனைத்து பிராண்டுகள்',
      allCategories: 'அனைத்து தயாரிப்புகள்',
      inStock: 'கையிருப்பில் உள்ளது',
      viewSpecs: 'முழு விபரம் & லோடு சார்ட்',
      getQuote: 'விலைப்புள்ளி',
      compareBtn: '+ ஒப்பிடுக',
      comparing: 'ஒப்பிடப்படுகிறது',
      downloadSpec: 'விவரக்குறிப்பை பதிவிறக்குக',
    },
    calculator: {
      badge: 'சுலப மின் சுமை கணக்கீடு',
      title: 'இன்வெர்ட்டர் & பேட்டரி லோட் கால்குலேட்டர்',
      subtitle: 'உங்கள் வீட்டு உபயோக சாதனங்களை தேர்வு செய்து, தேவையான இன்வெர்ட்டர் VA மற்றும் பேட்டரி Ah திறனை நொடிகளில் அறிந்து கொள்ளுங்கள்.',
      presetHome: '1-2 BHK வீடு',
      presetOffice: 'சிறு அலுவலகம்',
      presetMedical: 'மருத்துவமனை / லேப்',
      backupHours: 'தேவையான பேக்கப் நேரம் (மணி)',
      estimatedWatts: 'மொத்த மின் நுகர்வு (Watts)',
      recommendedInverter: 'பரிந்துரைக்கப்படும் இன்வெர்ட்டர்',
      recommendedBattery: 'பரிந்துரைக்கப்படும் பேட்டரி',
      quoteThisLoad: 'இந்த அமைப்பிற்கு விலைப்புள்ளி பெறுக',
    },
    services: {
      badge: 'டோர்ஸ்டெப் பவர் இன்ஜினியரிங்',
      title: 'சென்னையில் சிறந்த UPS & இன்வெர்ட்டர் பழுது நீக்கல் மற்றும் AMC',
      subtitle: 'வருடாந்திர பராமரிப்பு ஒப்பந்தம் (AMC), பழைய பேட்டரி எக்ஸ்சேஞ்ச் மற்றும் 24x7 அவசர பழுதுபார்ப்பு சேவைகளுக்கு நாங்கள் பொறுப்பேற்கிறோம்.',
      bookService: 'AMC / சேவை முன்பதிவு செய்க',
      emergencyCall: '24x7 அவசர உதவி எண்',
      doorstepExchange: 'பழைய பேட்டரிக்கு உடனடி கழிவு',
    },
    contact: {
      badge: 'சென்னை அலுவலகம் & விசாரணை மையம்',
      title: 'எங்களை தொடர்பு கொண்டு இலவச விலைப்புள்ளி பெறுக',
      subtitle: 'இன்வெர்ட்டர் தேர்வு, பேட்டரி மாற்றுதல் அல்லது AMC பற்றி ஏதேனும் சந்தேகமா? கீழே உள்ள படிவத்தை நிரப்பவும் அல்லது எங்களை அழைக்கவும்.',
      officeAddress: 'தலைமை அலுவலக முகவரி',
      phoneLines: 'தொலைபேசி & உதவி எண்கள்',
      primaryMobile: 'முக்கிய அலைபேசி & வாட்ஸ்அப்',
      operatingHours: 'வேலை நேரம்',
      chatWhatsapp: 'வாட்ஸ்அப்பில் உரையாடுங்கள்',
      formTitle: 'ஆன்லைன் விசாரணை & அழைப்பு படிவம்',
      nameLabel: 'உங்கள் பெயர் *',
      mobileLabel: 'அலைபேசி எண் *',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      serviceTypeLabel: 'தேவைப்படும் சேவை',
      commentsLabel: 'குறிப்பிட்ட தேவைகள் *',
      submitBtn: 'விண்ணப்பத்தை சமர்ப்பிக்கவும்',
      sendWhatsappBtn: 'வாட்ஸ்அப்பில் அனுப்பவும் (+91 9500087723)',
      directionsBtn: 'கூகுள் மேப்பில் வழியைக் காண்க',
    },
    amc: {
      title: 'AMC அல்லது அவசர பழுதுநீக்கல் பதிவு',
      subtitle: 'Online UPS, இன்வெர்ட்டர்கள் மற்றும் பேட்டரிகளுக்கு சென்னை முழுவதும் விரைவான டோர்ஸ்டெப் சேவை.',
      emergencyTitle: 'அவசர மின்தடையா? சென்னையில் 2 மணி நேரத்திற்குள் எங்கள் பொறியாளர் வருவார்.',
      emergencyBadge: 'அவசர பழுது நீக்கல்',
      routineBadge: 'வழக்கமான பராமரிப்பு / ஆய்வு',
      equipmentLabel: 'உபகரண வகை',
      brandLabel: 'பிராண்ட் & திறன்',
      dispatchNow: 'பொறியாளரை அனுப்பவும்',
    },
  },
};

