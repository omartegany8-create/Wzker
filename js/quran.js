/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER HOLY QURAN & ROYAL MUSHAF ENGINE (المصحف الشريف ونظام الختمة)
 * Complete 114 Surahs, 30 Ajzaa, Uthmani Text, Verse Search,
 * Real Mushaf Sheet with Page Flipping, Khatma Planner, & Story Cards.
 * ══════════════════════════════════════════════════════════════════
 */

// 1. ALL 114 SURAHS COMPREHENSIVE DATA
const QURAN_SURAHS = [
    { num: 1, name: "الفاتحة", type: "مكية", ayahs: 7, page: 1, juz: 1 },
    { num: 2, name: "البقرة", type: "مدنية", ayahs: 286, page: 2, juz: 1 },
    { num: 3, name: "آل عمران", type: "مدنية", ayahs: 200, page: 50, juz: 3 },
    { num: 4, name: "النساء", type: "مدنية", ayahs: 176, page: 77, juz: 4 },
    { num: 5, name: "المائدة", type: "مدنية", ayahs: 120, page: 106, juz: 6 },
    { num: 6, name: "الأنعام", type: "مكية", ayahs: 165, page: 128, juz: 7 },
    { num: 7, name: "الأعراف", type: "مكية", ayahs: 206, page: 151, juz: 8 },
    { num: 8, name: "الأنفال", type: "مدنية", ayahs: 75, page: 177, juz: 9 },
    { num: 9, name: "التوبة", type: "مدنية", ayahs: 129, page: 187, juz: 10 },
    { num: 10, name: "يونس", type: "مكية", ayahs: 109, page: 208, juz: 11 },
    { num: 11, name: "هود", type: "مكية", ayahs: 123, page: 221, juz: 11 },
    { num: 12, name: "يوسف", type: "مكية", ayahs: 111, page: 235, juz: 12 },
    { num: 13, name: "الرعد", type: "مدنية", ayahs: 43, page: 249, juz: 13 },
    { num: 14, name: "إبراهيم", type: "مكية", ayahs: 52, page: 255, juz: 13 },
    { num: 15, name: "الحجر", type: "مكية", ayahs: 99, page: 262, juz: 14 },
    { num: 16, name: "النحل", type: "مكية", ayahs: 128, page: 267, juz: 14 },
    { num: 17, name: "الإسراء", type: "مكية", ayahs: 111, page: 282, juz: 15 },
    { num: 18, name: "الكهف", type: "مكية", ayahs: 110, page: 293, juz: 15 },
    { num: 19, name: "مريم", type: "مكية", ayahs: 98, page: 305, juz: 16 },
    { num: 20, name: "طه", type: "مكية", ayahs: 135, page: 312, juz: 16 },
    { num: 21, name: "الأنبياء", type: "مكية", ayahs: 112, page: 322, juz: 17 },
    { num: 22, name: "الحج", type: "مدنية", ayahs: 78, page: 332, juz: 17 },
    { num: 23, name: "المؤمنون", type: "مكية", ayahs: 118, page: 342, juz: 18 },
    { num: 24, name: "النور", type: "مدنية", ayahs: 64, page: 350, juz: 18 },
    { num: 25, name: "الفرقان", type: "مكية", ayahs: 77, page: 359, juz: 18 },
    { num: 26, name: "الشعراء", type: "مكية", ayahs: 227, page: 367, juz: 19 },
    { num: 27, name: "النمل", type: "مكية", ayahs: 93, page: 377, juz: 19 },
    { num: 28, name: "القصص", type: "مكية", ayahs: 88, page: 385, juz: 20 },
    { num: 29, name: "العنكبوت", type: "مكية", ayahs: 69, page: 396, juz: 20 },
    { num: 30, name: "الروم", type: "مكية", ayahs: 60, page: 404, juz: 21 },
    { num: 31, name: "لقمان", type: "مكية", ayahs: 34, page: 411, juz: 21 },
    { num: 32, name: "السجدة", type: "مكية", ayahs: 30, page: 415, juz: 21 },
    { num: 33, name: "الأحزاب", type: "مدنية", ayahs: 73, page: 418, juz: 21 },
    { num: 34, name: "سبأ", type: "مكية", ayahs: 54, page: 428, juz: 22 },
    { num: 35, name: "فاطر", type: "مكية", ayahs: 45, page: 434, juz: 22 },
    { num: 36, name: "يس", type: "مكية", ayahs: 83, page: 440, juz: 22 },
    { num: 37, name: "الصافات", type: "مكية", ayahs: 182, page: 446, juz: 23 },
    { num: 38, name: "ص", type: "مكية", ayahs: 88, page: 453, juz: 23 },
    { num: 39, name: "الزمر", type: "مكية", ayahs: 75, page: 458, juz: 23 },
    { num: 40, name: "غافر", type: "مكية", ayahs: 85, page: 467, juz: 24 },
    { num: 41, name: "فصلت", type: "مكية", ayahs: 54, page: 477, juz: 24 },
    { num: 42, name: "الشورى", type: "مكية", ayahs: 53, page: 483, juz: 25 },
    { num: 43, name: "الزخرف", type: "مكية", ayahs: 89, page: 489, juz: 25 },
    { num: 44, name: "الدخان", type: "مكية", ayahs: 59, page: 496, juz: 25 },
    { num: 45, name: "الجاثية", type: "مكية", ayahs: 37, page: 499, juz: 25 },
    { num: 46, name: "الأحقاف", type: "مكية", ayahs: 35, page: 502, juz: 26 },
    { num: 47, name: "محمد", type: "مدنية", ayahs: 38, page: 507, juz: 26 },
    { num: 48, name: "الفتح", type: "مدنية", ayahs: 29, page: 511, juz: 26 },
    { num: 49, name: "الحجرات", type: "مدنية", ayahs: 18, page: 515, juz: 26 },
    { num: 50, name: "ق", type: "مكية", ayahs: 45, page: 518, juz: 26 },
    { num: 51, name: "الذاريات", type: "مكية", ayahs: 60, page: 520, juz: 26 },
    { num: 52, name: "الطور", type: "مكية", ayahs: 49, page: 523, juz: 27 },
    { num: 53, name: "النجم", type: "مكية", ayahs: 62, page: 526, juz: 27 },
    { num: 54, name: "القمر", type: "مكية", ayahs: 55, page: 528, juz: 27 },
    { num: 55, name: "الرحمن", type: "مدنية", ayahs: 78, page: 531, juz: 27 },
    { num: 56, name: "الواقعة", type: "مكية", ayahs: 96, page: 534, juz: 27 },
    { num: 57, name: "الحديد", type: "مدنية", ayahs: 29, page: 537, juz: 27 },
    { num: 58, name: "المجادلة", type: "مدنية", ayahs: 22, page: 542, juz: 28 },
    { num: 59, name: "الحشر", type: "مدنية", ayahs: 24, page: 545, juz: 28 },
    { num: 60, name: "الممتحنة", type: "مدنية", ayahs: 13, page: 549, juz: 28 },
    { num: 61, name: "الصف", type: "مدنية", ayahs: 14, page: 551, juz: 28 },
    { num: 62, name: "الجمعة", type: "مدنية", ayahs: 11, page: 553, juz: 28 },
    { num: 63, name: "المنافقون", type: "مدنية", ayahs: 11, page: 554, juz: 28 },
    { num: 64, name: "التغابن", type: "مدنية", ayahs: 18, page: 556, juz: 28 },
    { num: 65, name: "الطلاق", type: "مدنية", ayahs: 12, page: 558, juz: 28 },
    { num: 66, name: "التحريم", type: "مدنية", ayahs: 12, page: 560, juz: 28 },
    { num: 67, name: "الملك", type: "مكية", ayahs: 30, page: 562, juz: 29 },
    { num: 68, name: "القلم", type: "مكية", ayahs: 52, page: 564, juz: 29 },
    { num: 69, name: "الحاقة", type: "مكية", ayahs: 52, page: 566, juz: 29 },
    { num: 70, name: "المعارج", type: "مكية", ayahs: 44, page: 568, juz: 29 },
    { num: 71, name: "نوح", type: "مكية", ayahs: 28, page: 570, juz: 29 },
    { num: 72, name: "الجن", type: "مكية", ayahs: 28, page: 572, juz: 29 },
    { num: 73, name: "المزمل", type: "مكية", ayahs: 20, page: 574, juz: 29 },
    { num: 74, name: "المدثر", type: "مكية", ayahs: 56, page: 575, juz: 29 },
    { num: 75, name: "القيامة", type: "مكية", ayahs: 40, page: 577, juz: 29 },
    { num: 76, name: "الإنسان", type: "مدنية", ayahs: 31, page: 578, juz: 29 },
    { num: 77, name: "المرسلات", type: "مكية", ayahs: 50, page: 580, juz: 29 },
    { num: 78, name: "النبأ", type: "مكية", ayahs: 40, page: 582, juz: 30 },
    { num: 79, name: "النازعات", type: "مكية", ayahs: 46, page: 583, juz: 30 },
    { num: 80, name: "عبس", type: "مكية", ayahs: 42, page: 585, juz: 30 },
    { num: 81, name: "التكوير", type: "مكية", ayahs: 29, page: 586, juz: 30 },
    { num: 82, name: "الانفطار", type: "مكية", ayahs: 19, page: 587, juz: 30 },
    { num: 83, name: "المطففين", type: "مكية", ayahs: 36, page: 587, juz: 30 },
    { num: 84, name: "الانشقاق", type: "مكية", ayahs: 25, page: 589, juz: 30 },
    { num: 85, name: "البروج", type: "مكية", ayahs: 22, page: 590, juz: 30 },
    { num: 86, name: "الطارق", type: "مكية", ayahs: 17, page: 591, juz: 30 },
    { num: 87, name: "الأعلى", type: "مكية", ayahs: 19, page: 591, juz: 30 },
    { num: 88, name: "الغاشية", type: "مكية", ayahs: 26, page: 592, juz: 30 },
    { num: 89, name: "الفجر", type: "مكية", ayahs: 30, page: 593, juz: 30 },
    { num: 90, name: "البلد", type: "مكية", ayahs: 20, page: 594, juz: 30 },
    { num: 91, name: "الشمس", type: "مكية", ayahs: 15, page: 595, juz: 30 },
    { num: 92, name: "الليل", type: "مكية", ayahs: 21, page: 595, juz: 30 },
    { num: 93, name: "الضحى", type: "مكية", ayahs: 11, page: 596, juz: 30 },
    { num: 94, name: "الشرح", type: "مكية", ayahs: 8, page: 596, juz: 30 },
    { num: 95, name: "التين", type: "مكية", ayahs: 8, page: 597, juz: 30 },
    { num: 96, name: "العلق", type: "مكية", ayahs: 19, page: 597, juz: 30 },
    { num: 97, name: "القدر", type: "مكية", ayahs: 5, page: 598, juz: 30 },
    { num: 98, name: "البينة", type: "مدنية", ayahs: 8, page: 598, juz: 30 },
    { num: 99, name: "الزلزلة", type: "مدنية", ayahs: 8, page: 599, juz: 30 },
    { num: 100, name: "العاديات", type: "مكية", ayahs: 11, page: 599, juz: 30 },
    { num: 101, name: "القارعة", type: "مكية", ayahs: 11, page: 600, juz: 30 },
    { num: 102, name: "التكاثر", type: "مكية", ayahs: 8, page: 600, juz: 30 },
    { num: 103, name: "العصر", type: "مكية", ayahs: 3, page: 601, juz: 30 },
    { num: 104, name: "الهمزة", type: "مكية", ayahs: 9, page: 601, juz: 30 },
    { num: 105, name: "الفيل", type: "مكية", ayahs: 5, page: 601, juz: 30 },
    { num: 106, name: "قريش", type: "مكية", ayahs: 4, page: 602, juz: 30 },
    { num: 107, name: "الماعون", type: "مكية", ayahs: 7, page: 602, juz: 30 },
    { num: 108, name: "الكوثر", type: "مكية", ayahs: 3, page: 602, juz: 30 },
    { num: 109, name: "الكافرون", type: "مكية", ayahs: 6, page: 603, juz: 30 },
    { num: 110, name: "النصر", type: "مدنية", ayahs: 3, page: 603, juz: 30 },
    { num: 111, name: "المسد", type: "مكية", ayahs: 5, page: 603, juz: 30 },
    { num: 112, name: "الإخلاص", type: "مكية", ayahs: 4, page: 604, juz: 30 },
    { num: 113, name: "الفلق", type: "مكية", ayahs: 5, page: 604, juz: 30 },
    { num: 114, name: "الناس", type: "مكية", ayahs: 6, page: 604, juz: 30 }
];

// 2. ALL 30 AJZAA DATA (Start Surah, Ayah, Page, and End Range)
const QURAN_JUZ = [
    { num: 1, name: "الجزء الأول", startSurah: "الفاتحة", startAyah: 1, endSurah: "البقرة", endAyah: 141, page: 1 },
    { num: 2, name: "الجزء الثاني", startSurah: "البقرة", startAyah: 142, endSurah: "البقرة", endAyah: 252, page: 22 },
    { num: 3, name: "الجزء الثالث", startSurah: "البقرة", startAyah: 253, endSurah: "آل عمران", endAyah: 92, page: 42 },
    { num: 4, name: "الجزء الرابع", startSurah: "آل عمران", startAyah: 93, endSurah: "النساء", endAyah: 23, page: 62 },
    { num: 5, name: "الجزء الخامس", startSurah: "النساء", startAyah: 24, endSurah: "النساء", endAyah: 147, page: 82 },
    { num: 6, name: "الجزء السادس", startSurah: "النساء", startAyah: 148, endSurah: "المائدة", endAyah: 81, page: 102 },
    { num: 7, name: "الجزء السابع", startSurah: "المائدة", startAyah: 82, endSurah: "الأنعام", endAyah: 110, page: 121 },
    { num: 8, name: "الجزء الثامن", startSurah: "الأنعام", startAyah: 111, endSurah: "الأعراف", endAyah: 87, page: 142 },
    { num: 9, name: "الجزء التاسع", startSurah: "الأعراف", startAyah: 88, endSurah: "الأنفال", endAyah: 40, page: 162 },
    { num: 10, name: "الجزء العاشر", startSurah: "الأنفال", startAyah: 41, endSurah: "التوبة", endAyah: 92, page: 182 },
    { num: 11, name: "الجزء الحادي عشر", startSurah: "التوبة", startAyah: 93, endSurah: "هود", endAyah: 5, page: 201 },
    { num: 12, name: "الجزء الثاني عشر", startSurah: "هود", startAyah: 6, endSurah: "يوسف", endAyah: 52, page: 222 },
    { num: 13, name: "الجزء الثالث عشر", startSurah: "يوسف", startAyah: 53, endSurah: "إبراهيم", endAyah: 52, page: 242 },
    { num: 14, name: "الجزء الرابع عشر", startSurah: "الحجر", startAyah: 1, endSurah: "النحل", endAyah: 128, page: 262 },
    { num: 15, name: "الجزء الخامس عشر", startSurah: "الإسراء", startAyah: 1, endSurah: "الكهف", endAyah: 74, page: 282 },
    { num: 16, name: "الجزء السادس عشر", startSurah: "الكهف", startAyah: 75, endSurah: "طه", endAyah: 135, page: 302 },
    { num: 17, name: "الجزء السابع عشر", startSurah: "الأنبياء", startAyah: 1, endSurah: "الحج", endAyah: 78, page: 322 },
    { num: 18, name: "الجزء الثامن عشر", startSurah: "المؤمنون", startAyah: 1, endSurah: "الفرقان", endAyah: 20, page: 342 },
    { num: 19, name: "الجزء التاسع عشر", startSurah: "الفرقان", startAyah: 21, endSurah: "النمل", endAyah: 55, page: 362 },
    { num: 20, name: "الجزء العشرون", startSurah: "النمل", startAyah: 56, endSurah: "العنكبوت", endAyah: 45, page: 382 },
    { num: 21, name: "الجزء الحادي والعشرون", startSurah: "العنكبوت", startAyah: 46, endSurah: "الأحزاب", endAyah: 30, page: 402 },
    { num: 22, name: "الجزء الثاني والعشرون", startSurah: "الأحزاب", startAyah: 31, endSurah: "يس", endAyah: 27, page: 422 },
    { num: 23, name: "الجزء الثالث والعشرون", startSurah: "يس", startAyah: 28, endSurah: "الزمر", endAyah: 31, page: 442 },
    { num: 24, name: "الجزء الرابع والعشرون", startSurah: "الزمر", startAyah: 32, endSurah: "فصلت", endAyah: 46, page: 462 },
    { num: 25, name: "الجزء الخامس والعشرون", startSurah: "فصلت", startAyah: 47, endSurah: "الجاثية", endAyah: 37, page: 482 },
    { num: 26, name: "الجزء السادس والعشرون", startSurah: "الأحقاف", startAyah: 1, endSurah: "الذاريات", endAyah: 30, page: 502 },
    { num: 27, name: "الجزء السابع والعشرون", startSurah: "الذاريات", startAyah: 31, endSurah: "الحديد", endAyah: 29, page: 522 },
    { num: 28, name: "الجزء الثامن والعشرون", startSurah: "المجادلة", startAyah: 1, endSurah: "التحريم", endAyah: 12, page: 542 },
    { num: 29, name: "الجزء التاسع والعشرون", startSurah: "الملك", startAyah: 1, endSurah: "المرسلات", endAyah: 50, page: 562 },
    { num: 30, name: "الجزء الثلاثون", startSurah: "النبأ", startAyah: 1, endSurah: "الناس", endAyah: 6, page: 582 }
];

/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER QURAN & ROYAL MUSHAF MANAGER
 * ══════════════════════════════════════════════════════════════════
 */
// 3. EXACT 604 MUSHAF PAGE BOUNDARIES [surahNum, ayahNum]
const QURAN_PAGE_BOUNDS = [[1,1],[2,1],[2,6],[2,17],[2,25],[2,30],[2,38],[2,49],[2,58],[2,62],[2,70],[2,77],[2,84],[2,89],[2,94],[2,102],[2,106],[2,113],[2,120],[2,127],[2,135],[2,142],[2,146],[2,154],[2,164],[2,170],[2,177],[2,182],[2,187],[2,191],[2,197],[2,203],[2,211],[2,216],[2,220],[2,225],[2,231],[2,234],[2,238],[2,246],[2,249],[2,253],[2,257],[2,260],[2,265],[2,270],[2,275],[2,282],[2,283],[3,1],[3,10],[3,16],[3,23],[3,30],[3,38],[3,46],[3,53],[3,62],[3,71],[3,78],[3,84],[3,92],[3,101],[3,109],[3,116],[3,122],[3,133],[3,141],[3,149],[3,154],[3,158],[3,166],[3,174],[3,181],[3,187],[3,195],[4,1],[4,7],[4,12],[4,15],[4,20],[4,24],[4,27],[4,34],[4,38],[4,45],[4,52],[4,60],[4,66],[4,75],[4,80],[4,87],[4,92],[4,95],[4,102],[4,106],[4,114],[4,122],[4,128],[4,135],[4,141],[4,148],[4,155],[4,163],[4,171],[4,176],[5,3],[5,6],[5,10],[5,14],[5,18],[5,24],[5,32],[5,37],[5,42],[5,46],[5,51],[5,58],[5,65],[5,71],[5,77],[5,83],[5,90],[5,96],[5,104],[5,109],[5,114],[6,1],[6,9],[6,19],[6,28],[6,36],[6,45],[6,53],[6,60],[6,69],[6,74],[6,82],[6,91],[6,95],[6,102],[6,111],[6,119],[6,125],[6,132],[6,138],[6,143],[6,147],[6,152],[6,158],[7,1],[7,12],[7,23],[7,31],[7,38],[7,44],[7,52],[7,58],[7,68],[7,74],[7,82],[7,88],[7,96],[7,105],[7,121],[7,131],[7,138],[7,144],[7,150],[7,156],[7,160],[7,164],[7,171],[7,179],[7,188],[7,196],[8,1],[8,9],[8,17],[8,26],[8,34],[8,41],[8,46],[8,53],[8,62],[8,70],[9,1],[9,7],[9,14],[9,21],[9,27],[9,32],[9,37],[9,41],[9,48],[9,55],[9,62],[9,69],[9,73],[9,80],[9,87],[9,94],[9,100],[9,107],[9,112],[9,118],[9,123],[10,1],[10,7],[10,15],[10,21],[10,26],[10,34],[10,43],[10,54],[10,62],[10,71],[10,79],[10,89],[10,98],[10,107],[11,6],[11,13],[11,20],[11,29],[11,38],[11,46],[11,54],[11,63],[11,72],[11,82],[11,89],[11,98],[11,109],[11,118],[12,5],[12,15],[12,23],[12,31],[12,38],[12,44],[12,53],[12,64],[12,70],[12,79],[12,87],[12,96],[12,104],[13,1],[13,6],[13,14],[13,19],[13,29],[13,35],[13,43],[14,6],[14,11],[14,19],[14,25],[14,34],[14,43],[15,1],[15,16],[15,32],[15,52],[15,71],[15,91],[16,7],[16,15],[16,27],[16,35],[16,43],[16,55],[16,65],[16,73],[16,80],[16,88],[16,94],[16,103],[16,111],[16,119],[17,1],[17,8],[17,18],[17,28],[17,39],[17,50],[17,59],[17,67],[17,76],[17,87],[17,97],[17,105],[18,5],[18,16],[18,21],[18,28],[18,35],[18,46],[18,54],[18,62],[18,75],[18,84],[18,98],[19,1],[19,12],[19,26],[19,39],[19,52],[19,65],[19,77],[19,96],[20,13],[20,38],[20,52],[20,65],[20,77],[20,88],[20,99],[20,114],[20,126],[21,1],[21,11],[21,25],[21,36],[21,45],[21,58],[21,73],[21,82],[21,91],[21,102],[22,1],[22,6],[22,16],[22,24],[22,31],[22,39],[22,47],[22,56],[22,65],[22,73],[23,1],[23,18],[23,28],[23,43],[23,60],[23,75],[23,90],[23,105],[24,1],[24,11],[24,21],[24,28],[24,32],[24,37],[24,44],[24,54],[24,59],[24,62],[25,3],[25,12],[25,21],[25,33],[25,44],[25,56],[25,68],[26,1],[26,20],[26,40],[26,61],[26,84],[26,112],[26,137],[26,160],[26,184],[26,207],[27,1],[27,14],[27,23],[27,36],[27,45],[27,56],[27,64],[27,77],[27,89],[28,6],[28,14],[28,22],[28,29],[28,36],[28,44],[28,51],[28,60],[28,71],[28,78],[28,85],[29,7],[29,15],[29,24],[29,31],[29,39],[29,46],[29,53],[29,64],[30,6],[30,16],[30,25],[30,33],[30,42],[30,51],[31,1],[31,12],[31,20],[31,29],[32,1],[32,12],[32,21],[33,1],[33,7],[33,16],[33,23],[33,31],[33,36],[33,44],[33,51],[33,55],[33,63],[34,1],[34,8],[34,15],[34,23],[34,32],[34,40],[34,49],[35,4],[35,12],[35,19],[35,31],[35,39],[35,45],[36,13],[36,28],[36,41],[36,55],[36,71],[37,1],[37,25],[37,52],[37,77],[37,103],[37,127],[37,154],[38,1],[38,17],[38,27],[38,43],[38,62],[38,84],[39,6],[39,11],[39,22],[39,32],[39,41],[39,48],[39,57],[39,68],[39,75],[40,8],[40,17],[40,26],[40,34],[40,41],[40,50],[40,59],[40,67],[40,78],[41,1],[41,12],[41,21],[41,30],[41,39],[41,47],[42,1],[42,11],[42,16],[42,23],[42,32],[42,45],[42,52],[43,11],[43,23],[43,34],[43,48],[43,61],[43,74],[44,1],[44,19],[44,40],[45,1],[45,14],[45,23],[45,33],[46,6],[46,15],[46,21],[46,29],[47,1],[47,12],[47,20],[47,30],[48,1],[48,10],[48,16],[48,24],[48,29],[49,5],[49,12],[50,1],[50,16],[50,36],[51,7],[51,31],[51,52],[52,15],[52,32],[53,1],[53,27],[53,45],[54,7],[54,28],[54,50],[55,17],[55,41],[55,68],[56,17],[56,51],[56,77],[57,4],[57,12],[57,19],[57,25],[58,1],[58,7],[58,12],[58,22],[59,4],[59,10],[59,17],[60,1],[60,6],[60,12],[61,6],[62,1],[62,9],[63,5],[64,1],[64,10],[65,1],[65,6],[66,1],[66,8],[67,1],[67,13],[67,27],[68,16],[68,43],[69,9],[69,35],[70,11],[70,40],[71,11],[72,1],[72,14],[73,1],[73,20],[74,18],[74,48],[75,20],[76,6],[76,26],[77,20],[78,1],[78,31],[79,16],[80,1],[81,1],[82,1],[83,7],[83,35],[85,1],[86,1],[87,16],[89,1],[89,24],[91,1],[92,15],[95,1],[97,1],[98,8],[100,10],[103,1],[106,1],[109,1],[112,1]];

class WzkerQuranManager {
    constructor() {
        this.activeTab = 'surahs';
        this.revelationFilter = 'all';
        this.searchQuery = '';
        this.currentSurahNum = 1;
        this.currentAyahNum = 1;
        this.currentPage = 1;
        this.readerTheme = localStorage.getItem('wzker_quran_theme') || 'sepia';
        if (this.readerTheme !== 'dark' && this.readerTheme !== 'sepia') this.readerTheme = 'sepia';
        this.fontSize = parseInt(localStorage.getItem('wzker_quran_font_size') || '24', 10);
        this.verses = [];
        this.selectedAyah = null;

        // Khatma Plan State
        this.planDuration = parseInt(localStorage.getItem('wzker_khatma_plan_days') || '30', 10);
        this.todayPages = parseInt(localStorage.getItem('wzker_khatma_today_pages') || '0', 10);
        this.yesterdayPages = parseInt(localStorage.getItem('wzker_khatma_yesterday_pages') || '20', 10);

        this.lastRead = this.loadLastRead();
        this.bookmark = this.loadSingleBookmark();
        this.pendingBookmark = null;
        this.searchCache = new Map();
        this.searchAbortController = null;

        this.init();
    }

    init() {
        this.renderHeroCard();
        this.renderSurahsList();
        this.renderJuzList();
        this.renderBookmarksList();
        this.applyReaderSettings();
        this.updateNavBookmarkIndicator();
        this.calculateKhatmaPlan();
    }

    // ── Arabic Text Normalization (تجريد وتوحيد الحروف للبحث الذكي) ──
    normalizeArabic(str) {
        if (!str) return '';
        return str
            // Convert dagger alif (khanjariya) to standard alif so modern keyboard typing matches Uthmani script!
            .replace(/\u0670/g, 'ا')
            // Remove all harakat, tashkeel, and Quranic waqf marks
            .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
            // Normalize all forms of Alif
            .replace(/[أإآٱ]/g, 'ا')
            // Normalize standalone hamza before alif (ءادم -> ادم)
            .replace(/ء(?=ا)/g, '')
            // Normalize Yaa & Alif Maqsura
            .replace(/[ىي]/g, 'ي')
            // Normalize Taa Marbuta
            .replace(/ة/g, 'ه')
            // Remove tatweel
            .replace(/ـ/g, '')
            .trim()
            .toLowerCase();
    }

    toArabicDigits(num) {
        const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        return String(num).replace(/[0-9]/g, d => ar[+d]);
    }

    getPageByAyah(surahNum, ayahNum) {
        const s = parseInt(surahNum, 10);
        const a = parseInt(ayahNum, 10);
        for (let p = QURAN_PAGE_BOUNDS.length; p >= 1; p--) {
            const [refS, refA] = QURAN_PAGE_BOUNDS[p - 1];
            if (refS < s || (refS === s && refA <= a)) {
                return p;
            }
        }
        return 1;
    }


    // ── State Persistence (Last Read & Bookmarks) ──
    loadLastRead() {
        try {
            const saved = localStorage.getItem('wzker_quran_last_read');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return { surahNum: 1, surahName: "الفاتحة", ayahNum: 1, page: 1, juz: 1 };
    }

    saveLastRead(surahNum, ayahNum = 1, pageNum = null) {
        const surah = QURAN_SURAHS.find(s => s.num === surahNum);
        if (!surah) return;
        const p = pageNum || surah.page;
        this.lastRead = {
            surahNum: surah.num,
            surahName: surah.name,
            ayahNum: ayahNum,
            page: p,
            juz: surah.juz,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem('wzker_quran_last_read', JSON.stringify(this.lastRead));
        } catch (e) {}
        this.renderHeroCard();
        this.renderSurahsList();
    }

    loadSingleBookmark() {
        try {
            const saved = localStorage.getItem('wzker_quran_single_bookmark');
            if (saved) return JSON.parse(saved);
            const oldList = localStorage.getItem('wzker_quran_bookmarks');
            if (oldList) {
                const parsed = JSON.parse(oldList);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const first = parsed[parsed.length - 1];
                    this.saveSingleBookmark(first);
                    return first;
                }
            }
        } catch (e) {}
        return null;
    }

    saveSingleBookmark(bm = null) {
        if (bm !== undefined) this.bookmark = bm;
        try {
            if (this.bookmark) {
                localStorage.setItem('wzker_quran_single_bookmark', JSON.stringify(this.bookmark));
            } else {
                localStorage.removeItem('wzker_quran_single_bookmark');
            }
        } catch (e) {}
        this.renderBookmarksList();
        this.updateNavBookmarkIndicator();
        this.updateRibbonBookmarkUI();
    }

    updateNavBookmarkIndicator() {
        const btn = document.getElementById('quranNavBookmarkBtn');
        if (btn) {
            btn.style.display = this.bookmark ? 'inline-flex' : 'none';
        }
    }

    updateRibbonBookmarkUI() {
        const ribbon = document.getElementById('readerRibbonBookmark');
        const goBtn = document.getElementById('readerGoBookmarkBtn');
        const setBtn = document.getElementById('readerSetBookmarkBtn');
        const isMarked = this.bookmark && this.bookmark.page === this.currentPage;

        if (ribbon) {
            ribbon.classList.toggle('active', !!isMarked);
        }

        if (setBtn) {
            const span = setBtn.querySelector('span');
            if (span) {
                span.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ علامة';
            }
            if (isMarked) {
                setBtn.style.background = 'rgba(217, 119, 6, 0.2)';
                setBtn.style.color = '#d97706';
            } else {
                setBtn.style.background = '';
                setBtn.style.color = '';
            }
        }

        if (goBtn) {
            goBtn.style.display = this.bookmark ? 'inline-flex' : 'none';
        }
    }

    goToLastBookmark() {
        if (!this.bookmark) {
            if (window.showToast) window.showToast('لا توجد علامة مرجعية محفوظة بعد');
            return;
        }
        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) overlay.classList.add('active');

        const page = this.bookmark.page || this.getPageByAyah(this.bookmark.surahNum, this.bookmark.ayahNum || 1);
        this.renderPage(page, this.bookmark.ayahNum || 1, this.bookmark.surahNum);
        if (window.showToast) window.showToast(`الانتقال إلى الفاصلة: سورة ${this.bookmark.surahName} - صفحة ${this.toArabicDigits(page)}`);
    }

    confirmBookmarkMove() {
        const modal = document.getElementById('bookmarkConfirmModal');
        if (modal) modal.classList.remove('active');

        if (this.pendingBookmark) {
            this.bookmark = this.pendingBookmark;
            this.pendingBookmark = null;
            this.saveSingleBookmark(this.bookmark);
            if (window.showToast) window.showToast(`تم نقل فاصلة المصحف إلى صفحة ${this.toArabicDigits(this.bookmark.page)}`);
        }
    }

    cancelBookmarkMove() {
        const modal = document.getElementById('bookmarkConfirmModal');
        if (modal) modal.classList.remove('active');
        this.pendingBookmark = null;
    }

    removeSingleBookmark() {
        this.bookmark = null;
        this.saveSingleBookmark(null);
        if (window.showToast) window.showToast('تمت إزالة فاصلة المصحف');
    }

    // ── Hero Card Rendering ──
    renderHeroCard() {
        const titleEl = document.getElementById('khatmaCurrentSurahTitle');
        const posEl = document.getElementById('khatmaCurrentPosText');
        const pctEl = document.getElementById('khatmaPctVal');
        const fillEl = document.getElementById('khatmaProgressFill');

        if (!titleEl) return;

        const surah = this.lastRead;
        titleEl.textContent = `سورة ${surah.surahName}`;
        posEl.textContent = `الآية ${this.toArabicDigits(surah.ayahNum)} • صفحة ${this.toArabicDigits(surah.page)} • الجزء ${this.toArabicDigits(surah.juz)}`;

        // Total mushaf pages = 604
        const pct = Math.min(100, Math.max(0.2, ((surah.page / 604) * 100))).toFixed(1);
        pctEl.textContent = `${pct}%`;
        fillEl.style.width = `${pct}%`;
    }

    resumeReading() {
        this.openSurah(this.lastRead.surahNum, this.lastRead.ayahNum);
    }

    // ── Tabs & Filter Chips ──
    switchTab(tabKey) {
        this.activeTab = tabKey;
        const tabs = document.querySelectorAll('.quran-tab-btn');
        tabs.forEach(t => {
            if (t.dataset.tab === tabKey) t.classList.add('active');
            else t.classList.remove('active');
        });

        const surahsView = document.getElementById('quranSurahsView');
        const juzView = document.getElementById('quranJuzView');
        const bookmarksView = document.getElementById('quranBookmarksView');
        const filterChips = document.getElementById('quranFilterChips');

        if (surahsView) surahsView.style.display = tabKey === 'surahs' ? 'block' : 'none';
        if (juzView) juzView.style.display = tabKey === 'juz' ? 'block' : 'none';
        if (bookmarksView) bookmarksView.style.display = tabKey === 'bookmarks' ? 'block' : 'none';
        if (filterChips) filterChips.style.display = tabKey === 'surahs' ? 'flex' : 'none';
    }

    setFilter(type, chipEl) {
        this.revelationFilter = type;
        const chips = document.querySelectorAll('.quran-filter-chip');
        chips.forEach(c => c.classList.remove('active'));
        if (chipEl) chipEl.classList.add('active');
        this.renderSurahsList();
    }

    // ── Smart Search (Surahs + Verses with Un-tashkeel Arabic Matching) ──
    handleSearch(rawQuery) {
        this.searchQuery = (rawQuery || '').trim();
        const clearBtn = document.getElementById('quranSearchClearBtn');
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'flex' : 'none';

        this.renderSurahsList();

        const verseResultsBox = document.getElementById('quranVerseSearchResults');
        if (!verseResultsBox) return;

        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }

        const normQ = this.normalizeArabic(this.searchQuery);
        if (normQ.length >= 2) {
            verseResultsBox.style.display = 'block';
            verseResultsBox.innerHTML = `
                <div class="verse-search-header">
                    <span>نتائج البحث في الآيات</span>
                    <span><i class="fa-solid fa-spinner fa-spin" style="color: #d97706;"></i> جاري البحث...</span>
                </div>
            `;
            this.searchTimer = setTimeout(() => {
                this.executeVerseSearch(normQ, this.searchQuery);
            }, 120);
        } else {
            verseResultsBox.style.display = 'none';
            verseResultsBox.innerHTML = '';
        }
    }

    clearSearch() {
        const input = document.getElementById('quranSearchInput');
        if (input) input.value = '';
        this.handleSearch('');
    }

    async executeVerseSearch(normQ, rawQ) {
        const resultsBox = document.getElementById('quranVerseSearchResults');
        if (!resultsBox || this.searchQuery !== rawQ) return;

        // Check memory cache first (instant response)
        if (this.searchCache.has(normQ)) {
            this.renderSearchResults(this.searchCache.get(normQ), rawQ, false);
            return;
        }

        let matches = [];
        const seenAyahIds = new Set();

        // 1. Search locally in cached pages in localStorage (Instant 0ms)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            try {
                if (key.startsWith('wzker_mushaf_page_') || key.startsWith('wzker_quran_surah_')) {
                    const list = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(list)) {
                        for (const a of list) {
                            const sNum = a.surahNum || (a.surah && a.surah.number);
                            const aNum = a.numberInSurah;
                            const uniqueId = `${sNum}_${aNum}`;
                            if (seenAyahIds.has(uniqueId)) continue;
                            const normText = this.normalizeArabic(a.text);
                            if (normText.includes(normQ)) {
                                seenAyahIds.add(uniqueId);
                                const surahObj = QURAN_SURAHS.find(s => s.num === sNum);
                                const p = a.page || this.getPageByAyah(sNum, aNum);
                                matches.push({
                                    surahNum: sNum,
                                    surahName: surahObj ? surahObj.name : (a.surahName || ''),
                                    ayahNum: aNum,
                                    page: p,
                                    text: a.text
                                });
                                if (matches.length >= 30) break;
                            }
                        }
                    }
                }
            } catch (e) {}
            if (matches.length >= 30) break;
        }

        // If local matches exist, show them instantly without waiting
        if (matches.length > 0) {
            this.renderSearchResults(matches, rawQ, true);
        }

        // 2. Fetch from AlQuran Cloud global Quran search API with AbortController
        try {
            if (this.searchAbortController) {
                this.searchAbortController.abort();
            }
            this.searchAbortController = new AbortController();

            const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(normQ)}/all/quran-uthmani`, {
                signal: this.searchAbortController.signal
            });
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data.matches)) {
                for (const m of json.data.matches) {
                    const sNum = m.surah.number;
                    const aNum = m.numberInSurah;
                    const uniqueId = `${sNum}_${aNum}`;
                    if (seenAyahIds.has(uniqueId)) continue;
                    seenAyahIds.add(uniqueId);

                    const surahObj = QURAN_SURAHS.find(s => s.num === sNum);
                    let cleanText = m.text;
                    if (sNum !== 1 && aNum === 1) {
                        cleanText = cleanText.replace(/^بِسْمِ[\s\S]*?ٱلرَّحِيمِ\s*/, '').trim();
                    }

                    matches.push({
                        surahNum: sNum,
                        surahName: surahObj ? surahObj.name : m.surah.name.replace(/^سُورَةُ\s*/, ''),
                        ayahNum: aNum,
                        page: this.getPageByAyah(sNum, aNum),
                        text: cleanText
                    });
                    if (matches.length >= 30) break;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Quran API search error:', err);
            }
        }

        if (this.searchQuery !== rawQ) return;

        // Cache completed result
        this.searchCache.set(normQ, matches);
        this.renderSearchResults(matches, rawQ, false);
    }

    renderSearchResults(matches, rawQ, isLoadingMore = false) {
        const resultsBox = document.getElementById('quranVerseSearchResults');
        if (!resultsBox || this.searchQuery !== rawQ) return;

        if (matches.length === 0 && !isLoadingMore) {
            resultsBox.innerHTML = `
                <div class="verse-search-header">
                    <span>نتائج البحث في الآيات</span>
                    <span>(لا توجد نتائج)</span>
                </div>
                <div style="text-align: center; padding: 18px 10px; color: var(--text-muted); font-size: 13px;">
                    <p style="margin: 0 0 6px 0;">لم يتم العثور على آيات تطابق «${rawQ}»</p>
                    <small>تأكد من صحة الكلمات أو ابحث بجزء من الآية.</small>
                </div>
            `;
            return;
        }

        resultsBox.innerHTML = `
            <div class="verse-search-header">
                <span>نتائج الآيات المطابقة (${this.toArabicDigits(matches.length)})</span>
                ${isLoadingMore 
                    ? '<span style="font-size: 11.5px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="color: #d97706;"></i> جاري البحث الموسّع...</span>' 
                    : '<span style="font-size: 11.5px; color: #d97706;">انقر للانتقال للآية في صفحتها</span>'
                }
            </div>
            ${matches.map(m => `
                <div class="verse-res-item" onclick="window.wzkerQuran.openAyahInReader(${m.surahNum}, ${m.ayahNum})">
                    <div class="verse-res-meta">
                        <span class="verse-res-title">سورة ${m.surahName} • الآية ${this.toArabicDigits(m.ayahNum)}</span>
                        <span class="verse-res-page">صفحة ${this.toArabicDigits(m.page)}</span>
                    </div>
                    <p class="verse-res-text">${this.highlightMatch(m.text, rawQ)}</p>
                </div>
            `).join('')}
        `;
    }

    highlightMatch(text, query) {
        if (!query || !text) return text;
        const cleanQ = this.normalizeArabic(query);
        const queryTerms = cleanQ.split(/\s+/).filter(t => t.length > 0);
        if (queryTerms.length === 0) return text;

        const words = text.split(/\s+/);
        return words.map(w => {
            const normW = this.normalizeArabic(w);
            const matches = queryTerms.some(term => {
                if (term.length >= 2 && normW.includes(term)) return true;
                if (term.length >= 2 && term.includes(normW)) return true;
                return false;
            });
            return matches ? `<mark>${w}</mark>` : w;
        }).join(' ');
    }

    // ── Surahs List Rendering (No Audio Btn, Page Badge & Last Read Ribbon) ──
    renderSurahsList() {
        const grid = document.getElementById('quranSurahsGrid');
        if (!grid) return;

        let list = QURAN_SURAHS;

        if (this.revelationFilter === 'makkiyah') {
            list = list.filter(s => s.type === 'مكية');
        } else if (this.revelationFilter === 'madaniyah') {
            list = list.filter(s => s.type === 'مدنية');
        }

        if (this.searchQuery) {
            const normQ = this.normalizeArabic(this.searchQuery);
            list = list.filter(s => {
                const normName = this.normalizeArabic(s.name);
                return normName.includes(normQ) || s.num.toString() === this.searchQuery;
            });
        }

        if (list.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p style="font-weight: 700; margin: 0;">لم يتم العثور على سور مطابقة للبحث</p>
                </div>
            `;
            return;
        }

        const lastReadSurahNum = this.lastRead.surahNum;

        grid.innerHTML = list.map(s => {
            const isLastRead = s.num === lastReadSurahNum;
            const typeClass = s.type === 'مكية' ? 'makkiyah' : 'madaniyah';

            return `
                <div class="surah-card-item ${isLastRead ? 'is-last-read' : ''}" onclick="window.wzkerQuran.openSurah(${s.num})">
                    <div class="surah-card-left">
                        <div class="surah-num-badge">${this.toArabicDigits(s.num)}</div>
                        <div class="surah-card-meta">
                            <h4 class="surah-card-name">سورة ${s.name}</h4>
                            <p class="surah-card-sub">
                                <span class="surah-type-dot ${typeClass}"></span>
                                <span>${s.type}</span> •
                                <span>${this.toArabicDigits(s.ayahs)} آية</span> •
                                <span>الجزء ${this.toArabicDigits(s.juz)}</span>
                            </p>
                        </div>
                    </div>
                    <div class="surah-card-right">
                        <span class="surah-mushaf-page-badge">صـ ${this.toArabicDigits(s.page)}</span>
                        <i class="fa-solid fa-chevron-left" style="font-size: 13px; color: var(--text-muted); opacity: 0.6;"></i>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── Juz List Rendering ──
    renderJuzList() {
        const listContainer = document.getElementById('quranJuzList');
        if (!listContainer) return;

        listContainer.innerHTML = QURAN_JUZ.map(j => `
            <div class="juz-card-item" onclick="window.wzkerQuran.openJuz(${j.num})">
                <div class="juz-info-box">
                    <div class="juz-num-badge">${this.toArabicDigits(j.num)}</div>
                    <div class="juz-text-box">
                        <h4>${j.name}</h4>
                        <p>من سورة ${j.startSurah} (${this.toArabicDigits(j.startAyah)}) إلى ${j.endSurah} (${this.toArabicDigits(j.endAyah)})</p>
                    </div>
                </div>
                <div class="juz-page-badge">
                    صفحة ${this.toArabicDigits(j.page)}
                </div>
            </div>
        `).join('');
    }

    openJuz(juzNum) {
        const juz = QURAN_JUZ.find(j => j.num === juzNum);
        if (!juz) return;
        const surah = QURAN_SURAHS.find(s => s.name === juz.startSurah);
        if (surah) {
            this.openSurah(surah.num, juz.startAyah);
        }
    }

    // ── Single Bookmark Rendering ──
    renderBookmarksList() {
        const emptyBox = document.getElementById('quranBookmarksEmpty');
        const listEl = document.getElementById('quranBookmarksList');
        const countBadge = document.getElementById('quranBookmarksCount');

        const hasBookmark = !!this.bookmark;
        if (countBadge) countBadge.textContent = hasBookmark ? '١' : '٠';

        if (!listEl || !emptyBox) return;

        if (!hasBookmark) {
            emptyBox.style.display = 'flex';
            listEl.style.display = 'none';
            listEl.innerHTML = '';
            return;
        }

        emptyBox.style.display = 'none';
        listEl.style.display = 'flex';

        const b = this.bookmark;
        listEl.innerHTML = `
            <div class="bookmark-item-card" onclick="window.wzkerQuran.openAyahInReader(${b.surahNum}, ${b.ayahNum || 1})">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="surah-num-badge" style="background: rgba(217, 119, 6, 0.15); color: #d97706;">
                        <i class="fa-solid fa-bookmark"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0 0 3px 0;">فاصلة المصحف الشريف</h4>
                        <p style="font-size: 12.5px; color: var(--text-muted); margin: 0;">سورة ${b.surahName} • الآية ${this.toArabicDigits(b.ayahNum || 1)} • صفحة ${this.toArabicDigits(b.page)}</p>
                    </div>
                </div>
                <button class="reader-ctrl-btn" title="حذف الفاصلة" onclick="event.stopPropagation(); window.wzkerQuran.removeSingleBookmark()">
                    <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i>
                </button>
            </div>
        `;
    }

    // ── Open Exact Ayah in Royal Mushaf Reader (Navigates directly to the exact page of the Ayah) ──
    openAyahInReader(surahNum, ayahNum = 1) {
        const sNum = parseInt(surahNum, 10);
        const aNum = parseInt(ayahNum, 10);
        const page = this.getPageByAyah(sNum, aNum);

        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) overlay.classList.add('active');

        this.renderPage(page, aNum, sNum);
    }

    // ── Open Surah in Royal Mushaf Reader (Opens at the exact page of the requested Ayah) ──
    openSurah(surahNum, targetAyah = 1) {
        const surah = QURAN_SURAHS.find(s => s.num === surahNum);
        if (!surah) return;

        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) overlay.classList.add('active');

        const page = (targetAyah && targetAyah > 1) 
            ? this.getPageByAyah(surahNum, targetAyah) 
            : surah.page;

        this.renderPage(page, targetAyah, surahNum);
    }

    closeReader() {
        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    // ── Real 604-Page Mushaf Engine (تقسيم المصحف الحقيقي صفحة بصفحة) ──
    async renderPage(pageNum, targetAyah = null, targetSurah = null) {
        const p = Math.max(1, Math.min(604, pageNum));
        this.currentPage = p;

        const sheet = document.getElementById('mushafPageSheet');
        if (sheet) sheet.classList.add('page-turn-anim');

        const container = document.getElementById('readerMushafContainer');
        if (container) {
            // If page is not yet cached, show elegant loading
            if (!localStorage.getItem(`wzker_mushaf_page_${p}`)) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 70px 20px; color: var(--text-muted);">
                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: #d97706; margin-bottom: 12px;"></i>
                        <p style="font-size: 15px; font-weight: 800;">جاري تحميل صفحة ${this.toArabicDigits(p)} من المصحف الشريف...</p>
                    </div>
                `;
            }
        }

        // Fetch / Load page data (with instant localStorage cache)
        const ayahs = await this.loadPageData(p);

        if (!ayahs || ayahs.length === 0) {
            if (container) container.innerHTML = '<p style="text-align:center; padding: 40px;">تعذر تحميل الصفحة. يرجى التحقق من الاتصال.</p>';
            if (sheet) sheet.classList.remove('page-turn-anim');
            return;
        }

        // Primary Surah on this page
        const primarySurahNum = ayahs[0].surahNum;
        const surah = QURAN_SURAHS.find(s => s.num === primarySurahNum) || QURAN_SURAHS[0];
        this.currentSurahNum = surah.num;
        this.currentAyahNum = targetAyah || ayahs[0].numberInSurah;

        const juzObj = QURAN_JUZ.find(j => j.num === ayahs[0].juz) || { name: `الجزء ${this.toArabicDigits(ayahs[0].juz)}` };

        // Update Headers & Indicators
        const titleEl = document.getElementById('readerNavSurahTitle');
        const metaEl = document.getElementById('readerNavSurahMeta');
        const bannerName = document.getElementById('readerBannerSurahName');
        const bannerDetails = document.getElementById('readerBannerDetails');
        const bannerJuz = document.getElementById('readerBannerJuzText');
        const sheetJuz = document.getElementById('sheetJuzTitle');
        const sheetSurah = document.getElementById('sheetSurahTitle');
        const sheetPageNum = document.getElementById('sheetPageNumText');
        const pageIndicator = document.getElementById('mushafPageIndicator');
        const juzHizbIndicator = document.getElementById('mushafJuzHizbIndicator');
        const bottomPageNum = document.getElementById('readerBottomPageNum');

        if (titleEl) titleEl.textContent = `سورة ${surah.name}`;
        if (metaEl) metaEl.textContent = `${surah.type} • صفحة ${this.toArabicDigits(p)} • ${juzObj.name}`;
        if (bannerName) bannerName.textContent = `سورة ${surah.name}`;
        if (bannerJuz) bannerJuz.textContent = juzObj.name;
        if (bannerDetails) bannerDetails.innerHTML = `<span>ترتيبها: ${this.toArabicDigits(surah.num)}</span> • <span>صفحة: ${this.toArabicDigits(p)}</span> • <span class="surah-juz-badge">${juzObj.name}</span>`;

        if (sheetJuz) sheetJuz.textContent = juzObj.name;
        if (sheetSurah) sheetSurah.textContent = `سورة ${surah.name}`;
        if (sheetPageNum) sheetPageNum.textContent = `- ${this.toArabicDigits(p)} -`;
        if (pageIndicator) pageIndicator.textContent = `صفحة ${this.toArabicDigits(p)} من ٦٠٤`;
        if (juzHizbIndicator) juzHizbIndicator.textContent = `${juzObj.name} • سورة ${surah.name}`;
        if (bottomPageNum) bottomPageNum.textContent = this.toArabicDigits(p);

        // Save last read position
        this.saveLastRead(surah.num, this.currentAyahNum, p);

        // Update Ribbon UI
        this.updateRibbonBookmarkUI();

        // Group Ayahs on this page by Surah
        const groups = [];
        let curGroup = null;
        for (const a of ayahs) {
            if (!curGroup || curGroup.surahNum !== a.surahNum) {
                curGroup = { surahNum: a.surahNum, ayahs: [] };
                groups.push(curGroup);
            }
            curGroup.ayahs.push(a);
        }

        // Build HTML for the page
        let pageHtml = '';
        for (const grp of groups) {
            const grpSurah = QURAN_SURAHS.find(s => s.num === grp.surahNum) || { name: '', type: 'مكية', ayahs: 7 };
            const startsSurah = grp.ayahs.some(a => a.numberInSurah === 1);

            // If a surah starts on this page, render its ornamental header & Basmalah
            if (startsSurah) {
                pageHtml += `
                    <div class="page-surah-start-banner">
                        <h3 class="page-surah-start-title">سورة ${grpSurah.name}</h3>
                        <div class="page-surah-start-meta">${grpSurah.type} • ${this.toArabicDigits(grpSurah.ayahs)} آيات</div>
                    </div>
                `;

                // Basmalah: Show for all surahs except At-Tawbah (Surah 9)
                if (grp.surahNum !== 9) {
                    pageHtml += `
                        <div class="page-basmalah-line">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </div>
                    `;
                }
            }

            // Render Verses
            pageHtml += `
                <div class="reader-mushaf-text" style="font-size: ${this.fontSize}px;">
                    ${grp.ayahs.map(a => `
                        <span class="reader-ayah-span ${(a.numberInSurah === targetAyah && (!targetSurah || a.surahNum === targetSurah)) ? 'active-reading' : ''}" 
                              id="ayah_span_${a.surahNum}_${a.numberInSurah}" 
                              onclick="window.wzkerQuran.handleAyahClick(${a.surahNum}, ${a.numberInSurah}, '${a.text.replace(/'/g, "\\'")}')">
                            ${a.text}
                            <span class="ayah-end-sign">﴿${this.toArabicDigits(a.numberInSurah)}﴾</span>
                        </span>
                    `).join(' ')}
                </div>
            `;
        }

        if (container) container.innerHTML = pageHtml;

        // Smoothly end animation
        if (sheet) {
            setTimeout(() => sheet.classList.remove('page-turn-anim'), 160);
        }

        // Highlight & Scroll to target ayah if provided
        if (targetAyah) {
            setTimeout(() => {
                let el = null;
                if (targetSurah) {
                    el = document.getElementById(`ayah_span_${targetSurah}_${targetAyah}`);
                }
                if (!el) {
                    el = document.getElementById(`ayah_span_${primarySurahNum}_${targetAyah}`) ||
                         document.querySelector(`[id^="ayah_span_"][id$="_${targetAyah}"]`);
                }
                if (el) {
                    document.querySelectorAll('.reader-ayah-span').forEach(s => s.classList.remove('active-reading'));
                    el.classList.add('active-reading');
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }

    // ── Load Page Data (Fetches exactly the ayahs of the page with 0 duplicate basmalah) ──
    async loadPageData(pageNum) {
        const cacheKey = `wzker_mushaf_page_${pageNum}`;
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                this.prefetchAdjacentPages(pageNum);
                return data;
            }
        } catch (e) {}

        try {
            const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`);
            const json = await res.json();
            if (json && json.data && json.data.ayahs) {
                const ayahs = json.data.ayahs.map(a => {
                    let txt = a.text;
                    // Clean duplicate basmalah from ayah 1 (except Al-Fatiha)
                    if (a.surah.number !== 1 && a.numberInSurah === 1) {
                        txt = txt.replace(/^بِسْمِ[\s\S]*?ٱلرَّحِيمِ\s*/, '').trim();
                    }
                    return {
                        number: a.number,
                        numberInSurah: a.numberInSurah,
                        text: txt,
                        surahNum: a.surah.number,
                        surahName: a.surah.name.replace(/^سُورَةُ\s*/, ''),
                        juz: a.juz,
                        page: a.page,
                        hizbQuarter: a.hizbQuarter
                    };
                });

                try {
                    localStorage.setItem(cacheKey, JSON.stringify(ayahs));
                } catch (e) {}

                this.prefetchAdjacentPages(pageNum);
                return ayahs;
            }
        } catch (err) {
            console.error('Failed to fetch page data:', err);
        }

        // Fallback placeholder if offline
        return [{
            number: 1,
            numberInSurah: 1,
            text: `صفحة رقم ${this.toArabicDigits(pageNum)} من المصحف الشريف المبارك`,
            surahNum: 1,
            surahName: 'الفاتحة',
            juz: 1,
            page: pageNum
        }];
    }

    // ── Background Prefetching (Makes next/prev page flips 0ms instant) ──
    prefetchAdjacentPages(pageNum) {
        setTimeout(() => {
            if (pageNum < 604 && !localStorage.getItem(`wzker_mushaf_page_${pageNum + 1}`)) {
                fetch(`https://api.alquran.cloud/v1/page/${pageNum + 1}/quran-uthmani`)
                    .then(r => r.json())
                    .then(j => {
                        if (j && j.data && j.data.ayahs) {
                            const ayahs = j.data.ayahs.map(a => {
                                let txt = a.text;
                                if (a.surah.number !== 1 && a.numberInSurah === 1) {
                                    txt = txt.replace(/^بِسْمِ[\s\S]*?ٱلرَّحِيمِ\s*/, '').trim();
                                }
                                return {
                                    number: a.number,
                                    numberInSurah: a.numberInSurah,
                                    text: txt,
                                    surahNum: a.surah.number,
                                    surahName: a.surah.name.replace(/^سُورَةُ\s*/, ''),
                                    juz: a.juz,
                                    page: a.page,
                                    hizbQuarter: a.hizbQuarter
                                };
                            });
                            try { localStorage.setItem(`wzker_mushaf_page_${pageNum + 1}`, JSON.stringify(ayahs)); } catch (e) {}
                        }
                    }).catch(() => {});
            }
        }, 300);
    }

    // ── Page & Surah Navigation Controls ──
    prevPage() {
        if (this.currentPage > 1) {
            this.renderPage(this.currentPage - 1);
        } else {
            if (window.showToast) window.showToast('هذه أول صفحة في المصحف الشريف');
        }
    }

    nextPage() {
        if (this.currentPage < 604) {
            this.renderPage(this.currentPage + 1);
        } else {
            if (window.showToast) window.showToast('هذه خاتمة المصحف الشريف، هنيئاً لك!');
        }
    }

    prevSurah() {
        if (this.currentSurahNum > 1) {
            this.openSurah(this.currentSurahNum - 1);
        } else {
            if (window.showToast) window.showToast('هذه أول سورة في المصحف الشريف');
        }
    }

    nextSurah() {
        if (this.currentSurahNum < 114) {
            this.openSurah(this.currentSurahNum + 1);
        } else {
            if (window.showToast) window.showToast('هذه آخر سورة في المصحف الشريف');
        }
    }

    // ── Reader Settings & Themes ──
    applyReaderSettings() {
        const quranPage = document.getElementById('quranPage');
        if (quranPage) {
            quranPage.setAttribute('data-quran-theme', this.readerTheme);
        }
        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) {
            overlay.setAttribute('data-reader-theme', this.readerTheme);
        }
        const textContainers = document.querySelectorAll('.reader-mushaf-text');
        textContainers.forEach(c => {
            c.style.fontSize = `${this.fontSize}px`;
        });
    }

    toggleTheme() {
        const themes = ['sepia', 'dark'];
        const curIndex = themes.indexOf(this.readerTheme);
        const next = themes[(curIndex === -1 ? 0 : curIndex + 1) % themes.length];
        this.readerTheme = next;
        localStorage.setItem('wzker_quran_theme', next);
        this.applyReaderSettings();
        if (window.showToast) {
            const names = { sepia: 'نمط المصحف', dark: 'النمط الليلي' };
            window.showToast(names[next]);
        }
    }

    increaseFont() {
        if (this.fontSize < 42) {
            this.fontSize += 2;
            localStorage.setItem('wzker_quran_font_size', this.fontSize.toString());
            this.applyReaderSettings();
        }
    }

    decreaseFont() {
        if (this.fontSize > 18) {
            this.fontSize -= 2;
            localStorage.setItem('wzker_quran_font_size', this.fontSize.toString());
            this.applyReaderSettings();
        }
    }

    // ── Ayah Tap / Click Handling (Single click highlights, Double click opens action modal) ──
    handleAyahClick(surahNum, ayahNum, verseText) {
        const now = Date.now();
        const isDouble = this.lastAyahTap && 
                         this.lastAyahTap.surahNum === surahNum && 
                         this.lastAyahTap.ayahNum === ayahNum && 
                         (now - this.lastAyahTap.time < 350);

        if (this.ayahTapTimer) {
            clearTimeout(this.ayahTapTimer);
            this.ayahTapTimer = null;
        }

        if (isDouble) {
            this.lastAyahTap = null;
            this.selectAyahOnly(surahNum, ayahNum);
            this.openAyahAction(surahNum, ayahNum, verseText);
        } else {
            this.lastAyahTap = { surahNum, ayahNum, time: now };
            this.selectAyahOnly(surahNum, ayahNum);
        }
    }

    selectAyahOnly(surahNum, ayahNum) {
        document.querySelectorAll('.reader-ayah-span').forEach(s => s.classList.remove('active-reading'));
        const span = document.getElementById(`ayah_span_${surahNum}_${ayahNum}`);
        if (span) {
            span.classList.add('active-reading');
        }
        this.currentSurahNum = surahNum;
        this.currentAyahNum = ayahNum;
        this.saveLastRead(surahNum, ayahNum, this.currentPage);
    }

    // ── Ayah Bottom Sheet & Context Actions ──
    openAyahAction(surahNum, ayahNum, verseText) {
        const surah = QURAN_SURAHS.find(s => s.num === surahNum);
        this.selectedAyah = {
            surahNum: surahNum,
            surahName: surah ? surah.name : '',
            ayahNum: ayahNum,
            page: this.currentPage,
            text: verseText
        };

        this.selectAyahOnly(surahNum, ayahNum);

        const badge = document.getElementById('ayahActionBadge');
        const quote = document.getElementById('ayahActionQuote');
        const tafsirBox = document.getElementById('ayahTafsirBox');
        const modal = document.getElementById('ayahActionModal');
        const bookmarkText = document.getElementById('ayahBookmarkTileText');
        const bookmarkTile = document.getElementById('ayahBookmarkTileBtn');

        if (badge) {
            badge.innerHTML = `<i class="fa-solid fa-book-quran"></i> <span>سورة ${this.selectedAyah.surahName} • الآية ${this.toArabicDigits(ayahNum)}</span>`;
        }
        if (quote) {
            quote.innerHTML = `﴿ ${verseText} ﴾ <span class="ayah-end-sign" style="font-size: 19px; color: #d97706; margin-right: 6px;">﴿${this.toArabicDigits(ayahNum)}﴾</span>`;
        }
        if (tafsirBox) {
            tafsirBox.style.display = 'none';
            tafsirBox.innerHTML = '';
        }

        const isMarked = this.bookmark && this.bookmark.page === this.currentPage;
        if (bookmarkText) {
            bookmarkText.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ فاصلة';
        }
        if (bookmarkTile) {
            bookmarkTile.classList.toggle('active', isMarked);
        }

        if (modal) modal.classList.add('active');
    }

    closeAyahAction() {
        const modal = document.getElementById('ayahActionModal');
        if (modal) modal.classList.remove('active');
    }

    async viewTafsir() {
        if (!this.selectedAyah) return;
        const box = document.getElementById('ayahTafsirBox');
        if (!box) return;

        // Toggle if clicked again
        if (box.style.display === 'block' && box.getAttribute('data-ayah') === `${this.selectedAyah.surahNum}_${this.selectedAyah.ayahNum}`) {
            box.style.display = 'none';
            return;
        }

        box.style.display = 'block';
        box.setAttribute('data-ayah', `${this.selectedAyah.surahNum}_${this.selectedAyah.ayahNum}`);
        box.innerHTML = `
            <div style="text-align: center; padding: 18px 10px; color: var(--text-muted);">
                <i class="fa-solid fa-spinner fa-spin" style="color: #d97706; font-size: 20px; margin-bottom: 8px;"></i>
                <p style="margin: 0; font-weight: 700; font-size: 13.5px;">جاري تحميل التفسير الميسر...</p>
            </div>
        `;

        try {
            const cacheKey = `wzker_tafsir_${this.selectedAyah.surahNum}_${this.selectedAyah.ayahNum}`;
            let tafsirText = localStorage.getItem(cacheKey);

            if (!tafsirText) {
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${this.selectedAyah.surahNum}:${this.selectedAyah.ayahNum}/ar.muyassar`);
                const data = await res.json();
                if (data && data.data && data.data.text) {
                    tafsirText = data.data.text;
                    try { localStorage.setItem(cacheKey, tafsirText); } catch(e) {}
                }
            }

            if (tafsirText) {
                this.currentTafsirText = tafsirText;
                box.innerHTML = `
                    <div class="tafsir-box-header">
                        <span class="tafsir-box-title"><i class="fa-solid fa-book-open"></i> التفسير الميسر المعتمد</span>
                        <button class="tafsir-copy-btn" onclick="window.wzkerQuran.copyCurrentTafsir()" title="نسخ التفسير">
                            <i class="fa-solid fa-copy"></i>
                            <span>نسخ التفسير</span>
                        </button>
                    </div>
                    <p class="tafsir-text-content">${tafsirText}</p>
                `;
                return;
            }
        } catch (e) {
            console.error(e);
        }

        box.innerHTML = `
            <p style="margin: 0; color: var(--text-muted); text-align: center; padding: 12px;">تعذر جلب التفسير حالياً. يرجى التحقق من الاتصال بالإنترنت.</p>
        `;
    }

    copyCurrentTafsir() {
        if (!this.currentTafsirText || !this.selectedAyah) return;
        const copyText = `تفسير الآية: ﴿ ${this.selectedAyah.text} ﴾ [سورة ${this.selectedAyah.surahName}: ${this.selectedAyah.ayahNum}]\n\nالتفسير الميسر:\n${this.currentTafsirText}\n\nعبر تطبيق وذكر`;
        navigator.clipboard.writeText(copyText).then(() => {
            if (window.showToast) window.showToast('تم نسخ التفسير');
        }).catch(() => {
            if (window.showToast) window.showToast('تم النسخ');
        });
    }

    toggleBookmarkFromAction() {
        this.toggleBookmarkCurrent();
        const isMarked = this.bookmark && this.bookmark.page === this.currentPage;
        const bookmarkText = document.getElementById('ayahBookmarkTileText');
        const bookmarkTile = document.getElementById('ayahBookmarkTileBtn');
        if (bookmarkText) bookmarkText.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ فاصلة';
        if (bookmarkTile) bookmarkTile.classList.toggle('active', !!isMarked);
    }

    toggleBookmarkCurrent() {
        const p = this.currentPage || 1;
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const ayahNum = this.selectedAyah ? this.selectedAyah.ayahNum : (this.currentAyahNum || 1);

        // 1. Current page is already bookmarked -> Remove it directly
        if (this.bookmark && this.bookmark.page === p) {
            this.bookmark = null;
            this.saveSingleBookmark(null);
            if (window.showToast) window.showToast('تمت إزالة فاصلة المصحف');
            return;
        }

        // 2. Bookmark exists on another page -> Confirmation modal before moving!
        if (this.bookmark && this.bookmark.page !== p) {
            this.pendingBookmark = {
                surahNum: this.currentSurahNum,
                surahName: surah ? surah.name : '',
                ayahNum: ayahNum,
                page: p,
                snippet: `صفحة ${this.toArabicDigits(p)} • سورة ${surah ? surah.name : ''}`,
                timestamp: Date.now()
            };

            this.closeAyahAction();

            const modal = document.getElementById('bookmarkConfirmModal');
            const msg = document.getElementById('bookmarkConfirmMsg');
            if (msg) {
                msg.innerHTML = `هل تريد وضع علامة عند هذه الصفحة؟<br><span style="font-size: 13px; color: var(--text-muted); display: inline-block; margin-top: 6px;">سيتم نقل الفاصلة من (سورة ${this.bookmark.surahName} - صفحة ${this.toArabicDigits(this.bookmark.page)}) إلى (سورة ${surah ? surah.name : ''} - صفحة ${this.toArabicDigits(p)}).</span>`;
            }
            if (modal) modal.classList.add('active');
            return;
        }

        // 3. No bookmark exists yet -> Set directly on current page
        this.bookmark = {
            surahNum: this.currentSurahNum,
            surahName: surah ? surah.name : '',
            ayahNum: ayahNum,
            page: p,
            snippet: `صفحة ${this.toArabicDigits(p)} • سورة ${surah ? surah.name : ''}`,
            timestamp: Date.now()
        };
        this.saveSingleBookmark(this.bookmark);
        if (window.showToast) window.showToast(`تم وضع فاصلة المصحف في صفحة ${this.toArabicDigits(p)}`);
    }

    // ── Page & Surah Share Modal ──
    openShareModal() {
        const modal = document.getElementById('quranShareModal');
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const pageDesc = document.getElementById('shareCurrentPageDesc');
        const surahDesc = document.getElementById('shareCurrentSurahDesc');

        if (pageDesc) pageDesc.textContent = `مشاركة صفحة ${this.toArabicDigits(this.currentPage)} من سورة ${surah ? surah.name : ''}`;
        if (surahDesc) surahDesc.textContent = `مشاركة سورة ${surah ? surah.name : ''} كاملة (${this.toArabicDigits(surah ? surah.ayahs : 0)} آية)`;

        if (modal) modal.classList.add('active');
    }

    closeShareModal() {
        const modal = document.getElementById('quranShareModal');
        if (modal) modal.classList.remove('active');
    }

    shareCurrentPage() {
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const text = `مصحف وذكر الشريف\nسورة ${surah ? surah.name : ''} • صفحة ${this.currentPage} • الجزء ${surah ? surah.juz : 1}\n\n«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»\nتطبيق وذكر`;
        if (navigator.share) {
            navigator.share({ title: `مصحف وذكر - صفحة ${this.currentPage}`, text: text }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                if (window.showToast) window.showToast('تم نسخ بيانات الصفحة للمشاركة');
            });
        }
        this.closeShareModal();
    }

    shareCurrentSurah() {
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const text = `سورة ${surah ? surah.name : ''} (${surah ? surah.type : ''} - ${surah ? surah.ayahs : ''} آية)\nترتيبها في المصحف: ${surah ? surah.num : 1} • صفحة ${surah ? surah.page : 1}\n\n«اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»\nعبر تطبيق وذكر`;
        if (navigator.share) {
            navigator.share({ title: `سورة ${surah ? surah.name : ''}`, text: text }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                if (window.showToast) window.showToast('تم نسخ بيانات السورة للمشاركة');
            });
        }
        this.closeShareModal();
    }

    // ── Quick Index Modal ──
    openQuickIndex(defaultTab = 'surahs') {
        const modal = document.getElementById('quranQuickIndexModal');
        if (modal) modal.classList.add('active');
        this.switchQuickIndexTab(defaultTab);
    }

    closeQuickIndex() {
        const modal = document.getElementById('quranQuickIndexModal');
        if (modal) modal.classList.remove('active');
    }

    switchQuickIndexTab(tab) {
        const tabSurahs = document.getElementById('idxTabSurahs');
        const tabJuz = document.getElementById('idxTabJuz');
        const body = document.getElementById('quickIndexBody');

        if (tabSurahs) tabSurahs.classList.toggle('active', tab === 'surahs');
        if (tabJuz) tabJuz.classList.toggle('active', tab === 'juz');

        if (!body) return;

        if (tab === 'surahs') {
            body.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
                    ${QURAN_SURAHS.map(s => `
                        <div class="surah-card-item" style="padding: 8px 12px; border-radius: 12px;" onclick="window.wzkerQuran.openSurah(${s.num}); window.wzkerQuran.closeQuickIndex();">
                            <span style="font-weight: 900; font-size: 13px; color: #d97706;">${this.toArabicDigits(s.num)}.</span>
                            <span style="font-weight: 800; font-size: 13px; color: var(--text-main); margin-right: 4px;">${s.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            body.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${QURAN_JUZ.map(j => `
                        <div class="juz-card-item" style="padding: 10px 14px; border-radius: 14px;" onclick="window.wzkerQuran.openJuz(${j.num}); window.wzkerQuran.closeQuickIndex();">
                            <span style="font-weight: 900; color: #d97706;">${j.name}</span>
                            <span style="font-size: 12px; color: var(--text-muted);">من ${j.startSurah} (${this.toArabicDigits(j.startAyah)}) إلى ${j.endSurah} (${this.toArabicDigits(j.endAyah)})</span>
                            <span class="juz-page-badge">صـ ${this.toArabicDigits(j.page)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // ── Interactive Khatma Planner & Prayers Tracker ──
    openKhatmaPlanner() {
        const modal = document.getElementById('khatmaPlannerModal');
        if (modal) modal.classList.add('active');
        this.calculateKhatmaPlan();
    }

    closeKhatmaPlanner() {
        const modal = document.getElementById('khatmaPlannerModal');
        if (modal) modal.classList.remove('active');
    }

    setPlanDuration(days, chipEl) {
        this.planDuration = days;
        localStorage.setItem('wzker_khatma_plan_days', days.toString());
        document.querySelectorAll('.khatma-chip').forEach(c => c.classList.remove('active'));
        if (chipEl) chipEl.classList.add('active');
        this.calculateKhatmaPlan();
    }

    showCustomDaysPrompt(chipEl) {
        const val = prompt('أدخل عدد الأيام المطلوب للختمة (مثال: 40 أو 45):', '40');
        if (val && !isNaN(val) && parseInt(val, 10) > 0) {
            this.setPlanDuration(parseInt(val, 10), chipEl);
        }
    }

    calculateKhatmaPlan() {
        const days = this.planDuration;
        const totalPages = 604;
        const currentPage = this.lastRead.page || 1;
        const remainingPages = Math.max(0, totalPages - currentPage);
        const dailyPages = Math.max(1, Math.ceil(totalPages / days));
        const dailyLeaves = Math.max(1, Math.round(dailyPages / 2));
        const pagesPerPrayer = Math.max(1, Math.ceil(dailyPages / 5));

        // Update Summary Elements
        const targetPagesEl = document.getElementById('khatmaDailyPagesTarget');
        const targetJuzEl = document.getElementById('khatmaDailyJuzTarget');
        const remPagesEl = document.getElementById('khatmaRemainingPages');
        const remDaysEl = document.getElementById('khatmaRemainingDays');
        const badgeEl = document.getElementById('khatmaCommitmentBadge');

        if (targetPagesEl) targetPagesEl.textContent = `${this.toArabicDigits(dailyPages)} صفحة`;
        if (targetJuzEl) targetJuzEl.textContent = `(${this.toArabicDigits(dailyLeaves)} ورقات يومياً)`;
        if (remPagesEl) remPagesEl.textContent = `${this.toArabicDigits(remainingPages)} صفحة`;
        if (remDaysEl) remDaysEl.textContent = `${this.toArabicDigits(Math.ceil(remainingPages / dailyPages))} يوماً`;

        // Commitment Badge Evaluation
        if (badgeEl) {
            if (this.todayPages >= dailyPages) {
                badgeEl.textContent = 'ممتاز ومكتمل';
                badgeEl.style.color = '#10b981';
            } else if (this.todayPages > 0) {
                badgeEl.textContent = 'جاري الإنجاز';
                badgeEl.style.color = '#d97706';
            } else {
                badgeEl.textContent = 'في انتظارك اليوم';
                badgeEl.style.color = '#d97706';
            }
        }

        // Update Prayer Grid
        const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        prayers.forEach(p => {
            const el = document.getElementById(`khatma${p}Pages`);
            if (el) el.textContent = `${this.toArabicDigits(pagesPerPrayer)} صفحات`;
        });

        // Update Tracker Numbers
        const todayCountEl = document.getElementById('khatmaTodayPagesCount');
        const yesterdayCountEl = document.getElementById('khatmaYesterdayPagesCount');
        if (todayCountEl) todayCountEl.textContent = this.toArabicDigits(this.todayPages);
        if (yesterdayCountEl) yesterdayCountEl.textContent = `${this.toArabicDigits(this.yesterdayPages)} صفحة`;
    }

    adjustTodayPages(delta) {
        this.todayPages = Math.max(0, this.todayPages + delta);
        localStorage.setItem('wzker_khatma_today_pages', this.todayPages.toString());
        this.calculateKhatmaPlan();
    }
}

// Global Initialization
if (typeof window !== 'undefined') {
    window.wzkerQuran = new WzkerQuranManager();
}
