/**
 * Wzker Advanced Search & Explorer Engine (Production Grade)
 * Multi-Category Deep Search across 1000+ Tracks, 9 Grand Reciters, 3 Mobtahileen & Live Radio
 * Robust Arabic Normalization, Precise Title Matching, and Full 3-Dots Context Menu Actions
 */

let currentSearchCategory = 'all';
let searchDebounceTimer = null;

// Normalize Arabic text for seamless search (ignoring tashkeel, hamza variations, taa marbouta)
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Harakat / Tashkeel
    .replace(/[أإآ]/g, 'ا') // Normalize Alef
    .replace(/ى/g, 'ي') // Normalize Ya
    .replace(/ة/g, 'ه') // Normalize Taa Marbouta
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

// 1. Initialize Search Engine
function initSearchEngine() {
  const searchInput = document.getElementById('mainSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = val.trim() ? 'flex' : 'none';
      }

      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        handleSearchInput(val);
      }, 120);
    });

    searchInput.addEventListener('focus', () => {
      renderSearchHistory();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          saveSearchQuery(val);
          renderSearchHistory();
        }
      }
    });
  }

  renderSearchHistory();
}

// 2. Set Category Filter
window.setSearchCategory = (cat, btnEl) => {
  currentSearchCategory = cat;
  document.querySelectorAll('.search-category-pill').forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const searchInput = document.getElementById('mainSearchInput');
  const query = searchInput ? searchInput.value.trim() : '';
  if (query) {
    handleSearchInput(query);
  }
};

// 3. Main Search Dispatcher
function handleSearchInput(query) {
  const historyPanel = document.getElementById('searchHistoryPanel');
  const trendingPanel = document.getElementById('searchTrendingPanel');
  const resultsContainer = document.getElementById('searchResultsContainer');

  const cleanQuery = query.trim();

  if (!cleanQuery) {
    if (trendingPanel) trendingPanel.style.display = 'block';
    renderSearchHistory();
    if (resultsContainer) resultsContainer.innerHTML = '';
    return;
  }

  // Hide trending and history while actively showing search results
  if (trendingPanel) trendingPanel.style.display = 'none';
  if (historyPanel) historyPanel.style.display = 'none';

  performSearch(cleanQuery, currentSearchCategory);
}

// 4. Perform Multi-Category Deep Search
function performSearch(query, category) {
  const container = document.getElementById('searchResultsContainer');
  if (!container) return;

  const normQ = normalizeArabic(query);
  const words = normQ.split(' ').filter(w => w.length > 0);

  const isMatch = (searchableFields) => {
    if (!searchableFields || searchableFields.length === 0) return false;
    const combined = searchableFields.map(f => normalizeArabic(f || '')).join(' ');
    return words.every(word => combined.includes(word));
  };

  // Matched Buckets
  const matchedReciters = [];
  const matchedMobtahileen = [];
  const matchedSurahs = [];
  const matchedIbtihalatTracks = [];
  let matchedRadio = false;

  // 1. Search Reciters & All Their 114 Surahs
  if (category === 'all' || category === 'reciters' || category === 'surahs') {
    if (window.RECITERS_DATA) {
      window.RECITERS_DATA.forEach(rec => {
        // Match reciter identity
        if (category === 'all' || category === 'reciters') {
          if (isMatch([rec.name, rec.shortName, rec.title, rec.bio, ...(rec.tags || [])])) {
            matchedReciters.push(rec);
          }
        }

        // Match individual surahs
        if (category === 'all' || category === 'surahs') {
          if (rec.surahs && Array.isArray(rec.surahs)) {
            rec.surahs.forEach(s => {
              const surahTitle = s.title || (s.name ? (s.name.startsWith('سورة') ? s.name : `سورة ${s.name}`) : `سورة ${s.num}`);
              const rawName = surahTitle.replace('سورة', '').trim();
              
              if (isMatch([surahTitle, rawName, s.type, s.ayahs, rec.shortName, rec.name])) {
                matchedSurahs.push({
                  id: s.id || `rec_${rec.id}_${s.num}`,
                  num: s.num,
                  title: surahTitle,
                  type: s.type || 'مكية',
                  ayahs: s.ayahs || 'تلاوة مباركة',
                  duration: s.duration || 'تلاوة كاملة',
                  url: s.url || s.audio,
                  audioUrl: s.url || s.audio,
                  artist: rec.shortName || rec.name,
                  sheikhId: rec.id,
                  sheikhName: rec.shortName,
                  sheikhFullName: rec.name,
                  sheikhAvatar: rec.image,
                  image: rec.image,
                  accentColor: rec.accentColor
                });
              }
            });
          }
        }
      });
    }
  }

  // 2. Search Mobtahileen & Their Tracks
  if (category === 'all' || category === 'ibtehal' || category === 'reciters') {
    if (window.IBTIHALAT_DATA) {
      window.IBTIHALAT_DATA.forEach(mob => {
        if (category === 'all' || category === 'reciters' || category === 'ibtehal') {
          if (isMatch([mob.name, mob.shortName, mob.title, mob.bio, ...(mob.tags || [])])) {
            matchedMobtahileen.push(mob);
          }
        }

        if (category === 'all' || category === 'ibtehal') {
          if (mob.surahs && Array.isArray(mob.surahs)) {
            mob.surahs.forEach(t => {
              const trackTitle = t.title || t.name || 'ابتهال مبارك';
              if (isMatch([trackTitle, t.type, t.ayahs, mob.shortName, mob.name])) {
                matchedIbtihalatTracks.push({
                  id: t.id || `mob_${mob.id}_${t.num}`,
                  num: t.num,
                  title: trackTitle,
                  type: t.type || 'ابتهال خاشع',
                  ayahs: t.ayahs || 'تسجيل نادر',
                  duration: t.duration || 'تلاوة مباركة',
                  url: t.url || t.audio,
                  audioUrl: t.url || t.audio,
                  artist: mob.shortName || mob.name,
                  munshid: mob.shortName || mob.name,
                  sheikhId: mob.id,
                  sheikhName: mob.shortName,
                  sheikhFullName: mob.name,
                  sheikhAvatar: mob.image,
                  image: mob.image,
                  accentColor: mob.accentColor
                });
              }
            });
          }
        }
      });
    }
  }

  // 3. Search Radio
  if (category === 'all' || category === 'radio') {
    if (isMatch(['إذاعة القرآن الكريم', 'الراديو', 'بث مباشر', 'القاهرة', 'إذاعة', 'إذاعة القاهرة'])) {
      matchedRadio = true;
    }
  }

  const totalMatches = matchedReciters.length + matchedMobtahileen.length + matchedSurahs.length + matchedIbtihalatTracks.length + (matchedRadio ? 1 : 0);

  if (totalMatches === 0) {
    renderNoResultsState(container, query);
    return;
  }

  // Render Organized Categorized Results
  let html = '';

  // 1. Reciters & Mobtahileen Horizontal Strip
  if (matchedReciters.length > 0 || matchedMobtahileen.length > 0) {
    html += `
      <div class="search-result-group">
        <div class="search-group-header">
          <div class="search-group-title">
            <i class="fa-solid fa-users" style="font-size: 13px; color: var(--accent);"></i>
            <span>القراء والمبتهلون</span>
          </div>
          <span class="search-group-count">${matchedReciters.length + matchedMobtahileen.length} نتائج</span>
        </div>
        <div class="search-sheikh-cards-scroll">
          ${matchedReciters.map(rec => `
            <div class="search-sheikh-card" onclick="openSheikhProfile('${rec.id}')">
              <div class="search-sheikh-avatar" style="border-color: ${rec.accentColor};">
                <img src="${rec.image}" alt="${rec.shortName}" loading="lazy">
              </div>
              <div class="search-sheikh-name">${rec.shortName}</div>
              <div class="search-sheikh-role">المصحف المرتل (١١٤)</div>
            </div>
          `).join('')}
          ${matchedMobtahileen.map(mob => `
            <div class="search-sheikh-card" onclick="openSheikhProfile('${mob.id}')">
              <div class="search-sheikh-avatar" style="border-color: ${mob.accentColor};">
                <img src="${mob.image}" alt="${mob.shortName}" loading="lazy">
              </div>
              <div class="search-sheikh-name">${mob.shortName}</div>
              <div class="search-sheikh-role">أئمة الابتهال والمدائح</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 2. Cairo Radio Result (if matched)
  if (matchedRadio) {
    html += `
      <div class="search-result-group">
        <div class="search-group-header">
          <div class="search-group-title">
            <i class="fa-solid fa-radio" style="font-size: 13px; color: var(--accent);"></i>
            <span>البث الإذاعي المباشر</span>
          </div>
        </div>
        <div class="track-item" onclick="openRadioPlayer()">
          <div class="track-item-left">
            <div class="track-icon-img" style="background: var(--primary);">
              <img src="images/icons/radio.png" style="padding: 8px; object-fit: contain;" alt="Radio">
            </div>
            <div class="track-meta">
              <h4>إذاعة القرآن الكريم من القاهرة</h4>
              <p>بث إذاعي مباشر ٢٤ ساعة على مدار اليوم بجودة HD</p>
            </div>
          </div>
          <div class="track-item-right">
            <button class="track-opt-btn" onclick="event.stopPropagation(); window.wzkerLib && window.wzkerLib.openTrackContextMenu({ title: 'إذاعة القرآن الكريم', artist: 'بث مباشر من القاهرة', image: 'images/icons/radio.png', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv' })" title="خيارات">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div class="track-play-badge" onclick="event.stopPropagation(); toggleRadioPlay();">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Quran Surahs Results List (with 3-dots before play button)
  if (matchedSurahs.length > 0) {
    window.currentSearchResultsSurahs = matchedSurahs;
    const displaySurahs = matchedSurahs.slice(0, 50);
    html += `
      <div class="search-result-group">
        <div class="search-group-header">
          <div class="search-group-title">
            <i class="fa-solid fa-book-quran" style="font-size: 13px; color: var(--accent);"></i>
            <span>السور والتلاوات (${matchedSurahs.length})</span>
          </div>
          ${matchedSurahs.length > 50 ? '<span class="search-group-count">عرض أفضل ٥٠ نتيجة</span>' : ''}
        </div>
        <div class="track-list">
          ${displaySurahs.map((s, idx) => {
            const jsonStr = JSON.stringify(s).replace(/"/g, '&quot;');
            const cur = window.wzkerAudio ? window.wzkerAudio.currentTrack : null;
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
                      <span class="track-number">${s.num}</span>
                    `}
                  </div>
                  <div class="track-icon-img" style="border: 1.5px solid ${s.accentColor};">
                    <img src="${s.sheikhAvatar}" alt="${s.sheikhName}" loading="lazy">
                  </div>
                  <div class="track-meta">
                    <h4>${s.title}</h4>
                    <p>${s.sheikhName} • ${s.type} • ${s.ayahs}</p>
                  </div>
                </div>

                <div class="track-item-right" onclick="event.stopPropagation()">

                  <div class="track-play-badge ${isThisPlaying ? 'is-playing' : ''}" onclick="window.toggleInlineTrackPlay(event, ${jsonStr})" title="تشغيل / إيقاف">
                    <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
                  </div>
                  <button class="track-opt-btn" onclick="openSearchContextMenu('surah', ${idx})" title="خيارات">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 4. Ibtihalat Tracks Results List (with 3-dots before play button)
  if (matchedIbtihalatTracks.length > 0) {
    window.currentSearchResultsIbtihalat = matchedIbtihalatTracks;
    html += `
      <div class="search-result-group">
        <div class="search-group-header">
          <div class="search-group-title">
            <i class="fa-solid fa-microphone-lines" style="font-size: 13px; color: var(--accent);"></i>
            <span>الابتهالات والمدائح (${matchedIbtihalatTracks.length})</span>
          </div>
        </div>
        <div class="track-list">
          ${matchedIbtihalatTracks.map((t, idx) => {
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
                  <div class="track-icon-img" style="border: 1.5px solid ${t.accentColor};">
                    <img src="${t.sheikhAvatar}" alt="${t.sheikhName}" loading="lazy">
                  </div>
                  <div class="track-meta">
                    <h4>${t.title}</h4>
                    <p>${t.sheikhName} • ${t.type || 'ابتهال خاشع'}</p>
                  </div>
                </div>

                <div class="track-item-right" onclick="event.stopPropagation()">
                  <button class="track-opt-btn" onclick="openSearchContextMenu('ibtehal', ${idx})" title="خيارات">
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
  }

  container.innerHTML = html;
}

// 5. Play Selected Track Item from Search
window.playSearchedTrackItem = (type, idx) => {
  let list = type === 'surah' ? window.currentSearchResultsSurahs : window.currentSearchResultsIbtihalat;
  if (!list || !list[idx]) return;

  const raw = list[idx];
  const trackObj = {
    id: raw.id,
    title: raw.title,
    subtitle: raw.artist || raw.sheikhName,
    artist: raw.artist || raw.sheikhName,
    sheikhName: raw.sheikhName,
    audioUrl: raw.url || raw.audioUrl,
    url: raw.url || raw.audioUrl,
    coverUrl: raw.sheikhAvatar || raw.image,
    image: raw.sheikhAvatar || raw.image,
    isLiveRadio: false
  };

  if (window.WzkerAudioEngine) {
    const formattedPlaylist = list.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.artist || item.sheikhName,
      artist: item.artist || item.sheikhName,
      sheikhName: item.sheikhName,
      audioUrl: item.url || item.audioUrl,
      url: item.url || item.audioUrl,
      coverUrl: item.sheikhAvatar || item.image,
      image: item.sheikhAvatar || item.image,
      isLiveRadio: false
    }));

    window.WzkerAudioEngine.loadAndPlay(trackObj, formattedPlaylist, idx);
  }

  // Save successful query to history
  const searchInput = document.getElementById('mainSearchInput');
  if (searchInput && searchInput.value.trim()) {
    saveSearchQuery(searchInput.value.trim());
  }
};

// 6. Open 3-Dots Context Menu from Search Result
window.openSearchContextMenu = (type, idx) => {
  let list = type === 'surah' ? window.currentSearchResultsSurahs : window.currentSearchResultsIbtihalat;
  if (!list || !list[idx]) return;

  const raw = list[idx];
  const trackObj = {
    id: raw.id,
    title: raw.title,
    artist: raw.artist || raw.sheikhName,
    munshid: raw.munshid || raw.artist || raw.sheikhName,
    url: raw.url || raw.audioUrl,
    audioUrl: raw.url || raw.audioUrl,
    image: raw.sheikhAvatar || raw.image,
    coverUrl: raw.sheikhAvatar || raw.image
  };

  if (window.wzkerLib) {
    window.wzkerLib.openTrackContextMenu(trackObj);
  }
};

// 7. Custom Empty State: No Results Found
function renderNoResultsState(container, query) {
  const safeQuery = query.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  container.innerHTML = `
    <div class="no-search-results-box">
      <div class="no-res-artwork-wrap">
        <img src="images/icons/no-results.png" class="no-res-img" alt="No Results">
      </div>
      <h3 class="no-res-title">لم يتم العثور على نتائج لـ <span class="highlight-query">"${safeQuery}"</span></h3>
      <p class="no-res-subtitle">تأكد من كتابة اسم السورة أو القارئ بشكل صحيح، أو جرب تصفية الأقسام أو الاستكشاف من المقترحات الرائجة</p>
      <div class="no-res-actions">
        <button class="return-home-btn" onclick="goToHomeFromSearch()">
          <img src="images/icons/home.png" alt="Home">
          <span>العودة إلى الرئيسية</span>
        </button>
        <button class="try-trending-btn" onclick="clearMainSearchInput(); document.getElementById('mainSearchInput').focus();">
          <i class="fa-solid fa-arrows-rotate"></i>
          <span>تفريغ البحث</span>
        </button>
      </div>
    </div>
  `;
}

// 8. Go to Home From Search
window.goToHomeFromSearch = () => {
  window.clearMainSearchInput();
  const homeTabBtn = document.querySelector('.nav-item[data-tab="homeView"]') || document.querySelectorAll('.nav-item')[0];
  if (window.switchTab) {
    window.switchTab('homeView', homeTabBtn);
  }
};

// 9. Search History Management (Dismissable with Individual X)
const SEARCH_HISTORY_KEY = 'wzker_recent_searches';

function getSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveSearchQuery(q) {
  if (!q || !q.trim()) return;
  const clean = q.trim();
  let history = getSearchHistory().filter(item => item !== clean);
  history.unshift(clean);
  if (history.length > 8) history = history.slice(0, 8);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}
}

function renderSearchHistory() {
  const panel = document.getElementById('searchHistoryPanel');
  const tagsContainer = document.getElementById('searchHistoryTags');
  const searchInput = document.getElementById('mainSearchInput');

  if (!panel || !tagsContainer) return;

  const history = getSearchHistory();
  const isInputEmpty = !searchInput || !searchInput.value.trim();

  if (history.length === 0 || !isInputEmpty) {
    panel.classList.remove('active');
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  panel.classList.add('active');

  tagsContainer.innerHTML = history.map((item, idx) => `
    <div class="sh-tag-item" onclick="applySearchQuery('${item.replace(/'/g, "\\'")}')">
      <span>${item}</span>
      <button type="button" class="sh-tag-del-btn" onclick="deleteSingleSearchHistoryItem(${idx}, event)" title="حذف">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join('');
}

window.deleteSingleSearchHistoryItem = (idx, event) => {
  if (event) event.stopPropagation();
  let history = getSearchHistory();
  if (idx >= 0 && idx < history.length) {
    history.splice(idx, 1);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
    renderSearchHistory();
  }
};

window.clearAllSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (e) {}
  renderSearchHistory();
  if (window.showToast) {
    window.showToast('تم مسح سجل البحث بالكامل');
  }
};

// 10. Apply Trending or History Query
window.applySearchQuery = (q) => {
  const input = document.getElementById('mainSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (input) {
    input.value = q;
    if (clearBtn) clearBtn.style.display = 'flex';
    input.focus();
    saveSearchQuery(q);
    handleSearchInput(q);
  }
};

// 11. Clear Search Input
window.clearMainSearchInput = () => {
  const input = document.getElementById('mainSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const trendingPanel = document.getElementById('searchTrendingPanel');
  const resultsContainer = document.getElementById('searchResultsContainer');

  if (input) input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  if (trendingPanel) trendingPanel.style.display = 'block';
  if (resultsContainer) resultsContainer.innerHTML = '';
  renderSearchHistory();
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initSearchEngine();
});
