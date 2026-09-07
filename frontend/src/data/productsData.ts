import { ProductItem } from '../types';

export const PRODUCTS: ProductItem[] = [
  // ==========================================
  // ONLINE UPS
  // ==========================================
  {
    id: 'apc-surt10000va',
    name: 'APC Smart-UPS On-Line RT 10000VA 208V',
    brand: 'APC',
    category: 'ups',
    subCategory: 'APC UPS',
    capacity: '10 kVA / 8000 Watts',
    tagline: 'High density, double-conversion on-line power protection with scalable runtime',
    description: 'APC Smart-UPS On-Line provides high density, true double-conversion on-line power protection for servers, voice/data networks, medical labs, and light industrial applications. Delivering 8000 Watts / 10 kVA with configurable 208V/240V output, Smart-Slot management card, and expandable external battery packs for extended runtimes.',
    image: './images/apc_onlineups.png',
    gallery: [
      './images/apc_onlineups.png',
      './images/apc/1.png',
      './images/apc/2.png',
      './images/apc/6.png',
      './images/apc/7.png',
      './images/apc/8.png',
      './images/apcgraph.gif'
    ],
    features: [
      'True Double-Conversion On-Line Topology with Zero Transfer Time',
      'Includes AP9631 Network Management Card with Environmental Monitoring',
      'DB-9 RS-232, RJ-45 10/100 Base-T, and Smart-Slot connectivity',
      'LED status display with load and battery bar-graphs and bypass indicators',
      'Audible alarm for on-battery, low battery, and continuous overload',
      'Emergency Power Off (EPO) support built-in',
      'Hot-swappable, user-replaceable battery modules (RBC44)',
      'Full-time multi-pole noise filtering: 0.3% IEEE surge let-through meets UL 1449'
    ],
    specs: {
      'Output Power Capacity': '8000 Watts / 10 kVA',
      'Max Configurable Power': '8000 Watts / 10 kVA',
      'Nominal Output Voltage': '208V (Configurable to 208V or 240V)',
      'Efficiency at Full Load': '92%',
      'Output Voltage Distortion': 'Less than 3%',
      'Waveform Type': 'Sine wave',
      'Output Connections': 'Hard Wire 3-wire (2PH + G), NEMA L6-20R, NEMA L6-30R',
      'Nominal Input Voltage': '208V (Range: 160 - 280V)',
      'Input Frequency': '50/60 Hz +/- 5 Hz (auto sensing)',
      'Battery Type': 'Maintenance-free sealed Lead-Acid with suspended electrolyte (leakproof)',
      'Typical Recharge Time': '2.20 hour(s)',
      'Replacement Battery': 'RBC44 (Quantity: 2)',
      'Rack Height': '6U (Dimensions: 432mm H x 263mm W x 736mm D)',
      'Net Weight': '110.91 KG (Shipping: 129.09 KG)',
      'Operating Temp': '0 - 40 °C | Relative Humidity: 0 - 95%',
      'Warranty': '2 years repair or replace'
    },
    detailedSpecTables: [
      {
        title: 'Output Specifications',
        rows: [
          { label: 'Output Power Capacity', value: '8000 Watts / 10 kVA' },
          { label: 'Max Configurable Power', value: '8000 Watts / 10 kVA' },
          { label: 'Nominal Output Voltage', value: '208V' },
          { label: 'Output Voltage Note', value: 'Configurable for 208 or 240 nominal output voltage' },
          { label: 'Efficiency at Full Load', value: '92%' },
          { label: 'Output Voltage Distortion', value: 'Less than 3%' },
          { label: 'Output Frequency', value: '50/60 Hz +/- 3 Hz user adjustable +/- 0.1' },
          { label: 'Crest Factor', value: '3 : 1' },
          { label: 'Waveform Type', value: 'Pure Sine Wave' },
          { label: 'Output Connections', value: '1) Hard Wire 3-wire (2PH + G), 2) NEMA L6-20R, 3) NEMA L6-30R' }
        ]
      },
      {
        title: 'Input Specifications',
        rows: [
          { label: 'Nominal Input Voltage', value: '208V' },
          { label: 'Input Frequency', value: '50/60 Hz +/- 5 Hz (auto-sensing)' },
          { label: 'Input Connections', value: 'Hard Wire 3-wire (2PH + G)' },
          { label: 'Mains Voltage Range', value: '160 - 280V' },
          { label: 'Other Input Voltages', value: '240V' },
          { label: 'Input THD', value: 'Less than 7% for full load' }
        ]
      },
      {
        title: 'Battery & Extended Runtime',
        rows: [
          { label: 'Battery Type', value: 'Maintenance-free sealed Lead-Acid with suspended electrolyte (leakproof)' },
          { label: 'Included Battery Modules', value: '4 Modules' },
          { label: 'Typical Recharge Time', value: '2.20 hour(s)' },
          { label: 'Replacement Battery Pack', value: 'RBC44 (Quantity: 2)' },
          { label: 'Extended Run Option', value: 'Supports up to 10 x SURT192XLBP External Battery Packs' }
        ]
      },
      {
        title: 'Communications & Management',
        rows: [
          { label: 'Interface Port(s)', value: 'DB-9 RS-232, RJ-45 10/100 Base-T, Smart-Slot' },
          { label: 'Pre-Installed Card', value: 'AP9631 Web/SNMP Management Card' },
          { label: 'Control Panel', value: 'LED status display with load/battery bar-graphs and bypass indicators' },
          { label: 'Audible Alarm', value: 'Distinctive alarms for battery mode, low battery, and continuous overload' },
          { label: 'Emergency Power Off (EPO)', value: 'Yes' }
        ]
      },
      {
        title: 'Physical & Environmental',
        rows: [
          { label: 'Dimensions (H x W x D)', value: '432.00 mm x 263.00 mm x 736.00 mm (Rack Height: 6U)' },
          { label: 'Net / Shipping Weight', value: '110.91 KG / 129.09 KG' },
          { label: 'Operating Temperature', value: '0 - 40 °C (32 - 104 °F)' },
          { label: 'Relative Humidity', value: '0 - 95% non-condensing' },
          { label: 'Audible Noise', value: '55.00 dBA at 1 meter' },
          { label: 'Regulatory Approvals', value: 'CSA, FCC Part 15 Class A, UL 1778, RoHS 7b Exemption' }
        ]
      }
    ],
    loadChart: {
      headers: ['Runtime Curve', 'Configuration (Part Numbers)', 'Typical Application'],
      rows: [
        ['Curve A', 'SURT10000XLT (Internal)', 'Standard server rack backup (~5-15 mins full load)'],
        ['Curve B', 'SURT10000XLT + (1) SURT192XLBP', 'Extended critical network runtime (~30-45 mins)'],
        ['Curve C', 'SURT10000XLT + (2) SURT192XLBP', 'High availability data center cluster (~1 - 1.5 hrs)'],
        ['Curve D', 'SURT10000XLT + (3) SURT192XLBP', 'Critical enterprise communication systems (~2 hrs)'],
        ['Curve E', 'SURT10000XLT + (4) SURT192XLBP', 'Mission-critical continuous operations (~3 hrs)'],
        ['Curve F', 'SURT10000XLT + (5) SURT192XLBP', 'Full shift outage protection (~4 hrs)'],
        ['Curve G', 'SURT10000XLT + (6) SURT192XLBP', 'Extended enterprise backup (~5 hrs)'],
        ['Curve H', 'SURT10000XLT + (7) SURT192XLBP', 'Severe power outage coverage (~6+ hrs)'],
        ['Curve I', 'SURT10000XLT + (10) SURT192XLBP', 'Maximum extended multi-hour continuous runtime']
      ]
    },
    warranty: '2 Years Repair or Replace',
    inStock: true
  },
  {
    id: 'delta-prism-series',
    name: 'Delta PRISM Series Online UPS',
    brand: 'Delta / Vertiv',
    category: 'ups',
    subCategory: 'Vertiv UPS',
    capacity: '600 VA to 3 kVA',
    tagline: 'High reliability entry-level UPS solution for IT and office workstations',
    description: 'The Delta PRISM Series offers compact, robust entry-level power protection engineered for personal computers, workstations, point-of-sale terminals, and networking gear.',
    image: './images/prism_series.jpg',
    features: [
      'Available ratings: 600 VA, 1000 VA, 1500 VA, 2 kVA, 3 kVA',
      'Microprocessor control guarantees high reliability',
      'Equipped with Boost and Buck AVR for voltage stabilization',
      'Auto restart while AC is recovering',
      'Simulated sine wave / pure sine wave output options',
      'Off-mode charging and cold start function'
    ],
    specs: {
      'Rating Range': '600 VA, 1000 VA, 1500 VA, 2 kVA, 3 kVA',
      'Input Voltage Range': '140 - 300 VAC',
      'Output Voltage': '230 VAC ± 10%',
      'Transfer Time': 'Typical 2-6 ms',
      'Battery Type': '12V Sealed Lead-Acid Maintenance-Free',
      'Warranty': '2 Years Comprehensive'
    },
    warranty: '2 Years Manufacturer Warranty',
    inStock: true
  },
  {
    id: 'delta-n-series',
    name: 'Delta Amplon N Series Online UPS',
    brand: 'Delta / Vertiv',
    category: 'ups',
    subCategory: 'Vertiv UPS',
    capacity: '1 kVA to 3 kVA',
    tagline: 'True on-line double-conversion UPS for SMEs, medical clinics, and corporate networks',
    description: 'Delta N Series is a true on-line double-conversion UPS designed in a compact tower format that delivers clean, uninterrupted sine wave power to your mission-critical equipment with significant energy savings.',
    image: './images/Delta_N_Series_UPS.jpg',
    features: [
      'Available ratings: 1 kVA, 2 kVA, 3 kVA',
      'High input power factor (> 0.99) and low harmonic distortion',
      'Wide input voltage window (120 - 280 VAC)',
      'Intelligent battery management maximizing battery longevity',
      'Programmable outlets for non-critical load shedding',
      'SNMP / Web management card slot and USB/RS-232 ports'
    ],
    specs: {
      'Capacity': '1 kVA to 3 kVA',
      'Topology': 'True On-Line Double Conversion',
      'Input Voltage Range': '120 - 280 VAC',
      'Output Power Factor': '0.9',
      'THDi': '< 3%',
      'Overload Capacity': '105-125% for 1 minute, 125-150% for 30 seconds'
    },
    warranty: '2 Years Onsite Warranty',
    inStock: true
  },
  {
    id: 'delta-j-series',
    name: 'Delta J Series Online UPS (Rack/Tower)',
    brand: 'Delta / Vertiv',
    category: 'ups',
    subCategory: 'Vertiv UPS',
    capacity: '1 kVA to 11 kVA',
    tagline: 'Thinnest (3U), Lightest, and Smallest true on-line UPS in the world',
    description: 'The revolutionary Delta J Series is designed for high-density rack installations. At only 3U height, it offers an ultra-compact footprint without sacrificing power factor or thermal efficiency.',
    image: './images/Delta_J_Series_UPS.jpg',
    features: [
      'Available in 1 kVA to 3 kVA and 7 kVA to 11 kVA capacities',
      'Ultra-thin 3U rack-mount profile saving precious cabinet space',
      'Rotatable multi-function LCD display for rack or tower configuration',
      'Hot-swappable battery trays with zero downtime during maintenance',
      'High AC-AC efficiency up to 94% reducing operational cooling costs',
      'Parallel redundancy capability up to 4 units for N+X scalability'
    ],
    specs: {
      'Form Factor': '3U Rackmount / Convertible Tower',
      'Rating Options': '1kVA - 3kVA, 7kVA - 11kVA',
      'Efficiency': 'Up to 94% on AC mode, 97% on ECO mode',
      'Battery Voltage': 'Configurable DC bus with external battery banks'
    },
    warranty: '2 Years Comprehensive',
    inStock: true
  },
  {
    id: 'delta-h-series',
    name: 'Delta Ultron H Series Online UPS',
    brand: 'Delta / Vertiv',
    category: 'ups',
    subCategory: 'Vertiv UPS',
    capacity: '15 kVA to 30 kVA',
    tagline: 'Highest availability 3-phase on-line UPS for manufacturing and medium data centers',
    description: 'The Delta Ultron H Series provides online double-conversion power protection with three-phase input and three-phase output for industrial automation, telecom hubs, and hospital diagnostic labs.',
    image: './images/Delta_H_Series_UPS.jpg',
    features: [
      'Available in 15 kVA, 20 kVA, and 30 kVA models',
      'Dual-mains input design allowing connection to two independent power sources',
      'Built-in manual and automatic maintenance bypass switch',
      'Advanced DSP digital control technology for precision waveform synthesis',
      'Modular architecture enabling fast MTTR (Mean Time to Repair)'
    ],
    specs: {
      'Capacity': '15 kVA to 30 kVA 3-Phase',
      'Input Voltage': '380/400/415 VAC 3-Phase 4-Wire + Ground',
      'Output Power Factor': '0.9',
      'Bypass': 'Built-in Static Bypass & Maintenance Bypass Switch'
    },
    warranty: '2 Years with Annual Maintenance Contract Options',
    inStock: true
  },
  {
    id: 'delta-nt-series',
    name: 'Delta NT Series Heavy Industrial UPS',
    brand: 'Delta / Vertiv',
    category: 'ups',
    subCategory: 'Vertiv UPS',
    capacity: '20 kVA to 3200 kVA',
    tagline: 'High performance customized power for hyper-critical mission facilities',
    description: 'The Delta NT Series is engineered for harsh industrial environments, corporate server farms, semiconductor fabrication, and major hospital complexes. Scalable up to 3200 kVA with N+1 parallel architecture.',
    image: './images/NT_Series_Big.jpg',
    features: [
      'Scalable from 20 kVA up to 3200 kVA via parallel bus connection',
      'Built-in galvanic isolation transformer on inverter output',
      'Handles 100% unbalanced loads with minimal phase displacement',
      'Comprehensive multi-language graphical touchscreen display',
      'Ruggedized cooling conduits and conformal-coated electronics'
    ],
    specs: {
      'Capacity': '20 kVA to 3200 kVA',
      'Input / Output': '3-Phase 400V / 415V',
      'Isolation': 'Galvanic Inverter Output Isolation Transformer Built-in',
      'Parallel Capability': 'Up to 8 units in parallel'
    },
    warranty: 'Tailored Industrial Warranty & 24x7 AMC SLA',
    inStock: true
  },
  {
    id: 'servo-stabilizers',
    name: 'Servo Voltage Stabilizers & CVT',
    brand: 'Industrial Power',
    category: 'ups',
    subCategory: 'Stabilizers',
    capacity: '1 kVA to 500 kVA',
    tagline: 'High-speed servo controlled voltage stabilizers and constant voltage transformers',
    description: 'Precision motorized servo voltage stabilizers designed to protect expensive CNC machinery, printing presses, textile mills, elevators, and entire residential or commercial buildings against extreme voltage fluctuations.',
    image: './images/Stabz_In.jpg',
    features: [
      'Rating from 1 kVA to 500 kVA (Single-Phase and Three-Phase)',
      'High correction speed with zero waveform distortion',
      'Microcontroller-based electronic servo drive mechanism',
      'Over-voltage, under-voltage, and overload trip protections',
      'Constant Voltage Transformers (CVT) for sensitive audio/visual & lab equipment'
    ],
    specs: {
      'Capacity Range': '1 kVA to 500 kVA',
      'Input Voltage Range': '170V - 270V (1-Ph) / 300V - 470V (3-Ph)',
      'Output Voltage': '230V ± 1% (1-Ph) / 400V ± 1% (3-Ph)',
      'Efficiency': '> 98%'
    },
    warranty: '2 Years Replacement Warranty',
    inStock: true
  },

  // ==========================================
  // INVERTERS (HOME & COMMERCIAL)
  // ==========================================
  {
    id: 'inverter-apc-sine',
    name: 'APC Home-UPS Pure Sine Wave Inverter',
    brand: 'APC',
    category: 'inverter',
    subCategory: 'APC Inverter',
    capacity: '650VA, 850VA, 1000VA',
    tagline: 'The global leader in power protection introduces the most reliable Home-UPS',
    description: 'Say goodbye to power cuts with APC Home-UPS! Specifically designed for Indian power conditions, it provides pure sine wave electricity that runs sensitive appliances, computers, and home entertainment systems smoothly without humming noise.',
    image: './images/apcinverters.png',
    features: [
      'Available models: BI650SINE, BI850SINE, BI1000SINE',
      'Pure Sine Wave output protects delicate electronics and fans run whisper-quiet',
      'Automatic changeover from Mains to UPS mode in less than 20 milliseconds',
      'Battery recharges even at very low mains input voltage (down to 100V)',
      'Built-in Holiday Mode switch prevents battery self-discharge when away for long periods',
      'Child-safe and shock-proof enclosure design',
      '24 Months Onsite Replacement Warranty on Home-UPS',
      '18 Months Onsite Warranty on battery supplied by APC with 4 Free Preventive Maintenance Visits'
    ],
    specs: {
      'BI1000SINE Capacity': '1000VA / 660W (Mains: 100-230V, Battery: 210V ± 10%)',
      'BI850SINE Capacity': '850VA / 500W (Mains: 100-290V, Battery: 170-275V)',
      'BI650SINE Capacity': '650VA / 410W (Mains: 100-290V, Battery: 170-260V)',
      'Output Waveform': 'Pure Sine Wave',
      'Transfer Time': '< 20 milliseconds (Zero PC reset)',
      'Overload Indication': '100% for 60 seconds with LED & audible alarm with 3-time auto restart',
      'Protections': 'Overload, Short Circuit, Low Battery, Overcharge, High Input Voltage'
    },
    detailedSpecTables: [
      {
        title: 'Model Comparison Specifications',
        rows: [
          { label: 'Model BI1000SINE', value: '1000VA / 660W Capacity | Pure Sine Wave | 100-230V Mains Range' },
          { label: 'Model BI850SINE', value: '850VA / 500W Capacity | Pure Sine Wave | 100-290V Mains Range' },
          { label: 'Model BI650SINE', value: '650VA / 410W Capacity | Pure Sine Wave | 100-290V Mains Range' },
          { label: 'Battery Output Voltage', value: '210V ± 10% (BI1000SINE) / 170-275VAC (BI850/650)' },
          { label: 'Transfer Time', value: '< 20 milliseconds' },
          { label: 'Charger', value: 'Constant Power, 2-step charging (100 - 270V)' },
          { label: 'Protection Suite', value: 'Overload, short circuit, deep discharge, over charge, high voltage' }
        ]
      }
    ],
    loadChart: {
      headers: ['Appliance', 'BI1000I (1000VA)', 'HI800SQ (800VA)', 'HI600SQ (600VA)'],
      rows: [
        ['Bulbs / Tube Lights', '5 Units', '5 Units', '3 Units'],
        ['Ceiling Fans', '4 Units', '3 Units', '2 Units'],
        ['Television (TV)', '2 Units', '1 Unit', '1 Unit']
      ]
    },
    warranty: '2 Years Onsite Replacement Warranty',
    inStock: true
  },
  {
    id: 'inverter-crompton',
    name: 'Crompton Greaves Digital Inverter',
    brand: 'Crompton Greaves',
    category: 'inverter',
    subCategory: 'Crompton Greaves',
    capacity: '600VA, 800VA, 1400VA',
    tagline: 'Specially designed for computers, IT equipment, and heavy residential loads',
    description: 'Crompton Greaves inverters utilize highly efficient MOSFET switching technology to ensure noiseless inverter operation with rapid charging and complete safety protections.',
    image: './images/cromptongreaves.png',
    features: [
      'Highly efficient MOSFET technology with superior surge capacity',
      'Over-temperature and reverse phase electrical protections',
      'Selector switch for Normal Inverter mode vs. Regulated UPS mode for computers',
      'Normal and High charging speed options for rapid battery replenishment',
      'Battery Fuse Blown warning display and Battery High protection',
      'Wide input voltage range ensuring charging during severe brownouts'
    ],
    specs: {
      'DC System Voltage': '12V (600VA, 800VA) / 24V (1400VA)',
      'Battery Rating (3 hrs backup)': '12V/130AH (600VA), 12V/160AH (800VA), 2 x 12V/160AH (1400VA)',
      'Battery Rating (2 hrs backup)': '12V/100AH (600VA), 12V/130AH (800VA), 2 x 12V/100AH (1400VA)',
      'Technology': 'High-Efficiency MOSFET with Digital Signal Processing'
    },
    loadChart: {
      headers: ['Appliance', '600VA Chart A / B / C', '800VA Chart A / B / C', '1400VA Chart A / B / C'],
      rows: [
        ['Fans', '2 / 3 / 2', '3 / 4 / 3', '4 / 5 / 6'],
        ['Television', '1 / - / -', '1 / 1 / -', '1 / 1 / 1'],
        ['Tube Light / CFL', '2 / 1 / 3', '3 / 2 / 4', '5 / 4 / 6']
      ]
    },
    warranty: '2 Years Manufacturer Warranty',
    inStock: true
  },
  {
    id: 'inverter-luminous',
    name: 'Luminous Long Backup Digital UPS',
    brand: 'Luminous',
    category: 'inverter',
    subCategory: 'Luminous',
    capacity: '600VA, 800VA, 1400VA',
    tagline: 'Runs single PC up to 15 hours with fast battery charging technology',
    description: 'Luminous is India’s most trusted household inverter brand. Featuring micro-controller intelligent control, dual regulated/unregulated operating modes, and pre-loaded battery management software.',
    image: './images/luminousinverter2.png',
    features: [
      'Micro-controller based architecture with selectable battery type options',
      'Runs single PC up to 15.0 hours with 24V 150 AH battery bank',
      'Regulated battery charging from 120V to 300V mains input',
      'Automatic holiday mode preserves battery charge when away from home',
      'Audio alarms for mains fail, charger blown, low battery, and no-load shutdown',
      'Visual LED indicators for Smart Charge, Overload, Short Circuit, and Battery Low'
    ],
    specs: {
      'Rating Range': '600VA, 800VA, 1400VA',
      'Regulated UPS Mode Window': 'Under-voltage: 180 ± 5V | Over-voltage: 265 ± 5V',
      'Unregulated UPS Mode Window': 'Under-voltage: 100 ± 10V | Over-voltage: 300 ± 10V',
      'Supported Batteries': '120AH - 150AH Lead-Acid / Tubular (1 Battery for 600/800VA, 2 for 1400VA)',
      'Warranty': '2 Years Replacement Warranty'
    },
    warranty: '2 Years Full Warranty',
    inStock: true
  },
  {
    id: 'inverter-microtek-eb',
    name: 'Microtek UPS EB Series (Intelligent Control)',
    brand: 'Microtek',
    category: 'inverter',
    subCategory: 'Microtek',
    capacity: '400VA to 2000VA',
    tagline: 'State-of-the-art Micro-Controller design with TPZi Trapezoidal & Sine Wave Technology',
    description: 'Microtek UPS EB models are engineered using intelligent control design, CCCV multi-stage charging with auto-trickle mode, and smart overload sensors for uncompromised performance.',
    image: './images/upseb_400va.png',
    gallery: [
      './images/upseb_400va.png',
      './images/upseb_05.png',
      './images/micro.jpg'
    ],
    features: [
      'Available ratings: EB 400, EB 600, EB 800, EB 860, EB 1000, EB 1500, EB 2000',
      'MICRO-CONTROLLER BASED Intelligent Control Design for high reliability',
      'CCCV Technology (Constant Current, Constant Voltage) with Auto Trickle Mode',
      'Smart Overload Sense (120%) and Short Circuit Protection (300%)',
      'Battery State Monitoring preventing deep over-discharge',
      'Mains Input Voltage Range Selection: Wide (100V - 300V) or Normal (180V - 260V)',
      'Automatic transfer time <= 15 milliseconds'
    ],
    specs: {
      'Output Voltage (UPS Mode)': '200V ~ 230V ± 10% (50 Hz ± 0.1 Hz)',
      'Output Waveform': 'TPZi Waveform (Trapezoidal) / Pure Sine Wave',
      'Charger Current': 'Constant charging approx 10% of rated battery Ah',
      'Efficiency': '> 84% on battery mode',
      'Brown-out Mains Voltage': '100V ± 40V',
      'Auto Reset Feature': 'Yes (Automated reset after overload trip)',
      'Warranty': '2 Years Onsite Warranty'
    },
    detailedSpecTables: [
      {
        title: 'Microtek EB Series Range',
        rows: [
          { label: 'UPS EB 400', value: '400VA | 1 Battery (12V) | 6.5A Charger | For 1-2 rooms basic lighting' },
          { label: 'UPS EB 600', value: '600VA | 1 Battery (12V) | 8.5A Charger | For 2-3 fans, lights, TV' },
          { label: 'UPS EB 800 / 860', value: '800-860VA | 1 Battery (12V) | 10A Charger | For entire 2BHK residence' },
          { label: 'UPS EB 1000', value: '1000VA | 1 Battery (12V) | 12A Charger | Higher surge for home + PC' },
          { label: 'UPS EB 1500', value: '1500VA | 2 Batteries (24V) | Heavy duty commercial and residential' },
          { label: 'UPS EB 2000', value: '2000VA | 2 Batteries (24V) | Runs refrigerators, deep freezers, large setups' }
        ]
      }
    ],
    warranty: '2 Years Manufacturer Warranty',
    inStock: true
  },
  {
    id: 'inverter-mahindra',
    name: 'Mahindra Power Inverter',
    brand: 'Mahindra',
    category: 'inverter',
    subCategory: 'Mahindra',
    capacity: '600VA, 800VA, 1500VA',
    tagline: 'Equipped with Intellicharge Technology and High-Speed MOSFET Protection',
    description: 'Mahindra Power Inverters are built for demanding domestic applications. Pre-loaded with smart battery management software and comprehensive audio/visual diagnostic alarms.',
    image: './images/wel-img.jpg',
    features: [
      'Available in 600VA, 800VA, and 1500VA ratings',
      'Intellicharge Technology ensuring up to 30% longer battery service life',
      'High-speed MOSFET protection against excess current and voltage spikes',
      'Regulated output voltage window during UPS computer mode',
      'Battery reverse polarity and ultra-fast short circuit protection',
      'Distinct audio alarms for Mains Failure, Low Battery, and Overload'
    ],
    specs: {
      'Capacity Options': '600VA, 800VA, 1500VA',
      'Battery Compatibility': 'Tubular and Flat Plate (12V/24V)',
      'Audio Alarms': 'Mains Failure, Low Battery, Overload trip',
      'Warranty': '24 Months Replacement Warranty'
    },
    warranty: '24 Months Warranty',
    inStock: true
  },
  {
    id: 'inverter-sukam',
    name: 'Su-Kam Pure Sine Wave Inverter',
    brand: 'Su-Kam',
    category: 'inverter',
    subCategory: 'Su-Kam',
    capacity: '600VA to 5000VA',
    tagline: 'No matter what your game, we have the power to make you WIN',
    description: 'Su-Kam is an established leader in power backup innovation with ISO 9001 and ISO 14001 certification. Known for robust R&D, elegant industrial design, and world-class grid compatibility.',
    image: './images/sukam6.png',
    features: [
      'India’s leading power backup solution provider with Government-recognized R&D',
      'Pure Sine Wave electricity for 100% distortion-free equipment running',
      'Fuzzy Logic charging technology adjusting current based on battery health',
      'Automatic bypass switch option in case of internal servicing',
      'Handles high inrush current of appliances like refrigerators and laser printers'
    ],
    specs: {
      'Capacity': '600VA to 5000VA',
      'Certifications': 'ISO 9001 & ISO 14001 Certified',
      'Waveform': 'Pure Sine Wave Output (THD < 3%)',
      'Warranty': '2 Years Onsite Warranty'
    },
    warranty: '2 Years Comprehensive Warranty',
    inStock: true
  },
  {
    id: 'inverter-tribal',
    name: 'Tribal iACE DSP Pure Sine Wave UPS',
    brand: 'Tribal',
    category: 'inverter',
    subCategory: 'Tribal',
    capacity: '400VA, 650VA, 800VA, 1400VA',
    tagline: 'Keep your home, office or business buzzing 24x7 with smart i-DSP technology',
    description: 'Tribal iACE is a Pure Sine Wave UPS incorporating unique i-DSP technology that senses utility absence and provides clean power without breaking cadence. Filters blackouts, brownouts, sags, and surges.',
    image: './images/trip1.png',
    features: [
      'Pure Sine Wave Output with proprietary i-DSP technology',
      'Quick / Normal charge selector switch ideal for areas with frequent power cuts',
      'Extreme climate operating resilience (-25°C to +55°C ambient temperature)',
      'In-built intelligent multi-stage charger increasing battery cyclic life',
      'Available in 2 sleek color options: Black and White',
      'Manufactured in an ISO 9001 certified facility with One India Warranty'
    ],
    specs: {
      'Capacity': '400VA, 650VA, 800VA, 1400VA',
      'Operating Temperature': '-25°C to +55°C',
      'Waveform': 'True Pure Sine Wave Output',
      'Warranty': '2 Years One India Warranty'
    },
    loadChart: {
      headers: ['Appliance', 'iACE 400 (Opt 1/2)', 'iACE 650 (Opt 1/2)', 'iACE 800 (Opt 1/2)', 'iACE 1400 (Opt 1/2)'],
      rows: [
        ['Computer / Workstation', '1 / -', '1 / -', '1 / -', '2 / -'],
        ['Tube Light', '1 / 2', '2 / 3', '4 / 3', '4 / 4'],
        ['CFL / LED Bulb', '1 / 1', '4 / 3', '3 / 3', '3 / 3'],
        ['Ceiling Fan', '- / 1', '2 / 3', '3 / 3', '4 / 4']
      ]
    },
    warranty: '2 Years Manufacturer Warranty',
    inStock: true
  },

  // ==========================================
  // TUBULAR BATTERIES
  // ==========================================
  {
    id: 'battery-exide-tubular-range',
    name: 'Exide Heavy-Duty Tubular Battery Range',
    brand: 'Exide',
    category: 'tubular-battery',
    subCategory: 'Exide',
    capacity: '100Ah - 220Ah',
    tagline: 'Next generation tubular battery designed to withstand frequent, prolonged power outages',
    description: 'Exide Tubular batteries (Invared, Invapower, Invatubular, Invaqueen) represent the pinnacle of deep-cycle lead acid technology. Equipped with high-pressure spine casting (HADI machine) to resist corrosion and ensure long service life.',
    image: './images/exideinvared.png',
    gallery: [
      './images/exideinvared.png',
      './images/exideinvapower.png',
      './images/exideinvatubular.png',
      './images/exidelogo.png',
      './images/tub.jpg'
    ],
    features: [
      'Exide Invared: Specially engineered tubular plates for rapid recharge',
      'Exide Invapower: Superior life cycle designed for deep discharge recovery',
      'Exide Invatubular: Premium thick tubular spine alloy offering 5+ years design life',
      'Exide Invaqueen: High capacity deep-discharge tall tubular battery',
      'Heavy-duty antimony alloy spines with ceramic vent plugs for low water loss',
      'Excellent performance under harsh Indian summer temperature extremes'
    ],
    specs: {
      'Capacity Range': '100Ah, 130Ah, 150Ah, 180Ah, 200Ah, 220Ah',
      'Voltage': '12V DC',
      'Electrolyte Level Indicator': 'Float guide ceramic vent plugs provided',
      'Expected Life': '5 to 7 Years in tropical Indian climate',
      'Warranty': '36 to 66 Months Warranty (Pro-rata + Free Replacement)'
    },
    warranty: '36 to 66 Months Warranty',
    inStock: true
  },
  {
    id: 'battery-sf-stansafe',
    name: 'SF Sonic STANSAFE (SMF VRLA Battery)',
    brand: 'SF Exide',
    category: 'tubular-battery',
    subCategory: 'SF Exide',
    capacity: '7Ah to 100Ah',
    tagline: 'Sealed Maintenance-Free VRLA technology for reliable domestic backup',
    description: 'SF Sonic STANSAFE incorporates sealed maintenance-free lead-calcium technology with zero acid fumes, making it ideal for indoor placement inside living rooms and bedrooms.',
    image: './images/sf_stansafe.png',
    features: [
      'Sealed maintenance-free VRLA design with no top-up needed',
      'Zero corrosive fumes or acid spillage',
      'High rate discharge characteristics',
      'Compact footprint with robust ABS container'
    ],
    specs: {
      'Technology': 'SMF VRLA Lead Calcium',
      'Voltage': '12V',
      'Maintenance': 'Zero Maintenance (Factory Sealed)'
    },
    warranty: '24 Months Warranty',
    inStock: true
  },
  {
    id: 'battery-sf-stanguard',
    name: 'SF Sonic STANGUARD (Flooded Flat Plate)',
    brand: 'SF Exide',
    category: 'tubular-battery',
    subCategory: 'SF Exide',
    capacity: '100Ah to 150Ah',
    tagline: 'Economical flooded flat-plate battery for daily domestic power cuts',
    description: 'SF Sonic STANGUARD is a budget-friendly flooded flat-plate battery delivering reliable power backup for home inverters with easy electrolyte level monitoring.',
    image: './images/sf_stanguard.png',
    features: [
      'Heavy-duty flat plates with high active material retention',
      'Specially formulated paste for quick recharging',
      'Clear electrolyte level float indicators',
      'High charge acceptance during brief mains supply periods'
    ],
    specs: {
      'Type': 'Flooded Flat Plate',
      'Voltage': '12V',
      'Warranty': '24 Months'
    },
    warranty: '24 Months Warranty',
    inStock: true
  },
  {
    id: 'battery-sf-tubepower',
    name: 'SF Sonic Flooded Tubular Plate (STP / STANRED / STANTUBULAR)',
    brand: 'SF Exide',
    category: 'tubular-battery',
    subCategory: 'SF Exide',
    capacity: '120Ah to 200Ah',
    tagline: 'Next-generation rugged tubular plates with superior cyclic life',
    description: 'The premier SF Sonic tubular collection includes Flooded Tubular Plate (STP), Regular STANRED, and Premium STANTUBULAR. Engineered with tubular spines cast under 100 bar pressure for zero void defect.',
    image: './images/sf_tubepower.png',
    gallery: [
      './images/sf_tubepower.png',
      './images/sf_stanred.png',
      './images/sf_stantubular.png',
      './images/sf_stanflat.png',
      './images/sf_powerbox.png',
      './images/sf_powerhouse.png',
      './images/sfexidelogo.png'
    ],
    features: [
      'Cast on high-pressure HADI machines for void-free positive spines',
      'Thick tubular plates withstand repeated deep discharges without grid degradation',
      'Electrolyte volume reserves reduce water replenishment intervals',
      'Includes SF Sonic Power Box and Power House models for high-drain applications',
      'Heavy-duty terminals withstand high peak startup surges'
    ],
    specs: {
      'Available Models': 'STP, STANRED, STANTUBULAR, STANFLAT, Power Box, Power House',
      'Capacities': '120Ah, 150Ah, 180Ah, 200Ah',
      'Spine Metallurgy': 'High-tensile corrosion resistant selenium low-antimony alloy',
      'Warranty': '36 to 60 Months Warranty'
    },
    warranty: '36 to 60 Months Warranty',
    inStock: true
  },

  // ==========================================
  // SMF (SEALED MAINTENANCE FREE) BATTERIES
  // ==========================================
  {
    id: 'smf-amaron-quanta',
    name: 'Amaron Quanta UPS SMF Battery',
    brand: 'Amaron',
    category: 'smf-battery',
    subCategory: 'Amaron',
    capacity: '26Ah to 200Ah',
    tagline: 'The back-up for a back-up: Fail-safe, fool-proof world-renowned battery technology',
    description: 'Amaron Quanta is not just another UPS battery—it is the unrivalled choice for high-reliability IT server rooms, financial trading floors, ATMs, and industrial automation. Manufactured in a world-class QS 9000 accredited facility.',
    image: './images/prod_quanta.jpg',
    gallery: [
      './images/prod_quanta.jpg',
      './images/ama.jpg'
    ],
    features: [
      'Unique heavy-duty, corrosion-resistant alloy positive grids to increase cyclic life in tropical environments',
      'Instacharge: Patented paste recipe for excellent charge acceptance and rapid recovery',
      'Lower internal resistance for superior high-discharge performance',
      'Aesthetically designed with rugged Flappon terminal protectors preventing accidental shorts',
      'Compact, lightweight, factory-charged, explosion-resistant, and environmentally friendly',
      'QS 9000 and ISO 14001 accredited manufacturing standards meeting stringent global norms',
      'Clean, sleek aesthetics suited for indoor server rooms and office cabinets'
    ],
    specs: {
      'Capacity Range': '26Ah, 42Ah, 65Ah, 84Ah, 100Ah, 120Ah, 150Ah, 200Ah',
      'Type': 'Valve Regulated Lead Acid (VRLA) / Sealed Maintenance-Free (SMF)',
      'Terminal Type': 'Threaded Copper Terminal with Flappon Protector',
      'Self Discharge': '< 3% per month at 25°C',
      'Operating Temperature': '-20°C to +60°C'
    },
    warranty: '24 to 36 Months Warranty',
    inStock: true
  },
  {
    id: 'smf-exide-powersafe',
    name: 'Exide Powersafe SMF VRLA Battery',
    brand: 'Exide',
    category: 'smf-battery',
    subCategory: 'Exide SMF',
    capacity: '7Ah to 100Ah',
    tagline: 'Premium sealed maintenance-free battery for continuous UPS applications',
    description: 'Exide Powersafe SMF batteries provide absolute freedom from orientation constraints. With gas recombination technology and sealed construction, they can be mounted horizontally, vertically, or sideways without electrolyte spillage.',
    image: './images/exi.jpg',
    gallery: [
      './images/exi.jpg',
      './images/Products_Exide_Bat.jpg'
    ],
    features: [
      'Sealed Maintenance-Free: No checking electrolyte levels or topping up throughout life',
      'Free from Orientation Constraints: Can be installed vertically, horizontally, or in modular racks',
      'Eco-Friendly: Unique gas recombination nullifies gas emission during normal operation',
      'Minimal Voltage Drop: Can be placed immediately adjacent to UPS electronic boards',
      'Easy Handling & Installation: Modular, lightweight, ready to use in factory-charged condition',
      'Low Self-Discharge: Can be stored for 3 to 6 months without recharge',
      'Superior High Rate Discharge: Ultra-low internal resistance for 15/30/60 minute UPS discharge'
    ],
    specs: {
      'Capacities': '7Ah, 12Ah, 18Ah, 26Ah, 42Ah, 65Ah, 75Ah, 100Ah',
      'Service Life': '3 to 5 years design float life for EP range',
      'Casing': 'Flame retardant ABS (UL 94-V0 optional)',
      'Shelf Life': '3 to 6 months before recharge requirement',
      'Warranty': '2 Years Replacement Warranty'
    },
    warranty: '2 Years Comprehensive Warranty',
    inStock: true
  },
  {
    id: 'smf-global-yuasa-panasonic',
    name: 'Global Yuasa & Panasonic SMF Battery Series',
    brand: 'Global Yuasa / Panasonic',
    category: 'smf-battery',
    subCategory: 'Panasonic / Yuasa',
    capacity: '7Ah to 200Ah',
    tagline: 'World-renowned Japanese reliability for high-availability UPS banks',
    description: 'Imported high-performance SMF batteries from Global Yuasa and Panasonic. Built for ultra-critical medical imaging, banking transaction engines, and aerospace installations.',
    image: './images/Products_Panasonic_Bat.jpg',
    gallery: [
      './images/Products_Panasonic_Bat.jpg',
      './images/Products_Rocket_Bat.jpg',
      './images/acc-img4.jpg'
    ],
    features: [
      'Unsurpassed high rate discharge capability',
      'Heavy-duty lead-tin-calcium alloy plates with microporous AGM separators',
      'Oxygen recombination efficiency greater than 99%',
      'Extended service life exceeding 5 years in standby float service'
    ],
    specs: {
      'Voltage': '12V',
      'Capacity': '7Ah, 17Ah, 26Ah, 40Ah, 65Ah, 100Ah, 120Ah, 200Ah',
      'Technology': 'Absorbed Glass Mat (AGM) VRLA'
    },
    warranty: '2 Years Replacement Warranty',
    inStock: true
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Products', count: PRODUCTS.length },
  { id: 'ups', label: 'Online UPS', count: PRODUCTS.filter(p => p.category === 'ups').length },
  { id: 'inverter', label: 'Inverters (Home UPS)', count: PRODUCTS.filter(p => p.category === 'inverter').length },
  { id: 'tubular-battery', label: 'Tubular Batteries', count: PRODUCTS.filter(p => p.category === 'tubular-battery').length },
  { id: 'smf-battery', label: 'SMF Batteries', count: PRODUCTS.filter(p => p.category === 'smf-battery').length }
];

export const BRANDS = [
  'All Brands',
  'APC',
  'Delta / Vertiv',
  'Microtek',
  'Luminous',
  'Exide',
  'SF Exide',
  'Amaron',
  'Crompton Greaves',
  'Mahindra',
  'Su-Kam',
  'Tribal'
];

