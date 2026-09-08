/**
 * Wzker Notification & Spiritual Reminders System (منظومة الإشعارات والنفحات الروحانية)
 * Phase 1: Notifications Engine, In-App Drawer, Web Audio Chime, & Settings Hub
 */

class WzkerNotificationManager {
  constructor() {
    this.storageKey = 'wzker_notif_items_v1';
    this.configKey = 'wzker_notif_config_v1';

    // Default configuration
    this.config = {
      master: true,
      dhikr: true,
      lockscreen: true,
      downloads: true,
      chime: true,
      haptic: true,
      quietHours: true,
      intervalMinutes: 15
    };

    // Spiritual Reminders & Dhikr Bank (الصلاة على النبي ﷺ والتذكير بذكر الله فقط)
    this.reminderBank = [
      {
        title: 'الصلاة على النبي ﷺ 🌸',
        body: '«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ».. بها تُكفى همَّك ويُغفر ذنبك.',
        type: 'dhikr'
      },
      {
        title: 'هل صليت على النبي اليوم؟ 🌸',
        body: '«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا».. عطّر لسانك بالصلاة على الحبيب ﷺ.',
        type: 'dhikr'
      },
      {
        title: 'الصلاة الإبراهيمية 🌸',
        body: '«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ».',
        type: 'dhikr'
      },
      {
        title: 'تذكير بذكر الله 🌿',
        body: '«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ».. رطّب لسانك واملأ قلبك طمأنينة وسكينة.',
        type: 'dhikr'
      },
      {
        title: 'الباقيات الصالحات 📿',
        body: '«سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ».. غراس الجنة.',
        type: 'dhikr'
      },
      {
        title: 'استغفار ودعاء 🤲',
        body: '«أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ».. من لزم الاستغفار جعل الله له من كل همٍّ فرجاً.',
        type: 'dhikr'
      },
      {
        title: 'الحوقلة وكنز الجنة ✨',
        body: '«لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ».. كنزٌ من كنوز العرش، دواءٌ لـ 99 داء.',
        type: 'dhikr'
      },
      {
        title: 'التسبيح والحمد 📿',
        body: '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ».. كلمتان خفيفتان على اللسان ثقيلتان في الميزان.',
        type: 'dhikr'
      },
      {
        title: 'التهليل والتوحيد 🌟',
        body: '«لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ».',
        type: 'dhikr'
      }
    ];

    this.items = [];
    this.timer = null;
    this.audioCtx = null;
    this.currentFilter = 'all';

    this.loadConfig();
    this.loadItems();
    this.initTimer();
  }

  // 1. Load & Save Configuration
  loadConfig() {
    try {
      const stored = localStorage.getItem(this.configKey);
      if (stored) {
        this.config = Object.assign({}, this.config, JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load notif config:', e);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(this.config));
    } catch (e) {}
  }

  // 2. Load & Save Stored Notifications
  loadItems() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        // Initial clean welcome items
        this.items = [
          {
            id: 'init_salawat',
            type: 'dhikr',
            title: 'الصلاة على النبي ﷺ 🌸',
            body: '«اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ».. بها تُكفى همَّك ويُغفر ذنبك.',
            timestamp: Date.now() - 3600000,
            isPinned: true,
            isRead: false
          },
          {
            id: 'init_dhikr',
            type: 'dhikr',
            title: 'تذكير بذكر الله 🌿',
            body: '«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ».. رطّب لسانك بذكر الله والصلاة على رسول الله.',
            timestamp: Date.now() - 1800000,
            isPinned: false,
            isRead: false
          }
        ];
        this.saveItems();
      }
    } catch (e) {
      this.items = [];
    }
    this.updateBadgeCounter();
  }

  saveItems() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {}
    this.updateBadgeCounter();
  }

  // 3. Dynamic Badge Counter (+9, 1..9, hide on 0)
  updateBadgeCounter() {
    const badgeEl = document.getElementById('notifBadgeCounter');
    if (!badgeEl) return;

    const unreadCount = this.items.filter(item => !item.isRead).length;

    if (unreadCount <= 0) {
      badgeEl.style.display = 'none';
      badgeEl.textContent = '0';
    } else if (unreadCount > 9) {
      badgeEl.style.display = 'inline-flex';
      badgeEl.textContent = '+9';
    } else {
      badgeEl.style.display = 'inline-flex';
      badgeEl.textContent = String(unreadCount);
    }
  }

  // 4. Pure Web Audio API: Spiritual Harmonic Chime (رنّة السكينة الهادئة)
  playSpiritualChime() {
    if (!this.config.chime) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Master Gain for smooth fade-out
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
      masterGain.connect(this.audioCtx.destination);

      // Root tone (528 Hz - Solfeggio Love/Clarity frequency)
      const oscRoot = this.audioCtx.createOscillator();
      oscRoot.type = 'sine';
      oscRoot.frequency.setValueAtTime(528, now);
      oscRoot.connect(masterGain);
      oscRoot.start(now);
      oscRoot.stop(now + 1.3);

      // Harmonic overtone (792 Hz - Perfect Fifth)
      const oscHarmonic = this.audioCtx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(792, now);
      
      const harmGain = this.audioCtx.createGain();
      harmGain.gain.setValueAtTime(0.09, now);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      
      oscHarmonic.connect(harmGain);
      harmGain.connect(masterGain);
      oscHarmonic.start(now);
      oscHarmonic.stop(now + 1.0);
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  }

  // Trigger gentle haptic feedback on supported mobile devices
  triggerHaptic() {
    if (!this.config.haptic) return;
    try {
      if (navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([45, 30, 45]);
      }
    } catch (e) {}
  }

  // 5. Native OS & Lock Screen Web Notification
  showNativeNotification(title, body, icon = 'images/icon/wzker.png') {
    if (!this.config.lockscreen) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: icon,
          badge: 'images/icon/wzker.png',
          dir: 'rtl',
          lang: 'ar',
          silent: true // We use our own serene spiritual chime
        });
      } catch (e) {}
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          this.showNativeNotification(title, body, icon);
        }
      });
    }
  }

  // 6. Periodic Reminder Timer Loop
  initTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (!this.config.master || !this.config.dhikr) return;

    const intervalMs = Math.max(1, this.config.intervalMinutes || 15) * 60 * 1000;
    this.timer = setInterval(() => {
      this.dispatchPeriodicReminder();
    }, intervalMs);
  }

  // Check Quiet Hours (11:00 PM to 5:00 AM)
  isQuietHours() {
    if (!this.config.quietHours) return false;
    const hour = new Date().getHours();
    return (hour >= 23 || hour < 5);
  }

  dispatchPeriodicReminder() {
    if (!this.config.master || !this.config.dhikr) return;
    if (this.isQuietHours()) return;

    // Pick random reminder
    const idx = Math.floor(Math.random() * this.reminderBank.length);
    const reminder = this.reminderBank[idx];

    this.addNotification({
      type: reminder.type || 'dhikr',
      title: reminder.title,
      body: reminder.body,
      isPinned: false
    });

    this.playSpiritualChime();
    this.triggerHaptic();
    this.showNativeNotification(reminder.title, reminder.body);
  }

  // 7. Add Notification to Drawer & Storage
  addNotification({ type = 'dhikr', title, body, isPinned = false }) {
    const newItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: type,
      title: title || 'نفحة روحانية',
      body: body || '',
      timestamp: Date.now(),
      isPinned: !!isPinned,
      isRead: false
    };

    // Prepend to top
    this.items.unshift(newItem);

    // Limit maximum items to 60
    if (this.items.length > 60) {
      // Keep pinned items, prune unpinned from end
      const pinned = this.items.filter(i => i.isPinned);
      const unpinned = this.items.filter(i => !i.isPinned).slice(0, 50);
      this.items = [...pinned, ...unpinned];
    }

    this.saveItems();
    this.renderDrawer();
  }

  // Helper for Download Notifications
  notifyDownloadProgress(track, pct, loadedMB, totalMB) {
    if (!this.config.master || !this.config.downloads) return;

    const trackId = String((track && (track.id || track.title || track.url)) || 'audio');
    const itemId = 'dl_live_' + trackId;
    const title = track.title || 'التلاوة المباركة';
    const sheikh = track.artist || track.munshid || track.sheikhName || 'القارئ';

    let item = this.items.find(i => i.id === itemId);
    if (!item) {
      item = {
        id: itemId,
        trackId: trackId,
        type: 'download',
        title: `جاري تحميل ${title}`,
        body: `${sheikh} • ${loadedMB} / ${totalMB} م.ب`,
        pct: pct,
        loadedMB: loadedMB,
        totalMB: totalMB,
        isLive: true,
        isPinned: true,
        isRead: false,
        timestamp: Date.now()
      };
      this.items.unshift(item);
      this.saveItems();
      this.renderDrawer();
    } else {
      item.pct = pct;
      item.loadedMB = loadedMB;
      item.totalMB = totalMB;
      item.body = `${sheikh} • ${loadedMB} / ${totalMB} م.ب (${pct}%)`;

      // Direct DOM update if element exists to avoid lag
      const liveBar = document.getElementById(`notifLiveBar_${itemId}`);
      const livePct = document.getElementById(`notifLivePct_${itemId}`);
      const liveBody = document.getElementById(`notifLiveBody_${itemId}`);
      if (liveBar) liveBar.style.width = pct + '%';
      if (livePct) livePct.textContent = pct + '%';
      if (liveBody) liveBody.textContent = item.body;
    }
  }

  notifyDownloadComplete(track, formattedSize) {
    if (!this.config.master || !this.config.downloads) return;

    const trackId = String((track && (track.id || track.title || track.url)) || 'audio');
    const liveItemId = 'dl_live_' + trackId;
    const title = track.title || 'التلاوة المباركة';
    const sheikh = track.artist || track.munshid || track.sheikhName || 'القارئ';

    // Remove any live tracking item
    this.items = this.items.filter(i => i.id !== liveItemId);

    // Add completed notification item
    this.addNotification({
      type: 'download',
      title: `اكتمل تحميل ${title} 💾`,
      body: `تم حفظ ${title} بصوت ${sheikh} بنجاح (${formattedSize}). أصبحت جاهزة للاستماع أوفلاين دون إنترنت 100%.`,
      isPinned: false
    });

    this.playSpiritualChime();
    this.triggerHaptic();
    this.showNativeNotification(`تم اكتمال التنزيل أوفلاين 💾`, `تم حفظ ${title} بنجاح للاستماع دون اتصال.`);
    if (window.showToast) {
      window.showToast(`تم حفظ «${title}» أوفلاين بنجاح 💾`);
    }
  }

  cancelDownloadNotification(trackId) {
    const key = String(trackId);
    this.items = this.items.filter(i => i.id !== ('dl_live_' + key) && i.trackId !== key);
    this.saveItems();
    this.renderDrawer();
  }

  // 8. In-App Drawer UI Controls & Interactions
  openDrawer() {
    const drawer = document.getElementById('notificationDrawer');
    if (!drawer) return;

    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Mark items as read
    let hadUnread = false;
    this.items.forEach(item => {
      if (!item.isRead) {
        item.isRead = true;
        hadUnread = true;
      }
    });

    if (hadUnread) {
      this.saveItems();
    }

    this.renderDrawer();
  }

  closeDrawer() {
    const drawer = document.getElementById('notificationDrawer');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleDrawer() {
    const drawer = document.getElementById('notificationDrawer');
    if (drawer && drawer.classList.contains('active')) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  setFilter(category) {
    this.currentFilter = category;
    this.renderDrawer();
  }

  // Pin / Unpin single notification
  togglePin(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    item.isPinned = !item.isPinned;
    this.saveItems();
    this.renderDrawer();

    if (window.showToast) {
      window.showToast(item.isPinned ? 'تم تثبيت الإشعار في الأعلى 📌' : 'تم إلغاء التثبيت 📍');
    }
  }

  // Delete single notification
  deleteItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveItems();
    this.renderDrawer();
    if (window.showToast) {
      window.showToast('تم حذف الإشعار 🗑️');
    }
  }

  // Clear all non-pinned notifications
  clearAll() {
    const pinnedCount = this.items.filter(i => i.isPinned).length;
    this.items = this.items.filter(i => i.isPinned);
    this.saveItems();
    this.renderDrawer();

    if (window.showToast) {
      if (pinnedCount > 0) {
        window.showToast(`تم مسح السجل مع الاحتفاظ بـ (${pinnedCount}) إشعارات مثبتة 📌`);
      } else {
        window.showToast('تم مسح سجل الإشعارات بالكامل 🧹');
      }
    }
  }

  // Copy notification text to clipboard
  copyText(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    const shareText = `${item.title}\n${item.body}\n\n— عبر تطبيق وذكر 🌿`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        if (window.showToast) window.showToast('تم نسخ الذكر للمشاركة 📋');
      }).catch(() => {
        if (window.showToast) window.showToast('تم نسخ الذكر 📋');
      });
    } else {
      if (window.showToast) window.showToast('تم نسخ الذكر 📋');
    }
  }

  formatTimeAgo(timestamp) {
    if (!timestamp) return 'الآن';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'الآن';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} د`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

  // Render Drawer DOM
  renderDrawer() {
    const listContainer = document.getElementById('notifDrawerList');
    const countBadge = document.getElementById('notifHeaderCount');
    const quickIntervalDisplay = document.getElementById('notifQuickIntervalDisplay');
    const quickStateDot = document.getElementById('notifQuickStateDot');

    if (countBadge) {
      countBadge.textContent = this.items.length;
    }

    if (quickIntervalDisplay) {
      quickIntervalDisplay.textContent = this.config.master 
        ? `كل ${this.config.intervalMinutes} دقيقة` 
        : 'التنبيهات متوقفة';
    }

    if (quickStateDot) {
      quickStateDot.classList.toggle('off', !this.config.master);
    }

    if (!listContainer) return;

    // Filter items
    let filtered = [...this.items];
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(i => i.type === this.currentFilter);
    }

    // Sort: Pinned first, then by timestamp descending
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="notif-empty-state">
          <img src="images/icons/notification.png" alt="Empty">
          <h4>لا توجد تنبيهات حالياً</h4>
          <p>عطّر فمك بذكر الله، وستصلك النفحات والأذكار والتنبيهات هنا بشكل متجدد.</p>
          <button onclick="window.wzkerNotif.dispatchPeriodicReminder()" style="background: rgba(214,173,96,0.18); border: 1px solid #d6ad60; color: #d6ad60; padding: 7px 16px; border-radius: 99px; font-size: 11px; font-weight: 800; cursor: pointer;">طلب نفحة الآن 📿</button>
        </div>
      `;
      return;
    }

    const typeConfig = {
      dhikr: { label: 'أذكار ونفحات', icon: 'fa-solid fa-moon', cls: 'cat-dhikr' },
      quran: { label: 'آية مباركة', icon: 'fa-solid fa-book-quran', cls: 'cat-quran' },
      download: { label: 'تحميلات أوفلاين', icon: 'fa-solid fa-download', cls: 'cat-download' },
      prayer: { label: 'مواقيت وأذان', icon: 'fa-solid fa-mosque', cls: 'cat-prayer' }
    };

    let html = '';
    filtered.forEach(item => {
      // Special rendering for active live streaming downloads
      if (item.type === 'download' && item.isLive) {
        html += `
          <div class="notif-card cat-download is-pinned" id="notifCard_${item.id}">
            <div class="notif-card-header">
              <div class="notif-card-meta">
                <span class="notif-card-badge" style="color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25);">
                  <i class="fa-solid fa-cloud-arrow-down fa-bounce"></i>
                  <span>جاري التنزيل أوفلاين</span>
                </span>
                <span class="notif-card-time" id="notifLivePct_${item.id}" style="color: #38bdf8; font-weight: 800;">${item.pct}%</span>
              </div>
              <div class="notif-card-tools">
                <button class="notif-tool-btn btn-delete" onclick="window.wzkerStorage.cancelCurrentDownload()" title="إلغاء التنزيل">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <h4 class="notif-card-title">${item.title}</h4>
            <p class="notif-card-body" id="notifLiveBody_${item.id}">${item.body}</p>

            <div class="notif-dl-live-bar-wrap">
              <div class="notif-dl-live-bar" id="notifLiveBar_${item.id}" style="width: ${item.pct}%;"></div>
            </div>
          </div>
        `;
        return;
      }

      const cfg = typeConfig[item.type] || typeConfig.dhikr;
      const pinnedCls = item.isPinned ? 'is-pinned' : '';
      const pinIcon = item.isPinned ? 'fa-solid fa-thumbtack' : 'fa-solid fa-thumbtack';
      const pinBtnCls = item.isPinned ? 'pinned' : '';
      const timeStr = this.formatTimeAgo(item.timestamp);

      // Actions based on item type
      let actionBtn = '';
      if (item.type === 'download') {
        actionBtn = `
          <button class="notif-action-chip" onclick="window.openLibPage('downloadsPage'); window.wzkerNotif.closeDrawer();" title="فتح قائمة التحميلات">
            <i class="fa-solid fa-folder-open"></i>
            <span>فتح التحميلات</span>
          </button>
        `;
      } else {
        actionBtn = `
          <button class="notif-action-chip" onclick="window.wzkerNotif.copyText('${item.id}')" title="نسخ الذكر للمشاركة">
            <i class="fa-regular fa-copy"></i>
            <span>مشاركة</span>
          </button>
        `;
      }

      html += `
        <div class="notif-card ${cfg.cls} ${pinnedCls}" id="notifCard_${item.id}">
          <div class="notif-card-header">
            <div class="notif-card-meta">
              <span class="notif-card-badge">
                <i class="${cfg.icon}"></i>
                <span>${cfg.label}</span>
              </span>
              <span class="notif-card-time">${timeStr}</span>
            </div>
            <div class="notif-card-tools">
              <button class="notif-tool-btn btn-pin ${pinBtnCls}" onclick="window.wzkerNotif.togglePin('${item.id}')" title="${item.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}">
                <i class="${pinIcon}"></i>
              </button>
              <button class="notif-tool-btn btn-delete" onclick="window.wzkerNotif.deleteItem('${item.id}')" title="حذف الإشعار">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <h4 class="notif-card-title">${item.title}</h4>
          <p class="notif-card-body">${item.body}</p>

          <div class="notif-card-actions">
            ${actionBtn}
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  }

  // 9. Settings Hub Interactions (SECTION 4 in Settings Page)
  toggleMaster(enabled) {
    this.config.master = !!enabled;
    this.saveConfig();
    this.initTimer();

    const collapseEl = document.getElementById('notifSubSettingsCollapse');
    const bannerEl = document.getElementById('notifMasterBanner');
    if (collapseEl) {
      collapseEl.classList.toggle('is-collapsed', !this.config.master);
    }
    if (bannerEl) {
      bannerEl.classList.toggle('is-disabled', !this.config.master);
    }

    if (window.showToast) {
      window.showToast(this.config.master ? 'تم تفعيل منظومة التنبيهات الروحانية 🔔' : 'تم إيقاف التنبيهات مؤقتاً 🔕');
    }

    this.renderDrawer();
  }

  toggleSub(key, enabled) {
    if (this.config[key] !== undefined) {
      this.config[key] = !!enabled;
      this.saveConfig();
      if (key === 'dhikr') {
        this.initTimer();
      }
      if (window.showToast) {
        window.showToast('تم حفظ الإعدادات بنجاح ✅');
      }
    }
  }

  setInterval(minutes) {
    const val = parseInt(minutes, 10);
    if (isNaN(val) || val <= 0) return;

    this.config.intervalMinutes = val;
    this.saveConfig();
    this.initTimer();
    this.syncSettingsUI();
    this.renderDrawer();

    if (window.showToast) {
      window.showToast(`تم ضبط تكرار التذكير: كل ${val} دقيقة ⏱️`);
    }
  }

  setCustomIntervalFromInput() {
    const inputEl = document.getElementById('notifCustomMinutesInput');
    if (!inputEl) return;

    const val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1 || val > 1440) {
      if (window.showToast) window.showToast('يرجى كتابة رقم بين 1 و 1440 دقيقة');
      return;
    }

    this.setInterval(val);
  }

  testChime() {
    this.playSpiritualChime();
    this.triggerHaptic();
    if (window.showToast) {
      window.showToast('رنّة السكينة الروحانية الهادئة 🔔✨');
    }
  }

  // Sync settings page elements with active config
  syncSettingsUI() {
    const masterSwitch = document.getElementById('notifMasterSwitchInput');
    const dhikrSwitch = document.getElementById('switchDhikrAlert');
    const lockscreenSwitch = document.getElementById('switchSysNotif');
    const downloadsSwitch = document.getElementById('switchDownloadsNotif');
    const chimeSwitch = document.getElementById('switchChimeNotif');
    const hapticSwitch = document.getElementById('switchHaptic');
    const quietSwitch = document.getElementById('switchQuietHours');
    const collapseEl = document.getElementById('notifSubSettingsCollapse');
    const bannerEl = document.getElementById('notifMasterBanner');
    const currentBadge = document.getElementById('notifCurrentIntervalBadge');
    const customInput = document.getElementById('notifCustomMinutesInput');

    if (masterSwitch) masterSwitch.checked = !!this.config.master;
    if (dhikrSwitch) dhikrSwitch.checked = !!this.config.dhikr;
    if (lockscreenSwitch) lockscreenSwitch.checked = !!this.config.lockscreen;
    if (downloadsSwitch) downloadsSwitch.checked = !!this.config.downloads;
    if (chimeSwitch) chimeSwitch.checked = !!this.config.chime;
    if (hapticSwitch) hapticSwitch.checked = !!this.config.haptic;
    if (quietSwitch) quietSwitch.checked = !!this.config.quietHours;

    if (collapseEl) {
      collapseEl.classList.toggle('is-collapsed', !this.config.master);
    }
    if (bannerEl) {
      bannerEl.classList.toggle('is-disabled', !this.config.master);
    }

    if (currentBadge) {
      currentBadge.textContent = `كل ${this.config.intervalMinutes} د`;
    }

    if (customInput) {
      customInput.value = this.config.intervalMinutes;
    }

    // Update interval pill active classes
    const pills = document.querySelectorAll('.notif-pill-btn');
    pills.forEach(p => {
      const pVal = parseInt(p.getAttribute('data-mins'), 10);
      p.classList.toggle('active', pVal === this.config.intervalMinutes);
    });
  }
}

// Global Single Instance
window.wzkerNotif = new WzkerNotificationManager();
window.toggleNotificationDrawer = () => window.wzkerNotif.toggleDrawer();
