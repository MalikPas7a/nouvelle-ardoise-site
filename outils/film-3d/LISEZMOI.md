# Film 3D « La mise en place » (v2, 12.10.2026)

Film Blender de 264 images (1080×1920) lu au scroll, mis de côté le 15.10.2026 : l'accueil en ligne reste la V4.
Images finales : `public/sequences/mise-en-place-v2/m/001..264.webp` (WebP q80, 13 Mo).

- `mk5.py` fabrique `build5.py` (= `head4.py` + `look.py` + `tail4.py`), réglages de lumière dans `look.env`.
- `rendre5.sh` : rendu reprenable (Cycles, 48 passes, débruitage OIDN), ~3,4 min par image sur 4 cœurs.
- `plans_fixes.py` : compose les images 2-60 et 233-263 (caméra fixe, seule la craie avance) par homographie à partir de 4 rendus d'ancrage.
- `chalk.py`, `chalk_envoyez.py` : textures d'écriture à la craie.
