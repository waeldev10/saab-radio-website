const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuIcon = document.getElementById('menuIcon');
const menuClose = document.getElementById('menuClose');
let menuScrollPosition = 0;

function setMenu(open, returnFocus = true) {
  if (open === (mobileMenu.dataset.open === 'true')) return;
  if (open) {
    menuScrollPosition = window.scrollY;
    document.body.style.top = `-${menuScrollPosition}px`;
    document.body.classList.add('menu-open');
  } else {
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, menuScrollPosition);
  }
  mobileMenu.dataset.open = String(open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.inert = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
  menuIcon.innerHTML = open
    ? '<path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
    : '<path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
  if (open) menuClose.focus({ preventScroll: true });
  else if (returnFocus) {
    const focusTarget = window.innerWidth <= 880 ? menuToggle : document.querySelector('.nav-links a');
    focusTarget?.focus({ preventScroll: true });
  }
}

menuToggle.addEventListener('click', () => setMenu(mobileMenu.dataset.open !== 'true'));
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
menuClose.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (event) => {
  if (mobileMenu.dataset.open !== 'true') return;
  if (event.key === 'Escape') {
    setMenu(false);
    return;
  }
  if (event.key === 'Tab') {
    const focusable = [...mobileMenu.querySelectorAll('a[href], button:not([disabled])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 880 && mobileMenu.dataset.open === 'true') setMenu(false, false);
});
document.getElementById('year').textContent = new Date().getFullYear();

const reducedWaveMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const waveSpeed = reducedWaveMotion ? 0.42 : 0.78;
const waveAmplitudeScale = reducedWaveMotion ? 0.78 : 1;

function buildWavePath(width, height, settings, phase, filled = false) {
  const sampleCount = 28;
  const points = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const progress = index / sampleCount;
    const angle = progress * Math.PI * 2 * settings.frequency - phase;
    const detailAngle = angle * 1.72 - phase * 0.72;
    const y = settings.base + waveAmplitudeScale * (
      settings.amplitude * Math.sin(angle) +
      settings.amplitude * 0.27 * Math.sin(detailAngle)
    );
    points.push({ x: progress * width, y });
  }

  const format = (value) => value.toFixed(2);
  let path = `M${format(points[0].x)} ${format(points[0].y)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const start = points[index];
    const end = points[index + 1];
    const next = points[Math.min(points.length - 1, index + 2)];
    const control1X = start.x + (end.x - previous.x) / 6;
    const control1Y = start.y + (end.y - previous.y) / 6;
    const control2X = end.x - (next.x - start.x) / 6;
    const control2Y = end.y - (next.y - start.y) / 6;
    path += ` C${format(control1X)} ${format(control1Y)} ${format(control2X)} ${format(control2Y)} ${format(end.x)} ${format(end.y)}`;
  }

  return filled ? `${path} L${width} ${height} L0 ${height} Z` : path;
}

const movingWaves = [
  {
    selector: '.hero-edge svg',
    fill: { base: 35, amplitude: 7.2, frequency: 1.38, phase: 0 },
    lines: [
      { base: 33, amplitude: 5.8, frequency: 1.38, phase: 0.55 },
      { base: 38, amplitude: 4.8, frequency: 1.38, phase: -0.75 }
    ]
  },
  {
    selector: '.footer-edge svg',
    fill: { base: 29, amplitude: 6.4, frequency: 1.38, phase: 1.1 },
    lines: [
      { base: 27, amplitude: 5.2, frequency: 1.38, phase: 1.6 },
      { base: 33, amplitude: 4.4, frequency: 1.38, phase: 0.3 }
    ]
  }
];

function animateWaveShapes(timestamp) {
  if (document.visibilityState !== 'hidden') {
    const elapsed = timestamp / 1000 * waveSpeed;

    movingWaves.forEach((wave) => {
      const svg = document.querySelector(wave.selector);
      if (!svg) return;

      const { width, height } = svg.viewBox.baseVal;
      const fill = svg.querySelector('.edge-fill');
      if (fill) {
        fill.setAttribute('d', buildWavePath(width, height, wave.fill, elapsed + wave.fill.phase, true));
      }

      svg.querySelectorAll('.edge-line, .edge-wave').forEach((line, index) => {
        const settings = wave.lines[index];
        if (settings) {
          line.setAttribute('d', buildWavePath(width, height, settings, elapsed + settings.phase));
        }
      });
    });
  }

  requestAnimationFrame(animateWaveShapes);
}

requestAnimationFrame(animateWaveShapes);
