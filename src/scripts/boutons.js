// Boutons animés : le libellé roule au survol, l'encre part du pointeur,
// et sur ordinateur le bouton est légèrement attiré par la souris.
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;
const FLECHE = '<span class="btn__fleche" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>';

document.querySelectorAll('.btn').forEach((btn) => {
  // On double le libellé pour l'effet de roulement (la copie est cachée aux lecteurs d'écran)
  if (!btn.querySelector('.btn__roule') && !btn.querySelector('.nav__long')) {
    const texte = btn.textContent.trim();
    btn.innerHTML = `<span class="btn__roule"><span>${texte}</span><span aria-hidden="true">${texte}</span></span>${btn.tagName === 'A' ? FLECHE : ''}`;
  }
  if (calme || !souris) return;
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - r.left}px`);
    btn.style.setProperty('--y', `${e.clientY - r.top}px`);
    btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 14}px`);
    btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 10}px`);
  });
  btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
});
