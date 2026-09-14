/**
 * WZKER (وذكر) - ABOUT APP MODULE (js/about.js)
 * High-End Animations, Interactive Dua Heart Burst,
 * Animated Stats Counters, Developer Connect & Share Helpers
 */

(function () {
  'use strict';

  class WzkerAboutModule {
    constructor() {
      this.whatsappNumber = '201158601817';
      this.telegramContact = '201158601817';
      this.developerEmail = 'omartegany8@gmail.com';
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animFrameId = null;
      this.countersAnimated = false;

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
      this.renderDuaCount();
      this.initHeartCanvas();
    }

    onOpen() {
      if (!this.countersAnimated) {
        this.animateStats();
        this.countersAnimated = true;
      }
    }

    // ── 1. عداد الدعاء وتأثير قلوب بظهر الغيب ──
    getDuaCount() {
      try {
        return parseInt(localStorage.getItem('wzker_dua_count') || '142', 10);
      } catch (e) {
        return 142;
      }
    }

    renderDuaCount() {
      const el = document.getElementById('aboutDuaCounterVal');
      if (el) {
        el.textContent = this.getDuaCount().toLocaleString('ar-EG');
      }
    }

    sendDua() {
      const newCount = this.getDuaCount() + 1;
      try {
        localStorage.setItem('wzker_dua_count', newCount.toString());
      } catch (e) {
        console.warn(e);
      }
      this.renderDuaCount();

      // Haptic feedback
      if (navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40]); } catch (e) {}
      }

      // Launch heart burst
      this.fireHeartBurst();

      // Warm Egyptian spiritual toast
      const duas = [
        'جزاك الله خيراً ولك بمثل وأضعاف مضاعفة يا رب! ❤️',
        'تقبل الله منك ورزقك طمأنينة القلب والبال 🤲',
        'كتب الله أجرك ورفع قدرك وبارك فيك وفي أهلك ✨',
        'دعوة مباركة.. غفر الله لنا ولك ولوالدينا جميعاً 🤍'
      ];
      const randomDua = duas[Math.floor(Math.random() * duas.length)];
      if (window.showToast) {
        window.showToast(randomDua);
      }
    }

    // ── 2. محاكي جزيئات القلوب المتطايرة (Canvas Heart Particles) ──
    initHeartCanvas() {
      let canvas = document.getElementById('aboutHeartCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'aboutHeartCanvas';
        canvas.className = 'about-heart-burst-canvas';
        document.body.appendChild(canvas);
      }
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      const resize = () => {
        if (this.canvas) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }
      };
      window.addEventListener('resize', resize);
      resize();
    }

    fireHeartBurst() {
      if (!this.canvas || !this.ctx) this.initHeartCanvas();
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      const colors = ['#9C3D32', '#D29571', '#28a745', '#E63946', '#FFB703', '#ffffff'];

      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: w / 2 + (Math.random() - 0.5) * 120,
          y: h / 2 + 100 + (Math.random() - 0.5) * 60,
          size: Math.random() * 16 + 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 9 - 4,
          rot: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.08,
          opacity: 1,
          scale: Math.random() * 0.5 + 0.8
        });
      }

      if (!this.animFrameId) {
        this.renderParticles();
      }
    }

    drawHeart(ctx, x, y, size, color, opacity, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, opacity);
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    renderParticles() {
      if (!this.ctx || !this.canvas) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gentle gravity
        p.vx *= 0.98;
        p.rot += p.vRot;
        p.opacity -= 0.014;

        if (p.opacity <= 0) {
          this.particles.splice(i, 1);
        } else {
          this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rot);
        }
      }

      if (this.particles.length > 0) {
        this.animFrameId = requestAnimationFrame(() => this.renderParticles());
      } else {
        this.animFrameId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    // ── 3. أنيميشن العدادات الرقمية (Stats Counters) ──
    animateStats() {
      const counters = [
        { id: 'statSurahsCount', target: 114, prefix: '+', suffix: '' },
        { id: 'statAdhkarCount', target: 300, prefix: '+', suffix: '' },
        { id: 'statPrivacyCount', target: 100, prefix: '', suffix: '%' }
      ];

      counters.forEach((c) => {
        const el = document.getElementById(c.id);
        if (!el) return;
        let current = 0;
        const duration = 1400;
        const stepTime = 25;
        const totalSteps = duration / stepTime;
        const increment = c.target / totalSteps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= c.target) {
            current = c.target;
            clearInterval(timer);
          }
          el.textContent = c.prefix + Math.floor(current) + c.suffix;
        }, stepTime);
      });
    }

    // ── 4. التواصل مع المطور عمر ──
    openWhatsApp() {
      const text = encodeURIComponent('السلام عليكم يا بشمهندس عمر، تحياتي ليك بخصوص تطبيق وذكر.. تسلم إيدك على التطبيق الجميل وربنا يجعله في ميزان حسناتك.');
      window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
    }

    openTelegram() {
      const text = encodeURIComponent('السلام عليكم يا عمر، حابب أحييك على تطبيق وذكر الرائع.');
      window.open(`https://t.me/+${this.telegramContact}?text=${text}`, '_blank');
    }

    openEmail() {
      const mailto = `mailto:${this.developerEmail}?subject=${encodeURIComponent('رسالة بخصوص تطبيق وذكر')}&body=${encodeURIComponent('السلام عليكم ورحمة الله وبركاته،\n\n')}`;
      window.open(mailto, '_blank');
    }

    // ── 5. مشاركة التطبيق ──
    shareApp() {
      const title = 'تطبيق وذكر | Wzker';
      const text = 'تطبيق وذكر - صدقة جارية، رفيقك اليومي لقراءة القرآن الكريم، حصن المسلم، الأذكار والتسبيح بدون أي إعلانات.';
      const url = window.location.href.split('#')[0];

      if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
      } else {
        this.copyShareLink();
      }
    }

    copyShareLink() {
      const url = window.location.href.split('#')[0];
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          if (window.showToast) {
            window.showToast('تم نسخ رابط تطبيق وذكر بنجاح.. انشر ولك الأجر ✨');
          }
        });
      } else {
        if (window.showToast) {
          window.showToast('رابط التطبيق: ' + url);
        }
      }
    }
  }

  window.wzkerAbout = new WzkerAboutModule();
})();
