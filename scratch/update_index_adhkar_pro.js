const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const p1 = html.indexOf('<!-- 1. ADHKAR PAGE');
const pEnd = html.indexOf('<!-- 2.', p1);

if (p1 === -1 || pEnd === -1) {
  console.error('Could not find adhkar boundaries!');
  process.exit(1);
}

const newAdhkarSection = `<!-- 1. ADHKAR PAGE (صفحة أذكار المسلم اليومية الفاخرة - PRO EDITION) -->
    <div id="adhkarPage" class="sub-lib-page">
        <!-- Floating Contoured Prime Navbar -->
        <div class="adhkar-prime-navbar">
            <div class="adhkar-nav-left">
                <button class="adhkar-nav-btn" onclick="closeLibPage('adhkarPage')" title="الرجوع">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
                <div class="adhkar-nav-title-box">
                    <img src="images/icons/prayer1.png" alt="Adhkar">
                    <h2 class="adhkar-nav-title">الأذكار اليومية</h2>
                </div>
            </div>
            <div class="adhkar-nav-actions">
                <button class="adhkar-drawer-trigger-btn" onclick="window.wzkerAdhkar.openDrawer()" title="فهرس وفضائل الأذكار">
                    <img src="images/icons/Sidemenu1.png" alt="Index">
                    <span>الفهرس</span>
                </button>
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

        <div class="sub-page-body" id="adhkarScrollBody" style="overflow-y: auto;">
            <div class="adhkar-page-content">
                <!-- Smart Time-Aware Hero Card with 3D Ambient Watermark -->
                <div class="adhkar-hero-card" id="adhkarHeroCard">
                    <div class="adhkar-hero-watermark" id="adhkarHeroWatermark">
                        <img id="adhkarHeroWatermarkImg" src="images/icons/sunrise2.png" alt="Watermark">
                    </div>
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
                            <img id="adhkarHeroImg" class="main-art" src="images/icons/sunrise.png" alt="Hero Adhkar">
                            <img id="adhkarHeroSubArt" class="sub-art" src="images/icons/sunrise2.png" alt="Hero Sub Art">
                        </div>
                    </div>
                </div>

                <!-- Horizontal Category Capsules with Gentle Auto Drift -->
                <div class="adhkar-capsules-wrap">
                    <div class="adhkar-capsules-scroll" id="adhkarCapsulesScroll">
                        <!-- Populated dynamically by js/adhkar.js -->
                    </div>
                </div>

                <!-- Smart Search Bar -->
                <div class="adhkar-search-bar">
                    <div class="adhkar-search-icon-wrap">
                        <img src="images/icons/search.png" alt="Search">
                    </div>
                    <input type="text" id="adhkarSearchInput" class="adhkar-search-input" placeholder="ابحث في نصوص الأذكار أو فضائلها أو رواتها...">
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

    <!-- DEDICATED ADHKAR SLIDE-OUT DRAWER (فهرس وفضائل الأذكار) -->
    <div id="adhkarDrawerOverlay" class="adhkar-drawer-overlay" onclick="if(event.target === this) window.wzkerAdhkar.closeDrawer()">
        <div class="adhkar-drawer-panel" onclick="event.stopPropagation()">
            <div class="adhkar-drawer-header">
                <div class="adhkar-drawer-brand">
                    <img src="images/icons/prayer1.png" alt="Wzker">
                    <h3>فهرس وفضائل الأذكار</h3>
                </div>
                <button class="adhkar-drawer-close-btn" onclick="window.wzkerAdhkar.closeDrawer()" title="إغلاق">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="adhkar-drawer-body">
                <!-- Section 1: Categories Index -->
                <div>
                    <div class="adhkar-drawer-section-title">
                        <img src="images/icons/leaf-1.png" alt="Leaf">
                        <span>أقسام الأوراد النبوية</span>
                    </div>
                    <div class="adhkar-drawer-menu-list" id="adhkarDrawerCategoriesList">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Section 2: Virtues & Merits of Dhikr -->
                <div>
                    <div class="adhkar-drawer-section-title">
                        <img src="images/icons/certificate1.png" alt="Virtue">
                        <span>من فضائل وثمرات الذكر</span>
                    </div>
                    <div id="adhkarDrawerVirtuesList">
                        <!-- Populated dynamically -->
                    </div>
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
                <img src="images/icons/sunrise.png" alt="Category">
                <span>أذكار الصباح</span>
            </div>
            <div class="adhkar-zen-text-wrap">
                <p class="adhkar-zen-text" id="adhkarZenText"></p>
            </div>
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

    <!-- PINTEREST-STYLE SOCIAL STORY CARD MODAL -->
    <div id="adhkarGiftModal" class="adhkar-gift-modal-overlay" onclick="if(event.target === this) window.wzkerAdhkar.closeShareModal()">
        <div class="adhkar-gift-card-box" onclick="event.stopPropagation()">
            <!-- The Pinterest Art Card -->
            <div class="adhkar-pinterest-card" id="adhkarPinterestCard">
                <div class="adhkar-pinterest-header">
                    <span id="adhkarGiftCategory">أذكار الصباح</span>
                </div>
                <blockquote class="adhkar-pinterest-text" id="adhkarGiftText"></blockquote>
                <div class="adhkar-pinterest-source" id="adhkarGiftSource">المصدر: صحيح البخاري</div>
                <div class="adhkar-pinterest-fadl" id="adhkarGiftFadl"></div>
                <div class="adhkar-pinterest-footer">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="images/icon/wzker.png" alt="Wzker">
                        <span style="font-weight: 800;">تطبيق وذكر | Wzker</span>
                    </div>
                    <span id="adhkarGiftCountBadge" style="font-size: 0.78rem; font-weight: 800;">تكرار: مرة واحدة</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="adhkar-gift-actions">
                <button class="adhkar-gift-btn download" onclick="window.wzkerAdhkar.downloadCardImage()">
                    <img src="images/icons/download.png" alt="Download">
                    <span>تحميل كصورة</span>
                </button>
                <button class="adhkar-gift-btn primary" onclick="window.wzkerAdhkar.shareGiftCardNow()">
                    <img src="images/icons/share-picture1.png" alt="Share">
                    <span>مشاركة البطاقة</span>
                </button>
                <button class="adhkar-gift-btn secondary" onclick="window.wzkerAdhkar.copyFormattedDhikrFromModal()">
                    <img src="images/icons/copy1.png" alt="Copy">
                    <span>نسخ منسق</span>
                </button>
                <button class="adhkar-gift-btn close" onclick="window.wzkerAdhkar.closeShareModal()" title="إغلاق">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Hidden Canvas for PNG Image Export -->
    <canvas id="adhkarShareCanvas" width="1080" height="1350" style="display: none;"></canvas>

    `;

html = html.substring(0, p1) + newAdhkarSection + html.substring(pEnd);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with PRO Adhkar architecture!');
