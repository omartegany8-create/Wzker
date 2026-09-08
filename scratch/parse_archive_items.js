const https = require('https');

// Test items and get files
const urls = [
  'https://archive.org/metadata/Nasr_Eldeen_Tobar_uP_bY_mUSLEm',
  'https://archive.org/metadata/Sayed-Naqshbandi',
  'https://archive.org/metadata/Sayed_Al-Naqshbandi',
  'https://archive.org/metadata/Mohamed-Omran',
  'https://archive.org/metadata/Sheikh-Mohamed-Omran',
  'https://archive.org/metadata/Ebtahalat-Sayed-Naqshbandy'
];

async function checkItem(u) {
  return new Promise((resolve) => {
    https.get(u, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const server = j.server;
          const dir = j.dir;
          const mp3s = (j.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
          console.log(`URL: ${u} -> Server: ${server}, Dir: ${dir}, Files: ${mp3s.length}`);
          if (mp3s.length > 0) {
            mp3s.slice(0, 5).forEach(f => console.log(`   ${f.name}`));
          }
          resolve(j);
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  for (const u of urls) {
    await checkItem(u);
  }
})();
