"""Soundtrack v2 for the ФКР film (116 s, 120 BPM, F major / D minor).

Warm, melodic promo score + tonal sound design, every cue locked to the picture.
Output: public/audio/v2/soundtrack.wav (48 kHz, 24-bit, ~-14 LUFS, peak ≤ -1 dBFS).
"""
import os, json
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal
from scipy.ndimage import minimum_filter1d

import design as D

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src/timeline.json")))
SR = 48000
DUR = TL["duration"]
N = int(DUR * SR)
BEAT = 0.5
BAR = 2.0
rng = np.random.default_rng(11)

SH = {"dash": 10, "obj": 10, "tmc": 10, "sign": 34, "close": 40}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def T(d):
    return np.arange(int(d * SR)) / SR


def st(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


class Bus:
    def __init__(self):
        self.b = np.zeros((N + SR * 6, 2))

    def add(self, x, at, g=1.0, pan=0.0):
        if x.ndim == 1:
            x = st(x, pan)
        i = int(round(at * SR))
        if i < 0:
            x, i = x[-i:], 0
        j = min(i + len(x), len(self.b))
        self.b[i:j] += x[: j - i] * g


def env(n, a, d, s, r):
    a, d, r = max(1, int(a * SR)), max(1, int(d * SR)), max(1, int(r * SR))
    sus = max(0, n - a - d - r)
    e = np.concatenate([np.linspace(0, 1, a, False), np.linspace(1, s, d, False), np.full(sus, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def lp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, min(f, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, a, b, o=2):
    return signal.sosfilt(signal.butter(o, [a, min(b, SR * 0.45)], "band", fs=SR, output="sos"), x, axis=0)


def saw(f, d, det=0.0, ph0=None):
    n = int(d * SR)
    dt = f * 2 ** (det / 1200) / SR
    ph = ((rng.random() if ph0 is None else ph0) + np.arange(n) * dt) % 1
    y = 2 * ph - 1
    # polyblep
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def sine(f, d, ph=0.0):
    return np.sin(2 * np.pi * f * T(d) + ph)


# ---------------------------------------------------------------- instruments
def warm_pad(notes, d, cut=1800, a=0.6, r=1.2, bright=0.0):
    n = int(d * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for m in notes:
        for v, det in enumerate((-11, -4, 4, 11)):
            y = saw(hz(m), d, det)
            (L if v % 2 == 0 else R)[:] += y
            (R if v % 2 == 0 else L)[:] += y * 0.35
        s = sine(hz(m), d)
        L += s * 0.8
        R += s * 0.8
    y = np.stack([L, R], 1) / (len(notes) * 3)
    y = lp(y, cut + bright * 2500)
    y = hp(y, 120)
    return y * env(n, a, 0.3, 0.9, r)[:, None]


def epiano(notes, d, vel=1.0):
    """FM electric piano: soft bell attack, warm body, slight tremolo."""
    n = int(d * SR)
    t = T(d)
    out = np.zeros(n)
    for m in notes:
        f = hz(m)
        idx = 2.2 * np.exp(-t * 7) + 0.25
        mod = np.sin(2 * np.pi * f * t) * idx
        out += np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.3)
        out += np.sin(2 * np.pi * f * 2 * t) * 0.12 * np.exp(-t * 5)
    out *= (1 + 0.12 * np.sin(2 * np.pi * 4.5 * t))
    out[:64] *= np.linspace(0, 1, 64)
    out *= env(n, 0.002, 0.1, 1, 0.12)
    return out / len(notes) * vel


def bass(m, d, cut=380):
    t = T(d)
    y = saw(hz(m), d) * 0.6 + sine(hz(m), d) * 0.5 + sine(hz(m - 12), d) * 0.3
    y = lp(y, cut)
    return y * env(len(t), 0.006, 0.12, 0.8, 0.07)


def pluck(m, d=0.45, bright=4200, vel=1.0):
    t = T(d)
    y = saw(hz(m), d) * 0.6 + saw(hz(m), d, 8) * 0.4
    k = np.exp(-t * 16)
    y = lp(y, bright) * k + lp(y, 650) * (1 - k)
    return y * np.exp(-t * 6) * vel


def bell(m, d=2.4, vel=1.0):
    t = T(d)
    f = hz(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.6 * np.exp(-t * 3)
    y = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.0) + np.sin(2 * np.pi * f * 2 * t) * 0.2 * np.exp(-t * 4)
    y[:96] *= np.linspace(0, 1, 96)
    return y * vel * 0.55


def lead(m, d, vel=1.0):
    """Soft, breathy lead for the motif."""
    t = T(d)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t) * np.clip(t * 3, 0, 1)
    ph = np.cumsum(hz(m) * vib) / SR
    y = np.sin(2 * np.pi * ph) + 0.3 * np.sin(4 * np.pi * ph) + 0.12 * (2 * (ph % 1) - 1)
    y += lp(rng.standard_normal(len(t)), 3000) * 0.02
    return lp(y, 3500) * env(len(t), 0.03, 0.15, 0.75, 0.18) * vel


def kick(vel=1.0):
    t = T(0.42)
    f = 46 + 70 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    y += lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 200) * 0.12
    return np.tanh(y * 1.2) * vel


def clap(vel=1.0):
    t = T(0.4)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for o in (0, 0.012, 0.024):
        i = int(o * SR)
        e[i:] += np.exp(-t[: len(t) - i] * 95) * 0.6
    e += np.exp(-t * 14) * 0.3
    return bp(n * e, 1000, 6500) * vel


def shaker(vel=1.0):
    t = T(0.09)
    return bp(rng.standard_normal(len(t)), 5000, 12000) * np.sin(np.pi * np.clip(t / 0.09, 0, 1)) ** 2 * vel


def hat(vel=1.0, op=False):
    t = T(0.3 if op else 0.06)
    return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * (10 if op else 60)) * vel


def warm_hit(root=41, size=1.0):
    """Pleasant tonal impact: sub thump + bell chord + soft air, into a hall."""
    d = 4.0
    n = int(d * SR)
    t = T(d)
    f = 30 + 45 * np.exp(-t * 4)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5)
    y = sub * 0.55
    p = D.punch(0.3, 140, 50)
    y[: len(p)] += p * 0.45
    for m, g in ((root + 24, 0.5), (root + 31, 0.35), (root + 36, 0.3), (root + 40, 0.2)):
        b = bell(m, d, 1.0)
        y[: len(b)] += b * g
    y += lp(rng.standard_normal(n), 3000) * np.exp(-t * 3) * 0.08
    return D.verb(st(y * size), 0.32)


def swell(d=1.6, f0=300, f1=9000):
    n = rng.standard_normal(int(d * SR))
    y = D.sweep_lp(n, f0, f1)
    y = hp(y, 200) * np.linspace(0, 1, len(y)) ** 2.2
    return D.verb(st(y, 0), 0.25)


# ---------------------------------------------------------------- score
music, drums, fx = Bus(), Bus(), Bus()
kicks = []

GROOVE = [([53, 57, 60, 64], 41), ([52, 55, 60, 64], 36), ([50, 53, 57, 60], 38), ([50, 53, 58, 62], 34)]  # Fmaj7 C Dm7 Bbmaj7
MINOR = [([50, 53, 57, 62], 38), ([50, 53, 58, 62], 34), ([50, 55, 58, 62], 43), ([49, 52, 57, 61], 45)]  # Dm Bb Gm A
MOTIF = [(0, 77, 1), (1, 81, 1), (2, 79, 1), (3, 84, 2), (5, 81, 1), (6, 79, 1), (7, 77, 1)]  # beats, midi, len (beats)


def groove(a, b, *, arp=False, keys=True, drums_on=True, lead_on=False, cut=1900, gain=1.0, kick_on=True, prog=GROOVE, ref=30.0):
    t0 = a
    while t0 < b - 1e-6:
        L = min(BAR, b - t0)
        bi = int(round((t0 - ref) / BAR)) % 4
        notes, root = prog[bi]
        music.add(warm_pad(notes, L + 0.3, cut=cut, a=0.04, r=0.3), t0, 0.42 * gain)
        for e in range(int(L / (BEAT / 2) + 1e-6)):
            m = root + (12 if e in (3, 6) else 0)
            music.add(bass(m, BEAT / 2 * 0.86), t0 + e * BEAT / 2, 0.36 * gain)
        if keys:
            for off in (0.5, 1.5):
                if off < L:
                    music.add(st(epiano([n + 12 for n in notes[1:]], 0.9, 0.9), 0.15), t0 + off, 0.34 * gain)
        if arp:
            seq = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[3] + 24, notes[2] + 24, notes[1] + 24, notes[3] + 24, notes[2] + 24]
            for e in range(int(L / (BEAT / 4) + 1e-6)):
                music.add(st(pluck(seq[e % 8], 0.35, 4800, 0.8 if e % 4 == 0 else 0.5), 0.4 * np.sin(e * 0.8)), t0 + e * BEAT / 4, 0.14 * gain)
        if lead_on and bi % 2 == 0:
            for b_, m, ln in MOTIF:
                tt = t0 + b_ * BEAT
                if tt < b:
                    music.add(st(lead(m - 12, ln * BEAT * 0.95, 1.0), -0.1), tt, 0.12 * gain)
        if drums_on:
            for k in range(int(L / BEAT + 1e-6)):
                tb = t0 + k * BEAT
                if kick_on:
                    drums.add(kick(), tb, 0.7 * gain)
                    kicks.append(tb)
                if k % 2 == 1:
                    drums.add(D.verb(clap(), 0.2, D.PLATE), tb, 0.3 * gain)
                drums.add(hat(0.6, True), tb + BEAT / 2, 0.08 * gain, 0.25)
                for q in range(4):
                    drums.add(shaker(0.5 + 0.4 * (q % 2)), tb + q * BEAT / 4, 0.09 * gain, -0.2)
        t0 += BAR


# ---- 0–8 hook: night, warm drone, a rising four-note theme on the statements
music.add(warm_pad([41, 48, 53, 57], 8.6, cut=700, a=2.5, r=2.0), 0.0, 0.42)
music.add(sine(hz(41), 8.4) * env(int(8.4 * SR), 2.0, 0.5, 1, 1.5), 0.0, 0.14)
for k, t0 in enumerate(TL["hook"]["slams"]):
    fx.add(D.reverse_swell(0.55, 6000), t0 - 0.55, 0.22)
    fx.add(warm_hit([41, 43, 45, 46][k], 0.75), t0, 0.55)
    music.add(D.verb(st(bell([77, 81, 84, 88][k], 3.0, 1.0)), 0.45), t0, 0.32)
    fx.add(D.data_chirps(0.5, 40, 2200, 6000, seed=k), t0 + 0.05, 0.07)  # digits rolling
    for j in range(10):
        fx.add(D.ui_tick(3800 + j * 80, 0.35, body=False), t0 + 0.05 + j * 0.07, 0.12)
for b in range(4):  # soft heartbeat
    drums.add(kick(0.5), b * BAR + 0.5 * 0, 0.25)
fx.add(D.tonal_whoosh(1.2, 200, 3000, 0.4, -0.4, tone_midi=62, q=4), 7.4, 0.3)  # camera tilts to the sky

# ---- 8–24.3 «как сейчас»: minor, pulsing, musical
groove(8.0, 24.0, arp=True, keys=False, drums_on=True, cut=1200, gain=0.62, prog=MINOR, ref=8.0, kick_on=False)
for b in range(8):
    drums.add(kick(0.6), 8.0 + b * BAR, 0.4)
    drums.add(kick(0.45), 8.0 + b * BAR + 1.5, 0.3)
NOW_P = [9.0, 12.1, 15.2, 18.3, 21.4]
fx.add(D.glass_ping(74, 0.8, 2.0), 8.1, 0.18)
for i, t in enumerate(NOW_P):
    fx.add(D.tonal_whoosh(0.7, 300, 3200, 0.7, -0.4, q=4), t - 0.45, 0.24)
    fx.add(D.punch(0.3, 120, 50)[:, None].repeat(2, 1) * 0.6, t, 0.25)
    fx.add(D.glass_ping([69, 72, 74, 76, 77][i], 0.7, 1.5), t + 0.05, 0.12)
# 01 systems: windows pop, focus jumps
for j in range(4):
    fx.add(D.ui_tick(1700 + j * 200, 0.6), 9.1 + j * 0.13, 0.22, -0.3 + j * 0.2)
for j in range(4):
    fx.add(D.ui_tick(2600, 0.5, body=False), 10.0 + j * 0.4, 0.18, 0.3)
fx.add(st(pluck(81, 0.5, 5000)), 10.9, 0.18)
# 02 requests recreated
for j in range(3):
    fx.add(D.tonal_whoosh(0.35, 800, 4000, 0.4, -0.2, q=6), 12.25 + j * 0.55, 0.12)
    fx.add(D.ui_tick(2000, 0.6), 12.3 + j * 0.55, 0.2)
fx.add(st(pluck(81, 0.5, 5000)), 14.0, 0.18)
# 03 trips: truck travels three legs
for j in range(3):
    fx.add(D.tonal_whoosh(0.8, 300, 1800, -0.6 if j % 2 == 0 else 0.6, 0.6 if j % 2 == 0 else -0.6, q=3), 15.5 + j * 0.8, 0.16)
fx.add(st(pluck(81, 0.5, 5000)), 17.2, 0.18)
# 04 status loop: each change is a soft blip, the cancellation a low tone
for j, t in enumerate(np.linspace(18.8, 20.7, 5)):
    fx.add(D.ui_tick([2400, 1600, 2400, 1600, 900][j], 0.6), t, 0.2)
fx.add(st(bell(57, 1.5, 0.8)), 20.55, 0.16)
fx.add(st(pluck(80, 0.5, 5000)), 20.55, 0.15)
# 05 retyping: keys
for j in range(3):
    for q in range(12):
        fx.add(D.ui_tick(3200 + (q % 5) * 180, 0.35, body=False), 21.8 + j * 0.35 + q * 0.08, 0.13, -0.5 + j * 0.5)
fx.add(st(pluck(81, 0.5, 5000)), 23.5, 0.18)

# ---- 24–30.4 dawn: swell → sunrise chord → logo → drop
fx.add(D.shepard_riser(1.3, 140, gate=False), 23.9, 0.18)
fx.add(D.tonal_whoosh(1.4, 200, 2400, 0, 0, tone_midi=57, q=3), 23.4, 0.3)  # camera tilts back to the city
music.add(D.verb(warm_pad([41, 53, 57, 60, 64, 67], 5.2, cut=2600, a=1.4, r=2.0, bright=0.5), 0.45), 25.0, 0.5)
music.add(sine(hz(41), 5.0) * env(int(5.0 * SR), 1.0, 0.5, 0.8, 1.5), 25.0, 0.14)
fx.add(swell(1.0, 300, 7000), 24.4, 0.25)
fx.add(warm_hit(41, 0.8), 25.35, 0.45)  # the light arrives
fx.add(D.scan_sweep(1.0, True), 26.25, 0.2)  # the frame draws
for i, t in enumerate([26.6, 26.85, 27.1, 27.35, 27.6, 27.85]):
    music.add(D.verb(st(bell([77, 81, 84, 88, 89, 93][i], 2.2, 1.0), (i - 2.5) / 4), 0.45), t, 0.24)
fx.add(D.shimmer(1.4, 86, 12, seed=3), 28.0, 0.18)
fx.add(swell(1.0, 400, 12000), 29.0, 0.35)
fx.add(D.tonal_whoosh(0.9, 250, 7000, 0, 0, tone_midi=65, q=3), 29.0, 0.45)  # fly through the frame
fx.add(warm_hit(41, 1.0), 30.0, 0.55)  # drop

# ---- 30–96 product
groove(30.0, 46.0, keys=True)
groove(46.0, 56.0, keys=True, arp=True)
groove(56.0, 66.0, keys=True, arp=True, lead_on=True)
groove(66.0, 68.5, keys=True, drums_on=False, cut=1300, gain=0.8)  # AI: the question is typed in a hush
groove(68.5, 80.0, keys=True, arp=True)
groove(80.0, 90.0, keys=True, arp=True, lead_on=True)
groove(90.0, 94.25, keys=True, drums_on=False, cut=900, gain=0.75)  # signature breakdown
for k in range(0, 8, 2):
    drums.add(kick(0.5), 90.0 + k * BEAT, 0.4)
groove(94.0, 96.0, keys=True, arp=True)
# ---- 96–108 effects: the finale, with the motif
groove(96.0, 106.0, keys=True, arp=True, lead_on=True)
groove(106.0, 108.0, keys=True, arp=True, drums_on=False, gain=0.8)
fx.add(D.shepard_riser(1.8, 160, gate=True), 106.0, 0.22)
fx.add(swell(1.2, 400, 12000), 106.8, 0.3)
# ---- 108.4 close
music.add(D.verb(warm_pad([29, 41, 53, 57, 60, 64, 67, 72], 7.6, cut=3200, a=0.02, r=4.5, bright=0.6), 0.5), 108.4, 0.55)
music.add(sine(hz(41), 6.0) * env(int(6.0 * SR), 0.01, 0.5, 0.6, 4.0), 108.4, 0.14)
fx.add(warm_hit(41, 1.1), 108.4, 0.6)
for i, t in enumerate([108.42, 108.46, 108.5, 108.54, 108.58, 108.62]):
    music.add(D.verb(st(bell([77, 81, 84, 88, 89, 93][i], 2.6, 0.8), (i - 2.5) / 4), 0.5), t, 0.18)
fx.add(D.scan_sweep(1.0, True), 108.55, 0.18)
music.add(D.verb(st(bell(72, 4.0, 0.9)), 0.6), 109.5, 0.26)
fx.add(D.shimmer(2.6, 84, 18, seed=9), 110.6, 0.2)


# ---------------------------------------------------------------- UI sound design
def click(t, pan=0.0, g=1.0):
    p = os.path.join(ROOT, "sfxsrc", "click_002.ogg")
    x, sr = sf.read(p, always_2d=True)
    x = signal.resample_poly(x, SR, sr, axis=0) if sr != SR else x
    x = np.repeat(x, 2, 1) if x.shape[1] == 1 else x
    fx.add(x / (np.abs(x).max() + 1e-9), t - 0.004, 0.22 * g, pan)
    fx.add(D.ui_tick(2600, 0.7), t, 0.26 * g, pan)


def key(t, i, pan=0.0):
    fx.add(D.ui_tick(3300 + (i % 5) * 170, 0.42, body=False), t, 0.2, pan + 0.1 * np.sin(i * 1.7))


def cam(t, d, f0=250, f1=2800, pan=(-0.3, 0.3), g=0.16, tone=None):
    fx.add(D.tonal_whoosh(d, f0, f1, pan[0], pan[1], tone_midi=tone, q=3.5), t, g)


def ping(t, m, g=0.14, pan=0.0):
    fx.add(D.glass_ping(m, 0.8, 1.3), t, g, pan)


o = lambda x: x + SH["dash"]
d = TL["dashboard"]
cam(29.45, 0.9, 200, 4000, (0, 0), 0.22, tone=60)
for i, t in enumerate(d["cards"]):
    ping(o(t) + 0.04, 84 + [0, 4, 7, 11][i], 0.12, -0.5 + i * 0.33)
fx.add(D.data_chirps(0.8, 30, 1500, 4800, seed=21), o(20.7), 0.05)
click(o(d["clickYears"]), 0.3)
cam(o(24.35), 1.0, 300, 3000, (0.2, -0.2), 0.2)
fx.add(D.scan_sweep(1.2, True), o(d["mapPush"]), 0.12)
for i, t in enumerate(d["clusters"]):
    ping(o(t), 84 + [0, 2, 4, 7, 9, 12, 14, 12, 9, 7, 4, 2][i], 0.08, -0.6 + i / 9)
click(o(d["clickCluster"]), -0.1)
cam(o(28.6), 0.9, 2800, 300, (-0.2, 0.2), 0.16)

ob = TL["objects"]
click(o(ob["clickNav"]), -0.6)
for i, t in enumerate(ob["rows"]):
    fx.add(D.ui_tick(2000 + i * 160, 0.45, body=False), o(t) + 0.05, 0.16, 0.4)
cam(o(31.9), 0.8, 300, 3500, (0.4, 0.0), 0.16)
click(o(ob["clickSearch"]), 0.4)
for i, t in enumerate(ob["type"]):
    key(o(t), i, 0.3)
cam(o(ob["filter"]), 0.5, 4000, 700, (0.3, -0.3), 0.14)
click(o(ob["clickRow"]), -0.3)
cam(o(ob["open"]) - 0.05, 0.8, 400, 5000, (-0.5, 0.5), 0.18, tone=67)
ping(o(ob["open"]) + 0.2, 84, 0.1)
cam(o(37.1), 0.9, 2500, 300, (0.3, -0.3), 0.13)

oj = TL["object"]
cam(o(39.0), 0.9, 300, 3200, (0.3, -0.1), 0.16)
click(o(oj["clickGantt"]), 0.2)
for i, t in enumerate(oj["bars"]):
    fx.add(D.tonal_whoosh(1.1, 500, 4500, -0.6, 0.6, tone_midi=72 + i * 4, q=7), o(t), 0.09)
cam(o(oj["fan"]) - 0.1, 1.2, 200, 4000, (0, 0), 0.22, tone=62)
for i, t in enumerate(oj["fanCards"]):
    ping(o(t) + 0.08, 77 + [0, 2, 4, 7, 9, 12, 14, 16][i], 0.08, -0.7 + i * 0.2)
fx.add(D.whip(0.42), o(45.7), 0.32)

tm = TL["tmc"]
cam(o(46.2), 0.7, 5000, 400, (0.8, 0.0), 0.22)
cam(o(47.3), 0.8, 300, 3000, (0, 0.2), 0.16)
click(o(tm["clickQty"]), 0.1)
for i, t in enumerate(tm["type"]):
    key(o(t), i, 0.1)
fx.add(D.data_chirps(0.3, 50, 3000, 7000, seed=41), o(tm["limit"]) - 0.28, 0.08)
fx.add(st(bell(64, 1.6, 1.0) + bell(65, 1.6, 0.8)), o(tm["limit"]), 0.22)  # gentle warning: a soft minor second
fx.add(D.punch(0.3, 110, 48)[:, None].repeat(2, 1), o(tm["limit"]), 0.3)
click(o(49.45), -0.2)
for i in range(14):
    key(o(49.6) + i * 0.055, i, -0.1)
click(o(tm["clickSend"]), 0.3)
cam(o(tm["clickSend"]) + 0.2, 1.0, 300, 6000, (0, 0), 0.22, tone=67)
for i, t in enumerate([tm["route"] + 0.3] + tm["steps"]):
    ping(o(t), [72, 74, 77, 79, 84][i], 0.18, -0.6 + i * 0.3)

# AI
AI = dict(input=66.35, q1=(66.8, 68.25), send1=68.5, think=68.7, answer=(69.45, 71.25), cards=71.35, focus=(71.9, 73.2), q2=(73.55, 74.35), send2=74.5, scan=(75.0, 76.1), checks=[75.4, 75.75, 76.1], verdict=76.45, modules=77.2)
fx.add(D.tonal_whoosh(0.7, 300, 4000, 0, 0, tone_midi=72, q=4), 66.05, 0.18)
ping(AI["input"], 84, 0.12)
for i, t in enumerate(np.linspace(*AI["q1"], 47)):
    if i % 1 == 0:
        key(t, i)
click(AI["send1"], 0.2)
fx.add(D.tonal_whoosh(0.7, 600, 5000, 0.2, -0.1, q=5), AI["send1"] + 0.05, 0.14)
for i in range(4):
    ping(AI["think"] + 0.12 + i * 0.12, 88 + [0, 2, 4, 7][i], 0.07, -0.4 + i * 0.25)
fx.add(D.shimmer(1.8, 88, 22, seed=12), AI["answer"][0], 0.08)  # the answer streams
fx.add(D.data_chirps(1.8, 18, 2500, 6500, seed=13), AI["answer"][0], 0.04)
for i in range(3):
    fx.add(D.tonal_whoosh(0.5, 900, 5000, -0.5 + i * 0.5, -0.3 + i * 0.5, q=6), AI["cards"] + i * 0.15 - 0.2, 0.1)
cam(AI["focus"][0] - 0.1, 0.8, 250, 3000, (0.3, 0), 0.18, tone=64)
fx.add(st(bell(76, 1.4, 1.0)), AI["focus"][0] + 0.35, 0.14)
cam(AI["focus"][1], 0.7, 3000, 300, (0, -0.3), 0.12)
for i, t in enumerate(np.linspace(*AI["q2"], 24)):
    key(t, i)
click(AI["send2"], 0.2)
fx.add(D.scan_sweep(1.1, True), AI["scan"][0], 0.2)
for i, t in enumerate(AI["checks"]):
    ping(t, [84, 88, 91][i], 0.14, 0.3)
fx.add(D.glass_ping(96, 0.6, 2.0), AI["verdict"], 0.12)
fx.add(st(pluck(84, 0.5, 5000) + pluck(88, 0.5, 5000)), AI["verdict"], 0.16)
cam(AI["modules"] - 0.2, 1.0, 300, 4000, (0, 0), 0.2, tone=65)
for i in range(5):
    ping(AI["modules"] + 0.3 + i * 0.1, [77, 81, 84, 88, 89][i], 0.1, -0.6 + i * 0.3)

# Marketplace
MK = dict(clickSearch=81.6, type=(81.85, 82.45), cards=82.65, pick=83.6, drawer=83.85, qty=(84.45, 84.85), submit=85.6, chain=85.95, toast=87.75)
fx.add(D.whip(0.42), 79.75, 0.3)
cam(80.0, 0.7, 5000, 400, (0.8, 0.0), 0.2)
cam(81.05, 0.8, 300, 3000, (0, 0.2), 0.15)
click(MK["clickSearch"], 0.1)
for i, t in enumerate(np.linspace(*MK["type"], 10)):
    key(t, i)
for i in range(4):
    ping(MK["cards"] + i * 0.12 + 0.05, [77, 81, 84, 88][i], 0.1, -0.6 + i * 0.4)
click(MK["pick"], -0.3)
fx.add(D.tonal_whoosh(0.55, 600, 4500, 0.8, 0.3, q=5), MK["drawer"], 0.16)
click(MK["qty"][0] - 0.25, 0.3)
for i, t in enumerate(np.linspace(*MK["qty"], 3)):
    key(t, i)
click(MK["submit"], 0.3)
for i in range(5):
    ping(MK["chain"] + i * 0.3, [72, 74, 77, 79, 81][i], 0.15, -0.6 + i * 0.3)
fx.add(st(pluck(84, 0.6, 5200) + pluck(89, 0.6, 5200)), MK["chain"] + 1.5, 0.18)
fx.add(D.glass_ping(96, 0.7, 2.0), MK["toast"], 0.14)
cam(88.3, 1.0, 2500, 300, (-0.2, 0.2), 0.14)
fx.add(D.whip(0.42), 89.65, 0.26)

# Signature
g = TL["sign"]
s_ = lambda x: x + SH["sign"]
ping(s_(g["dialog"]), 79, 0.12)
click(s_(g["clickSign"]), 0.2)
for i, t in enumerate(g["steps"]):
    fx.add(D.data_chirps(0.35, 35, 1600, 5000, seed=50 + i), s_(t) - 0.35, 0.05)
    ping(s_(t), [84, 86, 88, 91][i], 0.12)
fx.add(swell(1.6, 300, 9000), s_(g["stamp"]) - 1.3, 0.22)
fx.add(D.reverse_swell(0.6, 8000), s_(g["stamp"]) - 0.3, 0.25)
fx.add(D.stamp(1.0), s_(g["stamp"]) + 0.28, 0.5)
fx.add(warm_hit(41, 0.8), s_(g["stamp"]) + 0.28, 0.35)

# Effects
EF = dict(total=96.45, dock=98.7, cards=99.0, hold=104.2, converge=107.55)
fx.add(D.tonal_whoosh(0.8, 300, 4000, 0, 0, tone_midi=65, q=4), 95.8, 0.2)
fx.add(D.data_chirps(1.8, 40, 2000, 6000, seed=71), EF["total"], 0.07)
for j in range(16):
    fx.add(D.ui_tick(3600 + j * 60, 0.32, body=False), EF["total"] + j * 0.11, 0.1)
fx.add(warm_hit(41, 0.7), EF["total"] + 1.8, 0.35)
cam(EF["dock"], 0.9, 2500, 400, (0, 0), 0.14)
for i in range(5):
    t = EF["cards"] + i * 0.14
    ping(t + 0.05, [77, 81, 84, 88, 89][i], 0.13, -0.7 + i * 0.35)
    fx.add(D.ui_tick(2200, 0.5), t + 0.95, 0.1)  # the «было» line is struck through
fx.add(D.shimmer(1.6, 88, 14, seed=31), EF["hold"], 0.14)
for i in range(6):
    fx.add(D.tonal_whoosh(0.85, 400, 5000, -0.8 + i * 0.32, 0, q=4), EF["converge"] + i * 0.05, 0.08)

# ---------------------------------------------------------------- mix & master
M = music.b[:N]
Dr = drums.b[:N]
F = fx.b[:N]
# gentle sidechain on the bed
duck = np.ones(N)
tt = np.arange(int(0.3 * SR)) / SR
shape = 1 - 0.35 * np.exp(-tt / 0.08)
for k in kicks:
    i = int(k * SR)
    j = min(N, i + len(shape))
    duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
M = M * duck[:, None]
M = D.verb(M, 0.1)[:N]
# hold-then-hit: breathe out before the big moments
tsec = np.arange(N) / SR
auto = np.ones(N)
for a, b, depth in [(24.9, 25.35, 0.35), (29.65, 30.0, 0.15), (s_(g["stamp"]) - 0.3, s_(g["stamp"]) + 0.28, 0.45), (108.0, 108.4, 0.15)]:
    m = (tsec >= a) & (tsec < b)
    k = np.clip((tsec - a) / (b - a), 0, 1)
    auto[m] = np.minimum(auto[m], 1 - (1 - depth) * k[m] ** 0.7)
M *= auto[:, None]
Dr *= auto[:, None]
mix = M * 0.7 + Dr * 0.62 + F * 0.95
for a, b in [(29.94, 30.0)]:
    i, j = int(a * SR), int(b * SR)
    mix[i:j] *= np.linspace(1, 0.08, j - i)[:, None]
# gentle glue compression (RMS, slow)
rms = np.sqrt(signal.lfilter([1 - 0.9995], [1, -0.9995], (mix ** 2).mean(1)) + 1e-12)
gain = np.minimum(1, (0.18 / np.maximum(rms, 1e-6)) ** 0.25)
mix *= gain[:, None]
mix = hp(mix, 32, 2)
mix = mix - lp(mix, 70) * 0.25 + hp(mix, 3500) * 0.3  # tame sub, add air
fade = np.clip((DUR - tsec) / 2.5, 0, 1) ** 1.5 * np.minimum(1, tsec / 0.05)
mix *= fade[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
# true-peak-ish limiter
peak = np.abs(mix).max(1)
g = np.minimum(1, 0.88 / np.maximum(peak, 1e-9))
g = minimum_filter1d(g, int(0.004 * SR))
a = np.exp(-1 / (0.06 * SR))
out = np.empty_like(g)
cur = 1.0
for i in range(len(g)):
    cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
    out[i] = cur
mix *= out[:, None]
print("LUFS", round(meter.integrated_loudness(mix), 2), "peak", round(float(np.abs(mix).max()), 3))
os.makedirs(os.path.join(ROOT, "public/audio/v2"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/v2/soundtrack.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
print("ok")
