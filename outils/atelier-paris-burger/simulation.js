// Simulation : l'ouverture avec les visuels du lancement (assemblage couche par couche, plancha, coupe, trempage, plongée)
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  // Décalage de chaque couche entre la vue éclatée et le burger assemblé (en % de la hauteur de l'image)
  var couches = [['#pBas', -7.3], ['#oignons', -3.9], ['#steaks', 0], ['#sauce', 6.2], ['#pHaut', 11.6]];
  couches.forEach(function(c){ gsap.set(c[0], {yPercent:-55, opacity:0}); });
  // Transitions par zoom avant : l'image sortante plonge vers son sujet, l'entrante arrive grossie et se pose
  gsap.set('#plancha', {scale:1.4, opacity:0, transformOrigin:'45% 62%'});
  gsap.set('#coupe', {scale:1.4, opacity:0, transformOrigin:'50% 50%'});
  gsap.set('#trempe', {scale:1.4, opacity:0, transformOrigin:'52% 74%'});

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
  // 3. Smasher : zoom dans le burger, on arrive sur la plancha
    .to('#pile', {scale:1.8, duration:0.6, ease:'power2.in'}, 2.95)
    .to('#pile', {opacity:0, duration:0.25}, 3.3)
    .to('#plancha', {opacity:1, duration:0.25}, 3.3)
    .to('#plancha', {scale:1, duration:1.2, ease:'power2.out'}, 3.3)
    .to('#mot0', {opacity:1, duration:0.3}, 3.5)
    .to('#mot0', {opacity:0, duration:0.3}, 4.3)
  // 4. Couper : zoom dans la viande écrasée, on arrive sur les deux moitiés
    .to('#plancha', {scale:1.8, duration:0.6, ease:'power2.in'}, 4.4)
    .to('#plancha', {opacity:0, duration:0.25}, 4.75)
    .to('#coupe', {opacity:1, duration:0.25}, 4.75)
    .to('#coupe', {scale:1, duration:1.1, ease:'power2.out'}, 4.75)
    .to('#mot2', {opacity:1, duration:0.3}, 4.95)
    .to('#mot2', {opacity:0, duration:0.3}, 5.8)
  // 5. Tremper : zoom dans la coupe, on arrive sur le pot
    .to('#coupe', {scale:1.8, duration:0.6, ease:'power2.in'}, 5.85)
    .to('#coupe', {opacity:0, duration:0.25}, 6.2)
    .to('#trempe', {opacity:1, duration:0.25}, 6.2)
    .to('#trempe', {scale:1, duration:1, ease:'power2.out'}, 6.2)
    .to('#mot3', {opacity:1, duration:0.3}, 6.4)
    .to('#mot3', {opacity:0, duration:0.3}, 7.1)
  // 6. Le visiteur plonge à son tour dans la sauce
    .to('#trempe', {scale:2.6, duration:1, ease:'power2.in'}, 7.2)
    .to('#voile', {opacity:1, duration:0.5}, 7.8)
    .to('#dedans', {opacity:1, duration:0.5}, 8.1)
    .to('#dedans h2', {scale:1.04, duration:0.8}, 8.3);

  gsap.utils.toArray('[data-r]').forEach(function(el){
    gsap.fromTo(el, {y:40, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 85%', once:true}});
  });
})();
