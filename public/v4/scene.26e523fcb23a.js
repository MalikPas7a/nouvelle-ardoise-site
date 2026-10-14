// La scène est une amélioration du récit HTML, chargé seulement à proximité.
(() => {
  const root = document.querySelector('#motion-core');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let near = false, started = false;
  const eligible = () => !reduced.matches && innerHeight >= 500 && (innerWidth > 800 || innerHeight >= 600);
  if (eligible()) root.classList.add('motion-pending');
  const ready = new MutationObserver(() => {
    if (root.classList.contains('motion-ready')) { root.classList.remove('motion-pending'); ready.disconnect(); }
  });
  ready.observe(root, {attributes:true, attributeFilter:['class']});
  function fallback(reason) {
    root.classList.add('motion-static');
    root.classList.remove('motion-pending');
    root.classList.remove('motion-loading');
    root.dataset.renderer = reason;
    root.querySelectorAll('[data-motion-beat]').forEach(beat => { beat.inert = false; beat.removeAttribute('aria-hidden'); });
  }
  function start() {
    if (!started) root.classList.toggle('motion-pending', eligible());
    if (started || !near || !eligible()) return;
    started = true;
    root.classList.remove('motion-static');
    root.dataset.renderer = 'loading';
    setTimeout(() => { if (!window.motionShowcase) fallback('initialization-unavailable'); }, 30000);
    const script = document.createElement('script');
    script.src = '/v4/motion.77629f57d28d.js';
    script.addEventListener('error', () => fallback('script-unavailable'), {once:true});
    document.body.append(script);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      near = entries.some(entry => entry.isIntersecting);
      start();
    }, {rootMargin:'500px 0px'});
    observer.observe(root);
  } else { near = true; start(); }
  reduced.addEventListener('change', start);
  addEventListener('resize', start, {passive:true});
})();
