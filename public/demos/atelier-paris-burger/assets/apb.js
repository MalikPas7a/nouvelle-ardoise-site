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
      gsap.fromTo(el.querySelectorAll('.mot'), {yPercent:110}, {yPercent:0, duration:0.7, ease:'power3.out', stagger:0.035,
        scrollTrigger: el.closest('.ouverture') ? null : {trigger:el, start:'top 84%', once:true}, delay: el.closest('.ouverture') ? 0.15 : 0});
    });
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      var inHero = el.closest('.ouverture');
      gsap.to(el, {opacity:1, y:0, duration:0.6, ease:'power3.out', delay: inHero ? 0.3 : 0,
        scrollTrigger: inHero ? null : {trigger:el, start:'top 88%', once:true}});
    });
    gsap.utils.toArray('.ph[data-clip]').forEach(function(el){
      gsap.to(el, {clipPath:'inset(0% 0 0 0)', duration:0.8, ease:'expo.out', scrollTrigger:{trigger:el, start:'top 92%', once:true}});
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
    'Le Signature':{c:['Pain brioché toasté','Bœuf haché minute, 150 g','Cheddar affiné','Oignons confits','Sauce Café de Paris servie à part'],a:['À valider par la cuisine']},
    'Le Double':{c:['Pain brioché toasté','Deux steaks de bœuf, 2 × 110 g','Double cheddar','Pickles maison','Sauce Café de Paris servie à part'],a:['À valider par la cuisine']},
    'Le Marais':{c:['Pain brioché toasté','Poulet croustillant','Salade','Sauce blanche aux herbes'],a:['À valider par la cuisine']},
    'Le Jardin':{c:['Pain brioché toasté','Galette de légumes grillés','Chèvre','Roquette'],a:['À valider par la cuisine']},
    'La Parisienne':{c:['Baguette tradition','Bœuf tranché fin','Oignons','Sauce Café de Paris'],a:['À valider par la cuisine']},
    'La Rive Gauche':{c:['Baguette tradition','Poulet rôti','Crudités','Mayonnaise maison'],a:['À valider par la cuisine']},
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
    $('fiche-prix').textContent = maison ? 'Prix selon l\'adresse' : chf(p.prix) + (document.documentElement.classList.contains('notes') ? ' · exemple' : '');
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

// ---------- Couche immersive : boutons sauce, cartes vivantes, rideau, sceau ----------
(function(){
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tactile = window.matchMedia('(hover: none)').matches;
  var logo = '<svg aria-hidden="true"><use href="#apb-logo"/></svg>';

  // Boutons : texte doublé pour le roulement (le double est caché aux lecteurs d'écran)
  document.querySelectorAll('.btn').forEach(function(b){
    [].slice.call(b.childNodes).forEach(function(n){
      var t = n.nodeType === 3 ? n.textContent.trim() : '';
      if(!t) return;
      var r = document.createElement('span'); r.className = 'roule';
      r.innerHTML = '<span></span><span aria-hidden="true"></span>';
      r.children[0].textContent = t; r.children[1].textContent = t;
      b.replaceChild(r, n);
    });
    // Sur téléphone, la sauce monte au toucher puis redescend
    if(tactile && !reduit){
      b.addEventListener('pointerdown', function(){ b.classList.add('presse'); if(navigator.vibrate) navigator.vibrate(8); });
      ['pointerup','pointercancel','pointerleave'].forEach(function(e){ b.addEventListener(e, function(){ setTimeout(function(){ b.classList.remove('presse'); }, 260); }); });
    }
  });

  // Carte : une goutte tombe sous le nom du plat survolé
  if(!reduit && !tactile){
    document.querySelectorAll('.plat').forEach(function(p){
      var g = document.createElement('i'); g.className = 'goutte'; g.setAttribute('aria-hidden', 'true'); p.appendChild(g);
      p.addEventListener('mouseenter', function(){
        var nom = p.querySelector('.nom'); if(!nom) return;
        var pr = p.getBoundingClientRect(), nr = nom.getBoundingClientRect();
        g.style.left = (nr.right - pr.left - 6) + 'px'; g.style.top = (nr.bottom - pr.top - 2) + 'px';
        g.style.animation = 'none'; void g.offsetWidth; g.style.animation = 'apb-goutte .9s .55s cubic-bezier(.5,0,.8,.6) both';
      });
    });
  }

  // Adresses : coordonnées de chaque ville, comme sur une étiquette de caisse
  var coords = {'geneve-eaux-vives/':'46°12′ N · 6°09′ E','geneve-versoix/':'46°17′ N · 6°10′ E','madrid/':'40°25′ N · 3°42′ O','ibiza/':'38°54′ N · 1°26′ E'};
  document.querySelectorAll('a.adresse').forEach(function(a){
    var c = coords[(a.getAttribute('href') || '').replace(/^(\.\.\/)+/, '')]; if(!c) return;
    var e = document.createElement('span'); e.className = 'coord'; e.textContent = c;
    a.querySelector('h3').after(e);
  });

  // Pied : la signature géante monte au défilement
  var pied = document.querySelector('footer.pied');
  if(pied){
    var s = document.createElement('div'); s.className = 'signature'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = 'Atelier Paris Burger'.split(' ').map(function(m){ return '<span>' + m + '</span>'; }).join(' ');
    pied.insertBefore(s, pied.firstChild);
    if(window.gsap && window.ScrollTrigger && !reduit){
      gsap.from(s.children, {yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: {trigger: pied, start: 'top 85%'}});
    }
  }

  // Sceau « Paris · plus de 40 ans » : tourne doucement, accélère avec le défilement
  var hote = document.querySelector('.ouverture') || document.querySelector('.ix-scene');
  if(hote){
    var sc = document.createElement('div'); sc.className = 'sceau'; sc.setAttribute('aria-hidden', 'true');
    sc.innerHTML = '<svg viewBox="0 0 120 120"><defs><path id="sceau-c" d="M60 60 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0"/></defs>' +
      '<circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" stroke-opacity=".35"/>' +
      '<text><textPath href="#sceau-c" textLength="298" lengthAdjust="spacing">Sauce de la maison · Paris · plus de 40 ans ·</textPath></text></svg><div class="ab">' + logo + '</div>';
    hote.appendChild(sc);
    // Dans l'ouverture au scroll, le sceau s'efface avec le titre pour laisser place aux mots
    if(!reduit && window.gsap && window.ScrollTrigger && hote.classList.contains('ix-scene')){
      gsap.to(sc, {opacity:0, ease:'none', scrollTrigger:{trigger:hote, start:'top top', end:function(){ return '+=' + window.innerHeight * 0.4; }, scrub:true}});
    }
    if(!reduit){
      var tour = sc.querySelector('svg'), angle = 0, vitesse = 0, dernier = window.scrollY;
      function boucle(){
        var y = window.scrollY, v = Math.abs(y - dernier); dernier = y;
        vitesse += (Math.min(v, 60) * .25 - vitesse) * .08;
        angle = (angle + .12 + vitesse) % 360;
        tour.style.transform = 'rotate(' + angle + 'deg)';
        if(visible) requestAnimationFrame(boucle); else enCours = false;
      }
      // La boucle ne tourne que lorsque le sceau est à l'écran
      var visible = true, enCours = true;
      new IntersectionObserver(function(e){
        visible = e[0].isIntersecting;
        if(visible && !enCours){ enCours = true; dernier = window.scrollY; requestAnimationFrame(boucle); }
      }).observe(sc);
      boucle();
    }
  }

  // Panier : une goutte de sauce vole du bouton vers la commande
  var ajouter = document.getElementById('ajouter'), panier = document.getElementById('panier');
  if(ajouter && panier && document.body.dataset.page !== 'maison'){
    ajouter.addEventListener('click', function(){
      if(navigator.vibrate) navigator.vibrate([10, 40, 14]);
      if(reduit) return;
      var d = ajouter.getBoundingClientRect();
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        var a = panier.getBoundingClientRect();
        var g = document.createElement('i'); g.className = 'vol-goutte'; document.body.appendChild(g);
        var x0 = d.left + d.width / 2, y0 = d.top + d.height / 2, x1 = a.left + 28, y1 = a.top + a.height / 2;
        var anim = g.animate([
          {transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.6)'},
          {transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - 120) + 'px) scale(1)', offset: .45},
          {transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.5,.8)'}
        ], {duration: 720, easing: 'cubic-bezier(.4,0,.6,1)'});
        g.style.left = g.style.top = '0';
        anim.onfinish = function(){ g.remove(); panier.classList.remove('rebond'); void panier.offsetWidth; panier.classList.add('rebond'); };
      }); });
    });
  }

  // Nos adresses : menu déroulant (clic, clavier, survol sur ordinateur)
  var adrB = document.getElementById('adr-bouton'), adrM = document.getElementById('adr-menu');
  if(adrB && adrM){
    var minuterie = null;
    var ouvre = function(o){ clearTimeout(minuterie); adrM.hidden = !o; adrB.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    adrB.addEventListener('click', function(){ ouvre(adrM.hidden); });
    if(!tactile){
      var zone = adrB.parentNode;
      zone.addEventListener('mouseenter', function(){ ouvre(true); });
      zone.addEventListener('mouseleave', function(){ minuterie = setTimeout(function(){ ouvre(false); }, 160); });
    }
    document.addEventListener('click', function(e){ if(!adrB.parentNode.contains(e.target)) ouvre(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !adrM.hidden){ ouvre(false); adrB.focus(); } });
    adrM.addEventListener('focusout', function(e){ if(!adrB.parentNode.contains(e.relatedTarget)) ouvre(false); });
  }

  // Accueil : la barre des villes n'est cliquable que tant que le titre est visible
  var titre = document.querySelector('.ix-titre');
  if(titre && titre.querySelector('.ix-villes')){
    var maj = function(){ titre.style.pointerEvents = parseFloat(getComputedStyle(titre).opacity) > .5 ? '' : 'none'; };
    window.addEventListener('scroll', maj, {passive: true}); maj();
  }

  // Pages de la maison préchargées : le changement d'adresse est instantané
  var dejaPrecharge = {};
  function precharger(href){
    if(dejaPrecharge[href]) return; dejaPrecharge[href] = 1;
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = href; document.head.appendChild(l);
  }
  document.querySelectorAll('a[href]').forEach(function(a){
    var u; try { u = new URL(a.href, location.href); } catch(e){ return; }
    if(u.origin !== location.origin || u.pathname.indexOf('/demos/atelier-paris-burger/') !== 0 || u.pathname === location.pathname) return;
    ['pointerenter','focus','touchstart'].forEach(function(ev){ a.addEventListener(ev, function(){ precharger(u.pathname); }, {passive: true, once: true}); });
  });
  if('requestIdleCallback' in window) requestIdleCallback(function(){ document.querySelectorAll('.adr-menu a, .ix-villes a').forEach(function(a){ precharger(new URL(a.href, location.href).pathname); }); });

  // Notes de maquette : masquées par défaut, un bouton discret les affiche
  var bn = document.createElement('button'); bn.type = 'button'; bn.className = 'bouton-notes';
  var notesOn = false; try { notesOn = sessionStorage.getItem('apb-notes') === '1'; } catch(e){}
  var majNotes = function(){ document.documentElement.classList.toggle('notes', notesOn); bn.setAttribute('aria-pressed', notesOn ? 'true' : 'false'); bn.textContent = notesOn ? 'Masquer les notes' : 'Notes de maquette'; };
  bn.addEventListener('click', function(){ notesOn = !notesOn; try { sessionStorage.setItem('apb-notes', notesOn ? '1' : '0'); } catch(e){} majNotes(); });
  (document.querySelector('.pied .bas') || document.body).appendChild(bn); majNotes();

  // Rideau bordeaux entre les pages de la maison
  if(!reduit){
    var rideau = document.createElement('div'); rideau.className = 'rideau'; rideau.setAttribute('aria-hidden', 'true'); rideau.innerHTML = logo;
    document.body.appendChild(rideau);
    var arrivee = (function(){ try { return sessionStorage.getItem('apb-rideau'); } catch(e){ return null; } })();
    if(arrivee){
      try { sessionStorage.removeItem('apb-rideau'); } catch(e){}
      rideau.classList.add('couvre');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ rideau.classList.add('part'); }); });
      setTimeout(function(){ rideau.className = 'rideau'; }, 360);
    }
    document.addEventListener('click', function(e){
      var l = e.target.closest && e.target.closest('a[href]');
      if(!l || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || l.target) return;
      var u = new URL(l.href, location.href);
      if(u.origin !== location.origin || u.pathname.indexOf('/demos/atelier-paris-burger/') !== 0) return;
      if(u.pathname === location.pathname) return;
      e.preventDefault();
      try { sessionStorage.setItem('apb-rideau', '1'); } catch(err){}
      rideau.className = 'rideau entre';
      setTimeout(function(){ location.href = u.href; }, 240);
    });
    window.addEventListener('pageshow', function(e){ if(e.persisted) rideau.className = 'rideau'; });
  }
})();
// ---------- Plongée dans la sauce : la nappe monte, sans gouttes ni effets ajoutés ----------
(function(){
  var scene = document.querySelector('.ix-scene'); if(!scene) return;
  var plongee = scene.querySelector('.ix-plongee');
  // Appelé par la timeline de l'ouverture : t = instant du contact (gardé pour compatibilité), debutPlongee = la nappe monte
  window.apbSauce = function(tl, t, debutPlongee){
    if(plongee) tl.fromTo(plongee, {yPercent:110}, {yPercent:0, duration:1.4, ease:'power2.inOut'}, debutPlongee);
  };
})();

// ---------- Ouverture : le burger étape par étape, puis l'histoire à part ----------
// Une bande horizontale épinglée (ordinateur et téléphone) : assembler, smasher, couper, tremper.
(function(){
  var ov = document.getElementById('ouverture'); if(!ov) return;
  var racine = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduit || !window.gsap || !window.ScrollTrigger){ racine.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});   // la barre d'adresse de l'iPhone ne relance pas les calculs
  var piste = document.getElementById('piste'), assemblage = document.getElementById('v-assemble');
  // Décalage de chaque couche entre la vue éclatée et le burger assemblé (en % de la hauteur de l'image)
  // La sauce Café de Paris n'est pas dans le burger : elle est servie à part, pour tremper
  var couches = [['#ov-pbas', -7.3], ['#ov-oignons', -3.9], ['#ov-steaks', 0], ['#ov-phaut', 12.4]];
  var GLISSE = 0.5;   // px de scroll par px de bande : la bande va plus vite que la molette

  // Les couches tombent et les étiquettes s'affichent (durée 1)
  function chute(){
    var tl = gsap.timeline({defaults:{ease:'none'}});
    couches.forEach(function(c, i){
      tl.fromTo(c[0], {yPercent:-50, opacity:0}, {yPercent:0, opacity:1, duration:0.5, ease:'power3.out'}, i * 0.1);
    });
    return tl.fromTo('.ov-etq', {opacity:0}, {opacity:1, duration:0.2, stagger:0.05}, 0.7);
  }
  // Les couches se serrent : le burger est monté (durée 1)
  function serre(){
    var tl = gsap.timeline({defaults:{ease:'none'}});
    tl.to('.ov-etq', {opacity:0, duration:0.15}, 0.25);
    couches.forEach(function(c){ tl.to(c[0], {yPercent:c[1], duration:0.4, ease:'power2.inOut'}, 0.3); });
    return tl.to('#v-assemble .ov-mot small', {opacity:1, duration:0.2}, 0.65)
      .to({}, {duration:0.14});
  }

  var mm;
  function installer(){
  mm = gsap.matchMedia();
  // Ordinateur et téléphone : la même bande horizontale, épinglée. Les couches tombent à l'approche,
  // la bande reste immobile le temps que le burger se serre, puis glisse jusqu'à « Tremper ».
  mm.add({bureau:'(min-width: 901px)', tel:'(max-width: 900px)'}, function(ctx){
    racine.classList.add('ov-h');
    var vw = window.innerWidth, vh = window.innerHeight;
    var course = piste.scrollWidth - vw;
    var arret = vh * 0.7;
    var glisse = ctx.conditions.bureau ? 0.5 : 0.85;   // px de scroll par px de bande
    gsap.timeline({scrollTrigger:{trigger:ov, start:'top 85%', end:'top top', scrub:true}}).add(chute());
    var tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:ov, start:'top top', end:'+=' + (arret + course * glisse), pin:true, scrub:true, anticipatePin:1}});
    tl.add(serre().duration(arret), 0)
      .to(piste, {x:-course, duration:course * glisse}, arret);
    gsap.utils.toArray('.ov-v .ov-img').forEach(function(img){
      var g = img.parentNode.offsetLeft, debut = Math.max(0, g - vw);
      tl.fromTo(img, {scale:1.1}, {scale:1, duration:(g - debut) * glisse || 1}, arret + debut * glisse);
    });
    gsap.utils.toArray('.ov-v .ov-mot').forEach(function(el){
      if(el.closest('#v-assemble')) return;
      var g = el.closest('.ov-p').offsetLeft;
      tl.fromTo(el, {y:34, opacity:0}, {y:0, opacity:1, duration:vw * 0.35 * glisse}, arret + Math.max(0, g - vw * 0.9) * glisse);
    });
    // Toute la géométrie est mesurée à la construction : on reconstruit quand la largeur change
    var largeur = vw, attente, refait = function(){
      if(window.innerWidth === largeur) return;      // la barre d'adresse de l'iPhone ne change que la hauteur
      clearTimeout(attente); attente = setTimeout(function(){ mm.revert(); installer(); ScrollTrigger.refresh(); }, 250);
    };
    window.addEventListener('resize', refait);
    return function(){ window.removeEventListener('resize', refait); racine.classList.remove('ov-h'); };
  });
  // L'histoire : chaque chapitre apparaît une fois, sans effet de plus
  gsap.utils.toArray('.hist h2, .hist-ch').forEach(function(el){
    gsap.fromTo(el, {y:28, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%', once:true}});
  });
  }
  installer();
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();

// ---------- Fiche plat en présentation : une image quand on l'a, sinon le nom du plat en grand ----------
// Le placeholder « Vue 3D » reste visible en mode notes de maquette (consigne pour le scan au shooting).
(function(){
  var fiche = document.getElementById('fiche'); if(!fiche) return;
  var vide = document.getElementById('fiche-vide'), nom = document.getElementById('fiche-nom');
  var src = (document.querySelector('script[src$="assets/apb.js"]') || {}).src || '';
  var IMAGES = {'Le Signature':'carte', 'Le Double':'carte'};
  new MutationObserver(function(){
    if(fiche.hidden || document.documentElement.classList.contains('notes')) return;
    var n = nom.textContent.trim();
    var ancien = vide.querySelector('.fiche-visuel'); if(ancien) ancien.remove();
    vide.classList.remove('avec-img', 'typo');
    if(IMAGES[n]){
      vide.classList.add('avec-img');
      vide.insertAdjacentHTML('afterbegin', '<img class="fiche-visuel" src="' + src.replace('apb.js', 'photos/' + IMAGES[n] + '.webp') + '" alt="' + n + '">');
    } else {
      vide.classList.add('typo');
      var s = document.createElement('span'); s.className = 'fiche-visuel'; s.textContent = n; vide.insertBefore(s, vide.firstChild);
    }
  }).observe(fiche, {attributes:true, attributeFilter:['hidden']});
})();
