// Simulation : la même ouverture, avec une vraie photo détourée
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
  var vh = function(v){ return function(){ return window.innerHeight * v / 100; }; };
  gsap.set('#base', {y:vh(-70), opacity:0});
  gsap.set('#haut', {y:vh(-60), rotation:-7, opacity:0});

  var tl = gsap.timeline({defaults:{ease:'none'}, scrollTrigger:{trigger:'#scene', start:'top top', end:'+=700%', scrub:1, pin:true, anticipatePin:1, invalidateOnRefresh:true}});
  // 1. Le titre s'efface
  tl.to('#titre', {opacity:0, y:-60, duration:0.6}, 0).to('#indice', {opacity:0, duration:0.3}, 0)
  // 2. Smasher : le burger tombe et s'écrase sur la plaque
    .to('#mot0', {opacity:1, duration:0.3}, 0.4)
    .to('#base', {opacity:1, duration:0.2}, 0.3)
    .to('#base', {y:0, duration:0.6, ease:'power3.in'}, 0.3)
    .to('#base', {scaleY:0.84, scaleX:1.07, duration:0.2, ease:'power2.out'}, 0.9)
    .to('#base', {scaleY:1, scaleX:1, duration:0.45, ease:'elastic.out(1,0.45)'}, 1.1)
    .to('#mot0', {opacity:0, duration:0.3}, 1.4)
  // 3. Assembler : le pain du dessus se pose
    .to('#mot1', {opacity:1, duration:0.3}, 1.6)
    .to('#haut', {opacity:1, duration:0.2}, 1.6)
    .to('#haut', {y:0, rotation:0, duration:0.9, ease:'power2.inOut'}, 1.6)
    .to('#base', {scaleY:0.96, scaleX:1.015, duration:0.12}, 2.5)
    .to('#base', {scaleY:1, scaleX:1, duration:0.3, ease:'elastic.out(1,0.5)'}, 2.62)
    .to('#mot1', {opacity:0, duration:0.3}, 2.8)
  // 4. Couper : la lame descend, les deux moitiés s'ouvrent
    .to('#mot2', {opacity:1, duration:0.3}, 3.0)
    .to('#coupe', {opacity:1, height:'62vh', duration:0.5, ease:'power3.out'}, 3.0)
    .set('#entier', {opacity:0}, 3.5).set('.sim-moitie', {opacity:1}, 3.5)
    .to('#coupe', {opacity:0, duration:0.25}, 3.5)
    .to('#moitieG', {xPercent:-9, rotation:-5, duration:0.6, ease:'power2.out'}, 3.5)
    .to('#moitieD', {xPercent:9, rotation:5, duration:0.6, ease:'power2.out'}, 3.5)
    .to('#mot2', {opacity:0, duration:0.3}, 4.0)
  // 5. Tremper : la sauce monte, une moitié plonge dedans
    .to('#mot3', {opacity:1, duration:0.3}, 4.2)
    .to('#bassin', {bottom:'-24vh', duration:1, ease:'power2.out'}, 4.1)
    .to('#moitieG', {xPercent:-40, opacity:0, duration:0.8, ease:'power2.in'}, 4.3)
    .to('#moitieD', {xPercent:-8, y:vh(46), rotation:28, duration:1.3, ease:'power2.in'}, 4.3)
    .to('#mot3', {opacity:0, duration:0.3}, 5.3)
  // 6. Le visiteur plonge à son tour
    .to('#legende', {opacity:0, duration:0.3}, 5.4)
    .to('#dedans', {opacity:1, duration:0.6}, 6.5)
    .to('#dedans h2', {scale:1.04, duration:0.8}, 6.7);
  if(window.apbSauce) window.apbSauce(tl, 4.95, 5.4, 7);

  gsap.utils.toArray('[data-r]').forEach(function(el){
    gsap.fromTo(el, {y:40, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 85%', once:true}});
  });
})();
