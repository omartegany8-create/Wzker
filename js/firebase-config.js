/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER FIREBASE & OFFLINE CLOUD CONFIGURATION (js/firebase-config.js)
 * Full Offline Persistence + Cloud Firestore + Google Authentication
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // Firebase Configuration Object
  const firebaseConfig = {
    apiKey: "AIzaSyAnlyHk18r2ohrFPeWnC7wo4e0vjlkeGyE",
    authDomain: "wzker-af04f.firebaseapp.com",
    databaseURL: "https://wzker-af04f-default-rtdb.firebaseio.com",
    projectId: "wzker-af04f",
    storageBucket: "wzker-af04f.firebasestorage.app",
    messagingSenderId: "124906236954",
    appId: "1:124906236954:web:be2600bf46fa77ba4835a3",
    measurementId: "G-W43L0GGSZT"
  };

  // Namespace
  window.WzkerFirebase = {
    app: null,
    auth: null,
    db: null,
    googleProvider: null,
    isInitialized: false,
    initPromise: null
  };

  function initialize() {
    if (window.WzkerFirebase.isInitialized) return Promise.resolve(true);

    return new Promise((resolve) => {
      try {
        if (typeof firebase === 'undefined') {
          console.warn('[Wzker Cloud] Firebase SDK not yet loaded in window.');
          resolve(false);
          return;
        }

        // 1. Initialize App
        if (!firebase.apps.length) {
          window.WzkerFirebase.app = firebase.initializeApp(firebaseConfig);
        } else {
          window.WzkerFirebase.app = firebase.app();
        }

        // 2. Initialize Auth
        window.WzkerFirebase.auth = firebase.auth();
        window.WzkerFirebase.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.WzkerFirebase.googleProvider.setCustomParameters({ prompt: 'select_account' });

        // 3. Initialize Firestore with Offline Persistence
        window.WzkerFirebase.db = firebase.firestore();

        // Enable Multi-tab / Offline Persistence
        window.WzkerFirebase.db.enablePersistence({ synchronizeTabs: true })
          .then(() => {
            console.log('[Wzker Cloud] Firestore Offline Persistence enabled successfully.');
            window.WzkerFirebase.isInitialized = true;
            resolve(true);
          })
          .catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('[Wzker Cloud] Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
              console.warn('[Wzker Cloud] Browser does not support Firestore persistence.');
            } else {
              console.warn('[Wzker Cloud] Persistence error:', err);
            }
            window.WzkerFirebase.isInitialized = true;
            resolve(true);
          });

      } catch (err) {
        console.error('[Wzker Cloud] Initialization failed:', err);
        resolve(false);
      }
    });
  }

  window.WzkerFirebase.initPromise = initialize();

})();
