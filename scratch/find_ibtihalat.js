const https = require('https');
const http = require('http');

async function testUrl(u) {
  return new Promise((resolve) => {
    const mod = u.startsWith('https') ? https : http;
    const req = mod.request(u, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-100' }, timeout: 4000 }, (res) => {
      resolve({ url: u, status: res.statusCode, type: res.headers['content-type'] });
    });
    req.on('error', err => resolve({ url: u, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url: u, error: 'TIMEOUT' }); });
    req.end();
  });
}

// Let's test specific archive.org collections known to be live
const candidateIbtihalat = [
  // Tobar
  'https://archive.org/download/NasrEldeenTobar/01.mp3',
  'https://archive.org/download/NasrEldeenTobar/02.mp3',
  'https://archive.org/download/nasr_elden_tobar/01.mp3',
  'https://archive.org/download/Nasr_Al-Din_Tobar/01.mp3',
  'https://archive.org/download/Nasr_El_Deen_Tobar_Gala_Al-Monady/Gala_Al-Monady.mp3',
  'https://archive.org/download/Nasr-El-Deen-Tobar/Gala_Al_Monady.mp3',
  'https://archive.org/download/nasr_tobar/01.mp3',

  // Naqshbandi
  'https://archive.org/download/Sayed_Naqshbandi_Mawlay/Mawlay.mp3',
  'https://archive.org/download/sayed-naqshbandi-mawlay/01.mp3',
  'https://archive.org/download/Sayed_Naqshbandi/01.mp3',
  'https://archive.org/download/sayed_naqshbandi_ibtihalat/01.mp3',
  'https://archive.org/download/Al-Naqshbandi/01.mp3',

  // Omran
  'https://archive.org/download/Mohamed_Omran/01.mp3',
  'https://archive.org/download/Mohamed_Omran_Ibtihalat/01.mp3',
  'https://archive.org/download/Sheikh_Mohamed_Omran/01.mp3',
  'https://archive.org/download/mohamed_omran_archive/01.mp3'
];

(async () => {
  for (const c of candidateIbtihalat) {
    const res = await testUrl(c);
    console.log(JSON.stringify(res));
  }
})();
