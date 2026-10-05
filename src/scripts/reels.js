// Les vidéos courtes (réels) jouent sans le son quand elles sont à l'écran, et s'arrêtent ailleurs.
// Si le visiteur préfère moins d'animations, elles restent sur leur première image, avec les commandes.
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-reel]').forEach((v) => {
  if (calme) {
    v.removeAttribute('autoplay');
    v.pause();
    if (!v.hasAttribute('aria-hidden')) v.controls = true;
    return;
  }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) v.play().catch(() => {});
    else v.pause();
  }, { threshold: 0.35 }).observe(v);
});
