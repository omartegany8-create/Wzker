const https = require('https');

https.get('https://mp3quran.net/api/v3/reciters?language=ar', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total reciters in API:', json.reciters.length);
      const targetNames = ['إسلام صبحي', 'بدر التركي', 'المنشاوي', 'عبدالباسط', 'العفاسي', 'ياسر الدوسري', 'ناصر القطامي', 'فارس عباد', 'ماهر المعيقلي', 'طوبار', 'النقشبندي', 'عمران'];
      
      json.reciters.forEach(r => {
        const match = targetNames.some(t => r.name.includes(t));
        if (match) {
          console.log(`\n=== MATCH: ${r.name} (id: ${r.id}) ===`);
          r.moshaf.forEach(m => {
            console.log(`  Moshaf: ${m.name} -> Server: ${m.server} (Surah total: ${m.surah_total}, list: ${m.surah_list})`);
          });
        }
      });
    } catch(e) {
      console.error('JSON parse error:', e.message);
    }
  });
}).on('error', err => console.error('API Error:', err.message));
