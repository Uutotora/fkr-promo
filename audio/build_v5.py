"""Soundtrack v5 (final) for the ФКР film (187 s, 120 BPM, F major / D minor).

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
DUR = 188.0
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



HOLD_RAW = [
    (1.9, 0.6),
    (3.9, 0.6),
    (5.9, 0.6),
    (7.28, 0.5),
    (13.32, 1.8),
    (18.12, 1.8),
    (22.92, 1.8),
    (27.72, 1.8),
    (32.52, 1.8),
    (33.98, 0.8),
    (37.85, 0.8),
    (40.9, 0.8),
    (46.45, 1.0),
    (50.75, 0.8),
    (56.0, 0.8),
    (58.2, 0.8),
    (60.75, 0.8),
    (63.9, 1.0),
    (69.25, 1.0),
    (74.75, 1.0),
    (81.3, 1.2),
    (82.7, 0.8),
    (86.92, 1.0),
    (90.95, 1.0),
    (93.75, 1.2),
    (100.5, 0.8),
    (104.3, 1.0),
    (106.9, 0.8),
    (109.4, 0.6),
    (113.45, 1.0),
    (117.4, 1.0),
    (121.22, 1.0),
    (125.05, 1.0),
    (128.95, 1.0),
    (132.8, 1.0),
    (136.55, 1.0),
    (138.6, 1.5),
    (145.0, 1.5),
]
ADV = 0.02


def NT(t):
    """v5 film clock → final film clock. For sound a hold is a pause: a cue anywhere after the
    hold's start moves by the full extra time, so lead-ins (whooshes, swells) stay glued to the
    visual event that follows the hold."""
    out = t
    for at, extra in HOLD_RAW:
        if t <= at + 1e-6:
            break
        out += extra
    return out


def past_hold(t, hold):
    """A lead-in cue at v5 time t that belongs to the motion after the hold at `hold`:
    keep its offset to that motion, i.e. move it past the pause too."""
    return t + NT(hold + 1e-3) - (hold + 1e-3)

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


def W(t):
    """v3 film time → v4 film time (reading holds: +1.0 s at ТМЦ, +1.5 s at the marketplace)."""
    return t + (1.0 if t >= 66.15 else 0.0) + (1.5 if t >= 95.2 else 0.0)


_fx_raw, _m_raw, _d_raw = fx.add, music.add, drums.add
_fx_add = lambda x, at, g=1.0, pan=0.0: _fx_raw(x, NT(at), g, pan)           # v4/v5 clock
fx.add = lambda x, at, g=1.0, pan=0.0: _fx_raw(x, NT(W(at)), g, pan)         # v3 clock
music.add = lambda x, at, g=1.0, pan=0.0: _m_raw(x, NT(at), g, pan)
drums.add = lambda x, at, g=1.0, pan=0.0: _d_raw(x, NT(at), g, pan)
kicks = []

GROOVE = [([53, 57, 60, 64], 41), ([52, 55, 60, 64], 36), ([50, 53, 57, 60], 38), ([50, 53, 58, 62], 34)]  # Fmaj7 C Dm7 Bbmaj7
MINOR = [([50, 53, 57, 62], 38), ([50, 53, 58, 62], 34), ([50, 55, 58, 62], 43), ([49, 52, 57, 61], 45)]  # Dm Bb Gm A
MOTIF = [(0, 77, 1), (1, 81, 1), (2, 79, 1), (3, 84, 2), (5, 81, 1), (6, 79, 1), (7, 77, 1)]  # beats, midi, len (beats)


def groove(a, b, *, arp=False, keys=True, drums_on=True, lead_on=False, cut=1900, gain=1.0, kick_on=True, prog=GROOVE, ref=30.0):
    a, b, ref = NT(a), NT(b), NT(ref)
    music_add, drums_add = _m_raw, _d_raw
    t0 = a
    while t0 < b - 1e-6:
        L = min(BAR, b - t0)
        bi = int(round((t0 - ref) / BAR)) % 4
        notes, root = prog[bi]
        music_add(warm_pad(notes, L + 0.3, cut=cut, a=0.04, r=0.3), t0, 0.42 * gain)
        for e in range(int(L / (BEAT / 2) + 1e-6)):
            m = root + (12 if e in (3, 6) else 0)
            music_add(bass(m, BEAT / 2 * 0.86), t0 + e * BEAT / 2, 0.36 * gain)
        if keys:
            for off in (0.5, 1.5):
                if off < L:
                    music_add(st(epiano([n + 12 for n in notes[1:]], 0.9, 0.9), 0.15), t0 + off, 0.34 * gain)
        if arp:
            seq = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[3] + 24, notes[2] + 24, notes[1] + 24, notes[3] + 24, notes[2] + 24]
            for e in range(int(L / (BEAT / 4) + 1e-6)):
                music_add(st(pluck(seq[e % 8], 0.35, 4800, 0.8 if e % 4 == 0 else 0.5), 0.4 * np.sin(e * 0.8)), t0 + e * BEAT / 4, 0.14 * gain)
        if lead_on and bi % 2 == 0:
            for b_, m, ln in MOTIF:
                tt = t0 + b_ * BEAT
                if tt < b:
                    music_add(st(lead(m - 12, ln * BEAT * 0.95, 1.0), -0.1), tt, 0.12 * gain)
        if drums_on:
            for k in range(int(L / BEAT + 1e-6)):
                tb = t0 + k * BEAT
                if kick_on:
                    drums_add(kick(), tb, 0.7 * gain)
                    kicks.append(tb)
                if k % 2 == 1:
                    drums_add(D.verb(clap(), 0.2, D.PLATE), tb, 0.3 * gain)
                drums_add(hat(0.6, True), tb + BEAT / 2, 0.08 * gain, 0.25)
                for q in range(4):
                    drums_add(shaker(0.5 + 0.4 * (q % 2)), tb + q * BEAT / 4, 0.09 * gain, -0.2)
        t0 += BAR


# ---- 0–8 hook: night, warm drone, a rising four-note theme on the statements
music.add(warm_pad([41, 48, 53, 57], NT(8.6), cut=700, a=2.5, r=2.0), 0.0, 0.42)
music.add(sine(hz(41), NT(8.4)) * env(int(NT(8.4) * SR), 2.0, 0.5, 1, 1.5), 0.0, 0.14)
for k, t0 in enumerate(TL["hook"]["slams"]):
    fx.add(D.reverse_swell(0.55, 6000), t0 - 0.55, 0.22)
    fx.add(warm_hit([41, 43, 45, 46][k], 0.75), t0, 0.55)
    music.add(D.verb(st(bell([77, 81, 84, 88][k], 3.0, 1.0)), 0.45), t0, 0.32)
    for j in range(10):
        fx.add(D.ui_tick(3800 + j * 80, 0.35, body=False), t0 + 0.05 + j * 0.07, 0.11)
for tb in np.arange(0.0, NT(8.0) - 0.1, BAR):
    _d_raw(kick(0.5), tb, 0.25)
fx.add(D.tonal_whoosh(1.2, 200, 3000, 0.4, -0.4, tone_midi=62, q=4), 7.4, 0.3)

# ---- 8–33 «как сейчас»
groove(8.0, 32.0, arp=True, keys=False, drums_on=True, cut=1200, gain=0.6, prog=MINOR, ref=8.0, kick_on=False)
for tb in np.arange(NT(8.0), NT(32.0) - 0.1, BAR):
    _d_raw(kick(0.6), tb, 0.4)
    _d_raw(kick(0.45), tb + 1.5, 0.3)
P = [9.0, 13.8, 18.6, 23.4, 28.2]
fx.add(D.glass_ping(74, 0.8, 2.0), 8.1, 0.18)
for i, t in enumerate(P):
    sw = D.tonal_whoosh(0.8, 300, 4200, -0.8, 0.8, q=3.5)  # light sweep
    if i == 0:
        fx.add(sw, t - 0.55, 0.26)
    else:  # the sweep line crosses only after the reading hold at t - 0.48
        _fx_raw(sw, past_hold(t - 0.55, t - 0.48), 0.26)
    fx.add(D.glass_ping([69, 72, 74, 76, 77][i], 0.7, 1.5), t + 0.05, 0.12)
# 01 four systems
t = P[0]
fx.add(D.ui_tick(2200, 0.6), t + 0.15, 0.2)
for j in range(4):
    fx.add(D.ui_tick(1700 + j * 200, 0.6), t + 0.55 + j * 0.14, 0.22, -0.4 + j * 0.27)
    fx.add(D.data_chirps(0.6, 30, 2500, 6000, seed=100 + j), t + 1.2 + j * 0.1, 0.04)
for j in range(4):
    fx.add(st(pluck(80 + j, 0.4, 5000, 0.8)), t + 2.3 + j * 0.12, 0.13)
fx.add(st(pluck(81, 0.5, 5000)), t + 3.0, 0.2)
# 02 versions stack up; older ones get stamped; checks are drawn by hand
t = P[1]
for j, ta in enumerate([t + 0.2, t + 1.35, t + 2.5]):
    fx.add(D.tonal_whoosh(0.5, 700, 4500, 0.7, 0.1, q=5), ta - 0.25, 0.16)      # a new version slides in
    fx.add(D.ui_tick(1600 + j * 300, 0.7), ta + 0.15, 0.24)
    fx.add(D.data_chirps(0.35, 40, 2400, 6000, seed=120 + j), ta + 0.15, 0.05)  # the number rolls
for ts in (t + 1.6, t + 2.75):
    fx.add(D.stamp(0.55), ts, 0.22)                                              # «ПЕРЕСОЗДАНА»
for j, tc in enumerate([t + 1.0, t + 2.1, t + 3.2]):
    for q in range(7):
        fx.add(st(hp(rng.standard_normal(int(0.03 * SR)), 2500) * np.hanning(int(0.03 * SR))), tc + q * 0.075, 0.05)  # pencil
    fx.add(D.glass_ping([84, 86, 88][j], 0.6, 1.0), tc + 0.55, 0.12)
fx.add(st(pluck(81, 0.5, 5000)), t + 3.6, 0.2)

# 03 the truck
t = P[2]
for a, b in [(t + 0.5, t + 1.6), (t + 2.2, t + 3.1), (t + 3.4, t + 4.3)]:
    d = b - a
    tt = T(d + 0.3)
    eng = (np.sign(np.sin(2 * np.pi * np.cumsum(55 + 25 * np.sin(np.pi * np.clip(tt / d, 0, 1))) / SR)) * 0.5 + rng.standard_normal(len(tt)) * 0.3)
    eng = lp(eng, 700) * np.sin(np.pi * np.clip(tt / (d + 0.3), 0, 1)) ** 0.7
    fx.add(st(eng, 0), a, 0.16)
fx.add(st(bell(64, 1.4, 1.0) + bell(65, 1.4, 0.7)), t + 1.65, 0.16)  # not ready
for tc in (t + 2.2, t + 3.4):
    fx.add(D.ui_tick(1400, 0.8), tc, 0.24)
fx.add(st(pluck(81, 0.5, 5000)), t + 3.6, 0.2)
# 04 the comet passes every status; the ring breaks; the stamp lands
t = P[3]


def _bez(p1x, p1y, p2x, p2y):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            u = (lo + hi) / 2
            bx = 3 * (1 - u) ** 2 * u * p1x + 3 * (1 - u) * u ** 2 * p2x + u ** 3
            lo, hi = (u, hi) if bx < x else (lo, u)
        u = (lo + hi) / 2
        return 3 * (1 - u) ** 2 * u * p1y + 3 * (1 - u) * u ** 2 * p2y + u ** 3
    return f


_inout = _bez(0.65, 0, 0.35, 1)
_xs = np.linspace(0, 1, 2001)
_turn = np.array([1.75 * _inout(x) for x in _xs])
for kq in range(1, 8):                                        # every quarter turn = a status
    x = _xs[np.argmax(_turn >= kq / 4)]
    tp = t + 0.5 + x * 2.55
    fx.add(D.ui_tick([2400, 1700, 2100, 1700][kq % 4], 0.55), tp, 0.18, [0, 0.6, 0, -0.6][kq % 4])
    fx.add(D.glass_ping([79, 76, 81, 79][kq % 4], 0.5, 0.8), tp, 0.07, [0, 0.6, 0, -0.6][kq % 4])
fx.add(D.tonal_whoosh(2.5, 400, 1800, -0.7, 0.7, q=8), t + 0.5, 0.08)          # the comet
fx.add(st(bell(57, 1.6, 0.9) + bell(58, 1.6, 0.6)), t + 3.05, 0.14)           # ring turns red
fx.add(D.reverse_swell(0.3, 6000), t + 2.95, 0.2)
fx.add(D.stamp(0.85), t + 3.42, 0.34)                                          # «АННУЛИРОВАНА»
fx.add(D.tonal_whoosh(0.8, 2500, 300, 0, 0, q=4), t + 3.45, 0.12)              # shockwave

# 05 retyping
t = P[4]
for i in range(3):
    at = t + 0.15 + i * 0.3
    for q, tq in enumerate(np.linspace(at + 0.35, at + 1.4, 18)):
        fx.add(D.ui_tick(3200 + (q % 5) * 170, 0.35, body=False), tq, 0.11, -0.5 + i * 0.5)
fx.add(D.tonal_whoosh(0.6, 600, 3000, 0, 0, q=6), t + 2.55, 0.12)
fx.add(st(pluck(81, 0.5, 5000) + pluck(85, 0.5, 5000) * 0.6), t + 3.0, 0.2)

# ---- 33–39.4 dawn
_fx_raw(D.tonal_whoosh(1.4, 200, 2400, 0, 0, tone_midi=57, q=3), past_hold(32.4, 32.52), 0.3)  # after the hold
fx.add(D.shepard_riser(1.3, 140, gate=False), 32.9, 0.18)
music.add(D.verb(warm_pad([41, 53, 57, 60, 64, 67], NT(39.2) - NT(34.0), cut=2600, a=1.4, r=2.0, bright=0.5), 0.45), 34.0, 0.5)
music.add(sine(hz(41), NT(39.0) - NT(34.0)) * env(int((NT(39.0) - NT(34.0)) * SR), 1.0, 0.5, 0.8, 1.5), 34.0, 0.14)
fx.add(swell(1.0, 300, 7000), 33.4, 0.25)
fx.add(warm_hit(41, 0.8), 34.35, 0.45)
fx.add(D.scan_sweep(1.0, True), 35.25, 0.2)
for i, tb in enumerate([35.6, 35.85, 36.1, 36.35, 36.6, 36.85]):
    music.add(D.verb(st(bell([77, 81, 84, 88, 89, 93][i], 2.2, 1.0), (i - 2.5) / 4), 0.45), tb, 0.24)
fx.add(D.shimmer(1.4, 86, 12, seed=3), 37.0, 0.18)
fx.add(swell(1.0, 400, 12000), 37.9, 0.35)
fx.add(D.tonal_whoosh(0.9, 250, 7000, 0, 0, tone_midi=65, q=3), 38.0, 0.45)
fx.add(warm_hit(41, 1.0), 39.0, 0.55)

# ---- 39–148.5 the score (v4 clock, continuous)
groove(39.0, 55.0, keys=True)
groove(55.0, 65.0, keys=True, arp=True)
groove(65.0, 76.0, keys=True, arp=True, lead_on=True)
groove(76.0, 78.5, keys=True, drums_on=False, cut=1300, gain=0.8)
groove(78.5, 95.0, keys=True, arp=True)
groove(95.0, 108.5, keys=True, arp=True, lead_on=True)
groove(108.5, 112.75, keys=True, drums_on=False, cut=900, gain=0.75)
for tb in np.arange(NT(108.5), NT(112.75) - 0.1, 1.0):
    _d_raw(kick(0.5), tb, 0.4)
groove(112.75, 114.5, keys=True, arp=True)
groove(114.5, 138.5, keys=True, arp=True, lead_on=True)
groove(138.5, 140.5, keys=True, arp=True, drums_on=False, gain=0.8)
_fx_add(D.shepard_riser(1.8, 160, gate=True), 138.6, 0.22)
_fx_add(swell(1.2, 400, 12000), 139.7, 0.3)
music.add(D.verb(warm_pad([29, 41, 53, 57, 60, 64, 67, 72], 9.2, cut=3200, a=0.02, r=5.0, bright=0.6), 0.5), 140.9, 0.55)
music.add(sine(hz(41), 7.5) * env(int(7.5 * SR), 0.01, 0.5, 0.6, 5.0), 140.9, 0.14)
_fx_add(warm_hit(41, 1.1), 140.9, 0.6)
for i, tb in enumerate([140.92, 140.96, 141.0, 141.04, 141.08, 141.12]):
    music.add(D.verb(st(bell([77, 81, 84, 88, 89, 93][i], 2.6, 0.8), (i - 2.5) / 4), 0.5), tb, 0.18)
_fx_add(D.scan_sweep(1.0, True), 141.05, 0.18)
music.add(D.verb(st(bell(72, 4.0, 0.9)), 0.6), 142.0, 0.26)
_fx_add(D.shimmer(2.6, 84, 18, seed=9), 143.1, 0.2)


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


o = lambda x: x + 19
d = TL["dashboard"]
cam(38.45, 0.9, 200, 4000, (0, 0), 0.22, tone=60)
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
fx.add(st(bell(64, 1.6, 1.0) + bell(65, 1.6, 0.8)), o(tm["limit"]), 0.22)
fx.add(D.punch(0.3, 110, 48)[:, None].repeat(2, 1), o(tm["limit"]), 0.3)
click(o(49.45), -0.2)
for i in range(14):
    key(o(49.6) + i * 0.055, i, -0.1)
click(o(tm["clickSend"]), 0.3)
cam(o(tm["clickSend"]) + 0.2, 1.0, 300, 6000, (0, 0), 0.22, tone=67)
for i, t in enumerate([tm["route"] + 0.3] + tm["steps"]):
    ping(o(t), [72, 74, 77, 79, 84][i], 0.18, -0.6 + i * 0.3)

# AI (authored times + 9)
a9 = lambda x: x + 9
fx.add(D.tonal_whoosh(0.9, 400, 5000, 0.7, 0, tone_midi=72, q=4), 74.8, 0.24)  # ring becomes the input
ping(a9(66.35), 84, 0.12)
for i, t in enumerate(np.linspace(a9(66.8), a9(68.25), 47)):
    key(t, i)
click(a9(68.5), 0.2)
fx.add(D.tonal_whoosh(0.7, 600, 5000, 0.2, -0.1, q=5), a9(68.55), 0.14)
for i in range(4):
    ping(a9(68.7) + 0.12 + i * 0.12, 88 + [0, 2, 4, 7][i], 0.07, -0.4 + i * 0.25)
fx.add(D.shimmer(1.8, 88, 22, seed=12), a9(69.45), 0.08)
for i in range(3):
    fx.add(D.tonal_whoosh(0.5, 900, 5000, -0.5 + i * 0.5, -0.3 + i * 0.5, q=6), a9(71.35) + i * 0.15 - 0.2, 0.1)
cam(a9(71.8), 0.8, 250, 3000, (0.3, 0), 0.18, tone=64)
fx.add(st(bell(76, 1.4, 1.0)), a9(72.25), 0.14)
cam(a9(73.2), 0.7, 3000, 300, (0, -0.3), 0.12)
for i, t in enumerate(np.linspace(a9(73.55), a9(74.35), 24)):
    key(t, i)
click(a9(74.5), 0.2)
fx.add(D.scan_sweep(1.1, True), a9(75.0), 0.2)
for i, t in enumerate([75.4, 75.75, 76.1]):
    ping(a9(t), [84, 88, 91][i], 0.14, 0.3)
fx.add(st(pluck(84, 0.5, 5000) + pluck(88, 0.5, 5000)), a9(76.45), 0.16)
# nomenclature matching
NOM = a9(77.0)
cam(NOM - 0.2, 0.9, 300, 3500, (0, 0), 0.18, tone=65)
for i in range(3):
    ping(NOM + 0.45 + i * 0.18, [79, 81, 84][i], 0.12, -0.6)
for i in range(3):
    fx.add(D.tonal_whoosh(0.75, 500, 4200, -0.6, 0.4, tone_midi=[72, 76, 79][i], q=8), NOM + 1.25 + i * 0.12, 0.12)
fx.add(warm_hit(41, 0.45), NOM + 1.9, 0.25)
for i in range(3):
    ping(NOM + 2.2 + i * 0.3, [84, 88, 91][i], 0.13, 0.4)
fx.add(st(bell(64, 1.4, 1.0) + bell(65, 1.4, 0.7)), NOM + 3.4, 0.14)  # the anomaly
cam(a9(82.0), 1.0, 300, 4000, (0, 0), 0.2, tone=65)
for i in range(5):
    ping(a9(82.5) + i * 0.1, [77, 81, 84, 88, 89][i], 0.1, -0.6 + i * 0.3)

# Marketplace
fx.add(D.tonal_whoosh(0.8, 400, 6000, -0.8, 0.8, q=3), 93.6, 0.26)
cam(94.0, 0.8, 300, 3500, (0.2, 0), 0.18)
cam(95.5, 0.8, 300, 3000, (0, 0.2), 0.15)
click(96.05, -0.4)
ping(96.15, 84, 0.1)
for i, t in enumerate(np.linspace(96.3, 96.8, 8)):
    key(t, i, 0.2)
fx.add(D.tonal_whoosh(0.35, 1500, 5000, 0, 0, q=6), 96.4, 0.1)  # suggestions drop down
click(97.0, 0.1)
for i in range(4):
    ping(97.2 + i * 0.1 + 0.05, [77, 79, 81, 84][i], 0.11, -0.4 + i * 0.27)
fx.add(D.shimmer(0.9, 90, 8, seed=44), 98.2, 0.1)
click(99.0, -0.3)
fx.add(D.tonal_whoosh(0.6, 700, 6000, -0.4, 0.6, tone_midi=79, q=6), 99.05, 0.16)  # into «Потребности»
ping(99.62, 91, 0.16, 0.6)
fx.add(D.tonal_whoosh(0.45, 2000, 600, 0.6, 0.4, q=6), 99.55, 0.1)  # popover
for i in range(5):
    ping(99.9 + i * 0.25, [72, 74, 77, 79, 81][i], 0.15, 0.2 + i * 0.1)
fx.add(st(pluck(84, 0.6, 5200) + pluck(89, 0.6, 5200)), 101.35, 0.16)
fx.add(D.glass_ping(96, 0.7, 2.0), 101.3, 0.14)
cam(102.6, 1.0, 2500, 300, (-0.2, 0.2), 0.14)
fx.add(D.tonal_whoosh(0.8, 400, 6000, 0.8, -0.8, q=3), 105.65, 0.24)

# Signature (v1 + 50)
g = TL["sign"]
s_ = lambda x: x + 50  # v3 clock; fx.add maps it
ping(s_(g["dialog"]), 79, 0.12)
click(s_(g["clickSign"]), 0.2)
for i, t in enumerate(g["steps"]):
    fx.add(D.data_chirps(0.35, 35, 1600, 5000, seed=50 + i), s_(t) - 0.35, 0.05)
    ping(s_(t), [84, 86, 88, 91][i], 0.12)
fx.add(swell(1.6, 300, 9000), s_(g["stamp"]) - 1.3, 0.22)
fx.add(D.reverse_swell(0.6, 8000), s_(g["stamp"]) - 0.3, 0.25)
fx.add(D.stamp(1.0), s_(g["stamp"]) + 0.28, 0.5)
fx.add(warm_hit(41, 0.8), s_(g["stamp"]) + 0.28, 0.35)
fx.add(D.tonal_whoosh(1.0, 300, 5000, 0, 0, tone_midi=65, q=3), 111.7, 0.24)  # the ring opens the effects

# Effects
E = [112.2, 115.8, 119.6, 123.4, 127.4, 131.4]
RAIL = [119.35, 123.15, 127.15, 131.0, 131.1, 134.75]
fx.add(D.data_chirps(1.8, 40, 2000, 6000, seed=71), E[0] + 0.2, 0.07)
for j in range(16):
    fx.add(D.ui_tick(3600 + j * 60, 0.32, body=False), E[0] + 0.2 + j * 0.11, 0.1)
fx.add(warm_hit(41, 0.7), E[0] + 2.0, 0.35)
fx.add(D.tonal_whoosh(1.2, 400, 3000, -0.6, 0.6, tone_midi=69, q=7), E[0] + 1.0, 0.12)
cam(E[1] - 0.6, 0.8, 2500, 400, (0, 0), 0.14)  # total docks
for j in range(10):
    fx.add(D.ui_tick(1800 + j * 120, 0.4, body=False), E[1] + 0.3 + j * 0.06, 0.1)
fx.add(D.shimmer(0.8, 86, 8, seed=81), E[1] + 1.3, 0.14)
fx.add(D.tonal_whoosh(0.7, 800, 3500, 0.3, 0.6, q=6), E[1] + 1.3, 0.12)
fx.add(D.data_chirps(0.9, 40, 2000, 6000, seed=82), E[1] + 2.0, 0.06)
for j in range(20):
    fx.add(D.ui_tick(2000 + (j % 10) * 90, 0.35, body=False), E[2] + 0.3 + j * 0.03, 0.08)
for j in range(4):
    fx.add(D.tonal_whoosh(0.9, 300, 2500, -0.3, 0.9, q=4), E[2] + 1.4 + j * 0.08, 0.08)
fx.add(D.data_chirps(0.8, 40, 2000, 6000, seed=83), E[2] + 2.2, 0.06)
for j in range(16):
    fx.add(D.ui_tick(1600 + j * 80, 0.35, body=False), E[3] + 0.3 + j * 0.04, 0.08)
fx.add(D.shimmer(0.9, 88, 9, seed=84), E[3] + 1.4, 0.16)
fx.add(D.data_chirps(1.0, 40, 2000, 6000, seed=85), E[3] + 2.0, 0.06)
fx.add(D.tonal_whoosh(1.0, 2500, 600, 0.6, -0.2, q=6), E[4] + 1.4, 0.12)  # the cycle shrinks
for j in range(3):
    ping(E[4] + 1.5 + j * 0.2, [84, 88, 91][j], 0.11, 0.5)
fx.add(D.shimmer(1.8, 84, 26, seed=86), E[5] + 0.4, 0.14)  # the grid lights up
fx.add(D.tonal_whoosh(1.8, 300, 3000, -0.8, 0.8, q=5), E[5] + 0.4, 0.1)
for i, t in enumerate(RAIL):
    fx.add(D.tonal_whoosh(0.55, 700, 5000, 0, -0.5 + i * 0.2, q=6), t - 0.55, 0.1)
    ping(t, [77, 79, 81, 84, 86, 89][i], 0.15, -0.6 + i * 0.24)
cam(135.0, 0.9, 400, 4000, (0, 0), 0.16, tone=65)
fx.add(D.tonal_whoosh(1.0, 300, 6000, 0, 0, tone_midi=72, q=3), 137.5, 0.36)

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
for a, b, depth in [(NT(x), NT(y), z) for x, y, z in [(33.9, 34.35, 0.35), (38.65, 39.0, 0.15), (g["stamp"] + 52.5 - 0.3, g["stamp"] + 52.5 + 0.28, 0.45), (140.55, 140.9, 0.15)]]:
    m = (tsec >= a) & (tsec < b)
    k = np.clip((tsec - a) / (b - a), 0, 1)
    auto[m] = np.minimum(auto[m], 1 - (1 - depth) * k[m] ** 0.7)
M *= auto[:, None]
Dr *= auto[:, None]
mix = M * 0.7 + Dr * 0.62 + F * 0.95
for a, b in [(NT(38.94), NT(39.0))]:
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
os.makedirs(os.path.join(ROOT, "public/audio/v5"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/v5/soundtrack.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
print("ok")
