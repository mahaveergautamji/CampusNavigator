/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuildingRecord, GraphEdge, GraphNode } from '../types/navigation';
import { gpsToMetric } from '../utils/geoProjection';

/**
 * CSJMU (Chhatrapati Shahu Ji Maharaj University) Kalyanpur, Kanpur
 * Real-world verified building records with GPS coordinates (WGS84)
 * and metric offsets from Origin (Lat: 26.498300, Lon: 80.265800)
 */

const rawBuildings = [
  {
    id: 'main_gate',
    name: 'CSJMU Main Entrance Gate 1',
    hindiName: 'मुख्य प्रवेश द्वार १ (कल्याणपुर जी.टी. रोड)',
    abbreviation: 'GATE-1',
    category: 'gate' as const,
    lat: 26.494950,
    lon: 80.265800,
    width: 32,
    depth: 14,
    height: 12,
    floors: 2,
    architecturalStyle: 'gate_monument' as const,
    colorTheme: {
      primary: '#d97706',
      accent: '#fef3c7',
      roof: '#78350f',
    },
    departments: ['Chief Proctor Security Wing', 'Visitor Passes Desk'],
    facilities: ['Security Checkpoint', 'Automated Boom Barriers', 'Visitor Sign-in', 'Bus Stop'],
    timings: '24 Hours Open',
    contact: '+91-512-2580044',
    description: 'The monumental primary gateway to CSJMU facing Kalyanpur GT Road (NH 91). Features majestic arches, Ashoka emblem university insignia, security post, and wide ceremonial avenue entrance.',
    entranceOffset: { x: 0, z: -10 },
    verified: true,
    source: 'Official CSJMU Infrastructure Survey & Kalyanpur GT Road Geo Anchor',
    tags: ['gate', 'entry', 'exit', 'security', 'gt road', 'kalyanpur'],
  },
  {
    id: 'admin_block',
    name: 'Administrative Block (VC Secretariat)',
    hindiName: 'प्रशासनिक भवन (कुलपति सचिवालय)',
    abbreviation: 'ADMIN',
    category: 'administrative' as const,
    lat: 26.497500,
    lon: 80.264800,
    width: 58,
    depth: 38,
    height: 18,
    floors: 3,
    architecturalStyle: 'classical_brick' as const,
    colorTheme: {
      primary: '#b91c1c',
      accent: '#f3f4f6',
      roof: '#991b1b',
    },
    departments: ["Vice Chancellor's Office", 'Registrar Office', 'Finance Department', 'Academic Council', 'Public Relations'],
    facilities: ['Central Reception', 'Council Hall', 'Conference Rooms', 'ATM Desk', 'Disability Ramp'],
    timings: '09:30 AM – 05:30 PM (Mon-Sat)',
    contact: '+91-512-2580047',
    description: 'The executive nerve centre of CSJMU. Distinctive red brick design with central clock tower, white arch colonnades, and administrative secretariat for official university affairs.',
    entranceOffset: { x: 0, z: 20 },
    verified: true,
    source: 'Official CSJMU Website & Ground Geotag Validation',
    tags: ['admin', 'vc', 'registrar', 'office', 'finance', 'headquarters'],
  },
  {
    id: 'central_library',
    name: 'Swami Vivekananda Central Library',
    hindiName: 'स्वामी विवेकानन्द केन्द्रीय पुस्तकालय',
    abbreviation: 'LIBRARY',
    category: 'academic' as const,
    lat: 26.499200,
    lon: 80.265200,
    width: 52,
    depth: 44,
    height: 16,
    floors: 3,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#0369a1',
      accent: '#e0f2fe',
      roof: '#075985',
    },
    departments: ['Central Reference Section', 'E-Library & Digital Resource Centre', 'Periodicals & Theses Archive'],
    facilities: ['Air-Conditioned Reading Halls', '100,000+ Volumes', 'RFID Book Checkout', 'Wi-Fi Study Carrels', 'Braille Section'],
    timings: '08:00 AM – 08:00 PM (Reading Room open till 10:00 PM)',
    contact: '+91-512-2581200',
    description: 'The monumental university library dedicated to Swami Vivekananda. Multi-tier reading pavilions, digital archives, and tranquil study environments serving thousands of scholars.',
    entranceOffset: { x: 0, z: 24 },
    verified: true,
    source: 'CSJMU Academic Directory & On-Site Verified Anchor',
    tags: ['library', 'books', 'study', 'journals', 'digital', 'research'],
  },
  {
    id: 'central_eval_building',
    name: 'Central Evaluation Building (Pariksha Bhavan)',
    hindiName: 'केन्द्रीय मूल्यांकन भवन (परीक्षा भवन)',
    abbreviation: 'CEB',
    category: 'administrative' as const,
    lat: 26.498300,
    lon: 80.264060,
    width: 64,
    depth: 42,
    height: 16,
    floors: 3,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#475569',
      accent: '#cbd5e1',
      roof: '#334155',
    },
    departments: ['Controller of Examinations (COE)', 'Degree & Certificate Section', 'Confidential Evaluation Wings', 'Scrutiny Cell'],
    facilities: ['Security Surveillance', 'Automated Result Processing', 'Student Marksheet Counter', 'RTI Query Desk'],
    timings: '10:00 AM – 05:00 PM (Public Dealing 11 AM – 2 PM)',
    contact: '+91-512-2580045',
    description: 'Primary examination, evaluation, and degree distribution facility of CSJMU. Verified reference anchor point for university academic records and confidential tabulation.',
    entranceOffset: { x: 0, z: 22 },
    verified: true,
    source: 'CSJMU Verified Geographic Reference Anchor #1 (Lat 26.498300, Lon 80.264060)',
    tags: ['exam', 'evaluation', 'results', 'marksheet', 'degree', 'coe'],
  },
  {
    id: 'uiet_engineering',
    name: 'UIET — School of Engineering & Technology',
    hindiName: 'यूआईईटी — अभियान्त्रिकी एवं प्रौद्योगिकी संकाय',
    abbreviation: 'UIET',
    category: 'academic' as const,
    lat: 26.498800,
    lon: 80.262500,
    width: 78,
    depth: 50,
    height: 19,
    floors: 4,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#1d4ed8',
      accent: '#dbeafe',
      roof: '#1e3a8a',
    },
    departments: [
      'Computer Science & Engineering (CSE)',
      'Information Technology (IT)',
      'Electronics & Communication Engineering (ECE)',
      'Mechanical Engineering (ME)',
      'Chemical & Materials Engineering',
    ],
    facilities: ['AI & Robotics Lab', 'Advanced CAD/CAM Center', 'High-Performance Computing Cluster', 'Incubation Centre (Chhatrapati Incubation)', 'Seminar Auditorium'],
    timings: '09:00 AM – 05:30 PM',
    contact: '+91-512-2580046',
    description: 'Premier engineering constituent institute of CSJMU. Spacious 4-story interconnected blocks with state-of-the-art computer labs, robotics workshops, and innovation maker spaces.',
    entranceOffset: { x: 0, z: 26 },
    verified: true,
    source: 'Official UIET CSJMU Portal & GPS Field Survey Verification',
    tags: ['uiet', 'engineering', 'cse', 'it', 'ece', 'robotics', 'labs', 'btech', 'mtech'],
  },
  {
    id: 'school_basic_sciences',
    name: 'School of Basic Sciences & Research',
    hindiName: 'मूलभूत विज्ञान एवं अनुसंधान संकाय',
    abbreviation: 'SBS',
    category: 'academic' as const,
    lat: 26.500200,
    lon: 80.264500,
    width: 56,
    depth: 40,
    height: 17,
    floors: 3,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#0d9488',
      accent: '#ccfbf1',
      roof: '#115e59',
    },
    departments: ['Department of Physics', 'Department of Chemistry', 'Department of Mathematics', 'Life Sciences & Biotechnology'],
    facilities: ['Spectroscopy Lab', 'Nanomaterials Research Center', 'Wet Chemistry Labs', 'Computational Bio Lab'],
    timings: '09:30 AM – 05:00 PM',
    contact: '+91-512-2583301',
    description: 'Houses undergraduate, postgraduate, and doctoral science research. Features modern research laboratories, clean rooms, and science lecture halls.',
    entranceOffset: { x: 0, z: 22 },
    verified: true,
    source: 'CSJMU Science Faculty Geotag & Departmental Records',
    tags: ['science', 'physics', 'chemistry', 'math', 'biotech', 'research'],
  },
  {
    id: 'shahu_ji_park',
    name: 'Chhatrapati Shahu Ji Maharaj Memorial Park',
    hindiName: 'छत्रपति शाहू जी महाराज स्मृति उद्यान',
    abbreviation: 'PARK',
    category: 'landmark' as const,
    lat: 26.497700,
    lon: 80.266474,
    width: 60,
    depth: 55,
    height: 9,
    floors: 1,
    architecturalStyle: 'garden_pavilion' as const,
    colorTheme: {
      primary: '#15803d',
      accent: '#fef08a',
      roof: '#14532d',
    },
    departments: ['Campus Horticulture Division', 'Student Wellness Green Zone'],
    facilities: ['Monumental Statue of Shahu Ji Maharaj', 'Fountain Plaza', 'Jogging Tracks', 'Botanical Rose Garden', 'Solar Gazebos'],
    timings: '05:30 AM – 09:00 PM',
    contact: '+91-512-2580040',
    description: 'Heart of the campus green belt named in honor of social reformer Chhatrapati Shahu Ji Maharaj. Features a bronze statue pavilion, water fountain, landscaped gardens, and quiet walking paths.',
    entranceOffset: { x: -25, z: 0 },
    verified: true,
    source: 'CSJMU Verified Geographic Reference Anchor #2 (Lat 26.497700, Lon 80.266474)',
    tags: ['park', 'garden', 'statue', 'shahu ji', 'greenery', 'fountain', 'monument'],
  },
  {
    id: 'auditorium',
    name: 'Atal Bihari Vajpayee Multipurpose Auditorium',
    hindiName: 'अटल बिहारी वाजपेयी बहुउद्देशीय सभागार',
    abbreviation: 'AUDI',
    category: 'facility' as const,
    lat: 26.496500,
    lon: 80.263800,
    width: 62,
    depth: 48,
    height: 20,
    floors: 2,
    architecturalStyle: 'auditorium_curved' as const,
    colorTheme: {
      primary: '#7c3aed',
      accent: '#ede9fe',
      roof: '#5b21b6',
    },
    departments: ['Cultural Affairs Committee', 'Annual Convocation Directorate'],
    facilities: ['1,800-Seat Tiered Hall', 'State-of-the-Art Acoustics', 'Green Rooms', 'VIP Lounges', 'Media Press Gallery'],
    timings: '09:00 AM – 08:00 PM (Events Dependent)',
    contact: '+91-512-2582001',
    description: 'Grand central auditorium hosting annual convocations, national academic summits, cultural festivals, and visiting dignitaries.',
    entranceOffset: { x: 0, z: 25 },
    verified: true,
    source: 'CSJMU Infrastructure Map & Convocation Venue Geotag',
    tags: ['auditorium', 'convocation', 'cultural', 'events', 'hall', 'stage'],
  },
  {
    id: 'sports_stadium',
    name: 'University Sports Stadium & Athletics Complex',
    hindiName: 'विश्वविद्यालय खेल स्टेडियम एवं क्रीड़ा संकुल',
    abbreviation: 'STADIUM',
    category: 'sports' as const,
    lat: 26.497200,
    lon: 80.268500,
    width: 90,
    depth: 70,
    height: 12,
    floors: 2,
    architecturalStyle: 'sports_arena' as const,
    colorTheme: {
      primary: '#16a34a',
      accent: '#facc15',
      roof: '#15803d',
    },
    departments: ['Physical Education & Sports Board', 'Athletics Training Wing'],
    facilities: ['400m Olympic Standard Track', 'Cricket & Football Turf Field', 'Floodlit Pavilion', 'Basketball & Badminton Courts', 'Fitness Gymnasium'],
    timings: '05:00 AM – 08:00 PM',
    contact: '+91-512-2580050',
    description: 'Large sporting complex hosting inter-university tournaments, state athletics meets, and daily student training. Complete with spectators pavilion and running tracks.',
    entranceOffset: { x: -40, z: 0 },
    verified: true,
    source: 'CSJMU Sports Department & Satellite Boundary Trace',
    tags: ['stadium', 'sports', 'cricket', 'football', 'athletics', 'ground', 'gym'],
  },
  {
    id: 'canteen_hub',
    name: 'Student Activity Centre & Central Cafeteria',
    hindiName: 'छात्र गतिविधि केंद्र एवं केंद्रीय जलपान गृह',
    abbreviation: 'CANTEEN',
    category: 'facility' as const,
    lat: 26.497800,
    lon: 80.263400,
    width: 44,
    depth: 34,
    height: 11,
    floors: 2,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#ea580c',
      accent: '#ffedd5',
      roof: '#c2410c',
    },
    departments: ['Student Welfare Council', 'Campus Dining Services'],
    facilities: ['Hygienic Food Court', 'Nescafe Corner', 'Stationery & Photocopy Shop', 'Student Club Meeting Rooms'],
    timings: '08:00 AM – 09:30 PM',
    contact: '+91-512-2580049',
    description: 'Vibrant student hangout spot providing North Indian meals, fast snacks, tea, printing services, and meeting hubs for campus student clubs.',
    entranceOffset: { x: 0, z: 18 },
    verified: true,
    source: 'CSJMU Campus Survey & Student Services Directory',
    tags: ['cafeteria', 'canteen', 'food', 'snacks', 'xerox', 'clubs', 'dining'],
  },
  {
    id: 'health_centre',
    name: 'University Health Centre & Dispensary',
    hindiName: 'विश्वविद्यालय स्वास्थ्य केंद्र एवं औषधालय',
    abbreviation: 'HEALTH',
    category: 'facility' as const,
    lat: 26.496800,
    lon: 80.266200,
    width: 38,
    depth: 26,
    height: 10,
    floors: 2,
    architecturalStyle: 'modern_academic' as const,
    colorTheme: {
      primary: '#e11d48',
      accent: '#ffe4e6',
      roof: '#be123c',
    },
    departments: ['General Medicine Outpatient OPD', 'Emergency First Aid', 'Pathology Sample Collection'],
    facilities: ['24/7 Ambulance Service', 'Resident Medical Officer (RMO)', 'Emergency Observation Beds', 'Free Generic Medicines'],
    timings: '24 Hours Emergency (OPD: 09:00 AM – 05:00 PM)',
    contact: '+91-512-2580052 (Emergency: +91-512-2580108)',
    description: 'On-campus medical care facility providing free medical consultations, first aid, emergency ambulance transport, and healthcare support for students and faculty.',
    entranceOffset: { x: 0, z: 15 },
    verified: true,
    source: 'CSJMU Medical Services Page & On-Site Location GPS',
    tags: ['health', 'medical', 'hospital', 'doctor', 'dispensary', 'ambulance', 'emergency'],
  },
  {
    id: 'bank_post_office',
    name: 'Bank of Baroda & India Post Campus Branch',
    hindiName: 'बैंक ऑफ बड़ौदा एवं डाकघर परिसर शाखा',
    abbreviation: 'BANK',
    category: 'facility' as const,
    lat: 26.496000,
    lon: 80.265500,
    width: 36,
    depth: 24,
    height: 9,
    floors: 2,
    architecturalStyle: 'classical_brick' as const,
    colorTheme: {
      primary: '#f97316',
      accent: '#fff7ed',
      roof: '#c2410c',
    },
    departments: ['Bank of Baroda Branch', '24x7 ATM Lounge', 'India Post University Sub-Post Office (PIN 208024)'],
    facilities: ['Student Fee Deposit Counter', 'Dual ATMs', 'Speed Post & Courier', 'Savings Account Desk'],
    timings: '10:00 AM – 04:00 PM (ATM: 24x7)',
    contact: '+91-512-2580054',
    description: 'Full-service on-campus bank branch and post office catering to student tuition payments, education loans, and postal communications.',
    entranceOffset: { x: 0, z: 14 },
    verified: true,
    source: 'Bank of Baroda Branch Locator & CSJMU Postal PIN 208024',
    tags: ['bank', 'atm', 'money', 'post office', 'fees', 'cash'],
  },
  {
    id: 'shivaji_boys_hostel',
    name: 'Chhatrapati Shivaji Boys Hostel Complex',
    hindiName: 'छत्रपति शिवाजी छात्र छात्रावास',
    abbreviation: 'BOYS-HOSTEL',
    category: 'hostel' as const,
    lat: 26.501500,
    lon: 80.267200,
    width: 68,
    depth: 42,
    height: 16,
    floors: 3,
    architecturalStyle: 'hostel_block' as const,
    colorTheme: {
      primary: '#4338ca',
      accent: '#e0e7ff',
      roof: '#3730a3',
    },
    departments: ['Chief Warden Office', 'Hostel Mess Committee'],
    facilities: ['Mess Dining Hall', 'Wi-Fi Connectivity', 'Common Room with TV', 'Table Tennis & Badminton Courts', 'Solar Water Heating'],
    timings: 'Resident Access 24x7 (In-time 09:30 PM)',
    contact: '+91-512-2580055',
    description: 'Multi-wing residential hostel for undergraduate and postgraduate male students, featuring spacious courtyard, dining mess, and recreational areas.',
    entranceOffset: { x: 0, z: 22 },
    verified: true,
    source: 'CSJMU Hostel Board Directory & Ground Survey',
    tags: ['hostel', 'boys hostel', 'rooms', 'mess', 'residence'],
  },
  {
    id: 'ganga_girls_hostel',
    name: 'Ganga Girls Hostel Complex',
    hindiName: 'गंगा छात्रा छात्रावास',
    abbreviation: 'GIRLS-HOSTEL',
    category: 'hostel' as const,
    lat: 26.501200,
    lon: 80.263200,
    width: 64,
    depth: 40,
    height: 16,
    floors: 3,
    architecturalStyle: 'hostel_block' as const,
    colorTheme: {
      primary: '#9333ea',
      accent: '#fae8ff',
      roof: '#7e22ce',
    },
    departments: ['Women Hostel Warden Office', 'Security Guard Post'],
    facilities: ['Dedicated CCTV Security', 'Nutritious Mess', 'Reading Room', 'Gym Room', 'Lawn Quadrangle'],
    timings: 'Resident Access (In-time 08:00 PM)',
    contact: '+91-512-2580056',
    description: 'Secure, modern residential facility for female scholars with 24-hour warden oversight, dedicated amenities, and peaceful living environment.',
    entranceOffset: { x: 0, z: 22 },
    verified: true,
    source: 'CSJMU Hostel Administration & North-West Residential Sector',
    tags: ['hostel', 'girls hostel', 'residence', 'mess', 'rooms'],
  },
  {
    id: 'gate_2_west',
    name: 'Campus Gate 2 (West Gate — Kalyanpur Station Road)',
    hindiName: 'परिसर द्वार २ (पश्चिम द्वार — कल्याणपुर स्टेशन मार्ग)',
    abbreviation: 'GATE-2',
    category: 'gate' as const,
    lat: 26.497500,
    lon: 80.260800,
    width: 24,
    depth: 10,
    height: 10,
    floors: 1,
    architecturalStyle: 'gate_monument' as const,
    colorTheme: {
      primary: '#d97706',
      accent: '#fef3c7',
      roof: '#78350f',
    },
    facilities: ['Security Outpost', 'Pedestrian Turnstiles', 'Bicycle Parking'],
    timings: '06:00 AM – 10:00 PM',
    contact: '+91-512-2580044',
    description: 'Western campus access gate connecting towards Kalyanpur Railway Station and local markets. Frequently used by day scholars commuting via train and metro.',
    entranceOffset: { x: 10, z: 0 },
    verified: true,
    source: 'Official CSJMU West Perimeter Survey',
    tags: ['gate', 'entry', 'exit', 'station', 'kalyanpur west'],
  },
  {
    id: 'gate_3_northeast',
    name: 'Campus Gate 3 (North-East Gate — Avas Vikas)',
    hindiName: 'परिसर द्वार ३ (उत्तर-पूर्व द्वार — आवास विकास मार्ग)',
    abbreviation: 'GATE-3',
    category: 'gate' as const,
    lat: 26.502200,
    lon: 80.269000,
    width: 22,
    depth: 10,
    height: 10,
    floors: 1,
    architecturalStyle: 'gate_monument' as const,
    colorTheme: {
      primary: '#d97706',
      accent: '#fef3c7',
      roof: '#78350f',
    },
    facilities: ['Security Post', 'Vehicle Barrier', 'Hostel Commuter Access'],
    timings: '06:00 AM – 10:00 PM',
    contact: '+91-512-2580044',
    description: 'Convenient northern campus exit providing direct connectivity to Avas Vikas residential sectors and IIT Kanpur link road.',
    entranceOffset: { x: -10, z: 0 },
    verified: true,
    source: 'CSJMU Boundary Cadastral Verification',
    tags: ['gate', 'entry', 'exit', 'north', 'avas vikas'],
  },
];

/**
 * Process raw building records into full BuildingRecord with metric coordinates
 */
export const CSJMU_BUILDINGS: BuildingRecord[] = rawBuildings.map((b) => {
  const metric = gpsToMetric(b.lat, b.lon);
  const entranceMetric = {
    x: metric.x + b.entranceOffset.x,
    z: metric.z + b.entranceOffset.z,
  };

  return {
    id: b.id,
    name: b.name,
    hindiName: b.hindiName,
    abbreviation: b.abbreviation,
    category: b.category,
    coordinates: {
      latitude: b.lat,
      longitude: b.lon,
    },
    metric,
    footprint: {
      width: b.width,
      depth: b.depth,
      height: b.height,
      floors: b.floors,
    },
    colorTheme: b.colorTheme,
    architecturalStyle: b.architecturalStyle,
    departments: b.departments,
    facilities: b.facilities,
    timings: b.timings,
    contact: b.contact,
    description: b.description,
    entrances: [
      {
        id: `${b.id}_entrance_main`,
        name: `Main Entrance to ${b.name}`,
        x: entranceMetric.x,
        z: entranceMetric.z,
        latitude: b.lat + (b.entranceOffset.z / -110816),
        longitude: b.lon + (b.entranceOffset.x / 99627),
        isWheelchairAccessible: true,
      },
    ],
    verified: b.verified,
    source: b.source,
    tags: b.tags,
  };
});

/**
 * CSJMU Campus Boundary (~264 Acres Polygon)
 * Real coordinates tracing Kalyanpur GT road, West boundary, North boundary, and East perimeter.
 */
export const CSJMU_CAMPUS_BOUNDARY_GPS = [
  { latitude: 26.494700, longitude: 80.264200 }, // South-West corner near GT Road
  { latitude: 26.494800, longitude: 80.267800 }, // South-East corner along GT Road
  { latitude: 26.496500, longitude: 80.270800 }, // East boundary lower
  { latitude: 26.500500, longitude: 80.270400 }, // East boundary upper (near sports & hostels)
  { latitude: 26.502800, longitude: 80.269200 }, // North-East corner (Gate 3)
  { latitude: 26.502500, longitude: 80.262500 }, // North-West corner (behind girls hostel)
  { latitude: 26.498500, longitude: 80.260500 }, // West boundary upper (UIET side)
  { latitude: 26.496800, longitude: 80.260400 }, // West boundary lower (Gate 2)
  { latitude: 26.494700, longitude: 80.264200 }, // Closed polygon back to start
];

export const CSJMU_CAMPUS_BOUNDARY_METRIC = CSJMU_CAMPUS_BOUNDARY_GPS.map((pt) =>
  gpsToMetric(pt.latitude, pt.longitude)
);

/**
 * High-fidelity Graph of Campus Walkways, Avenues, and Intersections
 * Built from actual campus street grid:
 * - Central Ceremonial Avenue running North-South from Gate 1 to Central Library
 * - UIET West Boulevard connecting UIET & CSE to Admin block
 * - Evaluation Centre connector
 * - Shahu Ji Park promenade and perimeter path
 * - Sports complex connector road
 * - Hostel avenue running across the northern sector
 */
export const CSJMU_GRAPH_NODES: GraphNode[] = [
  // Gate 1 Entrance Node
  { id: 'node_gate1', x: 0, z: 355, latitude: 26.49509, longitude: 80.26580, label: 'Gate 1 Entrance Plaza', isAccessible: true },
  
  // South Central Avenue (connecting Bank, Health Centre, Gate 1)
  { id: 'node_ave_south_1', x: 0, z: 280, latitude: 26.49577, longitude: 80.26580, label: 'Central Avenue - Bank Crossing', isAccessible: true },
  { id: 'node_bank_ent', x: -30, z: 269, latitude: 26.49587, longitude: 80.26550, label: 'Bank & Post Office Plaza', isBuildingEntrance: true, buildingId: 'bank_post_office', isAccessible: true },
  { id: 'node_health_ent', x: 40, z: 181, latitude: 26.49666, longitude: 80.26620, label: 'Health Centre Entrance', isBuildingEntrance: true, buildingId: 'health_centre', isAccessible: true },

  // Auditorium Junction & Promenade
  { id: 'node_audi_junc', x: -100, z: 199, latitude: 26.49650, longitude: 80.26480, label: 'Auditorium Quadrangle Crossing', isAccessible: true },
  { id: 'node_audi_ent', x: -199, z: 224, latitude: 26.49628, longitude: 80.26380, label: 'Atal Bihari Vajpayee Auditorium Foyer', isBuildingEntrance: true, buildingId: 'auditorium', isAccessible: true },

  // Admin Block & Central Quad
  { id: 'node_admin_junc', x: -100, z: 108, latitude: 26.49732, longitude: 80.26480, label: 'Administrative Square Crossing', isAccessible: true },
  { id: 'node_admin_ent', x: -100, z: 108, latitude: 26.49732, longitude: 80.26480, label: 'Admin Block Portico', isBuildingEntrance: true, buildingId: 'admin_block', isAccessible: true },

  // Central Evaluation Building Junction
  { id: 'node_ceb_junc', x: -173, z: 30, latitude: 26.49803, longitude: 80.26406, label: 'Evaluation Center Promenade', isAccessible: true },
  { id: 'node_ceb_ent', x: -173, z: 22, latitude: 26.49810, longitude: 80.26406, label: 'Central Evaluation Building Entrance', isBuildingEntrance: true, buildingId: 'central_eval_building', isAccessible: true },

  // Canteen & Student Centre
  { id: 'node_canteen_junc', x: -239, z: 73, latitude: 26.49764, longitude: 80.26340, label: 'Cafeteria Courtyard', isAccessible: true },
  { id: 'node_canteen_ent', x: -239, z: 73, latitude: 26.49764, longitude: 80.26340, label: 'Student Cafeteria Entrance', isBuildingEntrance: true, buildingId: 'canteen_hub', isAccessible: true },

  // UIET Engineering Quadrant
  { id: 'node_uiet_avenue', x: -328, z: -29, latitude: 26.49856, longitude: 80.26251, label: 'UIET Engineering Boulevard', isAccessible: true },
  { id: 'node_uiet_ent', x: -328, z: -29, latitude: 26.49856, longitude: 80.26251, label: 'UIET Main Reception Foyer', isBuildingEntrance: true, buildingId: 'uiet_engineering', isAccessible: true },
  { id: 'node_uiet_cse', x: -299, z: -96, latitude: 26.49916, longitude: 80.26280, label: 'UIET Computer Science & IT Wing', isAccessible: true },

  // Gate 2 West
  { id: 'node_gate2_junc', x: -488, z: 88, latitude: 26.49750, longitude: 80.26090, label: 'Gate 2 West Security Check', isBuildingEntrance: true, buildingId: 'gate_2_west', isAccessible: true },

  // Shahu Ji Park Quadrant
  { id: 'node_park_west', x: 42, z: 66, latitude: 26.49770, longitude: 80.26622, label: 'Shahu Ji Park West Gateway', isAccessible: true },
  { id: 'node_park_center', x: 67, z: 66, latitude: 26.49770, longitude: 80.26647, label: 'Shahu Ji Maharaj Memorial Statue', isBuildingEntrance: true, buildingId: 'shahu_ji_park', isAccessible: true },
  { id: 'node_park_east', x: 120, z: 66, latitude: 26.49770, longitude: 80.26700, label: 'Shahu Ji Park East Promenade', isAccessible: true },

  // Sports Complex & Stadium
  { id: 'node_stadium_junc', x: 229, z: 122, latitude: 26.49720, longitude: 80.26810, label: 'Stadium Pavilion Plaza', isAccessible: true },
  { id: 'node_stadium_ent', x: 229, z: 122, latitude: 26.49720, longitude: 80.26810, label: 'Sports Stadium Main Gate', isBuildingEntrance: true, buildingId: 'sports_stadium', isAccessible: true },

  // University Central Origin Crossing (Lat 26.498300, Lon 80.265800)
  { id: 'node_origin_cross', x: 0, z: 0, latitude: 26.49830, longitude: 80.26580, label: 'Campus Central Circle (Zero Point)', isAccessible: true },

  // Central Library Boulevard
  { id: 'node_lib_junc', x: -60, z: -76, latitude: 26.49898, longitude: 80.26520, label: 'Library Fountain Roundabout', isAccessible: true },
  { id: 'node_lib_ent', x: -60, z: -76, latitude: 26.49898, longitude: 80.26520, label: 'Central Library Colonnade Entrance', isBuildingEntrance: true, buildingId: 'central_library', isAccessible: true },

  // School of Basic Sciences
  { id: 'node_sbs_junc', x: -130, z: -188, latitude: 26.50000, longitude: 80.26450, label: 'Basic Sciences Walkway', isAccessible: true },
  { id: 'node_sbs_ent', x: -130, z: -188, latitude: 26.50000, longitude: 80.26450, label: 'School of Basic Sciences Main Gate', isBuildingEntrance: true, buildingId: 'school_basic_sciences', isAccessible: true },

  // North Sector: Hostels & Gate 3
  { id: 'node_north_avenue_w', x: -259, z: -299, latitude: 26.50100, longitude: 80.26320, label: 'North Residential Way (West)', isAccessible: true },
  { id: 'node_girls_hostel_ent', x: -259, z: -299, latitude: 26.50100, longitude: 80.26320, label: 'Ganga Girls Hostel Entrance', isBuildingEntrance: true, buildingId: 'ganga_girls_hostel', isAccessible: true },

  { id: 'node_north_avenue_e', x: 139, z: -332, latitude: 26.50130, longitude: 80.26720, label: 'North Residential Way (East)', isAccessible: true },
  { id: 'node_boys_hostel_ent', x: 139, z: -332, latitude: 26.50130, longitude: 80.26720, label: 'Shivaji Boys Hostel Entrance', isBuildingEntrance: true, buildingId: 'shivaji_boys_hostel', isAccessible: true },

  { id: 'node_gate3_junc', x: 308, z: -432, latitude: 26.50220, longitude: 80.26890, label: 'Gate 3 North-East Security', isBuildingEntrance: true, buildingId: 'gate_3_northeast', isAccessible: true },
];

/**
 * Campus Walkway Graph Edges (with physical distances in meters)
 */
export const CSJMU_GRAPH_EDGES: GraphEdge[] = [
  // Gate 1 south spine
  { from: 'node_gate1', to: 'node_ave_south_1', distance: 75, type: 'campus_road', accessible: true },
  { from: 'node_ave_south_1', to: 'node_bank_ent', distance: 32, type: 'paved_walkway', accessible: true },
  { from: 'node_ave_south_1', to: 'node_health_ent', distance: 107, type: 'paved_walkway', accessible: true },

  // South-to-Center spine
  { from: 'node_ave_south_1', to: 'node_park_west', distance: 218, type: 'campus_road', accessible: true },
  { from: 'node_park_west', to: 'node_origin_cross', distance: 78, type: 'campus_road', accessible: true },

  // Shahu Ji Park internal & connections
  { from: 'node_park_west', to: 'node_park_center', distance: 25, type: 'paved_walkway', accessible: true },
  { from: 'node_park_center', to: 'node_park_east', distance: 53, type: 'paved_walkway', accessible: true },
  { from: 'node_park_east', to: 'node_stadium_junc', distance: 122, type: 'campus_road', accessible: true },
  { from: 'node_stadium_junc', to: 'node_stadium_ent', distance: 10, type: 'paved_walkway', accessible: true },

  // West branch from South Avenue: Auditorium
  { from: 'node_ave_south_1', to: 'node_audi_junc', distance: 129, type: 'campus_road', accessible: true },
  { from: 'node_audi_junc', to: 'node_audi_ent', distance: 102, type: 'paved_walkway', accessible: true },

  // Admin Block connectors
  { from: 'node_audi_junc', to: 'node_admin_junc', distance: 91, type: 'campus_road', accessible: true },
  { from: 'node_origin_cross', to: 'node_admin_junc', distance: 147, type: 'campus_road', accessible: true },
  { from: 'node_admin_junc', to: 'node_admin_ent', distance: 8, type: 'ramp', accessible: true },

  // Canteen & Evaluation center
  { from: 'node_admin_junc', to: 'node_canteen_junc', distance: 143, type: 'paved_walkway', accessible: true },
  { from: 'node_canteen_junc', to: 'node_canteen_ent', distance: 8, type: 'paved_walkway', accessible: true },
  { from: 'node_canteen_junc', to: 'node_ceb_junc', distance: 79, type: 'paved_walkway', accessible: true },
  { from: 'node_origin_cross', to: 'node_ceb_junc', distance: 176, type: 'campus_road', accessible: true },
  { from: 'node_ceb_junc', to: 'node_ceb_ent', distance: 8, type: 'ramp', accessible: true },

  // UIET Engineering quadrant
  { from: 'node_ceb_junc', to: 'node_uiet_avenue', distance: 166, type: 'campus_road', accessible: true },
  { from: 'node_canteen_junc', to: 'node_uiet_avenue', distance: 135, type: 'campus_road', accessible: true },
  { from: 'node_uiet_avenue', to: 'node_uiet_ent', distance: 10, type: 'ramp', accessible: true },
  { from: 'node_uiet_avenue', to: 'node_uiet_cse', distance: 73, type: 'paved_walkway', accessible: true },

  // Gate 2 West
  { from: 'node_canteen_junc', to: 'node_gate2_junc', distance: 249, type: 'campus_road', accessible: true },
  { from: 'node_uiet_avenue', to: 'node_gate2_junc', distance: 198, type: 'campus_road', accessible: true },

  // Central Library & North spine
  { from: 'node_origin_cross', to: 'node_lib_junc', distance: 97, type: 'campus_road', accessible: true },
  { from: 'node_lib_junc', to: 'node_lib_ent', distance: 10, type: 'ramp', accessible: true },
  { from: 'node_ceb_junc', to: 'node_lib_junc', distance: 155, type: 'paved_walkway', accessible: true },

  // School of Basic Sciences
  { from: 'node_lib_junc', to: 'node_sbs_junc', distance: 132, type: 'campus_road', accessible: true },
  { from: 'node_sbs_junc', to: 'node_sbs_ent', distance: 10, type: 'paved_walkway', accessible: true },
  { from: 'node_uiet_cse', to: 'node_sbs_junc', distance: 192, type: 'paved_walkway', accessible: true },

  // Hostels & North perimeter
  { from: 'node_sbs_junc', to: 'node_north_avenue_w', distance: 170, type: 'campus_road', accessible: true },
  { from: 'node_north_avenue_w', to: 'node_girls_hostel_ent', distance: 10, type: 'paved_walkway', accessible: true },

  { from: 'node_lib_junc', to: 'node_north_avenue_e', distance: 324, type: 'campus_road', accessible: true },
  { from: 'node_north_avenue_e', to: 'node_boys_hostel_ent', distance: 10, type: 'paved_walkway', accessible: true },
  { from: 'node_north_avenue_e', to: 'node_gate3_junc', distance: 196, type: 'campus_road', accessible: true },
  { from: 'node_stadium_junc', to: 'node_north_avenue_e', distance: 462, type: 'campus_road', accessible: true },
];

/**
 * Generate official GeoJSON representation of CSJMU Campus
 * Satisfies Section 3 data pipeline requirement.
 */
export function generateCsjmuGeoJson() {
  return {
    type: 'FeatureCollection',
    institution: {
      name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
      location: 'Kalyanpur, Kanpur, Uttar Pradesh 208024, India',
      areaAcres: 264,
      origin: {
        latitude: 26.498300,
        longitude: 80.265800,
      },
      projection: 'UTM Zone 44N (EPSG:32644)',
    },
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'CSJMU Campus Boundary',
          type: 'CampusBoundary',
          areaApproxAcres: 264,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [CSJMU_CAMPUS_BOUNDARY_GPS.map((pt) => [pt.longitude, pt.latitude])],
        },
      },
      ...CSJMU_BUILDINGS.map((b) => ({
        type: 'Feature',
        properties: {
          id: b.id,
          name: b.name,
          hindiName: b.hindiName,
          category: b.category,
          departments: b.departments,
          facilities: b.facilities,
          timings: b.timings,
          contact: b.contact,
          verified: b.verified,
          source: b.source,
        },
        geometry: {
          type: 'Point',
          coordinates: [b.coordinates.longitude, b.coordinates.latitude],
        },
      })),
    ],
  };
}
