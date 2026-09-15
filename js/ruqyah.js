/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER - RUQYAH SHARIAH CONTROLLER (js/ruqyah.js)
 * Master Controller: Healing Session Intent, Tactile Counter,
 * Audio Reciter Station, Web Speech Engine, Adab Modal
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerRuqyahManager {
    constructor() {
      this.categories = window.WZKER_RUQYAH_CATEGORIES || [];
      this.items = window.WZKER_RUQYAH_ITEMS || [];
      this.reciters = window.WZKER_RUQYAH_RECITERS || [];
      this.adab = window.WZKER_RUQYAH_ADAB || [];

      this.activeCategory = 'all';
      this.activeIntent = 'all';
      this.searchQuery = '';
      this.selectedReciterId = 'mishary';

      this.todayKey = this.getTodayDateKey();
      this.favorites = this.loadState('wzker_ruqyah_favs');
      this.itemCounts = this.loadCounts(`wzker_ruqyah_counts_${this.todayKey}`);

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
      this.renderMetrics();
      this.renderAudioDock();
      this.renderCategoryTabs();
      this.renderCards();
      this.renderAdabModal();
      this.bindSearchEvents();
    }

    onOpen() {
      const currentToday = this.getTodayDateKey();
      if (currentToday !== this.todayKey) {
        this.todayKey = currentToday;
        this.itemCounts = this.loadCounts(`wzker_ruqyah_counts_${this.todayKey}`);
      }

      this.renderMetrics();
      this.renderAudioDock();
      this.renderCategoryTabs();
      this.renderCards();
    }

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
        console.warn('Ruqyah saveState failed:', e);
      }
    }

    loadCounts(key) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    saveCounts(key, countsObj) {
      try {
        localStorage.setItem(key, JSON.stringify(countsObj));
      } catch (e) {
        console.warn('Ruqyah saveCounts failed:', e);
      }
    }

    // ── 1. Metrics & Progress ──
    renderMetrics() {
      const totalItems = this.items.length;
      let completedCount = 0;
      let totalRepeatsDone = 0;

      this.items.forEach(it => {
        const c = this.itemCounts[it.id] || 0;
        totalRepeatsDone += c;
        if (c >= it.targetCount) {
          completedCount++;
        }
      });

      const totalValEl = document.getElementById('ruqTotalItemsVal');
      const completedValEl = document.getElementById('ruqCompletedVal');
      const repeatsValEl = document.getElementById('ruqRepeatsVal');
      const statusValEl = document.getElementById('ruqStatusVal');

      if (totalValEl) totalValEl.textContent = `${totalItems} آية ودعاء`;
      if (completedValEl) completedValEl.textContent = `${completedCount} من ${totalItems}`;
      if (repeatsValEl) repeatsValEl.textContent = `${totalRepeatsDone} تكرار`;
      if (statusValEl) {
        if (completedCount === totalItems && totalItems > 0) {
          statusValEl.textContent = 'تحصين تام مبارك ✓';
        } else if (completedCount > 0) {
          statusValEl.textContent = 'جلسة قيد الاستشفاء';
        } else {
          statusValEl.textContent = 'ابدأ الرقية الآن';
        }
      }
    }

    // ── 2. Intent Selector ──
    setIntent(intentKey) {
      this.activeIntent = intentKey;
      
      const chips = document.querySelectorAll('.ruq-intent-chip');
      chips.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-intent') === intentKey);
      });

      if (intentKey === 'all') {
        this.activeCategory = 'all';
      } else if (intentKey === 'protection') {
        this.activeCategory = 'foundation';
      } else if (intentKey === 'healing') {
        this.activeCategory = 'healing_verses';
      } else if (intentKey === 'eye') {
        this.activeCategory = 'evil_eye';
      } else if (intentKey === 'duas') {
        this.activeCategory = 'prophetic_duas';
      } else if (intentKey === 'anxiety') {
        this.activeCategory = 'anxiety_relief';
      } else if (intentKey === 'home') {
        this.activeCategory = 'home_sleep';
      }

      this.renderCategoryTabs();
      this.renderCards();

      const grid = document.getElementById('ruqCardsGrid');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // ── 3. Audio Dock with Reciters ──
    renderAudioDock() {
      const container = document.getElementById('ruqAudioDockWrap');
      if (!container) return;

      const currentReciter = this.reciters.find(r => r.id === this.selectedReciterId) || this.reciters[0];

      container.innerHTML = `
        <div class="ruq-audio-dock">
          <div class="ruq-audio-left">
            <div class="ruq-audio-crest" onclick="window.wzkerRuqyah.playReciterAudio()" title="تشغيل الرقية المسموعة">
              <img src="images/icons/sound-on.png" alt="Audio Ruqyah">
            </div>
            <div class="ruq-audio-texts">
              <h4>الرقية الشرعية الصوتية المسموعة</h4>
              <p>${currentReciter.name} • ${currentReciter.duration} • ${currentReciter.style}</p>
            </div>
          </div>

          <div class="ruq-audio-controls">
            <select class="ruq-reciter-select" id="ruqReciterSelect" onchange="window.wzkerRuqyah.onReciterChange(this.value)">
              ${this.reciters.map(r => `
                <option value="${r.id}" ${r.id === this.selectedReciterId ? 'selected' : ''}>
                  ${r.name} (${r.duration})
                </option>
              `).join('')}
            </select>

            <button type="button" class="ruq-play-dock-btn" onclick="window.wzkerRuqyah.playReciterAudio()">
              <i class="fa-solid fa-play"></i>
              <span>استماع الآن</span>
            </button>
          </div>
        </div>
      `;
    }

    onReciterChange(reciterId) {
      this.selectedReciterId = reciterId;
      this.renderAudioDock();
    }

    playReciterAudio() {
      const reciter = this.reciters.find(r => r.id === this.selectedReciterId) || this.reciters[0];
      if (!reciter) return;

      const trackObj = {
        title: `الرقية الشرعية المطولة - ${reciter.name}`,
        name: `الرقية الشرعية المطولة`,
        sheikh: reciter.name,
        surahName: "الرقية الشرعية المطولة",
        url: reciter.url,
        src: reciter.url,
        audioUrl: reciter.url,
        image: "images/icons/Ruqayyah1.png",
        duration: reciter.duration
      };

      if (window.wzkerAudio && typeof window.wzkerAudio.playTrack === 'function') {
        window.wzkerAudio.playTrack(trackObj, [trackObj], 0);
        if (typeof window.openFullPlayer === 'function') {
          window.openFullPlayer();
        }
      } else {
        const audio = new Audio(reciter.url);
        audio.play().catch(e => console.warn('Audio playback error:', e));
      }
    }

    // ── 4. Category Tabs ──
    renderCategoryTabs() {
      const container = document.getElementById('ruqCategoryTabs');
      if (!container) return;

      const tabs = [
        { id: 'all', title: 'الكل (٣٣)', icon: 'images/icons/spiritual-lib.png', count: this.items.length },
        ...this.categories.map(c => ({
          id: c.id,
          title: c.title,
          icon: c.icon,
          count: this.items.filter(it => it.categoryId === c.id).length
        })),
        { id: 'favs', title: 'المحفوظة', icon: 'images/icons/fav-active.png', count: this.favorites.size },
        { id: 'completed', title: 'المكتملة', icon: 'images/icons/task-done1.png', count: Object.keys(this.itemCounts).filter(k => {
          const it = this.items.find(i => i.id === k);
          return it && (this.itemCounts[k] >= it.targetCount);
        }).length }
      ];

      container.innerHTML = tabs.map(t => {
        const isActive = this.activeCategory === t.id;
        return `
          <button type="button" class="ruq-cat-tab ${isActive ? 'active' : ''}" onclick="window.wzkerRuqyah.setCategory('${t.id}')">
            <img src="${t.icon}" alt="${t.title}">
            <span>${t.title}</span>
            <span class="ruq-cat-count">${t.count}</span>
          </button>
        `;
      }).join('');
    }

    setCategory(catId) {
      this.activeCategory = catId;
      this.renderCategoryTabs();
      this.renderCards();
    }

    // ── 5. Sacred Ruqyah Cards Grid ──
    renderCards() {
      const container = document.getElementById('ruqCardsGrid');
      if (!container) return;

      let list = this.items;

      if (this.activeCategory === 'favs') {
        list = list.filter(i => this.favorites.has(i.id));
      } else if (this.activeCategory === 'completed') {
        list = list.filter(i => (this.itemCounts[i.id] || 0) >= i.targetCount);
      } else if (this.activeCategory !== 'all') {
        list = list.filter(i => i.categoryId === this.activeCategory);
      }

      if (this.searchQuery) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.text.toLowerCase().includes(q) ||
          i.guidance.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; background: var(--card-bg); border-radius: 22px; border: 1.5px dashed var(--border-color);">
            <img src="images/icons/search.png" style="width: 52px; height: 52px; opacity: 0.35; margin-bottom: 12px;" alt="Search">
            <h4 style="font-size: 1.15rem; margin: 0 0 6px; color: var(--text-main);">لم يتم العثور على آيات أو أدعية مطابقة</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">جرب كتابة كلمة أخرى أو اختر قسماً مختلفاً من أقسام الرقية</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(item => {
        const currentCount = this.itemCounts[item.id] || 0;
        const isDone = currentCount >= item.targetCount;
        const isFav = this.favorites.has(item.id);
        const catObj = this.categories.find(c => c.id === item.categoryId);
        const catTitle = catObj ? catObj.title : 'رقية شرعية';
        const catIcon = catObj ? catObj.icon : 'images/icons/Ruqayyah1.png';

        return `
          <div class="ruq-card ${isDone ? 'is-completed-card' : ''}" id="ruqCard_${item.id}">
            <div>
              <!-- Top Row Strip -->
              <div class="ruq-card-top-strip">
                <span class="ruq-card-domain-badge">
                  <img src="${catIcon}" alt="${catTitle}">
                  <span>${catTitle}</span>
                </span>
                <div class="ruq-card-actions-quick">
                  <button type="button" class="ruq-quick-btn" onclick="window.wzkerRuqyah.playItemRecitation('${item.id}')" title="استماع بالنطق الصوتي">
                    <i class="fa-solid fa-volume-high"></i>
                  </button>
                  <button type="button" class="ruq-quick-btn ${isFav ? 'fav-active' : ''}" 
                    onclick="window.wzkerRuqyah.toggleFavorite('${item.id}')" title="${isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                  </button>
                </div>
              </div>

              <!-- Header Block -->
              <div class="ruq-card-header" style="margin-top: 12px;">
                <div class="ruq-card-icon-frame">
                  <img src="${item.icon || 'images/icons/Ruqayyah1.png'}" alt="${item.title}">
                </div>
                <div>
                  <h3 class="ruq-card-title">${item.title}</h3>
                  <p class="ruq-card-source">
                    <i class="fa-solid fa-book-bookmark"></i>
                    <span>${item.source}</span>
                  </p>
                </div>
              </div>

              <!-- Sacred Quran/Hadith Text Box -->
              <div class="ruq-text-box" style="margin-top: 14px;">
                <p class="ruq-sacred-text">﴿ ${item.text} ﴾</p>
              </div>

              <!-- Guidance / Spiritual Action -->
              <div class="ruq-guidance-box" style="margin-top: 12px;">
                <i class="fa-solid fa-hand-holding-heart"></i>
                <span>${item.guidance}</span>
              </div>
            </div>

            <!-- Card Bottom Action Deck with Tactile Repetition Counter -->
            <div class="ruq-card-footer">
              <button type="button" class="ruq-counter-interactive ${isDone ? 'is-done' : ''}" 
                onclick="window.wzkerRuqyah.incrementCount('${item.id}')" title="انقر بعد كل تكرار">
                <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-hand-pointer'}"></i>
                <span>${isDone ? 'اكتمل التكرار ✓' : `كرر: ${currentCount} / ${item.targetCount}`}</span>
              </button>

              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" class="ruq-card-tool-btn" onclick="window.wzkerRuqyah.resetSingleCount('${item.id}')" title="إعادة تصفير التكرار">
                  <i class="fa-solid fa-arrow-rotate-right" style="font-size: 13px;"></i>
                </button>
                <button type="button" class="ruq-card-tool-btn" onclick="window.wzkerRuqyah.copyText('${item.id}')" title="نسخ الآية أو الدعاء">
                  <img src="images/icons/copy1.png" style="width: 15px; height: 15px;" alt="Copy">
                </button>
                <button type="button" class="ruq-card-tool-btn" onclick="window.wzkerRuqyah.shareText('${item.id}')" title="مشاركة">
                  <img src="images/icons/share.png" style="width: 15px; height: 15px;" alt="Share">
                </button>
              </div>
            </div>

          </div>
        `;
      }).join('');
    }

    // ── 6. Tactile Counter & Interactivity ──
    incrementCount(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const current = this.itemCounts[itemId] || 0;
      if (current < item.targetCount) {
        this.itemCounts[itemId] = current + 1;
      } else {
        // Reset or toggle
        this.itemCounts[itemId] = 0;
      }

      this.saveCounts(`wzker_ruqyah_counts_${this.todayKey}`, this.itemCounts);
      this.renderMetrics();
      this.renderCategoryTabs();
      this.renderCards();

      // Visual / Haptic Feedback if completed
      if (this.itemCounts[itemId] === item.targetCount) {
        if (navigator.vibrate) navigator.vibrate(60);
      }
    }

    resetSingleCount(itemId) {
      this.itemCounts[itemId] = 0;
      this.saveCounts(`wzker_ruqyah_counts_${this.todayKey}`, this.itemCounts);
      this.renderMetrics();
      this.renderCategoryTabs();
      this.renderCards();
    }

    resetAllSessionCounts() {
      if (confirm('هل ترغب في إعادة ضبط عداد تكرار جلسة الرقية بالكامل؟')) {
        this.itemCounts = {};
        this.saveCounts(`wzker_ruqyah_counts_${this.todayKey}`, this.itemCounts);
        this.renderMetrics();
        this.renderCategoryTabs();
        this.renderCards();
      }
    }

    toggleFavorite(itemId) {
      if (this.favorites.has(itemId)) {
        this.favorites.delete(itemId);
      } else {
        this.favorites.add(itemId);
      }
      this.saveState('wzker_ruqyah_favs', this.favorites);
      this.renderCategoryTabs();
      this.renderCards();
    }

    // ── 7. Speech Recitation Engine ──
    playItemRecitation(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item || !this.speechSynth) return;

      if (this.speechSynth.speaking) {
        this.speechSynth.cancel();
      }

      const cleanText = item.text.replace(/[\u064B-\u065F\u0670]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = this.speechSynth.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;

      this.currentUtterance = utterance;
      this.speechSynth.speak(utterance);
    }

    // ── 8. Copy & Share ──
    copyText(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const payload = `﴿ ${item.text} ﴾\n\nالمصدر: ${item.source}\nالعدد المستحب: ${item.targetCount} مرات\nهدي الاستشفاء: ${item.guidance}\n\n— وذكر | الرقية الشرعية`;
      navigator.clipboard.writeText(payload).then(() => {
        if (window.showToast) window.showToast('تم نسخ الآية/الدعاء بنجاح');
      });
    }

    shareText(itemId) {
      const item = this.items.find(i => i.id === itemId);
      if (!item) return;

      const payload = `﴿ ${item.text} ﴾\n\nالمصدر: ${item.source}\nالعدد المستحب: ${item.targetCount} مرات\n\n— وذكر | الرقية الشرعية`;
      if (navigator.share) {
        navigator.share({ title: item.title, text: payload }).catch(() => {});
      } else {
        this.copyText(itemId);
      }
    }

    // ── 9. Adab & Guidance Modal ──
    renderAdabModal() {
      let modal = document.getElementById('ruqAdabModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ruqAdabModal';
        modal.className = 'ruq-modal-overlay';
        modal.onclick = (e) => {
          if (e.target === modal) this.closeAdabModal();
        };
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div class="ruq-modal-card" onclick="event.stopPropagation()">
          <div class="ruq-modal-head">
            <h4 class="ruq-modal-title">
              <img src="images/icons/Ruqayyah1.png" alt="Adab">
              <span>شروط وآداب الرقية الشرعية المعتمدة</span>
            </h4>
            <button type="button" class="ruq-modal-close-btn" onclick="window.wzkerRuqyah.closeAdabModal()" title="إغلاق">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="ruq-adab-list">
            ${this.adab.map((ad, idx) => `
              <div class="ruq-adab-item">
                <div class="ruq-adab-num">${idx + 1}</div>
                <div class="ruq-adab-texts">
                  <h5>${ad.title}</h5>
                  <p>${ad.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="background: rgba(15, 118, 110, 0.08); border-radius: 14px; padding: 12px 16px; font-size: 0.82rem; color: var(--ruq-primary); line-height: 1.6; font-weight: 700;">
            <i class="fa-solid fa-shield-halved" style="margin-left: 6px;"></i>
            <span>تنبيه عقدي: الرقية الشرعية سبب مشروع، والشفاء بيد الله وحده، وتجوز بكلام الله وأسمائه وصفاته وبالأدعية المأثورة الخالية من الشرك والبدع.</span>
          </div>
        </div>
      `;
    }

    openAdabModal() {
      const modal = document.getElementById('ruqAdabModal');
      if (modal) modal.classList.add('active');
    }

    closeAdabModal() {
      const modal = document.getElementById('ruqAdabModal');
      if (modal) modal.classList.remove('active');
    }

    // ── 10. Search ──
    bindSearchEvents() {
      const input = document.getElementById('ruqSearchInput');
      const clearBtn = document.getElementById('ruqSearchClear');
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
  }

  window.WzkerRuqyahManager = WzkerRuqyahManager;
  window.wzkerRuqyah = new WzkerRuqyahManager();
})();
