const https = require('https');

async function testAudioStream(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-500' } }, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], length: res.headers['content-length'] });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

(async () => {
  const tobarFiles = [
    'https://ia600507.us.archive.org/33/items/20230916_20230916_0316/001%20%20%D8%A5%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%86%D8%A7%D8%AF%D8%B1-%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1-%20%D9%8A%D8%A7%D8%B1%D8%A8%20%D8%B9%D8%AF%D8%AA%20%D8%A5%D9%84%D9%89%20%D8%B1%D8%AD%D8%A7%D8%A8%D9%83-59%20%D8%AF%D9%82%D9%8A%D9%82%D8%A9.mp3',
    'https://ia600507.us.archive.org/33/items/20230916_20230916_0316/002%20%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%8A%D8%A7%20%D9%85%D9%86%20%D8%A2%D9%85%D9%86%D8%AA%20%D9%8A%D9%88%D9%86%D8%B3%20%D9%81%D9%89%20%D8%A8%D8%B7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%AA%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1.mp3',
    'https://ia600507.us.archive.org/33/items/20230916_20230916_0316/004%20%20%D8%AC%D9%84%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%AF%D9%8A%20%D9%8A%D9%86%D8%A7%D8%AF%D9%8A%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%D8%A7%D8%AA%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1.mp3',
    'https://ia600507.us.archive.org/33/items/20230916_20230916_0316/007%20%20%D9%8A%D8%A7%20%D8%A5%D9%84%D9%87%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D9%86%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%B5%D8%B1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B7%D9%88%D8%A8%D8%A7%D8%B1%20-%20%D8%AE%D8%B4%D9%88%D8%B9%20%D9%88%D8%A7%D8%AD%D8%B3%D8%A7%D8%B3%20%D9%84%D8%A7%D9%8A%D9%88%D8%B5%D9%81.mp3'
  ];

  const omranFiles = [
    'https://ia800506.us.archive.org/19/items/20230916_20230916_0318/006%20%20%D9%81%D9%83%D9%85%20%D9%84%D9%84%D9%87%20%D9%85%D9%86%20%D9%84%D8%B7%D9%81%20%D8%AE%D9%81%D9%8A%D9%91%D9%8D%20%D8%A5%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86.mp3',
    'https://ia800506.us.archive.org/19/items/20230916_20230916_0318/008%20%20%D9%8A%D8%A7%20%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%86%D9%88%D8%A7%D8%AF%D8%B1%20%20%D9%81%D9%8A%D8%AF%D9%8A%D9%88%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%B9%D9%85%D8%B1%D8%A7%D9%86%20%D8%A7%D8%A8%D8%AA%D9%87%D8%A7%D9%84%20%D9%86%D8%A7%D8%AF%D8%B1%20%D9%8A%D8%A7%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D9%83%D9%88%D9%86%D9%8A%D9%86%20%D8%B9%D8%A7%D9%85%201993%20%D8%B1%D9%88%D8%A7%D8%A6%D8%B9%20%D9%88%D9%86%D9%88%D8%A7%D8%AF%D8%B1.mp3'
  ];

  console.log('=== Tobar verification ===');
  for (const t of tobarFiles) {
    const r = await testAudioStream(t);
    console.log(JSON.stringify(r));
  }

  console.log('=== Omran verification ===');
  for (const o of omranFiles) {
    const r = await testAudioStream(o);
    console.log(JSON.stringify(r));
  }
})();
