/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL ADHKAR CONTROLLER (js/adhkar.js) - PRO EDITION
 * Dedicated Slide-Out Drawer, Pinterest Story Card & Canvas PNG Export,
 * Authentic High-Def Audio Recitation, Number Badges, Accurate Scroll,
 * Centered Ring Checkmark, Haptic Feedback & Subtle Harmonic Themes.
 * STRICT ZERO EMOJIS ADHERENCE
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerAdhkar {
    constructor() {
      this.currentCategory = 'all';
      this.searchQuery = '';
      this.progressData = {};
      this.activeShareDhikr = null;
      this.zenList = [];
      this.zenIndex = 0;
      this.currentAudio = null;
      this.currentAudioDhikrId = null;
      this.dailyTrackerKey = 'wzker_adhkar_tracker_v3';
      this.bedtimeLogKey = 'wzker_bedtime_log_v1';
      this.smartCheckInterval = null;

      // Initialize on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.loadStorage();
      this.checkDailyRollover();
      this.renderDrawer();
      this.renderCapsules();
      this.updateSmartHero();
      this.renderCards();
      this.updateGlobalProgress();
      this.bindEvents();
      this.initSmartDailyEngine();
    }

    // ── Local Storage & Continuous Daily Rollover ─────────────────
    loadStorage() {
      try {
        const raw = localStorage.getItem('wzker_adhkar_progress_v2');
        this.progressData = raw ? JSON.parse(raw) : {};
      } catch (e) {
        this.progressData = {};
      }
    }

    saveStorage() {
      try {
        localStorage.setItem('wzker_adhkar_progress_v2', JSON.stringify(this.progressData));
      } catch (e) {}
    }

    checkDailyRollover() {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem('wzker_adhkar_last_date');

      if (lastDate !== today) {
        // Daily refresh: archive yesterday and zero out all counts for the fresh day
        this.archiveDailyStats(lastDate);
        this.progressData = {};
        this.saveStorage();
        localStorage.setItem('wzker_adhkar_last_date', today);
        this.resetDailyNotificationTracker(today);

        // Update UI if already rendered
        if (document.getElementById('adhkarCardsContainer')) {
          this.renderCards();
          this.renderCapsules();
          this.updateSmartHero();
          this.updateGlobalProgress();
        }
      }
    }

    archiveDailyStats(dateStr) {
      if (!dateStr) return;
      try {
        const total = typeof WZKER_ADHKAR_DATA !== 'undefined' ? WZKER_ADHKAR_DATA.length : 0;
        let completed = 0;
        Object.values(this.progressData || {}).forEach(item => {
          if (item && item.remaining <= 0) completed++;
        });
        const historyRaw = localStorage.getItem('wzker_adhkar_daily_history') || '{}';
        const history = JSON.parse(historyRaw);
        history[dateStr] = { completed, total, timestamp: Date.now() };
        localStorage.setItem('wzker_adhkar_daily_history', JSON.stringify(history));
      } catch (e) {}
    }

    // ── Smart Daily Scheduler & Persistent Engine ─────────────────
    initSmartDailyEngine() {
      this.runSmartPeriodicChecks();

      if (this.smartCheckInterval) clearInterval(this.smartCheckInterval);
      this.smartCheckInterval = setInterval(() => {
        this.checkDailyRollover();
        this.runSmartPeriodicChecks();
      }, 45000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkDailyRollover();
          this.runSmartPeriodicChecks();
        }
      });
    }

    loadDailyTracker() {
      const today = new Date().toISOString().split('T')[0];
      try {
        const raw = localStorage.getItem(this.dailyTrackerKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.date === today) {
            return parsed;
          }
        }
      } catch (e) {}
      return this.resetDailyNotificationTracker(today);
    }

    resetDailyNotificationTracker(today) {
      const fresh = {
        date: today || new Date().toISOString().split('T')[0],
        morningCompleted: false,
        lastMorningNotifTime: 0,
        eveningCompleted: false,
        lastEveningNotifTime: 0,
        bedtimeNotifSent: false,
        prayers: {
          fajr: { count: 0, lastTime: 0 },
          dhuhr: { count: 0, lastTime: 0 },
          asr: { count: 0, lastTime: 0 },
          maghrib: { count: 0, lastTime: 0 },
          isha: { count: 0, lastTime: 0 }
        }
      };
      this.saveDailyTracker(fresh);
      return fresh;
    }

    saveDailyTracker(tracker) {
      try {
        localStorage.setItem(this.dailyTrackerKey, JSON.stringify(tracker));
      } catch (e) {}
    }

    runSmartPeriodicChecks() {
      if (typeof WZKER_ADHKAR_DATA === 'undefined') return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const tracker = this.loadDailyTracker();
      const NOTIF_INTERVAL = 35 * 60 * 1000; // 35 minutes interval

      // 1. Morning Window (5:00 AM - 11:30 AM = 300 to 690 mins)
      if (currentMinutes >= 300 && currentMinutes <= 690) {
        const morningList = WZKER_ADHKAR_DATA.filter(d => d.category === 'morning');
        const doneCount = morningList.filter(d => this.progressData[d.id] && this.progressData[d.id].remaining <= 0).length;
        const pct = morningList.length > 0 ? Math.round((doneCount / morningList.length) * 100) : 0;

        if (pct >= 100) {
          tracker.morningCompleted = true;
          this.saveDailyTracker(tracker);
        } else if (!tracker.morningCompleted) {
          const elapsed = Date.now() - (tracker.lastMorningNotifTime || 0);
          if (elapsed >= NOTIF_INTERVAL) {
            let title = 'أذكار الصباح المباركة';
            let body = '';
            if (pct === 0) {
              body = 'حان وقت أذكار الصباح، استفتح يومك بذكر الله وحفظه ونيل السكينة والمعية.';
            } else {
              title = 'متابعة أذكار الصباح';
              body = `أتممت ${pct}% من أذكار الصباح، تابع القراءة لتنال تمام الأجر وبركة اليوم كاملاً.`;
            }
            this.dispatchSpiritualNotification(title, body, 'morning');
            tracker.lastMorningNotifTime = Date.now();
            this.saveDailyTracker(tracker);
          }
        }
      }

      // 2. Evening Window (12:30 PM - 11:30 PM = 750 to 1410 mins)
      if (currentMinutes >= 750 && currentMinutes <= 1410) {
        const eveningList = WZKER_ADHKAR_DATA.filter(d => d.category === 'evening');
        const doneCount = eveningList.filter(d => this.progressData[d.id] && this.progressData[d.id].remaining <= 0).length;
        const pct = eveningList.length > 0 ? Math.round((doneCount / eveningList.length) * 100) : 0;

        if (pct >= 100) {
          tracker.eveningCompleted = true;
          this.saveDailyTracker(tracker);
        } else if (!tracker.eveningCompleted) {
          const elapsed = Date.now() - (tracker.lastEveningNotifTime || 0);
          if (elapsed >= NOTIF_INTERVAL) {
            let title = 'أذكار المساء وحفظ الليلة';
            let body = '';
            if (pct === 0) {
              body = 'أقبل المساء، اجعل لك حصناً حصيناً بأذكار المساء المأثورة عن رسول الله ﷺ.';
            } else {
              title = 'متابعة أذكار المساء';
              body = `أتممت ${pct}% من أذكار المساء، واصل القراءة لحفظ ليلتك وانشراح صدرك بالسكينة.`;
            }
            this.dispatchSpiritualNotification(title, body, 'evening');
            tracker.lastEveningNotifTime = Date.now();
            this.saveDailyTracker(tracker);
          }
        }
      }

      // 3. Post-Prayer Windows (15 mins after each prayer)
      const prayers = [
        { key: 'fajr', name: 'الفجر', min: 315 },
        { key: 'dhuhr', name: 'الظهر', min: 735 },
        { key: 'asr', name: 'العصر', min: 940 },
        { key: 'maghrib', name: 'المغرب', min: 1095 },
        { key: 'isha', name: 'العشاء', min: 1180 }
      ];

      prayers.forEach(p => {
        const diff = currentMinutes - p.min;
        if (diff >= 15 && diff <= 45) {
          const pState = tracker.prayers[p.key] || { count: 0, lastTime: 0 };
          if (pState.count < 2) {
            const timeSinceLast = Date.now() - pState.lastTime;
            if (timeSinceLast >= 10 * 60 * 1000) {
              const prayerAdhkar = WZKER_ADHKAR_DATA.filter(d => d.category === 'prayer');
              const doneCount = prayerAdhkar.filter(d => this.progressData[d.id] && this.progressData[d.id].remaining <= 0).length;
              if (doneCount < 4) {
                const title = `أذكار ما بعد صلاة ${p.name}`;
                const body = pState.count === 0
                  ? `انقضت صلاة ${p.name}، رطّب لسانك بالاستغفار والتسبيح المأثور دبر الصلاة المكتوبة.`
                  : `تذكير بذكر الله عقب الصلاة، دقائق يسيرة تثقل ميزانك وتثبت أجر الفريضة.`;
                this.dispatchSpiritualNotification(title, body, 'prayer');
                pState.count += 1;
                pState.lastTime = Date.now();
                tracker.prayers[p.key] = pState;
                this.saveDailyTracker(tracker);
              }
            }
          }
        }
      });

      // 4. Adaptive Bedtime Reminder (30 mins before typical sleep time)
      const avgBedtime = this.getAverageBedtimeMinutes();
      if (currentMinutes >= (avgBedtime - 30) && currentMinutes <= (avgBedtime + 10)) {
        if (!tracker.bedtimeNotifSent) {
          const sleepDhikrs = WZKER_ADHKAR_DATA.filter(d => d.category === 'sleep');
          const doneCount = sleepDhikrs.filter(d => this.progressData[d.id] && this.progressData[d.id].remaining <= 0).length;
          if (doneCount < 3) {
            const title = 'اقترب موعد نومك المعتاد';
            const body = 'أوشك وقت نومك، احرص على تلاوة أذكار النوم لتبيت في معية الله وحفظ ملائكته حتى تصبح.';
            this.dispatchSpiritualNotification(title, body, 'sleep');
            tracker.bedtimeNotifSent = true;
            this.saveDailyTracker(tracker);
          }
        }
      }
    }

    recordBedtimeInteraction() {
      try {
        const now = new Date();
        const hour = now.getHours();
        if (hour >= 20 || hour <= 3) {
          const raw = localStorage.getItem(this.bedtimeLogKey);
          const logs = raw ? JSON.parse(raw) : [];
          logs.push({
            hour: hour,
            minute: now.getMinutes(),
            timestamp: Date.now()
          });
          const trimmed = logs.slice(-14);
          localStorage.setItem(this.bedtimeLogKey, JSON.stringify(trimmed));
        }
      } catch (e) {}
    }

    getAverageBedtimeMinutes() {
      try {
        const raw = localStorage.getItem(this.bedtimeLogKey);
        if (raw) {
          const logs = JSON.parse(raw);
          if (logs && logs.length > 0) {
            let total = 0;
            logs.forEach(item => {
              const adjHour = item.hour < 12 ? item.hour + 24 : item.hour;
              total += adjHour * 60 + item.minute;
            });
            const avg = Math.round(total / logs.length);
            return avg % 1440;
          }
        }
      } catch (e) {}
      return 1395; // Default: 11:15 PM
    }

    dispatchSpiritualNotification(title, body, catType) {
      const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;
      const cleanTitle = (title || '').replace(EMOJI_REGEX, '').trim();
      const cleanBody = (body || '').replace(EMOJI_REGEX, '').trim();

      if (window.wzkerNotif && typeof window.wzkerNotif.items !== 'undefined') {
        const item = {
          id: 'dhikr_' + Date.now(),
          type: 'dhikr',
          title: cleanTitle,
          body: cleanBody,
          timestamp: Date.now(),
          isPinned: false,
          isRead: false
        };
        window.wzkerNotif.items.unshift(item);
        window.wzkerNotif.saveItems();
        if (typeof window.wzkerNotif.renderNotificationsList === 'function') {
          window.wzkerNotif.renderNotificationsList();
        }
        if (typeof window.wzkerNotif.playSpiritualChime === 'function') {
          window.wzkerNotif.playSpiritualChime();
        }
        if (typeof window.wzkerNotif.triggerHaptic === 'function') {
          window.wzkerNotif.triggerHaptic();
        }
        if (typeof window.wzkerNotif.showNativeNotification === 'function') {
          window.wzkerNotif.showNativeNotification(cleanTitle, cleanBody);
        }
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification(cleanTitle, {
            body: cleanBody,
            icon: 'images/icon/wzker.png',
            badge: 'images/icon/wzker.png',
            dir: 'rtl',
            lang: 'ar'
          });
        } catch (e) {}
      }

      if (window.showToast) {
        window.showToast(cleanTitle + ': ' + cleanBody);
      }
    }

    // ── Interactive Event Bindings ────────────────────────────────
    bindEvents() {
      const searchInput = document.getElementById('adhkarSearchInput');
      const clearSearchBtn = document.getElementById('adhkarClearSearchBtn');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          if (clearSearchBtn) {
            clearSearchBtn.classList.toggle('visible', this.searchQuery.length > 0);
          }
          this.renderCards();
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          this.searchQuery = '';
          clearSearchBtn.classList.remove('visible');
          this.renderCards();
        });
      }

      // Keyboard navigation in Zen mode
      document.addEventListener('keydown', (e) => {
        const zenOverlay = document.getElementById('adhkarZenOverlay');
        if (!zenOverlay || !zenOverlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
          this.closeZenMode();
        } else if (e.key === 'ArrowLeft') {
          this.nextZenDhikr();
        } else if (e.key === 'ArrowRight') {
          this.prevZenDhikr();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.handleZenTap();
        }
      });
    }

    // ── Dedicated Adhkar Slide-Out Drawer ─────────────────────────
    openDrawer() {
      const overlay = document.getElementById('adhkarDrawerOverlay');
      if (overlay) overlay.classList.add('active');
    }

    closeDrawer() {
      const overlay = document.getElementById('adhkarDrawerOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    renderDrawer() {
      const catList = document.getElementById('adhkarDrawerCategoriesList');
      const virtuesList = document.getElementById('adhkarDrawerVirtuesList');

      if (catList && typeof WZKER_ADHKAR_CATEGORIES !== 'undefined') {
        catList.innerHTML = '';
        WZKER_ADHKAR_CATEGORIES.forEach((cat) => {
          let count = 0;
          if (cat.id === 'all') {
            count = WZKER_ADHKAR_DATA.length;
          } else {
            count = WZKER_ADHKAR_DATA.filter(d => d.category === cat.id).length;
          }

          const item = document.createElement('div');
          item.className = 'adhkar-drawer-menu-item';
          item.innerHTML = `
            <div class="adhkar-drawer-item-left">
              <img src="${cat.icon1}" alt="${cat.name}">
              <div>
                <h4 class="adhkar-drawer-item-title">${cat.name}</h4>
                <small style="color: var(--text-muted); font-size: 0.75rem;">${cat.virtueSummary || ''}</small>
              </div>
            </div>
            <span class="adhkar-drawer-item-count">${count}</span>
          `;

          item.onclick = () => {
            this.selectCategory(cat.id);
            this.closeDrawer();
            const container = document.getElementById('adhkarCardsContainer');
            if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          };

          catList.appendChild(item);
        });
      }

      if (virtuesList && typeof WZKER_ADHKAR_VIRTUES_LIST !== 'undefined') {
        virtuesList.innerHTML = '';
        WZKER_ADHKAR_VIRTUES_LIST.forEach((v) => {
          const card = document.createElement('div');
          card.className = 'adhkar-virtue-card-mini';
          card.innerHTML = `
            <h5 class="adhkar-virtue-mini-title">${v.title}</h5>
            <p class="adhkar-virtue-mini-verse">${v.verse}</p>
            <p class="adhkar-virtue-mini-hadith">«${v.hadith}»</p>
            <small style="color: var(--text-muted); font-style: italic;">المصدر: ${v.source}</small>
          `;
          virtuesList.appendChild(card);
        });
      }
    }

    // ── Smart Time-Aware Hero Card with Precise Smooth Scroll ─────
    updateSmartHero() {
      const hour = new Date().getHours();
      const heroBadge = document.getElementById('adhkarHeroBadge');
      const heroTitle = document.getElementById('adhkarHeroTitle');
      const heroDesc = document.getElementById('adhkarHeroDesc');
      const heroImg = document.getElementById('adhkarHeroImg');
      const heroSubArt = document.getElementById('adhkarHeroSubArt');
      const heroWatermarkImg = document.getElementById('adhkarHeroWatermarkImg');
      const heroBtn = document.getElementById('adhkarHeroBtn');

      if (!heroTitle || !heroDesc || !heroImg) return;

      let categoryTarget = 'morning';
      let title = 'أذكار الصباح المباركة';
      let desc = 'ابدأ يومك بانشراح الصدر ونيل معية الله وحفظه ورعايته التامة.';
      let badge = 'الورد الصباحي المستحب الآن';
      let icon1 = 'images/icons/sunrise.png';
      let icon2 = 'images/icons/sunrise2.png';
      let btnLabel = 'قراءة أذكار الصباح';

      if (hour >= 4 && hour < 12) {
        categoryTarget = 'morning';
        title = 'أذكار الصباح المباركة';
        desc = 'ابدأ يومك بانشراح الصدر ونيل معية الله وحفظه ورعايته التامة.';
        badge = 'الورد الصباحي المستحب الآن';
        icon1 = 'images/icons/sunrise.png';
        icon2 = 'images/icons/sunrise2.png';
        btnLabel = 'قراءة أذكار الصباح';
      } else if (hour >= 12 && hour < 17) {
        categoryTarget = 'evening';
        title = 'أذكار المساء وحصن المسلم';
        desc = 'حصن نفسك وأهلك عند إقبال الليل بالأدعية المأثورة عن رسول الله.';
        badge = 'الورد المسائي المستحب الآن';
        icon1 = 'images/icons/night-moon1.png';
        icon2 = 'images/icons/night-moon2.png';
        btnLabel = 'قراءة أذكار المساء';
      } else if (hour >= 17 && hour < 21) {
        categoryTarget = 'prayer';
        title = 'أذكار ما بعد الصلاة والمسجد';
        desc = 'أعظم القربات التسبيح والاستغفار دبر كل صلاة مكتوبة لنيل المغفرة.';
        badge = 'ورد الصلوات المكتوبة';
        icon1 = 'images/icons/prayer-mat1.png';
        icon2 = 'images/icons/prayer4.png';
        btnLabel = 'قراءة أذكار الصلاة';
      } else {
        categoryTarget = 'sleep';
        title = 'أذكار النوم والسكينة';
        desc = 'سلم روحك إلى خالقها ونم على طهارة وفطرة وسكينة تامة في حفظ الرحمن.';
        badge = 'ورد السكينة والنوم';
        icon1 = 'images/icons/sleeping1.png';
        icon2 = 'images/icons/sleeping2.png';
        btnLabel = 'قراءة أذكار النوم';
      }

      if (heroBadge) heroBadge.textContent = badge;
      heroTitle.textContent = title;
      heroDesc.textContent = desc;
      heroImg.src = icon1;
      heroImg.alt = title;

      if (heroSubArt) heroSubArt.src = icon2;
      if (heroWatermarkImg) heroWatermarkImg.src = icon2;

      if (heroBtn) {
        heroBtn.innerHTML = `<span>${btnLabel}</span><i class="fa-solid fa-arrow-left"></i>`;
        heroBtn.onclick = () => {
          this.selectCategory(categoryTarget);
          setTimeout(() => {
            const firstCard = document.querySelector('.adhkar-card');
            const scrollBody = document.getElementById('adhkarScrollBody');
            if (firstCard && scrollBody) {
              const rect = firstCard.getBoundingClientRect();
              const bodyRect = scrollBody.getBoundingClientRect();
              const offsetTop = rect.top - bodyRect.top + scrollBody.scrollTop - 20;

              scrollBody.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
              });

              // Subtle highlight pulse on target card
              firstCard.style.boxShadow = '0 0 0 3px var(--accent)';
              setTimeout(() => {
                firstCard.style.boxShadow = '';
              }, 1200);
            }
          }, 120);
        };
      }
    }

    // ── Horizontal Category Capsules with Gentle Drift ───────────
    renderCapsules() {
      const container = document.getElementById('adhkarCapsulesScroll');
      if (!container || typeof WZKER_ADHKAR_CATEGORIES === 'undefined') return;

      container.innerHTML = '';
      WZKER_ADHKAR_CATEGORIES.forEach((cat) => {
        const item = document.createElement('div');
        item.className = `adhkar-capsule-item ${cat.id === this.currentCategory ? 'active' : ''}`;
        item.setAttribute('data-cat-id', cat.id);

        let count = 0;
        if (cat.id === 'all') {
          count = WZKER_ADHKAR_DATA.length;
        } else {
          count = WZKER_ADHKAR_DATA.filter(d => d.category === cat.id).length;
        }

        item.innerHTML = `
          <img src="${cat.icon1}" alt="${cat.name}">
          <span>${cat.name}</span>
          <span class="capsule-badge">${count}</span>
        `;

        item.addEventListener('click', () => {
          this.selectCategory(cat.id);
        });

        container.appendChild(item);
      });
    }

    selectCategory(catId) {
      this.currentCategory = catId;
      const allCapsules = document.querySelectorAll('.adhkar-capsule-item');
      allCapsules.forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-cat-id') === catId);
      });
      this.renderCards();
    }

    // ── Arabic Fuzzy Match for Smart Search ──────────────────────
    normalizeArabic(str) {
      if (!str) return '';
      return str
        .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel
        .replace(/[إأآا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .toLowerCase();
    }

    // ── Number Icons Helper ──────────────────────────────────────
    getNumberIcon(count) {
      if (count === 1) return 'images/icons/number-1.png';
      if (count === 2) return 'images/icons/number-2.png';
      if (count === 3) return 'images/icons/number-3.png';
      if (count === 4) return 'images/icons/number-4.png';
      if (count === 7) return 'images/icons/number-7.png';
      if (count === 10) return 'images/icons/number-10.png';
      if (count === 33) return 'images/icons/number-3.png';
      if (count === 100) return 'images/icons/number-100.png';
      return 'images/icons/number-1.png';
    }

    // ── Render Adhkar Cards with Subtle Category Accents ──────────
    renderCards() {
      const container = document.getElementById('adhkarCardsContainer');
      if (!container || typeof WZKER_ADHKAR_DATA === 'undefined') return;

      const normQuery = this.normalizeArabic(this.searchQuery);

      const filtered = WZKER_ADHKAR_DATA.filter((d) => {
        if (this.currentCategory !== 'all' && d.category !== this.currentCategory) {
          return false;
        }
        if (normQuery) {
          const normText = this.normalizeArabic(d.text);
          const normFadl = this.normalizeArabic(d.fadl);
          const normSource = this.normalizeArabic(d.source);
          const normCat = this.normalizeArabic(d.categoryName);
          return normText.includes(normQuery) || normFadl.includes(normQuery) || normSource.includes(normQuery) || normCat.includes(normQuery);
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; background: var(--card-bg); border-radius: 24px; border: 1px dashed var(--card-border);">
            <img src="images/icons/no-results.png" style="width: 54px; height: 54px; opacity: 0.85; margin-bottom: 12px;" alt="No Results">
            <h4 style="color: var(--text-main); margin: 0 0 6px 0; font-size: 1.15rem; font-weight: 800;">لم نجد أذكاراً مطابقة</h4>
            <p style="color: var(--text-muted); margin: 0; font-size: 0.88rem;">جرب البحث بكلمة أخرى أو تصفح بقية أقسام الأذكار</p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      filtered.forEach((dhikr) => {
        const card = this.buildCardElement(dhikr);
        container.appendChild(card);
      });
    }

    buildCardElement(dhikr) {
      const state = this.progressData[dhikr.id] || { remaining: dhikr.count, completed: false };
      const isCompleted = state.remaining <= 0;

      // Calculate SVG stroke offset: circumference = 2 * PI * 20 ~= 125.6
      const circ = 125.6;
      const offset = circ - (circ * (dhikr.count - state.remaining)) / dhikr.count;

      const card = document.createElement('div');
      card.className = `adhkar-card ${isCompleted ? 'is-completed' : ''}`;
      card.id = `dhikrCard_${dhikr.id}`;

      // Subtle category styling
      const catMeta = WZKER_ADHKAR_CATEGORIES.find(c => c.id === dhikr.category);
      if (catMeta) {
        card.style.setProperty('--card-cat-accent', catMeta.accentColor);
        card.style.setProperty('--card-cat-bg', catMeta.bgSubtle);
      }

      let targetText = `${dhikr.count} مرة`;
      if (dhikr.count === 1) targetText = 'مرة واحدة';
      else if (dhikr.count === 2) targetText = 'مرتان';
      else if (dhikr.count >= 3 && dhikr.count <= 10) targetText = `${dhikr.count} مرات`;

      const numIcon = this.getNumberIcon(dhikr.count);

      card.innerHTML = `
        <!-- Card Header -->
        <div class="adhkar-card-header">
          <div class="adhkar-card-meta">
            <span class="adhkar-meta-category">
              <img src="${dhikr.icon1}" alt="${dhikr.categoryName}">
              <span>${dhikr.categoryName}</span>
            </span>
            <span class="adhkar-meta-number-badge">
              <img src="${numIcon}" alt="Count">
              <span>${targetText}</span>
            </span>
          </div>
          <div class="adhkar-card-header-actions">
            <!-- 1. Real Audio Recitation -->
            <button class="adhkar-action-icon-btn ${this.currentAudioDhikrId === dhikr.id ? 'is-playing' : ''}" 
                    id="audioBtn_${dhikr.id}" 
                    title="الاستماع للتلاوة الصوتية المباركة" 
                    onclick="window.wzkerAdhkar.toggleAudio('${dhikr.id}')">
              <img src="images/icons/sound.png" alt="صوت">
            </button>
            <!-- 2. Formatted WhatsApp Copy -->
            <button class="adhkar-action-icon-btn" 
                    title="نسخ منسق للمشاركة" 
                    onclick="window.wzkerAdhkar.copyFormattedDhikr('${dhikr.id}')">
              <img src="images/icons/copy1.png" alt="نسخ">
            </button>
            <!-- 3. Pinterest-Style Story Card -->
            <button class="adhkar-action-icon-btn" 
                    title="بطاقة إهداء فاخرة للمشاركة" 
                    onclick="window.wzkerAdhkar.openShareModal('${dhikr.id}')">
              <img src="images/icons/share-picture1.png" alt="مشاركة">
            </button>
            <!-- 4. Hadith Virtue Accordion Trigger -->
            <button class="adhkar-action-icon-btn" 
                    title="فضل وثواب الذكر" 
                    onclick="window.wzkerAdhkar.toggleVirtue('${dhikr.id}')">
              <img src="images/icons/certificate1.png" alt="الفضل">
            </button>
          </div>
        </div>

        <!-- Inner Text Frame for Typography & Hadith Source -->
        <div class="adhkar-text-frame" onclick="window.wzkerAdhkar.handleCardTap('${dhikr.id}')">
          <p class="adhkar-card-text">${dhikr.text}</p>
          <!-- Permanent Visible Hadith Source Line Below Text -->
          <div class="adhkar-source-badge">
            <img src="images/icons/certificate2.png" alt="سند">
            <span>المصدر: ${dhikr.source}</span>
          </div>
        </div>

        <!-- Hidden Accordion Drawer for Virtue Only -->
        <div class="adhkar-virtue-drawer" id="virtueDrawer_${dhikr.id}">
          <div class="adhkar-virtue-head">
            <img src="images/icons/certificate1.png" alt="فضل الذكر">
            <span>فضل وثواب هذا الذكر الشريف:</span>
          </div>
          <p class="adhkar-virtue-content">${dhikr.fadl}</p>
        </div>

        <!-- Tap Zone with Centered Circle -->
        <div class="adhkar-tap-zone" onclick="window.wzkerAdhkar.handleCardTap('${dhikr.id}')">
          <div class="adhkar-tap-zone-left">
            <div class="adhkar-tap-instruction">
              <span class="adhkar-tap-instruction-main">${isCompleted ? 'تم إتمام هذا الذكر المبارك' : 'المس هنا للتسبيح'}</span>
              <span class="adhkar-tap-instruction-sub">${isCompleted ? 'تقبل الله طاعتك وذكرك' : `المتبقي: ${state.remaining} من ${dhikr.count}`}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;" onclick="event.stopPropagation()">
            <!-- Reset Button -->
            <button class="adhkar-reset-btn" title="إعادة تصفير الذكر" onclick="window.wzkerAdhkar.resetDhikr('${dhikr.id}')">
              <img src="images/icons/Repeat.png" alt="إعادة">
            </button>
            <!-- Circular Progress with Centered Element -->
            <div class="adhkar-counter-ring-wrap" onclick="window.wzkerAdhkar.handleCardTap('${dhikr.id}')">
              <svg class="adhkar-svg-ring" viewBox="0 0 48 48">
                <circle class="adhkar-ring-bg" cx="24" cy="24" r="20" />
                <circle class="adhkar-ring-progress" id="ring_${dhikr.id}" cx="24" cy="24" r="20"
                  style="stroke-dashoffset: ${offset};" />
              </svg>
              <!-- Center Number -->
              <span class="adhkar-counter-number" id="counterNum_${dhikr.id}">${state.remaining}</span>
              <!-- Center Checkmark replacing the number when completed (100% Centered) -->
              <img src="images/icons/task-done1.png" class="adhkar-done-icon" id="doneIcon_${dhikr.id}" alt="تم">
            </div>
          </div>
        </div>
      `;

      return card;
    }

    // ── Tap & Decrement Logic ────────────────────────────────────
    handleCardTap(dhikrId) {
      const dhikr = WZKER_ADHKAR_DATA.find(d => d.id === dhikrId);
      if (!dhikr) return;

      if (!this.progressData[dhikrId]) {
        this.progressData[dhikrId] = { remaining: dhikr.count, completed: false };
      }

      const state = this.progressData[dhikrId];

      if (state.remaining > 0) {
        state.remaining -= 1;
        this.vibrate(25);

        if (state.remaining === 0) {
          state.completed = true;
          this.vibrate([40, 60, 40]);
          if (window.showToast) {
            window.showToast('تم إتمام الذكر، تقبل الله منك');
          }
        }

        if (dhikr.category === 'sleep') {
          this.recordBedtimeInteraction();
        }

        this.saveStorage();
        this.updateCardUi(dhikrId, dhikr, state);
        this.updateGlobalProgress();
      }
    }

    updateCardUi(dhikrId, dhikr, state) {
      const card = document.getElementById(`dhikrCard_${dhikrId}`);
      if (!card) return;

      const isCompleted = state.remaining <= 0;
      card.classList.toggle('is-completed', isCompleted);

      const numEl = document.getElementById(`counterNum_${dhikrId}`);
      if (numEl) numEl.textContent = state.remaining;

      const ring = document.getElementById(`ring_${dhikrId}`);
      if (ring) {
        const circ = 125.6;
        const offset = circ - (circ * (dhikr.count - state.remaining)) / dhikr.count;
        ring.style.strokeDashoffset = offset;
      }

      const subText = card.querySelector('.adhkar-tap-instruction-sub');
      const mainText = card.querySelector('.adhkar-tap-instruction-main');
      if (subText && mainText) {
        mainText.textContent = isCompleted ? 'تم إتمام هذا الذكر المبارك' : 'المس هنا للتسبيح';
        subText.textContent = isCompleted ? 'تقبل الله طاعتك وذكرك' : `المتبقي: ${state.remaining} من ${dhikr.count}`;
      }
    }

    resetDhikr(dhikrId) {
      const dhikr = WZKER_ADHKAR_DATA.find(d => d.id === dhikrId);
      if (!dhikr) return;

      this.progressData[dhikrId] = { remaining: dhikr.count, completed: false };
      this.saveStorage();
      this.updateCardUi(dhikrId, dhikr, this.progressData[dhikrId]);
      this.updateGlobalProgress();
      this.vibrate(20);
    }

    vibrate(pattern) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {}
      }
    }

    // ── Global Progress & Streak Calculation ─────────────────────
    updateGlobalProgress() {
      const total = WZKER_ADHKAR_DATA.length;
      let completedCount = 0;

      WZKER_ADHKAR_DATA.forEach((d) => {
        const st = this.progressData[d.id];
        if (st && st.remaining <= 0) {
          completedCount += 1;
        }
      });

      const badge = document.getElementById('adhkarNavProgressBadge');
      if (badge) {
        badge.innerHTML = `
          <img src="images/icons/streak.png" alt="Streak">
          <span>${completedCount} / ${total}</span>
        `;
      }
    }

    // ── Virtue Accordion Drawer ──────────────────────────────────
    toggleVirtue(dhikrId) {
      const drawer = document.getElementById(`virtueDrawer_${dhikrId}`);
      if (!drawer) return;
      drawer.classList.toggle('open');
    }

    // ── Authentic Reciter Audio Playback ──────────────────────────
    toggleAudio(dhikrId) {
      const dhikr = WZKER_ADHKAR_DATA.find(d => d.id === dhikrId);
      if (!dhikr) return;

      // If already playing this dhikr, pause it
      if (this.currentAudio && this.currentAudioDhikrId === dhikrId) {
        this.currentAudio.pause();
        this.clearAudioState();
        if (window.showToast) window.showToast('تم إيقاف التلاوة');
        return;
      }

      // Stop previous audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.clearAudioState();
      }

      const audioUrl = dhikr.audio;
      if (!audioUrl) {
        if (window.showToast) window.showToast('التلاوة الصوتية قيد التجهيز لهذا الذكر');
        return;
      }

      this.currentAudio = new Audio(audioUrl);
      this.currentAudioDhikrId = dhikrId;

      const btn = document.getElementById(`audioBtn_${dhikrId}`);
      if (btn) btn.classList.add('is-playing');

      if (window.showToast) window.showToast('جاري الاستماع للتلاوة الصوتية المباركة');

      this.currentAudio.play().catch(() => {
        this.clearAudioState();
        if (window.showToast) window.showToast('تعذر تشغيل الصوت، تأكد من اتصال الإنترنت');
      });

      this.currentAudio.onended = () => {
        this.clearAudioState();
      };

      this.currentAudio.onerror = () => {
        this.clearAudioState();
      };
    }

    clearAudioState() {
      if (this.currentAudioDhikrId) {
        const btn = document.getElementById(`audioBtn_${this.currentAudioDhikrId}`);
        if (btn) btn.classList.remove('is-playing');
      }
      this.currentAudio = null;
      this.currentAudioDhikrId = null;
    }

    // ── Formatted WhatsApp / Social Text Copy ────────────────────
    copyFormattedDhikr(dhikrId) {
      const dhikr = WZKER_ADHKAR_DATA.find(d => d.id === dhikrId);
      if (!dhikr) return;

      const formatted = `[${dhikr.categoryName}] [تكرار : ${dhikr.count}]\n\n${dhikr.text}\n\nالمصدر: ${dhikr.source}\nالفضل: ${dhikr.fadl}\n\n( وذكر | Wzker )`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formatted).then(() => {
          if (window.showToast) window.showToast('تم نسخ الذكر بتنسيق المشاركة المنظم');
        }).catch(() => {
          this.fallbackCopy(formatted);
        });
      } else {
        this.fallbackCopy(formatted);
      }
    }

    fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (window.showToast) window.showToast('تم نسخ الذكر بتنسيق المشاركة المنظم');
    }

    // ── Pinterest-Style Social Media Story Card Modal ─────────────
    openShareModal(dhikrId) {
      const dhikr = WZKER_ADHKAR_DATA.find(d => d.id === dhikrId);
      if (!dhikr) return;

      this.activeShareDhikr = dhikr;
      const modal = document.getElementById('adhkarGiftModal');
      const textEl = document.getElementById('adhkarGiftText');
      const catEl = document.getElementById('adhkarGiftCategory');
      const sourceEl = document.getElementById('adhkarGiftSource');
      const fadlEl = document.getElementById('adhkarGiftFadl');
      const countEl = document.getElementById('adhkarGiftCountBadge');

      if (textEl) textEl.textContent = dhikr.text;
      if (catEl) catEl.textContent = dhikr.categoryName;
      if (sourceEl) sourceEl.textContent = `المصدر: ${dhikr.source}`;
      if (fadlEl) fadlEl.textContent = dhikr.fadl ? `الفضل: ${dhikr.fadl}` : '';
      if (countEl) countEl.textContent = `التكرار: ${dhikr.count} مرة`;

      if (modal) modal.classList.add('active');
    }

    closeShareModal() {
      const modal = document.getElementById('adhkarGiftModal');
      if (modal) modal.classList.remove('active');
    }

    copyFormattedDhikrFromModal() {
      if (this.activeShareDhikr) {
        this.copyFormattedDhikr(this.activeShareDhikr.id);
      }
    }

    shareGiftCardNow() {
      if (!this.activeShareDhikr) return;
      const d = this.activeShareDhikr;
      const text = `[${d.categoryName}] [تكرار : ${d.count}]\n\n${d.text}\n\nالمصدر: ${d.source}\n${d.fadl ? 'الفضل: ' + d.fadl + '\n\n' : ''}( وذكر | Wzker )`;

      if (navigator.share) {
        navigator.share({
          title: `ذكر مبارك - ${d.categoryName}`,
          text: text,
          url: window.location.href
        }).catch(() => {});
      } else {
        this.copyFormattedDhikr(d.id);
      }
      this.closeShareModal();
    }

    // ── HTML5 Canvas Image Generator & PNG Export ─────────────────
    downloadCardImage() {
      const dhikr = this.activeShareDhikr;
      if (!dhikr) return;

      const canvas = document.getElementById('adhkarShareCanvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = 1080;
      const height = 1350;

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1c1613');
      grad.addColorStop(0.5, '#120f0d');
      grad.addColorStop(1, '#241a15');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Royal Golden Borders & Frames
      ctx.strokeStyle = '#D29571';
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = 'rgba(210, 149, 113, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, width - 110, height - 110);

      // 3. Corner Ornaments
      ctx.fillStyle = '#D29571';
      ctx.font = '36px "Amiri", serif';
      ctx.textAlign = 'center';
      ctx.fillText('۞', 70, 85);
      ctx.fillText('۞', width - 70, 85);
      ctx.fillText('۞', 70, height - 65);
      ctx.fillText('۞', width - 70, height - 65);

      // 4. Header Category Tag
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillStyle = '#E5B498';
      ctx.fillText(`۞ ${dhikr.categoryName} • تكرار: ${dhikr.count} مرة ۞`, width / 2, 160);

      // 5. Quranic / Hadith Text Body with Wrapping
      ctx.font = '46px "Amiri", serif';
      ctx.fillStyle = '#FFFDFB';
      ctx.textAlign = 'center';

      const maxTextWidth = 900;
      const lineHeight = 75;
      const words = dhikr.text.split(' ');
      let line = '';
      let y = 300;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxTextWidth && n > 0) {
          ctx.fillText(line, width / 2, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);

      // 6. Hadith Source
      y += 90;
      ctx.font = 'italic 30px "Cairo", sans-serif';
      ctx.fillStyle = '#D29571';
      ctx.fillText(`المصدر: ${dhikr.source}`, width / 2, y);

      // 7. Virtue Note
      if (dhikr.fadl) {
        y += 65;
        ctx.font = '28px "Cairo", sans-serif';
        ctx.fillStyle = 'rgba(255, 253, 251, 0.75)';
        const fadlWords = (`الفضل: ${dhikr.fadl}`).split(' ');
        let fLine = '';
        for (let i = 0; i < fadlWords.length; i++) {
          const tLine = fLine + fadlWords[i] + ' ';
          if (ctx.measureText(tLine).width > maxTextWidth && i > 0) {
            ctx.fillText(fLine, width / 2, y);
            fLine = fadlWords[i] + ' ';
            y += 45;
          } else {
            fLine = tLine;
          }
        }
        ctx.fillText(fLine, width / 2, y);
      }

      // 8. Signature & Brand Footer
      ctx.strokeStyle = 'rgba(210, 149, 113, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, height - 140);
      ctx.lineTo(width - 100, height - 140);
      ctx.stroke();

      ctx.font = 'bold 32px "Cairo", sans-serif';
      ctx.fillStyle = '#D29571';
      ctx.fillText('تطبيق وذكر للقرآن الكريم والأذكار | Wzker', width / 2, height - 90);

      // 9. Export & Download Trigger
      try {
        const link = document.createElement('a');
        link.download = `wzker_${dhikr.id}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (window.showToast) window.showToast('تم تحميل بطاقة الذكر كصورة عالية الجودة');
      } catch (e) {
        if (window.showToast) window.showToast('تم حفظ الصورة بنجاح');
      }
    }

    // ── Zen Focus Full-Screen Mode ───────────────────────────────
    openZenMode(catId = null) {
      const targetCat = catId || this.currentCategory;
      if (targetCat === 'all') {
        this.zenList = [...WZKER_ADHKAR_DATA];
      } else {
        this.zenList = WZKER_ADHKAR_DATA.filter(d => d.category === targetCat);
      }

      if (this.zenList.length === 0) {
        this.zenList = [...WZKER_ADHKAR_DATA];
      }

      this.zenIndex = 0;
      const overlay = document.getElementById('adhkarZenOverlay');
      if (overlay) {
        overlay.classList.add('active');
        this.renderZenItem();
      }
    }

    closeZenMode() {
      const overlay = document.getElementById('adhkarZenOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        this.renderCards();
        this.updateGlobalProgress();
      }
    }

    renderZenItem() {
      if (this.zenIndex < 0) this.zenIndex = 0;
      if (this.zenIndex >= this.zenList.length) this.zenIndex = this.zenList.length - 1;

      const dhikr = this.zenList[this.zenIndex];
      if (!dhikr) return;

      const state = this.progressData[dhikr.id] || { remaining: dhikr.count, completed: false };
      const isCompleted = state.remaining <= 0;

      const indicator = document.getElementById('adhkarZenIndicator');
      const catTag = document.getElementById('adhkarZenCategoryTag');
      const textEl = document.getElementById('adhkarZenText');
      const counterBtn = document.getElementById('adhkarZenCounterBtn');
      const counterNum = document.getElementById('adhkarZenCounterNum');
      const counterLabel = document.getElementById('adhkarZenCounterLabel');

      if (indicator) indicator.textContent = `ذكر ${this.zenIndex + 1} من ${this.zenList.length}`;
      if (catTag) {
        catTag.innerHTML = `<img src="${dhikr.icon1}" alt="${dhikr.categoryName}"><span>${dhikr.categoryName}</span>`;
      }
      if (textEl) textEl.textContent = dhikr.text;

      if (counterBtn) {
        counterBtn.classList.toggle('completed', isCompleted);
      }
      if (counterNum) {
        counterNum.textContent = isCompleted ? 'تم' : state.remaining;
      }
      if (counterLabel) {
        counterLabel.textContent = isCompleted ? 'تقبل الله طاعتك' : `الهدف: ${dhikr.count}`;
      }
    }

    handleZenTap() {
      const dhikr = this.zenList[this.zenIndex];
      if (!dhikr) return;

      this.handleCardTap(dhikr.id);
      this.renderZenItem();
    }

    nextZenDhikr() {
      if (this.zenIndex < this.zenList.length - 1) {
        this.zenIndex += 1;
        this.renderZenItem();
        this.vibrate(15);
      } else {
        if (window.showToast) window.showToast('وصلت إلى نهاية هذا الورد المبارك');
      }
    }

    prevZenDhikr() {
      if (this.zenIndex > 0) {
        this.zenIndex -= 1;
        this.renderZenItem();
        this.vibrate(15);
      }
    }
  }

  window.wzkerAdhkar = new WzkerAdhkar();
})();
