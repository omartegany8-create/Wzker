const https = require('https');
const http = require('http');

async function testWithRedirect(u, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects === 0) return resolve({ url: u, error: 'TOO_MANY_REDIRECTS' });
    const mod = u.startsWith('https') ? https : http;
    const req = mod.request(u, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Range': 'bytes=0-200'
      },
      timeout: 8000
    }, async (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, u).toString();
        const r = await testWithRedirect(nextUrl, maxRedirects - 1);
        resolve({ initialUrl: u, finalUrl: nextUrl, ...r });
      } else {
        resolve({ url: u, status: res.statusCode, contentType: res.headers['content-type'], length: res.headers['content-length'] });
      }
    });
    req.on('error', (err) => resolve({ url: u, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url: u, error: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  const tests = [
    'https://archive.org/download/nasr_elden_tobar/01.mp3',
    'https://archive.org/download/nasr_elden_tobar/02.mp3',
    'https://archive.org/download/nasr_elden_tobar/03.mp3',
    'https://archive.org/download/nasr_elden_tobar/04.mp3',
    'https://archive.org/download/nasr_elden_tobar/05.mp3',
    'https://archive.org/download/nasr_elden_tobar/06.mp3',
    'https://archive.org/download/nasr_elden_tobar/07.mp3'
  ];

  console.log('Testing redirect following for Tobar...');
  for (const t of tests) {
    const res = await testWithRedirect(t);
    console.log(JSON.stringify(res));
  }
})();
