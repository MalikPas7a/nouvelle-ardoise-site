
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
REST = V(-0.1, TOP + 0.147 * PS / 2 + 0.002, Z + 0.1)
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
for f, p, rz in [(1, V(1.4, TOP + 0.5, Z + 0.1), 2.2), (160, V(1.4, TOP + 0.5, Z + 0.1), 2.2), (184, CP, 0.0), (206, CP + mathutils.Vector((0, 0, 0.01)), 0.0), (228, V(0.2, TOP + 0.05, Z + 0.3), -0.45), (END, V(0.2, TOP + 0.05, Z + 0.3), -0.45)]:
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
for f, p, t, fd, fs in KEYS:
    cam.location = p; cam.keyframe_insert('location', frame=f)
    tgt.location = t; tgt.keyframe_insert('location', frame=f)
    cam_d.dof.focus_distance = fd; cam_d.dof.keyframe_insert('focus_distance', frame=f)
    cam_d.dof.aperture_fstop = fs; cam_d.dof.keyframe_insert('aperture_fstop', frame=f)

FR = FR or list(range(1, END + 1))
for f in FR:
    sc.cycles.samples = int(os.environ.get('SPP', '64' if (f < 64 or f > 220) else '48'))
    sc.frame_set(f)
    sc.render.filepath = f'{OUT}/f{f:04d}.png'
    bpy.ops.render.render(write_still=True)
print('done')
