const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const pages = ['qiblaPage', 'nawawiPage', 'quranStoriesPage', 'etiquettePage'];
pages.forEach(p => {
    console.log(p, 'sub-page:', html.includes(`id="${p}"`), 'sidebar:', html.includes(`navigate('${p}')`));
});
