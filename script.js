/* ============================================================
   script.js — H1004DAY Wedding Invitation
   ============================================================ */

'use strict';

/* ── CONFIG ─────────────────────────────────────────────────
   이곳에서 결혼식 정보를 수정하세요.
   ─────────────────────────────────────────────────────────── */
const CONFIG = {
  groomName:       '홍길동',
  brideName:       '김영희',
  weddingDate:     new Date('2025-10-04T14:00:00'), // 결혼식 날짜/시간
  calendarYear:    2025,
  calendarMonth:   10,   // 1~12
  weddingDay:      4,    // 달력에서 강조할 날
  venueName:       '그랜드 볼룸 웨딩홀',
  venueAddress:    '서울특별시 강남구 테헤란로 123 그랜드타워 B2F',
  kakaoMapUrl:     'https://map.kakao.com/link/search/그랜드볼룸웨딩홀',
  naverMapUrl:     'https://map.naver.com/v5/search/그랜드볼룸웨딩홀',
  groomPhone:      '01012345678',
  bridePhone:      '01087654321',
  rsvpDeadline:    '9월 20일',
  guestbookStorageKey: 'h1004day_guestbook',
};

/* ── UTILS ───────────────────────────────────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm   = pad(d.getMonth() + 1);
  const dd   = pad(d.getDate());
  const hh   = pad(d.getHours());
  const min  = pad(d.getMinutes());
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

let toastTimer = null;
function showToast(msg, duration = 2500) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── COUNTDOWN ───────────────────────────────────────────── */
(function initCountdown() {
  const days  = $('#cnt-days');
  const hours = $('#cnt-hours');
  const mins  = $('#cnt-mins');
  const secs  = $('#cnt-secs');
  if (!days) return;

  function tick() {
    const now  = Date.now();
    const diff = CONFIG.weddingDate.getTime() - now;

    if (diff <= 0) {
      // D-Day
      days.textContent  = '0';
      hours.textContent = '0';
      mins.textContent  = '0';
      secs.textContent  = '0';
      clearInterval(timer);
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    days.textContent  = d;
    hours.textContent = pad(h);
    mins.textContent  = pad(m);
    secs.textContent  = pad(s);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

/* ── CALENDAR ────────────────────────────────────────────── */
(function initCalendar() {
  const container = $('#calendar');
  if (!container) return;

  const { calendarYear: year, calendarMonth: month, weddingDay } = CONFIG;
  const today = new Date();

  const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const DAYS_KR  = ['일','월','화','수','목','금','토'];

  // First weekday of the month (0=Sun)
  const firstDay  = new Date(year, month - 1, 1).getDay();
  // Last date of the month
  const lastDate  = new Date(year, month, 0).getDate();

  // Header
  const header = document.createElement('div');
  header.className   = 'cal-header';
  header.textContent = `${year}년 ${MONTH_KR[month - 1]}`;
  container.appendChild(header);

  // Weekdays row
  const weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'cal-weekdays';
  DAYS_KR.forEach((d) => {
    const cell = document.createElement('div');
    cell.className   = 'cal-weekday';
    cell.textContent = d;
    weekdaysRow.appendChild(cell);
  });
  container.appendChild(weekdaysRow);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  // Empty cells before 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= lastDate; d++) {
    const cell    = document.createElement('div');
    const dayOfWk = (firstDay + d - 1) % 7;

    const classes = ['cal-day'];
    if (dayOfWk === 0) classes.push('sun');
    if (dayOfWk === 6) classes.push('sat');
    if (
      d === today.getDate() &&
      month - 1 === today.getMonth() &&
      year === today.getFullYear()
    ) classes.push('today');
    if (d === weddingDay) classes.push('wedding-day');

    cell.className   = classes.join(' ');
    cell.textContent = d;
    if (d === weddingDay) cell.setAttribute('aria-label', `${month}월 ${d}일 — 결혼식 날`);

    grid.appendChild(cell);
  }

  container.appendChild(grid);
})();

/* ── SCROLL FADE-IN ──────────────────────────────────────── */
(function initScrollFade() {
  const targets = $$('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ── MAP BUTTONS ─────────────────────────────────────────── */
(function initMapButtons() {
  const kakao = $('a.btn--kakao');
  const naver = $('a.btn--naver');
  if (kakao) kakao.href = CONFIG.kakaoMapUrl;
  if (naver) naver.href = CONFIG.naverMapUrl;
})();

/* ── GUESTBOOK ───────────────────────────────────────────── */
(function initGuestbook() {
  const form    = $('#guestbook-form');
  const list    = $('#guestbook-list');
  const msgArea = $('#gb-message');
  const counter = $('#gb-count');
  if (!form || !list) return;

  /* ---- Storage helpers ---- */
  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.guestbookStorageKey) || '[]');
    } catch { return []; }
  }

  function saveEntries(entries) {
    localStorage.setItem(CONFIG.guestbookStorageKey, JSON.stringify(entries));
  }

  /* ---- Render ---- */
  function renderEntries() {
    const entries = loadEntries();
    list.innerHTML = '';

    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className   = 'gb-empty';
      empty.textContent = '아직 방명록이 없습니다. 첫 번째로 메시지를 남겨보세요 💌';
      list.appendChild(empty);
      return;
    }

    // newest first
    [...entries].reverse().forEach((entry) => {
      list.appendChild(createEntryEl(entry));
    });
  }

  function createEntryEl(entry) {
    const el = document.createElement('article');
    el.className      = 'gb-entry';
    el.dataset.id     = entry.id;

    // Safely escape text
    const safe = (str) =>
      str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
         .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

    el.innerHTML = `
      <div class="gb-entry__header">
        <span class="gb-entry__name">${safe(entry.name)}</span>
        <div class="gb-entry__meta">
          <span class="gb-entry__date">${entry.date}</span>
          <button class="gb-entry__delete" type="button" aria-label="삭제">삭제</button>
        </div>
      </div>
      <p class="gb-entry__message">${safe(entry.message).replace(/\n/g,'<br>')}</p>
    `;

    el.querySelector('.gb-entry__delete').addEventListener('click', () => {
      openDeleteModal(entry.id, entry.passwordHash);
    });

    return el;
  }

  /* ---- Add entry ---- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name     = $('#gb-name').value.trim();
    const password = $('#gb-password').value.trim();
    const message  = msgArea.value.trim();

    if (!name || !password || !message) {
      showToast('이름, 비밀번호, 메시지를 모두 입력해주세요.');
      return;
    }
    if (message.length > 200) {
      showToast('메시지는 200자 이내로 입력해주세요.');
      return;
    }

    const entry = {
      id:           Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      message,
      passwordHash: simpleHash(password),
      date:         formatDate(new Date()),
    };

    const entries = loadEntries();
    entries.push(entry);
    saveEntries(entries);

    form.reset();
    if (counter) counter.textContent = '0 / 200';
    renderEntries();
    showToast('메시지가 등록되었습니다 💌');
  });

  /* ---- Character counter ---- */
  if (msgArea && counter) {
    msgArea.addEventListener('input', () => {
      counter.textContent = `${msgArea.value.length} / 200`;
    });
  }

  /* ---- Delete modal ---- */
  function openDeleteModal(entryId, storedHash) {
    // Remove existing modal if any
    const existing = $('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">비밀번호를 입력해주세요</h3>
        <input type="password" id="modal-pw" placeholder="비밀번호" maxlength="10" style="width:100%;" autocomplete="off" />
        <div class="modal-actions">
          <button class="btn btn--ghost" id="modal-cancel">취소</button>
          <button class="btn btn--danger" id="modal-confirm">삭제</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const pwInput = $('#modal-pw', overlay);
    pwInput.focus();

    function closeModal() { overlay.remove(); }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    $('#modal-cancel', overlay).addEventListener('click', closeModal);
    $('#modal-confirm', overlay).addEventListener('click', () => {
      const input = pwInput.value.trim();
      if (simpleHash(input) === storedHash) {
        const entries = loadEntries().filter((en) => en.id !== entryId);
        saveEntries(entries);
        renderEntries();
        showToast('삭제되었습니다.');
        closeModal();
      } else {
        pwInput.value = '';
        pwInput.placeholder = '비밀번호가 틀렸습니다 ❌';
        pwInput.classList.add('error-shake');
        setTimeout(() => pwInput.classList.remove('error-shake'), 600);
        showToast('비밀번호가 일치하지 않습니다.');
      }
    });

    // Enter key on password field
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#modal-confirm', overlay).click();
    });
  }

  /* ---- Simple hash (non-cryptographic, for UX only) ---- */
  function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
      hash |= 0; // 32-bit int
    }
    return hash.toString(36);
  }

  renderEntries();
})();

/* ── RSVP FORM ───────────────────────────────────────────── */
(function initRSVP() {
  const form   = $('#rsvp-form');
  const result = $('#rsvp-result');
  const btn    = $('#rsvp-submit');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = $('#rsvp-name').value.trim();
    const phone = $('#rsvp-phone').value.trim();
    const attendanceEl = $('input[name="attendance"]:checked');

    if (!name) { showToast('이름을 입력해주세요.'); $('#rsvp-name').focus(); return; }
    if (!phone) { showToast('연락처를 입력해주세요.'); $('#rsvp-phone').focus(); return; }
    if (!attendanceEl) { showToast('참석 여부를 선택해주세요.'); return; }

    // Formspree check — warn if placeholder not replaced
    if (form.action.includes('YOUR_FORM_ID')) {
      // Demo mode: show success without actually sending
      handleSuccess('(데모 모드) 참석 의사가 전달되었습니다! 실제 운영 시 Formspree Form ID를 교체하세요.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = '전송 중...';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        handleSuccess('참석 의사가 전달되었습니다! 감사합니다 💍');
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || '전송에 실패했습니다.');
      }
    } catch (err) {
      if (result) {
        result.textContent = `오류: ${err.message}`;
        result.className   = 'rsvp__result error';
      }
      showToast('전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      btn.disabled    = false;
      btn.textContent = '참석 의사 전달하기';
    }
  });

  function handleSuccess(msg) {
    if (result) {
      result.textContent = msg;
      result.className   = 'rsvp__result success';
    }
    showToast('✅ 전달 완료!');
    btn.disabled    = false;
    btn.textContent = '참석 의사 전달하기';
  }
})();

/* ── ERROR SHAKE ANIMATION (CSS-in-JS fallback) ─────────── */
(function addShakeStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes error-shake {
      0%,100% { transform:translateX(0); }
      20%      { transform:translateX(-6px); }
      40%      { transform:translateX(6px); }
      60%      { transform:translateX(-4px); }
      80%      { transform:translateX(4px); }
    }
    .error-shake { animation: error-shake .4s ease; }
  `;
  document.head.appendChild(style);
})();

/* ── SMOOTH NAV ACTIVE ───────────────────────────────────── */
(function initSmoothLinks() {
  // Phone links — format nicely
  $$('a[href^="tel:"]').forEach((a) => {
    a.addEventListener('click', () => {
      showToast('전화 앱이 열립니다 📞');
    });
  });
})();

/* ── PREVENT DOUBLE FORM SUBMIT ON MOBILE ────────────────── */
document.addEventListener('touchstart', function(){}, {passive:true});
