const https = require('https');

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const items = [
    'nasr_elden_tobar',
    'nasr-el-deen-tobar-all-ibtihalat',
    'nasr_eldin_tobar',
    'sayed_naqshbandi_all',
    'sayed_naqshbandi',
    'mohamed_omran_all',
    'Mohamed_Omran'
  ];

  for (const it of items) {
    const data = await getJson(`https://archive.org/metadata/${it}`);
    if (data && data.files) {
      const mp3s = data.files.filter(f => f.name && f.name.endsWith('.mp3'));
      console.log(`\n=== SUCCESS: Item ${it} has ${mp3s.length} MP3 files! ===`);
      mp3s.slice(0, 8).forEach(f => console.log(`  File: ${f.name} | Title: ${f.title || f.name}`));
    }
  }
})();
