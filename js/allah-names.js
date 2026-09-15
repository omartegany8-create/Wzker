/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER - ALLAH'S 99 BEAUTIFUL NAMES CONTROLLER (js/allah-names.js)
 * Master Controller: Ihsaa' Progress Arc, Daily Divine Manifestation,
 * Celestial Gate Filters, Detail Modal, Speech & Audio Engine
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerAllahNamesManager {
    constructor() {
      this.gates = window.WZKER_ALLAH_GATES || [];
      this.names = window.WZKER_ALLAH_NAMES || [];

      this.activeGate = 'all';
      this.searchQuery = '';

      this.memorized = this.loadState('wzker_an_memorized');
      this.favorites = this.loadState('wzker_an_favs');

      this.speechSynth = window.speechSynthesis;
      this.currentUtterance = null;
      this.activeModalNameNum = null;

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
      this.renderDailyVault();
      this.renderGateTabs();
      this.renderNamesGrid();
      this.bindSearchEvents();
    }

    onOpen() {
      this.renderMetrics();
      this.renderDailyVault();
      this.renderGateTabs();
      this.renderNamesGrid();
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
        console.warn('AllahNames saveState failed:', e);
      }
    }

    // ── 1. Metrics & Ihsaa' Rank ──
    getRank(count) {
      if (count >= 99) {
        return { title: "مقام الإحصاء والجنة الشريف", badge: "أتممت إحصاء الأسماء التسعة والتسعين مباركاً", icon: "images/icons/certificate2.png" };
      } else if (count >= 50) {
        return { title: "حافظٌ للأسماء الحسنى", badge: "أكثر من نصف الطريق نحو الإحصاء المبارك", icon: "images/icons/certificate1.png" };
      } else if (count >= 20) {
        return { title: "سائرٌ في فلك المعرفة", badge: "خطوات مباركة في تدبر وتعبد أسماء الله", icon: "images/icons/leaf-3.png" };
      } else {
        return { title: "مبتدئٌ في إحصاء الأسماء", badge: "ابدأ بتدبر اسم واحد يومياً واعمل بمقتضاه", icon: "images/icons/bulb-ideas1.png" };
      }
    }

    renderMetrics() {
      const count = this.memorized.size;
      const total = this.names.length || 99;
      const pct = Math.round((count / total) * 100);
      const rank = this.getRank(count);

      const countValEl = document.getElementById('anMemorizedCountVal');
      const pctValEl = document.getElementById('anMemorizedPctVal');
      const fillEl = document.getElementById('anIhsaaFill');
      const rankTitleEl = document.getElementById('anRankTitle');
      const rankBadgeEl = document.getElementById('anRankBadge');
      const rankSealEl = document.getElementById('anRankSealImg');

      if (countValEl) countValEl.textContent = `${count} من ${total} اسماً`;
      if (pctValEl) pctValEl.textContent = `${pct}%`;
      if (fillEl) fillEl.style.width = `${pct}%`;
      if (rankTitleEl) rankTitleEl.textContent = rank.title;
      if (rankBadgeEl) rankBadgeEl.textContent = rank.badge;
      if (rankSealEl) rankSealEl.src = rank.icon;
    }

    // ── 2. Daily Divine Name Showcase ──
    getDailyName() {
      if (this.names.length === 0) return null;
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const index = dayOfYear % this.names.length;
      return this.names[index];
    }

    renderDailyVault() {
      const container = document.getElementById('anDailyVault');
      if (!container) return;

      const item = this.getDailyName();
      if (!item) return;

      const isMemorized = this.memorized.has(item.number);

      container.innerHTML = `
        <div class="an-daily-head">
          <span class="an-daily-crest-tag">
            <img src="images/icons/certificate1.png" alt="Crest">
            <span>اسم اليوم المتجلي • تدبر وتعبد</span>
          </span>
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--an-gold);">الاسم رقم ${item.number}</span>
        </div>

        <div class="an-daily-body">
          <div class="an-daily-calligraphy-medallion" onclick="window.wzkerAllahNames.openNameModal(${item.number})">
            <span class="callig-text">${item.name}</span>
            <span class="callig-num">#${item.number}</span>
          </div>

          <div class="an-daily-texts">
            <h3>اسم الله الأعظم: ${item.name}</h3>
            <p class="an-daily-meaning">${item.meaning}</p>
            <div class="an-daily-dua-box">
              <strong>دعاء التعبد:</strong> ${item.dua}
            </div>
          </div>
        </div>

        <div class="an-daily-actions">
          <button type="button" class="an-daily-ihsaa-btn ${isMemorized ? 'is-memorized' : ''}" 
            onclick="window.wzkerAllahNames.toggleMemorized(${item.number})">
            <i class="fa-solid ${isMemorized ? 'fa-circle-check' : 'fa-check'}"></i>
            <span>${isMemorized ? 'تم إحصاؤه وحفظه ✓' : 'تحديد كـ أحصيته وتدبرته'}</span>
          </button>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="top-custom-icon-btn" onclick="window.wzkerAllahNames.playNameAudio(${item.number})" title="استماع بالنطق">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            <button type="button" class="top-custom-icon-btn" onclick="window.wzkerAllahNames.openNameModal(${item.number})" title="عرض التفاصيل الكاملة">
              <i class="fa-solid fa-circle-info"></i>
            </button>
            <button type="button" class="top-custom-icon-btn" onclick="window.wzkerAllahNames.copyName(${item.number})" title="نسخ">
              <img src="images/icons/copy1.png" style="width: 15px; height: 15px;" alt="Copy">
            </button>
            <button type="button" class="top-custom-icon-btn" onclick="window.wzkerAllahNames.shareName(${item.number})" title="مشاركة">
              <img src="images/icons/share.png" style="width: 15px; height: 15px;" alt="Share">
            </button>
          </div>
        </div>
      `;
    }

    // ── 3. Gates Filter Tabs ──
    renderGateTabs() {
      const container = document.getElementById('anGatesRow');
      if (!container) return;

      const tabs = [
        { id: 'all', title: 'الكل (٩٩)', icon: 'images/icons/spiritual-lib.png', count: this.names.length },
        ...this.gates.map(g => ({
          id: g.id,
          title: g.title,
          icon: g.icon,
          count: this.names.filter(n => n.gate === g.id).length
        })),
        { id: 'memorized', title: 'تم إحصاؤها', icon: 'images/icons/task-done1.png', count: this.memorized.size },
        { id: 'favs', title: 'المفضلة', icon: 'images/icons/fav-active.png', count: this.favorites.size }
      ];

      container.innerHTML = tabs.map(t => {
        const isActive = this.activeGate === t.id;
        return `
          <button type="button" class="an-gate-pill ${isActive ? 'active' : ''}" onclick="window.wzkerAllahNames.setGate('${t.id}')">
            <img src="${t.icon}" alt="${t.title}">
            <span>${t.title}</span>
            <span class="an-gate-count">${t.count}</span>
          </button>
        `;
      }).join('');
    }

    setGate(gateId) {
      this.activeGate = gateId;
      this.renderGateTabs();
      this.renderNamesGrid();
    }

    // ── 4. The 99 Golden Calligraphic Cards Grid ──
    renderNamesGrid() {
      const container = document.getElementById('anNamesGrid');
      if (!container) return;

      let list = this.names;

      if (this.activeGate === 'memorized') {
        list = list.filter(n => this.memorized.has(n.number));
      } else if (this.activeGate === 'favs') {
        list = list.filter(n => this.favorites.has(n.number));
      } else if (this.activeGate !== 'all') {
        list = list.filter(n => n.gate === this.activeGate);
      }

      if (this.searchQuery) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(n =>
          n.name.toLowerCase().includes(q) ||
          n.meaning.toLowerCase().includes(q) ||
          n.verse.toLowerCase().includes(q) ||
          n.dua.toLowerCase().includes(q) ||
          String(n.number) === q
        );
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; background: var(--card-bg); border-radius: 22px; border: 1.5px dashed var(--border-color);">
            <img src="images/icons/search.png" style="width: 52px; height: 52px; opacity: 0.35; margin-bottom: 12px;" alt="Search">
            <h4 style="font-size: 1.15rem; margin: 0 0 6px; color: var(--text-main);">لم يتم العثور على اسم مطابق</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">جرب كتابة جزء من الاسم أو رقمه أو اختر باباً مختلفاً</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(item => {
        const isMemorized = this.memorized.has(item.number);
        const isFav = this.favorites.has(item.number);

        return `
          <div class="an-name-card ${isMemorized ? 'is-memorized' : ''}" onclick="window.wzkerAllahNames.openNameModal(${item.number})">
            <span class="an-card-num-badge">#${item.number}</span>
            <button type="button" class="an-card-fav-btn ${isFav ? 'fav-active' : ''}" 
              onclick="event.stopPropagation(); window.wzkerAllahNames.toggleFavorite(${item.number})" title="${isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>

            <h3 class="an-card-calligraphy">${item.name}</h3>
            <p class="an-card-meaning-snippet">${item.meaning}</p>

            ${isMemorized ? `
              <span class="an-card-status-chip">
                <i class="fa-solid fa-check"></i>
                <span>تم إحصاؤه</span>
              </span>
            ` : `
              <span style="font-size: 0.72rem; color: var(--an-gold); font-weight: 700;">انقر للتفاصيل</span>
            `}
          </div>
        `;
      }).join('');
    }

    // ── 5. Detail Modal ──
    openNameModal(num) {
      const item = this.names.find(n => n.number === num);
      if (!item) return;

      this.activeModalNameNum = num;
      const isMemorized = this.memorized.has(num);

      let modal = document.getElementById('anDetailModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'anDetailModal';
        modal.className = 'an-modal-overlay';
        modal.onclick = (e) => {
          if (e.target === modal) this.closeNameModal();
        };
        document.body.appendChild(modal);
      }

      const gateObj = this.gates.find(g => g.id === item.gate);
      const gateTitle = gateObj ? gateObj.title : 'باب الجلال والجمال';

      modal.innerHTML = `
        <div class="an-modal-card" onclick="event.stopPropagation()">
          <div class="an-modal-head">
            <span style="font-size: 0.82rem; font-weight: 900; color: var(--an-gold);">الاسم الشريف #${item.number} • ${gateTitle}</span>
            <button type="button" class="an-modal-close-btn" onclick="window.wzkerAllahNames.closeNameModal()" title="إغلاق">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="an-modal-calligraphy-wrap">
            <h2 class="an-modal-calligraphy">${item.name}</h2>
            <div class="an-modal-badge">وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا</div>
          </div>

          <div class="an-modal-section">
            <div class="an-modal-section-title">
              <i class="fa-solid fa-book-open"></i>
              <span>المعنى والدلالة الإيمانية:</span>
            </div>
            <p class="an-modal-section-text">${item.meaning}</p>
          </div>

          <div class="an-modal-section">
            <div class="an-modal-section-title">
              <i class="fa-solid fa-quran"></i>
              <span>الشاهد القرآني المبارك:</span>
            </div>
            <div class="an-modal-ayah-box">
              ﴿ ${item.verse} ﴾
            </div>
          </div>

          <div class="an-modal-section">
            <div class="an-modal-section-title">
              <i class="fa-solid fa-hands-praying"></i>
              <span>دعاء التعبد والتضرع بهذا الاسم:</span>
            </div>
            <div class="an-modal-dua-box">
              ${item.dua}
            </div>
          </div>

          <div class="an-modal-actions">
            <button type="button" class="an-modal-ihsaa-btn ${isMemorized ? 'is-memorized' : ''}" 
              onclick="window.wzkerAllahNames.toggleMemorized(${item.number}); window.wzkerAllahNames.openNameModal(${item.number});">
              <i class="fa-solid ${isMemorized ? 'fa-circle-check' : 'fa-check'}"></i>
              <span>${isMemorized ? 'تم إحصاؤه وتدبره ✓' : 'تحديد كـ أحصيته وتدبرته'}</span>
            </button>

            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" class="an-modal-close-btn" onclick="window.wzkerAllahNames.playNameAudio(${item.number})" title="استماع بالنطق">
                <i class="fa-solid fa-volume-high"></i>
              </button>
              <button type="button" class="an-modal-close-btn" onclick="window.wzkerAllahNames.copyName(${item.number})" title="نسخ">
                <img src="images/icons/copy1.png" style="width: 15px; height: 15px;" alt="Copy">
              </button>
              <button type="button" class="an-modal-close-btn" onclick="window.wzkerAllahNames.shareName(${item.number})" title="مشاركة">
                <img src="images/icons/share.png" style="width: 15px; height: 15px;" alt="Share">
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.add('active');
    }

    closeNameModal() {
      const modal = document.getElementById('anDetailModal');
      if (modal) modal.classList.remove('active');
      this.activeModalNameNum = null;
    }

    // ── 6. Interactions ──
    toggleMemorized(num) {
      if (this.memorized.has(num)) {
        this.memorized.delete(num);
      } else {
        this.memorized.add(num);
        if (navigator.vibrate) navigator.vibrate(60);
      }

      this.saveState('wzker_an_memorized', this.memorized);
      this.renderMetrics();
      this.renderDailyVault();
      this.renderGateTabs();
      this.renderNamesGrid();
    }

    toggleFavorite(num) {
      if (this.favorites.has(num)) {
        this.favorites.delete(num);
      } else {
        this.favorites.add(num);
      }

      this.saveState('wzker_an_favs', this.favorites);
      this.renderGateTabs();
      this.renderNamesGrid();
    }

    playNameAudio(num) {
      const item = this.names.find(n => n.number === num);
      if (!item || !this.speechSynth) return;

      if (this.speechSynth.speaking) {
        this.speechSynth.cancel();
      }

      const cleanText = `${item.name}. ${item.dua}`;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;

      const voices = this.speechSynth.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;

      this.currentUtterance = utterance;
      this.speechSynth.speak(utterance);
    }

    playFullAudioTrack() {
      const trackObj = {
        title: "أسماء الله الحسنى كاملة بالترتيل المبارك",
        name: "أسماء الله الحسنى الـ ٩٩",
        sheikh: "نخبة من كبار القراء",
        surahName: "أسماء الله الحسنى",
        url: "https://download.quranicaudio.com/special/asmaa-allah-al-husna.mp3",
        src: "https://download.quranicaudio.com/special/asmaa-allah-al-husna.mp3",
        audioUrl: "https://download.quranicaudio.com/special/asmaa-allah-al-husna.mp3",
        image: "images/icons/certificate1.png",
        duration: "٦ دقائق"
      };

      if (window.wzkerAudio && typeof window.wzkerAudio.playTrack === 'function') {
        window.wzkerAudio.playTrack(trackObj, [trackObj], 0);
        if (typeof window.openFullPlayer === 'function') {
          window.openFullPlayer();
        }
      } else {
        const a = new Audio(trackObj.url);
        a.play().catch(e => console.warn('Audio playback error:', e));
      }
    }

    copyName(num) {
      const item = this.names.find(n => n.number === num);
      if (!item) return;

      const payload = `﴿ ${item.name} ﴾ (الرقم: ${item.number})\n\nالمعنى: ${item.meaning}\nالشاهد القرآني: ﴿ ${item.verse} ﴾\nدعاء التعبد: ${item.dua}\n\n— وذكر | أسماء الله الحسنى`;
      navigator.clipboard.writeText(payload).then(() => {
        if (window.showToast) window.showToast(`تم نسخ اسم الله: ${item.name}`);
      });
    }

    shareName(num) {
      const item = this.names.find(n => n.number === num);
      if (!item) return;

      const payload = `﴿ ${item.name} ﴾ (الرقم: ${item.number})\n\nالمعنى: ${item.meaning}\nدعاء التعبد: ${item.dua}\n\n— وذكر | أسماء الله الحسنى`;
      if (navigator.share) {
        navigator.share({ title: `اسم الله: ${item.name}`, text: payload }).catch(() => {});
      } else {
        this.copyName(num);
      }
    }

    bindSearchEvents() {
      const input = document.getElementById('anSearchInput');
      const clearBtn = document.getElementById('anSearchClear');
      if (!input) return;

      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle('active', !!this.searchQuery);
        }
        this.renderNamesGrid();
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          this.searchQuery = '';
          clearBtn.classList.remove('active');
          this.renderNamesGrid();
        });
      }
    }
  }

  window.WzkerAllahNamesManager = WzkerAllahNamesManager;
  window.wzkerAllahNames = new WzkerAllahNamesManager();
})();
