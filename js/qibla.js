/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER QIBLA COMPASS ENGINE (js/qibla.js) - ROYAL ASTROLABE PRO
 * ══════════════════════════════════════════════════════════════════
 * - High-Precision Geodesic Great-Circle Trigonometry
 * - Tilt-Compensated 3D Compass Fusion (Yaw/Pitch/Roll)
 * - Automatic Smooth Snap-Back to Kaaba on Drag Release
 * - High-Accuracy Satellite GPS Auto-Detection
 * - Live Holy Mecca Clock & Prayer Telemetry
 * - Mecca Pilgrimage Travel Distance & Journey Metrics
 * - Pure Synthesized Web Audio Chimes & Haptic Feedback
 * - Strict Zero Emojis Policy Compliant
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // The Holy Kaaba Precise Geodesic Coordinates (Mecca, Saudi Arabia)
  const KAABA_COORDS = {
    lat: 21.422487,
    lng: 39.826206
  };

  class WzkerQiblaEngine {
    constructor() {
      this.location = this.loadLocation();
      this.qiblaBearing = 0;
      this.distanceToKaaba = 0;
      this.currentHeading = 0;
      this.targetHeading = 0;
      this.isAligned = false;
      this.isLocked = false;
      this.hasOrientationSensor = false;
      this.isManualDragging = false;
      this.manualStartAngle = 0;
      this.manualStartHeading = 0;
      this.lastFrameTime = 0;
      this.stabilityDuration = 0;
      this.lastStabilityCheck = 0;
      this.hasPlayedLockChime = false;
      this.audioContext = null;
      this.meccaClockInterval = null;

      this.init();
    }

    init() {
      this.calculateGeodesicQibla();
      this.setupOrientationSensors();

      const onReady = () => {
        this.setupManualDragInteraction();
        this.startRenderLoop();
        this.startMeccaLiveClock();
        this.renderStaticUI();
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
      } else {
        onReady();
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 1. LOCATION & GEODESIC ASTRONOMICAL CALCULATIONS
    // ─────────────────────────────────────────────────────────────
    loadLocation() {
      try {
        const saved = localStorage.getItem('wzker_prayer_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.lat === 'number') return parsed;
        }
      } catch (e) {
        console.warn('[Qibla] Error reading location storage:', e);
      }

      // Default fallback: Cairo, Egypt
      return {
        id: 'cairo',
        name: 'القاهرة، مصر',
        lat: 30.0444,
        lng: 31.2357
      };
    }

    saveLocation(loc) {
      this.location = loc;
      try {
        localStorage.setItem('wzker_prayer_location', JSON.stringify(loc));
      } catch (e) {}
      this.calculateGeodesicQibla();
      this.renderStaticUI();
      if (window.showToast) window.showToast(`تم تحديث موقع القبلة إلى: ${loc.name}`);
    }

    locateExactGPS() {
      if (!navigator.geolocation) {
        if (window.showToast) window.showToast('خاصية تحديد الموقع غير مدعومة في متصفحك');
        return;
      }

      const statusText = document.getElementById('qiblaStatusText');
      if (statusText) statusText.textContent = 'جاري الاتصال بالأقمار الصناعية GPS...';
      if (window.showToast) window.showToast('جاري تحديد إحداثياتك الدقيقة بالأقمار الصناعية...');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 10);

          const newLoc = {
            id: 'gps_custom',
            name: `موقعي الدقيق (دقة ±${accuracy}م)`,
            lat: lat,
            lng: lng,
            isCustomGps: true
          };

          this.saveLocation(newLoc);
          this.snapToQibla();
          if (window.showToast) window.showToast(`تم ضبط زاوية القبلة بدقة فائقة (${this.qiblaBearing.toFixed(1)}°)`);
        },
        (err) => {
          console.warn('[GPS Error]', err);
          if (window.showToast) window.showToast('تعذر جلب موقع GPS، يرجى تفعيل إذن الموقع');
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    }

    calculateGeodesicQibla() {
      const lat1 = (this.location.lat * Math.PI) / 180.0;
      const lng1 = (this.location.lng * Math.PI) / 180.0;
      const lat2 = (KAABA_COORDS.lat * Math.PI) / 180.0;
      const lng2 = (KAABA_COORDS.lng * Math.PI) / 180.0;

      const dLng = lng2 - lng1;

      // Exact Great-Circle Forward Azimuth Formula
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      let q = Math.atan2(y, x) * (180.0 / Math.PI);
      this.qiblaBearing = (q + 360.0) % 360.0;

      // Haversine Exact Great-Circle Distance
      const R = 6371.0; // Earth mean radius in km
      const dLat = lat2 - lat1;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      this.distanceToKaaba = Math.round(R * c);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. HARDWARE COMPASS & TILT-COMPENSATED SENSORS
    // ─────────────────────────────────────────────────────────────
    setupOrientationSensors() {
      const onOrientation = (e) => {
        if (this.isManualDragging) return; // Do not override during active user manual drag

        let heading = null;

        // iOS Safari Native Compass (most accurate on iPhone)
        if (typeof e.webkitCompassHeading === 'number') {
          heading = e.webkitCompassHeading;
          this.hasOrientationSensor = true;
        } else if (e.alpha !== null) {
          // Android / Chrome 3D Tilt-Compensated Compass Fusion
          if (typeof e.beta === 'number' && typeof e.gamma === 'number') {
            heading = this.computeTiltCompensatedHeading(e.alpha, e.beta, e.gamma);
          } else {
            heading = (360 - e.alpha) % 360;
          }
          this.hasOrientationSensor = true;
        }

        if (heading !== null) {
          // Handle screen orientation rotation (landscape vs portrait)
          const screenAngle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
          heading = (heading + screenAngle + 360) % 360;
          this.targetHeading = heading;
        }
      };

      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', onOrientation, { passive: true });
      } else if ('ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', onOrientation, { passive: true });
      }

      // Check sensor availability after 2 seconds
      setTimeout(() => {
        const hintEl = document.getElementById('qiblaAlignmentHint');
        if (!this.hasOrientationSensor) {
          // Desktop mode: auto align initially to demonstrate Kaaba bearing
          this.snapToQibla();
          if (hintEl) {
            hintEl.textContent = 'اسحب قرص البوصلة بيدك لتجربتها، وستعود تلقائياً لاتجاه القبلة فور الإفلات';
          }
        }
      }, 1500);
    }

    computeTiltCompensatedHeading(alpha, beta, gamma) {
      const degToRad = Math.PI / 180;
      const _x = beta ? beta * degToRad : 0; // pitch
      const _y = gamma ? gamma * degToRad : 0; // roll
      const _z = alpha ? alpha * degToRad : 0; // yaw

      const cX = Math.cos(_x);
      const cY = Math.cos(_y);
      const cZ = Math.cos(_z);
      const sX = Math.sin(_x);
      const sY = Math.sin(_y);
      const sZ = Math.sin(_z);

      // Magnetic vector components in horizontal plane
      const Vx = -cZ * sY - sZ * sX * cY;
      const Vy = -sZ * sY + cZ * sX * cY;

      let heading = Math.atan2(Vx, Vy) * (180 / Math.PI);
      if (heading < 0) heading += 360;
      return heading;
    }

    requestIOSSensorPermission() {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === 'granted') {
              if (window.showToast) window.showToast('تم تفعيل مستشعر البوصلة بنجاح');
            } else {
              if (window.showToast) window.showToast('يرجى السماح بصلاحية الحركة والاتجاه من إعدادات Safari');
            }
          })
          .catch((err) => {
            console.warn('[Qibla Permission]', err);
            this.openCalibrationModal();
          });
      } else {
        this.openCalibrationModal();
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. INTERACTIVE MANUAL DIAL & AUTO-SNAP TO KAABA
    // ─────────────────────────────────────────────────────────────
    setupManualDragInteraction() {
      const stage = document.getElementById('qiblaDialStage');
      if (!stage) return;

      const getAngleFromEvent = (e) => {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rad = Math.atan2(clientY - centerY, clientX - centerX);
        return (rad * 180) / Math.PI;
      };

      const startDrag = (e) => {
        this.isManualDragging = true;
        this.manualStartAngle = getAngleFromEvent(e);
        this.manualStartHeading = this.targetHeading;
      };

      const doDrag = (e) => {
        if (!this.isManualDragging) return;
        const currentAngle = getAngleFromEvent(e);
        const delta = currentAngle - this.manualStartAngle;
        // Subtract delta so clockwise mouse drag turns disc clockwise naturally
        this.targetHeading = (this.manualStartHeading - delta + 360) % 360;
      };

      const endDrag = () => {
        if (!this.isManualDragging) return;
        this.isManualDragging = false;

        // Auto snap back to Kaaba as requested!
        setTimeout(() => {
          this.snapToQibla();
        }, 150);
      };

      stage.addEventListener('mousedown', startDrag);
      window.addEventListener('mousemove', doDrag);
      window.addEventListener('mouseup', endDrag);

      stage.addEventListener('touchstart', startDrag, { passive: true });
      window.addEventListener('touchmove', doDrag, { passive: true });
      window.addEventListener('touchend', endDrag);
    }

    snapToQibla() {
      // Smoothly animate targetHeading to face the Kaaba directly
      this.targetHeading = this.qiblaBearing;
      const statusText = document.getElementById('qiblaStatusText');
      if (statusText) {
        statusText.textContent = 'جارٍ توجيه البوصلة تلقائياً نحو الكعبة المشرفة...';
      }
      if (window.showToast) window.showToast('تمت محاذاة البوصلة مباشرة باتجاه الكعبة المشرفة');
    }

    // ─────────────────────────────────────────────────────────────
    // 4. LOW-PASS FILTER & BATTERY-EFFICIENT RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    smoothAngle(current, target, factor = 0.18) {
      let diff = target - current;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      return (current + diff * factor + 360) % 360;
    }

    startRenderLoop() {
      const render = (timestamp) => {
        // Battery throttle: limit render update rate to ~25 fps (~40ms per frame)
        if (timestamp - this.lastFrameTime >= 40) {
          this.lastFrameTime = timestamp;
          this.updateCompassFrame(timestamp);
        }
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }

    updateCompassFrame(now) {
      // Smooth heading transition without 0/360 wrapping jumps
      this.currentHeading = this.smoothAngle(this.currentHeading, this.targetHeading);

      const rotatingDisc = document.getElementById('qiblaRotatingDisc');
      const qhubAngle = document.getElementById('qhubAngle');
      const currentHeadingVal = document.getElementById('qiblaCurrentHeadingVal');
      const heroEl = document.getElementById('qiblaCompassHero');
      const statusText = document.getElementById('qiblaStatusText');
      const stabilityFill = document.getElementById('qiblaStabilityFill');
      const alignmentHint = document.getElementById('qiblaAlignmentHint');

      // The compass disc rotates counter to heading so North stays aligned
      if (rotatingDisc) {
        rotatingDisc.style.transform = `rotate(${-this.currentHeading}deg)`;
      }

      // Angle difference between current heading and Qibla bearing
      let diff = this.qiblaBearing - this.currentHeading;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      const absDiff = Math.abs(diff);

      const isCurrentlyFacingQibla = absDiff <= 3.5;

      if (qhubAngle) {
        qhubAngle.textContent = `${Math.round(this.currentHeading)}°`;
      }
      if (currentHeadingVal) {
        currentHeadingVal.textContent = `${Math.round(this.currentHeading)}°`;
      }

      // Stability Hold Tracking
      if (isCurrentlyFacingQibla) {
        const delta = this.lastStabilityCheck ? (now - this.lastStabilityCheck) : 50;
        this.stabilityDuration = Math.min(1200, this.stabilityDuration + delta);
      } else {
        this.stabilityDuration = Math.max(0, this.stabilityDuration - 120);
        this.hasPlayedLockChime = false;
      }
      this.lastStabilityCheck = now;

      // Update stability track fill
      if (stabilityFill) {
        const pct = Math.round((this.stabilityDuration / 1200) * 100);
        stabilityFill.style.width = `${pct}%`;
      }

      // Lock-On Trigger
      const isLockedNow = this.stabilityDuration >= 1100;
      if (heroEl) {
        heroEl.classList.toggle('locked-on', isLockedNow);
      }

      if (statusText) {
        if (isLockedNow) {
          statusText.textContent = 'أنت الآن باتجاه القبلة المشرفة بدقة تامة';
          if (!this.hasPlayedLockChime) {
            this.hasPlayedLockChime = true;
            this.playLockSuccessChime();
            this.triggerHapticFeedback();
          }
        } else if (isCurrentlyFacingQibla) {
          statusText.textContent = 'أثبت مكانك للتأكيد الروحي...';
        } else if (diff > 0) {
          statusText.textContent = `انحرف ${Math.round(absDiff)}° جهة اليمين ❯`;
        } else {
          statusText.textContent = `❮ انحرف ${Math.round(absDiff)}° جهة اليسار`;
        }
      }

      if (alignmentHint) {
        if (isLockedNow) {
          alignmentHint.innerHTML = 'تقبل الله صلاتكم ودعاءكم • الكعبة المشرفة في سمت بصرك مباشرة';
        } else if (diff > 0) {
          alignmentHint.innerHTML = `در بجهازك ببطء جهة <strong style="color:#E0A96D;">اليمين</strong> بمقدار <strong>${Math.round(absDiff)}°</strong>`;
        } else {
          alignmentHint.innerHTML = `در بجهازك ببطء جهة <strong style="color:#E0A96D;">اليسار</strong> بمقدار <strong>${Math.round(absDiff)}°</strong>`;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. PURE SYNTHESIZED WEB AUDIO CHIME & HAPTIC FEEDBACK
    // ─────────────────────────────────────────────────────────────
    playLockSuccessChime() {
      if (window.wzkerPrayer && window.wzkerPrayer.isAudioMuted) return;

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        // Two-tone celestial harmony (528 Hz Love frequency + 660 Hz pure fifth)
        const playTone = (freq, delay, dur) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + delay);

          gain.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.18, this.audioContext.currentTime + delay + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + dur);

          osc.connect(gain);
          gain.connect(this.audioContext.destination);

          osc.start(this.audioContext.currentTime + delay);
          osc.stop(this.audioContext.currentTime + delay + dur);
        };

        playTone(528, 0, 0.45);
        playTone(660, 0.12, 0.55);
      } catch (e) {
        console.log('[Web Audio Chime]', e);
      }
    }

    triggerHapticFeedback() {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([28, 45, 28]);
        } catch (e) {}
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. LIVE MECCA CLOCK & SANCTUARY ATMOSPHERE
    // ─────────────────────────────────────────────────────────────
    startMeccaLiveClock() {
      if (this.meccaClockInterval) clearInterval(this.meccaClockInterval);

      const updateClock = () => {
        // Mecca is UTC+3 (AST) year-round without daylight saving
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const meccaDate = new Date(utc + 3 * 3600000);

        const hours = String(meccaDate.getHours()).padStart(2, '0');
        const mins = String(meccaDate.getMinutes()).padStart(2, '0');
        const secs = String(meccaDate.getSeconds()).padStart(2, '0');

        const clockEl = document.getElementById('meccaLiveTimeVal');
        if (clockEl) {
          clockEl.textContent = `${hours}:${mins}:${secs}`;
        }
      };

      updateClock();
      this.meccaClockInterval = setInterval(updateClock, 1000);
    }

    // ─────────────────────────────────────────────────────────────
    // 7. UI RENDERING & DIAL CALIBRATION
    // ─────────────────────────────────────────────────────────────
    renderStaticUI() {
      // Top Navbar Info
      const subtitleEl = document.getElementById('qnavSubtitle');
      if (subtitleEl) {
        subtitleEl.textContent = `${this.location.name} • القبلة: ${this.qiblaBearing.toFixed(1)}°`;
      }

      // Telemetry Strip
      const distanceEl = document.getElementById('qiblaDistanceVal');
      if (distanceEl) {
        distanceEl.textContent = `${this.distanceToKaaba.toLocaleString('ar-EG')} كم`;
      }

      const bearingEl = document.getElementById('qiblaBearingVal');
      if (bearingEl) {
        bearingEl.textContent = `${this.qiblaBearing.toFixed(1)}°`;
      }

      // Kaaba Beacon on Rotating Disc
      const kaabaBeacon = document.getElementById('qiblaKaabaBeacon');
      if (kaabaBeacon) {
        kaabaBeacon.style.transform = `rotate(${this.qiblaBearing}deg)`;
      }

      // Generate 360 degree ticks dynamically inside SVG
      this.renderDegreeTicks();

      // Render Pilgrimage Journey Telemetry
      this.renderJourneyMetrics();
    }

    renderJourneyMetrics() {
      // Flight Time (~800 km/h)
      const flightHours = (this.distanceToKaaba / 800).toFixed(1);
      const flightEl = document.getElementById('qiblaFlightTimeVal');
      if (flightEl) flightEl.textContent = `~${flightHours} ساعة`;

      // Car / Bus Time (~95 km/h)
      const carHours = Math.round(this.distanceToKaaba / 95);
      const carEl = document.getElementById('qiblaCarTimeVal');
      if (carEl) carEl.textContent = `~${carHours} ساعة`;

      // Caravan Foot Days (~25 km/day historical pilgrim caravan)
      const footDays = Math.round(this.distanceToKaaba / 25);
      const footEl = document.getElementById('qiblaFootDaysVal');
      if (footEl) footEl.textContent = `~${footDays} يوماً`;

      // Exact Coordinates Readout
      const coordsEl = document.getElementById('qiblaCoordsVal');
      if (coordsEl) {
        const latDir = this.location.lat >= 0 ? 'شمالاً' : 'جنوباً';
        const lngDir = this.location.lng >= 0 ? 'شرقاً' : 'غرباً';
        coordsEl.textContent = `${Math.abs(this.location.lat).toFixed(4)}° ${latDir}، ${Math.abs(this.location.lng).toFixed(4)}° ${lngDir}`;
      }
    }

    renderDegreeTicks() {
      const svg = document.getElementById('qiblaTicksSvg');
      if (!svg) return;

      let marksHtml = '';

      // Outer astrolabe concentric decorative circle
      marksHtml += `
        <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(210, 149, 113, 0.25)" stroke-width="0.8" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="0.6" stroke-dasharray="2, 3" />
      `;

      for (let deg = 0; deg < 360; deg += 5) {
        const isCardinal = deg % 90 === 0;
        const isMajor = deg % 30 === 0;
        const isMedium = deg % 15 === 0;

        const length = isCardinal ? 11 : isMajor ? 9 : isMedium ? 6 : 3.5;
        const strokeWidth = isCardinal ? 1.8 : isMajor ? 1.4 : isMedium ? 1 : 0.75;
        const strokeColor = isCardinal
          ? 'rgba(255, 82, 82, 0.95)'
          : isMajor
          ? 'rgba(224, 169, 109, 0.9)'
          : isMedium
          ? 'rgba(224, 169, 109, 0.5)'
          : 'rgba(255, 255, 255, 0.25)';

        marksHtml += `
          <line x1="100" y1="${4}" x2="100" y2="${4 + length}" 
                stroke="${strokeColor}" stroke-width="${strokeWidth}" 
                stroke-linecap="round"
                transform="rotate(${deg} 100 100)" />
        `;

        // Degree numbers for major angles (30, 60, 120, 150, etc.)
        if (isMajor && !isCardinal) {
          const rad = (deg - 90) * (Math.PI / 180);
          const textR = 85;
          const tx = 100 + textR * Math.cos(rad);
          const ty = 100 + textR * Math.sin(rad);

          marksHtml += `
            <text x="${tx}" y="${ty}" font-size="5.5" font-family="monospace, sans-serif" 
                  fill="rgba(224, 169, 109, 0.7)" text-anchor="middle" dominant-baseline="central">
              ${deg}°
            </text>
          `;
        }
      }
      svg.innerHTML = marksHtml;
    }

    openCalibrationModal() {
      const modal = document.getElementById('qiblaCalibrationModal');
      if (modal) modal.classList.add('active');
    }

    closeCalibrationModal() {
      const modal = document.getElementById('qiblaCalibrationModal');
      if (modal) modal.classList.remove('active');
    }

    shareQiblaInfo() {
      const text = `تحديد اتجاه القبلة عبر تطبيق وذكر:\nالمدينة: ${this.location.name}\nزاوية القبلة: ${this.qiblaBearing.toFixed(1)}° من الشمال الحقيقي\nالمسافة إلى الكعبة المشرفة: ${this.distanceToKaaba.toLocaleString('ar-EG')} كم\nhttps://wzker.web.app`;

      if (navigator.share) {
        navigator.share({
          title: 'اتجاه القبلة - وذكر',
          text: text
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          if (window.showToast) window.showToast('تم نسخ بيانات القبلة للحافظة بنجاح');
        });
      }
    }

    copyDua() {
      const text = '«وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ • إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ»';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          if (window.showToast) window.showToast('تم نسخ دعاء التوجه والاستفتاح للحافظة');
        });
      }
    }
  }

  // Initialize and mount globally
  window.wzkerQibla = new WzkerQiblaEngine();
})();
