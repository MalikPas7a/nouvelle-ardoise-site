// Atelier Paris Burger · scripts partagés (maquette Nouvelle Ardoise)
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var top = document.getElementById('top');

  // En-tête : bordeaux plein après l'ouverture
  function etatTop(){ top.classList.toggle('plein', window.scrollY > window.innerHeight * 0.6); }
  etatTop(); window.addEventListener('scroll', etatTop, {passive:true});

  // Menu mobile
  var menu = document.getElementById('menu'), ouvrir = document.getElementById('ouvrir'), fermer = document.getElementById('fermer');
  function setMenu(o){ menu.hidden = !o; if(window.apbLenis){ o ? window.apbLenis.stop() : window.apbLenis.start(); } document.querySelectorAll('main,footer,.top').forEach(function(z){ z.inert = o; }); ouvrir.setAttribute('aria-expanded', o ? 'true' : 'false'); document.body.style.overflow = o ? 'hidden' : ''; if(o) fermer.focus(); else ouvrir.focus(); }
  ouvrir.addEventListener('click', function(){ setMenu(true); });
  fermer.addEventListener('click', function(){ setMenu(false); });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // Variantes d'ouverture (maquette) : A le geste, B la sauce qui coule
  var V = {
    A:{t:'Vidéo 1 · Le geste', d:'Couper le burger, le tremper dans la sauce Café de Paris · ralenti 120 i/s, lumière latérale chaude · 21:9 desktop / 4:5 mobile'},
    B:{t:'Vidéo 1 · La sauce qui coule', d:'Burger coupé en deux, la sauce Café de Paris coule lentement · macro, ralenti · 21:9 desktop / 4:5 mobile'}
  };
  if(document.getElementById('hero-titre')) document.querySelectorAll('.variante button').forEach(function(b){
    b.addEventListener('click', function(){
      if(document.getElementById('hero-titre')) document.querySelectorAll('.variante button').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.getElementById('hero-titre').textContent = V[b.dataset.v].t;
      document.getElementById('hero-desc').textContent = V[b.dataset.v].d;
    });
  });

  if(reduce || !window.gsap || !window.ScrollTrigger) return;
  document.documentElement.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);

  // Défilement fluide : Lenis seul, synchronisé sur GSAP
  if(window.Lenis){
    var lenis = new Lenis({lerp:0.085, smoothWheel:true, anchors:{offset:-76}, prevent:function(n){ return !!(n.closest && n.closest('.fiche,.menu-mobile')); }});
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.apbLenis = lenis;
  }

  // Titres : révélation masquée mot par mot (sans SplitText), nom complet gardé pour les lecteurs d'écran
  function split(el){
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g,' ').trim());
    var out = [];
    el.childNodes.forEach(function(n){
      var em = n.nodeType === 1 && n.tagName === 'EM';
      var txt = n.textContent;
      txt.split(/(\s+)/).forEach(function(p){
        if(!p.trim()){ out.push(p); return; }
        var w = '<span class="mot-masque" aria-hidden="true"><span class="mot">' + p.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span></span>';
        out.push(em ? '<em>' + w + '</em>' : w);
      });
    });
    el.innerHTML = out.join('');
  }
  document.fonts && document.fonts.ready ? document.fonts.ready.then(go) : go();

  function go(){
    document.querySelectorAll('[data-split]').forEach(function(el){
      split(el);
      gsap.fromTo(el.querySelectorAll('.mot'), {yPercent:110}, {yPercent:0, duration:0.9, ease:'power3.out', stagger:0.045,
        scrollTrigger: el.closest('.ouverture') ? null : {trigger:el, start:'top 84%', once:true}, delay: el.closest('.ouverture') ? 0.15 : 0});
    });
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      var inHero = el.closest('.ouverture');
      gsap.to(el, {opacity:1, y:0, duration:0.8, ease:'power3.out', delay: inHero ? 0.55 : 0,
        scrollTrigger: inHero ? null : {trigger:el, start:'top 88%', once:true}});
    });
    gsap.utils.toArray('.ph[data-clip]').forEach(function(el){
      gsap.to(el, {clipPath:'inset(0% 0 0 0)', duration:1.1, ease:'expo.out', scrollTrigger:{trigger:el, start:'top 90%', once:true}});
    });
    // Ouverture : léger recul de l'image au défilement
    if(document.querySelector('.ouverture .media')) gsap.to('.ouverture .media', {yPercent:12, ease:'none', scrollTrigger:{trigger:'.ouverture', start:'top top', end:'bottom top', scrub:1}});
    window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  }
})();

// Carte interactive : un clic sur un plat ouvre sa fiche (3D, composition, allergènes, commande)
(function(){
  // Données d'exemple, à remplacer par la carte définitive. glb : chemin du scan 3D du vrai plat.
  var D = {
    'Le Café de Paris':{c:['Pain brioché toasté','Bœuf haché minute, 150 g','Cheddar affiné','Oignons confits','Sauce Café de Paris'],a:['À valider par la cuisine']},
    'Le Double Maison':{c:['Pain brioché toasté','Deux steaks de bœuf, 2 × 110 g','Double cheddar','Pickles maison','Sauce Café de Paris'],a:['À valider par la cuisine']},
    'Le Poulet':{c:['Pain brioché toasté','Poulet croustillant','Salade','Sauce blanche aux herbes'],a:['À valider par la cuisine']},
    'Le Végétal':{c:['Pain brioché toasté','Galette de légumes grillés','Chèvre','Roquette'],a:['À valider par la cuisine']},
    'La Parisienne':{c:['Baguette tradition','Bœuf tranché fin','Oignons','Sauce Café de Paris'],a:['À valider par la cuisine']},
    'La Volaille':{c:['Baguette tradition','Poulet rôti','Crudités','Mayonnaise maison'],a:['À valider par la cuisine']},
    'Frites maison':{c:['Pommes de terre fraîches','Fleur de sel'],a:['À valider par la cuisine']},
    'Frites trempées':{c:['Frites maison','Sauce Café de Paris'],a:['À valider par la cuisine']},
    'Mousse au chocolat':{c:['Chocolat noir','Œufs','Crème'],a:['À valider par la cuisine']},
    'Citronnade maison':{c:['Citron pressé','Menthe fraîche','Sucre de canne'],a:['À valider par la cuisine']},
    'Thé glacé maison':{c:['Thé infusé chaque matin','Pêche','Sucre de canne'],a:['À valider par la cuisine']}
  };
  if(!document.getElementById('fiche')) return;
  var maison = document.body.dataset.page === 'maison';
  var plats = Array.prototype.slice.call(document.querySelectorAll('.carte .plat'));
  var fiche = document.getElementById('fiche'), fond = document.getElementById('fiche-fond');
  var $ = function(id){ return document.getElementById(id); };
  var i = 0, q = 1, dernier = null, panier = 0, mvCharge = false, minuteur = null, montant = 0;

  function info(el){
    var nom = el.querySelector('.nom').childNodes[0].textContent.trim();
    var prix = parseFloat(el.querySelector('.prix').textContent.replace(',', '.').replace(/[^\d.]/g,'')) || 0;
    var d = el.querySelector('.desc').cloneNode(true); var ex = d.querySelector('.exemple'); if(ex) ex.remove();
    return {nom:nom, prix:prix, desc:d.textContent.trim(), sauce:!!el.querySelector('.pastille'), cat:el.closest('.cat').querySelector('h3').childNodes[0].textContent.trim(), glb:el.dataset.glb, x:D[nom]||{c:[],a:['À valider par la cuisine']}};
  }
  var EUR = document.body.dataset.devise === '€';
  function chf(n){ return EUR ? n.toFixed(2).replace('.', ',') + ' €' : n.toFixed(2).replace('.00','.–') + ' CHF'; }
  function total(){ $('qte').textContent = q; $('total').textContent = chf(info(plats[i]).prix * q); }
  function remplir(){
    var p = info(plats[i]);
    $('fiche-cat').textContent = p.cat; $('fiche-nom').textContent = p.nom; $('fiche-desc').textContent = p.desc;
    $('fiche-prix').textContent = maison ? 'Prix selon l\'adresse' : chf(p.prix) + ' · exemple';
    $('fiche-pastille').innerHTML = p.sauce ? '<span class="pastille">Sauce Café de Paris</span>' : '';
    $('fiche-compo').innerHTML = p.x.c.map(function(t){ return '<li>' + t + '</li>'; }).join('');
    $('fiche-allerg').innerHTML = p.x.a.map(function(t){ return '<span>' + t + '</span>'; }).join('') + '<span>Liste complète au comptoir</span>';
    var scene = $('fiche-scene'), ancien = scene.querySelector('model-viewer'); if(ancien) ancien.remove();
    $('fiche-vide').hidden = !!p.glb; $('fiche-ar').disabled = !p.glb;
    if(p.glb){
      if(!mvCharge){ var sc = document.createElement('script'); sc.type = 'module'; sc.src = '/demos/vendor/model-viewer.min.js'; document.head.appendChild(sc); mvCharge = true; }
      var mv = document.createElement('model-viewer');
      ['camera-controls','auto-rotate','ar'].forEach(function(a){ mv.setAttribute(a,''); });
      mv.setAttribute('src', p.glb); mv.setAttribute('alt', p.nom + ' en 3D'); mv.setAttribute('touch-action','pan-y');
      mv.setAttribute('ar-modes','webxr scene-viewer quick-look'); mv.setAttribute('shadow-intensity','1.1'); mv.setAttribute('environment-image','neutral');
      scene.insertBefore(mv, scene.firstChild);
      $('fiche-ar').onclick = function(){ mv.activateAR && mv.activateAR(); };
    }
    q = 1; if(!maison) total();
  }
  function ouvrir(n){
    clearTimeout(minuteur); i = n; remplir();
    fond.hidden = false; fiche.hidden = false;
    requestAnimationFrame(function(){ document.body.classList.add('fiche-ouverte'); });
    document.documentElement.style.overflow = 'hidden'; if(window.apbLenis) window.apbLenis.stop();
    $('fiche-fermer').focus();
  }
  function fermer(){
    document.body.classList.remove('fiche-ouverte');
    document.documentElement.style.overflow = ''; if(window.apbLenis) window.apbLenis.start();
    clearTimeout(minuteur);
    minuteur = setTimeout(function(){ if(!document.body.classList.contains('fiche-ouverte')){ fiche.hidden = true; fond.hidden = true; } }, 500);
    dernier = plats[i]; if(dernier) dernier.focus({preventScroll:true});
  }
  plats.forEach(function(el, n){
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
    var sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = ', voir la fiche'; el.appendChild(sr);
    el.addEventListener('click', function(){ ouvrir(n); });
    el.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ouvrir(n); } });
  });
  $('fiche-fermer').addEventListener('click', fermer); fond.addEventListener('click', fermer);
  $('fiche-prec').addEventListener('click', function(){ i = (i - 1 + plats.length) % plats.length; remplir(); });
  $('fiche-suiv').addEventListener('click', function(){ i = (i + 1) % plats.length; remplir(); });
  $('moins').addEventListener('click', function(){ if(q > 1){ q--; total(); } });
  $('plus').addEventListener('click', function(){ if(q < 20){ q++; total(); } });
  if(maison){ $('ajouter').innerHTML = 'Commander dans une adresse'; }
  $('ajouter').addEventListener('click', function(){
    if(maison){ fermer(); location.hash = '#adresses'; return; }
    panier += q; montant += info(plats[i]).prix * q; $('panier-txt').textContent = panier + ' · ' + chf(montant);
    $('panier').classList.add('visible'); fermer();
  });
  document.addEventListener('keydown', function(e){
    if(fiche.hidden) return;
    if(e.key === 'Escape') fermer();
    if(e.key === 'ArrowRight') $('fiche-suiv').click();
    if(e.key === 'ArrowLeft') $('fiche-prec').click();
    if(e.key === 'Tab'){ // garder le focus dans la fiche
      var f = fiche.querySelectorAll('button:not([disabled]),[href]'); var a = f[0], z = f[f.length - 1];
      if(e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); }
      else if(!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); }
    }
  });
})();

// Liste d'ouverture : compte à rebours, agenda (.ics) et formulaire (maquette, rien n'est envoyé)
(function(){
  if(!document.getElementById('form-liste') && !document.querySelector('[data-jours]')) return;
  var OUVERTURE = new Date('2026-11-06T11:30:00+01:00'); // hypothèse du devis (ven. 06.11.2026), à confirmer
  var j = Math.max(0, Math.ceil((OUVERTURE - new Date()) / 864e5));
  document.querySelectorAll('[data-jours]').forEach(function(el){ el.textContent = j > 0 ? 'J-' + j : 'Ouvert'; });
  var ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Atelier Paris Burger//FR','BEGIN:VEVENT','UID:ouverture@atelier-paris-burger','DTSTAMP:20261024T000000Z',
    'DTSTART:20261106T103000Z','DTEND:20261106T133000Z','SUMMARY:Ouverture Atelier Paris Burger','LOCATION:Genève\\, face au Jet d\'eau','END:VEVENT','END:VCALENDAR'].join('\r\n');
  if(document.getElementById('agenda')) document.getElementById('agenda').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  var form = document.getElementById('form-liste');
  if(!form) return;
  function err(id, input, msg){ document.getElementById(id).textContent = msg; if(input) input.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var p = form.prenom, m = form.email, a = document.getElementById('l-accord');
    var ok = err('e-prenom', p, p.value.trim() ? '' : 'Votre prénom, s\'il vous plaît.');
    ok = err('e-mail', m, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim()) ? '' : 'Une adresse e-mail valide, s\'il vous plaît.') && ok;
    ok = err('e-accord', null, a.checked ? '' : 'Cochez la case pour recevoir l\'invitation.') && ok;
    if(!ok){ var first = form.querySelector('[aria-invalid=true]') || a; first.focus(); return; }
    document.getElementById('merci-nom').textContent = p.value.trim();
    form.hidden = true; var merci = document.getElementById('merci'); merci.hidden = false; merci.focus();
  });
})();
