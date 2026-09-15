/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER (وذكر) - HADITH ENCYCLOPEDIA LOGIC ENGINE (js/hadith.js)
 * Masterpiece Diwan Implementation:
 * - 7-second Auto-Flipping Rotating Hadith Billboard with animated progress bar
 * - Color-Coded Narrator Collections Spectrum
 * - Thematic Topic Pills
 * - Instant Live Search
 * - Text-To-Speech Hadith Recitation
 * - Clipboard Copy & Native Share
 * ══════════════════════════════════════════════════════════════════
 */

class WzkerHadithManager {
  constructor() {
    this.booksList = window.WZKER_HADITH_BOOKS || [];
    this.topics = window.WZKER_HADITH_TOPICS || [];
    this.hadiths = window.WZKER_HADITHS || [];

    // Map books by ID for fast lookup
    this.booksMap = {};
    this.booksList.forEach(b => {
      this.booksMap[b.id] = b;
    });

    this.selectedBook = 'all';
    this.selectedTopic = 'all';
    this.searchQuery = '';

    // Rotating Billboard state
    this.billboardIndex = 0;
    this.isBillboardPaused = false;
    this.flipDuration = 7000; // 7 seconds per slide
    this.progressInterval = null;
    this.progressElapsed = 0;

    // Speech state
    this.currentSpeakingId = null;
    this.speechSynth = 'speechSynthesis' in window ? window.speechSynthesis : null;

    this.init();
  }

  init() {
    this.renderSpectrumCards();
    this.renderTopicTabs();
    this.renderCards();
    this.setupBillboard();
    this.bindEvents();
  }

  onOpen() {
    this.startBillboardAutoFlip();
  }

  // --- NARRATOR COLLECTIONS SPECTRUM ---
  renderSpectrumCards() {
    const container = document.getElementById('hdSpectrumGrid');
    if (!container) return;

    let html = `
      <div class="hd-spectrum-card ${this.selectedBook === 'all' ? 'active' : ''}" 
           data-book="all" 
           style="border-color: #6366f1; --narrator-color: #6366f1;">
        <div class="hd-spectrum-badge-icon" style="background: rgba(99, 102, 241, 0.12); border-color: #6366f1; color: #818cf8;">
          <i class="fas fa-layer-group" style="font-size: 1.2rem;"></i>
        </div>
        <div class="hd-spectrum-name">كافة الدواوين</div>
        <span class="hd-spectrum-count" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">${this.hadiths.length} حديث</span>
      </div>
    `;

    this.booksList.forEach(b => {
      const count = this.hadiths.filter(h => h.bookId === b.id).length;
      const isActive = this.selectedBook === b.id;

      html += `
        <div class="hd-spectrum-card ${isActive ? 'active' : ''}" 
             data-book="${b.id}" 
             style="border-color: ${b.color}; --narrator-color: ${b.color}; ${isActive ? `background: ${b.bg};` : ''}">
          <div class="hd-spectrum-badge-icon" style="background: ${b.bg}; border-color: ${b.color};">
            <img src="${b.icon}" alt="${b.name}">
          </div>
          <div class="hd-spectrum-name">${b.name}</div>
          <span class="hd-spectrum-count" style="background: ${b.bg}; color: ${b.color};">${count} حديث</span>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.hd-spectrum-card').forEach(card => {
      card.addEventListener('click', () => {
        const bId = card.getAttribute('data-book');
        this.selectBook(bId);
      });
    });
  }

  // --- THEMATIC TOPIC PILLS ---
  renderTopicTabs() {
    const container = document.getElementById('hdTopicTabs');
    if (!container) return;

    let html = '';
    this.topics.forEach(t => {
      const isActive = this.selectedTopic === t.id;
      html += `
        <button class="hd-topic-pill ${isActive ? 'active' : ''}" data-topic="${t.id}">
          <img src="${t.icon}" alt="${t.title}">
          <span>${t.title}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.hd-topic-pill').forEach(tab => {
      tab.addEventListener('click', () => {
        const topicId = tab.getAttribute('data-topic');
        this.selectTopic(topicId);
      });
    });
  }

  selectBook(bookId) {
    this.selectedBook = bookId;
    this.renderSpectrumCards();
    this.renderCards();
  }

  selectTopic(topicId) {
    this.selectedTopic = topicId;
    this.renderTopicTabs();
    this.renderCards();
  }

  // --- RENDER CARDS GRID ---
  renderCards() {
    const grid = document.getElementById('hdCardsGrid');
    const emptyState = document.getElementById('hdEmptyState');
    if (!grid) return;

    let list = this.hadiths.filter(h => {
      if (this.selectedBook !== 'all' && h.bookId !== this.selectedBook) return false;
      if (this.selectedTopic !== 'all' && h.topic !== this.selectedTopic) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.trim().toLowerCase();
        const searchable = `${h.title || ''} ${h.sanad || ''} ${h.text || ''} ${h.takhrij || ''} ${h.wisdom || ''}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    list.forEach(h => {
      const book = this.booksMap[h.bookId] || { name: 'ديوان السنة', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'images/icons/book1.png' };
      const isSpeaking = this.currentSpeakingId === h.id;

      html += `
        <article class="hd-card" id="hd-card-${h.id}" style="border-color: ${book.color}44; box-shadow: 0 6px 20px ${book.color}15;">
          
          <div class="hd-card-top-strip">
            <span class="hd-card-book-pill" style="background: ${book.bg}; color: ${book.color}; border-color: ${book.color};">
              <img src="${book.icon}" alt="${book.name}">
              <span>${book.name}</span>
            </span>
            <div class="hd-card-actions-quick">
              <button class="hd-quick-btn" onclick="window.wzkerHadith.copyHadith('${h.id}')" title="نسخ الحديث">
                <i class="far fa-copy"></i>
              </button>
              <button class="hd-quick-btn" onclick="window.wzkerHadith.shareHadith('${h.id}')" title="مشاركة">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
          </div>

          <div class="hd-card-header">
            <div class="hd-card-icon-frame" style="background: ${book.bg}; border-color: ${book.color}66;">
              <img src="${book.icon}" alt="${book.name}">
            </div>
            <div>
              <h4 class="hd-card-title">${h.title}</h4>
              <p class="hd-card-sanad">${h.sanad}</p>
            </div>
          </div>

          <div class="hd-text-box" style="border-right-color: ${book.color}; background: ${book.bg};">
            <p class="hd-sacred-text">${h.text}</p>
            <div class="hd-card-takhrij" style="color: ${book.color};">
              <i class="fas fa-certificate"></i>
              <span>${h.takhrij}</span>
            </div>
          </div>

          ${h.wisdom ? `
            <div class="hd-wisdom-box">
              <i class="fas fa-lightbulb"></i>
              <span><strong>لطيفة وهداية:</strong> ${h.wisdom}</span>
            </div>
          ` : ''}

          <div class="hd-card-footer">
            <button class="hd-speech-btn" 
                    style="background: linear-gradient(135deg, ${book.color}, ${book.color}dd); color: #fff;"
                    onclick="window.wzkerHadith.toggleSpeech('${h.id}')">
              <i class="fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'}"></i>
              <span>${isSpeaking ? 'إيقاف التلاوة' : 'تلاوة صوتية'}</span>
            </button>
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">
              ${h.topic ? '#' + h.topic : ''}
            </div>
          </div>
        </article>
      `;
    });

    grid.innerHTML = html;
  }

  // --- ROTATING BILLBOARD (لوحة الإعلان التلقائية) ---
  setupBillboard() {
    if (this.hadiths.length === 0) return;
    this.billboardIndex = Math.floor(Math.random() * this.hadiths.length);
    this.renderCurrentBillboard();
    this.startBillboardAutoFlip();
  }

  renderCurrentBillboard() {
    if (this.hadiths.length === 0) return;
    const h = this.hadiths[this.billboardIndex];
    const book = this.booksMap[h.bookId] || { name: 'الحديث النبوي', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'images/icons/book1.png' };

    const narratorPill = document.getElementById('hdBillboardNarratorPill');
    const bookIcon = document.getElementById('hdBillboardBookIcon');
    const bookName = document.getElementById('hdBillboardBookName');
    const sanadEl = document.getElementById('hdBillboardSanad');
    const textEl = document.getElementById('hdBillboardText');
    const takhrijEl = document.getElementById('hdBillboardTakhrij');
    const billboardCard = document.getElementById('hdBillboardInnerCard');

    if (billboardCard) {
      billboardCard.classList.add('flip-transition');
      setTimeout(() => billboardCard.classList.remove('flip-transition'), 300);
    }

    if (narratorPill) {
      narratorPill.style.background = book.bg;
      narratorPill.style.color = book.color;
      narratorPill.style.borderColor = book.color;
    }
    if (bookIcon) bookIcon.src = book.icon;
    if (bookName) bookName.textContent = `${book.name} - ${h.title}`;
    if (sanadEl) sanadEl.textContent = h.sanad;
    if (textEl) textEl.textContent = h.text;
    if (takhrijEl) takhrijEl.innerHTML = `<i class="fas fa-certificate"></i> ${h.takhrij}`;
  }

  startBillboardAutoFlip() {
    this.stopBillboardAutoFlip();
    if (this.isBillboardPaused) return;

    this.progressElapsed = 0;
    const bar = document.getElementById('hdBillboardProgressBar');
    if (bar) bar.style.width = '0%';

    const stepMs = 50;
    this.progressInterval = setInterval(() => {
      if (this.isBillboardPaused) return;
      this.progressElapsed += stepMs;
      const pct = Math.min(100, (this.progressElapsed / this.flipDuration) * 100);
      if (bar) bar.style.width = `${pct}%`;

      if (this.progressElapsed >= this.flipDuration) {
        this.nextBillboardHadith();
      }
    }, stepMs);
  }

  stopBillboardAutoFlip() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  toggleBillboardPlay() {
    this.isBillboardPaused = !this.isBillboardPaused;
    const btn = document.getElementById('hdBillboardPlayBtn');
    const icon = btn ? btn.querySelector('i') : null;

    if (this.isBillboardPaused) {
      if (icon) icon.className = 'fas fa-play';
      this.stopBillboardAutoFlip();
    } else {
      if (icon) icon.className = 'fas fa-pause';
      this.startBillboardAutoFlip();
    }
  }

  nextBillboardHadith() {
    this.billboardIndex = (this.billboardIndex + 1) % this.hadiths.length;
    this.renderCurrentBillboard();
    this.startBillboardAutoFlip();
  }

  prevBillboardHadith() {
    this.billboardIndex = (this.billboardIndex - 1 + this.hadiths.length) % this.hadiths.length;
    this.renderCurrentBillboard();
    this.startBillboardAutoFlip();
  }

  pickRandomBillboardHadith() {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * this.hadiths.length);
    } while (nextIdx === this.billboardIndex && this.hadiths.length > 1);

    this.billboardIndex = nextIdx;
    this.renderCurrentBillboard();
    this.startBillboardAutoFlip();
  }

  // --- ACTIONS ---
  toggleBillboardSpeech() {
    const h = this.hadiths[this.billboardIndex];
    if (h) this.toggleSpeech(h.id);
  }

  toggleSpeech(id) {
    if (!this.speechSynth) {
      this.showToast('عذراً، متصفحك لا يدعم قراءة النصوص صوتياً.');
      return;
    }

    if (this.currentSpeakingId === id) {
      this.speechSynth.cancel();
      this.currentSpeakingId = null;
      this.renderCards();
      return;
    }

    this.speechSynth.cancel();
    const hadith = this.hadiths.find(h => h.id === id);
    if (!hadith) return;

    const textToSpeak = `${hadith.sanad || ''}. ${hadith.text}. ${hadith.takhrij}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;

    utterance.onend = () => {
      this.currentSpeakingId = null;
      this.renderCards();
    };
    utterance.onerror = () => {
      this.currentSpeakingId = null;
      this.renderCards();
    };

    this.currentSpeakingId = id;
    this.renderCards();
    this.speechSynth.speak(utterance);
  }

  copyHadith(id) {
    const h = this.hadiths.find(item => item.id === id);
    if (!h) return;
    const book = this.booksMap[h.bookId] || { name: '' };

    const text = `قال رسول الله ﷺ:\n${h.text}\n\n[${h.sanad}]\n[المصدر: ${book.name} - ${h.takhrij}]\n(تطبيق وذكّر)`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('تم نسخ الحديث الشريف بنجاح ✨');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  copyCurrentBillboard() {
    const h = this.hadiths[this.billboardIndex];
    if (h) this.copyHadith(h.id);
  }

  shareHadith(id) {
    const h = this.hadiths.find(item => item.id === id);
    if (!h) return;
    const book = this.booksMap[h.bookId] || { name: '' };

    const shareData = {
      title: `${h.title} - تطبيق وذكّر`,
      text: `${h.text}\n\nرواه: ${book.name} (${h.takhrij})`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      this.copyHadith(id);
    }
  }

  shareCurrentBillboard() {
    const h = this.hadiths[this.billboardIndex];
    if (h) this.shareHadith(h.id);
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.showToast('تم نسخ الحديث الشريف بنجاح ✨');
    } catch (e) {
      this.showToast('يرجى نسخ الحديث يدوياً');
    }
    document.body.removeChild(textarea);
  }

  showToast(msg) {
    if (window.showToast) {
      window.showToast(msg);
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'hd-toast-bubble';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 20);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  bindEvents() {
    // Live Search
    const searchInput = document.getElementById('hdSearchInput');
    const clearBtn = document.getElementById('hdSearchClear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) {
          if (this.searchQuery) clearBtn.classList.add('active');
          else clearBtn.classList.remove('active');
        }
        this.renderCards();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          clearBtn.classList.remove('active');
          this.renderCards();
        }
      });
    }

    // Billboard controls
    const prevBtn = document.getElementById('hdBillboardPrev');
    const nextBtn = document.getElementById('hdBillboardNext');
    const playBtn = document.getElementById('hdBillboardPlayBtn');
    const diceBtn = document.getElementById('hdBillboardDice');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prevBillboardHadith());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextBillboardHadith());
    if (playBtn) playBtn.addEventListener('click', () => this.toggleBillboardPlay());
    if (diceBtn) diceBtn.addEventListener('click', () => this.pickRandomBillboardHadith());

    // Pause on hover
    const billboardCard = document.getElementById('hdBillboardInnerCard');
    if (billboardCard) {
      billboardCard.addEventListener('mouseenter', () => {
        this.isBillboardPaused = true;
      });
      billboardCard.addEventListener('mouseleave', () => {
        const btn = document.getElementById('hdBillboardPlayBtn');
        const icon = btn ? btn.querySelector('i') : null;
        if (icon && icon.classList.contains('fa-play')) {
          return;
        }
        this.isBillboardPaused = false;
      });
    }
  }
}

window.WzkerHadithManager = WzkerHadithManager;

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.wzkerHadith = new WzkerHadithManager();
});
