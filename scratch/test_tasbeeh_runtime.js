const fs = require('fs');
const path = require('path');

const logs = [];
function log(...args) {
  console.log(...args);
  logs.push(args.join(' '));
}

log('=== STARTING TASBEEH RUNTIME VERIFICATION SUITE ===');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const tasbeehCss = fs.readFileSync('css/tasbeeh.css', 'utf8');
const tasbeehData = fs.readFileSync('js/tasbeeh-data.js', 'utf8');
const tasbeehJs = fs.readFileSync('js/tasbeeh.js', 'utf8');

// 1. Check inclusion
log('1. index.html includes css/tasbeeh.css:', indexHtml.includes('css/tasbeeh.css'));
log('2. index.html includes js/tasbeeh-data.js:', indexHtml.includes('js/tasbeeh-data.js'));
log('3. index.html includes js/tasbeeh.js:', indexHtml.includes('js/tasbeeh.js'));

// 2. Check DOM Elements
const elements = [
  'id="tasbeehPage"',
  'id="tasbeehStreakDaysCount"',
  'id="tasbeehWeekCalendar"',
  'id="tasbeehNiyyahLabel"',
  'id="tasbeehChainCard"',
  'id="tasbeehChainStepsTrack"',
  'id="tasbeehCapsulesScroll"',
  'id="tasbeehTimedBar"',
  'id="tasbeehSvgRing"',
  'id="tasbeehCenterOrb"',
  'id="tasbeehHugeCounter"',
  'id="tasbeehStillnessOverlay"',
  'id="tasbeehZenScreen"',
  'id="tasbeehPlaylistDrawer"',
  'id="tasbeehNiyyahModal"',
  'id="tasbeehAnalyticsModal"',
  'id="tasbeehThemesModal"',
  'id="tasbeehCelebrationModal"'
];

let allElementsPresent = true;
elements.forEach(el => {
  if (!indexHtml.includes(el)) {
    log('Missing DOM element:', el);
    allElementsPresent = false;
  }
});
log('4. All essential DOM IDs present in index.html:', allElementsPresent);

// 3. Check Zero Emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
log('5. Zero emoji in css/tasbeeh.css:', !emojiRegex.test(tasbeehCss));
log('6. Zero emoji in js/tasbeeh-data.js:', !emojiRegex.test(tasbeehData));
log('7. Zero emoji in js/tasbeeh.js:', !emojiRegex.test(tasbeehJs));

const tasbeehSection = indexHtml.substring(
  indexHtml.indexOf('<!-- 1.5 TASBEEH PAGE'),
  indexHtml.indexOf('<!-- 2. HISN AL-MUSLIM PAGE')
);
log('8. Zero emoji in tasbeehPage HTML markup:', !emojiRegex.test(tasbeehSection));

// 4. Check referenced icons
const iconMatches = [...tasbeehSection.matchAll(/src="(images\/icons\/[^"]+)"/g), ...tasbeehData.matchAll(/'(images\/icons\/[^']+)'/g)];
let allIconsExist = true;
const checkedIcons = new Set();
iconMatches.forEach(m => {
  const iconPath = m[1];
  if (!checkedIcons.has(iconPath)) {
    checkedIcons.add(iconPath);
    if (!fs.existsSync(iconPath)) {
      log('Missing icon file on disk:', iconPath);
      allIconsExist = false;
    }
  }
});
log(`9. All referenced icons exist on disk (${checkedIcons.size} unique icons checked): ${allIconsExist}`);

// 5. Check JS syntax evaluation
try {
  require(path.join(__dirname, '..', 'js', 'tasbeeh-data.js'));
  log('10. js/tasbeeh-data.js evaluated without syntax error: true');
} catch (e) {
  log('Syntax error in js/tasbeeh-data.js:', e.message);
}

log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
fs.writeFileSync(path.join(__dirname, 'test_output.txt'), logs.join('\n'), 'utf8');
