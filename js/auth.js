// ── AUTH.JS ──
// The key fix: Firebase needs a moment to check IndexedDB for a stored
// session. During that time onAuthStateChanged fires "null" — which used
// to redirect to login immediately. We now wait for the FIRST callback
// before deciding to redirect. A full-screen loader hides the flash.

var currentUser = null;
var currentRole = null;
var _authResolved = false;   // becomes true after first onAuthStateChanged callback

function initAuth(onReady) {

  // Show the global loader immediately so the user never sees a blank
  // page or a flicker of the login screen while Firebase checks storage.
  _showLoader();

  auth.onAuthStateChanged(function(user) {

    // Only act on the FIRST callback (session restore check).
    // Subsequent calls are real login/logout events.
    var firstCall = !_authResolved;
    _authResolved = true;

    if (user) {
      currentUser = user;
      currentRole = isAdmin(user.email) ? 'admin' : 'teacher';
      _hideLoader();
      if (onReady) onReady(user, currentRole);

    } else {
      currentUser = null;
      currentRole = null;

      var path       = window.location.pathname;
      var isLogin    = path.endsWith('login.html');
      var isRoot     = path.endsWith('/') || path.endsWith('index.html');
      var base       = path.includes('/pages/') ? '../' : '';

      if (!isLogin) {
        // Redirect to login — but only after a short grace period on the
        // first call, giving Firebase a second chance if it was slow.
        if (firstCall) {
          setTimeout(function() {
            // Re-check: another onAuthStateChanged may have fired by now
            if (!currentUser) {
              window.location.href = base + 'login.html';
            } else {
              _hideLoader();
            }
          }, 800);
        } else {
          // Definite logout — redirect immediately
          window.location.href = base + 'login.html';
        }
      } else {
        _hideLoader();
      }
    }
  });
}

// ── LOADER ──
function _showLoader() {
  if (document.getElementById('_authLoader')) return;
  var loader = document.createElement('div');
  loader.id = '_authLoader';
  loader.innerHTML =
    '<div style="position:fixed;inset:0;background:#1a1a2e;display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;z-index:99999;">' +
      '<div style="font-family:\'DM Serif Display\',serif;font-size:2rem;color:#e8eaf0;letter-spacing:-0.5px;margin-bottom:24px;">' +
        'Sip<span style="color:#e94560">yora</span>' +
      '</div>' +
      '<div style="width:36px;height:36px;border:3px solid rgba(255,255,255,0.1);' +
      'border-top-color:#e94560;border-radius:50%;animation:_spin 0.7s linear infinite;"></div>' +
      '<style>@keyframes _spin{to{transform:rotate(360deg)}}</style>' +
    '</div>';
  document.body.appendChild(loader);
}

function _hideLoader() {
  var loader = document.getElementById('_authLoader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s';
    setTimeout(function(){ loader.remove(); }, 320);
  }
}

// ── LOGOUT ──
function logoutUser() {
  _authResolved = false;   // reset so next login works cleanly
  auth.signOut().then(function() {
    var path = window.location.pathname;
    var base = path.includes('/pages/') ? '../' : '';
    window.location.href = base + 'login.html';
  });
}

// ── HELPERS ──
function requireAdmin() {
  if (currentRole !== 'admin') {
    showToast('Admin access required', 'error');
    return false;
  }
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