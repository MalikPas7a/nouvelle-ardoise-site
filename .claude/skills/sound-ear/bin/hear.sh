#!/usr/bin/env bash
# sound-ear: give Claude eyes+ears on audio.
# Subcommands:
#   see <media> [outdir]   -> analytical visuals + objective report (ffmpeg only, no ML deps)
#   cymatics <media> ...   -> (phase 2) render Chladni/ripple/reactive visualization
#   map <media> ...        -> (phase 2) Vertex Gemini semantic sound map
set -euo pipefail

cmd="${1:-}"; shift || true

die(){ echo "sound-ear: $*" >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || die "missing dependency: $1"; }

see() {
  local media="${1:-}"; [ -n "$media" ] || die "usage: hear.sh see <media> [outdir]"
  [ -f "$media" ] || die "no such file: $media"
  need ffmpeg; need ffprobe
  local base outdir
  base="$(basename "$media")"; base="${base%.*}"
  outdir="${2:-$(dirname "$media")/${base}.ear}"
  mkdir -p "$outdir"
  local wav="$outdir/audio.wav"

  # 1. Extract normalized mono audio for analysis
  ffmpeg -y -v error -i "$media" -vn -ac 1 -ar 48000 "$wav"

  # 2. Objective facts
  local dur
  dur="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$wav" 2>/dev/null || echo '?')"

  # Loudness (integrated LUFS + true peak) via ebur128 summary
  local ebur
  ebur="$(ffmpeg -hide_banner -nostats -i "$wav" -af ebur128=peak=true -f null - 2>&1 | \
          awk '/Integrated loudness/{f=1} f' | grep -E 'I:|Threshold:|LRA:|Peak:' | sed 's/^ *//' || true)"

  # Silence gaps
  local silence
  silence="$(ffmpeg -hide_banner -nostats -i "$wav" -af silencedetect=n=-30dB:d=0.35 -f null - 2>&1 | \
             grep -E 'silence_(start|end)' | sed 's/.*\] //' || true)"

  # Scene cuts (only if the source carries video) -> timeline to align SFX against
  local scenes=""
  if ffprobe -v error -select_streams v:0 -show_entries stream=codec_type -of csv=p=0 "$media" 2>/dev/null | grep -q video; then
    scenes="$(ffmpeg -hide_banner -nostats -i "$media" -filter:v "select='gt(scene,0.4)',showinfo" -f null - 2>&1 | \
              grep -oE 'pts_time:[0-9.]+' | sed 's/pts_time:/cut @ /;s/$/s/' || true)"
  fi

  # 3. Visuals I can actually read
  ffmpeg -y -v error -i "$wav" \
    -filter_complex "showwavespic=s=1600x320:colors=0x38bdf8" -frames:v 1 "$outdir/waveform.png"
  ffmpeg -y -v error -i "$wav" \
    -lavfi "showspectrumpic=s=1400x700:mode=combined:color=intensity:scale=log:fscale=log:legend=1" \
    "$outdir/spectrogram.png"

  # 4. Report
  {
    echo "# sound-ear report: $base"
    echo
    echo "- source: $media"
    echo "- duration: ${dur}s"
    echo
    echo "## Loudness (EBU R128)"
    echo '```'; echo "${ebur:-(none)}"; echo '```'
    echo "## Silence (< -30dB for >=0.35s)"
    echo '```'; echo "${silence:-none detected}"; echo '```'
    if [ -n "$scenes" ]; then
      echo "## Scene cuts (align SFX to these)"
      echo '```'; echo "$scenes"; echo '```'
    fi
    echo "## Visuals"
    echo "- waveform.png (amplitude over time)"
    echo "- spectrogram.png (log-frequency energy over time; read SFX shapes + timing here)"
  } > "$outdir/report.md"

  echo "$outdir"
}

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PY="$HOME/Downloads/lwl_pipeline/venv/bin/python3"   # has google-genai + Vertex ADC

extract_wav() { # $1 media, $2 target wav, $3 samplerate
  ffmpeg -y -v error -i "$1" -vn -ac 1 -ar "${3:-48000}" "$2"
}

cymatics() {
  local media="${1:-}"; [ -n "$media" ] || die "usage: hear.sh cymatics <media> [--style chladni|ripple|reactive] [--size WxH] [--fps N]"
  [ -f "$media" ] || die "no such file: $media"
  need ffmpeg
  shift
  local base outdir; base="$(basename "$media")"; base="${base%.*}"
  outdir="$(dirname "$media")/${base}.ear"; mkdir -p "$outdir"
  local wav="$outdir/audio.wav"; [ -f "$wav" ] || extract_wav "$media" "$wav" 48000
  # parse style for output name
  local style="chladni"; local a=("$@"); local i
  for ((i=0;i<${#a[@]};i++)); do [ "${a[$i]}" = "--style" ] && style="${a[$((i+1))]}"; done
  local out="$outdir/cymatics_${style}.mp4"
  python3 "$SKILL_DIR/cymatics.py" "$wav" "$out" "$@"
}

map() {
  local media="${1:-}"; [ -n "$media" ] || die "usage: hear.sh map <media> [--engine auto|vertex|clap]"
  [ -f "$media" ] || die "no such file: $media"
  shift
  local engine=auto
  while [ $# -gt 0 ]; do case "$1" in --engine) engine="$2"; shift 2;; *) shift;; esac; done
  need ffmpeg
  # Device-compatibility routing: pick engine available on THIS machine.
  local picked; picked="$(bash "$SKILL_DIR/detect.sh" --kv | grep '^MAP_ENGINE=' | cut -d= -f2)"
  [ "$engine" = auto ] && engine="$picked"
  [ "$engine" = none ] && die "no semantic 'map' engine on this device. Use 'see' (visual) or 'transcribe' (speech). Run 'hear.sh doctor'."
  echo "map engine: $engine" >&2
  local base outdir; base="$(basename "$media")"; base="${base%.*}"
  outdir="$(dirname "$media")/${base}.ear"; mkdir -p "$outdir"
  local sr=16000; [ "$engine" = clap ] && sr=48000   # CLAP needs 48k; Gemini downsamples anyway
  local small="$outdir/audio_map.wav"; extract_wav "$media" "$small" "$sr"
  # Precise onset windows (Gemini can't localize; we hand it the timing).
  # Spectral-flux onsets work for dense/continuous audio; silence gaps as fallback.
  local seg
  seg="$(python3 "$SKILL_DIR/onsets.py" "$small" 2>/dev/null || true)"
  if [ -z "$seg" ]; then
    seg="$(ffmpeg -hide_banner -nostats -i "$small" -af silencedetect=n=-30dB:d=0.2 -f null - 2>&1 \
      | grep -oE 'silence_(start|end): [0-9.]+' \
      | python3 -c '
import sys
starts=[]; ends=[]
for ln in sys.stdin:
    k,v=ln.split(":"); v=float(v)
    (starts if "start" in k else ends).append(v)
wins=[(e,min([s for s in starts if s>e])) for e in ends if [s for s in starts if s>e]]
print(",".join(f"{a:.2f}-{b:.2f}" for a,b in wins))' 2>/dev/null || true)"
  fi
  if [ "$engine" = vertex ]; then
    "$VENV_PY" "$SKILL_DIR/sound_map.py" "$small" "$outdir/sound_map.json" ${seg:+--segments "$seg"}
  else  # clap (offline)
    "$AUDIO_VENV" "$SKILL_DIR/clap_label.py" "$small" "$outdir/sound_map.json" ${seg:+--segments "$seg"}
  fi
  rm -f "$small"
}

AUDIO_VENV="$HOME/.claude/skills/sound-ear/venv-audio/bin/python"  # faster-whisper (offline)

transcribe() {
  local media="${1:-}"; [ -n "$media" ] || die "usage: hear.sh transcribe <media> [model]"
  [ -f "$media" ] || die "no such file: $media"
  [ -x "$AUDIO_VENV" ] || die "offline venv missing (run the venv-audio setup)"
  need ffmpeg
  local base outdir; base="$(basename "$media")"; base="${base%.*}"
  outdir="$(dirname "$media")/${base}.ear"; mkdir -p "$outdir"
  local w="$outdir/audio16k.wav"; extract_wav "$media" "$w" 16000
  "$AUDIO_VENV" "$SKILL_DIR/transcribe.py" "$w" "$outdir/transcript.json" ${2:+--model "$2"}
  rm -f "$w"
}

loop() {
  # Long-form sleep/ambient without rendering the whole hour.
  # Render a short seamless (boomerang) cymatics loop, then tile video + audio to --minutes.
  local media="${1:-}"; [ -n "$media" ] || die "usage: hear.sh loop <audio_or_video> --minutes N [--seconds S] [--style ripple] [--preset landscape]"
  [ -f "$media" ] || die "no such file: $media"
  need ffmpeg
  shift
  local minutes=60 seconds=20 style=ripple preset=landscape size="" fps=24 calm="" palette="" mode="" freq=""
  while [ $# -gt 0 ]; do case "$1" in
    --minutes) minutes="$2"; shift 2;;
    --seconds) seconds="$2"; shift 2;;
    --style) style="$2"; shift 2;;
    --preset) preset="$2"; shift 2;;
    --size) size="$2"; shift 2;;
    --fps) fps="$2"; shift 2;;
    --calm) calm="--calm"; shift;;
    --mode) mode="$2"; shift 2;;
    --palette) palette="$2"; shift 2;;
    --freq) freq="$2"; shift 2;;
    *) die "loop: unknown opt $1";; esac; done

  local base outdir; base="$(basename "$media")"; base="${base%.*}"
  outdir="$(dirname "$media")/${base}.ear"; mkdir -p "$outdir"
  local tmp="$outdir/_loop"; mkdir -p "$tmp"

  # 1. seed audio = first S seconds (representative), rendered to a cymatics clip
  local seed="$tmp/seed.wav"
  ffmpeg -y -v error -ss 0 -t "$seconds" -i "$media" -vn -ac 1 -ar 48000 "$seed"
  local clip="$tmp/clip.mp4"
  python3 "$SKILL_DIR/cymatics.py" "$seed" "$clip" --style "$style" --preset "$preset" ${size:+--size "$size"} --fps "$fps" $calm ${mode:+--mode "$mode"} ${palette:+--palette "$palette"} ${freq:+--freq "$freq"} >/dev/null

  # 2. boomerang (forward + reverse) => perfectly seamless 2S loop, video only
  local boom="$tmp/boom.mp4"
  ffmpeg -y -v error -i "$clip" -filter_complex \
    "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]" -map "[v]" -an "$boom"

  # 3. tile to N minutes WITHOUT re-encoding the video (stream copy = fast, cost independent of N)
  local secs=$(( minutes * 60 ))
  local out="$outdir/loop_${style}_${preset}_${minutes}min.mp4"
  ffmpeg -y -v error -stream_loop -1 -i "$boom" -t "$secs" -c copy "$tmp/vloop.mp4"
  ffmpeg -y -v error -stream_loop -1 -i "$media" -t "$secs" -c:a aac -b:a 160k -vn "$tmp/aloop.m4a"
  ffmpeg -y -v error -i "$tmp/vloop.mp4" -i "$tmp/aloop.m4a" -map 0:v -map 1:a -c copy -shortest "$out"
  rm -rf "$tmp"
  echo "$out"
}

doctor() {
  # Report device capabilities and which engines are available (compatibility routing).
  "$SKILL_DIR/detect.sh"
}

case "$cmd" in
  see) see "$@";;
  cymatics) cymatics "$@";;
  map) map "$@";;
  transcribe) transcribe "$@";;
  loop) loop "$@";;
  doctor|caps) doctor;;
  ""|-h|--help) echo "usage: hear.sh {see|map|transcribe|cymatics|loop|doctor} <media> [opts]";;
  *) die "unknown subcommand: $cmd";;
esac
