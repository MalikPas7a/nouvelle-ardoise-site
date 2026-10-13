(() => {
  'use strict';
  const legacy = {'#offres':'/offres/','#reseaux':'/offres/#reseaux','#exemple-sora':'/offres/#exemple-sora','#methode':'/offres/#methode','#exemples':'/restaurants/#exemples','#essayer':'/restaurants/#essayer','#en-mouvement':'/realisations/#en-mouvement'};
  if (legacy[location.hash]) { location.replace(legacy[location.hash]); return; }
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px)');
  const heroImage = document.querySelector('.hero-image');
  const hero = document.querySelector('.hero');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-nav');
  let pending = false;
  function paint() {
    pending = false;
    if (desktop.matches && !reduced.matches && hero.getBoundingClientRect().bottom > 0) heroImage.style.transform = `translateY(${Math.min(scrollY * 0.13, 90)}px) scale(1.035)`;
    else heroImage.style.transform = '';
  }
  function requestPaint() { if (!pending) { pending = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint);
  reduced.addEventListener('change', requestPaint);
  desktop.addEventListener('change', requestPaint);
  paint();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  function closeMenu() {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); }
  });

  const goals = {
    salle: { label: 'Votre objectif / acquisition locale', title: 'Donner une raison de venir au bon moment.', description: 'On étudie les créneaux à développer, la clientèle du quartier et votre capacité. Puis on relie contenus, ciblage local et réservation.', measure: 'Ce que l’on suit : demandes, appels et réservations sur les créneaux choisis.' },
    commande: { label: 'Votre objectif / commandes directes', title: 'De la découverte de votre plat à son retrait.', description: 'On choisit ensemble les produits, les créneaux et la solution de click & collect. Les photos, le site et les communications orientent vers ce parcours.', measure: 'Ce que l’on suit : commandes directes, panier et capacité de préparation.' },
    fidelite: { label: 'Votre objectif / fidélisation', title: 'Transformer une première visite en relation.', description: 'On définit ensemble les règles de votre programme, les avantages adaptés à votre marge et le rythme des invitations, avec l’accord des clients.', measure: 'Ce que l’on suit : inscriptions volontaires, visites répétées et utilisation des avantages.' }
  };
  document.querySelectorAll('[data-goal]').forEach(button => button.addEventListener('click', () => {
    const goal = goals[button.dataset.goal];
    document.querySelectorAll('[data-goal]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('[data-goal-label]').textContent = goal.label;
    document.querySelector('[data-goal-title]').textContent = goal.title;
    document.querySelector('[data-goal-description]').textContent = goal.description;
    document.querySelector('[data-goal-measure]').textContent = goal.measure;
  }));

  const packageButtons = [...document.querySelectorAll('[data-package]')];
  function selectPackage(id) {
    packageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.package === id)));
    document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== id; });
  }
  packageButtons.forEach(button => button.addEventListener('click', () => selectPackage(button.dataset.package)));
  selectPackage('sites');

  document.querySelector('#collect-test').addEventListener('click', () => {
    const time = document.querySelector('#pickup-slot').value;
    document.querySelector('#collect-result').textContent = `Exemple : retrait choisi à ${time}. Aucune commande ni paiement envoyés.`;
  });
  const stamps = [...document.querySelectorAll('.loyalty-stamps i')];
  let visits = 2;
  function paintLoyalty() {
    stamps.forEach((stamp, index) => {
      stamp.classList.toggle('stamped', index < visits);
      stamp.textContent = index < visits ? '✓' : String(index + 1).padStart(2, '0');
    });
    document.querySelector('.loyalty-stamps').setAttribute('aria-label', `${visits} visites sur six dans cet exemple`);
    document.querySelector('.loyalty-progress').textContent = visits === 6 ? '6 / 6 visites · exemple d’avantage atteint, à définir ensemble' : `${visits} / 6 visites · avantage à définir ensemble`;
    document.querySelector('#loyalty-test').disabled = visits === 6;
  }
  document.querySelector('#loyalty-test').addEventListener('click', () => { visits = Math.min(6, visits + 1); paintLoyalty(); });
  document.querySelector('#loyalty-reset').addEventListener('click', () => { visits = 2; paintLoyalty(); });

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (reduced.matches || !desktop.matches) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 5}deg`);
        card.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 3}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--ry');
        card.style.removeProperty('--rx');
      });
    });
  }
})();
