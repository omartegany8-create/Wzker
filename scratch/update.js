const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, '..', 'js', 'quran.js');
let code = fs.readFileSync(quranPath, 'utf8');

// 1. Load bounds
const bounds = fs.readFileSync(path.join(__dirname, 'pages.json'), 'utf8');
const boundsCode = '// 3. EXACT 604 MUSHAF PAGE BOUNDARIES [surahNum, ayahNum]\nconst QURAN_PAGE_BOUNDS = ' + bounds + ';\n\n';

if (!code.includes('QURAN_PAGE_BOUNDS')) {
    code = code.replace('class WzkerQuranManager {', boundsCode + 'class WzkerQuranManager {');
}

// 2. Update constructor
code = code.replace('this.bookmarks = this.loadBookmarks();', 
`this.bookmark = this.loadSingleBookmark();
        this.pendingBookmark = null;
        this.searchCache = new Map();
        this.searchAbortController = null;`);

// 3. Add getPageByAyah right after toArabicDigits if not already there
if (!code.includes('getPageByAyah(')) {
    const getPageByAyahCode = `    getPageByAyah(surahNum, ayahNum) {
        const s = parseInt(surahNum, 10);
        const a = parseInt(ayahNum, 10);
        for (let p = QURAN_PAGE_BOUNDS.length; p >= 1; p--) {
            const [refS, refA] = QURAN_PAGE_BOUNDS[p - 1];
            if (refS < s || (refS === s && refA <= a)) {
                return p;
            }
        }
        return 1;
    }
`;
    code = code.replace(/(toArabicDigits\(num\) \{[\s\S]*?return String\(num\)\.replace\(\/\[0-9\]\/g, d => ar\[\+d\]\);\n    \})/, '$1\n\n' + getPageByAyahCode);
}

// 4. Replace loadBookmarks, saveBookmarks, etc. with Single Bookmark logic
const oldBookmarksBlock = `    loadBookmarks() {
        try {
            const saved = localStorage.getItem('wzker_quran_bookmarks');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return [];
    }

    saveBookmarks() {
        try {
            localStorage.setItem('wzker_quran_bookmarks', JSON.stringify(this.bookmarks));
        } catch (e) {}
        this.renderBookmarksList();
        this.updateNavBookmarkIndicator();
        this.updateRibbonBookmarkUI();
    }

    updateNavBookmarkIndicator() {
        const btn = document.getElementById('quranNavBookmarkBtn');
        if (btn) {
            btn.style.display = this.bookmarks.length > 0 ? 'inline-flex' : 'none';
        }
    }

    updateRibbonBookmarkUI() {
        const ribbon = document.getElementById('readerRibbonBookmark');
        const goBtn = document.getElementById('readerGoBookmarkBtn');
        const setBtn = document.getElementById('readerSetBookmarkBtn');
        const isMarked = this.bookmarks.some(b => b.page === this.currentPage);

        if (ribbon) {
            if (isMarked) ribbon.classList.add('active');
            else ribbon.classList.remove('active');
        }

        if (setBtn) {
            const span = setBtn.querySelector('span');
            if (span) {
                span.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ علامة';
            }
            if (isMarked) {
                setBtn.style.background = 'rgba(217, 119, 6, 0.2)';
                setBtn.style.color = '#d97706';
            } else {
                setBtn.style.background = '';
                setBtn.style.color = '';
            }
        }

        if (goBtn) {
            goBtn.style.display = this.bookmarks.length > 0 ? 'inline-flex' : 'none';
        }
    }

    goToLastBookmark() {
        if (this.bookmarks.length === 0) {
            if (window.showToast) window.showToast('لا توجد علامة مرجعية محفوظة بعد');
            return;
        }
        const last = this.bookmarks[this.bookmarks.length - 1];
        if (last.page) {
            this.renderPage(last.page, last.ayahNum || 1);
        } else {
            this.openSurah(last.surahNum, last.ayahNum || 1);
        }
        if (window.showToast) window.showToast(\`تم الانتقال للعلامة: \${last.surahName ? 'سورة ' + last.surahName : 'صفحة ' + this.toArabicDigits(last.page)}\`);
    }`;

const newSingleBookmarkBlock = `    loadSingleBookmark() {
        try {
            const saved = localStorage.getItem('wzker_quran_single_bookmark');
            if (saved) return JSON.parse(saved);
            const oldList = localStorage.getItem('wzker_quran_bookmarks');
            if (oldList) {
                const parsed = JSON.parse(oldList);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const first = parsed[parsed.length - 1];
                    this.saveSingleBookmark(first);
                    return first;
                }
            }
        } catch (e) {}
        return null;
    }

    saveSingleBookmark(bm = null) {
        if (bm !== undefined) this.bookmark = bm;
        try {
            if (this.bookmark) {
                localStorage.setItem('wzker_quran_single_bookmark', JSON.stringify(this.bookmark));
            } else {
                localStorage.removeItem('wzker_quran_single_bookmark');
            }
        } catch (e) {}
        this.renderBookmarksList();
        this.updateNavBookmarkIndicator();
        this.updateRibbonBookmarkUI();
    }

    updateNavBookmarkIndicator() {
        const btn = document.getElementById('quranNavBookmarkBtn');
        if (btn) {
            btn.style.display = this.bookmark ? 'inline-flex' : 'none';
        }
    }

    updateRibbonBookmarkUI() {
        const ribbon = document.getElementById('readerRibbonBookmark');
        const goBtn = document.getElementById('readerGoBookmarkBtn');
        const setBtn = document.getElementById('readerSetBookmarkBtn');
        const isMarked = this.bookmark && this.bookmark.page === this.currentPage;

        if (ribbon) {
            ribbon.classList.toggle('active', !!isMarked);
        }

        if (setBtn) {
            const span = setBtn.querySelector('span');
            if (span) {
                span.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ علامة';
            }
            if (isMarked) {
                setBtn.style.background = 'rgba(217, 119, 6, 0.2)';
                setBtn.style.color = '#d97706';
            } else {
                setBtn.style.background = '';
                setBtn.style.color = '';
            }
        }

        if (goBtn) {
            goBtn.style.display = this.bookmark ? 'inline-flex' : 'none';
        }
    }

    goToLastBookmark() {
        if (!this.bookmark) {
            if (window.showToast) window.showToast('لا توجد علامة مرجعية محفوظة بعد');
            return;
        }
        this.openAyahInReader(this.bookmark.surahNum, this.bookmark.ayahNum || 1);
        if (window.showToast) window.showToast(\`الانتقال إلى الفاصلة: سورة \${this.bookmark.surahName} - صفحة \${this.toArabicDigits(this.bookmark.page)}\`);
    }

    confirmBookmarkMove() {
        const modal = document.getElementById('bookmarkConfirmModal');
        if (modal) modal.classList.remove('active');

        if (this.pendingBookmark) {
            this.bookmark = this.pendingBookmark;
            this.pendingBookmark = null;
            this.saveSingleBookmark(this.bookmark);
            if (window.showToast) window.showToast(\`تم نقل فاصلة المصحف إلى صفحة \${this.toArabicDigits(this.bookmark.page)}\`);
        }
    }

    cancelBookmarkMove() {
        const modal = document.getElementById('bookmarkConfirmModal');
        if (modal) modal.classList.remove('active');
        this.pendingBookmark = null;
    }

    removeSingleBookmark() {
        this.bookmark = null;
        this.saveSingleBookmark(null);
        if (window.showToast) window.showToast('تمت إزالة فاصلة المصحف');
    }`;

code = code.replace(oldBookmarksBlock, newSingleBookmarkBlock);

// 5. Replace renderBookmarksList and removeBookmark
const oldRenderBookmarksBlock = `    // ── Bookmarks Rendering ──
    renderBookmarksList() {
        const emptyBox = document.getElementById('quranBookmarksEmpty');
        const listEl = document.getElementById('quranBookmarksList');
        const countBadge = document.getElementById('quranBookmarksCount');

        if (countBadge) countBadge.textContent = this.bookmarks.length;

        if (!listEl || !emptyBox) return;

        if (this.bookmarks.length === 0) {
            emptyBox.style.display = 'flex';
            listEl.style.display = 'none';
            listEl.innerHTML = '';
            return;
        }

        emptyBox.style.display = 'none';
        listEl.style.display = 'flex';

        listEl.innerHTML = this.bookmarks.map(b => \`
            <div class="bookmark-item-card" onclick="window.wzkerQuran.openSurah(\${b.surahNum}, \${b.ayahNum})">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="surah-num-badge" style="background: rgba(217, 119, 6, 0.15); color: #d97706;">
                        <i class="fa-solid fa-bookmark"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0 0 3px 0;">سورة \${b.surahName} - الآية \${this.toArabicDigits(b.ayahNum)}</h4>
                        <p style="font-size: 12.5px; color: var(--text-muted); margin: 0;">صفحة \${this.toArabicDigits(b.page || 1)} • \${b.snippet || 'فاصلة مرجعية'}</p>
                    </div>
                </div>
                <button class="reader-ctrl-btn" title="حذف الفاصلة" onclick="event.stopPropagation(); window.wzkerQuran.removeBookmark(\${b.id})">
                    <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i>
                </button>
            </div>
        \`).join('');
    }

    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.saveBookmarks();
        if (window.showToast) window.showToast('تمت إزالة الفاصلة المرجعية');
    }`;

const newRenderBookmarksBlock = `    // ── Single Bookmark Rendering ──
    renderBookmarksList() {
        const emptyBox = document.getElementById('quranBookmarksEmpty');
        const listEl = document.getElementById('quranBookmarksList');
        const countBadge = document.getElementById('quranBookmarksCount');

        const hasBookmark = !!this.bookmark;
        if (countBadge) countBadge.textContent = hasBookmark ? '١' : '٠';

        if (!listEl || !emptyBox) return;

        if (!hasBookmark) {
            emptyBox.style.display = 'flex';
            listEl.style.display = 'none';
            listEl.innerHTML = '';
            return;
        }

        emptyBox.style.display = 'none';
        listEl.style.display = 'flex';

        const b = this.bookmark;
        listEl.innerHTML = \`
            <div class="bookmark-item-card" onclick="window.wzkerQuran.openAyahInReader(\${b.surahNum}, \${b.ayahNum || 1})">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="surah-num-badge" style="background: rgba(217, 119, 6, 0.15); color: #d97706;">
                        <i class="fa-solid fa-bookmark"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin: 0 0 3px 0;">فاصلة المصحف الشريف</h4>
                        <p style="font-size: 12.5px; color: var(--text-muted); margin: 0;">سورة \${b.surahName} • الآية \${this.toArabicDigits(b.ayahNum || 1)} • صفحة \${this.toArabicDigits(b.page)}</p>
                    </div>
                </div>
                <button class="reader-ctrl-btn" title="حذف الفاصلة" onclick="event.stopPropagation(); window.wzkerQuran.removeSingleBookmark()">
                    <i class="fa-solid fa-trash-can" style="color: #ef4444;"></i>
                </button>
            </div>
        \`;
    }`;

code = code.replace(oldRenderBookmarksBlock, newRenderBookmarksBlock);

// 6. Add openAyahInReader right before openSurah
if (!code.includes('openAyahInReader(')) {
    const openAyahInReaderCode = `    openAyahInReader(surahNum, ayahNum = 1) {
        const sNum = parseInt(surahNum, 10);
        const aNum = parseInt(ayahNum, 10);
        const page = this.getPageByAyah(sNum, aNum);

        const overlay = document.getElementById('quranReaderOverlay');
        if (overlay) overlay.classList.add('active');

        this.renderPage(page, aNum, sNum);
    }
`;
    code = code.replace('openSurah(surahNum, targetAyah = 1) {', openAyahInReaderCode + '\n    openSurah(surahNum, targetAyah = 1) {');
}

// 7. Update renderPage signature and scroll to targetAyah / targetSurah
code = code.replace('async renderPage(pageNum, targetAyah = null) {', 'async renderPage(pageNum, targetAyah = null, targetSurah = null) {');

const oldScrollBlock = `        // Highlight & Scroll to target ayah if provided
        if (targetAyah) {
            setTimeout(() => {
                const el = document.getElementById(\`ayah_span_\${primarySurahNum}_\${targetAyah}\`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('active-reading');
                }
            }, 200);
        }`;

const newScrollBlock = `        // Highlight & Scroll to target ayah if provided
        if (targetAyah) {
            setTimeout(() => {
                let el = null;
                if (targetSurah) {
                    el = document.getElementById(\`ayah_span_\${targetSurah}_\${targetAyah}\`);
                }
                if (!el) {
                    el = document.getElementById(\`ayah_span_\${primarySurahNum}_\${targetAyah}\`) ||
                         document.querySelector(\`[id^="ayah_span_"][id$="_\${targetAyah}"]\`);
                }
                if (el) {
                    document.querySelectorAll('.reader-ayah-span').forEach(s => s.classList.remove('active-reading'));
                    el.classList.add('active-reading');
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 240);
        }`;

code = code.replace(oldScrollBlock, newScrollBlock);

// 8. Update toggleBookmarkCurrent and toggleBookmarkFromAction, and openAyahAction
code = code.replace('const isMarked = this.bookmarks.some(b => b.page === this.currentPage);', 'const isMarked = this.bookmark && this.bookmark.page === this.currentPage;');

const oldToggleBlocks = `    toggleBookmarkFromAction() {
        this.toggleBookmarkCurrent();
        const isMarked = this.bookmarks.some(b => b.page === this.currentPage);
        const bookmarkText = document.getElementById('ayahBookmarkTileText');
        const bookmarkTile = document.getElementById('ayahBookmarkTileBtn');
        if (bookmarkText) bookmarkText.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ فاصلة';
        if (bookmarkTile) bookmarkTile.classList.toggle('active', isMarked);
    }

    toggleBookmarkCurrent() {
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const ayahNum = this.selectedAyah ? this.selectedAyah.ayahNum : (this.currentAyahNum || 1);
        const p = this.currentPage || 1;

        const existingIndex = this.bookmarks.findIndex(b => b.page === p);
        if (existingIndex !== -1) {
            this.bookmarks.splice(existingIndex, 1);
            if (window.showToast) window.showToast(\`تمت إزالة الفاصلة من صفحة \${this.toArabicDigits(p)}\`);
        } else {
            this.bookmarks.push({
                id: Date.now(),
                surahNum: this.currentSurahNum,
                surahName: surah ? surah.name : '',
                ayahNum: ayahNum,
                page: p,
                snippet: \`صفحة \${this.toArabicDigits(p)} • سورة \${surah ? surah.name : ''}\`
            });
            if (window.showToast) window.showToast(\`تم وضع فاصلة المصحف في صفحة \${this.toArabicDigits(p)}\`);
        }
        this.saveBookmarks();
    }`;

const newToggleBlocks = `    toggleBookmarkFromAction() {
        this.toggleBookmarkCurrent();
        const isMarked = this.bookmark && this.bookmark.page === this.currentPage;
        const bookmarkText = document.getElementById('ayahBookmarkTileText');
        const bookmarkTile = document.getElementById('ayahBookmarkTileBtn');
        if (bookmarkText) bookmarkText.textContent = isMarked ? 'إزالة الفاصلة' : 'حفظ فاصلة';
        if (bookmarkTile) bookmarkTile.classList.toggle('active', !!isMarked);
    }

    toggleBookmarkCurrent() {
        const p = this.currentPage || 1;
        const surah = QURAN_SURAHS.find(s => s.num === this.currentSurahNum);
        const ayahNum = this.selectedAyah ? this.selectedAyah.ayahNum : (this.currentAyahNum || 1);

        // 1. Current page is already bookmarked -> Remove it directly
        if (this.bookmark && this.bookmark.page === p) {
            this.bookmark = null;
            this.saveSingleBookmark(null);
            if (window.showToast) window.showToast('تمت إزالة فاصلة المصحف');
            return;
        }

        // 2. Bookmark exists on another page -> Confirmation modal before moving!
        if (this.bookmark && this.bookmark.page !== p) {
            this.pendingBookmark = {
                surahNum: this.currentSurahNum,
                surahName: surah ? surah.name : '',
                ayahNum: ayahNum,
                page: p,
                snippet: \`صفحة \${this.toArabicDigits(p)} • سورة \${surah ? surah.name : ''}\`,
                timestamp: Date.now()
            };

            this.closeAyahAction();

            const modal = document.getElementById('bookmarkConfirmModal');
            const msg = document.getElementById('bookmarkConfirmMsg');
            if (msg) {
                msg.innerHTML = \`هل تريد وضع علامة عند هذه الصفحة؟<br><span style="font-size: 13px; color: var(--text-muted); display: inline-block; margin-top: 6px;">سيتم نقل الفاصلة من (سورة \${this.bookmark.surahName} - صفحة \${this.toArabicDigits(this.bookmark.page)}) إلى (سورة \${surah ? surah.name : ''} - صفحة \${this.toArabicDigits(p)}).</span>\`;
            }
            if (modal) modal.classList.add('active');
            return;
        }

        // 3. No bookmark exists yet -> Set directly on current page
        this.bookmark = {
            surahNum: this.currentSurahNum,
            surahName: surah ? surah.name : '',
            ayahNum: ayahNum,
            page: p,
            snippet: \`صفحة \${this.toArabicDigits(p)} • سورة \${surah ? surah.name : ''}\`,
            timestamp: Date.now()
        };
        this.saveSingleBookmark(this.bookmark);
        if (window.showToast) window.showToast(\`تم وضع فاصلة المصحف في صفحة \${this.toArabicDigits(p)}\`);
    }`;

code = code.replace(oldToggleBlocks, newToggleBlocks);

// 9. Optimize handleSearch and executeVerseSearch
code = code.replace('}, 300);', '}, 120);');

const oldExecuteVerseSearchRegex = /async executeVerseSearch\(normQ, rawQ\) \{[\s\S]*?highlightMatch\(text, query\) \{/;

const newExecuteVerseSearchAndRender = `async executeVerseSearch(normQ, rawQ) {
        const resultsBox = document.getElementById('quranVerseSearchResults');
        if (!resultsBox || this.searchQuery !== rawQ) return;

        // Check memory cache first (instant response)
        if (this.searchCache.has(normQ)) {
            this.renderSearchResults(this.searchCache.get(normQ), rawQ, false);
            return;
        }

        let matches = [];
        const seenAyahIds = new Set();

        // 1. Search locally in cached pages in localStorage (Instant 0ms)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            try {
                if (key.startsWith('wzker_mushaf_page_') || key.startsWith('wzker_quran_surah_')) {
                    const list = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(list)) {
                        for (const a of list) {
                            const sNum = a.surahNum || (a.surah && a.surah.number);
                            const aNum = a.numberInSurah;
                            const uniqueId = \`\${sNum}_\${aNum}\`;
                            if (seenAyahIds.has(uniqueId)) continue;
                            const normText = this.normalizeArabic(a.text);
                            if (normText.includes(normQ)) {
                                seenAyahIds.add(uniqueId);
                                const surahObj = QURAN_SURAHS.find(s => s.num === sNum);
                                const p = a.page || this.getPageByAyah(sNum, aNum);
                                matches.push({
                                    surahNum: sNum,
                                    surahName: surahObj ? surahObj.name : (a.surahName || ''),
                                    ayahNum: aNum,
                                    page: p,
                                    text: a.text
                                });
                                if (matches.length >= 30) break;
                            }
                        }
                    }
                }
            } catch (e) {}
            if (matches.length >= 30) break;
        }

        // If local matches exist, show them instantly without waiting
        if (matches.length > 0) {
            this.renderSearchResults(matches, rawQ, true);
        }

        // 2. Fetch from AlQuran Cloud global Quran search API with AbortController
        try {
            if (this.searchAbortController) {
                this.searchAbortController.abort();
            }
            this.searchAbortController = new AbortController();

            const res = await fetch(\`https://api.alquran.cloud/v1/search/\${encodeURIComponent(normQ)}/all/quran-uthmani\`, {
                signal: this.searchAbortController.signal
            });
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data.matches)) {
                for (const m of json.data.matches) {
                    const sNum = m.surah.number;
                    const aNum = m.numberInSurah;
                    const uniqueId = \`\${sNum}_\${aNum}\`;
                    if (seenAyahIds.has(uniqueId)) continue;
                    seenAyahIds.add(uniqueId);

                    const surahObj = QURAN_SURAHS.find(s => s.num === sNum);
                    let cleanText = m.text;
                    if (sNum !== 1 && aNum === 1) {
                        cleanText = cleanText.replace(/^بِسْمِ[\\s\\S]*?ٱلرَّحِيمِ\\s*/, '').trim();
                    }

                    matches.push({
                        surahNum: sNum,
                        surahName: surahObj ? surahObj.name : m.surah.name.replace(/^سُورَةُ\\s*/, ''),
                        ayahNum: aNum,
                        page: this.getPageByAyah(sNum, aNum),
                        text: cleanText
                    });
                    if (matches.length >= 30) break;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Quran API search error:', err);
            }
        }

        if (this.searchQuery !== rawQ) return;

        // Cache completed result
        this.searchCache.set(normQ, matches);
        this.renderSearchResults(matches, rawQ, false);
    }

    renderSearchResults(matches, rawQ, isLoadingMore = false) {
        const resultsBox = document.getElementById('quranVerseSearchResults');
        if (!resultsBox || this.searchQuery !== rawQ) return;

        if (matches.length === 0 && !isLoadingMore) {
            resultsBox.innerHTML = \`
                <div class="verse-search-header">
                    <span>نتائج البحث في الآيات</span>
                    <span>(لا توجد نتائج)</span>
                </div>
                <div style="text-align: center; padding: 18px 10px; color: var(--text-muted); font-size: 13px;">
                    <p style="margin: 0 0 6px 0;">لم يتم العثور على آيات تطابق «\${rawQ}»</p>
                    <small>تأكد من صحة الكلمات أو ابحث بجزء من الآية.</small>
                </div>
            \`;
            return;
        }

        resultsBox.innerHTML = \`
            <div class="verse-search-header">
                <span>نتائج الآيات المطابقة (\${this.toArabicDigits(matches.length)})</span>
                \${isLoadingMore 
                    ? '<span style="font-size: 11.5px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="color: #d97706;"></i> جاري البحث الموسّع...</span>' 
                    : '<span style="font-size: 11.5px; color: #d97706;">انقر للانتقال للآية في صفحتها</span>'
                }
            </div>
            \${matches.map(m => \`
                <div class="verse-res-item" onclick="window.wzkerQuran.openAyahInReader(\${m.surahNum}, \${m.ayahNum})">
                    <div class="verse-res-meta">
                        <span class="verse-res-title">سورة \${m.surahName} • الآية \${this.toArabicDigits(m.ayahNum)}</span>
                        <span class="verse-res-page">صفحة \${this.toArabicDigits(m.page)}</span>
                    </div>
                    <p class="verse-res-text">\${this.highlightMatch(m.text, rawQ)}</p>
                </div>
            \`).join('')}
        \`;
    }

    highlightMatch(text, query) {`;

code = code.replace(oldExecuteVerseSearchRegex, newExecuteVerseSearchAndRender);

fs.writeFileSync(quranPath, code, 'utf8');
console.log('Successfully updated js/quran.js');
