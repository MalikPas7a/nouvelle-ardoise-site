// La vidéo d'exemple de Sora : elle joue sans le son quand elle est à l'écran,
// et s'ouvre en grand avec le son au clic. Utilisée sur les pages Offres et Réalisations.
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, racine = document) => racine.querySelector(sel);
const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];

// La vidéo d'exemple (Sora) ne se charge et ne joue que lorsqu'elle est à l'écran
const exemple = $('[data-video-exemple]');
if (exemple && calme) exemple.controls = true;
if (exemple && !calme) {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) exemple.play().catch(() => {}); else exemple.pause(); }, { threshold: 0.4 }).observe(exemple);
}
// clic sur l'exemple : la vidéo s'ouvre en grand, avec le son (chargée seulement à ce moment-là)
const visionneuse = $('[data-visionneuse]');
const grande = $('[data-video-grande]');
$$('[data-ouvrir-video]').forEach((b) => b.addEventListener('click', (e) => {
  if (!visionneuse?.showModal) return;          // vieux navigateur : le lien ouvre la vidéo seule
  e.preventDefault();
  if (!grande.src) grande.src = '/media/exemple-sora-hd.mp4';
  visionneuse.showModal();
  grande.currentTime = 0;
  grande.play().catch(() => {});
}));
visionneuse?.addEventListener('close', () => grande.pause());
visionneuse?.addEventListener('click', (e) => { if (e.target === visionneuse) visionneuse.close(); });
if (location.hash === '#exemple-sora') addEventListener('load', () => $('[data-ouvrir-video]')?.click());
