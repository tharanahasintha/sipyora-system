// ── AUTH.JS ──
//
// THE GITHUB PAGES PROBLEM:
// Firebase Auth stores the token in IndexedDB. On GitHub Pages, every
// link click = full page reload. onAuthStateChanged() fires TWICE:
//   1st call  → null  (IndexedDB not read yet — async)
//   2nd call  → user  (IndexedDB read complete)
//
// Old code redirected to login on the 1st null call.
//
// THE FIX:
// 1. Show a fullscreen loader immediately (body hidden via CSS)
// 2. Use auth.authStateReady() — a Promise that resolves only AFTER
//    Firebase has finished reading the stored token from IndexedDB.
//    This is the correct way: no race, no timers needed.
// 3. If still no user after that — THEN redirect.
// 4. Also store sipyora_logged_in=1 in localStorage as a fast hint
//    so we know whether to even bother showing the loader.

var currentUser = null;
var currentRole = null;

// ── LOADER (shown immediately, before any auth check) ──
(function() {
  // Only show loader on protected pages (not login.html)
  var path = window.location.pathname;
  if (path.endsWith('login.html')) return;

  // Fast check: if we've never logged in, skip the loader
  if (!localStorage.getItem('sipyora_logged_in')) return;

  var loader = document.createElement('div');
  loader.id = '_sip_loader';
  loader.style.cssText = [
    'position:fixed','inset:0','background:#1a1a2e',
    'display:flex','flex-direction:column',
    'align-items:center','justify-content:center',
    'z-index:99999','transition:opacity 0.3s'
  ].join(';');
  loader.innerHTML =
    '<div style="font-family:serif;font-size:2.2rem;color:#e8eaf0;margin-bottom:28px;letter-spacing:-0.5px">' +
      'Sip<span style="color:#e94560">yora</span>' +
    '</div>' +
    '<div id="_sip_spin" style="width:38px;height:38px;border:3px solid rgba(255,255,255,0.1);' +
      'border-top-color:#e94560;border-radius:50%;animation:__spin 0.7s linear infinite"></div>' +
    '<style>@keyframes __spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(loader);
})();

function _hideLoader() {
  var l = document.getElementById('_sip_loader');
  if (!l) return;
  l.style.opacity = '0';
  setTimeout(function(){ if(l.parentNode) l.remove(); }, 320);
}

// ── MAIN AUTH INIT ──
function initAuth(onReady) {
  var path    = window.location.pathname;
  var isLogin = path.endsWith('login.html');
  var base    = path.includes('/pages/') ? '../' : '';

  // authStateReady() is a Promise that resolves after Firebase has
  // fully loaded the persisted auth state from IndexedDB.
  // This completely eliminates the null-before-user race condition.
  var readyPromise = (typeof auth.authStateReady === 'function')
    ? auth.authStateReady()           // Firebase 9.22+ compat has this
    : _fallbackReady();               // polyfill for older SDK versions

  readyPromise.then(function() {
    var user = auth.currentUser;

    if (user) {
      currentUser = user;
      currentRole = isAdmin(user.email) ? 'admin' : 'teacher';
      localStorage.setItem('sipyora_logged_in', '1');
      localStorage.setItem('sipyora_role', currentRole);
      _hideLoader();
      if (onReady) onReady(user, currentRole);

    } else {
      // Genuinely not logged in
      localStorage.removeItem('sipyora_logged_in');
      localStorage.removeItem('sipyora_role');
      _hideLoader();
      if (!isLogin) {
        window.location.replace(base + 'login.html');
      }
    }
  }).catch(function(e) {
    console.error('Auth error:', e);
    _hideLoader();
    if (!isLogin) window.location.replace(base + 'login.html');
  });
}

// ── POLYFILL for older Firebase compat SDK without authStateReady() ──
// Wraps onAuthStateChanged to fire only once, with a max wait of 3s.
function _fallbackReady() {
  return new Promise(function(resolve) {
    var resolved = false;
    var timer = setTimeout(function() {
      if (!resolved) { resolved = true; resolve(); }
    }, 3000);
    var unsub = auth.onAuthStateChanged(function() {
      clearTimeout(timer);
      if (!resolved) {
        resolved = true;
        unsub();
        // Small defer so auth.currentUser is set before we read it
        setTimeout(resolve, 50);
      }
    });
  });
}

// ── LOGOUT ──
function logoutUser() {
  localStorage.removeItem('sipyora_logged_in');
  localStorage.removeItem('sipyora_role');
  auth.signOut().then(function() {
    var path = window.location.pathname;
    var base = path.includes('/pages/') ? '../' : '';
    window.location.replace(base + 'login.html');
  });
}

function requireAdmin() {
  if (currentRole !== 'admin') { showToast('Admin access required','error'); return false; }
  return true;
}

function updateUserBadge() {
  var nameEl   = document.getElementById('userName');
  var roleEl   = document.getElementById('userRole');
  var avatarEl = document.getElementById('userAvatar');
  if (!currentUser) return;
  if (currentRole === 'teacher') {
    db.collection('teachers').where('email','==',currentUser.email).limit(1).get()
      .then(function(snap) {
        var name = snap.empty ? currentUser.email : snap.docs[0].data().name;
        if (nameEl)   nameEl.textContent   = name;
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
      });
  } else {
    if (nameEl)   nameEl.textContent   = 'Administrator';
    if (avatarEl) avatarEl.textContent = 'A';
  }
  if (roleEl) roleEl.textContent = currentRole;
}

function applyRoleUI() {
  document.querySelectorAll('[data-admin]').forEach(function(el) {
    el.style.display = currentRole === 'admin' ? '' : 'none';
  });
}