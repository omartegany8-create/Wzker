const https = require('https');

https.get('https://www.mp3quran.net/api/v3/radios?language=ar', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      json.radios.forEach(r => {
        if (r.name.includes('طوبار') || r.name.includes('النقشبندي') || r.name.includes('عمران') || r.name.includes('ابتهال')) {
          console.log(`Radio: ${r.name} -> ${r.url}`);
        }
      });
    } catch(e) {}
  });
});

https.get('https://www.mp3quran.net/api/v3/specialrecitations?language=ar', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(d);
      console.log('Special recitations:', json);
    } catch(e) {}
  });
});
