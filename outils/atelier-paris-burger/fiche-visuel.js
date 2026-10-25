
// ---------- Fiche plat en présentation : une image quand on l'a, sinon le nom du plat en grand ----------
// Le placeholder « Vue 3D » reste visible en mode notes de maquette (consigne pour le scan au shooting).
(function(){
  var fiche = document.getElementById('fiche'); if(!fiche) return;
  var vide = document.getElementById('fiche-vide'), nom = document.getElementById('fiche-nom');
  var src = (document.querySelector('script[src$="assets/apb.js"]') || {}).src || '';
  var IMAGES = {'Le Café de Paris':'carte', 'Le Double Maison':'carte'};
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
