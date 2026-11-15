#!/usr/bin/env bash
# Device-compatibility detector for sound-ear. Prints what's available on THIS machine
# and which engine each capability will use. Sourced by hear.sh (KEY=VAL) and shown by `doctor`.
set -uo pipefail
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PY="$HOME/Downloads/lwl_pipeline/venv/bin/python3"
AUDIO_VENV="$HOME/.claude/skills/sound-ear/venv-audio/bin/python"
ADC="$HOME/.config/gcloud/application_default_credentials.json"

have() { command -v "$1" >/dev/null 2>&1 && echo 1 || echo 0; }
pyhas() { "$1" -c "import $2" 2>/dev/null && echo 1 || echo 0; }

OS="$(uname -s)"; ARCH="$(uname -m)"
SILICON=0; [ "$OS" = "Darwin" ] && [ "$ARCH" = "arm64" ] && SILICON=1
if [ "$OS" = "Darwin" ]; then RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ));
else RAM_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1048576 )); fi
CUDA=0; command -v nvidia-smi >/dev/null 2>&1 && CUDA=1

FFMPEG=$(have ffmpeg)
NUMPY=0; PIL=0
if [ "$(have python3)" = 1 ]; then NUMPY=$(pyhas python3 numpy); PIL=$(pyhas python3 PIL); fi
WHISPER=0; [ -x "$AUDIO_VENV" ] && WHISPER=$(pyhas "$AUDIO_VENV" faster_whisper)
CLAP=0; [ -x "$AUDIO_VENV" ] && CLAP=$("$AUDIO_VENV" -c "import torch,transformers" 2>/dev/null && echo 1 || echo 0)
GENAI=0; [ -x "$VENV_PY" ] && GENAI=$(pyhas "$VENV_PY" google.genai)
ADC_OK=0; [ -f "$ADC" ] && ADC_OK=1
VERTEX=0; [ "$GENAI" = 1 ] && [ "$ADC_OK" = 1 ] && VERTEX=1

# Routing decisions
SEE_OK=$([ "$FFMPEG" = 1 ] && echo 1 || echo 0)
CYMATICS_OK=$([ "$FFMPEG" = 1 ] && [ "$NUMPY" = 1 ] && [ "$PIL" = 1 ] && echo 1 || echo 0)
if   [ "$VERTEX" = 1 ]; then MAP_ENGINE=vertex
elif [ "$CLAP" = 1 ];   then MAP_ENGINE=clap
else MAP_ENGINE=none; fi

if [ "${1:-}" = "--kv" ]; then
  cat <<EOF
OS=$OS
ARCH=$ARCH
SILICON=$SILICON
RAM_GB=$RAM_GB
CUDA=$CUDA
FFMPEG=$FFMPEG
NUMPY=$NUMPY
PIL=$PIL
WHISPER=$WHISPER
CLAP=$CLAP
GENAI=$GENAI
ADC=$ADC_OK
VERTEX=$VERTEX
SEE_OK=$SEE_OK
CYMATICS_OK=$CYMATICS_OK
MAP_ENGINE=$MAP_ENGINE
EOF
  exit 0
fi

yn() { [ "$1" = 1 ] && echo "yes" || echo "no"; }
echo "sound-ear — device compatibility"
echo "  device:    $OS/$ARCH  ($([ $SILICON = 1 ] && echo 'Apple Silicon' || echo 'Intel/other')), ${RAM_GB}GB RAM, CUDA GPU: $(yn $CUDA)"
echo
echo "  Subcommand availability on this machine:"
echo "    see        $(yn $SEE_OK)   (spectrogram/waveform/report — needs ffmpeg)"
echo "    cymatics   $(yn $CYMATICS_OK)   (visuals — needs ffmpeg + numpy + PIL)"
echo "    loop       $(yn $CYMATICS_OK)   (long-form seamless loop — same as cymatics)"
echo "    transcribe $(yn $WHISPER)   (offline speech — faster-whisper venv)"
echo "    map        $([ $MAP_ENGINE != none ] && echo yes || echo no)   (semantic sound map — engine: $MAP_ENGINE)"
echo
echo "  Semantic 'map' engine routing (auto picks the first available):"
echo "    1. vertex  $(yn $VERTEX)   (Gemini on your GCP — best quality; needs google-genai + ADC)"
echo "    2. clap    $(yn $CLAP)   (offline CLAP labels — needs torch+transformers in venv-audio)"
echo "    -> selected: $MAP_ENGINE"
[ "$SILICON" = 0 ] && [ "$OS" = "Darwin" ] && echo "
  note: Intel Mac — no MLX/GPU; heavy local models are slow. Cloud 'vertex' preferred."
