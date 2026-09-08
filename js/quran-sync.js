/**
 * Wzker Quran & Ibtihalat Synchronization Engine (المرحلة الرابعة المطورة - محرك الضبط الصوتي الدقيق)
 * Dual-Surface Sync: Spotify-Style Embedded Live Card + Full Ayah Lyrics Sheet
 * Millimeter Precision Balanced Across All Reciters + Instant Auto-Play Transition.
 */

class WzkerQuranSyncEngine {
  constructor() {
    this.currentSurahNum = null;
    this.currentReciterKey = null;
    this.currentTrack = null;
    this.verses = [];
    this.rawTimings = [];
    this.calibratedTimings = [];
    this.calibratedDuration = 0;
    this.activeAyahIndex = -1;
    this.isLoading = false;
    this.isOpen = false;
    this.userScrolling = false;
    this.userScrollTimer = null;
    
    // Default or restored font size (16px to 38px)
    this.fontSize = parseInt(localStorage.getItem('wzker_ayah_font_size')) || 22;
    
    // Spotify live card collapsed state
    this.isCardCollapsed = localStorage.getItem('wzker_lyrics_card_collapsed') === 'true';

    // Verified reciters with authentic verse-by-verse timestamps on Quran.com API v4
    this.quranComReciters = {
      'menshawy': 9,       // Mohamed Siddiq al-Minshawi (Murattal)
      'basit': 2,          // AbdulBaset AbdulSamad (Murattal)
      'mshary': 7,         // Mishari Rashid al-`Afasy
      'yasser': 97,        // Yasser Ad Dussary (Murattal)
      'sudais': 3,         // Abdur-Rahman as-Sudais
      'shatri': 4,         // Abu Bakr al-Shatri
      'husary': 6,         // Mahmoud Khalil Al-Husary
      'tablawi': 11        // Mohamed al-Tablawi
    };

    // Acoustic Cadence profiles tailored to each reciter's natural tempo and breath rhythm
    this.reciterProfiles = {
      maher: { basePause: 1.5, leadIn: 1.2, leadOut: 1.4, wordWeight: 1.20, maddWeight: 0.35, charWeight: 0.08 },
      badr_turki: { basePause: 1.5, leadIn: 1.2, leadOut: 1.4, wordWeight: 1.20, maddWeight: 0.35, charWeight: 0.08 },
      qatami: { basePause: 1.8, leadIn: 1.5, leadOut: 1.6, wordWeight: 1.25, maddWeight: 0.35, charWeight: 0.09 },
      fares: { basePause: 2.0, leadIn: 1.5, leadOut: 1.8, wordWeight: 1.30, maddWeight: 0.38, charWeight: 0.10 },
      islam_sobhi: { basePause: 2.6, leadIn: 2.0, leadOut: 2.2, wordWeight: 1.40, maddWeight: 0.42, charWeight: 0.12 },
      menshawy: { leadIn: 2.2, leadOut: 2.2 },
      basit: { leadIn: 1.2, leadOut: 1.5 },
      mshary: { leadIn: 0.8, leadOut: 1.0 },
      yasser: { leadIn: 0.5, leadOut: 0.8 },
      sudais: { leadIn: 0.6, leadOut: 0.8 },
      shatri: { leadIn: 0.8, leadOut: 1.0 },
      husary: { leadIn: 1.2, leadOut: 1.5 },
      tablawi: { leadIn: 1.0, leadOut: 1.2 },
      default: { basePause: 1.9, leadIn: 1.5, leadOut: 1.5, wordWeight: 1.25, maddWeight: 0.35, charWeight: 0.10 }
    };

    // Per-reciter timing calibration offsets (seconds to hold text before transitioning to next ayah)
    this.reciterOffsets = {
      menshawy: 1.6,
      basit: 1.5,
      mshary: 1.2,
      yasser: 1.1,
      maher: 1.1,
      badr_turki: 1.0,
      qatami: 1.3,
      fares: 1.3,
      islam_sobhi: 1.8,
      sudais: 1.0,
      shatri: 1.2,
      husary: 1.5,
      tablawi: 1.5,
      default: 1.3
    };

    // Instant Opening Verses dictionary for zero-delay preview when switching surahs
    this.surahOpeningVerses = {
      1: { a1: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', a2: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ' },
      2: { a1: 'الم', a2: 'ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ' },
      3: { a1: 'الم', a2: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ' },
      18: { a1: 'ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَـٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَاۜ', a2: 'قَيِّمًۭا لِّيُنذِرَ بَأْسًۭا شَدِيدًۭا مِّن لَّدُنْهُ...' },
      36: { a1: 'يس', a2: 'وَٱلْقُرْءَانِ ٱلْحَكِيمِ' },
      55: { a1: 'ٱلرَّحْمَـٰنُ', a2: 'عَلَّمَ ٱلْقُرْءَانَ' },
      67: { a1: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ', a2: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ...' },
      112: { a1: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', a2: 'ٱللَّهُ ٱلصَّمَدُ' },
      113: { a1: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', a2: 'مِن شَرِّ مَا خَلَقَ' },
      114: { a1: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', a2: 'مَلِكِ ٱلنَّاسِ' }
    };

    // Authentic lyrics library for Master Mobtahileen
    this.ibtihalatLyrics = this.initIbtihalatLyrics();

    this.initDOM();
  }

  initDOM() {
    this.applyFontSize();
    this.applyCardCollapsedState();
    this.updateTimingTunerDisplay();
  }

  applyFontSize() {
    document.documentElement.style.setProperty('--ayah-font-size', `${this.fontSize}px`);
    const valDisplay = document.getElementById('ayahFontSizeVal');
    if (valDisplay) valDisplay.textContent = this.fontSize;
    try {
      localStorage.setItem('wzker_ayah_font_size', this.fontSize);
    } catch (e) {}
  }

  changeFontSize(delta) {
    this.fontSize = Math.max(16, Math.min(38, this.fontSize + delta));
    this.applyFontSize();
  }

  applyCardCollapsedState() {
    const card = document.getElementById('fpSpotifyLyricsCard');
    if (card) {
      card.classList.toggle('is-collapsed', this.isCardCollapsed);
    }
  }

  toggleCardCollapse() {
    this.isCardCollapsed = !this.isCardCollapsed;
    this.applyCardCollapsedState();
    try {
      localStorage.setItem('wzker_lyrics_card_collapsed', String(this.isCardCollapsed));
    } catch (e) {}
  }

  // Reciter Arabic Name Helper for clean feedback
  getReciterArabicName(key) {
    const names = {
      menshawy: 'الشيخ محمد صديق المنشاوي',
      basit: 'الشيخ عبد الباسط عبد الصمد',
      mshary: 'الشيخ مشاري راشد العفاسي',
      yasser: 'الشيخ ياسر الدوسري',
      maher: 'الشيخ ماهر المعيقلي',
      badr_turki: 'الشيخ بدر التركي',
      qatami: 'الشيخ ناصر القطامي',
      fares: 'الشيخ فارس عباد',
      islam_sobhi: 'الشيخ إسلام صبحي',
      sudais: 'الشيخ عبد الرحمن السديس',
      shatri: 'الشيخ أبو بكر الشاطري',
      husary: 'الشيخ محمود خليل الحصري',
      tablawi: 'الشيخ محمد محمود الطبلاوي'
    };
    return names[key] || 'القارئ';
  }

  // Get current reciter offset (stored custom value or intelligent default)
  getReciterOffset(reciterKey) {
    const key = reciterKey || this.currentReciterKey || (this.currentTrack ? this.detectReciterKey(this.currentTrack) : 'menshawy');
    try {
      const stored = localStorage.getItem(`wzker_sync_offset_${key}`);
      if (stored !== null && !isNaN(parseFloat(stored))) {
        return parseFloat(stored);
      }
    } catch (e) {}
    return this.reciterOffsets[key] !== undefined ? this.reciterOffsets[key] : (this.reciterOffsets.default || 1.3);
  }

  // Save new reciter offset with instant UI & Audio reaction
  setReciterOffset(reciterKey, val) {
    const key = reciterKey || this.currentReciterKey || (this.currentTrack ? this.detectReciterKey(this.currentTrack) : 'menshawy');
    const rounded = Number(Math.max(-5.0, Math.min(10.0, val)).toFixed(1));
    try {
      localStorage.setItem(`wzker_sync_offset_${key}`, String(rounded));
    } catch (e) {}
    this.updateTimingTunerDisplay();
    if (window.wzkerAudio && window.wzkerAudio.audio) {
      this.onTimeUpdate(window.wzkerAudio.audio.currentTime || 0);
    }
    return rounded;
  }

  // Fine-tune offset (+0.2s or -0.2s)
  adjustCurrentOffset(delta) {
    const key = this.currentReciterKey || (this.currentTrack ? this.detectReciterKey(this.currentTrack) : 'menshawy');
    const current = this.getReciterOffset(key);
    const updated = this.setReciterOffset(key, current + delta);
    const reciterName = this.getReciterArabicName(key);
    const sign = updated >= 0 ? `+${updated}` : `${updated}`;
    const action = delta > 0 ? 'تأخير انتقال النص' : 'تقديم انتقال النص';
    if (window.showToast) {
      window.showToast(`${action}: ${sign}ث (${reciterName}) ⏱️`);
    }
  }

  // Reset to default balanced offset for current reciter
  resetCurrentOffset() {
    const key = this.currentReciterKey || (this.currentTrack ? this.detectReciterKey(this.currentTrack) : 'menshawy');
    try {
      localStorage.removeItem(`wzker_sync_offset_${key}`);
    } catch (e) {}
    this.updateTimingTunerDisplay();
    const defaultVal = this.reciterOffsets[key] !== undefined ? this.reciterOffsets[key] : (this.reciterOffsets.default || 1.3);
    const reciterName = this.getReciterArabicName(key);
    const sign = defaultVal >= 0 ? `+${defaultVal}` : `${defaultVal}`;
    if (window.showToast) {
      window.showToast(`استعادة الضبط الافتراضي: ${sign}ث (${reciterName}) 🔄`);
    }
    if (window.wzkerAudio && window.wzkerAudio.audio) {
      this.onTimeUpdate(window.wzkerAudio.audio.currentTime || 0);
    }
  }

  // Update on-screen Tuner display
  updateTimingTunerDisplay() {
    const tunerEl = document.getElementById('timingTunerVal');
    const clusterEl = document.getElementById('ayahTimingTunerCluster');
    const key = this.currentReciterKey || (this.currentTrack ? this.detectReciterKey(this.currentTrack) : 'menshawy');
    const offset = this.getReciterOffset(key);
    const isIbtihal = this.currentTrack && this.isIbtihalTrack(this.currentTrack);

    if (clusterEl) {
      clusterEl.style.display = isIbtihal ? 'none' : 'inline-flex';
    }

    if (tunerEl) {
      const sign = offset >= 0 ? `+${offset.toFixed(1)}` : offset.toFixed(1);
      tunerEl.textContent = `${sign}s`;
    }
  }

  // Identify Reciter Key reliably across all track formats
  detectReciterKey(track) {
    if (!track) return 'menshawy';
    if (track.sheikhId) return String(track.sheikhId).toLowerCase();

    const text = ((track.artist || '') + ' ' + (track.title || '') + ' ' + (track.id || '') + ' ' + (track.url || '') + ' ' + (track.image || '')).toLowerCase();

    if (text.includes('minsh') || text.includes('منشاوي')) return 'menshawy';
    if (text.includes('basit') || text.includes('عبدالباسط') || text.includes('عبد الباسط')) return 'basit';
    if (text.includes('afs') || text.includes('عفاسي') || text.includes('مشاري')) return 'mshary';
    if (text.includes('yasser') || text.includes('دوسري') || text.includes('دبيري')) return 'yasser';
    if (text.includes('maher') || text.includes('معيقلي')) return 'maher';
    if (text.includes('frs_a') || text.includes('fares') || text.includes('عباد')) return 'fares';
    if (text.includes('qtm') || text.includes('qatami') || text.includes('قطامي')) return 'qatami';
    if (text.includes('islam') || text.includes('صبحي')) return 'islam_sobhi';
    if (text.includes('bader') || text.includes('badr') || text.includes('تركي')) return 'badr_turki';
    if (text.includes('sudais') || text.includes('سديس')) return 'sudais';
    if (text.includes('shatri') || text.includes('شاطري')) return 'shatri';
    if (text.includes('husary') || text.includes('حصري')) return 'husary';
    if (text.includes('tablawi') || text.includes('طبلاوي')) return 'tablawi';

    if (track.id) {
      const p = String(track.id).split('_')[0].toLowerCase();
      if (p !== 'c' && p !== 'tb' && p !== 'nq' && p !== 'om') return p;
    }

    return 'menshawy';
  }

  // Open the Full Sheet
  openSheet() {
    const track = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
    if (!track) {
      if (window.showToast) window.showToast('قم بتشغيل تلاوة أو ابتهال أولاً');
      return;
    }

    if (track.isRadio || track.id === 'live_radio_cairo') {
      if (window.showToast) window.showToast('البث الإذاعي المباشر لا يحتوي على نصوص مكتوبة');
      return;
    }

    const overlay = document.getElementById('ayahLyricsSheet');
    if (!overlay) return;

    this.isOpen = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.updateHeaderMeta(track);
    this.updateTimingTunerDisplay();

    if (this.isIbtihalTrack(track)) {
      this.renderIbtihalLyrics(track);
    } else {
      if (this.verses.length > 0 && this.currentSurahNum) {
        this.renderQuranVersesUI(this.currentSurahNum);
        if (this.activeAyahIndex >= 0) {
          this.setActiveAyahInFullSheet(this.activeAyahIndex, true);
        }
      } else {
        this.loadSurahVerses(track);
      }
    }

    // Attach scroll listener to detect user manual scrolling
    const scrollContainer = document.getElementById('ayahLyricsScrollBody');
    if (scrollContainer && !scrollContainer._hasScrollListener) {
      scrollContainer._hasScrollListener = true;
      scrollContainer.addEventListener('scroll', () => {
        this.userScrolling = true;
        if (this.userScrollTimer) clearTimeout(this.userScrollTimer);
        this.userScrollTimer = setTimeout(() => {
          this.userScrolling = false;
        }, 3200);
      }, { passive: true });
    }
  }

  closeSheet() {
    const overlay = document.getElementById('ayahLyricsSheet');
    if (overlay) overlay.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  isIbtihalTrack(track) {
    if (!track) return false;
    return !!(
      (track.category && (track.category.includes('ابتهال') || track.category.includes('مدائح'))) ||
      (track.type && track.type.includes('ابتهال')) ||
      (track.artist && (track.artist.includes('طوبار') || track.artist.includes('النقشبندي') || track.artist.includes('عمران'))) ||
      (track.sheikhId && (track.sheikhId.includes('tobar') || track.sheikhId.includes('naqshbandi') || track.sheikhId.includes('omran'))) ||
      (track.id && (String(track.id).startsWith('tb_') || String(track.id).startsWith('nq_') || String(track.id).startsWith('om_')))
    );
  }

  updateHeaderMeta(track) {
    const titleEl = document.getElementById('ayahHeaderTitle');
    const subEl = document.getElementById('ayahHeaderSubtitle');
    const badgeEl = document.getElementById('ayahTypeBadge');
    const avatarEl = document.getElementById('ayahTrackAvatarImg');
    const statusHint = document.getElementById('ayahSyncStatusText');

    const isIbtihal = this.isIbtihalTrack(track);

    if (titleEl) titleEl.textContent = track.title || 'وذكر';
    if (subEl) subEl.textContent = track.artist || track.munshid || 'تلاوة مباركة';
    if (avatarEl) {
      avatarEl.src = track.image || 'images/icon/wzker.png';
      avatarEl.onerror = () => { avatarEl.src = 'images/icon/wzker.png'; };
    }

    if (badgeEl) {
      badgeEl.textContent = isIbtihal ? 'روائع الابتهالات' : 'المصحف المرتل';
    }

    if (statusHint) {
      statusHint.textContent = isIbtihal ? 'عرض القصيدة والمناجاة الكاملة' : 'مزامنة حية مع التلاوة';
    }
  }

  // Automatic Immediate Sync when ANY track starts or changes
  syncCurrentTrack(track) {
    if (!track || track.isRadio || track.id === 'live_radio_cairo') {
      this.hideSpotifyLyricsCard();
      return;
    }

    this.currentTrack = track;
    this.activeAyahIndex = -1;
    this.calibratedTimings = [];
    this.calibratedDuration = 0;
    this.showSpotifyLyricsCard();
    this.updateHeaderMeta(track);
    this.updateTimingTunerDisplay();

    // Update Spotify card badge
    const cardBadge = document.getElementById('fpLyricsCardBadge');
    if (cardBadge) {
      cardBadge.textContent = this.isIbtihalTrack(track) ? 'روائع الابتهالات' : 'الآيات';
    }

    if (this.isIbtihalTrack(track)) {
      this.currentSurahNum = null;
      this.verses = [];
      this.rawTimings = [];
      const ibtihalData = this.getIbtihalData(track);
      if (ibtihalData && ibtihalData.stanzas && ibtihalData.stanzas[0]) {
        this.updateSpotifyLyricsCard(
          ibtihalData.stanzas[0].lines[0] || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          '',
          ibtihalData.stanzas[0].lines[1] || ''
        );
      }
      if (this.isOpen) {
        this.renderIbtihalLyrics(track);
      }
    } else {
      const surahNum = this.extractSurahNum(track);
      this.currentSurahNum = surahNum;
      
      // Zero-Delay Opening Verses Preview
      const preview = this.surahOpeningVerses[surahNum];
      if (preview) {
        const a2Preview = preview.a2 ? `${preview.a2} ${this.formatAyahOrnament(2)}` : '';
        this.updateSpotifyLyricsCard(preview.a1, this.formatAyahOrnament(1), a2Preview);
      } else {
        this.updateSpotifyLyricsCard('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', this.formatAyahOrnament(1), `ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ${this.formatAyahOrnament(2)}`);
      }

      // Fetch / Load immediately in the background
      this.loadSurahVerses(track);
    }
  }

  onTrackChanged(track) {
    this.syncCurrentTrack(track);
  }

  showSpotifyLyricsCard() {
    const card = document.getElementById('fpSpotifyLyricsCard');
    if (card) card.style.display = 'flex';
  }

  hideSpotifyLyricsCard() {
    const card = document.getElementById('fpSpotifyLyricsCard');
    if (card) card.style.display = 'none';
  }

  // Determine Surah Number from track object
  extractSurahNum(track) {
    if (!track) return 1;
    if (track.num && typeof track.num === 'number') return track.num;
    if (track.id) {
      const parts = String(track.id).split('_');
      if (parts.length > 1) {
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 114) return parsed;
      }
    }
    // Match by title
    if (track.title && window.SURAHS_METADATA) {
      const found = window.SURAHS_METADATA.find(s => track.title.includes(s.name));
      if (found) return found.num;
    }
    return 1;
  }

  // Load Quran verses & timings on demand with intelligent caching
  async loadSurahVerses(track) {
    const surahNum = this.extractSurahNum(track);
    const reciterKey = this.detectReciterKey(track);
    const reciterApiId = this.quranComReciters[reciterKey] || null;

    this.currentSurahNum = surahNum;
    this.currentReciterKey = reciterKey;
    this.activeAyahIndex = -1;
    this.updateTimingTunerDisplay();

    try {
      // 1. Fetch or load from Cache: Verses Uthmani
      const versesCacheKey = `wzker_uthmani_c_${surahNum}`;
      let versesData = null;
      try {
        const cached = localStorage.getItem(versesCacheKey);
        if (cached) versesData = JSON.parse(cached);
      } catch (e) {}

      if (!versesData) {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNum}`);
        if (!res.ok) throw new Error(`Quran API Verses HTTP ${res.status}`);
        const json = await res.json();
        versesData = json.verses || [];
        try {
          localStorage.setItem(versesCacheKey, JSON.stringify(versesData));
        } catch (e) {}
      }

      this.verses = versesData;

      // Update Spotify Card with Ayah 1 & 2 immediately from real text
      if (this.verses.length > 0) {
        const a1 = this.verses[0].text_uthmani;
        const a2 = this.verses.length > 1 ? `${this.verses[1].text_uthmani} ${this.formatAyahOrnament(2)}` : '';
        this.updateSpotifyLyricsCard(a1, this.formatAyahOrnament(1), a2);
      }

      // If full sheet is currently open, render it
      if (this.isOpen) {
        this.renderQuranVersesUI(surahNum);
      }

      // Current duration of audio stream
      const audioEl = window.wzkerAudio && window.wzkerAudio.audio;
      const totalDuration = (audioEl && !isNaN(audioEl.duration) && audioEl.duration > 0) ? audioEl.duration : 0;

      // 2. Load timings: Reciters with authentic Quran.com timestamps
      if (reciterApiId) {
        const timingsCacheKey = `wzker_timings_v3_r${reciterApiId}_c${surahNum}`;
        let timingsData = null;
        try {
          const cachedT = localStorage.getItem(timingsCacheKey);
          if (cachedT) timingsData = JSON.parse(cachedT);
        } catch (e) {}

        if (!timingsData) {
          try {
            const tRes = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciterApiId}/${surahNum}?segments=true`);
            if (tRes.ok) {
              const tJson = await tRes.json();
              if (tJson && tJson.audio_file && tJson.audio_file.timestamps) {
                timingsData = tJson.audio_file.timestamps;
                try {
                  localStorage.setItem(timingsCacheKey, JSON.stringify(timingsData));
                } catch (e) {}
              }
            }
          } catch (e) {
            console.warn('Recitation timings API fetch note:', e);
          }
        }

        this.rawTimings = timingsData || [];
      } else {
        // Reciters without Quran.com API (Maher, Qatami, Fares, Islam Sobhi, Badr Turki)
        this.rawTimings = [];
      }

      // Compute initial calibrated timings
      this.recomputeCalibratedTimings(totalDuration);

      // Trigger immediate time alignment
      if (audioEl) {
        this.onTimeUpdate(audioEl.currentTime || 0);
      }
    } catch (err) {
      console.error('Failed to load Quran verses:', err);
      const container = document.getElementById('ayahLyricsScrollBody');
      if (container && this.isOpen) {
        container.innerHTML = `
          <div class="ayah-empty-box">
            <img src="images/icons/spiritual-lib.png" alt="Quran">
            <h4 style="color: #ffffff; margin-bottom: 8px; font-weight: 800;">تعذر تحميل الآيات حالياً</h4>
            <p style="font-size: 13px; max-width: 320px; margin: 0 auto 16px; line-height: 1.6;">تأكد من اتصالك بالإنترنت لجلب نص وتوقيت السورة لأول مرة.</p>
            <button onclick="window.wzkerQuranSync.loadSurahVerses(window.wzkerAudio.currentTrack)" style="background: var(--primary); color: #fff; border: none; padding: 8px 20px; border-radius: 99px; font-weight: 800; cursor: pointer;">إعادة المحاولة 🔄</button>
          </div>
        `;
      }
    }
  }

  // Recalculate calibrated timings when audio duration becomes available or changes
  recomputeCalibratedTimings(duration) {
    const dur = (duration && duration > 0) ? duration : (this.estimateSurahDuration(this.currentSurahNum, this.currentReciterKey));
    this.calibratedDuration = dur;

    if (this.rawTimings && this.rawTimings.length > 0 && this.quranComReciters[this.currentReciterKey]) {
      this.calibratedTimings = this.calibrateQuranComTimings(this.rawTimings, dur, this.currentReciterKey);
    } else if (this.verses && this.verses.length > 0) {
      this.calibratedTimings = this.calculateAcousticCadence(this.verses, dur, this.currentReciterKey);
    }
  }

  // Notified by audio.js as soon as loadedmetadata fires
  onDurationLoaded(duration) {
    if (!duration || isNaN(duration) || duration <= 0) return;
    this.recomputeCalibratedTimings(duration);
    if (window.wzkerAudio && window.wzkerAudio.audio) {
      this.onTimeUpdate(window.wzkerAudio.audio.currentTime || 0);
    }
  }

  // Acoustic Cadence Generator for Reciters without Quran.com Timestamps
  calculateAcousticCadence(verses, duration, reciterKey) {
    if (!verses || verses.length === 0) return [];
    const dur = Math.max(10, duration || 60);
    const cfg = this.reciterProfiles[reciterKey] || this.reciterProfiles.default;

    const leadIn = Math.min(cfg.leadIn || 1.5, dur * 0.05);
    const leadOut = Math.min(cfg.leadOut || 1.5, dur * 0.05);
    const speechSpan = Math.max(1, dur - leadIn - leadOut);

    const weights = verses.map(v => {
      const text = v.text_uthmani || v.text || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 4;
      const chars = text.length || 20;
      const maddCount = (text.match(/[اويىٱۦۥ]/g) || []).length;
      return (cfg.basePause || 1.9) + (words * (cfg.wordWeight || 1.25)) + (maddCount * (cfg.maddWeight || 0.35)) + (chars * (cfg.charWeight || 0.09));
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    let cursor = leadIn;

    return verses.map((v, i) => {
      const verseDur = speechSpan * (weights[i] / totalWeight);
      const start = cursor;
      const end = cursor + verseDur;
      cursor = end;
      return {
        ayah: i + 1,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        dur: Number(verseDur.toFixed(2))
      };
    });
  }

  // Calibrate Quran.com Reference Timings to actual MP3 Audio stream
  calibrateQuranComTimings(timestamps, actualDuration, reciterKey) {
    if (!timestamps || timestamps.length === 0) return [];
    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];
    const refStart = (first.timestamp_from || 0) / 1000;
    const refEnd = (last.timestamp_to || 0) / 1000;
    const refDuration = Math.max(1, refEnd - refStart);

    const profile = this.reciterProfiles[reciterKey] || { leadIn: 1.0, leadOut: 1.2 };
    let leadIn = profile.leadIn;
    let leadOut = profile.leadOut;

    const diff = actualDuration - refDuration;
    if (diff > 3.0) {
      leadIn = Math.min(2.8, profile.leadIn + Math.max(0, (diff - 3.0) * 0.12));
      leadOut = Math.min(2.5, profile.leadOut + Math.max(0, (diff - 3.0) * 0.10));
    } else if (diff < -1.0) {
      leadIn = Math.max(0.3, profile.leadIn * 0.5);
      leadOut = Math.max(0.5, profile.leadOut * 0.5);
    }

    const actualSpeechSpan = Math.max(1, actualDuration - leadIn - leadOut);
    const scale = actualSpeechSpan / refDuration;

    return timestamps.map((t, i) => {
      const tFrom = (t.timestamp_from / 1000) - refStart;
      const tTo = (t.timestamp_to / 1000) - refStart;
      const start = leadIn + (tFrom * scale);
      const end = leadIn + (tTo * scale);
      return {
        ayah: i + 1,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        dur: Number((end - start).toFixed(2))
      };
    });
  }

  // Quick fallback duration estimate based on Surah Ayahs & reciter pace
  estimateSurahDuration(surahNum, reciterKey) {
    const meta = window.SURAHS_METADATA ? window.SURAHS_METADATA.find(s => s.num === surahNum) : null;
    const ayahs = meta ? meta.ayahs : (this.verses ? this.verses.length : 7);
    const pace = (reciterKey === 'maher' || reciterKey === 'badr_turki') ? 4.5 : (reciterKey === 'islam_sobhi' ? 7.2 : 5.8);
    return Math.max(30, ayahs * pace);
  }

  // Render the Quran Verses & Basmalah in Full Sheet
  // Eastern Arabic numerals converter (١, ٢, ٣, ...)
  toArabicDigits(num) {
    if (num === null || num === undefined) return '';
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, d => arabicDigits[d]);
  }

  // Authentic Quranic Ayah End Ornament with Number Centered Inside the Circle
  formatAyahOrnament(num) {
    if (!num) return '';
    const arabicDigits = this.toArabicDigits(num);
    const len = String(num).length;
    return `<span class="ayah-end-ornament" data-digits="${len}"><svg class="ayah-end-svg" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" stroke="#d6ad60" stroke-width="1.2" fill="none"/><circle cx="18" cy="18" r="12.5" stroke="#d6ad60" stroke-width="0.8" opacity="0.4" fill="none"/><circle cx="18" cy="2.5" r="1.2" fill="#d6ad60"/><circle cx="18" cy="33.5" r="1.2" fill="#d6ad60"/><circle cx="2.5" cy="18" r="1.2" fill="#d6ad60"/><circle cx="33.5" cy="18" r="1.2" fill="#d6ad60"/></svg><span class="ayah-end-digit">${arabicDigits}</span></span>`;
  }

  // Render the Quran Verses & Basmalah in Full Sheet
  renderQuranVersesUI(surahNum) {
    const container = document.getElementById('ayahLyricsScrollBody');
    if (!container) return;

    let html = '';

    // Basmalah (Display for all Surahs except Surah At-Tawbah 9)
    if (surahNum !== 9) {
      html += `
        <div class="quran-basmalah-frame">
          <div class="basmalah-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
          <div class="basmalah-decor-line">
            <span>۞</span>
          </div>
        </div>
      `;
    }

    html += '<div class="ayah-verses-list" id="ayahVersesList">';

    this.verses.forEach((v, index) => {
      const ayahNum = index + 1;
      let displayText = v.text_uthmani;
      if (surahNum !== 1 && ayahNum === 1 && displayText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ')) {
        displayText = displayText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ', '').trim();
      }

      html += `
        <div class="ayah-card" id="ayahCard_${ayahNum}" data-ayah-num="${ayahNum}" onclick="window.wzkerQuranSync.seekToAyah(${ayahNum})">
          <div class="ayah-content-wrap">
            <p class="ayah-text">
              ${displayText}
              <span class="ayah-ornament-symbol">${this.formatAyahOrnament(ayahNum)}</span>
            </p>
            <div class="ayah-actions-hint">
              <i class="fa-solid fa-volume-high"></i>
              <span>جارٍ الاستماع الآن • انقر لتكرار الآية</span>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';

    container.innerHTML = html;
  }

  // Update Spotify-Style Card in Real-Time
  updateSpotifyLyricsCard(activeText, ayahNumBadge, nextText) {
    const textEl = document.getElementById('fpLiveVerseText');
    const numEl = document.getElementById('fpLiveVerseNum');
    const nextEl = document.getElementById('fpLiveVerseNextText');

    if (textEl && activeText) {
      textEl.textContent = activeText;
    }
    if (numEl) {
      if (typeof ayahNumBadge === 'number') {
        numEl.innerHTML = this.formatAyahOrnament(ayahNumBadge);
        numEl.style.display = 'inline-flex';
      } else if (typeof ayahNumBadge === 'string' && ayahNumBadge) {
        if (ayahNumBadge.includes('<span') || ayahNumBadge.includes('<svg')) {
          numEl.innerHTML = ayahNumBadge;
        } else {
          const match = ayahNumBadge.match(/[0-9٠-٩]+/);
          if (match) {
            const rawDigits = match[0].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
            numEl.innerHTML = this.formatAyahOrnament(parseInt(rawDigits, 10));
          } else {
            numEl.textContent = ayahNumBadge;
          }
        }
        numEl.style.display = 'inline-flex';
      } else {
        numEl.innerHTML = '';
        numEl.style.display = 'none';
      }
    }
    if (nextEl) {
      if (typeof nextText === 'string') {
        nextEl.innerHTML = nextText;
      } else {
        nextEl.innerHTML = '';
      }
    }
  }

  // Real-time Audio Playback Time Synchronization (Millimeter Precision)
  onTimeUpdate(currentSecs) {
    if (!this.currentTrack) return;

    // A. Ibtihalat Real-Time Sync
    if (this.isIbtihalTrack(this.currentTrack)) {
      this.syncIbtihalTime(currentSecs);
      return;
    }

    // B. Quran Verses Real-Time Sync
    if (!this.verses || this.verses.length === 0) return;

    const audioEl = window.wzkerAudio && window.wzkerAudio.audio;
    const dur = (audioEl && !isNaN(audioEl.duration) && audioEl.duration > 0) ? audioEl.duration : 0;

    // Dynamically recalculate if duration changed or was 0 previously
    if (dur > 0 && (!this.calibratedDuration || Math.abs(this.calibratedDuration - dur) > 0.8)) {
      this.recomputeCalibratedTimings(dur);
    }

    if (!this.calibratedTimings || this.calibratedTimings.length === 0) return;

    // Apply per-reciter timing offset (effectiveSecs holds current ayah text until sheikh finishes)
    const offset = this.getReciterOffset(this.currentReciterKey);
    const effectiveSecs = Math.max(0, currentSecs - offset);

    // Millimeter precision lookup: find ayah matching effectiveSecs
    let targetIndex = -1;
    for (let i = 0; i < this.calibratedTimings.length; i++) {
      const t = this.calibratedTimings[i];
      if (effectiveSecs >= t.start && effectiveSecs < t.end) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      if (effectiveSecs < (this.calibratedTimings[0] ? this.calibratedTimings[0].start : 1)) {
        targetIndex = 0;
      } else if (effectiveSecs >= (this.calibratedTimings[this.calibratedTimings.length - 1] ? this.calibratedTimings[this.calibratedTimings.length - 1].end : 0)) {
        targetIndex = this.calibratedTimings.length - 1;
      }
    }

    if (targetIndex !== -1 && targetIndex !== this.activeAyahIndex) {
      this.setActiveAyah(targetIndex);
    }
  }

  // Update Highlight in Spotify Card + Full Sheet
  setActiveAyah(index) {
    this.activeAyahIndex = index;
    const ayahNum = index + 1;

    // 1. Update Spotify Card
    if (this.verses[index]) {
      const activeText = this.verses[index].text_uthmani;
      const nextVerse = this.verses[index + 1];
      const nextText = nextVerse ? `${nextVerse.text_uthmani} ${this.formatAyahOrnament(ayahNum + 1)}` : '';
      this.updateSpotifyLyricsCard(activeText, this.formatAyahOrnament(ayahNum), nextText);
    }

    // 2. Update Full Sheet (if open or rendered)
    this.setActiveAyahInFullSheet(index, false);
  }

  setActiveAyahInFullSheet(index, forceScroll = false) {
    const ayahNum = index + 1;
    const oldActive = document.querySelector('.ayah-card.active-ayah');
    if (oldActive) oldActive.classList.remove('active-ayah');

    const newCard = document.getElementById(`ayahCard_${ayahNum}`);
    if (newCard) {
      newCard.classList.add('active-ayah');

      if (forceScroll || (!this.userScrolling && this.isOpen)) {
        newCard.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }

  // Synchronize Ibtihalat Lyrics in Real-Time
  syncIbtihalTime(currentSecs) {
    const totalDuration = (window.wzkerAudio && window.wzkerAudio.audio && window.wzkerAudio.audio.duration) 
      ? window.wzkerAudio.audio.duration 
      : 300;

    const data = this.getIbtihalData(this.currentTrack);
    if (!data || !data.stanzas || data.stanzas.length === 0) return;

    // Flatten lines
    const allLines = [];
    data.stanzas.forEach(s => {
      s.lines.forEach(l => allLines.push(l));
    });

    if (allLines.length === 0) return;

    const lineDuration = totalDuration / allLines.length;
    const currentLineIndex = Math.min(allLines.length - 1, Math.floor(currentSecs / lineDuration));

    const curLine = allLines[currentLineIndex];
    const nextLine = allLines[currentLineIndex + 1] || '';

    this.updateSpotifyLyricsCard(curLine, '', nextLine);
  }

  // Click-to-Seek: Jump directly to the selected Ayah
  seekToAyah(ayahNum) {
    const index = ayahNum - 1;
    if (index < 0 || !window.wzkerAudio || !window.wzkerAudio.audio) return;

    const offset = this.getReciterOffset(this.currentReciterKey);
    let targetTimeSec = 0;
    if (this.calibratedTimings && this.calibratedTimings[index]) {
      targetTimeSec = Math.max(0, this.calibratedTimings[index].start + offset + 0.05);
    } else if (this.verses && this.verses.length > 0 && window.wzkerAudio.audio.duration) {
      const dur = window.wzkerAudio.audio.duration;
      targetTimeSec = Math.max(0, (index / this.verses.length) * dur + offset);
    }

    try {
      window.wzkerAudio.audio.currentTime = targetTimeSec;
      if (window.wzkerAudio.audio.paused) {
        window.wzkerAudio.audio.play().catch(() => {});
      }
      this.setActiveAyah(index);
      if (window.showToast) window.showToast(`الانتقال إلى الآية (${ayahNum}) 📖`);
    } catch (e) {
      console.warn('Seek to ayah error:', e);
    }
  }

  // Render poetic lyrics for Ibtihalat in full sheet
  renderIbtihalLyrics(track) {
    const container = document.getElementById('ayahLyricsScrollBody');
    if (!container) return;

    const lyricsData = this.getIbtihalData(track);

    let html = `
      <div class="ibtihal-poetry-container">
        <div class="ibtihal-section-card">
          <div class="ibtihal-theme-title">
            <i class="fa-solid fa-moon"></i>
            <span>${lyricsData.title || track.title}</span>
          </div>
    `;

    lyricsData.stanzas.forEach((stanza, sIdx) => {
      html += '<div class="ibtihal-couplet">';
      stanza.lines.forEach((line, lIdx) => {
        html += `<p class="ibtihal-line ${lIdx % 2 === 1 ? 'response-line' : ''}">${line}</p>`;
      });
      html += '</div>';

      if (sIdx < lyricsData.stanzas.length - 1) {
        html += '<div class="ibtihal-divider">✦ ✦ ✦</div>';
      }
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  getIbtihalData(track) {
    const key = (track.title || '') + (track.id || '');
    for (const item of this.ibtihalatLyrics) {
      if (item.matchKey && (key.includes(item.matchKey) || item.matchKey.includes(track.title))) {
        return item;
      }
    }
    // Generic spiritual fallback poem if unlisted
    return {
      title: track.title || 'مناجاة وابتهال',
      stanzas: [
        {
          lines: [
            'يا رَبِّ إِن عَظُمَت ذُنوبي كَثرَةً',
            'فَلَقَد عَلِمتُ بِأَنَّ عَفوَكَ أَعظَمُ'
          ]
        },
        {
          lines: [
            'إِن كانَ لا يَرجوكَ إِلّا مُحسِنٌ',
            'فَبِمَن يَلوذُ وَيَستَجيرُ المُجرِمُ'
          ]
        },
        {
          lines: [
            'ما لي إِلَيكَ وَسيلَةٌ إِلّا الرَجا',
            'وَجَميلُ عَفوِكَ ثُمَّ أَنّي مُسلِمُ'
          ]
        }
      ]
    };
  }

  // Master Ibtihalat Poetry Catalog
  initIbtihalatLyrics() {
    return [
      {
        matchKey: 'جل المنادي',
        title: 'جل المنادي ينادي في الدجى',
        stanzas: [
          {
            lines: [
              'جَلَّ المُنَادِي يَنَادِي فِي الدُّجَى قُومُوا',
              'فَأَقْبَلَ العَبْدُ يَبْكِي وَالدُّمُوعُ دِمَا'
            ]
          },
          {
            lines: [
              'يَا بَارِئَ الكَوْنِ إِنَّ الذَّنْبَ أَثْقَلَنِي',
              'وَمَا لِي سِوَاكَ عِندَ الخَوْفِ مُعْتَصَمَا'
            ]
          },
          {
            lines: [
              'إِنِّي وَقَفْتُ بِبَابِ الفَضْلِ مُنْكَسِراً',
              'فَامْنُنْ عَلَيَّ وَجُدْ بِالعَفْوِ كَرَمَا'
            ]
          },
          {
            lines: [
              'فَكَمْ رَحِمْتَ طَرِيداً عَادَ مُعْتَرِفاً',
              'وَكَمْ جَبَرْتَ فُؤَاداً كَانَ مُنْحَطِمَا'
            ]
          }
        ]
      },
      {
        matchKey: 'يا مجيب السائلين',
        title: 'يا مجيب السائلين ويامن آمنت يونس',
        stanzas: [
          {
            lines: [
              'يَا مُجِيبَ السَّائِلِينَ وَيَا أَمَلَ الرَّاجِينَ',
              'يَا مَنْ آمَنْتَ يُونُسَ فِي بَطْنِ الحُوتِ'
            ]
          },
          {
            lines: [
              'نَادَاكَ فِي الظُّلُمَاتِ أَنْ لَا إِلَهَ إِلَّا أَنْتَ',
              'سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ'
            ]
          },
          {
            lines: [
              'فَاسْتَجَبْتَ لَهُ وَنَجَّيْتَهُ مِنَ الغَمِّ',
              'وَكَذَلِكَ تُنْجِي المُؤْمِنِينَ'
            ]
          },
          {
            lines: [
              'إِلَهَنَا.. مَالَنَا مَلْجَأٌ غَيْرُكَ فَنَلُوذُ بِهِ',
              'فَارْحَمْ ضَعْفَنَا وَاغْفِرْ لَنَا يَا رَبَّ العَالَمِينَ'
            ]
          }
        ]
      },
      {
        matchKey: 'يا رب عدت',
        title: 'يا رب عدت إلى رحابك تائباً',
        stanzas: [
          {
            lines: [
              'يَا رَبِّ عُدْتُ إِلَى رِحَابِكَ تَائِباً',
              'مُسْتَسْلِماً لِحِمَاكَ أَرْجُو مَغْفِرَةْ'
            ]
          },
          {
            lines: [
              'حَمَّلْتُ نَفْسِيَ مَا أُطِيقُ وَمَا أَرَى',
              'غَيْرَ المَتَابِ نَجَاةَ نَفْسٍ خَاسِرَةْ'
            ]
          },
          {
            lines: [
              'فَاغْسِلْ خَطَايَايَ الَّتِي أَوْبَقْتُهَا',
              'وَاجْعَلْ صَحِيفَةَ مَوْقِفِي مُسْتَبْشِرَةْ'
            ]
          }
        ]
      },
      {
        matchKey: 'يا إله العالمين',
        title: 'يا إله العالمين ومجيب الداعين',
        stanzas: [
          {
            lines: [
              'يَا إِلَهَ العَالَمِينَ وَخَالِقَ الأَكْوَانِ أَجْمَعِ',
              'سَأَلْتُكَ بِالأَسْمَاءِ الحُسْنَى أَنْ تُفَرِّجَ كَرْبِي'
            ]
          },
          {
            lines: [
              'تَجَلَّى عَلَى عَبْدٍ تَمَلَّكَهُ الدُّجَى',
              'بِنُورِ رِضَاكَ يَمْحُو كُلَّ مُعْضِلِ'
            ]
          }
        ]
      },
      {
        matchKey: 'يا مؤنسي',
        title: 'يا مؤنسي في وحدتي يا منقذي في شدتي',
        stanzas: [
          {
            lines: [
              'يَا مُؤْنِسِي فِي وَحْدَتِي وَمَلَاذِي عِنْدَ غُرْبَتِي',
              'يَا مَنْقِذِي فِي شِدَّتِي يَا كَاشِفَ البَلْوَى'
            ]
          },
          {
            lines: [
              'لَيْسَ لِي فِي الوُجُودِ رَبٌّ سِوَاكَ أَدْعُوهُ',
              'فَأَجِبْ دُعَائِي وَحَقِّقْ فِي الرَّجَاءِ مَطَالِبِي'
            ]
          }
        ]
      },
      {
        matchKey: 'مولاي',
        title: 'مولاي إني ببابك قد بسطت يدي',
        stanzas: [
          {
            lines: [
              'مَوْلَايَ إِنِّي بِبَابِكَ قَدْ بَسَطْتُ يَدِي',
              'مَنْ لِي أَلُوذُ بِهِ إِلَّاكَ يَا سَنَدِي'
            ]
          },
          {
            lines: [
              'أَقُومُ بِاللَّيْلِ وَالأَسْحَارُ سَاهِيَةٌ',
              'أَدْعُو وَهَمْسُ دُعَائِي بِالدُّمُوعِ نَدِي'
            ]
          },
          {
            lines: [
              'بِالنُّورِ فِي وَجْهِ خَيْرِ الخَلْقِ قَاطِبَةً',
              'مُحَمَّدٍ خَيْرِ مَبْعُوثٍ إِلَى الأَبَدِ'
            ]
          }
        ]
      },
      {
        matchKey: 'أقول وقد ناحت',
        title: 'أقول وقد ناحت بقربي حمامة',
        stanzas: [
          {
            lines: [
              'أَقُولُ وَقَدْ نَاحَتْ بِقُرْبِي حَمَامَةٌ',
              'أَيَا جَارَتَا هَلْ تَشْعُرِينَ بِحَالِي'
            ]
          },
          {
            lines: [
              'مَعَاذَ الهَوَى مَا ذُقْتِ طَارِقَةَ النَّوَى',
              'وَلَا خَطَرَتْ مِنْكِ الهُمُومُ بِبَالِ'
            ]
          }
        ]
      },
      {
        matchKey: 'أشرق المعصوم',
        title: 'أشرق البدر ونور المعصوم',
        stanzas: [
          {
            lines: [
              'أَشْرَقَ المَعْصُومُ فِي الكَوْنِ ضِيَاءً',
              'فَمَلَأَ الدُّنْيَا جَمَالاً وَسَنَاءً'
            ]
          },
          {
            lines: [
              'صَلَّى عَلَيْكَ اللَّهُ يَا خَيْرَ الوَرَى',
              'مَا رَفْرَفَتْ فَوْقَ الرِّيَاضِ حَمَائِمُ'
            ]
          }
        ]
      }
    ];
  }
}

// Global Single Instance
window.wzkerQuranSync = new WzkerQuranSyncEngine();
window.openAyahLyricsSheet = () => window.wzkerQuranSync.openSheet();
window.closeAyahLyricsSheet = () => window.wzkerQuranSync.closeSheet();
window.adjustAyahFontSize = (delta) => window.wzkerQuranSync.changeFontSize(delta);
window.adjustAyahTimingOffset = (delta) => window.wzkerQuranSync.adjustCurrentOffset(delta);
window.resetAyahTimingOffset = () => window.wzkerQuranSync.resetCurrentOffset();
