
// ---------- Sauce vivante : herbes, ondes au trempage, vague de plongée, bulles ----------
(function(){
  var scene = document.querySelector('.ix-scene'); if(!scene) return;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 760px)').matches;
  // Texture d'herbes (persil, ciboulette, estragon) dessinée une fois, partagée par toute la sauce
  try {
    var c = document.createElement('canvas'); c.width = c.height = 420; var x = c.getContext('2d');
    var teintes = ['rgba(70,92,34,.55)', 'rgba(96,112,40,.45)', 'rgba(120,70,20,.35)', 'rgba(52,70,26,.6)'];
    for(var i = 0; i < 260; i++){
      x.save(); x.translate(Math.random() * 420, Math.random() * 420); x.rotate(Math.random() * Math.PI);
      x.fillStyle = teintes[i % teintes.length]; x.beginPath();
      x.ellipse(0, 0, 0.8 + Math.random() * 3.2, 0.5 + Math.random() * 1.1, 0, 0, Math.PI * 2); x.fill(); x.restore();
    }
    for(var j = 0; j < 40; j++){ x.fillStyle = 'rgba(255,246,220,.35)'; x.beginPath(); x.arc(Math.random() * 420, Math.random() * 420, 1 + Math.random() * 2.5, 0, Math.PI * 2); x.fill(); }
    document.documentElement.style.setProperty('--apb-herbes', 'url(' + c.toDataURL('image/png') + ')');
  } catch(e){}
  // Crête de vague : deux SVG en motif répété, couleurs de la sauce
  var vague = function(h, haut, bas){
    return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ' + h + '" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + haut + '"/><stop offset="1" stop-color="' + bas + '"/></linearGradient></defs><path fill="url(#g)" d="M0 ' + (h * .45) + ' C 80 ' + (h * .05) + ' 160 ' + (h * .05) + ' 240 ' + (h * .4) + ' S 400 ' + (h * .85) + ' 480 ' + (h * .45) + ' S 600 ' + (h * .1) + ' 640 ' + (h * .45) + ' V ' + h + ' H 0 Z"/></svg>') + '")';
  };
  document.documentElement.style.setProperty('--apb-vague', vague(70, '#EBCB80', '#D7AA4E'));
  var plongee = scene.querySelector('.ix-plongee');
  if(plongee && !reduit){
    plongee.insertAdjacentHTML('afterbegin', '<span class="vague" aria-hidden="true"></span><span class="vague" aria-hidden="true"></span>');
  }
  // Bulles qui remontent, dans la plongée et dans l'histoire
  function bulles(hote, n){
    if(!hote || reduit) return;
    var b = document.createElement('div'); b.className = 'apb-bulles'; b.setAttribute('aria-hidden', 'true');
    for(var k = 0; k < n; k++){
      var t = 4 + Math.random() * 14;
      b.insertAdjacentHTML('beforeend', '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;width:' + t.toFixed(0) + 'px;height:' + t.toFixed(0) + 'px;animation-duration:' + (9 + Math.random() * 10).toFixed(1) + 's;animation-delay:-' + (Math.random() * 18).toFixed(1) + 's"></i>');
    }
    hote.insertBefore(b, hote.firstChild);
  }
  bulles(plongee, mobile ? 10 : 18);
  bulles(document.querySelector('.ix-histoire'), mobile ? 8 : 16);
  // Ondes et gouttes au moment où le burger touche la sauce
  var ondes = document.createElement('div'); ondes.className = 'apb-ondes'; ondes.setAttribute('aria-hidden', 'true');
  ondes.innerHTML = '<i></i><i></i><i></i>' + new Array(8).join('<b></b>');
  scene.appendChild(ondes);
  // Appelé par la timeline de l'ouverture : t = instant du contact, plongee = début de la vague
  window.apbSauce = function(tl, t, debutPlongee, decalage){
    if(decalage) ondes.style.left = 'calc(50% + ' + decalage + 'vw)';
    var anneaux = ondes.querySelectorAll('i'), gouttes = ondes.querySelectorAll('b');
    [].forEach.call(anneaux, function(a, i){
      tl.set(a, {scale:0.15, opacity:0}, t + i * 0.22)
        .to(a, {keyframes:[{scale:0.7, opacity:0.9, duration:0.25, ease:'power2.out'}, {scale:1.5 + i * 0.35, opacity:0, duration:0.85, ease:'power1.out'}]}, t + i * 0.22);
    });
    [].forEach.call(gouttes, function(g, i){
      var ang = -Math.PI * (0.15 + 0.7 * i / (gouttes.length - 1)), dist = 70 + (i % 3) * 45;
      tl.set(g, {x:0, y:0, opacity:0, scale:0.6}, t + 0.05)
        .to(g, {keyframes:[
          {x:Math.cos(ang) * dist * 0.6, y:Math.sin(ang) * dist * 1.4, opacity:1, scale:1, duration:0.25, ease:'power2.out'},
          {x:Math.cos(ang) * dist, y:20, opacity:0, scale:0.7, duration:0.35, ease:'power2.in'}]}, t + 0.05);
    });
    tl.fromTo(plongee, {y:90, yPercent:102}, {y:0, yPercent:0, duration:1.4, ease:'power2.inOut'}, debutPlongee);
  };
})();
