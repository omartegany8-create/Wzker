/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER - AL-ARBA'UN AL-NAWAWIYYAH MODULE (js/nawawi.js)
 * Live Search, Category Filters, Memorization Tracker,
 * Speech/Audio Playback, Copy, Share & Detailed Explanations
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerNawawiManager {
    constructor() {
      this.data = window.WZKER_NAWAWI_DATA || [];
      this.categories = window.WZKER_NAWAWI_CATEGORIES || [];
      this.activeCategory = 'all';
      this.searchQuery = '';
      this.favorites = this.loadFavorites();
      this.memorized = this.loadMemorized();
      this.currentSpeech = null;
      this.playingId = null;

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
      this.renderCategories();
      this.renderHeroProgress();
      this.renderCards();
      this.bindSearchEvents();
    }

    onOpen() {
      this.renderHeroProgress();
      this.renderCards();
    }

    // ── LocalStorage State Management ──
    loadFavorites() {
      try {
        const raw = localStorage.getItem('wzker_nawawi_favs');
        return new Set(raw ? JSON.parse(raw) : []);
      } catch (e) {
        return new Set();
      }
    }

    saveFavorites() {
      try {
        localStorage.setItem('wzker_nawawi_favs', JSON.stringify(Array.from(this.favorites)));
      } catch (e) {
        console.warn('Could not save nawawi favorites:', e);
      }
    }

    loadMemorized() {
      try {
        const raw = localStorage.getItem('wzker_nawawi_memorized');
        return new Set(raw ? JSON.parse(raw) : []);
      } catch (e) {
        return new Set();
      }
    }

    saveMemorized() {
      try {
        localStorage.setItem('wzker_nawawi_memorized', JSON.stringify(Array.from(this.memorized)));
      } catch (e) {
        console.warn('Could not save nawawi memorized:', e);
      }
    }

    // ── Progress & Hero Card ──
    renderHeroProgress() {
      const count = this.memorized.size;
      const total = this.data.length || 42;
      const pct = Math.min(100, Math.round((count / total) * 100));

      const fillEl = document.getElementById('nawawiProgressFill');
      const valEl = document.getElementById('nawawiProgressVal');

      if (fillEl) fillEl.style.width = `${pct}%`;
      if (valEl) valEl.textContent = `${count} من ${total} (${pct}%)`;
    }

    // ── Category Filters ──
    renderCategories() {
      const container = document.getElementById('nawawiCategoryChips');
      if (!container) return;

      container.innerHTML = this.categories.map(cat => {
        const isActive = this.activeCategory === cat.id ? 'active' : '';
        return `
          <button type="button" class="nawawi-chip ${isActive}" data-cat="${cat.id}" onclick="window.wzkerNawawi.setCategory('${cat.id}')">
            <img src="${cat.icon}" alt="${cat.name}">
            <span>${cat.name}</span>
          </button>
        `;
      }).join('');
    }

    setCategory(catId) {
      this.activeCategory = catId;
      this.renderCategories();
      this.renderCards();
    }

    // ── Search & Filter Logic ──
    bindSearchEvents() {
      const input = document.getElementById('nawawiSearchInput');
      const clearBtn = document.getElementById('nawawiSearchClear');

      if (input) {
        input.addEventListener('input', (e) => {
          this.searchQuery = (e.target.value || '').trim();
          if (clearBtn) {
            clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
          }
          this.renderCards();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (input) {
            input.value = '';
            input.focus();
          }
          this.searchQuery = '';
          clearBtn.classList.remove('visible');
          this.renderCards();
        });
      }
    }

    getFilteredData() {
      return this.data.filter(item => {
        // Category Filter
        if (this.activeCategory === 'favs') {
          if (!this.favorites.has(item.number)) return false;
        } else if (this.activeCategory !== 'all') {
          if (item.category !== this.activeCategory) return false;
        }

        // Search Filter
        if (!this.searchQuery) return true;

        const q = this.searchQuery.toLowerCase();
        const numStr = String(item.number);
        const titleMatch = item.title.toLowerCase().includes(q);
        const themeMatch = item.theme.toLowerCase().includes(q);
        const narratorMatch = item.narrator.toLowerCase().includes(q);
        const textMatch = item.text.replace(/[\u064B-\u065F\u0670]/g, '').toLowerCase().includes(q);
        const numMatch = q === numStr || q === `الحديث ${numStr}` || q === `حديث ${numStr}`;

        return numMatch || titleMatch || themeMatch || narratorMatch || textMatch;
      });
    }

    // ── Render Hadith Cards ──
    renderCards() {
      const listEl = document.getElementById('nawawiCardsList');
      if (!listEl) return;

      const filtered = this.getFilteredData();

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="nawawi-empty-state">
            <img src="images/icons/no-results.png" alt="No results">
            <h4>لم يتم العثور على أحاديث مطابقة</h4>
            <p>جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً من الأعلى</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = filtered.map(item => {
        const isFav = this.favorites.has(item.number);
        const isMem = this.memorized.has(item.number);
        const isPlaying = this.playingId === item.number;

        return `
          <div class="nawawi-card ${isMem ? 'memorized' : ''}" id="nawawiCard_${item.number}">
            <!-- Head Meta -->
            <div class="nawawi-card-head">
              <div class="nawawi-badge-wrap">
                <span class="nawawi-num-badge">${item.number}</span>
                <span class="nawawi-theme-tag">${item.theme}</span>
              </div>
              <div class="nawawi-card-quick-actions">
                <button type="button" class="nawawi-action-icon-btn ${isFav ? 'fav-active' : ''}" 
                  onclick="window.wzkerNawawi.toggleFavorite(${item.number})" title="${isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                  <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <button type="button" class="nawawi-action-icon-btn" 
                  onclick="window.wzkerNawawi.copyHadith(${item.number})" title="نسخ الحديث الشريف">
                  <img src="images/icons/copy1.png" alt="Copy">
                </button>
                <button type="button" class="nawawi-action-icon-btn" 
                  onclick="window.wzkerNawawi.shareHadith(${item.number})" title="مشاركة">
                  <img src="images/icons/share.png" alt="Share">
                </button>
              </div>
            </div>

            <!-- Title & Narrator -->
            <h3 class="nawawi-card-title">«${item.title}»</h3>
            <div class="nawawi-narrator">
              <i class="fa-solid fa-feather-pointed"></i>
              <span>${item.narrator}</span>
            </div>

            <!-- Matn Box -->
            <div class="nawawi-matn-box">
              <p class="nawawi-matn-text">${item.text}</p>
              <span class="nawawi-source-tag">${item.source}</span>
            </div>

            <!-- Card Footer -->
            <div class="nawawi-card-footer">
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="nawawi-btn-memorized" 
                  onclick="window.wzkerNawawi.toggleMemorized(${item.number})">
                  <i class="fa-solid ${isMem ? 'fa-circle-check' : 'fa-check'}"></i>
                  <span>${isMem ? 'تم الحفظ والقراءة' : 'تحديد كـ مقروء / محفوظ'}</span>
                </button>
                <button type="button" class="nawawi-audio-btn ${isPlaying ? 'playing' : ''}" 
                  onclick="window.wzkerNawawi.toggleAudio(${item.number})" title="استماع للحديث الشريف">
                  <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-volume-high'}"></i>
                </button>
              </div>

              <button type="button" class="nawawi-btn-toggle-explain" 
                onclick="window.wzkerNawawi.toggleExplanation(${item.number})">
                <span>الشرح والفوائد</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
            </div>

            <!-- Expandable Explanation Drawer -->
            <div class="nawawi-explain-drawer">
              <div class="nawawi-drawer-inner">
                <!-- Vocabulary -->
                ${item.vocabulary && item.vocabulary.length > 0 ? `
                  <div class="nawawi-vocab-section">
                    <h5><i class="fa-solid fa-spell-check"></i> غريب الحديث والمفردات:</h5>
                    <div class="nawawi-vocab-chips">
                      ${item.vocabulary.map(v => `
                        <div class="nawawi-vocab-item">
                          <b>«${v.word}»:</b> <span>${v.meaning}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Short Explanation -->
                <div class="nawawi-sharh-section">
                  <h5><i class="fa-solid fa-book-open-reader"></i> الشرح الإجمالي الميسر:</h5>
                  <p class="nawawi-sharh-text">${item.shortExplanation}</p>
                </div>

                <!-- Benefits -->
                ${item.benefits && item.benefits.length > 0 ? `
                  <div class="nawawi-benefits-section">
                    <h5><i class="fa-solid fa-seedling"></i> ما يُستفاد من الحديث تربوياً وعملياً:</h5>
                    <ul class="nawawi-benefits-list">
                      ${item.benefits.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>

          </div>
        `;
      }).join('');
    }

    // ── Interaction Actions ──
    toggleFavorite(number) {
      if (this.favorites.has(number)) {
        this.favorites.delete(number);
        if (window.showToast) window.showToast('تمت الإزالة من المفضلة');
      } else {
        this.favorites.add(number);
        if (window.showToast) window.showToast('تمت الإضافة إلى المفضلة ❤️');
      }
      this.saveFavorites();
      this.renderCards();
    }

    toggleMemorized(number) {
      if (this.memorized.has(number)) {
        this.memorized.delete(number);
        if (window.showToast) window.showToast('تم إلغاء تحديد الحديث');
      } else {
        this.memorized.add(number);
        if (window.showToast) window.showToast(`مبارك! أتممت الحديث رقم ${number} بنجاح ✨`);
      }
      this.saveMemorized();
      this.renderHeroProgress();
      this.renderCards();
    }

    toggleExplanation(number) {
      const card = document.getElementById(`nawawiCard_${number}`);
      if (!card) return;
      card.classList.toggle('open-explain');
    }

    // ── Copy & Share ──
    copyHadith(number) {
      const item = this.data.find(d => d.number === number);
      if (!item) return;

      const formatted = `الحديث رقم (${item.number}): «${item.title}»\n\n${item.text}\n\nالراوي: ${item.narrator}\nالمصدر: ${item.source}\n\n— من تطبيق وذكر (الأربعون النووية)`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formatted).then(() => {
          if (window.showToast) window.showToast('تم نسخ الحديث الشريف إلى الحافظة 📋');
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
      if (window.showToast) window.showToast('تم نسخ الحديث الشريف 📋');
    }

    shareHadith(number) {
      const item = this.data.find(d => d.number === number);
      if (!item) return;

      const title = `الأربعون النووية: «${item.title}»`;
      const text = `${item.text}\n\n(رواه ${item.source})`;

      if (navigator.share) {
        navigator.share({
          title: title,
          text: text,
          url: window.location.href
        }).catch(err => console.log('Share dismissed', err));
      } else {
        this.copyHadith(number);
      }
    }

    // ── Speech / Audio Playback ──
    toggleAudio(number) {
      if (this.playingId === number) {
        this.stopAudio();
        return;
      }

      this.stopAudio();

      const item = this.data.find(d => d.number === number);
      if (!item) return;

      // Clean Tashkeel for smoother speech synthesis
      const plainText = item.text.replace(/[\u064B-\u065F\u0670]/g, '');

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;

        utterance.onend = () => {
          this.playingId = null;
          this.renderCards();
        };

        utterance.onerror = () => {
          this.playingId = null;
          this.renderCards();
        };

        this.currentSpeech = utterance;
        this.playingId = number;
        this.renderCards();
        window.speechSynthesis.speak(utterance);
      } else {
        if (window.showToast) window.showToast('عذراً، محرك التلاوة غير مدعوم في متصفحك');
      }
    }

    stopAudio() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.currentSpeech = null;
      this.playingId = null;
      this.renderCards();
    }

    // ── Quick Tools ──
    pickRandomHadith() {
      if (!this.data.length) return;
      const randIdx = Math.floor(Math.random() * this.data.length);
      const item = this.data[randIdx];

      // Ensure it is visible in the current list
      this.activeCategory = 'all';
      this.searchQuery = '';
      const input = document.getElementById('nawawiSearchInput');
      if (input) input.value = '';
      this.renderCategories();
      this.renderCards();

      setTimeout(() => {
        const card = document.getElementById(`nawawiCard_${item.number}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          card.style.borderColor = 'var(--primary)';
          card.style.boxShadow = '0 0 0 4px rgba(156, 61, 50, 0.25)';
          setTimeout(() => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, 2000);
        }
      }, 100);
    }

    continueReading() {
      // Find first unmemorized hadith
      const nextItem = this.data.find(d => !this.memorized.has(d.number));
      if (!nextItem) {
        if (window.showToast) window.showToast('ما شاء الله! لقد أتممت قراءة وحفظ جميع الأحاديث 🌟');
        return;
      }

      this.activeCategory = 'all';
      this.searchQuery = '';
      const input = document.getElementById('nawawiSearchInput');
      if (input) input.value = '';
      this.renderCategories();
      this.renderCards();

      setTimeout(() => {
        const card = document.getElementById(`nawawiCard_${nextItem.number}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  window.wzkerNawawi = new WzkerNawawiManager();
})();
