const https = require('https');

// Search archive.org metadata API or working sources for Tobar, Naqshbandi, Omran
async function queryArchive(item) {
  return new Promise((resolve) => {
    https.get(`https://archive.org/metadata/${item}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const server = json.server;
          const dir = json.dir;
          const mp3s = (json.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
          console.log(`\n=== Archive item: ${item} (Server: ${server}, Dir: ${dir}) ===`);
          console.log(`MP3 files count: ${mp3s.length}`);
          mp3s.slice(0, 8).forEach(f => {
            const url = `https://${server}${dir}/${encodeURIComponent(f.name)}`;
            console.log(`  File: ${f.name} -> URL: ${url} (title: ${f.title || ''})`);
          });
          resolve(mp3s);
        } catch (e) {
          console.error(`Error for ${item}:`, e.message);
          resolve([]);
        }
      });
    }).on('error', err => resolve([]));
  });
}

(async () => {
  const items = [
    'Nasr_El_Deen_Tobar_uP_bY_mUSLEm',
    'Nasr_Eldeen_Tobar',
    'sayed_naqshbandi',
    'Naqshbandi_Full',
    'Mohamed_Emran',
    'Ibtihalat_Mohamed_Omran'
  ];

  for (const it of items) {
    await queryArchive(it);
  }
})();
