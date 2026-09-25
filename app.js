const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Deschide meniul'); mobileMenu.hidden = true; }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul'); mobileMenu.hidden = !open; });
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let motionPaused = reduceMotion.matches;
try { motionPaused ||= localStorage.getItem('red-tattoo-pause-motion') === 'true'; } catch {}
function updateMotion() {
  document.body.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionPaused ? 'Pornește animațiile continue' : 'Oprește animațiile continue');
  motionButton.firstElementChild.textContent = motionPaused ? '▷' : 'Ⅱ';
}
updateMotion();
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  updateMotion();
  try { localStorage.setItem('red-tattoo-pause-motion', String(motionPaused)); } catch {}
});
reduceMotion.addEventListener('change', event => {
  motionPaused = event.matches;
  updateMotion();
  if (event.matches) document.documentElement.classList.remove('js-motion');
});
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {threshold:0.08, rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const tabs = Array.from(document.querySelectorAll('.process-tab'));
function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
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
const progress = document.querySelector('.scroll-progress');
let scheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, {passive:true});
window.addEventListener('resize', updateScroll);
window.matchMedia('(min-width: 641px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
updateScroll();
document.getElementById('year').textContent = new Date().getFullYear();

// Subtle pointer response on desktop; keyboard and reduced-motion paths stay static.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.button-red').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (reduceMotion.matches || motionPaused) return;
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.06;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      button.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}
