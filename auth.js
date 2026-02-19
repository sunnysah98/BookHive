/*
  Project : BookHive – Library Management System
  Author  : [Sunny Kumar Sah]
  GitHub  : https://github.com/sunnysah98
  Year    : 2026
  Warning : Unauthorized copying or reuse of this
            code is strictly prohibited without
            written permission from the author.
*/


/* ============================================================
   BookHive – auth.js
   Full Login / Sign Up modal logic
   ============================================================ */

/* ── SELECTORS ── */
const overlay      = document.getElementById('authOverlay');
const authClose    = document.getElementById('authClose');
const authSuccess  = document.getElementById('authSuccess');
const authFormWrap = document.getElementById('authFormWrap');
const successTitle = document.getElementById('successTitle');
const successMsg   = document.getElementById('successMsg');

/* ── OPEN / CLOSE MODAL ── */
function openAuth(tab = 'login') {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
  resetAll();
}
function closeAuth() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Trigger: "Sign In" nav button
document.querySelector('.nav-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  openAuth('login');
});

// Trigger: close button & backdrop click
authClose.addEventListener('click', closeAuth);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAuth(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuth(); });


/* ── TAB SWITCHING (Login / Sign Up) ── */
const tabs   = document.querySelectorAll('.auth-tab');
const panels = { login: document.getElementById('panelLogin'), signup: document.getElementById('panelSignup') };

function switchTab(name) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  Object.keys(panels).forEach(k => panels[k].classList.toggle('active', k === name));
  // Keep method toggle in sync
  syncMethod();
}
tabs.forEach(t => t.addEventListener('click', () => { switchTab(t.dataset.tab); resetAll(); }));


/* ── METHOD TOGGLE (Email / Mobile) ── */
let currentMethod = 'email';
const methodBtns  = document.querySelectorAll('.method-btn');

function syncMethod() {
  const m = currentMethod;
  // Login
  document.getElementById('loginEmail').style.display  = m === 'email' ? 'block' : 'none';
  document.getElementById('loginMobile').style.display = m === 'mobile' ? 'block' : 'none';
  // Signup
  document.getElementById('signupEmail').style.display  = m === 'email' ? 'block' : 'none';
  document.getElementById('signupMobile').style.display = m === 'mobile' ? 'block' : 'none';
}

methodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentMethod = btn.dataset.method;
    methodBtns.forEach(b => b.classList.toggle('active', b === btn));
    syncMethod();
    resetAll();
  });
});


/* ── PASSWORD VISIBILITY TOGGLE ── */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁';
  });
});


/* ── PASSWORD STRENGTH METER ── */
const signupPw     = document.getElementById('signupPwInput');
const bars         = [document.getElementById('sb1'), document.getElementById('sb2'),
                      document.getElementById('sb3'), document.getElementById('sb4')];
const strengthLabel = document.getElementById('strengthLabel');

const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
const strengthNames  = ['Weak', 'Fair', 'Good', 'Strong'];

signupPw?.addEventListener('input', () => {
  const v = signupPw.value;
  let score = 0;
  if (v.length >= 8)             score++;
  if (/[A-Z]/.test(v))          score++;
  if (/[0-9]/.test(v))          score++;
  if (/[^A-Za-z0-9]/.test(v))   score++;

  bars.forEach((b, i) => {
    b.style.background = i < score ? strengthColors[score - 1] : 'rgba(255,255,255,0.08)';
  });
  strengthLabel.textContent = v.length ? strengthNames[score - 1] || '' : '';
  strengthLabel.style.color = score > 0 ? strengthColors[score - 1] : 'var(--muted)';
});


/* ── VALIDATION HELPERS ── */
function isValidEmail(v)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidMobile(v) { return /^\d{10}$/.test(v); }
function isValidName(v)   { return v.trim().length >= 2; }

function setError(inputId, errId, show) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  input?.classList.toggle('error', show);
  err?.classList.toggle('show', show);
  return !show;
}
function clearError(inputId, errId) {
  document.getElementById(inputId)?.classList.remove('error', 'success');
  document.getElementById(errId)?.classList.remove('show');
}
function markSuccess(inputId) {
  const input = document.getElementById(inputId);
  input?.classList.remove('error');
  input?.classList.add('success');
}


/* ── LOADING STATE on button ── */
function setLoading(btn, state) {
  if (state) {
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner"></span> Please wait…';
    btn.classList.add('loading');
  } else {
    btn.innerHTML = btn.dataset.original || btn.innerHTML;
    btn.classList.remove('loading');
  }
}


/* ── SHOW SUCCESS SCREEN ── */
function showSuccess(title, msg) {
  authFormWrap.style.display = 'none';
  authSuccess.classList.add('show');
  successTitle.textContent = title;
  successMsg.textContent   = msg;
  setTimeout(() => closeAuth(), 3500);
}


/* ── RESET ALL FIELDS ── */
function resetAll() {
  // Clear inputs
  ['loginEmailInput','loginPwInput','loginMobileInput',
   'signupName','signupEmailInput','signupPwInput',
   'signupMobileName','signupMobileInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error','success'); }
  });
  // Hide errors
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
  // Reset password strength
  bars.forEach(b => b.style.background = 'rgba(255,255,255,0.08)');
  if (strengthLabel) strengthLabel.textContent = '';
  // Hide OTP boxes
  document.getElementById('loginOtpBox').style.display  = 'none';
  document.getElementById('signupOtpBox').style.display = 'none';
  // Reset success screen
  authSuccess.classList.remove('show');
  authFormWrap.style.display = '';
}


/* ══════════════════════════════════════════
   LOGIN — EMAIL
   ══════════════════════════════════════════ */
document.getElementById('loginEmailBtn')?.addEventListener('click', () => {
  const email = document.getElementById('loginEmailInput').value;
  const pw    = document.getElementById('loginPwInput').value;

  const emailOk = setError('loginEmailInput', 'loginEmailErr', !isValidEmail(email));
  const pwOk    = setError('loginPwInput',    'loginPwErr',    pw.length < 6);

  if (!emailOk || !pwOk) return;
  markSuccess('loginEmailInput'); markSuccess('loginPwInput');

  const btn = document.getElementById('loginEmailBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    showSuccess('Welcome back! 👋', `Logged in as ${email}. Enjoy your reading session.`);
  }, 1500);
});

// Live validation
document.getElementById('loginEmailInput')?.addEventListener('blur', () => {
  const v = document.getElementById('loginEmailInput').value;
  if (v) isValidEmail(v) ? markSuccess('loginEmailInput') : setError('loginEmailInput','loginEmailErr', true);
});


/* ══════════════════════════════════════════
   LOGIN — MOBILE / OTP
   ══════════════════════════════════════════ */
document.getElementById('loginOtpBtn')?.addEventListener('click', () => {
  const mob = document.getElementById('loginMobileInput').value;
  if (!setError('loginMobileInput', 'loginMobileErr', !isValidMobile(mob))) return;
  markSuccess('loginMobileInput');

  const btn = document.getElementById('loginOtpBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    document.getElementById('loginOtpTarget').textContent = '+91 ' + mob;
    document.getElementById('loginOtpBox').style.display = 'block';
    startTimer('loginTimer', 'loginResendBtn', 30);
    focusFirstOtp('loginOtpBox');
  }, 1000);
});

document.getElementById('loginVerifyBtn')?.addEventListener('click', () => {
  const otp = getOtp('loginOtpBox');
  if (otp.length < 6) { showToast('⚠️ Please enter all 6 digits.'); return; }
  const btn = document.getElementById('loginVerifyBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    const mob = document.getElementById('loginMobileInput').value;
    showSuccess('Welcome back! 👋', `Logged in with mobile number +91 ${mob}.`);
  }, 1400);
});

document.getElementById('loginResendBtn')?.addEventListener('click', () => {
  showToast('📲 OTP resent successfully!');
  startTimer('loginTimer', 'loginResendBtn', 30);
});


/* ══════════════════════════════════════════
   SIGN UP — EMAIL
   ══════════════════════════════════════════ */
document.getElementById('signupEmailBtn')?.addEventListener('click', () => {
  const name  = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmailInput').value;
  const pw    = document.getElementById('signupPwInput').value;

  const nameOk  = setError('signupName',       'signupNameErr',  !isValidName(name));
  const emailOk = setError('signupEmailInput',  'signupEmailErr', !isValidEmail(email));
  const pwOk    = setError('signupPwInput',     'signupPwErr',    pw.length < 8);

  if (!nameOk || !emailOk || !pwOk) return;
  markSuccess('signupName'); markSuccess('signupEmailInput'); markSuccess('signupPwInput');

  const btn = document.getElementById('signupEmailBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    showSuccess(`Welcome, ${name.trim().split(' ')[0]}! 🎉`,
      `Your account is created with ${email}. Start exploring the library!`);
  }, 1600);
});

// Live validation
document.getElementById('signupEmailInput')?.addEventListener('blur', () => {
  const v = document.getElementById('signupEmailInput').value;
  if (v) isValidEmail(v) ? markSuccess('signupEmailInput') : setError('signupEmailInput','signupEmailErr', true);
});
document.getElementById('signupName')?.addEventListener('blur', () => {
  const v = document.getElementById('signupName').value;
  if (v) isValidName(v) ? markSuccess('signupName') : setError('signupName','signupNameErr', true);
});


/* ══════════════════════════════════════════
   SIGN UP — MOBILE / OTP
   ══════════════════════════════════════════ */
document.getElementById('signupOtpBtn')?.addEventListener('click', () => {
  const name = document.getElementById('signupMobileName').value;
  const mob  = document.getElementById('signupMobileInput').value;

  const nameOk = setError('signupMobileName',  'signupMobileNameErr', !isValidName(name));
  const mobOk  = setError('signupMobileInput', 'signupMobileErr',     !isValidMobile(mob));
  if (!nameOk || !mobOk) return;
  markSuccess('signupMobileName'); markSuccess('signupMobileInput');

  const btn = document.getElementById('signupOtpBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    document.getElementById('signupOtpTarget').textContent = '+91 ' + mob;
    document.getElementById('signupOtpBox').style.display = 'block';
    startTimer('signupTimer', 'signupResendBtn', 30);
    focusFirstOtp('signupOtpBox');
  }, 1000);
});

document.getElementById('signupVerifyBtn')?.addEventListener('click', () => {
  const otp = getOtp('signupOtpBox');
  if (otp.length < 6) { showToast('⚠️ Please enter all 6 digits.'); return; }
  const btn = document.getElementById('signupVerifyBtn');
  setLoading(btn, true);
  setTimeout(() => {
    setLoading(btn, false);
    const name = document.getElementById('signupMobileName').value;
    showSuccess(`Welcome, ${name.trim().split(' ')[0]}! 🎉`,
      'Your account is ready. Start exploring the library!');
  }, 1400);
});

document.getElementById('signupResendBtn')?.addEventListener('click', () => {
  showToast('📲 OTP resent successfully!');
  startTimer('signupTimer', 'signupResendBtn', 30);
});


/* ══════════════════════════════════════════
   OTP HELPERS
   ══════════════════════════════════════════ */

// Auto-advance between OTP boxes and allow backspace
function setupOtpInputs(boxId) {
  const boxes = document.querySelectorAll(`#${boxId} .otp-boxes input`);
  boxes.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) boxes[i - 1].focus();
    });
    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
      [...pasted].slice(0, boxes.length).forEach((ch, j) => { if (boxes[j]) boxes[j].value = ch; });
      const next = Math.min(pasted.length, boxes.length - 1);
      boxes[next].focus();
    });
  });
}
setupOtpInputs('loginOtpBox');
setupOtpInputs('signupOtpBox');

function focusFirstOtp(boxId) {
  const first = document.querySelector(`#${boxId} .otp-boxes input`);
  setTimeout(() => first?.focus(), 100);
}

function getOtp(boxId) {
  return [...document.querySelectorAll(`#${boxId} .otp-boxes input`)]
    .map(i => i.value).join('');
}


/* ── COUNTDOWN TIMER for OTP resend ── */
function startTimer(spanId, btnId, seconds) {
  const span = document.getElementById(spanId);
  const btn  = document.getElementById(btnId);
  btn.disabled = true;
  let t = seconds;
  span.textContent = t;
  const iv = setInterval(() => {
    t--;
    span.textContent = t;
    if (t <= 0) {
      clearInterval(iv);
      btn.disabled = false;
      btn.innerHTML = 'Resend OTP';
    }
  }, 1000);
}


/* ── SOCIAL BUTTONS ── */
document.querySelectorAll('.social-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const provider = btn.textContent.trim();
    showToast(`🔗 Redirecting to ${provider} login…`);
  });
});


/* ── FORGOT PASSWORD ── */
document.querySelectorAll('.forgot-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmailInput').value;
    if (!isValidEmail(email)) {
      setError('loginEmailInput','loginEmailErr', true);
      document.getElementById('loginEmailInput').focus();
      showToast('⚠️ Enter your email first to reset password.');
      return;
    }
    showToast(`📧 Password reset link sent to ${email}`);
  });
});


/* ── showToast (fallback if main.js not loaded yet) ── */
if (typeof showToast === 'undefined') {
  window.showToast = function(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };
}