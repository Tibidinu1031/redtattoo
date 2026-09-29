const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Deschide meniul');
  mobileMenu.hidden = true;
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
  mobileMenu.hidden = !open;
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Reveal once; content remains available when motion is reduced or JS is absent.
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  $$('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js-motion');
}
reduceMotion.addEventListener('change', event => {
  if (event.matches) document.documentElement.classList.remove('js-motion');
});

const tabs = $$('.process-tab');
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
  const number = $('.process-big-number');
  if (number) number.textContent = String(tabs.indexOf(tab) + 1).padStart(2, '0');
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(tabs[next], true); }
  });
});

const progress = $('.scroll-progress');
let scheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  const activeSection = ['galerie', 'studio', 'stiluri', 'proces'].map(id => document.getElementById(id))
    .filter(section => section.getBoundingClientRect().top < innerHeight * 0.4).at(-1);
  $$('.desktop-nav a').forEach(link => {
    const active = !!activeSection && link.hash === '#' + activeSection.id && $('#contact').getBoundingClientRect().top > innerHeight * 0.4;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();
$('#year').textContent = new Date().getFullYear();

function initializeGallery() {
  const photos = Array.isArray(window.RED_TATTOO_GALLERY) ? window.RED_TATTOO_GALLERY : [];
  const body = $('.gallery-body');
  const empty = $('.gallery-empty');
  body.hidden = !photos.length;
  empty.hidden = !!photos.length;
  $('.view-switch').hidden = !photos.length;
  if (!photos.length) return;

  const scene = $('.gallery-scene');
  const deck = $('.gallery-deck');
  const grid = $('.gallery-grid');
  const rail = $('.thumbnail-rail');
  const dialog = $('.photo-viewer');
  const viewerImage = $('.viewer-image');
  const imageWrap = $('.viewer-image-wrap');
  const zoomButton = $('.viewer-zoom');
  const live = $('.gallery-live');
  let current = 0;
  let view = 'deck';
  let previousFocus;
  let zoomed = false;
  let drag = null;
  let ignoreClickUntil = 0;
  let announceTimer;
  const pad = n => String(n).padStart(2, '0');

  function imageFor(photo, alt, eager = false) {
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = alt;
    image.width = photo.width || 900;
    image.height = photo.height || 1200;
    image.loading = eager ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    return image;
  }

  const cards = photos.map((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'gallery-card';
    card.dataset.number = pad(index + 1);
    card.setAttribute('aria-label', photo.title + ', fotografia ' + (index + 1) + ' din ' + photos.length);
    card.append(imageFor(photo, photo.alt, index < 4 || index > photos.length - 4));
    card.addEventListener('click', () => {
      if (performance.now() < ignoreClickUntil) return;
      if (current === index) openViewer(card);
      else select(index);
    });
    deck.append(card);
    return card;
  });
  const thumbnails = photos.map((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumbnail';
    button.setAttribute('aria-label', 'Fotografia ' + (index + 1) + ': ' + photo.title);
    button.append(imageFor(photo, ''));
    button.addEventListener('click', () => select(index));
    rail.append(button);
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'grid-photo';
    tile.setAttribute('aria-label', 'Mărește: ' + photo.title);
    tile.append(imageFor(photo, photo.alt));
    const caption = document.createElement('span');
    caption.textContent = pad(index + 1) + ' / ' + photo.title;
    tile.append(caption);
    tile.addEventListener('click', () => { select(index); openViewer(tile); });
    grid.append(tile);
    return button;
  });

  function offset(index) {
    let distance = (index - current + photos.length) % photos.length;
    if (distance > photos.length / 2) distance -= photos.length;
    return distance;
  }
  function renderDeck() {
    const compact = scene.clientWidth < 541;
    const spacing = compact ? 104 : scene.clientWidth < 900 ? 148 : 195;
    cards.forEach((card, index) => {
      const d = offset(index);
      const a = Math.abs(d);
      const visible = a <= 3;
      const selected = d === 0;
      card.style.setProperty('--x', d * spacing + 'px');
      card.style.setProperty('--z', -a * (compact ? 150 : 155) + 'px');
      card.style.setProperty('--ry', (selected ? 0 : -Math.sign(d) * 36) + 'deg');
      card.style.setProperty('--rz', (selected ? 0 : -Math.sign(d) * 2) + 'deg');
      card.style.setProperty('--opacity', visible ? 1 : 0);
      card.style.setProperty('--order', String(10 - a));
      card.style.pointerEvents = visible ? 'auto' : 'none';
      card.tabIndex = selected ? 0 : -1;
      card.setAttribute('aria-hidden', String(!visible));
      card.setAttribute('aria-current', String(selected));
      card.classList.toggle('is-current', selected);
      if (visible) $('img', card).loading = 'eager';
    });
  }
  function setZoom(value) {
    zoomed = value;
    imageWrap.classList.toggle('is-zoomed', zoomed);
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.setAttribute('aria-label', zoomed ? 'Revino la fotografia întreagă' : 'Mărește fotografia');
    zoomButton.textContent = zoomed ? 'Zoom −' : 'Zoom +';
    imageWrap.scrollTop = 0;
    imageWrap.scrollLeft = 0;
  }
  function renderViewer() {
    const photo = photos[current];
    viewerImage.src = photo.src;
    viewerImage.alt = photo.alt;
    $('.viewer-counter').textContent = pad(current + 1) + ' / ' + pad(photos.length);
    $('#viewer-title').textContent = photo.title;
    $('.viewer-source').href = photo.source;
    setZoom(false);
  }
  function select(index, announce = true) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    $('.work-counter b').textContent = pad(current + 1);
    $('.work-counter > span').textContent = pad(photos.length);
    $('.work-title').textContent = photo.title;
    $('.work-category').textContent = photo.category;
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    const position = $('.gallery-position > span');
    position.style.width = (100 / photos.length) + '%';
    position.style.transform = 'translateX(' + (current * 100) + '%)';
    renderDeck();
    if (dialog.open) renderViewer();
    if (announce) {
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => {
        live.textContent = 'Fotografia ' + (current + 1) + ' din ' + photos.length + ': ' + photo.title;
      }, 120);
      const thumb = thumbnails[current];
      rail.scrollTo({ left: rail.scrollLeft + thumb.getBoundingClientRect().left - rail.getBoundingClientRect().left - (rail.clientWidth - thumb.clientWidth) / 2, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    }
  }
  function openViewer(trigger) {
    previousFocus = trigger || document.activeElement;
    renderViewer();
    dialog.showModal();
    document.body.classList.add('viewer-open');
    $('.viewer-close').focus({ preventScroll: true });
  }
  $('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    setZoom(false);
    if (previousFocus?.isConnected) {
      const target = previousFocus.classList.contains('gallery-card') ? cards[current] : previousFocus;
      target.focus({ preventScroll: true });
    }
  });
  zoomButton.addEventListener('click', () => setZoom(!zoomed));
  viewerImage.addEventListener('click', () => { if (zoomed) setZoom(false); });
  $('.open-photo').addEventListener('click', event => openViewer(event.currentTarget));
  $('.gallery-prev').addEventListener('click', () => select(current - 1));
  $('.gallery-next').addEventListener('click', () => select(current + 1));
  $('.viewer-prev').addEventListener('click', () => select(current - 1));
  $('.viewer-next').addEventListener('click', () => select(current + 1));

  function navigateKey(event) {
    let next;
    if (event.key === 'ArrowRight') next = current + 1;
    if (event.key === 'ArrowLeft') next = current - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = photos.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      const wasCard = document.activeElement.classList.contains('gallery-card');
      select(next);
      if (wasCard && !dialog.open) cards[current].focus({ preventScroll: true });
    }
    if (event.key === 'Enter' && event.target === scene) { event.preventDefault(); openViewer(scene); }
  }
  scene.addEventListener('keydown', navigateKey);
  dialog.addEventListener('keydown', navigateKey);
  rail.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    navigateKey(event);
    thumbnails[current].focus({ preventScroll: true });
  });

  // Do not prevent vertical swipes: page scrolling keeps working on phones.
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, horizontal: false };
  });
  scene.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      drag.horizontal = true;
      scene.classList.add('is-dragging');
      if (!scene.hasPointerCapture(event.pointerId)) scene.setPointerCapture(event.pointerId);
    }
    drag.dx = dx;
    if (drag.horizontal && !reduceMotion.matches) {
      deck.style.setProperty('--drag-x', Math.max(-100, Math.min(100, dx * 0.4)) + 'px');
    }
  });
  function finishDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.horizontal) {
      ignoreClickUntil = performance.now() + 350;
      if (Math.abs(drag.dx) > 42) select(current + (drag.dx < 0 ? 1 : -1));
    }
    scene.classList.remove('is-dragging');
    deck.style.setProperty('--drag-x', '0px');
    if (scene.hasPointerCapture(event.pointerId)) scene.releasePointerCapture(event.pointerId);
    drag = null;
  }
  scene.addEventListener('pointerup', finishDrag);
  scene.addEventListener('pointercancel', () => { drag = null; scene.classList.remove('is-dragging'); deck.style.setProperty('--drag-x', '0px'); });
  scene.addEventListener('lostpointercapture', event => {
    // Touch starts with implicit capture on the card; moving it to the scene must preserve the gesture.
    if (event.target === scene) { drag = null; scene.classList.remove('is-dragging'); deck.style.setProperty('--drag-x', '0px'); }
  });
  // Swipe between full images; zoomed images retain native pan/scroll.
  let viewerTouch;
  imageWrap.addEventListener('touchstart', event => {
    if (!zoomed && event.touches.length === 1) viewerTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  imageWrap.addEventListener('touchend', event => {
    if (!viewerTouch || zoomed) return;
    const dx = event.changedTouches[0].clientX - viewerTouch.x;
    const dy = event.changedTouches[0].clientY - viewerTouch.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) select(current + (dx < 0 ? 1 : -1));
    viewerTouch = null;
  }, { passive: true });
  imageWrap.addEventListener('touchcancel', () => { viewerTouch = null; }, { passive: true });

  $$('.view-button').forEach(button => button.addEventListener('click', () => {
    view = button.dataset.view;
    $$('.view-button').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    scene.hidden = view !== 'deck';
    grid.hidden = view !== 'grid';
    $('.gallery-help').hidden = view === 'grid';
    rail.hidden = view === 'grid';
    if (view === 'deck') renderDeck();
  }));
  // Only the gallery gets a pointer hint; normal page and keyboard cursors remain intact.
  const cursor = $('.gallery-cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let cursorFrame = 0;
    let cursorX = 0, cursorY = 0;
    scene.addEventListener('pointermove', event => {
      if (reduceMotion.matches || event.pointerType === 'touch') return;
      const bounds = scene.getBoundingClientRect();
      cursorX = event.clientX - bounds.left;
      cursorY = event.clientY - bounds.top;
      scene.classList.add('has-cursor');
      if (!cursorFrame) cursorFrame = requestAnimationFrame(() => {
        cursor.style.transform = 'translate(' + cursorX + 'px,' + cursorY + 'px)';
        cursorFrame = 0;
      });
    });
    scene.addEventListener('pointerleave', () => scene.classList.remove('has-cursor'));
    scene.addEventListener('focusin', () => scene.classList.remove('has-cursor'));
    reduceMotion.addEventListener('change', () => scene.classList.remove('has-cursor'));
  }
  window.addEventListener('resize', () => { if (view === 'deck') renderDeck(); });
  select(0, false);
}
initializeGallery();

// Each style reveals a real example from the archive.
const styleRows = $$('.style-row');
const styleImages = $$('.style-preview-images img');
styleRows.forEach((row, index) => {
  row.addEventListener('toggle', () => {
    if (!row.open) return;
    styleImages.forEach((image, imageIndex) => {
      const active = imageIndex === index;
      image.classList.toggle('is-active', active);
      image.setAttribute('aria-hidden', String(!active));
      if (active) image.loading = 'eager';
    });
    $('.style-preview-number').textContent = String(index + 1).padStart(2, '0') + ' / 03';
    $('.style-preview-title').textContent = $('h3', row).textContent;
  });
});

// Source links and profile photos stay paired with their original authors.
function initializeReviews() {
  const reviews = (window.RED_TATTOO_REVIEWS || []).filter(review =>
    review.rating === 5 && ['name', 'photo', 'text', 'platform', 'source'].every(key => typeof review[key] === 'string' && review[key].trim())
  ).slice(0, 5);
  if (!reviews.length) return;
  const track = $('.reviews-track');
  const template = $('#review-card-template');
  for (const review of reviews) {
    const card = template.content.firstElementChild.cloneNode(true);
    $('h3', card).textContent = review.name;
    $('.review-platform', card).textContent = review.platform + (review.excerpt ? ' · fragment' : '');
    $('blockquote', card).textContent = review.text;
    $('.review-source', card).href = review.source;
    const portrait = $('img', card);
    portrait.src = review.photo;
    portrait.alt = 'Fotografie de profil: ' + review.name;
    portrait.addEventListener('error', () => {
      const initials = review.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('');
      $('.review-avatar', card).textContent = initials;
    }, { once: true });
    track.append(card);
  }
  $('.reviews-carousel').hidden = false;
  const previous = $('.reviews-prev');
  const next = $('.reviews-next');
  function updateReviewControls() {
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }
  function moveReview(direction) {
    const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
    track.scrollBy({ left:direction * step, behavior:reduceMotion.matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => moveReview(-1));
  next.addEventListener('click', () => moveReview(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    moveReview(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', updateReviewControls, { passive:true });
  window.addEventListener('resize', updateReviewControls);
  if ('ResizeObserver' in window) new ResizeObserver(updateReviewControls).observe(track);
  document.fonts.ready.then(updateReviewControls);
  requestAnimationFrame(updateReviewControls);
}
initializeReviews();
