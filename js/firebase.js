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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// ── FORCE LOCAL PERSISTENCE ──
// This must complete before any signIn call.
// On GitHub Pages this is critical — session persistence defaults
// to SESSION which dies on every page load.
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ── PAYMENT STRUCTURE ──
const PAYMENT_RULES = {
  6:  { base: 1000, bundle: 800  },
  7:  { base: 1000, bundle: 800  },
  8:  { base: 1000, bundle: 800  },
  9:  { base: 1000, bundle: 800  },
  10: { base: 1250, bundle: 1000 },
  11: { base: 1500, bundle: 1250 },
};
const TEACHER_CUT = 0.75;
const ADMIN_EMAIL = "admin@sipyora.com";

function isAdmin(email) { return email === ADMIN_EMAIL; }

function calculateStudentFee(grade, numSubjects) {
  var rule = PAYMENT_RULES[parseInt(grade)];
  if (!rule || numSubjects === 0) return 0;
  if (numSubjects >= 5) return rule.bundle * numSubjects;
  return rule.base * numSubjects;
}

function calculateTeacherPay(total) { return total * TEACHER_CUT; }

function showToast(message, type) {
  type = type || 'info';
  var c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  var icons = { success:'✅', error:'❌', info:'ℹ️' };
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = '<span>'+(icons[type]||'ℹ️')+'</span><span>'+message+'</span>';
  c.appendChild(t);
  setTimeout(function(){ t.remove(); }, 3500);
}

function openModal(id)  { var e=document.getElementById(id); if(e) e.classList.add('open'); }
function closeModal(id) { var e=document.getElementById(id); if(e) e.classList.remove('open'); }
function formatRs(a)    { return 'Rs '+Number(a||0).toLocaleString('en-IN'); }

function formatDate(ts) {
  if (!ts) return '—';
  var d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}

function getMonthYear(date) {
  date = date||new Date();
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
}

function monthLabel(ym) {
  if (!ym) return '';
  var p=ym.split('-');
  return new Date(p[0],p[1]-1,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'});
}
