# Scène « Nouvelle ardoise » en Blender (Cycles). Usage : python build.py <dossier scene> <sortie> [frames...]
import bpy, sys, math, mathutils
D = sys.argv[1]; OUT = sys.argv[2]; FR = [int(x) for x in sys.argv[3:]]
A = D + '/assets/'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = int(__import__('os').environ.get('SPP', '48')); sc.cycles.use_denoising = True
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = float(__import__('os').environ.get('ATH', '0.01'));
sc.cycles.denoiser = 'OPENIMAGEDENOISE'; sc.cycles.denoising_input_passes = 'RGB_ALBEDO_NORMAL'; sc.cycles.denoising_prefilter = 'ACCURATE'
try: sc.cycles.denoising_quality = 'HIGH'
except Exception: pass
sc.cycles.filter_width = 1.0; sc.render.use_persistent_data = True; sc.cycles.seed = 7; sc.render.use_motion_blur = False
sc.render.image_settings.color_mode = 'RGB'
sc.cycles.max_bounces = 6; sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = int(__import__('os').environ.get('RW', '1080')), int(__import__('os').environ.get('RH', '1920'))
sc.render.fps = 24; sc.frame_start, sc.frame_end = 1, 120
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - High Contrast'
sc.render.film_transparent = False
sc.render.image_settings.file_format = 'PNG'

def V(x, y, z):  # repère three.js (y haut, z vers la caméra) → Blender
    return mathutils.Vector((x, -z, y))

def img(path, srgb=True):
    im = bpy.data.images.load(path, check_existing=True)
    if not srgb: im.colorspace_settings.name = 'Non-Color'
    return im

def pbr(name, folder, scale=1.0, tint=None, rough_mul=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    def t(file, srgb):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = img(A + folder + '/' + file, srgb); nt.links.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    dif = t('Diffuse.jpg', True)
    if tint:
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1
        nt.links.new(dif.outputs['Color'], mix.inputs['A']); mix.inputs['B'].default_value = (*tint, 1)
        nt.links.new(mix.outputs['Result'], bs.inputs['Base Color'])
    else: nt.links.new(dif.outputs['Color'], bs.inputs['Base Color'])
    r = t('Rough.jpg', False)
    if rough_mul != 1.0:
        mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = rough_mul
        nt.links.new(r.outputs['Color'], mm.inputs[0]); nt.links.new(mm.outputs[0], bs.inputs['Roughness'])
    else: nt.links.new(r.outputs['Color'], bs.inputs['Roughness'])
    nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(t('nor_gl.jpg', False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    return m

def flat(name, col, rough=0.8, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m

# Monde : vrai café, pour les reflets seulement (invisible à la caméra)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = img(A + 'cafe.hdr', False)
bg = nt.nodes['Background']; bg.inputs['Strength'].default_value = 0.06
nt.links.new(env.outputs['Color'], bg.inputs['Color'])
lp = nt.nodes.new('ShaderNodeLightPath'); dark = nt.nodes.new('ShaderNodeBackground'); dark.inputs['Color'].default_value = (0.004, 0.0035, 0.003, 1)
mx = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(lp.outputs['Is Camera Ray'], mx.inputs[0]); nt.links.new(bg.outputs[0], mx.inputs[1]); nt.links.new(dark.outputs[0], mx.inputs[2])
nt.links.new(mx.outputs[0], nt.nodes['World Output'].inputs['Surface'])

# Sol en ardoise, mur sombre
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0)); floor = bpy.context.object
floor.data.materials.append(pbr('ardoise', 'slate_floor_02_4k', scale=4, tint=(0.55, 0.58, 0.62)))
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 2.2, 3), rotation=(math.radians(90), 0, 0)); wall = bpy.context.object
wall.data.materials.append(flat('mur', (0.016, 0.014, 0.012), 0.95))

# Comptoir en noyer au premier plan
Z = 1.45
bpy.ops.mesh.primitive_cube_add(location=V(0, 0.74, Z)); top = bpy.context.object; top.scale = (0.9, 0.35, 0.03)
bpy.ops.object.transform_apply(scale=True); bpy.ops.object.modifier_add(type='BEVEL'); top.modifiers['Bevel'].width = 0.006; top.modifiers['Bevel'].segments = 3
bpy.ops.uv.smart_project() if False else None
top.data.materials.append(pbr('noyer', 'black_walnut_veneer_01_4k', scale=1.2, tint=(0.3, 0.2, 0.14), rough_mul=0.7))
bpy.ops.mesh.primitive_cube_add(location=V(0, 0.355, Z)); base = bpy.context.object; base.scale = (0.86, 0.31, 0.355)
base.data.materials.append(flat('meuble', (0.02, 0.016, 0.013), 0.7))
TOP = 0.77

def gltf(name, file):
    before = set(bpy.data.objects)
    import os as _o
    f4 = file.replace('_2k.gltf', '_4k.gltf')
    if _o.path.exists(f'{A}{name}/{f4}'): file = f4
    bpy.ops.import_scene.gltf(filepath=f'{A}{name}/{file}')
    new = [o for o in bpy.data.objects if o not in before]
    root = [o for o in new if o.parent is None]
    return root[0], new

easel, easel_parts = gltf('standing_chalkboard_01', 'standing_chalkboard_01_2k.gltf'); easel.scale = (1.12,) * 3
board, _ = gltf('wooden_cutting_board', 'wooden_cutting_board_2k.gltf'); board.location = V(-0.17, TOP, Z - 0.02); board.rotation_euler[2] = 0.18
cr, _ = gltf('croissant', 'croissant_2k.gltf'); cr.location = V(-0.23, TOP + 0.041, Z - 0.05); cr.rotation_euler[2] = -0.5
cr2, _ = gltf('croissant', 'croissant_2k.gltf'); cr2.location = V(-0.06, TOP + 0.041, Z + 0.04); cr2.rotation_euler[2] = 2.4; cr2.scale = (0.92,) * 3
cake, _ = gltf('strawberry_chocolate_cake', 'strawberry_chocolate_cake_2k.gltf'); cake.location = V(0.1, TOP, Z - 0.2); cake.rotation_euler[2] = 0.7
for o in easel_parts:
    for s in getattr(o, 'material_slots', []):
        m = s.material
        if not m or 'frame' not in m.name or m.get('fonce'): continue
        m['fonce'] = 1; nt = m.node_tree; b = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]
        lk = b.inputs['Base Color'].links
        if lk:
            src = lk[0].from_socket; hsv = nt.nodes.new('ShaderNodeHueSaturation')
            hsv.inputs['Saturation'].default_value = 0.72; hsv.inputs['Value'].default_value = 0.42
            nt.links.new(src, hsv.inputs['Color']); nt.links.new(hsv.outputs['Color'], b.inputs['Base Color'])
        b.inputs['Coat Weight'].default_value = 0.25; b.inputs['Coat Roughness'].default_value = 0.32
bpy.context.view_layer.update()

# Face de l'ardoise : on la retrouve par lancer de rayon
dg = bpy.context.evaluated_depsgraph_get()
def hit(x, z):
    ok, loc, nrm, *_ = sc.ray_cast(dg, mathutils.Vector((x, -3, z)), mathutils.Vector((0, 1, 0)))
    return (loc, nrm) if ok else (None, None)
zs = [z / 100 for z in range(20, 180)]
hits = [(z, hit(0, z)) for z in zs]
hits = [(z, h) for z, h in hits if h[0] is not None and h[0].y < 0.2]
zmax = max(z for z, _ in hits)
pHi, nrm = hit(0, zmax - 0.2); pLo, _ = hit(0, zmax - 0.2 - 0.62)
mid = (pHi + pLo) / 2
pL, _ = hit(-0.32, mid.z); pR, _ = hit(0.32, mid.z)
up = (pHi - pLo).normalized(); right = (pR - pL).normalized(); n = right.cross(up).normalized()
if n.y > 0: n = -n
size = (pR - pL).length * 1.45
center = mid + n * 0.003
bpy.ops.mesh.primitive_plane_add(size=1); ch = bpy.context.object
M = mathutils.Matrix((right, up, n)).transposed().to_4x4(); M.translation = center
ch.matrix_world = M @ mathutils.Matrix.Scale(size, 4)
cm = bpy.data.materials.new('craie'); cm.use_nodes = True; nt = cm.node_tree
bs = nt.nodes['Principled BSDF']; bs.inputs["Base Color"].default_value = (0.62, 0.6, 0.56, 1); bs.inputs["Roughness"].default_value = 1
ta = nt.nodes.new('ShaderNodeTexImage'); ta.image = img(D + '/chalk_alpha.png', False)
tp = nt.nodes.new('ShaderNodeTexImage'); tp.image = img(D + '/chalk_prog.png', False)
kv = nt.nodes.new('ShaderNodeValue'); kv.name = 'K'
lt = nt.nodes.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'
nt.links.new(tp.outputs['Color'], lt.inputs[0]); nt.links.new(kv.outputs[0], lt.inputs[1])
mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
nt.links.new(ta.outputs['Color'], mul.inputs[0]); nt.links.new(lt.outputs[0], mul.inputs[1])
ev = nt.nodes.new('ShaderNodeValue'); ev.name = 'E'
ge = nt.nodes.new('ShaderNodeMath'); ge.operation = 'GREATER_THAN'
nt.links.new(tp.outputs['Color'], ge.inputs[0]); nt.links.new(ev.outputs[0], ge.inputs[1])
mul2 = nt.nodes.new('ShaderNodeMath'); mul2.operation = 'MULTIPLY'
nt.links.new(mul.outputs[0], mul2.inputs[0]); nt.links.new(ge.outputs[0], mul2.inputs[1])
nt.links.new(mul2.outputs[0], bs.inputs['Alpha'])
ch.data.materials.append(cm)
CHALK = dict(K=kv, E=ev, M=M, size=size)

# Lumières
def area(name, loc, target, power, color, size, sy=None):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = power; d.color = color; d.shape = 'RECTANGLE'; d.size = size; d.size_y = sy or size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (mathutils.Vector(target) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
area('cle', V(-1.9, 2.6, 2.2), V(0, 0.95, 0.9), 140, (1.0, 0.80, 0.58), 1.4, 0.9)
area('contre', V(1.3, 2.0, -0.9), V(0, 1.1, 0), 380, (0.55, 0.68, 1.0), 0.35, 1.2)
area('contre2', V(1.1, 1.0, Z - 0.6), V(0, 0.8, Z), 90, (1.0, 0.75, 0.5), 0.3)
area('remplissage', V(0.4, 1.0, 4.5), V(0, 1.0, 0), 4, (0.8, 0.85, 1.0), 2.0)
sp = bpy.data.lights.new('douche', 'SPOT'); sp.energy = 300; sp.color = (1.0, 0.86, 0.68); sp.spot_size = math.radians(30); sp.spot_blend = 0.6; sp.shadow_soft_size = 0.25
so = bpy.data.objects.new('douche', sp); sc.collection.objects.link(so); so.location = V(0.25, 3.3, 1.2)
so.rotation_euler = (mathutils.Vector(tuple(center)) - so.location).to_track_quat('-Z', 'Y').to_euler()
# halo chaud sur le mur du fond, pour la profondeur
area('halo', V(0.9, 1.2, -1.2), V(0.9, 1.4, -2.2), 30, (1.0, 0.6, 0.32), 1.5)

# ---------- Direction artistique v2 : restaurant de nuit, lumière en douche, salle floue derrière ----------
import os as _os
_E = lambda k, d: float(_os.environ.get(k, d))
if _os.environ.get('LOOK', '1') == '1':
    # cadre : noyer foncé, sans vernis brillant (le vernis renvoyait la lumière et délavait le bois)
    for o in easel_parts:
        for s in getattr(o, 'material_slots', []):
            m = s.material
            if not m: continue
            b = [n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'][0]
            h = [n for n in m.node_tree.nodes if n.type == 'HUE_SAT']
            if 'frame' in m.name:
                b.inputs['Coat Weight'].default_value = 0.0
                if h: h[0].inputs['Value'].default_value = _E('FV', '0.16'); h[0].inputs['Saturation'].default_value = _E('FSA', '0.8')
            elif 'board' in m.name and not h:
                lk = b.inputs['Base Color'].links
                if lk:
                    nt = m.node_tree; hb = nt.nodes.new('ShaderNodeHueSaturation')
                    hb.inputs['Saturation'].default_value = 0.6; hb.inputs['Value'].default_value = _E('BV', '0.6')
                    nt.links.new(lk[0].from_socket, hb.inputs['Color']); nt.links.new(hb.outputs['Color'], b.inputs['Base Color'])
    # lumières : moins de face, plus de douche, un contre-jour qui dessine le cadre
    O = bpy.data.objects
    O['cle'].data.energy = _E('KEY', '55')
    O['remplissage'].data.energy = _E('FILL', '1.5')
    O['douche'].data.energy = _E('SPOT', '520'); O['douche'].data.spot_size = math.radians(_E('SPA', '24')); O['douche'].data.spot_blend = 1.0
    O['contre'].data.energy = _E('RIM', '420')
    # comptoir : noyer foncé verni, il renvoie les lampes
    for nd in top.active_material.node_tree.nodes:
        if nd.type == 'MIX': nd.inputs['B'].default_value = (0.3 * _E('TT', '0.55'), 0.2 * _E('TT', '0.55'), 0.14 * _E('TT', '0.55'), 1)
        if nd.type == 'MATH' and nd.operation == 'MULTIPLY': nd.inputs[1].default_value = _E('TR', '0.45')
    # la salle derrière : mur repoussé, lampes suspendues qui deviennent des bulles floues
    wall.location = (0, 7.5, 3)
    O['halo'].location = V(0.6, 1.6, -5.5); O['halo'].data.energy = 120
    bm = bpy.data.materials.new('ampoule_floue'); bm.use_nodes = True; bnt = bm.node_tree
    bb = bnt.nodes['Principled BSDF']; bb.inputs['Base Color'].default_value = (0, 0, 0, 1)
    bb.inputs['Emission Color'].default_value = (1.0, 0.62, 0.3, 1); bb.inputs['Emission Strength'].default_value = _E('BOKEH', '30')
    import random as _r; _r.seed(11); LAMPES = []
    for i in range(26):  # salle de restaurant : suspensions à des profondeurs variées (bulles de tailles différentes)
        z = -_r.uniform(2.6, 9.0); x = _r.uniform(-1.0, 1.0) * (1.2 + 0.35 * -z); y = _r.uniform(2.3, 3.2) + 0.05 * -z
        LAMPES.append((x, y, z, _r.uniform(0.035, 0.07), _r.uniform(0.5, 1.0)))
    for x, y, z, r, k in LAMPES:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=V(x, y, z), segments=16, ring_count=8)
        s = bpy.context.object; s.data.materials.append(bm); s.visible_shadow = False
        s['k'] = k
    # applique de tableau en laiton au-dessus de l'ardoise : lumière rasante du haut, dégradé vers le bas
    if _os.environ.get('APPLIQUE', '1') == '1':
        top_b = pHi + up * _E('AU', '0.13'); pos = top_b + n * _E('AN', '0.2')
        laiton = flat('laiton', (0.78, 0.56, 0.3), 0.28, 1.0)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.62, vertices=32); bar = bpy.context.object
        bar.rotation_euler = mathutils.Matrix((up, n, right)).transposed().to_euler(); bar.location = pos; bar.data.materials.append(laiton)
        bpy.ops.object.shade_smooth()
        for sx in (-0.2, 0.2):
            a0 = top_b + right * sx; a1 = pos + right * sx; mid_ = (a0 + a1) / 2
            bpy.ops.mesh.primitive_cylinder_add(radius=0.006, depth=(a1 - a0).length, vertices=16); arm = bpy.context.object
            arm.location = mid_; arm.rotation_euler = (a1 - a0).to_track_quat('Z', 'Y').to_euler(); arm.data.materials.append(laiton)
        d = bpy.data.lights.new('applique', 'AREA'); d.shape = 'RECTANGLE'; d.size = 0.56; d.size_y = 0.03; d.energy = _E('APW', '40'); d.color = (1.0, 0.82, 0.6); d.spread = math.radians(_E('APS', '70'))
        lo = bpy.data.objects.new('applique', d); sc.collection.objects.link(lo); lo.location = pos - up * 0.025
        tgt_ = center - up * 0.35
        lo.rotation_euler = (tgt_ - lo.location).to_track_quat('-Z', 'Y').to_euler()
        # orienter le grand côté le long de l'ardoise
        q = (tgt_ - lo.location).to_track_quat('-Z', 'Y'); lo.rotation_euler = q.to_euler()
        lx = lo.matrix_world.to_3x3().col[0]
        if abs(lx.dot(right)) < 0.7: lo.rotation_euler.rotate_axis('Z', math.radians(90))


# ---------- « La mise en place » : plan-séquence complet ----------
import os
END = 264
sc.frame_end = END
def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def seg(f, a, b): return ease((f - a) / (b - a))

# Craie 1 : écrit 6→54, effacée à l'éponge 204→220
kv, ev = CHALK['K'], CHALK['E']
for f in range(1, END + 1):
    kv.outputs[0].default_value = max(0.0, min(1.0001, (f - 6) / 48)); kv.outputs[0].keyframe_insert('default_value', frame=f)
    ev.outputs[0].default_value = -0.01 + 1.02 * seg(f, 216, 230); ev.outputs[0].keyframe_insert('default_value', frame=f)

# Craie 2 : « Envoyez. » écrit 222→246
bpy.ops.mesh.primitive_plane_add(size=1); ch2 = bpy.context.object
ch2.matrix_world = mathutils.Matrix.Translation(mathutils.Vector(CHALK['M'].col[2][:3]) * 0.0015) @ CHALK['M'] @ mathutils.Matrix.Scale(CHALK['size'], 4)
cm2 = bpy.data.materials.new('craie2'); cm2.use_nodes = True; nt = cm2.node_tree
bs = nt.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (0.62, 0.6, 0.56, 1); bs.inputs['Roughness'].default_value = 1
ta = nt.nodes.new('ShaderNodeTexImage'); ta.image = img(D + '/envoyez/chalk_alpha.png', False)
tp = nt.nodes.new('ShaderNodeTexImage'); tp.image = img(D + '/envoyez/chalk_prog.png', False)
k2 = nt.nodes.new('ShaderNodeValue')
lt = nt.nodes.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'
nt.links.new(tp.outputs['Color'], lt.inputs[0]); nt.links.new(k2.outputs[0], lt.inputs[1])
mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'
nt.links.new(ta.outputs['Color'], mu.inputs[0]); nt.links.new(lt.outputs[0], mu.inputs[1]); nt.links.new(mu.outputs[0], bs.inputs['Alpha'])
ch2.data.materials.append(cm2)
for f in range(1, END + 1):
    k2.outputs[0].default_value = max(0.0, min(1.0001, (f - 234) / 24)); k2.outputs[0].keyframe_insert('default_value', frame=f)

# Fruits de la mise en place, posés sur le passe
def place(name, p, rz=0.0, s=1.0):
    o, _ = gltf(name, f'{name}_2k.gltf'); o.location = p; o.rotation_euler[2] = rz; o.scale = (s,) * 3; return o
fruits = [
    place('lemon', V(0.36, TOP, Z - 0.05), 0.4),
    place('food_lime_01', V(0.7, TOP, Z - 0.12), 1.1),
    place('food_pomegranate_01', V(-0.48, TOP, Z - 0.12), 0.2),
    place('food_kiwi_01', V(-0.22, TOP, Z + 0.3), 2.0),
    place('food_apple_01', V(-0.42, TOP, Z + 0.15), 0.9),
    place('food_avocado_01', V(0.55, TOP, Z - 0.15), 2.6),
]
bpy.context.view_layer.update()
# Lévitation : chaque objet monte au ralenti, flotte, tourne, puis se repose
floaters = [(o, h) for o, h in zip(fruits, [0.22, 0.34, 0.28, 0.18, 0.3, 0.4])]
floaters += [(cr, 0.2), (cr2, 0.3), (cake, 0.12)]
for i, (o, h) in enumerate(floaters):
    base = o.location.copy(); r0 = o.rotation_euler.copy()
    ph = i * 0.9
    for f in range(90, 232, 4):
        up = seg(f, 96 + i * 2, 124 + i * 2) * (1 - seg(f, 204, 228))
        bob = math.sin(f / 9 + ph) * 0.012 * up
        o.location = base + mathutils.Vector((0, 0, (h + bob) * up))
        o.rotation_euler = (r0[0] + 0.35 * up * math.sin(ph), r0[1] + 0.25 * up * math.cos(ph), r0[2] + up * (0.6 + 0.004 * (f - 96)) * (1 if i % 2 else -1))
        o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)

# Le téléphone : modélisé ici (verre noir, cadre titane), il descend, pivote et s'allume sur un vrai site
PS = 1.35
ph = bpy.data.objects.new('telephone', None); sc.collection.objects.link(ph)
bpy.ops.mesh.primitive_cube_add(size=1); body = bpy.context.object; body.scale = (0.0715, 0.0083, 0.147)
bpy.ops.object.transform_apply(scale=True)
bv = body.modifiers.new('b', 'BEVEL'); bv.width = 0.0095; bv.segments = 10; bv.limit_method = 'ANGLE'
bv2 = body.modifiers.new('b2', 'BEVEL'); bv2.width = 0.0012; bv2.segments = 3
bpy.ops.object.shade_smooth()
body.data.materials.append(flat('titane', (0.33, 0.32, 0.31), 0.28, 1.0)); body.parent = ph
def ph_plane(name, w, h, y, mat):
    bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.object; o.scale = (w, h, 1); o.rotation_euler = (math.radians(90), 0, 0)
    o.location = (0, y, 0); o.data.materials.append(mat); o.parent = ph; return o
glass = flat('verre', (0.005, 0.005, 0.006), 0.04); glass.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value = 1
ph_plane('vitre', 0.0705, 0.1455, -0.00418, glass)
em = bpy.data.materials.new('ecran'); em.use_nodes = True; nt = em.node_tree
bsd = nt.nodes['Principled BSDF']; ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = img(D + '/ecran_mobile.png')
nt.links.new(ti.outputs['Color'], bsd.inputs['Base Color']); nt.links.new(ti.outputs['Color'], bsd.inputs['Emission Color'])
bsd.inputs['Roughness'].default_value = 0.08; bsd.inputs['Coat Weight'].default_value = 1
scr = ph_plane('ecran', 0.0662, 0.1435, -0.00425, em)
# bloc photo au dos
bpy.ops.mesh.primitive_cube_add(size=1); mod = bpy.context.object; mod.scale = (0.03, 0.002, 0.03); bpy.ops.object.transform_apply(scale=True)
mod.modifiers.new('b', 'BEVEL').width = 0.007; mod.location = (-0.0165, 0.0051, 0.052); mod.data.materials.append(glass); mod.parent = ph
for lx, lz in [(-0.024, 0.06), (-0.024, 0.044), (-0.009, 0.052)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0055, depth=0.003, rotation=(math.radians(90), 0, 0), location=(lx, 0.0068, lz))
    l = bpy.context.object; l.data.materials.append(flat('lentille', (0.01, 0.01, 0.012), 0.05, 0.6)); l.parent = ph
ph.scale = (PS,) * 3
HOV = V(0.02, TOP + 0.16, Z + 0.1)
REST = V(0.05, TOP + 0.147 * PS / 2 + 0.002, Z + 0.05)  # v2 : visible dans le plan large de trois-quarts
for f, p, rz in [(1, V(2.5, 2.5, Z), 3.0), (128, V(0.02, 2.2, Z + 0.1), 3.0), (152, HOV + mathutils.Vector((0, 0, 0.03)), 0.7),
                 (164, HOV, 0.0), (190, HOV + mathutils.Vector((0, 0, 0.012)), 0.0), (204, HOV, -0.05), (228, REST, -0.12), (END, REST, -0.12)]:
    ph.location = p; ph.rotation_euler = (0, 0, rz); ph.keyframe_insert('location', frame=f); ph.keyframe_insert('rotation_euler', frame=f)
for f, e in [(1, 0.0), (156, 0.0), (166, 1.8), (END, 1.8)]:
    bsd.inputs['Emission Strength'].default_value = e; bsd.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)

# L'appareil photo : arrive en flottant et se tourne vers nous, flash
camo, cam_parts = gltf('Camera_01', 'Camera_01_2k.gltf')
camr = bpy.data.objects.new('appareil', None); sc.collection.objects.link(camr)
for o in cam_parts:
    if any(k in o.name.lower() for k in ('strap', 'lanyard', 'ring', 'lug')): o.hide_render = True
    print('piece appareil', o.name)
    if o.parent is None: o.parent = camr
camr.scale = (1.2,) * 3
CP = V(0.36, TOP + 0.2, Z + 0.22)
for f, p, rz in [(1, V(1.4, TOP + 0.5, Z + 0.1), 2.2), (160, V(1.4, TOP + 0.5, Z + 0.1), 2.2), (184, CP, 0.0), (206, CP + mathutils.Vector((0, 0, 0.01)), 0.0), (228, V(0.3, TOP + 0.05, Z + 0.3), -0.45), (END, V(0.3, TOP + 0.05, Z + 0.3), -0.45)]:
    camr.location = p; camr.rotation_euler = (0, 0, rz + float(os.environ.get('CRZ', '0')))
    camr.keyframe_insert('location', frame=f); camr.keyframe_insert('rotation_euler', frame=f)
fl = bpy.data.lights.new('flash', 'POINT'); fl.color = (0.9, 0.95, 1.0); fl.shadow_soft_size = 0.02
flo = bpy.data.objects.new('flash', fl); sc.collection.objects.link(flo); flo.parent = camr; flo.location = (0, -0.06, 0.03)
for f, e in [(1, 0), (196, 0), (198, 60), (203, 0), (END, 0)]:
    fl.energy = e; fl.keyframe_insert('energy', frame=f)

# Lampe suspendue au-dessus du passe
bl = bpy.data.lights.new('ampoule', 'POINT'); bl.energy = 45; bl.color = (1.0, 0.72, 0.42); bl.shadow_soft_size = 0.04
blo = bpy.data.objects.new('ampoule', bl); sc.collection.objects.link(blo); blo.location = V(0.0, 1.66, Z - 0.02)

# Caméra et trajectoire : un seul plan-séquence
cam_d = bpy.data.cameras.new('cam'); cam_d.sensor_fit = 'VERTICAL'; cam_d.angle_y = math.radians(30)
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
tgt = bpy.data.objects.new('cible', None); sc.collection.objects.link(tgt)
tc = cam.constraints.new('TRACK_TO'); tc.target = tgt; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'
cam_d.dof.use_dof = True
KEYS = [  # frame, position, cible, mise au point, ouverture. L'ardoise ne bouge PAS pendant que la craie écrit (6-54 et 234-258).
    (1,   V(0.015, 1.17, 3.55),       V(0.015, 1.08, 0),        3.5,  4.0),
    (60,  V(0.015, 1.17, 3.55),       V(0.015, 1.08, 0),        3.5,  4.0),
    (96,  V(0.0, 1.2, Z + 1.45),      V(0.0, 0.92, Z - 0.05),   1.5,  3.2),
    (128, V(-0.32, 1.12, Z + 1.2),    V(-0.02, 0.98, Z - 0.02), 1.25, 2.6),
    (172, V(0.02, TOP + 0.21, Z + 0.78), V(0.02, TOP + 0.16, Z + 0.1), 0.68, 2.2),
    (188, V(0.3, TOP + 0.27, Z + 1.05), V(0.36, TOP + 0.2, Z + 0.22), 0.83, 2.4),
    (206, V(0.33, TOP + 0.25, Z + 0.92), V(0.36, TOP + 0.2, Z + 0.22), 0.7, 2.4),
    (222, V(0.015, 1.18, 3.5),        V(0.015, 1.08, 0),        3.45, 4.5),
    (END, V(0.015, 1.18, 3.5),        V(0.015, 1.08, 0),        3.45, 4.5),
]
import os as _o
if _o.environ.get('CAM0'):
    p0 = V(*map(float, _o.environ['CAM0'].split(','))); t0 = V(*map(float, _o.environ['TGT0'].split(',')))
    fd0, fs0 = float(_o.environ.get('FD0', '3.45')), float(_o.environ.get('FS0', '4'))
    KEYS = [(k[0], p0, t0, fd0, fs0) if k[0] in (1, 60, 222, END) else k for k in KEYS]
for f, p, t, fd, fs in KEYS:
    cam.location = p; cam.keyframe_insert('location', frame=f)
    tgt.location = t; tgt.keyframe_insert('location', frame=f)
    cam_d.dof.focus_distance = fd; cam_d.dof.keyframe_insert('focus_distance', frame=f)
    cam_d.dof.aperture_fstop = fs; cam_d.dof.keyframe_insert('aperture_fstop', frame=f)

if _o.environ.get('ZONES'):
    # rectangles (fractions de l'image) du téléphone et de l'appareil posés, pour les zones cliquables du site
    import json; from bpy_extras.object_utils import world_to_camera_view as w2c
    def enfants(o): return [o] + [e for c in o.children for e in enfants(c)]
    res = {}
    for fr in map(int, _o.environ['ZONES'].split(',')):
        sc.frame_set(fr); bpy.context.view_layer.update()
        for nom, racine in (('telephone', ph), ('appareil', camr)):
            xs, ys = [], []
            for ob in enfants(racine):
                if ob.type != 'MESH' or ob.hide_render: continue
                for c in ob.bound_box:
                    p = w2c(sc, sc.camera, ob.matrix_world @ mathutils.Vector(c)); xs.append(p.x); ys.append(1 - p.y)
            res[f'{nom}@{fr}'] = [round(min(xs), 4), round(min(ys), 4), round(max(xs) - min(xs), 4), round(max(ys) - min(ys), 4)]
    print('ZONES', json.dumps(res)); raise SystemExit
if _o.environ.get('COINS'):
    # coins des deux plans de craie à l'écran (pour composer les plans fixes sans tout recalculer)
    import json; from bpy_extras.object_utils import world_to_camera_view as w2c
    res = {}
    for fr in (1, 264):
        sc.frame_set(fr); bpy.context.view_layer.update()
        for nom, ob in (('craie1', ch), ('craie2', ch2)):
            mw = ob.matrix_world; pts = []
            for u, v in ((0, 0), (1, 0), (1, 1), (0, 1)):  # coins dans l'espace de la texture (u, v)
                p = w2c(sc, sc.camera, mw @ mathutils.Vector((u - 0.5, v - 0.5, 0)))
                pts.append([p.x * sc.render.resolution_x, (1 - p.y) * sc.render.resolution_y])
            res[f'{nom}@{fr}'] = pts
    json.dump(res, open(_o.environ['COINS'], 'w'), indent=1); print('coins', res); raise SystemExit
FR = FR or list(range(1, END + 1))
for f in FR:
    sc.cycles.samples = int(os.environ.get('SPP', '128'))
    sc.frame_set(f)
    sc.render.filepath = f'{OUT}/f{f:04d}.png'
    bpy.ops.render.render(write_still=True)
print('done')
