# review-loop
> **Règles Nouvelle Ardoise (priorité absolue sur tout ce qui suit)**
> - AUCUNE MUSIQUE, jamais : ni piste fournie, ni musique synthétisée en code, ni « bed », pad, groove ou boucle rythmique. Si ce guide parle de musique, de BPM ou de couper sur le temps d'un morceau, l'ignorer : le rythme vient de la voix off, des silences ou d'une grille fixe en secondes.
> - Son autorisé : voix off, quelques vrais bruitages sobres et rares, des silences. JAMAIS de whoosh, swoosh, riser ni « impact » cinéma.
> - Jamais d'alcool, dans aucun texte ni visuel. Nourriture : uniquement les vraies photos du client ou du photographe, jamais générée.
> - Exigence maximale : si un rendu fait IA, flou ou bâclé, ne pas livrer.



# Review loop

You can't watch the video, but you can look at frames. Never report a video as done without looking at contact sheets of the current render.

## Loop

1. `npm run draft` — half-resolution render to `out/draft.mp4` (fast).
2. `npm run sheet` — one frame per timeline beat, 0.3 s after it so motion has settled, tiled 4×2 into `out/sheets/beats-N.png`. Each tile is labelled with its timestamp.
3. Open every sheet image and go through the checklist below.
4. Zoom in on anything suspicious:
   - `npm run sheet -- --from 3 --to 5 --every 0.2` to scrub a transition,
   - `npm run sheet -- 3.7 3.75 3.8` for exact moments,
   - `npm run still -- out/still.png --frame=222` for one full-resolution frame.
5. Fix, then go back to step 1. Stop when a full pass finds nothing.
6. Final: `npm run build`, then `npm run sheet -- --video out/effort.mp4` and `npm run wave`.

## Checklist

Composition
- One focal point per frame. If two things compete, one of them waits.
- Nothing collides or overlaps unintentionally, especially during transitions where an exiting and an entering element share space.
- Safe area: nothing important within ~60 px of an edge.
- Frame 0 is a real image, not black (it's the X thumbnail).

Type
- Nothing clipped by a mask, container or the frame when it shouldn't be.
- Key message readable when the sheet tile is shrunk to phone width.
- Text isn't moving while it's meant to be read.

Timing
- Each readable state holds long enough (see `motion-design` §4). If a tile mid-hold shows text still animating, the hold is too short.
- Scenes overlap instead of cutting to empty frames.
- Exits are faster than entrances.

Consistency
- Only palette colors from `C`; the accent marks the point of the frame.
- Same element looks the same in every scene it appears in.

Sound (after `npm run wave`)
- Transients sit on beat lines in `out/wave.png`.
- −14 LUFS ±1, true peak ≤ −1 dBFS.

## Report

When you finish, say what you checked, what you fixed, and which sheet shows it. Don't claim a fix you haven't re-rendered and looked at.
