/**
 * Wzker Spiritual Library & Offline Storage Engine (Production Grade)
 * Full Support for Favorites (Tracks & Full Sheikh Folders), Real Audio Downloads,
 * User-Created Playlists with Dedicated View, Time-Grouped History, Pinning (Max 3),
 * Real-time Track Card Synchronization & Reactive Playlists Sheet.
 */

const WZKER_CURATED_PLAYLISTS = [
  {
    id: 'wzker_curated_fajr',
    name: 'روائع الفجر والسكينة',
    isCurated: true,
    author: 'من وذكر',
    tracks: [
      { id: 'c_fajr_1', title: 'سورة الفاتحة', artist: 'الشيخ مشاري راشد العفاسي', url: 'https://server8.mp3quran.net/afs/001.mp3', image: 'images/sheikh/afasy.png', type: 'تلاوة' },
      { id: 'c_fajr_2', title: 'سورة مريم', artist: 'الشيخ عبد الباسط عبد الصمد', url: 'https://server7.mp3quran.net/basit/019.mp3', image: 'images/sheikh/abdulbaset.jpg', type: 'تلاوة' },
      { id: 'c_fajr_3', title: 'سورة يس', artist: 'الشيخ محمد صديق المنشاوي', url: 'https://server10.mp3quran.net/minsh/036.mp3', image: 'images/sheikh/minshawi.jpg', type: 'تلاوة' }
    ]
  },
  {
    id: 'wzker_curated_haram',
    name: 'تلاوات الحرم المكي الشريف',
    isCurated: true,
    author: 'من وذكر',
    tracks: [
      { id: 'c_haram_1', title: 'سورة الرحمن', artist: 'الشيخ ماهر المعيقلي', url: 'https://server12.mp3quran.net/maher/055.mp3', image: 'images/sheikh/maher.jpg', type: 'تلاوة' },
      { id: 'c_haram_2', title: 'سورة الملك', artist: 'الشيخ ياسر الدوسري', url: 'https://server11.mp3quran.net/yasser/067.mp3', image: 'images/sheikh/dossari.jpg', type: 'تلاوة' },
      { id: 'c_haram_3', title: 'سورة النجم', artist: 'الشيخ ياسر الدوسري', url: 'https://server11.mp3quran.net/yasser/053.mp3', image: 'images/sheikh/dossari.jpg', type: 'تلاوة' }
    ]
  },
  {
    id: 'wzker_curated_minshawi',
    name: 'خوالد الشيخ المنشاوي',
    isCurated: true,
    author: 'من وذكر',
    tracks: [
      { id: 'c_minsh_1', title: 'سورة يوسف', artist: 'الشيخ محمد صديق المنشاوي', url: 'https://server10.mp3quran.net/minsh/012.mp3', image: 'images/sheikh/minshawi.jpg', type: 'تلاوة' },
      { id: 'c_minsh_2', title: 'سورة الكهف', artist: 'الشيخ محمد صديق المنشاوي', url: 'https://server10.mp3quran.net/minsh/018.mp3', image: 'images/sheikh/minshawi.jpg', type: 'تلاوة' },
      { id: 'c_minsh_3', title: 'سورة ق', artist: 'الشيخ محمد صديق المنشاوي', url: 'https://server10.mp3quran.net/minsh/050.mp3', image: 'images/sheikh/minshawi.jpg', type: 'تلاوة' }
    ]
  }
];

class WzkerLibrary {
  constructor() {
    this.favs = this.load('wzker_favs', []);
    this.playlists = this.load('wzker_playlists', []);
    this.downloads = this.load('wzker_downloads', []);
    this.history = this.load('wzker_history', []);
    
    this.selectedTrackForContext = null;
    this.activePlaylistId = null;
    this.currentPlTab = 'all';

    // Selection Modes
    this.selectMode = {
      fav: false,
      down: false,
      hist: false
    };
    this.selectedItems = {
      fav: new Set(),
      down: new Set(),
      hist: new Set()
    };
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
    this.updateHubCounters();
  }

  // Update Library Hub Counters & Khatmah Milestone Widget
  updateHubCounters() {
    const favCountEl = document.getElementById('libFavCount');
    const downCountEl = document.getElementById('libDownCount');
    const plCountEl = document.getElementById('libPlaylistsCount');
    const histCountEl = document.getElementById('libHistoryCount');

    if (favCountEl) favCountEl.textContent = `${this.favs.length} ${this.favs.length === 1 ? 'عنصر' : 'تلاوة'}`;
    if (downCountEl) downCountEl.textContent = `${this.downloads.length} ${this.downloads.length === 1 ? 'ملف' : 'ملفات'}`;
    if (plCountEl) plCountEl.textContent = `${this.playlists.length} ${this.playlists.length === 1 ? 'قائمة' : 'قوائم'}`;
    if (histCountEl) histCountEl.textContent = `${this.history.length} ${this.history.length === 1 ? 'سجل' : 'تلاوة'}`;

    // Khatmah Progress Calculator (Unique surah numbers listened)
    const uniqueSurahs = new Set();
    let totalListenMinutes = 0;
    const sheikhCounts = {};

    this.history.forEach(item => {
      if (item.num && item.num >= 1 && item.num <= 114) {
        uniqueSurahs.add(item.num);
      }
      totalListenMinutes += 12; // average estimation
      const name = item.artist || item.munshid || item.sheikhName || 'المنشاوي';
      sheikhCounts[name] = (sheikhCounts[name] || 0) + 1;
    });

    const khatmahPercent = Math.min(100, Math.round((uniqueSurahs.size / 114) * 100));
    const khatmahPercentEl = document.getElementById('khatmahPercent');
    const khatmahFillEl = document.getElementById('khatmahProgressFill');
    const khatmahSurahsEl = document.getElementById('khatmahSurahsListened');
    const khatmahRemainingEl = document.getElementById('khatmahRemainingSurahs');

    if (khatmahPercentEl) khatmahPercentEl.textContent = `${khatmahPercent}٪`;
    if (khatmahFillEl) khatmahFillEl.style.width = `${khatmahPercent}%`;
    if (khatmahSurahsEl) khatmahSurahsEl.textContent = `${uniqueSurahs.size} من ١١٤ سورة مستمعة`;
    if (khatmahRemainingEl) {
      const rem = 114 - uniqueSurahs.size;
      khatmahRemainingEl.textContent = rem > 0 ? `باقي ${rem} سورة للختم` : `مبارك! أتممت الاستماع لكامل المصحف`;
    }

    // Top Sheikh & Total Hours
    const topSheikhEl = document.getElementById('statTopSheikh');
    const totalHoursEl = document.getElementById('statTotalHours');
    const savedStorageEl = document.getElementById('statSavedStorage');

    if (topSheikhEl) {
      let topName = 'المنشاوي';
      let maxC = 0;
      for (const [k, v] of Object.entries(sheikhCounts)) {
        if (v > maxC) { maxC = v; topName = k; }
      }
      topSheikhEl.textContent = topName;
    }

    if (totalHoursEl) {
      const hours = (totalListenMinutes / 60).toFixed(1);
      totalHoursEl.textContent = `${hours} س`;
    }

    if (savedStorageEl) {
      savedStorageEl.textContent = this.calculateStorageUsage();
    }
  }

  // ==========================================
  // 1. FAVORITES SYSTEM
  // ==========================================
  isFavorite(track) {
    if (!track) return false;
    const tid = track.id || track.title;
    return this.favs.some(f => f.id === tid || f.title === track.title);
  }

  toggleFavorite(track) {
    if (!track) return false;
    const tid = track.id || track.title;
    const idx = this.favs.findIndex(f => f.id === tid || f.title === track.title);
    
    let isNowFav = false;
    if (idx > -1) {
      this.favs.splice(idx, 1);
      if (window.showToast) window.showToast('تمت الإزالة من المفضلة');
      isNowFav = false;
    } else {
      const itemToSave = {
        id: tid,
        title: track.title,
        artist: track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة',
        sheikhName: track.sheikhName || track.artist || track.munshid,
        sheikhId: track.sheikhId,
        num: track.num,
        type: track.type || 'مكية',
        ayahs: track.ayahs || 'تلاوة مباركة',
        url: track.url || track.audioUrl,
        audioUrl: track.url || track.audioUrl,
        image: track.image || track.coverUrl || 'images/icon/wzker.png',
        coverUrl: track.image || track.coverUrl || 'images/icon/wzker.png',
        isSheikhFolder: track.isSheikhFolder || false,
        totalSurahs: track.totalSurahs || (track.isSheikhFolder ? 114 : undefined),
        pinned: false,
        addedAt: Date.now()
      };
      this.favs.unshift(itemToSave);
      if (window.showToast) window.showToast(track.isSheikhFolder ? 'تمت إضافة مصحف الشيخ بالكامل إلى المفضلة' : 'تمت الإضافة إلى المفضلة');
      isNowFav = true;
    }

    this.save('wzker_favs', this.favs);
    this.renderFavorites();
    this.updateFpFavIcon();
    if (window.wzkerAudio) window.wzkerAudio.updateUI();
    if (window.wzkerCloud && typeof window.wzkerCloud.triggerSync === 'function') {
      window.wzkerCloud.triggerSync('favorites');
    }
    return isNowFav;
  }

  // Pinning to Top (Max 3 Items)
  togglePinTrack(trackId) {
    if (!trackId) return;
    const item = this.favs.find(f => f.id === trackId || f.title === trackId);
    if (!item) return;

    if (!item.pinned) {
      const pinnedCount = this.favs.filter(f => f.pinned).length;
      if (pinnedCount >= 3) {
        if (window.showToast) window.showToast('الحد الأقصى للتثبيت هو ٣ تلاوات فقط');
        return;
      }
      item.pinned = true;
      if (window.showToast) window.showToast(`تم تثبيت «${item.title}» في الأعلى`);
    } else {
      item.pinned = false;
      if (window.showToast) window.showToast(`تم إلغاء تثبيت «${item.title}»`);
    }

    this.save('wzker_favs', this.favs);
    this.renderFavorites();
    if (window.wzkerAudio) window.wzkerAudio.updateUI();
  }

  updateFpFavIcon() {
    const fpFavImg = document.getElementById('fpFavIconImg');
    if (fpFavImg && window.wzkerAudio) {
      const cur = window.wzkerAudio.currentTrack;
      const isFav = cur ? this.isFavorite(cur) : false;
      fpFavImg.src = isFav ? 'images/icons/fav-active.png' : 'images/icons/no-fav.png';
      fpFavImg.style.filter = isFav ? 'none' : 'brightness(0) invert(1)';
    }
  }

  renderFavorites(filterQuery = '') {
    const foldersContainer = document.getElementById('favSheikhFoldersContainer');
    const foldersSection = document.getElementById('favSheikhFoldersSection');
    const surahsContainer = document.getElementById('favoritesList');
    const countBadge = document.getElementById('favSurahsCountBadge');

    if (!surahsContainer) return;

    let list = this.favs;
    if (filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      list = list.filter(item => (item.title && item.title.toLowerCase().includes(q)) || (item.artist && item.artist.toLowerCase().includes(q)));
    }

    // Separate Sheikh full album folders from individual surahs
    const sheikhFolders = list.filter(item => item.isSheikhFolder);
    const individualSurahs = list.filter(item => !item.isSheikhFolder);

    // Sort pinned items first
    individualSurahs.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    // Render Sheikh Album Folders
    if (foldersContainer && foldersSection) {
      if (sheikhFolders.length > 0) {
        foldersSection.style.display = 'block';
        foldersContainer.innerHTML = sheikhFolders.map(folder => {
          const isMob = window.IBTIHALAT_DATA && window.IBTIHALAT_DATA.some(m => m.id === folder.sheikhId);
          const openFn = isMob ? `openMobtahilProfile('${folder.sheikhId}')` : `openSheikhProfile('${folder.sheikhId}')`;
          const folderTitle = isMob ? 'كافة الابتهالات والمدائح' : 'المصحف المرتل كاملاً';
          const folderMeta = isMob ? `${folder.artist} • ${folder.totalSurahs || 3} ابتهالات مباركة` : `${folder.artist} • ${folder.totalSurahs || 114} سورة كاملة`;

          return `
            <div class="fav-folder-album-card" onclick="${openFn}">
              <div class="fav-folder-left">
                <div class="fav-folder-img">
                  <img src="${folder.image}" alt="${folder.artist}">
                </div>
                <div class="fav-folder-info">
                  <h4>${folderTitle}</h4>
                  <p>${folderMeta}</p>
                </div>
              </div>
              <div class="fav-folder-right">
                <button class="track-opt-btn" onclick="event.stopPropagation(); window.wzkerLib.toggleFavorite({ id: '${folder.id}', title: '${folder.title}' })" title="إزالة من المفضلة">
                  <i class="fa-solid fa-trash-can" style="color: #ff4757;"></i>
                </button>
                <div class="track-play-badge" onclick="event.stopPropagation(); playAllFromSheikh('${folder.sheikhId}', false);" title="تشغيل الكل">
                  <i class="fa-solid fa-play"></i>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        foldersSection.style.display = 'none';
      }
    }

    // Render Individual Surahs List
    if (countBadge) countBadge.textContent = individualSurahs.length;

    if (individualSurahs.length === 0 && sheikhFolders.length === 0) {
      surahsContainer.innerHTML = `
        <div class="no-search-results-box" style="margin-top: 15px;">
          <div class="no-res-artwork-wrap">
            <img src="images/icons/fav.png" class="no-res-img" alt="Empty Fav">
          </div>
          <h3 class="no-res-title">قائمة المفضلة فارغة حالياً</h3>
          <p class="no-res-subtitle">انقر على أيقونة القلب ❤️ في أي تلاوة لحفظها والرجوع إليها بسهولة في أي وقت</p>
          <button class="return-home-btn" onclick="closeLibPage('favoritesPage'); switchTab('homeView')">
            <img src="images/icons/home.png" alt="Home">
            <span>استكشاف التلاوات</span>
          </button>
        </div>
      `;
      return;
    }

    const isSelect = this.selectMode.fav;
    surahsContainer.innerHTML = individualSurahs.map((item, idx) => {
      const isPinned = !!item.pinned;
      const jsonStr = JSON.stringify(item).replace(/"/g, '&quot;');
      const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
      const isThisPlaying = cur && (cur.id === item.id || cur.title === item.title) && window.wzkerAudio.isPlaying;

      return `
        <div class="track-item ${isPinned ? 'pinned-track' : ''} ${isThisPlaying ? 'playing-now' : ''}" 
             data-track-id="${item.id}" 
             data-track-title="${item.title}" 
             data-track-num="${item.num || idx + 1}"
             data-track-pinned="${isPinned}"
             onclick="${isSelect ? `window.wzkerLib.toggleSelectItem('fav', '${item.id}')` : `window.openTrackInFullPlayer(${jsonStr})`}">
          
          <div class="track-item-left">
            ${isSelect ? `
              <input type="checkbox" class="track-select-checkbox" ${this.selectedItems.fav.has(item.id) ? 'checked' : ''} onclick="event.stopPropagation(); window.wzkerLib.toggleSelectItem('fav', '${item.id}')">
            ` : `
              <div class="track-play-indicator">
                ${isThisPlaying ? `
                  <div class="audio-waves-mini">
                    <span></span><span></span><span></span>
                  </div>
                ` : `
                  <span class="track-number">${isPinned ? '📌' : (item.num || idx + 1)}</span>
                `}
              </div>
            `}
            <div class="track-icon-img">
              <img src="${item.image || 'images/icon/wzker.png'}" alt="${item.artist}" loading="lazy">
            </div>
            <div class="track-meta">
              <h4>${item.title}</h4>
              <p>${item.artist} • ${item.type || 'تلاوة مباركة'} ${isPinned ? '• 📌 مثبتة' : ''}</p>
            </div>
          </div>

          <div class="track-item-right" onclick="event.stopPropagation()">
            <button class="track-opt-btn" onclick="window.wzkerLib.openTrackContextMenu(${jsonStr})" title="خيارات">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" title="تشغيل / إيقاف">
              <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Helper to accurately check if track is downloaded (matching reciter/artist)
  isDownloaded(track) {
    if (!track || !this.downloads) return false;
    const targetArtist = track.artist || track.sheikhName || track.munshid || '';
    const targetUrl = track.url || track.audioUrl || '';
    return this.downloads.some(d => {
      if (track.id && d.id && String(d.id) === String(track.id)) return true;
      if (targetUrl && d.url && d.url === targetUrl) return true;
      const dArtist = d.artist || d.sheikhName || d.munshid || '';
      if (d.title === track.title && dArtist && targetArtist && dArtist === targetArtist) return true;
      return false;
    });
  }

  // ==========================================
  // 2. REAL OFFLINE AUDIO DOWNLOADS SYSTEM (INDEXEDDB)
  // ==========================================
  downloadTrack(track) {
    if (!track) return;
    if (this.isDownloaded(track)) {
      if (window.wzkerStorage) {
        window.wzkerStorage.showAlreadyDownloadedModal(track);
      } else if (window.showToast) {
        window.showToast('هذه السورة محملة بالفعل في جهازك');
      }
      return;
    }
    if (window.wzkerStorage) {
      window.wzkerStorage.downloadAndStoreTrack(track);
    } else {
      if (window.showToast) window.showToast('جاري حفظ التلاوة...');
    }
  }

  syncAfterIndexedDBDownload(record) {
    if (!this.downloads.some(t => t.id === record.id)) {
      this.downloads.unshift(record);
      this.save('wzker_downloads', this.downloads);
    } else {
      const existing = this.downloads.find(t => t.id === record.id);
      if (existing) {
        existing.fileSize = record.fileSize;
        existing.bytes = record.bytes;
      }
      this.save('wzker_downloads', this.downloads);
    }
    this.renderDownloads();
    this.updateHubCounters();
  }

  removeSingleDownload(trackId) {
    const track = this.downloads.find(t => t.id === trackId);
    const title = track ? `«${track.title}»` : 'هذا الملف';

    window.showCustomConfirm({
      title: 'حذف التلاوة المحملة',
      message: `هل أنت متأكد من حذف ${title} من الذاكرة المحلية؟ سيتم تحرير المساحة فوراً.`,
      confirmText: 'نعم، حذف من الذاكرة 🗑️',
      isDanger: true,
      onConfirm: async () => {
        if (window.wzkerStorage) {
          await window.wzkerStorage.removeTrackOffline(trackId);
        }
        this.downloads = this.downloads.filter(t => t.id !== trackId);
        this.save('wzker_downloads', this.downloads);
        this.renderDownloads();
        if (window.showToast) window.showToast('تم حذف التلاوة وتوفير المساحة 🗑️');
      }
    });
  }

  toggleSheikhGroup(sheikhKey) {
    const groupEl = document.getElementById(`dlSheikhGroup_${sheikhKey}`);
    if (groupEl) {
      groupEl.classList.toggle('collapsed');
    }
  }

  renderDownloads(highlightTrackId = null) {
    const container = document.getElementById('downloadsContainer');
    const usageValEl = document.getElementById('storageUsageVal');
    const storageFillEl = document.getElementById('storageBarFill');

    if (!container) return;

    // Calculate real storage from recorded downloads
    let totalBytes = 0;
    this.downloads.forEach(d => {
      if (d.bytes) {
        totalBytes += d.bytes;
      } else if (d.fileSize) {
        totalBytes += (parseFloat(d.fileSize) || 4.5) * 1024 * 1024;
      }
    });
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
    if (usageValEl) usageValEl.textContent = `${totalMb} م.ب`;
    if (storageFillEl) {
      const fillPct = Math.min(100, (parseFloat(totalMb) / 250) * 100);
      storageFillEl.style.width = `${Math.max(4, fillPct)}%`;
    }

    if (this.downloads.length === 0) {
      container.innerHTML = `
        <div class="no-search-results-box" style="margin-top: 15px;">
          <div class="no-res-artwork-wrap">
            <img src="images/icons/download.png" class="no-res-img" alt="Empty Downloads">
          </div>
          <h3 class="no-res-title">لا توجد تلاوات محملة بعد</h3>
          <p class="no-res-subtitle">يمكنك تحميل أي تلاوة لسماعها في أي وقت ومكان بدون إنترنت وبأعلى نقاوة صوت</p>
          <button class="return-home-btn" onclick="closeLibPage('downloadsPage'); switchTab('homeView')">
            <img src="images/icons/home.png" alt="Home">
            <span>استكشاف التلاوات للتحميل</span>
          </button>
        </div>
      `;
      return;
    }

    // 1. Partition into Quran vs Inshad
    const quranTracks = [];
    const inshadTracks = [];

    const mobtahilNames = (window.MOBTAHILEEN_DATA || []).map(m => m.name || m.shortName);

    this.downloads.forEach(d => {
      const isMobtahil = d.type === 'mobtahil' || 
                         mobtahilNames.includes(d.artist) || 
                         mobtahilNames.includes(d.sheikhName) ||
                         (d.title && !d.title.startsWith('سورة'));
      if (isMobtahil) {
        inshadTracks.push(d);
      } else {
        quranTracks.push(d);
      }
    });

    // Helper: Group by Sheikh
    const groupBySheikh = (tracks) => {
      const groups = {};
      tracks.forEach(track => {
        const sheikhName = track.artist || track.sheikhName || track.munshid || 'قارئ مبارك';
        if (!groups[sheikhName]) {
          groups[sheikhName] = {
            name: sheikhName,
            image: track.image || 'images/icon/wzker.png',
            tracks: []
          };
        }
        groups[sheikhName].tracks.push(track);
      });
      return Object.values(groups);
    };

    const quranGroups = groupBySheikh(quranTracks);
    const inshadGroups = groupBySheikh(inshadTracks);

    const isSelect = this.selectMode.down;

    // Helper: Render single track item
    const renderTrackItem = (item, idx) => {
      const jsonStr = JSON.stringify(item).replace(/"/g, '&quot;');
      const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
      const isThisPlaying = cur && (cur.id === item.id || (cur.title === item.title && cur.artist === item.artist)) && window.wzkerAudio.isPlaying;

      return `
        <div class="track-item ${isThisPlaying ? 'playing-now' : ''}" 
             id="dlTrack_${item.id}"
             data-track-id="${item.id}"
             data-track-title="${item.title}"
             data-track-num="${idx + 1}"
             onclick="${isSelect ? `window.wzkerLib.toggleSelectItem('down', '${item.id}')` : `window.openTrackInFullPlayer(${jsonStr})`}">
          
          <div class="track-item-left">
            ${isSelect ? `
              <input type="checkbox" class="track-select-checkbox" ${this.selectedItems.down.has(item.id) ? 'checked' : ''} onclick="event.stopPropagation(); window.wzkerLib.toggleSelectItem('down', '${item.id}')">
            ` : `
              <div class="track-play-indicator">
                ${isThisPlaying ? `
                  <div class="audio-waves-mini">
                    <span></span><span></span><span></span>
                  </div>
                ` : `
                  <span class="track-number">${idx + 1}</span>
                `}
              </div>
            `}
            <div class="dl-track-surah-badge ${item.type === 'mobtahil' ? 'inshad' : ''}">
              <i class="fa-solid ${item.type === 'mobtahil' ? 'fa-microphone-lines' : 'fa-book-quran'}"></i>
            </div>
            <div class="track-meta">
              <h4>${item.title}</h4>
              <p><span style="color: var(--primary); font-weight: 800;">${item.fileSize || 'ملف صوتي'}</span> • استماع أوفلاين</p>
            </div>
          </div>

          <div class="track-item-right" onclick="event.stopPropagation()">
            <button class="track-opt-btn" onclick="window.wzkerLib.removeSingleDownload('${item.id}')" title="حذف من الذاكرة وتوفير المساحة" style="margin-left: 2px;">
              <i class="fa-solid fa-trash-can" style="color: #ff4757;"></i>
            </button>
            <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" title="تشغيل / إيقاف">
              <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
            </div>
          </div>
        </div>
      `;
    };

    // Helper: Render Sheikh Accordion Group
    const renderSheikhGroup = (group, isQuran) => {
      const sheikhKey = 'sh_' + Math.abs(Array.from(group.name).reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0));
      const countText = `${group.tracks.length} ${isQuran ? (group.tracks.length === 1 ? 'سورة' : 'سور') : (group.tracks.length === 1 ? 'ابتهال محمل' : 'ابتهالات محملة')}`;

      return `
        <div class="dl-sheikh-group" id="dlSheikhGroup_${sheikhKey}">
          <div class="dl-sheikh-header" onclick="window.wzkerLib.toggleSheikhGroup('${sheikhKey}')">
            <div class="dl-sheikh-info">
              <div class="dl-sheikh-avatar">
                <img src="${group.image}" alt="${group.name}" onerror="this.src='images/icon/wzker.png'">
              </div>
              <div class="dl-sheikh-text">
                <h4 class="dl-sheikh-name">${group.name}</h4>
                <span class="dl-sheikh-count"><i class="fa-solid ${isQuran ? 'fa-headphones-simple' : 'fa-music'}"></i> ${countText}</span>
              </div>
            </div>
            <div class="dl-sheikh-chevron-wrap">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>
          <div class="dl-sheikh-body">
            <div class="dl-sheikh-body-inner">
              ${group.tracks.map((t, idx) => renderTrackItem(t, idx)).join('')}
            </div>
          </div>
        </div>
      `;
    };

    let html = '';

    // Quran Section
    if (quranGroups.length > 0) {
      const quranCount = quranTracks.length;
      html += `
        <div class="dl-category-section">
          <div class="dl-category-header">
            <div class="dl-category-title-wrap">
              <div class="dl-category-icon-badge">
                <i class="fa-solid fa-book-quran"></i>
              </div>
              <h3 class="dl-category-title">المصحف المرتل (${quranGroups.length} قراء)</h3>
            </div>
            <span class="dl-category-count-badge">${quranCount} ${quranCount === 1 ? 'سورة' : 'سور'}</span>
          </div>
          <div class="dl-category-list">
            ${quranGroups.map(g => renderSheikhGroup(g, true)).join('')}
          </div>
        </div>
      `;
    }

    // Inshad Section
    if (inshadGroups.length > 0) {
      const inshadCount = inshadTracks.length;
      html += `
        <div class="dl-category-section">
          <div class="dl-category-header">
            <div class="dl-category-title-wrap">
              <div class="dl-category-icon-badge inshad-badge">
                <i class="fa-solid fa-microphone-lines"></i>
              </div>
              <h3 class="dl-category-title">الابتهالات والأناشيد (${inshadGroups.length} منشدين)</h3>
            </div>
            <span class="dl-category-count-badge">${inshadCount} ${inshadCount === 1 ? 'مقطع' : 'مقاطع'}</span>
          </div>
          <div class="dl-category-list">
            ${inshadGroups.map(g => renderSheikhGroup(g, false)).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // 2. Handle Auto-Expand & Smooth Scroll + Highlight if highlightTrackId is provided
    if (highlightTrackId) {
      setTimeout(() => {
        const targetEl = document.getElementById(`dlTrack_${highlightTrackId}`) || 
                         document.querySelector(`[data-track-id="${highlightTrackId}"]`);
        if (targetEl) {
          // Find closest sheikh group and ensure it's expanded
          const parentGroup = targetEl.closest('.dl-sheikh-group');
          if (parentGroup) {
            parentGroup.classList.remove('collapsed');
          }
          // Scroll into view smoothly
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight animation
          targetEl.classList.add('track-highlight-pulse');
          setTimeout(() => {
            targetEl.classList.remove('track-highlight-pulse');
          }, 3000);
        }
      }, 350);
    }
  }

  // ==========================================
  // 3. USER PLAYLISTS ENGINE & DEDICATED VIEW
  // ==========================================
  createPlaylist(name) {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const newPl = {
      id: 'pl_' + Date.now(),
      name: cleanName,
      createdAt: Date.now(),
      pinned: false,
      tracks: []
    };
    this.playlists.unshift(newPl);
    this.save('wzker_playlists', this.playlists);
    if (window.showToast) window.showToast(`تم إنشاء قائمة «${cleanName}» بنجاح 📋`);
    this.renderPlaylists();
    this.renderPlaylistSheetList();
  }

  addTrackToPlaylist(playlistId, track) {
    if (!track) return;
    const pl = this.playlists.find(p => p.id === playlistId);
    if (pl) {
      const tid = track.id || track.title;
      if (!pl.tracks.some(t => t.id === tid || t.title === track.title)) {
        pl.tracks.unshift({
          id: tid,
          title: track.title,
          artist: track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة',
          sheikhName: track.sheikhName || track.artist || track.munshid,
          url: track.url || track.audioUrl,
          audioUrl: track.url || track.audioUrl,
          image: track.image || track.coverUrl || 'images/icon/wzker.png',
          type: track.type || 'تلاوة',
          pinned: false
        });
        this.save('wzker_playlists', this.playlists);
        if (window.showToast) window.showToast(`تمت الإضافة إلى قائمة «${pl.name}» ✅`);
        this.renderPlaylistSheetList();
      } else {
        if (window.showToast) window.showToast(`المقطع موجود بالفعل في «${pl.name}»`);
      }
    }
  }

  renderPlaylists(tabFilter = 'all') {
    this.currentPlTab = tabFilter;
    const grid = document.getElementById('playlistsGrid');
    if (!grid) return;

    let itemsToShow = [];
    if (tabFilter === 'user') {
      itemsToShow = this.playlists;
    } else if (tabFilter === 'wzker') {
      itemsToShow = WZKER_CURATED_PLAYLISTS;
    } else {
      // 'all'
      itemsToShow = [...this.playlists, ...WZKER_CURATED_PLAYLISTS];
    }

    if (itemsToShow.length === 0) {
      grid.innerHTML = `
        <div class="no-search-results-box" style="margin-top: 15px;">
          <div class="no-res-artwork-wrap">
            <img src="images/icons/playlist.png" class="no-res-img" alt="Empty Playlists">
          </div>
          <h3 class="no-res-title">لا توجد قوائم تشغيل هنا</h3>
          <p class="no-res-subtitle">أنشئ قوائمك المخصصة لتجمع فيها تلاوات الفجر، أذكار النوم، أو روائع قارئك المفضل</p>
          <button class="return-home-btn" onclick="openCustomModal()">
            <img src="images/icons/plus.png" alt="Create">
            <span>إنشاء قائمة تشغيل الآن 📋</span>
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = itemsToShow.map(pl => {
      const isCurated = !!pl.isCurated;
      return `
      <div class="playlist-card-row" onclick="window.wzkerLib.openSinglePlaylistPage('${pl.id}')">
        <div class="fav-folder-left">
          <div class="single-pl-artwork" style="width: 50px; height: 50px; margin-bottom: 0; background: ${isCurated ? 'rgba(212, 175, 55, 0.12)' : 'rgba(16, 185, 129, 0.12)'};">
            <img src="${isCurated ? 'images/icons/spiritual-lib.png' : 'images/icons/playlist-active.png'}" style="width: 26px; height: 26px; object-fit: contain;" alt="Pl">
          </div>
          <div class="fav-folder-info">
            <h4>${pl.name}</h4>
            <p>${pl.tracks.length} ${pl.tracks.length === 1 ? 'تلاوة' : 'تلاوات'} • ${isCurated ? 'منصة وذكر' : 'مخصصة'}</p>
          </div>
        </div>
        <div class="fav-folder-right">
          ${!isCurated ? `
          <button class="track-opt-btn" onclick="event.stopPropagation(); window.wzkerLib.deletePlaylistConfirm('${pl.id}')" title="حذف القائمة">
            <i class="fa-solid fa-trash-can" style="color: #ff4757;"></i>
          </button>
          ` : `
          <span style="font-size: 11px; font-weight: 800; color: var(--accent); background: rgba(212,175,55,0.1); padding: 4px 10px; border-radius: 8px;">وذكر</span>
          `}
          <div class="track-play-badge" onclick="event.stopPropagation(); window.wzkerLib.playPlaylistDirect('${pl.id}', false);" title="تشغيل القائمة">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
      </div>
      `;
    }).join('');
  }

  // Open Single Playlist Dedicated Details Page
  openSinglePlaylistPage(plId) {
    const pl = this.playlists.find(p => p.id === plId) || WZKER_CURATED_PLAYLISTS.find(p => p.id === plId);
    if (!pl) return;
    this.activePlaylistId = plId;
    const isCurated = !!pl.isCurated;

    const navTitle = document.getElementById('singlePlNavTitle');
    const plName = document.getElementById('singlePlName');
    const countBadge = document.getElementById('singlePlCountBadge');
    const tracksContainer = document.getElementById('singlePlTracksContainer');

    if (navTitle) navTitle.textContent = pl.name;
    if (plName) plName.textContent = pl.name;
    if (countBadge) countBadge.textContent = `${pl.tracks.length} تلاوة محفوظة • ${isCurated ? 'منصة وذكر' : 'مخصصة'}`;

    if (tracksContainer) {
      if (pl.tracks.length === 0) {
        tracksContainer.innerHTML = `
          <div class="no-search-results-box" style="margin-top: 10px;">
            <p class="no-res-subtitle">هذه القائمة فارغة حالياً. أضف تلاوات من صفحة البحث أو الشيوخ عبر زر الخيارات (⋮)</p>
          </div>
        `;
      } else {
        tracksContainer.innerHTML = pl.tracks.map((t, idx) => {
          const jsonStr = JSON.stringify(t).replace(/"/g, '&quot;');
          const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
          const isThisPlaying = cur && (cur.id === t.id || cur.title === t.title) && window.wzkerAudio.isPlaying;

          return `
            <div class="track-item ${isThisPlaying ? 'playing-now' : ''}" 
                 data-track-id="${t.id}"
                 data-track-title="${t.title}"
                 data-track-num="${idx + 1}"
                 onclick="window.openTrackInFullPlayer(${jsonStr})">
              
              <div class="track-item-left">
                <div class="track-play-indicator">
                  ${isThisPlaying ? `
                    <div class="audio-waves-mini">
                      <span></span><span></span><span></span>
                    </div>
                  ` : `
                    <span class="track-number">${idx + 1}</span>
                  `}
                </div>
                <div class="track-icon-img">
                  <img src="${t.image || 'images/icon/wzker.png'}" alt="${t.artist}" loading="lazy" onerror="this.src='images/icon/wzker.png'">
                </div>
                <div class="track-meta">
                  <h4>${t.title}</h4>
                  <p>${t.artist} • ${t.type || 'تلاوة'}</p>
                </div>
              </div>

              <div class="track-item-right" onclick="event.stopPropagation()">
                ${!isCurated ? `
                <button class="track-opt-btn" onclick="window.wzkerLib.removeTrackFromPlaylist('${pl.id}', '${t.id}')" title="إزالة من القائمة">
                  <i class="fa-solid fa-xmark" style="color: #ff4757;"></i>
                </button>
                ` : ''}
                <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" title="تشغيل / إيقاف">
                  <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    window.openLibPage('singlePlaylistPage');
  }

  playPlaylistDirect(plId, shuffle = false) {
    const pl = this.playlists.find(p => p.id === plId) || WZKER_CURATED_PLAYLISTS.find(p => p.id === plId);
    if (!pl || pl.tracks.length === 0) {
      if (window.showToast) window.showToast('القائمة فارغة، أضف تلاوات أولاً');
      return;
    }

    let list = [...pl.tracks];
    if (shuffle) {
      list.sort(() => Math.random() - 0.5);
    }

    const first = list[0];
    const trackObj = {
      id: first.id,
      title: first.title,
      subtitle: first.artist || first.sheikhName,
      artist: first.artist || first.sheikhName,
      audioUrl: first.url || first.audioUrl,
      url: first.url || first.audioUrl,
      coverUrl: first.image || first.coverUrl,
      image: first.image || first.coverUrl,
      isLiveRadio: false
    };

    if (window.WzkerAudioEngine && window.wzkerAudio) {
      window.wzkerAudio.playTrack(trackObj, list, 0);
    }
  }

  removeTrackFromPlaylist(plId, trackId) {
    const pl = this.playlists.find(p => p.id === plId);
    if (!pl) {
      if (window.showToast) window.showToast('لا يمكن تعديل محتوى قوائم وذكر الرسمية');
      return;
    }
    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    this.save('wzker_playlists', this.playlists);
    this.openSinglePlaylistPage(plId);
    if (window.showToast) window.showToast('تمت إزالة المقطع من القائمة');
    this.renderPlaylistSheetList();
  }

  deletePlaylistConfirm(plId) {
    const isCurated = WZKER_CURATED_PLAYLISTS.some(p => p.id === plId);
    if (isCurated) {
      if (window.showToast) window.showToast('لا يمكن حذف قوائم وذكر الرسمية');
      return;
    }
    const pl = this.playlists.find(p => p.id === plId);
    const plName = pl ? `«${pl.name}»` : 'هذه القائمة';

    window.showCustomConfirm({
      title: 'حذف قائمة التشغيل',
      message: `هل أنت متأكد من رغبتك في حذف قائمة ${plName} بالكامل؟ سيتم مسح التلاوات المحفوظة بداخلها.`,
      confirmText: 'نعم، احذف القائمة 🗑️',
      isDanger: true,
      onConfirm: () => {
        this.playlists = this.playlists.filter(p => p.id !== plId);
        this.save('wzker_playlists', this.playlists);
        window.closeLibPage('singlePlaylistPage');
        this.renderPlaylists(this.currentPlTab);
        this.renderPlaylistSheetList();
        if (window.showToast) window.showToast('تم حذف القائمة بنجاح 🗑️');
      }
    });
  }

  renamePlaylist(plId, newName) {
    const isCurated = WZKER_CURATED_PLAYLISTS.some(p => p.id === plId);
    if (isCurated) {
      if (window.showToast) window.showToast('لا يمكن تعديل اسم قوائم وذكر الرسمية');
      return;
    }
    if (!newName || !newName.trim()) return;
    const pl = this.playlists.find(p => p.id === plId);
    if (pl) {
      pl.name = newName.trim();
      this.save('wzker_playlists', this.playlists);
      this.openSinglePlaylistPage(plId);
      this.renderPlaylistSheetList();
      if (window.showToast) window.showToast('تم تعديل اسم القائمة بنجاح ✏️');
    }
  }

  // ==========================================
  // 4. TIME-GROUPED HISTORY SYSTEM
  // ==========================================
  addToHistory(track) {
    if (!track) return;
    const tid = track.id || track.title;
    this.history = this.history.filter(t => (t.id && t.id !== tid) && t.title !== track.title);
    
    this.history.unshift({
      id: tid,
      title: track.title,
      artist: track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة',
      sheikhName: track.sheikhName || track.artist || track.munshid,
      num: track.num,
      url: track.url || track.audioUrl,
      audioUrl: track.url || track.audioUrl,
      image: track.image || track.coverUrl || 'images/icon/wzker.png',
      type: track.type || 'تلاوة',
      timestamp: Date.now()
    });

    if (this.history.length > 100) this.history.pop();
    this.save('wzker_history', this.history);
    this.renderHistory();
  }

  renderHistory() {
    const container = document.getElementById('historyGroupedContainer');
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = `
        <div class="no-search-results-box" style="margin-top: 15px;">
          <div class="no-res-artwork-wrap">
            <img src="images/icons/history.png" class="no-res-img" alt="Empty History">
          </div>
          <h3 class="no-res-title">سجل الاستماع فارغ</h3>
          <p class="no-res-subtitle">عند استماعك لأي تلاوة أو ابتهال، سيتم توثيقه هنا تلقائياً لتعود إليه بسهولة</p>
          <button class="return-home-btn" onclick="closeLibPage('historyPage'); switchTab('homeView')">
            <img src="images/icons/home.png" alt="Home">
            <span>ابدأ الاستماع الآن</span>
          </button>
        </div>
      `;
      return;
    }

    // Time Grouping
    const now = Date.now();
    const H5 = 5 * 60 * 60 * 1000;
    const D1 = 24 * 60 * 60 * 1000;
    const D2 = 48 * 60 * 60 * 1000;
    const D3 = 72 * 60 * 60 * 1000;

    const group5h = [];
    const groupToday = [];
    const groupYesterday = [];
    const group3Days = [];
    const groupOlder = [];

    this.history.forEach(item => {
      const diff = now - (item.timestamp || now);
      if (diff < H5) group5h.push(item);
      else if (diff < D1) groupToday.push(item);
      else if (diff < D2) groupYesterday.push(item);
      else if (diff < D3) group3Days.push(item);
      else groupOlder.push(item);
    });

    const isSelect = this.selectMode.hist;
    const renderGroupHtml = (title, items) => {
      if (items.length === 0) return '';
      return `
        <div class="history-time-group">
          <div class="history-group-header">
            <i class="fa-regular fa-clock"></i>
            <span>${title} (${items.length})</span>
          </div>
          <div class="track-list">
            ${items.map((item, idx) => {
              const jsonStr = JSON.stringify(item).replace(/"/g, '&quot;');
              const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
              const isThisPlaying = cur && (cur.id === item.id || cur.title === item.title) && window.wzkerAudio.isPlaying;

              return `
                <div class="track-item ${isThisPlaying ? 'playing-now' : ''}" 
                     data-track-id="${item.id}"
                     data-track-title="${item.title}"
                     data-track-num="${idx + 1}"
                     onclick="${isSelect ? `window.wzkerLib.toggleSelectItem('hist', '${item.id}')` : `window.openTrackInFullPlayer(${jsonStr})`}">
                  
                  <div class="track-item-left">
                    ${isSelect ? `
                      <input type="checkbox" class="track-select-checkbox" ${this.selectedItems.hist.has(item.id) ? 'checked' : ''} onclick="event.stopPropagation(); window.wzkerLib.toggleSelectItem('hist', '${item.id}')">
                    ` : `
                      <div class="track-play-indicator">
                        ${isThisPlaying ? `
                          <div class="audio-waves-mini">
                            <span></span><span></span><span></span>
                          </div>
                        ` : `
                          <div class="track-icon-img" style="width: 38px; height: 38px;">
                            <img src="${item.image || 'images/icon/wzker.png'}" alt="${item.artist}" loading="lazy">
                          </div>
                        `}
                      </div>
                    `}
                    <div class="track-meta">
                      <h4>${item.title}</h4>
                      <p>${item.artist} • استمعت له مؤخراً</p>
                    </div>
                  </div>

                  <div class="track-item-right" onclick="event.stopPropagation()">
                    <button class="track-opt-btn" onclick="window.wzkerLib.openTrackContextMenu(${jsonStr})" title="خيارات">
                      <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" title="تشغيل / إيقاف">
                      <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      ${renderGroupHtml('خلال آخر ٥ ساعات', group5h)}
      ${renderGroupHtml('اليوم', groupToday)}
      ${renderGroupHtml('أمس', groupYesterday)}
      ${renderGroupHtml('منذ ٣ أيام', group3Days)}
      ${renderGroupHtml('منذ أسبوع وأقدم', groupOlder)}
    `;
  }

  // ==========================================
  // 5. SELECTION & BATCH DELETION MODES
  // ==========================================
  toggleSelectMode(section) {
    this.selectMode[section] = !this.selectMode[section];
    this.selectedItems[section].clear();

    const bar = document.getElementById(`${section}BatchBar`);
    if (bar) bar.style.display = this.selectMode[section] ? 'flex' : 'none';

    this.updateSelectedCountText(section);

    if (section === 'fav') this.renderFavorites();
    if (section === 'down') this.renderDownloads();
    if (section === 'hist') this.renderHistory();
  }

  toggleSelectItem(section, id) {
    if (this.selectedItems[section].has(id)) {
      this.selectedItems[section].delete(id);
    } else {
      this.selectedItems[section].add(id);
    }
    this.updateSelectedCountText(section);
    
    if (section === 'fav') this.renderFavorites();
    if (section === 'down') this.renderDownloads();
    if (section === 'hist') this.renderHistory();
  }

  updateSelectedCountText(section) {
    const el = document.getElementById(`${section}SelectedCountText`);
    if (el) {
      const count = this.selectedItems[section].size;
      el.textContent = `${count} ${count === 1 ? 'عنصر محدد' : 'عناصر محددة'}`;
    }
  }

  deleteSelected(section) {
    const toDel = this.selectedItems[section];
    if (toDel.size === 0) {
      if (window.showToast) window.showToast('يرجى تحديد عناصر أولاً');
      return;
    }

    if (section === 'fav') {
      this.favs = this.favs.filter(item => !toDel.has(item.id));
      this.save('wzker_favs', this.favs);
    } else if (section === 'down') {
      if (window.wzkerStorage) {
        toDel.forEach(id => window.wzkerStorage.removeTrackOffline(id));
      }
      this.downloads = this.downloads.filter(item => !toDel.has(item.id));
      this.save('wzker_downloads', this.downloads);
    } else if (section === 'hist') {
      this.history = this.history.filter(item => !toDel.has(item.id));
      this.save('wzker_history', this.history);
    }

    this.toggleSelectMode(section);
    if (window.showToast) window.showToast('تم حذف العناصر المحددة بنجاح 🗑️');
  }

  // 3-Dots Context Menu
  openTrackContextMenu(track) {
    if (!track) return;
    this.selectedTrackForContext = track;

    const titleEl = document.getElementById('sheetTrackTitle');
    const artistEl = document.getElementById('sheetTrackArtist');
    const coverEl = document.getElementById('sheetTrackCover');
    const favLabelEl = document.getElementById('sheetTrackFavLabel');
    const favSubEl = document.getElementById('sheetTrackFavSub');
    const favIconEl = document.getElementById('sheetFavIcon');
    const pinLabelEl = document.getElementById('sheetTrackPinLabel');
    const pinSubEl = document.getElementById('sheetTrackPinSub');
    const pinIconEl = document.getElementById('sheetPinIcon');

    if (titleEl) titleEl.textContent = track.title || 'وذكر';
    if (artistEl) artistEl.textContent = track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة';
    if (coverEl) coverEl.src = track.image || track.coverUrl || 'images/icon/wzker.png';

    const isFav = this.isFavorite(track);
    if (favLabelEl) favLabelEl.textContent = isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
    if (favSubEl) favSubEl.textContent = isFav ? 'إلغاء حفظ التلاوة من مكتبتك' : 'حفظ في قائمة تلاواتك المفضلة';
    if (favIconEl) {
      favIconEl.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      favIconEl.style.color = isFav ? '#ff4757' : 'inherit';
    }

    const favItem = this.favs.find(f => f.id === track.id || f.title === track.title);
    const isPinned = favItem ? !!favItem.pinned : false;
    if (pinLabelEl) pinLabelEl.textContent = isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى';
    if (pinSubEl) pinSubEl.textContent = isPinned ? 'إلغاء تثبيت هذه التلاوة من القمة' : 'تثبيت حتى ٣ تلاوات مفضلة في القمة';
    if (pinIconEl) {
      pinIconEl.style.color = isPinned ? '#f59e0b' : 'inherit';
    }

    const downLabelEl = document.getElementById('sheetTrackDownLabel');
    const downSubEl = document.getElementById('sheetTrackDownSub');
    const downIconEl = document.getElementById('sheetDownIcon');

    const isDownloaded = this.isDownloaded(track);
    if (downLabelEl) downLabelEl.textContent = isDownloaded ? 'السورة محملة بالفعل' : 'حفظ في التحميلات';
    if (downSubEl) downSubEl.textContent = isDownloaded ? 'انقر للتشغيل أو العرض في التحميلات' : 'استماع بجودة عالية وبدون إنترنت';
    if (downIconEl) {
      downIconEl.src = 'images/icons/download.png';
      downIconEl.alt = isDownloaded ? 'السورة محملة' : 'تحميل';
    }

    window.openSheet('trackOptionsSheet');
  }

  renderPlaylistSheetList() {
    const container = document.getElementById('playlistSheetList');
    if (!container) return;

    if (this.playlists.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px 10px; color: var(--text-muted); font-size: 13.5px; font-weight: 700;">
          لا توجد قوائم تشغيل حتى الآن.<br>انقر على «+ إنشاء قائمة جديدة» بالأعلى للبدء!
        </div>
      `;
      return;
    }

    container.innerHTML = this.playlists.map(pl => `
      <div class="sheet-action-item" onclick="window.wzkerLib.addTrackToPlaylist('${pl.id}', window.wzkerLib.selectedTrackForContext); window.closeSheet('playlistSheet');">
        <img src="images/icons/playlist.png" style="width: 20px; height: 20px;" alt="Pl">
        <span>${pl.name} (${pl.tracks.length} تلاوة)</span>
      </div>
    `).join('');
  }

  calculateStorageUsage() {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    return (total / 1024).toFixed(1) + ' ك.ب';
  }

  clearAllAppData() {
    localStorage.removeItem('wzker_favs');
    localStorage.removeItem('wzker_history');
    localStorage.removeItem('wzker_downloads');
    this.favs = [];
    this.history = [];
    this.downloads = [];
    if (window.wzkerStorage) {
      window.wzkerStorage.clearAllOfflineTracks();
    }
    this.renderFavorites();
    this.renderHistory();
    this.renderDownloads();
    this.updateHubCounters();
    if (window.showToast) window.showToast('تم مسح الذاكرة المؤقتة وسجل الاستماع بالكامل 🧹');
  }
}

// Global Instance
window.wzkerLib = new WzkerLibrary();

// Global Connector Functions for UI
window.toggleSelectionMode = (sec) => window.wzkerLib.toggleSelectMode(sec);
window.deleteSelectedFavorites = () => window.wzkerLib.deleteSelected('fav');
window.deleteSelectedDownloads = () => window.wzkerLib.deleteSelected('down');
window.deleteSelectedHistory = () => window.wzkerLib.deleteSelected('hist');

window.filterFavorites = (q) => window.wzkerLib.renderFavorites(q);
window.filterPlaylistsTab = (tab, btn) => {
  document.querySelectorAll('.pl-filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.wzkerLib.renderPlaylists(tab);
};

window.playAllCurrentPlaylist = (shuffle) => {
  if (window.wzkerLib && window.wzkerLib.activePlaylistId) {
    window.wzkerLib.playPlaylistDirect(window.wzkerLib.activePlaylistId, shuffle);
  }
};

// Custom Confirmation Dialog Controller
let _pendingConfirmCallback = null;

window.showCustomConfirm = ({ title, message, confirmText = 'نعم، احذف 🗑️', isDanger = true, onConfirm }) => {
  _pendingConfirmCallback = onConfirm;
  const titleEl = document.getElementById('confirmModalTitle');
  const msgEl = document.getElementById('confirmModalMessage');
  const actionBtn = document.getElementById('confirmModalActionBtn');
  const iconWrap = document.getElementById('confirmModalIconWrap');
  const icon = document.getElementById('confirmModalIcon');

  if (titleEl) titleEl.textContent = title || 'تأكيد الإجراء';
  if (msgEl) msgEl.textContent = message || 'هل أنت متأكد من تنفيذ هذا الإجراء؟';
  if (actionBtn) {
    actionBtn.textContent = confirmText;
    if (isDanger) {
      actionBtn.className = 'btn-confirm-action';
      if (iconWrap) {
        iconWrap.style.background = 'rgba(255, 71, 87, 0.12)';
        iconWrap.style.borderColor = 'rgba(255, 71, 87, 0.25)';
        iconWrap.style.color = '#ff4757';
      }
      if (icon) icon.className = 'fa-solid fa-trash-can';
    } else {
      actionBtn.className = 'btn-confirm-action';
      actionBtn.style.background = 'var(--primary)';
      if (iconWrap) {
        iconWrap.style.background = 'rgba(16, 185, 129, 0.12)';
        iconWrap.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        iconWrap.style.color = 'var(--primary)';
      }
      if (icon) icon.className = 'fa-solid fa-circle-question';
    }
  }

  if (window.openSheet) {
    window.openSheet('customConfirmModal');
  }
};

window.closeCustomConfirmModal = () => {
  _pendingConfirmCallback = null;
  if (window.closeSheet) {
    window.closeSheet('customConfirmModal');
  }
};

window.executeCustomConfirm = () => {
  const cb = _pendingConfirmCallback;
  window.closeCustomConfirmModal();
  if (typeof cb === 'function') {
    cb();
  }
};

// Rename Playlist Custom Modal Controller
window.openRenamePlaylistModal = () => {
  const lib = window.wzkerLib;
  if (!lib || !lib.activePlaylistId) return;

  const pl = lib.playlists.find(p => p.id === lib.activePlaylistId);
  if (!pl) return;

  const input = document.getElementById('renamePlaylistInput');
  if (input) {
    input.value = pl.name;
    setTimeout(() => {
      input.focus();
      input.select();
    }, 150);
  }

  if (window.openSheet) {
    window.openSheet('renamePlaylistModal');
  }
};

window.confirmRenamePlaylist = () => {
  const lib = window.wzkerLib;
  if (!lib || !lib.activePlaylistId) return;

  const input = document.getElementById('renamePlaylistInput');
  const newName = input ? input.value.trim() : '';
  if (!newName) {
    if (window.showToast) window.showToast('يرجى إدخال اسم للقائمة');
    return;
  }

  lib.renamePlaylist(lib.activePlaylistId, newName);
  if (window.closeSheet) {
    window.closeSheet('renamePlaylistModal');
  }
};

window.renameCurrentPlaylistPrompt = () => {
  window.openRenamePlaylistModal();
};

window.deleteCurrentPlaylistConfirm = () => {
  if (window.wzkerLib && window.wzkerLib.activePlaylistId) {
    window.wzkerLib.deletePlaylistConfirm(window.wzkerLib.activePlaylistId);
  }
};

window.openSinglePlOptionsMenu = () => {
  const lib = window.wzkerLib;
  if (!lib || !lib.activePlaylistId) return;

  const pl = lib.playlists.find(p => p.id === lib.activePlaylistId) || 
             WZKER_CURATED_PLAYLISTS.find(p => p.id === lib.activePlaylistId);
  if (!pl) return;

  const titleEl = document.getElementById('singlePlOptionsTitle');
  const subEl = document.getElementById('singlePlOptionsSub');
  const badgeEl = document.getElementById('singlePlOptionsBadge');
  const imgEl = document.getElementById('singlePlOptionsImg');
  const renameOpt = document.getElementById('singlePlRenameOption');
  const deleteOpt = document.getElementById('singlePlDeleteOption');

  if (titleEl) titleEl.textContent = pl.name;
  if (subEl) subEl.textContent = `${pl.tracks.length} تلاوة • ${pl.isCurated ? 'قائمة رسمية من وذكر' : 'قائمة مخصصة'}`;
  if (badgeEl) badgeEl.textContent = pl.isCurated ? 'منصة وذكر' : 'قائمة مخصصة';
  if (imgEl) imgEl.src = pl.isCurated ? 'images/icons/spiritual-lib.png' : 'images/icons/playlist-active.png';

  // If curated, hide rename & delete options
  if (renameOpt) renameOpt.style.display = pl.isCurated ? 'none' : 'flex';
  if (deleteOpt) deleteOpt.style.display = pl.isCurated ? 'none' : 'flex';

  if (window.openSheet) {
    window.openSheet('singlePlOptionsSheet');
  }
};

window.clearFavoritesWithConfirm = () => {
  window.showCustomConfirm({
    title: 'تفريغ المفضلة',
    message: 'هل أنت متأكد من رغبتك في مسح جميع عناصر المفضلة؟',
    confirmText: 'نعم، مسح الكل',
    isDanger: true,
    onConfirm: () => {
      window.wzkerLib.favs = [];
      window.wzkerLib.save('wzker_favs', []);
      window.wzkerLib.renderFavorites();
      if (window.showToast) window.showToast('تم تفريغ المفضلة بنجاح');
    }
  });
};

window.clearDownloadsWithConfirm = () => {
  window.showCustomConfirm({
    title: 'مسح التحميلات',
    message: 'هل أنت متأكد من رغبتك في مسح جميع التلاوات المحملة محلياً؟',
    confirmText: 'نعم، مسح التحميلات',
    isDanger: true,
    onConfirm: () => {
      window.wzkerLib.downloads = [];
      window.wzkerLib.save('wzker_downloads', []);
      window.wzkerLib.renderDownloads();
      if (window.showToast) window.showToast('تم تفريغ التحميلات بنجاح');
    }
  });
};

window.clearHistoryWithConfirm = () => {
  window.showCustomConfirm({
    title: 'مسح سجل الاستماع',
    message: 'هل أنت متأكد من رغبتك في مسح سجل الاستماع بالكامل؟',
    confirmText: 'نعم، مسح السجل',
    isDanger: true,
    onConfirm: () => {
      window.wzkerLib.history = [];
      window.wzkerLib.save('wzker_history', []);
      window.wzkerLib.renderHistory();
      if (window.showToast) window.showToast('تم تفريغ سجل الاستماع بنجاح');
    }
  });
};

// Context Menu Action Connectors
window.handleContextPlay = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    window.openTrackInFullPlayer(window.wzkerLib.selectedTrackForContext);
    window.closeSheet('trackOptionsSheet');
  }
};

window.handleContextTogglePin = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    const t = window.wzkerLib.selectedTrackForContext;
    window.wzkerLib.togglePinTrack(t.id || t.title);
    window.closeSheet('trackOptionsSheet');
  }
};

window.handleContextToggleFav = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    window.wzkerLib.toggleFavorite(window.wzkerLib.selectedTrackForContext);
    window.closeSheet('trackOptionsSheet');
  }
};

window.handleContextSleepTimer = () => {
  window.closeSheet('trackOptionsSheet');
  window.openSheet('timerSheet');
};

window.handleContextAddToPlaylist = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    window.closeSheet('trackOptionsSheet');
    window.wzkerLib.renderPlaylistSheetList();
    window.openSheet('playlistSheet');
  }
};

window.handleContextDownload = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    const track = window.wzkerLib.selectedTrackForContext;
    const isDownloaded = window.wzkerLib.isDownloaded(track);
    window.closeSheet('trackOptionsSheet');
    if (isDownloaded) {
      if (window.wzkerStorage) {
        window.wzkerStorage.showAlreadyDownloadedModal(track);
      } else if (window.showToast) {
        window.showToast('هذه السورة محملة بالفعل في جهازك');
      }
    } else {
      window.wzkerLib.downloadTrack(track);
    }
  }
};

window.handleContextShare = () => {
  if (window.wzkerLib && window.wzkerLib.selectedTrackForContext) {
    const t = window.wzkerLib.selectedTrackForContext;
    if (navigator.share) {
      navigator.share({
        title: t.title,
        text: `استمع إلى ${t.title} بصوت ${t.artist || t.munshid || t.sheikhName} عبر تطبيق وذكر`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${t.title} - ${t.artist || t.munshid || t.sheikhName}`);
      if (window.showToast) window.showToast('تم نسخ اسم التلاوة لمشاركتها');
    }
    window.closeSheet('trackOptionsSheet');
  }
};

// Hook Initial Render on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  window.wzkerLib.updateHubCounters();
  window.wzkerLib.renderFavorites();
  window.wzkerLib.renderDownloads();
  window.wzkerLib.renderPlaylists();
  window.wzkerLib.renderHistory();
});
