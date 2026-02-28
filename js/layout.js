

// ── SHARED LAYOUT ──

function buildLayout(pageTitle, activeNav, basePath) {
  if (basePath === undefined) basePath = '';

  var adminNav = [
    '<p class="nav-section-title">Management</p>',
    '<a class="nav-item ' + (activeNav==='students'?'active':'') + '" href="' + basePath + 'pages/students.html"><span class="icon">🎓</span> Students</a>',
    '<a class="nav-item ' + (activeNav==='teachers'?'active':'') + '" href="' + basePath + 'pages/teachers.html"><span class="icon">👩‍🏫</span> Teachers</a>',
    '<a class="nav-item ' + (activeNav==='subjects'?'active':'') + '" href="' + basePath + 'pages/subjects.html"><span class="icon">📚</span> Subjects</a>',
    '<p class="nav-section-title">Operations</p>',
    '<a class="nav-item ' + (activeNav==='attendance'?'active':'') + '" href="' + basePath + 'pages/attendance.html"><span class="icon">📋</span> Attendance</a>',
    '<a class="nav-item ' + (activeNav==='payments'?'active':'') + '" href="' + basePath + 'pages/payments.html"><span class="icon">💳</span> Payments</a>',
    '<p class="nav-section-title">Analytics</p>',
    '<a class="nav-item ' + (activeNav==='reports'?'active':'') + '" href="' + basePath + 'pages/reports.html"><span class="icon">📊</span> Reports</a>'
  ].join('');

  var teacherNav = [
    '<p class="nav-section-title">Operations</p>',
    '<a class="nav-item ' + (activeNav==='attendance'?'active':'') + '" href="' + basePath + 'pages/attendance.html"><span class="icon">📋</span> Attendance</a>',
    '<a class="nav-item ' + (activeNav==='students'?'active':'') + '" href="' + basePath + 'pages/students.html"><span class="icon">🎓</span> Students</a>'
  ].join('');

  var layoutHTML = '\
    <div class="app-layout">\
      <aside class="sidebar" id="sidebar">\
        <div class="sidebar-brand">\
          <h2>Sip<span>yora</span></h2>\
          <p>Institute Management</p>\
        </div>\
        <nav class="sidebar-nav" id="sidebarNav"></nav>\
        <div class="sidebar-footer">\
          <div class="user-badge">\
            <div class="user-avatar" id="userAvatar">?</div>\
            <div class="user-info">\
              <p id="userName">Loading...</p>\
              <span id="userRole">—</span>\
            </div>\
          </div>\
          <button class="btn btn-secondary" style="width:100%;justify-content:center;font-size:0.85rem;" onclick="logoutUser()">\
            🚪 Sign Out\
          </button>\
        </div>\
      </aside>\
      <div class="main-content">\
        <header class="topbar">\
          <div style="display:flex;align-items:center;gap:16px;">\
            <button class="hamburger" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')">☰</button>\
            <h1 id="pageHeading">' + pageTitle + '</h1>\
          </div>\
          <div class="topbar-actions" id="topbarActions"></div>\
        </header>\
        <main class="page-content" id="pageContent">\
          <div class="loading"><div class="spinner"></div></div>\
        </main>\
      </div>\
    </div>';

  document.body.insertAdjacentHTML('afterbegin', layoutHTML);

  initAuth(function(user, role) {
    var navEl = document.getElementById('sidebarNav');
    if (navEl) navEl.innerHTML = role === 'admin' ? adminNav : teacherNav;
    updateUserBadge();
    applyRoleUI();
    if (typeof onPageReady === 'function') onPageReady(user, role);
  });
}