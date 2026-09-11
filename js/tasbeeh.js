/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL TASBEEH CONTROLLER (js/tasbeeh.js) - PRO EDITION
 * Modern App-Native Digital Counters:
 * 1. Royal Circular Glow Ring (حلقة التقدم الملكية الناعمة)
 * 2. Smart Tally Ring (خاتم التسبيح الإلكتروني العصري)
 * 3. Zen Minimal Card (كارت السكينة البسيط)
 * Fully synchronized with active app theme (data-theme) CSS tokens.
 * ZERO EMOJIS - STRICT ADHERENCE
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

      this.currentShapeId = 'shape_circle'; // 'shape_circle' | 'shape_ring' | 'shape_card'
      this.currentNiyyahId = 'general';
      this.feedbackMode = 'sound_and_haptic'; // 'sound_and_haptic' | 'haptic' | 'sound' | 'silent'

      this.audioCtx = null;

      // Timed Mode variables
      this.timedTotalSec = 300; // 5 mins default
      this.timedRemainingSec = 300;
      this.timedTimer = null;
      this.isTimedRunning = false;

      // Storage keys
      this.storageKeys = {
        streak: 'wzker_tasbeeh_streak_v2',
        distribution: 'wzker_tasbeeh_distribution_v2',
        prefs: 'wzker_tasbeeh_prefs_v2'
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
      this.renderDrawerShapesList();
      this.updateDrawerFeedbackUI();
      this.updateUI();
      this.bindEvents();
    }

    // ── 1. STORAGE & STATE MANAGEMENT ──
    loadStorage() {
      try {
        const savedPrefs = localStorage.getItem(this.storageKeys.prefs);
        if (savedPrefs) {
          const p = JSON.parse(savedPrefs);
          this.currentShapeId = p.shapeId || this.currentShapeId;
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
          shapeId: this.currentShapeId,
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
        if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
          window.wzkerCloud.triggerSync('tasbeeh');
        }
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
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        if (this.streakData.lastDate === yKey) {
          this.streakData.count = (this.streakData.count || 0) + 1;
        } else if (!this.streakData.lastDate) {
          this.streakData.count = 1;
        } else {
          this.streakData.count = 1;
        }
        this.streakData.lastDate = today;
      }

      this.saveStats();
    }

    renderStreakBanner() {
      const daysCountEl = document.getElementById('tasbeehStreakDaysCount');
      if (daysCountEl) {
        const c = this.streakData.count || 1;
        daysCountEl.textContent = `${c} ${c === 1 ? 'يوم' : c === 2 ? 'يومان' : c <= 10 ? 'أيام' : 'يوماً'} متتالية`;
      }

      const calContainer = document.getElementById('tasbeehWeekCalendar');
      if (!calContainer) return;

      const dayNames = ['سبت', 'أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
      const dayFullNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const remappedToday = (currentDayOfWeek + 1) % 7;

      let html = '';
      for (let i = 0; i < 7; i++) {
        const isToday = i === remappedToday;
        const dayOffset = i - remappedToday;
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);
        const tKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

        const isDone = (this.streakData.weekHistory && (this.streakData.weekHistory[tKey] || 0) > 0) || (isToday && this.totalSessionCount > 0);
        const statusMark = isDone ? '<i class="fa-solid fa-check"></i>' : (isToday ? '•' : '');

        html += `
          <div class="tasbeeh-day-chip ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}" title="${dayFullNames[i]}">
            <span class="tasbeeh-day-name">${dayNames[i]}</span>
            <span class="tasbeeh-day-state">${statusMark}</span>
          </div>
        `;
      }

      calContainer.innerHTML = html;
    }

    // ── 3. AUDIO SYNTHESIS & HAPTICS ──
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
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(860, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }

    playCycleChime() {
      if (this.feedbackMode === 'haptic' || this.feedbackMode === 'silent') return;
      try {
        this.initAudio();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];

        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.18, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.55);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.6);
        });
      } catch (e) {}
    }

    triggerHaptic(isCycleComplete = false) {
      if (this.feedbackMode === 'sound' || this.feedbackMode === 'silent') return;
      try {
        if (navigator && typeof navigator.vibrate === 'function') {
          if (isCycleComplete) {
            navigator.vibrate([40, 30, 60, 30, 80]);
          } else {
            navigator.vibrate(25);
          }
        }
      } catch (e) {}
    }

    // ── 4. DIGITAL PROGRESS RING (LIGHTWEIGHT HIGH-PERFORMANCE SVG) ──
    renderProgressRing() {
      const svg = document.getElementById('tasbeehProgressSvg');
      if (!svg) return;

      const size = 280;
      const strokeWidth = 7;
      const radius = 112;
      const circumference = 2 * Math.PI * radius;

      const pct = this.target > 0 ? Math.min(1, this.count / this.target) : ((this.count % 33) / 33);
      const dashoffset = circumference * (1 - pct);

      let progCircle = document.getElementById('tasbeehProgressCircle');
      if (!progCircle) {
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.innerHTML = `
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
                  fill="none" stroke="var(--card-border)" stroke-width="${strokeWidth}" opacity="0.25" />
          <circle id="tasbeehProgressCircle" cx="${size / 2}" cy="${size / 2}" r="${radius}"
                  fill="none" stroke="var(--primary)" stroke-width="${strokeWidth}"
                  stroke-dasharray="${circumference.toFixed(2)}"
                  stroke-dashoffset="${dashoffset.toFixed(2)}"
                  stroke-linecap="round"
                  style="transition: stroke-dashoffset 0.1s ease;" />
        `;
      } else {
        progCircle.style.strokeDashoffset = dashoffset.toFixed(2);
      }

      // Also update card shape horizontal bar if active
      const fillBar = document.getElementById('tasbeehCardProgressFill');
      if (fillBar) {
        fillBar.style.width = `${Math.round(pct * 100)}%`;
      }
    }

    // ── 5. USER INTERACTION: TAP & PROGRESS ──
    handleTap(event) {
      this.initAudio();

      this.count++;
      this.totalSessionCount++;

      const currentDhikr = this.getCurrentDhikr();
      const cat = currentDhikr ? (currentDhikr.category || 'other') : 'other';
      this.distributionData[cat] = (this.distributionData[cat] || 0) + 1;

      this.updateStreakForToday(true);

      // Check Target Reached
      if (this.target > 0 && this.count >= this.target) {
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

      this.renderProgressRing();
      this.updateCounterDisplays();
      this.updateDailyGoal();
      this.saveStats();
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
        this.updateTargetPresetsUI();
        if (window.showToast) {
          window.showToast(`انتقل الورد للذكر التالي: ${nextStep.text.substring(0, 24)}...`);
        }
      } else {
        this.currentChainStep = 0;
        this.target = chain.steps[0].target;
        this.count = 0;
        this.updateChainUI();
        this.updateTargetPresetsUI();
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
      this.target = 0;
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

    setMode(mode) {
      if (mode === 'chain') {
        this.setChainRoutine(0);
      } else if (mode === 'timed') {
        this.setTimedMode(5);
      } else {
        this.selectSingleDhikr(this.currentDhikrIndex || 0);
      }
    }

    // ── 10. DIGITAL SHAPES SWITCHING ──
    setShape(shapeId) {
      this.currentShapeId = shapeId;
      this.savePrefs();
      this.updateShapeVisibility();
      this.renderProgressRing();
      this.renderShapesModalList();
      this.renderDrawerShapesList();
      if (window.showToast) {
        const s = window.WZKER_TASBEEH_DATA.shapes.find(x => x.id === shapeId);
        window.showToast(`نمط السبحة: ${s ? s.name : ''}`);
      }
    }

    updateShapeVisibility() {
      const circleArena = document.getElementById('tasbeehShapeCircleArena');
      const ringBox = document.getElementById('tasbeehShapeRingBox');
      const cardBox = document.getElementById('tasbeehShapeCardBox');

      if (circleArena) circleArena.style.display = this.currentShapeId === 'shape_circle' ? 'flex' : 'none';
      if (ringBox) ringBox.style.display = this.currentShapeId === 'shape_ring' ? 'flex' : 'none';
      if (cardBox) cardBox.style.display = this.currentShapeId === 'shape_card' ? 'flex' : 'none';
    }

    // ── 11. UI & DISPLAY SYNCHRONIZATION ──
    updateUI() {
      document.querySelectorAll('.tasbeeh-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === this.mode);
      });

      const chainCard = document.getElementById('tasbeehChainCard');
      if (chainCard) {
        chainCard.classList.toggle('active', this.mode === 'chain');
        if (this.mode === 'chain') this.updateChainUI();
      }

      const capsulesWrap = document.getElementById('tasbeehCapsulesWrap');
      if (capsulesWrap) {
        capsulesWrap.style.display = this.mode === 'single' ? 'block' : 'none';
        this.renderCapsules();
      }

      const timedBar = document.getElementById('tasbeehTimedBar');
      if (timedBar) {
        timedBar.classList.toggle('active', this.mode === 'timed');
        this.updateTimedDisplay();
      }

      const activeNiyyah = window.WZKER_TASBEEH_DATA.intentions.find(n => n.id === this.currentNiyyahId) || window.WZKER_TASBEEH_DATA.intentions[0];
      const niyyahText = document.getElementById('tasbeehNiyyahLabel');
      const niyyahIcon = document.getElementById('tasbeehNiyyahIcon');
      if (niyyahText) niyyahText.textContent = activeNiyyah.label;
      if (niyyahIcon) niyyahIcon.src = activeNiyyah.icon;

      this.updateShapeVisibility();
      this.updateCounterDisplays();
      this.updateDhikrCard();
      this.updateTargetPresetsUI();
      this.updateDailyGoal();
      this.updateFeedbackUI();
      this.renderProgressRing();
      this.renderStreakBanner();
    }

    updateCounterDisplays() {
      const dhikr = this.getCurrentDhikr();
      const dhikrTitle = dhikr ? dhikr.title : 'سُبْحَانَ اللَّهِ';
      const targetStr = this.target > 0 ? `/ ${this.target}` : '∞ حر';
      const lapStr = `دورة ${this.laps + 1}`;

      // Shape 1: Circle Orb
      const numEl = document.getElementById('tasbeehHugeCounter');
      if (numEl) numEl.textContent = this.count;
      const targetEl = document.getElementById('tasbeehTargetBadge');
      if (targetEl) targetEl.textContent = targetStr;
      const lapEl = document.getElementById('tasbeehLapBadge');
      if (lapEl) lapEl.textContent = lapStr;
      const previewEl = document.getElementById('tasbeehOrbDhikrPreview');
      if (previewEl) previewEl.textContent = dhikrTitle;

      // Shape 2: Smart Ring
      const smartNumEl = document.getElementById('tasbeehSmartCountNum');
      if (smartNumEl) smartNumEl.textContent = this.count;
      const smartMetaEl = document.getElementById('tasbeehSmartMetaLabel');
      if (smartMetaEl) smartMetaEl.textContent = `${targetStr} • ${lapStr}`;

      // Shape 3: Zen Card
      const cardNumEl = document.getElementById('tasbeehCardCountNum');
      if (cardNumEl) cardNumEl.textContent = this.count;
      const cardTargetEl = document.getElementById('tasbeehCardTargetLabel');
      if (cardTargetEl) cardTargetEl.textContent = `${lapStr} ${targetStr}`;

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
        sound_and_haptic: 'صوت واهتزاز',
        haptic: 'اهتزاز فقط',
        sound: 'صوت نقر فقط',
        silent: 'صامت'
      };

      const currentIdx = modes.indexOf(this.feedbackMode);
      this.feedbackMode = modes[(currentIdx + 1) % modes.length];
      this.savePrefs();
      this.updateFeedbackUI();

      if (window.showToast) {
        window.showToast(`نمط التفاعل: ${labels[this.feedbackMode]}`);
      }
    }

    updateFeedbackUI() {
      const labels = {
        sound_and_haptic: 'صوت واهتزاز',
        haptic: 'اهتزاز فقط',
        sound: 'صوت نقر',
        silent: 'صامت'
      };
      const icons = {
        sound_and_haptic: 'images/icons/sound.png',
        haptic: 'images/icons/Focus1.png',
        sound: 'images/icons/sound.png',
        silent: 'images/icons/pause.png'
      };

      const labelEl = document.getElementById('tasbeehTopFeedbackLabel');
      const iconEl = document.getElementById('tasbeehTopFeedbackIcon');
      if (labelEl) labelEl.textContent = labels[this.feedbackMode] || 'صوت واهتزاز';
      if (iconEl && icons[this.feedbackMode]) iconEl.src = icons[this.feedbackMode];
    }

    setQuickTarget(target, btnEl) {
      this.target = Number(target);
      this.count = 0;
      this.updateCounterDisplays();
      this.renderProgressRing();
      this.updateTargetPresetsUI();
      if (window.showToast) {
        window.showToast(this.target > 0 ? `تم ضبط الهدف: ${this.target} تسبيحة` : 'تم ضبط الهدف: عد حر مفتوح');
      }
    }

    updateTargetPresetsUI() {
      const container = document.getElementById('tasbeehTargetPresetsList');
      if (!container) return;
      container.querySelectorAll('.tasbeeh-tp-btn').forEach(btn => {
        const t = Number(btn.getAttribute('data-target'));
        btn.classList.toggle('active', t === this.target);
      });
    }

    updateDailyGoal() {
      const today = this.getTodayKey();
      const todayCount = (this.streakData && this.streakData.weekHistory && this.streakData.weekHistory[today]) || 0;
      const goal = 300;
      const pct = Math.min(100, Math.round((todayCount / goal) * 100));

      const textEl = document.getElementById('tasbeehDailyGoalText');
      const barEl = document.getElementById('tasbeehDailyGoalBar');

      if (textEl) textEl.textContent = `${todayCount} / ${goal} تسبيحة (${pct}%)`;
      if (barEl) barEl.style.width = `${pct}%`;
    }

    copyCurrentDhikr() {
      const dhikr = this.getCurrentDhikr();
      if (!dhikr) return;
      const text = `${dhikr.title}\n${dhikr.fadl ? dhikr.fadl + '\n' : ''}${dhikr.source ? 'المصدر: ' + dhikr.source + '\n' : ''}تطبيق وذكر`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (window.showToast) window.showToast('تم نسخ الذكر وفضله بنجاح');
        }).catch(() => {
          this.fallbackCopy(text);
        });
      } else {
        this.fallbackCopy(text);
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
        if (window.showToast) window.showToast('تم نسخ الذكر وفضله بنجاح');
      } catch (e) {
        if (window.showToast) window.showToast('تعذر النسخ تلقائياً');
      }
      document.body.removeChild(ta);
    }

    shareCurrentDhikr() {
      const dhikr = this.getCurrentDhikr();
      if (!dhikr) return;
      const text = `${dhikr.title}\n\n${dhikr.fadl || ''}\n${dhikr.source ? '« ' + dhikr.source + ' »' : ''}\n\nعبر تطبيق وذكر للأذكار والقرآن الكريم`;
      if (navigator.share) {
        navigator.share({
          title: 'ذكر وفضل - تطبيق وذكر',
          text: text
        }).catch(() => {});
      } else {
        this.copyCurrentDhikr();
      }
    }

    resetCounter() {
      this.count = 0;
      this.renderProgressRing();
      this.updateCounterDisplays();
      if (window.showToast) window.showToast('تم تصفير العداد');
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
        totalDisplay.textContent = `${total > 1 ? total : 0} تسبيحة`;
      }

      this.openModal('tasbeehAnalyticsModal');
    }

    renderShapesModalList() {
      const container = document.getElementById('tasbeehShapesGrid');
      if (!container) return;

      let html = '';
      window.WZKER_TASBEEH_DATA.shapes.forEach(s => {
        const isActive = s.id === this.currentShapeId;
        html += `
          <div class="tasbeeh-shape-option-card ${isActive ? 'active' : ''}" onclick="window.wzkerTasbeeh.setShape('${s.id}')">
            <img src="${s.icon}" alt="${s.name}">
            <div>
              <h4 class="tasbeeh-shape-name">${s.name}</h4>
              <p class="tasbeeh-shape-sub">${s.subtext}</p>
            </div>
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

    renderDrawerShapesList() {
      const container = document.getElementById('tasbeehDrawerShapesList');
      if (!container || !window.WZKER_TASBEEH_DATA || !window.WZKER_TASBEEH_DATA.shapes) return;

      let html = '';
      window.WZKER_TASBEEH_DATA.shapes.forEach(s => {
        const isActive = s.id === this.currentShapeId;
        html += `
          <div class="tasbeeh-drawer-shape-card ${isActive ? 'active' : ''}" onclick="window.wzkerTasbeeh.setShape('${s.id}')">
            <img src="${s.icon}" alt="${s.name}">
            <div style="flex: 1;">
              <h4>${s.name}</h4>
              <p>${s.subtext}</p>
            </div>
            ${isActive ? '<i class="fa-solid fa-check" style="color: var(--primary); font-size: 14px;"></i>' : ''}
          </div>
        `;
      });
      container.innerHTML = html;
    }

    updateDrawerFeedbackUI() {
      const labels = {
        sound_and_haptic: 'صوت واهتزاز',
        haptic: 'اهتزاز فقط',
        sound: 'صوت نقر فقط',
        silent: 'صامت'
      };
      const icons = {
        sound_and_haptic: 'images/icons/sound.png',
        haptic: 'images/icons/Focus1.png',
        sound: 'images/icons/sound.png',
        silent: 'images/icons/pause.png'
      };

      const labelEl = document.getElementById('tasbeehDrawerFeedbackLabel');
      const iconEl = document.getElementById('tasbeehDrawerFeedbackIcon');
      if (labelEl) labelEl.textContent = labels[this.feedbackMode] || 'صوت واهتزاز';
      if (iconEl && icons[this.feedbackMode]) iconEl.src = icons[this.feedbackMode];

      const activeNiyyah = (window.WZKER_TASBEEH_DATA && window.WZKER_TASBEEH_DATA.intentions) ? (window.WZKER_TASBEEH_DATA.intentions.find(n => n.id === this.currentNiyyahId) || window.WZKER_TASBEEH_DATA.intentions[0]) : null;
      const drawerNiyyahEl = document.getElementById('tasbeehDrawerNiyyahLabel');
      if (drawerNiyyahEl && activeNiyyah) drawerNiyyahEl.textContent = activeNiyyah.label;
    }

    // ── 13. MODAL CONTROLS ──
    openModal(id) {
      if (id === 'tasbeehShapesModal') this.renderShapesModalList();
      if (id === 'tasbeehNiyyahModal') this.renderNiyyahModalList();
      if (id === 'tasbeehSideDrawer') {
        this.renderDrawerShapesList();
        this.renderStreakBanner();
        this.updateDailyGoal();
        this.updateDrawerFeedbackUI();
      }
      const m = document.getElementById(id);
      if (m) m.classList.add('active');
    }

    closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('active');
    }

    // ── 14. EVENT LISTENERS ──
    bindEvents() {
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
