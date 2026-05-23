/* ============================================================
   script.js — Copenhagen Wedding Invitation
   Vanilla JS only · No external libraries
   ============================================================ */
'use strict';

/* ── ZOOM PREVENTION ─────────────────────────────────────────
   viewport meta (user-scalable=no) is sufficient for most
   browsers, but iOS 10+ re-enables zoom — block it with JS.
   ─────────────────────────────────────────────────────────── */
(function preventZoom() {
  /* Block pinch-to-zoom (multi-touch move) */
  document.addEventListener('touchmove', function(e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  /* Block double-tap zoom (two taps within 300 ms) */
  var _lastTap = 0;
  document.addEventListener('touchend', function(e) {
    var now = Date.now();
    if (now - _lastTap < 300) {
      e.preventDefault();
    }
    _lastTap = now;
  }, { passive: false });
}());

/* ── CONFIG ──────────────────────────────────────────────────
   결혼식 정보를 여기서 수정하세요.
   ─────────────────────────────────────────────────────────── */
var CONFIG = {
  weddingDate:      new Date('2026-10-04T14:30:00'),
  guestbookKey:     'h1004day_gb_v2',
};

/* ── UTILS ───────────────────────────────────────────────────*/
var $ = function(sel, ctx) { return (ctx || document).querySelector(sel); };
var $$ = function(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };
function pad(n) { return String(n).padStart(2, '0'); }
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* Toast */
var _toastTimer = null;
function toast(msg, ms) {
  var el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { el.classList.remove('show'); }, ms || 2600);
}

/* ── LUCIDE ICONS ─────────────────────────────────────────── */
/* Initialise all data-lucide icons in the document            */
function initIcons() {
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

/* ── COUNTDOWN ───────────────────────────────────────────────*/
(function initCountdown() {
  var dEl = $('#cnt-days'), hEl = $('#cnt-hours'),
      mEl = $('#cnt-mins'), sEl = $('#cnt-secs');
  if (!dEl) return;

  function tick() {
    var diff = CONFIG.weddingDate - Date.now();
    if (diff <= 0) {
      var box = $('#countdown');
      if (box) box.innerHTML = '<p style="font-family:var(--serif);font-style:italic;font-size:.9rem;letter-spacing:.1em;color:var(--muted);">D - Day</p>';
      return;
    }
    var s = Math.floor(diff / 1000);
    dEl.textContent = Math.floor(s / 86400);
    hEl.textContent = pad(Math.floor(s % 86400 / 3600));
    mEl.textContent = pad(Math.floor(s % 3600 / 60));
    sEl.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
}());

/* ── SCROLL REVEAL (IntersectionObserver) ────────────────────
   Progressive enhancement:
   - JS adds 'io-ready' to <html> → CSS sets initial opacity:0
   - Observer adds 'in-view' when element enters viewport
   - Without JS / on error → content is always visible         */
(function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('io-ready');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  $$('.reveal').forEach(function(el) { observer.observe(el); });
}());

/* ── SCROLL IMAGE (parallax + reveal) ───────────────────────
   ① IntersectionObserver → .is-visible → CSS fade+scale-in
   ② scroll 이벤트 → translateY ±24 px 패럴랙스
   ─────────────────────────────────────────────────────────── */
(function initScrollImg() {
  var section = document.getElementById('scroll_Img');
  var photo   = document.getElementById('scroll-img-photo');
  if (!section || !photo) return;

  /* ① 뷰포트 진입 시 이미지 페이드+스케일 인 */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          photo.classList.add('is-visible');
          revealObs.unobserve(section);
        }
      });
    }, { threshold: 0.06 });
    revealObs.observe(section);
  } else {
    photo.classList.add('is-visible');
  }

  /* ② 스크롤 패럴랙스 */
  function tick() {
    var rect     = section.getBoundingClientRect();
    var wh       = window.innerHeight;
    if (rect.bottom < 0 || rect.top > wh) return;
    var progress = (wh - rect.top) / (wh + rect.height); /* 0→1 */
    var shift    = (progress - 0.5) * 48;                /* ±24 px */
    /* .is-visible 이후에만 패럴랙스 transform 적용 (CSS 애니메이션과 충돌 방지) */
    if (photo.classList.contains('is-visible')) {
      photo.style.transform = 'translateY(' + shift.toFixed(1) + 'px) scale(1)';
    }
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}());

/* ── PETALS ──────────────────────────────────────────────────
   Creates N <div class="petal"> elements inside #petals-canvas.
   Size, position, duration, delay are randomised per petal.
   ─────────────────────────────────────────────────────────── */
(function initPetals() {
  var canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  var N = 22;
  for (var i = 0; i < N; i++) {
    var p = document.createElement('div');
    p.className = 'petal';

    var size  = 6  + Math.random() * 9;          /* 6–15 px        */
    var left  = Math.random() * 106 - 3;          /* -3 % – 103 %   */
    var dur   = 10 + Math.random() * 12;          /* 10–22 s        */
    var delay = -Math.random() * 20;              /* already in-flight */

    p.style.cssText =
      'left:'               + left.toFixed(1)  + '%;' +
      'width:'              + size.toFixed(1)  + 'px;' +
      'height:'             + size.toFixed(1)  + 'px;' +
      'animation-duration:' + dur.toFixed(1)   + 's;' +
      'animation-delay:'    + delay.toFixed(1) + 's;';

    canvas.appendChild(p);
  }
}());

/* ── GALLERY MODAL ───────────────────────────────────────────*/
(function initGallery() {
  var items   = $$('.gallery__item');
  var modal   = $('#gallery-modal');
  var img     = $('#gallery-modal-img');
  var counter = $('#gallery-modal-counter');
  var btnPrev = $('.gallery-modal__prev', modal);
  var btnNext = $('.gallery-modal__next', modal);
  var btnClose= $('.gallery-modal__close', modal);
  var backdrop= $('.gallery-modal__backdrop', modal);
  if (!modal || !items.length) return;

  /* Collect image sources from gallery items */
  var srcs = items.map(function(item) {
    var i = item.querySelector('img');
    return i ? i.src : '';
  });
  var current = 0;

  function show(idx) {
    current = (idx + srcs.length) % srcs.length;
    /* Re-trigger animation */
    img.style.animation = 'none';
    img.offsetHeight;                      /* reflow */
    img.style.animation = '';
    img.src = srcs[current];
    img.alt = '사진 ' + (current + 1);
    if (counter) counter.textContent = (current + 1) + ' / ' + srcs.length;
  }

  function open(idx) {
    show(idx);
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    btnClose && btnClose.focus();
  }

  function close() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    items[current] && items[current].focus();
  }

  /* Gallery item click */
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      open(parseInt(item.dataset.idx || '0', 10));
    });
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  if (btnPrev)  btnPrev.addEventListener('click',  function() { show(current - 1); });
  if (btnNext)  btnNext.addEventListener('click',  function() { show(current + 1); });
  if (btnClose) btnClose.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  /* Keyboard */
  document.addEventListener('keydown', function(e) {
    if (modal.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });

  /* Touch swipe */
  var touchStartX = 0;
  modal.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  modal.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) { dx < 0 ? show(current + 1) : show(current - 1); }
  }, { passive: true });
}());

/* ── ACCORDION (max-height animation) ───────────────────────*/
(function initAccordion() {
  $$('.accordion__btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var bodyId = btn.getAttribute('aria-controls');
      var body   = bodyId ? $('#' + bodyId) : btn.nextElementSibling;
      if (!body) return;

      btn.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        body.classList.remove('open');
      } else {
        body.classList.add('open');
      }
    });
  });
}());

/* ── COPY TO CLIPBOARD ───────────────────────────────────────*/
(function initCopy() {
  $$('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var text = btn.getAttribute('data-copy');
      if (!text) return;

      function onOk() {
        btn.classList.add('copied');
        var span = btn.querySelector('span');
        var orig = span ? span.textContent : '';
        if (span) span.textContent = '완료 ✓';
        toast('계좌번호가 복사되었습니다.');
        setTimeout(function() {
          btn.classList.remove('copied');
          if (span) span.textContent = orig;
        }, 2200);
      }

      function fallback() {
        var inp = document.createElement('input');
        inp.value = text;
        inp.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(inp);
        inp.select();
        inp.setSelectionRange(0, 9999);
        try { document.execCommand('copy'); onOk(); }
        catch(e) { toast('직접 길게 눌러 복사해주세요.'); }
        document.body.removeChild(inp);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onOk, fallback);
      } else {
        fallback();
      }
    });
  });
}());

/* ── GUESTBOOK ───────────────────────────────────────────────*/
(function initGuestbook() {
  var form    = $('#guestbook-form');
  var list    = $('#guestbook-list');
  var msgArea = $('#gb-message');
  var cntEl   = $('#gb-count');
  if (!form || !list) return;

  /* Storage */
  function load() {
    try { return JSON.parse(localStorage.getItem(CONFIG.guestbookKey) || '[]'); }
    catch(e) { return []; }
  }
  function save(entries) {
    localStorage.setItem(CONFIG.guestbookKey, JSON.stringify(entries));
  }

  /* Simple non-cryptographic hash (UI-only protection) */
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
      h |= 0;
    }
    return h.toString(36);
  }

  function formatDt(d) {
    var dt = new Date(d);
    return dt.getFullYear() + '.' +
           pad(dt.getMonth() + 1) + '.' +
           pad(dt.getDate()) + ' ' +
           pad(dt.getHours()) + ':' +
           pad(dt.getMinutes());
  }

  /* Render */
  function render() {
    var entries = load();
    list.innerHTML = '';
    if (!entries.length) {
      list.innerHTML = '<p class="gb-empty">아직 방명록이 없습니다.<br>첫 번째로 메시지를 남겨보세요.</p>';
      return;
    }
    entries.slice().reverse().forEach(function(e) {
      var el = document.createElement('article');
      el.className = 'gb-entry';
      el.innerHTML =
        '<div class="gb-entry__top">' +
          '<span class="gb-entry__name">' + esc(e.name) + '</span>' +
          '<span class="gb-entry__right">' +
            '<span class="gb-entry__date">' + e.date + '</span>' +
            '<button class="gb-entry__del" type="button" aria-label="삭제">삭제</button>' +
          '</span>' +
        '</div>' +
        '<p class="gb-entry__msg">' + esc(e.msg).replace(/\n/g, '<br>') + '</p>';
      el.querySelector('.gb-entry__del').addEventListener('click', function() {
        openPwModal(e.id, e.ph);
      });
      list.appendChild(el);
    });
  }

  /* Submit */
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = $('#gb-name').value.trim();
    var pw   = $('#gb-password').value.trim();
    var msg  = msgArea.value.trim();
    if (!name || !pw || !msg) { toast('이름, 비밀번호, 메시지를 입력해주세요.'); return; }
    if (msg.length > 200) { toast('메시지는 200자 이내로 입력해주세요.'); return; }

    var entries = load();
    entries.push({
      id:   Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      name: name,
      msg:  msg,
      ph:   hash(pw),
      date: formatDt(Date.now()),
    });
    save(entries);
    form.reset();
    if (cntEl) cntEl.textContent = '0 / 200';
    render();
    toast('메시지가 등록되었습니다.');
  });

  /* Char counter */
  if (msgArea && cntEl) {
    msgArea.addEventListener('input', function() {
      cntEl.textContent = msgArea.value.length + ' / 200';
    });
  }

  /* Password modal */
  var modal    = $('#pw-modal');
  var pwInput  = $('#pw-modal-input');
  var btnCancel= $('#pw-modal-cancel');
  var btnConf  = $('#pw-modal-confirm');
  var _pendingId = null;
  var _pendingPh = null;

  function openPwModal(id, ph) {
    _pendingId = id; _pendingPh = ph;
    if (pwInput) { pwInput.value = ''; pwInput.placeholder = ' '; }
    modal.removeAttribute('hidden');
    setTimeout(function() { pwInput && pwInput.focus(); }, 50);
  }
  function closePwModal() {
    modal.setAttribute('hidden', '');
    _pendingId = null; _pendingPh = null;
  }
  function tryDelete() {
    var val = pwInput ? pwInput.value.trim() : '';
    if (hash(val) === _pendingPh) {
      save(load().filter(function(e) { return e.id !== _pendingId; }));
      render();
      toast('삭제되었습니다.');
      closePwModal();
    } else {
      pwInput.value = '';
      pwInput.style.animation = 'none';
      pwInput.offsetHeight;
      pwInput.style.animation = 'shake .35s ease';
      toast('비밀번호가 일치하지 않습니다.');
    }
  }

  if (btnCancel) btnCancel.addEventListener('click', closePwModal);
  if (btnConf)   btnConf.addEventListener('click', tryDelete);
  if (pwInput)   pwInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') tryDelete();
  });
  if (modal) modal.addEventListener('click', function(e) {
    if (e.target === modal) closePwModal();
  });

  /* Shake keyframe */
  var s = document.createElement('style');
  s.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}';
  document.head.appendChild(s);

  render();
}());

/* ── RSVP FORM ───────────────────────────────────────────────*/
(function initRSVP() {
  var form   = $('#rsvp-form');
  var result = $('#rsvp-result');
  var btn    = $('#rsvp-submit');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name  = $('#rsvp-name').value.trim();
    var phone = $('#rsvp-phone').value.trim();
    var att   = $('input[name="attendance"]:checked');
    if (!name)  { toast('이름을 입력해주세요.'); $('#rsvp-name').focus(); return; }
    if (!phone) { toast('연락처를 입력해주세요.'); $('#rsvp-phone').focus(); return; }
    if (!att)   { toast('참석 여부를 선택해주세요.'); return; }

    /* Demo mode if Formspree ID not set */
    if (form.action.includes('YOUR_FORM_ID')) {
      if (result) { result.textContent = '(데모) 전달 완료! Formspree ID를 교체해주세요.'; result.className = 'rsvp-form__result ok'; }
      toast('✓ 전달 완료 (데모 모드)');
      return;
    }

    btn.disabled = true;
    btn.textContent = '전송 중…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    }).then(function(res) {
      if (res.ok) {
        if (result) { result.textContent = '참석 의사가 전달되었습니다. 감사합니다.'; result.className = 'rsvp-form__result ok'; }
        toast('✓ 전달 완료!');
        form.reset();
      } else {
        throw new Error('서버 오류');
      }
    }).catch(function(err) {
      if (result) { result.textContent = '전송에 실패했습니다. 다시 시도해주세요.'; result.className = 'rsvp-form__result err'; }
      toast('전송 실패. 다시 시도해주세요.');
    }).finally(function() {
      btn.disabled = false;
      btn.textContent = '참석 의사 전달하기';
    });
  });
}());

/* ── RSVP MODAL (auto-open on page load) ─────────────────────
   Opens 400 ms after page load so the page has time to paint.
   Closes on ✕ button / backdrop click / Esc / skip link.
   On successful Formspree submit, auto-closes after 2 s.
   ─────────────────────────────────────────────────────────── */
(function initRSVPModal() {
  var modal    = document.getElementById('rsvp-modal');
  var backdrop = document.getElementById('rsvp-modal-backdrop');
  var btnClose = document.getElementById('rsvp-modal-close');
  var btnSkip  = document.getElementById('rsvp-modal-skip');
  var form     = document.getElementById('rsvp-m-form');
  var result   = document.getElementById('rsvp-m-result');
  var btn      = document.getElementById('rsvp-m-submit');
  if (!modal) return;

  function openModal() {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    /* Ensure lucide icons inside modal are rendered */
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons({ nodes: [modal] });
    }
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* Auto-open: 400 ms delay lets the page render first */
  setTimeout(openModal, 400);

  /* Close triggers */
  if (btnClose)  btnClose.addEventListener('click', closeModal);
  if (btnSkip)   btnSkip.addEventListener('click', closeModal);
  if (backdrop)  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    if (!modal.hasAttribute('hidden') && e.key === 'Escape') closeModal();
  });

  /* Form submit */
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var nameEl  = document.getElementById('rsvp-m-name');
    var phoneEl = document.getElementById('rsvp-m-phone');
    var att     = form.querySelector('input[name="m-attendance"]:checked');

    if (!nameEl.value.trim())  { toast('이름을 입력해주세요.');  nameEl.focus();  return; }
    if (!phoneEl.value.trim()) { toast('연락처를 입력해주세요.'); phoneEl.focus(); return; }
    if (!att)                  { toast('참석 여부를 선택해주세요.'); return; }

    /* Demo mode */
    if (form.action.includes('YOUR_FORM_ID')) {
      if (result) {
        result.textContent = '(데모) 전달 완료! Formspree ID를 교체해주세요.';
        result.className = 'rsvp-form__result ok';
      }
      toast('✓ 전달 완료 (데모 모드)');
      setTimeout(closeModal, 1800);
      return;
    }

    btn.disabled = true;
    btn.textContent = '전송 중…';
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    }).then(function(res) {
      if (res.ok) {
        if (result) {
          result.textContent = '참석 의사가 전달되었습니다. 감사합니다.';
          result.className = 'rsvp-form__result ok';
        }
        toast('✓ 전달 완료!');
        form.reset();
        setTimeout(closeModal, 2000);
      } else {
        throw new Error('server');
      }
    }).catch(function() {
      if (result) {
        result.textContent = '전송 실패. 다시 시도해주세요.';
        result.className = 'rsvp-form__result err';
      }
      toast('전송 실패. 다시 시도해주세요.');
    }).finally(function() {
      btn.disabled = false;
      btn.textContent = '참석 의사 전달하기';
    });
  });
}());

/* ── INIT LUCIDE ICONS ───────────────────────────────────────*/
/* Must run last so all data-lucide elements exist in DOM      */
initIcons();
