/* MuslimPro Giving: clickable Android UI demo for a donation / fundraising platform.
   Everything is in-memory sample data; no backend calls. Hash routes give the Android back button for free. */
'use strict';

const APP = 'MuslimPro';
const SITE = 'https://give.muslimpro.demo';
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const pct = c => Math.min(100, Math.round((c.raised / c.goal) * 100));

/* ---------- icons (24px stroke set) ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  share: '<path d="M15 5l6 6-6 6"/><path d="M21 11H11a7 7 0 0 0-7 7v1"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  msg: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  verified: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  bank: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 8 5H4z"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  pulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
  mosque: '<path d="M12 2v2"/><path d="M7 11c0-3 2.5-4.5 5-7 2.5 2.5 5 4 5 7"/><path d="M6 11h12v10H6z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/><path d="M2.5 21V10l1-2 1 2v11"/><path d="M19.5 21V10l1-2 1 2v11"/><path d="M1 21h22"/>',
  buoy: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  play: '<path d="M6 3l14 9-14 9z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  hands: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* Solid tab-bar glyphs, drawn to match the filled style of the reference app */
const NAV_ICONS = {
  home: '<path d="M5 3h14a1.5 1.5 0 0 1 0 3H5a1.5 1.5 0 0 1 0-3Z"/><path d="M3.5 8h17v10.5A3.5 3.5 0 0 1 17 22H7a3.5 3.5 0 0 1-3.5-3.5Z"/><path fill="#fff" d="M12 19.2l-3.3-3.1a2.1 2.1 0 0 1 3-3l.3.3.3-.3a2.1 2.1 0 0 1 3 3Z"/>',
  completed: '<path d="M6 2.5h12A3.5 3.5 0 0 1 21.5 6v12a3.5 3.5 0 0 1-3.5 3.5H6A3.5 3.5 0 0 1 2.5 18V6A3.5 3.5 0 0 1 6 2.5Z"/><path d="M8 13l3 3 5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  rating: '<path d="M6 2h12v7a6 6 0 0 1-12 0Z"/><path d="M6 4H3.5a1 1 0 0 0-1 1.2C3 8.5 4.6 10 6.5 10.4M18 4h2.5a1 1 0 0 1 1 1.2c-.5 3.3-2.1 4.8-4 5.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 14.5h3v3.5h-3z"/><path d="M7 19.5h10V22H7z"/>',
  news: '<path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v4.3L3.7 16.6a1 1 0 0 0 .9 1.4h14.8a1 1 0 0 0 .9-1.4l-1.8-3.3V9A6.5 6.5 0 0 0 12 2.5Z"/><path d="M9.2 19.5h5.6a2.8 2.8 0 0 1-5.6 0Z"/>',
  profile: '<circle cx="10" cy="6.5" r="4"/><path d="M2.5 19.5a7.5 7.5 0 0 1 12.2-5.8A5 5 0 0 0 13 21.5H4a1.5 1.5 0 0 1-1.5-2Z"/><circle cx="18.5" cy="17.5" r="4.5"/><path fill="#fff" d="M18.5 20.2l-2-1.9a1.2 1.2 0 0 1 1.7-1.8l.3.3.3-.3a1.2 1.2 0 0 1 1.7 1.8Z"/>',
};

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.5 4.5a11.5 11.5 0 1 0 11 15A9.2 9.2 0 1 1 16.5 4.5Z"/><path fill="#e9b52c" d="M23.3 7.2l1 2.3 2.4.3-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.3Z"/></svg>`;
const HEART_BG = `<svg class="bg" viewBox="0 0 54 50" aria-hidden="true"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fe0a0"/><stop offset="1" stop-color="#0a9b3c"/></linearGradient></defs><path fill="url(#hg)" d="M27 48 6.5 28.2A13.2 13.2 0 0 1 27 11.4a13.2 13.2 0 0 1 20.5 16.8Z"/></svg>`;

/* ---------- sample data ---------- */
const CATS = {
  medical: { label: 'Medical', icon: 'pulse', g: ['#3fb6d6', '#1d63b0'] },
  food: { label: 'Food & Iftar', icon: 'utensils', g: ['#f7b048', '#e0602a'] },
  water: { label: 'Water', icon: 'droplet', g: ['#4fcbee', '#2774d1'] },
  education: { label: 'Education', icon: 'book', g: ['#9a7cf4', '#5634c0'] },
  orphans: { label: 'Orphans', icon: 'baby', g: ['#f585a8', '#cf4778'] },
  masjid: { label: 'Masjid', icon: 'mosque', g: ['#38d39f', '#0a8a52'] },
  emergency: { label: 'Emergency', icon: 'buoy', g: ['#f6735a', '#c33838'] },
};

const ORGS = {
  shifa: { name: 'Shifa Health Trust', short: 'SH', color: '#1d63b0', ngo: true },
  noor: { name: 'Al-Noor Welfare Society', short: 'AN', color: '#0a8a52', ngo: true },
  ummeed: { name: 'Ummeed Foundation', short: 'UF', color: '#e0602a', ngo: true },
  iqra: { name: 'Iqra Education Trust', short: 'IQ', color: '#5634c0', ngo: true },
  me: { name: 'Ayesha Khan', short: 'AK', color: '#cf4778', ngo: false },
};

const CAMPAIGNS = [
  {
    id: 1, org: 'shifa', cat: 'medical', zakat: true, featured: true, city: 'Hyderabad, Telangana', days: 18,
    title: 'Help 6-year-old Ayaan beat leukaemia', caption: 'Ayaan has 4 chemo cycles left',
    goal: 800000, raised: 512400, donors: 1284,
    unit: [5000, 'day of chemotherapy'],
    ben: { Beneficiary: 'Ayaan Ahmed, 6 yrs', Relation: 'Patient (via NGO)', Hospital: 'MNJ Cancer Hospital', Location: 'Hyderabad' },
    docs: ['Hospital cost estimate', "Oncologist's letter", 'Parent ID proof'],
    story: ['Ayaan was diagnosed with acute lymphoblastic leukaemia in June. He loves cricket and wants to go back to Class 1 with his friends.', 'His father drives an auto-rickshaw and has already spent his savings on the first two cycles. The remaining treatment costs ₹8,00,000. Every rupee is paid directly to the hospital, and Shifa Health Trust shares bills after each cycle.'],
    updates: [['3 days ago', 'Cycle 3 completed. Ayaan is responding well and his blood counts are improving.'], ['2 weeks ago', 'Hospital bill of ₹1,85,000 paid from the funds raised. Receipt uploaded.']],
  },
  {
    id: 2, org: 'noor', cat: 'food', zakat: true, featured: true, city: 'Mumbai, Maharashtra', days: 9,
    title: 'Give an Iftar to 1,000 families this Ramadan', caption: '₹100 feeds one fasting person',
    goal: 300000, raised: 241800, donors: 2106,
    unit: [100, 'iftar meal'],
    ben: { Beneficiary: '1,000 daily-wage families', Distribution: 'Govandi & Mankhurd', Partner: 'Al-Noor volunteers', Location: 'Mumbai' },
    docs: ['NGO 12A & 80G certificates', 'Distribution plan', 'Vendor quotation'],
    story: ['Every evening this Ramadan our volunteers hand out fresh iftar boxes (dates, fruit, biryani and water) to families who would otherwise break their fast with very little.', 'Your gift is turned into meals within 48 hours. We post photos and the distribution list after every drive.'],
    updates: [['Yesterday', '412 iftar boxes distributed at Govandi station road.']],
  },
  {
    id: 3, org: 'ummeed', cat: 'water', zakat: false, city: 'Barmer, Rajasthan', days: 26,
    title: 'Clean water well for Sanawada village', caption: 'Women walk 6 km for water',
    goal: 450000, raised: 168500, donors: 640,
    unit: [1500, 'family supplied for a year'],
    ben: { Beneficiary: 'Sanawada village, 310 families', 'Project type': 'Borewell + hand pump + tank', Partner: 'Ummeed field team', Location: 'Barmer' },
    docs: ['Gram panchayat NOC', 'Hydro survey report', 'Contractor estimate'],
    story: ['In Sanawada the nearest safe water is 6 km away. Girls miss school to fetch it.', 'A 300-foot borewell with a solar pump and a 10,000-litre tank will give 310 families clean water at their doorstep.'],
    updates: [['5 hours ago', 'Drilling started. We hit water at 240 ft.']],
  },
  {
    id: 4, org: 'iqra', cat: 'education', zakat: true, city: 'Malappuram, Kerala', days: 33,
    title: 'Sponsor school fees for 50 orphan girls', caption: '₹12,000 covers a full year',
    goal: 600000, raised: 133200, donors: 402,
    unit: [12000, 'year of school for one girl'],
    ben: { Beneficiary: '50 girls, Classes 5–12', School: 'Iqra Girls Academy', Covers: 'Fees, books, uniform, transport', Location: 'Malappuram' },
    docs: ['School fee structure', 'Student list (verified)', 'Trust registration'],
    story: ['All 50 girls have lost one or both parents. With fees paid they can stay in school instead of being sent to work.', 'Donors get a progress card for the girls they support every term.'],
    updates: [],
  },
  {
    id: 6, org: 'me', cat: 'medical', zakat: true, city: 'Lucknow, Uttar Pradesh', days: 21,
    title: 'Help my father get a kidney transplant', caption: 'Surgery is scheduled for next month',
    goal: 600000, raised: 245000, donors: 318,
    unit: [2000, 'dialysis session'],
    ben: { Beneficiary: 'Rashid Khan, 58 yrs', Relation: 'Father of organiser', Hospital: 'SGPGI Lucknow', Location: 'Lucknow' },
    docs: ['Transplant cost estimate', 'Nephrologist letter', 'Organiser KYC'],
    story: ['My father Rashid has been on dialysis three times a week for a year. His brother is a matching donor and the surgery is set for next month.', 'We have arranged ₹2 lakh ourselves. Please help with the remaining amount.'],
    updates: [['6 days ago', 'Campaign verified by the MuslimPro team.']],
  },
  {
    id: 5, org: 'ummeed', cat: 'emergency', zakat: true, featured: true, city: 'Dhemaji, Assam', days: 4,
    title: 'Rebuild 40 homes after the Assam floods', caption: 'Families are living in relief camps',
    goal: 1200000, raised: 987000, donors: 3410,
    unit: [30000, 'home rebuilt'],
    ben: { Beneficiary: '40 families', Need: 'Bamboo-and-tin homes, plinth raising', Partner: 'Local panchayat', Location: 'Dhemaji' },
    docs: ['District relief list', 'Material quotation', 'Site photos'],
    story: ['The Brahmaputra floods destroyed 40 homes in two villages. Families are in a school relief camp.', 'Each ₹30,000 rebuilds one raised home that can survive the next monsoon.'],
    updates: [['Today', '12 homes complete. Families have moved back in.']],
  },
  {
    id: 7, org: 'noor', cat: 'food', zakat: false, done: true, city: 'Delhi', title: 'Winter blankets for 2,000 street families',
    goal: 600000, raised: 640000, donors: 2312, unit: [300, 'blanket'], ben: { Beneficiary: '2,000 families', Location: 'Delhi' }, docs: [], story: ['Thanks to you, 2,000 families received warm blankets before the cold wave.'], updates: [],
    util: [['Blankets (2,000 pcs)', 78], ['Transport & storage', 12], ['Distribution volunteers', 6], ['Platform & payment fees', 4]],
  },
  {
    id: 8, org: 'iqra', cat: 'orphans', zakat: true, done: true, city: 'Bengaluru', title: 'Eid gifts and new clothes for 300 orphans',
    goal: 300000, raised: 309500, donors: 1170, unit: [1000, 'Eid gift box'], ben: { Beneficiary: '300 children', Location: 'Bengaluru' }, docs: [], story: ['Every child at three orphanages received new Eid clothes and a gift box.'], updates: [],
    util: [['Clothes & shoes', 64], ['Gift boxes', 24], ['Eid lunch', 8], ['Platform & payment fees', 4]],
  },
];
const COMMENTS = { 1: [['Zoya S.', '2h', 'Praying for Ayaan’s quick recovery. Ameen.'], ['Farhan A.', '1d', 'Shared with my office group.']], 2: [['Nida K.', '5h', 'May Allah accept from all of us.']] };
const NAMES = ['Mohammed Faisal', 'Sana Qureshi', 'Abdul Rahman', 'Zoya Siddiqui', 'Anonymous donor', 'Farhan Ali', 'Rukhsar Bano', 'Yusuf Patel', 'Nida Khan', 'Arif Hussain'];
const AV_COLORS = ['#1d63b0', '#0a8a52', '#e0602a', '#5634c0', '#cf4778', '#0e8fa6', '#b5651d', '#3d3d4a'];
const avColor = s => AV_COLORS[[...s].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AV_COLORS.length];
const initials = s => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avatar = (name, cls = '') => `<div class="av ${cls}" style="background:${avColor(name)}">${esc(initials(name))}</div>`;

const LEAGUES = [
  { name: 'Seedling', icon: 'sprout', g: ['#7be0a8', '#0a9b3c'] },
  { name: 'Crescent', icon: 'moon', g: ['#7fc4ff', '#2a5bd7'] },
  { name: 'Lantern', icon: 'star', g: ['#ffd36b', '#e07b12'] },
  { name: 'Oasis', icon: 'droplet', g: ['#c9a2ff', '#6d3fd1'] },
];
const ACHIEVEMENTS = [['First Sadaqah', 'heart'], ['Ramadan Giver', 'moon'], ['7-day streak', 'flame'], ['Zakat paid', 'star'], ['Inspirer', 'users'], ['Fundraiser', 'sprout'], ['Water bearer', 'droplet'], ['Early supporter', 'clock']];

/* ---------- state ---------- */
const S = {
  user: { name: 'Ayesha Khan', first: 'Ayesha', email: 'ayesha.khan@mail.com' },
  saved: new Set([2]), liked: new Set(),
  points: 0, donated: 0, donations: [], streak: false, last: null,
  ui: { home: 'all', cat: 'all', comp: 'done', rate: 'league', rateSub: 'donors', news: 'news', dTab: 'story', q: '', sort: 'urgent', zakatOnly: false },
  login: { stage: 'details', role: 'donor', name: '', email: '', phone: '', err: {} },
  donate: null,
  draft: null,
  mine: [{ id: 6, status: 'live' }],
  withdrawals: [{ id: 'WD-1042', amt: 50000, status: 'paid', date: '12 Oct', note: 'UTR 4521 8870 1123' }, { id: 'WD-1051', amt: 30000, status: 'approved', date: 'Yesterday', note: 'Payout within 24 hrs' }],
  bank2: null,
  notifs: [
    { ic: 'check', c: 'green', txt: '<b>Winter blankets for 2,000 street families</b> reached its goal. JazakAllah Khair to 2,312 donors!', t: '2h ago', unread: true },
    { ic: 'droplet', c: 'blue', txt: 'New update from <b>Ummeed Foundation</b>: drilling started at the Sanawada well.', t: '5h ago', unread: true },
    { ic: 'bank', c: 'violet', txt: 'Withdrawal <b>WD-1051</b> of ₹30,000 was approved. Payout to HDFC ••4521 within 24 hours.', t: 'Yesterday' },
    { ic: 'verified', c: 'green', txt: 'Your fundraiser <b>Help my father get a kidney transplant</b> passed review and is live.', t: '6 days ago' },
    { ic: 'mail', c: 'gray', txt: 'Email alerts are on for donations, campaign status and withdrawals.', t: '1 week ago' },
  ],
};
const camp = id => CAMPAIGNS.find(c => c.id === Number(id));
// campaigns submitted in the demo stay hidden from the feed until "approved"
const active = () => CAMPAIGNS.filter(c => !c.done && !c.hidden);
const myRaised = () => S.mine.map(m => camp(m.id)).filter(Boolean).reduce((a, c) => a + c.raised, 0);
const withdrawn = () => S.withdrawals.reduce((a, w) => a + w.amt, 0);

/* ---------- shared pieces ---------- */
function cover(c, opts = {}) {
  const cat = CATS[c.cat];
  const angle = [150, 120, 190][opts.v || 0];
  const bg = c.photo ? `background-image:url('${c.photo}')` : `background:linear-gradient(${angle}deg, ${cat.g[0]}, ${cat.g[1]})`;
  const org = ORGS[c.org];
  return `<div class="cover ${opts.cls || ''}" style="${bg}">
    ${c.photo ? '' : `<div class="pattern"></div><div class="glow"></div><div class="art">${ic(cat.icon)}</div><div class="caption">${esc(c.caption || cat.label)}</div>`}
    <div class="shade"></div>
    ${opts.bare ? '' : `<div class="org-row">
      <div class="org-av" style="color:${org.color}">${org.short}</div>
      <div class="org-name"><span>${esc(org.name)}</span>${org.ngo ? ic('verified') : ''}</div>
      <span class="spacer"></span>
      ${c.featured && !c.done ? `<span class="feat-pill">${ic('star')}Featured</span>` : ''}
      <button class="glass ${S.saved.has(c.id) ? 'on' : ''}" data-act="save" data-id="${c.id}" aria-label="Save campaign">${ic('bookmark')}</button>
    </div>`}
    ${opts.dots ? `<div class="dots"><i class="on"></i><i></i><i></i></div>` : ''}
  </div>`;
}

function campaignCard(c) {
  if (c.done) return `<article class="card">
    <div data-go="#/c/${c.id}">${cover(c, { dots: true })}</div>
    <div class="card-body">
      <div class="actions"><button class="btn btn-soft btn-round" data-act="share" data-id="${c.id}" aria-label="Share">${ic('share')}</button><button class="btn btn-gray grow" data-go="#/c/${c.id}">Campaign completed</button></div>
      <div class="money"><div><small>contributors</small><div class="goal num">${c.donors.toLocaleString('en-IN')} ${ic('users')}</div></div><div><small style="text-align:right">raised</small><div class="raised num">${inr(c.raised)}</div></div></div>
      <h3 class="card-title" data-go="#/c/${c.id}">${esc(c.title)}</h3>
    </div>
    <div class="card-foot"><span class="stat">${ic('msg')} ${(COMMENTS[c.id] || []).length}</span><button class="link" data-go="#/c/${c.id}/comments">Leave a comment ${ic('right')}</button></div>
  </article>`;
  return `<article class="card">
    <div data-go="#/c/${c.id}">${cover(c, { dots: true })}</div>
    <div class="card-body">
      <div class="actions"><button class="btn btn-soft grow" data-act="share" data-id="${c.id}">${ic('share')} Share</button><button class="btn btn-main" style="flex:1.4" data-go="#/donate/${c.id}">Donate</button></div>
      <div class="money"><div><small>goal</small><div class="goal num">${inr(c.goal)}</div></div><div><small style="text-align:right">raised</small><div class="raised num">${inr(c.raised)}</div></div></div>
      <div class="bar"><i style="width:${pct(c)}%"></i></div>
      <h3 class="card-title" data-go="#/c/${c.id}">${esc(c.title)}</h3>
    </div>
    <div class="card-foot"><span class="stat">${ic('users')} ${c.donors.toLocaleString('en-IN')}</span><span class="vr"></span><span class="stat">${ic('msg')} ${(COMMENTS[c.id] || []).length}</span><span class="stat ${c.days <= 5 ? 'late' : ''}">${ic('clock')} ${c.days}d</span><button class="link" data-go="#/c/${c.id}/comments">Comment ${ic('right')}</button></div>
  </article>`;
}

function header(seg) {
  return `<header class="top">
    <div class="top-row">
      <div class="logo">${LOGO}${APP}</div>
      <div class="helped"><b class="num">2,481</b>helped today</div>
      <span class="spacer"></span>
      <button class="heart-btn" data-go="#/start" aria-label="Start a fundraiser">${HEART_BG}${ic('plus')}</button>
      <button class="icon-btn" data-go="#/search" aria-label="Search">${ic('search')}</button>
    </div>
    ${seg || ''}
  </header>`;
}
const seg = (key, opts) => `<div class="seg" role="tablist">${opts.map(([v, l]) => `<button role="tab" class="${S.ui[key] === v ? 'on' : ''}" data-act="ui" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
const pageHead = (title, right = '') => `<header class="phead"><button class="icon-btn" data-act="back" aria-label="Back">${ic('left')}</button><h1>${title}</h1>${right}</header>`;

function navBar(cur) {
  const tabs = [['home', 'Campaigns'], ['completed', 'Completed'], ['rating', 'Rating'], ['news', 'News'], ['profile', 'Profile']];
  return `<nav class="nav fixed-col">${tabs.map(([k, l]) => `<a href="#/${k}" data-go="#/${k}" class="${cur === k ? 'on' : ''}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${NAV_ICONS[k]}</svg>${l}</a>`).join('')}</nav>`;
}

/* ---------- tab views ---------- */
const V = {};

V.home = () => {
  const cats = [['all', 'All', 'heart'], ...Object.entries(CATS).map(([k, c]) => [k, c.label, c.icon])];
  let list = S.ui.home === 'fav' ? CAMPAIGNS.filter(c => S.saved.has(c.id)) : active().filter(c => S.ui.cat === 'all' || c.cat === S.ui.cat).sort((a, b) => !!b.featured - !!a.featured);
  return { nav: 'home', html: header(seg('home', [['all', 'All campaigns'], ['fav', 'My favorites']])) +
    (S.ui.home === 'all' ? `<div class="chips">${cats.map(([k, l, i]) => `<button class="chip ${S.ui.cat === k ? 'on' : ''}" data-act="ui" data-k="cat" data-v="${k}">${ic(i)}${l}</button>`).join('')}</div>` : '') +
    `<div class="feed">${list.map(campaignCard).join('') || `<div class="empty">${ic('bookmark')}<p>Tap the bookmark on any campaign to keep it here.</p><button class="btn btn-soft" data-act="ui" data-k="home" data-v="all">Browse campaigns</button></div>`}</div>` };
};

V.completed = () => {
  const done = CAMPAIGNS.filter(c => c.done);
  const reports = done.map(c => `<article class="section">
      <div class="mini-camp"><div class="thumb" style="background:linear-gradient(140deg,${CATS[c.cat].g.join(',')})">${ic(CATS[c.cat].icon)}</div><div><b>${esc(c.title)}</b><span class="small muted">${esc(ORGS[c.org].name)} · Closed with ${inr(c.raised)}</span></div></div>
      <h3 style="font-size:15px;margin-top:16px">Where the money went</h3>
      ${c.util.map(([l, v]) => `<div class="util-row"><div><span>${l}</span><b class="num">${v}% · ${inr(c.raised * v / 100)}</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}
      <div class="actions" style="margin-top:16px"><button class="btn btn-soft grow" data-act="toast" data-msg="Report PDF downloaded">${ic('file')} Full report</button><button class="btn btn-line grow" data-go="#/c/${c.id}">View campaign</button></div>
    </article>`).join('');
  return { nav: 'completed', html: header(seg('comp', [['done', 'Completed'], ['reports', 'Reports']])) +
    (S.ui.comp === 'done' ? `<div class="feed">${done.map(campaignCard).join('')}</div>` : `<div class="wrap">${reports}</div>`) };
};

function archBadge(l, i, locked, big) {
  const g = locked ? ['#e3e5ea', '#9a9da8'] : l.g;
  return `<svg viewBox="0 0 120 138" aria-hidden="true" style="${big ? '' : 'width:92px;height:106px'}">
    <defs><linearGradient id="lg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
    <path d="M12 132V62C12 33 38 17 60 4c22 13 48 29 48 58v70Z" fill="url(#lg${i})" stroke="#fff" stroke-width="5"/>
    <path d="M12 132V62C12 33 38 17 60 4c22 13 48 29 48 58v70Z" fill="none" stroke="${locked ? '#c3c6cf' : '#0002'}" stroke-width="1.5"/>
    <path d="M28 126V68c0-19 16-31 32-41 16 10 32 22 32 41v58Z" fill="#ffffff" fill-opacity=".22"/>
    <g transform="translate(36 52) scale(2)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[l.icon]}</g>
    ${locked ? `<circle cx="60" cy="112" r="13" fill="#2b2b36"/><g transform="translate(52 104) scale(.67)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round">${P.lock}</g>` : ''}
  </svg>`;
}

function rankRows(sub) {
  const unit = sub === 'leaders' ? 'pts' : sub === 'inspirers' ? 'inspired' : '';
  const base = sub === 'leaders' ? 48200 : sub === 'inspirers' ? 912 : 1840000;
  return NAMES.map((n, i) => {
    const v = Math.round(base * Math.pow(0.82, i));
    return `<div class="rank-row"><span class="rk ${i < 3 ? 'medal' : ''}"><span>${i + 1}</span></span>${avatar(n)}<span class="nm">${n}</span><span class="val">${unit ? v.toLocaleString('en-IN') + ' ' + unit : inr(v)}</span></div>`;
  }).join('');
}

V.rating = () => {
  const head = `<header class="top"><div class="top-row"><h1 class="page-title">Rating</h1><span class="spacer"></span><button class="points" data-act="earn">${S.points}<span class="coin">${ic('star')}</span></button></div>${seg('rate', [['league', 'Your league'], ['overall', 'Overall rating']])}</header>`;
  if (S.ui.rate === 'league') {
    const joined = S.points > 0;
    const table = joined ? `<div class="wrap"><div class="season">${ic('calendar')} Ramadan season · ends in 12 days. Top 5 move up to Crescent League.</div></div>
      <div style="background:var(--card);border-radius:26px;margin:0 10px;padding:6px 0">
        <div class="zone">Promotion zone</div>
        ${NAMES.slice(1, 5).map((n, i) => `<div class="rank-row"><span class="rk ${i < 3 ? 'medal' : ''}"><span>${i + 1}</span></span>${avatar(n)}<span class="nm">${n}</span><span class="val">${(980 - i * 140).toLocaleString('en-IN')} pts</span></div>`).join('')}
        <div class="rank-row me"><span class="rk"><span>${S.points >= 420 ? 5 : 14}</span></span>${avatar(S.user.name)}<span class="nm">${S.user.name}<small>You</small></span><span class="val">${S.points} pts</span></div>
      </div>` : `<div class="empty"><p>Earn any amount of Kindness Points to join the competition this season.</p><button class="btn btn-main" style="background:var(--brand)" data-act="earn">How to earn points</button></div>`;
    return { nav: 'rating', html: head + `<div class="leagues">${LEAGUES.map((l, i) => `<div class="league">${archBadge(l, i, i > 0, i === 0)}</div>`).join('')}</div>
      <div class="center"><h2 class="league-name">Seedling League</h2><button class="qpill" data-act="leagueInfo" style="margin-top:10px">Your league ${ic('help')}</button></div>
      <hr style="border:0;border-top:1px solid var(--line);margin:22px 16px 0">${table}` };
  }
  const sub = S.ui.rateSub;
  const meRank = sub === 'inspirers' ? 9210 : Math.max(11, (sub === 'leaders' ? 15840 - S.points * 9 : 15842 - Math.floor(S.donated / 2)));
  const meVal = sub === 'leaders' ? S.points + ' pts' : sub === 'inspirers' ? '0 inspired' : inr(S.donated);
  return { nav: 'rating', html: head + `<div style="background:var(--card);min-height:60vh;padding-bottom:72px">
    <div class="subtabs">${[['leaders', 'Leaders', 'trophy'], ['donors', 'Donors', 'hands'], ['inspirers', 'Inspirers', 'users']].map(([k, l, i]) => `<button class="${sub === k ? 'on' : ''}" data-act="ui" data-k="rateSub" data-v="${k}">${ic(i)}${l}</button>`).join('')}</div>
    ${rankRows(sub)}</div>
    <div class="fixed-col me-sticky"><div class="rank-row me"><span class="rk"><span class="num">${meRank.toLocaleString('en-IN')}</span></span>${avatar(S.user.name)}<span class="nm">${S.user.name}<small>You</small></span><span class="val">${meVal}</span></div></div>` };
};

const STORIES = [['food', 'How ₹500 became five iftars'], ['medical', 'Ayaan rang the last-chemo bell'], ['water', 'Sanawada’s first clean well'], ['education', 'A day at Iqra Girls Academy']];
const POSTS = [
  { c: 2, t: '1h ago', txt: '412 iftar boxes reached families at Govandi station road tonight. Thank you for making this Ramadan lighter for them.', likes: 324 },
  { c: 3, t: '5h ago', txt: 'Drilling has started in Sanawada and we hit water at 240 ft. Next step: the solar pump and storage tank.', likes: 198 },
  { c: 5, t: 'Today', txt: '12 of 40 homes are complete and families have moved back in. 28 more to go before the monsoon.', likes: 451 },
];
const NCOL = { green: ['#dcf7ea', '#087a30'], blue: ['#e1efff', '#1d63b0'], violet: ['#efe6ff', '#6d3fd1'], gray: ['#eceef2', '#3d3d4a'], gold: ['#fff5d6', '#8a5a00'] };

V.news = arg => {
  if (arg === 'notifications') { S.ui.news = 'notifs'; history.replaceState(null, '', location.href.split('#')[0] + '#/news'); }
  const body = S.ui.news === 'news'
    ? `<h2 style="font-size:24px;font-weight:700;color:var(--ink-2);padding:20px 16px 12px">Good videos</h2>
      <div class="stories">${STORIES.map(([k, t]) => `<button class="story" data-act="toast" data-msg="Video plays here in the full app" style="background:linear-gradient(160deg,${CATS[k].g.join(',')})"><div class="pattern" style="position:absolute;inset:0;opacity:.15"></div><span class="play">${ic('play')}</span><span>${t}</span></button>`).join('')}</div>
      <div class="feed">${POSTS.map((p, i) => { const c = camp(p.c), o = ORGS[c.org], liked = S.liked.has(i); return `<article class="card">
        <div class="post-head"><div class="org-av" style="color:${o.color}">${o.short}</div><div><b>${esc(o.name)}</b><div class="small muted">${p.t}</div></div></div>
        <p class="post-text">${esc(p.txt)}</p>
        ${cover(c, { cls: 'short', bare: true })}
        <div class="post-foot"><button class="${liked ? 'liked' : ''}" data-act="like" data-i="${i}" style="display:flex;gap:6px;align-items:center">${ic('heart')} ${p.likes + (liked ? 1 : 0)}</button><span>${ic('share')} Share</span><button class="text-link" style="margin-left:auto" data-go="#/c/${c.id}">View campaign</button></div>
      </article>`; }).join('')}</div>`
    : `<div style="margin-top:12px">${S.notifs.map(n => `<div class="notif ${n.unread ? 'unread' : ''}"><div class="ic" style="background:${NCOL[n.c][0]};color:${NCOL[n.c][1]}">${ic(n.ic)}</div><div><p>${n.txt}</p><small>${n.t}</small></div></div>`).join('')}</div>`;
  if (S.ui.news === 'notifs') S.notifs.forEach(n => (n.unread = false));
  return { nav: 'news', html: header(seg('news', [['news', 'News'], ['notifs', 'Notifications']])) + body };
};

V.profile = () => {
  const mine = S.mine.map(m => ({ ...m, c: camp(m.id) })).filter(m => m.c);
  const today = (new Date().getDay() + 6) % 7;
  const menu = items => `<div class="menu">${items.map(([i, l, a, meta]) => `<button ${a.startsWith('#') ? `data-go="${a}"` : `data-act="${a}"`}>${ic(i)}<span>${l}</span>${meta ? `<span class="meta">${meta}</span>` : ''}${ic('right', 'chev')}</button>`).join('')}</div>`;
  return { nav: 'profile', html: `<div class="wrap" style="padding-top:16px">
    <section class="section" style="border-radius:0 0 26px 26px;margin:-16px -10px 0;padding-top:22px">
      <div class="prof">${avatar(S.user.name)}<div style="flex:1;min-width:0"><h1>${S.user.name}</h1><button class="muted" data-go="#/settings" style="display:flex;align-items:center;gap:2px;font-size:15px">Profile settings ${ic('right')}</button></div><button class="icon-btn" data-go="#/settings" aria-label="Edit profile">${ic('pencil')}</button></div>
      <div class="tiles">
        <div class="tile"><b style="font-size:15px">Seedling League <svg viewBox="0 0 120 138" style="width:20px;height:23px">${archBadge(LEAGUES[0], 9, false, true).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></b><span>${S.points ? S.points + ' pts this season' : 'Season open'}</span></div>
        <div class="tile"><b class="num">${Math.max(11, 15840 - S.points * 9).toLocaleString('en-IN')} <span style="color:var(--violet)">${ic('trophy')}</span></b><span>Top leaders</span></div>
        <div class="tile"><b class="num">${Math.max(11, 15842 - Math.floor(S.donated / 2)).toLocaleString('en-IN')} <span style="color:var(--brand)">${ic('hands')}</span></b><span>Top donors</span></div>
        <div class="tile"><b class="num">9,210 <span style="color:var(--gold)">${ic('users')}</span></b><span>Top inspirers</span></div>
      </div>
    </section>
    <div class="money-tiles">
      <button class="money-tile" data-go="#/history"><span>My donations ${ic('right')}</span><b class="num">${inr(S.donated)}</b></button>
      <button class="money-tile" data-go="#/my"><span>Raised by my fundraisers ${ic('right')}</span><b class="num">${inr(myRaised())}</b></button>
    </div>
    <section class="section">
      <div class="sec-head"><h2>My fundraisers</h2><button class="pill-link green" data-go="#/my">Dashboard ${ic('right')}</button></div>
      ${mine.map(m => `<div class="my-camp" data-go="#/my"><div class="thumb" style="background:${m.photo ? `url('${m.photo}') center/cover` : `linear-gradient(140deg,${CATS[m.c.cat].g.join(',')})`}">${m.photo ? '' : ic(CATS[m.c.cat].icon)}</div><div class="info"><b>${esc(m.c.title)}</b><span class="small muted num">${inr(m.c.raised)} of ${inr(m.c.goal)}</span> <span class="status ${m.status === 'live' ? 'st-live' : 'st-review'}">${m.status === 'live' ? 'Live' : 'Under review'}</span><div class="bar"><i style="width:${pct(m.c)}%"></i></div></div></div>`).join('')}
      <div class="actions" style="margin-top:10px"><button class="btn btn-soft grow" data-go="#/start">${ic('plus')} Start new</button><button class="btn btn-line grow" data-go="#/withdraw">${ic('wallet')} Withdraw</button></div>
    </section>
    <section class="section">
      <div class="sec-head"><h2>Kindness Streak</h2><button class="pill-link" data-act="earn">More ${ic('right')}</button></div>
      <div class="week">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => `<div><i class="${S.streak && i === today ? 'on' : ''} ${i === today ? 'today' : ''}">${ic('flame')}</i>${d}</div>`).join('')}</div>
      <p class="center" style="color:var(--ink-2);margin-bottom:14px">${S.streak ? '1-day streak. Give again tomorrow to keep it going.' : 'Start helping easily and begin your Kindness streak!'}</p>
      <button class="btn btn-soft btn-block" data-go="#/home">Go to campaigns</button>
    </section>
    <section class="section">
      <div class="sec-head"><h2>Achievements</h2><button class="pill-link green">Earned ${S.donations.length ? 1 : 0}/8 ${ic('right')}</button></div>
      <div class="badges">${ACHIEVEMENTS.map(([l, i], k) => { const got = k === 0 && S.donations.length; return `<div class="badge ${got ? 'got' : ''}"><div class="disc">${ic(i)}${got ? '' : `<span class="lock">${ic('lock')}</span>`}</div>${l}</div>`; }).join('')}</div>
    </section>
    ${menu([['receipt', 'Donation history', '#/history'], ['globe', 'Language and region', 'region', 'English · ₹ INR'], ['calendar', 'Monthly giving', 'monthly'], ['card', 'Payment methods', 'payments']])}
    ${menu([['bookmark', 'Favorites', 'favs'], ['wallet', 'Fundraiser dashboard & withdrawals', '#/my'], ['shield', 'KYC & bank account', '#/kyc', 'Verified'], ['link', 'Your personal link', 'mylink']])}
    ${menu([['hands', 'Verified NGOs', '#/ngos', String(Object.values(ORGS).filter(o => o.ngo).length)], ['bell', 'Notifications & email', '#/settings']])}
    ${menu([['hands', 'About us', '#/info/about'], ['help', 'How it works', '#/info/how'], ['info', 'FAQs', '#/info/faq']])}
    <section class="section">
      <div class="thanks"><div style="flex:1"><h3>Thank you for being with us</h3><p>Write to us if you have a question, feedback, an idea, or something isn’t working.</p><a href="#/info/contact" data-go="#/info/contact">Write to us</a></div><div class="logo" style="flex-direction:column;font-size:20px;gap:2px">${LOGO.replace('viewBox', 'style="width:54px;height:54px" viewBox')}${APP}</div></div>
      <div class="menu" style="padding:4px 0 0">${[['headset', 'Support', '#/info/contact'], ['file', 'Terms & Conditions', '#/info/terms'], ['shield', 'Privacy Policy', '#/info/privacy'], ['receipt', 'Refund Policy', '#/info/refund']].map(([i, l, h]) => `<button data-go="${h}">${ic(i)}<span>${l}</span>${ic('right', 'chev')}</button>`).join('')}<button data-act="logout" style="color:var(--danger)">${ic('logout')}<span>Log out</span></button></div>
    </section>
    <p class="center small muted">MuslimPro Giving · demo build 0.2</p>
  </div>` };
};

/* ---------- stack pages ---------- */
V.c = (id, sub) => {
  const c = camp(id); if (!c) return V.home();
  const o = ORGS[c.org];
  const mineHere = S.donations.filter(d => d.cid === c.id);
  const donors = [...mineHere.map(d => [d.anon ? 'Anonymous donor' : S.user.name, d.amount, 'Just now']), ...NAMES.slice(0, 6).map((n, i) => [n, [5000, 1000, 2500, 500, 10000, 1100][i], ['8 min ago', '21 min ago', '1h ago', '2h ago', '3h ago', '5h ago'][i]])];
  const tab = S.ui.dTab;
  const comments = COMMENTS[c.id] || [];
  const tabBody = tab === 'story' ? `<div class="prose">${c.story.map(p => `<p>${esc(p)}</p>`).join('')}</div>`
    : tab === 'updates' ? (c.updates.length ? `<div class="timeline">${c.updates.map(([t, u], i) => `<div class="tl"><div class="rail"><i></i>${i < c.updates.length - 1 ? '<b></b>' : ''}</div><div class="tl-body"><small>${t}</small><p>${esc(u)}</p></div></div>`).join('')}</div>` : '<p class="muted">No updates yet. Donors are notified as soon as the organiser posts one.</p>')
    : donors.map(([n, a, t], i) => `<div class="person">${avatar(n)}<div class="who"><b>${esc(n)}</b><span>${t}${i === 0 && !mineHere.length ? ' · Top donor' : ''}</span></div><span class="amt num">${inr(a)}</span></div>`).join('');
  const html = `<div class="d-cover"><div class="slides">${[0, 1, 2].map(v => cover(c, { v, bare: true })).join('')}</div>
      <div class="bar-top"><button class="glass" data-act="back" aria-label="Back">${ic('left')}</button><span class="spacer"></span><button class="glass" data-act="share" data-id="${c.id}" aria-label="Share">${ic('share')}</button><button class="glass ${S.saved.has(c.id) ? 'on' : ''}" data-act="save" data-id="${c.id}" aria-label="Save">${ic('bookmark')}</button></div>
      <div class="dots" style="bottom:36px"><i class="on"></i><i></i><i></i></div></div>
    <div class="d-body">
      <div class="d-org"><div class="org-av" style="color:${o.color}">${o.short}</div><div><b>${esc(o.name)}</b><div class="verified">${ic('verified')} ${o.ngo ? 'Verified NGO · 80G receipts' : 'Verified organiser · KYC done'}</div></div></div>
      <h1 class="d-title">${esc(c.title)}</h1>
      <div class="mini-chips"><span class="mini-chip">${ic(CATS[c.cat].icon)}${CATS[c.cat].label}</span>${c.zakat ? `<span class="mini-chip gold">${ic('star')}Zakat eligible</span>` : ''}<span class="mini-chip">${ic('pin')}${esc(c.city)}</span></div>
      <div class="big-raise"><div class="raised num">${inr(c.raised)}</div><div class="muted">raised of <b class="num" style="color:var(--ink)">${inr(c.goal)}</b> goal</div><div class="bar"><i style="width:${pct(c)}%"></i></div></div>
      <div class="stats3"><div><b class="num">${c.donors.toLocaleString('en-IN')}</b><span>donors</span></div><div><b class="num">${pct(c)}%</b><span>funded</span></div><div><b class="num">${c.done ? 'Closed' : c.days + ' days'}</b><span>${c.done ? 'campaign' : 'left'}</span></div></div>
    </div>
    <div style="background:var(--card);padding:6px 16px 18px;display:grid;gap:12px">
      <div class="box"><h3>${ic('user')} Beneficiary details</h3><dl class="kv">${Object.entries(c.ben).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></div>
      ${c.docs.length ? `<div class="box"><h3>${ic('shield')} Verified documents</h3>${c.docs.map(d => `<div class="doc-row">${ic('file')}<span>${d}</span><span class="ok">${ic('check')}Checked</span></div>`).join('')}<p class="small muted" style="margin-top:8px">Reviewed by the MuslimPro team. Funds are released only against bills.</p></div>` : ''}
      ${c.util ? `<div class="box"><h3>${ic('receipt')} Utilisation report</h3>${c.util.map(([l, v]) => `<div class="util-row"><div><span>${l}</span><b class="num">${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}</div>` : ''}
      <div class="seg" style="margin-top:4px">${[['story', 'Story'], ['updates', `Updates (${c.updates.length})`], ['donors', 'Donors']].map(([v, l]) => `<button class="${tab === v ? 'on' : ''}" data-act="ui" data-k="dTab" data-v="${v}">${l}</button>`).join('')}</div>
      <div>${tabBody}</div>
      <div class="box" id="comments"><h3>${ic('msg')} Words of support (${comments.length})</h3>
        ${comments.map(([n, t, txt]) => `<div class="person" style="align-items:flex-start">${avatar(n)}<div class="who"><b>${esc(n)} <span style="font-weight:400">· ${t}</span></b><p style="font-size:14px;color:var(--ink-2)">${esc(txt)}</p></div></div>`).join('')}
        <form class="comment-box" data-form="comment" data-id="${c.id}"><input class="input" id="comment-${c.id}" name="txt" placeholder="Leave a comment" maxlength="280" autocomplete="off"><button class="btn btn-main btn-round" aria-label="Post comment">${ic('right')}</button></form>
      </div>
    </div>`;
  const cta = c.done
    ? `<button class="btn btn-soft btn-round" data-act="share" data-id="${c.id}" aria-label="Share">${ic('share')}</button><button class="btn btn-gray grow" data-act="ui" data-k="comp" data-v="reports" data-then="#/completed">Campaign completed · View report</button>`
    : `<a class="btn btn-wa btn-round" href="${waLink(c)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${ic('msg')}</a><button class="btn btn-main grow" data-go="#/donate/${c.id}">Donate now</button>`;
  if (sub === 'comments') setTimeout(() => document.getElementById('comments')?.scrollIntoView({ block: 'center' }), 50);
  return { html, cta, bare: false };
};

const shareText = c => `Please support "${c.title}" on MuslimPro. Every share helps: ${SITE}/c/${c.id}`;
const waLink = c => 'https://wa.me/?text=' + encodeURIComponent(shareText(c));

const AMOUNTS = [500, 1000, 2500, 5000, 10000];
const TIPS = [0, 5, 10, 15];
const PAYS = [['upi', 'UPI', 'GPay, PhonePe, Paytm, BHIM or any UPI app', 'phone'], ['card', 'Credit / debit card', 'Visa, Mastercard, RuPay', 'card'], ['nb', 'Net banking', 'All major Indian banks', 'bank']];
const dAmount = () => S.donate.custom !== '' ? Number(S.donate.custom) || 0 : S.donate.amount;
const dTip = () => Math.round(dAmount() * S.donate.tip / 100);

V.donate = id => {
  const c = camp(id); if (!c || c.done) return V.home();
  if (!S.donate || S.donate.cid !== c.id) S.donate = { cid: c.id, amount: 1000, custom: '', type: c.zakat ? 'Zakat' : 'Sadaqah', anon: false, tip: 5, pay: 'upi', other: false };
  const d = S.donate;
  const types = ['Sadaqah', 'Zakat', 'Lillah'];
  const html = pageHead('Donate') + `<div class="wrap">
    <section class="section"><div class="mini-camp"><div class="thumb" style="background:linear-gradient(140deg,${CATS[c.cat].g.join(',')})">${ic(CATS[c.cat].icon)}</div><div><b>${esc(c.title)}</b><span class="small muted">${esc(ORGS[c.org].name)}</span></div></div></section>
    <section class="section">
      <div class="sec-head"><h2>Choose amount</h2></div>
      <div class="amounts">${AMOUNTS.map(a => `<button class="${!d.other && d.amount === a ? 'on' : ''}" data-act="amt" data-v="${a}">${inr(a)}</button>`).join('')}<button class="${d.other ? 'on' : ''}" data-act="amt" data-v="other">Other</button></div>
      ${d.other ? `<div class="prefix" style="margin-top:10px"><span>₹</span><input class="input num" id="custom-amt" inputmode="numeric" placeholder="Enter amount" value="${esc(d.custom)}" data-model="donate.custom" data-live="donate"></div>` : ''}
      <div class="impact" id="impact">${impactLine(c)}</div>
    </section>
    <section class="section">
      <div class="sec-head"><h2>Donation type</h2></div>
      <div class="seg" style="margin-top:0">${types.map(t => `<button class="${d.type === t ? 'on' : ''}" ${t === 'Zakat' && !c.zakat ? 'disabled style="opacity:.4"' : `data-act="dset" data-k="type" data-v="${t}"`}>${t}</button>`).join('')}</div>
      <p class="small muted" style="margin-top:8px">${c.zakat ? 'This campaign is Zakat eligible. Zakat funds are kept separate and used only for eligible beneficiaries.' : 'This campaign does not accept Zakat.'}</p>
      <div class="switch-row" style="margin-top:12px"><div class="txt"><b>Donate anonymously</b><span>Your name won’t appear in the donor list</span></div><button class="switch ${d.anon ? 'on' : ''}" data-act="dtoggle" data-k="anon" role="switch" aria-checked="${d.anon}" aria-label="Donate anonymously"></button></div>
    </section>
    <section class="section">
      <div class="sec-head"><h2>Support MuslimPro</h2><span class="small muted">optional</span></div>
      <p class="small muted" style="margin-bottom:10px">We charge NGOs 0% platform fee. A small tip keeps the app running.</p>
      <div class="amounts" style="grid-template-columns:repeat(4,1fr)">${TIPS.map(t => `<button class="${d.tip === t ? 'on' : ''}" data-act="dset" data-k="tip" data-v="${t}">${t}%</button>`).join('')}</div>
    </section>
    <section class="section">
      <div class="sec-head"><h2>Pay with</h2></div>
      <div class="radio-list">${PAYS.map(([k, l, s, i]) => `<button class="radio ${d.pay === k ? 'on' : ''}" data-act="dset" data-k="pay" data-v="${k}"><span class="ic">${ic(i)}</span><span class="txt"><b>${l}</b><span>${s}</span></span><span class="rd"></span></button>`).join('')}</div>
    </section>
    <section class="section"><div class="summary" id="summary">${summary()}</div><p class="small muted" style="margin-top:10px;display:flex;gap:6px;align-items:center">${ic('lock')} Payments are encrypted. An 80G receipt is emailed instantly.</p></section>
  </div>`;
  return { html, cta: `<button class="btn btn-main btn-block" id="paybtn" data-act="pay">${payLabel()}</button>` };
};
const impactLine = c => { const n = Math.floor(dAmount() / c.unit[0]); return n >= 1 ? `${ic('heart')} ${inr(dAmount())} covers ${n.toLocaleString('en-IN')} ${c.unit[1]}${n > 1 && !c.unit[1].includes(' of ') && !c.unit[1].includes(' for ') ? 's' : ''}` : `${ic('heart')} Every rupee counts. ${inr(c.unit[0])} covers one ${c.unit[1]}.`; };
const summary = () => `<div><span>Donation (${S.donate.type})</span><b class="num">${inr(dAmount())}</b></div><div><span>Tip to MuslimPro</span><b class="num">${inr(dTip())}</b></div><div class="total"><span>Total</span><span class="num">${inr(dAmount() + dTip())}</span></div>`;
const payLabel = () => dAmount() >= 10 ? `Pay ${inr(dAmount() + dTip())}` : 'Enter at least ₹10';

V.success = () => {
  const d = S.last; if (!d) return V.home();
  const c = camp(d.cid);
  const html = `<div class="success"><div class="tick">${ic('check')}</div><h1>JazakAllah Khair, ${S.user.first}!</h1><p>Your ${d.type} of <b>${inr(d.amount)}</b> to <b>${esc(c.title)}</b> was successful.</p></div>
    <div class="wrap">
      <div class="earn"><div class="coin">${ic('star')}</div><div><b>+${d.points} Kindness Points</b><div class="small muted">You joined the Seedling League and started a streak.</div></div></div>
      <section class="section"><div class="sec-head"><h2>Receipt</h2><span class="status st-live">Paid</span></div>
        <dl class="kv"><dt>Transaction ID</dt><dd class="num">${d.txn}</dd><dt>Date</dt><dd>${d.date}</dd><dt>Paid via</dt><dd>${PAYS.find(p => p[0] === d.pay)[1]}</dd><dt>Donation</dt><dd class="num">${inr(d.amount)}</dd><dt>Tip</dt><dd class="num">${inr(d.tip)}</dd><dt>Total</dt><dd class="num">${inr(d.amount + d.tip)}</dd></dl>
        <p class="small muted" style="margin-top:12px">80G receipt sent to ${S.user.email}</p></section>
    </div>`;
  return { html, bare: true, cta: `<a class="btn btn-wa grow" href="${waLink(c)}" target="_blank" rel="noopener">${ic('share')} Share & inspire</a><button class="btn btn-soft grow" data-go="#/home">Done</button>` };
};

V.search = () => ({ html: `<header class="phead"><button class="icon-btn" data-act="back" aria-label="Back">${ic('left')}</button><label class="search-bar">${ic('search')}<input id="q" placeholder="Search campaigns, NGOs, cities" value="${esc(S.ui.q)}" data-model="ui.q" data-live="search" autocomplete="off"></label></header>
  <div class="chips">${[['urgent', 'Ending soon'], ['near', 'Nearly funded'], ['new', 'Newest']].map(([k, l]) => `<button class="chip ${S.ui.sort === k ? 'on' : ''}" data-act="ui" data-k="sort" data-v="${k}">${l}</button>`).join('')}<button class="chip ${S.ui.zakatOnly ? 'on' : ''}" data-act="ui" data-k="zakatOnly" data-v="${!S.ui.zakatOnly}">${ic('star')}Zakat eligible</button></div>
  <div class="chips" style="padding-top:8px">${[['all', 'All causes'], ...Object.entries(CATS).map(([k, c]) => [k, c.label])].map(([k, l]) => `<button class="chip ${S.ui.cat === k ? 'on' : ''}" data-act="ui" data-k="cat" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="wrap"><section class="section" id="results">${results()}</section></div>` });
function results() {
  const q = S.ui.q.trim().toLowerCase();
  let list = active().filter(c => (S.ui.cat === 'all' || c.cat === S.ui.cat) && (!S.ui.zakatOnly || c.zakat) && (!q || [c.title, ORGS[c.org].name, c.city, CATS[c.cat].label].join(' ').toLowerCase().includes(q)));
  list.sort(S.ui.sort === 'urgent' ? (a, b) => a.days - b.days : S.ui.sort === 'near' ? (a, b) => pct(b) - pct(a) : (a, b) => b.id - a.id);
  if (!list.length) return `<p class="muted center" style="padding:24px 0">No campaigns match “${esc(S.ui.q)}”. Try another word or clear a filter.</p>`;
  return `<p class="small muted">${list.length} campaign${list.length > 1 ? 's' : ''}</p>` + list.map(c => `<div class="result" data-go="#/c/${c.id}"><div class="thumb" style="background:linear-gradient(140deg,${CATS[c.cat].g.join(',')})">${ic(CATS[c.cat].icon)}</div><div class="info"><b>${esc(c.title)}</b><span class="small muted num">${inr(c.raised)} raised · ${c.days} days left</span><div class="bar"><i style="width:${pct(c)}%"></i></div></div></div>`).join('');
}

/* fundraiser wizard */
const newDraft = () => ({ step: 1, who: 'family', cat: 'medical', title: '', goal: '', zakat: true, name: '', age: '', city: '', relation: '', hospital: '', photos: [], docs: {}, story: '', agree1: false, agree2: false, err: {} });
const DOCS = { estimate: ['Cost estimate / quotation', 'From hospital, school or vendor'], idproof: ['Beneficiary ID proof', 'Aadhaar, passport or voter ID'], letter: ['Supporting letter', 'Doctor, principal or NGO letter'] };
V.start = () => {
  const d = S.draft || (S.draft = newDraft());
  const err = k => d.err[k] ? `<span class="err">${d.err[k]}</span>` : '';
  const steps = ['Basics', 'Beneficiary', 'Story', 'Review'];
  let body;
  if (d.step === 1) body = `
    <section class="section"><div class="sec-head"><h2>Who are you raising for?</h2></div><div class="who-grid">${[['self', 'Myself', 'user'], ['family', 'Family member', 'heart'], ['friend', 'Friend or other', 'users'], ['ngo', 'Registered NGO', 'verified']].map(([k, l, i]) => `<button class="${d.who === k ? 'on' : ''}" data-act="draft" data-k="who" data-v="${k}">${ic(i)}<b>${l}</b></button>`).join('')}</div></section>
    <section class="section" style="display:grid;gap:14px">
      <div class="field"><label>Cause</label><div class="cat-grid">${Object.entries(CATS).map(([k, c]) => `<button class="chip ${d.cat === k ? 'on' : ''}" data-act="draft" data-k="cat" data-v="${k}">${ic(c.icon)}${c.label}</button>`).join('')}</div></div>
      <div class="field"><label for="f-title">Fundraiser title</label><input class="input" id="f-title" maxlength="80" placeholder="e.g. Help my father get a kidney transplant" value="${esc(d.title)}" data-model="draft.title">${err('title')}</div>
      <div class="field"><label for="f-goal">Target amount</label><div class="prefix"><span>₹</span><input class="input num" id="f-goal" inputmode="numeric" placeholder="5,00,000" value="${esc(d.goal)}" data-model="draft.goal"></div><span class="hint">Include hospital, school or project costs. You can raise more later.</span>${err('goal')}</div>
      <div class="switch-row"><div class="txt"><b>Accept Zakat</b><span>Only if the beneficiary is eligible to receive Zakat</span></div><button class="switch ${d.zakat ? 'on' : ''}" data-act="draft" data-k="zakat" data-v="${!d.zakat}" role="switch" aria-checked="${d.zakat}" aria-label="Accept Zakat"></button></div>
    </section>`;
  else if (d.step === 2) body = `
    <section class="section" style="display:grid;gap:14px">
      <div class="field"><label for="f-name">Beneficiary name</label><input class="input" id="f-name" value="${esc(d.name)}" data-model="draft.name" placeholder="Full name as on ID">${err('name')}</div>
      <div style="display:grid;grid-template-columns:1fr 2fr;gap:10px"><div class="field"><label for="f-age">Age</label><input class="input num" id="f-age" inputmode="numeric" value="${esc(d.age)}" data-model="draft.age"></div><div class="field"><label for="f-city">City</label><input class="input" id="f-city" value="${esc(d.city)}" data-model="draft.city" placeholder="e.g. Lucknow">${err('city')}</div></div>
      ${d.who === 'self' ? '' : `<div class="field"><label for="f-rel">Your relation to them</label><input class="input" id="f-rel" value="${esc(d.relation)}" data-model="draft.relation" placeholder="e.g. Daughter"></div>`}
      <div class="field"><label for="f-hosp">Hospital, school or project (optional)</label><input class="input" id="f-hosp" value="${esc(d.hospital)}" data-model="draft.hospital"></div>
    </section>
    <section class="section"><div class="sec-head"><h2>Photos</h2><span class="small muted">${d.photos.length}/6</span></div>
      <div class="uploads">${d.photos.map(p => `<div class="up filled" style="background:url('${p}') center/cover"><span class="ok">${ic('check')}</span></div>`).join('')}${d.photos.length < 6 ? `<label class="up" for="photo-in">${ic('camera')}Add photo<input type="file" id="photo-in" accept="image/*" multiple hidden></label>` : ''}</div>${err('photos')}
    </section>
    <section class="section" style="display:grid;gap:8px"><div class="sec-head" style="margin:0"><h2>Supporting documents</h2></div><p class="small muted">Seen only by our verification team.</p>
      ${Object.entries(DOCS).map(([k, [l, s]]) => `<label class="doc-up ${d.docs[k] ? 'done' : ''}" for="doc-${k}">${ic(d.docs[k] ? 'check' : 'upload')}<span class="txt"><b>${l}</b><span>${d.docs[k] ? esc(d.docs[k]) : s}</span></span><input type="file" id="doc-${k}" data-doc="${k}" accept="image/*,application/pdf" hidden></label>`).join('')}
    </section>`;
  else if (d.step === 3) body = `
    <section class="section" style="display:grid;gap:10px"><div class="field"><label for="f-story">Tell donors the story</label><textarea class="textarea" id="f-story" data-model="draft.story" data-live="count" placeholder="Who needs help, what happened, how the money will be used, and what you have arranged already.">${esc(d.story)}</textarea><span class="hint" id="count">${d.story.length} characters · at least 50</span>${err('story')}</div></section>
    <div class="impact">${ic('info')} Campaigns with 3+ photos and a clear cost breakdown raise about twice as much.</div>`;
  else body = `
    <p class="small muted" style="padding:0 6px">This is how donors will see your fundraiser.</p>
    ${campaignCard(previewCampaign())}
    <section class="section" style="display:grid;gap:12px">
      <button class="check ${d.agree1 ? 'on' : ''}" data-act="draft" data-k="agree1" data-v="${!d.agree1}"><i>${ic('check')}</i>I confirm the details and documents are true and belong to the beneficiary.</button>
      <button class="check ${d.agree2 ? 'on' : ''}" data-act="draft" data-k="agree2" data-v="${!d.agree2}"><i>${ic('check')}</i>I agree to the Terms & Conditions and understand funds are released after verification.</button>${err('agree')}
    </section>`;
  const html = `<header class="phead"><button class="icon-btn" data-act="${d.step > 1 ? 'wizBack' : 'back'}" aria-label="Back">${ic(d.step > 1 ? 'left' : 'x')}</button><h1>Start a fundraiser</h1></header>
    <div class="progress-steps">${steps.map((s, i) => `<div class="${i < d.step ? 'on' : ''}"><i></i>${s}</div>`).join('')}</div>
    <div class="wrap">${body}</div>`;
  return { html, cta: `<button class="btn btn-main btn-block" data-act="wizNext">${d.step < 4 ? 'Continue' : 'Submit for review'}</button>` };
};
function previewCampaign() {
  const d = S.draft;
  return { id: 0, org: 'me', cat: d.cat, title: d.title || 'Your fundraiser title', caption: d.name ? `For ${d.name}` : '', goal: Number(d.goal) || 0, raised: 0, donors: 0, days: 30, photo: d.photos[0] };
}
function validateStep(d) {
  const e = {};
  if (d.step === 1) {
    if (d.title.trim().length < 10) e.title = 'Write a title of at least 10 characters.';
    if (!(Number(d.goal) >= 1000)) e.goal = 'Enter a target of at least ₹1,000.';
  } else if (d.step === 2) {
    if (!d.name.trim()) e.name = 'Enter the beneficiary’s name.';
    if (!d.city.trim()) e.city = 'Enter a city.';
    if (!d.photos.length) e.photos = 'Add at least one photo.';
  } else if (d.step === 3) {
    if (d.story.trim().length < 50) e.story = 'Write at least 50 characters so donors understand the need.';
  } else if (!(d.agree1 && d.agree2)) e.agree = 'Tick both boxes to submit.';
  return e;
}

V.submitted = () => {
  const m = S.mine[S.mine.length - 1];
  const c = camp(m.id);
  return { bare: true, html: `<div class="success"><div class="tick">${ic('check')}</div><h1>Submitted for review</h1><p>Our team checks every fundraiser and its documents before it goes live. This usually takes 24–48 hours.</p></div>
  <div class="wrap"><section class="section"><div class="sec-head"><h2>What happens next</h2></div><div class="timeline">
    ${[['Submitted', 'Just now', true], ['Document & KYC review', 'Within 48 hours. We may call you to verify.', false], ['Goes live', 'Share your link on WhatsApp to get the first donors.', false]].map(([t, s, on], i) => `<div class="tl"><div class="rail"><i class="${on ? '' : 'off'}"></i>${i < 2 ? '<b></b>' : ''}</div><div class="tl-body"><b>${t}</b><p>${s}</p></div></div>`).join('')}
  </div></section><p class="small muted center">${esc(c.title)}</p></div>`,
  cta: `<button class="btn btn-soft grow" data-go="#/home">Home</button><button class="btn btn-main grow" data-go="#/my">My dashboard</button>` };
};

V.my = () => {
  const avail = Math.max(0, myRaised() - withdrawn());
  const mine = S.mine.map(m => ({ ...m, c: camp(m.id) })).filter(m => m.c);
  const stepper = st => { const n = { requested: 1, approved: 2, paid: 3 }[st]; return `<div class="steps3">${['Requested', 'Approved', 'Paid'].map((l, i) => `${i ? `<em class="${i < n ? 'on' : ''}"></em>` : ''}<i class="${i < n ? 'on' : ''}">${i < n ? ic('check') : ''}</i>${l}`).join('')}</div>`; };
  return { html: pageHead('Fundraiser dashboard') + `<div class="wrap">
    <div class="balance"><div class="pattern"></div><small>Available to withdraw</small><b class="num">${inr(avail)}</b><div class="row"><button class="btn btn-white grow" data-go="#/withdraw">${ic('wallet')} Withdraw</button><button class="btn btn-ghost-w grow" data-go="#/kyc">${ic('shield')} KYC & bank</button></div></div>
    <section class="section"><div class="sec-head"><h2>My fundraisers</h2></div>
      ${mine.map(m => `<div class="my-camp"><div class="thumb" style="background:${m.photo ? `url('${m.photo}') center/cover` : `linear-gradient(140deg,${CATS[m.c.cat].g.join(',')})`}">${m.photo ? '' : ic(CATS[m.c.cat].icon)}</div><div class="info"><b>${esc(m.c.title)}</b><span class="small muted num">${inr(m.c.raised)} of ${inr(m.c.goal)} · ${m.c.donors} donors</span><div class="bar"><i style="width:${pct(m.c)}%"></i></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span class="status ${m.status === 'live' ? 'st-live' : 'st-review'}">${m.status === 'live' ? 'Live' : 'Under review'}</span>${m.status === 'live' ? `<button class="text-link small" data-go="#/c/${m.c.id}">View</button><button class="text-link small" data-act="share" data-id="${m.c.id}">Share</button><button class="text-link small" data-act="postUpdate">Post update</button>` : `<button class="text-link small" data-act="approve" data-id="${m.c.id}">Demo: approve as admin</button>`}</div></div></div>`).join('')}
    </section>
    <section class="section"><div class="sec-head"><h2>Donations received</h2><span class="small muted">${camp(6).donors} total</span></div>
      ${[['Mohammed Faisal', 5000, '12 min ago', 'Zakat'], ['Anonymous donor', 2000, '1h ago', 'Sadaqah'], ['Sana Qureshi', 1000, '3h ago', 'Sadaqah'], ['Yusuf Patel', 10000, 'Yesterday', 'Zakat']].map(([n, a, t, ty]) => `<div class="person">${avatar(n)}<div class="who"><b>${n}</b><span>${t} · ${ty}</span></div><span class="amt num">${inr(a)}</span></div>`).join('')}
    </section>
    <section class="section"><div class="sec-head"><h2>Withdrawals</h2></div>
      ${S.withdrawals.slice().reverse().map(w => `<div class="my-camp" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><b class="num">${inr(w.amt)}</b><span class="status ${w.status === 'paid' ? 'st-paid' : w.status === 'approved' ? 'st-live' : 'st-review'}">${w.status[0].toUpperCase() + w.status.slice(1)}</span></div><span class="small muted">${w.id} · ${w.date} · ${esc(w.note)}</span>${stepper(w.status)}</div>`).join('')}
    </section>
  </div>` };
};

V.withdraw = () => {
  const avail = Math.max(0, myRaised() - withdrawn());
  const w = S.wd || (S.wd = { amt: '', acct: 'hdfc', purpose: 'Hospital bill payment', bill: '', err: '' });
  return { html: pageHead('Request withdrawal') + `<div class="wrap">
    <section class="section"><p class="muted small">Available balance</p><b class="num" style="font-size:28px;color:var(--brand)">${inr(avail)}</b></section>
    <section class="section" style="display:grid;gap:14px">
      <div class="field"><label for="wd-amt">Amount</label><div class="prefix"><span>₹</span><input class="input num" id="wd-amt" inputmode="numeric" value="${esc(w.amt)}" data-model="wd.amt"></div>${w.err ? `<span class="err">${w.err}</span>` : ''}</div>
      <div class="field"><label>Pay to</label><div class="radio-list">
        <button class="radio ${w.acct === 'hdfc' ? 'on' : ''}" data-act="wdset" data-k="acct" data-v="hdfc"><span class="ic">${ic('bank')}</span><span class="txt"><b>HDFC Bank ••4521</b><span>Ayesha Khan · Verified</span></span><span class="rd"></span></button>
        <button class="radio ${w.acct === 'hosp' ? 'on' : ''}" data-act="wdset" data-k="acct" data-v="hosp"><span class="ic">${ic('pulse')}</span><span class="txt"><b>SGPGI Lucknow (direct)</b><span>Hospital account · Verified</span></span><span class="rd"></span></button></div></div>
      <div class="field"><label for="wd-purpose">Purpose</label><select class="select" id="wd-purpose" data-model="wd.purpose">${['Hospital bill payment', 'Medicines', 'Surgery advance', 'Other'].map(p => `<option ${w.purpose === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
      <label class="doc-up ${w.bill ? 'done' : ''}" for="bill-in">${ic(w.bill ? 'check' : 'upload')}<span class="txt"><b>Upload bill or invoice</b><span>${w.bill ? esc(w.bill) : 'Required for every withdrawal'}</span></span><input type="file" id="bill-in" data-doc="bill" accept="image/*,application/pdf" hidden></label>
    </section>
    <p class="small muted" style="padding:0 6px">Requests are reviewed by our team. Approved payouts reach the bank within 1–2 working days.</p>
  </div>`, cta: `<button class="btn btn-main btn-block" data-act="wdSubmit">Request withdrawal</button>` };
};

V.kyc = () => {
  const b = S.bank2;
  const row = (i, l, s, st) => `<div class="doc-row">${ic(i)}<span><b>${l}</b><br><span class="small muted">${s}</span></span><span class="status ${st === 'Verified' ? 'st-live' : 'st-review'}" style="margin-left:auto">${st}</span></div>`;
  return { html: pageHead('KYC & bank account') + `<div class="wrap">
    <section class="section"><div class="sec-head"><h2>Identity</h2></div>${row('user', 'PAN card', 'ABCPK••••F', 'Verified')}${row('file', 'Aadhaar', '•••• •••• 4821', 'Verified')}</section>
    <section class="section"><div class="sec-head"><h2>Bank accounts</h2></div>${row('bank', 'HDFC Bank ••4521', 'IFSC HDFC0001234', 'Verified')}${b ? row('bank', esc(b.bank), 'IFSC ' + esc(b.ifsc), 'In review') : ''}</section>
    ${b ? '' : `<section class="section" style="display:grid;gap:12px"><div class="sec-head" style="margin:0"><h2>Add bank account</h2></div>
      <div class="field"><label for="k-name">Account holder name</label><input class="input" id="k-name" data-model="kyc.name" placeholder="As per bank records"></div>
      <div class="field"><label for="k-acc">Account number</label><input class="input num" id="k-acc" inputmode="numeric" data-model="kyc.acc"></div>
      <div class="field"><label for="k-ifsc">IFSC</label><input class="input" id="k-ifsc" data-model="kyc.ifsc" placeholder="e.g. SBIN0001234" style="text-transform:uppercase"></div>
      <label class="doc-up" for="cheque-in">${ic('upload')}<span class="txt"><b>Cancelled cheque or passbook</b><span>Photo or PDF</span></span><input type="file" id="cheque-in" data-doc="cheque" accept="image/*,application/pdf" hidden></label>
      <span class="err" id="kyc-err"></span>
      <button class="btn btn-main" data-act="kycSubmit">Submit for verification</button></section>`}
  </div>` };
};

S.prefs = { receipts: true, status: true, withdrawals: true, updates: true, news: false };
V.settings = () => {
  const u = S.user;
  const sw = (k, t, d) => `<div class="switch-row"><div class="txt"><b>${t}</b><span>${d}</span></div><button class="switch ${S.prefs[k] ? 'on' : ''}" data-act="pref" data-k="${k}" role="switch" aria-checked="${S.prefs[k]}" aria-label="${t}"></button></div>`;
  return { html: pageHead('Profile settings') + `<form class="wrap" data-form="profile">
    <section class="section center" style="display:grid;justify-items:center;gap:10px">${avatar(u.name, 'big')}<label class="text-link" for="avatar-in">Change photo<input type="file" id="avatar-in" accept="image/*" hidden></label></section>
    <section class="section" style="display:grid;gap:14px">
      <div class="field"><label for="s-name">Full name</label><input class="input" id="s-name" name="name" value="${esc(u.name)}" required></div>
      <div class="field"><label for="s-email">Email</label><input class="input" id="s-email" name="email" type="email" value="${esc(u.email)}" required><span class="hint">Receipts and alerts are sent here.</span></div>
      <div class="field"><label for="s-phone">Mobile</label><input class="input num" id="s-phone" value="+91 98765 43210" readonly></div>
      <div class="field"><label for="s-pan">PAN (for 80G tax receipts)</label><input class="input" id="s-pan" name="pan" value="ABCPK1234F" style="text-transform:uppercase" maxlength="10"></div>
    </section>
    <section class="section"><div class="sec-head"><h2>Email notifications</h2></div>
      ${sw('receipts', 'Donation receipts', 'An 80G receipt after every donation')}${sw('status', 'Campaign status', 'Review, approval and goal reached')}${sw('withdrawals', 'Withdrawal updates', 'Requested, approved and paid')}${sw('updates', 'Updates from campaigns', 'News from campaigns you support')}${sw('news', 'Monthly newsletter', 'Impact stories and new causes')}
    </section>
    <button class="btn btn-main">Save changes</button>
  </form>` };
};

V.ngos = () => ({ html: pageHead('Verified NGOs') + `<div class="wrap"><section class="section">${Object.entries(ORGS).filter(([, o]) => o.ngo).map(([k, o]) => { const cs = CAMPAIGNS.filter(c => c.org === k); return `<div class="person"><div class="org-av" style="color:${o.color};border:1px solid var(--line);box-shadow:none">${o.short}</div><div class="who"><b>${esc(o.name)}</b><span>12A · 80G · ${cs.length} campaigns · ${inr(cs.reduce((a, c) => a + c.raised, 0))} raised</span></div><span class="verified">${ic('verified')}</span></div>`; }).join('')}</section>
  <p class="small muted" style="padding:0 4px">Every NGO submits registration, 12A/80G certificates and audited accounts before listing.</p></div>` });

V.history = () => {
  const base = [{ cid: 2, amount: 1000, type: 'Sadaqah', date: '2 Mar 2026', txn: 'BRK73810294' }, { cid: 7, amount: 2500, type: 'Sadaqah', date: '14 Dec 2025', txn: 'BRK61200877' }, { cid: 8, amount: 5000, type: 'Zakat', date: '28 Mar 2025', txn: 'BRK40021933' }];
  const all = [...S.donations, ...base];
  return { html: pageHead('Donation history') + `<div class="wrap">
    <section class="section" style="display:flex;justify-content:space-between"><div><span class="small muted">This year</span><b class="num" style="display:block;font-size:24px;color:var(--brand)">${inr(S.donated + 1000)}</b></div><div style="text-align:right"><span class="small muted">Zakat given</span><b class="num" style="display:block;font-size:24px">${inr(S.donations.filter(d => d.type === 'Zakat').reduce((a, d) => a + d.amount, 0))}</b></div></section>
    <section class="section">${all.map((d, i) => { const c = camp(d.cid); return `<div class="result"><div class="thumb" style="background:linear-gradient(140deg,${CATS[c.cat].g.join(',')})">${ic(CATS[c.cat].icon)}</div><div class="info"><b>${esc(c.title)}</b><span class="small muted">${d.date} · ${d.type}</span></div><div style="text-align:right"><b class="num">${inr(d.amount)}</b><button class="text-link small" style="display:block" data-act="receipt" data-i="${i}">Receipt</button></div></div>`; }).join('')}</section>
  </div>`, data: all };
};

const INFO = {
  about: ['About us', `<p>MuslimPro Giving connects people who want to give with verified NGOs and families who need help. Every fundraiser is checked by our team, and funds are released against bills.</p><p>We charge 0% platform fee to NGOs. Optional tips from donors keep the service running.</p>`],
  how: ['How it works', `<div class="timeline">${[['Start a fundraiser', 'Add the story, target, beneficiary details, photos and documents.'], ['We verify', 'Our team reviews documents and KYC within 48 hours.'], ['Share and raise', 'Share your link on WhatsApp and social media. Donors pay by UPI, card or net banking.'], ['Withdraw against bills', 'Request a withdrawal to a verified bank account. Track it until it is paid.']].map(([t, s], i) => `<div class="tl"><div class="rail"><i></i>${i < 3 ? '<b></b>' : ''}</div><div class="tl-body"><b>${t}</b><p>${s}</p></div></div>`).join('')}</div>`],
  faq: ['FAQs', [['Is my donation tax deductible?', 'Donations to NGOs with 80G registration get an 80G receipt by email right after payment.'], ['Can I give Zakat?', 'Yes. Campaigns marked “Zakat eligible” keep Zakat funds separate and use them only for eligible beneficiaries.'], ['How do I know a campaign is genuine?', 'Every campaign is reviewed with documents and KYC before it goes live. Look for the verified tick.'], ['When can organisers withdraw money?', 'After KYC and bank verification. Each withdrawal needs a bill or invoice and is approved by our team.'], ['Can I get a refund?', 'Refunds are possible within 7 days for duplicate or failed payments. See the Refund Policy.']].map(([q, a]) => `<details class="faq"><summary>${q}${ic('down')}</summary><p>${a}</p></details>`).join('')],
  contact: ['Contact us', `<p>We usually reply within one working day.</p><p><b>Email</b><br><span style="user-select:all">support@give.muslimpro.demo</span></p><p><b>Phone (10 am – 6 pm IST)</b><br><span style="user-select:all">+91 80 4000 1234</span></p>
    <form data-form="contact" style="display:grid;gap:10px;margin-top:14px"><input class="input" id="c-name" required placeholder="Your name"><input class="input" id="c-email" type="email" required placeholder="Email"><textarea class="textarea" id="c-msg" required placeholder="How can we help?"></textarea><button class="btn btn-main">Send message</button></form>`],
  terms: ['Terms & Conditions', '<p>The approved Terms & Conditions will be shown here. This page is ready for the final legal text.</p>'],
  privacy: ['Privacy Policy', '<p>The approved Privacy Policy will be shown here, including how donor and beneficiary data is stored and used.</p>'],
  refund: ['Refund Policy', '<p>The approved Refund Policy will be shown here. Typical cases: duplicate payments and failed transactions within 7 days.</p>'],
};
V.info = slug => { const [t, body] = INFO[slug] || INFO.about; return { html: pageHead(t) + `<div class="wrap"><section class="section prose">${body}</section></div>` }; };

// Outlined wordmark used on the splash and onboarding headers (white outline around a green fill, like the reference)
const WORDMARK = `<svg class="wordmark" viewBox="0 0 440 110" role="img" aria-label="${APP}"><path d="M52 14a40 40 0 1 0 40 52 32 32 0 1 1-40-52Z" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><path d="M78 20l3.5 7.5 8 1-6 5.5 1.6 8-7.1-4-7.1 4 1.6-8-6-5.5 8-1Z" fill="#fff"/><text x="272" y="76" text-anchor="middle" textLength="312" lengthAdjust="spacingAndGlyphs" font-family="Manrope, system-ui, sans-serif" font-weight="800" font-size="70" fill="#1fc95c" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${APP}</text></svg>`;
const onbHero = cls => `<div class="onb-hero ${cls || ''}"><div class="pattern"></div><svg class="onb-moon" viewBox="0 0 24 24" aria-hidden="true">${P.moon}</svg>${WORDMARK}</div>`;

V.splash = () => {
  setTimeout(() => location.hash === '#/splash' && replaceRoute('#/intro'), 1400);
  return { bare: true, html: `<button class="splash" data-act="splashNext" aria-label="Continue">${WORDMARK}</button>` };
};

V.intro = () => ({ bare: true, html: `<div class="onb">${onbHero()}<div class="onb-body">
  <h1>Assalamu alaikum!</h1>
  <p class="onb-text">Give Zakat and Sadaqah to verified causes and see where every rupee goes. By tapping “Let’s go” you accept the <a class="text-link" href="#/info/terms" data-go="#/info/terms">Terms of Use</a> and the <a class="text-link" href="#/info/privacy" data-go="#/info/privacy">Privacy Policy</a>.</p>
  <button class="btn btn-main onb-cta" data-go="#/login">Let’s go</button>
</div></div>` });

V.login = () => {
  const l = S.login, e = l.err || {};
  const err = k => e[k] ? `<span class="err">${e[k]}</span>` : '';
  const body = l.stage === 'details' ? `
    <h1>Welcome! Let’s set you up</h1>
    <div class="seg" style="margin-top:4px">${[['donor', 'I want to donate'], ['org', 'I want to raise funds']].map(([k, t]) => `<button class="${l.role === k ? 'on' : ''}" data-act="lset" data-k="role" data-v="${k}">${t}</button>`).join('')}</div>
    <div class="onb-form">
      <div class="field"><label for="l-name">Full name</label><input class="input ${e.name ? 'bad' : ''}" id="l-name" autocomplete="name" placeholder="Your name" value="${esc(l.name)}" data-model="login.name">${err('name')}</div>
      <div class="field"><label for="l-email">Email</label><input class="input ${e.email ? 'bad' : ''}" id="l-email" type="email" autocomplete="email" placeholder="you@example.com" value="${esc(l.email)}" data-model="login.email">${err('email')}</div>
      <div class="field"><label for="ph">Mobile number</label><div class="phone-in"><input class="input cc" value="+91" aria-label="Country code" readonly><input class="input num ${e.phone ? 'bad' : ''}" id="ph" inputmode="numeric" maxlength="10" autocomplete="tel-national" placeholder="98765 43210" value="${esc(l.phone)}" data-model="login.phone"></div>${err('phone')}</div>
    </div>
    <button class="btn btn-main onb-cta" data-act="otp">Continue</button>
    <div class="or">or continue with</div>
    <div class="socials">
      <button class="soc" data-act="enter" aria-label="Continue with Google"><b style="color:#4285f4;font-size:20px">G</b></button>
      <button class="soc" data-act="enter" aria-label="Continue with Facebook"><b style="color:#fff;background:#1877f2;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:17px">f</b></button>
      <button class="soc" data-act="enter" aria-label="Continue with Apple"><svg viewBox="0 0 24 24" width="22" height="22" fill="#111" aria-hidden="true"><path d="M16.5 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.7ZM14.2 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3Z"/></svg></button>
      <button class="soc" data-act="enter" aria-label="Continue with email" style="color:var(--brand-3)">${ic('mail')}</button>
    </div>
    <button class="text-link onb-skip" data-act="enter">Skip for now</button>`
  : `
    <h1>Enter the code</h1>
    <p class="onb-text">We sent a 4-digit code to +91 ${esc(l.phone)}. <button class="text-link" data-act="lset" data-k="stage" data-v="details">Change</button></p>
    <div class="otp">${[0, 1, 2, 3].map(i => `<input id="otp${i}" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" data-otp="${i}">`).join('')}</div>
    <p class="small muted">Demo: type any 4 digits</p>
    <button class="btn btn-main onb-cta" data-act="enter">Verify & continue</button>
    <button class="text-link onb-skip" data-act="toast" data-msg="New code sent">Resend code</button>`;
  return { bare: true, html: `<div class="onb">${onbHero('short')}<div class="onb-body">${body}</div></div>` };
};

/* ---------- router ---------- */
const app = document.getElementById('app');
let lastRoute = '';
let currentView = null;

function render() {
  const [name = 'home', arg, sub] = location.hash.replace(/^#\/?/, '').split('/');
  const route = name + '/' + (arg || '');
  const changed = route !== lastRoute;
  if (changed) { lastRoute = route; S.ui.dTab = 'story'; }
  const view = (V[name] || V.home)(arg, sub);
  currentView = view;
  app.className = view.nav ? '' : view.cta ? 'no-nav' : 'bare';
  app.innerHTML = view.html + (view.nav ? navBar(view.nav) : '') + (view.cta ? `<div class="fixed-col cta-bar">${view.cta}</div>` : '');
  if (changed) window.scrollTo(0, 0);
}
const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
const go = h => { if (location.hash === h) rerender(); else location.hash = h; };
const replaceRoute = h => location.replace(location.href.split('#')[0] + h);
window.addEventListener('hashchange', render);

/* ---------- interactions ---------- */
function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
function sheet(html) {
  const s = document.createElement('div');
  s.className = 'scrim';
  s.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('[data-close]')) s.remove(); });
  document.body.appendChild(s);
}
function setPath(path, val) { const ks = path.split('.'); let o = S; ks.slice(0, -1).forEach(k => (o = o[k] || (o[k] = {}))); o[ks.at(-1)] = val; }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Link copied'); } catch { toast(text); }
}

const A = {
  back: () => (history.length > 1 ? history.back() : go('#/home')),
  ui: el => {
    const v = el.dataset.v; S.ui[el.dataset.k] = v === 'true' ? true : v === 'false' ? false : v;
    if (el.dataset.then) go(el.dataset.then);
    else if (el.dataset.k === 'sort' || el.dataset.k === 'zakatOnly' || el.dataset.k === 'cat') rerender();
    else rerender();
  },
  save: el => { const id = Number(el.dataset.id); S.saved.has(id) ? S.saved.delete(id) : S.saved.add(id); toast(S.saved.has(id) ? 'Saved to favorites' : 'Removed from favorites'); rerender(); },
  share: el => {
    const c = camp(el.dataset.id), url = `${SITE}/c/${c.id}`, txt = encodeURIComponent(shareText(c));
    sheet(`<h2>Share this campaign</h2><p class="muted small">Every share brings new donors. You earn 5 Kindness Points for each donation through your link.</p>
      <div class="share-grid">
        <a href="https://wa.me/?text=${txt}" target="_blank" rel="noopener"><span class="ic" style="background:#1fae55">${ic('msg')}</span>WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener"><span class="ic" style="background:#1877f2">f</span>Facebook</a>
        <a href="https://x.com/intent/post?text=${txt}" target="_blank" rel="noopener"><span class="ic" style="background:#15151f">X</span>X</a>
        <button data-act="copy" data-v="${url}"><span class="ic" style="background:var(--chip);color:var(--ink)">${ic('link')}</span>Copy link</button>
      </div><p class="small muted" style="margin-top:14px;user-select:all">${url}</p>`);
  },
  copy: el => copy(el.dataset.v),
  toast: el => toast(el.dataset.msg),
  like: el => { const i = Number(el.dataset.i); S.liked.has(i) ? S.liked.delete(i) : S.liked.add(i); rerender(); },
  earn: () => sheet(`<h2>How to earn points</h2><p class="muted small">Kindness Points decide your league each season.</p>
    <div style="margin-top:10px">${[['heart', 'Donate', '1 point for every ₹10'], ['share', 'Share a campaign', '5 points per donation through your link'], ['flame', 'Keep a streak', '+20 points every 7 days'], ['sprout', 'Start a fundraiser', '50 points when it goes live']].map(([i, t, s]) => `<div class="person"><div class="av" style="background:var(--brand-soft);color:var(--brand)">${ic(i)}</div><div class="who"><b>${t}</b><span>${s}</span></div></div>`).join('')}</div>
    <button class="btn btn-main btn-block" style="margin-top:14px" data-close data-go="#/home">Find a campaign</button>`),
  leagueInfo: () => sheet(`<h2>Leagues</h2><p class="muted">Each season lasts one month. The top 5 in your league move up: Seedling → Crescent → Lantern → Oasis.</p><button class="btn btn-soft btn-block" style="margin-top:16px" data-close>Got it</button>`),
  amt: el => { const v = el.dataset.v; if (v === 'other') { S.donate.other = true; } else { S.donate.other = false; S.donate.custom = ''; S.donate.amount = Number(v); } rerender(); if (v === 'other') document.getElementById('custom-amt')?.focus(); },
  dset: el => { const v = el.dataset.v; S.donate[el.dataset.k] = el.dataset.k === 'tip' ? Number(v) : v; rerender(); },
  dtoggle: el => { S.donate[el.dataset.k] = !S.donate[el.dataset.k]; rerender(); },
  pay: () => {
    const amount = dAmount(); if (amount < 10) return toast('Enter at least ₹10');
    const d = S.donate, c = camp(d.cid);
    const p = document.createElement('div');
    p.className = 'processing';
    p.innerHTML = `<div class="spin"></div><div>${d.pay === 'upi' ? 'Waiting for UPI approval…' : 'Processing payment…'}<div class="small muted" style="margin-top:4px">Demo payment, no money is charged</div></div>`;
    document.body.appendChild(p);
    setTimeout(() => {
      p.remove();
      const rec = { cid: c.id, amount, tip: dTip(), type: d.type, pay: d.pay, anon: d.anon, points: Math.floor(amount / 10), txn: 'BRK' + String(Date.now()).slice(-8), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) };
      c.raised += amount; c.donors += 1;
      S.donated += amount; S.points += rec.points; S.streak = true; S.last = rec; S.donations.unshift(rec); S.donate = null;
      S.notifs.unshift({ ic: 'heart', c: 'green', txt: `Your ${rec.type} of <b>${inr(amount)}</b> to <b>${esc(c.title)}</b> was received. Receipt sent to ${S.user.email}.`, t: 'Just now', unread: true });
      replaceRoute('#/success');
    }, 1500);
  },
  receipt: el => { const d = currentView.data[Number(el.dataset.i)], c = camp(d.cid); sheet(`<h2>80G receipt</h2><dl class="kv" style="margin-top:12px"><dt>Campaign</dt><dd>${esc(c.title)}</dd><dt>NGO</dt><dd>${esc(ORGS[c.org].name)}</dd><dt>Amount</dt><dd class="num">${inr(d.amount)}</dd><dt>Type</dt><dd>${d.type}</dd><dt>Date</dt><dd>${d.date}</dd><dt>Transaction</dt><dd class="num">${d.txn}</dd></dl><button class="btn btn-soft btn-block" style="margin-top:16px" data-close data-act="toast" data-msg="Receipt PDF downloaded">${ic('file')} Download PDF</button>`); },
  draft: el => { const v = el.dataset.v; S.draft[el.dataset.k] = v === 'true' ? true : v === 'false' ? false : v; rerender(); },
  wizBack: () => { S.draft.step -= 1; S.draft.err = {}; render(); },
  wizNext: () => {
    const d = S.draft; d.err = validateStep(d);
    if (Object.keys(d.err).length) { rerender(); document.querySelector('.err')?.scrollIntoView({ block: 'center' }); return; }
    if (d.step < 4) { d.step += 1; render(); window.scrollTo(0, 0); return; }
    const id = Math.max(...CAMPAIGNS.map(c => c.id)) + 1;
    CAMPAIGNS.push({ ...previewCampaign(), id, days: 30, done: false, zakat: d.zakat, city: d.city, caption: d.name ? `For ${d.name}` : '', unit: [1000, 'contribution'], ben: { Beneficiary: d.name + (d.age ? `, ${d.age} yrs` : ''), Relation: d.who === 'self' ? 'Organiser' : d.relation || '—', Location: d.city }, docs: Object.keys(d.docs).map(k => DOCS[k][0]), story: d.story.split(/\n+/), updates: [], hidden: true });
    S.mine.push({ id, status: 'review', photo: d.photos[0] });
    S.notifs.unshift({ ic: 'clock', c: 'gold', txt: `Your fundraiser <b>${esc(d.title)}</b> was submitted and is under review.`, t: 'Just now', unread: true });
    S.draft = null;
    replaceRoute('#/submitted');
  },
  approve: el => {
    const id = Number(el.dataset.id), m = S.mine.find(x => x.id === id), c = camp(id);
    m.status = 'live'; delete c.hidden; S.points += 50;
    S.notifs.unshift({ ic: 'verified', c: 'green', txt: `Your fundraiser <b>${esc(c.title)}</b> passed review and is live.`, t: 'Just now', unread: true });
    toast('Approved. The fundraiser is now live in Campaigns.'); rerender();
  },
  postUpdate: () => sheet(`<h2>Post an update</h2><p class="muted small">Donors get a notification and an email.</p><form data-form="update" style="display:grid;gap:10px;margin-top:12px"><textarea class="textarea" id="upd-txt" required placeholder="e.g. Surgery went well. Thank you all!"></textarea><button class="btn btn-main">Post update</button></form>`),
  wdset: el => { S.wd[el.dataset.k] = el.dataset.v; rerender(); },
  wdSubmit: () => {
    const w = S.wd, amt = Number(w.amt), avail = myRaised() - withdrawn();
    w.err = !(amt >= 1000) ? 'Enter at least ₹1,000.' : amt > avail ? `You can withdraw up to ${inr(avail)}.` : !w.bill ? 'Upload the bill or invoice for this payment.' : '';
    if (w.err) return rerender();
    S.withdrawals.push({ id: 'WD-' + (1052 + S.withdrawals.length), amt, status: 'requested', date: 'Today', note: (w.acct === 'hdfc' ? 'To HDFC ••4521' : 'To SGPGI Lucknow') + ' · ' + w.purpose });
    S.wd = null;
    toast('Withdrawal requested. We’ll notify you at each step.');
    replaceRoute('#/my');
  },
  kycSubmit: () => {
    const k = S.kyc || {};
    const err = !k.name ? 'Enter the account holder name.' : !/^\d{9,18}$/.test(k.acc || '') ? 'Account number should be 9 to 18 digits.' : !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(k.ifsc || '') ? 'IFSC should look like SBIN0001234.' : !k.cheque ? 'Upload a cancelled cheque or passbook photo.' : '';
    if (err) { document.getElementById('kyc-err').textContent = err; return; }
    S.bank2 = { bank: 'Account ••' + k.acc.slice(-4), ifsc: k.ifsc.toUpperCase() }; S.kyc = null;
    toast('Bank account sent for verification'); rerender();
  },
  region: () => sheet(`<h2>Language and region</h2><div class="radio-list" style="margin-top:12px">${[['English', 'India · ₹ INR', true], ['हिन्दी', 'India · ₹ INR'], ['اردو', 'India · ₹ INR'], ['English', 'International · $ USD']].map(([l, s, on]) => `<button class="radio ${on ? 'on' : ''}" data-close><span class="txt"><b>${l}</b><span>${s}</span></span><span class="rd"></span></button>`).join('')}</div>`),
  payments: () => sheet(`<h2>Payment methods</h2><div class="radio-list" style="margin-top:12px"><div class="radio on"><span class="ic">${ic('phone')}</span><span class="txt"><b>ayesha@okhdfc</b><span>UPI · default</span></span></div><div class="radio"><span class="ic">${ic('card')}</span><span class="txt"><b>RuPay ••7781</b><span>Expires 08/29</span></span></div></div><button class="btn btn-soft btn-block" style="margin-top:14px" data-close>${ic('plus')} Add payment method</button>`),
  monthly: () => sheet(`<h2>Monthly giving</h2><p class="muted">Give a fixed amount every month by UPI AutoPay. You can pause or stop anytime.</p><div class="amounts" style="margin-top:14px">${[300, 500, 1000].map(a => `<button>${inr(a)}</button>`).join('')}</div><button class="btn btn-main btn-block" style="margin-top:14px" data-close data-act="toast" data-msg="Monthly giving set up (demo)">Set up monthly giving</button>`),
  favs: () => { S.ui.home = 'fav'; go('#/home'); },
  mylink: () => sheet(`<h2>Your personal link</h2><p class="muted small">Share it anywhere. Donations made through it count toward your Inspirer rank.</p><p style="margin-top:12px;font-weight:700;user-select:all">${SITE}/u/ayesha-khan</p><button class="btn btn-main btn-block" style="margin-top:14px" data-act="copy" data-v="${SITE}/u/ayesha-khan">${ic('link')} Copy link</button>`),
  logout: () => { S.login = { stage: 'details', role: 'donor', name: '', email: '', phone: '', err: {} }; replaceRoute('#/intro'); },
  splashNext: () => replaceRoute('#/intro'),
  pref: el => { S.prefs[el.dataset.k] = !S.prefs[el.dataset.k]; rerender(); },
  lset: el => { S.login[el.dataset.k] = el.dataset.v; rerender(); },
  otp: () => {
    const l = S.login, ph = l.phone.replace(/\D/g, '');
    l.err = {};
    if (!l.name.trim()) l.err.name = 'Enter your name, or tap “Skip for now”.';
    if (l.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email.trim())) l.err.email = 'Enter a valid email, like name@example.com.';
    if (!/^[6-9]\d{9}$/.test(ph)) l.err.phone = 'Enter a valid 10-digit mobile number.';
    if (Object.keys(l.err).length) return rerender();
    l.stage = 'otp'; rerender(); document.getElementById('otp0')?.focus();
  },
  enter: () => {
    const l = S.login;
    if (l.name.trim()) { S.user.name = l.name.trim(); S.user.first = S.user.name.split(' ')[0]; }
    if (l.email.trim()) S.user.email = l.email.trim();
    l.stage = 'details'; replaceRoute('#/home');
  },
};

document.addEventListener('click', e => {
  const actEl = e.target.closest('[data-act]');
  const goEl = e.target.closest('[data-go]');
  if (actEl && A[actEl.dataset.act]) {
    e.preventDefault();
    A[actEl.dataset.act](actEl);
    if (actEl.closest('.scrim') && actEl.dataset.go) { actEl.closest('.scrim').remove(); go(actEl.dataset.go); }
    if (actEl.closest('.scrim') && actEl.hasAttribute('data-close')) actEl.closest('.scrim')?.remove();
    return;
  }
  if (goEl) { e.preventDefault(); goEl.closest('.scrim')?.remove(); go(goEl.dataset.go); }
});

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.otp) { if (el.value && el.nextElementSibling) el.nextElementSibling.focus(); return; }
  if (!el.dataset.model) return;
  setPath(el.dataset.model, el.value);
  const live = el.dataset.live;
  if (live === 'donate') { const c = camp(S.donate.cid); document.getElementById('impact').innerHTML = impactLine(c); document.getElementById('summary').innerHTML = summary(); document.getElementById('paybtn').textContent = payLabel(); }
  if (live === 'search') document.getElementById('results').innerHTML = results();
  if (live === 'count') document.getElementById('count').textContent = `${el.value.length} characters · at least 50`;
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.model && el.tagName === 'SELECT') setPath(el.dataset.model, el.value);
  if (el.type !== 'file' || !el.files.length) return;
  if (el.id === 'photo-in') {
    const files = [...el.files].slice(0, 6 - S.draft.photos.length);
    Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(f); })))
      .then(urls => { S.draft.photos.push(...urls.filter(Boolean)); S.draft.err.photos = ''; rerender(); });
    return;
  }
  const name = el.files[0].name;
  if (el.dataset.doc === 'bill') S.wd.bill = name;
  else if (el.dataset.doc === 'cheque') { (S.kyc || (S.kyc = {})).cheque = name; el.closest('.doc-up').classList.add('done'); el.closest('.doc-up').querySelector('.txt span').textContent = name; return; }
  else S.draft.docs[el.dataset.doc] = name;
  rerender();
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, kind = f.dataset.form;
  if (kind === 'comment') {
    const txt = f.txt.value.trim(); if (!txt) return;
    (COMMENTS[f.dataset.id] ||= []).unshift([S.user.name, 'now', txt]);
    rerender(); toast('Comment posted');
  } else if (kind === 'profile') {
    S.user.name = f.name.value.trim() || S.user.name; S.user.first = S.user.name.split(' ')[0]; S.user.email = f.email.value.trim() || S.user.email;
    toast('Profile saved'); history.back();
  } else if (kind === 'contact') { f.reset(); toast('Message sent. We’ll reply by email.'); }
  else if (kind === 'update') {
    const c = camp(6); c.updates.unshift(['Just now', f.querySelector('textarea').value.trim()]);
    f.closest('.scrim').remove(); toast('Update posted. Donors have been notified.');
  }
});

if (!location.hash) replaceRoute('#/splash');
render();
