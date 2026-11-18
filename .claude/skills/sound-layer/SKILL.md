---
name: sound-layer
description: Add a real sound-effects layer to a finished motion video (HyperFrames, Remotion, After Effects render, any muted MP4). Uses real CC0 recordings instead of synthesized beeps, places cues from the animation's own timing, and runs a visual QA loop because Claude can't hear audio. Use when the user asks to add SFX, sound design, whooshes, hits, clicks, audio cues or a sound layer to a video or animation, or complains that a video's sound is "cheap beeps". For mixing audio already inside a HyperFrames composition (fades, ducking, EQ), use hyperframes-audio instead.
---

> **Règles Nouvelle Ardoise (priorité absolue sur tout ce qui suit)**
> - PAS DE MUSIQUE INSTRUMENTALE : jamais de piano, cordes, synthé, nappe, jingle ni « music bed ». Toute étape « music », « licensed music track », « drop », « beat grid » ou « mix against the music » est à SAUTER : laisser le champ `music` vide, caler sur la voix off, les silences ou une grille en secondes. Seule exception, au cas par cas et validée par Malik : percussions à la main ou voix a cappella (jamais de cordes).
> - Son autorisé : voix off, VRAIS bruitages (enregistrements réels CC0), ambiances sobres (cuisine, rue, salle), silences. Peu de sons, chacun causé par une action à l’écran.
> - JAMAIS de whoosh, swoosh, riser, reverse cymbal, « impact », sub hit ni bruit de mème, même si la banque en propose. Pas de sons synthétisés pour des gestes physiques (préférer un vrai enregistrement).
> - Jamais d’alcool (ni bouchon, ni verre qui trinque, ni bière qui pétille). Nourriture : vraies photos du client ou du photographe uniquement.
> - Claude n’entend pas : toujours livrer les mesures (QA, planche spectrogramme) ET une liste de 3 à 5 repères à écouter pour Malik. Ne jamais dire « le son est bon » sans son oreille.


# Sound layer

You can't hear. So: use real recordings, place them from the timeline, look at every sound, and let the QA decide. A human does the final ear check.

Source: "Sound design for Opus 5.5: no more cheap beeps" (0xCodila, Oct 2026), repo https://github.com/Bodila51/opus-sound-layer.

## 0 Setup

Run from the video project's root.

```bash
cp -r .claude/skills/sound-layer/opus-sound-layer sound-layer   # copie figée dans le dépôt (MIT, Bodila51), pas de clone
```

- Needs `ffmpeg` and `uv`. Check with `which ffmpeg uv`; if missing, tell the user (`brew install ffmpeg uv`) rather than working around it.
- First time in a project: skim `sound-layer/scripts/*.py` before running them. It's third-party code; flag anything that touches the network beyond fetching sounds, or anything outside the project folder.
- Use the repo's scripts as they are. **Never rewrite them, and never loosen a threshold to make a check pass.**

## 1 Cues

Export `audio/cues.json` from the picture's own timing: springs, easings, `data-start`, keyframes. **Never type frame numbers by hand.** Get the schema with:

```bash
uv run sound-layer/scripts/mix.py --schema
```

Sound only real actions. Tag each cue with one type:

| tag | when |
|---|---|
| `cut` | full-frame change |
| `move` | frame of peak speed |
| `land` | frame motion stops |
| `appear` | element pops in |

One hero cue per ~4 s (logo, reveal): `"thump+tap"`, with `stop_before` and a build.

## 2 Sounds

```bash
uv run sound-layer/scripts/sfx.py kit
```

That's 26 CC0 recordings. Never synthesize hits, clicks or whooshes. No meme sounds.

For a missing type:

```bash
uv run sound-layer/scripts/sfx.py search "<material action>" --type <type>
uv run sound-layer/scripts/sfx.py sheet
```

Then **open the sheet image and look**. Reject:
- two events in one clip
- steady noise
- clicks inside a whoosh
- clean sine lines on what should be a physical sound

Music: the user's own track, or a CC0 loop.

## 3 Build

Render the picture muted first, then:

```bash
uv run sound-layer/scripts/mix.py audio/cues.json
ffmpeg -i video.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/final.mp4
uv run sound-layer/scripts/qa.py out/final.mp4
```

Replace `video.mp4` with the actual muted render path.

## 4 Verify

Fix every FAIL by changing cues or sounds — never the scripts or thresholds. At most 2 rounds; if FAILs remain after that, stop and report them.

Open `audio/qa.png` and describe what you see at each hero cue.

## 5 Deliver

- `out/final.mp4`
- `audio/kit/CREDITS.md`
- `LISTEN.md`: 5 timecodes for the user to check by ear, each with what should be heard there.

Don't call the sound good. Report what the checks show (PASS/FAIL counts, anything left unresolved, what qa.png shows at hero cues) and let the human listen.
