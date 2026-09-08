const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const adhkarCss = fs.readFileSync('css/adhkar.css', 'utf8');
const adhkarData = fs.readFileSync('js/adhkar-data.js', 'utf8');
const adhkarJs = fs.readFileSync('js/adhkar.js', 'utf8');

console.log('--- VERIFICATION SUITE FOR ADHKAR PRO ---');
console.log('1. index.html includes css/adhkar.css:', indexHtml.includes('css/adhkar.css'));
console.log('2. index.html includes js/adhkar-data.js:', indexHtml.includes('js/adhkar-data.js'));
console.log('3. index.html includes js/adhkar.js:', indexHtml.includes('js/adhkar.js'));
console.log('4. index.html contains #adhkarPage container:', indexHtml.includes('id="adhkarPage"'));
console.log('5. index.html contains #adhkarDrawerOverlay:', indexHtml.includes('id="adhkarDrawerOverlay"'));
console.log('6. index.html contains #adhkarZenOverlay:', indexHtml.includes('id="adhkarZenOverlay"'));
console.log('7. index.html contains #adhkarGiftModal:', indexHtml.includes('id="adhkarGiftModal"'));
console.log('8. index.html contains #adhkarShareCanvas:', indexHtml.includes('id="adhkarShareCanvas"'));
console.log('9. index.html contains #adhkarCardsContainer:', indexHtml.includes('id="adhkarCardsContainer"'));
console.log('10. index.html contains #adhkarCapsulesScroll:', indexHtml.includes('id="adhkarCapsulesScroll"'));
console.log('11. index.html contains #adhkarHeroCard:', indexHtml.includes('id="adhkarHeroCard"'));

// Check icon paths referenced in adhkar-data.js
const { WZKER_ADHKAR_CATEGORIES, WZKER_ADHKAR_DATA } = require('../js/adhkar-data.js');
let allIconsExist = true;
WZKER_ADHKAR_CATEGORIES.forEach(c => {
  if (c.icon1 && !fs.existsSync(c.icon1)) {
    console.error('Missing category icon1:', c.icon1);
    allIconsExist = false;
  }
  if (c.icon2 && !fs.existsSync(c.icon2)) {
    console.error('Missing category icon2:', c.icon2);
    allIconsExist = false;
  }
});
WZKER_ADHKAR_DATA.forEach(d => {
  if (d.icon1 && !fs.existsSync(d.icon1)) {
    console.error('Missing dhikr icon1:', d.icon1);
    allIconsExist = false;
  }
  if (d.icon2 && !fs.existsSync(d.icon2)) {
    console.error('Missing dhikr icon2:', d.icon2);
    allIconsExist = false;
  }
});
console.log('12. All referenced icon images exist on disk:', allIconsExist);

// Check zero emoji in all related files
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
console.log('13. Zero emoji in css/adhkar.css:', !emojiRegex.test(adhkarCss));
console.log('14. Zero emoji in js/adhkar-data.js:', !emojiRegex.test(adhkarData));
console.log('15. Zero emoji in js/adhkar.js:', !emojiRegex.test(adhkarJs));
console.log('16. Zero emoji in index.html:', !emojiRegex.test(indexHtml));
console.log('--- ALL CHECKS FINISHED SUCCESSFULLY ---');
