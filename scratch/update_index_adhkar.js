const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add css/adhkar.css after css/quran.css
if (!html.includes('css/adhkar.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="css/quran.css">',
    '<link rel="stylesheet" href="css/quran.css">\n    <link rel="stylesheet" href="css/adhkar.css">'
  );
  console.log('Added css/adhkar.css');
}

// 2. Add js/adhkar-data.js and js/adhkar.js before app.js
if (!html.includes('js/adhkar-data.js')) {
  html = html.replace(
    '<script src="js/app.js"></script>',
    '<script src="js/adhkar-data.js"></script>\n    <script src="js/adhkar.js"></script>\n    <script src="js/app.js"></script>'
  );
  console.log('Added js/adhkar-data.js & js/adhkar.js');
}

// 3. Replace placeholder adhkarPage
const p1 = html.indexOf('<!-- 1. ADHKAR PAGE -->');
const p2 = html.indexOf('<!-- 2.', p1);

if (p1 !== -1 && p2 !== -1) {
  const newAdhkarHtml = `<!-- 1. ADHKAR PAGE (صفحة أذكار المسلم اليومية الفاخرة) -->
    <div id="adhkarPage" class="sub-lib-page">
        <div class="prime-navbar">
            <button class="nav-btn" onclick="closeLibPage('adhkarPage')" title="الرجوع"><i class="fa-solid fa-chevron-right"></i></button>
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="images/icons/prayer1.png" style="width: 22px; height: 22px; object-fit: contain;" alt="Adhkar">
                <h2 class="navbar-title">الأذكار اليومية</h2>
            </div>
            <div class="adhkar-nav-actions">
                <button class="adhkar-zen-toggle-btn" onclick="window.wzkerAdhkar.openZenMode()" title="وضع التركيز التام">
                    <img src="images/icons/Focus1.png" alt="Focus">
                    <span>تركيز</span>
                </button>
                <div class="adhkar-progress-badge" id="adhkarNavProgressBadge" title="إنجاز الأذكار اليوم">
                    <img src="images/icons/streak.png" alt="Streak">
                    <span>0 / 49</span>
                </div>
            </div>
        </div>

        <div class="sub-page-body" style="overflow-y: auto;">
            <div class="adhkar-page-content">
                <!-- Smart Time-Aware Hero Card -->
                <div class="adhkar-hero-card" id="adhkarHeroCard">
                    <div class="adhkar-hero-left">
                        <span class="adhkar-hero-badge" id="adhkarHeroBadge">الورد المستحب الآن</span>
                        <h3 class="adhkar-hero-title" id="adhkarHeroTitle">أذكار الصباح المباركة</h3>
                        <p class="adhkar-hero-desc" id="adhkarHeroDesc">ابدأ يومك بانشراح الصدر ونيل معية الله وحفظه ورعايته التامة.</p>
                        <div class="adhkar-hero-actions">
                            <button class="adhkar-hero-btn" id="adhkarHeroBtn">
                                <span>قراءة أذكار الصباح</span>
                                <i class="fa-solid fa-arrow-left"></i>
                            </button>
                        </div>
                    </div>
                    <div class="adhkar-hero-right">
                        <div class="adhkar-hero-artwork">
                            <img id="adhkarHeroImg" src="images/icons/sunrise1.png" alt="Hero Adhkar">
                        </div>
                    </div>
                </div>

                <!-- Horizontal Category Capsules -->
                <div class="adhkar-capsules-wrap">
                    <div class="adhkar-capsules-scroll" id="adhkarCapsulesScroll">
                        <!-- Populated dynamically by js/adhkar.js -->
                    </div>
                </div>

                <!-- Search & Quick Filter Bar -->
                <div class="adhkar-search-bar">
                    <i class="fa-solid fa-magnifying-glass adhkar-search-icon"></i>
                    <input type="text" id="adhkarSearchInput" class="adhkar-search-input" placeholder="ابحث في نصوص الأذكار وفضائلها...">
                    <button id="adhkarClearSearchBtn" class="adhkar-clear-search" title="مسح البحث">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Adhkar Cards Grid / List -->
                <div class="adhkar-cards-container" id="adhkarCardsContainer">
                    <!-- Populated dynamically by js/adhkar.js -->
                </div>
            </div>
        </div>
    </div>

    <!-- ADHKAR ZEN FOCUS FULL-SCREEN OVERLAY -->
    <div id="adhkarZenOverlay" class="adhkar-zen-overlay">
        <div class="adhkar-zen-header">
            <span class="adhkar-zen-progress-indicator" id="adhkarZenIndicator">ذكر 1 من 10</span>
            <button class="adhkar-zen-close-btn" onclick="window.wzkerAdhkar.closeZenMode()" title="خروج من وضع التركيز">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="adhkar-zen-body">
            <div class="adhkar-zen-category-tag" id="adhkarZenCategoryTag">
                <img src="images/icons/sunrise1.png" alt="Category">
                <span>أذكار الصباح</span>
            </div>
            <div class="adhkar-zen-text" id="adhkarZenText"></div>
            <div class="adhkar-zen-counter-huge" id="adhkarZenCounterBtn" onclick="window.wzkerAdhkar.handleZenTap()">
                <span class="num" id="adhkarZenCounterNum">3</span>
                <span class="label" id="adhkarZenCounterLabel">الهدف: 3</span>
            </div>
        </div>

        <div class="adhkar-zen-footer">
            <button class="adhkar-zen-nav-btn" onclick="window.wzkerAdhkar.prevZenDhikr()">
                <i class="fa-solid fa-chevron-right"></i>
                <span>السابق</span>
            </button>
            <button class="adhkar-zen-nav-btn" onclick="window.wzkerAdhkar.nextZenDhikr()">
                <span>التالي</span>
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
    </div>

    <!-- ADHKAR SOCIAL GIFT CARD MODAL -->
    <div id="adhkarGiftModal" class="adhkar-gift-modal-overlay" onclick="if(event.target === this) window.wzkerAdhkar.closeShareModal()">
        <div class="adhkar-gift-card-box" onclick="event.stopPropagation()">
            <div class="adhkar-gift-card-preview">
                <div class="adhkar-gift-top-ornament">۞ بطاقة ذكر مبارك ۞</div>
                <blockquote class="adhkar-gift-verse-text" id="adhkarGiftText"></blockquote>
                <div class="adhkar-gift-footer">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="images/icon/wzker.png" alt="Wzker">
                        <span id="adhkarGiftCategory">أذكار الصباح</span>
                    </div>
                    <span id="adhkarGiftFadl" style="font-size: 0.72rem; max-width: 200px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                </div>
            </div>

            <div class="adhkar-gift-actions">
                <button class="adhkar-gift-btn primary" onclick="window.wzkerAdhkar.shareGiftCardNow()">
                    <i class="fa-solid fa-share-nodes"></i>
                    <span>مشاركة البطاقة</span>
                </button>
                <button class="adhkar-gift-btn secondary" onclick="window.wzkerAdhkar.shareGiftCardNow()">
                    <i class="fa-solid fa-copy"></i>
                    <span>نسخ النص</span>
                </button>
                <button class="adhkar-gift-btn close" onclick="window.wzkerAdhkar.closeShareModal()" title="إغلاق">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    </div>

    `;

  html = html.substring(0, p1) + newAdhkarHtml + html.substring(p2);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully updated index.html with new Adhkar layout!');
} else {
  console.log('Could not find placeholder boundaries!');
}
