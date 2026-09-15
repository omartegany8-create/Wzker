/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER - ISLAMIC ETIQUETTE & SUNAN CONTROLLER (js/etiquette.js)
 * Master Controller: Real-Time 24h Sunnah Radar, Timeline Compass,
 * Gamified Sunnah Rank, Audio Du'a Engine, Interactive Checklist
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerEtiquetteManager {
    constructor() {
      this.categories = window.WZKER_ETIQUETTE_CATEGORIES || [];
      this.items = window.WZKER_ETIQUETTE_DATA || [];
      this.activeCategory = 'all';
      this.searchQuery = '';

      this.todayKey = this.getTodayDateKey();
      this.favorites = this.loadState('wzker_etq_favs');
      this.practicedToday = this.loadState(`wzker_etq_practiced_${this.todayKey}`);
      this.checkedSteps = this.loadState(`wzker_etq_steps_${this.todayKey}`);
      this.streak = this.loadStreak();

      this.speechSynth = window.speechSynthesis;
      this.currentUtterance = null;

      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      this.renderRadarStrip();
      this.renderTimelineCompass();
      this.renderGoldenSunnah();
      this.renderSunnahRank();
      this.renderFilterPills();
      this.renderCards();
      this.bindSearchEvents();
    }

    onOpen() {
      const currentToday = this.getTodayDateKey();
      if (currentToday !== this.todayKey) {
        this.todayKey = currentToday;
        this.practicedToday = this.loadState(`wzker_etq_practiced_${this.todayKey}`);
        this.checkedSteps = this.loadState(`wzker_etq_steps_${this.todayKey}`);
      }

      this.renderRadarStrip();
      this.renderGoldenSunnah();
      this.renderSunnahRank();
      this.renderCards();
    }

    // ── LocalStorage State Helpers ──
    getTodayDateKey() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    loadState(key) {
      try {
        const raw = localStorage.getItem(key);
        return new Set(raw ? JSON.parse(raw) : []);
      } catch (e) {
        return new Set();
      }
    }

    saveState(key, setObj) {
      try {
        localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }
    }

    loadStreak() {
      try {
        const raw = localStorage.getItem('wzker_etq_streak');
        const lastDate = localStorage.getItem('wzker_etq_streak_date');
        const today = this.getTodayDateKey();

        if (!raw) return 0;
        const val = parseInt(raw, 10) || 0;

        if (lastDate) {
          const diffDays = Math.round((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) return 0;
        }
        return val;
      } catch (e) {
        return 0;
      }
    }

    updateStreakOnPractice() {
      const today = this.getTodayDateKey();
      const lastDate = localStorage.getItem('wzker_etq_streak_date');

      if (lastDate !== today) {
        this.streak = (this.streak || 0) + 1;
        localStorage.setItem('wzker_etq_streak', this.streak.toString());
        localStorage.setItem('wzker_etq_streak_date', today);
      }
    }

    // ── 1. Real-Time Sunnah Radar Strip ──
    getCurrentTimePeriodInfo() {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 8) {
        return { name: "سُنن الفجر والصباح والبكور", catId: "morning", icon: "images/icons/waking-up1.png" };
      } else if (hour >= 8 && hour < 12) {
        return { name: "سُنن الضحى والسعي في طلب الرزق", catId: "revived", icon: "images/icons/sunrise.png" };
      } else if (hour >= 12 && hour < 15) {
        return { name: "سُنن الظهيرة وآداب المائدة الطيبة", catId: "food", icon: "images/icons/food1.png" };
      } else if (hour >= 15 && hour < 18) {
        return { name: "سُنن العصر والمجالس وطيب الكلام", catId: "speech", icon: "images/icons/Focus1.png" };
      } else if (hour >= 18 && hour < 21) {
        return { name: "سُنن المغرب والمساء وإيواء الأهل", catId: "home", icon: "images/icons/home.png" };
      } else {
        return { name: "سُنن العشاء والوتر والنوم الطاهر", catId: "night", icon: "images/icons/night-moon1.png" };
      }
    }

    renderRadarStrip() {
      const container = document.getElementById('etqRadarStrip');
      if (!container) return;

      const info = this.getCurrentTimePeriodInfo();

      container.innerHTML = `
        <div class="etq-radar-info">
          <span class="etq-radar-dot"></span>
          <img src="${info.icon}" style="width: 20px; height: 20px; object-fit: contain;" alt="Period">
          <span>هدي النبي ﷺ في هذا الوقت: <strong>${info.name}</strong></span>
        </div>
        <button type="button" class="etq-radar-jump-btn" onclick="window.wzkerEtiquette.setCategory('${info.catId}')">
          <i class="fa-solid fa-arrow-down"></i>
          <span>استعراض سنن الوقت</span>
        </button>
      `;
    }

    // ── 2. The 24-Hour Prophetic Timeline Compass ──
    renderTimelineCompass() {
      const container = document.getElementById('etqTimelineCompass');
      if (!container) return;

      const stations = [
        { id: "morning", title: "الفجر والبكور", sub: "الاستيقاظ والورد", icon: "images/icons/waking-up1.png" },
        { id: "revived", title: "الضحى والكنوز", sub: "الضحى والسنن", icon: "images/icons/sunrise.png" },
        { id: "food", title: "المائدة والبركة", sub: "الطعام والشراب", icon: "images/icons/food1.png" },
        { id: "mosque", title: "المسجد والصلاة", sub: "السكينة والوقار", icon: "images/icons/mosque1.png" },
        { id: "speech", title: "اللسان والمجالس", sub: "السلام وكفارة اللغو", icon: "images/icons/Focus1.png" },
        { id: "home", title: "البيت والأسرة", sub: "البر والاستئذان", icon: "images/icons/home.png" },
        { id: "people", title: "الأخوة والتعامل", sub: "الهدية وعيادة المريض", icon: "images/icons/certificate1.png" },
        { id: "night", title: "الليل والمنام", sub: "الوتر وطهارة النوم", icon: "images/icons/night-moon1.png" }
      ];

      container.innerHTML = stations.map(s => {
        const isActive = this.activeCategory === s.id;
        return `
          <div class="etq-compass-card ${isActive ? 'active' : ''}" onclick="window.wzkerEtiquette.setCategory('${s.id}')">
            <div class="etq-compass-medallion">
              <img src="${s.icon}" alt="${s.title}">
            </div>
            <h4 class="etq-compass-title">${s.title}</h4>
            <span class="etq-compass-sub">${s.sub}</span>
          </div>
        `;
      }).join('');
    }

    // ── 3. Gamified Sunnah Rank & Habit Tracker ──
    getSunnahRank(count) {
      if (count >= 12) {
        return { title: "تاج محيي السنن النبوية", badge: "إنجاز استثنائي مبارك", icon: "images/icons/certificate2.png" };
      } else if (count >= 8) {
        return { title: "حريصٌ على هدي الحبيب ﷺ", badge: "مرتبة الصالحين الأوابين", icon: "images/icons/certificate1.png" };
      } else if (count >= 4) {
        return { title: "مقتدٍ بالسنن النبوية", badge: "خطوات مباركة في الإحياء", icon: "images/icons/leaf-3.png" };
      } else {
        return { title: "مبتدئٌ في إحياء السنن", badge: "طريق النور يبدأ بسنة واحدة", icon: "images/icons/bulb-ideas1.png" };
      }
    }

    renderSunnahRank() {
      const container = document.getElementById('etqSunnahRankCard');
      if (!container) return;

      const count = this.practicedToday.size;
      const total = this.items.length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const rank = this.getSunnahRank(count);

      container.innerHTML = `
        <div class="etq-rank-left">
          <div class="etq-rank-seal">
            <img src="${rank.icon}" alt="${rank.title}">
          </div>
          <div class="etq-rank-texts">
            <h4>${rank.title}</h4>
            <p>${rank.badge} • سلسلة: ${this.streak} ${this.streak === 1 ? 'يوم' : 'أيام'}</p>
          </div>
        </div>

        <div class="etq-rank-progress-area">
          <div class="etq-rank-meta">
            <span style="color: var(--text-main); font-weight: 800;">
              <i class="fa-solid fa-check-circle" style="color: #2e7d32;"></i>
              <span>إنجاز اليوم: ${count} من أصل ${total} سنة</span>
            </span>
            <span style="color: var(--etq-primary); font-weight: 900;">${pct}%</span>
          </div>
          <div class="etq-rank-track">
            <div class="etq-rank-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }

    // ── 4. Golden Sunnah Showcase ──
    getDailySunnahItem() {
      if (this.items.length === 0) return null;
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const index = dayOfYear % this.items.length;
      return this.items[index];
    }

    renderGoldenSunnah() {
      const container = document.getElementById('etqGoldenSunnahVault');
      if (!container) return;

      const item = this.getDailySunnahItem();
      if (!item) return;

      const isStamped = this.practicedToday.has(item.id);

      container.innerHTML = `
        <div class="etq-golden-head">
          <span class="etq-golden-crest-tag">
            <img src="images/icons/certificate1.png" alt="Crest">
            <span>سنة اليوم الذهبية • هدي نبوي متجدد</span>
          </span>
          <span class="etq-streak-badge">
            <i class="fa-solid fa-fire" style="color: #e67e22;"></i>
            <span>سلسلة الالتزام: ${this.streak} ${this.streak === 1 ? 'يوم' : 'أيام'}</span>
          </span>
        </div>

        <h3 class="etq-golden-title">${item.title}</h3>

        <div class="etq-golden-hadith-box">
          <p class="etq-golden-hadith">${item.hadith}</p>
          <div class="etq-golden-source">
            <i class="fa-solid fa-book-bookmark"></i>
            <span>المصدر: ${item.hadithSource}</span>
          </div>
        </div>

        <div class="etq-golden-steps-wrap">
          <div style="font-weight: 900; font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">
            <i class="fa-solid fa-bullseye" style="color: var(--etq-gold);"></i>
            <span>كيف تطبق هذه السنة اليوم؟</span>
          </div>
          ${item.steps.map(st => `
            <div class="etq-golden-step-row">
              <i class="fa-solid fa-check"></i>
              <span>${st}</span>
            </div>
          `).join('')}
        </div>

        <div class="etq-golden-actions-bar">
          <button type="button" class="etq-stamp-btn ${isStamped ? 'is-stamped' : ''}" 
            onclick="window.wzkerEtiquette.togglePracticed('${item.id}')">
            <i class="fa-solid ${isStamped ? 'fa-circle-check' : 'fa-certificate'}"></i>
            <span>${isStamped ? 'تم ختم تطبيق السنة اليوم ✓' : 'ختم إحياء هذه السنة اليوم'}</span>
          </button>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="etq-card-tool-btn" onclick="window.wzkerEtiquette.playDuaAudio('${item.id}')" title="استماع">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            <button type="button" class="etq-card-tool-btn" onclick="window.wzkerEtiquette.copyEtiquette('${item.id}')" title="نسخ">
              <img src="images/icons/copy1.png" style="width: 15px; height: 15px;" alt="Copy">
            </button>
            <button type="button" class="etq-card-tool-btn" onclick="window.wzkerEtiquette.shareEtiquette('${item.id}')" title="مشاركة">
              <img src="images/icons/share.png" style="width: 15px; height: 15px;" alt="Share">
            </button>
          </div>
        </div>
      `;
    }

    // ── 5. Filter Pills Bar ──
    renderFilterPills() {
      const container = document.getElementById('etqFilterPillsRow');
      if (!container) return;

      const filters = [
        { id: 'all', label: 'كافة السنن (٣٢)', icon: 'fa-layer-group', count: this.items.length },
        { id: 'morning', label: 'الصباح والبكور', icon: 'fa-sun', count: this.items.filter(i => i.categoryId === 'morning').length },
        { id: 'food', label: 'المائدة والبركة', icon: 'fa-utensils', count: this.items.filter(i => i.categoryId === 'food').length },
        { id: 'speech', label: 'اللسان والمجالس', icon: 'fa-comments', count: this.items.filter(i => i.categoryId === 'speech').length },
        { id: 'home', label: 'البيت والأسرة', icon: 'fa-house', count: this.items.filter(i => i.categoryId === 'home').length },
        { id: 'mosque', label: 'المسجد والصلاة', icon: 'fa-mosque', count: this.items.filter(i => i.categoryId === 'mosque').length },
        { id: 'people', label: 'الأخوة والتعامل', icon: 'fa-handshake', count: this.items.filter(i => i.categoryId === 'people').length },
        { id: 'night', label: 'الليل والمنام', icon: 'fa-moon', count: this.items.filter(i => i.categoryId === 'night').length },
        { id: 'revived', label: 'كنوز مهجورة', icon: 'fa-seedling', count: this.items.filter(i => i.categoryId === 'revived').length },
        { id: 'favs', label: 'المحفوظة', icon: 'fa-heart', count: this.favorites.size },
        { id: 'today', label: 'المطبقة اليوم', icon: 'fa-check-double', count: this.practicedToday.size }
      ];

      container.innerHTML = filters.map(f => {
        const isActive = this.activeCategory === f.id;
        return `
          <button type="button" class="etq-filter-pill ${isActive ? 'active' : ''}" onclick="window.wzkerEtiquette.setCategory('${f.id}')">
            <i class="fa-solid ${f.icon}"></i>
            <span>${f.label}</span>
            <span class="etq-filter-count">${f.count}</span>
          </button>
        `;
      }).join('');
    }

    setCategory(catId) {
      this.activeCategory = catId;
      this.renderTimelineCompass();
      this.renderFilterPills();
      this.renderCards();

      // Smooth scroll down to cards if jumping from radar
      const cardsGrid = document.getElementById('etqCardsGrid');
      if (cardsGrid) {
        cardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // ── 6. The Interactive Prophetic Cards Grid ──
    renderCards() {
      const container = document.getElementById('etqCardsGrid');
      if (!container) return;

      let list = this.items;

      // Filter by category or special tabs
      if (this.activeCategory === 'favs') {
        list = list.filter(i => this.favorites.has(i.id));
      } else if (this.activeCategory === 'today') {
        list = list.filter(i => this.practicedToday.has(i.id));
      } else if (this.activeCategory !== 'all') {
        list = list.filter(i => i.categoryId === this.activeCategory);
      }

      // Live search query filter
      if (this.searchQuery) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(i => 
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.hadith.toLowerCase().includes(q) ||
          (i.dua && i.dua.toLowerCase().includes(q)) ||
          i.steps.some(st => st.toLowerCase().includes(q))
        );
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; background: var(--card-bg); border-radius: 22px; border: 1.5px dashed var(--border-color);">
            <img src="images/icons/search.png" style="width: 52px; height: 52px; opacity: 0.35; margin-bottom: 12px;" alt="Search">
            <h4 style="font-size: 1.15rem; margin: 0 0 6px; color: var(--text-main);">لم يتم العثور على سنن مطابقة</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">جرب كتابة كلمة أخرى أو اختر مرحلة مختلفة من اليوم</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(item => {
        const isFav = this.favorites.has(item.id);
        const isPracticed = this.practicedToday.has(item.id);
        const catObj = this.categories.find(c => c.id === item.categoryId);
        const catTitle = catObj ? catObj.title : 'سنة نبوية';
        const catIcon = catObj ? catObj.icon : 'images/icons/Etiquette1.png';

        return `
          <div class="etq-card ${isPracticed ? 'is-practiced-card' : ''}" id="etqCard_${item.id}">
            <div>
              <!-- Top Row Strip -->
              <div class="etq-card-top-strip">
                <span class="etq-card-domain-badge">
                  <img src="${catIcon}" alt="${catTitle}">
                  <span>${catTitle}</span>
                </span>
                <div class="etq-card-actions-quick">
                  <button type="button" class="etq-quick-btn ${isFav ? 'fav-active' : ''}" 
                    onclick="window.wzkerEtiquette.toggleFavorite('${item.id}')" title="${isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                  </button>
                </div>
              </div>

              <!-- Header Block -->
              <div class="etq-card-header">
                <div class="etq-card-icon-frame">
                  <img src="${item.icon || 'images/icons/Etiquette1.png'}" alt="${item.title}">
                </div>
                <div>
                  <h3 class="etq-card-title">${item.title}</h3>
                  <p class="etq-card-sub">${item.subtitle}</p>
                </div>
              </div>

              <!-- Hadith Manuscript Box -->
              <div class="etq-hadith-box">
                <p class="etq-hadith-text">${item.hadith}</p>
                <div class="etq-hadith-source">
                  <i class="fa-solid fa-book-bookmark"></i>
                  <span>${item.hadithSource}</span>
                </div>
              </div>

              <!-- Interactive Steps Checklist -->
              <div class="etq-steps-block">
                <span class="etq-steps-title">
                  <i class="fa-solid fa-check-double" style="color: var(--etq-gold);"></i>
                  <span>خطوات الاقتداء المعاصر:</span>
                </span>
                ${item.steps.map((step, sIdx) => {
                  const stepKey = `${item.id}_s${sIdx}`;
                  const isChecked = this.checkedSteps.has(stepKey);
                  return `
                    <div class="etq-step-item ${isChecked ? 'checked' : ''}" onclick="window.wzkerEtiquette.toggleStep('${stepKey}')">
                      <span class="etq-step-checkbox">
                        <i class="fa-solid fa-check"></i>
                      </span>
                      <span>${step}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Prophetic Dua Station with Audio -->
              ${item.dua ? `
                <div class="etq-dua-station">
                  <div class="etq-dua-content">
                    <strong style="color: var(--etq-primary); display: block; font-size: 0.8rem; margin-bottom: 3px;">الدعاء النبوي المأثور:</strong>
                    <span>${item.dua}</span>
                  </div>
                  <button type="button" class="etq-dua-audio-trigger" onclick="window.wzkerEtiquette.playDuaAudio('${item.id}')" title="استماع للدعاء">
                    <i class="fa-solid fa-volume-high"></i>
                  </button>
                </div>
              ` : ''}

            </div>

            <!-- Card Bottom Action Deck -->
            <div class="etq-card-footer">
              <button type="button" class="etq-practice-toggle-btn ${isPracticed ? 'is-practiced' : ''}" 
                onclick="window.wzkerEtiquette.togglePracticed('${item.id}')">
                <i class="fa-solid ${isPracticed ? 'fa-circle-check' : 'fa-check'}"></i>
                <span>${isPracticed ? 'طبّقت هذه السنة اليوم ✓' : 'تحديد كـ طبّقتها اليوم'}</span>
              </button>

              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" class="etq-card-tool-btn" onclick="window.wzkerEtiquette.copyEtiquette('${item.id}')" title="نسخ الحديث">
                  <img src="images/icons/copy1.png" style="width: 15px; height: 15px;" alt="Copy">
                </button>
                <button type="button" class="etq-card-tool-btn" onclick="window.wzkerEtiquette.shareEtiquette('${item.id}')" title="مشاركة">
                  <img src="images/icons/share.png" style="width: 15px; height: 15px;" alt="Share">
                </button>
              </div>
            </div>

          </div>
        `;
      }).join('');
    }

    bindSearchEvents() {
      const input = document.getElementById('etqSearchInput');
      const clearBtn = document.getElementById('etqSearchClear');
      if (!input) return;

      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle('active', !!this.searchQuery);
        }
        this.renderCards();
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          this.searchQuery = '';
          clearBtn.classList.remove('active');
          this.renderCards();
        });
      }
    }

    // ── Interactivity ──
    togglePracticed(itemId) {
      if (this.practicedToday.has(itemId)) {
        this.practicedToday.delete(itemId);
      } else {
        this.practicedToday.add(itemId);
        this.updateStreakOnPractice();
      }

      this.saveState(`wzker_etq_practiced_${this.todayKey}`, this.practicedToday);
      this.renderGoldenSunnah();
      this.renderSunnahRank();
      this.renderFilterPills();
      this.renderCards();
    }

    toggleStep(stepKey) {
      if (this.checkedSteps.has(stepKey)) {
        this.checkedSteps.delete(stepKey);
      } else {
        this.checkedSteps.add(stepKey);
      }
      this.saveState(`wzker_etq_steps_${this.todayKey}`, this.checkedSteps);
      this.renderCards();
    }

    toggleFavorite(itemId) {
      if (this.favorites.has(itemId)) {
        this.favorites.delete(itemId);
      } else {
        this.favorites.add(itemId);
      }
      this.saveState('wzker_etq_favs', this.favorites);
      this.renderFilterPills();
      this.renderCards();
    }

    playDuaAudio(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const textToSpeak = item.dua ? `${item.title}. ${item.dua}` : `${item.title}. ${item.hadith}`;

      if (this.speechSynth) {
        this.speechSynth.cancel();
        this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
        this.currentUtterance.lang = 'ar-SA';
        this.currentUtterance.rate = 0.95;
        this.speechSynth.speak(this.currentUtterance);
      }
    }

    copyEtiquette(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      let text = `📜 هدي النبي ﷺ في: ${item.title}\n\n${item.hadith}\n[المصدر: ${item.hadithSource}]\n\n✨ خطوات التطبيق:\n${item.steps.map(s => '• ' + s).join('\n')}`;
      if (item.dua) {
        text += `\n\n🤲 الدعاء المأثور:\n${item.dua}`;
      }
      text += '\n\nتطبيق وذكر للأذكار والقرآن الكريم';

      navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ الأدب النبوي والحديث بنجاح');
      }).catch(() => {
        prompt('انسخ الأدب النبوي:', text);
      });
    }

    shareEtiquette(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      let text = `📜 هدي النبي ﷺ في: ${item.title}\n\n${item.hadith}\n[${item.hadithSource}]\n\n💡 التطبيق العملي:\n${item.steps.slice(0, 2).map(s => '• ' + s).join('\n')}\n\nتطبيق وذكر المبارك`;

      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: text,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text).then(() => {
          alert('تم نسخ الأدب النبوي للمشاركة');
        }).catch(() => {
          prompt('انسخ نص المشاركة:', text);
        });
      }
    }
  }

  // Expose global instance
  window.wzkerEtiquette = new WzkerEtiquetteManager();
})();
