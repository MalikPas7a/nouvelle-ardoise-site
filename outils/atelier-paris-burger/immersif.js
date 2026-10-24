
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

  // Sceau « Depuis 1978 » : tourne doucement, accélère avec le défilement
  var hote = document.querySelector('.ouverture') || document.querySelector('.ix-scene');
  if(hote){
    var sc = document.createElement('div'); sc.className = 'sceau'; sc.setAttribute('aria-hidden', 'true');
    sc.innerHTML = '<svg viewBox="0 0 120 120"><defs><path id="sceau-c" d="M60 60 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0"/></defs>' +
      '<circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" stroke-opacity=".35"/>' +
      '<text><textPath href="#sceau-c" textLength="298" lengthAdjust="spacing">Depuis 1978 · Sauce de la maison · Paris ·</textPath></text></svg><div class="ab">' + logo + '</div>';
    hote.appendChild(sc);
    if(!reduit){
      var tour = sc.querySelector('svg'), angle = 0, vitesse = 0, dernier = window.scrollY;
      (function boucle(){
        var y = window.scrollY, v = Math.abs(y - dernier); dernier = y;
        vitesse += (Math.min(v, 60) * .25 - vitesse) * .08;
        angle = (angle + .12 + vitesse) % 360;
        tour.style.transform = 'rotate(' + angle + 'deg)';
        requestAnimationFrame(boucle);
      })();
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
      zone.addEventListener('mouseleave', function(){ minuterie = setTimeout(function(){ ouvre(false); }, 220); });
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

  // Rideau bordeaux entre les pages de la maison
  if(!reduit){
    var rideau = document.createElement('div'); rideau.className = 'rideau'; rideau.setAttribute('aria-hidden', 'true'); rideau.innerHTML = logo;
    document.body.appendChild(rideau);
    var arrivee = (function(){ try { return sessionStorage.getItem('apb-rideau'); } catch(e){ return null; } })();
    if(arrivee){
      try { sessionStorage.removeItem('apb-rideau'); } catch(e){}
      rideau.classList.add('couvre');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ rideau.classList.add('part'); }); });
      setTimeout(function(){ rideau.className = 'rideau'; }, 900);
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
      setTimeout(function(){ location.href = u.href; }, 520);
    });
    window.addEventListener('pageshow', function(e){ if(e.persisted) rideau.className = 'rideau'; });
  }
})();
