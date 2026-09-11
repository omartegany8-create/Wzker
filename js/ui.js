/**
 * Wzker UI Controller & Gesture Management
 * Conflict-free navigation, touch events, and Live Radio UI integration.
 */

// Toast Notifications
window.showToast = (msg) => {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<img src="images/icons/leaf-1.png" alt="Icon"> ' + msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-10px)';
    setTimeout(() => t.remove(), 300);
  }, 2600);
};

// 1. Spiritual Themes
const THEMES = [
  { id: 'desert_sunrise', name: 'شروق الصحراء' },
  { id: 'sage_copper', name: 'واحة المرمية والنحاس' },
  { id: 'deep_ocean', name: 'أعماق المحيط الفيروزي' },
  { id: 'midnight_calm', name: 'السحر الليلي الهادئ' }
];

window.setTheme = (themeId) => {
  const found = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', found.id);
  localStorage.setItem('wzker_theme', found.id);
  window.showToast('تم تفعيل ثيم: ' + found.name);

  if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
    window.wzkerCloud.triggerSync('theme');
  }

  document.querySelectorAll('.theme-pill-card').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-theme-val') === found.id);
  });
};

window.toggleAppTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'desert_sunrise';
  const idx = THEMES.findIndex(t => t.id === current);
  const next = THEMES[(idx + 1) % THEMES.length];
  window.setTheme(next.id);
};

// 2. Typography System (3 Font Families & 3 Sizes)
window.setFontFamily = (fontId) => {
  const valid = ['zain', 'cairo', 'amiri'];
  if (!valid.includes(fontId)) fontId = 'zain';
  document.documentElement.setAttribute('data-font', fontId);
  localStorage.setItem('wzker_font', fontId);

  document.querySelectorAll('.font-choice-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font-val') === fontId);
  });

  const fontNames = { zain: 'خط زين العصري', cairo: 'خط كايرو الحديث', amiri: 'خط أميري القرآني' };
  window.showToast('تم تغيير الخط إلى: ' + fontNames[fontId]);
};

window.setFontSize = (sizeId) => {
  const valid = ['small', 'medium', 'large'];
  if (!valid.includes(sizeId)) sizeId = 'medium';
  document.documentElement.setAttribute('data-font-size', sizeId);
  localStorage.setItem('wzker_font_size', sizeId);

  document.querySelectorAll('.font-size-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-size-val') === sizeId);
  });

  const sizeNames = { small: 'حجم مريح (صغير)', medium: 'حجم قياسي (وسط)', large: 'حجم كبير وواضح' };
  window.showToast('تم ضبط حجم الخط: ' + sizeNames[sizeId]);
};

// 3. Notification & Haptic Toggles
window.toggleSettingSwitch = (key, checkbox) => {
  const val = checkbox.checked;
  localStorage.setItem('wzker_' + key, val ? '1' : '0');
  
  if (key === 'sys_notif' && val && 'Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        window.showToast('تم تفعيل إشعارات النظام بنجاح 🔔');
      } else {
        checkbox.checked = false;
        window.showToast('يرجى السماح بالإشعارات من إعدادات المتصفح');
      }
    });
  } else {
    window.showToast('تم تحديث التفضيلات بنجاح');
  }
};

// 4. Initialize Settings from Storage
function initSettingsState() {
  const initialTheme = localStorage.getItem('wzker_theme') || 'desert_sunrise';
  document.documentElement.setAttribute('data-theme', initialTheme);
  document.querySelectorAll('.theme-pill-card').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-theme-val') === initialTheme);
  });

  const initialFont = localStorage.getItem('wzker_font') || 'zain';
  document.documentElement.setAttribute('data-font', initialFont);
  document.querySelectorAll('.font-choice-card').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-font-val') === initialFont);
  });

  const initialFontSize = localStorage.getItem('wzker_font_size') || 'medium';
  document.documentElement.setAttribute('data-font-size', initialFontSize);
  document.querySelectorAll('.font-size-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-size-val') === initialFontSize);
  });

  const sysNotif = localStorage.getItem('wzker_sys_notif') === '1';
  const dhikrAlert = localStorage.getItem('wzker_dhikr_alert') !== '0';
  const haptic = localStorage.getItem('wzker_haptic') !== '0';

  const sysEl = document.getElementById('switchSysNotif');
  const dhikrEl = document.getElementById('switchDhikrAlert');
  const hapticEl = document.getElementById('switchHaptic');

  if (sysEl) sysEl.checked = sysNotif;
  if (dhikrEl) dhikrEl.checked = dhikrAlert;
  if (hapticEl) hapticEl.checked = haptic;
}

// 5. Bottom Sheets & Player Controllers
window.openSheet = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
};

window.closeSheet = (id) => {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
};

window.openCustomModal = () => {
  const m = document.getElementById('createPlaylistModal');
  if (m) m.classList.add('active');
};

window.closeCustomModal = () => {
  const m = document.getElementById('createPlaylistModal');
  if (m) m.classList.remove('active');
};

window.confirmCreatePlaylist = () => {
  const inp = document.getElementById('newPlaylistInput');
  if (inp && inp.value.trim()) {
    window.wzkerLib.createPlaylist(inp.value.trim());
    inp.value = '';
    window.closeCustomModal();
  }
};

window.openFullPlayer = () => {
  // If radio is active, open the dedicated radio view for optimal experience
  if (window.wzkerAudio && window.wzkerAudio.isRadioActive()) {
    window.openRadioPlayer();
    return;
  }

  const fp = document.getElementById('fullPlayer');
  if (fp) {
    fp.classList.add('active');
    if (window.wzkerAudio) window.wzkerAudio.updateUI();
    if (window.wzkerQuranSync && window.wzkerAudio && window.wzkerAudio.currentTrack) {
      window.wzkerQuranSync.syncCurrentTrack(window.wzkerAudio.currentTrack);
    }
  }
};

window.closeFullPlayer = () => {
  const fp = document.getElementById('fullPlayer');
  if (fp) fp.classList.remove('active');
};

// 6. LIVE RADIO CONTROLLERS
window.openRadioPlayer = () => {
  const rp = document.getElementById('radioPlayerOverlay');
  if (rp) {
    rp.classList.add('active');
    if (window.wzkerAudio) window.wzkerAudio.updateUI();
  }
};

window.closeRadioUI = () => {
  const rp = document.getElementById('radioPlayerOverlay');
  if (rp) rp.classList.remove('active');
};

window.toggleRadioPlay = () => {
  const radioTrack = {
    id: 'live_radio_cairo',
    title: 'إذاعة القرآن الكريم من القاهرة',
    artist: 'جمهورية مصر العربية • بث مباشر 24/7',
    url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    image: 'images/radio/radio-live.png',
    isRadio: true
  };
  
  if (window.wzkerAudio.isRadioActive()) {
    window.wzkerAudio.togglePlayPause();
  } else {
    window.wzkerAudio.playTrack(radioTrack, [radioTrack], 0);
  }
};

window.setRadioVolume = (val) => {
  if (window.wzkerAudio && window.wzkerAudio.audio) {
    window.wzkerAudio.audio.muted = false;
    window.wzkerAudio.audio.volume = val / 100;
  }
};

window.toggleRadioMute = () => {
  if (window.wzkerAudio && window.wzkerAudio.audio) {
    window.wzkerAudio.audio.muted = !window.wzkerAudio.audio.muted;
    if (window.wzkerAudio.audio.muted) {
      window.showToast('تم كتم صوت الراديو');
    } else {
      window.showToast('تم تشغيل الصوت');
    }
  }
};

window.refreshRadioStream = () => {
  if (window.wzkerAudio) {
    window.showToast('جاري إعادة مزامنة البث المباشر');
    const timestamp = Date.now();
    window.wzkerAudio.audio.src = `https://stream.radiojar.com/8s5u5tpdtwzuv?t=${timestamp}`;
    window.wzkerAudio.audio.play().then(() => {
      window.wzkerAudio.isPlaying = true;
      window.wzkerAudio.updateUI();
    }).catch(e => console.log('Radio refresh:', e));
  }
};

// 7. Sub-Pages Navigation
window.openLibPage = (id) => {
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
  if (id === 'settingsPage') {
    window.updateSettingsStorageInfo();
    if (window.wzkerNotif && window.wzkerNotif.syncSettingsUI) {
      window.wzkerNotif.syncSettingsUI();
    }
  }
  if (id === 'quranPage' && window.wzkerQuran) {
    window.wzkerQuran.renderHeroCard();
    window.wzkerQuran.renderBookmarksList();
  }
  if (id === 'tasbeehPage' && window.wzkerTasbeeh) {
    window.wzkerTasbeeh.updateUI();
  }
  if (id === 'loginPage' && window.wzkerCloud) {
    window.wzkerCloud.updateAccountPageUI();
  }
  if ((id === 'loginPage' || id === 'authLoginPage' || id === 'authRegisterPage') && window.wzkerCloud && typeof window.wzkerCloud.renderAllGoogleButtons === 'function') {
    setTimeout(() => window.wzkerCloud.renderAllGoogleButtons(), 60);
  }
};

window.closeLibPage = (id) => {
  const page = document.getElementById(id);
  if (page) page.classList.remove('active');
};

window.updateSettingsStorageInfo = () => {
  const usageEl = document.getElementById('storageUsageVal');
  const favCntEl = document.getElementById('storageFavCnt');
  const histCntEl = document.getElementById('storageHistCnt');

  if (window.wzkerLib) {
    if (usageEl) usageEl.textContent = window.wzkerLib.calculateStorageUsage();
    if (favCntEl) favCntEl.textContent = window.wzkerLib.favs.length;
    if (histCntEl) histCntEl.textContent = window.wzkerLib.history.length;
  }
};

window.openPlaylistsPage = () => {
  window.openLibPage('playlistsPage');
  window.wzkerLib.renderPlaylists();
};

window.openHistoryPage = () => {
  window.openLibPage('historyPage');
  window.wzkerLib.renderHistory();
};

// Speed & Sleep Timer controls
window.setPlaybackSpeed = (speed, btn) => {
  window.wzkerAudio.setSpeed(speed);
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const ind = document.getElementById('speedIndicator');
  const badge = document.getElementById('liveSpeedBadge');
  if (ind) ind.textContent = speed + 'x';
  if (badge) badge.style.display = speed !== 1.0 ? 'inline-flex' : 'none';
  window.closeSheet('speedSheet');
  window.showToast('تم ضبط سرعة التلاوة على ' + speed + 'x');
};

window.setSleepTimer = (mins) => {
  window.wzkerAudio.setSleepTimer(mins);
  window.closeSheet('timerSheet');
};

// 8. Seek Bar Dragging & Touch Handling (High-Precision Smooth Scrubbing)
function setupDraggableSeekBar() {
  const bar = document.getElementById('fpProgressBar');
  if (!bar) return;

  const getPercent = (e) => {
    const rect = bar.getBoundingClientRect();
    let clientX = e.clientX;
    if (clientX === undefined) {
      if (e.touches && e.touches.length > 0) clientX = e.touches[0].clientX;
      else if (e.changedTouches && e.changedTouches.length > 0) clientX = e.changedTouches[0].clientX;
      else clientX = 0;
    }
    const offsetX = clientX - rect.left;
    return Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
  };

  const updatePreview = (pct) => {
    const fpProg = document.getElementById('fpProgressCurrent');
    const curTimeEl = document.getElementById('fpCurrentTime');
    if (fpProg) fpProg.style.width = pct + '%';

    if (window.wzkerAudio && window.wzkerAudio.audio && window.wzkerAudio.audio.duration && !isNaN(window.wzkerAudio.audio.duration)) {
      const time = (pct / 100) * window.wzkerAudio.audio.duration;
      if (curTimeEl) curTimeEl.textContent = window.wzkerAudio.formatTime(time);
    }
  };

  let isPointerDown = false;

  const onPointerMove = (e) => {
    if (!isPointerDown) return;
    if (e.cancelable) e.preventDefault();
    const pct = getPercent(e);
    updatePreview(pct);
  };

  const onPointerUp = (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    bar.classList.remove('is-scrubbing');

    const pct = getPercent(e);
    if (window.wzkerAudio) {
      window.wzkerAudio.seek(pct);
      setTimeout(() => {
        if (window.wzkerAudio) window.wzkerAudio.isSeeking = false;
      }, 80);
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
  };

  const onPointerDown = (e) => {
    if (!window.wzkerAudio || !window.wzkerAudio.audio || !window.wzkerAudio.audio.duration || isNaN(window.wzkerAudio.audio.duration)) return;
    if (window.wzkerAudio.isRadioActive()) return;

    isPointerDown = true;
    window.wzkerAudio.isSeeking = true;
    bar.classList.add('is-scrubbing');

    const pct = getPercent(e);
    updatePreview(pct);

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  bar.addEventListener('pointerdown', onPointerDown);
}

// 9. Swipe Gestures
function setupSwipeGestures() {
  const full = document.getElementById('fullPlayer');
  const radioOverlay = document.getElementById('radioPlayerOverlay');

  if (full) {
    let startY = 0;
    full.addEventListener('touchstart', (e) => {
      if (e.touches[0].clientY < window.innerHeight * 0.4) {
        startY = e.touches[0].clientY;
      } else {
        startY = 0;
      }
    }, { passive: true });

    full.addEventListener('touchend', (e) => {
      if (startY > 0 && e.changedTouches[0].clientY - startY > 60) {
        window.closeFullPlayer();
      }
    }, { passive: true });
  }

  if (radioOverlay) {
    let startY = 0;
    radioOverlay.addEventListener('touchstart', (e) => {
      if (e.touches[0].clientY < window.innerHeight * 0.35) {
        startY = e.touches[0].clientY;
      } else {
        startY = 0;
      }
    }, { passive: true });

    radioOverlay.addEventListener('touchend', (e) => {
      if (startY > 0 && e.changedTouches[0].clientY - startY > 60) {
        window.closeRadioUI();
      }
    }, { passive: true });
  }
}

// 10. Prevent Drag and Right Click on Images/Icons
function setupImageDragPrevention() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('img')) {
      e.preventDefault();
    }
  });

  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
  });
}

// Share App Helper
window.shareApp = () => {
  if (navigator.share) {
    navigator.share({
      title: 'إذاعة القرآن الكريم - وذكر',
      text: 'استمع الآن إلى البث المباشر لإذاعة القرآن الكريم من القاهرة عبر تطبيق وذكر',
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    window.showToast('تم نسخ رابط البث لمشاركته 📋');
  }
};

// Initialize Listeners on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initSettingsState();
  setupDraggableSeekBar();
  setupSwipeGestures();
  setupImageDragPrevention();
  window.updateSettingsStorageInfo();
});
