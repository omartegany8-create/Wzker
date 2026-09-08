const https = require('https');

const naqshTracks = [
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D9%85%D8%A7%D9%84%D9%83%20%D8%A7%D9%84%D9%85%D9%84%D9%83.mp3',
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D9%85%D9%86%20%D9%84%D9%87%20%D8%B3%D8%AA%D8%B1%20%D8%B9%D9%84%D9%8A%20%D8%AC%D9%85%D9%8A%D9%84.mp3',
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D9%86%D8%A8%D9%8A%D8%A7%D9%8B%20%D9%8A%D8%AC%D9%84%20%D8%B9%D9%86%20%D9%83%D9%84%20%D9%88%D8%B5%D9%81.mp3',
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D8%B1%D8%B3%D9%88%D9%84%20%D8%A7%D9%84%D9%84%D9%87%20%D9%8A%D8%A7%D9%86%D8%B9%D9%85%20%D8%A7%D9%84%D8%A3%D9%85%D9%8A%D9%86.mp3',
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D8%B1%D8%A8%D9%8A%20%D8%B9%D9%81%D9%88%D9%83%20%D9%84%D9%84%D8%B9%D8%A7%D8%B5%D9%8A%D9%86%20%D9%85%D8%AA%D8%B3%D8%B9.mp3',
  'https://ia801403.us.archive.org/9/items/Naqshabandee/%D9%8A%D8%A7%D9%86%D9%88%D8%B1%20%D9%83%D9%84%20%D8%B4%D9%8A%D8%A1%20%D9%88%D9%87%D8%AF%D8%A7%D9%87.mp3'
];

async function checkAudio(u) {
  return new Promise((resolve) => {
    https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-100' } }, (res) => {
      resolve({ status: res.statusCode, type: res.headers['content-type'] });
    }).on('error', err => resolve({ error: err.message }));
  });
}

(async () => {
  for (const t of naqshTracks) {
    const r = await checkAudio(t);
    console.log(r.status === 206 || r.status === 200 ? 'SUCCESS' : 'FAIL', JSON.stringify(r));
  }
})();
