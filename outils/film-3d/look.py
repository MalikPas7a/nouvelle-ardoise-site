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
