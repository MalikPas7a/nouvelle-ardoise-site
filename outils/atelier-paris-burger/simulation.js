// Simulation : l'ouverture avec les visuels du lancement (plancha, assemblage couche par couche, trempage, plongée)
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  // Décalage de chaque couche entre la vue éclatée et le burger assemblé (en % de la hauteur de l'image)
  var couches = [['#pBas', -7.3], ['#oignons', -3.9], ['#steaks', 0], ['#sauce', 6.2], ['#pHaut', 11.6]];
  couches.forEach(function(c){ gsap.set(c[0], {yPercent:-55, opacity:0}); });
  gsap.set('#plancha', {scale:1.14, opacity:0});
  gsap.set('#trempe', {scale:1.1, opacity:0, transformOrigin:'52% 74%'});

  var tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:'#scene', start:'top top', end:'+=800%', scrub:1, pin:true, anticipatePin:1, invalidateOnRefresh:true}});
  // 1. Le titre s'efface, le studio noir s'installe
  tl.to('#titre', {opacity:0, y:-60, duration:0.6}, 0).to('#indice', {opacity:0, duration:0.3}, 0)
    .to('#legende', {opacity:0, duration:0.3}, 0.3)
    .to('#studio', {opacity:1, duration:0.4}, 0.3)
  // 2. Smasher : la plancha, la presse, la croûte
    .to('#plancha', {opacity:1, duration:0.4}, 0.4)
    .to('#plancha', {scale:1, duration:1.6, ease:'power1.out'}, 0.4)
    .to('#mot0', {opacity:1, duration:0.3}, 0.6)
    .to('#mot0', {opacity:0, duration:0.3}, 1.5)
    .to('#plancha', {opacity:0, duration:0.4}, 1.6)
  // 3. Assembler : chaque couche se pose, puis tout se resserre et la sauce fond
    .to('#mot1', {opacity:1, duration:0.3}, 2.0);
  couches.forEach(function(c, i){
    tl.to(c[0], {opacity:1, duration:0.2}, 1.9 + i * 0.25)
      .to(c[0], {yPercent:0, duration:0.55, ease:'power3.out'}, 1.9 + i * 0.25)
      .to(c[0], {yPercent:c[1], duration:0.5, ease:'power2.inOut'}, 3.5);
  });
  tl.to('#assemble', {opacity:1, duration:0.4}, 3.9)
    .set('.sim-couche', {opacity:0}, 4.3)
    .to('#mot1', {opacity:0, duration:0.3}, 4.2)
  // 4. Tremper : la caméra avance, le burger plonge dans le pot
    .to('#pile', {scale:1.35, opacity:0, duration:0.5, ease:'power2.in'}, 4.5)
    .to('#trempe', {opacity:1, duration:0.4}, 4.7)
    .to('#trempe', {scale:1, duration:1.1, ease:'power1.out'}, 4.7)
    .to('#mot3', {opacity:1, duration:0.3}, 4.8)
    .to('#mot3', {opacity:0, duration:0.3}, 5.8)
  // 5. Le visiteur plonge à son tour dans la sauce
    .to('#trempe', {scale:2.6, duration:1, ease:'power2.in'}, 5.8)
    .to('#voile', {opacity:1, duration:0.5}, 6.4)
    .to('#dedans', {opacity:1, duration:0.5}, 6.7)
    .to('#dedans h2', {scale:1.04, duration:0.8}, 6.9);

  gsap.utils.toArray('[data-r]').forEach(function(el){
    gsap.fromTo(el, {y:40, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 85%', once:true}});
  });
})();
