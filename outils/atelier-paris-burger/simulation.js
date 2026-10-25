// Simulation : l'ouverture avec les visuels du lancement (assemblage couche par couche, plancha, coupe, trempage, plongée)
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  // Décalage de chaque couche entre la vue éclatée et le burger assemblé (en % de la hauteur de l'image)
  var couches = [['#pBas', -7.3], ['#oignons', -3.9], ['#steaks', 0], ['#sauce', 6.2], ['#pHaut', 11.6]];
  couches.forEach(function(c){ gsap.set(c[0], {yPercent:-55, opacity:0}); });
  gsap.set('#plancha', {scale:1.14, opacity:0});
  gsap.set('#coupe', {scale:1.1, opacity:0});
  gsap.set('#trempe', {scale:1.1, opacity:0, transformOrigin:'52% 74%'});

  var tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:'#scene', start:'top top', end:'+=950%', scrub:1, pin:true, anticipatePin:1, invalidateOnRefresh:true}});
  // 1. Le titre s'efface, le studio noir s'installe
  tl.to('#titre', {opacity:0, y:-60, duration:0.6}, 0).to('#indice', {opacity:0, duration:0.3}, 0)
    .to('#legende', {opacity:0, duration:0.3}, 0.3)
    .to('#studio', {opacity:1, duration:0.4}, 0.3)
  // 2. Assembler : chaque couche se pose, puis tout se resserre et la sauce fond
    .to('#mot1', {opacity:1, duration:0.3}, 0.6);
  couches.forEach(function(c, i){
    tl.to(c[0], {opacity:1, duration:0.2}, 0.5 + i * 0.25)
      .to(c[0], {yPercent:0, duration:0.55, ease:'power3.out'}, 0.5 + i * 0.25)
      .to(c[0], {yPercent:c[1], duration:0.5, ease:'power2.inOut'}, 2.1);
  });
  tl.to('#assemble', {opacity:1, duration:0.4}, 2.5)
    .set('.sim-couche', {opacity:0}, 2.9)
    .to('#mot1', {opacity:0, duration:0.3}, 2.8)
  // 3. Smasher : la plancha, la presse, la croûte
    .to('#pile', {scale:1.35, opacity:0, duration:0.5, ease:'power2.in'}, 3.0)
    .to('#plancha', {opacity:1, duration:0.4}, 3.2)
    .to('#plancha', {scale:1, duration:1.4, ease:'power1.out'}, 3.2)
    .to('#mot0', {opacity:1, duration:0.3}, 3.4)
    .to('#mot0', {opacity:0, duration:0.3}, 4.3)
    .to('#plancha', {opacity:0, duration:0.4}, 4.5)
  // 4. Couper : les deux moitiés, le fromage qui file
    .to('#coupe', {opacity:1, duration:0.4}, 4.6)
    .to('#coupe', {scale:1, duration:1.2, ease:'power1.out'}, 4.6)
    .to('#mot2', {opacity:1, duration:0.3}, 4.9)
    .to('#mot2', {opacity:0, duration:0.3}, 5.8)
    .to('#coupe', {opacity:0, duration:0.4}, 5.9)
  // 5. Tremper : le burger plonge dans le pot
    .to('#trempe', {opacity:1, duration:0.4}, 6.0)
    .to('#trempe', {scale:1, duration:1, ease:'power1.out'}, 6.0)
    .to('#mot3', {opacity:1, duration:0.3}, 6.2)
    .to('#mot3', {opacity:0, duration:0.3}, 7.0)
  // 6. Le visiteur plonge à son tour dans la sauce
    .to('#trempe', {scale:2.6, duration:1, ease:'power2.in'}, 7.0)
    .to('#voile', {opacity:1, duration:0.5}, 7.6)
    .to('#dedans', {opacity:1, duration:0.5}, 7.9)
    .to('#dedans h2', {scale:1.04, duration:0.8}, 8.1);

  gsap.utils.toArray('[data-r]').forEach(function(el){
    gsap.fromTo(el, {y:40, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 85%', once:true}});
  });
})();
