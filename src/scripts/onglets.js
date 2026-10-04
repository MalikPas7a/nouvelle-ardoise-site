// Onglets accessibles : chaque groupe [data-onglets] fonctionne seul.
// Sans JavaScript, tous les panneaux restent visibles l'un sous l'autre.
// data-ancres="#a #b" sur un onglet : il s'ouvre quand la page arrive avec l'une de ces ancres.
document.querySelectorAll('[data-onglets]').forEach((groupe) => {
  const onglets = [...groupe.querySelectorAll('[role="tab"]')];
  const montrer = (onglet, focus = false) => {
    onglets.forEach((o) => {
      const actif = o === onglet;
      o.setAttribute('aria-selected', String(actif));
      o.tabIndex = actif ? 0 : -1;
      document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
    });
    if (focus) onglet.focus();
  };
  onglets.forEach((o, i) => {
    o.addEventListener('click', () => montrer(o));
    o.addEventListener('keydown', (e) => {
      const pas = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (pas) { e.preventDefault(); montrer(onglets[(i + pas + onglets.length) % onglets.length], true); }
    });
  });
  const vise = onglets.find((o) => location.hash && (o.dataset.ancres || '').split(' ').includes(location.hash));
  montrer(vise || onglets[0]);
});
