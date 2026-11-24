// Núcleo do site: sem dependências externas, então menu, cabeçalho e busca
// funcionam mesmo se alguma CDN falhar. As bibliotecas (Lenis, GSAP, React,
// Three.js) entram depois, por import dinâmico, como melhoria.

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEADER_OFFSET = -64;

/* Cabeçalho: linha inferior aparece ao rolar */
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Menu mobile */
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
const setMenu = open => {
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('open', open);
};
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
});
matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* Demonstração da busca no Google: digita a frase e revela os resultados */
function initSearchDemo() {
  if (still || !('IntersectionObserver' in window)) return;
  const q = document.getElementById('query');
  const results = [...document.querySelectorAll('.result')];
  const text = q.textContent;
  let timers = [];
  let running = false;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (fn, ms) => timers.push(setTimeout(fn, ms));
  const cycle = () => {
    clear();
    results.forEach(r => r.classList.remove('on'));
    q.textContent = '';
    [...text].forEach((_, i) => at(() => { q.textContent = text.slice(0, i + 1); }, 400 + i * 55));
    const typed = 400 + text.length * 55;
    results.forEach((r, i) => at(() => r.classList.add('on'), typed + 300 + i * 180));
    at(cycle, typed + 7000);
  };
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; cycle(); }
    else if (!entry.isIntersecting && running) {
      running = false;
      clear();
      q.textContent = text;
      results.forEach(r => r.classList.add('on'));
    }
  }, { threshold: 0.35 }).observe(document.querySelector('.search'));
}
initSearchDemo();

/* Links internos: usa o Lenis quando ativo, senão a rolagem nativa */
let lenis = null;
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (hash.length < 2) return;
  const target = hash === '#topo' ? document.body : document.querySelector(hash);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(hash === '#topo' ? 0 : target, { offset: HEADER_OFFSET });
  else if (hash === '#topo') scrollTo({ top: 0 });
  else target.scrollIntoView();
  history.replaceState(null, '', hash);
  if (hash !== '#topo') {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
});

/* Rolagem suave (Lenis) + animações de entrada (GSAP ScrollTrigger) */
async function initMotion() {
  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import('lenis'), import('gsap'), import('gsap/ScrollTrigger')
  ]);
  gsap.registerPlugin(ScrollTrigger);

  if (still) return { gsap, ScrollTrigger };

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Entrada da apresentação: o único momento coreografado da página
  gsap.from('.hero-text > *', { y: 28, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 });
  gsap.from('.hero-visual img', { y: 40, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.15 });

  revealOnScroll(gsap, '.section-head, .demo, .service, .steps li, .contact .container > *');
  return { gsap, ScrollTrigger };
}

function revealOnScroll(gsap, selector) {
  if (still) return;
  gsap.utils.toArray(selector).forEach(el => {
    gsap.from(el, {
      y: 32, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });
}

/* Galeria de projetos com filtro (React) */
async function initGallery(motion) {
  const { mountGallery } = await import('./projects.js');
  const host = document.getElementById('gallery');
  await mountGallery(host, {
    onFilter(grid) {
      if (!motion || still) return;
      motion.gsap.fromTo(grid.children, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05, clearProps: 'all' });
      motion.ScrollTrigger.refresh();
    }
  });
  if (motion) {
    revealOnScroll(motion.gsap, '.filters, .project, .next');
    motion.ScrollTrigger.refresh();
  }
}

/* Símbolo </> em 3D (Three.js) ao redor da ilustração, carregada quando o navegador estiver livre */
function initScene() {
  const canvas = document.getElementById('code-mark');
  if (!canvas) return;
  const start = () => import('./scene.js')
    .then(({ createCodeMark }) => createCodeMark(canvas, { still, anchor: document.querySelector('.hero-visual img') }))
    .catch(err => console.warn('[portfolio] cena 3D indisponível', err));
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 600);
}

(async () => {
  let motion = null;
  try { motion = await initMotion(); }
  catch (err) { console.warn('[portfolio] animações indisponíveis', err); }
  try { await initGallery(motion); }
  catch (err) { console.warn('[portfolio] galeria React indisponível, mantendo lista estática', err); }
  initScene();
})();
