#!/usr/bin/env python3
"""Render sound as cymatic visuals. numpy + PIL only; frames piped straight to ffmpeg.

Three independent dials:
  --style    the pattern:  ripple | chladni | reactive | waves | mandala | lattice
  --mode     the motion:   calm | flow | pulse | drift  (how it animates)
  --palette  the color:    indigo | ocean | amber | rose | mono | aurora

Extras:
  --freq N   drive the pattern from a FIXED frequency (Hz) instead of following the audio.
  --calm     alias for --mode calm.
"""
import sys, os, wave, argparse, subprocess
import numpy as np

PALETTES = {
    "indigo": ((6, 5, 14), (96, 104, 168)),
    "ocean":  ((3, 9, 13), (38, 110, 120)),
    "amber":  ((10, 6, 3), (150, 96, 40)),
    "rose":   ((12, 4, 10), (150, 70, 95)),
    "mono":   ((6, 6, 8), (175, 180, 190)),
}
DEFAULT_PALETTE = {"chladni": "indigo", "ripple": "ocean", "reactive": "aurora",
                   "waves": "ocean", "mandala": "amber", "lattice": "rose"}

# motion presets: speed, contrast gamma, vignette, freq-morph rate, audio coupling,
#                 flow-warp amplitude, rotation rate (rad/s), zoom-pulse amount
MODES = {
    "calm":  dict(speed=1.0, gamma=1.35, vig=True,  morph=0.06, couple=0.4, warp=0.00, rot=0.00, zpulse=0.00),
    "flow":  dict(speed=1.4, gamma=1.10, vig=True,  morph=0.10, couple=0.5, warp=0.10, rot=0.00, zpulse=0.00),
    "pulse": dict(speed=1.2, gamma=1.00, vig=False, morph=0.15, couple=0.9, warp=0.00, rot=0.00, zpulse=0.14),
    "drift": dict(speed=0.8, gamma=1.25, vig=True,  morph=0.06, couple=0.4, warp=0.03, rot=0.06, zpulse=0.00),
}


def colorize(v, name):
    v = np.clip(v, 0, 1)
    if name == "aurora":
        return np.stack([30*v + 70*v**3, 120*v, 80*v + 90*v**2], -1)
    d, l = PALETTES.get(name, PALETTES["indigo"])
    d = np.array(d, np.float32); l = np.array(l, np.float32)
    return d + (l - d) * v[..., None]


def read_wav_mono(path):
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
    return a, sr


def frame_fft(a, sr, center, N=4096):
    half = N // 2
    lo, hi = center - half, center + half
    seg = np.zeros(N, np.float32)
    s0, s1 = max(0, lo), min(len(a), hi)
    if s1 > s0:
        seg[s0 - lo: s0 - lo + (s1 - s0)] = a[s0:s1]
    seg *= np.hanning(N)
    mag = np.abs(np.fft.rfft(seg))
    freqs = np.fft.rfftfreq(N, 1.0 / sr)
    return freqs, mag


def f_to_mode(f, fmin=45.0, fmax=4000.0, maxk=9):
    f = max(fmin, min(fmax, f))
    k = np.log2(f / fmin) / np.log2(fmax / fmin)
    kk = 1 + k * (maxk - 1)
    n = int(round(kk)) + 1
    m = int(round(kk * 1.7)) + 1
    if m == n:
        m += 1
    return m, n


def render(style, wav, out, W, H, fps, mode="calm", palette=None, fixed_freq=None):
    M = MODES[mode]
    palette = palette or DEFAULT_PALETTE[style]
    a, sr = read_wav_mono(wav)
    dur = len(a) / sr
    nframes = max(1, int(dur * fps))
    xs = np.linspace(0, 1, W, dtype=np.float32)
    ys = np.linspace(0, 1, H, dtype=np.float32)
    X, Y = np.meshgrid(xs, ys)
    aspect = W / H
    Xc, Yc = (X - 0.5) * aspect, (Y - 0.5)
    Rbase = np.sqrt(Xc ** 2 + Yc ** 2)
    vig = np.clip(1.18 - 1.05 * Rbase, 0.12, 1.0)
    sp = M["speed"]

    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error",
         "-f", "rawvideo", "-pixel_format", "rgb24",
         "-video_size", f"{W}x{H}", "-framerate", str(fps), "-i", "-",
         "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-shortest", out],
        stdin=subprocess.PIPE)

    env_s = 0.0
    domf_s = 0.0
    for i in range(nframes):
        t = i / fps
        c = int(t * sr)
        freqs, mag = frame_fft(a, sr, c)
        e = float(mag.sum())
        env_s = max(e, env_s * 0.92)
        env = 0.0 if env_s < 1e-6 else min(1.0, e / (env_s + 1e-9))
        raw_domf = fixed_freq if fixed_freq else (float(freqs[mag.argmax()]) if mag.max() > 0 else 0.0)
        domf_s = raw_domf if i == 0 else (1 - M["morph"]) * domf_s + M["morph"] * raw_domf
        dfreq = domf_s

        # --- mode coordinate transform (rotation, flow-warp, zoom-pulse) ---
        rot = M["rot"] * t
        cr, srr = np.cos(rot), np.sin(rot)
        Xr = Xc * cr - Yc * srr
        Yr = Xc * srr + Yc * cr
        if M["warp"]:
            Xr = Xr + M["warp"] * np.sin(2.0 * Yc + t * 0.7 * sp)
            Yr = Yr + M["warp"] * np.cos(2.0 * Xc + t * 0.6 * sp)
        if M["zpulse"]:
            z = 1.0 + M["zpulse"] * env
            Xr, Yr = Xr / z, Yr / z
        Rw = np.sqrt(Xr ** 2 + Yr ** 2)
        THw = np.arctan2(Yr, Xr)
        px, py = Xr + aspect / 2, Yr + 0.5           # chladni plate coords
        cE = 1.0 - M["couple"] + M["couple"] * env   # audio coupling (1.0 when steady)

        if style == "ripple":
            k = 3 + f_to_mode(dfreq)[1] * 1.1
            v = 0.5 + 0.5 * np.sin(2 * np.pi * (k * Rw) - t * sp) * cE
        elif style == "chladni":
            m, n = f_to_mode(dfreq)
            zz = (np.cos(n*np.pi*px)*np.cos(m*np.pi*py) - np.cos(m*np.pi*px)*np.cos(n*np.pi*py))
            v = np.exp(-(zz*zz) / (2 * 0.11**2)) * (0.3 + 0.7 * env)
        elif style == "waves":
            kw = 4 + f_to_mode(dfreq)[1] * 0.7          # frequency sets wave count
            v = 0.5 + 0.5 * cE * (np.sin(kw*Xr + t*0.6*sp) + np.sin(kw*Yr - t*0.5*sp)
                                  + np.sin(kw*Rw - t*0.4*sp)) / 3.0
        elif style == "mandala":
            N = 6
            ph = np.abs(np.mod(THw * N / np.pi, 2.0) - 1.0)
            k = 5 + f_to_mode(dfreq)[1] * 0.6
            v = (0.5 + 0.5 * np.sin(2*np.pi*(k*Rw) - t*sp + ph*3.0)) * np.clip(1 - Rw, 0, 1)
        elif style == "lattice":
            th = 0.35 + 0.15 * np.sin(t * 0.2 * sp)
            p = 9 + f_to_mode(dfreq)[1] * 1.2           # frequency sets grid pitch
            v = 0.5 + 0.5 * cE * np.sin(p*(Xr*np.cos(th) - Yr*np.sin(th))) * np.sin(p*(Xr*np.sin(th) + Yr*np.cos(th)))
        else:  # reactive
            nb = 96
            bmag = mag[:nb] / (mag[:nb].max() + 1e-9)
            ang = ((THw + np.pi) / (2*np.pi) * nb).astype(np.int32) % nb
            amp = bmag[ang] * (0.15 + 0.6*env)
            v = np.clip(1 - np.abs(Rw - amp)/0.03, 0, 1) * (Rw < amp)

        v = np.clip(v, 0, 1) ** M["gamma"]
        rgb = colorize(v, palette)
        if M["vig"]:
            rgb = rgb * vig[..., None]
        if M["zpulse"] or mode == "pulse":
            rgb = rgb * (0.85 + 0.15 * env)
        ff.stdin.write(np.clip(rgb, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav"); ap.add_argument("out")
    ap.add_argument("--style", default="ripple",
                    choices=["ripple", "chladni", "reactive", "waves", "mandala", "lattice"])
    ap.add_argument("--mode", default="calm", choices=list(MODES))
    ap.add_argument("--calm", action="store_true", help="alias for --mode calm")
    ap.add_argument("--palette", default="", choices=["", "indigo", "ocean", "amber", "rose", "mono", "aurora"])
    ap.add_argument("--freq", type=float, default=0.0, help="drive pattern from a fixed Hz, ignore audio pitch")
    ap.add_argument("--size", default="")
    ap.add_argument("--preset", default="square",
                    choices=["square", "landscape", "landscape_hd", "portrait"])
    ap.add_argument("--fps", type=int, default=24)
    args = ap.parse_args()
    presets = {"square": "720x720", "landscape": "1280x720",
               "landscape_hd": "1920x1080", "portrait": "720x1280"}
    W, H = (int(x) for x in (args.size or presets[args.preset]).lower().split("x"))
    mode = "calm" if args.calm else args.mode
    out = render(args.style, args.wav, args.out, W, H, args.fps, mode=mode,
                 palette=(args.palette or None), fixed_freq=(args.freq or None))
    print(out)


if __name__ == "__main__":
    main()
