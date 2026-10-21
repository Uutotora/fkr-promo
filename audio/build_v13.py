"""v13 soundtrack: five act themes cut to the picture on their bar grids, plus
sound effects on every move of the film. All times are film seconds and follow
src/v13/film/T.ts and Scenes2.tsx; sources live in ИИ_промо/v13/{music,sfx}.

usage: .venv/bin/python -I audio/build_v13.py  →  public/audio/v13/soundtrack.wav
"""
import os
import subprocess

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 268.0
N = int(DUR * SR)
FF = "/opt/homebrew/bin/ffmpeg"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(ROOT), "ИИ_промо", "v13")  # sits next to this project, here and in the exported copy
OUT = os.path.join(ROOT, "public/audio/v13")
BEAT = 0.6  # every theme is exactly 100 BPM
BAR = 2.4

_cache = {}


def load(path):
    if path not in _cache:
        raw = subprocess.run([FF, "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
        _cache[path] = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    return _cache[path]


def db(g):
    return 10 ** (g / 20)


def fade(n, kind="in"):
    u = np.linspace(0, 1, max(1, n))
    e = np.sin(u * np.pi / 2)  # equal power
    return e if kind == "in" else e[::-1]


def place(bus, x, t, gain=0.0, pan=0.0):
    """Add stereo x at film time t (s) with gain (dB) and equal-power pan (-1…1)."""
    a = int(round(t * SR))
    if a < 0:
        x = x[-a:]
        a = 0
    b = min(N, a + len(x))
    if b <= a:
        return
    th = (pan + 1) * np.pi / 4
    pl, pr = np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)
    seg = x[: b - a] * db(gain)
    bus[a:b, 0] += seg[:, 0] * pl
    bus[a:b, 1] += seg[:, 1] * pr


# ---------------------------------------------------------------- music
METER = pyln.Meter(SR)
MUSIC = {k: os.path.join(SRC, "music", k + ".mp3") for k in ["act1_a", "act2_a", "act3_a", "act4_a", "act5_a"]}


def theme(name):
    """Theme normalized to -16 LUFS over the whole track."""
    x = load(MUSIC[name])
    return x * db(-16 - METER.integrated_loudness(x))


def clip(name, film_a, track_a, film_b, fin=0.0, fout=0.0, gain=0.0):
    """Theme from track_a placed at film_a, until film_b; equal-power fades in/out (s)."""
    x = theme(name)
    s = int(round(track_a * SR))
    n = int(round((film_b - film_a) * SR))
    seg = x[s : s + n].copy()
    if len(seg) < n:
        seg = np.vstack([seg, np.zeros((n - len(seg), 2))])
    if fin > 0:
        k = int(fin * SR)
        seg[:k] *= fade(k, "in")[:, None]
    if fout > 0:
        k = int(fout * SR)
        seg[-k:] *= fade(k, "out")[:, None]
    return seg, film_a, gain


def music_bus():
    bus = np.zeros((N, 2))
    # I «Утро» — dawn, the roof, the map opens
    seg, a, g = clip("act1_a", 0.0, 0.0, 22.6, fin=2.2, fout=3.0, gain=-1.0)
    place(bus, seg, a, g)
    # II «Ручная работа» — the quiet intro slips in under the morning; the groove
    # (track 4.88 s, bar 3) lands on 22.4 s when the trucks start circling
    s2 = 22.4 - (0.075 + 2 * BAR)
    seg, a, g = clip("act2_a", s2, 0.0, 72.8, fin=1.5, fout=0.9, gain=0.0)
    place(bus, seg, a, g)
    # III «Одна система» — intro pads under the turn and the logo; the groove
    # (track 9.64 s) starts with the dive into the Fund at 82.44 s
    s3 = 82.44 - (0.041 + 4 * BAR)
    # it thins out under the route and is gone when the field lands
    seg, a, g = clip("act3_a", s3, 0.0, 198.4, fin=1.2, fout=4.2, gain=0.0)
    place(bus, seg, a, g)
    # IV «ИИ» — a breath under the route; the groove (track 4.88 s) starts when
    # the question field lands at 198.4 s; its quiet section meets the resident
    s4 = 198.4 - (0.075 + 2 * BAR)
    seg, a, g = clip("act4_a", s4, 0.0, 230.2, fin=0.3, fout=1.2, gain=-1.5)
    place(bus, seg, a, g)
    # V «Кульминация» — full on the first downbeat at 230.0 s, the drums stop
    # after the last number and hand over to the reprise
    s5 = 230.0 - 0.116
    seg, a, g = clip("act5_a", s5, 0.0, 258.2, fout=2.8, gain=1.0)
    place(bus, seg, a, g)
    # reprise of «Утро»: its own ending decays with the logo (track 147.5 s → 267.5 s)
    seg, a, g = clip("act1_a", 255.2, 135.2, 268.0, fin=2.6, gain=3.0)
    place(bus, seg, a, g)
    return bus


# ---------------------------------------------------------------- sound effects
def sfx(name):
    return load(os.path.join(SRC, "sfx", name + ".mp3"))


def one_shot(name, a=None, b=None, pitch=0.0):
    """Trimmed one-shot normalized to -1 dBFS peak; optional pitch shift (semitones, by resampling)."""
    x = sfx(name)
    if a is not None or b is not None:
        x = x[int((a or 0) * SR) : int(b * SR) if b else None]
    x = x.copy()
    k = int(0.02 * SR)
    x[-k:] *= fade(k, "out")[:, None]
    if pitch:
        r = 2 ** (pitch / 12)
        idx = np.arange(0, len(x) - 1, r)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    return x * (db(-1) / (np.abs(x).max() + 1e-9))


# sync points (s into the file): the moment that should sit on the picture
SYNC = {"whoosh_a": 0.75, "whoosh_b": 0.78, "push_a": 1.0, "push_b": 0.98, "click_a": 0.09, "blip_a": 0.0, "blip_b": 0.0, "notify_a": 0.0, "notify_b": 0.0, "paper": 1.2, "truck": 0.0, "typing": 0.0}
TRIM = {"click_a": (0.0, 0.45), "blip_b": (0.0, 0.6), "notify_a": (0.0, 1.3), "notify_b": (0.0, 1.3), "whoosh_a": (0.2, 1.4), "whoosh_b": (0.4, 1.4), "push_a": (0.3, 1.8), "push_b": (0.15, 1.8), "paper": (0.1, 2.0)}


def hit(bus, name, t, gain, pan=0.0, pitch=0.0):
    a, b = TRIM.get(name, (None, None))
    x = one_shot(name, a, b, pitch)
    lead = SYNC.get(name, 0.0) - (a or 0.0)
    place(bus, x, t - lead / (2 ** (pitch / 12)), gain, pan)


def typing(bus, t0, t1, gain=-18, pan=0.0):
    x = one_shot("typing")
    n = int((t1 - t0) * SR)
    seg = x[:n].copy()
    k = int(0.08 * SR)
    seg[-k:] *= fade(k, "out")[:, None]
    place(bus, seg, t0, gain, pan)


def ambience(bus, name, t0, t1, gain, fin=0.8, fout=0.8):
    x = sfx(name)
    x = x * (db(-24) / (np.sqrt((x**2).mean()) + 1e-12))
    n = int((t1 - t0) * SR)
    k = int(1.0 * SR)
    out = np.zeros((n + len(x), 2))
    pos = 0
    while pos < n:  # loop with 1 s equal-power crossfades
        seg = x.copy()
        if pos > 0:
            seg[:k] *= fade(k, "in")[:, None]
        seg[-k:] *= fade(k, "out")[:, None]
        out[pos : pos + len(seg)] += seg
        pos += len(seg) - k
    out = out[:n]
    out[: int(fin * SR)] *= fade(int(fin * SR), "in")[:, None]
    out[-int(fout * SR) :] *= fade(int(fout * SR), "out")[:, None]
    place(bus, out, t0, gain)


CLICK, BLIP, NOTE, FOLD, OPEN, PUSH = -11, -16, -10, -12, -11, -11


def sfx_bus():
    bus = np.zeros((N, 2))
    H, A, L = hit, ambience, typing
    # ОТКРЫТИЕ — the courtyard wakes up; the roof folds into the house pin
    A(bus, "amb_yard", 0.0, 13.0, -4, fin=2.0, fout=1.6)
    H(bus, "whoosh_b", 6.3, -18)  # dawn → roof: one forward push
    H(bus, "whoosh_a", 12.0, FOLD)
    H(bus, "blip_a", 12.8, BLIP + 4, 0.1)
    H(bus, "push_b", 14.6, -19)  # 1 800 objects light up
    # АКТ I — logistics: trucks lap the city; three tables, three dates
    for i, t in enumerate([22.8, 26.4, 30.0]):
        H(bus, "whoosh_b", t, -19, [-0.5, 0.4, -0.1][i])
    for i in range(3):
        H(bus, "blip_b", 26.3 + i * 0.35, BLIP, 0.3)
    H(bus, "whoosh_b", 33.7, -22, 0.3)  # the tables fold back into the pin
    # phone call from the house
    H(bus, "push_a", 34.9, OPEN)
    A(bus, "amb_yard", 34.0, 40.6, -8)
    H(bus, "whoosh_a", 40.0, FOLD)
    # as-is windows: grown out of the house pin, morphing beat to beat
    H(bus, "push_a", 41.0, -18)
    H(bus, "whoosh_b", 41.6, -22, 0.4)  # the 1С copy slides out
    L(bus, 41.8, 43.6, -19, 0.3)
    L(bus, 43.8, 44.1, -19, 0.3)
    L(bus, 44.2, 45.3, -19, 0.3)
    for t in [46.8, 52.8, 57.8]:
        H(bus, "whoosh_b", t, -21)
    H(bus, "blip_b", 47.35, BLIP - 2, 0.1)
    H(bus, "paper", 53.3, -13, -0.4)
    L(bus, 54.33, 55.33, -19, 0.3)
    H(bus, "blip_b", 58.35, BLIP - 2, 0.5)
    H(bus, "paper", 63.15, -10, 0.0)  # documents dealt out
    H(bus, "paper", 63.75, -13, 0.3)
    H(bus, "paper", 67.0, -15, 0.0)  # …and gathered into the report
    H(bus, "whoosh_b", 67.1, -16)
    H(bus, "blip_b", 68.2, BLIP, 0.0, pitch=-5)  # duplicate rows flagged
    H(bus, "click_a", 69.33, CLICK + 2)  # 7,76 struck through
    # ПОВОРОТ — windows collapse; the participants appear; the mark draws
    H(bus, "whoosh_b", 72.6, -9)
    for i, p in enumerate([0.0, -0.3, 0.3, 0.1, 0.6]):
        H(bus, "blip_a", 78.45 + i * 0.25, BLIP + 2, p)
    H(bus, "push_b", 79.55, -11)  # «Единая система» grows out of the Fund pin
    H(bus, "whoosh_a", 83.0, FOLD)  # …and folds back into it
    # АКТ II — the Fund
    H(bus, "push_a", 84.3, OPEN)
    A(bus, "amb_office", 83.6, 88.8, -6)
    H(bus, "push_b", 87.6, PUSH)
    H(bus, "click_a", 96.8, CLICK)
    H(bus, "click_a", 97.85, CLICK)
    L(bus, 98.0, 99.0)
    H(bus, "click_a", 103.3, CLICK)
    H(bus, "blip_b", 106.9, BLIP - 3, 0.3)
    for i in range(5):
        H(bus, "click_a", 113.05 + i, CLICK - 2)
    H(bus, "notify_a", 117.0, NOTE)
    H(bus, "whoosh_a", 119.2, FOLD)
    H(bus, "push_a", 120.9, -17, 0.2)  # the notice travels Fund → house
    H(bus, "blip_a", 121.45, BLIP + 2, 0.2)
    # contractor in the courtyard
    H(bus, "push_a", 123.6, OPEN)
    A(bus, "amb_yard", 123.0, 128.6, -8)
    H(bus, "push_b", 127.6, PUSH)
    H(bus, "notify_b", 128.5, NOTE)
    H(bus, "click_a", 129.35, CLICK)
    H(bus, "click_a", 130.0, CLICK)
    L(bus, 129.8, 130.9)
    H(bus, "click_a", 132.5, CLICK)
    H(bus, "blip_b", 132.62, BLIP)
    H(bus, "click_a", 133.7, CLICK)
    H(bus, "click_a", 137.9, CLICK)
    L(bus, 138.2, 140.0)
    H(bus, "click_a", 140.6, CLICK)
    H(bus, "notify_a", 140.7, NOTE)
    H(bus, "whoosh_a", 142.0, FOLD)
    H(bus, "push_a", 143.1, -17, -0.2)
    H(bus, "blip_a", 143.45, BLIP + 2, -0.2)
    # approver at ТУ ГАУ
    H(bus, "push_a", 144.6, OPEN)
    A(bus, "amb_office", 144.0, 147.6, -6)
    H(bus, "push_b", 146.8, PUSH)
    H(bus, "click_a", 149.1, CLICK)
    H(bus, "click_a", 151.6, CLICK)
    H(bus, "click_a", 152.8, CLICK)
    for i in range(8):
        H(bus, "blip_b", 153.8 + i * 0.28, BLIP - 4, -0.6 + i * 0.17)
    H(bus, "whoosh_a", 156.1, FOLD)
    H(bus, "push_a", 157.3, -17, 0.3)
    H(bus, "blip_a", 157.45, BLIP + 2, 0.3)
    # supplier at the warehouse
    H(bus, "push_a", 158.6, OPEN)
    A(bus, "amb_store", 158.0, 162.6, -6)
    H(bus, "push_b", 161.7, PUSH)
    H(bus, "click_a", 166.0, CLICK)
    H(bus, "click_a", 168.0, CLICK)
    H(bus, "notify_b", 168.2, NOTE - 2)
    H(bus, "whoosh_a", 172.1, FOLD)
    H(bus, "whoosh_b", 174.6, -15, 0.3)  # one planned trip
    H(bus, "blip_a", 175.05, BLIP + 2, 0.0)
    # the truck arrives; the reminder; М-15 on the tablet
    H(bus, "truck", 176.0, -7)
    A(bus, "amb_yard", 176.0, 180.8, -8)
    H(bus, "notify_b", 178.6, NOTE)
    H(bus, "push_b", 180.4, PUSH + 2)
    H(bus, "click_a", 181.8, CLICK)
    H(bus, "blip_b", 182.6, BLIP)
    H(bus, "click_a", 185.0, CLICK)
    H(bus, "whoosh_a", 186.4, FOLD + 1)
    A(bus, "amb_yard", 186.0, 189.8, -8)
    H(bus, "click_a", 187.1, CLICK - 1)  # the foreman's tap
    H(bus, "push_b", 189.5, PUSH)
    H(bus, "notify_a", 190.6, NOTE - 2)
    H(bus, "notify_a", 191.4, NOTE - 2)
    # route → question field
    H(bus, "whoosh_a", 194.9, FOLD)
    for i in range(8):
        H(bus, "blip_b", 195.0 + i * 0.16, BLIP - 4, -0.8 + i * 0.2)
    H(bus, "push_a", 197.9, -11)
    # АКТ III — the assistant
    L(bus, 198.8, 200.6)
    H(bus, "click_a", 200.9, CLICK)
    H(bus, "notify_b", 201.8, NOTE - 3)
    H(bus, "whoosh_b", 208.9, -17)
    H(bus, "blip_a", 209.25, BLIP + 2)
    for i in range(3):
        H(bus, "blip_b", 212.9 + i * 0.45, BLIP - 2)
    H(bus, "blip_b", 214.25, BLIP, pitch=-5)
    H(bus, "whoosh_a", 215.8, FOLD)
    H(bus, "push_a", 216.9, OPEN)
    A(bus, "amb_yard", 216.4, 220.4, -8)
    H(bus, "whoosh_a", 219.9, FOLD)  # back into the house pin
    H(bus, "blip_a", 219.95, BLIP + 2, 0.0)
    H(bus, "push_a", 220.9, -17)  # the appeal travels to the Fund
    H(bus, "push_a", 221.8, OPEN)  # it opens out of the Fund pin
    for i in range(5):
        H(bus, "blip_b", 222.3 + i * 0.35, BLIP - 4)
    H(bus, "notify_a", 224.9, NOTE - 2)
    H(bus, "whoosh_a", 227.0, FOLD)
    # АКТ IV — the effect
    H(bus, "push_a", 230.0, -9)
    for t in [234.6, 238.4, 242.2, 245.6, 249.2, 252.2]:
        H(bus, "whoosh_b", t + 0.15, -21)
    # ФИНАЛ — the house pin opens into the evening city, which folds into the mark
    H(bus, "blip_a", 257.05, BLIP + 2, 0.0)
    H(bus, "push_a", 259.4, -13)
    A(bus, "amb_dusk", 258.6, 264.8, -6, fin=1.2, fout=1.2)
    H(bus, "whoosh_a", 264.2, FOLD + 1)
    H(bus, "push_b", 265.0, -10)
    return bus


def main():
    os.makedirs(OUT, exist_ok=True)
    m = music_bus()
    s = sfx_bus()
    mix = m * db(-3.0) + s
    sf.write(os.path.join(OUT, "music.wav"), m.astype(np.float32), SR, subtype="FLOAT")
    sf.write(os.path.join(OUT, "sfx.wav"), s.astype(np.float32), SR, subtype="FLOAT")
    raw = os.path.join(OUT, "mix_raw.wav")
    sf.write(raw, mix.astype(np.float32), SR, subtype="FLOAT")
    # loudness: two-pass ffmpeg loudnorm to -14 LUFS, true peak -1 dBTP
    import json

    p1 = subprocess.run([FF, "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(p1[p1.rindex("{") : p1.rindex("}") + 1])
    af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    out = os.path.join(OUT, "soundtrack.wav")
    subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", af, "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
    y, _ = sf.read(out)
    print(f"music {METER.integrated_loudness(m):.1f} LUFS  sfx peak {20 * np.log10(np.abs(s).max()):.1f} dBFS  final {METER.integrated_loudness(y):.2f} LUFS  peak {20 * np.log10(np.abs(y).max()):.2f} dBFS  → {out}")


if __name__ == "__main__":
    main()
