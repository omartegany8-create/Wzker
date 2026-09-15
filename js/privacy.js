/**
 * WZKER (وذكر) - PRIVACY & SECURITY HUB MODULE (js/privacy.js)
 * Real Permissions Checker, Storage Metrics, JSON Export,
 * Interactive FAQ Accordion, and Developer Contact
 */

(function () {
  'use strict';

  class WzkerPrivacyHub {
    constructor() {
      this.whatsappNumber = '201158601817';
      this.developerEmail = 'omartegany8@gmail.com';

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
      this.updateStorageMetrics();
      this.checkLivePermissions();
      this.bindFaqAccordion();
    }

    onOpen() {
      this.updateStorageMetrics();
      this.checkLivePermissions();
    }

    // ── 1. فحص حالة الأذونات الفعلية في المتصفح ──
    async checkLivePermissions() {
      // 1. Geolocation
      const geoBadge = document.getElementById('permGeoBadge');
      if (geoBadge && navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          this.applyPermBadge(geoBadge, status.state);
          status.onchange = () => this.applyPermBadge(geoBadge, status.state);
        } catch (e) {
          geoBadge.textContent = 'متاح عند الطلب';
        }
      }

      // 2. Notifications
      const notifBadge = document.getElementById('permNotifBadge');
      if (notifBadge && 'Notification' in window) {
        this.applyPermBadge(notifBadge, Notification.permission);
      }
    }

    applyPermBadge(element, state) {
      if (!element) return;
      if (state === 'granted') {
        element.textContent = 'مُفعل ونشط ✓';
        element.className = 'privacy-perm-badge active';
      } else if (state === 'denied') {
        element.textContent = 'مرفوض';
        element.className = 'privacy-perm-badge';
      } else {
        element.textContent = 'عند الحاجة فقط';
        element.className = 'privacy-perm-badge';
      }
    }

    // ── 2. إحصائيات التخزين المحلي والبيانات ──
    updateStorageMetrics() {
      try {
        // Favorites
        const favs = JSON.parse(localStorage.getItem('wzker_favorites') || '[]');
        const favsEl = document.getElementById('privacyStatFavs');
        if (favsEl) favsEl.textContent = (Array.isArray(favs) ? favs.length : 0).toLocaleString('ar-EG');

        // Quran Bookmark
        const bookmark = localStorage.getItem('wzker_quran_bookmark');
        const bookmarkEl = document.getElementById('privacyStatBookmark');
        if (bookmarkEl) bookmarkEl.textContent = bookmark ? 'محفوظة' : 'لا يوجد';

        // Ideas & Tickets
        const tickets = JSON.parse(localStorage.getItem('wzker_user_tickets') || '[]');
        const ticketsEl = document.getElementById('privacyStatTickets');
        if (ticketsEl) ticketsEl.textContent = (Array.isArray(tickets) ? tickets.length : 0).toLocaleString('ar-EG');
      } catch (e) {
        console.warn('Storage calculation error:', e);
      }
    }

    // ── 3. الأسئلة الشائعة (Interactive FAQ Accordion) ──
    bindFaqAccordion() {
      const items = document.querySelectorAll('.privacy-faq-item');
      items.forEach((item) => {
        const btn = item.querySelector('.privacy-faq-question');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          items.forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      });
    }

    // ── 4. تصدير البيانات (JSON Backup) ──
    exportUserData() {
      try {
        const backup = {
          appName: 'Wzker (وذكر)',
          version: '2.5',
          date: new Date().toISOString(),
          favorites: JSON.parse(localStorage.getItem('wzker_favorites') || '[]'),
          quranBookmark: localStorage.getItem('wzker_quran_bookmark') || null,
          khatmaProgress: JSON.parse(localStorage.getItem('wzker_khatma_progress') || '{}'),
          tasbeehState: JSON.parse(localStorage.getItem('wzker_tasbeeh_state') || '{}'),
          userTickets: JSON.parse(localStorage.getItem('wzker_user_tickets') || '[]')
        };

        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', jsonStr);
        a.setAttribute('download', `wzker-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();

        if (window.showToast) {
          window.showToast('تم تحميل نسختك الاحتياطية بنجاح 📁');
        }
      } catch (e) {
        console.error('Export error:', e);
        if (window.showToast) window.showToast('تعذر تصدير البيانات');
      }
    }

    // ── 5. تصفير السجلات المحلية بأمان ──
    clearUserData() {
      const confirmed = window.confirm(
        'هل تود مسح السجلات المحلية المحفوظة على جهازك؟\n' +
        '(سيتم مسح المفضلة وعلامة المصحف وسجلات التسبيح وستبدأ من جديد).'
      );

      if (!confirmed) return;

      try {
        localStorage.removeItem('wzker_favorites');
        localStorage.removeItem('wzker_quran_bookmark');
        localStorage.removeItem('wzker_khatma_progress');
        localStorage.removeItem('wzker_tasbeeh_state');
        this.updateStorageMetrics();

        if (window.showToast) {
          window.showToast('تم مسح السجلات المحلية بنجاح');
        }
      } catch (e) {
        console.error('Clear error:', e);
      }
    }

    // ── 6. قنوات التواصل المباشر مع عمر ──
    openWhatsApp() {
      const text = encodeURIComponent('السلام عليكم يا عمر، حابب أستفسر بخصوص الخصوصية وأمان البيانات في تطبيق وذكر.');
      window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
    }

    openEmail() {
      const mailto = `mailto:${this.developerEmail}?subject=${encodeURIComponent('استفسار أمني - وذكر')}&body=${encodeURIComponent('السلام عليكم ورحمة الله،\n\n')}`;
      window.open(mailto, '_blank');
    }
  }

  window.wzkerPrivacy = new WzkerPrivacyHub();
})();
