/* Muslim Life Pro: clickable Android UI demo for a donation / fundraising platform.
   Everything is in-memory sample data; no backend calls. Hash routes give the Android back button for free. */
'use strict';

const APP = 'Muslim Life Pro';
const SITE = 'https://muslimlifepro.demo';
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
  calc: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  quote: '<path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5c0 2.5-1.5 4-4 5"/><path d="M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5c0 2.5-1.5 4-4 5"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M7 21h10"/><path d="M8 7c0-1 1-1.5 1-2.5S8 3 8 3M12 7c0-1 1-1.5 1-2.5S12 3 12 3M16 7c0-1 1-1.5 1-2.5S16 3 16 3"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  crown: '<path d="M11.56 3.27a.5.5 0 0 1 .88 0l2.95 5.6a1 1 0 0 0 1.52.29l4.27-3.66a.5.5 0 0 1 .82.5l-2.83 10.25a1 1 0 0 1-.96.74H5.81a1 1 0 0 1-.96-.74L2.02 6.01a.5.5 0 0 1 .82-.5l4.27 3.66a1 1 0 0 0 1.52-.29z"/><path d="M5 21h14"/>',
  rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/>',
  userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  snow: '<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93"/><path d="m9 3 3 3 3-3M9 21l3-3 3 3M3 9l3 3-3 3M21 9l-3 3 3 3"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="m9 5 3-3 3 3-3 4Z"/>',
  school: '<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.45 1.73A1 1 0 0 1 22 12.62V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.38a1 1 0 0 1 .55-.89L6 10"/><path d="M18 5v17M4 6l7.11-3.56a2 2 0 0 1 1.78 0L20 6M6 5v17"/><circle cx="12" cy="9" r="2"/>',
  ballot: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  video: '<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2M13 12l5.88-9.8M8 7h8"/><circle cx="12" cy="17" r="5"/>',
  hands: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* Solid tab-bar glyphs, drawn to match the filled style of the reference app */
const NAV_ICONS = {
  home: '<path d="M5 3h14a1.5 1.5 0 0 1 0 3H5a1.5 1.5 0 0 1 0-3Z"/><path d="M3.5 8h17v10.5A3.5 3.5 0 0 1 17 22H7a3.5 3.5 0 0 1-3.5-3.5Z"/><path style="fill:var(--card)" d="M12 19.2l-3.3-3.1a2.1 2.1 0 0 1 3-3l.3.3.3-.3a2.1 2.1 0 0 1 3 3Z"/>',
  completed: '<path d="M6 2.5h12A3.5 3.5 0 0 1 21.5 6v12a3.5 3.5 0 0 1-3.5 3.5H6A3.5 3.5 0 0 1 2.5 18V6A3.5 3.5 0 0 1 6 2.5Z"/><path d="M8 13l3 3 5-6" fill="none" style="stroke:var(--card)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  rating: '<path d="M6 2h12v7a6 6 0 0 1-12 0Z"/><path d="M6 4H3.5a1 1 0 0 0-1 1.2C3 8.5 4.6 10 6.5 10.4M18 4h2.5a1 1 0 0 1 1 1.2c-.5 3.3-2.1 4.8-4 5.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 14.5h3v3.5h-3z"/><path d="M7 19.5h10V22H7z"/>',
  news: '<path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v4.3L3.7 16.6a1 1 0 0 0 .9 1.4h14.8a1 1 0 0 0 .9-1.4l-1.8-3.3V9A6.5 6.5 0 0 0 12 2.5Z"/><path d="M9.2 19.5h5.6a2.8 2.8 0 0 1-5.6 0Z"/>',
  profile: '<circle cx="10" cy="6.5" r="4"/><path d="M2.5 19.5a7.5 7.5 0 0 1 12.2-5.8A5 5 0 0 0 13 21.5H4a1.5 1.5 0 0 1-1.5-2Z"/><circle cx="18.5" cy="17.5" r="4.5"/><path style="fill:var(--card)" d="M18.5 20.2l-2-1.9a1.2 1.2 0 0 1 1.7-1.8l.3.3.3-.3a1.2 1.2 0 0 1 1.7 1.8Z"/>',
  vote: '<path d="M3.5 13.5h17v6.5A1.5 1.5 0 0 1 19 21.5H5A1.5 1.5 0 0 1 3.5 20Z"/><path d="M7 2.5h10v10H7z"/><path d="m9.4 7.6 1.8 1.8 3.6-3.6" fill="none" style="stroke:var(--card)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 17.5h7" style="stroke:var(--card)" stroke-width="1.6" stroke-linecap="round"/>',
  stories: '<path d="M12 1.5a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21Z"/><path d="M10 8.2v7.6l6.2-3.8Z" style="fill:var(--card)"/>'
,
  campaigns: '<path d="M4 3h7a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 11 12H4a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 4 3Z"/><path d="M13 13h7a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 20 21h-7a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 13 13Z"/><path d="M15 3h5a1.5 1.5 0 0 1 1.5 1.5V9A1.5 1.5 0 0 1 20 10.5h-5A1.5 1.5 0 0 1 13.5 9V4.5A1.5 1.5 0 0 1 15 3ZM4 14h5a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9 21H4a1.5 1.5 0 0 1-1.5-1.5v-4A1.5 1.5 0 0 1 4 14Z"/>'
,
  creator: '<path d="M6 2h12v7a6 6 0 0 1-12 0Z"/><path d="M6 4H3.5a1 1 0 0 0-1 1.2C3 8.5 4.6 10 6.5 10.4M18 4h2.5a1 1 0 0 1 1 1.2c-.5 3.3-2.1 4.8-4 5.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 14.5h3v3.5h-3z"/><path d="M7 19.5h10V22H7z"/><path d="m12 4.6 1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3Z" style="fill:var(--card)"/>'
,
  community: '<circle cx="8" cy="7" r="3.5"/><circle cx="16.5" cy="8" r="3"/><path d="M1.5 19a6.5 6.5 0 0 1 13 0v1.5h-13Z"/><path d="M15.5 20.5V19a8 8 0 0 0-1.7-5 5.5 5.5 0 0 1 8.7 4.5v2Z"/>'
};

// app emblem: dome with crescent finial, two minarets, open Quran as the base
const emblem = (cls = '') => `<svg class="emblem ${cls}" viewBox="0 0 64 64" aria-hidden="true"><path fill="#e9b52c" d="M33.6 2.2a4.2 4.2 0 1 0 2.6 6.9 3.4 3.4 0 1 1-2.6-6.9Z"/><g fill="currentColor"><path d="M31 9.5h2v3.2h-2z"/><path d="M17.5 33.5c0-9.6 6.6-15.6 14.5-20.5 7.9 4.9 14.5 10.9 14.5 20.5Z"/><rect x="15.5" y="33.5" width="33" height="3.2" rx="1"/><path d="M18.5 37.5h27v10h-9.5v-4.2a4 4 0 0 0-8 0v4.2h-9.5Z"/><path d="M7.5 47.5V24.5l3-6.5 3 6.5v23Z"/><path d="M50.5 47.5V24.5l3-6.5 3 6.5v23Z"/><path d="M4 50.2c9.3-2.6 19-2 28 2.6 9-4.6 18.7-5.2 28-2.6v6.6c-9.3-2.6-19-2-28 2.6-9-4.6-18.7-5.2-28-2.6Z"/></g></svg>`;
const LOGO = emblem();

/* ---------- sample data ---------- */
// sample photos; swap for the NGO's own images per campaign
const PHOTO = { hospital: 'img/hospital.jpg', family: 'img/street-family.jpg', water: 'img/water.jpg', school: 'img/school.jpg', boy: 'img/boy.jpg' };
const PHOTO_LIST = Object.values(PHOTO);
const CATS = {
  medical: { label: 'Medical', icon: 'pulse', g: ['#3fb6d6', '#1d63b0'] },
  food: { label: 'Food & Iftar', icon: 'utensils', g: ['#f7b048', '#e0602a'] },
  water: { label: 'Water', icon: 'droplet', g: ['#4fcbee', '#2774d1'] },
  education: { label: 'Education', icon: 'book', g: ['#9a7cf4', '#5634c0'] },
  orphans: { label: 'Orphans', icon: 'baby', g: ['#f585a8', '#cf4778'] },
  masjid: { label: 'Masjid & madrasa', icon: 'mosque', g: ['#38d39f', '#0a8a52'] },
  emergency: { label: 'Emergency', icon: 'buoy', g: ['#f6735a', '#c33838'] },
  legal: { label: 'Legal aid', icon: 'scale', g: ['#7a8cff', '#2f3fa8'] },
};

const ORGS = {
  shifa: { name: 'Shifa Health Trust', short: 'SH', color: '#1d63b0', ngo: true },
  noor: { name: 'Al-Noor Welfare Society', short: 'AN', color: '#0a8a52', ngo: true },
  ummeed: { name: 'Ummeed Foundation', short: 'UF', color: '#e0602a', ngo: true },
  iqra: { name: 'Iqra Education Trust', short: 'IQ', color: '#5634c0', ngo: true },
  insaaf: { name: 'Insaaf Legal Aid Cell', short: 'IL', color: '#2f3fa8', ngo: true },
  me: { name: 'Ayesha Khan', short: 'AK', color: '#cf4778', ngo: false },
};

const CAMPAIGNS = [
  {
    id: 1, photo: PHOTO.hospital, pos: '30% center', org: 'shifa', cat: 'medical', zakat: true, city: 'Hyderabad, Telangana', days: 18,
    title: 'Help 6-year-old Ayaan beat leukaemia', caption: 'Ayaan has 4 chemo cycles left',
    goal: 800000, raised: 512400, donors: 1284,
    unit: [5000, 'day of chemotherapy'],
    ben: { Beneficiary: 'Ayaan Ahmed, 6 yrs', Relation: 'Patient (via NGO)', Hospital: 'MNJ Cancer Hospital', Location: 'Hyderabad' },
    docs: ['Hospital cost estimate', "Oncologist's letter", 'Parent ID proof'],
    story: ['Ayaan was diagnosed with acute lymphoblastic leukaemia in June. He loves cricket and wants to go back to Class 1 with his friends.', 'His father drives an auto-rickshaw and has already spent his savings on the first two cycles. The remaining treatment costs ₹8,00,000. Every rupee is paid directly to the hospital, and Shifa Health Trust shares bills after each cycle.'],
    updates: [['3 days ago', 'Cycle 3 completed. Ayaan is responding well and his blood counts are improving.'], ['2 weeks ago', 'Hospital bill of ₹1,85,000 paid from the funds raised. Receipt uploaded.']],
  },
  {
    id: 2, thumb: 'img/fx-ration.jpg', photo: PHOTO.family, pos: 'center', org: 'noor', cat: 'food', zakat: true, city: 'Mumbai, Maharashtra', days: 9,
    title: 'Give an Iftar to 1,000 families this Ramadan', caption: '₹100 feeds one fasting person',
    goal: 300000, raised: 241800, donors: 2106,
    unit: [100, 'iftar meal'],
    ben: { Beneficiary: '1,000 daily-wage families', Distribution: 'Govandi & Mankhurd', Partner: 'Al-Noor volunteers', Location: 'Mumbai' },
    docs: ['NGO 12A & 80G certificates', 'Distribution plan', 'Vendor quotation'],
    story: ['Every evening this Ramadan our volunteers hand out fresh iftar boxes (dates, fruit, biryani and water) to families who would otherwise break their fast with very little.', 'Your gift is turned into meals within 48 hours. We post photos and the distribution list after every drive.'],
    updates: [['Yesterday', '412 iftar boxes distributed at Govandi station road.']],
  },
  {
    id: 3, photo: PHOTO.water, pos: 'center', org: 'ummeed', cat: 'water', zakat: false, featured: true, city: 'Barmer, Rajasthan', days: 26,
    title: 'Clean water well for Sanawada village', caption: 'Women walk 6 km for water',
    goal: 450000, raised: 168500, donors: 640,
    unit: [1500, 'family supplied for a year'],
    ben: { Beneficiary: 'Sanawada village, 310 families', 'Project type': 'Borewell + hand pump + tank', Partner: 'Ummeed field team', Location: 'Barmer' },
    docs: ['Gram panchayat NOC', 'Hydro survey report', 'Contractor estimate'],
    story: ['In Sanawada the nearest safe water is 6 km away. Girls miss school to fetch it.', 'A 300-foot borewell with a solar pump and a 10,000-litre tank will give 310 families clean water at their doorstep.'],
    updates: [['5 hours ago', 'Drilling started. We hit water at 240 ft.']],
  },
  {
    id: 4, thumb: 'img/fx-schoolgirl.jpg', photo: PHOTO.school, pos: 'center', org: 'iqra', cat: 'education', zakat: true, featured: true, city: 'Malappuram, Kerala', days: 33,
    title: 'Sponsor school fees for 50 orphan girls', caption: '₹12,000 covers a full year',
    goal: 600000, raised: 133200, donors: 402,
    unit: [12000, 'year of school for one girl'],
    ben: { Beneficiary: '50 girls, Classes 5–12', School: 'Iqra Girls Academy', Covers: 'Fees, books, uniform, transport', Location: 'Malappuram' },
    docs: ['School fee structure', 'Student list (verified)', 'Trust registration'],
    story: ['All 50 girls have lost one or both parents. With fees paid they can stay in school instead of being sent to work.', 'Donors get a progress card for the girls they support every term.'],
    updates: [],
  },
  {
    id: 6, photo: PHOTO.hospital, pos: '85% center', org: 'me', cat: 'medical', zakat: true, city: 'Lucknow, Uttar Pradesh', days: 21,
    title: 'Help my father get a kidney transplant', caption: 'Surgery is scheduled for next month',
    goal: 600000, raised: 245000, donors: 318,
    unit: [2000, 'dialysis session'],
    ben: { Beneficiary: 'Rashid Khan, 58 yrs', Relation: 'Father of organiser', Hospital: 'SGPGI Lucknow', Location: 'Lucknow' },
    docs: ['Transplant cost estimate', 'Nephrologist letter', 'Organiser KYC'],
    story: ['My father Rashid has been on dialysis three times a week for a year. His brother is a matching donor and the surgery is set for next month.', 'We have arranged ₹2 lakh ourselves. Please help with the remaining amount.'],
    updates: [['6 days ago', 'Campaign verified by the Muslim Life Pro team.']],
  },
  {
    id: 5, thumb: 'img/fx-relief.jpg', photo: PHOTO.boy, pos: 'center 30%', org: 'ummeed', cat: 'emergency', zakat: true, city: 'Dhemaji, Assam', days: 4,
    title: 'Rebuild 40 homes after the Assam floods', caption: 'Families are living in relief camps',
    goal: 1200000, raised: 987000, donors: 3410,
    unit: [30000, 'home rebuilt'],
    ben: { Beneficiary: '40 families', Need: 'Bamboo-and-tin homes, plinth raising', Partner: 'Local panchayat', Location: 'Dhemaji' },
    docs: ['District relief list', 'Material quotation', 'Site photos'],
    story: ['The Brahmaputra floods destroyed 40 homes in two villages. Families are in a school relief camp.', 'Each ₹30,000 rebuilds one raised home that can survive the next monsoon.'],
    updates: [['Today', '12 homes complete. Families have moved back in.']],
  },
  {
    id: 9, thumb: 'img/fx-quran.jpg', photo: PHOTO.school, pos: '70% center', org: 'iqra', cat: 'food', zakat: true, city: 'Across India', days: 14,
    title: 'Daily meals for madrasa students', caption: '₹50 feeds a student for a day',
    goal: 350000, raised: 182600, donors: 2954,
    unit: [50, 'meal for a madrasa student'],
    ben: { Beneficiary: '1,200 students in 14 madrasas', Covers: 'Breakfast and lunch', Partner: 'Iqra Education Trust', Location: 'UP, Bihar, West Bengal' },
    docs: ['Madrasa list (verified)', 'Kitchen cost sheet', 'Trust 80G certificate'],
    story: ['Many madrasa students come from families that cannot send food with them. A warm meal keeps them in class and learning the Quran.', 'Your gift is pooled every week and spent on rations for the madrasa kitchens.'],
    updates: [['2 days ago', 'Rations delivered to 6 madrasas in Bahraich.']],
  },
  {
    id: 10, thumb: 'img/fx-widow.jpg', photo: PHOTO.family, pos: 'center', org: 'noor', cat: 'food', zakat: true, featured: true, city: 'Bhiwandi, Maharashtra', days: 18,
    title: 'Be a support for widowed sisters', caption: 'Ration and shelter for widows',
    goal: 150000, raised: 96400, donors: 412, unit: [1500, 'month of ration for one family'],
    ben: { Beneficiary: '120 widows and their children', Covers: 'Monthly ration, rent support', Partner: 'Al-Noor volunteers', Location: 'Bhiwandi' },
    docs: ['Widow list (verified)', 'Ration vendor quotation', 'NGO 80G certificate'],
    story: ['Many widows in Bhiwandi raise their children alone on daily wages. A monthly ration kit means one less worry.', 'Kits include atta, rice, dal, oil, sugar and milk powder, delivered to the home.'], updates: [['4 days ago', 'October kits delivered to 118 families.']],
  },
  {
    id: 11, thumb: 'img/fx-nikah.jpg', photo: PHOTO.school, pos: '30% center', org: 'iqra', cat: 'orphans', zakat: true, city: 'Lucknow, Uttar Pradesh', days: 22,
    title: 'Nikah support for adult orphan girls', caption: 'Only for daughters above 18',
    goal: 200000, raised: 143000, donors: 520, unit: [25000, 'nikah arrangement'],
    ben: { Beneficiary: '8 orphan daughters, all above 18', Covers: 'Simple nikah, essentials, no dowry', Partner: 'Local masjid committee', Location: 'Lucknow' },
    docs: ['Age proof (18+)', 'Guardian consent', 'Masjid committee letter'],
    story: ['Every daughter deserves a dignified, simple nikah. Families of these orphan girls cannot afford even the basics.', 'Funds cover the nikah gathering and household essentials. No dowry is paid.'], updates: [],
  },
  {
    id: 12, thumb: 'img/fx-winter.jpg', photo: PHOTO.water, pos: 'center', org: 'ummeed', cat: 'emergency', zakat: false, city: 'Delhi NCR', days: 12,
    title: 'Stand with your own in winter', caption: 'Blankets, jackets and socks',
    goal: 250000, raised: 181500, donors: 760, unit: [600, 'winter kit'],
    ben: { Beneficiary: '400 street families', Covers: 'Blankets, jackets, shoes, socks', Partner: 'Ummeed night teams', Location: 'Delhi NCR' },
    docs: ['Distribution plan', 'Vendor quotation'],
    story: ['When night temperatures drop to 4°C, families on footpaths need more than one thin blanket.', 'Each ₹600 kit has a blanket, jacket, socks and a cap.'], updates: [['Yesterday', 'First 150 kits handed out near Jama Masjid.']],
  },
  {
    id: 13, thumb: 'img/fx-doctor.jpg', photo: PHOTO.hospital, pos: '60% center', org: 'shifa', cat: 'medical', zakat: true, city: 'Hyderabad, Telangana', days: 15,
    title: 'Free eye check-ups and cataract surgery', caption: 'Give the gift of sight',
    goal: 150000, raised: 88500, donors: 372, unit: [3500, 'cataract surgery'],
    ben: { Beneficiary: 'Elderly patients from 9 villages', Covers: 'Check-ups, surgery, medicines', Hospital: 'Shifa Eye Centre', Location: 'Hyderabad' },
    docs: ['Hospital cost estimate', 'Camp permission'],
    story: ['Cataract is the most common cause of blindness among the elderly, and it is curable.', 'A ₹3,500 surgery gives a grandparent their sight back in one day.'], updates: [],
  },
  {
    id: 14, thumb: 'img/fx-legal.jpg', photo: PHOTO.boy, pos: 'center 30%', org: 'insaaf', cat: 'legal', zakat: true, city: 'Across India', days: 16,
    title: 'Free legal aid and help for bail', caption: 'A free advocate for those who cannot pay',
    goal: 100000, raised: 67300, donors: 310, unit: [2500, 'court hearing with a free advocate'],
    ben: { Beneficiary: 'Poor families facing court cases', Covers: 'Advocate fees, court costs, documents', Partner: 'Insaaf Legal Aid Cell', Location: 'Delhi, Lucknow, Mumbai' },
    docs: ['Advocate panel list', 'Bar Council registrations'],
    story: ['Many poor families cannot afford a lawyer, even for a simple bail hearing. The court decides bail; we make sure every person has a free advocate and proper legal advice.'], updates: [['1 week ago', '14 families given free advocates this month.']],
  },
  {
    id: 15, thumb: 'img/fx-madrasa.jpg', photo: PHOTO.school, pos: 'center', org: 'iqra', cat: 'masjid', zakat: true, featured: true, city: 'UP & Bihar', days: 40,
    title: 'Madrasa improvement campaign', caption: 'Better rooms, teachers and digital boards',
    goal: 500000, raised: 214000, donors: 603, unit: [15000, 'digital board for one classroom'],
    ben: { Beneficiary: '6 madrasas, 900 students', Covers: 'Classrooms, teachers, digital boards', Partner: 'Iqra Education Trust', Location: 'UP & Bihar' },
    docs: ['Madrasa list (verified)', 'Contractor estimate'],
    story: ['Madrasa students deserve the same good classrooms as any school. This campaign repairs rooms, trains teachers and adds digital boards.'], updates: [],
  },
  {
    id: 16, thumb: 'img/fx-children.jpg', photo: 'img/poster-dua.jpg', pos: 'center 62%', org: 'iqra', cat: 'food', zakat: true, city: 'Across India', days: 90,
    title: 'Dua program: food and gifts for 1 lakh children', caption: '₹200 per child: a meal and a gift',
    goal: 2000000, raised: 480000, donors: 1200, unit: [200, 'meal and gift for one child'],
    ben: { Beneficiary: '1,00,000 children in madrasas and orphanages', Covers: 'A meal (₹100) and a gift (₹100)', Partner: 'Iqra Education Trust', Location: 'Across India' },
    docs: ['Madrasa and orphanage list', 'Food vendor quotation'],
    story: ['A small gift can bring the dua of a child. This program gives one lakh children a good meal and a gift.', 'Your ₹200 covers one child. Photos from each distribution are shared in Updates.'], updates: [],
  },
  {
    id: 17, thumb: 'img/fx-schoolboy.jpg', photo: 'img/poster-school.jpg', pos: 'center 62%', org: 'iqra', cat: 'education', zakat: true, city: 'Delhi NCR', days: 45,
    title: 'School admission campaign: every child has the right to education', caption: '₹3,000 to ₹5,000 per child per year',
    goal: 3000000, raised: 870000, donors: 300, unit: [3000, 'year of school for one child'],
    ben: { Beneficiary: '300 children enrolled so far', Covers: 'Fees, books, uniform, essentials', School: 'New Future School', Location: 'Delhi NCR' },
    docs: ['School fee structure', 'Enrolment list (verified)'],
    story: ['Many children from poor families never get admission because of fees, books and uniforms.', 'Your support gives a child a full year at New Future School.'], updates: [],
  },
  {
    id: 7, photo: PHOTO.family, pos: 'center', org: 'noor', cat: 'food', zakat: false, done: true, city: 'Delhi', title: 'Winter blankets for 2,000 street families',
    goal: 600000, raised: 640000, donors: 2312, unit: [300, 'blanket'], ben: { Beneficiary: '2,000 families', Location: 'Delhi' }, docs: [], story: ['Thanks to you, 2,000 families received warm blankets before the cold wave.'], updates: [],
    util: [['Blankets (2,000 pcs)', 78], ['Transport & storage', 12], ['Distribution volunteers', 6], ['Platform & payment fees', 4]],
  },
  {
    id: 8, photo: PHOTO.boy, pos: 'center 25%', org: 'iqra', cat: 'orphans', zakat: true, done: true, city: 'Bengaluru', title: 'Eid gifts and new clothes for 300 orphans',
    goal: 300000, raised: 309500, donors: 1170, unit: [1000, 'Eid gift box'], ben: { Beneficiary: '300 children', Location: 'Bengaluru' }, docs: [], story: ['Every child at three orphanages received new Eid clothes and a gift box.'], updates: [],
    util: [['Clothes & shoes', 64], ['Gift boxes', 24], ['Eid lunch', 8], ['Platform & payment fees', 4]],
  },
];
const COMMENTS = { 1: [['Zoya S.', '2h', 'Praying for Ayaan’s quick recovery. Ameen.'], ['Farhan A.', '1d', 'Shared with my office group.']], 2: [['Nida K.', '5h', 'May Allah accept from all of us.']] };
const NAMES = ['Mohammed Faisal', 'Sana Qureshi', 'Abdul Rahman', 'Zoya Siddiqui', 'Anonymous donor', 'Farhan Ali', 'Rukhsar Bano', 'Yusuf Patel', 'Nida Khan', 'Arif Hussain'];
const AV_HUES = [212, 150, 24, 262, 330, 188, 38, 230];
const avHue = s => AV_HUES[[...s].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AV_HUES.length];
const initials = s => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avatar = (name, cls = '') => `<div class="av ${cls}" style="background:hsl(${avHue(name)} 45% 93%);color:hsl(${avHue(name)} 45% 30%)">${esc(initials(name))}</div>`;

const LEAGUES = [
  { name: 'Seedling', icon: 'sprout', g: ['#7be0a8', '#0a9b3c'] },
  { name: 'Crescent', icon: 'moon', g: ['#7fc4ff', '#2a5bd7'] },
  { name: 'Lantern', icon: 'star', g: ['#ffd36b', '#e07b12'] },
  { name: 'Oasis', icon: 'droplet', g: ['#c9a2ff', '#6d3fd1'] },
];
const ACHIEVEMENTS = [['First Sadaqah', 'heart'], ['Ramadan Giver', 'moon'], ['7-day streak', 'flame'], ['Zakat paid', 'star'], ['Inspirer', 'users'], ['Fundraiser', 'sprout'], ['Water bearer', 'droplet'], ['Early supporter', 'clock']];

// past donations of the demo user; one failed so the history shows both states
const BASE_DONATIONS = [
  { cid: 9, amount: 500, type: 'Sadaqah', pay: 'upi', date: '15 Sep 2026', txn: 'pay_MLP7F31A', status: 'success' },
  { cid: 1, amount: 300, type: 'Sadaqah', pay: 'card', date: '13 Oct 2026', txn: 'pay_MLP7F99C', status: 'success' },
  { cid: 2, amount: 1000, type: 'Zakat', pay: 'upi', date: '19 Oct 2026', txn: 'pay_MLP80A12', status: 'failed' },
];
// permanent member badge by total confirmed giving (never removed)
const TIERS = [['Visitor', 0, ['#d5dae3', '#7f8899'], 'user'], ['Starter', 1000, ['#8fe8b2', '#169a52'], 'sprout'], ['Supporter', 5000, ['#7fe0dc', '#0d8a88'], 'heart'], ['Silver', 10000, ['#f1f4f8', '#8d97a8'], 'star'], ['Gold', 25000, ['#ffe28f', '#cf940c'], 'star'], ['Platinum', 50000, ['#cfe0f4', '#4d73a3'], 'shield'], ['Diamond', 100000, ['#a8ecff', '#1592d0'], 'gem'], ['Royal Crown', 200000, ['#e2c4ff', '#7536cf'], 'crown']];
const tierOf = total => { const i = TIERS.filter(([, min]) => total >= min).length - 1; return { i, name: TIERS[i][0], color: TIERS[i][2][1], next: TIERS[i + 1] }; };
console.assert(tierOf(800).name === 'Visitor' && tierOf(800).next[0] === 'Starter' && tierOf(1000).name === 'Starter' && tierOf(250000).next === undefined, 'tierOf');

/* ---------- state ---------- */
const S = {
  user: { name: 'Ayesha Khan', first: 'Ayesha', email: 'ayesha.khan@mail.com' },
  saved: new Set([2]), liked: new Set(),
  points: 0, donated: 0, donations: [], streak: false, last: null,
  theme: 'classic', userTheme: null, adminTheme: 'classic', themeLocked: false,
  votes: {}, plan: 'basic', roses: 0, wallet: 500, posts: [], likedPosts: new Set(), compose: { txt: '', file: '', kind: '', promo: false },
  bookings: [], helpReqs: [], profileBadge: null, joins: [], look: { btn: 'classic', text: 'm', saver: false },
  ui: { vote: 'live', pollSel: {}, extra: 1, help: 'legal', lawyerQ: '', home: 'all', cat: 'all', comp: 'done', rate: 'league', rateSub: 'donors', news: 'news', dTab: 'story', q: '', sort: 'urgent', zakatOnly: false },
  login: { stage: 'details', role: 'donor', name: '', email: '', phone: '', err: {}, lang: 'en', interests: ['zakat', 'education'] },
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
const allDonations = () => [...S.donations.map(d => ({ ...d, status: 'success' })), ...BASE_DONATIONS];
const confirmed = () => allDonations().filter(d => d.status === 'success');
const totalGiven = () => confirmed().reduce((a, d) => a + d.amount, 0);
const withdrawn = () => S.withdrawals.reduce((a, w) => a + w.amt, 0);


/* ---------- themes ---------- */
// every colour in app.css reads these tokens, so a theme is just a token set
const BASE_TOKENS = { brand: '#0b5d3b', 'brand-2': '#3faf7f', 'brand-3': '#0e6e47', 'brand-ink': '#0a4d31', 'brand-soft': '#e3f1ea', gold: '#c9a227', 'gold-soft': '#fbf3dc', 'gold-ink': '#6e5410', ink: '#14201a', 'ink-2': '#38463f', muted: '#84918a', line: '#e3e9e5', bg: '#f1f4f2', card: '#ffffff', chip: '#e6ece9', soft: '#eef4f1', 'soft-line': '#c5d3cb', page: '#d7e0db', 'on-brand': '#ffffff', 'hero-1': '#1a7f55', 'hero-2': '#0b5d3b', 'hero-ink': '#ffffff', 'card-shadow': 'none' };
const DARK = { 'gold-soft': '#2c2716', 'gold-ink': '#f1d58b', ink: '#f2f2f5', 'ink-2': '#cfd0d8', muted: '#8f93a3', 'on-brand': '#14110a' };
const T = (id, name, hi, desc, icon, dark, c, banner) => ({ id, name, hi, desc, icon, dark, banner, c: { ...BASE_TOKENS, ...(dark ? DARK : {}), 'hero-1': c['brand-2'] || BASE_TOKENS['brand-2'], 'hero-2': c['brand-3'] || BASE_TOKENS['brand-3'], 'hero-ink': c['on-brand'] || (dark ? DARK['on-brand'] : '#ffffff'), ...c, raised: c.brand || BASE_TOKENS.brand } });
const THEMES = [
  T('classic', 'Classic Green', 'हरा-भरा', 'Foundation green with gold', 'sprout', false, { bg: '#ffffff', page: '#ffffff', 'hero-1': '#1a7f55', 'hero-2': '#0b5d3b', 'card-shadow': '0 2px 16px rgb(16 40 28 / 0.08)' }),
  T('ocean', 'Ocean Teal', 'समंदर', 'Calm teal and sky blue', 'droplet', false, { brand: '#0e8f9e', 'brand-2': '#5fd3e0', 'brand-3': '#149fb0', 'brand-ink': '#0b6f7a', 'brand-soft': '#dff4f6', bg: '#eef4f6', chip: '#e2eaee', soft: '#eef5f7', line: '#e3ebee', 'soft-line': '#c2d3d8', page: '#d5e1e5' }),
  T('iznik', 'Iznik Blue', 'इज़निक', 'Tile blue with turquoise', 'globe', false, { brand: '#1f4fbf', 'brand-2': '#46c6d8', 'brand-3': '#2f6fe0', 'brand-ink': '#183f99', 'brand-soft': '#e3ebfc', bg: '#f0f3fa', chip: '#e3e8f3', soft: '#eef2fb', line: '#e4e8f2', 'soft-line': '#c3cde3', page: '#d7deee' }),
  T('sandstone', 'Sandstone', 'रेगिस्तान', 'Warm sand and saffron', 'sun', false, { brand: '#c26a12', 'brand-2': '#f2b54a', 'brand-3': '#d9821c', 'brand-ink': '#8f4c06', 'brand-soft': '#fbeedb', bg: '#f6f1e8', card: '#fffdf9', chip: '#ece4d6', soft: '#f7f0e4', line: '#ece3d4', 'soft-line': '#d6c8b0', page: '#e3d9c7', ink: '#2a2118', 'ink-2': '#4a3f33', muted: '#8d8170' }),
  T('gulab', 'Gulab Rose', 'गुलाब', 'Soft rose and plum', 'heart', false, { brand: '#c2306a', 'brand-2': '#f58bb1', 'brand-3': '#d9467f', 'brand-ink': '#962252', 'brand-soft': '#fbe4ee', bg: '#f8f1f4', chip: '#efe3e9', soft: '#faf0f4', line: '#efe4ea', 'soft-line': '#dbc4cf', page: '#e8d8e0' }),
  T('eid', 'Eid Mubarak', 'ईद मुबारक', 'Royal purple with gold', 'gift', false, { brand: '#6b3fc4', 'brand-2': '#b48cf2', 'brand-3': '#7d4fe0', 'brand-ink': '#52299e', 'brand-soft': '#eee6fc', gold: '#e2a72b', bg: '#f3f0fa', chip: '#e7e1f4', soft: '#f3effb', line: '#e8e3f3', 'soft-line': '#cdc3e3', page: '#ddd5ee' },
    { icon: 'gift', title: 'Eid Mubarak!', sub: 'Share the joy. Gift Eid clothes to an orphan today.', cta: 'Gift Eid', act: 'svcOrphans' }),
  T('jumma', 'Jumma Mubarak', 'जुम्मा मुबारक', 'White, green and Friday gold', 'mosque', false, { brand: '#0f7a4a', 'brand-2': '#4fd1a0', 'brand-3': '#14915a', 'brand-ink': '#0b5c38', 'brand-soft': '#e2f5ec', gold: '#d4a017', bg: '#f2f6f3', chip: '#e4ece7', soft: '#eef5f0', line: '#e2eae5', 'soft-line': '#c5d6cc', page: '#d6e2db' },
    { icon: 'mosque', title: 'Jumma Mubarak', sub: 'Friday is a blessed day for Sadaqah. Give a meal today.', cta: 'Give now', act: 'svcFood' }),
  T('hajj', 'Hajj', 'हज', 'Black, white and Kaaba gold', 'globe', false, { brand: '#1b1b1f', 'brand-2': '#c9a227', 'brand-3': '#2b2b30', 'brand-ink': '#1b1b1f', 'brand-soft': '#f3eedd', gold: '#c9a227', bg: '#f6f4ef', chip: '#ebe7dd', soft: '#f4f1e8', line: '#e8e3d6', 'soft-line': '#d3cab3', page: '#e2ddd0', 'hero-1': '#2b2b30', 'hero-2': '#0e0e10', 'hero-ink': '#f3d27a' },
    { icon: 'globe', title: 'Hajj Mubarak', sub: 'Remember the pilgrims in your dua and share Qurbani with the needy.', cta: 'Book Qurbani', act: 'qurbani' }),
  T('night', 'Night Green', 'रात', 'Classic green, dark', 'moon', true, { brand: '#3fbf7f', 'brand-2': '#6fdca6', 'brand-3': '#2fa86c', 'brand-ink': '#8fe6b9', 'brand-soft': '#163a2a', gold: '#e2b85c', line: '#1e3329', bg: '#0b1612', card: '#13221c', chip: '#1b2e25', soft: '#172a21', 'soft-line': '#2f4a3d', page: '#060d0a', 'on-brand': '#062417', 'hero-1': '#145a3c', 'hero-2': '#0b1612', 'hero-ink': '#ffffff', 'card-shadow': 'none' }),
  T('royal', 'Royal Gold', 'शाही सुनहरा', 'Black & gold, timeless', 'crown', true, { brand: '#d4a72c', 'brand-2': '#f3d27a', 'brand-3': '#c9971f', 'brand-ink': '#f3d27a', 'brand-soft': '#2e2717', gold: '#e9c46a', ink: '#f4efe2', 'ink-2': '#d6cfbd', muted: '#9a927f', line: '#2a2721', bg: '#0e0d0b', card: '#1a1814', chip: '#25221c', soft: '#221f19', 'soft-line': '#3d382d', page: '#050504' , 'hero-1': '#2b2414', 'hero-2': '#0e0d0b', 'hero-ink': '#f3d27a' }),
  T('ramzan', 'Ramzan', 'रमज़ान मुबारक', 'Emerald nights, golden lanterns', 'moon', true, { brand: '#e2b85c', 'brand-2': '#f3d58f', 'brand-3': '#c99a3a', 'brand-ink': '#f0d28a', 'brand-soft': '#1f3a2a', gold: '#e2b85c', 'gold-soft': '#26372a', 'gold-ink': '#f0d28a', ink: '#f1f6f2', 'ink-2': '#c9dbd1', muted: '#8eaa9d', line: '#1c3d31', bg: '#06191a', card: '#0b2620', chip: '#123329', soft: '#0f2e25', 'soft-line': '#2c5345', page: '#020c0a', 'on-brand': '#1b1506', 'hero-1': '#0f4a37', 'hero-2': '#06231b', 'hero-ink': '#f3d58f' },
    { icon: 'moon', title: 'Ramzan Mubarak', sub: 'Feed a fasting person tonight. ₹100 gives one iftar.', cta: 'Give iftar', act: 'svcFood', deco: 'lantern' }),
  T('diwali', 'Diwali', 'शुभ दीपावली', 'Diyas, marigold & sparkle', 'flame', true, { brand: '#f59e0b', 'brand-2': '#fbbf24', 'brand-3': '#f08a0b', 'brand-ink': '#fcd38a', 'brand-soft': '#3a1d14', gold: '#fbbf24', 'gold-soft': '#3a2412', 'gold-ink': '#fcd38a', ink: '#fbeee6', 'ink-2': '#e3cbbf', muted: '#a98b80', line: '#3a1f1c', bg: '#1a0b0b', card: '#261111', chip: '#331816', soft: '#2e1513', 'soft-line': '#533028', page: '#0d0505', 'on-brand': '#2a1103' , 'hero-1': '#4a1a12', 'hero-2': '#1a0b0b', 'hero-ink': '#fcd38a' },
    { icon: 'flame', title: 'Shubh Deepavali', sub: 'Light a diya of hope. Gift a family a festive meal.', cta: 'Gift a meal', act: 'svcFood', deco: 'diya' }),
];
// the foundation's own theme catalogue: [name, subtitle, category, dark, primary, secondary, accent]
const CLIENT_THEMES = [["Foundation: Night","Golden Glow","l",1,"#052E1F","#0F7A52","#E0C36A"],["Shab-e-Qadr","Night of Light","m",1,"#0B2A2A","#14665F","#E0C36A"],["Masjid-e-Nabawi","Green Dome","s",0,"#0F5A44","#3DAA84","#E9CE7A"]];
const hx = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const mixC = (a, b, p) => '#' + hx(a).map((v, i) => Math.round(v * p + hx(b)[i] * (1 - p)).toString(16).padStart(2, '0')).join('');
const lumC = c => { const [r, g, b] = hx(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const fitC = c => { let n = 0; while (lumC(c) > .16 && n++ < 12) c = mixC(c, '#000000', .85); return c; };
CLIENT_THEMES.forEach(([name, sub, , dark, a, g, acc], i) => {
  const t = dark
    ? T('c' + i, name, '', sub, 'palette', true, { brand: acc, 'brand-2': g, 'brand-3': acc, 'brand-ink': mixC(acc, '#ffffff', .8), 'brand-soft': mixC(g, '#000000', .35), gold: acc, 'gold-soft': mixC(acc, '#000000', .2), 'gold-ink': mixC(acc, '#ffffff', .75), line: mixC(g, a, .25), bg: mixC(a, '#000000', .55), card: mixC(a, '#000000', .85), chip: mixC(g, a, .2), soft: mixC(g, a, .14), 'soft-line': mixC(g, a, .4), page: mixC(a, '#000000', .3), 'on-brand': lumC(acc) > .35 ? '#1a1406' : '#ffffff', 'hero-1': g, 'hero-2': a, 'hero-ink': acc, 'card-shadow': 'none' })
    : T('c' + i, name, '', sub, 'palette', false, { brand: fitC(a), 'brand-2': g, 'brand-3': fitC(a), 'brand-ink': mixC(fitC(a), '#000000', .8), 'brand-soft': mixC(a, '#ffffff', .1), gold: acc, line: mixC(a, '#ffffff', .1), bg: mixC(a, '#ffffff', .035), chip: mixC(a, '#ffffff', .08), soft: mixC(a, '#ffffff', .05), 'soft-line': mixC(a, '#ffffff', .25), page: mixC(a, '#ffffff', .15), 'hero-1': g, 'hero-2': fitC(a) });
  THEMES.push(t);
});
const theme = () => THEMES.find(t => t.id === S.theme) || THEMES[0];
function applyTheme(id) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  S.theme = t.id;
  const el = document.getElementById('theme-vars') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'theme-vars' }));
  el.textContent = `:root{${Object.entries(t.c).map(([k, v]) => `--${k}:${v}`).join(';')};color-scheme:${t.dark ? 'dark' : 'light'}}`;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.c.card);
}
// called by the admin panel: the organisation's default theme, and whether people may pick their own
const themeFor = () => { const t = THEMES.find(x => x.id === S.adminTheme) || THEMES[0]; return S.mode === 'dark' && !t.dark ? 'night' : t.id; }; // a dark theme the admin picks applies to everyone
// called by the admin panel
window.adminTheme = id => { S.adminTheme = id; applyTheme(themeFor()); rerender(); };
window.adminLook = look => { Object.assign(S.look, look); applyLook(); rerender(); };
window.adminQuick = list => { QUICK.splice(0, QUICK.length, ...list); rerender(); };
window.adminHadith = list => { HADITH.splice(0, HADITH.length, ...list); S.ui.hq = 0; rerender(); };
const themeCard = (t, on, locked) => `<button class="theme-card ${on ? 'on' : ''}" ${locked ? 'disabled' : `data-act="pickTheme" data-v="${t.id}"`} style="background:${t.c.card};border-color:${on ? t.c.brand : t.c.line};color:${t.c.ink}">
  <span class="th-ic" style="background:${t.c['brand-soft']};color:${t.c.brand}">${t.id === 'royal' || t.id === 'classic' ? emblem() : ic(t.icon)}</span>
  <span class="th-txt"><b>${t.name}</b><span style="color:${t.c.muted}"><span lang="hi">${t.hi}</span> · ${t.desc}</span>
  <span class="th-dots">${[t.c.bg, t.c.card, t.c.brand, t.c.gold, t.c['brand-2']].map(x => `<i style="background:${x}"></i>`).join('')}</span></span>
  <span class="th-radio" style="border-color:${on ? t.c.brand : t.c['soft-line']}">${on ? `<i style="background:${t.c.brand}"></i>` : ''}</span></button>`;
const DECO = {
  lantern: '<svg class="season-deco" viewBox="0 0 60 90" aria-hidden="true"><path d="M30 0v14" stroke="currentColor" stroke-width="1.5"/><path d="M22 18h16l-3-4H25Z" fill="currentColor"/><path d="M20 22h20l4 10v26l-4 10H20l-4-10V32Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M30 22v46M16 32h28M16 58h28" stroke="currentColor" stroke-width="1.2" opacity=".6"/><ellipse cx="30" cy="45" rx="5" ry="8" fill="currentColor" opacity=".45"/><path d="M24 68h12l-2 6h-8Z" fill="currentColor"/><path d="M30 74v8" stroke="currentColor" stroke-width="1.5"/></svg>',
  diya: '<svg class="season-deco" viewBox="0 0 70 60" aria-hidden="true"><path d="M35 6c-4 7-6 11-6 15a6 6 0 0 0 12 0c0-4-2-8-6-15Z" fill="currentColor"/><path d="M6 32h58c-2 13-14 22-29 22S8 45 6 32Z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M14 38c6 4 13 6 21 6s15-2 21-6" stroke="currentColor" stroke-width="1.4" opacity=".6" fill="none"/></svg>',
};
const seasonCard = () => { const b = theme().banner; return b ? `<div class="season-card">${sparkles([[44, 18, 9, 0], [58, 70, 7, 1.3], [72, 30, 6, .7]])}${b.deco ? DECO[b.deco] : ''}<span class="season-ic">${ic(b.icon)}</span><span class="season-txt"><b>${b.title}</b><span>${b.sub}</span></span><button class="btn btn-main" data-act="${b.act}">${b.cta}</button></div>` : ''; };

/* ---------- shared pieces ---------- */
const thumb = (c, photo = c.photo) => photo ? `<div class="thumb" style="background:url('${photo}') center/cover"></div>` : `<div class="thumb plain">${ic(CATS[c.cat].icon)}</div>`;
function cover(c, opts = {}) {
  const cat = CATS[c.cat];
  const photo = opts.photo || c.photo;
  const bg = photo ? `background-image:url('${photo}');background-position:${c.pos || 'center'}` : 'background:#2b3a33';
  const org = ORGS[c.org];
  return `<div class="cover ${opts.cls || ''}" style="${bg}">
    ${photo ? '' : `<div class="pattern"></div><div class="glow"></div><div class="art">${ic(cat.icon)}</div><div class="caption">${esc(c.caption || cat.label)}</div>`}
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
      <div class="actions"><button class="btn btn-soft btn-round" data-act="share" data-id="${c.id}" aria-label="Share">${ic('share')}</button><button class="btn btn-gray grow" data-go="#/c/${c.id}">${ic('check')} Campaign completed</button></div>
      <h3 class="card-title" data-go="#/c/${c.id}">${esc(c.title)}</h3>
      <div class="money"><span><b class="raised num">${inr(c.raised)}</b> <span class="of">raised from ${c.donors.toLocaleString('en-IN')} donors</span></span><span class="pct num">Goal met</span></div>
    </div>
    <div class="card-foot"><span class="stat">${ic('msg')} ${(COMMENTS[c.id] || []).length}</span><button class="link" data-go="#/c/${c.id}/comments">Leave a comment ${ic('right')}</button></div>
  </article>`;
  return `<article class="card">
    <div data-go="#/c/${c.id}">${cover(c, { dots: true })}</div>
    <div class="card-body">
      <div class="actions"><button class="btn btn-soft grow" data-act="share" data-id="${c.id}">${ic('share')} Share</button><button class="btn btn-main" style="flex:1.6" data-go="#/donate/${c.id}">Donate</button></div>
      <h3 class="card-title" data-go="#/c/${c.id}">${esc(c.title)}</h3>
      <div class="bar"><i style="width:${pct(c)}%"></i></div>
      <div class="money"><span><b class="raised num">${inr(c.raised)}</b> <span class="of">raised of ${inr(c.goal)}</span></span><span class="pct num">${pct(c)}%</span></div>
    </div>
    <div class="card-foot"><span class="stat">${ic('users')} ${c.donors.toLocaleString('en-IN')}</span><span class="vr"></span><span class="stat">${ic('msg')} ${(COMMENTS[c.id] || []).length}</span><span class="stat ${c.days <= 5 ? 'late' : ''}">${ic('clock')} ${c.days}d</span><button class="link" data-go="#/c/${c.id}/comments">Comment ${ic('right')}</button></div>
  </article>`;
}

// glossy hex badge: tier gradient, inner bevel, top shine and the tier's own icon
const tierBadge = (i, size = 44) => { const [, , [lt, dk], icon] = TIERS[i]; const id = `tb${i}`; return `<svg class="tier-badge" viewBox="0 0 48 52" width="${size}" height="${size * 52 / 48}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset="1" stop-color="${dk}"/></linearGradient><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="M24 1.5 45 13.5v25L24 50.5 3 38.5v-25Z" fill="url(#${id})" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 7 40 16.2v19.6L24 45 8 35.8V16.2Z" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/><path d="M24 7 40 16.2v6.3C34 19.5 14 19.5 8 22.5v-6.3Z" fill="url(#${id}s)"/><g transform="translate(13.2 15) scale(.9)" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${P[icon]}</g></svg>`; };
const tierProgress = t => { const tr = tierOf(t); return tr.next ? Math.round((t - TIERS[tr.i][1]) / (tr.next[1] - TIERS[tr.i][1]) * 100) : 100; };
const tierStrip = () => { const t = totalGiven(), tr = tierOf(t); return `<button class="tier-strip" data-go="#/donations"><span class="ts-badge" style="--tc:${TIERS[tr.i][2][0]}">${tierBadge(tr.i, 44)}</span><span class="ts-body"><span class="eyebrow">${tr.name} member</span><b class="num">${inr(t)} <span>donated</span></b><span class="bar"><i style="width:${tierProgress(t)}%"></i></span><span class="ts-next">${tr.next ? `${inr(tr.next[1] - t)} more to reach <b>${tr.next[0]}</b>` : 'Highest badge reached'}</span></span>${ic('right')}</button>`; };
const creatorNudge = () => S.creator ? '' : `<button class="creator-nudge" data-go="#/creator"><span class="cn-ic">${ic('megaphone')}</span><span><b>Share good, earn halal</b><span>Join as a creator and get your own promo code.</span></span>${ic('right')}</button>`;

function header(seg) {
  return `<header class="top">
    <div class="top-row">
      <div class="logo">${LOGO}${APP}</div>
      <span class="spacer"></span>
      <div class="hbtns">
        <button class="hbtn" data-go="#/start" aria-label="Start a fundraiser">${ic('plus')}</button>
        <button class="hbtn" data-go="#/news" aria-label="News and notifications">${ic('bell')}${S.notifs.some(n => n.unread) ? '<span class="dot-badge"></span>' : ''}</button>
        <button class="hbtn" data-go="#/search" aria-label="Search">${ic('search')}</button>
      </div>
    </div>
    ${seg || ''}
  </header>`;
}
const seg = (key, opts) => `<div class="seg" role="tablist">${opts.map(([v, l]) => `<button role="tab" class="${S.ui[key] === v ? 'on' : ''}" data-act="ui" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
const pageHead = (title, right = '') => `<header class="phead"><button class="icon-btn" data-act="back" aria-label="Back">${ic('left')}</button><h1>${title}</h1>${right}</header>`;

function navBar(cur) {
  const tabs = [['home', 'Home'], ['vote', 'Vote'], ['donations', 'Donate'], ['community', 'Community'], ['profile', 'Profile']];
  return `<nav class="nav fixed-col">${tabs.map(([k, l]) => k === 'donations' ? `<a href="#/donations" data-go="#/donations" class="nav-fab ${cur === k ? 'on' : ''}"><span class="fab">${ic('hands')}</span>${l}</a>` : `<a href="#/${k === 'community' ? 'stories' : k}" data-go="#/${k === 'community' ? 'stories' : k}" class="${cur === k ? 'on' : ''}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true">${NAV_ICONS[k]}</svg>${l}</a>`).join('')}</nav>`;
}

/* ---------- tab views ---------- */
const V = {};

const secTitle = (t, sub, right = '') => `<div class="sec-title"><h2>${t}</h2>${sub ? `<span lang="hi">${sub}</span>` : ''}${right ? `<span class="spacer"></span>${right}` : ''}</div>`;
const hijri = () => { try { return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); } catch { return ''; } };

// Zakat: 2.5% of zakatable wealth held above the nisab
// shortcut: fixed silver nisab; fetch the live silver price before going to production
const NISAB = 52000;
const zakatDue = net => (net >= NISAB ? Math.round(net * 0.025) : 0);
console.assert(zakatDue(100000) === 2500 && zakatDue(NISAB - 1) === 0, 'zakatDue');

const SERVICES = [
  ['calc', 'Zakat', 'zakatCalc'], ['star', 'Pay Zakat', 'svcZakat'], ['mosque', 'Sadaqah Jariyah', 'svcJariyah'], ['utensils', 'Iftar & food', 'svcFood'],
  ['baby', 'Orphan care', 'svcOrphans'], ['hands', 'Fidya & Kaffarah', 'fidya'], ['calendar', 'Qurbani', 'qurbani'], ['plus', 'Start fundraiser', 'svcStart'],
];
const QUICK = [
  { title: 'Feed a madrasa child', hi: 'बच्चों के लिए भोजन', head: 'Dua karein, aur karein donation', text: 'Your dua and a small gift give a meal to children studying in our madrasas.', photo: PHOTO.school, amounts: [10, 20, 50, 100], cid: 9 },
  { title: 'Iftar for a fasting family', hi: 'रोज़ेदार परिवार के लिए इफ़्तार', head: 'Share the reward of their fast', text: 'Every iftar you give carries the reward of the fast it opens.', photo: 'img/fx-ration.jpg', amounts: [100, 250, 500, 1000], cid: 2 },
];
const quickCard = (q, i) => `<div class="dua"><div class="dua-photo" style="background-image:url('${q.photo}')"></div><div class="dua-head"><div><h3>${esc(q.head)}</h3><p>${esc(q.text)}</p></div>${ic('bowl')}</div>
  <div class="dua-amts">${q.amounts.map(a => `<button data-act="quickGive" data-c="${q.cid}" data-v="${a}">₹${a.toLocaleString('en-IN')}</button>`).join('')}</div></div>`;
const duaBlock = () => QUICK.length ? `<section class="home-sec">${secTitle(esc(QUICK.length === 1 ? QUICK[0].title : 'Give in one tap'), QUICK.length === 1 ? QUICK[0].hi : 'एक टैप में दान')}
  ${QUICK.length === 1 ? quickCard(QUICK[0], 0) : `<div class="hscroll quick-row">${QUICK.map((q, i) => `<div class="quick-item"><b class="qi-title">${esc(q.title)}</b>${quickCard(q, i)}</div>`).join('')}</div>`}</section>` : '';
const HADITH = [
  ['The best of people are those who are most beneficial to people.', 'Hadith, al-Mu‘jam al-Awsat'],
  ['Charity does not decrease wealth.', 'Hadith, Sahih Muslim 2588'],
  ['Protect yourself from the Fire, even with half a date given in charity.', 'Hadith, Sahih al-Bukhari 1417'],
  ['Those who spend their wealth in the way of Allah are like a seed that grows seven ears, in each ear a hundred grains.', 'Quran, Al-Baqarah 2:261'],
  ['The believer’s shade on the Day of Resurrection will be his charity.', 'Hadith, Musnad Ahmad'],
];
const todayHadith = () => HADITH[Math.floor(Date.now() / 864e5) % HADITH.length];
const hadithBlock = () => { if (!HADITH.length) return ''; const n = HADITH.length, i = ((S.ui.hq ?? Math.floor(Date.now() / 864e5) % n) % n + n) % n, [q, src] = HADITH[i];
  return `<section class="home-sec"><article class="khaas2">
    <div class="k2-head"><span class="k2-av">${emblem()}</span><span class="k2-id"><b>Aaj ki khaas baat</b><span>${esc(src)}</span></span><span class="k2-count num">${i + 1}/${n}</span></div>
    <p class="k2-q">${esc(q)}</p>
    <div class="k2-foot"><a href="https://wa.me/?text=${encodeURIComponent(`“${q}” — ${src}\nShared from ${APP}`)}" target="_blank" rel="noopener" aria-label="Share">${ic('share')}</a><button data-act="copy" data-v="${esc(`“${q}” — ${src}`)}" aria-label="Copy">${ic('link')}</button><span class="spacer"></span><button data-act="hq" data-v="-1" aria-label="Previous">${ic('left')}</button><button data-act="hq" data-v="1" aria-label="Next">${ic('right')}</button></div>
  </article></section>`; };
const MEMBERS = [['Ayesha Khan', 'Diamond'], ['Rizwan Ahmed', 'Gold'], ['Fatima Noor', 'Platinum'], ['Imran Shaikh', 'Silver'], ['Zahra Ali', 'Royal Crown'], ['Bilal Qureshi', 'Starter'], ['Mariam Siddiqui', 'Supporter']];
const membersBlock = () => `<section class="home-sec">${secTitle('Active members', '', `<button class="text-link small" data-go="#/rating">Leaderboard ${ic('right')}</button>`)}
  <div class="members">${MEMBERS.map(([n, l], i) => `<div class="member"><span class="mav">${avatar(n)}${i % 3 !== 2 ? '<i></i>' : ''}</span><b>${esc(n.split(' ')[0])}</b><span>${l}</span></div>`).join('')}</div></section>`;

const DONOR_ID = 'MLP-104582';
// the foundation's animated banner loops behind the two main actions
const heroBlock = () => `<section class="banner-card"><video src="img/banner.mp4" poster="img/banner-poster.jpg" autoplay muted loop playsinline preload="auto" aria-label="Service, Education, Justice: Education Foundation, Muslim Law Foundation"></video>
  <div class="banner-actions"><button class="btn btn-main" data-go="#/campaigns">${ic('heart')} Donate</button><button class="btn banner-ghost" data-go="#/help">Ask for help</button></div></section>`;
const HOME_SERVICES = [['scale', 'Legal aid', '#2f3fa8', 'go:#/help'], ['school', 'School', '#4338ca', 'cat:education'], ['mosque', 'Madrasa upgrade', '#0b7a4c', 'camp:15'], ['ring', 'Nikah support', '#b0461f', 'camp:11'], ['pulse', 'Treatment', '#1d7cc4', 'cat:medical'], ['eye', 'Eye surgery', '#0e8fa6', 'camp:13'], ['utensils', 'Ration', '#c2410c', 'camp:10'], ['snow', 'Winter relief', '#2563eb', 'camp:12'], ['book', 'Education', '#6d28d9', 'cat:education'], ['buoy', 'Disaster relief', '#c33838', 'cat:emergency'], ['calc', 'Zakat calculator', '#0a9b3c', 'act:zakatCalc'], ['calendar', 'Qurbani', '#a16207', 'act:qurbani']];
const servicesBlock = () => `<section class="home-sec">${secTitle('Our services', 'हमारी सेवाएँ')}<div class="svc-grid2">${HOME_SERVICES.map(([i, l, c, a]) => `<button class="svc2" data-act="svc" data-v="${a}" style="--sc:${c}"><i>${ic(i)}</i><span>${l}</span></button>`).join('')}</div></section>`;
const evCard = c => `<div class="ev"><div class="ev-photo" data-go="#/c/${c.id}" style="background-image:url('${c.thumb || c.photo}')"><span>${c.days} days left</span></div>
  <div class="ev-main" data-go="#/c/${c.id}"><span class="ev-tag">${CATS[c.cat].label}</span><b>${esc(c.title)}</b><p>${esc(c.caption)}</p></div>
  <div class="ev-foot"><span class="bar"><i style="width:${pct(c)}%"></i></span><span class="ev-nums"><span><b class="num">${inr(c.raised)}</b> raised</span><span class="num">${pct(c)}% of ${inr(c.goal)}</span></span><button class="btn btn-main" data-go="#/donate/${c.id}">Donate</button></div></div>`;
const eventsBlock = () => { const want = S.user.interests || [], score = c => (want.includes(c.cat) || (c.zakat && want.includes('zakat')) ? 1 : 0), A = active().filter(c => c.thumb).sort((a, b) => score(b) - score(a)); return `<section class="home-sec">${secTitle('Fundraiser events', '', `<button class="text-link small" data-go="#/campaigns">See all ${ic('right')}</button>`)}
  <div class="ev-track" id="ev-track">${A.map(evCard).join('')}</div><div class="ev-dots" id="ev-dots">${A.map((c, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></section>`; };
const POSTERS = [[16, 'img/poster-dua.jpg', 'Dua program: food and gifts for 1 lakh children'], [17, 'img/poster-school.jpg', 'School admission campaign']];
const postersBlock = () => `<section class="home-sec">${secTitle('Featured campaigns')}<div class="hscroll posters2">${POSTERS.map(([id, src, alt]) => `<button class="poster2" data-go="#/c/${id}"><img src="${src}" alt="${esc(alt)}" loading="lazy"></button>`).join('')}</div></section>`;
const trophyBlock = () => { const cr = S.creator, joined = cr ? S.joins.filter(j => j.code === cr.code).length : 0, lv = Math.floor(joined / 500), next = Math.min(lv + 1, 8);
  return `<section class="home-sec">${secTitle('Trophy & referral', '', `<button class="text-link small" data-go="#/creator">View all ${ic('right')}</button>`)}
  <button class="trophy-card" data-go="#/creator"><span class="tc-art">${trophyArt(next, 58)}</span><span class="tc-body"><b>${trophyName(next)} trophy</b><span class="muted small">When ${(next * 500).toLocaleString('en-IN')} people join with your code</span><span class="bar"><i style="width:${(joined % 500) / 5}%"></i></span><span class="tc-cta">${cr ? `${joined} of ${(next * 500).toLocaleString('en-IN')} joined · code ${cr.code}` : 'Register and get your code'}</span></span></button>
  <div class="trophy-row">${[1, 2, 3, 4].map(n => `<button data-act="pickTrophy" data-v="${n}" data-go="#/creator" class="${lv >= n ? 'got' : ''}"><span class="tr-pic">${trophyArt(n, 44)}${lv >= n ? '' : `<i>${ic('lock')}</i>`}</span><span>${lv >= n ? 'Earned' : `Unlocks at ${(n * 500).toLocaleString('en-IN')}`}</span></button>`).join('')}</div></section>`; };
const trophyNudge = () => `<button class="creator-nudge" data-go="#/creator"><span class="cn-ic">${trophyArt(1, 26)}</span><span><b>Trophy & referral</b><span>Share your code. Every 500 people who join earn you a new trophy.</span></span>${ic('right')}</button>`;

V.home = () => ({ nav: 'home', html: header() + `<div class="stories-band">${storiesBlock()}</div>` + heroBlock() + `<div class="home-stack">${seasonCard()}${postersBlock()}${eventsBlock()}${liveVotingBlock()}${servicesBlock()}${trophyBlock()}${duaBlock()}${hadithBlock()}${membersBlock()}</div>` });

V.campaigns = () => {
  const cats = [['all', 'All', 'heart'], ...Object.entries(CATS).map(([k, c]) => [k, c.label, c.icon])];
  const list = S.ui.home === 'fav' ? CAMPAIGNS.filter(c => S.saved.has(c.id)) : active().filter(c => S.ui.cat === 'all' || c.cat === S.ui.cat).sort((a, b) => !!b.featured - !!a.featured);
  return { nav: 'home', html: `<header class="top"><div class="top-row"><button class="hbtn" data-act="back" aria-label="Back">${ic('left')}</button><h1 class="page-title" style="font-size:20px">Campaigns</h1><span class="spacer"></span><div class="hbtns"><button class="hbtn" data-go="#/completed" aria-label="Completed campaigns">${ic('check')}</button><button class="hbtn" data-go="#/search" aria-label="Search">${ic('search')}</button></div></div>${seg('home', [['all', 'All campaigns'], ['fav', 'My favorites']])}</header>` +
    (S.ui.home === 'all' ? (() => { const A = active(), r = A.reduce((x, c) => x + c.raised, 0), d = A.reduce((x, c) => x + c.donors, 0); return `<div class="fund-stats list-stats"><span><b class="num">${inr(r)}</b>raised</span><span><b class="num">${d.toLocaleString('en-IN')}</b>donors</span><span><b class="num">${A.length}</b>campaigns</span></div>`; })() : '') +
    (S.ui.home === 'all' ? `<div class="chips">${cats.map(([k, l, i]) => `<button class="chip ${S.ui.cat === k ? 'on' : ''}" data-act="ui" data-k="cat" data-v="${k}">${ic(i)}${l}</button>`).join('')}</div>` : '') +
    `<div class="feed">${list.map(campaignCard).join('') || `<div class="empty">${ic('bookmark')}<p>${S.ui.home === 'fav' ? 'Tap the bookmark on any campaign to keep it here.' : 'No campaigns in this cause yet.'}</p><button class="btn btn-soft" data-act="ui" data-k="home" data-v="all">Browse campaigns</button></div>`}</div>` };
};

V.completed = () => {
  const done = CAMPAIGNS.filter(c => c.done);
  const reports = done.map(c => `<article class="section">
      <div class="mini-camp">${thumb(c)}<div><b>${esc(c.title)}</b><span class="small muted">${esc(ORGS[c.org].name)} · Closed with ${inr(c.raised)}</span></div></div>
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

const STORIES = [[PHOTO.family, 'How ₹500 became five iftars'], [PHOTO.hospital, 'Ayaan rang the last-chemo bell'], [PHOTO.water, 'Water for Sanawada'], [PHOTO.school, 'A day at Iqra Academy']];
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
      <div class="stories">${STORIES.map(([k, t]) => `<button class="story" data-act="toast" data-msg="Video plays here in the full app" style="background:url('${k}') center/cover"><span class="play">${ic('play')}</span><span>${t}</span></button>`).join('')}</div>
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
  const t = totalGiven(), tr = tierOf(t), got = BADGES.filter(badgeUnlocked).length;
  const menu = (title, items) => `<section class="pmenu"><h3>${title}</h3>${items.map(([i, l, a, meta]) => `<button ${a.startsWith('#') ? `data-go="${a}"` : `data-act="${a}"`}>${ic(i)}<span>${l}</span>${meta ? `<span class="meta">${meta}</span>` : ''}${ic('right', 'chev')}</button>`).join('')}</section>`;
  return { nav: 'profile', html: `<div class="wrap prof2">
    <section class="pcard">
      <div class="pc-top">${framed(avatar(S.user.name), tr.i, 76)}<div class="pc-id"><h1>${esc(S.user.name)}</h1><span class="pc-tierline">${tr.name} member</span><span class="muted small num">Donor ID · ${DONOR_ID}</span></div><button class="hbtn" data-go="#/settings" aria-label="Edit profile">${ic('pencil')}</button></div>
      <div class="pc-prog"><span class="bar"><i style="width:${tierProgress(t)}%"></i></span><span class="small muted">${tr.next ? `${inr(tr.next[1] - t)} more to reach <b>${tr.next[0]}</b>` : 'Highest level reached'}</span></div>
      <div class="pstats"><button data-go="#/donations"><b class="num">${inr(t)}</b><span>Donated</span></button><button data-go="#/my"><b class="num">${inr(myRaised())}</b><span>Raised</span></button><button data-go="#/creator"><b class="num">${got}/${BADGES.length}</b><span>Badges</span></button></div>
    </section>
    <div class="pquick">${[['receipt', 'History', '#/history'], ['wallet', 'Fundraisers', '#/my'], ['check', 'Completed', '#/completed'], ['scale', 'Get help', '#/help']].map(([i, l, h]) => `<button data-go="${h}"><i>${ic(i)}</i><span>${l}</span></button>`).join('')}</div>
    <section class="section"><div class="sec-head"><h2>Badges</h2><span class="small muted">${got} of ${BADGES.length} earned</span></div>
      <div class="badge-row">${BADGES.map((b, i) => { const ok = badgeUnlocked(b); return `<button class="bdg2 ${ok ? '' : 'off'}" ${ok ? `data-act="setBadge" data-v="${i}"` : 'disabled'}>${badgeArt(b, 48, !ok)}<span>${b[0]}</span>${S.profileBadge === i ? '<em>On profile</em>' : ''}</button>`; }).join('')}</div></section>
    ${menu('Account', [['user', 'Settings & appearance', '#/settings', S.mode === 'dark' ? 'Dark' : 'Light'], ['heart', 'Rose package', 'packages', plan().name], ['shield', 'KYC & bank account', '#/kyc', 'Verified'], ['card', 'Payment methods', 'payments'], ['calendar', 'Monthly giving', 'monthly'], ['globe', 'Language', 'region', 'English']])}
    ${menu('Activity', [['trophy', 'Rating & leaderboard', '#/rating'], ['heart', 'Rose contests', '#/vote'], ['search', 'All campaigns', '#/campaigns'], ['bookmark', 'Favorites', 'favs'], ['bell', 'News & notifications', '#/news'], ['hands', 'Verified NGOs', '#/ngos']])}
    ${menu('Help', [['headset', 'Contact support', '#/info/contact'], ['info', 'About, FAQs & how it works', '#/info/faq'], ['file', 'Terms, privacy & refunds', '#/info/terms']])}
    <button class="logout-btn" data-act="logout">${ic('logout')} Log out</button>
    <p class="center small muted">${APP} · demo build 0.3</p>
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
  const html = `<div class="d-cover"><div class="slides">${[c.photo, ...PHOTO_LIST.filter(x => x !== c.photo).slice(0, c.photo ? 2 : 0)].map(photo => cover(c, { photo, bare: true })).join('')}</div>
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
      ${c.docs.length ? `<div class="box"><h3>${ic('shield')} Verified documents</h3>${c.docs.map(d => `<div class="doc-row">${ic('file')}<span>${d}</span><span class="ok">${ic('check')}Checked</span></div>`).join('')}<p class="small muted" style="margin-top:8px">Reviewed by the Muslim Life Pro team. Funds are released only against bills.</p></div>` : ''}
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

const shareText = c => `Please support "${c.title}" on Muslim Life Pro. Every share helps: ${SITE}/c/${c.id}`;
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
    <section class="section"><div class="mini-camp">${thumb(c)}<div><b>${esc(c.title)}</b><span class="small muted">${esc(ORGS[c.org].name)}</span></div></div></section>
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
      <div class="sec-head"><h2>Support Muslim Life Pro</h2><span class="small muted">optional</span></div>
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
const summary = () => `<div><span>Donation (${S.donate.type})</span><b class="num">${inr(dAmount())}</b></div><div><span>Tip to Muslim Life Pro</span><b class="num">${inr(dTip())}</b></div><div class="total"><span>Total</span><span class="num">${inr(dAmount() + dTip())}</span></div>`;
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
      ${creatorNudge()}
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
  return `<p class="small muted">${list.length} campaign${list.length > 1 ? 's' : ''}</p>` + list.map(c => `<div class="result" data-go="#/c/${c.id}">${thumb(c)}<div class="info"><b>${esc(c.title)}</b><span class="small muted num">${inr(c.raised)} raised · ${c.days} days left</span><div class="bar"><i style="width:${pct(c)}%"></i></div></div></div>`).join('');
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
      ${mine.map(m => `<div class="my-camp">${thumb(m.c, m.photo)}<div class="info"><b>${esc(m.c.title)}</b><span class="small muted num">${inr(m.c.raised)} of ${inr(m.c.goal)} · ${m.c.donors} donors</span><div class="bar"><i style="width:${pct(m.c)}%"></i></div>
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
const BTN_STYLES = [['classic', 'Classic'], ['clay', 'Clay'], ['glass', '3D glass'], ['neu', 'Neumorphic'], ['frost', 'Glass'], ['skeu', 'Real 3D'], ['capsule', 'Capsule pill'], ['gbar', 'Glass gradient pill']];
function applyLook() {
  const r = document.documentElement;
  r.dataset.btn = S.look.btn; r.dataset.text = S.look.text; r.classList.toggle('saver', !!S.look.saver);
  try { localStorage.setItem('mlp-look', JSON.stringify(S.look)); } catch { /* storage blocked: look lasts for this session */ }
}
V.settings = () => {
  const u = S.user;
  const sw = (k, t, d) => `<div class="switch-row"><div class="txt"><b>${t}</b><span>${d}</span></div><button class="switch ${S.prefs[k] ? 'on' : ''}" data-act="pref" data-k="${k}" role="switch" aria-checked="${S.prefs[k]}" aria-label="${t}"></button></div>`;
  return { html: pageHead('Settings & appearance') + `<form class="wrap" data-form="profile">
    <section class="section"><div class="sec-head"><h2>Appearance</h2></div>
      <div class="mode-pick">${[['light', 'Light', 'sun'], ['dark', 'Dark', 'moon']].map(([k, l, i]) => `<button type="button" class="${S.mode === k ? 'on' : ''}" data-act="setMode" data-v="${k}"><span class="mp-prev ${k}"><i></i><i></i><i></i></span>${ic(i)} ${l}</button>`).join('')}</div></section>
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

V.donations = () => {
  const t = totalGiven(), tr = tierOf(t), n = confirmed().length;
  const challenges = [['flame', '60-Day Sadaqah Challenge', 1000, 'in the last 60 days'], ['crown', '2-Year Royal Pledge', 200000, 'in the last 2 years']];
  return { nav: 'donations', html: `<header class="top"><div class="top-row"><h1 class="page-title">Donations</h1><span class="spacer"></span><div class="hbtns"><button class="hbtn" data-go="#/history" aria-label="Receipts">${ic('receipt')}</button></div></div></header>
  <div class="wrap">
    <section class="section tier-card">
      <div class="tc-row"><div><span class="eyebrow">Total confirmed</span><b class="tc-amt num">${inr(t)}</b><span class="muted small">${n} successful donation${n === 1 ? '' : 's'}</span></div><div class="tc-badge">${tierBadge(tr.i, 58)}<span>${tr.name}</span></div></div>
      <div class="bar"><i style="width:${tierProgress(t)}%"></i></div>
      <div class="tc-foot"><span>${tr.name}</span><span>${tr.next ? `${inr(tr.next[1] - t)} to reach ${tr.next[0]}` : 'Highest badge'}</span></div>
      <button class="btn btn-main btn-block" data-go="#/home">${ic('heart')} Donate now</button>
    </section>
    <div class="tier-ladder">${TIERS.map(([nm, min], i) => `<div class="${i <= tr.i ? 'got' : ''}">${tierBadge(i, 30)}<b>${nm}</b><span class="num">${min ? inr(min) : 'Start'}</span></div>`).join('')}</div>
    ${secTitle('Campaign achievements', 'समय-आधारित')}
    <p class="small muted" style="margin:-6px 4px 0">Separate from your permanent badge. Your badge is never removed when a campaign ends.</p>
    ${challenges.map(([i, l, goal, when]) => { const v = Math.min(100, Math.round(t / goal * 100)); return `<section class="section chal"><div class="chal-row"><span class="chal-ic">${ic(i)}</span><div><b>${l}</b><span class="small muted num">${inr(t)} of ${inr(goal)} ${when}</span></div><b class="num chal-pct">${v}%</b></div><div class="bar"><i style="width:${v}%"></i></div></section>`; }).join('')}
    ${secTitle('Donation history', 'दान इतिहास', `<button class="text-link small" data-go="#/history">All receipts ${ic('right')}</button>`)}
    <section class="section" style="padding-block:4px">${allDonations().map(d => { const c = camp(d.cid), ok = d.status === 'success'; return `<div class="dh-row"><span class="dh-ic ${ok ? '' : 'bad'}">${ic(ok ? 'check' : 'xcircle')}</span><div class="dh-body"><b><span class="num">${inr(d.amount)}</span> · ${esc(c.title)}</b><span class="small muted">${d.date} · ${PAYS.find(p => p[0] === d.pay)[1]} · ${d.txn}</span></div>${ok ? '<span class="status st-live">Success</span>' : `<button class="status st-fail" data-go="#/donate/${c.id}">Retry</button>`}</div>`; }).join('')}</section>
    ${creatorNudge()}
  </div>` };
};

const communitySwitch = cur => `<div class="seg comm-seg">${[['stories', 'Stories'], ['creator', 'Trophies']].map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" data-go="#/${k}">${l}</button>`).join('')}</div>`;
V.creator = () => {
  const cr = S.creator, joined = cr ? S.joins.filter(j => j.code === cr.code).length : 0, lv = Math.floor(joined / 500), next = Math.min(lv + 1, 8), sel = S.ui.trophy || next, got = lv >= sel;
  return { nav: 'community', html: `<header class="top"><div class="top-row"><h1 class="page-title">Community</h1><span class="spacer"></span><div class="hbtns"><button class="hbtn" data-act="trophyHelp" aria-label="How trophies work">${ic('info')}</button></div></div>${communitySwitch('creator')}</header>
  <div class="wrap">
    <section class="tstage"><div class="pattern"></div>${sparkles([[8, 14, 10, 0], [88, 20, 12, .8], [14, 70, 7, 1.6], [86, 64, 8, 2.2]])}
      <div class="tst-photo"><img src="${TROPHY_IMG[(sel - 1) % 4]}" alt="${trophyName(sel)} trophy"></div>
      <b class="tst-name">${trophyName(sel)} trophy</b><span class="tst-when">When ${(sel * 500).toLocaleString('en-IN')} people join with your code</span>
      <span class="tst-chip ${got ? 'on' : ''}">${got ? `${ic('check')} Earned` : `${ic('lock')} Locked`}</span>
      ${cr ? `<div class="tst-prog"><span class="bar"><i style="width:${Math.min(100, joined / (sel * 500) * 100)}%"></i></span><span>${joined.toLocaleString('en-IN')} of ${(sel * 500).toLocaleString('en-IN')} joined</span></div>`
        : `<button class="btn tst-btn" data-act="toRegister">Apply for this trophy</button>`}
    </section>
    <div class="pills-row tpills">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<button class="${n === sel ? 'on' : ''}" data-act="pickTrophy" data-v="${n}">${(n * 500).toLocaleString('en-IN')}</button>`).join('')}</div>
    ${secTitle('Trophy ladder', 'ट्रॉफी की सीढ़ी')}
    <div class="tladder">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<button class="tlc ${n === sel ? 'on' : ''} ${lv >= n ? 'got' : ''}" data-act="pickTrophy" data-v="${n}"><span class="tl-photo"><img src="${TROPHY_IMG[(n - 1) % 4]}" alt="" loading="lazy">${lv >= n ? '' : `<i>${ic('lock')}</i>`}</span><b>${trophyName(n)}</b><span class="num">${(n * 500).toLocaleString('en-IN')} people</span></button>`).join('')}</div>
    ${cr ? `<section class="section"><div class="sec-head"><h2>Your referral code</h2><span class="status st-live">Active</span></div>
      <div class="code-box"><b class="num">${cr.code}</b><button class="btn btn-soft" data-act="copy" data-v="${cr.code}">${ic('link')} Copy</button></div>
      <a class="btn btn-wa btn-block" style="margin-top:10px" href="https://wa.me/?text=${encodeURIComponent(`Download ${APP} and join with my code ${cr.code}: ${SITE}/join?ref=${cr.code}`)}" target="_blank" rel="noopener">${ic('share')} Share my code on WhatsApp</a>
      <div class="stats3"><div><b class="num">${joined}</b><span>people joined</span></div><div><b class="num">${500 - (joined % 500)}</b><span>to next trophy</span></div><div><b class="num">${lv}</b><span>trophies</span></div></div></section>
      <section class="cert"><span class="eyebrow">${APP}</span><h3>Certificate of appreciation</h3>${S.crPhoto ? `<span class="cert-ph" style="background-image:url('${S.crPhoto}')"></span>` : avatar(cr.name || S.user.name, 'big')}<b>${esc(cr.name || S.user.name)}</b><span class="muted small">${esc(cr.city || '')}</span><span class="muted small">Honoured member for spreading the foundation’s work and serving the community</span><span class="muted small">${cr.date}</span></section>`
    : `<form class="section tform" data-form="creator" id="reg-form"><div class="sec-head" style="margin:0"><h2>Register for trophies</h2></div><p class="small muted">Get your own code. Every person who joins with it brings you closer to the next trophy.</p>
      <input class="input" name="name" placeholder="Full name" required value="${esc(S.user.name)}" aria-label="Full name">
      <input class="input" name="city" placeholder="City and address" required aria-label="City and address">
      <input class="input num" name="phone" inputmode="numeric" maxlength="10" placeholder="Mobile number (10 digits)" required aria-label="Mobile number">
      <label class="doc-up ${S.crPhoto ? 'done' : ''}" for="cr-photo">${S.crPhoto ? `<span class="cert-ph sm" style="background-image:url('${S.crPhoto}')"></span>` : ic('camera')}<span class="txt"><b>Your photo</b><span>${S.crPhoto ? 'Added · shown on your certificate' : 'Optional · shown on your certificate'}</span></span><input type="file" id="cr-photo" accept="image/*" hidden></label>
      <span class="err" id="cr-err"></span><button class="btn btn-main">Register and get my code</button></form>`}
    <form class="section tform" data-form="joinCode"><div class="sec-head" style="margin:0"><h2>Joined with someone’s code?</h2></div>
      <input class="input" name="name" placeholder="Your name" required aria-label="Your name"><input class="input num" name="phone" inputmode="numeric" maxlength="10" placeholder="Mobile number" required aria-label="Mobile number"><input class="input" name="code" placeholder="Referral code (MLP-XXXXXX)" required style="text-transform:uppercase" aria-label="Referral code">
      <span class="err" id="join-err"></span><button class="btn btn-soft">Join with this code</button></form>
  </div>` };
};

V.history = () => {
  const all = allDonations();
  return { html: pageHead('Donation history') + `<div class="wrap">
    <section class="section" style="display:flex;justify-content:space-between"><div><span class="small muted">This year</span><b class="num" style="display:block;font-size:24px;color:var(--brand)">${inr(totalGiven())}</b></div><div style="text-align:right"><span class="small muted">Zakat given</span><b class="num" style="display:block;font-size:24px">${inr(S.donations.filter(d => d.type === 'Zakat').reduce((a, d) => a + d.amount, 0))}</b></div></section>
    <section class="section">${all.map((d, i) => { const c = camp(d.cid); return `<div class="result">${thumb(c)}<div class="info"><b>${esc(c.title)}</b><span class="small muted">${d.date} · ${d.type}</span> ${d.status === 'failed' ? '<span class="status st-fail">Failed</span>' : ''}</div><div style="text-align:right"><b class="num">${inr(d.amount)}</b><button class="text-link small" style="display:block" data-act="receipt" data-i="${i}">Receipt</button></div></div>`; }).join('')}</section>
  </div>`, data: all };
};

const INFO = {
  about: ['About us', `<p>Muslim Life Pro connects people who want to give with verified NGOs and families who need help. Every fundraiser is checked by our team, and funds are released against bills.</p><p>We charge 0% platform fee to NGOs. Optional tips from donors keep the service running.</p>`],
  how: ['How it works', `<div class="timeline">${[['Start a fundraiser', 'Add the story, target, beneficiary details, photos and documents.'], ['We verify', 'Our team reviews documents and KYC within 48 hours.'], ['Share and raise', 'Share your link on WhatsApp and social media. Donors pay by UPI, card or net banking.'], ['Withdraw against bills', 'Request a withdrawal to a verified bank account. Track it until it is paid.']].map(([t, s], i) => `<div class="tl"><div class="rail"><i></i>${i < 3 ? '<b></b>' : ''}</div><div class="tl-body"><b>${t}</b><p>${s}</p></div></div>`).join('')}</div>`],
  faq: ['FAQs', [['Is my donation tax deductible?', 'Donations to NGOs with 80G registration get an 80G receipt by email right after payment.'], ['Can I give Zakat?', 'Yes. Campaigns marked “Zakat eligible” keep Zakat funds separate and use them only for eligible beneficiaries.'], ['How do I know a campaign is genuine?', 'Every campaign is reviewed with documents and KYC before it goes live. Look for the verified tick.'], ['When can organisers withdraw money?', 'After KYC and bank verification. Each withdrawal needs a bill or invoice and is approved by our team.'], ['Can I get a refund?', 'Refunds are possible within 7 days for duplicate or failed payments. See the Refund Policy.']].map(([q, a]) => `<details class="faq"><summary>${q}${ic('down')}</summary><p>${a}</p></details>`).join('')],
  contact: ['Contact us', `<p>We usually reply within one working day.</p><p><b>Email</b><br><span style="user-select:all">support@muslimlifepro.demo</span></p><p><b>Phone (10 am – 6 pm IST)</b><br><span style="user-select:all">+91 80 4000 1234</span></p>
    <form data-form="contact" style="display:grid;gap:10px;margin-top:14px"><input class="input" id="c-name" required placeholder="Your name"><input class="input" id="c-email" type="email" required placeholder="Email"><textarea class="textarea" id="c-msg" required placeholder="How can we help?"></textarea><button class="btn btn-main">Send message</button></form>`],
  terms: ['Terms & Conditions', '<p>The approved Terms & Conditions will be shown here. This page is ready for the final legal text.</p>'],
  privacy: ['Privacy Policy', '<p>The approved Privacy Policy will be shown here, including how donor and beneficiary data is stored and used.</p>'],
  refund: ['Refund Policy', '<p>The approved Refund Policy will be shown here. Typical cases: duplicate payments and failed transactions within 7 days.</p>'],
};
V.info = slug => { const [t, body] = INFO[slug] || INFO.about; return { html: pageHead(t) + `<div class="wrap"><section class="section prose">${body}</section></div>` }; };

const WORDMARK = `<div class="brand-lockup">${emblem()}<b>${APP}</b><span>Together for a Better Muslim</span></div>`;
// chand-sitare decoration: glowing crescent, twinkling four-point stars and hanging stars
const STAR4 = '<path d="M12 0c.9 7.2 4.8 11.1 12 12-7.2.9-11.1 4.8-12 12-.9-7.2-4.8-11.1-12-12C7.2 11.1 11.1 7.2 12 0Z"/>';
const sparkles = pts => `<div class="sparkles" aria-hidden="true">${pts.map(([x, y, sz, d]) => `<svg viewBox="0 0 24 24" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;animation-delay:${d}s">${STAR4}</svg>`).join('')}</div>`;
const SKY = [[12, 22, 14, 0], [24, 58, 9, 1.1], [38, 14, 8, 2], [62, 70, 12, .6], [78, 44, 9, 1.6], [88, 78, 7, .3], [8, 74, 8, 2.3], [52, 32, 6, 1.9], [70, 16, 10, 2.6]];
const chandSitare = () => `<div class="decor" aria-hidden="true">${sparkles(SKY)}
  <svg class="hero-moon" viewBox="0 0 24 24"><defs><linearGradient id="moonG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#e9b52c"/></linearGradient></defs><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonG)"/></svg>
  ${[[14, 46, 0], [26, 82, 1.2], [84, 60, .6]].map(([x, h, d]) => `<span class="hang" style="left:${x}%;--h:${h}px;animation-delay:${d}s"><svg viewBox="0 0 24 24">${STAR4}</svg></span>`).join('')}</div>`;

const onbHero = cls => `<div class="onb-hero ${cls || ''}"><div class="pattern"></div>${chandSitare()}${WORDMARK}</div>`;

// greeting that follows the Islamic calendar and the day of the week
function seasonGreeting() {
  let m = 0, d = 0;
  try { const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', day: 'numeric' }).formatToParts(new Date()); m = +parts.find(x => x.type === 'month').value; d = +parts.find(x => x.type === 'day').value; } catch { /* no Islamic calendar support: plain greeting */ }
  if (m === 9) return ['رمضان مبارك', 'Ramadan Mubarak'];
  if (m === 10 && d <= 3) return ['عيد مبارك', 'Eid Mubarak'];
  if (m === 12 && d >= 10 && d <= 13) return ['عيد الأضحى مبارك', 'Eid al-Adha Mubarak'];
  if (m === 1 && d <= 10) return ['عام هجري سعيد', 'Happy Islamic New Year'];
  if (new Date().getDay() === 5) return ['جمعة مباركة', 'Jumu‘ah Mubarak'];
  return ['السلام عليكم', 'Assalamu alaikum'];
}

V.splash = () => {
  setTimeout(() => location.hash === '#/splash' && replaceRoute(S.signed ? '#/home' : '#/intro'), S.signed ? 1600 : 3200);
  return { bare: true, html: `<button class="splash splash2" data-act="splashNext" aria-label="Continue"><div class="pattern"></div>${chandSitare()}
    <div class="sp-stack"><p class="bismillah" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p><p class="bis-en">In the name of Allah, the Most Gracious, the Most Merciful</p>
    <div class="sp-logo">${emblem()}<b>${APP}</b><span>Together for a Better Muslim</span></div></div></button>` };
};

// three-screen welcome tour; each screen has its own small animation
const TOUR = [
  { k: 'trust', t: 'Give Zakat & Sadaqah with trust', d: 'Every campaign and NGO is checked before it goes live. You get an 80G receipt for every gift.' },
  { k: 'track', t: 'See where every rupee goes', d: 'Follow updates, photos and bills from the people you help, right up to the last rupee.' },
  { k: 'roses', t: 'Send roses, earn trophies', d: 'Choose winners with roses, share your code and earn trophies as your community grows.' },
];
const tourArt = k => k === 'trust' ? `<div class="ta ta-trust"><div class="ta-card c1" style="background-image:url('${PHOTO.school}')"></div><div class="ta-card c2" style="background-image:url('img/fx-ration.jpg')"></div>
    <span class="ta-badge b1">${ic('verified')} Verified</span><span class="ta-badge b2">${ic('receipt')} 80G receipt</span><span class="ta-heart">${emblem()}</span></div>`
  : k === 'track' ? `<div class="ta ta-track"><svg class="ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="r-bg"/><circle cx="60" cy="60" r="50" class="r-fg"/></svg><b class="ring-n">81%</b><span class="ring-l">funded</span>
    <ul class="ta-steps"><li>${ic('check')} ₹1,85,000 paid to hospital</li><li>${ic('check')} Bill uploaded</li><li>${ic('check')} Photo update shared</li></ul></div>`
  : `<div class="ta ta-roses">${[0, 1, 2, 3, 4, 5].map(i => `<span class="fly f${i}">${ROSE(26)}</span>`).join('')}<span class="ta-trophy">${trophyArt(2, 92)}</span></div>`;

V.intro = () => {
  const i = S.ui.tour || 0, last = i === TOUR.length - 1, [ar, en] = seasonGreeting();
  return { bare: true, html: `<div class="tour">
    <div class="tour-top"><span class="greet-chip"><b lang="ar">${ar}</b> · ${en}</span><button class="text-link" data-go="#/login">Skip</button></div>
    <div class="tour-track" id="tour-track">${TOUR.map((t, k) => `<section class="tour-slide ${k === i ? 'on' : ''}" aria-hidden="${k !== i}">${tourArt(t.k)}<h1>${t.t}</h1><p>${t.d}</p></section>`).join('')}</div>
    <div class="tour-dots">${TOUR.map((t, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="tour-foot">${last ? `<button class="btn btn-main btn-block" data-go="#/login">Get started</button><p class="small muted center">By continuing you accept the <a class="text-link" href="#/info/terms" data-go="#/info/terms">Terms</a> and <a class="text-link" href="#/info/privacy" data-go="#/info/privacy">Privacy Policy</a>.</p>`
      : `<button class="btn btn-main btn-block" data-act="tourNext">Next</button>`}</div></div>` };
};

const INTERESTS = [['zakat', 'Zakat', 'star'], ['education', 'Education', 'book'], ['masjid', 'Madrasa', 'mosque'], ['medical', 'Medical', 'pulse'], ['legal', 'Legal aid', 'scale'], ['food', 'Food & ration', 'utensils'], ['orphans', 'Orphans', 'baby']];
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
      <div class="field"><label>App language</label><div class="lang-row">${[['en', 'English'], ['hi', 'हिन्दी'], ['ur', 'اردو']].map(([k, t]) => `<button type="button" class="${l.lang === k ? 'on' : ''}" data-act="lset" data-k="lang" data-v="${k}">${t}</button>`).join('')}</div></div>
      <div class="field"><label>Causes close to your heart</label><div class="int-row">${INTERESTS.map(([k, t, i]) => `<button type="button" class="${l.interests.includes(k) ? 'on' : ''}" data-act="toggleInterest" data-v="${k}">${ic(i)}${t}</button>`).join('')}</div><span class="hint">We show these first on your Home.</span></div>
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

/* ---------- voting ---------- */
// sample polls; in the real app these come from the admin panel
const POLLS = [
  { id: 'aw', photo: 'img/fx-doctor.jpg', emoji: '🏆', cat: 'Award', icon: 'trophy', color: '#0b5a3f', status: 'live', end: '2027-01-31', results: 'live', price: 10, maxPaid: 100,
    title: 'National Social Service Excellence Award 2027', desc: 'Send roses to the person who deserves this year’s award. Most roses wins.',
    cand: [['Dr. Salma Begum', 'Free medical camps in Mewat'], ['Imran Shaikh', 'Free coaching for 300 students'], ['Adv. Rizwan Ahmed', 'Free legal aid in 120 cases'], ['Fatima Noor', 'Education for orphan girls']], votes: [412, 368, 455, 290] },
  { id: 'sc', photo: 'img/fx-schoolgirl.jpg', emoji: '🏫', cat: 'School location', icon: 'school', color: '#16695a', status: 'live', end: '2027-02-28', results: 'after_vote', price: 10, maxPaid: 100,
    title: 'Where should our next school be built?', desc: 'Send roses to the city that should get the next school. Most roses wins; land and cost checks follow.',
    cand: [['Ghaziabad', 'Local demand to be verified'], ['Meerut', 'Local demand to be verified'], ['Delhi', 'Local demand to be verified'], ['Noida', 'Local demand to be verified']], votes: [620, 540, 410, 380] },
  { id: 'md', photo: 'img/fx-madrasa.jpg', emoji: '🕌', cat: 'Project priority', icon: 'mosque', color: '#5634c0', status: 'upcoming', start: '2026-11-15', end: '2026-12-31', results: 'live', price: 10, maxPaid: 50,
    title: 'Which madrasa should be upgraded first?', desc: 'Send roses to the madrasa that should get new classrooms and digital boards first.',
    cand: [['Faiz-ul-Uloom, Bahraich', '210 students'], ['Darul Quran, Malappuram', '160 students'], ['Jamia Noor, Murshidabad', '240 students']], votes: [0, 0, 0] },
  { id: 'vl', photo: 'img/fx-ration.jpg', emoji: '🤝', cat: 'Social worker', icon: 'heart', color: '#b0461f', status: 'closed', end: '2026-04-10', results: 'live', price: 10, maxPaid: 100,
    title: 'Best volunteer of Ramzan 2026', desc: 'Members sent roses to the volunteer who served the most during Ramzan.',
    cand: [['Bilal Qureshi', 'Iftar drives on 40 nights'], ['Mariam Siddiqui', 'Ration kits for 600 families'], ['Yusuf Patel', 'Blood donation camps']], votes: [812, 934, 506] },
];
// Rose contests: members send roses to an option; the option with the most roses wins.
// Every verified member gets one free rose per contest; more roses cost ₹10 each.
const ROSE = (size = 22) => `<svg class="rose" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true"><path d="M15.4 17.5c.3 4.6-.6 8.8-2.6 12.4" fill="none" stroke="#2f8a4a" stroke-width="2" stroke-linecap="round"/><path d="M14.7 23.3c-3.2-.4-5.6-2-6.8-4.6 3.3-.3 5.6.9 6.8 4.6Z" fill="#3aa65a"/><path d="M15.6 21.1c2.6-1.6 5.4-1.8 8.1-.6-2.1 2.3-4.8 2.8-8.1.6Z" fill="#2f8a4a"/><path d="M16 18.6c-5.2 0-8.3-3.4-8.3-7.6 0-2.8 1.4-5.3 3.6-6.4.9 2 2.6 2.9 4.7 2.9s3.8-.9 4.7-2.9c2.2 1.1 3.6 3.6 3.6 6.4 0 4.2-3.1 7.6-8.3 7.6Z" fill="#d6283b"/><path d="M16 7.5c-2.6 0-4.3 1.6-4.3 3.7 0 1.6 1 2.8 2.4 3.3-.4-1.7.6-3.3 2.4-3.6 1.6-.3 3 .6 3.4 2.1.4-.6.5-1.2.5-1.8 0-2.1-1.8-3.7-4.4-3.7Z" fill="#a8152a"/><path d="M12.3 5.2C13 3.4 14.4 2.2 16 2.2s3 1.2 3.7 3c-.9 1.4-2.2 2.2-3.7 2.2s-2.8-.8-3.7-2.2Z" fill="#ee4a5c"/></svg>`;
// Rose packages: Basic is free (watch and follow); Premium and VIP include a monthly rose balance
const PLANS = [
  { id: 'basic', name: 'Basic', price: 0, roses: 0, tag: 'Free', feats: [['Watch every contest and live results', 1], ['Follow contests and get winner alerts', 1], ['Send roses', 0], ['Supporter badge', 0]] },
  { id: 'premium', name: 'Premium', price: 99, roses: 50, tag: 'Most popular', feats: [['Everything in Basic', 1], ['50 roses every month', 1], ['Send roses in all contests', 1], ['Rose history and receipts', 1], ['Green Premium badge on your profile', 1]] },
  { id: 'vip', name: 'VIP', price: 299, roses: 200, tag: 'Best value', feats: [['Everything in Premium', 1], ['200 roses every month', 1], ['Gold VIP badge on profile and leaderboards', 1], ['Early access to new contests', 1], ['Your name in Top Supporters', 1], ['Priority support', 1]] },
];
const plan = () => PLANS.find(x => x.id === S.plan);
const planCard = (x, compact) => { const cur = S.plan === x.id, rank = PLANS.indexOf(x), mine = PLANS.indexOf(plan()); return `<div class="pkg ${x.id} ${cur ? 'cur' : ''}">
  <div class="pkg-top"><span class="pkg-name">${x.id === 'vip' ? ic('crown') : x.id === 'premium' ? ROSE(16) : ic('user')} ${x.name}</span>${x.tag ? `<span class="pkg-tag">${x.tag}</span>` : ''}</div>
  <div class="pkg-price">${x.price ? `<b class="num">₹${x.price}</b><span>/ month</span>` : '<b>Free</b>'}</div>
  ${compact ? `<span class="pkg-sum">${x.roses ? `${x.roses} roses a month` : 'Watch and follow only'}</span>` : `<ul class="pkg-feats">${x.feats.map(([t, ok]) => `<li class="${ok ? '' : 'no'}">${ic(ok ? 'check' : 'x')}${t}</li>`).join('')}</ul>`}
  ${cur ? '<span class="pkg-btn cur">Current plan</span>' : rank > mine ? `<button class="pkg-btn" data-act="buyPlan" data-v="${x.id}">Get ${x.name}</button>` : '<span class="pkg-btn cur">Included</span>'}</div>`; };
const packagesSheet = (why) => sheet(`<h2>Rose packages</h2><p class="muted small">${why || 'Choose a package to send roses. Cancel any time.'}</p><div class="pkg-list">${PLANS.map(x => planCard(x)).join('')}</div><p class="small muted center" style="margin-top:10px">Demo prices. Roses refresh on the 1st of every month.</p>`);
const planChip = () => `<button class="plan-chip ${S.plan}" data-act="packages">${S.plan === 'vip' ? ic('crown') : ROSE(14)}<span>${S.plan === 'basic' ? 'Get roses' : `${S.roses} roses`}</span></button>`;

const poll = id => POLLS.find(p => p.id === id);
const myVotes = id => (S.votes[id] || (S.votes[id] = { free: null, paid: 0, rec: [] }));
const pollTotal = p => p.votes.reduce((a, v) => a + v, 0);
const daysTo = d => Math.max(0, Math.ceil((new Date(d + 'T23:59:59') - Date.now()) / 864e5));
const pollWhen = p => p.status === 'live' ? `${daysTo(p.end)} days left` : p.status === 'upcoming' ? `Starts ${new Date(p.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Contest closed';
const leader = p => p.votes.indexOf(Math.max(...p.votes));
const roseCount = n => `${n.toLocaleString('en-IN')} ${n === 1 ? 'rose' : 'roses'}`;
const pollBanner = (p, cls = '') => `<span class="vban ${cls}" style="background:linear-gradient(135deg, ${p.color}, #062a1f)"><span class="vpill ${p.status}">${p.status === 'live' ? '● LIVE' : p.status === 'upcoming' ? 'COMING SOON' : 'WINNER CHOSEN'}</span>${ic(p.icon)}</span>`;
const pollCard = p => { const w = leader(p), tot = pollTotal(p), live = p.status === 'live'; return `<button class="pcard2" data-go="#/poll/${p.id}">
  <span class="pc2-top"><span class="pc2-img" style="background-image:url('${p.photo}')"><span class="pc2-pill ${p.status}">${live ? '● Live' : p.status === 'upcoming' ? 'Soon' : 'Winner'}</span></span>
  <span class="pc2-text"><span class="pc2-cat">${p.cat}</span><b class="pc2-title">${esc(p.title)}</b>
  <span class="pc2-lead">${tot ? `${ROSE(14)}<span>${p.status === 'closed' ? 'Winner' : 'Leading'} <b>${esc(p.cand[w][0])}</b></span>` : `<span>${pollWhen(p)}</span>`}</span>${tot ? `<span class="pc2-count num">${roseCount(tot)} · ${pollWhen(p)}</span>` : ''}</span></span>
  <span class="pc2-cta">${live ? `${ROSE(15)} Send roses` : 'See results'}</span></button>`; };
const pollRing = p => `<button class="vring2 ${p.status}" data-go="#/poll/${p.id}"><i style="background-image:url('${p.photo}')">${p.status === 'live' ? '<em></em>' : ''}</i><span>${p.cat.split(' ')[0]}</span><small>${p.status === 'live' ? `${(pollTotal(p) / 1000).toFixed(1)}k roses` : p.status === 'upcoming' ? 'Soon' : 'Winner'}</small></button>`;
const liveVotingBlock = () => { const L = POLLS.filter(p => p.status === 'live'); return L.length ? `<section class="home-sec"><div class="lv-head"><h2>${ROSE(20)}Rose contests</h2><span class="spacer"></span>${planChip()}<button class="lv-all" data-go="#/vote">View all</button></div>
  <div class="vrings2">${POLLS.map(pollRing).join('')}<button class="vring2 all" data-go="#/vote"><i>${ROSE(22)}</i><span>All</span><small>contests</small></button></div>
  <div class="hscroll">${L.map(pollCard).join('')}</div></section>` : ''; };

V.vote = () => {
  const tab = S.ui.vote;
  const list = tab === 'mine' || tab === 'plans' ? [] : POLLS.filter(p => (tab === 'live' ? p.status === 'live' : tab === 'upcoming' ? p.status === 'upcoming' : p.status === 'closed'));
  const mine = POLLS.flatMap(p => myVotes(p.id).rec.map(r => ({ ...r, p })));
  const sent = mine.reduce((a, r) => a + r.n, 0);
  return { nav: 'vote', html: `<header class="top"><div class="top-row"><h1 class="page-title">Vote with roses</h1><span class="spacer"></span>${planChip()}<div class="hbtns"><button class="hbtn" data-act="voteRules" aria-label="How roses work">${ic('info')}</button></div></div></header>
  <div class="rose-hero"><span class="rh-ic">${ROSE(20)}</span><div class="rh-text"><b>Most roses wins</b><span>${S.plan === 'basic' ? 'Get a package to start sending' : `${plan().name} · ${S.roses} roses left`}</span></div>
    <button class="rh-btn ${tab === 'plans' ? 'on' : ''}" data-act="ui" data-k="vote" data-v="${tab === 'plans' ? 'live' : 'plans'}">${tab === 'plans' ? 'Contests' : 'Packages'}</button></div>
  <div class="wrap" style="padding-top:0">${tab === 'plans' ? '' : seg('vote', [['live', 'Live'], ['upcoming', 'Upcoming'], ['done', 'Winners'], ['mine', 'My roses']])}
  ${tab === 'plans' ? `<div class="pkg-grid">${PLANS.map(x => planCard(x)).join('')}</div><p class="small muted center">Demo prices. Roses refresh on the 1st of every month and do not carry over.</p>` : ''}
  ${tab === 'plans' ? '' : tab === 'mine'
    ? (mine.length ? `<section class="section"><div class="sec-head"><h2>You sent ${roseCount(sent)}</h2></div>${mine.reverse().map(r => `<div class="dh-row"><span class="dh-ic rose-ic">${ROSE(20)}</span><div class="dh-body"><b>${roseCount(r.n)} to ${esc(r.p.cand[r.o][0])}</b><span class="small muted">${esc(r.p.title)} · ${r.amt ? inr(r.amt) : 'free rose'} · ${r.id}</span></div></div>`).join('')}</section>` : `<div class="empty">${ROSE(40)}<p>You have not sent any roses yet. Get Premium or VIP to start sending roses.</p><button class="btn btn-main" data-act="ui" data-k="vote" data-v="live">See live contests</button></div>`)
    : (list.length ? list.map(pollCard).join('') : `<div class="empty">${ROSE(40)}<p>No contests here right now.</p></div>`)}
  </div>` };
};

V.poll = id => {
  const p = poll(id); if (!p) return V.vote();
  const mv = myVotes(p.id), sel = S.ui.pollSel[p.id] ?? mv.rec.at(-1)?.o ?? null, tot = pollTotal(p), top = Math.max(1, ...p.votes);
  const order = p.cand.map((c, i) => i).sort((a, b) => p.votes[b] - p.votes[a]);
  const mineTo = i => mv.rec.filter(r => r.o === i).reduce((a, r) => a + r.n, 0);
  const rows = order.map((i, rank) => { const [n, note] = p.cand[i]; return `<button class="cand2 ${sel === i ? 'on' : ''}" ${p.status === 'live' ? `data-act="pickCand" data-p="${p.id}" data-v="${i}"` : 'disabled'}>
    <span class="rk2 ${rank === 0 && tot ? 'first' : ''}">${rank === 0 && tot ? ic('crown') : rank + 1}</span>${avatar(n)}
    <span class="who"><b>${esc(n)}</b><span>${esc(note)}${mineTo(i) ? ` · you sent ${mineTo(i)}` : ''}</span><span class="rbar"><i style="width:${p.votes[i] / top * 100}%"></i></span></span>
    <span class="rcount">${ROSE(15)}<b class="num">${p.votes[i].toLocaleString('en-IN')}</b></span></button>`; }).join('');
  const n = S.ui.extra;
  const cta = p.status !== 'live' ? undefined : S.plan === 'basic' ? `<button class="btn btn-main send-btn" data-act="sendRoses" data-p="${p.id}">${ROSE(18)} Send roses</button>`
    : `<div class="send-bar"><div class="rose-qty">${[1, 5, 10, 25].map(k => `<button class="${n === k ? 'on' : ''}" data-act="roseQty" data-v="${k}" ${k > S.roses ? 'disabled' : ''}>${k}</button>`).join('')}</div>
    <button class="btn btn-main send-btn" data-act="sendRoses" data-p="${p.id}" ${sel === null ? 'disabled' : ''}>${ROSE(18)} ${sel === null ? 'Choose who gets your roses' : `Send ${n} to ${esc(p.cand[sel][0].split(',')[0])}`}</button><span class="send-left">${S.roses} roses left this month · ${plan().name}</span></div>`;
  const winner = p.status === 'closed' && tot ? `<section class="winner">${ic('crown')}<span class="eyebrow">Winner</span><b>${esc(p.cand[order[0]][0])}</b><span class="num">${roseCount(p.votes[order[0]])} · ${Math.round(p.votes[order[0]] * 100 / tot)}% of all roses</span></section>` : '';
  return { html: pageHead(p.cat) + `<div class="wrap">
    <section class="section poll-head">${pollBanner(p, 'big')}<h1 class="d-title">${esc(p.title)}</h1><p class="muted">${esc(p.desc)}</p>
      <div class="mini-chips" style="margin-top:10px"><span class="mini-chip">${ic('clock')}${pollWhen(p)}</span><span class="mini-chip rosechip">${ROSE(14)}${roseCount(tot)}</span>${p.status === 'live' ? `<span class="mini-chip green">${S.plan === 'basic' ? 'Needs Premium or VIP' : `${S.roses} roses left`}</span>` : ''}</div></section>
    ${winner}
    <section class="section"><div class="sec-head"><h2>${p.status === 'live' ? 'Leaderboard · tap to choose' : 'Final roses'}</h2></div><div class="cands">${rows}</div></section>
  </div>`, cta };
};

/* ---------- stories ---------- */
const STORY_USERS = [
  ['Abdul Rehman', PHOTO.family, 'Gave iftar to 40 families tonight. Alhamdulillah, may Allah accept it.'],
  ['Salma Begum', PHOTO.hospital, 'My mother’s eye surgery was done free at the Shifa camp. JazakAllah to every donor.'],
  ['Mohammad Arif', PHOTO.water, 'Clean water reached Sanawada today. The children were so happy.'],
  ['Fatima Khan', PHOTO.school, 'Our madrasa got its first digital board. Shukriya!'],
  ['Imran Ansari', PHOTO.boy, 'Winter kits are going out tonight. Join us if you can.'],
];
const BASE_POSTS = [
  { who: 'Iqra Education Trust', org: true, t: '2h', txt: 'Students of Faiz-ul-Uloom saying thank you for the new classroom. Your Sadaqah Jariyah at work.', photo: PHOTO.school, likes: 214 },
  { who: 'Al-Hilal Caterers, Mumbai', t: '5h', txt: 'Iftar boxes for gatherings of 50 to 500. 10% of every order goes to the madrasa meal campaign.', photo: PHOTO.family, likes: 86, sponsored: true },
  { who: 'Mohammad Arif', t: '1d', txt: 'Visited the Sanawada well with my family. Alhamdulillah for this blessing.', photo: PHOTO.water, likes: 132 },
];
// the foundation's ornamental frames, one per member tier; [x, y, size] of the photo hole in %
const FRAMES = [['img/frame-visitor.png', 49.1, 49.6, 51.3], ['img/frame-starter.png', 50.4, 50.9, 49.9], ['img/frame-supporter.png', 47.3, 51.5, 51.3], ['img/frame-silver.png', 47.3, 53.3, 44.2], ['img/frame-gold.png', 50.4, 55.1, 51.3], ['img/frame-platinum.png', 50.5, 54.6, 45.5], ['img/frame-diamond.png', 50.3, 56.9, 55.8], ['img/frame-crown.png', 53.5, 57.7, 53.2]];
const framed = (inner, tier, size) => { const [src, x, y, w] = FRAMES[tier]; return `<span class="framed" style="width:${size}px;height:${size}px"><span class="fr-hole" style="left:${x}%;top:${y}%;width:${w + 3}%;height:${w + 3}%">${inner}</span><img src="${src}" alt="" draggable="false"></span>`; };
const photoIn = ph => `<i style="background-image:url('${ph}')"></i>`;
const STORY_TIERS = [4, 2, 6, 3, 7];
const storyRings = (big) => `<div class="srings ${big ? 'big' : ''}"><button class="sring you" data-go="#/stories">${framed(avatar(S.user.name), tierOf(totalGiven()).i, big ? 78 : 70)}<i class="plus">${ic('plus')}</i><span>You</span></button>${STORY_USERS.map(([n, ph], i) => `<button class="sring" data-act="openStory" data-v="${i}">${framed(photoIn(ph), STORY_TIERS[i % STORY_TIERS.length], big ? 78 : 70)}<span>${esc(n.split(' ')[0])}</span></button>`).join('')}</div>`;
const storiesBlock = () => `<section class="home-sec">${secTitle('Donor stories', '', `<button class="text-link small" data-go="#/stories">Open ${ic('right')}</button>`)}${storyRings()}</section>`;

V.stories = () => {
  const c = S.compose, fee = c.promo ? (c.kind === 'video' ? 100 : 50) : 0;
  return { nav: 'community', html: `<header class="top"><div class="top-row"><h1 class="page-title">Community</h1><span class="spacer"></span><button class="wallet-chip" data-act="wallet">${ic('wallet')} <span class="num">${inr(S.wallet)}</span></button></div>${communitySwitch('stories')}</header>
  <div class="wrap">
    ${storyRings(true)}
    <section class="section compose">
      <div class="compose-row">${avatar(S.user.name)}<textarea class="textarea" id="post-txt" rows="2" placeholder="Share your story, a dua or a business update" data-model="compose.txt">${esc(c.txt)}</textarea></div>
      ${c.file ? `<div class="attach">${c.kind === 'video' ? ic('video') : ic('image')}<span>${esc(c.file)}</span><button data-act="clearAttach" aria-label="Remove attachment">${ic('x')}</button></div>` : ''}
      <div class="compose-tools"><label class="tool" for="post-photo">${ic('image')} Photo<input type="file" id="post-photo" accept="image/*" hidden></label><label class="tool" for="post-video">${ic('video')} Video<input type="file" id="post-video" accept="video/*" hidden></label>
        <span class="spacer"></span><button class="btn btn-main post-btn" data-act="postStory">Post</button></div>
      <div class="switch-row"><div class="txt"><b>Business promotion</b><span>Photo ₹50 · video ₹100, paid from your wallet. Videos go live after admin approval.</span></div><button class="switch ${c.promo ? 'on' : ''}" data-act="togglePromo" role="switch" aria-checked="${c.promo}" aria-label="Business promotion"></button></div>
      ${fee ? `<p class="small muted">${inr(fee)} will be taken from your wallet (balance ${inr(S.wallet)}).</p>` : ''}
    </section>
    ${secTitle('Community feed')}
    ${[...S.posts, ...BASE_POSTS].map((p, i) => `<article class="card post">
      <div class="post-head">${p.org ? `<div class="org-av" style="color:var(--brand)">${initials(p.who)}</div>` : avatar(p.who)}<div><b>${esc(p.who)}</b><div class="small muted">${p.t}${p.sponsored ? ' · <span class="spons">Sponsored</span>' : ''}</div></div></div>
      ${p.txt ? `<p class="post-text">${esc(p.txt)}</p>` : ''}
      ${p.pending ? `<div class="pending">${ic('clock')} Video waiting for admin approval</div>` : p.photo ? `<div class="post-photo" style="background-image:url('${p.photo}')"></div>` : ''}
      <div class="post-foot"><button class="${S.likedPosts.has(i) ? 'liked' : ''}" data-act="likePost" data-i="${i}">${ic('heart')} ${(p.likes || 0) + (S.likedPosts.has(i) ? 1 : 0)}</button><a href="https://wa.me/?text=${encodeURIComponent((p.txt || '') + ' — via ' + APP)}" target="_blank" rel="noopener">${ic('share')} Share</a></div>
    </article>`).join('')}
  </div>` };
};

/* ---------- ask for help / legal aid ---------- */
const LAWYERS = [['Adv. Rizwan Ahmed', 'Criminal & bail · 12 yrs', 'Delhi', 'Hindi, Urdu, English'], ['Adv. Sana Qureshi', 'Family & property · 9 yrs', 'Lucknow', 'Hindi, Urdu'], ['Adv. Imran Ansari', 'Civil & consumer · 15 yrs', 'Mumbai', 'Hindi, Marathi, English'], ['Adv. Nida Khan', 'Women & child rights · 7 yrs', 'Hyderabad', 'Urdu, Telugu, English']];
const HELP_TYPES = [['legal', 'Legal aid', 'scale'], ['medical', 'Treatment', 'pulse'], ['ration', 'Ration', 'utensils'], ['education', 'Education', 'book'], ['other', 'Other help', 'hands']];
V.help = () => {
  const t = S.ui.help, q = S.ui.lawyerQ.trim().toLowerCase();
  const lawyers = LAWYERS.filter(l => !q || l.join(' ').toLowerCase().includes(q));
  const body = t === 'legal' ? `
    <section class="section"><div class="sec-head"><h2>Free legal aid</h2><span class="status st-live">Free</span></div>
      <div class="steps-row">${['Share documents', 'Choose a lawyer', 'Get an appointment'].map((s, i) => `<div><i>${i + 1}</i><span>${s}</span></div>`).join('')}</div>
      <label class="search-bar" style="margin-top:12px">${ic('search')}<input id="lawyer-q" placeholder="Find a lawyer by name, city or case type" value="${esc(S.ui.lawyerQ)}" data-model="ui.lawyerQ" data-live="lawyers" autocomplete="off"></label></section>
    <section class="section" id="lawyer-list">${lawyerRows(lawyers)}</section>
    <p class="small muted" style="padding:0 4px">The court decides bail. We provide a free advocate and legal advice.</p>
    ${S.bookings.length ? `<section class="section"><div class="sec-head"><h2>My appointments</h2></div>${S.bookings.map(b => `<div class="dh-row"><span class="dh-ic">${ic('calendar')}</span><div class="dh-body"><b>${esc(b.lawyer)}</b><span class="small muted">${b.day} · ${b.slot} · ${esc(b.type)}</span></div><span class="status st-review">Requested</span></div>`).join('')}</section>` : ''}`
    : `<form class="section" data-form="helpReq" style="display:grid;gap:12px">
      <div class="field"><label for="h-name">Name of the person who needs help</label><input class="input" id="h-name" name="name" required value="${esc(S.user.name)}"></div>
      <div class="field"><label for="h-phone">Mobile number</label><input class="input num" id="h-phone" name="phone" inputmode="numeric" maxlength="10" required placeholder="98765 43210"></div>
      <div class="field"><label for="h-city">City</label><input class="input" id="h-city" name="city" required></div>
      <div class="field"><label for="h-need">What do you need?</label><textarea class="textarea" id="h-need" name="need" required placeholder="Tell us what happened and what help is needed"></textarea></div>
      <label class="doc-up" for="h-doc">${ic('upload')}<span class="txt"><b>Supporting document (optional)</b><span>Prescription, school letter, ration card…</span></span><input type="file" id="h-doc" accept="image/*,application/pdf" hidden></label>
      <button class="btn btn-main">Send request</button></form>
      ${S.helpReqs.length ? `<section class="section"><div class="sec-head"><h2>My requests</h2></div>${S.helpReqs.map(r => `<div class="dh-row"><span class="dh-ic">${ic('hands')}</span><div class="dh-body"><b>${esc(r.type)}</b><span class="small muted">${esc(r.city)} · ${r.date}</span></div><span class="status st-review">Under review</span></div>`).join('')}</section>` : ''}`;
  return { html: pageHead('Ask for help') + `<div class="chips">${HELP_TYPES.map(([k, l, i]) => `<button class="chip ${t === k ? 'on' : ''}" data-act="ui" data-k="help" data-v="${k}">${ic(i)}${l}</button>`).join('')}</div><div class="wrap">${body}</div>` };
};
function lawyerRows(list) {
  return list.length ? list.map(([n, spec, city, lang], i) => `<div class="person">${avatar(n)}<div class="who"><b>${esc(n)}</b><span>${spec} · ${city} · ${lang}</span></div><button class="btn btn-main book-btn" data-act="bookLawyer" data-v="${LAWYERS.findIndex(l => l[0] === n)}">Book</button></div>`).join('') : '<p class="muted small">No lawyer matches that search.</p>';
}

/* ---------- badges ---------- */
// membership badges unlock by total confirmed giving; identity badges by giving to a cause
const BADGES = [
  ['New member', 'Membership', 100, null, 'user', ['#d7dce4', '#7f8899']], ['Active member', 'Membership', 500, null, 'sprout', ['#8fe8b2', '#169a52']],
  ['Top contributor', 'Membership', 1000, null, 'star', ['#ffe28f', '#cf940c']], ['Diamond member', 'Membership', 5000, null, 'gem', ['#a8ecff', '#1592d0']],
  ['Royal member', 'Membership', 10000, null, 'crown', ['#e2c4ff', '#7536cf']], ['Elite member', 'Membership', 25000, null, 'medal', ['#ffd0b0', '#c4561d']],
  ['Food supporter', 'Cause', 0, 'food', 'utensils', ['#ffd9a0', '#d9822b']], ['Health hero', 'Cause', 0, 'medical', 'pulse', ['#b5e3ff', '#1d7cc4']],
  ['Education champion', 'Cause', 0, 'education', 'book', ['#d8c8ff', '#6040c8']], ['Madrasa supporter', 'Cause', 0, 'masjid', 'mosque', ['#a6edc8', '#0d8a58']],
  ['Legal supporter', 'Cause', 0, 'legal', 'scale', ['#c6ccff', '#3446b8']], ['Water bearer', 'Cause', 0, 'water', 'droplet', ['#aee8ff', '#1a8cc8']],
];
const badgeUnlocked = b => b[3] ? confirmed().some(d => camp(d.cid)?.cat === b[3]) : totalGiven() >= b[2];
const badgeArt = (b, size, locked) => { const [lt, dk] = locked ? ['#e6e8ec', '#a3a8b2'] : b[5]; return `<span class="badge-art" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 35% 30%, ${lt}, ${dk})">${ic(b[4])}${locked ? `<i class="blk">${ic('lock')}</i>` : ''}</span>`; };
const badgesBlock = () => { const got = BADGES.filter(badgeUnlocked).length; return `<section class="section">
  <div class="sec-head"><h2>My badges</h2><span class="pill-link green">${got}/${BADGES.length} earned</span></div>
  <p class="small muted" style="margin:-4px 0 10px">Badges unlock when your donation is confirmed. Tap “Set on profile” to show one around your photo.</p>
  <div class="badge-grid">${BADGES.map((b, i) => { const ok = badgeUnlocked(b); return `<div class="bdg ${ok ? '' : 'off'}">${badgeArt(b, 56, !ok)}<b>${b[0]}</b><span>${b[3] ? 'Give to ' + CATS[b[3]].label.toLowerCase() : inr(b[2]) + ' given'}</span>${ok ? (S.profileBadge === i ? '<span class="status st-live">On profile</span>' : `<button class="text-link small" data-act="setBadge" data-v="${i}">Set on profile</button>`) : ''}</div>`; }).join('')}</div></section>`; };

/* ---------- trophy & referral ---------- */
const TROPHIES = [['Silver Pearl', ['#f4f6fa', '#9aa3b2']], ['Emerald Gold', ['#7fe0b0', '#0b7a4c']], ['Ruby Rose', ['#ffb3c2', '#b0123e']], ['Royal Black-Gold', ['#f3d27a', '#2a2418']]];
const trophyName = n => TROPHIES[(n - 1) % 4][0] + (n > 4 ? ' II' : '');
const TROPHY_IMG = ['img/trophy-silver.jpg', 'img/trophy-emerald.jpg', 'img/trophy-ruby.jpg', 'img/trophy-black-gold.jpg'];
const trophyArt = (n, size) => `<img class="trophy-art" src="${TROPHY_IMG[(n - 1) % 4]}" alt="${trophyName(n)} trophy" style="height:${Math.round(size * 1.3)}px" loading="lazy">`;

let evHold = 0;
document.addEventListener('scroll', e => {
  if (e.target.id !== 'ev-track') return;
  const t = e.target, i = Math.round(t.scrollLeft / t.clientWidth);
  [...document.getElementById('ev-dots').children].forEach((d, k) => d.classList.toggle('on', k === i));
}, true);
document.addEventListener('pointerdown', e => { if (e.target.closest('#ev-track')) evHold = Date.now(); });
setInterval(() => {
  const t = document.getElementById('ev-track');
  if (!t || document.hidden || S.look.saver || Date.now() - evHold < 8000) return;
  const n = t.children.length, i = Math.round(t.scrollLeft / t.clientWidth);
  t.scrollTo({ left: ((i + 1) % n) * t.clientWidth, behavior: 'smooth' });
}, 5000);

// swipe left/right on the welcome tour
let tourX = null;
document.addEventListener('touchstart', e => { tourX = e.target.closest('#tour-track') ? e.touches[0].clientX : null; }, { passive: true });
document.addEventListener('touchend', e => {
  if (tourX == null) return;
  const dx = e.changedTouches[0].clientX - tourX; tourX = null;
  if (Math.abs(dx) < 45) return;
  S.ui.tour = Math.max(0, Math.min(TOUR.length - 1, (S.ui.tour || 0) + (dx < 0 ? 1 : -1))); rerender();
}, { passive: true });

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
  // small floating rose button for the contests, bottom right above the tab bar
  app.innerHTML = view.html + (view.nav ? navBar(view.nav) + (view.nav === 'vote' ? '' : `<button class="rose-fab" data-go="#/vote" aria-label="Rose contests">${ROSE(26)}</button>`) : '') + (view.cta ? `<div class="fixed-col cta-bar">${view.cta}</div>` : '');
  if (changed) window.scrollTo(0, 0);
  if (S.greet && name === 'home') { S.greet = false; setTimeout(greet, 500); }
}
const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
const go = h => { if (location.hash === h) rerender(); else location.hash = h; };
const replaceRoute = h => location.replace(location.href.split('#')[0] + h);
window.addEventListener('hashchange', render);

/* ---------- interactions ---------- */
function greet() {
  const friday = new Date().getDay() === 5;
  const g = document.createElement('div');
  g.className = 'greet fixed-col'; g.setAttribute('role', 'status');
  g.innerHTML = `<div class="greet-card"><span class="greet-ic">${LOGO}</span><div><b>Assalamu alaikum, ${esc(S.user.first)}!</b><p>${friday ? 'Jumu‘ah Mubarak. ' : ''}${hijri() ? hijri() + '. ' : ''}2,481 people were helped today. Start your day with a small Sadaqah.</p></div></div>`;
  g.addEventListener('click', () => g.remove());
  document.body.appendChild(g);
  setTimeout(() => g.remove(), 6000);
}
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
  logout: () => { S.signed = false; try { localStorage.removeItem('mlp-user'); } catch { /* nothing stored */ } S.login = { stage: 'details', role: 'donor', name: '', email: '', phone: '', err: {} }; replaceRoute('#/intro'); },
  splashNext: () => replaceRoute(S.signed ? '#/home' : '#/intro'),
  tourNext: () => { S.ui.tour = Math.min(TOUR.length - 1, (S.ui.tour || 0) + 1); rerender(); },
  toggleInterest: el => { const a = S.login.interests, k = el.dataset.v; a.includes(k) ? a.splice(a.indexOf(k), 1) : a.push(k); rerender(); },
  svc: el => { const [k, v] = el.dataset.v.split(/:(.+)/); if (k === 'go') go(v); else if (k === 'camp') go('#/c/' + v); else if (k === 'cat') { S.ui.cat = v; S.ui.home = 'all'; go('#/campaigns'); } else A[v](el); },
  pickCand: el => { S.ui.pollSel[el.dataset.p] = Number(el.dataset.v); rerender(); },
  roseQty: el => { S.ui.extra = Number(el.dataset.v); rerender(); },
  sendRoses: el => {
    if (S.plan === 'basic') return packagesSheet('Basic lets you watch contests. Get Premium or VIP to send roses.');
    const p = poll(el.dataset.p), mv = myVotes(p.id), o = S.ui.pollSel[p.id] ?? mv.rec.at(-1)?.o, n = S.ui.extra;
    if (o == null) return toast('Choose who gets your roses');
    if (n > S.roses) return packagesSheet(`You have ${S.roses} roses left this month. Upgrade for more.`);
    S.roses -= n; p.votes[o] += n; mv.rec.push({ o, n, amt: 0, id: 'R' + Date.now().toString(36).toUpperCase() });
    S.ui.extra = 1; toast(`${roseCount(n)} sent to ${p.cand[o][0]}. JazakAllah Khair!`); rerender();
  },
  packages: () => packagesSheet(),
  buyPlan: el => {
    const x = PLANS.find(k => k.id === el.dataset.v);
    el.closest('.scrim')?.remove();
    const ov = document.createElement('div'); ov.className = 'processing';
    ov.innerHTML = `<div class="spin"></div><div>Waiting for UPI approval…<div class="small muted" style="margin-top:4px">Demo payment of ₹${x.price} for ${x.name}, no money is charged</div></div>`;
    document.body.appendChild(ov);
    setTimeout(() => { ov.remove(); S.plan = x.id; S.roses += x.roses; toast(`${x.name} is active. ${x.roses} roses added.`); rerender(); }, 1200);
  },
  voteRules: () => sheet(`<h2>How roses work</h2><div class="rules" style="margin-top:10px"><span>Send roses to the person, place or project you support. The one with the most roses wins.</span><span>Basic is free for watching. Premium (₹99) gives 50 roses a month, VIP (₹299) gives 200 roses and extras.</span><span>The rose count is public and updates live.</span><span>Roses are a contribution to the foundation's work.</span></div><button class="btn btn-soft btn-block" style="margin-top:14px" data-close>Got it</button>`),
  openStory: el => {
    let i = Number(el.dataset.v); const v = document.createElement('div'); v.className = 'story-view';
    const show = () => { const [n, ph, txt] = STORY_USERS[i]; v.innerHTML = `<div class="sv-img" style="background-image:url('${ph}')"></div><div class="sv-bars">${STORY_USERS.map((x, k) => `<i class="${k < i ? 'done' : k === i ? 'run' : ''}"></i>`).join('')}</div><div class="sv-top">${avatar(n)}<b>${esc(n)}</b><button class="sv-x" aria-label="Close">${ic('x')}</button></div><p class="sv-txt">${esc(txt)}</p>`; };
    const next = () => { i += 1; if (i >= STORY_USERS.length) { clearInterval(t); v.remove(); } else show(); };
    show(); document.body.appendChild(v); const t = setInterval(next, 4500);
    v.addEventListener('click', e => { if (e.target.closest('.sv-x')) { clearInterval(t); v.remove(); } else next(); });
  },
  togglePromo: () => { S.compose.promo = !S.compose.promo; rerender(); },
  clearAttach: () => { Object.assign(S.compose, { file: '', kind: '', data: '' }); rerender(); },
  postStory: () => {
    const c = S.compose, fee = c.promo ? (c.kind === 'video' ? 100 : 50) : 0;
    if (!c.txt.trim() && !c.file) return toast('Write something or add a photo or video');
    if (fee > S.wallet) { toast(`Your wallet needs ${inr(fee - S.wallet)} more`); return A.wallet(); }
    S.wallet -= fee;
    S.posts.unshift({ who: S.user.name, t: 'Just now', txt: c.txt.trim(), photo: c.kind === 'image' ? c.data : null, pending: c.kind === 'video', sponsored: c.promo, likes: 0 });
    toast(c.kind === 'video' ? 'Posted. Your video goes live after admin approval.' : fee ? `Posted as a promotion. ${inr(fee)} paid from your wallet.` : 'Posted to the community feed');
    S.compose = { txt: '', file: '', kind: '', promo: false }; rerender();
  },
  likePost: el => { const i = Number(el.dataset.i); S.likedPosts.has(i) ? S.likedPosts.delete(i) : S.likedPosts.add(i); rerender(); },
  wallet: () => sheet(`<h2>Wallet</h2><p class="muted small">Used for business promotions and extra votes.</p><div class="wallet-bal"><span class="muted small">Balance</span><b class="num">${inr(S.wallet)}</b></div>
    <div class="amounts" style="grid-template-columns:repeat(4,1fr);margin-top:12px">${[100, 500, 1000, 5000].map(a => `<button data-act="recharge" data-v="${a}" data-close>+${inr(a)}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:10px">Demo recharge. The real app adds money through UPI or card.</p>`),
  recharge: el => { S.wallet += Number(el.dataset.v); toast(`${inr(Number(el.dataset.v))} added to your wallet`); rerender(); },
  bookLawyer: el => { const l = LAWYERS[Number(el.dataset.v)], days = [1, 2, 3, 4, 5].map(k => new Date(Date.now() + k * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
    sheet(`<h2>Book ${esc(l[0])}</h2><p class="muted small">${l[1]} · ${l[2]} · free first consultation</p>
    <form data-form="booking" data-v="${el.dataset.v}" style="display:grid;gap:10px;margin-top:12px">
      <div class="field"><label for="b-day">Day</label><select class="select" id="b-day" name="day">${days.map(d => `<option>${d}</option>`).join('')}</select></div>
      <div class="field"><label for="b-slot">Time</label><select class="select" id="b-slot" name="slot">${['10:00 am', '11:30 am', '2:00 pm', '4:30 pm'].map(t => `<option>${t}</option>`).join('')}</select></div>
      <div class="field"><label for="b-type">Case type</label><select class="select" id="b-type" name="type">${['Bail', 'Family', 'Property', 'Consumer', 'Other'].map(t => `<option>${t}</option>`).join('')}</select></div>
      <div class="field"><label for="b-brief">Short description</label><textarea class="textarea" id="b-brief" name="brief" style="min-height:90px" placeholder="What is the case about?"></textarea></div>
      <button class="btn btn-main">Request appointment</button></form>`); },
  setBadge: el => { S.profileBadge = Number(el.dataset.v); toast(BADGES[S.profileBadge][0] + ' badge set on your profile'); rerender(); },
  setLook: el => { const k = el.dataset.k, v = el.dataset.v; S.look[k] = k === 'saver' ? v === 'true' : v; applyLook(); rerender(); },
  toRegister: () => document.getElementById('reg-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
  trophyHelp: () => sheet(`<h2>How trophies work</h2><div class="rules" style="margin-top:10px"><span>Register and get your own referral code.</span><span>Share it with family and friends. They enter it when they join the app.</span><span>Every 500 people who join with your code earn you the next trophy and a certificate.</span><span>Trophies are permanent and shown on your profile.</span></div><button class="btn btn-soft btn-block" style="margin-top:14px" data-close>Got it</button>`),
  pickTrophy: el => { S.ui.trophy = Number(el.dataset.v); rerender(); },
  hq: el => { const n = HADITH.length, cur = S.ui.hq ?? Math.floor(Date.now() / 864e5) % n; S.ui.hq = (cur + Number(el.dataset.v) + n) % n; rerender(); },
  setMode: el => { S.mode = el.dataset.v; try { localStorage.setItem('mlp-mode', S.mode); } catch { /* storage blocked: lasts this session */ } applyTheme(themeFor()); rerender(); },
  pickTheme: el => { S.userTheme = el.dataset.v; applyTheme(el.dataset.v); try { localStorage.setItem('mlp-theme', el.dataset.v); } catch { /* storage blocked: theme lasts for this session */ } toast(theme().name + ' theme on'); rerender(); },
  joinCreator: () => sheet(`<h2>Register for trophies</h2><p class="muted small">Your code lets us count everyone who joins through you.</p>
    <form data-form="creator" style="display:grid;gap:10px;margin-top:12px">
      <div class="field"><label for="cr-name">Full name</label><input class="input" id="cr-name" name="name" required value="${esc(S.user.name)}"></div>
      <div class="field"><label for="cr-city">City</label><input class="input" id="cr-city" name="city" required></div>
      <div class="field"><label for="cr-phone">Mobile number</label><input class="input num" id="cr-phone" name="phone" inputmode="numeric" maxlength="10" required placeholder="98765 43210"></div>
      <span class="err" id="cr-err"></span><button class="btn btn-main">Register and get my code</button></form>`),
  quickGive: el => { S.donate = { cid: Number(el.dataset.c) || 9, amount: 1000, custom: el.dataset.v, other: true, type: 'Sadaqah', anon: false, tip: 0, pay: 'upi' }; go('#/donate/' + (Number(el.dataset.c) || 9)); },
  svcZakat: () => { S.ui.zakatOnly = true; S.ui.cat = 'all'; go('#/search'); },
  svcJariyah: () => { S.ui.cat = 'water'; S.ui.home = 'all'; go('#/campaigns'); },
  svcFood: () => { S.ui.cat = 'food'; S.ui.home = 'all'; go('#/campaigns'); },
  svcOrphans: () => { S.ui.cat = 'orphans'; S.ui.home = 'all'; go('#/campaigns'); },
  svcStart: () => go('#/start'),
  svcEdu: () => { S.ui.cat = 'education'; S.ui.home = 'all'; go('#/campaigns'); },
  fidya: () => sheet(`<h2>Fidya & Kaffarah</h2><p class="muted">Missed fasts you cannot make up? Fidya feeds one person for each missed fast. Kaffarah for a broken fast feeds 60 people.</p>
    <div class="summary" style="margin-top:14px"><div><span>Fidya, per fast</span><b class="num">₹150</b></div><div><span>Kaffarah, per broken fast (60 × ₹150)</span><b class="num">₹9,000</b></div></div>
    <button class="btn btn-main btn-block" style="margin-top:16px" data-close data-act="quickGive" data-v="150">Give Fidya for 1 fast</button>`),
  qurbani: () => sheet(`<h2>Qurbani</h2><p class="muted">Book your Qurbani share and we deliver the meat to families in need on Eid al-Adha.</p>
    <div class="radio-list" style="margin-top:14px">${[['Goat (1 share)', '₹9,500'], ['Cow (1 of 7 shares)', '₹4,200']].map(([l, pr]) => `<div class="radio"><span class="ic">${ic('calendar')}</span><span class="txt"><b>${l}</b><span>Distributed in India</span></span><b class="num">${pr}</b></div>`).join('')}</div>
    <button class="btn btn-soft btn-block" style="margin-top:14px" data-close data-act="toast" data-msg="We’ll remind you when Qurbani booking opens">Remind me before Eid al-Adha</button>`),
  zakatCalc: () => sheet(`<h2>Zakat calculator</h2><p class="muted small">Zakat is 2.5% of wealth you have held for a lunar year, if it is above the nisab (${inr(NISAB)}, based on silver).</p>
    <div style="display:grid;gap:10px;margin-top:12px">${[['z-cash', 'Cash and bank balance'], ['z-gold', 'Gold and silver (market value)'], ['z-inv', 'Investments and savings'], ['z-owed', 'Money owed to you'], ['z-debt', 'Debts and bills due now']].map(([id, l]) => `<div class="field"><label for="${id}">${l}</label><div class="prefix"><span>₹</span><input class="input num" id="${id}" inputmode="numeric" placeholder="0" data-zakat></div></div>`).join('')}</div>
    <div class="zakat-out" id="zakat-out">${zakatOut(0)}</div>
    <button class="btn btn-main btn-block" style="margin-top:12px" data-close data-act="svcZakat">Find Zakat-eligible causes</button>`),

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
    S.user.lang = l.lang; S.user.interests = l.interests.slice();
    if (l.email.trim()) S.user.email = l.email.trim();
    l.stage = 'details'; S.greet = true;
    S.signed = true;
    try { localStorage.setItem('mlp-user', JSON.stringify(S.user)); } catch { /* storage blocked: sign in again next time */ }
    replaceRoute('#/home');
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

const zakatOut = net => `<div><span>Zakatable wealth</span><b class="num">${inr(Math.max(0, net))}</b></div><div class="total"><span>Zakat due</span><b class="num">${inr(zakatDue(net))}</b></div>${net > 0 && net < NISAB ? '<p class="small muted">Below the nisab, so no Zakat is due this year.</p>' : ''}`;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.zakat !== undefined) {
    const v = id => Number(document.getElementById(id).value.replace(/\D/g, '')) || 0;
    document.getElementById('zakat-out').innerHTML = zakatOut(v('z-cash') + v('z-gold') + v('z-inv') + v('z-owed') - v('z-debt'));
    return;
  }
  if (el.dataset.otp) { if (el.value && el.nextElementSibling) el.nextElementSibling.focus(); return; }
  if (!el.dataset.model) return;
  setPath(el.dataset.model, el.value);
  const live = el.dataset.live;
  if (live === 'donate') { const c = camp(S.donate.cid); document.getElementById('impact').innerHTML = impactLine(c); document.getElementById('summary').innerHTML = summary(); document.getElementById('paybtn').textContent = payLabel(); }
  if (live === 'search') document.getElementById('results').innerHTML = results();
  if (live === 'lawyers') { const q = S.ui.lawyerQ.trim().toLowerCase(); document.getElementById('lawyer-list').innerHTML = lawyerRows(LAWYERS.filter(l => !q || l.join(' ').toLowerCase().includes(q))); }
  if (live === 'count') document.getElementById('count').textContent = `${el.value.length} characters · at least 50`;
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.model && el.tagName === 'SELECT') setPath(el.dataset.model, el.value);
  if (el.type !== 'file' || !el.files.length) return;
  if (el.id === 'cr-photo') { const r = new FileReader(); r.onload = () => { S.crPhoto = r.result; rerender(); }; r.readAsDataURL(el.files[0]); return; }
  if (el.id === 'post-photo' || el.id === 'post-video') {
    const f = el.files[0]; Object.assign(S.compose, { file: f.name, kind: el.id === 'post-video' ? 'video' : 'image', data: '' });
    if (S.compose.kind === 'image') { const r = new FileReader(); r.onload = () => { S.compose.data = r.result; rerender(); }; r.readAsDataURL(f); } else rerender();
    return;
  }
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
  } else if (kind === 'creator') {
    if (!/^[6-9]\d{9}$/.test(f.phone.value.replace(/\D/g, ''))) { f.querySelector('#cr-err').textContent = 'Enter a valid 10-digit mobile number.'; return; }
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    S.creator = { code: 'MLP-' + Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join(''), name: f.name.value.trim(), city: f.city.value.trim(), date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) };
    f.closest('.scrim')?.remove(); toast('Your referral code is ready'); rerender(); window.scrollTo(0, 0);
  } else if (kind === 'joinCode') {
    const ph = f.phone.value.replace(/\D/g, ''), code = f.code.value.trim().toUpperCase(), err = t => { f.querySelector('#join-err').textContent = t; };
    const known = [S.creator?.code, 'MLP-RIZWAN', 'MLP-SALMA2'].filter(Boolean);
    if (!/^[6-9]\d{9}$/.test(ph)) return err('Enter a valid 10-digit mobile number.');
    if (!known.includes(code)) return err('This code was not found. Check it with the person who shared it.');
    if (S.joins.some(j => j.phone === ph)) return err('This mobile number has already joined.');
    S.joins.push({ name: f.name.value.trim(), phone: ph, code }); toast('Welcome! You joined with code ' + code); rerender();
  } else if (kind === 'helpReq') {
    if (!/^[6-9]\d{9}$/.test(f.phone.value.replace(/\D/g, ''))) { toast('Enter a valid 10-digit mobile number'); return; }
    S.helpReqs.unshift({ type: HELP_TYPES.find(h => h[0] === S.ui.help)[1], city: f.city.value.trim(), date: 'Today' });
    toast('Request sent. Our team will call you within 48 hours.'); rerender();
  } else if (kind === 'booking') {
    const l = LAWYERS[Number(f.dataset.v)];
    S.bookings.unshift({ lawyer: l[0], day: f.day.value, slot: f.slot.value, type: f.type.value });
    f.closest('.scrim').remove(); toast('Appointment requested. The lawyer’s office will call you.'); rerender();
  } else if (kind === 'contact') { f.reset(); toast('Message sent. We’ll reply by email.'); }
  else if (kind === 'update') {
    const c = camp(6); c.updates.unshift(['Just now', f.querySelector('textarea').value.trim()]);
    f.closest('.scrim').remove(); toast('Update posted. Donors have been notified.');
  }
});

try { S.mode = localStorage.getItem('mlp-mode') || 'light'; } catch { S.mode = 'light'; }
applyTheme(themeFor());
try { Object.assign(S.look, JSON.parse(localStorage.getItem('mlp-look')) || {}); } catch { /* no storage: default look */ }
applyLook();
let signedIn = false;
try { const u = JSON.parse(localStorage.getItem('mlp-user')); if (u && u.name) { Object.assign(S.user, u); signedIn = S.signed = true; } } catch { /* not signed in */ }
// a signed-in person skips the welcome and sign-up screens on every later launch
if (!location.hash || (signedIn && /^#\/(splash|intro|login)?$/.test(location.hash))) replaceRoute(signedIn ? '#/home' : '#/splash');
render();
