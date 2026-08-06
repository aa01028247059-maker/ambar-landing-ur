/* =============================================
   Амбар для бизнеса — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initReveal();
  initFAQ();
  initModal();
  initForms();
  initPhoneMasks();
  initHeaderScroll();
  initScrollTop();
  initGallery();
});

/* ---- HEADER SCROLL SHADOW ---- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 2px 16px rgba(33,42,51,0.10)'
      : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- BURGER MENU ---- */
function initBurger() {
  const btn = document.getElementById('burgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', false);
    }
  });
}

/* ---- REVEAL ON SCROLL ---- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
    observer.observe(el);
  });
}

/* ---- FAQ ACCORDION ---- */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  function closeItem(i) {
    const answer = i.querySelector('.faq__answer');
    if (!answer) return;
    /* фиксируем текущую высоту перед закрытием */
    answer.style.height = answer.scrollHeight + 'px';
    /* два rAF нужны чтобы браузер «увидел» высоту до старта перехода */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      answer.style.height = '0';
    }));
    i.classList.remove('open');
    i.querySelector('.faq__question')?.setAttribute('aria-expanded', false);
  }

  function openItem(i, btn) {
    const answer = i.querySelector('.faq__answer');
    if (!answer) return;
    i.classList.add('open');
    btn.setAttribute('aria-expanded', true);
    const target = answer.scrollHeight;
    answer.style.height = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      answer.style.height = target + 'px';
      /* после окончания перехода снимаем фиксированную высоту */
      answer.addEventListener('transitionend', () => {
        if (i.classList.contains('open')) answer.style.height = 'auto';
      }, { once: true });
    }));
  }

  items.forEach(item => {
    const btn = item.querySelector('.faq__question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => { if (i !== item) closeItem(i); });
      isOpen ? closeItem(item) : openItem(item, btn);
    });
  });
}

/* ---- MODAL ---- */
let _closeModal = null;

function initModal() {
  const overlay  = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay) return;

  let lastTrigger = null;

  function openModal(trigger) {
    lastTrigger = trigger || null;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  _closeModal = closeModal;

  ['openConsultHeader', 'openConsultHeaderMobile', 'openConsultHero', 'openConsultPricing', 'openConsultFinal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', function () {
      openModal(this);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeModal(); });
}

/* ---- FORMS ---- */
function initForms() {
  handleForm('modalForm', true);
}

function handleForm(formId, isModal) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const c1    = form.querySelector('[name="consent1"]')?.checked;
    const c2    = form.querySelector('[name="consent2"]')?.checked;

    if (!name || !phone || phone === '+7 ') {
      highlightEmpty(form);
      return;
    }
    if (!c1 || !c2) {
      alert('Пожалуйста, дайте согласие на обработку данных');
      return;
    }

    try {
      console.log('Заявка для бизнеса:', { name, phone });
      form.reset();
      if (isModal && _closeModal) _closeModal();
      showToast('Спасибо! Мы свяжемся с вами в течение 15 минут.', 'success', 6000);
    } catch {
      showToast('Ваши данные передать не удалось, попробуйте снова', 'error');
    }
  });
}

/* ---- TOAST ---- */
function showToast(message, type, duration) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const iconName = type === 'success' ? 'icon-success-circle' : 'icon-fail-circle';
  toast.innerHTML =
    `<img src="assets/svg/icons/${iconName}.svg" alt="" width="20" height="20" class="toast__icon">` +
    `<span class="toast__text">${message}</span>` +
    `<button class="toast__close" aria-label="Закрыть">` +
    `<img src="assets/svg/icons/icon-cross.svg" alt="" width="16" height="16">` +
    `</button>`;

  function dismiss() {
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  toast.querySelector('.toast__close').addEventListener('click', dismiss);
  if (duration > 0) setTimeout(dismiss, duration);

  wrap.appendChild(toast);
}

function highlightEmpty(form) {
  form.querySelectorAll('input[required]').forEach(input => {
    if (!input.value.trim() && input.type !== 'checkbox') {
      input.style.borderColor = '#D92D2B';
      input.addEventListener('input', () => { input.style.borderColor = ''; }, { once: true });
    }
  });
}

/* ---- PHONE MASK ---- */
function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(initSinglePhoneMask);
}

function initSinglePhoneMask(input) {

  function extractDigits(value) {
    let d = value.replace(/\D/g, '');
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
    return d.slice(0, 10);
  }

  function formatPhone(digits) {
    if (!digits.length) return '+7 ';
    if (digits.length <= 3) return '+7 (' + digits;
    if (digits.length <= 6) return '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3);
    if (digits.length <= 8) return '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    return '+7 (' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6, 8) + '-' + digits.slice(8, 10);
  }

  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 ';
    setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
  });

  input.addEventListener('blur', () => {
    if (input.value === '+7 ' || input.value === '+7') input.value = '';
  });

  /* Блокируем ввод не-цифр */
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const skip = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
    if (skip.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });

  input.addEventListener('input', () => {
    const digits = extractDigits(input.value);
    input.value = formatPhone(digits);
    input.setSelectionRange(input.value.length, input.value.length);
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const combined = input.value.slice(0, input.selectionStart) + pasted + input.value.slice(input.selectionEnd);
    const digits = extractDigits(combined);
    input.value = formatPhone(digits);
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

/* ---- GALLERY SLIDER (mobile) ---- */
function initGallery() {
  const track    = document.getElementById('galleryTrack');
  const prevBtn  = document.getElementById('galleryPrev');
  const nextBtn  = document.getElementById('galleryNext');
  const dotsWrap = document.getElementById('galleryDots');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.gallery__item'));
  const total = items.length;
  let current = 0;
  let isMobile = false;

  function checkMode() {
    isMobile = window.innerWidth <= 768;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'gallery__dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Фото ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(index) {
    if (!isMobile) return;
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(-${items[current].offsetLeft}px)`;

    dotsWrap?.querySelectorAll('.gallery__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  /* Touch swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isMobile) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  window.addEventListener('resize', () => {
    checkMode();
    if (!isMobile) {
      track.style.transform = '';
      current = 0;
    }
  });

  checkMode();
  buildDots();
}

/* ---- SCROLL TO TOP ---- */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
