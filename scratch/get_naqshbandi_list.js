const https = require('https');

https.get('https://archive.org/metadata/Naqshabandee', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(d);
      const server = j.server;
      const dir = j.dir;
      const mp3s = (j.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
      console.log(`=== Naqshabandee (Server: ${server}, Dir: ${dir}) ===`);
      mp3s.forEach(f => {
        const u = `https://${server}${dir}/${encodeURIComponent(f.name)}`;
        console.log(`{ name: "${f.name}", title: "${f.title || f.name}", url: "${u}" }`);
      });
    } catch(e) {
      console.error(e);
    }
  });
});
