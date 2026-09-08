const https = require('https');
const http = require('http');

const testUrls = [
  // Islam Sobhi candidates
  'https://server14.mp3quran.net/islam/001.mp3',
  'https://server14.mp3quran.net/islam_sobhi/001.mp3',
  'https://server14.mp3quran.net/islam/002.mp3',
  'https://server14.mp3quran.net/islam/114.mp3',
  'https://server14.mp3quran.net/islam/018.mp3',
  'https://everyayah.com/data/Islam_Sobhi_128kbps/001001.mp3',
  'https://download.quranicaudio.com/quran/islam_sobhi/001.mp3',
  
  // Badr Al-Turki candidates
  'https://server12.mp3quran.net/badr/001.mp3',
  'https://server12.mp3quran.net/badr_alturki/001.mp3',
  'https://server12.mp3quran.net/badr/002.mp3',
  'https://server12.mp3quran.net/badr/114.mp3',
  'https://download.quranicaudio.com/quran/badr_al_turki/001.mp3',
  
  // Tobar candidates
  'https://ia801503.us.archive.org/15/items/NasrElDeenTobar/GalaAlMonady.mp3',
  'https://archive.org/download/NasrElDeenTobar/GalaAlMonady.mp3',
  'https://archive.org/download/Nasr-El-Deen-Tobar-Ibtihalat/Gala_Al_Monady.mp3',
  'https://server10.mp3quran.net/download/tobar/01.mp3',
  'https://server10.mp3quran.net/download/tobar/02.mp3',
  
  // Naqshbandi candidates
  'https://ia800208.us.archive.org/21/items/MawlayEnnyBebabeK/Mawlay.mp3',
  'https://archive.org/download/MawlayEnnyBebabeK/Mawlay.mp3',
  'https://archive.org/download/Sayed-Naqshbandi-Ibtihalat/Mawlay.mp3',
  
  // Omran candidates
  'https://ia801505.us.archive.org/3/items/MohamedOmranIbtihalat/LutfKhafey.mp3',
  'https://archive.org/download/MohamedOmranIbtihalat/LutfKhafey.mp3'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, { method: 'HEAD', timeout: 6000 }, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location, contentType: res.headers['content-type'] });
    });
    req.on('error', (err) => resolve({ url, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  console.log('Testing Audio URLs...');
  for (const u of testUrls) {
    const r = await checkUrl(u);
    console.log(JSON.stringify(r));
  }
})();
