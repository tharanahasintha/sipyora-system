var currentUser = null;
var currentRole = null;

function initAuth(onReady) {
  auth.onAuthStateChanged(function(user) {
    // Check if current page is login page
    var path = window.location.pathname;
    var isLoginPage = path.endsWith('login.html') || path.includes('login.html');
    
    if (user) {
      currentUser = user;
      currentRole = isAdmin(user.email) ? 'admin' : 'teacher';
      
      // If on login page but user is logged in, redirect to dashboard
      if (isLoginPage) {
        window.location.href = 'index.html';
        return;
      }
      
      if (onReady) onReady(user, currentRole);
    } else {
      currentUser = null;
      currentRole = null;
      
      // Only redirect to login if NOT on login page and NOT on login page
      if (!isLoginPage) {
        var base = path.includes('/pages/') ? '../' : '';
        window.location.href = base + 'login.html';
      }
    }
  });
}

function logoutUser() {
  auth.signOut().then(function() {
    var path = window.location.pathname;
    var base = path.includes('/pages/') ? '../' : '';
    window.location.href = base + 'login.html';
  });
}

function requireAdmin() {
  if (currentRole !== 'admin') {
    showToast('Admin access required', 'error');
    return false;
  }
  return true;
}

function updateUserBadge() {
  var nameEl = document.getElementById('userName');
  var roleEl = document.getElementById('userRole');
  var avatarEl = document.getElementById('userAvatar');
  if (!currentUser) return;

  if (currentRole === 'teacher') {
    db.collection('teachers').where('email', '==', currentUser.email).limit(1).get().then(function(snap) {
      if (!snap.empty) {
        var data = snap.docs[0].data();
        if (nameEl) nameEl.textContent = data.name;
        if (avatarEl) avatarEl.textContent = data.name.charAt(0).toUpperCase();
      } else {
        if (nameEl) nameEl.textContent = currentUser.email;
        if (avatarEl) avatarEl.textContent = currentUser.email.charAt(0).toUpperCase();
      }
    });
  } else {
    if (nameEl) nameEl.textContent = 'Administrator';
    if (avatarEl) avatarEl.textContent = 'A';
  }
  if (roleEl) roleEl.textContent = currentRole;
}

function applyRoleUI() {
  var adminEls = document.querySelectorAll('[data-admin]');
  adminEls.forEach(function(el) {
    el.style.display = currentRole === 'admin' ? '' : 'none';
  });
}