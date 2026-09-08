const https = require('https');

async function search(q) {
  return new Promise((resolve) => {
    https.get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title&rows=5&output=json`, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          console.log(`Results for ${q}:`, json.response.docs);
          resolve(json.response.docs);
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

(async () => {
  await search('طوبار ابتهالات');
  await search('النقشبندي ابتهالات');
  await search('محمد عمران ابتهالات');
})();
