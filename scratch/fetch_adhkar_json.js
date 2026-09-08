const https = require('https');
const fs = require('fs');

const url = 'https://cdn.jsdelivr.net/gh/rn0x/Adhkar-json@main/adhkar.json';
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Successfully fetched adhkar.json. Total categories:', json.length);
      json.forEach((c, idx) => {
        console.log(`${idx + 1}. ${c.category} - count: ${c.array ? c.array.length : 0}`);
      });
      fs.writeFileSync('scratch/rn0x_adhkar.json', data, 'utf8');
      console.log('Saved to scratch/rn0x_adhkar.json');
    } catch(e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', err => {
  console.error('Fetch error:', err.message);
});
