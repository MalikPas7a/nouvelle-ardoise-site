#!/usr/bin/env python3
"""Spectral-flux onset detection (numpy only). Finds where sounds START even in
continuous audio with no silences (where silencedetect finds nothing). Prints onset
windows as 't0-t1,t0-t1,...' for the map pass to anchor Gemini's timing.
"""
import sys, wave, argparse
import numpy as np


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


def onsets(a, sr, win=1024, hop=512, max_events=40):
    w = np.hanning(win).astype(np.float32)
    nfr = 1 + (len(a) - win) // hop if len(a) >= win else 0
    if nfr <= 2:
        return []
    mags = np.empty((nfr, win // 2 + 1), np.float32)
    for i in range(nfr):
        seg = a[i*hop:i*hop+win] * w
        mags[i] = np.abs(np.fft.rfft(seg))
    # spectral flux = sum of positive frame-to-frame magnitude increases
    flux = np.maximum(0.0, np.diff(mags, axis=0)).sum(axis=1)
    if flux.max() > 0:
        flux /= flux.max()
    # adaptive threshold: local mean + margin
    k = 8
    thr = np.array([flux[max(0, i-k):i+k+1].mean() for i in range(len(flux))]) + 0.08
    times = (np.arange(len(flux)) * hop + win / 2) / sr
    peaks = []
    last = -1.0
    for i in range(1, len(flux) - 1):
        if flux[i] > thr[i] and flux[i] >= flux[i-1] and flux[i] > flux[i+1]:
            if times[i] - last >= 0.12:            # min 120ms apart
                peaks.append((flux[i], times[i]))
                last = times[i]
    # keep the strongest, then re-sort by time
    peaks.sort(reverse=True)
    peaks = sorted(t for _, t in peaks[:max_events])
    dur = len(a) / sr
    wins = []
    for j, t in enumerate(peaks):
        end = peaks[j+1] if j+1 < len(peaks) else dur
        wins.append((round(t, 2), round(min(end, t + 2.0), 2)))   # cap window at 2s
    return wins


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("--max", type=int, default=40)
    args = ap.parse_args()
    a, sr = read_wav_mono(args.wav)
    wins = onsets(a, sr, max_events=args.max)
    print(",".join(f"{a0}-{b0}" for a0, b0 in wins))


if __name__ == "__main__":
    main()
