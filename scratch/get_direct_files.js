const https = require('https');

async function testItem(id) {
  return new Promise((resolve) => {
    https.get(`https://archive.org/metadata/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const server = j.server;
          const dir = j.dir;
          const mp3s = (j.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
          console.log(`\n=== ID: ${id} (Server: ${server}, Dir: ${dir}) | Count: ${mp3s.length} ===`);
          mp3s.slice(0, 10).forEach(f => {
            const directUrl = `https://${server}${dir}/${encodeURIComponent(f.name)}`;
            console.log(`  Name: ${f.name} -> Direct URL: ${directUrl} | Title: ${f.title || ''}`);
          });
          resolve({ id, server, dir, mp3s });
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  await testItem('Naqshabandee');
  await testItem('20230916_20230916_0318');
  await testItem('20230916_20230916_0316');
  await testItem('tubar');
})();
