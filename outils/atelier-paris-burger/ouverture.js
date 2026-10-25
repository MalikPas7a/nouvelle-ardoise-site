
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
