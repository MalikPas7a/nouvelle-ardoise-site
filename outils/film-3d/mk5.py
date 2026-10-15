# Fabrique build5.py (qualité pro) à partir de head4 + tail4
h = open('head4.py').read(); t = open('tail4.py').read()
def rep(s, a, b):
    assert a in s, a; return s.replace(a, b)
h = rep(h, "sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02;",
 "sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = float(__import__('os').environ.get('ATH', '0.01'));\n"
 "sc.cycles.denoiser = 'OPENIMAGEDENOISE'; sc.cycles.denoising_input_passes = 'RGB_ALBEDO_NORMAL'; sc.cycles.denoising_prefilter = 'ACCURATE'\n"
 "try: sc.cycles.denoising_quality = 'HIGH'\nexcept Exception: pass\n"
 "sc.cycles.filter_width = 1.0; sc.render.use_persistent_data = True;")
h = rep(h, "'RW', '720'", "'RW', '1080'"); h = rep(h, "'RH', '1280'", "'RH', '1920'")
h = rep(h, "pbr('ardoise', 'slate_floor_02',", "pbr('ardoise', 'slate_floor_02_4k',")
h = rep(h, "pbr('noyer', 'black_walnut_veneer_01',", "pbr('noyer', 'black_walnut_veneer_01_4k',")
h = rep(h, "    bpy.ops.import_scene.gltf(filepath=f'{A}{name}/{file}')",
 "    import os as _o\n    f4 = file.replace('_2k.gltf', '_4k.gltf')\n    if _o.path.exists(f'{A}{name}/{f4}'): file = f4\n    bpy.ops.import_scene.gltf(filepath=f'{A}{name}/{file}')")
# cadre de l'ardoise : bois sombre, finition satinée (fini le plastique orange)
h = rep(h, "bpy.context.view_layer.update()\n\n# Face de l'ardoise",
 "for o in easel_parts:\n"
 "    for s in getattr(o, 'material_slots', []):\n"
 "        m = s.material\n"
 "        if not m or 'frame' not in m.name or m.get('fonce'): continue\n"
 "        m['fonce'] = 1; nt = m.node_tree; b = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]\n"
 "        lk = b.inputs['Base Color'].links\n"
 "        if lk:\n"
 "            src = lk[0].from_socket; hsv = nt.nodes.new('ShaderNodeHueSaturation')\n"
 "            hsv.inputs['Saturation'].default_value = 0.72; hsv.inputs['Value'].default_value = 0.42\n"
 "            nt.links.new(src, hsv.inputs['Color']); nt.links.new(hsv.outputs['Color'], b.inputs['Base Color'])\n"
 "        b.inputs['Coat Weight'].default_value = 0.25; b.inputs['Coat Roughness'].default_value = 0.32\n"
 "bpy.context.view_layer.update()\n\n# Face de l'ardoise")
# caméra d'ouverture réglable (essais de cadrage)
t = rep(t, "for f, p, t, fd, fs in KEYS:",
 "import os as _o\nif _o.environ.get('CAM0'):\n"
 "    p0 = V(*map(float, _o.environ['CAM0'].split(','))); t0 = V(*map(float, _o.environ['TGT0'].split(',')))\n"
 "    fd0, fs0 = float(_o.environ.get('FD0', '3.45')), float(_o.environ.get('FS0', '4'))\n"
 "    KEYS = [(k[0], p0, t0, fd0, fs0) if k[0] in (1, 60, 222, END) else k for k in KEYS]\n"
 "for f, p, t, fd, fs in KEYS:")
t = rep(t, "sc.cycles.samples = int(os.environ.get('SPP', '64' if (f < 64 or f > 220) else '48'))",
 "sc.cycles.samples = int(os.environ.get('SPP', '128'))")
t = rep(t, "FR = FR or list(range(1, END + 1))", '''if _o.environ.get('ZONES'):
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
FR = FR or list(range(1, END + 1))''')
t = rep(t, "REST = V(-0.1, TOP + 0.147 * PS / 2 + 0.002, Z + 0.1)", "REST = V(0.05, TOP + 0.147 * PS / 2 + 0.002, Z + 0.05)  # v2 : visible dans le plan large de trois-quarts")
t = t.replace("V(0.2, TOP + 0.05, Z + 0.3), -0.45)", "V(0.3, TOP + 0.05, Z + 0.3), -0.45)")
open('build5.py', 'w').write(h + '\n' + open('look.py').read() + '\n' + t)
print('ok')
