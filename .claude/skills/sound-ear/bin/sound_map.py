#!/usr/bin/env python3
"""Semantic sound map via Gemini on the user's own Vertex project.

Sends the audio to Gemini and asks for every sound event as structured JSON.
Run with a Python that has google-genai (the lwl_pipeline venv does). Uses ADC.
"""
import sys, os, json, argparse, re

PROMPT_BASE = """You are an audio analyst for video post-production. Return ONLY a JSON
array (no prose, no code fences). One object per distinct sound event:
{"t0": <start s>, "t1": <end s>, "type": "speech|sfx|music|ambience",
 "label": "<short name, e.g. 'whoosh', 'impact boom', 'birdsong'>",
 "description": "<one sentence: what it sounds like and its character>",
 "confidence": <0-1>}
Order by t0. Flag anything that sounds abrupt, clipped, mistimed, or tonally out of place
by adding "flag": "<why>" to that object."""

SEG_NOTE = """
The audio has measured sound at these exact time windows (seconds): {segs}
Use THESE timestamps for t0/t1 — do not invent your own timing. Identify the sound in
each window. If a window holds several distinct sounds, you may split it, but stay inside
the given bounds."""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("out")
    ap.add_argument("--model", default=os.environ.get("GEMINI_AUDIO_MODEL", "gemini-2.5-flash"))
    ap.add_argument("--project", default=os.environ.get("GOOGLE_CLOUD_PROJECT", "momorix"))
    ap.add_argument("--location", default=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"))
    ap.add_argument("--segments", default="")
    args = ap.parse_args()

    from google import genai
    from google.genai import types

    prompt = PROMPT_BASE + (SEG_NOTE.format(segs=args.segments) if args.segments else "")

    client = genai.Client(vertexai=True, project=args.project, location=args.location)
    mime = "audio/wav" if args.audio.lower().endswith(".wav") else "audio/mpeg"
    data = open(args.audio, "rb").read()

    resp = client.models.generate_content(
        model=args.model,
        contents=[types.Part.from_bytes(data=data, mime_type=mime), prompt],
        config=types.GenerateContentConfig(temperature=0.2, response_mime_type="application/json"),
    )
    text = (resp.text or "").strip()
    text = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        events = json.loads(text)
    except Exception:
        json.dump({"raw": text}, open(args.out, "w"), indent=2)
        print(f"WARN: model did not return clean JSON; raw saved to {args.out}", file=sys.stderr)
        return
    json.dump(events, open(args.out, "w"), indent=2)
    print(args.out)
    for e in (events if isinstance(events, list) else []):
        flag = f"  [FLAG: {e['flag']}]" if isinstance(e, dict) and e.get("flag") else ""
        if isinstance(e, dict):
            print(f"  {e.get('t0','?')}-{e.get('t1','?')}s  {e.get('type','?'):9} {e.get('label','')}{flag}")


if __name__ == "__main__":
    main()
