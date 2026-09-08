const https = require('https');

const options = {
  hostname: 'www.mp3quran.net',
  path: '/api/v3/reciters?language=ar',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Reciters found:', json.reciters.length);
      json.reciters.forEach(r => {
        if (r.name.includes('إسلام') || r.name.includes('اسلام') || r.name.includes('بدر') || r.name.includes('التركي') || r.name.includes('صبحي')) {
          console.log(`\n=== MATCH: ${r.name} (id: ${r.id}) ===`);
          r.moshaf.forEach(m => {
            console.log(`  Moshaf: ${m.name} -> Server: ${m.server} (Surah total: ${m.surah_total}, list: ${m.surah_list})`);
          });
        }
      });
    } catch(e) {
      console.error('Error:', e.message, data.substring(0, 300));
    }
  });
}).on('error', err => console.error(err));
