const https = require('https');

const candidates = [
  // Tobar direct
  'https://ia800301.us.archive.org/29/items/Nasr-El-Deen-Tobar-Ibtihalat/Gala_Al_Monady.mp3',
  'https://ia800301.us.archive.org/29/items/Nasr-El-Deen-Tobar-Ibtihalat/01.mp3',
  'https://ia800301.us.archive.org/29/items/Nasr-El-Deen-Tobar-Ibtihalat/02.mp3',
  'https://ia600301.us.archive.org/29/items/Nasr-El-Deen-Tobar-Ibtihalat/Gala_Al_Monady.mp3',
  'https://ia902804.us.archive.org/3/items/nasr-el-deen-tobar-all-ibtihalat/01.mp3',
  'https://ia902804.us.archive.org/3/items/nasr-el-deen-tobar-all-ibtihalat/02.mp3',
  'https://ia902804.us.archive.org/3/items/nasr-el-deen-tobar-all-ibtihalat/03.mp3',
  'https://ia801900.us.archive.org/10/items/Tobar_Full_Ibtihalat/01.mp3',
  'https://ia801900.us.archive.org/10/items/Tobar_Full_Ibtihalat/02.mp3',
  
  // Islamweb or other CDN
  'https://media.islamway.net/several/442/01_Tobar.mp3',
  'https://media.islamway.net/several/442/02_Tobar.mp3',
  'https://media.islamway.net/several/442/03_Tobar.mp3',

  // Naqshbandi direct
  'https://ia800302.us.archive.org/15/items/Sayed-Naqshbandi-Ibtihalat/01.mp3',
  'https://ia800302.us.archive.org/15/items/Sayed-Naqshbandi-Ibtihalat/02.mp3',
  'https://ia801804.us.archive.org/26/items/Sayed-Naqshbandi-Full/01.mp3',
  'https://ia801804.us.archive.org/26/items/Sayed-Naqshbandi-Full/02.mp3',
  'https://media.islamway.net/several/442/01_Naqshbandi.mp3',
  'https://media.islamway.net/several/442/02_Naqshbandi.mp3',

  // Islam Sobhi check
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/001.mp3',
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/114.mp3',
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/018.mp3',

  // Badr Turki check
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/001.mp3',
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/114.mp3',
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/018.mp3'
];

async function check(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'], length: res.headers['content-length'] });
    });
    req.on('error', err => resolve({ url, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  console.log('Testing candidates...');
  for (const c of candidates) {
    const res = await check(c);
    console.log(JSON.stringify(res));
  }
})();
