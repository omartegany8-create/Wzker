/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER CLOUD SYNC & USER PROFILE MANAGER (js/cloud-sync.js)
 * Seamless Google Auth + Anonymous Fallback + Firestore 2-Way Sync
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerCloudSync {
    constructor() {
      this.currentUser = null;
      this.isAnonymous = true;
      this.isOnline = navigator.onLine;
      this.lastSyncTime = null;
      this.unsubDocListener = null;
      this.syncDebounceTimer = null;
      this.lastSyncedDataHash = null;

      // Local storage keys we synchronize
      this.syncKeys = {
        quranBookmark: 'wzker_quran_single_bookmark',
        quranKhatma: 'wzker_quran_khatma_plan',
        tasbeehStreak: 'wzker_tasbeeh_streak_v2',
        tasbeehDist: 'wzker_tasbeeh_distribution_v2',
        favorites: 'wzker_favs',
        theme: 'wzker_theme',
        prayerLocation: 'wzker_prayer_location',
        prayerMethod: 'wzker_prayer_method',
        prayerJuristic: 'wzker_prayer_juristic',
        prayerMuezzin: 'wzker_prayer_muezzin'
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    async init() {
      // Listen to browser online/offline events
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.updateSyncBadgeUI();
        if (window.showToast) window.showToast('تم استعادة الاتصال بالإنترنت • جاري المزامنة');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.updateSyncBadgeUI();
        if (window.showToast) window.showToast('أنت في وضع العمل دون إنترنت • التعديلات محفوظة محلياً');
      });

      // Wait for Firebase to initialize
      if (window.WzkerFirebase && window.WzkerFirebase.initPromise) {
        await window.WzkerFirebase.initPromise;
      }

      this.setupAuthObserver();
      this.hookLocalSaveTriggers();
      this.initGoogleIdentity();

      // Flush any pending debounced sync when app goes to background or user closes tab
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.syncDebounceTimer) {
          clearTimeout(this.syncDebounceTimer);
          this.syncDebounceTimer = null;
          this.pushLocalDataToCloud();
        }
      });
      window.addEventListener('beforeunload', () => {
        if (this.syncDebounceTimer) {
          clearTimeout(this.syncDebounceTimer);
          this.syncDebounceTimer = null;
          this.pushLocalDataToCloud();
        }
      });
    }

    // ── 1. AUTHENTICATION LIFECYCLE ──
    setupAuthObserver() {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      if (!auth) {
        console.warn('[Wzker Cloud] Auth not available.');
        return;
      }

      auth.onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = user;
          this.isAnonymous = user.isAnonymous;
          console.log(`[Wzker Cloud] Active User: ${user.uid} (Anonymous: ${user.isAnonymous})`);
          this.attachFirestoreListener(user.uid);
          this.updateAccountPageUI();
        } else {
          // If no user exists, silently sign in anonymously so offline storage has a clean UID
          this.signInSilentlyAsGuest();
        }
      });
    }

    async signInSilentlyAsGuest() {
      try {
        const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
        if (!auth) return;
        await auth.signInAnonymously();
      } catch (err) {
        console.warn('[Wzker Cloud] Anonymous sign in failed (offline mode):', err);
      }
    }

    // ── GOOGLE IDENTITY SERVICES (GSI) ──
    initGoogleIdentity(retryCount = 0) {
      if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
        if (retryCount < 30) {
          setTimeout(() => this.initGoogleIdentity(retryCount + 1), 250);
        }
        return;
      }

      try {
        google.accounts.id.initialize({
          client_id: '814516981900-b2gsj39k6btm6jdvtkub9fj2ifniiomo.apps.googleusercontent.com',
          callback: (response) => {
            if (typeof window.handleGoogleCredentialResponse === 'function') {
              window.handleGoogleCredentialResponse(response);
            }
          },
          context: 'signin',
          ux_mode: 'popup',
          auto_select: false
        });

        this.renderAllGoogleButtons();
      } catch (err) {
        console.warn('[Wzker Cloud] Google GSI initialization error:', err);
      }
    }

    renderAllGoogleButtons() {
      if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) return;

      const targets = [
        { id: 'googleGsiHeroContainer', text: 'signin_with', width: 320 },
        { id: 'googleGsiLoginContainer', text: 'signin_with', width: 320 },
        { id: 'googleGsiRegisterContainer', text: 'signup_with', width: 320 }
      ];

      targets.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
          el.innerHTML = '';
          try {
            google.accounts.id.renderButton(el, {
              type: 'standard',
              shape: 'pill',
              theme: 'outline',
              text: item.text,
              size: 'large',
              logo_alignment: 'left',
              width: item.width
            });
          } catch (e) {
            console.warn(`[Wzker Cloud] Failed to render Google button for #${item.id}:`, e);
          }
        }
      });
    }

    // ── 2. AUTHENTICATION (GOOGLE, EMAIL, REGISTRATION, RESET) ──
    async signInWithGoogle() {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      const provider = window.WzkerFirebase ? window.WzkerFirebase.googleProvider : null;

      if (!auth || !provider) {
        if (window.showToast) window.showToast('تعذر الاتصال بخدمة المصادقة');
        return;
      }

      try {
        if (window.showToast) window.showToast('جاري تسجيل الدخول بحساب Google...');

        // If currently anonymous, link the account to preserve offline bookmarks!
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          try {
            await auth.currentUser.linkWithPopup(provider);
            if (window.showToast) window.showToast('تم ربط حسابك بـ Google بنجاح!');
            this.pushLocalDataToCloud();
            this.closeAuthPagesAndGoHome();
            return;
          } catch (linkErr) {
            // If already linked to another account, standard sign in with popup
            if (linkErr.code !== 'auth/credential-already-in-use') {
              console.warn('[Wzker Cloud] Link with popup failed, falling back to signInWithPopup:', linkErr);
            }
          }
        }

        // Standard Google Popup
        const result = await auth.signInWithPopup(provider);
        this.currentUser = result.user;
        this.isAnonymous = false;

        if (window.showToast) {
          window.showToast(`مرحباً بك يا ${result.user.displayName || 'أخي المبارك'}! تم تسجيل الدخول بنجاح`);
        }

        this.closeAuthPagesAndGoHome();
        this.updateAccountPageUI();
        this.pushLocalDataToCloud();
      } catch (err) {
        console.error('[Wzker Cloud] Google sign in error:', err);
        const msg = this.formatAuthError(err);
        if (window.showToast) window.showToast(msg);
      }
    }

    async signInWithEmail(email, password) {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      if (!auth) {
        if (window.showToast) window.showToast('تعذر الاتصال بخدمة المصادقة');
        return false;
      }

      try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        this.currentUser = result.user;
        this.isAnonymous = false;

        if (window.showToast) {
          window.showToast(`مرحباً بك مجدداً يا ${result.user.displayName || 'أخي المبارك'}! تم تسجيل الدخول`);
        }

        this.closeAuthPagesAndGoHome();
        this.updateAccountPageUI();
        this.pushLocalDataToCloud();
        return true;
      } catch (err) {
        console.error('[Wzker Cloud] Sign in error:', err);
        const msg = this.formatAuthError(err);
        if (window.showToast) window.showToast(msg);
        return false;
      }
    }

    async registerWithEmail(name, email, password) {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      if (!auth) {
        if (window.showToast) window.showToast('تعذر الاتصال بخدمة المصادقة');
        return false;
      }

      try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        if (result.user && name) {
          await result.user.updateProfile({ displayName: name });
        }
        this.currentUser = result.user;
        this.isAnonymous = false;

        if (window.showToast) {
          window.showToast(`تم إنشاء حسابك بنجاح! مرحباً بك يا ${name || 'أخي المبارك'}`);
        }

        this.closeAuthPagesAndGoHome();
        this.updateAccountPageUI();
        this.pushLocalDataToCloud();
        return true;
      } catch (err) {
        console.error('[Wzker Cloud] Register error:', err);
        const msg = this.formatAuthError(err);
        if (window.showToast) window.showToast(msg);
        return false;
      }
    }

    async sendResetPassword(email) {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      if (!auth) {
        if (window.showToast) window.showToast('تعذر الاتصال بخدمة المصادقة');
        return false;
      }

      try {
        await auth.sendPasswordResetEmail(email);
        if (window.showToast) {
          window.showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح');
        }

        if (typeof window.closeLibPage === 'function') {
          window.closeLibPage('authForgotPage');
        }
        if (typeof window.openLibPage === 'function') {
          window.openLibPage('authLoginPage');
        }
        return true;
      } catch (err) {
        console.error('[Wzker Cloud] Reset password error:', err);
        const msg = this.formatAuthError(err);
        if (window.showToast) window.showToast(msg);
        return false;
      }
    }

    async signOutUser() {
      const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : null;
      if (!auth) return;

      try {
        if (this.unsubDocListener) this.unsubDocListener();
        await auth.signOut();
        if (window.showToast) window.showToast('تم تسجيل الخروج بنجاح. تم تفعيل الحساب المحلي');
      } catch (err) {
        console.error('[Wzker Cloud] Sign out error:', err);
      }
    }

    closeAuthPagesAndGoHome() {
      if (typeof window.closeLibPage === 'function') {
        window.closeLibPage('authLoginPage');
        window.closeLibPage('authRegisterPage');
        window.closeLibPage('authForgotPage');
      }
      if (typeof window.openLibPage === 'function') {
        window.openLibPage('loginPage');
      }
    }

    formatAuthError(err) {
      if (!err) return 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
      const code = err.code || '';
      switch (code) {
        case 'auth/invalid-email':
          return 'صيغة البريد الإلكتروني غير صحيحة';
        case 'auth/user-disabled':
          return 'تم تعطيل هذا الحساب، يرجى التواصل مع الدعم';
        case 'auth/user-not-found':
          return 'البريد الإلكتروني غير مسجل، يمكنك إنشاء حساب جديد';
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        case 'auth/email-already-in-use':
          return 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول';
        case 'auth/weak-password':
          return 'كلمة المرور ضعيفة، يرجى إدخال 6 أحرف أو أكثر';
        case 'auth/too-many-requests':
          return 'محاولات دخول كثيرة، يرجى الانتظار دقيقة والمحاولة مجدداً';
        case 'auth/network-request-failed':
          return 'تعذر الاتصال، يرجى التحقق من اتصالك بالإنترنت';
        case 'auth/popup-closed-by-user':
          return 'تم إلغاء نافذة تسجيل الدخول';
        case 'auth/unauthorized-domain':
          return 'النطاق غير مصرح به في إعدادات Google Cloud';
        default:
          return err.message || 'تعذر إتمام العملية، يرجى المحاولة لاحقاً';
      }
    }

    // ── Form Submit & UI Actions ──
    async submitLogin() {
      const emailEl = document.getElementById('authLoginEmail');
      const passEl = document.getElementById('authLoginPassword');
      const btn = document.getElementById('authLoginSubmitBtn');

      const email = emailEl ? emailEl.value.trim() : '';
      const password = passEl ? passEl.value : '';

      if (!email) {
        if (window.showToast) window.showToast('يرجى إدخال البريد الإلكتروني أو الهاتف');
        return;
      }
      if (!password) {
        if (window.showToast) window.showToast('يرجى إدخال كلمة المرور');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }

      try {
        await this.signInWithEmail(email, password);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '';
        }
      }
    }

    async submitRegister() {
      const nameEl = document.getElementById('authRegName');
      const emailEl = document.getElementById('authRegEmail');
      const passEl = document.getElementById('authRegPassword');
      const confirmEl = document.getElementById('authRegConfirmPassword');
      const btn = document.getElementById('authRegSubmitBtn');

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const pass = passEl ? passEl.value : '';
      const confirm = confirmEl ? confirmEl.value : '';

      if (!name) {
        if (window.showToast) window.showToast('يرجى كتابة اسمك الكريم أو اللقب');
        return;
      }
      if (!email) {
        if (window.showToast) window.showToast('يرجى إدخال البريد الإلكتروني');
        return;
      }
      if (!pass || pass.length < 6) {
        if (window.showToast) window.showToast('كلمة المرور يجب أن لا تقل عن 6 خانات');
        return;
      }
      if (pass !== confirm) {
        if (window.showToast) window.showToast('كلمتا المرور غير متطابقتين');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }

      try {
        await this.registerWithEmail(name, email, pass);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '';
        }
      }
    }

    async submitForgotPassword() {
      const emailEl = document.getElementById('authForgotEmail');
      const btn = document.getElementById('authForgotSubmitBtn');
      const email = emailEl ? emailEl.value.trim() : '';

      if (!email) {
        if (window.showToast) window.showToast('يرجى كتابة بريدك الإلكتروني المسجل');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }

      try {
        await this.sendResetPassword(email);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '';
        }
      }
    }

    togglePassVisibility(inputId, btnEl) {
      const input = document.getElementById(inputId);
      if (!input) return;

      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';

      const icon = btnEl ? btnEl.querySelector('i') : null;
      if (icon) {
        icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      }
    }

    // ── 3. FIRESTORE 2-WAY PERSISTENT SYNC ──
    attachFirestoreListener(uid) {
      const db = window.WzkerFirebase ? window.WzkerFirebase.db : null;
      if (!db) return;

      if (this.unsubDocListener) {
        this.unsubDocListener();
      }

      const userDocRef = db.collection('users').doc(uid);

      this.unsubDocListener = userDocRef.onSnapshot(
        { includeMetadataChanges: true },
        (docSnapshot) => {
          const fromCache = docSnapshot.metadata.fromCache;
          this.lastSyncTime = new Date();

          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            this.mergeRemoteDataToLocal(data);
          } else {
            // First time this user connects, initialize their cloud doc from existing local data
            this.pushLocalDataToCloud();
          }

          this.updateSyncBadgeUI(fromCache);
          this.updateAccountStatsDisplay();
        },
        (err) => {
          console.warn('[Wzker Cloud] Firestore onSnapshot error:', err);
        }
      );
    }

    // Push local state to Firestore
    async pushLocalDataToCloud() {
      if (!this.currentUser) return;
      const db = window.WzkerFirebase ? window.WzkerFirebase.db : null;
      if (!db) return;

      const accountType = this.currentUser.isAnonymous
        ? 'guest'
        : (this.currentUser.providerData && this.currentUser.providerData[0]
            ? this.currentUser.providerData[0].providerId
            : 'google.com');

      const payload = {
        // ── 1. User Profile ──
        user_name: this.currentUser.displayName || 'مستخدم وذكر',
        user_email: this.currentUser.email || null,
        account_type: accountType,
        user_photo: this.currentUser.photoURL || null,

        // ── 2. Sync Timestamps ──
        last_synced_at: new Date().toISOString(),
        server_updated_at: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        // Read local state
        const b = localStorage.getItem(this.syncKeys.quranBookmark);
        if (b) payload.quran_bookmark = JSON.parse(b);

        const s = localStorage.getItem(this.syncKeys.tasbeehStreak);
        if (s) payload.tasbeeh_streak = JSON.parse(s);

        const d = localStorage.getItem(this.syncKeys.tasbeehDist);
        if (d) payload.tasbeeh_counts = JSON.parse(d);

        const f = localStorage.getItem(this.syncKeys.favorites);
        if (f) payload.favorite_audio = JSON.parse(f);

        const k = localStorage.getItem(this.syncKeys.quranKhatma);
        if (k) payload.quran_khatma = JSON.parse(k);

        const t = localStorage.getItem(this.syncKeys.theme);
        if (t) payload.app_theme = t;

        const pLoc = localStorage.getItem(this.syncKeys.prayerLocation);
        if (pLoc) payload.prayer_location = JSON.parse(pLoc);

        const pMeth = localStorage.getItem(this.syncKeys.prayerMethod);
        if (pMeth) payload.prayer_method = pMeth;

        const pJur = localStorage.getItem(this.syncKeys.prayerJuristic);
        if (pJur) payload.prayer_juristic = pJur;

        const pMuez = localStorage.getItem(this.syncKeys.prayerMuezzin);
        if (pMuez) payload.prayer_muezzin = pMuez;

        // Skip redundant Firestore writes if data is identical to last sync
        const currentDataHash = JSON.stringify({
          b: payload.quran_bookmark || null,
          s: payload.tasbeeh_streak || null,
          c: payload.tasbeeh_counts || null,
          f: payload.favorite_audio || null,
          k: payload.quran_khatma || null,
          t: payload.app_theme || null,
          pl: payload.prayer_location || null,
          pm: payload.prayer_method || null,
          pj: payload.prayer_juristic || null,
          pz: payload.prayer_muezzin || null
        });

        if (this.lastSyncedDataHash === currentDataHash) {
          return;
        }

        // Set with merge: true so nothing is accidentally overwritten
        await db.collection('users').doc(this.currentUser.uid).set(payload, { merge: true });
        this.lastSyncedDataHash = currentDataHash;
        console.log('[Wzker Cloud] Successfully synced structured data to cloud.');
      } catch (e) {
        console.warn('[Wzker Cloud] Error pushing local data:', e);
      }
    }

    // Merge incoming remote cloud document into local storage if newer
    mergeRemoteDataToLocal(remote) {
      if (!remote) return;

      try {
        const qBookmark = remote.quran_bookmark || remote.quranBookmark;
        if (qBookmark) {
          const localB = localStorage.getItem(this.syncKeys.quranBookmark);
          if (!localB || JSON.stringify(qBookmark) !== localB) {
            localStorage.setItem(this.syncKeys.quranBookmark, JSON.stringify(qBookmark));
            if (window.wzkerQuran) {
              window.wzkerQuran.bookmark = qBookmark;
              if (typeof window.wzkerQuran.updateNavBookmarkIndicator === 'function') window.wzkerQuran.updateNavBookmarkIndicator();
              if (typeof window.wzkerQuran.updateRibbonBookmarkUI === 'function') window.wzkerQuran.updateRibbonBookmarkUI();
              if (typeof window.wzkerQuran.renderHeroCard === 'function') window.wzkerQuran.renderHeroCard();
            }
          }
        }

        const tStreak = remote.tasbeeh_streak || remote.tasbeehStreak;
        if (tStreak) {
          const localS = localStorage.getItem(this.syncKeys.tasbeehStreak);
          if (!localS || JSON.stringify(tStreak) !== localS) {
            localStorage.setItem(this.syncKeys.tasbeehStreak, JSON.stringify(tStreak));
            if (window.wzkerTasbeeh && typeof window.wzkerTasbeeh.loadStorage === 'function') {
              window.wzkerTasbeeh.loadStorage();
              window.wzkerTasbeeh.renderStreakBanner();
            }
          }
        }

        const tCounts = remote.tasbeeh_counts || remote.tasbeehDist;
        if (tCounts) {
          const localD = localStorage.getItem(this.syncKeys.tasbeehDist);
          if (!localD || JSON.stringify(tCounts) !== localD) {
            localStorage.setItem(this.syncKeys.tasbeehDist, JSON.stringify(tCounts));
          }
        }

        const favAudio = remote.favorite_audio || remote.favorites;
        if (favAudio && Array.isArray(favAudio)) {
          const localF = localStorage.getItem(this.syncKeys.favorites);
          if (!localF || JSON.stringify(favAudio) !== localF) {
            localStorage.setItem(this.syncKeys.favorites, JSON.stringify(favAudio));
            if (window.wzkerLib) {
              window.wzkerLib.favs = favAudio;
              if (typeof window.wzkerLib.renderFavorites === 'function') {
                window.wzkerLib.renderFavorites();
              }
            }
          }
        }

        const qKhatma = remote.quran_khatma || remote.quranKhatma;
        if (qKhatma) {
          const localK = localStorage.getItem(this.syncKeys.quranKhatma);
          if (!localK || JSON.stringify(qKhatma) !== localK) {
            localStorage.setItem(this.syncKeys.quranKhatma, JSON.stringify(qKhatma));
          }
        }

        const appTheme = remote.app_theme || remote.theme;
        if (appTheme) {
          const localT = localStorage.getItem(this.syncKeys.theme);
          if (!localT || appTheme !== localT) {
            localStorage.setItem(this.syncKeys.theme, appTheme);
            if (typeof window.applyTheme === 'function') {
              window.applyTheme(appTheme);
            }
          }
        }

        const pLoc = remote.prayer_location;
        if (pLoc) {
          localStorage.setItem(this.syncKeys.prayerLocation, JSON.stringify(pLoc));
          if (window.wzkerPrayer) window.wzkerPrayer.location = pLoc;
        }

        const pMeth = remote.prayer_method;
        if (pMeth) {
          localStorage.setItem(this.syncKeys.prayerMethod, pMeth);
          if (window.wzkerPrayer) window.wzkerPrayer.method = pMeth;
        }

        const pJur = remote.prayer_juristic;
        if (pJur) {
          localStorage.setItem(this.syncKeys.prayerJuristic, pJur);
          if (window.wzkerPrayer) window.wzkerPrayer.juristic = parseInt(pJur, 10);
        }

        const pMuez = remote.prayer_muezzin;
        if (pMuez) {
          localStorage.setItem(this.syncKeys.prayerMuezzin, pMuez);
          if (window.wzkerPrayer) window.wzkerPrayer.selectedMuezzin = pMuez;
        }

        if ((pLoc || pMeth || pJur || pMuez) && window.wzkerPrayer) {
          window.wzkerPrayer.calculateTodayTimes();
          window.wzkerPrayer.renderFullUI();
        }

        // Cache remote data hash to avoid immediate loopback write
        this.lastSyncedDataHash = JSON.stringify({
          b: remote.quran_bookmark || remote.quranBookmark || null,
          s: remote.tasbeeh_streak || remote.tasbeehStreak || null,
          c: remote.tasbeeh_counts || remote.tasbeehDist || null,
          f: remote.favorite_audio || remote.favorites || null,
          k: remote.quran_khatma || remote.quranKhatma || null,
          t: remote.app_theme || remote.theme || null,
          pl: remote.prayer_location || null,
          pm: remote.prayer_method || null,
          pj: remote.prayer_juristic || null,
          pz: remote.prayer_muezzin || null
        });
      } catch (err) {
        console.warn('[Wzker Cloud] Merge remote data error:', err);
      }
    }

    // Hook auto sync when user performs actions
    hookLocalSaveTriggers() {
      // Periodic gentle sync every 60 seconds if online
      setInterval(() => {
        if (this.isOnline && this.currentUser) {
          this.pushLocalDataToCloud();
        }
      }, 60000);
    }

    // Public method with smart debouncing to conserve Firebase quota and battery
    triggerSync(type) {
      if (!this.currentUser || !this.isOnline) return;

      // Fast repetitive actions (like tasbeeh clicks): debounce by 2.5 seconds
      // Single actions (like bookmarks or favorites): debounce by 800ms
      const delay = type === 'tasbeeh' ? 5000 : 800;

      if (this.syncDebounceTimer) {
        clearTimeout(this.syncDebounceTimer);
      }

      this.syncDebounceTimer = setTimeout(() => {
        this.syncDebounceTimer = null;
        this.pushLocalDataToCloud();
      }, delay);
    }

    // ── 4. UI SYNCHRONIZATION & PRESENTATION ──
    updateAccountPageUI() {
      const user = this.currentUser;
      const cardContainer = document.getElementById('cloudAccountHeroCard');
      if (!cardContainer) return;

      if (user && !user.isAnonymous) {
        // Authenticated Google User
        const avatarUrl = user.photoURL || 'images/icons/Login1.png';
        const name = user.displayName || 'مستخدم وذكر المبارك';
        const email = user.email || '';

        cardContainer.innerHTML = `
          <div class="cloud-user-profile-header">
            <div class="cloud-avatar-wrapper">
              <img src="${avatarUrl}" class="cloud-user-avatar" alt="Avatar" referrerpolicy="no-referrer">
              <span class="cloud-avatar-badge" title="حساب Google موثق"><i class="fa-solid fa-circle-check"></i></span>
            </div>
            <div class="cloud-user-details">
              <h3 class="cloud-user-name">${name}</h3>
              <p class="cloud-user-email">${email}</p>
              <div class="cloud-account-sync-tag active" id="cloudSyncStatusBadge">
                <span class="cloud-status-dot pulse"></span>
                <span>متزامن مع سحابة Google • أوفلاين/أونلاين</span>
              </div>
            </div>
          </div>

          <div class="cloud-quick-actions-row">
            <button class="cloud-act-btn outline" onclick="window.wzkerCloud.pushLocalDataToCloud(); window.showToast('جاري تحديث المزامنة سحابياً...');">
              <i class="fa-solid fa-rotate"></i>
              <span>مزامنة فورية الآن</span>
            </button>
            <button class="cloud-act-btn danger" onclick="window.wzkerCloud.signOutUser()">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        `;
      } else {
        // Guest / Anonymous User (Introductory State)
        cardContainer.innerHTML = `
          <div class="cloud-intro-hero">
            <div class="cloud-guest-status-pill">
              <span class="cloud-status-dot pulse"></span>
              <span>وضع الضيف • جميع بياناتك محفوظة محلياً وتعمل بدون إنترنت</span>
            </div>

            <div class="cloud-intro-header">
              <div class="cloud-intro-icon-box">
                <img src="images/icons/user-account.png" alt="Guest User">
              </div>
              <div class="cloud-intro-text-box">
                <h3 class="cloud-intro-title">حساب وذكر السحابي</h3>
                <p class="cloud-intro-desc">احفظ ختمتك القرآنية وسلسلة أورادك وأيام السبحة واستعدها بضغطة زر واحدة من أي هاتف أو حاسوب دون أن تفقد أي تسبيحة.</p>
              </div>
            </div>

            <div class="cloud-intro-actions">
              <button type="button" class="cloud-primary-action-btn" onclick="openLibPage('authLoginPage')">
                <i class="fa-solid fa-arrow-right-to-bracket"></i>
                <span>تسجيل الدخول / إنشاء حساب الآن</span>
              </button>

              <div class="google-gsi-wrap" id="googleGsiHeroContainer">
                <div class="g_id_signin"
                     data-type="standard"
                     data-shape="pill"
                     data-theme="outline"
                     data-text="signin_with"
                     data-size="large"
                     data-logo_alignment="left"
                     data-width="320">
                </div>
              </div>
            </div>
          </div>
        `;
        setTimeout(() => this.renderAllGoogleButtons(), 50);
      }

      this.updateAccountStatsDisplay();
    }

    updateSyncBadgeUI(fromCache = false) {
      const badge = document.getElementById('cloudSyncStatusBadge');
      if (!badge) return;

      if (!this.isOnline) {
        badge.className = 'cloud-account-sync-tag offline';
        badge.innerHTML = '<span class="cloud-status-dot offline"></span><span>أوفلاين • التعديلات محفوظة محلياً</span>';
      } else {
        badge.className = 'cloud-account-sync-tag active';
        badge.innerHTML = '<span class="cloud-status-dot pulse"></span><span>متزامن سحابياً مع Google</span>';
      }
    }

    updateAccountStatsDisplay() {
      // 1. Quran Bookmark
      const bookmarkValEl = document.getElementById('cloudStatBookmarkVal');
      if (bookmarkValEl) {
        try {
          const b = localStorage.getItem(this.syncKeys.quranBookmark);
          if (b) {
            const parsed = JSON.parse(b);
            bookmarkValEl.textContent = `صفحة ${parsed.page || 1} • ${parsed.surahName || 'الفاتحة'}`;
          } else {
            bookmarkValEl.textContent = 'لم تُحدد فاصلة بعد';
          }
        } catch (e) {
          bookmarkValEl.textContent = 'صفحة 1';
        }
      }

      // 2. Tasbeeh Streak
      const streakValEl = document.getElementById('cloudStatStreakVal');
      if (streakValEl) {
        try {
          const s = localStorage.getItem(this.syncKeys.tasbeehStreak);
          if (s) {
            const parsed = JSON.parse(s);
            streakValEl.textContent = `${parsed.count || 1} أيام متتالية`;
          } else {
            streakValEl.textContent = '1 يوم';
          }
        } catch (e) {
          streakValEl.textContent = '1 يوم';
        }
      }

      // 3. Favorites Count
      const favsValEl = document.getElementById('cloudStatFavoritesVal');
      if (favsValEl) {
        try {
          const f = localStorage.getItem(this.syncKeys.favorites);
          if (f) {
            const parsed = JSON.parse(f);
            favsValEl.textContent = `${Array.isArray(parsed) ? parsed.length : 0} تلاوة محفوظة`;
          } else {
            favsValEl.textContent = '0 تلاوة';
          }
        } catch (e) {
          favsValEl.textContent = '0 تلاوة';
        }
      }
    }
  }

  // Global Singleton Instance
  window.wzkerCloud = new WzkerCloudSync();

  // Global Callback for Google Identity Services (GSI)
  window.handleGoogleCredentialResponse = async function (response) {
    if (!response || !response.credential) {
      console.warn('[Wzker Cloud] No credential received in Google response');
      return;
    }

    const auth = window.WzkerFirebase ? window.WzkerFirebase.auth : (typeof firebase !== 'undefined' ? firebase.auth() : null);
    if (!auth) {
      if (window.showToast) window.showToast('تعذر الاتصال بخدمة المصادقة');
      return;
    }

    try {
      if (window.showToast) window.showToast('جاري تسجيل الدخول بحساب Google...');

      const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);

      // If currently anonymous, link the account to preserve offline bookmarks!
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          await auth.currentUser.linkWithCredential(credential);
          if (window.showToast) window.showToast('تم ربط حسابك بـ Google بنجاح وحفظ أورادك السابقة!');
        } catch (linkErr) {
          if (linkErr.code === 'auth/credential-already-in-use') {
            await auth.signInWithCredential(credential);
          } else {
            console.warn('[Wzker Cloud] Link with credential failed, signing in directly:', linkErr);
            await auth.signInWithCredential(credential);
          }
        }
      } else {
        await auth.signInWithCredential(credential);
      }

      const user = auth.currentUser;
      if (user && window.showToast) {
        window.showToast(`مرحباً بك يا ${user.displayName || 'أخي المبارك'}! تم تسجيل الدخول بنجاح`);
      }

      if (window.wzkerCloud) {
        window.wzkerCloud.currentUser = user;
        window.wzkerCloud.isAnonymous = false;
        window.wzkerCloud.closeAuthPagesAndGoHome();
        window.wzkerCloud.updateAccountPageUI();
        window.wzkerCloud.pushLocalDataToCloud();
      }
    } catch (err) {
      console.error('[Wzker Cloud] Google credential error:', err);
      let msg = 'تعذر إتمام المتابعة باستخدام Google، يرجى المحاولة لاحقاً';
      if (err.code === 'auth/account-exists-with-different-credential') {
        msg = 'البريد مسجل مسبقاً بطريقة مختلفة، يرجى تسجيل الدخول بالبريد أولاً';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'تعذر الاتصال بالشبكة، يرجى التحقق من اتصالك بالإنترنت';
      }
      if (window.showToast) window.showToast(msg);
    }
  };

})();
