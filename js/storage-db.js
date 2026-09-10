/**
 * Wzker Production-Grade IndexedDB Audio Storage Engine
 * Full Offline Caching of High-Bitrate Recitations with Real Blob Storage,
 * Zero-Lag Instant Playback, Real Storage Counters, and Auto-Fallback.
 */

class WzkerStorageEngine {
  constructor() {
    this.dbName = 'wzker_offline_db';
    this.dbVersion = 1;
    this.audioStoreName = 'audio_blobs';
    this.metaStoreName = 'audio_metadata';
    this.db = null;
    this.initPromise = this.initDB();
    this.activeObjectUrls = new Map();
    this.activeDownloads = new Map();
    this.currentDownloadingTrack = null;
  }

  // 1. Initialize IndexedDB
  initDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported in this browser.');
        resolve(null);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.audioStoreName)) {
          db.createObjectStore(this.audioStoreName, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.metaStoreName)) {
          db.createObjectStore(this.metaStoreName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        resolve(null);
      };
    });
  }

  async getDB() {
    if (this.db) return this.db;
    return await this.initPromise;
  }

  // 2. Normalize Track Unique ID
  getTrackKey(track) {
    if (!track) return '';
    if (track.id) return String(track.id);
    const artist = track.artist || track.sheikhName || track.munshid || 'sheikh';
    const title = track.title || 'track';
    return `${artist}_${title}`.replace(/\s+/g, '_');
  }

  // 3. Check if a track is downloaded locally
  async isTrackDownloaded(track) {
    if (!track) return false;
    const key = this.getTrackKey(track);

    // Also check memory in wzkerLib if loaded (matching both ID or title + artist)
    if (window.wzkerLib && window.wzkerLib.isDownloaded) {
      if (window.wzkerLib.isDownloaded(track)) {
        return true;
      }
    } else if (window.wzkerLib && window.wzkerLib.downloads) {
      const targetArtist = track.artist || track.sheikhName || track.munshid || '';
      const targetUrl = track.url || track.audioUrl || '';
      const found = window.wzkerLib.downloads.some(d => {
        if (track.id && d.id && String(d.id) === String(track.id)) return true;
        if (targetUrl && d.url && d.url === targetUrl) return true;
        const dArtist = d.artist || d.sheikhName || d.munshid || '';
        if (d.title === track.title && dArtist && targetArtist && dArtist === targetArtist) return true;
        return false;
      });
      if (found) return true;
    }

    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(this.audioStoreName, 'readonly');
        const store = tx.objectStore(this.audioStoreName);
        const req = store.get(key);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // 4. Update Modal Progress UI Elements
  updateDownloadProgressUI(pct, loadedMB, totalMB) {
    const progressBar = document.getElementById('realDlProgressBar');
    const bytesDisplay = document.getElementById('realDlBytesDisplay');
    const pctDisplay = document.getElementById('realDlPctDisplay');
    const sizePill = document.getElementById('realDlSizePill');

    if (progressBar) progressBar.style.width = pct + '%';
    if (pctDisplay) pctDisplay.textContent = pct + '%';
    if (bytesDisplay) bytesDisplay.textContent = `${loadedMB} / ${totalMB} م.ب`;
    if (sizePill && totalMB && totalMB !== '0.0') {
      sizePill.innerHTML = `<i class="fa-solid fa-hard-drive"></i> <span>${totalMB} م.ب</span>`;
    }
  }

  // 5. Open / Minimize / Close Download Modal
  openDownloadModal() {
    const modal = document.getElementById('realDownloadModal');
    if (modal) modal.classList.add('active');
  }

  minimizeDownloadModal() {
    const modal = document.getElementById('realDownloadModal');
    if (modal) modal.classList.remove('active');

    // Only show background toast if a download is actively running
    const isStillActive = this.currentDownloadingTrack && 
                          this.activeDownloads.has(this.getTrackKey(this.currentDownloadingTrack));
    const successBody = document.getElementById('realDlSuccessBody');
    const isSuccessVisible = successBody && successBody.style.display !== 'none';

    if (isStillActive && !isSuccessVisible && window.showToast) {
      window.showToast('يستمر التنزيل في الخلفية... ⬇️');
    }
  }

  closeDownloadModal() {
    const modal = document.getElementById('realDownloadModal');
    if (modal) modal.classList.remove('active');
  }

  // Helper: Trigger actual device file download (Downloads folder on phone / PC)
  triggerDeviceFileDownload(blob, track) {
    try {
      const cleanTitle = (track.title || 'تلاوة مباركة').replace(/[\\/:*?"<>|]/g, '').trim();
      const cleanSheikh = (track.artist || track.munshid || track.sheikhName || 'القارئ').replace(/[\\/:*?"<>|]/g, '').trim();
      const filename = `${cleanTitle} - ${cleanSheikh} - تطبيق وذكر.mp3`;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try { document.body.removeChild(a); } catch (e) {}
        setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 10000);
      }, 1500);

      if (window.showToast) {
        window.showToast(`تم تنزيل «${cleanTitle}» (${(blob.size / (1024 * 1024)).toFixed(1)} م.ب) إلى جهازك بنجاح 📥`);
      }
    } catch (e) {
      console.warn('Device download trigger failed:', e);
    }
  }

  // 6. Real Offline Streaming & Device File Download Engine
  async startInteractiveDownload(track) {
    if (!track) return false;
    const db = await this.getDB();
    const key = this.getTrackKey(track);
    const audioUrl = track.url || track.audioUrl;

    if (!audioUrl) {
      if (window.showToast) window.showToast('رابط المقطع غير متوفر للتحميل');
      return false;
    }

    // If already downloaded in app, do NOT re-download! Show the Already Downloaded Modal!
    if (await this.isTrackDownloaded(track)) {
      this.currentDownloadingTrack = track;
      this.showAlreadyDownloadedModal(track);
      return true;
    }

    // If already downloading this track, just show modal
    if (this.activeDownloads.has(key)) {
      this.openDownloadModal();
      return true;
    }

    this.currentDownloadingTrack = track;

    // Setup & Show Interactive Modal with real track details
    const modal = document.getElementById('realDownloadModal');
    const coverImg = document.getElementById('realDlCoverImg');
    const titleEl = document.getElementById('realDlTrackTitle');
    const artistEl = document.getElementById('realDlTrackArtist');
    const typePill = document.getElementById('realDlTypePill');
    const sizePill = document.getElementById('realDlSizePill');
    const activeBody = document.getElementById('realDlActiveBody');
    const successBody = document.getElementById('realDlSuccessBody');
    const badgeText = document.getElementById('realDlBadgeText');
    const successFileName = document.getElementById('realDlSuccessFileName');
    const successSizeTag = document.getElementById('realDlSuccessSizeTag');

    if (coverImg) coverImg.src = track.image || track.coverUrl || 'images/icon/wzker.png';
    if (titleEl) titleEl.textContent = track.title || 'تلاوة مباركة';
    if (artistEl) artistEl.textContent = track.artist || track.munshid || track.sheikhName || 'القارئ';
    if (typePill) typePill.textContent = track.type || (track.ayahs ? 'المصحف المرتل' : 'ابتهال مبارك');
    if (sizePill) sizePill.innerHTML = '<i class="fa-solid fa-hard-drive"></i> <span>جاري الاتصال...</span>';
    if (activeBody) activeBody.style.display = 'block';
    if (successBody) successBody.style.display = 'none';
    if (badgeText) badgeText.textContent = 'تنزيل متدفق وحفظ في جهازك';
    this.updateDownloadProgressUI(0, '0.0', '0.0');

    if (modal) modal.classList.add('active');

    // Create AbortController for instant cancellation
    const controller = new AbortController();
    this.activeDownloads.set(key, { controller, track });

    try {
      const response = await fetch(audioUrl, {
        signal: controller.signal,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Calculate total size or estimate smoothly
      const contentLength = response.headers.get('content-length');
      let totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      if (!totalBytes || totalBytes <= 0) {
        // Fallback estimate (~128kbps = 16KB/s)
        totalBytes = (track.duration && track.duration > 0 ? track.duration : 180) * 16000;
      }

      const initialTotalMB = (totalBytes / (1024 * 1024)).toFixed(1);
      if (sizePill) {
        sizePill.innerHTML = `<i class="fa-solid fa-hard-drive"></i> <span>${initialTotalMB} م.ب</span>`;
      }

      const reader = response.body.getReader();
      let receivedBytes = 0;
      const chunks = [];
      let lastUIUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes < receivedBytes) {
          totalBytes = receivedBytes;
        }

        const now = Date.now();
        if (now - lastUIUpdate > 60) { // 60ms throttle for ultra fluid 60fps rendering
          lastUIUpdate = now;
          const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
          const loadedMB = (receivedBytes / (1024 * 1024)).toFixed(1);
          const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

          // Surface 1: Modal Progress Bar & Stats
          this.updateDownloadProgressUI(pct, loadedMB, totalMB);

          // Surface 2: Notification Drawer Live Progress Card
          if (window.wzkerNotif) {
            window.wzkerNotif.notifyDownloadProgress(track, pct, loadedMB, totalMB);
          }
        }
      }

      // Assemble final real Blob
      const mimeType = response.headers.get('content-type') || 'audio/mpeg';
      const blob = new Blob(chunks, { type: mimeType });
      const realSizeInBytes = blob.size;
      const realSizeMB = (realSizeInBytes / (1024 * 1024)).toFixed(1);
      const formattedSize = `${realSizeMB} م.ب`;
      this.lastDownloadedBlob = blob;

      // Surface 1: Set 100% on Modal
      this.updateDownloadProgressUI(100, realSizeMB, realSizeMB);

      // Save into IndexedDB Audio & Meta Stores
      await new Promise((resolve, reject) => {
        const tx = db.transaction([this.audioStoreName, this.metaStoreName], 'readwrite');

        const audioStore = tx.objectStore(this.audioStoreName);
        audioStore.put({
          id: key,
          blob: blob,
          mimeType: mimeType,
          size: realSizeInBytes,
          savedAt: Date.now()
        });

        const metaStore = tx.objectStore(this.metaStoreName);
        metaStore.put({
          id: key,
          title: track.title,
          artist: track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة',
          sheikhName: track.sheikhName || track.artist || track.munshid,
          url: audioUrl,
          audioUrl: audioUrl,
          image: track.image || track.coverUrl || 'images/icon/wzker.png',
          type: track.type || 'أوفلاين',
          fileSize: formattedSize,
          bytes: realSizeInBytes,
          downloadedAt: Date.now()
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });

      this.activeDownloads.delete(key);

      // ── TRIGGER REAL DEVICE FILE DOWNLOAD (Downloads folder on phone / PC) ──
      this.triggerDeviceFileDownload(blob, track);

      // Synchronize with Offline Library Page & Hub Counters
      if (window.wzkerLib) {
        window.wzkerLib.syncAfterIndexedDBDownload({
          id: key,
          title: track.title,
          artist: track.artist || track.munshid || track.sheikhName || 'تلاوة مباركة',
          sheikhName: track.sheikhName || track.artist || track.munshid,
          url: audioUrl,
          audioUrl: audioUrl,
          image: track.image || track.coverUrl || 'images/icon/wzker.png',
          type: track.type || 'أوفلاين',
          fileSize: formattedSize,
          bytes: realSizeInBytes,
          downloadedAt: Date.now()
        });
      }

      // Surface 2 & 3: In-App Drawer Card & OS Lockscreen Notification
      if (window.wzkerNotif) {
        window.wzkerNotif.notifyDownloadComplete(track, formattedSize);
      }

      // Modal Transition to Golden Success State
      const cleanTitle = (track.title || 'تلاوة مباركة').replace(/[\\/:*?"<>|]/g, '').trim();
      const cleanSheikh = (track.artist || track.munshid || track.sheikhName || 'القارئ').replace(/[\\/:*?"<>|]/g, '').trim();
      const filename = `${cleanTitle} - ${cleanSheikh} - وذكر.mp3`;

      if (successFileName) successFileName.textContent = filename;
      if (successSizeTag) successSizeTag.textContent = formattedSize;
      if (activeBody) activeBody.style.display = 'none';
      if (successBody) successBody.style.display = 'flex';
      if (badgeText) badgeText.textContent = 'تم التنزيل بنجاح ✅';

      return true;

    } catch (err) {
      this.activeDownloads.delete(key);

      if (err.name === 'AbortError') {
        console.log('Download intentionally aborted by user.');
        return false;
      }

      console.error('Streaming download error:', err);
      if (window.showToast) {
        window.showToast('تعذر تنزيل المقطع، يرجى التحقق من الاتصال بالإنترنت');
      }
      this.closeDownloadModal();
      if (window.wzkerNotif) {
        window.wzkerNotif.cancelDownloadNotification(key);
      }
      return false;
    }
  }

  // 7. Save current downloaded track directly to device storage on demand
  async saveCurrentTrackToDevice() {
    if (!this.currentDownloadingTrack) return;
    if (this.lastDownloadedBlob) {
      this.triggerDeviceFileDownload(this.lastDownloadedBlob, this.currentDownloadingTrack);
      return;
    }

    const db = await this.getDB();
    const key = this.getTrackKey(this.currentDownloadingTrack);
    if (db) {
      const tx = db.transaction(this.audioStoreName, 'readonly');
      const req = tx.objectStore(this.audioStoreName).get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          this.triggerDeviceFileDownload(req.result.blob, this.currentDownloadingTrack);
        } else if (window.showToast) {
          window.showToast('تعذر العثور على الملف في الذاكرة');
        }
      };
    }
  }

  // Alias for backward compatibility
  async downloadAndStoreTrack(track, onProgress = null) {
    return this.startInteractiveDownload(track);
  }

  // 7. Cancel Download in Progress (Instant Abort)
  cancelCurrentDownload() {
    if (this.currentDownloadingTrack) {
      const key = this.getTrackKey(this.currentDownloadingTrack);
      if (this.activeDownloads.has(key)) {
        const { controller } = this.activeDownloads.get(key);
        try { controller.abort(); } catch (e) {}
        this.activeDownloads.delete(key);
      }
      if (window.wzkerNotif) {
        window.wzkerNotif.cancelDownloadNotification(key);
      }
    }

    this.closeDownloadModal();
    if (window.showToast) {
      window.showToast('تم إلغاء التحميل بنجاح ✕');
    }
  }

  // 8. Instant Offline Playback from Modal
  playCurrentDownloadedTrack() {
    this.closeDownloadModal();
    this.closeAlreadyDownloadedModal();
    if (window.closeSheet) window.closeSheet('trackOptionsSheet');

    if (this.currentDownloadingTrack) {
      if (window.wzkerAudio && window.wzkerAudio.playTrack) {
        window.wzkerAudio.playTrack(this.currentDownloadingTrack);
      } else if (window.wzkerLib && window.wzkerLib.playTrack) {
        window.wzkerLib.playTrack(this.currentDownloadingTrack);
      }
    }
  }

  // 9. Already Downloaded Notice Modal Controller
  showAlreadyDownloadedModal(track) {
    if (!track) return;
    this.currentDownloadingTrack = track;

    const modal = document.getElementById('alreadyDownloadedModal');
    const coverEl = document.getElementById('alreadyDlCover');
    const titleEl = document.getElementById('alreadyDlTitle');
    const artistEl = document.getElementById('alreadyDlArtist');

    if (coverEl) coverEl.src = track.image || track.coverUrl || 'images/icon/wzker.png';
    if (titleEl) titleEl.textContent = track.title || 'تلاوة مباركة';
    if (artistEl) artistEl.textContent = track.artist || track.munshid || track.sheikhName || 'القارئ';

    if (window.closeSheet) window.closeSheet('trackOptionsSheet');
    if (modal) modal.classList.add('active');
  }

  closeAlreadyDownloadedModal() {
    const modal = document.getElementById('alreadyDownloadedModal');
    if (modal) modal.classList.remove('active');
  }

  goToDownloadsPage(targetTrack = null) {
    const trackToFocus = targetTrack || this.currentDownloadingTrack;
    this.closeAlreadyDownloadedModal();
    this.closeDownloadModal();
    if (window.closeSheet) window.closeSheet('trackOptionsSheet');
    if (window.openLibPage) window.openLibPage('downloadsPage');
    if (window.wzkerLib && window.wzkerLib.renderDownloads) {
      window.wzkerLib.renderDownloads(trackToFocus ? (trackToFocus.id || trackToFocus.title) : null);
    }
  }

  // 5. Retrieve Playable Offline URL (Blob URL)
  async getTrackPlayableUrl(track) {
    if (!track) return null;
    const db = await this.getDB();
    if (!db) return null;
    const key = this.getTrackKey(track);

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(this.audioStoreName, 'readonly');
        const store = tx.objectStore(this.audioStoreName);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            // Revoke old URL for this track if exists to prevent memory leaks
            if (this.activeObjectUrls.has(key)) {
              try { URL.revokeObjectURL(this.activeObjectUrls.get(key)); } catch (e) {}
            }
            const blobUrl = URL.createObjectURL(req.result.blob);
            this.activeObjectUrls.set(key, blobUrl);
            resolve(blobUrl);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  // 6. Delete single track from IndexedDB
  async removeTrackOffline(trackId) {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([this.audioStoreName, this.metaStoreName], 'readwrite');
        tx.objectStore(this.audioStoreName).delete(trackId);
        tx.objectStore(this.metaStoreName).delete(trackId);

        if (this.activeObjectUrls.has(trackId)) {
          try { URL.revokeObjectURL(this.activeObjectUrls.get(trackId)); } catch (e) {}
          this.activeObjectUrls.delete(trackId);
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // 7. Clear all offline cached tracks
  async clearAllOfflineTracks() {
    const db = await this.getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([this.audioStoreName, this.metaStoreName], 'readwrite');
        tx.objectStore(this.audioStoreName).clear();
        tx.objectStore(this.metaStoreName).clear();

        this.activeObjectUrls.forEach((url) => {
          try { URL.revokeObjectURL(url); } catch (e) {}
        });
        this.activeObjectUrls.clear();

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // 8. Get Total Real Storage Usage (Bytes & Megabytes)
  async getTotalStorageStats() {
    const db = await this.getDB();
    if (!db) return { bytes: 0, mb: '0.0', count: 0 };

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(this.metaStoreName, 'readonly');
        const store = tx.objectStore(this.metaStoreName);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = req.result || [];
          let totalBytes = 0;
          list.forEach(item => {
            totalBytes += item.bytes || 0;
          });
          const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
          resolve({
            bytes: totalBytes,
            mb: totalMB,
            count: list.length,
            tracks: list
          });
        };

        req.onerror = () => resolve({ bytes: 0, mb: '0.0', count: 0, tracks: [] });
      } catch (e) {
        resolve({ bytes: 0, mb: '0.0', count: 0, tracks: [] });
      }
    });
  }
}

// Global Singleton Instance
window.wzkerStorage = new WzkerStorageEngine();
