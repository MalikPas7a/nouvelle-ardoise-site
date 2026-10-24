// ---------- Plongée dans la sauce : la nappe monte, sans gouttes ni effets ajoutés ----------
(function(){
  var scene = document.querySelector('.ix-scene'); if(!scene) return;
  var plongee = scene.querySelector('.ix-plongee');
  // Appelé par la timeline de l'ouverture : t = instant du contact (gardé pour compatibilité), debutPlongee = la nappe monte
  window.apbSauce = function(tl, t, debutPlongee){
    if(plongee) tl.fromTo(plongee, {yPercent:110}, {yPercent:0, duration:1.4, ease:'power2.inOut'}, debutPlongee);
  };
})();
