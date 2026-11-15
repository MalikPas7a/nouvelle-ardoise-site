---
name: sound-ear
description: Give Claude eyes and ears on audio. Turns any audio or video's soundtrack into things Claude can actually reason over — a readable spectrogram + waveform, objective loudness/silence/scene-cut facts, a semantic "sound map" of every SFX with timestamps (Gemini on the user's Vertex, or offline CLAP), offline speech transcription, and cymatic/audio-reactive visualization renders (any aspect ratio, plus a seamless long-form loop mode). Auto-routes to whatever engines the current device supports. Use whenever the user wants Claude to listen to, evaluate, QA, or describe the sound in a render (SFX timing, "does this feel off", mix issues), analyze an audio file, or generate sound-driven visuals for content (e.g. a sleep/ambient channel).
---

> **Règles Nouvelle Ardoise (priorité absolue sur tout ce qui suit)**
> - PAS DE MUSIQUE INSTRUMENTALE : jamais de piano, cordes, synthé, nappe, jingle ni « music bed ». Toute étape « music », « licensed music track », « drop », « beat grid » ou « mix against the music » est à SAUTER : laisser le champ `music` vide, caler sur la voix off, les silences ou une grille en secondes. Seule exception, au cas par cas et validée par Malik : percussions à la main ou voix a cappella (jamais de cordes).
> - Son autorisé : voix off, VRAIS bruitages (enregistrements réels CC0), ambiances sobres (cuisine, rue, salle), silences. Peu de sons, chacun causé par une action à l’écran.
> - JAMAIS de whoosh, swoosh, riser, reverse cymbal, « impact », sub hit ni bruit de mème, même si la banque en propose. Pas de sons synthétisés pour des gestes physiques (préférer un vrai enregistrement).
> - Jamais d’alcool (ni bouchon, ni verre qui trinque, ni bière qui pétille). Nourriture : vraies photos du client ou du photographe uniquement.
> - Claude n’entend pas : toujours livrer les mesures (QA, planche spectrogramme) ET une liste de 3 à 5 repères à écouter pour Malik. Ne jamais dire « le son est bon » sans son oreille.


# sound-ear

Claude cannot natively hear a `.wav`, but it can read images and structured text. This
skill converts sound into exactly those. CLI: `bin/hear.sh <subcommand> <media> [opts]`.
Output lands in a `<name>.ear/` folder next to the media.

## Device compatibility (IMPORTANT)
Run `bin/hear.sh doctor` first. It detects the machine (OS/arch, RAM, Apple Silicon vs
Intel, CUDA) and reports which subcommands work and which `map` engine is selected. `map`
auto-routes: **vertex** (Gemini on the user's GCP — best) if google-genai + ADC are present,
else **clap** (offline) if torch+transformers are installed, else it tells you to use
`see`/`transcribe`. Force with `--engine vertex|clap`.

## Subcommands
- `see <media>` — WORKING, ffmpeg only. `spectrogram.png` (Read it — SFX are shapes:
  broadband smear=whoosh/noise, low bar=boom, diagonal=sweep, horizontal=tone), `waveform.png`,
  `report.md` (duration, EBU R128 loudness, silence, scene cuts). The reliable timing source.
- `map <media> [--engine auto|vertex|clap]` — semantic sound map
  `[{t0,t1,type,label,description,confidence,flag?}]`. Timing comes from ffmpeg/spectral-flux
  onsets (`bin/onsets.py`), NOT the model (audio LLMs can't localize). vertex = project
  `momorix`, us-central1, gemini-2.5-flash (env GEMINI_AUDIO_MODEL). clap = zero-shot labels,
  fully offline.
- `transcribe <media> [model]` — WORKING, offline speech via faster-whisper (venv-audio,
  CPU int8, no torch). model tiny|base|small.
- `cymatics <media> [--style chladni|ripple|reactive] [--preset landscape|landscape_hd|portrait|square] [--size WxH] [--fps N]`
  — WORKING, numpy+PIL→ffmpeg. Any aspect ratio (aspect-corrected). chladni = exact nodal
  patterns (understanding aid); ripple/reactive = content visuals.
- `loop <media> --minutes N [--seconds S] [--style] [--preset]` — WORKING. Renders a short
  seed, boomerangs it to a seamless loop, tiles video+audio to N minutes. Render time depends
  on the SEED length, not N — this is how to make hour-long sleep videos without hours of render.
- `doctor` — device-compatibility report + engine routing.

## Install / portability
`./setup.sh` (base + offline speech) · `--vertex` (google-genai) · `--clap` (offline SFX,
pulls PyTorch ~2GB; Intel-mac pins torch 2.2.2 / transformers 4.44.2 / numpy<2). System
python3 needs numpy + pillow for cymatics/onsets. `venv-audio/` and `*.ear/` are gitignored.

## Notes
- Lean: writes only what's asked; the one intermediate (`audio.wav`) is kept for reuse.
- PERF (Intel Mac): cymatics ~5x slower than realtime at 720p — use `loop` for long-form.
- Analysis stays local; the vertex `map` sends audio to the user's own Vertex (their cost, opt-in).
