const fs = require('fs');

// We have minsh_test.mp3 (840,426 bytes, ~51.96 seconds)
// Let's inspect where the audio energy is!
const buf = fs.readFileSync('minsh_test.mp3');

// In an MP3 at 128kbps, 1 second = 16,000 bytes.
// Let's sample every second (16000 bytes) and compute byte variance/energy:
console.log('File size:', buf.length, 'Approx sec:', buf.length / 16000);

for (let s = 0; s < 15; s++) {
  const start = s * 16000;
  const chunk = buf.slice(start, start + 16000);
  let nonZero = 0;
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] !== 0) nonZero++;
    sum += chunk[i];
  }
  const avg = sum / chunk.length;
  console.log(`Sec ${s} to ${s+1}: avg_byte=${avg.toFixed(1)}, nonZero=${nonZero}`);
}
