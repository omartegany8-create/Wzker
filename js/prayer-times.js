/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER PRAYER TIMES & ADHAN ENGINE (js/prayer-times.js) - PRO EDITION
 * ══════════════════════════════════════════════════════════════════
 * - Standard PrayTimes Algorithm (Battle-tested astronomical calculation)
 * - 100% Offline-Resilient Coordinates & Presets
 * - Full-bleed Atmospheric Hero (Changes dynamically by prayer time)
 * - Integrated Single Timeline (Combines Prayer Schedule + Checkbox Tracker)
 * - Dedicated Side Drawer with Sound, GPS, Muezzin, and Juristic settings
 * - Spiritual Moments: Last Third of the Night (Qiyam) & Duha Time
 * - Strict Zero Emojis Policy Compliant
 * - Using official icons from images/icons/ exclusively
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // 1. STANDARD PRAYTIMES CALCULATION ENGINE (PrayTimes.org Core)
  // ─────────────────────────────────────────────────────────────
  const PrayTimesCore = {
    methods: {
      MWL: { name: 'رابطة العالم الإسلامي', params: { fajr: 18, isha: 17 } },
      ISNA: { name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', params: { fajr: 15, isha: 15 } },
      Egypt: { name: 'الهيئة المصرية العامة للمساحة', params: { fajr: 19.5, isha: 17.5 } },
      Makkah: { name: 'جامعة أم القرى بمكة المكرمة', params: { fajr: 18.5, isha: '90 min' } },
      Karachi: { name: 'جامعة العلوم الإسلامية بكراتشي', params: { fajr: 18, isha: 18 } },
      Tehran: { name: 'معهد لواء بجامعة طهران', params: { fajr: 17.7, isha: 14 } },
      Jafari: { name: 'المذهب الشيعي الإثنا عشري (لواء)', params: { fajr: 16, isha: 14 } }
    },

    calcMethod: 'Egypt',
    asrMethod: 'Standard',
    highLatsMethod: 'NightMiddle',

    dtr: function (d) { return (d * Math.PI) / 180.0; },
    rtd: function (r) { return (r * 180.0) / Math.PI; },
    sin: function (d) { return Math.sin(this.dtr(d)); },
    cos: function (d) { return Math.cos(this.dtr(d)); },
    tan: function (d) { return Math.tan(this.dtr(d)); },
    arcsin: function (d) { return this.rtd(Math.asin(d)); },
    arccos: function (d) { return this.rtd(Math.acos(d)); },
    arctan: function (d) { return this.rtd(Math.atan(d)); },
    arccot: function (x) { return this.rtd(Math.atan(1.0 / x)); },
    arctan2: function (y, x) { return this.rtd(Math.atan2(y, x)); },

    fixAngle: function (a) {
      a = a - 360.0 * Math.floor(a / 360.0);
      return a < 0 ? a + 360.0 : a;
    },

    fixHour: function (a) {
      a = a - 24.0 * Math.floor(a / 24.0);
      return a < 0 ? a + 24.0 : a;
    },

    julianDate: function (year, month, day) {
      if (month <= 2) {
        year -= 1;
        month += 12;
      }
      const A = Math.floor(year / 100.0);
      const B = 2 - A + Math.floor(A / 4.0);
      return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    },

    sunPosition: function (jd) {
      const D = jd - 2451545.0;
      const g = this.fixAngle(357.529 + 0.98560028 * D);
      const q = this.fixAngle(280.459 + 0.98564736 * D);
      const L = this.fixAngle(q + 1.915 * this.sin(g) + 0.020 * this.sin(2 * g));
      const e = 23.439 - 0.00000036 * D;
      const d = this.arcsin(this.sin(e) * this.sin(L));
      let RA = this.arctan2(this.cos(e) * this.sin(L), this.cos(L)) / 15.0;
      RA = this.fixHour(RA);
      const EqT = q / 15.0 - RA;
      return { declination: d, equation: EqT };
    },

    midDay: function (time, EqT) {
      return this.fixHour(12 - EqT);
    },

    sunAngleTime: function (angle, time, direction, lat, decl) {
      const n = -this.sin(angle) - this.sin(lat) * this.sin(decl);
      const d = this.cos(lat) * this.cos(decl);
      const c = n / d;
      if (c > 1.0 || c < -1.0) return NaN;
      const v = (1.0 / 15.0) * this.arccos(c);
      return time + (direction === 'ccw' ? -v : v);
    },

    asrTime: function (factor, time, lat, decl) {
      const n = -this.arccot(factor + this.tan(Math.abs(lat - decl)));
      return this.sunAngleTime(n, time, 'cw', lat, decl);
    },

    computeTimes: function (date, lat, lng, timezone, method, asrFactor) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const jd = this.julianDate(year, month, day) - lng / (15.0 * 24.0);

      const m = this.methods[method] || this.methods.Egypt;
      const fajrAngle = typeof m.params.fajr === 'number' ? m.params.fajr : 19.5;
      let ishaVal = m.params.isha;

      const sun = this.sunPosition(jd);
      const noon = this.midDay(0, sun.equation);

      let fajr = this.sunAngleTime(fajrAngle, noon, 'ccw', lat, sun.declination);
      let sunrise = this.sunAngleTime(0.833, noon, 'ccw', lat, sun.declination);
      let dhuhr = noon;
      let asr = this.asrTime(asrFactor || 1, noon, lat, sun.declination);
      let sunset = this.sunAngleTime(0.833, noon, 'cw', lat, sun.declination);
      let maghrib = sunset;
      let isha;

      if (typeof ishaVal === 'number') {
        isha = this.sunAngleTime(ishaVal, noon, 'cw', lat, sun.declination);
      } else if (typeof ishaVal === 'string' && ishaVal.includes('min')) {
        const mins = parseInt(ishaVal, 10) || 90;
        isha = maghrib + mins / 60.0;
      } else {
        isha = maghrib + 1.5;
      }

      const toTZ = (t) => {
        if (isNaN(t)) return null;
        t = t + timezone - lng / 15.0;
        return this.fixHour(t);
      };

      return {
        fajr: toTZ(fajr),
        sunrise: toTZ(sunrise),
        dhuhr: toTZ(dhuhr),
        asr: toTZ(asr),
        maghrib: toTZ(maghrib),
        isha: toTZ(isha)
      };
    },

    toDate: function (baseDate, hourFloat, manualOffsetMin = 0) {
      if (hourFloat === null || isNaN(hourFloat)) return null;
      const totalMins = Math.round(hourFloat * 60) + manualOffsetMin;
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const d = new Date(baseDate);
      d.setHours(h, m, 0, 0);
      return d;
    },

    formatTime: function (d) {
      if (!d) return '--:--';
      let h = d.getHours();
      const m = d.getMinutes();
      const isPm = h >= 12;
      h = h % 12;
      if (h === 0) h = 12;
      const period = isPm ? 'م' : 'ص';
      const mm = m < 10 ? '0' + m : m;
      const hh = h < 10 ? '0' + h : h;
      return `${hh}:${mm} ${period}`;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. CITY PRESETS & OFFLINE COORDINATES
  // ─────────────────────────────────────────────────────────────
  const CITY_PRESETS = [
    { id: 'cairo', name: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357, tz: 3, method: 'Egypt' },
    { id: 'alex', name: 'الإسكندرية، مصر', lat: 31.2001, lng: 29.9187, tz: 3, method: 'Egypt' },
    { id: 'makkah', name: 'مكة المكرمة، السعودية', lat: 21.4225, lng: 39.8262, tz: 3, method: 'Makkah' },
    { id: 'madinah', name: 'المدينة المنورة، السعودية', lat: 24.4672, lng: 39.6111, tz: 3, method: 'Makkah' },
    { id: 'riyadh', name: 'الرياض، السعودية', lat: 24.7136, lng: 46.6753, tz: 3, method: 'Makkah' },
    { id: 'jerusalem', name: 'القدس الشريف، فلسطين', lat: 31.7683, lng: 35.2137, tz: 3, method: 'MWL' },
    { id: 'dubai', name: 'دبي، الإمارات', lat: 25.2048, lng: 55.2708, tz: 4, method: 'MWL' },
    { id: 'kuwait', name: 'الكويت العاصمة', lat: 29.3759, lng: 47.9774, tz: 3, method: 'MWL' },
    { id: 'amman', name: 'عمّان، الأردن', lat: 31.9454, lng: 35.9284, tz: 3, method: 'MWL' },
    { id: 'doha', name: 'الدوحة، قطر', lat: 25.2854, lng: 51.5310, tz: 3, method: 'Makkah' },
    { id: 'tunis', name: 'تونس العاصمة', lat: 36.8065, lng: 10.1815, tz: 1, method: 'MWL' },
    { id: 'algiers', name: 'الجزائر العاصمة', lat: 36.7538, lng: 3.0588, tz: 1, method: 'MWL' },
    { id: 'rabat', name: 'الرباط، المغرب', lat: 34.0209, lng: -6.8416, tz: 1, method: 'MWL' },
    { id: 'khartoum', name: 'الخرطوم، السودان', lat: 15.5007, lng: 32.5599, tz: 2, method: 'MWL' },
    { id: 'baghdad', name: 'بغداد، العراق', lat: 33.3152, lng: 44.3661, tz: 3, method: 'MWL' },
    { id: 'istanbul', name: 'إسطنبول، تركيا', lat: 41.0082, lng: 28.9784, tz: 3, method: 'MWL' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 3. MUEZZIN VOICES
  // ─────────────────────────────────────────────────────────────
  const MUEZZIN_VOICES = [
    { id: 'makkah', name: 'أذان المسجد الحرام (مكة المكرمة)', url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3' },
    { id: 'madinah', name: 'أذان المسجد النبوي (المدينة المنورة)', url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3' },
    { id: 'aqsa', name: 'أذان المسجد الأقصى المبارك', url: 'https://cdn.aladhan.com/audio/adhans/a3.mp3' },
    { id: 'cairo', name: 'أذان مساجد مصر (الشيخ محمد رفعت)', url: 'https://cdn.aladhan.com/audio/adhans/a4.mp3' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 4. MAIN WZKER PRAYER CONTROLLER
  // ─────────────────────────────────────────────────────────────
  class WzkerPrayerTimes {
    constructor() {
      this.STORAGE_KEYS = {
        LOCATION: 'wzker_prayer_location',
        METHOD: 'wzker_prayer_method',
        JURISTIC: 'wzker_prayer_juristic',
        SELECTED_MUEZZIN: 'wzker_prayer_muezzin',
        AUDIO_MUTED: 'wzker_prayer_audio_muted',
        TRACKER_PREFIX: 'wzker_prayer_tracker_'
      };

      this.location = this.loadLocation();
      this.method = localStorage.getItem(this.STORAGE_KEYS.METHOD) || 'Egypt';
      this.juristic = parseInt(localStorage.getItem(this.STORAGE_KEYS.JURISTIC) || '1', 10);
      this.selectedMuezzin = localStorage.getItem(this.STORAGE_KEYS.SELECTED_MUEZZIN) || 'makkah';
      this.isAudioMuted = localStorage.getItem(this.STORAGE_KEYS.AUDIO_MUTED) === '1';

      this.currentPrayerTimes = {};
      this.nextPrayer = null;
      this.audioPlayer = new Audio();
      this.liveTimerInterval = null;
      this.lastPlayedPrayerKey = null;

      this.init();
    }

    init() {
      this.calculateTodayTimes();
      this.setupCountdownTicker();
      this.renderFullUI();
    }

    loadLocation() {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEYS.LOCATION);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('[Prayer] Error loading location:', e);
      }
      return {
        id: 'cairo',
        name: 'القاهرة، مصر',
        lat: 30.0444,
        lng: 31.2357,
        tz: 3,
        isCustomGps: false
      };
    }

    saveLocation(loc) {
      this.location = loc;
      localStorage.setItem(this.STORAGE_KEYS.LOCATION, JSON.stringify(loc));
      this.calculateTodayTimes();
      this.renderFullUI();
      if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
        window.wzkerCloud.triggerSync('prayer_settings');
      }
    }

    calculateTodayTimes() {
      const now = new Date();
      const tz = this.location.tz !== undefined ? this.location.tz : -(now.getTimezoneOffset() / 60.0);

      const raw = PrayTimesCore.computeTimes(
        now,
        this.location.lat,
        this.location.lng,
        tz,
        this.method,
        this.juristic
      );

      this.currentPrayerTimes = {
        fajr: PrayTimesCore.toDate(now, raw.fajr, 0),
        sunrise: PrayTimesCore.toDate(now, raw.sunrise, 0),
        dhuhr: PrayTimesCore.toDate(now, raw.dhuhr, 0),
        asr: PrayTimesCore.toDate(now, raw.asr, 0),
        maghrib: PrayTimesCore.toDate(now, raw.maghrib, 0),
        isha: PrayTimesCore.toDate(now, raw.isha, 0)
      };

      this.resolveNextPrayer();
      this.calculateSpiritualMoments();
    }

    resolveNextPrayer() {
      const now = new Date();
      const list = [
        { key: 'fajr', name: 'صلاة الفجر', date: this.currentPrayerTimes.fajr, isPrayer: true },
        { key: 'sunrise', name: 'شروق الشمس', date: this.currentPrayerTimes.sunrise, isPrayer: false },
        { key: 'dhuhr', name: 'صلاة الظهر', date: this.currentPrayerTimes.dhuhr, isPrayer: true },
        { key: 'asr', name: 'صلاة العصر', date: this.currentPrayerTimes.asr, isPrayer: true },
        { key: 'maghrib', name: 'صلاة المغرب', date: this.currentPrayerTimes.maghrib, isPrayer: true },
        { key: 'isha', name: 'صلاة العشاء', date: this.currentPrayerTimes.isha, isPrayer: true }
      ];

      let upcoming = null;
      for (let i = 0; i < list.length; i++) {
        if (list[i].date && list[i].date > now) {
          upcoming = list[i];
          break;
        }
      }

      if (!upcoming && this.currentPrayerTimes.fajr) {
        const tomorrowFajr = new Date(this.currentPrayerTimes.fajr);
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
        upcoming = { key: 'fajr', name: 'صلاة الفجر', date: tomorrowFajr, isPrayer: true };
      }

      this.nextPrayer = upcoming;
    }

    calculateSpiritualMoments() {
      // 1. Duha starts ~15 mins after sunrise
      if (this.currentPrayerTimes.sunrise) {
        const duhaDate = new Date(this.currentPrayerTimes.sunrise.getTime() + 15 * 60 * 1000);
        const duhaEl = document.getElementById('prayerDuhaTime');
        if (duhaEl) duhaEl.textContent = PrayTimesCore.formatTime(duhaDate);
      }

      // 2. Last Third of Night: between Maghrib and Fajr
      if (this.currentPrayerTimes.maghrib && this.currentPrayerTimes.fajr) {
        const maghribTime = this.currentPrayerTimes.maghrib.getTime();
        let fajrTime = this.currentPrayerTimes.fajr.getTime();
        if (fajrTime < maghribTime) {
          fajrTime += 24 * 3600 * 1000;
        }
        const nightDuration = fajrTime - maghribTime;
        const lastThirdStart = new Date(fajrTime - nightDuration / 3);
        const lastThirdEl = document.getElementById('prayerLastThirdTime');
        if (lastThirdEl) lastThirdEl.textContent = PrayTimesCore.formatTime(lastThirdStart);
      }
    }

    setupCountdownTicker() {
      if (this.liveTimerInterval) clearInterval(this.liveTimerInterval);
      this.liveTimerInterval = setInterval(() => {
        this.updateLiveCountdown();
      }, 1000);
    }

    updateLiveCountdown() {
      if (!this.nextPrayer || !this.nextPrayer.date) {
        this.resolveNextPrayer();
        return;
      }

      const now = new Date();
      const diffMs = this.nextPrayer.date - now;

      if (diffMs <= 1000 && diffMs >= -4000) {
        const prayerKeyToday = `${this.nextPrayer.key}_${now.toDateString()}`;
        if (this.lastPlayedPrayerKey !== prayerKeyToday) {
          this.lastPlayedPrayerKey = prayerKeyToday;
          this.onPrayerTimeReached(this.nextPrayer);
        }
      }

      if (diffMs < 0) {
        this.resolveNextPrayer();
        this.renderUnifiedTimeline();
        this.renderHeroMoment();
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const hh = hours < 10 ? '0' + hours : hours;
      const mm = mins < 10 ? '0' + mins : mins;
      const ss = secs < 10 ? '0' + secs : secs;

      const timerEl = document.getElementById('prayerHeroTimer');
      if (timerEl) {
        timerEl.textContent = `${hh}:${mm}:${ss}`;
      }

      const homeTag = document.getElementById('homeNextPrayerTag');
      if (homeTag) {
        homeTag.textContent = `${hh}:${mm}:${ss}`;
      }
      const homeLead = document.getElementById('homeNextPrayerLead');
      if (homeLead && this.nextPrayer) {
        homeLead.textContent = `الصلاة القادمة: ${this.nextPrayer.name}`;
      }
    }

    onPrayerTimeReached(prayer) {
      if (!prayer.isPrayer) return;

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`حان الآن موعد أذان ${prayer.name}`, {
            body: `حي على الصلاة، حي على الفلاح • مواقيت ${this.location.name}`,
            icon: 'images/icon/wzker.png',
            dir: 'rtl',
            lang: 'ar'
          });
        } catch (e) {
          console.log('[Prayer Notification]', e);
        }
      }

      if (!this.isAudioMuted) {
        this.playAdhanAudio();
      }

      if (window.showToast) {
        window.showToast(`حان الآن موعد أذان ${prayer.name}`);
      }
    }

    playAdhanAudio() {
      const muezzin = MUEZZIN_VOICES.find(m => m.id === this.selectedMuezzin) || MUEZZIN_VOICES[0];
      this.audioPlayer.src = muezzin.url;
      this.audioPlayer.play().catch(e => console.warn('[Audio Play]', e));
    }

    stopAdhanAudio() {
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      }
    }

    testMuezzinVoice() {
      this.stopAdhanAudio();
      this.playAdhanAudio();
      if (window.showToast) {
        const m = MUEZZIN_VOICES.find(item => item.id === this.selectedMuezzin);
        window.showToast(`جاري تشغيل تجربة: ${m ? m.name : 'الأذان'}`);
      }
    }

    detectUserLocation() {
      if (!navigator.geolocation) {
        if (window.showToast) window.showToast('المتصفح لا يدعم تحديد الموقع الجغرافي');
        return;
      }

      if (window.showToast) window.showToast('جاري تحديد موقعك الجغرافي بدقة...');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          const now = new Date();
          const tz = -(now.getTimezoneOffset() / 60.0);

          const customLoc = {
            id: 'current_gps',
            name: 'موقعي الحالي (GPS)',
            lat: lat,
            lng: lng,
            tz: tz,
            isCustomGps: true
          };

          this.saveLocation(customLoc);
          if (window.showToast) window.showToast('تم تحديث الموقع الجغرافي بنجاح');
        },
        () => {
          if (window.showToast) {
            window.showToast('تعذر جلب الموقع تلقائياً. اختر مدينتك من القائمة');
          }
          this.openLocationPickerDrawer();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // RENDERING & INTERACTIVE INTEGRATED TIMELINE
    // ─────────────────────────────────────────────────────────────
    renderFullUI() {
      this.renderHeroMoment();
      this.renderUnifiedTimeline();
      this.renderDrawerUIState();
      this.renderStreakSummary();
      this.calculateSpiritualMoments();

      const locNameEl = document.getElementById('prayerCurrentCityName');
      if (locNameEl) locNameEl.textContent = this.location.name;
    }

    renderHeroMoment() {
      const heroContainer = document.getElementById('prayerHeroAtmosphere');
      const heroPrayerName = document.getElementById('prayerHeroName');
      const heroPrayerTime = document.getElementById('prayerHeroTime');
      const heroDateInfo = document.getElementById('prayerHeroDateInfo');

      if (!this.nextPrayer) return;

      if (heroPrayerName) heroPrayerName.textContent = this.nextPrayer.name;
      if (heroPrayerTime) heroPrayerTime.textContent = PrayTimesCore.formatTime(this.nextPrayer.date);
      if (heroContainer) heroContainer.setAttribute('data-prayer', this.nextPrayer.key);

      if (heroDateInfo) {
        const now = new Date();
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        heroDateInfo.textContent = `${days[now.getDay()]} • ${now.getDate()}/${now.getMonth() + 1}`;
      }
    }

    getTodayTrackerKey() {
      const now = new Date();
      return `${this.STORAGE_KEYS.TRACKER_PREFIX}${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
    }

    loadTodayTracker() {
      try {
        const data = localStorage.getItem(this.getTodayTrackerKey());
        if (data) return JSON.parse(data);
      } catch (e) {
        console.warn('[Prayer Tracker]', e);
      }
      return {
        fajr: false, fajr_sunnah: false,
        dhuhr: false, dhuhr_sunnah: false,
        asr: false, asr_sunnah: false,
        maghrib: false, maghrib_sunnah: false,
        isha: false, isha_sunnah: false
      };
    }

    saveTodayTracker(state) {
      localStorage.setItem(this.getTodayTrackerKey(), JSON.stringify(state));
      this.renderStreakSummary();
      if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
        window.wzkerCloud.triggerSync('prayer_tracker');
      }
    }

    togglePrayerCheck(key, isSunnah = false) {
      const state = this.loadTodayTracker();
      const targetKey = isSunnah ? `${key}_sunnah` : key;
      state[targetKey] = !state[targetKey];
      this.saveTodayTracker(state);
      this.renderUnifiedTimeline();

      if (state[targetKey] && window.showToast) {
        const names = {
          fajr: 'صلاة الفجر', dhuhr: 'صلاة الظهر', asr: 'صلاة العصر',
          maghrib: 'صلاة المغرب', isha: 'صلاة العشاء'
        };
        const title = isSunnah ? `سنة ${names[key] || ''}` : names[key];
        window.showToast(`تقبل الله! تم تسجيل أداء ${title}`);
      }
    }

    renderStreakSummary() {
      const state = this.loadTodayTracker();
      const fardhKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      let doneCount = 0;
      fardhKeys.forEach(k => { if (state[k]) doneCount++; });

      const badge = document.getElementById('prayerDoneRatioBadge');
      if (badge) badge.textContent = `${doneCount} / 5`;

      const sub = document.getElementById('prayerStreakSubtitle');
      if (sub) {
        sub.textContent = doneCount === 5 
          ? 'ما شاء الله! أتممت جميع صلوات اليوم المفروضة' 
          : `صليت ${doneCount} من 5 فروض اليوم`;
      }
    }

    renderUnifiedTimeline() {
      const container = document.getElementById('prayerUnifiedTimeline');
      if (!container) return;

      const state = this.loadTodayTracker();
      const now = new Date();

      // Official prayer data with user-uploaded icons
      const timelineData = [
        {
          key: 'fajr',
          name: 'صلاة الفجر',
          icon: 'fajr1.png',
          time: this.currentPrayerTimes.fajr,
          isPrayer: true,
          sunnahText: 'ركعتا سنة الفجر (خير من الدنيا وما فيها)'
        },
        {
          key: 'sunrise',
          name: 'شروق الشمس',
          icon: 'sunrise.png',
          time: this.currentPrayerTimes.sunrise,
          isPrayer: false,
          sunnahText: 'نهاية وقت الفجر وبداية وقت البكور'
        },
        {
          key: 'dhuhr',
          name: 'صلاة الظهر',
          icon: 'dhuhr.png',
          time: this.currentPrayerTimes.dhuhr,
          isPrayer: true,
          sunnahText: '4 ركعات قبل الظهر و2 بعدها'
        },
        {
          key: 'asr',
          name: 'صلاة العصر',
          icon: 'asr.png',
          time: this.currentPrayerTimes.asr,
          isPrayer: true,
          sunnahText: 'الصلاة الوسطى • حافظ عليها'
        },
        {
          key: 'maghrib',
          name: 'صلاة المغرب',
          icon: 'sunset.png',
          time: this.currentPrayerTimes.maghrib,
          isPrayer: true,
          sunnahText: 'ركعتان سنة بعدية بعد المغرب'
        },
        {
          key: 'isha',
          name: 'صلاة العشاء',
          icon: 'isha.png',
          time: this.currentPrayerTimes.isha,
          isPrayer: true,
          sunnahText: 'ركعتان سنة بعدية وركعة الوتر'
        }
      ];

      let html = '';

      timelineData.forEach((item, index) => {
        const isNext = this.nextPrayer && this.nextPrayer.key === item.key;
        const isPassed = item.time && item.time < now && !isNext;
        const isFardhDone = !!state[item.key];
        const isSunnahDone = !!state[`${item.key}_sunnah`];

        let stateModifier = '';
        if (isNext) stateModifier = 'active-next';
        else if (isPassed) stateModifier = 'passed';

        html += `
          <div class="timeline-step-row ${stateModifier}" data-key="${item.key}">
            <!-- Timeline Axis -->
            <div class="timeline-step-axis">
              <div class="axis-node-disc">
                <img src="images/icons/${item.icon}" class="axis-prayer-icon" alt="${item.name}">
              </div>
              ${index < timelineData.length - 1 ? '<div class="axis-vertical-line"></div>' : ''}
            </div>

            <!-- Content Tile -->
            <div class="timeline-step-content">
              <div class="step-main-row">
                <div class="step-prayer-meta">
                  <h4 class="step-prayer-title">${item.name}</h4>
                  <span class="step-sunnah-hint">${item.sunnahText}</span>
                </div>

                <div class="step-time-side">
                  <span class="step-prayer-clock">${PrayTimesCore.formatTime(item.time)}</span>
                  ${isNext ? '<span class="step-active-pill">الصلاة القادمة</span>' : ''}
                </div>
              </div>

              <!-- Interactive Checkboxes (Only for 5 prayers) -->
              ${item.isPrayer ? `
                <div class="step-action-checks">
                  <button class="step-check-btn ${isFardhDone ? 'checked' : ''}" 
                          onclick="window.wzkerPrayer.togglePrayerCheck('${item.key}', false)" 
                          type="button">
                    <span class="step-check-circle">
                      <i class="fa-solid fa-check"></i>
                    </span>
                    <span class="step-check-label">أديت الفريضة</span>
                  </button>

                  <button class="step-check-btn sunnah ${isSunnahDone ? 'checked' : ''}" 
                          onclick="window.wzkerPrayer.togglePrayerCheck('${item.key}', true)" 
                          type="button">
                    <span class="step-check-circle">
                      <i class="fa-solid fa-check"></i>
                    </span>
                    <span class="step-check-label">السنة الراتبة</span>
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // ─────────────────────────────────────────────────────────────
    // SIDE DRAWER & MODAL CONTROLS
    // ─────────────────────────────────────────────────────────────
    openDrawer() {
      const drawer = document.getElementById('prayerSideDrawer');
      if (drawer) {
        drawer.classList.add('active');
        document.body.classList.add('prayer-drawer-active');
        this.renderDrawerUIState();
      }
    }

    closeDrawer() {
      const drawer = document.getElementById('prayerSideDrawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.classList.remove('prayer-drawer-active');
      }
    }

    renderDrawerUIState() {
      const muteImg = document.getElementById('prayerDrawerMuteImg');
      const muteLbl = document.getElementById('prayerDrawerMuteLabel');
      const muteBtn = document.getElementById('prayerDrawerMuteBtn');

      if (muteImg) {
        muteImg.src = this.isAudioMuted ? 'images/icons/sound-off.png' : 'images/icons/sound-on.png';
      }
      if (muteLbl) {
        muteLbl.textContent = this.isAudioMuted ? 'مكتوم' : 'مفعل';
      }
      if (muteBtn) {
        muteBtn.classList.toggle('muted', this.isAudioMuted);
      }

      const muezzinSelect = document.getElementById('prayerMuezzinSelect');
      if (muezzinSelect) muezzinSelect.value = this.selectedMuezzin;

      const methodSelect = document.getElementById('prayerMethodSelect');
      if (methodSelect) methodSelect.value = this.method;

      const juristicSelect = document.getElementById('prayerJuristicSelect');
      if (juristicSelect) juristicSelect.value = String(this.juristic);
    }

    toggleAudioMute() {
      this.isAudioMuted = !this.isAudioMuted;
      localStorage.setItem(this.STORAGE_KEYS.AUDIO_MUTED, this.isAudioMuted ? '1' : '0');
      this.renderDrawerUIState();

      if (this.isAudioMuted) {
        this.stopAdhanAudio();
        if (window.showToast) window.showToast('تم كتم صوت الأذان');
      } else {
        if (window.showToast) window.showToast('تم تفعيل صوت الأذان');
      }
    }

    updateMuezzin(val) {
      this.selectedMuezzin = val;
      localStorage.setItem(this.STORAGE_KEYS.SELECTED_MUEZZIN, val);
      if (window.showToast) window.showToast('تم اختيار المؤذن بنجاح');
      if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
        window.wzkerCloud.triggerSync('prayer_settings');
      }
    }

    updateMethod(val) {
      this.method = val;
      localStorage.setItem(this.STORAGE_KEYS.METHOD, val);
      this.calculateTodayTimes();
      this.renderFullUI();
      if (window.showToast) window.showToast('تم تحديث جهة الحساب الفلكي');
      if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
        window.wzkerCloud.triggerSync('prayer_settings');
      }
    }

    updateJuristic(val) {
      this.juristic = parseInt(val, 10) || 1;
      localStorage.setItem(this.STORAGE_KEYS.JURISTIC, String(this.juristic));
      this.calculateTodayTimes();
      this.renderFullUI();
      if (window.showToast) window.showToast('تم تحديث مذهب حساب العصر');
      if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
        window.wzkerCloud.triggerSync('prayer_settings');
      }
    }

    openLocationPickerDrawer() {
      const modal = document.getElementById('prayerLocationModal');
      const listEl = document.getElementById('prayerCitiesModalList');
      if (!modal || !listEl) return;

      let html = '';
      CITY_PRESETS.forEach(c => {
        const isSelected = this.location.id === c.id;
        html += `
          <button class="modal-city-btn ${isSelected ? 'active' : ''}" 
                  onclick="window.wzkerPrayer.selectPresetCity('${c.id}')" type="button">
            <div class="city-btn-info">
              <span class="city-name">${c.name}</span>
              <span class="city-meta">خط عرض: ${c.lat}° • خط طول: ${c.lng}°</span>
            </div>
            ${isSelected ? '<i class="fa-solid fa-circle-check city-check-icon"></i>' : '<i class="fa-regular fa-circle city-check-icon"></i>'}
          </button>
        `;
      });

      listEl.innerHTML = html;
      modal.classList.add('active');
    }

    closeLocationPickerDrawer() {
      const modal = document.getElementById('prayerLocationModal');
      if (modal) modal.classList.remove('active');
    }

    selectPresetCity(cityId) {
      const found = CITY_PRESETS.find(c => c.id === cityId);
      if (found) {
        this.saveLocation(found);
        this.closeLocationPickerDrawer();
        if (window.showToast) window.showToast(`تم تعيين الموقع: ${found.name}`);
      }
    }
  }

  window.wzkerPrayer = new WzkerPrayerTimes();
})();
