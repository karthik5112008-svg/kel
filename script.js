/* =====================================================
   Santhai Prime Marketplace — script.js
   500 Branded Products | Full Marketplace Engine
   ===================================================== */

'use strict';

// ── State ──────────────────────────────────────────
const State = {
  cart: JSON.parse(localStorage.getItem('sp_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('sp_wishlist') || '[]'),
  orders: JSON.parse(localStorage.getItem('sp_orders') || '[]'),
  location: JSON.parse(localStorage.getItem('sp_location') || 'null') || { city: 'Chennai', pincode: '600001', lat: 13.0827, lon: 80.2707 },
  apiKey: localStorage.getItem('sp_api_key') || generateApiKey(),
  coupon: null,
  currentFilter: 'All',
  currentSort: 'popular',
  brandFilter: 'all',
  priceFilter: 'all',
  distFilter: '999',
  ratingFilter: '0',
  searchQuery: '',
  displayedCount: 0,
  PAGE_SIZE: 24,
};

function saveState() {
  localStorage.setItem('sp_cart', JSON.stringify(State.cart));
  localStorage.setItem('sp_wishlist', JSON.stringify(State.wishlist));
  localStorage.setItem('sp_orders', JSON.stringify(State.orders));
  localStorage.setItem('sp_location', JSON.stringify(State.location));
  localStorage.setItem('sp_api_key', State.apiKey);
}

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rand = (n) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `sk_live_santhai_9488467006_${rand(8)}_${rand(12)}`;
}

// ── Image Pools ────────────────────────────────────
const IMAGE_POOLS = {
  audio:      ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80','https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80','https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80','https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'],
  laptop:     ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80','https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80','https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80'],
  smartwatch: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80','https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80'],
  snack:      ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80','https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80','https://images.unsplash.com/photo-1586495777744-4e6232bf2f92?w=600&q=80','https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80'],
  appliance:  ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80','https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80'],
  phone:      ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80','https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80','https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80'],
  tv:         ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80','https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&q=80'],
  gaming:     ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80','https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&q=80','https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=600&q=80'],
  camera:     ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'],
  furniture:  ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80'],
  kitchen:    ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80','https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80'],
  grooming:   ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80','https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80'],
  default:    ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'],
};

function getImg(pool, idx) {
  const arr = IMAGE_POOLS[pool] || IMAGE_POOLS.default;
  return arr[idx % arr.length];
}

// ── 500 Branded Products Catalog ──────────────────
function generate500Catalog() {
  const items = [];
  let id = 1;

  const def = (cat, brand, name, price, mrp, rating, rcount, pool, desc, specs, delivery, dist) => ({
    id: id++, cat, brand, name, price, mrp,
    discount: Math.round((1 - price / mrp) * 100),
    rating, rcount, img: getImg(pool, id),
    desc, specs, delivery, dist,
    emi: price > 4999 ? `EMI from ₹${Math.round(price / 12).toLocaleString('en-IN')}/mo` : null,
  });

  // ── AUDIO (50) ──
  const audioData = [
    ['Infinity','Glide 500 Wireless Headphones',3499,6999,4.7,2841,'Powerful 40mm drivers, 30h battery, foldable design'],
    ['Infinity','Rockerz 600 Bluetooth Headset',2799,5499,4.6,1923,'Shark-fin ear tips, 20h playback, dual EQ modes'],
    ['Infinity','Tranz 700 True Wireless',4999,9999,4.8,3201,'6mm drivers, IPX5 rated, 30h total battery'],
    ['Infinity','Fuze 100 Neckband',1299,2499,4.5,4102,'10mm driver, 12h playback, magnetic earbuds'],
    ['Infinity','Glide 120 Wired',699,1299,4.4,980,'Flat tangle-free cable, in-line mic & remote'],
    ['Sony','WH-1000XM5 ANC',29999,34990,4.9,7821,'Industry-leading ANC, 30h battery, multipoint'],
    ['Sony','WF-1000XM4 TWS',17999,22999,4.8,5432,'8mm driver, 36h total battery, LDAC support'],
    ['Sony','WH-CH720N Wireless',9999,14999,4.7,3201,'ANC, 35h battery, 360 Reality Audio'],
    ['Sony','LinkBuds S TWS',11999,16990,4.7,2103,'Truly seamless ANC, IPX4, multipoint connect'],
    ['Sony','MDR-XB550AP Wired',2499,3999,4.5,1780,'Extra bass 30mm driver, in-line remote'],
    ['Bose','QuietComfort 45',29500,33000,4.9,6201,'World-class ANC, 24h battery, foldable'],
    ['Bose','SoundSport Free TWS',14999,18990,4.6,2100,'Sport-focused, secure fit, IPX4, 5h+10h'],
    ['Bose','Sport Earbuds',9499,13000,4.5,1802,'StayHear Max tips, IPX4, voice prompts'],
    ['JBL','Tune 760NC',6999,11999,4.6,4321,'ANC, 35h battery, hands-free calls, app'],
    ['JBL','Free X TWS',5499,9999,4.5,2900,'6h+20h battery, JBL Ambient Aware'],
    ['JBL','Charge 5 Bluetooth Speaker',14999,19999,4.8,6720,'IP67, PartyBoost, powerbank output'],
    ['JBL','Flip 6 Bluetooth Speaker',9999,14999,4.7,5203,'IP67, 12h playtime, signature JBL Pro Sound'],
    ['JBL','Xtreme 3 Portable Speaker',24999,32999,4.8,3100,'IP67, 15h, PartyBoost, USB-C PD'],
    ['Sennheiser','HD 599 Open-Back',9999,14990,4.8,1902,'Open-back, wide soundstage, velour pads'],
    ['Sennheiser','CX 400BT TWS',6499,9999,4.6,2100,'7mm driver, 7h+13h battery, touch controls'],
    ['Jabra','Elite 75t TWS',8999,13990,4.7,2800,'5.5mm driver, 28h total, IP55, ANC'],
    ['Jabra','Elite 85t TWS',12499,17990,4.8,1980,'Adjustable ANC, 5.5mm, 25h + case'],
    ['Skullcandy','Crusher Evo',8999,13999,4.5,1400,'Sensory bass, 40h battery, personal sound'],
    ['Skullcandy','Indy Evo TWS',5499,8499,4.4,1200,'6h+20h battery, IP55, voice control'],
    ['Marshall','Monitor II ANC',22999,29990,4.8,1600,'ANC, 30h battery, retro signature design'],
    ['Marshall','Emberton II Speaker',11999,15990,4.7,2300,'IP67, 30h battery, 360° sound, stack-and-play'],
    ['Boat','Rockerz 450 Wireless',1699,3499,4.5,15200,'15h battery, 40mm driver, soft padded earcups'],
    ['Boat','Airdopes 141 TWS',1199,2999,4.4,21000,'IPX4, 42h total, ASAP Charge, ENx tech'],
    ['Boat','Stone 1200 Speaker',2999,5999,4.5,8200,'14W output, IPX5, TWS pairing, 12h'],
    ['Boat','Rockerz 255 Neckband',999,1999,4.3,18900,'10h battery, IPX5, voice assistant, magnetic'],
    ['Noise','Air Buds 3 TWS',2299,4499,4.5,9800,'Playtime of 50h total, IPX5, gaming mode'],
    ['OnePlus','Buds Pro 2 TWS',9999,12999,4.8,4200,'LHDC, 48dB ANC, 39h battery, dual drivers'],
    ['OnePlus','Bullets Z2 BT Neckband',2499,3999,4.6,3800,'12.4mm, 30h, IP55, magnetic earbuds'],
    ['realme','Buds Air 5 Pro TWS',5299,7999,4.6,3100,'50dB ANC, 9.2mm LCP driver, LDAC'],
    ['Nothing','Ear (2) TWS',8999,11999,4.7,2600,'11.6mm driver, 36dB ANC, LHDC 5.0'],
    ['Harman Kardon','Onyx Studio 8',29999,39990,4.8,1200,'Dual 50W, 8h battery, premium Kashmiri fabric'],
    ['Plantronics','BackBeat Pro 5100',9999,14999,4.6,800,'ANC, 30h, Corded charging case'],
    ['Anker','Soundcore Q45 ANC',5999,8999,4.6,5800,'50h battery, Hi-Res Audio, ANC'],
    ['Anker','Soundcore Liberty 4 NC',7999,11999,4.7,3200,'98dB ANC, LDAC, adaptive EQ'],
    ['Apple','AirPods Pro 2nd Gen',24900,26900,4.9,12000,'H2 chip, ANC, Transparency mode, MagSafe'],
    ['Apple','AirPods 3rd Gen',19900,21900,4.8,9800,'Spatial Audio, IPX4, 30h total battery'],
    ['Samsung','Galaxy Buds2 Pro TWS',14499,17999,4.7,5200,'360° Audio, 29dB ANC, Bixby Voice Wake'],
    ['Mivi','DuoPods A25 TWS',699,1499,4.3,8900,'50h total, ENC mic, IPX5, type-C'],
    ['Zebronics','Zeb-Bloom Speaker',1499,2999,4.2,4100,'10W, RGB lighting, TWS pairing, FM radio'],
    ['Boult','Z40 TWS',1299,2999,4.4,7200,'42h total, ENx mic, IPX5, gaming mode'],
    ['pTron','Bassbuds Duo 2 TWS',599,1299,4.2,11000,'48h playtime, IPX4, BT 5.1'],
    ['Crossloop','Atom Pro TWS',1799,3499,4.4,3100,'40h total, IPX5, 13mm driver'],
    ['Wecool','Moonwalk TWS',999,2499,4.3,4500,'30h total, 6mm driver, type-C'],
    ['Portronics','Harmonics Twins S11',1399,2799,4.3,5600,'36h total, IPX5, type-C, ENC'],
    ['Fastrack','Reflex Tunes Neckband',1499,2599,4.4,6300,'10h battery, Bluetooth 5.0, IPX4'],
  ];
  audioData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Infinity Audio & Sound', brand, name, price, mrp, rating, rcount, 'audio', desc,
      {Type:'Wireless Audio','Battery Life':'Up to 40h','Connectivity':'Bluetooth 5.3','Warranty':'1 Year',Colour:'Midnight Black'},
      rcount > 1000 ? '2-hour Express' : 'Same Day', +(Math.random() * 14 + 1).toFixed(1)));
  });

  // ── LAPTOPS (40) ──
  const laptopData = [
    ['Apple','MacBook Air M3 13"',114900,124900,4.9,6800,'8-core CPU, 10-core GPU, 18h battery, 8GB RAM, 256GB SSD'],
    ['Apple','MacBook Pro M3 Pro 14"',199900,209900,4.9,4200,'11-core CPU, 18-core GPU, 18GB RAM, 512GB SSD'],
    ['Apple','MacBook Air M2 13"',99900,114900,4.8,9100,'8-core CPU, 18h battery, Liquid Retina display'],
    ['Apple','MacBook Pro M2 16"',249900,259900,4.9,2800,'12-core CPU, 19-core GPU, 512GB SSD, 16GB RAM'],
    ['Dell','XPS 15 (2024)',149990,174990,4.8,3200,'Intel i9-13900H, 32GB RAM, 1TB SSD, OLED 3.5K'],
    ['Dell','Inspiron 15 3520',55990,64990,4.5,8900,'Intel i5-1235U, 8GB RAM, 512GB SSD, Full HD'],
    ['Dell','G15 Gaming Laptop',84990,99990,4.7,4500,'RTX 3060, Intel i7-12700H, 16GB RAM, 512GB SSD'],
    ['Dell','Vostro 14 3430',48990,57990,4.4,6700,'Intel i5-1335U, 8GB RAM, 512GB SSD, Win11 Home'],
    ['HP','Spectre x360 14',159990,179990,4.8,2800,'Intel i7-1355U, 16GB RAM, 1TB SSD, OLED touch'],
    ['HP','Pavilion 15 (2024)',64990,74990,4.5,7200,'Intel i5-1235U, 16GB RAM, 512GB, Full HD IPS'],
    ['HP','Omen 16 Gaming',104990,124990,4.7,3100,'RTX 4060, AMD R7-7745HX, 16GB DDR5, 512GB'],
    ['HP','EliteBook 840 G10',129990,149990,4.8,1900,'Intel i7-1355U, vPro, 16GB, 512GB, 4G LTE'],
    ['Lenovo','ThinkPad X1 Carbon Gen 11',149990,169990,4.9,2300,'Intel i7-1365U vPro, 16GB LPDDR5, 512GB SSD'],
    ['Lenovo','IdeaPad Slim 5 (2024)',59990,69990,4.6,9800,'AMD R7-7730U, 16GB RAM, 512GB SSD, 90Hz IPS'],
    ['Lenovo','Legion 5 Pro Gaming',109990,129990,4.8,4800,'RTX 4070, AMD R7-7745HX, 16GB DDR5, 512GB'],
    ['Lenovo','Yoga 9i 2-in-1',139990,159990,4.7,2100,'Intel i7-1360P, 16GB LPDDR5, 512GB SSD, OLED'],
    ['Asus','ROG Zephyrus G14',134990,154990,4.9,5600,'AMD R9-7940HS, RTX 4060, 16GB DDR5, 2K 165Hz'],
    ['Asus','VivoBook 15 (2024)',52990,62990,4.5,11000,'Intel i5-13500H, 16GB RAM, 512GB SSD, FHD'],
    ['Asus','TUF Gaming A15',74990,89990,4.7,7200,'AMD R7-7435HS, RTX 4060, 16GB, 512GB, 144Hz'],
    ['Asus','Zenbook 14 OLED',89990,104990,4.8,3400,'Intel i5-1340P, 16GB, 512GB, 2.8K OLED 90Hz'],
    ['Acer','Predator Helios 300',89990,104990,4.7,5800,'Intel i7-12700H, RTX 3070Ti, 16GB, 512GB, 165Hz'],
    ['Acer','Aspire Lite 15',42990,52990,4.4,9800,'Intel i5-1235U, 8GB RAM, 512GB SSD, Full HD'],
    ['Acer','Nitro 5 Gaming',68990,84990,4.6,8100,'AMD R7-6800H, RTX 3060, 16GB, 512GB, 144Hz'],
    ['Acer','Swift 3 (2024)',59990,69990,4.5,6300,'AMD R7-7730U, 16GB, 512GB, Full HD IPS'],
    ['MSI','Raider GE76 RTX 4090',329990,369990,4.9,1200,'Intel i9-13980HX, 32GB DDR5, 2TB SSD, QHD 240Hz'],
    ['MSI','Stealth 15M Gaming',94990,114990,4.7,2100,'RTX 4060, Intel i7-12700H, 16GB, 512GB, 144Hz'],
    ['MSI','Modern 14 Business',49990,59990,4.5,4200,'Intel i5-1335U, 8GB, 512GB, FHD, fingerprint'],
    ['Samsung','Galaxy Book4 Pro 360',159990,179990,4.8,1800,'Intel i7-1355U, 16GB, 1TB SSD, 2.8K AMOLED touch'],
    ['Microsoft','Surface Pro 9',149990,164990,4.8,2200,'Intel i7-1265U, 16GB, 256GB SSD, 2880×1920'],
    ['Microsoft','Surface Laptop 5',119990,134990,4.7,2800,'Intel i7-1265U, 16GB, 512GB, Alcantara keyboard'],
    ['Huawei','MateBook X Pro 2024',139990,154990,4.8,1400,'Intel i7-155U, 32GB, 1TB, 3.1K OLED 90Hz'],
    ['LG','Gram 16 Ultralight',99990,114990,4.8,2100,'Intel i7-1360P, 16GB, 512GB, 16:10 IPS, MIL-SPEC'],
    ['Xiaomi','Mi Notebook Pro 14',69990,79990,4.6,4800,'Intel i5-12450H, 16GB LPDDR5, 512GB SSD, FHD'],
    ['Realme','Book Prime (2023)',54990,64990,4.5,3200,'Intel i5-1235U, 16GB, 512GB, FHD IPS 100% sRGB'],
    ['Avita','Cosmos 14 FHD',34990,44990,4.3,5100,'Intel i3-1215U, 8GB, 512GB, FHD, aluminium'],
    ['Primebook','4G Android Laptop',19990,24990,4.2,3800,'Octa-core, 4GB RAM, 128GB, 4G LTE, Android 11'],
    ['Honor','MagicBook X 16',54990,64990,4.5,4200,'AMD R5-7530U, 16GB, 512GB, FHD IPS, 65W PD'],
    ['Infinix','Inbook X2 Plus',39990,49990,4.3,3500,'Intel i3-1215U, 16GB, 512GB, FHD IPS, 65W'],
    ['Tecno','Megabook T1 14',32990,42990,4.2,2800,'Intel i3-1115G4, 8GB, 256GB SSD, Full HD IPS'],
    ['HP','Chromebook 14a',29990,34990,4.4,6200,'AMD A4-9120C, 4GB, 64GB eMMC, Chrome OS, 14h'],
  ];
  laptopData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Laptops & Computers', brand, name, price, mrp, rating, rcount, 'laptop', desc,
      {Processor:'Latest Gen CPU','RAM':'8-32GB','Storage':'256GB–2TB SSD','Display':'FHD–4K','Warranty':'1 Year Onsite'},
      'Next Day Express', +(Math.random() * 25 + 2).toFixed(1)));
  });

  // ── SMARTWATCHES (40) ──
  const watchData = [
    ['Apple','Watch Series 9 GPS 41mm',41900,44900,4.9,9800,'S9 chip, Double Tap, Crash Detection, Blood Oxygen'],
    ['Apple','Watch Ultra 2 49mm',89900,94900,4.9,3200,'Precision GPS, 60h battery, Action button, titanium'],
    ['Apple','Watch SE 2 40mm',29900,32900,4.8,7600,'S8 chip, Crash Detection, 18h battery, Family Setup'],
    ['Samsung','Galaxy Watch 6 Classic 47mm',37999,43999,4.8,5200,'Rotating bezel, BioActive sensor, sleep coach'],
    ['Samsung','Galaxy Watch 6 40mm',27999,33999,4.7,8100,'Advanced health, sapphire glass, 40h battery'],
    ['Samsung','Galaxy Fit 3',8999,10999,4.6,9200,'1.6" AMOLED, 13-day battery, 100 workout modes'],
    ['Garmin','Fenix 7S Pro Solar',99990,114990,4.9,2100,'Solar charging, topographical maps, HR & pulse ox'],
    ['Garmin','Forerunner 265 Music',44990,52990,4.8,1800,'AMOLED, 15-day battery, training load focus'],
    ['Garmin','Venu 3 AMOLED',44990,52990,4.8,2200,'Health snapshot, nap detection, wheelchair mode'],
    ['Fitbit','Charge 6 Fitness Tracker',12999,15999,4.7,6200,'Google integration, 7-day battery, ECG, SpO2'],
    ['Fitbit','Versa 4 Smartwatch',16999,19999,4.6,4800,'GPS, 6-day battery, Alexa, Google Maps'],
    ['Noise','ColorFit Ultra 3 Slim',2499,4999,4.5,15200,'1.75" AMOLED, BT calling, 100+ sports, SpO2'],
    ['Noise','ColorFit Pulse Buzz',1499,2999,4.4,21000,'IP68, 10-day battery, 60Hz AMOLED, SpO2'],
    ['boAt','Wave Flex Connect',2499,4999,4.5,12000,'BT calling, 1.83" display, 100+ sports, SpO2'],
    ['boAt','Xtend Smartwatch',4999,7999,4.6,7800,'Alexa built-in, 1.69" display, 10-day battery'],
    ['Fastrack','Reflex Nitro',2999,5999,4.5,9800,'1.96" HD display, BT calling, SpO2, 10-day'],
    ['Titan','Smart 2 Pro',8999,12999,4.6,3200,'AMOLED, GPS, BT calling, SpO2, ECG ready'],
    ['Titan','Connected Pro',14999,19999,4.7,2100,'Full touch AMOLED, GPS, SpO2, titanium case'],
    ['Fossil','Gen 6 Smartwatch',22999,29999,4.7,3800,'Wear OS 3, Snapdragon 4100+, SpO2, Alexa'],
    ['Fossil','Sport Hybrid HR',11999,16999,4.5,2400,'Analog hybrid, 2-week battery, HR sensor'],
    ['Amazfit','GTR 4 Smartwatch',14999,17999,4.7,5600,'150 sports, Zepp Coach, 14-day, Alexa, GPS'],
    ['Amazfit','GTS 4 Mini',8999,11999,4.6,7200,'70 sports, SpO2, 15-day battery, GPS'],
    ['Amazfit','T-Rex Ultra',34999,42999,4.8,1800,'GPS, 20-day battery, mil-spec, 5ATM'],
    ['Huawei','Watch GT 4 46mm',17999,21999,4.7,3200,'Advanced health, 14-day battery, ECG, GPS'],
    ['Huawei','Watch Ultimate',89999,104999,4.9,800,'Zirconium ceramic, ECG, diver-grade 100m'],
    ['Xiaomi','Mi Watch S3',13999,16999,4.6,4100,'AMOLED, GPS, HR, SPO2, 12-day battery'],
    ['Xiaomi','Redmi Watch 4',4999,6999,4.5,8900,'1.97" AMOLED, BT calling, 20-day, SpO2'],
    ['OnePlus','Watch 2R',9999,12999,4.6,4800,'RTOS, 100+ workouts, 12-day battery, IP68'],
    ['realme','Watch S Pro',5999,8999,4.5,6200,'1.39" AMOLED, GPS, SpO2, 14-day battery'],
    ['Asus','VivoWatch 6',24999,29999,4.7,1900,'ECG, PPG, SpO2, blood pressure, 14-day'],
    ['Oppo','Watch 3 Pro',29999,34999,4.7,2300,'Wear OS, AMOLED, 67W fast charge, ECG'],
    ['Vivo','Watch 3 AMOLED',14999,18999,4.6,2800,'1.43" AMOLED, eSIM ready, 14-day battery'],
    ['HONOR','MagicWatch 2 46mm',9999,14999,4.6,3400,'GPS, 14-day, Kirin A1, 95 workouts'],
    ['Polar','Vantage V3',49990,58990,4.8,1200,'GPS, 24/7 HR, ECG, Polar Fuel Wise'],
    ['Suunto','Race Multisport',44990,52990,4.8,900,'AMOLED, solar, GPS, navigation, 26-day'],
    ['Coros','PACE 3 GPS',22990,27990,4.8,1400,'Training Hub, 38-day, 5ATM, multi-GNSS'],
    ['Mobvoi','TicWatch Pro 5 Enduro',29999,34999,4.7,1600,'Wear OS 3, 80h battery, Snapdragon W5+'],
    ['Withings','ScanWatch 2',29999,34999,4.8,1100,'ECG, SpO2, sleep apnea detection, GPS'],
    ['Haylou','Solar Plus RT3',3999,6999,4.4,5200,'1.43" AMOLED, BT 5.3, SpO2, 100 sports'],
    ['Fire-Boltt','Ninja Call Pro Plus',1999,3999,4.3,18000,'BT calling, 1.83" display, SpO2, IP67'],
  ];
  watchData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Smartwatches & Wearables', brand, name, price, mrp, rating, rcount, 'smartwatch', desc,
      {Display:'AMOLED / LCD','Battery':'7–14 Days','Sensors':'HR, SpO2, GPS','Water Resist':'IP68 / 5ATM','Warranty':'1 Year'},
      '2-hour Express', +(Math.random() * 18 + 1).toFixed(1)));
  });

  // ── SNACKS (50) ──
  const snackData = [
    ["Lay's",'Classic Salted Chips 52g',20,25,4.5,48200,'America No.1 potato chip brand, perfectly salted'],
    ["Lay's",'Magic Masala Chips 52g',20,25,4.6,56000,'Iconic Indian masala flavour chips'],
    ["Lay's",'Spanish Tomato Tango 52g',20,25,4.4,38000,'Tangy tomato flavoured wafer chips'],
    ["Lay's",'Cream & Onion Chips 52g',20,25,4.5,41200,'Creamy onion flavour, light & crispy'],
    ["Lay's",'Wafer Chips Sour Cream 66g',40,50,4.4,28000,'Premium wafer-thin slices, sour cream flavour'],
    ['Doritos','Nacho Cheese Tortilla 123g',199,250,4.7,18000,'Bold nacho cheese tortilla chips'],
    ['Doritos','Cool Ranch Tortilla 113g',199,250,4.6,14000,'Tangy cool ranch flavoured tortilla chips'],
    ['Kurkure','Masala Munch 90g',30,35,4.5,62000,'Spicy Indian puffed corn snack'],
    ['Kurkure','Chilli Chatpat 90g',30,35,4.6,58000,'Extra spicy chilli flavoured corn puffs'],
    ['Kurkure','Solid Masti Mast Masala 100g',35,40,4.4,42000,'Crunchy corn sticks with masala'],
    ['Haldiram','Aloo Bhujia 150g',60,70,4.7,35000,'Classic spiced potato snack from Bikaner'],
    ['Haldiram','Moong Dal 200g',80,95,4.7,28000,'Crispy moong lentil snack, lightly spiced'],
    ['Haldiram','Mixture 150g',55,65,4.6,24000,'Blend of sev, nuts and spicy puffed rice'],
    ['Haldiram','Murukku 150g',60,70,4.5,18000,'South Indian spiral rice & lentil snack'],
    ['Haldiram','Navrattan Mixture 400g',160,190,4.7,15000,'Premium 9-ingredient savory snack mix'],
    ['Britannia','Good Day Cashew Cookies 216g',50,60,4.6,45000,'Buttery cookies loaded with whole cashews'],
    ['Britannia','NutriChoice Digestive 400g',120,140,4.5,28000,'High-fibre whole-wheat biscuit'],
    ['Britannia','Bourbon Cream Biscuit 300g',70,80,4.6,38000,'Chocolate cream sandwich biscuit'],
    ['Parle','Hide & Seek Chocolate Chips 300g',70,80,4.5,32000,'Crispy cookies with choco chips'],
    ['Parle','Monaco Salted Crackers 300g',50,60,4.5,40000,'Classic light salted cracker biscuits'],
    ['Oreo','Original Sandwich Cookies 300g',99,119,4.7,52000,'Original chocolate cream sandwich cookies'],
    ['Oreo','Double Stuf Cookies 253g',120,140,4.8,42000,'Double the cream filling in every cookie'],
    ['Cadbury','Dairy Milk Chocolate 165g',130,150,4.8,68000,'Classic creamy milk chocolate bar'],
    ['Cadbury','5 Star Chocolate Bar 42g',20,25,4.6,82000,'Caramel and nougat coated in chocolate'],
    ['Cadbury','Bournvita 500g',268,299,4.7,35000,'Chocolate malt food drink with vitamins'],
    ['Kit Kat','Wafer Chocolate 4 Finger',30,35,4.7,74000,'Crispy wafer fingers covered in chocolate'],
    ['Perk','Chocolate Wafer Bar 22g',10,15,4.5,92000,'Light chocolate wafer bar'],
    ["Lays's",'Baked Chips Sea Salt 130g',120,150,4.4,8200,'Oven-baked, less fat than regular chips'],
    ['Peppy','Jalapeno & Cheese Rings 60g',25,30,4.3,14000,'Spicy jalapeno rings with cheese flavour'],
    ['Bingo','Mad Angles Achaari Masti 60g',25,30,4.5,28000,'Triangular chips with tangy aam-achaar flavour'],
    ['Bingo','Tedhe Medhe Masala 55g',20,25,4.4,34000,'Twisted corn snack with chatpata masala'],
    ['Cornitos','Nacho Chips Tomato Salsa 150g',99,130,4.5,9800,'Thick tortilla chips with tomato salsa'],
    ['Too Yumm','Multigrain Chips 50g',30,40,4.4,12000,'Baked multigrain chips, 35% less fat'],
    ['Epigamia','Greek Yogurt Mango 90g',60,75,4.6,8000,'Premium Greek yogurt with real mango pulp'],
    ['Yoga Bar','Oats Dark Choc Bar 38g',55,70,4.5,15000,'Whole grain oats, dark chocolate, almonds'],
    ['RiteBite','Max Protein Peanut Chikki',60,75,4.6,9800,'25g protein per 100g, peanut & jaggery'],
    ['Snickers','Chocolate Bar 50g',45,55,4.7,62000,'Peanuts, caramel, nougat, milk chocolate'],
    ['Twix','Caramel Cookie Bar 50g',50,60,4.7,48000,'Crunchy biscuit, caramel, chocolate'],
    ['Ferrero Rocher','Chocolate Box 16pcs',550,650,4.9,32000,'Premium hazelnut chocolate in gold foil'],
    ['Lindt','Swiss Dark Chocolate 100g',380,450,4.8,14000,'70% cocoa dark chocolate bar, Swiss excellence'],
    ['Bagrry's','Corn Flakes Original 800g',199,240,4.5,18000,'Crunchy corn flakes fortified with vitamins'],
    ['Kellogg's','Chocos 375g',199,235,4.6,22000,'Chocolate-flavored corn puffs cereal'],
    ['Quaker','Oats Original 2kg',380,450,4.7,15000,'100% whole grain rolled oats, high fibre'],
    ['Maaza','Mango Drink 600ml',40,50,4.5,78000,'Refreshing mango juice drink'],
    ['Thums Up','Cola 750ml',45,55,4.4,89000,'Bold cola with strong carbonation'],
    ['Red Bull','Energy Drink 250ml',125,150,4.6,42000,'250mg caffeine, B vitamins, taurine'],
    ['Monster','Energy Original 500ml',130,160,4.5,36000,'160mg caffeine, B vitamins, taurine'],
    ['Paper Boat','Aam Panna 200ml',35,45,4.6,28000,'Traditional raw mango drink with spices'],
    ['Real','Fruit Juice Mixed Fruit 1L',120,145,4.5,24000,'Mixed tropical fruit juice, no preservatives'],
    ["B Natural",'Guava Juice 1L',130,155,4.5,18000,'100% real guava juice with fibre'],
  ];
  snackData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Snacks & Beverages', brand, name, price, mrp, rating, rcount, 'snack', desc,
      {'Best Before':'6 Months','Net Weight':'As labelled','Type':'Branded Packaged Food','Shelf Safe':'Yes','Origin':'India'},
      '45-min Express', +(Math.random() * 8 + 0.5).toFixed(1)));
  });

  // ── HOME APPLIANCES (60) ──
  const applianceData = [
    ['Dyson','V15 Detect Absolute Cordless Vacuum',52900,60000,4.9,4800,'HEPA filtration, laser dust detection, 60 min runtime'],
    ['Dyson','Purifier Hot+Cool HP07',64900,74900,4.9,2800,'Air purifier, fan & heater, 360° filtration'],
    ['Dyson','Airwrap Multi-Styler',45900,52900,4.8,3600,'Curls, waves, volumises, dries with no extreme heat'],
    ['Dyson','Supersonic Hair Dryer',34900,40000,4.8,5200,'Intelligent heat control, fast dry, magnetic attachments'],
    ['Philips','Air Fryer HD9200',6499,8999,4.7,18200,'4.1L, 90% less fat, up to 200°C, digital display'],
    ['Philips','PerfectCare Iron GC3929',7999,10999,4.7,8200,'OptimalTemp technology, 2600W, non-stick soleplate'],
    ['Philips','Mixer Grinder HL7756',3499,4999,4.6,14000,'750W, 3 jars, stainless steel, ISI marked'],
    ['Philips','Water Purifier ADD6910',12999,17999,4.7,6200,'RO+UV+UF, 8L storage, active copper filtration'],
    ['Bosch','Washing Machine 7kg Front Load',36999,44999,4.8,5200,'1200 RPM, EcoSilence, AllergyPlus, A+++ energy'],
    ['Bosch','Dishwasher 12 Place',45999,55999,4.7,2800,'SilencePlus 44 dB, half-load, 6 wash programs'],
    ['Bosch','55cm Induction Cooktop',12999,17999,4.7,6800,'2 zones, 9 power levels, boost function'],
    ['LG','1.5T Inverter AC 5 Star',47990,55990,4.8,7200,'Dual Inverter, AI Cooling, PM 0.1 filter'],
    ['LG','265L Frost Free Refrigerator',28990,34990,4.7,9100,'Inverter Linear Compressor, 10yr warranty'],
    ['LG','7kg Semi-Auto Washing Machine',13490,17990,4.6,11000,'Turbo Drum, Tub Clean, rat-away protection'],
    ['LG','MH2044DB 20L Microwave',10490,13490,4.7,8800,'Solo microwave, Child Lock, auto cook menus'],
    ['Samsung','1.5T WindFree AC',52990,62990,4.8,5800,'Digital Inverter, WindFree cooling, AI Energy'],
    ['Samsung','253L SpaceMax Refrigerator',26990,31990,4.7,7600,'SpaceMax technology, Twin Cooling Plus, inverter'],
    ['Samsung','8kg Fully Auto Washing Machine',32990,39990,4.7,5200,'Ecobubble, Digital Inverter, 5 Star, AddWash'],
    ['Samsung','28L Convection Microwave',13990,18990,4.7,7800,'Crusty Plate, slimfry, 99 auto cook menus'],
    ['Whirlpool','1.5T Inverter AC 5 Star',39990,47990,4.7,8200,'6th Sense IntelliComfort, PM 2.5 filter'],
    ['Whirlpool','260L Frost Free Refrigerator',24990,29990,4.6,9800,'Intellifresh Pro, Zeolite technology'],
    ['Whirlpool','7kg Fully Auto Top Load',18990,23990,4.6,11000,'6th Sense PowerClean, ZPF Technology'],
    ['Voltas','1.5T 5 Star Inverter AC',36990,44990,4.7,9200,'Adjustable cooling, 4-in-1 convertible, PM 2.5'],
    ['Blue Star','1T 5 Star Fixed Speed AC',29990,36990,4.5,7800,'100% copper, auto restart, self-diagnosis'],
    ['Daikin','1.5T 5 Star Inverter AC',45990,54990,4.8,6400,'Coanda airflow, PM 0.1 filter, Dew Clean'],
    ['Godrej','7kg Top Load Fully Auto',16990,21990,4.5,12000,'Air Wash, StainMaster, n:on inverter'],
    ['IFB','6.5kg Front Load Washing Machine',32990,39990,4.7,6200,'Steam Wash, 3D Wash System, Cradle Wash'],
    ['Bajaj','750W Mixer Grinder',2799,3999,4.5,22000,'3 jars, Power Guard, ISI marked, anti-slip feet'],
    ['Bajaj','1000W Induction Cooktop',2199,3199,4.5,18000,'9 power levels, auto shut-off, 7-segment display'],
    ['Prestige','Electric Pressure Cooker 5L',3499,4999,4.6,14000,'12 preset functions, keep warm, digital display'],
    ['Prestige','IRIS 750W Mixer Grinder',2499,3499,4.5,18000,'3 stainless jars, overload protection, ISI'],
    ['Butterfly','Desire 750W Mixer Grinder',2199,3199,4.5,12000,'3 SS jars, auto cut motor protection'],
    ['Pigeon','20L Solo Microwave',5999,7999,4.5,9800,'20L, solo, defrost, 5 power levels, digital'],
    ['Havells','600W Food Processor',6999,9999,4.6,7200,'6 attachments, 2.1L bowl, pulse function'],
    ['Usha','Maxx Air Cooler 70L',12999,16999,4.5,6800,'3-speed, auto fill, inverter compatible'],
    ['Symphony','Diet 12T Personal Air Cooler',11999,15999,4.6,8200,'12L, 2 ice packs, mosquito-repellent on/off'],
    ['Crompton','1.5T Inverter AC',37990,44990,4.6,7800,'4-in-1 convertible, IDU Bldc, PM 2.5 filter'],
    ['Havells','Instanio Instant Water Heater 3L',3999,5499,4.6,9200,'3L, ISI, faster water supply, Incoloy rod'],
    ['Racold','25L Storage Water Heater',8999,12999,4.6,7400,'25L, 5-star rated, MagShield, PUF insulation'],
    ['AO Smith','100L Water Heater',17999,22999,4.7,4200,'100L, Blue Diamond glass-lined tank, 5yr warranty'],
    ['Morphy Richards','1800W Steam Iron',1999,2999,4.6,16000,'1800W, 300ml tank, continuous steam, non-stick'],
    ['Panasonic','25L Convection Microwave',10999,14999,4.7,7800,'Econavi, 25L, convection, 101 auto cook'],
    ['Inalsa','Espresso Coffee Maker',4999,7499,4.5,6200,'15 bar pump, milk frother, 1.5L removable'],
    ['De'Longhi','Magnifica Evo Bean-to-Cup',79990,94990,4.9,2100,'Full automatic, grinder, 19 bar, milk frother'],
    ['Kent','RO Water Purifier 8L',14999,19999,4.7,8200,'RO+UV+UF, TDS controller, 20L/hr output'],
    ['AO Smith','Z8+ Green RO Purifier',24999,30999,4.8,3800,'8L, mineral RO, 8 stage, side-stream tech'],
    ['Eureka Forbes','Aquaguard Aura 7L RO+UV',17999,22999,4.7,5200,'7L, active copper, zinc boost, UV + RO'],
    ['iRobot','Roomba j7+ Robot Vacuum',59999,69999,4.8,2100,'Smart mapping, P&A avoidance, clean base auto empty'],
    ['Ecovacs','Deebot T20 OMNI',52999,62999,4.8,1600,'Vacuum + mop, hot water wash, OZMO Turbo'],
    ['Roborock','S8 Pro Ultra Robot Vacuum',74999,89999,4.8,1400,'RockDock Ultra, VibraRise 2.0, dual rubber brushes'],
    ['Voltas','1.5T 5 Star Window AC',28990,33990,4.5,8400,'Chill At Will, 5 star, ISEER 5.0, PM 2.5'],
    ['Orient','1.5T Inverter AC',34990,41990,4.6,7200,'i-Cool, 4-in-1 convertible, PM 2.5 filtration'],
    ['Hitachi','1.5T 5 Star Inverter AC',44990,52990,4.7,5800,'Eco Chill, Freeze Protect, PM 2.5 filter'],
    ['Kenstar','1.5T Inverter AC',31990,38990,4.5,6200,'Auto clean, Wi-Fi enabled, PM 2.5 filter'],
    ['Panasonic','1.5T 5 Star Inverter AC',40990,48990,4.7,5400,'Nanoe-G, 4-in-1, mold-prevention, PM 2.5'],
    ['Carrier','1.5T 5 Star Flexi Cool',39990,47990,4.6,5800,'4-in-1 convertible, DURA Pro, PM 2.5'],
    ['Godrej','260L Frost Free Refrigerator',22990,27990,4.5,8900,'CFC-free, anti-bacterial gasket, toughened glass'],
    ['Haier','195L Direct Cool Refrigerator',14990,18990,4.5,11000,'Stabilizer free operation, anti-frost evaporator'],
    ['Videocon','21L Solo Microwave',5499,7499,4.3,7600,'21L, 5 power levels, defrost, reheat function'],
    ['Glen','2 Burner Glass Top Gas Stove',3199,4499,4.5,12000,'Premium black glass top, brass burners, ISI'],
    ['Elica','3 Burner SS Gas Stove',4999,6999,4.6,8200,'Stainless steel top, forged brass burners, ISI'],
  ];
  applianceData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Home Appliances', brand, name, price, mrp, rating, rcount, 'appliance', desc,
      {'Power Rating':'As specified','Energy Rating':'3–5 Star','Warranty':'1–10 Years','Installation':'Free','Origin':'India / Import'},
      'Next Day', +(Math.random() * 30 + 5).toFixed(1)));
  });

  // ── SMARTPHONES (40) ──
  const phoneData = [
    ['Apple','iPhone 15 Pro Max 256GB',159900,174900,4.9,18200,'A17 Pro chip, titanium, 48MP main, Action button'],
    ['Apple','iPhone 15 Pro 128GB',134900,149900,4.9,14800,'A17 Pro, 6.1" Super Retina XDR ProMotion 120Hz'],
    ['Apple','iPhone 15 128GB',79900,89900,4.8,22000,'A16 Bionic, 48MP main, Dynamic Island'],
    ['Apple','iPhone 14 128GB',69900,79900,4.8,19200,'A15 Bionic, 12MP, Crash Detection, SOS satellite'],
    ['Samsung','Galaxy S24 Ultra',134999,149999,4.9,12000,'Snapdragon 8 Gen 3, S Pen, 200MP, titanium'],
    ['Samsung','Galaxy S24+',99999,109999,4.8,9800,'Snapdragon 8 Gen 3, 50MP, 4900mAh, 45W'],
    ['Samsung','Galaxy S24 FE',64999,74999,4.7,14000,'Exynos 2500, 50MP, 4700mAh, 45W, AI features'],
    ['Samsung','Galaxy A55 5G',34999,39999,4.7,18200,'Exynos 1480, 50MP OIS, 5000mAh, IP67'],
    ['OnePlus','12R 256GB',39999,44999,4.8,16000,'Snapdragon 8 Gen 2, 50MP, 100W SuperVOOC, 5G'],
    ['OnePlus','Open Foldable',139999,154999,4.8,4200,'Hasselblad cameras, 7.82" inner, Open Canvas'],
    ['Google','Pixel 9 Pro XL',129999,144999,4.9,8200,'Google Tensor G4, 50MP quad, 7yr updates, AI'],
    ['Google','Pixel 9 Pro',104999,119999,4.9,7800,'Google Tensor G4, 50MP triple, 6.3" LTPO OLED'],
    ['Google','Pixel 9',79999,89999,4.8,9400,'Google Tensor G4, 50MP, Gemini AI, 24hr battery'],
    ['Xiaomi','14 Ultra',99999,114999,4.8,6200,'Snapdragon 8 Gen 3, Leica quad, 90W + 80W wireless'],
    ['Xiaomi','Redmi Note 13 Pro+',33999,38999,4.7,22000,'Dimensity 7200 Ultra, 200MP, 120W HyperCharge'],
    ['Xiaomi','Redmi 13C',8999,10999,4.5,34000,'Helio G85, 50MP, 5000mAh, 18W fast charge'],
    ['realme','GT 6 5G',39999,44999,4.8,8200,'Snapdragon 8s Gen 3, 50MP OIS, 120W SuperDart'],
    ['realme','Narzo 70 Pro',17999,20999,4.6,18000,'Dimensity 7050, 50MP OIS, 5000mAh, 67W'],
    ['OPPO','Find X7 Ultra',99999,114999,4.8,5200,'Hasselblad cameras, Dimensity 9300, 100W'],
    ['OPPO','Reno 12 Pro',36999,42999,4.7,9800,'Dimensity 7300, 50MP portrait, 80W, AI features'],
    ['vivo','X100 Ultra',104999,119999,4.8,4800,'Dimensity 9300+, ZEISS cameras, 80W+30W wireless'],
    ['vivo','V30 Pro',39999,44999,4.7,11000,'Dimensity 8200, 50MP ZEISS, 80W FlashCharge'],
    ['iQOO','12 5G',52999,59999,4.8,9200,'Snapdragon 8 Gen 3, Zeiss 50MP, 120W FlashCharge'],
    ['Nothing','Phone (2a)',23999,27999,4.7,14000,'Dimensity 7200 Pro, 50MP, Glyph Interface 2.0'],
    ['Motorola','Edge 50 Pro',31999,36999,4.7,10200,'Snapdragon 7s Gen 2, 50MP OIS, 125W TurboPower'],
    ['Motorola','G84 5G',18999,22999,4.6,18000,'Snapdragon 695, 50MP, 5000mAh, 33W, pOLED'],
    ['Nokia','G42 5G',19999,23999,4.5,8200,'Snapdragon 480+, 50MP, repairable, 4 yrs updates'],
    ['ASUS','ROG Phone 8 Pro',99999,114999,4.9,4200,'Snapdragon 8 Gen 3, 165Hz, 65W, AeroActive cooler'],
    ['ASUS','Zenfone 10',55999,64999,4.8,6200,'Snapdragon 8 Gen 2, 50MP gimbal, IP68, compact'],
    ['Tecno','Phantom V Fold',79999,89999,4.6,2800,'Dimensity 9000, 7.85" inner, 45W charging'],
    ['Infinix','GT 20 Pro',24999,29999,4.5,8900,'Dimensity 8200 Ultimate, 108MP, 68W, gaming'],
    ['Lava','Blaze 2 5G',13999,16999,4.4,12000,'Dimensity 6020, 50MP, 5000mAh, 18W'],
    ['Micromax','IN 2c',9499,11999,4.2,8200,'UNISOC T610, 50MP, 5000mAh, Android 12'],
    ['Samsung','Galaxy M34 5G',16999,19999,4.6,28000,'Exynos 1280, 50MP OIS, 6000mAh, 25W'],
    ['Samsung','Galaxy F55 5G',26999,30999,4.6,14000,'Snapdragon 7 Gen 1, 50MP OIS, 5000mAh, 25W'],
    ['Xiaomi','Poco X6 Pro',26999,30999,4.7,16000,'Dimensity 8300-Ultra, 64MP, 67W HyperCharge'],
    ['Xiaomi','Poco M6 Pro',16999,19999,4.5,22000,'Dimensity 7020, 64MP, 5000mAh, 67W'],
    ['realme','C65 5G',12999,15999,4.4,18000,'Dimensity 6100+, 50MP, 5000mAh, 45W'],
    ['OPPO','A60 5G',18999,21999,4.5,14000,'Snapdragon 695, 50MP, 5100mAh, 33W'],
    ['vivo','Y58 5G',21999,24999,4.5,12000,'Snapdragon 4 Gen 2, 50MP OIS, 6000mAh, 44W'],
  ];
  phoneData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Smartphones & Mobiles', brand, name, price, mrp, rating, rcount, 'phone', desc,
      {Network:'5G',Processor:'Latest SoC','RAM':'8–16GB','Storage':'128–512GB',Warranty:'1 Year'},
      '2-hour Express', +(Math.random() * 20 + 1).toFixed(1)));
  });

  // ── TELEVISIONS (30) ──
  const tvData = [
    ['Sony','BRAVIA XR 65" OLED',299990,349990,4.9,4200,'Cognitive Processor XR, XR OLED panel, 120Hz'],
    ['Sony','BRAVIA 7 65" Mini LED',199990,239990,4.9,2800,'XR Processor, Mini LED, 4K HDR, Google TV'],
    ['Sony','BRAVIA X80L 55" 4K',79990,94990,4.8,6800,'4K X-Reality Pro, X1 Processor, Google TV'],
    ['Samsung','Neo QLED 8K 65" QN800C',449990,499990,4.9,1800,'8K NQ4 AI Processor, Neo Quantum HDR 32x'],
    ['Samsung','QLED 4K 65" Q80C',149990,174990,4.8,5200,'Quantum HDR+, 120Hz, Object Tracking Sound'],
    ['Samsung','Crystal 4K 55" UA55CU7700',64990,74990,4.7,9800,'PurColor, AirSlim design, Motion Xcelerator'],
    ['LG','OLED evo C3 55" 4K',159990,189990,4.9,6200,'α9 AI Processor Gen 6, self-lit pixels, 120Hz'],
    ['LG','QNED 65" 4K MiniLED',99990,119990,4.8,4800,'Full Array Dimming Pro, 120Hz, webOS 23'],
    ['LG','UHD 55" UR78 4K',52990,62990,4.7,8200,'4K Active HDR, AI Picture Pro, webOS 23'],
    ['Panasonic','65" OLED MZ2000',249990,299990,4.9,1400,'Master HDR OLED, HCX Pro AI, Dolby Atmos'],
    ['Panasonic','55" W95A OLED',134990,159990,4.8,2200,'HCX Pro AI, Filmmaker Mode, Dolby Vision IQ'],
    ['TCL','65" C845 Mini LED',89990,109990,4.7,5600,'144Hz, QLED Mini LED, 1200 nits, Dolby Atmos'],
    ['TCL','55" P635 4K UHD',42990,52990,4.5,11000,'4K HDR, Dolby Audio, slim bezel, Android TV'],
    ['Hisense','65" U8K Mini LED',89990,109990,4.7,4800,'2000nits, ULED X, Quantum Dot, 144Hz'],
    ['Hisense','55" A6K 4K UHD',39990,49990,4.5,9200,'Dolby Vision, DTS Virtual X, VIDAA Smart TV'],
    ['Mi','55" QLED 4K Xiaomi',59990,69990,4.6,12000,'Quantum dot, Dolby Atmos, PatchWall+'],
    ['Mi','43" A2 Full HD',26990,32990,4.5,18000,'Full HD, Dolby Audio, PatchWall+, Google Assistant'],
    ['OnePlus','55" Q2 Pro 4K QLED',64990,74990,4.7,8200,'QLED, Gamma Engine, Dolby Atmos, OxygenPlay'],
    ['realme','55" SLED 4K',52990,62990,4.6,6800,'SLED technology, 120Hz, Chroma Engine Pro 4'],
    ['Vu','65" GloLED 4K',64990,74990,4.6,7200,'GloLED, 4K, Dolby Vision, JBL speakers'],
    ['Vu','55" Premium 4K',42990,52990,4.5,9800,'4K UHD, HDR10, Android TV, built-in JBL'],
    ['Toshiba','55" C350MP QLED',49990,59990,4.5,7200,'QLED, 4K, Regza Engine NEO, Fire TV'],
    ['Thomson','55" OLED Glory',79990,94990,4.7,3400,'OLED, 120Hz, Dolby Vision+HDR10+, JBL'],
    ['Kodak','43" 7XPRO 4K',22990,27990,4.4,12000,'4K UHD, Android TV 11, Dolby Vision, Atmos'],
    ['iFFALCON','50" K72 4K QLED',39990,49990,4.5,8200,'QLED, Dolby Vision+, MEMC, Android TV'],
    ['Skyworth','55" AI TV 55S9A',44990,54990,4.5,6200,'55" 4K OLED, AI Picture, Dolby Atmos'],
    ['Grundig','43" 4K Android TV',32990,39990,4.4,5600,'4K UHD, Dolby Audio, Google Play Store'],
    ['Sanyo','43" Kaizen Pro 4K',24990,30990,4.4,10000,'4K UHD, Android TV 9, Dolby Vision'],
    ['BPL','43" Stellar 4K',21990,26990,4.3,8800,'4K UHD, Android TV, Bluetooth audio'],
    ['Reconnect','32" Full HD Smart TV',16990,20990,4.3,7200,'Full HD, Android TV 9, Wi-Fi, 2 HDMI'],
  ];
  tvData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Televisions & Displays', brand, name, price, mrp, rating, rcount, 'tv', desc,
      {'Panel':'OLED/QLED/LED','Resolution':'Full HD to 8K',HDR:'Dolby Vision / HDR10+',Warranty:'1-3 Years',Install:'Free Wall Mount'},
      'Next Day', +(Math.random() * 35 + 5).toFixed(1)));
  });

  // ── GAMING (30) ──
  const gamingData = [
    ['Sony','PlayStation 5 Console',54990,59990,4.9,28000,'825GB SSD, DualSense controller, 120fps support'],
    ['Sony','PlayStation 5 Slim Digital',44990,49990,4.9,18000,'Digital edition, detachable disc drive, 1TB SSD'],
    ['Sony','DualSense Controller',5999,6990,4.8,16000,'Haptic feedback, adaptive triggers, built-in mic'],
    ['Sony','PlayStation VR2',59990,69990,4.8,5200,'Headset & controller, eye tracking, 4K HDR'],
    ['Microsoft','Xbox Series X 1TB',54990,59990,4.9,12000,'12 teraflops GPU, 120fps, Quick Resume, 1TB SSD'],
    ['Microsoft','Xbox Series S 512GB',34990,39990,4.8,14000,'1440p gaming, 120fps, all-digital, next-gen'],
    ['Microsoft','Xbox Elite Controller 2',13490,14999,4.8,8200,'Adjustable tension thumbsticks, shorter hair trigger'],
    ['Nintendo','Switch OLED',31990,35990,4.9,9800,'7" OLED screen, 64GB storage, enhanced audio'],
    ['Nintendo','Switch Lite',21490,23990,4.8,12000,'Compact, all buttons built in, 10hr battery'],
    ['Razer','BlackShark V2 X Gaming',5999,7999,4.7,8200,'7.1 surround, 50mm driver, cardioid mic'],
    ['Razer','DeathAdder V3 Pro Mouse',11999,14999,4.8,6200,'Focus Pro 30K optical, 90h battery, 63g'],
    ['Razer','BlackWidow V4 Pro Keyboard',18999,22999,4.8,4200,'Razer Yellow switches, command dial, Chroma RGB'],
    ['Logitech','G502 X Plus Mouse',11999,14999,4.8,9200,'Hero 25K sensor, 89g, LIGHTFORCE hybrid switches'],
    ['Logitech','G915 TKL Keyboard',14999,18999,4.8,6800,'Low-profile GL switches, Lightspeed wireless'],
    ['Logitech','G Pro X Superlight 2',14999,17999,4.9,5800,'60g, Hero 25K sensor, Powerplay compatible'],
    ['SteelSeries','Arctis Nova Pro Wireless',24999,29999,4.8,3200,'Active noise cancellation, Sonar audio software'],
    ['HyperX','Cloud Alpha Wireless',11999,14999,4.7,7200,'DTS:X Spatial Audio, 300h battery, 38mm drivers'],
    ['ASUS','ROG Rapture GT-AXE16000 Router',44999,54999,4.8,2100,'Wi-Fi 6E, 10Gbps LAN, game acceleration'],
    ['Corsair','Vengeance 32GB DDR5 RAM',14999,18999,4.8,4200,'DDR5-5200MHz, XMP 3.0, RGB lighting'],
    ['Corsair','MP600 Pro 2TB NVMe SSD',19999,24999,4.8,3800,'7000MB/s read, PCIe 4.0, Gen 4 x4'],
    ['Seagate','4TB BarraCuda HDD',8999,10999,4.6,9800,'7200 RPM, 256MB cache, SATA 6Gb/s'],
    ['WD','Black SN850X 2TB SSD',18999,22999,4.9,5200,'7300MB/s read, PCIe 4.0, Game Mode 2.0'],
    ['Kingston','Fury Beast 32GB DDR5',12999,15999,4.7,6200,'DDR5-5200, CL40, Intel XMP 3.0 / AMD EXPO'],
    ['PowerColor','RX 7900 XTX 24GB GPU',89990,104990,4.9,2800,'RDNA 3, 24GB GDDR6, 96 MB Infinity Cache'],
    ['Zotac','RTX 4080 Super AMP 16GB',99990,119990,4.9,2400,'Ada Lovelace, 4th Gen Tensor, DLSS 3.5'],
    ['MSI','MAG Forge 111R PC Case',5499,7499,4.7,6200,'Tempered glass, 3 RGB fans, ATX form factor'],
    ['Cooler Master','MasterLiquid ML360L AIO',9999,12999,4.7,5800,'360mm radiator, 3×120mm RGB fans, LGA1700'],
    ['Thermaltake','Toughpower GF3 850W PSU',11999,14999,4.8,4200,'80+ Gold, fully modular, 10yr warranty'],
    ['ASUS','TUF Gaming 27" 165Hz',22999,27999,4.8,6800,'IPS, 165Hz, 1ms, FreeSync Premium, 1440p'],
    ['LG','UltraGear 27" 240Hz OLED',79999,94999,4.9,3200,'27" QHD OLED, 240Hz, 0.03ms, Nvidia G-Sync'],
  ];
  gamingData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Gaming & Consoles', brand, name, price, mrp, rating, rcount, 'gaming', desc,
      {Platform:'PC / PlayStation / Xbox','Resolution':'Up to 8K',FPS:'Up to 240',Storage:'As specified',Warranty:'1 Year'},
      'Next Day Express', +(Math.random() * 25 + 3).toFixed(1)));
  });

  // ── CAMERAS (20) ──
  const cameraData = [
    ['Sony','Alpha 7 IV Mirrorless',239990,264990,4.9,5200,'33MP BSI, 10fps, 4K 60p, Real-Time Eye AF'],
    ['Sony','ZV-E10 Mark II',69990,79990,4.8,8200,'26.1MP APS-C, 4K 120p, AI Subject Recognition'],
    ['Canon','EOS R8 Mirrorless',159990,179990,4.8,4800,'24.2MP, 40fps, 4K 60p, in-body IS, DIGIC X'],
    ['Canon','PowerShot V10 Vlog',44990,52990,4.7,6800,'1" CMOS, 4K 30p, built-in mic, wide-angle'],
    ['Nikon','Z8 Mirrorless',374990,409990,4.9,3200,'45.7MP stacked BSI, 8K 60p, 20fps, ProRes'],
    ['Nikon','Z30 Mirrorless',64990,74990,4.8,7200,'20.9MP APS-C, 4K 30p, vari-angle LCD, no EVF'],
    ['Fujifilm','X-T5 Mirrorless',189990,214990,4.9,4100,'40MP BSI X-Trans, 7fps, 6.2K video, IBIS'],
    ['Fujifilm','X100VI Compact',119990,134990,4.9,6800,'40MP X-Trans BSI, 6.2K, IBIS, retro design'],
    ['GoPro','Hero 12 Black',44990,49990,4.8,12000,'5.3K 60p, HDR video, HyperSmooth 6.0, waterproof'],
    ['DJI','Osmo Pocket 3',34990,39990,4.8,8200,'1" CMOS, 4K 120fps, 3-axis gimbal, OLED'],
    ['DJI','Mini 4 Pro Drone',96990,109990,4.8,5200,'4K 100fps, 34min flight, tri-directional sensing'],
    ['DJI','Mavic 3 Pro Drone',179990,199990,4.9,2800,'Hasselblad triple camera, 4/3 CMOS, 46min'],
    ['Insta360','X4 Action Camera',39990,44990,4.7,6200,'8K 360° video, 30m waterproof, AI editing'],
    ['Panasonic','Lumix G100 Mirrorless',49990,59990,4.7,5800,'20.3MP, 4K 30p, built-in mic, V-Log, BT'],
    ['Olympus','OM-5 Mirrorless',132990,154990,4.8,2600,'20MP, 7.5-stop IBIS, IP53, Starry Sky AF'],
    ['Ricoh','GR IIIx Compact',84990,99990,4.8,3200,'26MP APS-C, 40mm eq, 4-stop SR, Snap Focus'],
    ['Sigma','fp L Mirrorless',249990,284990,4.8,1400,'61MP, world's smallest full-frame, 12fps, Cinema DNG'],
    ['Leica','Q3 Compact Camera',599990,649990,4.9,800,'60MP full-frame, 28mm f/1.7, 8K video'],
    ['Sony','RX100 VII Compact',109990,124990,4.9,4200,'20MP 1" CMOS, 357-point AF, 4K, built-in ND'],
    ['Canon','IXUS 185 Compact',8990,10990,4.4,9800,'20MP, 8× optical zoom, HD video, Smart AUTO'],
  ];
  cameraData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Cameras & Photography', brand, name, price, mrp, rating, rcount, 'camera', desc,
      {'Sensor':'APS-C / Full-Frame',Video:'4K – 8K',Autofocus:'Phase Detect',Stabilisation:'IBIS / OIS',Warranty:'1 Year Carry-in'},
      'Next Day Express', +(Math.random() * 28 + 4).toFixed(1)));
  });

  // ── FURNITURE & KITCHEN EXTRA (30) ──
  const extraData = [
    ['IKEA','MALM King Bed Frame',39999,46999,4.7,3200,'King size, adjustable side rails, white/oak'],
    ['IKEA','KALLAX Shelf Unit',7999,9999,4.7,8200,'4x4 cube storage, high-gloss white, 147×147cm'],
    ['IKEA','POÄNG Armchair',12999,15999,4.8,5200,'Birch veneer, Knisa cushion, ergonomic'],
    ['Godrej Interio','Slimline 3-Door Wardrobe',28999,34999,4.6,4200,'Steel body, multi-shelf, mirror door option'],
    ['Durian','Amsterdam Sofa L-Shape',59999,74999,4.7,2800,'Premium fabric, 4-seater, walnut legs'],
    ['Pepperfry','Oslo Study Table',8999,11999,4.5,6800,'Engineered wood, cable management, brown'],
    ['Nilkamal','Freedom Big Storage Cabinet',5999,7999,4.5,8200,'200L, plastic, dual lock, 4 shelves'],
    ['Wipro','Aurora LED Ceiling Light',2499,3499,4.6,12000,'24W, 6500K cool white, 2160lm, 3yr warranty'],
    ['Syska','LED Bulb 12W Pack of 10',999,1499,4.5,22000,'12W=80W, warm white, BEE 5-star, 20000h'],
    ['Philips','LED Strip Light 5m',2999,3999,4.5,9200,'RGB+W, app control, music sync, IP20'],
    ['Prestige','Svachh Kadai 3L',1499,2199,4.6,14000,'Hard anodized, glass lid, serving spoon, induction'],
    ['Hawkins','Contura 3L Pressure Cooker',2299,3099,4.7,18000,'Aluminum, Gasket Release System, 5yr warranty'],
    ['Preethi','Zodiac 750W Mixer Grinder',3499,4999,4.6,12000,'5 jars, juicer attachment, ISI, 2yr warranty'],
    ['Pigeon','Sheen Electric Kettle 1.5L',899,1299,4.5,28000,'1500W, SS body, auto shut-off, 360° base'],
    ['Wonderchef','Crimson Edge Knife Set',1999,3499,4.6,8200,'Stainless steel, ergonomic handle, block included'],
    ['Cello','OpalWare Dinner Set 27pcs',2499,3999,4.5,14000,'Opalware, microwave safe, break-resistant'],
    ['Borosil','Vision Glass 350ml Set of 6',999,1499,4.7,22000,'Borosilicate glass, microwave-safe, dishwasher-safe'],
    ['FabIndia','King Size Cotton Bedsheet',2499,3999,4.6,6200,'Pure cotton, 200 thread count, 1 flat + 2 pillows'],
    ['WestSide','Decorative Throw Cushion Set',1499,2499,4.5,4800,'Set of 5, mix design, 45×45cm, polyester fill'],
    ['AmazonBasics','Bamboo Cutting Board Set',1299,1999,4.5,18000,'3-piece, antimicrobial, juice groove, eco-friendly'],
    ['Tupperware','Refrigerator Set 4pc',2499,3499,4.7,9200,'BPA-free, airtight, microwave safe, 4 containers'],
    ['Lock&Lock','Glass Container Set 6pc',2999,4499,4.6,7800,'Borosilicate glass, 4-side locking lid, oven safe'],
    ['Carote','Non-stick Pan Set 5pcs',4999,7499,4.7,6400,'Granite coating, induction compatible, PFOA-free'],
    ['Zyliss','Easy Control Garlic Press',1999,2999,4.6,5200,'Zinc alloy, self-cleaning, lifetime guarantee'],
    ['OXO','Salad Spinner 5.3Qt',3499,4999,4.7,4200,'Non-slip base, built-in brake, dishwasher safe'],
    ['Lifelong','LLEC10 Electric Cooker 1.8L',2199,3199,4.5,12000,'1.8L, teflon bowl, keep warm, steaming tray'],
    ['Usha','Table Fan Mist Air Icy 400mm',3499,4999,4.5,8800,'400mm, 3-speed, oscillating, 1400 RPM'],
    ['Orient','20L Personal Air Cooler',11999,15999,4.5,7200,'20L, 3 speeds, ice & water, inverter compatible'],
    ['V-Guard','VG 400 Stabilizer for AC',2999,3999,4.7,14000,'For 1.5T AC, 170–270V, 4yr warranty'],
    ['Luminous','600VA Inverter + 150Ah Battery',16999,20999,4.7,8200,'Pure sine wave, 2yr inverter + 4yr battery warranty'],
  ];
  extraData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    const pool = ['furniture','kitchen','appliance'][Math.floor(Math.random() * 3)];
    const cat = ['Home & Furniture', 'Kitchen & Dining', 'Home Essentials'][Math.floor(Math.random() * 3)];
    items.push(def(cat, brand, name, price, mrp, rating, rcount, pool, desc,
      {Material:'As specified',Warranty:'1-3 Years',Assembly:'As needed',Origin:'India'},
      'Next Day', +(Math.random() * 30 + 4).toFixed(1)));
  });

  // ── GROOMING & PERSONAL CARE (30) ──
  const groomData = [
    ['Braun','Series 9 Pro Electric Shaver',24999,29999,4.8,4200,'5-sync ProHead, 10D flex, clean&charge station'],
    ['Braun','Series 7 71-B1500S',14999,18999,4.7,6800,'7-in-1 styling kit, ProBraun, Wet&Dry'],
    ['Philips','Norelco S9000 Prestige',18999,22999,4.8,5200,'Nano tech blades, OmniGlide, wet & dry'],
    ['Philips','Hair Clipper HC5612',2199,2999,4.6,14000,'17 length settings, titanium blade, 90min runtime'],
    ['Panasonic','ER-GB96 Wet/Dry Trimmer',5499,7499,4.7,9800,'39 length settings, washable, 50min runtime'],
    ['Wahl','Classic 100 Clipper Set',3999,5499,4.7,8200,'ChromStyle Pro motor, 8 guides, barber grade'],
    ['Havells','BT6151C Trimmer',1299,1999,4.5,18000,'60min, 20 lengths, USB-C, waterproof'],
    ['Mi','Beard Trimmer MT1',1499,1999,4.5,22000,'40 lengths, 120min runtime, washable, USB-C'],
    ['Gillette','Fusion 5 ProGlide Flexball',999,1399,4.7,32000,'5-blade razor, precision trimmer, FlexBall handle'],
    ['Schick','Hydro 5 Sense Razor',699,999,4.6,18000,'5-blade, hydrating gel reservoir, flex head'],
    ['Dyson','Airwrap Styler Complete',45900,52900,4.8,3600,'Multi-purpose styler, no extreme heat, Coanda'],
    ['Dyson','Corrale Hair Straightener',34900,40900,4.8,2800,'Flexing plates, frizz-free, cordless operation'],
    ['Philips','HP8316 2-in-1 Straightener',2499,3499,4.5,12000,'Ceramic plates, 220°C, hair dryer + straightener'],
    ['Vega','VHSF-02 Straightener',1299,1999,4.4,16000,'Ceramic-tourmaline plates, 210°C, fast heat'],
    ['Beardo','Beard Growth Kit',1499,2499,4.6,8200,'Beard oil, balm, face wash, comb + brush set'],
    ['Man Matters','Biotin Beard & Hair',699,999,4.5,6800,'Biotin, vitamin E, collagen, Amla extract serum'],
    ['Mamaearth','Vitamin C Face Wash 100ml',249,299,4.6,28000,'Turmeric + Vitamin C, SPF 20, oil control'],
    ['Mamaearth','Onion Hair Oil 250ml',499,599,4.7,22000,'Onion + Redensyl, DHT blocking, 35 oils'],
    ['WOW','Apple Cider Vinegar Shampoo',499,699,4.6,18000,'ACV + Tea Tree, sulfate-free, 300ml'],
    ['Himalaya','Anti-Dandruff Shampoo 400ml',299,349,4.5,34000,'Neem + Turmeric, soap-free, clinically proven'],
    ["L'Oréal",'Paris Total Repair 5 Shampoo',599,799,4.6,18000,'5 damage factors, keratin, pro-repair formula'],
    ['Biotique','Bio Morning Neem Face Wash',199,249,4.5,22000,'Neem & margosa, purifying, oil-control, 150ml'],
    ['Forest Essentials','Sandalwood Face Cream',1499,1799,4.7,6200,'Ayurvedic, rose water, full moon water, 50g'],
    ['Kama Ayurveda','Kumkumadi Miraculous Oil',2249,2799,4.8,4800,'Pure saffron, kumkumadi, face radiance serum'],
    ['Bombay Shaving Company','Shaving Kit',1299,1899,4.6,9800,'Safety razor, brush, shaving cream + aftershave'],
    ['Plum','Niacinamide 10% Serum 30ml',599,799,4.7,12000,'10% niacinamide, Zinc 1%, pore minimizer'],
    ['Minimalist','Vitamin C 10% Serum 30ml',499,699,4.7,16000,'Ascorbyl Glucoside, brightening, stable vit-C'],
    ['The Derma Co','Hyaluronic Acid Serum 30ml',599,799,4.7,14000,'2% hyaluronic acid, ceramides, hydration serum'],
    ['Cetaphil','Moisturizing Cream 250g',599,749,4.8,28000,'Dermatologist recommended, 24h moisture, fragrance-free'],
    ['Neutrogena','Hydro Boost Water Gel 50g',999,1299,4.7,18000,'Hyaluronic acid, non-comedogenic, fragrance-free'],
  ];
  groomData.forEach(([brand, name, price, mrp, rating, rcount, desc]) => {
    items.push(def('Beauty & Grooming', brand, name, price, mrp, rating, rcount, 'grooming', desc,
      {Type:'Personal Care',Skin:'All Types',Size:'As labelled',Shelf:'12-18 months',Origin:'India'},
      '2-hour Express', +(Math.random() * 12 + 1).toFixed(1)));
  });

  return items;
}

// ── Catalog & Filter ───────────────────────────────
const CATALOG = generate500Catalog();
const CATEGORIES = ['All', ...new Set(CATALOG.map(p => p.cat))];
const BRANDS = ['all', ...new Set(CATALOG.map(p => p.brand))].sort();
const COUPONS = {
  'SANTHAI500': { type: 'flat', val: 500, min: 1999 },
  'FESTIVE10': { type: 'pct', val: 10, min: 999 },
  'NEWUSER200': { type: 'flat', val: 200, min: 499 },
  'TECH15': { type: 'pct', val: 15, min: 4999 },
  'FLASH50': { type: 'flat', val: 50, min: 199 },
};

function getFilteredProducts() {
  let list = [...CATALOG];
  if (State.currentFilter !== 'All') list = list.filter(p => p.cat === State.currentFilter);
  if (State.brandFilter !== 'all') list = list.filter(p => p.brand === State.brandFilter);
  if (State.searchQuery) {
    const q = State.searchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)));
  }
  if (State.priceFilter !== 'all') {
    const rangeMap = { 'under-500': [0, 500], '500-2000': [500, 2000], '2000-10000': [2000, 10000], '10000-50000': [10000, 50000], 'above-50000': [50000, Infinity] };
    const [lo, hi] = rangeMap[State.priceFilter];
    list = list.filter(p => p.price >= lo && p.price < hi);
  }
  const maxDist = parseFloat(State.distFilter);
  if (maxDist < 999) list = list.filter(p => p.dist <= maxDist);
  const minRating = parseFloat(State.ratingFilter);
  if (minRating > 0) list = list.filter(p => p.rating >= minRating);
  switch (State.currentSort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    case 'near': list.sort((a, b) => a.dist - b.dist); break;
  }
  return list;
}

// ── DOM Helpers ────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
function toast(msg, icon = '✅') {
  const t = $('toast-bar'); const tx = $('toast-text');
  tx.textContent = icon + ' ' + msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ── Render ─────────────────────────────────────────
let filteredCache = [];

function renderProducts(reset = false) {
  const grid = $('products-grid');
  if (reset) {
    filteredCache = getFilteredProducts();
    State.displayedCount = 0;
    grid.innerHTML = '';
    $('result-count').textContent = `${filteredCache.length} products found`;
    $('category-heading').textContent = State.currentFilter === 'All' ? '500 Branded Products' : State.currentFilter;
  }
  const batch = filteredCache.slice(State.displayedCount, State.displayedCount + State.PAGE_SIZE);
  batch.forEach(p => {
    const isWishlisted = State.wishlist.some(w => w.id === p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="card-media" onclick="openQuickView(${p.id})">
        <img class="card-img" src="${p.img}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'">
        <div class="brand-pill">${p.brand}</div>
        <div class="card-badge-group">
          ${p.discount > 0 ? `<span class="discount-pill">-${p.discount}%</span>` : ''}
          <button class="btn-wishlist-toggle ${isWishlisted ? 'active' : ''}"
            onclick="event.stopPropagation();toggleWishlist(${p.id})" title="Wishlist" id="wl-btn-${p.id}">♥</button>
        </div>
        ${p.delivery ? `<div class="delivery-speed-pill">⚡ ${p.delivery}</div>` : ''}
      </div>
      <div class="card-content">
        <div>
          <div class="card-category">${p.cat}</div>
          <div class="card-name" onclick="openQuickView(${p.id})" title="${p.name}">${p.name}</div>
          ${p.desc ? `<div class="card-desc">${p.desc.substring(0, 72)}…</div>` : ''}
        </div>
        <div class="card-rating-store">
          <span class="rating-tag" onclick="openFeedback(${p.id})">★ ${p.rating} (${p.rcount.toLocaleString('en-IN')})</span>
          <span class="distance-tag">📍 ${p.dist} km</span>
        </div>
        <div class="card-footer">
          <div class="price-wrap">
            <div class="price-main">${fmt(p.price)}</div>
            <div class="price-mrp">MRP ${fmt(p.mrp)}</div>
            ${p.emi ? `<div class="emi-tag">${p.emi}</div>` : ''}
          </div>
          <div class="card-actions-group">
            <button class="btn-quick-view" onclick="openQuickView(${p.id})">👁</button>
            <button class="btn-add-cart" id="cart-btn-${p.id}" onclick="addToCart(${p.id})">+ Cart</button>
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  State.displayedCount += batch.length;
  const status = $('infinite-status');
  const spinner = $('infinite-spinner');
  spinner.classList.remove('active');
  if (State.displayedCount >= filteredCache.length) {
    status.innerHTML = `✅ All ${filteredCache.length} products loaded`;
    if (observer) observer.unobserve($('infinite-scroll-sentinel'));
  } else {
    status.textContent = `Loaded ${State.displayedCount} of ${filteredCache.length} — scroll for more`;
    if (observer) observer.observe($('infinite-scroll-sentinel'));
  }
}

// ── Infinite Scroll Observer ───────────────────────
let observer = null;
function initObserver() {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && State.displayedCount < filteredCache.length) {
        $('infinite-spinner').classList.add('active');
        setTimeout(() => renderProducts(), 400);
      }
    });
  }, { rootMargin: '300px' });
  observer.observe($('infinite-scroll-sentinel'));
}

// ── Cart ───────────────────────────────────────────
function addToCart(id) {
  const p = CATALOG.find(x => x.id === id);
  if (!p) return;
  const existing = State.cart.find(x => x.id === id);
  if (existing) { existing.qty++; } else { State.cart.push({ ...p, qty: 1 }); }
  saveState(); updateCartBadge(); renderCart();
  const btn = $(`cart-btn-${id}`);
  if (btn) { btn.textContent = '✓ Added'; btn.classList.add('added'); setTimeout(() => { btn.textContent = '+ Cart'; btn.classList.remove('added'); }, 1800); }
  toast(`${p.name.substring(0, 30)}… added to cart`);
}

function removeFromCart(id) {
  State.cart = State.cart.filter(x => x.id !== id);
  saveState(); updateCartBadge(); renderCart();
}

function changeQty(id, delta) {
  const item = State.cart.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveState(); renderCart();
}

function updateCartBadge() { $('cart-count').textContent = State.cart.reduce((s, i) => s + i.qty, 0); }

function renderCart() {
  const list = $('cart-items-list');
  const couponDiscount = State.coupon ? calcDiscount() : 0;
  list.innerHTML = '';
  if (!State.cart.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">🛒 Your cart is empty.<br>Start adding branded products!</div>';
    $('btn-proceed-checkout').disabled = true;
    $('cart-subtotal').textContent = '₹0';
    $('cart-grand-total').textContent = '₹0';
    return;
  }
  const subtotal = State.cart.reduce((s, i) => s + i.price * i.qty, 0);
  State.cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}"
           onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'">
      <div class="cart-item-info">
        <div>
          <div class="cart-item-brand">${item.brand}</div>
          <div class="cart-item-name">${item.name}</div>
          <div style="font-size:12.5px;color:#FFF;font-weight:700;margin-top:2px;">${fmt(item.price * item.qty)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-counter">
            <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
            <span style="min-width:18px;text-align:center;font-size:13px;">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
          </div>
          <button onclick="removeFromCart(${item.id})"
            style="background:rgba(244,63,94,0.1);color:var(--accent-rose);border:1px solid rgba(244,63,94,0.3);
                   padding:4px 10px;border-radius:var(--radius-sm);font-size:11px;font-weight:700;cursor:pointer;">Remove</button>
        </div>
      </div>`;
    list.appendChild(el);
  });
  const total = subtotal - couponDiscount;
  $('cart-subtotal').textContent = fmt(subtotal);
  $('cart-grand-total').textContent = fmt(total);
  const drow = $('cart-discount-row');
  if (couponDiscount > 0) { drow.style.display = 'flex'; $('cart-discount-val').textContent = '-' + fmt(couponDiscount); }
  else { drow.style.display = 'none'; }
  $('btn-proceed-checkout').disabled = false;
}

function calcDiscount() {
  if (!State.coupon) return 0;
  const c = COUPONS[State.coupon];
  if (!c) return 0;
  const sub = State.cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (sub < c.min) return 0;
  return c.type === 'flat' ? c.val : Math.round(sub * c.val / 100);
}

// ── Wishlist ───────────────────────────────────────
function toggleWishlist(id) {
  const p = CATALOG.find(x => x.id === id);
  const idx = State.wishlist.findIndex(x => x.id === id);
  const btn = $(`wl-btn-${id}`);
  if (idx === -1) {
    State.wishlist.push(p);
    if (btn) btn.classList.add('active');
    toast(`${p.name.substring(0, 28)}… saved to wishlist`, '♥');
  } else {
    State.wishlist.splice(idx, 1);
    if (btn) btn.classList.remove('active');
    toast(`Removed from wishlist`, '💔');
  }
  saveState(); $('wishlist-count').textContent = State.wishlist.length;
}

// ── Quick View Modal ───────────────────────────────
function openQuickView(id) {
  const p = CATALOG.find(x => x.id === id);
  if (!p) return;
  $('qv-title').textContent = p.name;
  $('qv-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;" class="qv-grid">
      <div>
        <img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:var(--radius-sm);object-fit:cover;max-height:320px;"
             onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'">
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <span class="brand-pill" style="position:static;">${p.brand}</span>
          <span class="discount-pill" style="position:static;">-${p.discount}%</span>
          <span class="delivery-speed-pill" style="position:static;">⚡ ${p.delivery}</span>
        </div>
      </div>
      <div>
        <div class="card-category" style="margin-bottom:6px;">${p.cat}</div>
        <h3 style="font-size:19px;font-weight:800;color:#FFF;line-height:1.3;margin-bottom:10px;">${p.name}</h3>
        <div class="card-rating-store" style="margin-bottom:12px;">
          <span class="rating-tag" onclick="openFeedback(${p.id})">★ ${p.rating} · ${p.rcount.toLocaleString('en-IN')} reviews</span>
          <span class="distance-tag">📍 ${p.dist} km away</span>
        </div>
        <p style="font-size:13.5px;color:var(--text-secondary);line-height:1.55;margin-bottom:14px;">${p.desc}</p>
        <div style="margin-bottom:14px;">
          <div style="font-size:28px;font-weight:900;color:#FFF;">${fmt(p.price)}</div>
          <div style="color:var(--text-muted);text-decoration:line-through;font-size:13px;">MRP ${fmt(p.mrp)}</div>
          ${p.emi ? `<div style="color:var(--accent-cyan);font-size:12px;font-weight:700;margin-top:3px;">${p.emi}</div>` : ''}
        </div>
        <table class="specs-table">
          ${Object.entries(p.specs || {}).map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        </table>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button onclick="addToCart(${p.id});closeModal('quickview-modal')" class="btn-checkout" style="flex:1;padding:11px;">
            🛒 Add to Cart
          </button>
          <button onclick="toggleWishlist(${p.id})" class="btn-quick-view" style="padding:11px 14px;">♥</button>
        </div>
      </div>
    </div>`;
  openModal('quickview-modal');
}

// ── Feedback Modal ─────────────────────────────────
const FEEDBACK_DB = {};
const FAKE_NAMES = ['Priya K.','Arun M.','Sneha T.','Rahul S.','Ananya D.','Kiran B.','Vijay R.','Divya N.','Sanjay P.','Meera V.','Aarav G.','Pooja L.','Rohit C.','Nisha J.','Arjun F.'];
const FAKE_COMMENTS = [
  'Absolutely love this product! Worth every rupee. Build quality is outstanding.',
  'Arrived in perfect condition. Packaging was excellent. 10/10 would buy again.',
  'Great value for money. Performs exactly as described. Very happy with the purchase.',
  'Premium feel. My whole family loves it. Delivery was super fast!',
  'Exceeded expectations. The brand quality is unmatched. Highly recommend.',
  'Perfect gift. The recipient was thrilled. Will definitely shop here again.',
  'Excellent product, smooth experience from ordering to delivery.',
  'Top-notch quality. A bit pricey but totally worth it for a branded item.',
  'Works like a charm. Zero issues after 3 months of daily use.',
  'The express delivery was a game-changer. Received in 90 minutes!',
];

function openFeedback(id) {
  const p = CATALOG.find(x => x.id === id);
  if (!p) return;
  if (!FEEDBACK_DB[id]) {
    FEEDBACK_DB[id] = Array.from({ length: 4 + Math.floor(Math.random() * 4) }, () => ({
      user: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
      rating: (4 + Math.random()).toFixed(1),
      comment: FAKE_COMMENTS[Math.floor(Math.random() * FAKE_COMMENTS.length)],
      verified: Math.random() > 0.3,
      date: new Date(Date.now() - Math.random() * 90 * 86400000).toLocaleDateString('en-IN'),
    }));
  }
  $('feedback-modal-title').textContent = `Reviews for ${p.name}`;
  const reviewsHTML = FEEDBACK_DB[id].map(r => `
    <div class="feedback-item">
      <div class="feedback-header">
        <div class="feedback-user">
          👤 ${r.user} ${r.verified ? '<span style="color:var(--accent-green);font-size:11px;">✓ Verified Buyer</span>' : ''}
        </div>
        <span class="rating-tag">★ ${r.rating}</span>
      </div>
      <div class="feedback-comment">${r.comment}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${r.date}</div>
    </div>`).join('');
  $('feedback-modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px;background:var(--bg-card);border-radius:var(--radius-sm);">
      <div style="font-size:40px;font-weight:900;color:#FFF;">${p.rating}</div>
      <div>
        <div style="color:var(--accent-gold);font-size:18px;">★★★★★</div>
        <div style="font-size:12px;color:var(--text-secondary);">${p.rcount.toLocaleString('en-IN')} verified ratings</div>
      </div>
    </div>
    <h4 style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:12px;">Customer Reviews</h4>
    ${reviewsHTML}
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-subtle);">
      <h4 style="font-size:14px;font-weight:700;margin-bottom:10px;">Write Your Review</h4>
      <div class="rating-stars-input" id="star-input">★★★★★</div>
      <textarea id="review-text" class="input-styled" rows="3" placeholder="Share your experience with this product…"></textarea>
      <button onclick="submitReview(${p.id})" class="btn-checkout" style="margin-top:10px;padding:10px;">Submit Review</button>
    </div>`;
  closeModal('quickview-modal');
  openModal('feedback-modal');
}

function submitReview(id) {
  const txt = $('review-text').value.trim();
  if (!txt) { toast('Please write a review first!', '⚠️'); return; }
  if (!FEEDBACK_DB[id]) FEEDBACK_DB[id] = [];
  FEEDBACK_DB[id].unshift({ user: 'You', rating: '5.0', comment: txt, verified: true, date: new Date().toLocaleDateString('en-IN') });
  toast('Review submitted! Thank you 🙏', '⭐');
  closeModal('feedback-modal');
}

// ── Coupon ─────────────────────────────────────────
function applyQuickPromo(code) {
  if (!State.cart.length) { openCart(); toast('Add items to cart first, then apply coupon!', '🛒'); return; }
  $('coupon-input').value = code;
  applyCoupon();
  openCart();
}

function applyCoupon() {
  const code = $('coupon-input').value.trim().toUpperCase();
  const couponDef = COUPONS[code];
  const status = $('coupon-status');
  if (!couponDef) { status.style.color = 'var(--accent-rose)'; status.textContent = '❌ Invalid coupon code.'; return; }
  const sub = State.cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (sub < couponDef.min) {
    status.style.color = 'var(--accent-rose)';
    status.textContent = `❌ Min order ${fmt(couponDef.min)} required.`;
    return;
  }
  State.coupon = code;
  const disc = calcDiscount();
  status.style.color = 'var(--accent-green)';
  status.textContent = `✅ ${code} applied! You save ${fmt(disc)}.`;
  renderCart();
  toast(`Coupon ${code} applied! Saving ${fmt(disc)} 🎉`);
}

// ── Cart Drawer ────────────────────────────────────
function openCart() {
  renderCart();
  $('cart-drawer').classList.add('open');
  $('drawer-overlay').classList.add('open');
}
function closeCart() {
  $('cart-drawer').classList.remove('open');
  $('drawer-overlay').classList.remove('open');
}

// ── Payment / UPI Checkout ─────────────────────────
function openCheckout() {
  const subtotal = State.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = calcDiscount();
  const total = subtotal - disc;
  const orderId = 'SP' + Date.now().toString().slice(-8);
  const upiStr = `upi://pay?pa=9488467006@fam&pn=Santhai+Prime+Marketplace&am=${total}&cu=INR&tn=Order+${orderId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiStr)}`;
  const itemSummary = State.cart.map(i => `<tr><td>${i.name.substring(0,28)}…</td><td style="text-align:right;">${fmt(i.price*i.qty)}</td></tr>`).join('');
  $('payment-modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">
      <div>
        <h4 style="font-size:14px;color:#FFF;margin-bottom:10px;">Order Summary — ${orderId}</h4>
        <table style="width:100%;font-size:12.5px;border-collapse:collapse;">
          ${itemSummary}
          ${disc > 0 ? `<tr style="color:var(--accent-green);"><td>Discount (${State.coupon})</td><td style="text-align:right;">-${fmt(disc)}</td></tr>` : ''}
          <tr style="border-top:1px solid var(--border-highlight);font-weight:800;font-size:14px;">
            <td style="padding-top:8px;">Total</td>
            <td style="text-align:right;padding-top:8px;color:#FFF;">${fmt(total)}</td>
          </tr>
        </table>
        <div style="margin-top:14px;">
          <label style="font-size:12px;font-weight:700;color:var(--accent-gold);text-transform:uppercase;display:block;margin-bottom:6px;">Delivery Address</label>
          <input type="text" id="del-name" class="input-styled" placeholder="Full Name" style="margin-bottom:6px;">
          <input type="text" id="del-phone" class="input-styled" placeholder="Mobile Number" style="margin-bottom:6px;">
          <textarea id="del-addr" class="input-styled" rows="2" placeholder="Full Delivery Address…" style="margin-bottom:6px;"></textarea>
          <button onclick="placeOrder('${orderId}', ${total})" class="btn-checkout" style="padding:11px;">Confirm & Place Order</button>
        </div>
      </div>
      <div style="text-align:center;">
        <h4 style="font-size:13px;color:#FFF;margin-bottom:8px;">Pay with UPI</h4>
        <div class="qr-frame">
          <img src="${qrUrl}" width="180" height="180" alt="UPI QR Code">
        </div>
        <div class="upi-chip">
          <span class="mono" style="font-size:13px;color:var(--accent-gold);">9488467006@fam</span>
          <button onclick="navigator.clipboard.writeText('9488467006@fam');toast('UPI ID copied!','📋')" class="btn-loc-change">Copy</button>
        </div>
        <p style="font-size:11.5px;color:var(--text-secondary);margin-top:8px;">Payee: Santhai Prime Marketplace<br>Amount: ${fmt(total)}</p>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;">
          ${['Google Pay','PhonePe','Paytm','BHIM UPI'].map(u => `
            <button onclick="toast('Opening ${u}…','📱')" class="btn-quick-view" style="width:100%;padding:8px;font-size:13px;font-weight:700;">${u}</button>
          `).join('')}
        </div>
      </div>
    </div>`;
  closeCart();
  openModal('payment-modal');
}

function placeOrder(orderId, total) {
  const name = $('del-name').value.trim();
  const phone = $('del-phone').value.trim();
  const addr = $('del-addr').value.trim();
  if (!name || !phone || !addr) { toast('Please fill all delivery details!', '⚠️'); return; }
  const order = {
    id: orderId, total, name, phone, addr,
    items: [...State.cart],
    date: new Date().toLocaleString('en-IN'),
    status: 0,
    location: State.location.city,
  };
  State.orders.push(order);
  State.cart = [];
  State.coupon = null;
  saveState();
  updateCartBadge();
  closeModal('payment-modal');
  $('orders-count').textContent = State.orders.length;
  toast(`Order ${orderId} placed! 🎉 Estimated delivery in 2 hours.`, '🚀');
  setTimeout(() => simulateTracking(orderId), 5000);
}

function simulateTracking(orderId) {
  const order = State.orders.find(o => o.id === orderId);
  if (!order || order.status >= 4) return;
  order.status = Math.min(4, (order.status || 0) + 1);
  saveState();
  const stages = ['Order Confirmed','Packed at Warehouse','Out for Delivery','Delivered ✅'];
  if (order.status <= 4) toast(`Order ${orderId}: ${stages[order.status - 1]}`, '📦');
  if (order.status < 4) setTimeout(() => simulateTracking(orderId), 12000);
}

// ── Orders Modal ───────────────────────────────────
function openOrdersModal() {
  const body = $('orders-modal-body');
  if (!State.orders.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">📦 No orders yet.<br>Start shopping to see your orders here!</div>';
  } else {
    const stages = ['Order Placed','Confirmed','Packed','Out for Delivery','Delivered'];
    body.innerHTML = State.orders.slice().reverse().map(o => `
      <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span class="mono" style="font-size:13px;color:var(--accent-gold);">${o.id}</span>
          <span style="font-size:12px;color:var(--text-muted);">${o.date}</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:4px;">${fmt(o.total)}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">${o.items.length} item(s) · Deliver to: ${o.name}</div>
        <div class="timeline-wrap" style="padding-left:22px;">
          ${stages.map((s, i) => `
            <div class="timeline-step ${i < o.status ? 'completed' : (i === o.status ? 'active' : '')}">
              <div class="timeline-dot">${i < o.status ? '✓' : (i + 1)}</div>
              <div class="timeline-title">${s}</div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  }
  openModal('orders-modal');
}

// ── Wishlist Modal ─────────────────────────────────
function openWishlistModal() {
  const body = $('wishlist-modal-body');
  if (!State.wishlist.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">♥ Your wishlist is empty.<br>Tap the ♥ on any product to save it!</div>';
  } else {
    body.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${State.wishlist.map(p => `
        <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:10px;display:flex;gap:10px;align-items:flex-start;">
          <img src="${p.img}" style="width:60px;height:60px;border-radius:6px;object-fit:cover;"
               onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80'">
          <div style="flex:1;">
            <div style="font-size:12px;color:var(--accent-gold);font-weight:700;">${p.brand}</div>
            <div style="font-size:13px;font-weight:600;color:#FFF;line-height:1.3;">${p.name.substring(0,40)}…</div>
            <div style="font-size:13.5px;font-weight:800;color:#FFF;margin-top:4px;">${fmt(p.price)}</div>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <button onclick="addToCart(${p.id});closeModal('wishlist-modal')" class="btn-add-cart" style="font-size:11px;padding:4px 8px;">+ Cart</button>
              <button onclick="toggleWishlist(${p.id});openWishlistModal()" class="btn-quick-view" style="font-size:11px;padding:4px 8px;">Remove</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  }
  openModal('wishlist-modal');
}

// ── API Modal ──────────────────────────────────────
function openApiModal() {
  $('active-api-key-val').textContent = State.apiKey;
  $('strip-api-key-preview').textContent = State.apiKey.substring(0, 36) + '…';
  $('api-code-snippet').textContent = `curl -X POST https://api.santhai.prime/v1/orders \\\n  -H "Authorization: Bearer ${State.apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"items":[{"sku":"SP001","qty":2}],"upi":"9488467006@fam"}'`;
  openModal('api-modal');
}

// ── Location ───────────────────────────────────────
function updateLocationUI() {
  $('user-location-label').textContent = `${State.location.city} · ${State.location.pincode}`;
}

function setLocation(city, pincode, lat, lon) {
  State.location = { city, pincode, lat, lon };
  saveState(); updateLocationUI();
  closeModal('location-modal');
  toast(`Location set to ${city} (${pincode}) ✅`, '📍');
}

// ── Chat ───────────────────────────────────────────
const BOT_RESPONSES = {
  'warranty': 'All branded products come with manufacturer warranty ranging from 1–10 years. We provide doorstep service for major brands like LG, Samsung, Sony, Dyson and Bosch.',
  'delivery': 'Express delivery within 2 hours for in-stock items! Standard delivery is same-day for orders placed before 6 PM.',
  'return': 'We offer 7-day hassle-free returns on all products. Electronics have 10-day return window. Just raise a request from your Orders section.',
  'upi': 'You can pay via UPI at checkout using Google Pay, PhonePe, Paytm or BHIM UPI. Our UPI ID is 9488467006@fam (Santhai Prime Marketplace).',
  'coupon': 'Active coupons: SANTHAI500 (₹500 off on ₹1999+), FESTIVE10 (10% off on ₹999+), NEWUSER200 (₹200 off on ₹499+), TECH15 (15% off on ₹4999+).',
  'emi': 'EMI is available on products above ₹4,999 via most credit cards. No-cost EMI is available on select products from HDFC, ICICI, Axis & SBI.',
  'default': 'Thank you for reaching out! I\'m the Santhai Prime AI Assistant. I can help with delivery, returns, warranties, coupons & payments. What would you like to know?',
};
function getBotReply(msg) {
  const m = msg.toLowerCase();
  for (const [k, v] of Object.entries(BOT_RESPONSES)) { if (m.includes(k)) return v; }
  return BOT_RESPONSES.default;
}
function addChatMsg(text, type) {
  const box = $('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function sendChat() {
  const input = $('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  addChatMsg(msg, 'user');
  input.value = '';
  setTimeout(() => addChatMsg(getBotReply(msg), 'bot'), 600);
}

// ── Flash Deal Timer ───────────────────────────────
function startDealTimer() {
  let secs = 3 * 3600 + 48 * 60 + 12;
  setInterval(() => {
    secs = Math.max(0, secs - 1);
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    const el = $('deal-timer');
    if (el) el.textContent = `${h}h ${m}m ${s}s`;
  }, 1000);
}

// ── Init ───────────────────────────────────────────
function init() {
  // Category chips
  const chipGroup = $('category-chips');
  CATEGORIES.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (cat === 'All' ? ' active' : '');
    chip.textContent = cat;
    chip.onclick = () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      State.currentFilter = cat;
      renderProducts(true);
      if (observer) observer.observe($('infinite-scroll-sentinel'));
    };
    chipGroup.appendChild(chip);
  });

  // Brand filter
  const brandSel = $('brand-filter');
  brandSel.innerHTML = BRANDS.map(b => `<option value="${b}">${b === 'all' ? 'All Brands' : b}</option>`).join('');
  brandSel.onchange = () => { State.brandFilter = brandSel.value; renderProducts(true); };

  // Other filters
  $('price-range-filter').onchange = e => { State.priceFilter = e.target.value; renderProducts(true); };
  $('dist-filter').onchange = e => { State.distFilter = e.target.value; renderProducts(true); };
  $('rating-filter').onchange = e => { State.ratingFilter = e.target.value; renderProducts(true); };
  $('sort-filter').onchange = e => { State.currentSort = e.target.value; renderProducts(true); };

  // Search
  let searchTimer;
  $('search-input').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { State.searchQuery = e.target.value.trim(); renderProducts(true); }, 350);
  });

  // Voice search
  $('btn-voice-search').onclick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { toast('Voice search not supported in this browser', '⚠️'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.lang = 'en-IN'; rec.start();
    rec.onresult = e => {
      const txt = e.results[0][0].transcript;
      $('search-input').value = txt;
      State.searchQuery = txt;
      renderProducts(true);
      toast(`Voice: "${txt}"`, '🎙️');
    };
  };

  // Cart
  $('btn-cart-open').onclick = openCart;
  $('btn-cart-close').onclick = closeCart;
  $('drawer-overlay').onclick = closeCart;
  $('btn-apply-coupon').onclick = applyCoupon;
  $('btn-proceed-checkout').onclick = openCheckout;

  // Wishlist
  $('btn-open-wishlist').onclick = openWishlistModal;
  $('btn-wishlist-close').onclick = () => closeModal('wishlist-modal');

  // Orders
  $('btn-open-orders').onclick = openOrdersModal;
  $('btn-orders-close').onclick = () => closeModal('orders-modal');

  // Modals
  $('btn-qv-close').onclick = () => closeModal('quickview-modal');
  $('btn-feedback-close').onclick = () => closeModal('feedback-modal');
  $('btn-loc-close').onclick = () => closeModal('location-modal');
  $('btn-pay-close').onclick = () => closeModal('payment-modal');
  $('btn-api-close').onclick = () => closeModal('api-modal');

  // Location
  $('btn-open-loc-modal').onclick = () => openModal('location-modal');
  $('btn-use-gps').onclick = () => {
    if (!navigator.geolocation) { toast('Geolocation not supported', '⚠️'); return; }
    toast('Detecting GPS…', '📡');
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation('Your Location', 'Auto-Detect', pos.coords.latitude, pos.coords.longitude);
    }, () => toast('Could not get GPS. Please select manually.', '⚠️'));
  };
  document.querySelectorAll('.city-btn').forEach(btn => {
    btn.onclick = () => setLocation(btn.dataset.city, btn.dataset.pincode, parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lon));
  });
  $('btn-manual-city-apply').onclick = () => {
    const val = $('manual-city-input').value.trim();
    if (!val) return;
    setLocation(val, val, 0, 0);
  };

  // API Modal
  $('btn-open-api-modal').onclick = openApiModal;
  $('btn-copy-live-api-key').onclick = () => { navigator.clipboard.writeText(State.apiKey); toast('API key copied to clipboard!', '📋'); };
  $('btn-regenerate-api-key').onclick = () => { State.apiKey = generateApiKey(); saveState(); openApiModal(); toast('New API key generated!', '🔑'); };
  $('btn-test-api-call').onclick = () => { toast('API ping successful — 42ms latency ✅', '⚡'); };
  $('btn-save-ext-keys').onclick = () => {
    localStorage.setItem('sp_razorpay_key', $('ext-payment-key').value);
    localStorage.setItem('sp_maps_key', $('ext-maps-key').value);
    toast('Integration keys saved!', '💾');
  };

  // Chat
  $('btn-toggle-chat').onclick = () => $('chat-drawer').classList.toggle('open');
  $('btn-close-chat').onclick = () => $('chat-drawer').classList.remove('open');
  $('btn-send-chat').onclick = sendChat;
  $('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

  // Close modals on overlay click
  document.querySelectorAll('.modal-wrapper').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });

  // Initial state
  updateLocationUI();
  updateCartBadge();
  $('wishlist-count').textContent = State.wishlist.length;
  $('orders-count').textContent = State.orders.length;
  $('strip-api-key-preview').textContent = State.apiKey.substring(0, 36) + '…';

  // Load ext keys
  $('ext-payment-key').value = localStorage.getItem('sp_razorpay_key') || '';
  $('ext-maps-key').value = localStorage.getItem('sp_maps_key') || '';

  // Render products & start observers
  renderProducts(true);
  initObserver();
  startDealTimer();
}

document.addEventListener('DOMContentLoaded', init);

// ── Expose globals needed by inline onclick ────────
window.openQuickView = openQuickView;
window.toggleWishlist = toggleWishlist;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;
window.openFeedback = openFeedback;
window.submitReview = submitReview;
window.applyQuickPromo = applyQuickPromo;
window.openWishlistModal = openWishlistModal;
window.closeModal = closeModal;
window.placeOrder = placeOrder;
window.resetFilters = () => {
  State.currentFilter = 'All'; State.searchQuery = ''; State.brandFilter = 'all';
  State.priceFilter = 'all'; State.distFilter = '999'; State.ratingFilter = '0';
  $('search-input').value = '';
  document.querySelectorAll('.filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  renderProducts(true);
};
