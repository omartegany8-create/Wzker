/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER - QURAN STORIES MASTER CONTROLLER (js/quran-stories.js)
 * Fullscreen Studio Architecture: Cinema 16:9, Podcast Audio Studio,
 * Luxury Manuscript Reader, Smart Resume & Progress Engine
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerStoriesManager {
    constructor() {
      this.series = window.WZKER_STORIES_SERIES || [];
      this.stories = window.WZKER_STORIES_DATA || [];
      this.activeFilter = 'all'; // 'all' | 'prophets' | 'animals' | 'women' | 'nations' | 'bookmarks' | 'completed'
      this.searchQuery = '';

      this.favorites = this.loadState('wzker_stories_favs');
      this.completed = this.loadState('wzker_stories_completed');
      this.bookmarks = this.loadState('wzker_stories_bookmarks');
      this.lastVisited = this.loadLastVisited();

      this.currentStory = null;
      this.currentMode = 'video'; // 'video' | 'audio' | 'read'
      this.fontSize = 1.05; // rem
      this.isPlayingPodcast = false;
      this.podcastSpeed = 1.0;
      this.podcastProgressSeconds = 0;
      this.podcastTimer = null;
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
      this.renderSeriesGrid();
      this.renderFilterPills();
      this.renderResumeBox();
      this.renderCompletionProgress();
      this.renderCards();
      this.bindSearchEvents();
    }

    onOpen() {
      this.renderResumeBox();
      this.renderCompletionProgress();
      this.renderCards();
    }

    // ── LocalStorage Helpers ──
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

    loadLastVisited() {
      try {
        const raw = localStorage.getItem('wzker_stories_last_visited');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    saveLastVisited(storyId, mode = 'video') {
      try {
        const data = { storyId, mode, timestamp: Date.now() };
        localStorage.setItem('wzker_stories_last_visited', JSON.stringify(data));
        this.lastVisited = data;
        this.renderResumeBox();
      } catch (e) {
        console.warn('Failed saving last visited:', e);
      }
    }

    // ── 1. Catalog: Series Showcase ──
    renderSeriesGrid() {
      const container = document.getElementById('storiesSeriesGrid');
      if (!container) return;

      container.innerHTML = this.series.map(s => {
        const isActive = this.activeFilter === s.id;
        const count = this.stories.filter(item => item.seriesId === s.id).length;

        return `
          <div class="stories-series-card ${isActive ? 'active' : ''}" onclick="window.wzkerStories.setFilter('${s.id}')">
            <div class="stories-series-header">
              <div class="stories-series-icon-wrap">
                <img src="${s.icon}" alt="${s.title}">
              </div>
              <span class="stories-series-badge">${count} قصص</span>
            </div>
            <h3 class="stories-series-title">${s.title}</h3>
            <p class="stories-series-desc">${s.subtitle}</p>
          </div>
        `;
      }).join('');
    }

    // ── 2. Catalog: Filter Pills ──
    renderFilterPills() {
      const container = document.getElementById('storiesFilterPillsRow');
      if (!container) return;

      const filters = [
        { id: 'all', label: 'الكل', icon: 'fa-layer-group', count: this.stories.length },
        { id: 'prophets', label: 'الأنبياء والمرسلين', icon: 'fa-crown', count: this.stories.filter(s => s.seriesId === 'prophets').length },
        { id: 'animals', label: 'الحيوان والطير', icon: 'fa-dove', count: this.stories.filter(s => s.seriesId === 'animals').length },
        { id: 'women', label: 'سيدات القرآن', icon: 'fa-heart', count: this.stories.filter(s => s.seriesId === 'women').length },
        { id: 'nations', label: 'الأمم والآيات', icon: 'fa-book-quran', count: this.stories.filter(s => s.seriesId === 'nations').length },
        { id: 'bookmarks', label: 'المحفوظات', icon: 'fa-bookmark', count: this.bookmarks.size },
        { id: 'completed', label: 'المكتملة', icon: 'fa-check', count: this.completed.size }
      ];

      container.innerHTML = filters.map(f => {
        const isActive = this.activeFilter === f.id;
        return `
          <button type="button" class="stories-filter-pill ${isActive ? 'active' : ''}" onclick="window.wzkerStories.setFilter('${f.id}')">
            <i class="fa-solid ${f.icon}"></i>
            <span>${f.label}</span>
            <span class="stories-filter-count">${f.count}</span>
          </button>
        `;
      }).join('');
    }

    setFilter(filterId) {
      this.activeFilter = filterId;
      this.renderSeriesGrid();
      this.renderFilterPills();
      this.renderCards();
    }

    // ── 3. Catalog: Smart Resume Box ──
    renderResumeBox() {
      const box = document.getElementById('storiesResumeBox');
      if (!box) return;

      if (!this.lastVisited || !this.lastVisited.storyId) {
        box.classList.remove('has-bookmark');
        box.innerHTML = '';
        return;
      }

      const story = this.stories.find(s => s.id === this.lastVisited.storyId);
      if (!story) {
        box.classList.remove('has-bookmark');
        return;
      }

      box.classList.add('has-bookmark');
      const modeLabel = this.lastVisited.mode === 'video' ? 'مشاهدة سينما' : (this.lastVisited.mode === 'audio' ? 'استماع بودكاست' : 'قراءة الفصول');

      box.innerHTML = `
        <div class="stories-resume-info">
          <div class="stories-resume-icon">
            <img src="${story.heroIcon || 'images/icons/story1.png'}" alt="Story">
          </div>
          <div class="stories-resume-text">
            <h4>استئناف: ${story.title}</h4>
            <p>آخر توقف: ${modeLabel} • ${story.duration}</p>
          </div>
        </div>
        <button type="button" class="stories-resume-btn" onclick="window.wzkerStories.openStory('${story.id}', '${this.lastVisited.mode || 'video'}')">
          <i class="fa-solid fa-play"></i>
          <span>متابعة الآن</span>
        </button>
      `;
    }

    resumeLastStory() {
      if (this.lastVisited && this.lastVisited.storyId) {
        this.openStory(this.lastVisited.storyId, this.lastVisited.mode || 'video');
      } else if (this.stories.length > 0) {
        this.openStory(this.stories[0].id, 'video');
      }
    }

    // ── 4. Catalog: Progress Tracker ──
    renderCompletionProgress() {
      const valEl = document.getElementById('storiesProgressVal');
      const fillEl = document.getElementById('storiesProgressFill');
      if (!valEl || !fillEl) return;

      const total = this.stories.length;
      const done = this.completed.size;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      valEl.textContent = `${done} من ${total} قصة (${pct}%)`;
      fillEl.style.width = `${pct}%`;
    }

    // ── 5. Catalog: Story Cards Grid ──
    renderCards() {
      const container = document.getElementById('storiesCardsGrid');
      if (!container) return;

      let list = this.stories;

      // Filter by category or bookmark/completed
      if (this.activeFilter === 'bookmarks') {
        list = list.filter(item => this.bookmarks.has(item.id));
      } else if (this.activeFilter === 'completed') {
        list = list.filter(item => this.completed.has(item.id));
      } else if (this.activeFilter !== 'all') {
        list = list.filter(item => item.seriesId === this.activeFilter);
      }

      // Live search filter
      if (this.searchQuery) {
        const q = this.searchQuery.trim().toLowerCase();
        list = list.filter(item => 
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.surahRef.toLowerCase().includes(q) ||
          item.keyVerse.toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--card-bg); border-radius: 18px; border: 1px dashed var(--border-color);">
            <img src="images/icons/search.png" style="width: 48px; height: 48px; opacity: 0.35; margin-bottom: 10px;" alt="Search">
            <h4 style="font-size: 1.1rem; margin: 0 0 6px; color: var(--text-main);">لم يتم العثور على قصص مطابقة</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(item => {
        const isFav = this.favorites.has(item.id);
        const isBm = this.bookmarks.has(item.id);
        const isDone = this.completed.has(item.id);
        const seriesObj = this.series.find(s => s.id === item.seriesId);
        const seriesLabel = seriesObj ? seriesObj.title : 'قصص القرآن';

        return `
          <div class="story-card ${isDone ? 'completed' : ''}" id="storyCard_${item.id}">
            <div>
              <!-- Top Badges & Actions -->
              <div class="story-card-top">
                <div class="story-card-media-pills">
                  <span class="story-media-pill"><i class="fa-solid fa-video" style="color: var(--accent-gold);"></i> سينما</span>
                  <span class="story-media-pill"><i class="fa-solid fa-headphones" style="color: var(--primary);"></i> بودكاست</span>
                  <span class="story-media-pill"><i class="fa-solid fa-book-open" style="color: #2e7d32;"></i> قراءة</span>
                </div>
                <div class="story-card-actions-quick">
                  <button type="button" class="story-quick-icon-btn ${isFav ? 'fav-active' : ''}" 
                    onclick="window.wzkerStories.toggleFavorite('${item.id}')" title="${isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                  </button>
                  <button type="button" class="story-quick-icon-btn ${isBm ? 'bm-active' : ''}" 
                    onclick="window.wzkerStories.toggleBookmark('${item.id}')" title="${isBm ? 'إزالة العلامة' : 'حفظ علامة القراءة'}">
                    <i class="${isBm ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                  </button>
                </div>
              </div>

              <!-- Header Block: Icon + Title -->
              <div class="story-card-header-block" style="margin-top: 10px;">
                <div class="story-card-hero-icon">
                  <img src="${item.heroIcon || 'images/icons/story1.png'}" alt="${item.title}">
                </div>
                <div>
                  <h3 class="story-card-title">${item.title}</h3>
                  <div class="story-card-sub">${item.subtitle} • <span style="color: var(--primary); font-weight: 800;">${item.duration}</span></div>
                </div>
              </div>

              <!-- Key Verse Quote -->
              <div class="story-card-verse-box">
                <p class="story-card-verse-text">${item.keyVerse}</p>
              </div>

              <!-- Summary -->
              <p class="story-card-summary" style="margin-top: 10px;">${item.summary}</p>
            </div>

            <!-- Bottom Action Row: 3 Direct Studio Modes -->
            <div class="story-card-btns-row">
              <button type="button" class="story-btn-mode-trigger highlight" onclick="window.wzkerStories.openStory('${item.id}', 'video')">
                <i class="fa-solid fa-play"></i>
                <span>سينما</span>
              </button>
              <button type="button" class="story-btn-mode-trigger" onclick="window.wzkerStories.openStory('${item.id}', 'audio')">
                <i class="fa-solid fa-headphones"></i>
                <span>بودكاست</span>
              </button>
              <button type="button" class="story-btn-mode-trigger" onclick="window.wzkerStories.openStory('${item.id}', 'read')">
                <i class="fa-solid fa-book-open-reader"></i>
                <span>قراءة</span>
              </button>
            </div>

          </div>
        `;
      }).join('');
    }

    bindSearchEvents() {
      const input = document.getElementById('storiesSearchInput');
      const clearBtn = document.getElementById('storiesSearchClear');
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

    toggleFavorite(storyId) {
      if (this.favorites.has(storyId)) {
        this.favorites.delete(storyId);
      } else {
        this.favorites.add(storyId);
      }
      this.saveState('wzker_stories_favs', this.favorites);
      this.renderCards();
    }

    toggleBookmark(storyId) {
      if (this.bookmarks.has(storyId)) {
        this.bookmarks.delete(storyId);
      } else {
        this.bookmarks.add(storyId);
      }
      this.saveState('wzker_stories_bookmarks', this.bookmarks);
      this.renderFilterPills();
      this.renderCards();
    }

    // ══════════════════════════════════════════════════════════════════
    // VIEW 2: FULLSCREEN CINEMA & STUDIO CONTROLLER
    // ══════════════════════════════════════════════════════════════════
    openStory(storyId, mode = 'video') {
      const story = this.stories.find(s => s.id === storyId);
      if (!story) return;

      this.currentStory = story;
      this.currentMode = mode;
      this.saveLastVisited(story.id, mode);

      const catalogView = document.getElementById('storiesCatalogView');
      const playerView = document.getElementById('storiesPlayerView');
      if (!catalogView || !playerView) return;

      // Switch views seamlessly
      catalogView.style.display = 'none';
      playerView.style.display = 'flex';
      playerView.scrollTop = 0;

      // Update Player Topbar
      const seriesObj = this.series.find(s => s.id === story.seriesId);
      const seriesTag = document.getElementById('playerSeriesTag');
      if (seriesTag) seriesTag.textContent = seriesObj ? seriesObj.title : 'قصص القرآن الكريم';

      const titleEl = document.getElementById('playerStoryTitle');
      if (titleEl) titleEl.textContent = story.title;

      this.updateBookmarkButton();
      this.updateCompletedButton();
      this.updatePrevNextButtons();

      // Render Active Mode
      this.switchPlayerMode(mode, false);

      // Render Moral Lessons
      this.renderPlayerLessons();
    }

    closeStoryPlayer() {
      this.stopVideoPlayer();
      this.stopPodcastAudio();

      const catalogView = document.getElementById('storiesCatalogView');
      const playerView = document.getElementById('storiesPlayerView');
      if (catalogView && playerView) {
        playerView.style.display = 'none';
        catalogView.style.display = 'block';
      }

      this.currentStory = null;
      this.renderResumeBox();
      this.renderCompletionProgress();
      this.renderCards();
    }

    switchPlayerMode(newMode, shouldStopAudio = true) {
      if (shouldStopAudio && this.currentMode === 'audio' && newMode !== 'audio') {
        this.stopPodcastAudio();
      }

      this.currentMode = newMode;
      this.saveLastVisited(this.currentStory.id, newMode);

      // Update Switcher Buttons
      const buttons = document.querySelectorAll('.story-mode-switch-btn');
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === newMode);
      });

      // Render Stage Content
      const stage = document.getElementById('storiesStageContent');
      if (!stage || !this.currentStory) return;

      if (newMode === 'video') {
        this.renderVideoStage(stage);
      } else if (newMode === 'audio') {
        this.renderAudioStage(stage);
      } else {
        this.renderReaderStage(stage);
      }
    }

    // ── Stage 1: Cinema Video Player ──
    renderVideoStage(container) {
      const story = this.currentStory;
      // Standard YouTube embed URL
      const embedUrl = `https://www.youtube.com/embed/${story.videoId}?autoplay=1&rel=0&playsinline=1`;

      container.innerHTML = `
        <div class="stories-video-stage">
          <!-- 16:9 Cinema Screen -->
          <div class="stories-cinema-screen">
            <iframe 
              src="${embedUrl}" 
              title="${story.title}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>

          <!-- Video Metadata Strip -->
          <div class="stories-video-meta-bar">
            <div class="stories-video-meta-info">
              <span class="stories-meta-tag">
                <i class="fa-solid fa-clock"></i>
                <span>${story.duration}</span>
              </span>
              <span class="stories-meta-tag">
                <i class="fa-solid fa-book-quran"></i>
                <span>${story.surahRef}</span>
              </span>
            </div>
            <a href="https://www.youtube.com/watch?v=${story.videoId}" target="_blank" rel="noopener noreferrer" class="stories-direct-watch-btn">
              <i class="fa-brands fa-youtube"></i>
              <span>فتح على يوتيوب مباشرة</span>
            </a>
          </div>

          <!-- Story Summary Card -->
          <div class="stories-stage-summary-card">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <i class="fa-solid fa-quote-right" style="color: var(--accent-gold); font-size: 1.1rem;"></i>
              <strong style="color: var(--text-main); font-size: 1rem;">نبذة عن القصة:</strong>
            </div>
            ${story.summary}
          </div>
        </div>
      `;
    }

    stopVideoPlayer() {
      const stage = document.getElementById('storiesStageContent');
      if (stage && this.currentMode === 'video') {
        stage.innerHTML = '';
      }
    }

    // ── Stage 2: Audio Podcast Studio ──
    renderAudioStage(container) {
      const story = this.currentStory;

      container.innerHTML = `
        <div class="stories-audio-stage">
          <div class="stories-podcast-studio ${this.isPlayingPodcast ? 'playing' : ''}" id="podcastStudioCard">
            <!-- Studio Crest Artwork -->
            <div class="stories-podcast-artwork">
              <img src="${story.heroIcon || 'images/icons/story1.png'}" alt="${story.title}">
            </div>

            <!-- Titles -->
            <div class="stories-podcast-titles">
              <h3>استوديو السرد الصوتي: ${story.title}</h3>
              <p>${story.surahRef} • ${story.duration}</p>
            </div>

            <!-- Dynamic Equalizer Soundwave -->
            <div class="stories-soundwave">
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
              <div class="stories-wave-bar"></div>
            </div>

            <!-- Scrubber & Timers -->
            <div class="stories-audio-progress-wrap">
              <input type="range" class="stories-audio-slider" id="podcastSlider" min="0" max="100" value="0" oninput="window.wzkerStories.onSeekPodcast(this.value)">
              <div class="stories-audio-timestamps">
                <span id="podcastCurTime">00:00</span>
                <span id="podcastTotalTime">${story.duration}</span>
              </div>
            </div>

            <!-- Control Buttons Deck -->
            <div class="stories-podcast-controls">
              <button type="button" class="stories-audio-btn-sub" onclick="window.wzkerStories.skipPodcast(-10)" title="تراجع ١٠ ثوانٍ">
                <i class="fa-solid fa-rotate-left"></i>
              </button>

              <button type="button" class="stories-audio-btn-play" id="podcastPlayBtn" onclick="window.wzkerStories.togglePodcastAudio()" title="تشغيل / إيقاف">
                <i class="fa-solid ${this.isPlayingPodcast ? 'fa-pause' : 'fa-play'}"></i>
              </button>

              <button type="button" class="stories-audio-btn-sub" onclick="window.wzkerStories.skipPodcast(10)" title="تقديم ١٠ ثوانٍ">
                <i class="fa-solid fa-rotate-right"></i>
              </button>

              <button type="button" class="stories-speed-pill" id="podcastSpeedBtn" onclick="window.wzkerStories.cyclePodcastSpeed()" title="سرعة التشغيل">
                ${this.podcastSpeed}x
              </button>
            </div>
          </div>

          <!-- Chapters Live Narration Box -->
          <div class="stories-stage-summary-card">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <i class="fa-solid fa-podcast" style="color: var(--primary); font-size: 1.1rem;"></i>
              <strong style="color: var(--text-main); font-size: 1rem;">نص السرد الصوتي المباشر:</strong>
            </div>
            <div id="podcastNarrationText" style="line-height: 1.9; color: var(--text-main); font-size: 0.95rem;">
              ${story.chapters.map((c, i) => `
                <div style="margin-bottom: 12px; padding: 10px 14px; border-radius: 12px; background: var(--surface-trans);">
                  <strong style="color: var(--primary); display: block; margin-bottom: 4px;">${c.title}</strong>
                  <span>${c.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    togglePodcastAudio() {
      if (this.isPlayingPodcast) {
        this.stopPodcastAudio();
      } else {
        this.startPodcastAudio();
      }
    }

    startPodcastAudio() {
      if (!this.currentStory) return;

      this.isPlayingPodcast = true;
      const studioCard = document.getElementById('podcastStudioCard');
      if (studioCard) studioCard.classList.add('playing');

      const playBtn = document.getElementById('podcastPlayBtn');
      if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

      // Start narration speech synthesis
      if (this.speechSynth) {
        this.speechSynth.cancel(); // clear previous
        const allText = this.currentStory.chapters.map(c => `${c.title}. ${c.text}`).join(' ');
        this.currentUtterance = new SpeechSynthesisUtterance(allText);
        this.currentUtterance.lang = 'ar-SA';
        this.currentUtterance.rate = this.podcastSpeed;

        this.currentUtterance.onend = () => {
          this.stopPodcastAudio();
        };

        this.currentUtterance.onerror = () => {
          // If speech synth fails or unsupported, we continue visual progress
        };

        this.speechSynth.speak(this.currentUtterance);
      }

      // Progress interval ticker
      if (this.podcastTimer) clearInterval(this.podcastTimer);
      this.podcastTimer = setInterval(() => {
        this.podcastProgressSeconds += 1;
        this.updatePodcastUI();
      }, 1000);
    }

    stopPodcastAudio() {
      this.isPlayingPodcast = false;
      if (this.podcastTimer) {
        clearInterval(this.podcastTimer);
        this.podcastTimer = null;
      }
      if (this.speechSynth) {
        this.speechSynth.cancel();
      }

      const studioCard = document.getElementById('podcastStudioCard');
      if (studioCard) studioCard.classList.remove('playing');

      const playBtn = document.getElementById('podcastPlayBtn');
      if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    updatePodcastUI() {
      const curTimeEl = document.getElementById('podcastCurTime');
      const sliderEl = document.getElementById('podcastSlider');
      if (!curTimeEl || !sliderEl) return;

      const mins = Math.floor(this.podcastProgressSeconds / 60).toString().padStart(2, '0');
      const secs = (this.podcastProgressSeconds % 60).toString().padStart(2, '0');
      curTimeEl.textContent = `${mins}:${secs}`;

      // Estimated total 14 mins ~ 840s
      const totalSec = 840;
      const pct = Math.min(100, Math.round((this.podcastProgressSeconds / totalSec) * 100));
      sliderEl.value = pct;
    }

    onSeekPodcast(val) {
      const totalSec = 840;
      this.podcastProgressSeconds = Math.round((val / 100) * totalSec);
      this.updatePodcastUI();
    }

    skipPodcast(seconds) {
      this.podcastProgressSeconds = Math.max(0, this.podcastProgressSeconds + seconds);
      this.updatePodcastUI();
    }

    cyclePodcastSpeed() {
      const speeds = [1.0, 1.25, 1.5, 2.0];
      const nextIdx = (speeds.indexOf(this.podcastSpeed) + 1) % speeds.length;
      this.podcastSpeed = speeds[nextIdx];

      const btn = document.getElementById('podcastSpeedBtn');
      if (btn) btn.textContent = `${this.podcastSpeed}x`;

      if (this.isPlayingPodcast) {
        // Restart speech with new rate
        this.stopPodcastAudio();
        this.startPodcastAudio();
      }
    }

    // ── Stage 3: Luxury Reader Stage ──
    renderReaderStage(container) {
      const story = this.currentStory;

      container.innerHTML = `
        <div class="stories-reader-stage">
          <!-- Key Quranic Verse Showcase -->
          <div class="stories-quran-verse-card">
            <div class="stories-quran-verse-header">
              <span class="stories-surah-ref-badge">${story.surahRef}</span>
              <button type="button" class="stories-copy-ayah-btn" onclick="window.wzkerStories.copyKeyVerse()">
                <i class="fa-regular fa-copy"></i>
                <span>نسخ الآية الكريمة</span>
              </button>
            </div>
            <p class="stories-quran-verse-main">${story.keyVerse}</p>
          </div>

          <!-- Chapters Flow -->
          <div class="stories-chapters-flow">
            ${story.chapters.map((ch, idx) => `
              <div class="story-chapter-card">
                <div class="story-chapter-title-row">
                  <span class="story-chapter-number-badge">${idx + 1}</span>
                  <h4 class="story-chapter-title">${ch.title}</h4>
                </div>
                <p class="story-chapter-text" style="font-size: ${this.fontSize}rem;">${ch.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    copyKeyVerse() {
      if (!this.currentStory) return;
      const text = `${this.currentStory.keyVerse}\n[${this.currentStory.surahRef}]`;
      navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ الآية الكريمة بنجاح');
      }).catch(() => {
        prompt('انسخ الآية:', text);
      });
    }

    adjustFontSize(delta) {
      this.fontSize = Math.min(1.4, Math.max(0.85, this.fontSize + delta));
      document.documentElement.style.setProperty('--story-font-size', `${this.fontSize}rem`);
      const texts = document.querySelectorAll('.story-chapter-text');
      texts.forEach(el => el.style.fontSize = `${this.fontSize}rem`);
    }

    // ── Moral Lessons Box ──
    renderPlayerLessons() {
      const box = document.getElementById('storiesLessonsBox');
      if (!box || !this.currentStory) return;

      const lessons = this.currentStory.lessons || [];
      if (lessons.length === 0) {
        box.innerHTML = '';
        return;
      }

      box.innerHTML = `
        <div class="stories-lessons-header">
          <img src="images/icons/bulb-ideas1.png" alt="Lessons">
          <h4>دروس وعبر وعظات مستفادة من القصة</h4>
        </div>
        <ul class="stories-lessons-list">
          ${lessons.map(item => `
            <li class="stories-lesson-item">
              <span class="stories-lesson-bullet"><i class="fa-solid fa-check"></i></span>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ── Player Bottom & Header Controls ──
    updateBookmarkButton() {
      const btn = document.getElementById('playerBookmarkBtn');
      if (!btn || !this.currentStory) return;
      const isBm = this.bookmarks.has(this.currentStory.id);
      btn.classList.toggle('active', isBm);
      btn.innerHTML = `<i class="${isBm ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>`;
    }

    toggleBookmarkCurrent() {
      if (!this.currentStory) return;
      this.toggleBookmark(this.currentStory.id);
      this.updateBookmarkButton();
    }

    updateCompletedButton() {
      const btn = document.getElementById('playerDoneBtn');
      if (!btn || !this.currentStory) return;
      const isDone = this.completed.has(this.currentStory.id);
      btn.classList.toggle('is-completed', isDone);
      btn.innerHTML = isDone
        ? '<i class="fa-solid fa-circle-check"></i><span>تم إكمال القصة بنجاح</span>'
        : '<i class="fa-solid fa-check"></i><span>تحديد القصة كـ مكتملة</span>';
    }

    toggleCompletedCurrent() {
      if (!this.currentStory) return;
      const id = this.currentStory.id;
      if (this.completed.has(id)) {
        this.completed.delete(id);
      } else {
        this.completed.add(id);
      }
      this.saveState('wzker_stories_completed', this.completed);
      this.updateCompletedButton();
      this.renderCompletionProgress();
      this.renderFilterPills();
    }

    updatePrevNextButtons() {
      const prevBtn = document.getElementById('playerPrevStoryBtn');
      const nextBtn = document.getElementById('playerNextStoryBtn');
      if (!prevBtn || !nextBtn || !this.currentStory) return;

      const idx = this.stories.findIndex(s => s.id === this.currentStory.id);
      prevBtn.disabled = idx <= 0;
      prevBtn.style.opacity = idx <= 0 ? '0.4' : '1';

      nextBtn.disabled = idx >= this.stories.length - 1;
      nextBtn.style.opacity = idx >= this.stories.length - 1 ? '0.4' : '1';
    }

    navigateStory(direction) {
      if (!this.currentStory) return;
      const idx = this.stories.findIndex(s => s.id === this.currentStory.id);
      const targetIdx = idx + direction;
      if (targetIdx >= 0 && targetIdx < this.stories.length) {
        this.openStory(this.stories[targetIdx].id, this.currentMode);
      }
    }

    shareCurrentStory() {
      if (!this.currentStory) return;
      const s = this.currentStory;
      const text = `📖 موسوعة قصص القرآن الكريم - وذكر\n\n📌 ${s.title} (${s.subtitle})\n📖 ${s.surahRef}\n\n${s.keyVerse}\n\n${s.summary}\n\nتطبيق وذكر للأذكار والقرآن الكريم`;

      if (navigator.share) {
        navigator.share({
          title: s.title,
          text: text,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text).then(() => {
          alert('تم نسخ ملخص القصة إلى الحافظة للمشاركة');
        }).catch(() => {
          prompt('انسخ نص القصة للمشاركة:', text);
        });
      }
    }
  }

  // Expose global instance
  window.wzkerStories = new WzkerStoriesManager();
})();
