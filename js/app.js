/**
 * Wzker Main Application Controller
 * Spotify Physics Carousels, Full 114 Surahs Renderer, Single-Toast Batch Downloader & Smart Non-Intrusive Auto-Cycling
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHomeReciters();
  renderHomeMobtahileen();
  renderSmartRecitations();
  initSmartCarousels();
  initSheikhProfileSearch();
  setupFullPlayerSheikhNavigation();
});

// 1. Render Home Reciters Cards with Dynamic Dots
function renderHomeReciters() {
  const container = document.getElementById('homeRecitersContainer');
  const dotsContainer = document.getElementById('recitersDots');
  if (!container || !window.RECITERS_DATA) return;

  container.innerHTML = window.RECITERS_DATA.map((rec, idx) => `
    <div class="reciter-card-pro ${idx === 0 ? 'spotlight-active' : ''}" 
         data-card-id="${rec.id}" 
         style="--card-accent: ${rec.accentColor};" 
         onclick="openSheikhProfile('${rec.id}')">

      <div class="reciter-img-wrapper-pro" style="border-color: ${rec.accentColor};">
        <img src="${rec.image}" alt="${rec.shortName}" class="reciter-img-pro" loading="lazy">
        <div class="play-hover-btn-pro" onclick="event.stopPropagation(); playAllFromSheikh('${rec.id}', false);">
          <img src="images/icons/play.png" alt="Play">
        </div>
      </div>

      <div class="reciter-info-pro">
        <div class="reciter-title-pro">
          <span>${rec.shortName}</span>
          <img src="${rec.verifiedIcon}" alt="Verified">
        </div>
        <div class="reciter-subtitle-pro">${rec.tags[0] || 'المصحف المرتل'}</div>
        <span class="reciter-tag-pill">${rec.surahCount}</span>
      </div>
    </div>
  `).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = window.RECITERS_DATA.map((_, i) => `
      <span class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="scrollRecitersTo(${i})"></span>
    `).join('');
  }
}

// 2. Render Home Mobtahileen Cards with Dynamic Dots
function renderHomeMobtahileen() {
  const container = document.getElementById('homeMobtahileenContainer');
  const dotsContainer = document.getElementById('mobtahilDots');
  if (!container || !window.IBTIHALAT_DATA) return;

  container.innerHTML = window.IBTIHALAT_DATA.map((mob, idx) => `
    <div class="reciter-card-pro ${idx === 0 ? 'spotlight-active' : ''}" 
         data-card-id="${mob.id}" 
         style="--card-accent: ${mob.accentColor};" 
         onclick="openMobtahilProfile('${mob.id}')">

      <div class="reciter-img-wrapper-pro" style="border-color: ${mob.accentColor};">
        <img src="${mob.image}" alt="${mob.shortName}" class="reciter-img-pro" loading="lazy">
        <div class="play-hover-btn-pro" onclick="event.stopPropagation(); playAllFromSheikh('${mob.id}', false);">
          <img src="images/icons/play.png" alt="Play">
        </div>
      </div>

      <div class="reciter-info-pro">
        <div class="reciter-title-pro">
          <span>${mob.shortName}</span>
          <img src="${mob.verifiedIcon}" alt="Verified">
        </div>
        <div class="reciter-subtitle-pro">${mob.tags[0] || 'ابتهالات خاشعة'}</div>
        <span class="reciter-tag-pill">${mob.surahCount}</span>
      </div>
    </div>
  `).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = window.IBTIHALAT_DATA.map((_, i) => `
      <span class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="scrollMobtahilTo(${i})"></span>
    `).join('');
  }
}

// 3. Smart Non-Intrusive Auto-Cycling (NEVER jumps the vertical window viewport!)
function initSmartCarousels() {
  let recIdx = 0;
  let mobIdx = 0;
  let isReciterVisible = false;
  let isMobtahilVisible = false;
  let isUserTouching = false;
  let touchTimeout = null;

  const recContainer = document.getElementById('homeRecitersContainer');
  const mobContainer = document.getElementById('homeMobtahileenContainer');

  // IntersectionObserver to ONLY animate if the section is currently inside viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === recContainer) isReciterVisible = entry.isIntersecting;
        if (entry.target === mobContainer) isMobtahilVisible = entry.isIntersecting;
      });
    }, { threshold: 0.2 });

    if (recContainer) observer.observe(recContainer);
    if (mobContainer) observer.observe(mobContainer);
  } else {
    isReciterVisible = true;
    isMobtahilVisible = true;
  }

  const cycleReciters = () => {
    if (isUserTouching || !isReciterVisible || !recContainer) return;
    const cards = recContainer.querySelectorAll('.reciter-card-pro');
    const dots = document.querySelectorAll('#recitersDots .carousel-dot');
    if (cards.length === 0) return;

    cards.forEach(c => c.classList.remove('spotlight-active'));
    dots.forEach(d => d.classList.remove('active'));

    recIdx = (recIdx + 1) % cards.length;
    const activeCard = cards[recIdx];
    activeCard.classList.add('spotlight-active');
    if (dots[recIdx]) dots[recIdx].classList.add('active');

    // ONLY scroll container horizontally - zero vertical jump
    const scrollTarget = activeCard.offsetLeft - (recContainer.clientWidth / 2) + (activeCard.clientWidth / 2);
    recContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  };

  const cycleMobtahileen = () => {
    if (isUserTouching || !isMobtahilVisible || !mobContainer) return;
    const cards = mobContainer.querySelectorAll('.reciter-card-pro');
    const dots = document.querySelectorAll('#mobtahilDots .carousel-dot');
    if (cards.length === 0) return;

    cards.forEach(c => c.classList.remove('spotlight-active'));
    dots.forEach(d => d.classList.remove('active'));

    mobIdx = (mobIdx + 1) % cards.length;
    const activeCard = cards[mobIdx];
    activeCard.classList.add('spotlight-active');
    if (dots[mobIdx]) dots[mobIdx].classList.add('active');

    // ONLY scroll container horizontally - zero vertical jump
    const scrollTarget = activeCard.offsetLeft - (mobContainer.clientWidth / 2) + (activeCard.clientWidth / 2);
    mobContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  };

  const onUserTouch = () => {
    isUserTouching = true;
    if (touchTimeout) clearTimeout(touchTimeout);
    touchTimeout = setTimeout(() => {
      isUserTouching = false;
    }, 6000);
  };

  if (recContainer) {
    recContainer.addEventListener('touchstart', onUserTouch, { passive: true });
    recContainer.addEventListener('mousedown', onUserTouch);
  }
  if (mobContainer) {
    mobContainer.addEventListener('touchstart', onUserTouch, { passive: true });
    mobContainer.addEventListener('mousedown', onUserTouch);
  }

  setInterval(cycleReciters, 4000);
  setInterval(cycleMobtahileen, 4500);
}

window.scrollRecitersTo = (idx) => {
  const recContainer = document.getElementById('homeRecitersContainer');
  if (!recContainer) return;
  const cards = recContainer.querySelectorAll('.reciter-card-pro');
  if (cards[idx]) {
    cards.forEach(c => c.classList.remove('spotlight-active'));
    cards[idx].classList.add('spotlight-active');
    const scrollTarget = cards[idx].offsetLeft - (recContainer.clientWidth / 2) + (cards[idx].clientWidth / 2);
    recContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    document.querySelectorAll('#recitersDots .carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }
};

window.scrollMobtahilTo = (idx) => {
  const mobContainer = document.getElementById('homeMobtahileenContainer');
  if (!mobContainer) return;
  const cards = mobContainer.querySelectorAll('.reciter-card-pro');
  if (cards[idx]) {
    cards.forEach(c => c.classList.remove('spotlight-active'));
    cards[idx].classList.add('spotlight-active');
    const scrollTarget = cards[idx].offsetLeft - (mobContainer.clientWidth / 2) + (cards[idx].clientWidth / 2);
    mobContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    document.querySelectorAll('#mobtahilDots .carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }
};

// 4. Open Sheikh / Mobtahil Profile Page (Spotify-Grade Showcase)
window.openSheikhProfile = (sheikhId) => {
  const sheikh = window.RECITERS_DATA.find(r => r.id === sheikhId);
  if (!sheikh) return;
  renderFullProfileView(sheikh);
  window.openLibPage('sheikhProfilePage');
};

window.openMobtahilProfile = (mobId) => {
  const mob = window.IBTIHALAT_DATA.find(m => m.id === mobId);
  if (!mob) return;
  renderFullProfileView(mob);
  window.openLibPage('sheikhProfilePage');
};

function renderFullProfileView(data) {
  const page = document.getElementById('sheikhProfilePage');
  if (!page) return;

  // Apply Signature Accent & Gradient
  page.style.setProperty('--sheikh-profile-accent', data.accentColor);
  page.style.setProperty('--sheikh-profile-gradient', data.gradient);

  // 1. Hero Artwork Banner
  const heroBanner = document.getElementById('profileHeroBanner');
  if (heroBanner) {
    heroBanner.innerHTML = `
      <img src="${data.image}" alt="${data.name}">
      <div class="sheikh-hero-overlay">
        <div class="sheikh-hero-meta">
          <h2>
            <span>${data.name}</span>
            <img src="${data.verifiedIcon}" alt="Verified">
          </h2>
          <p>${data.title}</p>
        </div>
      </div>
    `;
  }

  // 2. Action Buttons Matrix
  const actionsRow = document.getElementById('profileActionsRow');
  const isSheikhFav = window.wzkerLib ? window.wzkerLib.isFavorite({ id: 'sheikh_' + data.id, title: `المصحف المرتل كاملاً (${data.name})` }) : false;

  if (actionsRow) {
    actionsRow.innerHTML = `
      <button class="profile-main-play-btn" style="background: ${data.accentColor}; color: #ffffff;" onclick="playAllFromSheikh('${data.id}', true)">
        <img src="images/icons/shuffle.png" style="filter: brightness(0) invert(1);" alt="Shuffle">
        <span>تشغيل الكل</span>
      </button>
      <button class="profile-icon-action-btn ${isSheikhFav ? 'active-sheikh-fav' : ''}" id="profileSheikhFavBtn" title="${isSheikhFav ? 'إزالة المصحف من المفضلة' : 'إضافة المصحف كاملاً للمفضلة'}" onclick="toggleSheikhFullFavorite('${data.id}')">
        <img src="${isSheikhFav ? 'images/icons/fav-active.png' : 'images/icons/no-fav1.png'}" style="width: 22px; height: 22px; ${isSheikhFav ? '' : 'filter: brightness(0) invert(1);'}" alt="Fav">
      </button>
      <button class="profile-icon-action-btn" title="${data.type === 'reciter' ? 'تنزيل المصحف كاملاً' : 'تنزيل كافة الابتهالات'}" onclick="downloadAllFromSheikh('${data.id}')">
        <img src="images/icons/download.png" alt="Download">
      </button>
      <button class="profile-icon-action-btn" title="مشاركة" onclick="window.shareApp()">
        <img src="images/icons/share.png" alt="Share">
      </button>
    `;
  }

  // 3. Live Analytics Dashboard & Rhythm Infographic
  const analyticsBox = document.getElementById('profileAnalyticsBox');
  const an = data.analytics || { completionRate: '٩٤٪', totalListenedHours: '١٨ ساعة', favoriteCount: '١٤ سورة', weeklyTrend: [40, 60, 75, 90, 80, 85, 95] };
  
  if (analyticsBox) {
    const days = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
    const barsHtml = (an.weeklyTrend || [50, 70, 80, 90, 85, 95, 100]).map((h, i) => `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height: ${h}%; background: ${data.accentColor};"></div>
        <span class="chart-day-label">${days[i]}</span>
      </div>
    `).join('');

    analyticsBox.innerHTML = `
      <div class="analytics-header">
        <span><img src="images/icons/leaf-1.png" style="width: 16px; height: 16px; vertical-align: middle;" alt="Leaf"> نشاط استماعك للشيخ ${data.shortName}</span>
        <span style="color: ${data.accentColor}; font-size: 12px; font-weight: 800;">إحصائيات</span>
      </div>
      <div class="analytics-metrics-grid">
        <div class="metric-pill">
          <span class="m-val" style="color: ${data.accentColor};">${an.completionRate}</span>
          <span class="m-lbl">نسبة الاستماع</span>
        </div>
        <div class="metric-pill">
          <span class="m-val" style="color: ${data.accentColor};">${an.totalListenedHours}</span>
          <span class="m-lbl">ساعات الاستماع</span>
        </div>
        <div class="metric-pill">
          <span class="m-val" style="color: ${data.accentColor};">${an.favoriteCount}</span>
          <span class="m-lbl">المفضلة لديك</span>
        </div>
      </div>
      <div class="listening-rhythm-chart">
        ${barsHtml}
      </div>
    `;
  }

  // 4. Surah Filter Chips
  const filterChipsContainer = document.getElementById('sheikhSurahFilterChips');
  if (filterChipsContainer) {
    if (data.type === 'reciter') {
      filterChipsContainer.style.display = 'flex';
      filterChipsContainer.innerHTML = `
        <button class="surah-filter-chip active" onclick="filterSheikhSurahs('all', this, '${data.id}')">الكل (${data.surahs.length})</button>
        <button class="surah-filter-chip" onclick="filterSheikhSurahs('مكية', this, '${data.id}')">السور المكية (٨٦)</button>
        <button class="surah-filter-chip" onclick="filterSheikhSurahs('مدنية', this, '${data.id}')">السور المدنية (٢٨)</button>
        <button class="surah-filter-chip" onclick="filterSheikhSurahs('short', this, '${data.id}')">قصار السور (جزء عم)</button>
      `;
    } else {
      filterChipsContainer.style.display = 'none';
    }
  }

  // 5. Bio Card
  const bioEl = document.getElementById('profileSheikhBio');
  if (bioEl) bioEl.textContent = data.bio;

  // 6. Surahs List
  window.currentSheikhData = data;
  window.currentSheikhSurahs = data.surahs;
  renderSheikhSurahsList(data.surahs, data);
}

// Filter Sheikh Surahs by category
window.filterSheikhSurahs = (category, btn, sheikhId) => {
  document.querySelectorAll('.surah-filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (!window.currentSheikhData || !window.currentSheikhData.surahs) return;
  const all = window.currentSheikhData.surahs;

  let filtered = all;
  if (category === 'مكية' || category === 'مدنية') {
    filtered = all.filter(s => s.type === category);
  } else if (category === 'short') {
    filtered = all.filter(s => s.num >= 78);
  }

  renderSheikhSurahsList(filtered, window.currentSheikhData);
};

function renderSheikhSurahsList(surahs, sheikhData) {
  const container = document.getElementById('profileSurahList');
  if (!container) return;

  if (surahs.length === 0) {
    container.innerHTML = `<div class="empty-search-state" style="padding: 30px 0;"><p>لا توجد نتائج مطابقة لبحثك</p></div>`;
    return;
  }

  const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;

  container.innerHTML = surahs.map((s, idx) => {
    const jsonStr = JSON.stringify(s).replace(/"/g, '&quot;');
    const isThisPlaying = cur && (cur.id === s.id || cur.title === s.title) && window.wzkerAudio.isPlaying;

    return `
      <div class="track-item ${isThisPlaying ? 'playing-now' : ''}" 
           data-track-id="${s.id}" 
           data-track-title="${s.title}" 
           data-track-num="${s.num || (idx + 1)}"
           onclick="window.openTrackInFullPlayer(${jsonStr})">
        
        <div class="track-item-left">
          <div class="track-play-indicator">
            ${isThisPlaying ? `
              <div class="audio-waves-mini">
                <span></span><span></span><span></span>
              </div>
            ` : `
              <span class="track-number">${s.num || (idx + 1)}</span>
            `}
          </div>
          <div class="track-icon-img" style="border: 1.5px solid ${sheikhData.accentColor || 'var(--accent)'};">
            <img src="${s.image || sheikhData.image}" alt="${s.title}" loading="lazy">
          </div>
          <div class="track-meta">
            <h4>${s.title}</h4>
            <p>${s.type ? s.type + ' • ' : ''}${s.ayahs ? s.ayahs + ' • ' : ''}${s.duration || 'تلاوة مباركة'}</p>
          </div>
        </div>

        <div class="track-item-right" onclick="event.stopPropagation()">
          <button class="track-opt-btn" onclick="window.wzkerLib.openTrackContextMenu(${jsonStr})" title="خيارات">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" 
               style="color: ${sheikhData.accentColor || 'var(--accent)'};" 
               onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" 
               title="تشغيل / إيقاف">
            <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Card Click (Audio + Full Player) vs Play Button (Audio Only)
window.handleTrackItemClick = (sheikhId, idx, openPlayer = false) => {
  const data = window.RECITERS_DATA.find(r => r.id === sheikhId) || window.IBTIHALAT_DATA.find(m => m.id === sheikhId);
  if (!data || !data.surahs || !data.surahs[idx]) return;

  applySheikhThemeToPlayer(data);
  window.wzkerAudio.playTrack(data.surahs[idx], data.surahs, idx);

  if (openPlayer) {
    window.openFullPlayer();
  }
};

// Batch Download with Single Toast
window.downloadAllFromSheikh = (sheikhId) => {
  const data = window.RECITERS_DATA.find(r => r.id === sheikhId) || window.IBTIHALAT_DATA.find(m => m.id === sheikhId);
  if (!data || !data.surahs) return;

  if (window.wzkerLib) {
    data.surahs.forEach(s => {
      if (!window.wzkerLib.downloads.some(d => d.id === s.id)) {
        window.wzkerLib.downloads.push(s);
      }
    });
    window.wzkerLib.save('wzker_downloads', window.wzkerLib.downloads);
    window.wzkerLib.renderDownloads();
    if (window.updateSettingsStorageInfo) window.updateSettingsStorageInfo();
  }

  const label = data.type === 'reciter' ? `مصحف ${data.shortName} بالكامل` : `كافة ابتهالات ${data.shortName}`;
  window.showToast(`تم حفظ ${label} في التحميلات الأوفلاين`);
};

// Open current playing Sheikh or Mobtahil profile directly from Full Player
window.openCurrentSheikhProfile = () => {
  const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
  if (!cur) return;

  if (cur.sheikhId) {
    const isMob = window.IBTIHALAT_DATA && window.IBTIHALAT_DATA.some(m => m.id === cur.sheikhId);
    if (isMob) window.openMobtahilProfile(cur.sheikhId);
    else window.openSheikhProfile(cur.sheikhId);
    window.closeFullPlayer();
    return;
  }

  const artistName = cur.artist || cur.munshid || cur.sheikhName || '';
  if (artistName && window.RECITERS_DATA) {
    const reciter = window.RECITERS_DATA.find(r => 
      artistName.includes(r.name) || r.name.includes(artistName) || (r.shortName && artistName.includes(r.shortName))
    );
    if (reciter) {
      window.openSheikhProfile(reciter.id);
      window.closeFullPlayer();
      return;
    }
  }

  if (artistName && window.IBTIHALAT_DATA) {
    const mob = window.IBTIHALAT_DATA.find(m => 
      artistName.includes(m.name) || m.name.includes(artistName) || (m.shortName && artistName.includes(m.shortName))
    );
    if (mob) {
      window.openMobtahilProfile(mob.id);
      window.closeFullPlayer();
      return;
    }
  }

  if (window.RECITERS_DATA && window.RECITERS_DATA[0]) {
    window.openSheikhProfile(window.RECITERS_DATA[0].id);
    window.closeFullPlayer();
  }
};

// Surah Search inside Sheikh Profile
function initSheikhProfileSearch() {
  const input = document.getElementById('profileSurahSearch');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!window.currentSheikhData || !window.currentSheikhData.surahs) return;

    if (!q) {
      renderSheikhSurahsList(window.currentSheikhData.surahs, window.currentSheikhData);
      return;
    }

    const filtered = window.currentSheikhData.surahs.filter(s => 
      s.title.toLowerCase().includes(q) || (s.type && s.type.toLowerCase().includes(q))
    );
    renderSheikhSurahsList(filtered, window.currentSheikhData);
  });
}

// Toggle Full Sheikh Quran Album Folder into Favorites
window.toggleSheikhFullFavorite = (sheikhId) => {
  const data = window.RECITERS_DATA.find(r => r.id === sheikhId) || window.IBTIHALAT_DATA.find(m => m.id === sheikhId);
  if (!data || !window.wzkerLib) return;

  const folderObj = {
    id: 'sheikh_' + data.id,
    title: `المصحف المرتل كاملاً (${data.name})`,
    artist: data.name,
    sheikhName: data.name,
    sheikhId: data.id,
    image: data.image,
    isSheikhFolder: true,
    totalSurahs: (data.surahs && data.surahs.length) || 114,
    surahs: data.surahs || []
  };

  const isNowFav = window.wzkerLib.toggleFavorite(folderObj);
  const btn = document.getElementById('profileSheikhFavBtn');
  if (btn) {
    btn.innerHTML = `<img src="${isNowFav ? 'images/icons/fav-active.png' : 'images/icons/no-fav1.png'}" style="width: 22px; height: 22px; ${isNowFav ? '' : 'filter: brightness(0) invert(1);'}" alt="Fav">`;
    btn.classList.toggle('active-sheikh-fav', isNowFav);
    btn.title = isNowFav ? 'إزالة المصحف من المفضلة' : 'إضافة المصحف كاملاً للمفضلة';
  }
};

// Play All Surahs from Sheikh with dynamic Ambient Theme
window.playAllFromSheikh = (sheikhId, shuffle = false) => {
  const data = window.RECITERS_DATA.find(r => r.id === sheikhId) || window.IBTIHALAT_DATA.find(m => m.id === sheikhId);
  if (!data || !data.surahs || data.surahs.length === 0) return;

  let list = [...data.surahs];
  if (shuffle) {
    list.sort(() => Math.random() - 0.5);
    window.showToast(`تشغيل عشوائي لتسجيلات ${data.shortName} 🔀`);
  } else {
    window.showToast(`تشغيل تسجيلات ${data.shortName} ▶️`);
  }

  applySheikhThemeToPlayer(data);
  window.wzkerAudio.playTrack(list[0], list, 0);
};

function applySheikhThemeToPlayer(sheikhData) {
  const fp = document.getElementById('fullPlayer');
  if (fp && sheikhData && sheikhData.gradient) {
    fp.style.background = sheikhData.gradient;
  }
}

// Navigate from Full Player to Sheikh Profile by clicking Sheikh Name/Cover
function setupFullPlayerSheikhNavigation() {
  const artistEl = document.getElementById('fpBigArtist');
  const titleEl = document.getElementById('fpBigTitle');
  const coverEl = document.getElementById('fpCoverIcon');

  const goToSheikh = () => {
    if (window.wzkerAudio && window.wzkerAudio.currentTrack) {
      const cur = window.wzkerAudio.currentTrack;
      if (cur.isRadio) {
        window.closeFullPlayer();
        window.openRadioPlayer();
        return;
      }

      const artistName = cur.artist || cur.munshid || '';
      const sheikh = window.RECITERS_DATA.find(r => artistName.includes(r.shortName) || r.name.includes(artistName)) 
                  || window.IBTIHALAT_DATA.find(m => artistName.includes(m.shortName) || m.name.includes(artistName));

      if (sheikh) {
        window.closeFullPlayer();
        if (sheikh.type === 'reciter') window.openSheikhProfile(sheikh.id);
        else window.openMobtahilProfile(sheikh.id);
      }
    }
  };

  if (artistEl) {
    artistEl.style.cursor = 'pointer';
    artistEl.addEventListener('click', goToSheikh);
  }
  if (titleEl) {
    titleEl.style.cursor = 'pointer';
    titleEl.addEventListener('click', goToSheikh);
  }
  if (coverEl) {
    coverEl.style.cursor = 'pointer';
    coverEl.addEventListener('click', goToSheikh);
  }
}

// ==========================================================================
// 5. SMART RECOMMENDATIONS ENGINE (تلاوات مختارة لك - Spotify Pro Tier)
// ==========================================================================

let currentSmartCategory = 'for_you';

function getSmartCollections() {
  const menshawy = window.RECITERS_DATA.find(r => r.id === 'menshawy') || {};
  const basit = window.RECITERS_DATA.find(r => r.id === 'basit') || {};
  const mshary = window.RECITERS_DATA.find(r => r.id === 'mshary') || {};
  const yasser = window.RECITERS_DATA.find(r => r.id === 'yasser') || {};
  const qatami = window.RECITERS_DATA.find(r => r.id === 'qatami') || {};
  const fares = window.RECITERS_DATA.find(r => r.id === 'fares') || {};
  const islam = window.RECITERS_DATA.find(r => r.id === 'islam_sobhi') || {};
  const badr = window.RECITERS_DATA.find(r => r.id === 'badr_turki') || {};
  const maher = window.RECITERS_DATA.find(r => r.id === 'maher') || {};

  const tobar = window.IBTIHALAT_DATA.find(m => m.id === 'tobar') || {};
  const naqsh = window.IBTIHALAT_DATA.find(m => m.id === 'naqshbandi') || {};
  const omran = window.IBTIHALAT_DATA.find(m => m.id === 'omran') || {};

  return {
    for_you: {
      spotlight: {
        track: (menshawy.surahs && menshawy.surahs[17]) || {},
        sheikh: menshawy,
        badge: 'تلاوة اليوم المختارة',
        kicker: 'روائع يوم الجمعة',
        sub: 'مكية • ١١٠ آية • تلاوة كاملة'
      },
      tracks: [
        { track: (basit.surahs && basit.surahs[11]) || {}, sheikh: basit, reason: 'حنجرة السماء' },
        { track: (tobar.surahs && tobar.surahs[0]) || {}, sheikh: tobar, reason: 'نفحات الفجر' },
        { track: (mshary.surahs && mshary.surahs[35]) || {}, sheikh: mshary, reason: 'تلاوة مباركة' },
        { track: (naqsh.surahs && naqsh.surahs[0]) || {}, sheikh: naqsh, reason: 'إمام المداحين' },
        { track: (yasser.surahs && yasser.surahs[54]) || {}, sheikh: yasser, reason: 'تلاوات الحرم' },
        { track: (islam.surahs && islam.surahs[66]) || {}, sheikh: islam, reason: 'سكينة وطمأنينة' }
      ]
    },
    minshawi_top: {
      spotlight: {
        track: (menshawy.surahs && menshawy.surahs[18]) || {},
        sheikh: menshawy,
        badge: 'الدرة المكنونة',
        kicker: 'رائعة المقامات والخشوع',
        sub: 'مكية • ٩٨ آية • الصوت الباكي'
      },
      tracks: [
        { track: (menshawy.surahs && menshawy.surahs[0]) || {}, sheikh: menshawy, reason: 'الأكثر استماعاً' },
        { track: (menshawy.surahs && menshawy.surahs[17]) || {}, sheikh: menshawy, reason: 'رائعة الكهف' },
        { track: (menshawy.surahs && menshawy.surahs[18]) || {}, sheikh: menshawy, reason: 'تلاوة مريم الخاشعة' },
        { track: (menshawy.surahs && menshawy.surahs[11]) || {}, sheikh: menshawy, reason: 'قصة الصبر والجمال' },
        { track: (menshawy.surahs && menshawy.surahs[58]) || {}, sheikh: menshawy, reason: 'إعجاز التلاوة' },
        { track: (menshawy.surahs && menshawy.surahs[49]) || {}, sheikh: menshawy, reason: 'نبرة حزينة فريدة' }
      ]
    },
    fajr_ibtihalat: {
      spotlight: {
        track: (tobar.surahs && tobar.surahs[0]) || {},
        sheikh: tobar,
        badge: 'صوت الفجر الخالد',
        kicker: 'روائع الأسحار والخشوع',
        sub: 'مقام الصبا والبيات • نصر الدين طوبار'
      },
      tracks: [
        { track: (naqsh.surahs && naqsh.surahs[0]) || {}, sheikh: naqsh, reason: 'مناجاة رمضانية' },
        { track: (omran.surahs && omran.surahs[0]) || {}, sheikh: omran, reason: 'مقام الصبا الخاشع' },
        { track: (tobar.surahs && tobar.surahs[1]) || {}, sheikh: tobar, reason: 'توسل وخشوع' },
        { track: (naqsh.surahs && naqsh.surahs[1]) || {}, sheikh: naqsh, reason: 'أدعية الأسحار' },
        { track: (omran.surahs && omran.surahs[1]) || {}, sheikh: omran, reason: 'تسجيل نادر 1993' },
        { track: (tobar.surahs && tobar.surahs[2]) || {}, sheikh: tobar, reason: 'توبة واستغفار' }
      ]
    },
    haram_reciters: {
      spotlight: {
        track: (yasser.surahs && yasser.surahs[54]) || {},
        sheikh: yasser,
        badge: 'روائع المسجد الحرام',
        kicker: 'تلاوات الحرم المكي الشريف',
        sub: 'مدنية • ٧٨ آية • نبرة حجازية آسرة'
      },
      tracks: [
        { track: (maher.surahs && maher.surahs[11]) || {}, sheikh: maher, reason: 'إمام الحرم المكي' },
        { track: (qatami.surahs && qatami.surahs[66]) || {}, sheikh: qatami, reason: 'تلاوة خاشعة وآسرة' },
        { track: (badr.surahs && badr.surahs[52]) || {}, sheikh: badr, reason: 'حسن الأداء والتأني' },
        { track: (yasser.surahs && yasser.surahs[0]) || {}, sheikh: yasser, reason: 'تلاوة حجازية عذبة' },
        { track: (maher.surahs && maher.surahs[17]) || {}, sheikh: maher, reason: 'نبرة رخيمة متوازنة' },
        { track: (qatami.surahs && qatami.surahs[55]) || {}, sheikh: qatami, reason: 'سكينة المساء' }
      ]
    },
    peace_calm: {
      spotlight: {
        track: (islam.surahs && islam.surahs[66]) || {},
        sheikh: islam,
        badge: 'راحة الأعصاب والسكينة',
        kicker: 'تلاوات هادئة تريح القلوب',
        sub: 'مكية • ٣٠ آية • إسلام صبحي'
      },
      tracks: [
        { track: (fares.surahs && fares.surahs[18]) || {}, sheikh: fares, reason: 'نبرة يمانية عذبة' },
        { track: (mshary.surahs && mshary.surahs[35]) || {}, sheikh: mshary, reason: 'تلاوة انسيابية هادئة' },
        { track: (islam.surahs && islam.surahs[55]) || {}, sheikh: islam, reason: 'طمأنينة القلوب' },
        { track: (fares.surahs && fares.surahs[19]) || {}, sheikh: fares, reason: 'روائع التلاوة الهادئة' },
        { track: (mshary.surahs && mshary.surahs[54]) || {}, sheikh: mshary, reason: 'عروس القرآن' },
        { track: (islam.surahs && islam.surahs[75]) || {}, sheikh: islam, reason: 'خشوع فائق الجمال' }
      ]
    }
  };
}

window.filterSmartTracks = (category, btnEl) => {
  currentSmartCategory = category;
  document.querySelectorAll('#smartFilterPills .smart-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderSmartRecitations(category);
};

window.refreshSmartRecommendations = (animate = false) => {
  const btn = document.querySelector('.smart-refresh-btn');
  if (btn && animate) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 600);
  }
  renderSmartRecitations(currentSmartCategory);
  if (animate && window.showToast) {
    window.showToast('تم تجديد وتحديث الاقتراحات الذكية');
  }
};

function renderSmartRecitations(category = 'for_you') {
  const spotlightContainer = document.getElementById('smartSpotlightCard');
  const gridContainer = document.getElementById('mainTrackList');
  const collections = getSmartCollections();
  const selected = collections[category] || collections.for_you;

  if (!spotlightContainer || !gridContainer) return;

  // 1. Render Hero Spotlight Card
  const sp = selected.spotlight;
  if (sp && sp.track && sp.track.url) {
    const playlistForSp = [sp.track, ...selected.tracks.map(i => i.track)];
    spotlightContainer.innerHTML = `
      <div class="smart-hero-spotlight" style="--spotlight-accent: ${sp.sheikh.accentColor || '#D6AD60'};" onclick="window.wzkerAudio.playTrack(window.wzkerAudio.smartSpotlightTrack, window.wzkerAudio.smartPlaylist, 0); window.openFullPlayer();">
        <div class="spotlight-art-wrap">
          <img src="${sp.sheikh.image || sp.track.image}" alt="${sp.track.title}" loading="lazy">
          <span class="spotlight-tag-badge">${sp.badge}</span>
          <div class="spotlight-play-overlay">
            <div class="spot-play-btn" onclick="event.stopPropagation(); window.wzkerAudio.playTrack(window.wzkerAudio.smartSpotlightTrack, window.wzkerAudio.smartPlaylist, 0);">
              <img src="images/icons/play.png" alt="Play">
            </div>
          </div>
        </div>
        <div class="spotlight-meta-info">
          <div class="spotlight-kicker">
            <img src="images/icons/leaf-1.png" alt="Icon">
            <span>${sp.kicker}</span>
          </div>
          <h3 class="spotlight-title">${sp.track.title}</h3>
          <div class="spotlight-sheikh" onclick="event.stopPropagation(); ${sp.sheikh.type === 'reciter' ? `openSheikhProfile('${sp.sheikh.id}')` : `openMobtahilProfile('${sp.sheikh.id}')`}">
            <span>${sp.sheikh.name}</span>
            <img src="${sp.sheikh.verifiedIcon}" alt="V">
          </div>
          <div class="spotlight-pills-row">
            <span class="spot-sub-pill">${sp.sub}</span>
          </div>
        </div>
      </div>
    `;
    window.wzkerAudio.smartSpotlightTrack = sp.track;
    window.wzkerAudio.smartPlaylist = playlistForSp;
  } else {
    spotlightContainer.innerHTML = '';
  }

  // 2. Render Smart Tracks Grid
  const validItems = selected.tracks.filter(i => i.track && i.track.url);
  const fullPlaylist = validItems.map(i => i.track);
  window.currentSmartGridPlaylist = fullPlaylist;

  gridContainer.innerHTML = validItems.map((item, idx) => {
    const t = item.track;
    const s = item.sheikh;
    return `
      <div class="smart-track-card" style="--card-accent: ${s.accentColor || '#D6AD60'};" onclick="handleSmartCardClick(${idx}, true)">
        <div class="st-cover-box">
          <img src="${s.image || t.image}" alt="${t.title}" loading="lazy">
          <div class="st-cover-gradient"></div>
          <span class="st-tag-ribbon">${t.type || 'تلاوة مباركة'}</span>
          <span class="st-reason-pill">${item.reason}</span>
          <div class="st-play-bubble" onclick="event.stopPropagation(); handleSmartCardClick(${idx}, false);">
            <img src="images/icons/play.png" alt="Play">
          </div>
        </div>
        <div class="st-body-content">
          <h4 class="st-title">${t.title}</h4>
          <div class="st-sheikh" onclick="event.stopPropagation(); ${s.type === 'reciter' ? `openSheikhProfile('${s.id}')` : `openMobtahilProfile('${s.id}')`}">
            <span>${s.shortName || s.name}</span>
            <img src="${s.verifiedIcon}" alt="V">
          </div>
          <div class="st-footer-row">
            <span class="st-duration-badge">${t.ayahs || t.duration || 'تلاوة كاملة'}</span>
            <button class="st-menu-btn" onclick="event.stopPropagation(); window.wzkerLib.openTrackContextMenu(window.currentSmartGridPlaylist[${idx}])">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleSmartCardClick = (idx, openPlayer = false) => {
  if (!window.currentSmartGridPlaylist || !window.currentSmartGridPlaylist[idx]) return;
  const track = window.currentSmartGridPlaylist[idx];
  
  // Find sheikh data to apply signature styling
  const artistName = track.artist || track.munshid || '';
  const sheikh = window.RECITERS_DATA.find(r => artistName.includes(r.shortName) || r.name.includes(artistName)) 
              || window.IBTIHALAT_DATA.find(m => artistName.includes(m.shortName) || m.name.includes(artistName));
              
  if (sheikh) applySheikhThemeToPlayer(sheikh);
  window.wzkerAudio.playTrack(track, window.currentSmartGridPlaylist, idx);

  if (openPlayer) {
    window.openFullPlayer();
  }
};

// Sub-page all reciters/mobtahileen
window.openAllRecitersPage = () => {
  const grid = document.getElementById('allRecitersGrid');
  if (grid && window.RECITERS_DATA) {
    grid.innerHTML = window.RECITERS_DATA.map(rec => `
      <div class="reciter-card-pro" style="flex: 0 0 155px; --card-accent: ${rec.accentColor};" onclick="openSheikhProfile('${rec.id}')">
        <div class="reciter-img-wrapper-pro" style="border-color: ${rec.accentColor};">
          <img src="${rec.image}" alt="${rec.shortName}" class="reciter-img-pro">
        </div>
        <div class="reciter-info-pro">
          <div class="reciter-title-pro">${rec.shortName} <img src="${rec.verifiedIcon}" alt="V"></div>
          <div class="reciter-subtitle-pro">${rec.tags[0]}</div>
          <span class="reciter-tag-pill">${rec.surahCount}</span>
        </div>
      </div>
    `).join('');
  }
  window.openLibPage('allRecitersPage');
};

window.openAllMobtahileenPage = () => {
  const grid = document.getElementById('allMobtahileenGrid');
  if (grid && window.IBTIHALAT_DATA) {
    grid.innerHTML = window.IBTIHALAT_DATA.map(mob => `
      <div class="reciter-card-pro" style="flex: 0 0 155px; --card-accent: ${mob.accentColor};" onclick="openMobtahilProfile('${mob.id}')">
        <div class="reciter-img-wrapper-pro" style="border-color: ${mob.accentColor};">
          <img src="${mob.image}" alt="${mob.shortName}" class="reciter-img-pro">
        </div>
        <div class="reciter-info-pro">
          <div class="reciter-title-pro">${mob.shortName} <img src="${mob.verifiedIcon}" alt="V"></div>
          <div class="reciter-subtitle-pro">${mob.tags[0]}</div>
        </div>
      </div>
    `).join('');
  }
  window.openLibPage('allMobtahileenPage');
};

window.switchTab = (viewId, navEl) => {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
