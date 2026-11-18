#!/usr/bin/env python3
"""Offline SFX labeling with CLAP (zero-shot audio<->text). No network at inference
(after the one-time model download). Labels each onset window against a candidate set.
Same output schema as sound_map.py so it's a drop-in offline engine for `map`.
"""
import sys, os, json, wave, argparse, warnings
warnings.filterwarnings("ignore")
import numpy as np

LABELS = {
    "whoosh": "sfx", "impact boom": "sfx", "riser": "sfx", "click": "sfx", "ding": "sfx",
    "bell": "sfx", "squeak": "sfx", "thump": "sfx", "honk": "sfx", "boing": "sfx",
    "beep": "sfx", "glass shattering": "sfx", "door slam": "sfx", "footsteps": "sfx",
    "applause": "sfx", "explosion": "sfx", "engine": "sfx", "typing": "sfx",
    "wind": "ambience", "rain": "ambience", "ocean waves": "ambience",
    "water flowing": "ambience", "fire crackling": "ambience", "birdsong": "ambience",
    "crickets": "ambience", "thunder": "ambience",
    "music": "music", "singing": "music", "speech": "speech", "silence": "ambience",
}


def read_wav(path, target=48000):
    w = wave.open(path, "rb")
    sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
    raw = w.readframes(n); w.close()
    dt = {1: np.uint8, 2: np.int16, 4: np.int32}[sw]
    a = np.frombuffer(raw, dtype=dt).astype(np.float32)
    if sw == 1:
        a -= 128
    if ch > 1:
        a = a.reshape(-1, ch).mean(1)
    a /= (np.abs(a).max() + 1e-9)
    if sr != target:                              # linear resample to CLAP's 48k
        idx = np.linspace(0, len(a) - 1, int(len(a) * target / sr))
        a = np.interp(idx, np.arange(len(a)), a).astype(np.float32)
    return a, target


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio"); ap.add_argument("out")
    ap.add_argument("--segments", default="")
    ap.add_argument("--model", default=os.environ.get("CLAP_MODEL", "laion/clap-htsat-unfused"))
    args = ap.parse_args()

    import torch
    from transformers import ClapModel, ClapProcessor
    model = ClapModel.from_pretrained(args.model).eval()
    proc = ClapProcessor.from_pretrained(args.model)

    a, sr = read_wav(args.audio)
    dur = len(a) / sr
    if args.segments:
        wins = []
        for part in args.segments.split(","):
            t0, t1 = part.split("-"); wins.append((float(t0), float(t1)))
    else:
        wins = [(i, min(dur, i + 2.0)) for i in np.arange(0, dur, 2.0)]

    names = list(LABELS.keys())
    with torch.no_grad():
        tin = proc(text=names, return_tensors="pt", padding=True)
        temb = torch.nn.functional.normalize(model.get_text_features(**tin), dim=-1)

    events = []
    for (t0, t1) in wins:
        s0, s1 = int(t0 * sr), int(min(dur, t1) * sr)
        if s1 - s0 < int(0.05 * sr):
            continue
        clip = a[s0:s1]
        with torch.no_grad():
            ain = proc(audios=[clip], sampling_rate=sr, return_tensors="pt")
            aemb = torch.nn.functional.normalize(model.get_audio_features(**ain), dim=-1)
            sims = (aemb @ temb.T).squeeze(0)
            top = int(sims.argmax()); conf = float(sims[top])   # raw cosine similarity
        label = names[top]
        events.append({"t0": round(t0, 2), "t1": round(t1, 2), "type": LABELS[label],
                       "label": label, "description": f"CLAP zero-shot match: {label}",
                       "confidence": round(conf, 3)})

    json.dump(events, open(args.out, "w"), indent=2)
    print(args.out)
    for e in events:
        print(f"  {e['t0']}-{e['t1']}s  {e['type']:9} {e['label']} ({e['confidence']})")


if __name__ == "__main__":
    main()
