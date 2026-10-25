
// ---------- Ouverture : le burger et l'histoire en alternance ----------
// Ordinateur : une seule timeline épinglée. La bande glisse vers la droite, s'arrête sur l'assemblage
// le temps que le burger se monte, puis repart ; chaque image zoome et chaque texte apparaît en passant.
// Téléphone : panneaux empilés, les couches tombent à l'approche puis l'assemblage s'épingle pour se serrer.
(function(){
  var ov = document.getElementById('ouverture'); if(!ov) return;
  var racine = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduit || !window.gsap || !window.ScrollTrigger){ racine.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  var piste = document.getElementById('piste'), assemblage = document.getElementById('v-assemble');
  // Décalage de chaque couche entre la vue éclatée et le burger assemblé (en % de la hauteur de l'image)
  var couches = [['#ov-pbas', -7.3], ['#ov-oignons', -3.9], ['#ov-steaks', 0], ['#ov-sauce', 6.2], ['#ov-phaut', 11.6]];
  var GLISSE = 0.5;   // px de scroll par px de bande : la bande va plus vite que la molette

  // Les couches tombent et les étiquettes s'affichent (durée 1)
  function chute(){
    var tl = gsap.timeline({defaults:{ease:'none'}});
    couches.forEach(function(c, i){
      tl.fromTo(c[0], {yPercent:-50, opacity:0}, {yPercent:0, opacity:1, duration:0.5, ease:'power3.out'}, i * 0.1);
    });
    return tl.fromTo('.ov-etq', {opacity:0}, {opacity:1, duration:0.2, stagger:0.05}, 0.7);
  }
  // Les couches se serrent, puis le burger assemblé prend le relais (durée 1)
  function serre(){
    var tl = gsap.timeline({defaults:{ease:'none'}});
    tl.to('.ov-etq', {opacity:0, duration:0.15}, 0.25);
    couches.forEach(function(c){ tl.to(c[0], {yPercent:c[1], duration:0.35, ease:'power2.inOut'}, 0.3); });
    return tl.to('.ov-assemble', {opacity:1, duration:0.25}, 0.6)
      .set('.ov-couche', {opacity:0}, 0.86)
      .to('#v-assemble .ov-mot small', {opacity:1, duration:0.2}, 0.65)
      .to({}, {duration:0.14});
  }

  var mm;
  function installer(){
  mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function(){
    racine.classList.add('ov-h');
    var vw = window.innerWidth, vh = window.innerHeight;
    var course = piste.scrollWidth - vw;
    var xA = Math.min(course, assemblage.offsetLeft + assemblage.offsetWidth / 2 - vw / 2);
    var arret = vh * 0.8;                      // scroll réservé au montage, bande immobile
    // Position de la bande (px) → instant de la timeline (px de scroll)
    var t = function(x){ x = Math.max(0, Math.min(course, x)); return x * GLISSE + (x > xA ? arret : 0); };
    var tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:ov, start:'top top', end:'+=' + t(course), pin:true, scrub:true, anticipatePin:1}});
    tl.to(piste, {x:-xA, duration:t(xA)}, 0)
      .to(piste, {x:-course, duration:t(course) - t(xA) - arret}, t(xA) + arret);
    tl.to('#titre .ov-hero-in', {xPercent:-12, opacity:0.2, duration:t(vw)}, 0);
    // Les couches tombent pendant l'arrivée du panneau, se serrent une fois qu'il est centré
    var debut = Math.max(0, t(xA - vw * 0.45));
    tl.add(chute().duration(t(xA) - debut), debut).add(serre().duration(arret), t(xA));
    gsap.utils.toArray('.ov-v .ov-img').forEach(function(img){
      var g = img.parentNode.offsetLeft;
      tl.fromTo(img, {scale:1.1}, {scale:1, duration:t(g) - t(g - vw)}, t(g - vw));
    });
    gsap.utils.toArray('.ov-t [data-r], .ov-mot').forEach(function(el){
      var g = el.closest('.ov-p').offsetLeft;
      if(el.closest('#v-assemble')) return;
      tl.fromTo(el, {y:34, opacity:0}, {y:0, opacity:1, duration:t(g - vw * 0.55) - t(g - vw * 0.9)}, t(g - vw * 0.9));
    });
    // Toute la géométrie est mesurée à la construction : on reconstruit au redimensionnement
    var attente, refait = function(){ clearTimeout(attente); attente = setTimeout(function(){ mm.revert(); installer(); ScrollTrigger.refresh(); }, 250); };
    window.addEventListener('resize', refait);
    return function(){ window.removeEventListener('resize', refait); racine.classList.remove('ov-h'); };
  });
  mm.add('(max-width: 900px)', function(){
    gsap.timeline({scrollTrigger:{trigger:assemblage, start:'top 85%', end:'top top', scrub:true}}).add(chute());
    gsap.timeline({scrollTrigger:{trigger:assemblage, start:'top top', end:'+=90%', pin:true, scrub:true, anticipatePin:1}}).add(serre());
    gsap.utils.toArray('.ov-v .ov-img').forEach(function(img){
      gsap.fromTo(img, {scale:1.1}, {scale:1, ease:'none', scrollTrigger:{trigger:img.parentNode, start:'top bottom', end:'top top', scrub:true}});
    });
    gsap.utils.toArray('.ov-t [data-r], .ov-mot').forEach(function(el){
      if(el.closest('#v-assemble')) return;
      gsap.fromTo(el, {y:34, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%', once:true}});
    });
  });
  }
  installer();
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();
