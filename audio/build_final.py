"""Final soundtrack: the 1.2 s ФКР card (soft chord on the logo, a whoosh into the lit window,
a warm low bloom as it opens onto the night) followed by the v5 score.
Run after build_v5.py:  .venv/bin/python audio/build_final.py"""
import os
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
import design as D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
INTRO = 1.2  # keep equal to INTRO in src/v3/Intro.tsx

film, sr = sf.read(os.path.join(ROOT, "public/audio/v5/soundtrack.wav"))
assert sr == SR
out = np.zeros((len(film) + int(INTRO * SR), 2))
out[int(INTRO * SR):] += film


def add(x, at, g):
    if x.ndim == 1:
        x = D.st(x)
    i = int(round(at * SR))
    j = min(i + len(x), len(out))
    out[i:j] += x[: j - i] * g


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def soft_chord(notes, d=2.6):
    """Airy F-major shimmer: sines with a slow bloom, into the hall."""
    t = np.arange(int(d * SR)) / SR
    y = sum(np.sin(2 * np.pi * hz(m) * t) * (0.7 ** k) for k, m in enumerate(notes))
    y = y * np.minimum(1, t / 0.18) * np.exp(-t * 1.6)
    return D.verb(D.st(y / len(notes)), 0.45)


add(soft_chord([77, 81, 84, 88]), 0.0, 0.45)                         # the card
add(D.glass_ping(89, 0.7, 1.8), 0.06, 0.16)                          # a glint on the windows
add(D.tonal_whoosh(0.75, 300, 5200, -0.3, 0.3, tone_midi=77, q=4), 0.66, 0.6)  # into the window
bloom = D.sub_drop(1.4, 62, 30)
bloom *= np.clip((0.42 - np.arange(len(bloom)) / SR) / 0.2, 0, 1)  # gone before the film's first slam
add(bloom, 1.24, 0.32)                                               # warm light opens onto the night
add(D.air_tail(1.6, 1800), 1.24, 0.05)

meter = pyln.Meter(SR)
peak = float(np.abs(out).max())
if peak > 0.88:
    out *= 0.88 / peak
print("LUFS", round(meter.integrated_loudness(out), 2), "peak", round(float(np.abs(out).max()), 3), "dur", round(len(out) / SR, 3))
os.makedirs(os.path.join(ROOT, "public/audio/final"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/final/soundtrack.wav"), out.astype(np.float32), SR, subtype="PCM_24")
print("ok")
