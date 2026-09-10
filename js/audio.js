/**
 * Wzker Audio Engine - Completely Decoupled & Conflict-Free Audio System
 * Distinct Audio Pipelines: Quran/Ibtihalat Player vs. Live Radio Stream
 */

class WzkerAudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'none';
    this.preloaderAudio = new Audio();
    this.preloaderAudio.preload = 'auto';
    this.preloadedTrack = null;
    this.nextTrackPreloaded = false;

    // Audio State Machine: IDLE, LOADING, PLAYING, PAUSED, SEEKING, ERROR
    this.audioState = 'IDLE';
    this.activePlayPromise = null;

    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = 'off';
    this.isSeeking = false;
    this.sleepRemaining = 0;
    this.sleepInterval = null;
    
    // Auto-reconnect for live stream
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    this.initEvents();
    this.restoreLastTrack();
    this.setupMediaSession();
  }

  isRadioActive() {
    return !!(this.currentTrack && (this.currentTrack.isRadio === true || this.currentTrack.id === 'live_radio_cairo'));
  }

  isRadioPlaying() {
    return this.isRadioActive() && this.isPlaying;
  }

  initEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        this.onTimeUpdate();
      }
    });

    this.audio.addEventListener('progress', () => {
      this.updateBufferProgress();
    });

    this.audio.addEventListener('ended', () => this.onEnded());
    
    this.audio.addEventListener('loadedmetadata', () => {
      const total = this.audio.duration;
      if (total && !isNaN(total)) {
        const totTimeEl = document.getElementById('fpTotalTime');
        if (totTimeEl) totTimeEl.textContent = this.formatTime(total);
        if (window.wzkerQuranSync && window.wzkerQuranSync.onDurationLoaded) {
          window.wzkerQuranSync.onDurationLoaded(total);
        }
      }
      this.updateBufferProgress();
    });
    
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.audioState = 'PLAYING';
      this.reconnectAttempts = 0;
      this.updateUI();
      this.updateMediaSessionState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.audioState !== 'LOADING' && this.audioState !== 'SEEKING') {
        this.audioState = 'PAUSED';
      }
      this.updateUI();
      this.updateMediaSessionState('paused');
    });

    this.audio.addEventListener('waiting', () => {
      if (this.isRadioActive()) {
        this.updateRadioTelemetry('جاري الاتصال...', '#f59e0b');
        this.setRadioSpectrum(false);
      }
    });

    this.audio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.audioState = 'PLAYING';
      if (this.isRadioActive()) {
        this.updateRadioTelemetry('متصل الآن', '#4ade80');
        this.setRadioSpectrum(true);
      }
    });

    this.audio.addEventListener('volumechange', () => {
      this.syncVolumeUI();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio error event:', e);
      this.audioState = 'ERROR';
      if (this.isRadioActive()) {
        this.setRadioSpectrum(false);
        this.handleRadioReconnect();
      }
    });
  }

  syncVolumeUI() {
    const vol = Math.round((this.audio.muted ? 0 : this.audio.volume) * 100);
    const slider = document.getElementById('radioVolumeSlider');
    const badge = document.getElementById('radioVolPercent');
    const icon = document.getElementById('radioVolIcon');

    if (slider) slider.value = vol;
    if (badge) badge.textContent = vol + '%';
    if (icon) {
      if (vol === 0 || this.audio.muted) {
        icon.className = 'fa-solid fa-volume-xmark';
      } else if (vol < 50) {
        icon.className = 'fa-solid fa-volume-low';
      } else {
        icon.className = 'fa-solid fa-volume-high';
      }
    }
  }

  updateRadioTelemetry(statusText, color) {
    const statusEl = document.getElementById('telemetryStatusVal');
    if (statusEl) {
      statusEl.textContent = statusText;
      statusEl.style.color = color;
    }
  }

  handleRadioReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.updateRadioTelemetry(`إعادة الاتصال (${this.reconnectAttempts})...`, '#f59e0b');
      
      setTimeout(() => {
        if (this.isRadioActive()) {
          const timestamp = Date.now();
          this.audio.src = `https://stream.radiojar.com/8s5u5tpdtwzuv?t=${timestamp}`;
          this.safePlay();
        }
      }, 1500);
    } else {
      this.updateRadioTelemetry('انقطع الاتصال', '#ff4757');
    }
  }

  restoreLastTrack() {
    try {
      const saved = localStorage.getItem('wzker_last_track');
      if (saved) {
        const track = JSON.parse(saved);
        this.currentTrack = track;
        this.playlist = [track];
        this.currentIndex = 0;
        this.updateUI();
        if (window.wzkerQuranSync) window.wzkerQuranSync.syncCurrentTrack(track);
      }
    } catch (e) {}
  }

  playTrack(track, newPlaylist = null, index = 0) {
    if (!track) return;

    // Reset next-track preloader state
    this.nextTrackPreloaded = false;
    this.preloadedTrack = null;

    if (newPlaylist && Array.isArray(newPlaylist) && newPlaylist.length > 0) {
      this.playlist = newPlaylist;
      this.currentIndex = index >= 0 && index < newPlaylist.length ? index : 0;
    } else {
      // Auto-resolve context playlist from active section
      if (window.currentSheikhData && window.currentSheikhData.surahs && window.currentSheikhData.surahs.length > 0) {
        this.playlist = window.currentSheikhData.surahs;
        const found = this.playlist.findIndex(s => s.id === track.id || s.title === track.title);
        this.currentIndex = found >= 0 ? found : 0;
      } else if (window.wzkerLib && window.wzkerLib.favs && window.wzkerLib.favs.some(f => f.id === track.id || f.title === track.title)) {
        this.playlist = window.wzkerLib.favs.filter(f => !f.isSheikhFolder);
        const found = this.playlist.findIndex(s => s.id === track.id || s.title === track.title);
        this.currentIndex = found >= 0 ? found : 0;
      } else if (window.mainSuggestions && window.mainSuggestions.length > 0) {
        this.playlist = window.mainSuggestions;
        const found = this.playlist.findIndex(s => s.id === track.id || s.title === track.title);
        this.currentIndex = found >= 0 ? found : 0;
      } else if (window.RECITERS_DATA && window.RECITERS_DATA.length > 0) {
        const artistName = track.artist || track.munshid || track.sheikhName || '';
        const rec = window.RECITERS_DATA.find(r => artistName && (artistName.includes(r.name) || r.name.includes(artistName)));
        if (rec && rec.surahs) {
          this.playlist = rec.surahs;
          const found = this.playlist.findIndex(s => s.id === track.id || s.title === track.title);
          this.currentIndex = found >= 0 ? found : 0;
        } else {
          this.playlist = [track];
          this.currentIndex = 0;
        }
      } else {
        this.playlist = [track];
        this.currentIndex = 0;
      }
    }

    this.currentTrack = track;
    if (window.wzkerQuranSync) window.wzkerQuranSync.syncCurrentTrack(track);

    if (track.isRadio || track.id === 'live_radio_cairo') {
      // Dynamic preload strategy: none for live radio
      this.audio.preload = 'none';
      const timestamp = Date.now();
      const cleanUrl = track.url.split('?')[0];
      this.audio.src = `${cleanUrl}?t=${timestamp}`;
      this._startAudioPlayback(track);
    } else {
      // Dynamic preload strategy: auto for recitations
      this.audio.preload = 'auto';

      // Check if stored offline in IndexedDB
      if (window.wzkerStorage) {
        window.wzkerStorage.getTrackPlayableUrl(track).then(blobUrl => {
          this.audio.src = blobUrl || track.url;
          this._startAudioPlayback(track);
        }).catch(() => {
          this.audio.src = track.url;
          this._startAudioPlayback(track);
        });
      } else {
        this.audio.src = track.url;
        this._startAudioPlayback(track);
      }
    }
  }

  async safePlay() {
    this.audioState = 'LOADING';
    try {
      if (this.activePlayPromise) {
        await this.activePlayPromise.catch(() => {});
      }
      this.activePlayPromise = this.audio.play();
      await this.activePlayPromise;
      this.activePlayPromise = null;
      this.isPlaying = true;
      this.audioState = 'PLAYING';
      this.updateUI();
      this.updateMediaSessionMetadata();
      this.updateMediaSessionState('playing');
      if (window.wzkerLib && !this.isRadioActive()) window.wzkerLib.addToHistory(this.currentTrack);
      if (window.wzkerQuranSync && !this.isRadioActive()) window.wzkerQuranSync.onTrackChanged(this.currentTrack);
    } catch (err) {
      this.activePlayPromise = null;
      if (err.name === 'AbortError') {
        // Interrupted by new play request or seek, ignore safely
      } else {
        console.warn('Playback error handled:', err);
        this.isPlaying = false;
        this.audioState = 'ERROR';
        this.updateUI();
      }
    }
  }

  async safePause() {
    if (this.activePlayPromise) {
      try {
        await this.activePlayPromise;
      } catch (e) {}
    }
    this.audio.pause();
    this.isPlaying = false;
    this.audioState = 'PAUSED';
    this.updateUI();
    this.updateMediaSessionState('paused');
  }

  _startAudioPlayback(track) {
    try {
      localStorage.setItem('wzker_last_track', JSON.stringify(track));
    } catch (e) {}

    this.safePlay();
  }

  togglePlayPause() {
    if (!this.currentTrack) {
      if (this.playlist.length > 0) {
        this.playTrack(this.playlist[0], this.playlist, 0);
      } else if (window.mainSuggestions && window.mainSuggestions.length > 0) {
        this.playTrack(window.mainSuggestions[0], window.mainSuggestions, 0);
      } else {
        window.toggleRadioPlay();
      }
      return;
    }

    if (this.isPlaying) {
      this.safePause();
    } else {
      if (this.isRadioActive()) {
        const timestamp = Date.now();
        const cleanUrl = this.currentTrack.url.split('?')[0];
        this.audio.src = `${cleanUrl}?t=${timestamp}`;
      }
      this.safePlay();
    }
  }

  getNextTrackObject() {
    if (this.isRadioActive() || !this.playlist || this.playlist.length === 0) return null;
    if (this.repeatMode === 'one') return this.currentTrack;

    if (this.isShuffle && this.playlist.length > 1) {
      let randIdx = this.currentIndex;
      while (randIdx === this.currentIndex) {
        randIdx = Math.floor(Math.random() * this.playlist.length);
      }
      return this.playlist[randIdx];
    }

    const nextIdx = (this.currentIndex + 1);
    if (nextIdx >= this.playlist.length) {
      return this.repeatMode === 'all' ? this.playlist[0] : null;
    }
    return this.playlist[nextIdx];
  }

  preloadNextTrack() {
    const next = this.getNextTrackObject();
    if (!next || !next.url) return;
    this.nextTrackPreloaded = true;
    this.preloadedTrack = next;

    if (window.wzkerStorage) {
      window.wzkerStorage.getTrackPlayableUrl(next).then(blobUrl => {
        this.preloaderAudio.src = blobUrl || next.url;
        this.preloaderAudio.load();
      }).catch(() => {
        this.preloaderAudio.src = next.url;
        this.preloaderAudio.load();
      });
    } else {
      this.preloaderAudio.src = next.url;
      this.preloaderAudio.load();
    }
  }

  nextTrack() {
    if (this.isRadioActive()) {
      if (window.showToast) window.showToast('أنت تستمع إلى البث المباشر لإذاعة القرآن الكريم 📻');
      return;
    }

    if (!this.playlist || this.playlist.length === 0) return;

    if (this.isShuffle && this.playlist.length > 1) {
      let randIdx = this.currentIndex;
      while (randIdx === this.currentIndex) {
        randIdx = Math.floor(Math.random() * this.playlist.length);
      }
      this.currentIndex = randIdx;
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }

    const targetTrack = this.playlist[this.currentIndex];
    if (targetTrack) {
      this.playTrack(targetTrack, this.playlist, this.currentIndex);
    }
  }

  prevTrack() {
    if (this.isRadioActive()) {
      if (window.showToast) window.showToast('أنت تستمع إلى البث المباشر لإذاعة القرآن الكريم 📻');
      return;
    }

    if (!this.playlist || this.playlist.length === 0) return;

    if (this.isShuffle && this.playlist.length > 1) {
      let randIdx = this.currentIndex;
      while (randIdx === this.currentIndex) {
        randIdx = Math.floor(Math.random() * this.playlist.length);
      }
      this.currentIndex = randIdx;
    } else {
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    }

    const targetTrack = this.playlist[this.currentIndex];
    if (targetTrack) {
      this.playTrack(targetTrack, this.playlist, this.currentIndex);
    }
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    const btn = document.getElementById('fpShuffleBtn');
    if (btn) btn.classList.toggle('active', this.isShuffle);
    if (window.showToast) window.showToast(this.isShuffle ? 'تم تفعيل التشغيل العشوائي 🔀' : 'تم إيقاف التشغيل العشوائي');
  }

  toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(currentIdx + 1) % modes.length];

    const btn = document.getElementById('fpRepeatBtn');
    if (btn) {
      btn.classList.remove('active', 'repeat-one');
      if (this.repeatMode === 'all') {
        btn.classList.add('active');
        if (window.showToast) window.showToast('تكرار القائمة كاملة 🔁');
      } else if (this.repeatMode === 'one') {
        btn.classList.add('active', 'repeat-one');
        if (window.showToast) window.showToast('تكرار هذا المقطع فقط 🔂');
      } else {
        if (window.showToast) window.showToast('تم إيقاف التكرار');
      }
    }
  }

  onEnded() {
    if (this.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.safePlay();
    } else if (this.repeatMode === 'all' || this.currentIndex < this.playlist.length - 1) {
      // Gapless transition: If next track was preloaded, transition instantly
      if (this.preloadedTrack && this.nextTrackPreloaded) {
        const next = this.preloadedTrack;
        const nextIdx = (this.currentIndex + 1) % this.playlist.length;
        this.nextTrackPreloaded = false;
        this.preloadedTrack = null;
        this.playTrack(next, this.playlist, nextIdx);
      } else {
        this.nextTrack();
      }
    } else {
      this.isPlaying = false;
      this.audioState = 'IDLE';
      this.updateUI();
    }
  }

  setSpeed(rate) {
    this.audio.playbackRate = rate;
    const badge = document.getElementById('liveSpeedBadge');
    const indicator = document.getElementById('speedIndicator');
    if (badge) {
      if (rate !== 1.0 && rate !== 1) {
        badge.style.display = 'inline-flex';
        if (indicator) indicator.textContent = rate + 'x';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  setSleepTimer(minutes) {
    if (this.sleepInterval) clearInterval(this.sleepInterval);
    if (minutes <= 0) {
      this.sleepRemaining = 0;
      const badge = document.getElementById('liveSleepTimer');
      if (badge) badge.style.display = 'none';
      if (window.showToast) window.showToast('تم إلغاء مؤقت النوم');
      return;
    }

    this.sleepRemaining = minutes * 60;
    const badge = document.getElementById('liveSleepTimer');
    const countdown = document.getElementById('timerCountdown');

    if (badge) badge.style.display = 'inline-flex';

    this.sleepInterval = setInterval(() => {
      this.sleepRemaining--;
      const m = Math.floor(this.sleepRemaining / 60);
      const s = this.sleepRemaining % 60;
      const timeStr = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;

      if (countdown) countdown.textContent = timeStr;

      if (this.sleepRemaining <= 0) {
        clearInterval(this.sleepInterval);
        this.safePause();
        if (badge) badge.style.display = 'none';
        if (window.showToast) window.showToast('تم إيقاف البث بانتهاء مؤقت النوم 🌙');
      }
    }, 1000);
  }

  updateBufferProgress() {
    if (this.isRadioActive() || !this.audio || !this.audio.duration || isNaN(this.audio.duration)) return;
    const total = this.audio.duration;
    const cur = this.audio.currentTime;
    const b = this.audio.buffered;
    let bufEnd = 0;
    for (let i = 0; i < b.length; i++) {
      if (b.start(i) <= cur && cur <= b.end(i)) {
        bufEnd = b.end(i);
        break;
      }
    }
    if (bufEnd === 0 && b.length > 0) {
      bufEnd = b.end(b.length - 1);
    }
    const pct = Math.min(100, (bufEnd / total) * 100);
    const fpBuf = document.getElementById('fpProgressBuffered');
    if (fpBuf) fpBuf.style.width = pct + '%';
    const miniBuf = document.getElementById('progressBuffered');
    if (miniBuf) miniBuf.style.width = pct + '%';
  }

  onTimeUpdate() {
    const isRadio = this.isRadioActive();
    const miniProg = document.getElementById('progressCurrent');

    if (isRadio) {
      if (miniProg) miniProg.classList.add('live-stream-pulse');
      return;
    }

    if (miniProg) miniProg.classList.remove('live-stream-pulse');

    if (!this.audio.duration || isNaN(this.audio.duration)) return;
    const current = this.audio.currentTime;
    const total = this.audio.duration;
    const percent = (current / total) * 100;

    if (miniProg) miniProg.style.width = percent + '%';

    // Prevent overwriting full player seek bar if user is currently dragging/scrubbing
    if (!this.isSeeking) {
      const fpProg = document.getElementById('fpProgressCurrent');
      const curTimeEl = document.getElementById('fpCurrentTime');
      const totTimeEl = document.getElementById('fpTotalTime');

      if (fpProg) fpProg.style.width = percent + '%';
      if (curTimeEl) curTimeEl.textContent = this.formatTime(current);
      if (totTimeEl) totTimeEl.textContent = this.formatTime(total);
    }

    // Gapless preloader trigger: when audio reaches 85% or last 20s
    const remaining = total - current;
    if ((percent >= 85 || remaining <= 20) && !this.nextTrackPreloaded) {
      this.preloadNextTrack();
    }

    this.updateBufferProgress();

    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: total || 0,
          playbackRate: this.audio.playbackRate || 1,
          position: current || 0
        });
      } catch (e) {}
    }

    if (window.wzkerQuranSync) {
      window.wzkerQuranSync.onTimeUpdate(current);
    }
  }

  // Unified High-Precision Seeking Engine with Buffer Inspection & fastSeek
  seek(percent) {
    if (this.isRadioActive() || !this.audio || !this.audio.duration || isNaN(this.audio.duration)) return;
    const clamped = Math.max(0, Math.min(100, percent));
    const targetTime = (clamped / 100) * this.audio.duration;
    this.seekToTime(targetTime);
  }

  seekToTime(targetTime) {
    if (this.isRadioActive() || !this.audio || !this.audio.duration || isNaN(this.audio.duration)) return;
    const total = this.audio.duration;
    const clampedTime = Math.max(0, Math.min(total, targetTime));
    const percent = (clampedTime / total) * 100;

    this.audioState = 'SEEKING';

    try {
      if (typeof this.audio.fastSeek === 'function') {
        this.audio.fastSeek(clampedTime);
      } else {
        this.audio.currentTime = clampedTime;
      }
    } catch (e) {
      try {
        this.audio.currentTime = clampedTime;
      } catch (err) {
        console.warn('Seek error:', err);
      }
    }

    const miniProg = document.getElementById('progressCurrent');
    const fpProg = document.getElementById('fpProgressCurrent');
    const curTimeEl = document.getElementById('fpCurrentTime');

    if (miniProg) miniProg.style.width = percent + '%';
    if (fpProg) fpProg.style.width = percent + '%';
    if (curTimeEl) curTimeEl.textContent = this.formatTime(clampedTime);

    if (this.isPlaying && this.audio.paused) {
      this.safePlay();
    } else if (this.isPlaying) {
      this.audioState = 'PLAYING';
    } else {
      this.audioState = 'PAUSED';
    }

    if (window.wzkerQuranSync) {
      window.wzkerQuranSync.onTimeUpdate(clampedTime);
    }
  }

  formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Strictly controlled Radio-only spectrum vs Quran equalizer
  setRadioSpectrum(active) {
    const radioWaves = document.getElementById('homeRadioWaves');
    const internalSpec = document.getElementById('radioInternalSpectrum');
    
    if (radioWaves) {
      if (active) radioWaves.classList.add('playing');
      else radioWaves.classList.remove('playing');
    }
    if (internalSpec) {
      if (active) internalSpec.classList.add('playing');
      else internalSpec.classList.remove('playing');
    }
  }

  updateUI() {
    const t = this.currentTrack;
    const isRadio = this.isRadioActive();
    const radioPlaying = this.isRadioPlaying();

    // 1. Radio Spectrum ONLY activates if RADIO is playing
    this.setRadioSpectrum(radioPlaying);

    // 2. Mini Player UI
    const miniPlayer = document.getElementById('miniPlayer');
    const pTitle = document.getElementById('playerTitle');
    const pArtist = document.getElementById('playerArtist');
    const pIcon = document.getElementById('playerIcon');
    const mainBtn = document.getElementById('mainPlayBtn');
    const miniPlayImg = document.getElementById('miniPlayIconImg');
    const miniFavImg = document.getElementById('miniFavIconImg');
    const miniModeBadge = document.getElementById('miniModeBadge');

    if (miniPlayer) {
      miniPlayer.classList.toggle('radio-mode-active', isRadio);
      miniPlayer.classList.toggle('is-playing', this.isPlaying);
    }

    if (miniPlayImg) {
      miniPlayImg.src = this.isPlaying ? 'images/icons/pause3.png' : 'images/icons/play5.png';
    }

    if (mainBtn) {
      mainBtn.className = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    if (miniFavImg && window.wzkerLib) {
      const isFav = t ? window.wzkerLib.isFavorite(t) : false;
      miniFavImg.src = isFav ? 'images/icons/fav-active.png' : 'images/icons/no-fav.png';
    }

    if (miniModeBadge) {
      if (isRadio) {
        miniModeBadge.textContent = 'مباشر';
      } else if (t) {
        const isIbtihal = (t.category && (t.category.includes('ابتهال') || t.category.includes('مدائح'))) ||
                          (t.type && t.type.includes('ابتهال')) ||
                          (t.tags && t.tags.some && t.tags.some(tag => tag.includes('ابتهال'))) ||
                          (t.artist && (t.artist.includes('طوبار') || t.artist.includes('النقشبندي') || t.artist.includes('عمران'))) ||
                          (t.sheikhId && (t.sheikhId.includes('tobar') || t.sheikhId.includes('naqshbandi') || t.sheikhId.includes('omran'))) ||
                          (t.id && (String(t.id).startsWith('tb_') || String(t.id).startsWith('nq_') || String(t.id).startsWith('om_')));
        miniModeBadge.textContent = isIbtihal ? 'ابتهالات' : 'تلاوة';
      } else {
        miniModeBadge.textContent = 'تلاوة';
      }
    }

    const fpAyahDockLabel = document.getElementById('fpAyahDockLabel');
    if (fpAyahDockLabel) {
      if (t) {
        const isIbtihal = (t.category && (t.category.includes('ابتهال') || t.category.includes('مدائح'))) ||
                          (t.type && t.type.includes('ابتهال')) ||
                          (t.tags && t.tags.some && t.tags.some(tag => tag.includes('ابتهال'))) ||
                          (t.artist && (t.artist.includes('طوبار') || t.artist.includes('النقشبندي') || t.artist.includes('عمران'))) ||
                          (t.sheikhId && (t.sheikhId.includes('tobar') || t.sheikhId.includes('naqshbandi') || t.sheikhId.includes('omran'))) ||
                          (t.id && (String(t.id).startsWith('tb_') || String(t.id).startsWith('nq_') || String(t.id).startsWith('om_')));
        fpAyahDockLabel.textContent = isIbtihal ? 'الكلمات' : 'الآيات';
      } else {
        fpAyahDockLabel.textContent = 'الآيات';
      }
    }

    if (t) {
      const trackImg = isRadio 
        ? 'images/radio/radio-live.png' 
        : (t.image || 'images/icon/wzker.png');

      if (pTitle) pTitle.textContent = isRadio ? 'إذاعة القرآن الكريم' : (t.title || 'وذكر');
      if (pArtist) {
        pArtist.innerHTML = isRadio 
          ? '<span class="live-dot" style="width: 6px; height: 6px;"></span> مباشر الآن • 98.8 FM' 
          : (t.artist || t.munshid || 'تلاوة مباركة');
      }
      if (pIcon) pIcon.innerHTML = `<img src="${trackImg}" alt="Cover" onerror="this.src='images/radio/radio-live.png'">`;
    }

    // 3. Full Player UI
    const fullPlayer = document.getElementById('fullPlayer');
    const fpBigTitle = document.getElementById('fpBigTitle');
    const fpBigArtist = document.getElementById('fpBigArtist');
    const fpCover = document.getElementById('fpCoverIcon');
    const fpFavImg = document.getElementById('fpFavIconImg');
    const fpPlaylistName = document.getElementById('fpTopPlaylistName');

    if (fullPlayer) {
      fullPlayer.classList.toggle('radio-mode', isRadio);
    }

    if (fpCover) {
      fpCover.classList.toggle('playing', this.isPlaying);
    }

    if (t) {
      const fullImg = isRadio 
        ? 'images/radio/radio-live.png' 
        : (t.image || 'images/icon/wzker.png');

      if (fpBigTitle) fpBigTitle.textContent = isRadio ? 'إذاعة القرآن الكريم من القاهرة' : (t.title || 'وذكر');
      if (fpBigArtist) fpBigArtist.textContent = isRadio ? 'جمهورية مصر العربية • بث مباشر 24/7' : (t.artist || t.munshid || 'تلاوة مباركة');
      if (fpCover) fpCover.innerHTML = `<img src="${fullImg}" alt="Cover" onerror="this.src='images/radio/radio-live.png'">`;
      if (fpPlaylistName) fpPlaylistName.textContent = isRadio ? 'البث الإذاعي المباشر' : 'المصحف المرتل';
    }

    const fpPlayImg = document.getElementById('fpMainPlayImg');
    if (fpPlayImg) {
      fpPlayImg.src = this.isPlaying ? 'images/icons/pause3.png' : 'images/icons/play5.png';
    }

    const shuffleBtn = document.getElementById('fpShuffleBtn');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', !!this.isShuffle);
    }

    const repeatBtn = document.getElementById('fpRepeatBtn');
    if (repeatBtn) {
      repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
      repeatBtn.classList.toggle('repeat-one', this.repeatMode === 'one');
    }

    if (fpFavImg && window.wzkerLib) {
      const isFav = t ? window.wzkerLib.isFavorite(t) : false;
      fpFavImg.src = isFav ? 'images/icons/fav-active.png' : 'images/icons/no-fav.png';
      fpFavImg.style.filter = 'none';
    }

    // 4. Home Radio Card Button Synchronization
    const homeRadioPlay = document.getElementById('homeRadioPlayBtn');
    if (homeRadioPlay) {
      homeRadioPlay.innerHTML = radioPlaying
        ? '<img src="images/icons/pause3.png" alt="Pause">'
        : '<img src="images/icons/play5.png" alt="Play">';
    }

    // 5. Internal Radio Overlay Button Synchronization
    const radioBtn = document.getElementById('radioMainToggle');
    if (radioBtn) {
      radioBtn.innerHTML = radioPlaying
        ? '<img src="images/icons/pause3.png" alt="Pause">'
        : '<img src="images/icons/play5.png" alt="Play">';
    }

    this.onTimeUpdate();
    this.syncVolumeUI();
    this.syncAllTrackCards();
  }

  // 6. Synchronize All Track Cards across all views in real-time
  syncAllTrackCards() {
    const cur = this.currentTrack;
    const isPlaying = this.isPlaying;
    const curId = cur ? (cur.id || cur.title) : null;

    document.querySelectorAll('.track-item').forEach(card => {
      const cardId = card.getAttribute('data-track-id') || card.getAttribute('data-track-title');
      const isThisTrack = curId && (cardId === curId || (cur && cardId === cur.title));
      
      card.classList.toggle('playing-now', isThisTrack && isPlaying);

      const playBadge = card.querySelector('.track-play-badge');
      if (playBadge) {
        playBadge.classList.toggle('is-playing', isThisTrack && isPlaying);
        const icon = playBadge.querySelector('i');
        if (icon) {
          icon.className = isThisTrack && isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        }
      }

      const indicator = card.querySelector('.track-play-indicator');
      if (indicator) {
        if (isThisTrack && isPlaying) {
          indicator.innerHTML = `
            <div class="audio-waves-mini">
              <span></span><span></span><span></span>
            </div>
          `;
        } else {
          const num = card.getAttribute('data-track-num') || '';
          const isPinned = card.getAttribute('data-track-pinned') === 'true';
          indicator.innerHTML = `<span class="track-number">${isPinned ? '📌' : num}</span>`;
        }
      }
    });
  }

  setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
      navigator.mediaSession.setActionHandler('stop', () => {
        this.audio.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = (details && details.seekOffset) || 10;
        this.audio.currentTime = Math.max(0, this.audio.currentTime - skip);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = (details && details.seekOffset) || 10;
        const dur = this.audio.duration || Infinity;
        this.audio.currentTime = Math.min(dur, this.audio.currentTime + skip);
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details && details.seekTime !== undefined && !isNaN(details.seekTime)) {
          this.audio.currentTime = details.seekTime;
        }
      });
    } catch (e) {
      console.warn('MediaSession handler setup note:', e);
    }
  }

  updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator) || !this.currentTrack) return;
    const t = this.currentTrack;
    const imgUrl = new URL(t.image || 'images/icon/wzker.png', window.location.href).href;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title || 'إذاعة القرآن الكريم',
      artist: t.artist || t.munshid || 'بث مباشر من القاهرة',
      album: 'وذكر | Wzker - القرآن الكريم والابتهالات',
      artwork: [
        { src: imgUrl, sizes: '96x96', type: 'image/png' },
        { src: imgUrl, sizes: '128x128', type: 'image/png' },
        { src: imgUrl, sizes: '256x256', type: 'image/png' },
        { src: imgUrl, sizes: '512x512', type: 'image/png' }
      ]
    });
  }

  updateMediaSessionState(state) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }
}

// Global Audio Engine
window.wzkerAudio = new WzkerAudioEngine();
window.togglePlayPause = () => window.wzkerAudio.togglePlayPause();
window.nextTrack = () => window.wzkerAudio.nextTrack();
window.prevTrack = () => window.wzkerAudio.prevTrack();
window.toggleFavorite = () => {
  if (window.wzkerAudio.currentTrack && window.wzkerLib) {
    const isFav = window.wzkerLib.toggleFavorite(window.wzkerAudio.currentTrack);
    window.wzkerAudio.updateUI();
  }
};

// Global Track Card Interactors
window.toggleInlineTrackPlay = (event, track) => {
  if (event) event.stopPropagation();
  if (!track || !window.wzkerAudio) return;

  const cur = window.wzkerAudio.currentTrack;
  const isThis = cur && (cur.id === track.id || cur.title === track.title);

  if (isThis) {
    window.wzkerAudio.togglePlayPause();
  } else {
    const trackObj = {
      id: track.id || 'trk_' + Date.now(),
      title: track.title,
      subtitle: track.artist || track.munshid || track.sheikhName,
      artist: track.artist || track.munshid || track.sheikhName,
      sheikhName: track.sheikhName || track.artist || track.munshid,
      audioUrl: track.url || track.audioUrl,
      url: track.url || track.audioUrl,
      coverUrl: track.image || track.coverUrl || 'images/icon/wzker.png',
      image: track.image || track.coverUrl || 'images/icon/wzker.png',
      isLiveRadio: false
    };
    window.wzkerAudio.playTrack(trackObj);
  }
};

window.openTrackInFullPlayer = (track) => {
  if (!track || !window.wzkerAudio) return;
  const cur = window.wzkerAudio.currentTrack;
  const isThis = cur && (cur.id === track.id || cur.title === track.title);

  if (!isThis || !window.wzkerAudio.isPlaying) {
    const trackObj = {
      id: track.id || 'trk_' + Date.now(),
      title: track.title,
      subtitle: track.artist || track.munshid || track.sheikhName,
      artist: track.artist || track.munshid || track.sheikhName,
      sheikhName: track.sheikhName || track.artist || track.munshid,
      audioUrl: track.url || track.audioUrl,
      url: track.url || track.audioUrl,
      coverUrl: track.image || track.coverUrl || 'images/icon/wzker.png',
      image: track.image || track.coverUrl || 'images/icon/wzker.png',
      isLiveRadio: false
    };
    window.wzkerAudio.playTrack(trackObj);
  }

  window.openFullPlayer();
};
