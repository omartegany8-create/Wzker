/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL SIDEBAR CONTROLLER (القائمة الجانبية الفاخرة)
 * Handles opening, closing, navigation, touch swipe gestures, and app sharing.
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerSidebar {
    constructor() {
      this.overlay = null;
      this.panel = null;
      this.isOpen = false;
      this.touchStartX = 0;
      this.touchStartY = 0;

      // Initialize on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.overlay = document.getElementById('appSidebarDrawer');
      if (!this.overlay) return;

      this.panel = this.overlay.querySelector('.sidebar-panel');

      // Close on backdrop click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // Close on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Swipe to close gesture (Swipe right in RTL)
      if (this.panel) {
        this.panel.addEventListener('touchstart', (e) => {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.panel.addEventListener('touchend', (e) => {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - this.touchStartX;
          const diffY = touchEndY - this.touchStartY;

          // If swiping right (towards right edge in RTL) by more than 60px and mostly horizontal
          if (diffX > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
            this.close();
          }
        }, { passive: true });
      }
    }

    open() {
      if (!this.overlay) this.overlay = document.getElementById('appSidebarDrawer');
      if (!this.overlay) return;

      this.overlay.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (!this.overlay) this.overlay = document.getElementById('appSidebarDrawer');
      if (!this.overlay) return;

      this.overlay.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    navigate(pageId) {
      this.close();
      setTimeout(() => {
        if (window.openLibPage) {
          window.openLibPage(pageId);
        } else {
          const p = document.getElementById(pageId);
          if (p) p.classList.add('active');
        }
      }, 200);
    }

    shareApp() {
      const title = 'تطبيق وذكر | Wzker';
      const text = 'استمع إلى القرآن الكريم بأصوات خاشعة، وابتهالات نادرة، وراديو القرآن المباشر مع تطبيق وذكر';
      const url = window.location.href;

      if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {
          // User cancelled or share failed
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          if (window.showToast) {
            window.showToast('تم نسخ رابط تطبيق وذكر بنجاح');
          }
        }).catch(() => {
          if (window.showToast) {
            window.showToast('مشاركة وذكر: ' + url);
          }
        });
      } else {
        if (window.showToast) {
          window.showToast('مشاركة وذكر: ' + url);
        }
      }
    }
  }

  window.wzkerSidebar = new WzkerSidebar();
})();
