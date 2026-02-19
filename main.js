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
   BookHive – main.js
   All interactive JavaScript enhancements
   ============================================================ */

/* ── 1. SCROLL-TRIGGERED FADE-UP ANIMATIONS ── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // stagger siblings inside grids
      const siblings = e.target.parentElement.querySelectorAll('.fade-up');
      siblings.forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 80);
      });
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


/* ── 2. NAVBAR: shrink on scroll + active link highlight ── */
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-btn)');
const sections = document.querySelectorAll('section[id], div[id]');

window.addEventListener('scroll', () => {
  // Shrink nav
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});


/* ── 3. ANIMATED COUNTER for stats ── */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const isComma = target.toString().includes(',');
  const raw = parseInt(target.toString().replace(/[^0-9]/g, ''));
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(eased * raw);

    // Format with commas (Indian style: 1,24,000)
    el.textContent = val.toLocaleString('en-IN') + suffix;

    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target; // ensure final value is exact
  }
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      const targets = ['1,24,000+', '8,500+', '340+', '25+'];
      nums.forEach((el, i) => animateCounter(el, targets[i]));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.stats');
if (statsEl) statObserver.observe(statsEl);


/* ── 4. SEARCH: suggestions + keyboard shortcut ── */
const searchInput = document.querySelector('.search-box input');
const searchBtn   = document.querySelector('.search-box button');

const suggestions = [
  'Data Structures & Algorithms', 'Indian History', 'Organic Chemistry',
  'Principles of Economics', 'Machine Learning', 'Civil Engineering',
  'Psychology Today', 'World Geography', 'Constitution of India',
  'Environmental Science', 'Business Management', 'Medical Physiology'
];

// Create suggestion dropdown
const dropdown = document.createElement('ul');
dropdown.className = 'search-dropdown';
searchInput?.closest('.search-wrap').appendChild(dropdown);

searchInput?.addEventListener('input', () => {
  const val = searchInput.value.trim().toLowerCase();
  dropdown.innerHTML = '';
  if (!val) { dropdown.classList.remove('open'); return; }

  const matches = suggestions.filter(s => s.toLowerCase().includes(val)).slice(0, 5);
  if (!matches.length) { dropdown.classList.remove('open'); return; }

  matches.forEach(m => {
    const li = document.createElement('li');
    // Bold the matching part
    const regex = new RegExp(`(${val})`, 'gi');
    li.innerHTML = m.replace(regex, '<strong>$1</strong>');
    li.addEventListener('mousedown', () => {
      searchInput.value = m;
      dropdown.classList.remove('open');
    });
    dropdown.appendChild(li);
  });
  dropdown.classList.add('open');
});

searchInput?.addEventListener('blur', () => {
  setTimeout(() => dropdown.classList.remove('open'), 150);
});

// Keyboard shortcut: press "/" to focus search
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput?.focus();
    searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (e.key === 'Escape') {
    searchInput?.blur();
    dropdown.classList.remove('open');
  }
});

// Search button feedback
searchBtn?.addEventListener('click', () => {
  const val = searchInput.value.trim();
  if (!val) {
    searchInput.classList.add('shake');
    searchInput.placeholder = 'Please enter a search term…';
    setTimeout(() => {
      searchInput.classList.remove('shake');
      searchInput.placeholder = 'Search by title, author, ISBN, or subject…';
    }, 600);
    return;
  }
  showToast(`🔍 Searching for "${val}"…`);
});


/* ── 5. BOOK CARDS: quick-view modal on click ── */
const bookData = [
  { emoji: '📗', title: 'Data Structures & Algorithms', author: 'Cormen et al.', tag: 'Computer Science', desc: 'The definitive guide to algorithms and data structures, used in top universities worldwide. Covers sorting, graphs, dynamic programming and more.' },
  { emoji: '📙', title: 'Indian History: A Concise Overview', author: 'Bipan Chandra', tag: 'History', desc: 'A comprehensive overview of Indian history from ancient civilizations to modern independence, written by one of India\'s most respected historians.' },
  { emoji: '📘', title: 'Principles of Economics', author: 'N. Gregory Mankiw', tag: 'Economics', desc: 'An accessible introduction to economics covering microeconomics, macroeconomics, and real-world applications used by millions of students.' },
  { emoji: '📕', title: 'Organic Chemistry', author: 'Morrison & Boyd', tag: 'Science', desc: 'A classic reference for organic chemistry students, covering fundamental concepts, reactions, and mechanisms with clarity and depth.' }
];

// Build modal
const modal = document.createElement('div');
modal.className = 'book-modal';
modal.innerHTML = `
  <div class="book-modal-inner">
    <button class="modal-close">✕</button>
    <div class="modal-cover"></div>
    <div class="modal-body">
      <span class="book-tag modal-tag"></span>
      <h2 class="modal-title"></h2>
      <p class="modal-author"></p>
      <p class="modal-desc"></p>
      <div class="modal-actions">
        <button class="btn-primary modal-reserve">Reserve Book</button>
        <button class="btn-secondary modal-wishlist">+ Wishlist</button>
      </div>
    </div>
  </div>`;
document.body.appendChild(modal);

document.querySelectorAll('.book-card').forEach((card, i) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const d = bookData[i];
    modal.querySelector('.modal-cover').textContent = d.emoji;
    modal.querySelector('.modal-tag').textContent    = d.tag;
    modal.querySelector('.modal-title').textContent  = d.title;
    modal.querySelector('.modal-author').textContent = '✍️ ' + d.author;
    modal.querySelector('.modal-desc').textContent   = d.desc;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
modal.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

modal.querySelector('.modal-reserve').addEventListener('click', () => {
  const title = modal.querySelector('.modal-title').textContent;
  showToast(`✅ "${title}" reserved successfully!`);
  closeModal();
});
modal.querySelector('.modal-wishlist').addEventListener('click', () => {
  const title = modal.querySelector('.modal-title').textContent;
  showToast(`❤️ Added to your wishlist!`);
});


/* ── 6. CATEGORY CARDS: ripple effect + filter toast ── */
document.querySelectorAll('.cat-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const name = card.querySelector('span:last-child').textContent;
    showToast(`📂 Browsing "${name}" category…`);

    // Ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = card.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top) + 'px';
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});


/* ── 7. NOTICE ITEMS: mark as read on click ── */
document.querySelectorAll('.notice-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('read');
    const dot = item.querySelector('.notice-dot');
    if (item.classList.contains('read')) {
      dot.style.background = '#4b5563';
      item.style.opacity = '0.55';
    } else {
      dot.style.background = '';
      item.style.opacity = '';
    }
  });
});


/* ── 8. BACK TO TOP BUTTON ── */
const backBtn = document.createElement('button');
backBtn.className = 'back-to-top';
backBtn.innerHTML = '↑';
backBtn.title = 'Back to top';
document.body.appendChild(backBtn);

window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 400);
});
backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ── 9. MOBILE HAMBURGER MENU ── */
const hamburger = document.createElement('button');
hamburger.className = 'hamburger';
hamburger.innerHTML = `<span></span><span></span><span></span>`;
hamburger.setAttribute('aria-label', 'Toggle menu');
nav.appendChild(hamburger);

const navLinksWrap = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksWrap.classList.toggle('mobile-open');
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinksWrap.classList.remove('mobile-open');
  }
});


/* ── 10. TOAST NOTIFICATION ── */
let toastTimer;
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ── 11. SMOOTH SCROLL for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navLinksWrap.classList.remove('mobile-open');
      hamburger.classList.remove('open');
    }
  });
});


/* ── 12. TYPING PLACEHOLDER EFFECT in search ── */
const placeholders = [
  'Search by title, author, ISBN…',
  'Try "Data Structures"…',
  'Try "Indian History"…',
  'Try "Organic Chemistry"…',
  'Try "Machine Learning"…',
];
let pIdx = 0, cIdx = 0, deleting = false;

function typePlaceholder() {
  if (document.activeElement === searchInput) {
    setTimeout(typePlaceholder, 100);
    return;
  }
  const current = placeholders[pIdx];
  if (!deleting) {
    searchInput.placeholder = current.substring(0, cIdx + 1);
    cIdx++;
    if (cIdx === current.length) {
      deleting = true;
      setTimeout(typePlaceholder, 1800);
      return;
    }
  } else {
    searchInput.placeholder = current.substring(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % placeholders.length;
    }
  }
  setTimeout(typePlaceholder, deleting ? 40 : 80);
}
if (searchInput) typePlaceholder();