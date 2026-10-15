# Scène « Nouvelle ardoise » en Blender (Cycles). Usage : python build.py <dossier scene> <sortie> [frames...]
import bpy, sys, math, mathutils
D = sys.argv[1]; OUT = sys.argv[2]; FR = [int(x) for x in sys.argv[3:]]
A = D + '/assets/'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = int(__import__('os').environ.get('SPP', '48')); sc.cycles.use_denoising = True
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02; sc.cycles.seed = 7; sc.render.use_motion_blur = False
sc.render.image_settings.color_mode = 'RGB'
sc.cycles.max_bounces = 6; sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = int(__import__('os').environ.get('RW', '720')), int(__import__('os').environ.get('RH', '1280'))
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
floor.data.materials.append(pbr('ardoise', 'slate_floor_02', scale=4, tint=(0.55, 0.58, 0.62)))
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 2.2, 3), rotation=(math.radians(90), 0, 0)); wall = bpy.context.object
wall.data.materials.append(flat('mur', (0.016, 0.014, 0.012), 0.95))

# Comptoir en noyer au premier plan
Z = 1.45
bpy.ops.mesh.primitive_cube_add(location=V(0, 0.74, Z)); top = bpy.context.object; top.scale = (0.9, 0.35, 0.03)
bpy.ops.object.transform_apply(scale=True); bpy.ops.object.modifier_add(type='BEVEL'); top.modifiers['Bevel'].width = 0.006; top.modifiers['Bevel'].segments = 3
bpy.ops.uv.smart_project() if False else None
top.data.materials.append(pbr('noyer', 'black_walnut_veneer_01', scale=1.2, tint=(0.3, 0.2, 0.14), rough_mul=0.7))
bpy.ops.mesh.primitive_cube_add(location=V(0, 0.355, Z)); base = bpy.context.object; base.scale = (0.86, 0.31, 0.355)
base.data.materials.append(flat('meuble', (0.02, 0.016, 0.013), 0.7))
TOP = 0.77

def gltf(name, file):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f'{A}{name}/{file}')
    new = [o for o in bpy.data.objects if o not in before]
    root = [o for o in new if o.parent is None]
    return root[0], new

easel, easel_parts = gltf('standing_chalkboard_01', 'standing_chalkboard_01_2k.gltf'); easel.scale = (1.12,) * 3
board, _ = gltf('wooden_cutting_board', 'wooden_cutting_board_2k.gltf'); board.location = V(-0.17, TOP, Z - 0.02); board.rotation_euler[2] = 0.18
cr, _ = gltf('croissant', 'croissant_2k.gltf'); cr.location = V(-0.23, TOP + 0.041, Z - 0.05); cr.rotation_euler[2] = -0.5
cr2, _ = gltf('croissant', 'croissant_2k.gltf'); cr2.location = V(-0.06, TOP + 0.041, Z + 0.04); cr2.rotation_euler[2] = 2.4; cr2.scale = (0.92,) * 3
cake, _ = gltf('strawberry_chocolate_cake', 'strawberry_chocolate_cake_2k.gltf'); cake.location = V(0.1, TOP, Z - 0.2); cake.rotation_euler[2] = 0.7
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
