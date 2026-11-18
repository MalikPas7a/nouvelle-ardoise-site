#!/usr/bin/env bash
# Device-aware installer for sound-ear.
#   ./setup.sh            -> base + offline speech (faster-whisper). light, always safe.
#   ./setup.sh --clap     -> also offline SFX labeling (CLAP): pulls PyTorch (~2GB).
#   ./setup.sh --vertex   -> also install google-genai for the cloud 'map' engine.
# Picks torch/transformers versions to match the platform (Intel macOS is capped at torch 2.2).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
VENV="$DIR/venv-audio"
OS="$(uname -s)"; ARCH="$(uname -m)"

WITH_CLAP=0; WITH_VERTEX=0
for a in "$@"; do
  [ "$a" = "--clap" ] && WITH_CLAP=1
  [ "$a" = "--vertex" ] && WITH_VERTEX=1
done

echo "sound-ear setup on $OS/$ARCH"

# --- base checks (system python drives see/cymatics/onsets/loop) ---
command -v ffmpeg >/dev/null 2>&1 || echo "  WARN: ffmpeg not found — required for see/cymatics/loop/map."
python3 -c "import numpy, PIL" 2>/dev/null || echo "  WARN: system python3 needs numpy + pillow (pip install numpy pillow) for cymatics/onsets."

# --- pick a 3.10-3.12 interpreter for the ML venv ---
PYBIN=""
for p in python3.11 python3.12 python3.10 python3.13 python3; do
  command -v "$p" >/dev/null 2>&1 && { PYBIN="$p"; break; }
done
[ -n "$PYBIN" ] || { echo "  ERROR: no python3 found"; exit 1; }
echo "  venv interpreter: $PYBIN ($($PYBIN --version 2>&1))"

$PYBIN -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip

# --- offline speech (light, no torch) ---
echo "  installing faster-whisper (offline speech)..."
"$VENV/bin/pip" install -q faster-whisper

# --- optional cloud map engine ---
if [ "$WITH_VERTEX" = 1 ]; then
  echo "  installing google-genai (Vertex 'map' engine)..."
  "$VENV/bin/pip" install -q google-genai
  echo "  NOTE: also run 'gcloud auth application-default login' and set GOOGLE_CLOUD_PROJECT."
fi

# --- optional offline SFX labeling (heavy) ---
if [ "$WITH_CLAP" = 1 ]; then
  echo "  installing CLAP stack (PyTorch — large)..."
  if [ "$OS" = "Darwin" ] && [ "$ARCH" = "x86_64" ]; then
    "$VENV/bin/pip" install -q "torch==2.2.2" "transformers==4.44.2" "numpy<2"   # Intel-mac ceiling
  else
    "$VENV/bin/pip" install -q torch transformers "numpy<2"
  fi
fi

echo
bash "$DIR/bin/detect.sh"
