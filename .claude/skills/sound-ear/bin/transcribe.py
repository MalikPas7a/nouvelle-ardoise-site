#!/usr/bin/env python3
"""Offline speech transcription via faster-whisper (CPU, int8, no PyTorch).
The offline fallback for the SPEECH side of understanding — runs with no network,
no Vertex, no cost. First run downloads the model (~150MB for 'base')."""
import sys, json, argparse, os

# Intel macOS: ctranslate2 and numpy each ship their own libiomp5, and the second
# one to load aborts the process ("OMP: Error #15 ... Abort trap: 6"). Must be set
# before faster_whisper imports.
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("out")
    ap.add_argument("--model", default="base", help="tiny|base|small (bigger = slower/better)")
    args = ap.parse_args()

    from faster_whisper import WhisperModel
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(args.audio, vad_filter=True)

    out = []
    for s in segments:
        out.append({"t0": round(s.start, 2), "t1": round(s.end, 2),
                    "type": "speech", "text": s.text.strip()})
    json.dump({"language": info.language, "segments": out}, open(args.out, "w"), indent=2)
    print(args.out)
    if not out:
        print("  (no speech detected)")
    for e in out:
        print(f"  {e['t0']}-{e['t1']}s  {e['text']}")


if __name__ == "__main__":
    main()
