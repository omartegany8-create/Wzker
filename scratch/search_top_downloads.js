const https = require('https');

function search(q) {
  return new Promise((resolve) => {
    https.get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title,downloads&sort[]=downloads+desc&rows=10&output=json`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          console.log(`\n=== Query: ${q} ===`);
          j.response.docs.forEach(doc => console.log(`  ID: ${doc.identifier} | Title: ${doc.title} | Downloads: ${doc.downloads}`));
          resolve(j.response.docs);
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  await search('title:(النقشبندي) AND mediatype:(audio)');
  await search('title:(محمد عمران) AND mediatype:(audio)');
  await search('title:(نصر الدين طوبار) AND mediatype:(audio)');
})();
