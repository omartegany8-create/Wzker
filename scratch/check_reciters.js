const https = require('https');
const http = require('http');

const list = [
  // Islam Sobhi
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/001.mp3',
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/002.mp3',
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/018.mp3',
  'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/114.mp3',

  // Badr Al-Turki
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/001.mp3',
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/002.mp3',
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/018.mp3',
  'https://server10.mp3quran.net/bader/Rewayat-Hafs-A-n-Assem/114.mp3',

  // Other reciters check
  'https://server10.mp3quran.net/minsh/001.mp3',
  'https://server7.mp3quran.net/basit/001.mp3',
  'https://server8.mp3quran.net/afs/001.mp3',
  'https://server11.mp3quran.net/yasser/001.mp3',
  'https://server6.mp3quran.net/qtm/001.mp3',
  'https://server8.mp3quran.net/frs_a/001.mp3',
  'https://server12.mp3quran.net/maher/001.mp3'
];

async function check(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'GET', headers: { 'Range': 'bytes=0-100' }, timeout: 4000 }, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
    });
    req.on('error', err => resolve({ url, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  for (const u of list) {
    const r = await check(u);
    console.log(r.status === 206 || r.status === 200 ? 'SUCCESS: ' : 'FAIL: ', JSON.stringify(r));
  }
})();
