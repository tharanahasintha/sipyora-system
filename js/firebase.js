// js/firebase.js

const firebaseConfig = {
    apiKey: "AIzaSyAc7gMEuMTYI5GKWhdQhIJCQ35ZehTiB-c",
    authDomain: "sipyora.firebaseapp.com",
    projectId: "sipyora",
    storageBucket: "sipyora.firebasestorage.app",
    messagingSenderId: "265841398933",
    appId: "1:265841398933:web:36b736d8a8f765152df79c",
    measurementId: "G-TSNTZ7XN5Y"
};



// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ── PAYMENT STRUCTURE ──
const PAYMENT_RULES = {
  6:  { base: 1000, bundle: 800 },
  7:  { base: 1000, bundle: 800 },
  8:  { base: 1000, bundle: 800 },
  9:  { base: 1000, bundle: 800 },
  10: { base: 1250, bundle: 1000 },
  11: { base: 1500, bundle: 1250 },
};

const TEACHER_CUT = 0.75;

// ── ADMIN EMAIL ── Change this to your admin email
const ADMIN_EMAIL = "admin@sipyora.com";

function isAdmin(email) {
  return email === ADMIN_EMAIL;
}

function calculateStudentFee(grade, numSubjects) {
  const rule = PAYMENT_RULES[parseInt(grade)];
  if (!rule || numSubjects === 0) return 0;
  if (numSubjects >= 5) return rule.bundle * numSubjects;
  return rule.base * numSubjects;
}

function calculateTeacherPay(totalCollected) {
  return totalCollected * TEACHER_CUT;
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span>' + (icons[type] || 'ℹ️') + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3500);
}

function openModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function formatRs(amount) {
  return 'Rs ' + Number(amount || 0).toLocaleString('en-IN');
}

function formatDate(ts) {
  if (!ts) return '—';
  var d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthYear(date) {
  date = date || new Date();
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

function monthLabel(ym) {
  if (!ym) return '';
  var parts = ym.split('-');
  return new Date(parts[0], parts[1] - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}