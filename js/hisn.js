/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL HISN AL-MUSLIM CONTROLLER (js/hisn.js) - PRO EDITION
 * State-of-the-Art Luxury Situational Reference & Search Engine
 * Modeled after the Royal Adhkar Page architecture.
 * Dynamic Category Dual-Art, Official Number Badges, Zero Emojis
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  const WZKER_HISN_VIRTUES = [
    {
      title: "الدعاء هو العبادة وأعظمها",
      verse: "﴿وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ﴾ [غافر: ٦٠]",
      hadith: "الدُّعَاءُ هُوَ الْعِبَادَةُ، ثُمَّ قَرَأَ: وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ.",
      source: "سنن الترمذي وأبو داود وصححه الألباني"
    },
    {
      title: "أكرم شيء على الله تعالى",
      verse: "﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾ [البقرة: ١٨٦]",
      hadith: "لَيْسَ شَيْءٌ أَكْرَمَ عَلَى اللَّهِ تَعَالَى مِنَ الدُّعَاءِ.",
      source: "سنن الترمذي وابن ماجه وحسنه الألباني"
    },
    {
      title: "سلاح المؤمن ودفاع البلاء",
      verse: "﴿أَمَّنْ يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ﴾ [النمل: ٦٢]",
      hadith: "إِنَّ الدُّعَاءَ يَنْفَعُ مِمَّا نَزَلَ وَمِمَّا لَمْ يَنْزِلْ، فَعَلَيْكُمْ عِبَادَ اللَّهِ بِالدُّعَاءِ.",
      source: "سنن الترمذي وحسنه الألباني"
    },
    {
      title: "استحياء الله من رد السائل",
      verse: "﴿ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً﴾ [الأعراف: ٥٥]",
      hadith: "إِنَّ اللَّهَ حَيِيٌّ كَرِيمٌ، يَسْتَحْيِي إِذَا رَفَعَ الرَّجُلُ إِلَيْهِ يَدَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا خَائِبَتَيْنِ.",
      source: "سنن أبي داود والترمذي وصححه الألباني"
    }
  ];

  const CATEGORY_ACCENTS = {
    all: { accent: '#D29571', bg: 'rgba(210, 149, 113, 0.08)' },
    daily: { accent: '#E07A5F', bg: 'rgba(224, 122, 95, 0.08)' },
    prayer: { accent: '#2A9D8F', bg: 'rgba(42, 157, 143, 0.08)' },
    distress: { accent: '#E76F51', bg: 'rgba(231, 111, 81, 0.08)' },
    illness: { accent: '#00B4D8', bg: 'rgba(0, 180, 216, 0.08)' },
    travel: { accent: '#8F5C38', bg: 'rgba(143, 92, 56, 0.08)' },
    social: { accent: '#9B5DE5', bg: 'rgba(155, 93, 229, 0.08)' },
    nature: { accent: '#F4A261', bg: 'rgba(244, 162, 97, 0.08)' },
    general: { accent: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' }
  };

  class WzkerHisnManager {
    constructor() {
      this.categories = [];
      this.items = [];
      this.memorized = new Set();
      this.currentCategory = 'all';
      this.currentFilter = 'all'; // 'all' | 'memorized' | 'unmemorized'
      this.searchQuery = '';
      this.fontSize = localStorage.getItem('wzker_hisn_font_size') || 'standard';
      this.tashkeelMode = localStorage.getItem('wzker_hisn_tashkeel') || 'full';
      this.activeGiftItem = null;
      this.zenIndex = 0;
      this.searchDebounceTimer = null;
      this.isInitialized = false;

      this.storageKey = 'wzker_hisn_memorized';
    }

    init() {
      this.categories = window.WZKER_HISN_CATEGORIES || [];
      this.items = window.WZKER_HISN_ITEMS || [];

      this.loadMemorizedState();
      this.setupDOM();

      this.updateHeroForCategory(this.currentCategory);
      this.renderFeaturedDailyDhikr();
      this.renderHeroAndStreak();
      this.renderCapsules();
      this.renderDrawer();
      this.renderList();
      this.applyTypographySettings();

      this.isInitialized = true;
    }

    loadMemorizedState() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const arr = JSON.parse(stored);
          if (Array.isArray(arr)) {
            this.memorized = new Set(arr);
          }
        }
      } catch (e) {
        console.warn('[Hisn] Error loading memorized:', e);
        this.memorized = new Set();
      }
    }

    saveMemorizedState() {
      try {
        const arr = Array.from(this.memorized);
        localStorage.setItem(this.storageKey, JSON.stringify(arr));

        if (window.wzkerCloud && typeof window.wzkerCloud.scheduleCloudPush === 'function') {
          window.wzkerCloud.scheduleCloudPush();
        }
      } catch (e) {
        console.warn('[Hisn] Error saving memorized:', e);
      }
    }

    // ── Calculate Spiritual Mastery Rank ──
    calculateMasteryRank(count) {
      if (count >= 91) {
        return { title: 'حصين بالإيمان', icon: 'images/icons/security-shield.png', level: 4 };
      }
      if (count >= 46) {
        return { title: 'الحافظ للأثر', icon: 'images/icons/certificate2.png', level: 3 };
      }
      if (count >= 16) {
        return { title: 'المستمسك بالهدي', icon: 'images/icons/Focus1.png', level: 2 };
      }
      return { title: 'المبتدئ بالسنن', icon: 'images/icons/certificate1.png', level: 1 };
    }

    // ── Featured Daily Situation Supplication ──
    renderFeaturedDailyDhikr() {
      if (!this.items || this.items.length === 0) return;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const item = this.items[dayOfYear % this.items.length];
      this.featuredDailyItem = item;

      const catObj = this.categories.find(c => c.id === item.catId) || {};
      const sitEl = document.getElementById('hisnFeaturedSituation');
      const txtEl = document.getElementById('hisnFeaturedText');
      const srcEl = document.getElementById('hisnFeaturedSource');
      const tagEl = document.getElementById('hisnFeaturedCatTag');

      if (sitEl) sitEl.textContent = item.situation;
      if (txtEl) txtEl.textContent = item.text;
      if (srcEl) srcEl.textContent = item.source ? `المصدر: ${item.source}` : (catObj.name || 'مأثور نبوي');
      if (tagEl) tagEl.textContent = catObj.name || 'مأثور';
    }

    copyFeaturedDhikr() {
      if (this.featuredDailyItem) {
        this.copyDhikr(this.featuredDailyItem.id);
      }
    }

    reciteFeaturedDhikr() {
      if (this.featuredDailyItem) {
        this.openZenModeOnItem(this.featuredDailyItem.id);
      }
    }

    // ── Quick Mood / Situational Tag Filter ──
    filterByTag(tag, element) {
      document.querySelectorAll('#hisnQuickTags .hisn-quick-tag').forEach(b => b.classList.remove('active'));
      if (element) element.classList.add('active');

      if (tag === 'all') {
        this.clearSearch();
        return;
      }

      const searchInp = document.getElementById('hisnSearchInput');
      if (searchInp) searchInp.value = tag;
      this.onSearchInput(tag);
      this.scrollToCards();
    }

    setupDOM() {
      const searchInp = document.getElementById('hisnSearchInput');
      const clearBtn = document.getElementById('hisnClearSearchBtn');
      const scrollBody = document.getElementById('hisnScrollBody');
      const scrollTopBtn = document.getElementById('hisnScrollTopBtn');

      if (searchInp && !searchInp.dataset.bound) {
        searchInp.addEventListener('input', (e) => {
          this.onSearchInput(e.target.value);
        });
        searchInp.dataset.bound = 'true';
      }

      if (clearBtn && !clearBtn.dataset.bound) {
        clearBtn.addEventListener('click', () => {
          this.clearSearch();
        });
        clearBtn.dataset.bound = 'true';
      }

      if (scrollBody && !scrollBody.dataset.scrollBound) {
        scrollBody.addEventListener('scroll', () => {
          if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollBody.scrollTop > 350);
          }
        });
        scrollBody.dataset.scrollBound = 'true';
      }
    }

    // ── Arabic Text Normalization ──
    normalizeArabic(text) {
      if (!text) return '';
      return text
        .toString()
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/[ى]/g, 'ي')
        .replace(/[ة]/g, 'ه')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي')
        .replace(/ـ/g, '')
        .trim()
        .toLowerCase();
    }

    stripTashkeel(text) {
      if (!text) return '';
      return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    }

    // ── 1. Dynamic Hero Artwork & Category Adaptation ──
    updateHeroForCategory(catId) {
      const cat = this.categories.find(c => c.id === catId) || this.categories[0] || {};
      const heroCard = document.getElementById('hisnHeroCard');
      const heroMainArt = document.getElementById('hisnHeroMainArt');
      const heroSubArt = document.getElementById('hisnHeroSubArt');
      const heroWatermarkImg = document.getElementById('hisnHeroWatermarkImg');
      const heroBadgeIcon = document.getElementById('hisnHeroBadgeIcon');
      const heroBadgeText = document.getElementById('hisnHeroBadgeText');
      const heroTitle = document.getElementById('hisnHeroTitle');
      const heroDesc = document.getElementById('hisnHeroDesc');
      const artworkBox = document.getElementById('hisnHeroArtworkBox');

      if (heroMainArt) {
        heroMainArt.src = cat.icon1 || 'images/icons/book1.png';
      }
      if (heroSubArt) {
        heroSubArt.src = cat.icon2 || 'images/icons/book2.png';
      }
      if (heroWatermarkImg) {
        heroWatermarkImg.src = cat.watermark || cat.icon1 || 'images/icons/book2.png';
      }
      if (heroBadgeIcon) {
        heroBadgeIcon.src = cat.icon1 || 'images/icons/certificate1.png';
      }
      if (heroBadgeText) {
        heroBadgeText.textContent = cat.heroBadge || 'مرجع الأدعية حسب المواقف';
      }
      if (heroTitle) {
        heroTitle.textContent = cat.id === 'all'
          ? 'حصن المسلم من أذكار الكتاب والسنة'
          : `أدعية ومواقف ${cat.name}`;
      }
      if (heroDesc) {
        heroDesc.textContent = cat.description || 'موسوعة شاملة تضم 132 موقفاً ودعاءً مأثوراً لجميع أحوال المسلم.';
      }
      if (heroCard && cat.accentColor) {
        heroCard.style.setProperty('--card-cat-accent', cat.accentColor);
        heroCard.style.borderTopColor = cat.accentColor;
      }

      if (artworkBox) {
        artworkBox.classList.remove('art-bounce');
        void artworkBox.offsetWidth; // Trigger reflow for animation
        artworkBox.classList.add('art-bounce');
      }
    }

    // ── 2. Hero & Memorization Streak Banner ──
    renderHeroAndStreak() {
      const total = this.items.length;
      const count = this.memorized.size;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      const rank = this.calculateMasteryRank(count);

      const statVal = document.getElementById('hisnHeroStatVal');
      const percentVal = document.getElementById('hisnHeroPercentVal');
      const progressFill = document.getElementById('hisnHeroProgressFill');
      const filterFavBtn = document.getElementById('hisnHeroFilterFavBtn');
      const rankBadge = document.getElementById('hisnMasteryRankBadge');
      const rankLabel = document.getElementById('hisnMasteryRankLabel');
      const drawerBadge = document.getElementById('hisnDrawerBadgeCount');
      const drawerRankTitle = document.getElementById('hisnDrawerRankTitle');
      const drawerMasteryText = document.getElementById('hisnDrawerMasteryText');
      const drawerProgressFill = document.getElementById('hisnDrawerProgressFill');

      if (statVal) {
        statVal.innerHTML = `<span>${count}</span> من ${total} موقفاً`;
      }
      if (percentVal) {
        percentVal.textContent = `${percent}%`;
      }
      if (progressFill) {
        progressFill.style.width = `${percent}%`;
      }
      if (rankLabel) {
        rankLabel.textContent = rank.title;
      }
      if (rankBadge) {
        const iconImg = rankBadge.querySelector('img');
        if (iconImg) iconImg.src = rank.icon;
      }
      if (filterFavBtn) {
        filterFavBtn.classList.toggle('active', this.currentFilter === 'memorized');
      }
      if (drawerBadge) {
        drawerBadge.textContent = `${count} / ${total}`;
      }
      if (drawerRankTitle) {
        drawerRankTitle.textContent = rank.title;
      }
      if (drawerMasteryText) {
        drawerMasteryText.textContent = `حفظت ${count} موقفاً من أصل ${total} موقفاً مأثوراً بنسبة إنجاز ${percent}%.`;
      }
      if (drawerProgressFill) {
        drawerProgressFill.style.width = `${percent}%`;
      }

      document.querySelectorAll('.hisn-streak-tab').forEach((tab) => {
        const f = tab.getAttribute('data-filter');
        tab.classList.toggle('active', f === this.currentFilter);
      });
    }

    // ── 3. Horizontal Category Capsules ──
    renderCapsules() {
      const container = document.getElementById('hisnCapsulesScroll');
      if (!container) return;

      let html = '';
      this.categories.forEach((cat) => {
        const isActive = cat.id === this.currentCategory;
        const count = cat.id === 'all'
          ? this.items.length
          : this.items.filter(item => item.catId === cat.id).length;
        const iconSrc = cat.icon1 || 'images/icons/book1.png';

        html += `
          <div class="hisn-capsule-item ${isActive ? 'active' : ''}" onclick="window.wzkerHisn.setCategory('${cat.id}')">
            <img src="${iconSrc}" alt="${cat.name}">
            <span>${cat.name}</span>
            <span class="capsule-badge">${count}</span>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // ── 4. Dedicated Slide-Out Drawer ──
    renderDrawer() {
      const catList = document.getElementById('hisnDrawerCategoriesList');
      const virtuesList = document.getElementById('hisnDrawerVirtuesList');

      if (catList) {
        let catHtml = '';
        this.categories.forEach((cat, idx) => {
          const isActive = cat.id === this.currentCategory;
          const count = cat.id === 'all'
            ? this.items.length
            : this.items.filter(item => item.catId === cat.id).length;
          const iconSrc = cat.icon1 || 'images/icons/book1.png';

          catHtml += `
            <div class="hisn-drawer-menu-item ${isActive ? 'active' : ''}" 
                 style="animation-delay: ${0.04 * (idx + 1)}s;"
                 onclick="window.wzkerHisn.setCategoryFromDrawer('${cat.id}')">
              <div class="hisn-drawer-item-left">
                <img src="${iconSrc}" alt="${cat.name}">
                <h4 class="hisn-drawer-item-title">${cat.name}</h4>
              </div>
              <span class="hisn-drawer-item-count">${count}</span>
            </div>
          `;
        });
        catList.innerHTML = catHtml;
      }

      if (virtuesList) {
        let vHtml = '';
        WZKER_HISN_VIRTUES.forEach((v) => {
          vHtml += `
            <div class="hisn-virtue-card-mini">
              <div style="display: flex; align-items: center; gap: 6px;">
                <img src="images/icons/certificate2.png" style="width: 14px; height: 14px; object-fit: contain;" alt="فضل">
                <h5 class="hisn-virtue-mini-title">${v.title}</h5>
              </div>
              <p class="hisn-virtue-mini-verse">${v.verse}</p>
              <p class="hisn-virtue-mini-hadith">${v.hadith} — (${v.source})</p>
            </div>
          `;
        });
        virtuesList.innerHTML = vHtml;
      }
    }

    openDrawer() {
      const drawer = document.getElementById('hisnDrawerOverlay');
      if (drawer) {
        drawer.classList.add('active');
        document.body.classList.add('hisn-drawer-open');
      }
    }

    closeDrawer() {
      const drawer = document.getElementById('hisnDrawerOverlay');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.classList.remove('hisn-drawer-open');
      }
    }

    setCategoryFromDrawer(catId) {
      this.setCategory(catId);
      this.closeDrawer();
      this.scrollToCards();
    }

    // ── 5. Resolving Rich Card Category & Situational Icons ──
    resolveCardIcon(item, catObj, index) {
      const sit = item.situation || '';

      // Exact Situational Recognition
      if (sit.includes('طعام') || sit.includes('أكل') || sit.includes('شرب') || sit.includes('ضيافة')) {
        return 'images/icons/food1.png';
      }
      if (sit.includes('وضوء')) {
        return 'images/icons/ablution1.png';
      }
      if (sit.includes('نوم') || sit.includes('فراش') || sit.includes('أرق')) {
        return 'images/icons/sleeping1.png';
      }
      if (sit.includes('استيقاظ') || sit.includes('أحيانا')) {
        return 'images/icons/waking-up1.png';
      }
      if (sit.includes('سفر') || sit.includes('دابة') || sit.includes('ركوب') || sit.includes('مركبة') || sit.includes('بلدة') || sit.includes('سفينة')) {
        return 'images/icons/travel1.png';
      }
      if (sit.includes('قبلة') || sit.includes('كعبة')) {
        return 'images/icons/Qibla1.png';
      }
      if (sit.includes('مسجد') || sit.includes('أذان')) {
        return 'images/icons/mosque1.png';
      }
      if (sit.includes('صلاة') || sit.includes('سجود') || sit.includes('ركوع') || sit.includes('تشهد')) {
        return 'images/icons/prayer-mat1.png';
      }
      if (sit.includes('مرض') || sit.includes('عيادة') || sit.includes('رقية') || sit.includes('وجع') || sit.includes('طبيب')) {
        return 'images/icons/Ruqayyah1.png';
      }
      if (sit.includes('موت') || sit.includes('جنازة') || sit.includes('قبر') || sit.includes('تعزية')) {
        return 'images/icons/leaf-2.png';
      }
      if (sit.includes('مطر') || sit.includes('غيث') || sit.includes('سحاب') || sit.includes('رعد') || sit.includes('ريح') || sit.includes('هلال')) {
        return index % 2 === 0 ? 'images/icons/sunset1.png' : 'images/icons/sunrise.png';
      }
      if (sit.includes('هم') || sit.includes('حزن') || sit.includes('كرب') || sit.includes('خوف') || sit.includes('عدو') || sit.includes('شيطان') || sit.includes('وسوسة') || sit.includes('دَين') || sit.includes('دين')) {
        return 'images/icons/security-shield.png';
      }
      if (sit.includes('استخارة') || sit.includes('أمر') || sit.includes('تشاور')) {
        return 'images/icons/Focus1.png';
      }
      if (sit.includes('مولود') || sit.includes('نكاح') || sit.includes('زواج') || sit.includes('عطاس') || sit.includes('معروف')) {
        return index % 2 === 0 ? 'images/icons/ideas1.png' : 'images/icons/certificate1.png';
      }

      // Dual versions fallback: alternate between icon1 and icon2
      if (index % 2 === 1 && catObj.icon2) {
        return catObj.icon2;
      }
      return catObj.icon1 || 'images/icons/book1.png';
    }

    // ── 6. Official Number Icons Badge Generator ──
    renderNumberBadge(num) {
      if (num >= 1 && num <= 9) {
        return `
          <div class="hisn-card-number-badge official-num" title="الموقف رقم ${num}">
            <img src="images/icons/number-${num}.png" alt="${num}" class="hisn-number-icon-single">
          </div>
        `;
      }

      // For 10 and above: luxury royal designed badge
      return `
        <div class="hisn-card-number-badge royal-num-badge" title="الموقف رقم ${num}">
          <span class="royal-num-prefix">موقف</span>
          <span class="royal-num-val">${num}</span>
        </div>
      `;
    }

    // ── 7. Main Cards Grid & Rendering ──
    renderList() {
      const listContainer = document.getElementById('hisnCardsContainer');
      const resultsCountEl = document.getElementById('hisnResultsCount');
      if (!listContainer) return;

      const normQuery = this.normalizeArabic(this.searchQuery);

      const filtered = this.items.filter((item) => {
        if (this.currentCategory !== 'all' && item.catId !== this.currentCategory) {
          return false;
        }

        const isMem = this.memorized.has(item.id);
        if (this.currentFilter === 'memorized' && !isMem) return false;
        if (this.currentFilter === 'unmemorized' && isMem) return false;

        if (normQuery) {
          const normSit = this.normalizeArabic(item.situation);
          const normTxt = this.normalizeArabic(item.text);
          const normSrc = this.normalizeArabic(item.source);
          const normFad = this.normalizeArabic(item.fadl);
          const normKey = item.keywords ? item.keywords.map(k => this.normalizeArabic(k)).join(' ') : '';

          const match =
            normSit.includes(normQuery) ||
            normTxt.includes(normQuery) ||
            normSrc.includes(normQuery) ||
            normFad.includes(normQuery) ||
            normKey.includes(normQuery);

          if (!match) return false;
        }

        return true;
      });

      if (resultsCountEl) {
        resultsCountEl.textContent = `${filtered.length} موقف متوفر`;
      }

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="hisn-empty-state">
            <img src="images/icons/no-results.png" alt="No results">
            <h4 class="hisn-empty-title">لا توجد نتائج مطابقة</h4>
            <p class="hisn-empty-desc">لم نجد أي موقف يطابق بحثك الحالي. جرب البحث بكلمات أبسط مثل (سفر، عطاس، ركوع، دَين، غضب).</p>
            <button class="hisn-empty-btn" onclick="window.wzkerHisn.clearSearchAndFilters()">
              <img src="images/icons/book1.png" style="width: 16px; height: 16px; object-fit: contain;" alt="الكل">
              <span>عرض كافة المواقف (132 موقفاً)</span>
            </button>
          </div>
        `;
        return;
      }

      let html = '';
      filtered.forEach((item, index) => {
        const isMem = this.memorized.has(item.id);
        const catObj = this.categories.find(c => c.id === item.catId) || {};
        const catName = catObj.name || 'مأثور';
        const colors = CATEGORY_ACCENTS[item.catId] || { accent: '#D29571', bg: 'rgba(210, 149, 113, 0.08)' };

        // Authentic situational and category icon
        const cardIcon = this.resolveCardIcon(item, catObj, index);

        // Canonical ID number (e.g. 1..132)
        const itemNum = parseInt(item.id.replace('hisn_', ''), 10) || (index + 1);
        const numberBadgeHtml = this.renderNumberBadge(itemNum);

        const displayText = this.tashkeelMode === 'simple'
          ? this.stripTashkeel(item.text)
          : item.text;

        html += `
          <article class="hisn-card ${isMem ? 'is-memorized' : ''}" 
                   id="hisn_card_${item.id}"
                   style="--card-cat-accent: ${colors.accent}; --card-cat-bg: ${colors.bg};">
            
            <!-- 1. Meta Ribbon: Category & Number on Right, Zen & Share on Left -->
            <div class="hisn-card-header">
              <div class="hisn-card-meta">
                <span class="hisn-meta-category" onclick="window.wzkerHisn.setCategory('${item.catId}')" title="تصفية بقسم ${catName}">
                  <img src="${cardIcon}" alt="${catName}">
                  <span>${catName}</span>
                </span>
                ${numberBadgeHtml}
              </div>

              <div class="hisn-card-header-actions">
                <button class="hisn-action-icon-btn" 
                        onclick="window.wzkerHisn.openZenModeOnItem('${item.id}')"
                        title="قراءة في وضع التركيز">
                  <img src="images/icons/Focus1.png" alt="تركيز">
                </button>
                <button class="hisn-action-icon-btn" 
                        onclick="window.wzkerHisn.openGiftModal('${item.id}')"
                        title="مشاركة كبطاقة اجتماعية راقية">
                  <img src="images/icons/share-picture1.png" alt="بطاقة">
                </button>
              </div>
            </div>

            <!-- 2. Situation Title with Elegant Leaf Accent -->
            <div class="hisn-card-title-row">
              <span class="hisn-title-leaf-wrap">
                <img src="images/icons/leaf-1.png" alt="•">
              </span>
              <h3 class="hisn-situation-title">${item.situation}</h3>
            </div>

            <!-- 3. Distinct Inner Sacred Frame with Colored Right Accent Border -->
            <div class="hisn-text-frame">
              <p class="hisn-card-text">
                ${displayText}
              </p>
            </div>

            <!-- 4. Source & Virtue Badges -->
            ${item.source || item.fadl ? `
              <div class="hisn-meta-badges-col">
                ${item.source ? `
                  <div class="hisn-card-source">
                    <img src="images/icons/note1.png" alt="المصدر">
                    <span><b>المصدر:</b> ${item.source}</span>
                  </div>
                ` : ''}
                ${item.fadl ? `
                  <div class="hisn-card-fadl">
                    <img src="images/icons/certificate2.png" alt="الفضل">
                    <span><b>الفضل:</b> ${item.fadl}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- 5. Royal Interactive Footer -->
            <div class="hisn-card-footer">
              <button class="hisn-memorize-toggle-btn ${isMem ? 'memorized' : ''}"
                      id="mem_btn_${item.id}"
                      onclick="window.wzkerHisn.toggleMemorized('${item.id}')"
                      title="${isMem ? 'إلغاء التحديد كمحفوظ' : 'تحديد هذا الدعاء كمحفوظ ومزامنته سحابياً'}">
                <img src="${isMem ? 'images/icons/task-done1.png' : 'images/icons/note2.png'}" alt="حفظ">
                <span>${isMem ? 'تم الحفظ بنجاح' : 'حفظته'}</span>
              </button>

              <button class="hisn-footer-tool-btn" onclick="window.wzkerHisn.copyDhikr('${item.id}')" title="نسخ الدعاء وتخريجه">
                <img src="images/icons/copy1.png" alt="نسخ">
                <span>نسخ الدعاء</span>
              </button>

              <button class="hisn-footer-tool-btn" onclick="window.wzkerHisn.openGiftModal('${item.id}')" title="مشاركة كبطاقة إهداء">
                <img src="images/icons/share.png" alt="مشاركة">
                <span>مشاركة</span>
              </button>
            </div>
          </article>
        `;
      });

      listContainer.innerHTML = html;
    }

    // ── 8. User Interaction & Memorization ──
    toggleMemorized(id) {
      const isMem = this.memorized.has(id);
      if (isMem) {
        this.memorized.delete(id);
        if (window.showToast) window.showToast('تم إلغاء تحديد الدعاء من المحفوظات');
      } else {
        this.memorized.add(id);
        if (window.showToast) window.showToast('مبارك! تم تسجيل هذا الدعاء في قائمة المحفوظات');
      }

      if (navigator.vibrate) {
        try {
          navigator.vibrate(isMem ? 20 : [30, 40, 50]);
        } catch (e) {}
      }

      this.saveMemorizedState();
      this.renderHeroAndStreak();

      if (this.currentFilter !== 'all') {
        this.renderList();
      } else {
        const card = document.getElementById(`hisn_card_${id}`);
        const btn = document.getElementById(`mem_btn_${id}`);
        const newStatus = this.memorized.has(id);

        if (card) card.classList.toggle('is-memorized', newStatus);
        if (btn) {
          btn.classList.toggle('memorized', newStatus);
          btn.innerHTML = `
            <img src="${newStatus ? 'images/icons/task-done1.png' : 'images/icons/note2.png'}" alt="حفظ">
            <span>${newStatus ? 'تم الحفظ بنجاح' : 'حفظته'}</span>
          `;
          btn.title = newStatus ? 'إلغاء التحديد كمحفوظ' : 'تحديد هذا الدعاء كمحفوظ ومزامنته سحابياً';
        }
      }
    }

    setCategory(catId) {
      this.currentCategory = catId;
      this.updateHeroForCategory(catId);
      this.renderCapsules();
      this.renderDrawer();
      this.renderList();
    }

    setFilter(filterType) {
      this.currentFilter = filterType;
      this.renderHeroAndStreak();
      this.renderList();
    }

    toggleMemorizedFilter() {
      this.currentFilter = this.currentFilter === 'memorized' ? 'all' : 'memorized';
      this.renderHeroAndStreak();
      this.renderList();
      this.scrollToCards();
    }

    onSearchInput(val) {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      const clearBtn = document.getElementById('hisnClearSearchBtn');
      if (clearBtn) {
        clearBtn.classList.toggle('visible', !!val.trim());
      }

      this.searchDebounceTimer = setTimeout(() => {
        this.searchQuery = val.trim();
        this.renderList();
      }, 75);
    }

    clearSearch() {
      const searchInp = document.getElementById('hisnSearchInput');
      const clearBtn = document.getElementById('hisnClearSearchBtn');
      if (searchInp) searchInp.value = '';
      if (clearBtn) clearBtn.classList.remove('visible');
      this.searchQuery = '';
      this.renderList();
    }

    clearSearchAndFilters() {
      this.clearSearch();
      this.currentCategory = 'all';
      this.currentFilter = 'all';
      this.updateHeroForCategory('all');
      this.renderHeroAndStreak();
      this.renderCapsules();
      this.renderDrawer();
      this.renderList();
    }

    scrollToCards() {
      const el = document.getElementById('hisnSearchBarSection');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    scrollToTop() {
      const scrollBody = document.getElementById('hisnScrollBody');
      if (scrollBody) {
        scrollBody.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // ── 9. Zen Focus Mode ──
    openZenMode(index = 0) {
      this.zenIndex = Math.max(0, Math.min(index, this.items.length - 1));
      this.renderZenCard();
      const zen = document.getElementById('hisnZenOverlay');
      if (zen) zen.classList.add('active');
    }

    openZenModeOnItem(id) {
      const idx = this.items.findIndex(i => i.id === id);
      this.openZenMode(idx >= 0 ? idx : 0);
    }

    closeZenMode() {
      const zen = document.getElementById('hisnZenOverlay');
      if (zen) zen.classList.remove('active');
    }

    nextZenDhikr() {
      if (this.zenIndex < this.items.length - 1) {
        this.zenIndex++;
        this.renderZenCard();
      }
    }

    prevZenDhikr() {
      if (this.zenIndex > 0) {
        this.zenIndex--;
        this.renderZenCard();
      }
    }

    renderZenCard() {
      const item = this.items[this.zenIndex];
      if (!item) return;

      const indicator = document.getElementById('hisnZenIndicator');
      const catTag = document.getElementById('hisnZenCategoryTag');
      const catName = document.getElementById('hisnZenCategoryName');
      const sitTitle = document.getElementById('hisnZenSituationTitle');
      const textEl = document.getElementById('hisnZenText');
      const memBtn = document.getElementById('hisnZenMemorizeBtn');

      const catObj = this.categories.find(c => c.id === item.catId) || {};
      const iconSrc = this.resolveCardIcon(item, catObj, this.zenIndex);

      if (indicator) indicator.textContent = `موقف ${this.zenIndex + 1} من ${this.items.length}`;
      if (catTag) {
        const img = catTag.querySelector('img');
        if (img) img.src = iconSrc;
      }
      if (catName) catName.textContent = catObj.name || 'مأثور';
      if (sitTitle) sitTitle.textContent = item.situation;
      if (textEl) textEl.textContent = this.tashkeelMode === 'simple' ? this.stripTashkeel(item.text) : item.text;

      const isMem = this.memorized.has(item.id);
      if (memBtn) {
        memBtn.classList.toggle('memorized', isMem);
        memBtn.innerHTML = `
          <img src="${isMem ? 'images/icons/task-done1.png' : 'images/icons/note2.png'}" style="width: 16px; height: 16px; object-fit: contain;" alt="حفظ">
          <span>${isMem ? 'حفظته' : 'لم أحفظه'}</span>
        `;
      }
    }

    toggleZenMemorized() {
      const item = this.items[this.zenIndex];
      if (item) {
        this.toggleMemorized(item.id);
        this.renderZenCard();
      }
    }

    // ── 10. Pinterest-Style Gift Social Story Card Modal ──
    openGiftModal(id) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;
      this.activeGiftItem = item;

      const catObj = this.categories.find(c => c.id === item.catId) || {};

      const catEl = document.getElementById('hisnGiftCategory');
      const sitEl = document.getElementById('hisnGiftSituation');
      const textEl = document.getElementById('hisnGiftText');
      const srcEl = document.getElementById('hisnGiftSource');
      const fadlEl = document.getElementById('hisnGiftFadl');
      const badgeEl = document.getElementById('hisnGiftMemorizedBadge');

      if (catEl) catEl.textContent = catObj.name || 'حصن المسلم';
      if (sitEl) sitEl.textContent = item.situation;
      if (textEl) textEl.textContent = item.text;
      if (srcEl) srcEl.textContent = item.source ? `المصدر: ${item.source}` : '';
      if (fadlEl) {
        fadlEl.textContent = item.fadl ? `الفضل: ${item.fadl}` : '';
        fadlEl.style.display = item.fadl ? 'block' : 'none';
      }
      if (badgeEl) {
        const isMem = this.memorized.has(item.id);
        badgeEl.textContent = isMem ? 'محفوظ في وذكر' : '';
      }

      const modal = document.getElementById('hisnGiftModal');
      if (modal) modal.classList.add('active');
    }

    closeShareModal() {
      const modal = document.getElementById('hisnGiftModal');
      if (modal) modal.classList.remove('active');
      this.activeGiftItem = null;
    }

    copyFormattedDhikrFromModal() {
      if (!this.activeGiftItem) return;
      this.copyDhikr(this.activeGiftItem.id);
    }

    shareGiftCardNow() {
      if (!this.activeGiftItem) return;
      const item = this.activeGiftItem;
      let text = `﴿ ${item.situation} ﴾\n\n${item.text}\n\n`;
      if (item.source) text += `المصدر: ${item.source}\n`;
      if (item.fadl) text += `الفضل: ${item.fadl}\n`;
      text += `\n— من مرجع حصن المسلم • تطبيق وذكر`;

      if (navigator.share) {
        navigator.share({
          title: item.situation,
          text: text
        }).catch(() => {});
      } else {
        this.copyDhikr(item.id);
      }
    }

    downloadCardImage() {
      if (!this.activeGiftItem) return;
      const item = this.activeGiftItem;
      const canvas = document.getElementById('hisnShareCanvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      // Draw background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(1, '#0F172A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gold border
      ctx.strokeStyle = '#D29571';
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(210, 149, 113, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, w - 100, h - 100);

      // Header Brand
      ctx.fillStyle = '#D29571';
      ctx.font = 'bold 36px Amiri, serif';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillText('تطبيق وذكر • مرجع حصن المسلم', w / 2, 120);

      // Situation Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Amiri, serif';
      ctx.fillText(`﴿ ${item.situation} ﴾`, w / 2, 220);

      // Sacred Text (wrapped)
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '38px Amiri, serif';
      this.wrapText(ctx, item.text, w / 2, 340, w - 200, 65);

      // Source & Fadl
      if (item.source) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '28px Cairo, sans-serif';
        ctx.fillText(item.source, w / 2, h - 180);
      }

      // Footer
      ctx.fillStyle = '#D29571';
      ctx.font = 'bold 26px Cairo, sans-serif';
      ctx.fillText('حصن المسلم من أذكار الكتاب والسنة', w / 2, h - 100);

      // Trigger download
      try {
        const link = document.createElement('a');
        link.download = `wzker-hisn-${item.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        if (window.showToast) window.showToast('تم تحميل بطاقة الدعاء كصورة عالية الجودة');
      } catch (e) {
        if (window.showToast) window.showToast('تعذر تنزيل الصورة');
      }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let curY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, curY);
          line = words[n] + ' ';
          curY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, curY);
    }

    // ── 11. Settings Modal (Typography & Tashkeel) ──
    toggleSettingsModal() {
      const modal = document.getElementById('hisnSettingsModal');
      if (modal) modal.classList.toggle('active');
    }

    setFontSize(size) {
      this.fontSize = size;
      localStorage.setItem('wzker_hisn_font_size', size);
      this.applyTypographySettings();
    }

    setTashkeelMode(mode) {
      this.tashkeelMode = mode;
      localStorage.setItem('wzker_hisn_tashkeel', mode);
      this.applyTypographySettings();
      this.renderList();
    }

    applyTypographySettings() {
      const container = document.getElementById('hisnCardsContainer');
      if (container) {
        container.classList.remove('size-standard', 'size-large', 'size-huge');
        container.classList.add(`size-${this.fontSize}`);
      }

      document.querySelectorAll('#hisnFontSizeOptions .hisn-option-pill').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-size') === this.fontSize);
      });

      document.querySelectorAll('#hisnTashkeelOptions .hisn-option-pill').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-tashkeel') === this.tashkeelMode);
      });
    }

    // ── 12. Copy to Clipboard ──
    copyDhikr(id) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;

      let clip = `﴿ ${item.situation} ﴾\n\n`;
      clip += `${item.text}\n\n`;
      if (item.source) clip += `المصدر: ${item.source}\n`;
      if (item.fadl) clip += `الفضل: ${item.fadl}\n`;
      clip += `\n— من مرجع حصن المسلم • تطبيق وذكر`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(clip).then(() => {
          if (window.showToast) window.showToast('تم نسخ الدعاء والمصدر بنجاح');
        }).catch(() => this.fallbackCopy(clip));
      } else {
        this.fallbackCopy(clip);
      }
    }

    fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        if (window.showToast) window.showToast('تم نسخ الدعاء إلى الحافظة');
      } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  if (typeof window !== 'undefined') {
    window.wzkerHisn = new WzkerHisnManager();
  }
})();
