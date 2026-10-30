# Construit src/data/carte-romande.json : six cantons romands (swisstopo, LV95), lacs (OpenStreetMap via Nominatim, WGS84),
# villes (WGS84). Tout est projeté en LV95 puis dans une viewBox de 1000 unités de large. Les frontières communes
# sont simplifiées une seule fois (arcs partagés) pour ne laisser ni fente ni double trait entre deux cantons.
import json, math, os, sys

GEO = sys.argv[1]            # dossier des téléchargements (dl-api, dl-osm)
SORTIE = sys.argv[2]         # fichier JSON de sortie
TOL = float(sys.argv[3]) if len(sys.argv) > 3 else 300.0   # tolérance de simplification, en mètres
LARGEUR = 1000.0
MARGE = 28.0

def lv95(lon, lat):
    # Formules approchées de swisstopo (précision ~1 m), WGS84 -> LV95
    phi = (lat * 3600 - 169028.66) / 10000
    lam = (lon * 3600 - 26782.5) / 10000
    e = 2600072.37 + 211455.93 * lam - 10938.51 * lam * phi - 0.36 * lam * phi ** 2 - 44.54 * lam ** 3
    n = 1200147.07 + 308807.95 * phi + 3745.25 * lam ** 2 + 76.63 * phi ** 2 - 194.56 * lam ** 2 * phi + 119.79 * phi ** 3
    return e, n

def rings_of(geom, conv=None):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    out = []
    for poly in polys:
        rs = []
        for ring in poly:
            pts = [(conv(p[0], p[1]) if conv else (p[0], p[1])) for p in ring]
            if pts and pts[0] != pts[-1]: pts.append(pts[0])
            rs.append(pts)
        out.append(rs)
    return out

def aire(ring):
    s = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]): s += x1 * y2 - x2 * y1
    return abs(s) / 2

def dp(pts, tol):
    # Douglas-Peucker itératif
    if len(pts) <= 2: return pts
    garder = [False] * len(pts); garder[0] = garder[-1] = True
    pile = [(0, len(pts) - 1)]
    while pile:
        a, b = pile.pop()
        if b <= a + 1: continue
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L2 = dx * dx + dy * dy
        dmax, imax = -1.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            if L2 == 0: d = math.hypot(px - ax, py - ay)
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / L2))
                d = math.hypot(px - (ax + t * dx), py - (ay + t * dy))
            if d > dmax: dmax, imax = d, i
        if dmax > tol:
            garder[imax] = True
            pile.append((a, imax)); pile.append((imax, b))
    return [p for p, g in zip(pts, garder) if g]

# --- cantons ---
CANTONS = [('ge', 'Genève'), ('vd', 'Vaud'), ('vs', 'Valais'), ('fr', 'Fribourg'), ('ne', 'Neuchâtel'), ('ju', 'Jura')]
polys = {}
for cid, _ in CANTONS:
    j = json.load(open(os.path.join(GEO, 'dl-api', cid + '.json'), encoding='utf-8'))
    ft = j.get('feature', j)
    polys[cid] = rings_of(ft['geometry'])

def cle(p): return (round(p[0], 1), round(p[1], 1))
proprietaires = {}
for cid, pl in polys.items():
    for rs in pl:
        for ring in rs:
            for p in ring: proprietaires.setdefault(cle(p), set()).add(cid)

cache = {}
def simplifier_arc(arc):
    k1 = tuple(cle(p) for p in arc); k2 = k1[::-1]
    if k1 in cache: return cache[k1]
    if k2 in cache: return cache[k2][::-1]
    s = dp(arc, TOL); cache[k1] = s
    return s

def simplifier_ring(ring):
    pts = ring[:-1]  # anneau ouvert
    n = len(pts)
    owners_edge = [proprietaires[cle(pts[i])] & proprietaires[cle(pts[(i + 1) % n])] for i in range(n)]
    noeuds = [i for i in range(n) if owners_edge[i - 1] != owners_edge[i]]
    if len(noeuds) < 2:
        # aucune frontière partagée (ou une seule) : simplifier l'anneau entier en le coupant au point le plus loin
        depart = 0
        arcs = [pts + [pts[0]]]
        if noeuds: depart = noeuds[0]; arcs = [pts[depart:] + pts[:depart] + [pts[depart]]]
        res = []
        for a in arcs:
            # couper en deux pour que DP ait des extrémités distinctes
            m = len(a) // 2
            res += simplifier_arc(a[:m + 1])[:-1] + simplifier_arc(a[m:])[:-1]
        return res + [res[0]]
    res = []
    for j, i in enumerate(noeuds):
        k = noeuds[(j + 1) % len(noeuds)]
        arc = pts[i:k + 1] if k > i else pts[i:] + pts[:k + 1]
        res += simplifier_arc(arc)[:-1]
    return res + [res[0]]

def fmt(v): return ('%.1f' % v).rstrip('0').rstrip('.')

# --- lacs ---
LACS = [('Léman', 'leman.json'), ('Lac de Neuchâtel', 'lacs/Lac_de_Neuchatel.json'), ('Lac de Morat', 'lacs/Lac_de_Morat.json'),
        ('Lac de Bienne', 'lacs/Lac_de_Bienne.json'), ('Lac de Joux', 'lacs/Lac_de_Joux.json'), ('Lac de la Gruyère', 'lacs/Lac_de_la_Gruyère.json')]
lacs = []
for nom, f in LACS:
    p = os.path.join(GEO, 'dl-osm', f)
    if not os.path.exists(p): print('lac absent :', nom); continue
    j = json.load(open(p, encoding='utf-8'))
    if isinstance(j, list): j = j[0]
    g = j['geojson']
    rs = rings_of(g, lv95)
    lacs.append((nom, rs))

# --- villes ---
villes_wgs = json.load(open(os.path.join(GEO, 'dl-osm', 'villes', 'villes.json'), encoding='utf-8')) if os.path.exists(os.path.join(GEO, 'dl-osm', 'villes', 'villes.json')) else {}
SECOURS = {'Genève': (46.2044, 6.1432), 'Carouge': (46.1810, 6.1393), 'Onex': (46.1840, 6.1000), 'Meyrin': (46.2284, 6.0770), 'Lancy': (46.1896, 6.1143),
  'Versoix': (46.2833, 6.1622), 'Nyon': (46.3832, 6.2396), 'Gland': (46.4210, 6.2700), 'Rolle': (46.4582, 6.3375), 'Morges': (46.5112, 6.4985),
  'Lausanne': (46.5197, 6.6323), 'Vevey': (46.4628, 6.8430), 'Montreux': (46.4312, 6.9107), 'Yverdon-les-Bains': (46.7785, 6.6410), 'Payerne': (46.8220, 6.9380),
  'Fribourg': (46.8065, 7.1620), 'Bulle': (46.6195, 7.0569), 'Neuchâtel': (46.9900, 6.9293), 'La Chaux-de-Fonds': (47.0996, 6.8259), 'Delémont': (47.3647, 7.3445),
  'Porrentruy': (47.4156, 7.0753), 'Saignelégier': (47.2558, 6.9950), 'Moutier': (47.2783, 7.3703), 'Sion': (46.2331, 7.3606), 'Sierre': (46.2919, 7.5355),
  'Martigny': (46.1027, 7.0725), 'Monthey': (46.2545, 6.9540), 'Aigle': (46.3180, 6.9700), 'Brig-Glis': (46.3167, 7.9881)}
# nom affiché, petit ?, côté de l'étiquette (d = droite, g = gauche), décalage vertical de l'étiquette
VILLES = [
  ('Genève', False, 'd', 36, 'Genève'), ('Carouge', True, 'd', 8, None), ('Onex', True, 'd', 8, None), ('Meyrin', True, 'd', 8, None), ('Lancy', True, 'd', 8, None),
  ('Versoix', True, 'd', 8, None), ('Nyon', False, 'g', 8, 'Nyon'), ('Gland', True, 'd', 8, None), ('Rolle', True, 'd', 8, None), ('Morges', False, 'g', -8, 'Morges'),
  ('Lausanne', False, 'd', -6, 'Lausanne'), ('Vevey', False, 'g', 28, 'Vevey'), ('Montreux', False, 'd', 14, 'Montreux'), ('Yverdon-les-Bains', False, 'g', 8, 'Yverdon'),
  ('Payerne', True, 'd', 8, None), ('Fribourg', False, 'd', 8, 'Fribourg'), ('Bulle', False, 'd', 8, 'Bulle'), ('Neuchâtel', False, 'd', -4, 'Neuchâtel'),
  ('La Chaux-de-Fonds', False, 'd', 8, 'La Chaux-de-Fonds'), ('Delémont', False, 'd', 8, 'Delémont'), ('Porrentruy', False, 'g', 8, 'Porrentruy'), ('Saignelégier', True, 'd', 8, None),
  ('Moutier', True, 'd', 8, None), ('Sion', False, 'g', 8, 'Sion'), ('Sierre', False, 'd', 8, 'Sierre'), ('Martigny', False, 'd', 8, 'Martigny'), ('Monthey', False, 'g', 8, 'Monthey'),
  ('Aigle', True, 'd', 8, None), ('Brig-Glis', True, 'd', 8, None)]
pos = {}
for nom, *_ in VILLES:
    if nom in villes_wgs and villes_wgs[nom].get('type') not in ('state', 'administrative'): lat, lon = villes_wgs[nom]['lat'], villes_wgs[nom]['lon']
    else: lat, lon = SECOURS[nom]; print('ville (secours) :', nom)
    pos[nom] = lv95(lon, lat)

# --- cadre : boîte englobante des cantons ---
E0 = min(p[0] for pl in polys.values() for rs in pl for r in rs for p in r); E1 = max(p[0] for pl in polys.values() for rs in pl for r in rs for p in r)
N0 = min(p[1] for pl in polys.values() for rs in pl for r in rs for p in r); N1 = max(p[1] for pl in polys.values() for rs in pl for r in rs for p in r)
echelle = (E1 - E0) / (LARGEUR - 2 * MARGE)   # mètres par unité
H = round((N1 - N0) / echelle + 2 * MARGE)
def proj(p): return ((p[0] - E0) / echelle + MARGE, (N1 - p[1]) / echelle + MARGE)
def chemin(rings):
    parts = []
    for ring in rings:
        pts = [proj(p) for p in ring]
        parts.append('M' + ' L'.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + 'Z')
    return ''.join(parts)

sortie = {'w': int(LARGEUR), 'h': H, 'echelle_m_par_unite': round(echelle, 2), 'cantons': [], 'lacs': [], 'villes': []}
total = 0
for cid, nom in CANTONS:
    rings = []
    for rs in polys[cid]:
        for k, ring in enumerate(rs):
            if aire(ring) < 400_000 and k > 0: continue       # trous minuscules
            if aire(ring) < 400_000: continue                 # îlots minuscules (< 0,4 km²)
            rings.append(simplifier_ring(ring))
    nv = sum(len(r) for r in rings); total += nv
    sortie['cantons'].append({'id': cid, 'nom': nom, 'd': chemin(rings)})
    print(f'{nom}: {len(rings)} anneaux, {nv} sommets')
for nom, rs in lacs:
    rings = []
    for poly in rs:
        for k, ring in enumerate(poly):
            if aire(ring) < 300_000: continue
            s = dp(ring, TOL * 0.8 if aire(ring) > 50_000_000 else min(TOL * 0.4, 120.0))  # petits lacs : plus fin, sinon ils deviennent des polygones
            if len(s) >= 4: rings.append(s)
    nv = sum(len(r) for r in rings); total += nv
    # centre de gravité du plus grand anneau (formule du lacet), pour poser le nom du lac au large
    grand = max(rings, key=aire); pts = [proj(p) for p in grand]; a6 = 0.0; cx = cy = 0.0
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        f = x1 * y2 - x2 * y1; a6 += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f
    cx, cy = (cx / (3 * a6), cy / (3 * a6)) if a6 else (pts[0][0], pts[0][1])
    sortie['lacs'].append({'nom': nom, 'd': chemin(rings), 'cx': round(cx, 1), 'cy': round(cy, 1)})
    print(f'{nom}: {len(rings)} anneaux, {nv} sommets')
for nom, petit, cote, dy, label in VILLES:
    x, y = proj(pos[nom])
    v = {'nom': nom, 'x': round(x, 1), 'y': round(y, 1), 'petit': petit}
    if not petit: v.update({'cote': cote, 'dy': dy, 'label': label})
    sortie['villes'].append(v)
json.dump(sortie, open(SORTIE, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('viewBox', sortie['w'], 'x', H, '| échelle', round(echelle), 'm/unité | sommets', total, '| taille', os.path.getsize(SORTIE), 'octets')
