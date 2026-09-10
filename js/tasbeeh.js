/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL TASBEEH CONTROLLER (js/tasbeeh.js) - PRO EDITION
 * Physical Interactive Bead Ring Engine, Sequential Chain Dhikr Playlists,
 * Audio Synthesis (Wood Pebble Click & Crystal Chimes), Haptics,
 * Stillness Breaks, Habit Streaks & Dhikr Distribution Analytics.
 * STRICT ZERO EMOJIS ADHERENCE
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerTasbeeh {
    constructor() {
      this.mode = 'single'; // 'single' | 'chain' | 'timed'
      this.currentDhikrIndex = 0;
      this.currentChainIndex = 0;
      this.currentChainStep = 0;
      
      this.count = 0;
      this.target = 33;
      this.laps = 0;
      this.totalSessionCount = 0;
      
      this.currentThemeId = 'theme_obsidian';
      this.currentNiyyahId = 'general';
      this.feedbackMode = 'sound_and_haptic'; // 'sound_and_haptic' | 'haptic' | 'sound' | 'silent'
      
      this.audioCtx = null;
      this.ringRotationDeg = 0;
      this.visibleBeadsCount = 33;

      // Timed Mode variables
      this.timedTotalSec = 300; // 5 mins default
      this.timedRemainingSec = 300;
      this.timedTimer = null;
      this.isTimedRunning = false;

      // Storage keys
      this.storageKeys = {
        streak: 'wzker_tasbeeh_streak_v1',
        history: 'wzker_tasbeeh_history_v1',
        distribution: 'wzker_tasbeeh_distribution_v1',
        prefs: 'wzker_tasbeeh_prefs_v1'
      };

      this.streakData = { count: 1, lastDate: '', weekHistory: {} };
      this.distributionData = {
        tasbeeh: 0,
        tahmeed: 0,
        takbeer: 0,
        istighfar: 0,
        salawat: 0,
        hawqala: 0,
        other: 0
      };

      // Initialize on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.loadStorage();
      this.updateStreakForToday(false);
      this.renderStreakBanner();
      this.renderCapsules();
      this.renderBeadRing();
      this.updateUI();
      this.bindEvents();
    }

    // ── 1. STORAGE & STATE MANAGEMENT ──
    loadStorage() {
      try {
        const savedPrefs = localStorage.getItem(this.storageKeys.prefs);
        if (savedPrefs) {
          const p = JSON.parse(savedPrefs);
          this.currentThemeId = p.themeId || this.currentThemeId;
          this.currentNiyyahId = p.niyyahId || this.currentNiyyahId;
          this.feedbackMode = p.feedbackMode || this.feedbackMode;
        }

        const savedStreak = localStorage.getItem(this.storageKeys.streak);
        if (savedStreak) {
          this.streakData = Object.assign(this.streakData, JSON.parse(savedStreak));
        }

        const savedDist = localStorage.getItem(this.storageKeys.distribution);
        if (savedDist) {
          this.distributionData = Object.assign(this.distributionData, JSON.parse(savedDist));
        }
      } catch (e) {
        console.warn('Failed to load tasbeeh storage:', e);
      }
    }

    savePrefs() {
      try {
        const p = {
          themeId: this.currentThemeId,
          niyyahId: this.currentNiyyahId,
          feedbackMode: this.feedbackMode
        };
        localStorage.setItem(this.storageKeys.prefs, JSON.stringify(p));
      } catch (e) {}
    }

    saveStats() {
      try {
        localStorage.setItem(this.storageKeys.streak, JSON.stringify(this.streakData));
        localStorage.setItem(this.storageKeys.distribution, JSON.stringify(this.distributionData));
      } catch (e) {}
    }

    // ── 2. STREAK & HABIT TRACKER ENGINE ──
    getTodayKey() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    updateStreakForToday(incrementDhikr = true) {
      const today = this.getTodayKey();
      if (!this.streakData.weekHistory) this.streakData.weekHistory = {};

      if (incrementDhikr) {
        this.streakData.weekHistory[today] = (this.streakData.weekHistory[today] || 0) + 1;
      }

      if (this.streakData.lastDate !== today) {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        if (this.streakData.lastDate === yKey) {
          this.streakData.count = (this.streakData.count || 0) + 1;
        } else if (!this.streakData.lastDate) {
          this.streakData.count = 1;
        } else {
          // Gap > 1 day, reset streak
          this.streakData.count = 1;
        }
        this.streakData.lastDate = today;
      }

      this.saveStats();
    }

    renderStreakBanner() {
      const daysCountEl = document.getElementById('tasbeehStreakDaysCount');
      if (daysCountEl) {
        daysCountEl.textContent = `${this.streakData.count || 1} أيام متتالية`;
      }

      const calContainer = document.getElementById('tasbeehWeekCalendar');
      if (!calContainer) return;

      const dayNames = ['سبت', 'أحد', 'إثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة'];
      const now = new Date();
      const currentDayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat

      // Arabic week starts on Saturday (idx 0 = Sat, 6 = Fri)
      // JS: Sun = 0, Mon = 1 ... Sat = 6
      const remappedToday = (currentDayOfWeek + 1) % 7;

      let html = '';
      for (let i = 0; i < 7; i++) {
        const isToday = i === remappedToday;
        // Check if user completed tasbeeh on this day
        const dayOffset = i - remappedToday;
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);
        const tKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

        const isDone = (this.streakData.weekHistory && (this.streakData.weekHistory[tKey] || 0) > 0) || (isToday && this.totalSessionCount > 0);
        const cls = `tasbeeh-week-day-dot ${isDone ? 'active' : ''} ${isToday ? 'today' : ''}`;
        const content = isDone ? '<i class="fa-solid fa-check"></i>' : dayNames[i];

        html += `<div class="${cls}" title="${dayNames[i]}">${content}</div>`;
      }

      calContainer.innerHTML = html;
    }

    // ── 3. AUDIO SYNTHESIS & HAPTIC FEEDBACK ENGINE ──
    initAudio() {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    playWoodClick() {
      if (this.feedbackMode === 'haptic' || this.feedbackMode === 'silent') return;
      try {
        this.initAudio();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;

        // Realistic wooden bead impact: short resonance + damped click
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Theme-tuned frequencies
        let baseFreq = 950;
        if (this.currentThemeId === 'theme_wood') baseFreq = 720;
        if (this.currentThemeId === 'theme_pearl') baseFreq = 1200;
        if (this.currentThemeId === 'theme_turquoise') baseFreq = 850;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    }

    playCycleChime() {
      if (this.feedbackMode === 'haptic' || this.feedbackMode === 'silent') return;
      try {
        this.initAudio();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.18, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.65);
        });
      } catch (e) {}
    }

    triggerHaptic(isCycleComplete = false) {
      if (this.feedbackMode === 'sound' || this.feedbackMode === 'silent') return;
      try {
        if (navigator && typeof navigator.vibrate === 'function') {
          if (isCycleComplete) {
            navigator.vibrate([45, 30, 60, 30, 90]);
          } else {
            navigator.vibrate(30);
          }
        }
      } catch (e) {}
    }

    // ── 4. BEAD RING SVG GENERATION & ANIMATION ──
    renderBeadRing() {
      const svg = document.getElementById('tasbeehSvgRing');
      if (!svg) return;

      const activeTheme = window.WZKER_TASBEEH_DATA.themes.find(t => t.id === this.currentThemeId) || window.WZKER_TASBEEH_DATA.themes[0];
      const radius = 135;
      const center = 160;
      const count = this.visibleBeadsCount; // 33 beads

      let svgHtml = `
        <defs>
          <radialGradient id="beadGradNorm" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#7a5245" />
            <stop offset="60%" stop-color="${activeTheme.previewBead}" />
            <stop offset="100%" stop-color="#0a0504" />
          </radialGradient>
          <radialGradient id="beadGradActive" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fff0e6" />
            <stop offset="50%" stop-color="${activeTheme.previewAccent}" />
            <stop offset="100%" stop-color="#804a2d" />
          </radialGradient>
          <filter id="beadGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Ring Wire Guide -->
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(210, 149, 113, 0.2)" stroke-width="1.5" stroke-dasharray="4 4" />
      `;

      const progress = this.target > 0 ? (this.count % this.target) : (this.count % 33);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);

        const isFilled = i < progress;
        const isCurrent = i === progress;

        const fill = isFilled ? 'url(#beadGradActive)' : 'url(#beadGradNorm)';
        const stroke = isCurrent ? activeTheme.previewAccent : (isFilled ? activeTheme.previewAccent : 'rgba(210, 149, 113, 0.3)');
        const strokeW = isCurrent ? 2.5 : 1;
        const filter = isFilled ? 'filter="url(#beadGlow)"' : '';
        const r = isCurrent ? 9.5 : (isFilled ? 8.5 : 7.5);

        svgHtml += `
          <circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${filter} style="transition: all 0.2s ease;" />
        `;
      }

      svg.innerHTML = svgHtml;
    }

    // ── 5. USER INTERACTION: TAP & PROGRESS ──
    handleTap(event) {
      this.initAudio();

      // Ripple particle at tap location
      this.spawnTapRipple(event);

      // Increment counts
      this.count++;
      this.totalSessionCount++;

      // Log distribution category
      const currentDhikr = this.getCurrentDhikr();
      const cat = currentDhikr ? (currentDhikr.category || 'other') : 'other';
      this.distributionData[cat] = (this.distributionData[cat] || 0) + 1;

      // Update streak for today
      this.updateStreakForToday(true);

      // Rotate beads visually (1 step = 360 / 33 deg)
      this.ringRotationDeg += (360 / this.visibleBeadsCount);
      const svg = document.getElementById('tasbeehSvgRing');
      if (svg) {
        svg.style.transform = `rotate(${this.ringRotationDeg - 90}deg)`;
      }

      // Check Target Reached
      let isCycleComplete = false;
      if (this.target > 0 && this.count >= this.target) {
        isCycleComplete = true;
        this.laps++;
        this.count = 0;

        if (this.mode === 'chain') {
          this.advanceChainStep();
        } else {
          this.playCycleChime();
          this.triggerHaptic(true);
        }
      } else {
        this.playWoodClick();
        this.triggerHaptic(false);
      }

      this.renderBeadRing();
      this.updateCounterDisplays();
      this.saveStats();
    }

    spawnTapRipple(e) {
      const orb = document.getElementById('tasbeehCenterOrb');
      if (!orb) return;

      const rect = orb.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'tasbeeh-tap-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      orb.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 550);
    }

    // ── 6. SEQUENTIAL CHAIN LOGIC (وضع الذكر المتسلسل) ──
    advanceChainStep() {
      const chain = window.WZKER_TASBEEH_DATA.chains[this.currentChainIndex];
      if (!chain) return;

      this.playCycleChime();
      this.triggerHaptic(true);

      if (this.currentChainStep < chain.steps.length - 1) {
        this.currentChainStep++;
        const nextStep = chain.steps[this.currentChainStep];
        this.target = nextStep.target;
        this.count = 0;
        this.updateChainUI();
        if (window.showToast) {
          window.showToast(`انتقل الورد للذكر التالي: ${nextStep.text.substring(0, 24)}...`);
        }
      } else {
        // Complete Entire Chain Routine!
        this.currentChainStep = 0;
        this.target = chain.steps[0].target;
        this.count = 0;
        this.updateChainUI();
        if (window.showToast) {
          window.showToast('مبارك! اكتمل الورد كاملاً بحمد الله وفضله');
        }
      }
    }

    setChainRoutine(chainIndex) {
      this.mode = 'chain';
      this.currentChainIndex = chainIndex;
      this.currentChainStep = 0;
      const chain = window.WZKER_TASBEEH_DATA.chains[chainIndex];
      if (chain) {
        this.target = chain.steps[0].target;
        this.count = 0;
        this.laps = 0;
      }
      this.updateUI();
      this.closeModal('tasbeehPlaylistDrawer');
    }

    // ── 7. TIMED SESSION LOGIC (الجلسات المؤقتة) ──
    setTimedMode(minutes) {
      this.mode = 'timed';
      this.timedTotalSec = minutes * 60;
      this.timedRemainingSec = this.timedTotalSec;
      this.count = 0;
      this.target = 0; // Infinite count during time
      this.laps = 0;
      this.startTimedSession();
      this.updateUI();
      this.closeModal('tasbeehPlaylistDrawer');
    }

    startTimedSession() {
      this.isTimedRunning = true;
      if (this.timedTimer) clearInterval(this.timedTimer);

      this.timedTimer = setInterval(() => {
        if (this.timedRemainingSec > 0) {
          this.timedRemainingSec--;
          this.updateTimedDisplay();
        } else {
          this.finishTimedSession();
        }
      }, 1000);
      this.updateTimedDisplay();
    }

    updateTimedDisplay() {
      const el = document.getElementById('tasbeehTimerDisplay');
      if (!el) return;
      const m = Math.floor(this.timedRemainingSec / 60);
      const s = this.timedRemainingSec % 60;
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    finishTimedSession() {
      clearInterval(this.timedTimer);
      this.isTimedRunning = false;
      this.playCycleChime();
      this.triggerHaptic(true);

      const mins = Math.max(1, Math.round(this.timedTotalSec / 60));
      const rate = Math.round(this.count / (this.timedTotalSec / 60));

      const titleEl = document.getElementById('tasbeehCelebrationTitle');
      const countEl = document.getElementById('tasbeehCelebrationCount');
      const rateEl = document.getElementById('tasbeehCelebrationRate');

      if (titleEl) titleEl.textContent = `اكتملت جلسة الـ ${mins} دقائق المباركة`;
      if (countEl) countEl.textContent = `${this.count} تسبيحة`;
      if (rateEl) rateEl.textContent = `${rate} تسبيحة / دقيقة`;

      this.openModal('tasbeehCelebrationModal');
    }

    // ── 8. STILLNESS BREAK & ZEN MODE ──
    openStillnessBreak() {
      if (this.isTimedRunning && this.timedTimer) {
        clearInterval(this.timedTimer);
      }

      const overlay = document.getElementById('tasbeehStillnessOverlay');
      if (!overlay) return;

      // Random quote
      const quotes = window.WZKER_TASBEEH_DATA.stillnessQuotes;
      const q = quotes[Math.floor(Math.random() * quotes.length)];

      const verseEl = document.getElementById('tasbeehStillnessVerse');
      const refEl = document.getElementById('tasbeehStillnessRef');
      if (verseEl) verseEl.textContent = q.verse;
      if (refEl) refEl.textContent = q.reflection;

      overlay.classList.add('active');
    }

    resumeFromStillness() {
      const overlay = document.getElementById('tasbeehStillnessOverlay');
      if (overlay) overlay.classList.remove('active');

      if (this.mode === 'timed' && this.timedRemainingSec > 0) {
        this.startTimedSession();
      }
    }

    openZenScreen() {
      const zen = document.getElementById('tasbeehZenScreen');
      if (!zen) return;
      zen.classList.add('active');
      this.updateZenDisplay();
    }

    closeZenScreen() {
      const zen = document.getElementById('tasbeehZenScreen');
      if (zen) zen.classList.remove('active');
      this.updateCounterDisplays();
    }

    updateZenDisplay() {
      const numEl = document.getElementById('tasbeehZenHugeNum');
      const subEl = document.getElementById('tasbeehZenSubText');
      if (numEl) numEl.textContent = this.count;
      if (subEl) {
        const dhikr = this.getCurrentDhikr();
        subEl.textContent = dhikr ? dhikr.title : 'سبحان الله';
      }
    }

    // ── 9. DHIKR SELECTION & CAPSULES ──
    getCurrentDhikr() {
      if (this.mode === 'chain') {
        const chain = window.WZKER_TASBEEH_DATA.chains[this.currentChainIndex];
        if (chain && chain.steps[this.currentChainStep]) {
          return {
            title: chain.steps[this.currentChainStep].text,
            fadl: chain.description,
            source: chain.subtitle,
            category: 'chain'
          };
        }
      }
      return window.WZKER_TASBEEH_DATA.dhikrs[this.currentDhikrIndex];
    }

    renderCapsules() {
      const container = document.getElementById('tasbeehCapsulesScroll');
      if (!container) return;

      let html = '';
      window.WZKER_TASBEEH_DATA.dhikrs.forEach((d, idx) => {
        const isActive = this.mode === 'single' && idx === this.currentDhikrIndex;
        html += `
          <div class="tasbeeh-capsule-item ${isActive ? 'active' : ''}" onclick="window.wzkerTasbeeh.selectSingleDhikr(${idx})">
            <img src="${d.icon}" alt="${d.shortName}">
            <span>${d.shortName}</span>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    selectSingleDhikr(idx) {
      this.mode = 'single';
      this.currentDhikrIndex = idx;
      const d = window.WZKER_TASBEEH_DATA.dhikrs[idx];
      this.target = d.defaultTarget || 33;
      this.count = 0;
      this.laps = 0;
      this.updateUI();
    }

    // ── 10. UI & DISPLAY SYNCHRONIZATION ──
    updateUI() {
      // Toggle mode buttons
      document.querySelectorAll('.tasbeeh-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === this.mode);
      });

      // Chain Banner Visibility
      const chainCard = document.getElementById('tasbeehChainCard');
      if (chainCard) {
        chainCard.classList.toggle('active', this.mode === 'chain');
        if (this.mode === 'chain') this.updateChainUI();
      }

      // Capsules Visibility
      const capsulesWrap = document.getElementById('tasbeehCapsulesWrap');
      if (capsulesWrap) {
        capsulesWrap.style.display = this.mode === 'single' ? 'block' : 'none';
        this.renderCapsules();
      }

      // Timed Bar Visibility
      const timedBar = document.getElementById('tasbeehTimedBar');
      if (timedBar) {
        timedBar.classList.toggle('active', this.mode === 'timed');
        this.updateTimedDisplay();
      }

      // Niyyah Badge
      const activeNiyyah = window.WZKER_TASBEEH_DATA.intentions.find(n => n.id === this.currentNiyyahId) || window.WZKER_TASBEEH_DATA.intentions[0];
      const niyyahText = document.getElementById('tasbeehNiyyahLabel');
      const niyyahIcon = document.getElementById('tasbeehNiyyahIcon');
      if (niyyahText) niyyahText.textContent = activeNiyyah.label;
      if (niyyahIcon) niyyahIcon.src = activeNiyyah.icon;

      this.updateCounterDisplays();
      this.updateDhikrCard();
      this.renderBeadRing();
      this.renderStreakBanner();
    }

    updateCounterDisplays() {
      const numEl = document.getElementById('tasbeehHugeCounter');
      if (numEl) numEl.textContent = this.count;

      const targetEl = document.getElementById('tasbeehTargetBadge');
      if (targetEl) {
        targetEl.textContent = this.target > 0 ? `/ ${this.target}` : '∞ حر';
      }

      const lapEl = document.getElementById('tasbeehLapBadge');
      if (lapEl) {
        lapEl.textContent = `دورة ${this.laps + 1}`;
      }

      const previewEl = document.getElementById('tasbeehOrbDhikrPreview');
      if (previewEl) {
        const dhikr = this.getCurrentDhikr();
        previewEl.textContent = dhikr ? dhikr.title : 'سبحان الله';
      }

      this.updateZenDisplay();
    }

    updateDhikrCard() {
      const dhikr = this.getCurrentDhikr();
      if (!dhikr) return;

      const mainText = document.getElementById('tasbeehDhikrMainText');
      const fadlText = document.getElementById('tasbeehDhikrFadlText');
      const sourceTag = document.getElementById('tasbeehDhikrSourceTag');

      if (mainText) mainText.textContent = dhikr.title;
      if (fadlText) fadlText.textContent = dhikr.fadl || '';
      if (sourceTag) sourceTag.textContent = dhikr.source || '';
    }

    updateChainUI() {
      const chain = window.WZKER_TASBEEH_DATA.chains[this.currentChainIndex];
      if (!chain) return;

      const titleEl = document.getElementById('tasbeehChainTitle');
      if (titleEl) titleEl.textContent = chain.title;

      const stepsContainer = document.getElementById('tasbeehChainStepsTrack');
      if (!stepsContainer) return;

      let html = '';
      chain.steps.forEach((step, idx) => {
        let cls = 'tasbeeh-chain-step-pill';
        if (idx < this.currentChainStep) cls += ' completed';
        else if (idx === this.currentChainStep) cls += ' current';

        const checkMark = idx < this.currentChainStep ? '<i class="fa-solid fa-check"></i> ' : '';
        html += `<div class="${cls}">${checkMark}${step.text.substring(0, 10)} (${step.target})</div>`;
      });

      stepsContainer.innerHTML = html;
    }

    // ── 11. THEMES & CUSTOMIZATION ──
    setTheme(themeId) {
      this.currentThemeId = themeId;
      this.savePrefs();
      this.renderBeadRing();
      this.renderThemesModalList();
      if (window.showToast) {
        const theme = window.WZKER_TASBEEH_DATA.themes.find(t => t.id === themeId);
        window.showToast(`تم تطبيق خامة: ${theme ? theme.name : ''}`);
      }
    }

    setNiyyah(niyyahId) {
      this.currentNiyyahId = niyyahId;
      this.savePrefs();
      this.updateUI();
      this.closeModal('tasbeehNiyyahModal');
      if (window.showToast) {
        const n = window.WZKER_TASBEEH_DATA.intentions.find(i => i.id === niyyahId);
        window.showToast(`النية المعتمدة للجلسة: ${n ? n.label : ''}`);
      }
    }

    cycleFeedbackMode() {
      const modes = ['sound_and_haptic', 'haptic', 'sound', 'silent'];
      const labels = {
        sound_and_haptic: 'صوت واهتزاز لمسي',
        haptic: 'اهتزاز لمسي فقط',
        sound: 'صوت نقر خرز فقط',
        silent: 'صامت تماماً'
      };
      const icons = {
        sound_and_haptic: 'images/icons/sound.png',
        haptic: 'images/icons/Focus1.png',
        sound: 'images/icons/sound.png',
        silent: 'images/icons/pause.png'
      };

      const currentIdx = modes.indexOf(this.feedbackMode);
      this.feedbackMode = modes[(currentIdx + 1) % modes.length];
      this.savePrefs();

      const labelEl = document.getElementById('tasbeehFeedbackLabel');
      const iconEl = document.getElementById('tasbeehFeedbackIcon');
      if (labelEl) labelEl.textContent = this.feedbackMode === 'silent' ? 'صامت' : (this.feedbackMode === 'haptic' ? 'هابتك' : 'صوت');
      if (iconEl) iconEl.src = icons[this.feedbackMode];

      if (window.showToast) {
        window.showToast(`نمط التفاعل: ${labels[this.feedbackMode]}`);
      }
    }

    resetCounter() {
      this.count = 0;
      this.ringRotationDeg = 0;
      this.renderBeadRing();
      this.updateCounterDisplays();
      if (window.showToast) window.showToast('تم تصفير الدورة الحالية');
    }

    // ── 12. ANALYTICS & VISUALIZATION ──
    openAnalytics() {
      const total = Object.values(this.distributionData).reduce((a, b) => a + b, 0) || 1;
      const container = document.getElementById('tasbeehAnalyticsBarsList');
      if (container) {
        const labels = {
          tasbeeh: 'التسبيح والتقديس',
          tahmeed: 'الحمد والشكر',
          takbeer: 'التكبير والتعظيم',
          istighfar: 'الاستغفار والتوبة',
          salawat: 'الصلاة على النبي',
          hawqala: 'الحوقلة والتوكل',
          other: 'أذكار أخرى'
        };

        let html = '';
        Object.entries(this.distributionData).forEach(([key, val]) => {
          const pct = Math.round((val / total) * 100);
          html += `
            <div class="tasbeeh-analytics-item">
              <div class="tasbeeh-analytics-row">
                <span>${labels[key] || key}</span>
                <span>${val} (${pct}%)</span>
              </div>
              <div class="tasbeeh-analytics-bar-bg">
                <div class="tasbeeh-analytics-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        });

        container.innerHTML = html;
      }

      const totalDisplay = document.getElementById('tasbeehAnalyticsTotalDisplay');
      if (totalDisplay) {
        totalDisplay.textContent = `${total > 1 ? total : 0} تسبيحة موثقة`;
      }

      this.openModal('tasbeehAnalyticsModal');
    }

    renderThemesModalList() {
      const container = document.getElementById('tasbeehThemesGrid');
      if (!container) return;

      let html = '';
      window.WZKER_TASBEEH_DATA.themes.forEach(t => {
        const isActive = t.id === this.currentThemeId;
        html += `
          <div class="tasbeeh-theme-card ${isActive ? 'active' : ''}" onclick="window.wzkerTasbeeh.setTheme('${t.id}')">
            <div class="tasbeeh-theme-preview-bead" style="background: ${t.beadGradient}; border: 1.5px solid ${t.previewAccent};"></div>
            <h4 class="tasbeeh-theme-name">${t.name}</h4>
            <p class="tasbeeh-theme-sub">${t.subtext}</p>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    renderNiyyahModalList() {
      const container = document.getElementById('tasbeehNiyyahList');
      if (!container) return;

      let html = '';
      window.WZKER_TASBEEH_DATA.intentions.forEach(n => {
        const isActive = n.id === this.currentNiyyahId;
        html += `
          <div class="tasbeeh-niyyah-option-row ${isActive ? 'active' : ''}" onclick="window.wzkerTasbeeh.setNiyyah('${n.id}')">
            <img src="${n.icon}" alt="${n.label}">
            <span>${n.label}</span>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // ── 13. MODAL CONTROLS ──
    openModal(id) {
      if (id === 'tasbeehThemesModal') this.renderThemesModalList();
      if (id === 'tasbeehNiyyahModal') this.renderNiyyahModalList();
      const m = document.getElementById(id);
      if (m) m.classList.add('active');
    }

    closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('active');
    }

    // ── 14. EVENT LISTENERS & HOTKEYS ──
    bindEvents() {
      // Spacebar or Enter tap support on desktop
      document.addEventListener('keydown', (e) => {
        const page = document.getElementById('tasbeehPage');
        if (!page || !page.classList.contains('active')) return;

        if (e.code === 'Space') {
          e.preventDefault();
          this.handleTap(e);
        }
      });
    }
  }

  // Global Single Instance
  window.wzkerTasbeeh = new WzkerTasbeeh();

})();
