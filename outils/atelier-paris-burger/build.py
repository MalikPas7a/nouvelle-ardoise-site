# Génère la maquette du site de la maison Atelier Paris Burger :
#   accueil (la maison) + une page par adresse, CSS et JS partagés.
# Sources : source-geneve.html (page Genève validée) et source-intro.html (prototype d'ouverture au scroll).
# Usage : python3 outils/atelier-paris-burger/build.py   (depuis la racine du dépôt)
import re, os, html

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', '..', 'public', 'demos', 'atelier-paris-burger')
src = open(os.path.join(ICI, 'source-geneve.html'), encoding='utf-8').read()
intro = open(os.path.join(ICI, 'source-intro.html'), encoding='utf-8').read()

def entre(texte, debut, fin):
    i = texte.index(debut); j = texte.index(fin, i)
    return texte[i:j + len(fin)]

def section(nom):
    return entre(src, '<section class="%s"' % nom, '</section>')

def ecrire(chemin, contenu):
    chemin = os.path.join(SORTIE, chemin)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    contenu = contenu.replace('<span class="lab">Contact</span>', '<span class="lab">Contact</span><a href="mailto:info@atelier-paris-burger.com">info@atelier-paris-burger.com</a>')
    open(chemin, 'w', encoding='utf-8').write(contenu)

# ---------- Pièces communes ----------
css = src[src.index('<style>') + 7:src.index('</style>')]
logo = re.search(r'<svg width="0" height="0" style="position:absolute" aria-hidden="true">.*?</svg>', src, re.S).group(0)
scripts = re.findall(r'<script>\n(.*?)</script>', src, re.S)
fiche = entre(src, '<!-- Fiche plat', '</aside>') + '\n' + re.search(r'<div class="panier".*?</div>', src).group(0)

# JS partagé : gardes pour que chaque page n'embarque que ce qu'elle contient
js = '\n'.join(scripts)
js = js.replace("  var menu = document.getElementById('menu'), ouvrir",
                "  var menu = document.getElementById('menu'), ouvrir")
js = js.replace("  document.querySelectorAll('.variante button').forEach(",
                "  if(document.getElementById('hero-titre')) document.querySelectorAll('.variante button').forEach(")
js = js.replace("    gsap.to('.ouverture .media', {", "    if(document.querySelector('.ouverture .media')) gsap.to('.ouverture .media', {")
js = js.replace("  var plats = Array.prototype.slice.call(document.querySelectorAll('.carte .plat'));",
                "  if(!document.getElementById('fiche')) return;\n  var maison = document.body.dataset.page === 'maison';\n  var plats = Array.prototype.slice.call(document.querySelectorAll('.carte .plat'));")
js = js.replace("  var OUVERTURE = new Date(", "  if(!document.getElementById('form-liste') && !document.querySelector('[data-jours]')) return;\n  var OUVERTURE = new Date(")
js = js.replace("  document.getElementById('agenda').href", "  if(document.getElementById('agenda')) document.getElementById('agenda').href")
js = js.replace("  var form = document.getElementById('form-liste');\n", "  var form = document.getElementById('form-liste');\n  if(!form) return;\n")
# Sur l'accueil, pas de prix ni de panier : la commande se fait dans une adresse
js = js.replace("    $('fiche-prix').textContent = chf(p.prix) + ' · exemple';",
                "    $('fiche-prix').textContent = maison ? 'Prix selon l\\'adresse' : chf(p.prix) + ' · exemple';")
js = js.replace("    q = 1; total();\n  }", "    q = 1; if(!maison) total();\n  }")
js = js.replace("  $('ajouter').addEventListener('click', function(){",
                "  if(maison){ $('ajouter').innerHTML = 'Commander dans une adresse'; }\n  $('ajouter').addEventListener('click', function(){\n    if(maison){ fermer(); location.hash = '#adresses'; return; }")
js = js.replace("textContent.replace(/[^\\d.]/g,'')", "textContent.replace(',', '.').replace(/[^\\d.]/g,'')")
js = js.replace("  function chf(n){ return n.toFixed(2).replace('.00','.–') + ' CHF'; }",
                "  var EUR = document.body.dataset.devise === '€';\n  function chf(n){ return EUR ? n.toFixed(2).replace('.', ',') + ' €' : n.toFixed(2).replace('.00','.–') + ' CHF'; }")
assert 'var EUR' in js and "replace(',', '.')" in js
assert js.count('if(!document.getElementById') >= 2
# Audit 24.10 : interface plus vive
for avant, apres in [("duration:0.8, ease:'power3.out'", "duration:0.6, ease:'power3.out'"),
                     ("inHero ? 0.55 : 0", "inHero ? 0.3 : 0"),
                     ("duration:1.1, ease:'expo.out', scrollTrigger:{trigger:el, start:'top 90%'", "duration:0.8, ease:'expo.out', scrollTrigger:{trigger:el, start:'top 92%'"),
                     ("duration:0.9, ease:'power3.out', stagger:0.045", "duration:0.7, ease:'power3.out', stagger:0.035")]:
    assert avant in js, avant
    js = js.replace(avant, apres)
ICI = os.path.dirname(os.path.abspath(__file__))
immersif_js = open(os.path.join(ICI, 'immersif.js'), encoding='utf-8').read()
immersif_css = open(os.path.join(ICI, 'immersif.css'), encoding='utf-8').read()
ecrire('assets/apb.js', '// Atelier Paris Burger · scripts partagés (maquette Nouvelle Ardoise)\n' + js + immersif_js)

# Intro au scroll : classes préfixées « ix- » pour ne pas croiser celles du site
icss = intro[intro.index('<style>') + 7:intro.index('</style>')]
icss = icss[icss.index('/* Scène épinglée */'):]
ihtml = entre(intro, '<section class="scene"', '</section>')
ihist = entre(intro, '<section class="histoire"', '</section>')
ijs = entre(intro, "  var calques = gsap.utils.toArray('.calque');", "  window.addEventListener('resize'")[:-len("  window.addEventListener('resize'")]
CLASSES = ['scene', 'titre', 'indice', 'burger', 'calque', 'coupe', 'bassin', 'plongee', 'dedans', 'legende', 'mot', 'histoire', 'chap', 'txt', 'an', 'fin', 'statique']
def prefixe(t, dans_css):
    for c in CLASSES:
        t = re.sub(r'\.%s(?![\w-])' % c, '.ix-' + c, t)
        if not dans_css:
            t = re.sub(r'(class="(?:[^"]*\s)?)%s(?=[\s"])' % c, r'\1ix-' + c, t)
    return t
icss = prefixe(icss, True)
ihtml = prefixe(ihtml, False); ihist = prefixe(ihist, False); ijs = prefixe(ijs, True)
icss = icss.replace('.ix-scene{position:relative;height:100vh;height:100svh;', '.ix-scene{position:relative;height:100vh;height:100svh;color:var(--creme);')
icss = icss.replace('.ix-chap .ph{', '.ix-chap .ix-ph{').replace('.ix-chap .ph b{', '.ix-chap .ix-ph b{')
ihist = ihist.replace('class="ph"', 'class="ix-ph"')

css_maison = r'''
/* ---------- Accueil de la maison ---------- */
:root{--sauce:#D7AA4E;--sauce-2:#B9822F;--sauce-3:#EBCB80}
.ix-scene .lab{font:500 12px/1.4 var(--f-mono);letter-spacing:.14em;text-transform:uppercase}
''' + icss + r'''
.ix-chap .ix-ph{margin-top:28px;aspect-ratio:3/2;border:1px solid rgba(74,16,25,.45);position:relative;display:flex;align-items:flex-end;padding:16px;font:500 10px/1.5 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:#5A2A12}
.ix-chap .ix-ph b{color:var(--bordeaux);font-weight:500;display:block}
.statique .ix-scene{height:auto;min-height:100svh;padding:120px 0}
.statique .ix-burger,.statique .ix-bassin,.statique .ix-plongee,.statique .ix-coupe,.statique .ix-indice,.statique .ix-mot,.statique .ix-dedans{display:none}
.carte-maison .plat .prix{display:none}
.carte-maison .plat{grid-template-columns:1fr}
/* Nos adresses */
.adresses{background:var(--papier);padding-block:var(--s16);border-top:1px solid var(--filet)}
.adresses .entete{display:flex;justify-content:space-between;align-items:end;gap:var(--s4);flex-wrap:wrap;margin-bottom:var(--s6)}
.adresses .entete .lab{color:var(--bordeaux);display:block;margin-bottom:var(--s2)}
.adresses h2{font-size:var(--t-xl)}
.adresses .liste-a{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s3)}
.adresse{display:grid;gap:14px;text-decoration:none;color:var(--encre)}
.adresse .ph{aspect-ratio:4/5}
.adresse .statut{font:500 10px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;padding:6px 8px;justify-self:start;border:1px solid var(--bordeaux);color:var(--bordeaux)}
.adresse .statut.ouvert{background:var(--bordeaux);color:var(--creme)}
.adresse .statut.bientot{border-style:dashed}
.adresse h3{font-size:30px}
.adresse h3 small{display:block;font:500 11px/1.4 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--gris);margin-top:6px}
.adresse .aller{font:500 11px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--bordeaux)}
.adresse:hover h3{color:var(--bordeaux)}
.adresse:focus-visible{outline:2px solid var(--bordeaux);outline-offset:6px}
@media (max-width:1100px){.adresses .liste-a{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:520px){.adresses .liste-a{grid-template-columns:1fr}.adresse .ph{aspect-ratio:3/2}}
/* Page en préparation (Madrid, Ibiza) */
.prepa{background:var(--papier);padding-block:var(--s12)}
.prepa .boite{border:1px dashed var(--bordeaux);padding:var(--s4);display:grid;gap:var(--s2);max-width:760px}
.prepa .boite .lab{color:var(--bordeaux)}
.prepa ul{margin:0;padding-left:18px;color:var(--gris)}
/* Fil d'Ariane des pages adresse */
.fil{font:500 11px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:#C9AE97;margin-bottom:var(--s3)}
.fil a{color:var(--or);text-decoration:none}
.fil a:hover{text-decoration:underline}
'''
ecrire('assets/apb.css', '/* Atelier Paris Burger · styles partagés (maquette Nouvelle Ardoise) */\n' + css + css_maison + immersif_css)

# ---------- Adresses ----------
def maps(a):
    return 'Atelier+Paris+Burger+' + a['adresse'].replace('<br>', ' ').replace(' ', '+')

ADRESSES = [
    {'slug': 'geneve-eaux-vives', 'ville': 'Genève', 'quartier': 'Eaux-Vives', 'pays': 'CH', 'devise': 'CHF', 'etat': 'ouverture',
     'statut': 'Ouverture novembre 2026', 'sous': "Quai Gustave-Ador 24, face au Jet d'eau", 'adresse': 'Quai Gustave-Ador 24<br>1207 Genève', 'photo': "Façade, lac et Jet d'eau"},
    {'slug': 'geneve-versoix', 'ville': 'Genève', 'quartier': 'Versoix', 'pays': 'CH', 'devise': 'CHF', 'etat': 'ouvert',
     'statut': '[Statut à confirmer]', 'sous': 'Quai de Versoix 1, au bord du lac', 'adresse': 'Quai de Versoix 1<br>1290 Versoix', 'photo': 'Façade de Versoix'},
    {'slug': 'madrid', 'ville': 'Madrid', 'quartier': '[Quartier]', 'pays': 'ES', 'devise': '€', 'etat': 'prepa',
     'statut': 'Ouvert', 'sous': '[Adresse à compléter]', 'photo': 'Façade de Madrid'},
    {'slug': 'ibiza', 'ville': 'Ibiza', 'quartier': '[Quartier]', 'pays': 'ES', 'devise': '€', 'etat': 'prepa',
     'statut': 'Ouvert', 'sous': '[Adresse à compléter]', 'photo': "Façade d'Ibiza"},
]

def nom_complet(a):
    return a['ville'] + ' · ' + a['quartier'] if a['ville'] == 'Genève' else a['ville']

def tete(titre, description, prefixe_assets, extra_css=''):
    return '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>%s</title>
<meta name="description" content="%s">
<meta name="theme-color" content="#4A1019">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Manrope:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="%sassets/apb.css">%s
</head>
''' % (html.escape(titre), html.escape(description), prefixe_assets, extra_css)

def retirer_bloc(src, debut):
    i = src.index(debut); j = i; prof = 0
    while True:
        o = src.find('<div', j); f = src.find('</div>', j)
        if o != -1 and o < f: prof += 1; j = o + 4
        else:
            prof -= 1; j = f + 6
            if prof == 0: break
    return src[:i] + src[j:].lstrip(' ').lstrip('\n')

def nom_court(a):
    return a['ville'] if a['ville'] != 'Genève' else 'Genève ' + a['quartier']

def entete(racine, liens, cta, cta_href, actuelle=None):
    def lien_adr(a, ind):
        cur = ' aria-current="page"' if a['slug'] == actuelle else ''
        return '%s<a href="%s%s/"%s><span>%s</span><small>%s</small></a>' % (ind, racine, a['slug'], cur, nom_court(a), html.escape(a['statut']))
    adr = '\n'.join(lien_adr(a, '          ') for a in ADRESSES)
    adrm = '\n'.join(lien_adr(a, '      ') for a in ADRESSES)
    nav = '\n'.join('      <a href="%s">%s</a>' % l for l in liens) + '''
      <div class="nav-adr">
        <button type="button" id="adr-bouton" aria-expanded="false" aria-controls="adr-menu">Nos adresses</button>
        <div class="adr-menu" id="adr-menu" hidden>
          <a class="adr-maison" href="%s"><span>La maison</span><small>Accueil de la marque</small></a>
%s
        </div>
      </div>''' % (racine, adr)
    navm = '\n'.join('    <a href="%s">%s</a>' % l for l in liens) + '''
    <div class="menu-adr"><span class="lab">Nos adresses</span>
%s
    </div>''' % adrm
    return '''<a class="skip" href="#contenu">Aller au contenu</a>

<header class="top" id="top">
  <div class="wrap">
    <a class="marque" href="%s" aria-label="Atelier Paris Burger, la maison"><svg aria-hidden="true"><use href="#apb-logo"/></svg><span>Atelier Paris Burger</span></a>
    <nav class="nav" aria-label="Navigation principale">
%s
    </nav>
    <div class="langues" aria-label="Langue"><a href="#" aria-current="true">FR</a><span aria-hidden="true">·</span><a href="#">EN</a><span aria-hidden="true">·</span><a href="#">ES</a></div>
    <div class="actions sur-sombre">
      <a class="btn btn-plein" href="%s">%s</a>
    </div>
    <button class="burger-nav" id="ouvrir" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
</header>

<div class="menu-mobile" id="menu" data-lenis-prevent hidden>
  <button class="ferme" id="fermer">Fermer</button>
  <nav aria-label="Navigation mobile">
%s
  </nav>
  <div class="langues"><a href="#" aria-current="true">FR</a><span>·</span><a href="#">EN</a><span>·</span><a href="#">ES</a></div>
  <div class="actions sur-sombre">
    <a class="btn btn-plein" href="%s">%s</a>
  </div>
</div>
''' % (racine, nav, cta_href, cta, navm, cta_href, cta)

def carte_adresses(racine, actuelle=None):
    cartes = []
    for a in ADRESSES:
        if a['slug'] == actuelle: continue
        cls = 'ouvert' if a['statut'] == 'Ouvert' else ('bientot' if a['etat'] == 'ouverture' else '')
        cartes.append('''      <a class="adresse" href="%s%s/" data-reveal>
        <div class="ph" data-clip><figcaption><b>Photo · %s</b>4:5</figcaption></div>
        <span class="statut %s">%s</span>
        <h3>%s<small>%s</small></h3>
        <span class="aller">Voir l'adresse →</span>
      </a>''' % (racine, a['slug'], a['photo'], cls, a['statut'], a['ville'] if a['ville'] != 'Genève' else 'Genève ' + a['quartier'], a['sous']))
    titre = 'Nos <em>adresses</em>.' if not actuelle else 'Les autres <em>adresses</em>.'
    return '''  <section class="adresses" id="adresses">
    <div class="wrap">
      <div class="entete"><div><span class="lab" data-reveal>Une maison, plusieurs villes</span><h2 data-split>%s</h2></div></div>
      <div class="liste-a">
%s
      </div>
    </div>
  </section>
''' % (titre, '\n'.join(cartes))

def pied(racine, a=None):
    adr = ''.join('<a href="%s%s/">%s</a>' % (racine, x['slug'], nom_complet(x)) for x in ADRESSES)
    if a:
        col1 = '<div class="col"><span class="lab">%s</span><p>%s</p><a href="#atelier">Plan d\'accès</a></div>' % (html.escape(nom_complet(a)), a.get('adresse', '[Adresse à compléter]<br>' + a['ville']))
        col2 = '<div class="col"><span class="lab">Horaires</span><p>[Lun – Jeu 11h30 – 22h]<br>[Ven – Dim 11h30 – 23h]</p></div>'
    else:
        col1 = '<div class="col"><span class="lab">Nos adresses</span>%s</div>' % adr
        col2 = '<div class="col"><span class="lab">La maison</span><a href="#histoire">L\'histoire</a><a href="#carte">La carte</a></div>'
    return '''<footer class="pied">
  <div class="wrap grid">
    <div class="logo"><svg aria-hidden="true"><use href="#apb-logo"/></svg><p>Atelier Paris Burger</p></div>
    %s
    %s
    <div class="col"><span class="lab">Contact</span><a href="tel:+41000000000">[+41 00 000 00 00]</a><a href="#">[Instagram]</a></div>
    <div class="col"><span class="lab">Langue</span><p>Français · English · Español</p></div>
    <div class="bas"><span>© 2026 Atelier Paris Burger</span><span>Mentions légales · Confidentialité</span><span>Maquette Nouvelle Ardoise · photos à venir</span></div>
  </div>
</footer>
''' % (col1, col2)

def scripts_fin(racine):
    return '''<script src="/demos/vendor/gsap.min.js"></script>
<script src="/demos/vendor/ScrollTrigger.min.js"></script>
<script src="/demos/vendor/lenis.min.js"></script>
<script src="%sassets/apb.js"></script>
''' % racine

def carte_devise(sec, devise):
    if devise == '€':
        sec = re.sub(r'\[(\d+)\.–\]', lambda m: '[%d,50 €]' % max(1, int(m.group(1)) - 6), sec)
        sec = sec.replace('Noms et prix d\'exemple', 'Noms et prix d\'exemple en euros')
    return sec

# Sections reprises de la page Genève
s_carte = section('carte'); s_atelier = section('atelier'); s_appli = section('appli')
s_liste = section('liste'); s_insta = section('insta'); s_geste = section('geste')
s_ouverture = section('ouverture')

def page_adresse(a):
    r = '../'
    titre = 'Atelier Paris Burger · ' + nom_complet(a)
    lieu = nom_complet(a)
    liens = [(r, 'La maison'), ('#carte', 'La carte'), ('#atelier', "L'adresse")]
    if a['etat'] == 'ouverture':
        cta, href = "Liste d'ouverture", '#liste'
    else:
        cta, href = 'Commander', '#appli'
    o = s_ouverture
    o = o.replace('<h1 data-split>La sauce <em>Café de Paris</em>, enfin à Genève.</h1>',
                  '<p class="fil"><a href="%s">La maison</a> · %s</p>\n      <h1 data-split>%s</h1>' % (r, lieu,
                  "L'atelier face au <em>Jet d'eau</em>." if a['slug'] == 'geneve-eaux-vives' else
                  ('Versoix, <em>au bord du lac</em>.' if a['slug'] == 'geneve-versoix' else '%s, <em>la maison</em>.' % a['ville'])))
    if a['etat'] == 'ouverture':
        o = o.replace("Ouverture le [date à confirmer] · Face au Jet d'eau", "Ouverture le [date à confirmer] · Eaux-Vives, face au Jet d'eau")
        o = o.replace("<p data-reveal>Burger, baguette et sauce Café de Paris. Genève, face au Jet d'eau.</p>",
                      "<p data-reveal>Burger, baguette et la sauce de la maison. Aux Eaux-Vives, face au Jet d'eau.</p>")
    else:
        o = o.replace('<span class="lab"><span class="j-moins" data-jours>J-21</span> · Ouverture le [date à confirmer] · Face au Jet d\'eau</span>',
                      '<span class="lab">%s · %s</span>' % (a['statut'], a['sous']))
        o = o.replace("<p data-reveal>Burger, baguette et sauce Café de Paris. Genève, face au Jet d'eau.</p>",
                      '<p data-reveal>Burger, baguette et la sauce de la maison. %s.</p>' % lieu)
        o = o.replace('<a class="btn btn-plein" href="#liste">Rejoindre la liste d\'ouverture</a>', '<a class="btn btn-plein" href="#appli">Commander</a>')
    corps = [o]
    if a['etat'] == 'prepa':
        corps.append('''  <section class="prepa" id="atelier">
    <div class="wrap">
      <div class="boite" data-reveal>
        <span class="lab">Page en préparation · second temps</span>
        <h2 style="font-size:var(--t-xl)">%s est déjà ouvert.</h2>
        <p>Cette page reprendra le modèle de Genève : adresse, horaires, plan, la carte en euros, la commande et la réservation. À réunir :</p>
        <ul><li>adresse, horaires et téléphone</li><li>la carte et les prix locaux</li><li>les liens de commande et de réservation déjà utilisés sur place</li><li>3 à 6 photos du lieu et le compte Instagram local</li></ul>
      </div>
    </div>
  </section>
''' % a['ville'])
        corps.append(carte_devise(s_carte, '€'))
    else:
        corps.append(carte_devise(s_carte, a['devise']))
        if a['etat'] == 'ouverture':
            corps.append(s_liste)
        at = s_atelier
        if a['slug'] == 'geneve-versoix':
            at = at.replace("L'atelier, au bord du <em>lac</em>.", 'Versoix, au bord du <em>lac</em>.').replace("Genève · face au Jet d'eau", 'Genève · Versoix')
            at = at.replace("Photo 6 · Façade, lac et Jet d'eau", 'Photo 6 · Façade et terrasse de Versoix').replace('Jet+d%27eau+Gen%C3%A8ve', 'Versoix')
        else:
            at = at.replace("Genève · face au Jet d'eau", "Genève · Eaux-Vives, face au Jet d'eau")
        at = at.replace('[Adresse à compléter]<br>Genève', a['adresse']).replace('Jet+d%27eau+Gen%C3%A8ve', maps(a)).replace('q=Versoix"', 'q=' + maps(a) + '"')
        corps.append(at)
        ap = s_appli
        if a['etat'] == 'ouvert':
            ap = ap.replace("L'application · dès l'ouverture", "L'application")
            ap = re.sub(r'<div class="cent".*?</div>\n      </div>\n', '', ap, flags=re.S) if False else ap
            ap = ap.replace('Inscrivez-vous sur la liste d\'ouverture, présentez votre ticket QR au comptoir. QR code d\'exemple.',
                            'Inscrivez-vous dans l\'application, présentez votre ticket QR au comptoir. QR code d\'exemple.').replace('href="#liste">Je m\'inscris', 'href="#">Je m\'inscris')
        if a['etat'] == 'ouverture':
            ap = retirer_bloc(ap, '<div class="cent"')
        corps.append(ap)
    corps.append(carte_adresses(r, a['slug']))
    corps.append(s_insta)
    page = tete(titre, 'Atelier Paris Burger, %s. Burger, baguette et la sauce de la maison.' % lieu, r) + \
        '<body data-page="adresse" data-devise="%s">\n' % ('€' if a['devise'] == '€' or a['etat'] == 'prepa' else 'CHF') + logo + '\n' + entete(r, liens, cta, href, a['slug']) + '\n<main id="contenu">\n' + '\n\n'.join(corps) + '\n</main>\n\n' + \
        pied(r, a) + '\n' + fiche + '\n' + scripts_fin(r) + '</body>\n</html>\n'
    page = page.replace('Café de Paris</span>', 'Café de Paris</span>')  # pastilles inchangées
    ecrire(a['slug'] + '/index.html', page)

for a in ADRESSES:
    page_adresse(a)

# ---------- Accueil de la maison ----------
smash = '''
  // 0. Smasher : la boule de viande arrive seule, puis s'écrase sur la plaque
  var steak = document.querySelector('.c-steak');
'''
ijs2 = ijs.replace("  var tl = gsap.timeline(", smash + "  var tl = gsap.timeline(")
# Le timeline d'origine commence par le titre ; on insère le smash avant l'arrivée des autres ingrédients
ijs2 = ijs2.replace("  // 2. Les ingrédients arrivent, éclatés\n    .to(calques, {opacity:1, duration:0.5, stagger:{each:0.12, from:'end'}}, 0.4)",
    "  // 1 bis. Smasher\n    .fromTo(steak, {opacity:0, scaleX:0.42, scaleY:2.1, y:final[4] - 40}, {opacity:1, duration:0.4}, 0.3)\n"
    "    .to('#mot0', {opacity:1, duration:0.3}, 0.4)\n"
    "    .to(steak, {scaleX:1.12, scaleY:0.82, duration:0.35, ease:'power4.in'}, 0.8)\n"
    "    .to(steak, {scaleX:1, scaleY:1, duration:0.25}, 1.15)\n"
    "    .to('#mot0', {opacity:0, duration:0.3}, 1.3)\n"
    "  // 2. Les autres ingrédients arrivent, éclatés\n"
    "    .to(calques.filter(function(c){ return c !== steak; }), {opacity:1, duration:0.5, stagger:{each:0.12, from:'end'}}, 1.4)")
ijs2 = re.sub(r"\.to\('#mot1', \{opacity:1, duration:0\.3\}, 0\.6\)", ".to('#mot1', {opacity:1, duration:0.3}, 1.5)", ijs2)
# décaler le reste de la séquence d'une seconde
def decale(m):
    v = float(m.group(2))
    return m.group(1) + ('%g' % (v + 1.0 if v >= 1.4 else v)) + ')'
partie = ijs2[ijs2.index('  // 3. Ils s'):]
partie = re.sub(r"(\}, )(\d+(?:\.\d+)?)\)", decale, partie)
ijs2 = ijs2[:ijs2.index('  // 3. Ils s')] + partie
ijs2 = ijs2.replace("gsap.from(el, {y:60, opacity:0, duration:1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 82%', once:true}});",
                    "gsap.fromTo(el, {y:40, opacity:0}, {y:0, opacity:1, duration:0.7, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 85%', once:true}});")
ijs2 = ijs2.replace("end:'+=600%'", "end:'+=700%'").replace(",\n    onUpdate:function(s){ gsap.set('#progres', {scaleX:s.progress}); }", "")
assert '#mot0' in ijs2 and "end:'+=700%'" in ijs2

def barre_villes():
    return '<nav class="ix-villes" aria-label="Choisir une adresse">' + ''.join('<a href="%s/"><span>%s</span><small>%s</small></a>' % (a['slug'], nom_court(a), html.escape(a['statut'])) for a in ADRESSES) + '</nav>'

ihtml2 = ihtml.replace('<div class="ix-mot" id="mot1">Assembler.</div>', '<div class="ix-mot" id="mot0">Smasher.</div>\n    <div class="ix-mot" id="mot1">Assembler.</div>')
ihtml2 = ihtml2.replace('<h1>Une maison.<br>Une <em>sauce</em>.</h1><p>Genève, face au Jet d\'eau · novembre 2026</p>',
                        '<h1>Une maison.<br>Une <em>sauce</em>.</h1><p>Paris · Madrid · Ibiza · Genève</p>' + barre_villes())
ihtml2 = ihtml2.replace('<b>Prototype de mouvement.</b> Les cadres dorés seront les vraies photos détourées de chaque ingrédient, prises au shooting.',
                        '<b>Prototype de mouvement.</b> Les cadres dorés seront la séquence filmée : smash, assemblage, coupe, trempage.')
assert 'mot0' in ihtml2
ihist2 = ihist.replace('<section class="ix-histoire" aria-label="L\'histoire de la sauce">', '<section class="ix-histoire" id="histoire" aria-label="L\'histoire de la sauce">')
ihist2 = ihist2.replace('<span class="lab">Chapitre 3 · Genève</span><h3>Premier atelier, au bord du lac.</h3><p>Face au Jet d\'eau. Puis Madrid, Barcelone, Ibiza.</p><div class="ix-ph"><span><b>Photo 6 · Façade et Jet d\'eau</b>Heure dorée · 3:2</span></div>',
                        '<span class="lab">Chapitre 3 · Aujourd\'hui</span><h3>Madrid, Ibiza, et maintenant Genève.</h3><p>Une maison qui voyage sans changer sa recette. Deux adresses à Genève : les Eaux-Vives et Versoix.</p><div class="ix-ph"><span><b>Photo · Les adresses</b>Montage de façades, même cadrage · 3:2</span></div>')
ihist2 = ihist2.replace('>2026<', '>Genève<')
assert 'Chapitre 3 · Aujourd' in ihist2
# Histoire reprise du site actuel du client (atelier-paris-burger.com/fr/accueil, lu le 24.10), resserrée
def chapitre(an, lab, titre, texte, photo, cadre):
    return ('    <div class="ix-chap"><div class="ix-an" data-r>%s</div><div class="ix-txt" data-r><span class="lab">%s</span>'
            '<h3>%s</h3><p>%s</p><div class="ix-ph"><span><b>%s</b>%s</span></div></div></div>\n') % (an, lab, titre, texte, photo, cadre)
CHAPITRES = (
    '    <div class="ix-entete" data-r><span class="lab">L\'histoire</span><h2>Une maison née d\'une histoire construite dans le temps.</h2></div>\n' +
    chapitre('Paris', 'Chapitre 1 · Fin des années 1970',
             'Une sauce naît à Paris.',
             'Au cœur de la maison, notre sauce Café de Paris, travaillée à Paris dès la fin des années 1970 et le début des années 1980.',
             'Photo archive ou reconstitution', 'Cuisine parisienne · 3:2') +
    chapitre('40 ans', 'Chapitre 2 · Transmise',
             'Transmise, affinée, perfectionnée.',
             'Plus de quarante ans de savoir-faire, servie pendant des décennies dans des restaurants parisiens emblématiques. Elle est aujourd\'hui notre signature.',
             'Photo · La sauce', 'Très gros plan, cuillère, texture · 3:2') +
    chapitre('Atelier', 'Chapitre 3 · Le geste',
             'Faire évoluer l\'héritage, pas le copier.',
             'Le burger premium et la baguette portent un savoir-faire précis, exigeant et constant. Fidèle à l\'esprit d\'origine, avec sa propre identité.',
             'Photo · Burger et baguette', 'Côte à côte, même lumière · 3:2') +
    chapitre('Europe', 'Chapitre 4 · Aujourd\'hui',
             'De Genève à l\'Europe.',
             'Un restaurant phare à Genève, l\'Espagne pour première étape avec Madrid, Barcelone et Ibiza, et des cuisines dédiées à la livraison à travers l\'Europe.',
             'Photo · Les adresses', 'Montage de façades, même cadrage · 3:2'))
debut = ihist2.index('    <div class="ix-chap">'); fin = ihist2.index('  </section>', debut)
ihist2 = ihist2[:debut] + CHAPITRES + ihist2[fin:]

js_maison = '''<script>
// Ouverture au scroll : smasher, assembler, couper, tremper, plonger dans la sauce
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce || !window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add('statique'); return; }
  gsap.registerPlugin(ScrollTrigger);
''' + ijs2 + '''  window.addEventListener('resize', function(){ final = empile(); ScrollTrigger.refresh(); });
})();
</script>
'''
carte_m = s_carte.replace('<section class="carte" id="carte">', '<section class="carte carte-maison" id="carte">')
carte_m = carte_m.replace("Noms et prix d'exemple, à remplacer par la carte définitive. Les signatures sont servies avec la sauce Café de Paris.",
                          "La carte signature, la même dans toutes nos adresses. Prix et disponibilités selon l'adresse. Touchez un plat pour le voir en 3D.")
accueil = tete('Atelier Paris Burger · La maison', 'Une maison, une sauce. Burger, baguette et la sauce de la maison, à Madrid, Ibiza et Genève.', '') + \
    '<body data-page="maison">\n' + logo + '\n' + \
    entete('./', [('#histoire', "L'histoire"), ('#carte', 'La carte')], 'Nos adresses', '#adresses') + \
    '\n<main id="contenu">\n' + ihtml2 + '\n\n' + ihist2 + '\n\n' + s_geste + '\n\n' + carte_m + '\n\n' + carte_adresses('') + '\n' + s_insta + '\n</main>\n\n' + \
    pied('') + '\n' + fiche + '\n' + scripts_fin('') + js_maison + '</body>\n</html>\n'
ecrire('index.html', accueil)
print('ok')
