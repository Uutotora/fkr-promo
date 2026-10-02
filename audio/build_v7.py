"""Soundtrack v7 for the ФКР film: 1.2 s logo card + 188 s film (80 BPM, F major / D minor).

Calm ambient score (breathing pads, felt piano, sub, glass) with restrained, tonal sound design;
every transition between scenes speaks with the same «morph» voice. Cues are locked to the
picture through the reading holds (NT). Output: public/audio/v7/soundtrack.wav (48 kHz, 24-bit,
-14 LUFS, peak ≤ -1 dBFS).
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
BEAT = 0.75
BAR = 3.0
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


# ---------------------------------------------------------------- ambient instruments (v6)
def felt(m, d=3.0, vel=1.0):
    """Felt piano: soft hammer, warm partials, a long gentle decay."""
    t = T(d)
    f = hz(m)
    y = np.zeros(len(t))
    for k, a in enumerate((1.0, 0.42, 0.2, 0.1, 0.05, 0.025), start=1):
        fk = f * k * (1 + 0.0004 * k * k)
        y += a * np.sin(2 * np.pi * fk * t + k) * np.exp(-t * (0.9 + 0.75 * k) * (1.4 - 0.4 * vel))
    y = lp(y, 2600 + 4200 * vel)
    y[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    tail = int(min(0.3, d * 0.2) * SR)
    y[-tail:] *= np.linspace(1, 0, tail)
    return y * vel * 0.4


def air_pad(notes, d, cut=1300, a=1.4, r=1.8, width=1.0):
    """Wide, breathing pad: detuned saws far behind a low-pass, plus pure sines."""
    n = int(d * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for m in notes:
        for det, side in ((-9, 0), (-3, 1), (4, 0), (10, 1)):
            y = saw(hz(m), d, det)
            (L if side == 0 else R)[:] += y
            (R if side == 0 else L)[:] += y * (1 - width) * 0.8
        s_ = sine(hz(m), d)
        L += s_ * 0.9
        R += s_ * 0.9
    y = np.stack([L, R], 1) / (len(notes) * 3.2)
    y = lp(lp(y, cut * 1.5), cut * 2.2)
    y = hp(y, 170)
    breath = 1 + 0.12 * np.sin(2 * np.pi * 0.11 * T(d) + rng.random() * 6)
    return y * (env(n, a, 0.5, 0.92, r) * breath)[:, None]


def sub(m, d, a=1.0, r=1.5):
    y = sine(hz(m), d) + 0.15 * sine(hz(m) * 2, d)
    return y * env(int(d * SR), a, 0.3, 0.9, r)


def morph(d=0.8, m0=60, m1=67, pan=(0.0, 0.0), bright=5200):
    """The signature «shape becomes shape» sound: a tonal glide wrapped in moving air."""
    t = T(d)
    k = t / d
    ease = k * k * (3 - 2 * k)
    f = hz(m0) * (hz(m1) / hz(m0)) ** ease
    ph = np.cumsum(f) / SR
    tone = np.sin(2 * np.pi * ph) + 0.32 * np.sin(4 * np.pi * ph + 0.5) + 0.12 * np.sin(6 * np.pi * ph)
    air = D.sweep_lp(rng.standard_normal(len(t)), 300 if m1 >= m0 else bright, bright if m1 >= m0 else 300)
    air = hp(air, 250)
    e = np.sin(np.pi * np.clip(k, 0, 1)) ** 1.3
    x = (tone * 0.42 + D.norm(air) * 0.5) * e
    p = pan[0] + (pan[1] - pan[0]) * k
    ang = (p + 1) * np.pi / 4
    return D.verb(np.stack([x * np.cos(ang), x * np.sin(ang)], 1), 0.42)


def land(m=72, vel=1.0, pan=0.0):
    """The shape lands: a soft felt note, a glass halo and a whisper of low."""
    y = felt(m, 2.4, 0.7 * vel)
    t = T(0.5)
    y[: len(t)] += np.sin(2 * np.pi * 70 * t) * np.exp(-t * 16) * 0.35 * vel
    out = D.verb(st(y, pan), 0.4)
    g = D.glass_ping(m + 12, 0.35 * vel, 1.6)
    out[: len(g)] += g
    return out


def paper(d=0.35, pan=0.0):
    t = T(d)
    x = bp(rng.standard_normal(len(t)), 1200, 7000) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return st(x * 0.5, pan)


def bloom(root=41, size=1.0):
    """Instead of a hit: a sub swell under a felt chord, opening into the hall."""
    d = 4.0
    t = T(d)
    s_ = np.sin(2 * np.pi * hz(root - 12) * t) * np.minimum(1, t / 0.08) * np.exp(-t * 1.1) * 0.5
    y = s_
    for m, gg in ((root + 24, 0.55), (root + 31, 0.4), (root + 36, 0.3), (root + 40, 0.22)):
        y = y + felt(m, d, 0.6) * gg
    return D.verb(st(y * size), 0.45)


warm_hit = bloom  # calm: every former «hit» becomes a bloom


def soft_tick(f=2400, vel=1.0, body=True):
    """UI tick, softened: a round blip, almost no snap."""
    t = T(0.07)
    blip = np.sin(2 * np.pi * f * 0.75 * t) * np.exp(-t * 160)
    snap = 0
    thump = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 60) * (0.25 if body else 0)
    return st(lp(blip * 0.6 + snap + thump, 7000) * vel)


D.ui_tick = soft_tick
_chirps_raw = D.data_chirps
D.data_chirps = lambda *a, **k: _chirps_raw(*a, **k) * 0.45


# ---------------------------------------------------------------- score (v6: calm ambient)
music, fx = Bus(), Bus()


def W(t):
    """v3 film time → v4/v5 film time (+1.0 s at ТМЦ, +1.5 s at the marketplace)."""
    return t + (1.0 if t >= 66.15 else 0.0) + (1.5 if t >= 95.2 else 0.0)


_fx_raw, _m_raw = fx.add, music.add
_fx_add = lambda x, at, g=1.0, pan=0.0: _fx_raw(x, NT(at), g, pan)           # v5 clock
fx.add = lambda x, at, g=1.0, pan=0.0: _fx_raw(x, NT(W(at)), g, pan)         # v3 clock

SPB = 0.75  # 80 BPM
F9 = ([53, 57, 60, 64], 41)


def bed(a, b, prog, chord=4.5, cut=1300, gain=1.0, arp=0.0, melody=0.0, sub_g=1.0, seed=1, octave=0):
    """Ambient bed between v5 times a..b; chords change every `chord` seconds of real time,
    so the music flows straight through the reading holds."""
    A, B = NT(a), NT(b)
    r = np.random.default_rng(seed)
    t0, i = A, 0
    while t0 < B - 0.2:
        notes, root = prog[i % len(prog)]
        L = min(chord, B - t0)
        _m_raw(air_pad(notes, L + 2.2, cut=cut, a=1.2, r=2.0), t0 - 0.4, 0.5 * gain)
        _m_raw(st(sub(root, L + 1.6, 0.8, 1.4)), t0 - 0.2, 0.09 * gain * sub_g)
        if arp > 0:
            seq = [notes[0], notes[1], notes[2], notes[3], notes[2], notes[1], notes[3], notes[2]]
            for e in range(int(L / (SPB / 2) + 1e-6)):
                m = seq[e % 8] + 12 + octave
                v = 0.55 if e % 4 == 0 else 0.35
                _m_raw(st(felt(m, 1.4, v), 0.45 * np.sin(e * 0.7)), t0 + e * SPB / 2, 0.16 * arp * gain)
        if melody > 0:
            for q in range(int(L / SPB)):
                if r.random() < 0.28 * melody and q % 2 == 0:
                    m = r.choice(notes[1:]) + 24 + (12 if r.random() < 0.25 else 0)
                    _m_raw(D.verb(st(felt(m, 3.0, 0.55), r.uniform(-0.3, 0.3)), 0.35), t0 + q * SPB, 0.3 * gain)
        t0 += chord
        i += 1


NOW_P = [([50, 57, 60, 64], 38), ([53, 57, 60, 62], 34), ([50, 53, 57, 58], 43), ([52, 55, 57, 62], 45)]   # Dm9 Bbmaj9 Gm9 A7sus
DAY_P = [([53, 57, 60, 64], 41), ([52, 55, 60, 64], 40), ([50, 53, 57, 64], 38), ([53, 57, 60, 62], 34)]   # Fmaj9 C/E Dm9 Bbmaj9
SIGN_P = [([50, 53, 57, 58], 43), ([53, 57, 58, 62], 34), ([53, 55, 60, 62], 36)]                          # Gm9 Bbmaj7 Csus
EFF_P = [([53, 57, 60, 62], 34), ([52, 55, 60, 64], 36), ([52, 55, 57, 60], 45), ([53, 57, 60, 64], 38)]   # Bbmaj9 C Am7 Dm9

# ================================================================ v7: one theme, many tempers
# Everything here is tonal — no noise layers, no hiss: strings are Karplus–Strong, drums are
# sines, «whooshes» are glides of pure partials.

def ks(m, d=0.8, bright=0.6, decay=0.996, vel=1.0):
    """Karplus–Strong string: a clean plucked tone (the excitation dies within one period)."""
    f = hz(m)
    Np = max(2, int(SR / f))
    n = int(d * SR)
    y = np.zeros(n + Np + 1)
    exc = rng.uniform(-1, 1, Np)
    exc = lp(exc, 800 + 7000 * bright)
    y[:Np] = exc
    for i in range(Np, n + Np, Np):
        j = min(i + Np, n + Np)
        seg = y[i - Np:j - Np]
        prev = y[i - Np - 1:j - Np - 1] if i - Np - 1 >= 0 else np.concatenate([[0.0], y[i - Np:j - Np - 1]])
        y[i:j] = decay * 0.5 * (seg + prev[: len(seg)])
    y = y[Np:Np + n]
    y = hp(y, 90)
    y[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    tail = int(0.05 * SR)
    y[-tail:] *= np.linspace(1, 0, tail)
    return y / (np.abs(y).max() + 1e-9) * vel


def kick_c(vel=1.0):
    t = T(0.45)
    f = 46 + 80 * np.exp(-t * 26)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.0)
    y[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return np.tanh(y * 1.1) * vel


def rim_c(vel=1.0):
    t = T(0.12)
    y = (np.sin(2 * np.pi * 1180 * t) * 0.6 + np.sin(2 * np.pi * 1720 * t) * 0.4) * np.exp(-t * 55)
    y += np.sin(2 * np.pi * 230 * t) * np.exp(-t * 40) * 0.5
    return y * vel


def tick_c(vel=1.0):
    t = T(0.05)
    y = np.sin(2 * np.pi * 6200 * t + 2.0 * np.sin(2 * np.pi * 9100 * t)) * np.exp(-t * 120)
    return y * vel


def bass_c(m, d, vel=1.0):
    t = T(d)
    y = np.sin(2 * np.pi * hz(m) * t) + 0.22 * np.sin(4 * np.pi * hz(m) * t) + 0.08 * np.sin(6 * np.pi * hz(m) * t)
    return y * env(len(t), 0.006, 0.12, 0.75, 0.06) * vel


def lead_c(m, d, vel=1.0):
    t = T(d)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t * 2.5, 0, 1)
    ph = np.cumsum(hz(m) * vib) / SR
    y = np.sin(2 * np.pi * ph) + 0.25 * np.sin(4 * np.pi * ph) + 0.08 * np.sin(6 * np.pi * ph)
    return lp(y, 4200) * env(len(t), 0.025, 0.2, 0.7, 0.25) * vel


lead = lead_c


def fm_bell(m, d=1.2, vel=1.0):
    t = T(d)
    f = hz(m)
    y = np.sin(2 * np.pi * f * t + 1.3 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 3.2)
    y[:48] *= np.linspace(0, 1, 48)
    return y * vel


# ---- clean replacements for every noisy sound of the old palette
def clean_whoosh(dur=0.8, f0=300, f1=3200, pan_from=-0.7, pan_to=0.7, tone_midi=None, q=5.0):
    t = T(dur)
    k = t / dur
    fa = 180 + f0 * 0.12
    fb = 180 + f1 * 0.12
    f = fa * (fb / fa) ** (k * k * (3 - 2 * k))
    ph = np.cumsum(f) / SR
    e = np.where(k < 0.6, (k / 0.6) ** 2, ((1 - k) / 0.4) ** 1.5)
    x = (np.sin(2 * np.pi * ph) * 0.5 + np.sin(2 * np.pi * ph * 1.5) * 0.3 + np.sin(2 * np.pi * ph * 2.0) * 0.2) * e
    if tone_midi is not None:
        fm = hz(tone_midi) * (0.94 + 0.12 * k)
        x += np.sin(2 * np.pi * np.cumsum(fm) / SR) * e * 0.3
    pans = pan_from + (pan_to - pan_from) * k
    a = (pans + 1) * np.pi / 4
    return D.verb(np.stack([x * np.cos(a), x * np.sin(a)], 1) * 0.8, 0.35)


def clean_rev(dur=1.2, bright=6000):
    y = sum(felt(m, dur + 0.4, 0.6) for m in (65, 69, 72, 77))
    y = D.verb(st(y), 0.6)[: int(dur * SR)][::-1]
    y = y * np.linspace(0, 1, len(y))[:, None] ** 1.6
    return y / (np.abs(y).max() + 1e-9) * 0.8


def clean_scan(dur=0.9, up=True):
    t = T(dur)
    k = t / dur
    f = (900 + 2200 * k) if up else (3100 - 2200 * k)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * k) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t))
    return D.verb(st(x * 0.35), 0.4)


def clean_stamp(vel=1.0):
    t = T(1.6)
    f = 40 + 70 * np.exp(-t * 18)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    y = y + felt(50, 1.6, 0.7)[: len(t)] * 0.5 + felt(57, 1.6, 0.6)[: len(t)] * 0.35
    return D.verb(st(y * vel), 0.3)


def clean_chirps(dur=0.6, density=40, lo=1400, hi=5200, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((int((dur + 0.3) * SR), 2))
    scale = [0, 2, 4, 7, 9]
    for _ in range(max(3, int(density * dur * 0.5))):
        t0 = r.uniform(0, dur)
        m = 84 + r.choice(scale) + 12 * r.integers(0, 2)
        b = fm_bell(m, 0.25, r.uniform(0.25, 0.6))
        i = int(t0 * SR)
        j = min(len(out), i + len(b))
        out[i:j] += st(b, r.uniform(-0.5, 0.5))[: j - i]
    return out * 0.6


def clean_swell(d=1.6, f0=300, f1=9000):
    t = T(d)
    k = t / d
    y = sum(np.sin(2 * np.pi * hz(m) * t) for m in (65, 72, 77, 84)) * k ** 2.2 * 0.25
    return D.verb(st(y), 0.4)


D.tonal_whoosh = clean_whoosh
D.whip = lambda dur=0.35: clean_whoosh(dur, 900, 9000, -0.9, 0.9)
D.reverse_swell = clean_rev
D.scan_sweep = clean_scan
D.stamp = clean_stamp
D.data_chirps = clean_chirps
swell = clean_swell


def paper(d=0.35, pan=0.0):
    """(was a noise swish) a light glass glide."""
    t = T(d)
    k = t / d
    f = hz(84) * (hz(89) / hz(84)) ** k
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * k) ** 1.5 * 0.4
    return D.verb(st(x, pan), 0.35)


def morph(d=0.8, m0=60, m1=67, pan=(0.0, 0.0), bright=5200):
    """The signature «shape becomes shape» sound: two pure voices gliding a fifth apart,
    with a glassy halo — no air, no hiss."""
    t = T(d)
    k = t / d
    ease = k * k * (3 - 2 * k)
    f = hz(m0) * (hz(m1) / hz(m0)) ** ease
    ph = np.cumsum(f) / SR
    x = np.sin(2 * np.pi * ph) * 0.5 + np.sin(2 * np.pi * ph * 1.5) * 0.28 + np.sin(2 * np.pi * ph * 2) * 0.16 + np.sin(2 * np.pi * ph * 4) * 0.05 * (bright / 5200)
    e = np.sin(np.pi * np.clip(k, 0, 1)) ** 1.2
    x = x * e
    p = pan[0] + (pan[1] - pan[0]) * k
    ang = (p + 1) * np.pi / 4
    return D.verb(np.stack([x * np.cos(ang), x * np.sin(ang)], 1) * 0.7, 0.45)


# ---------------------------------------------------------------- the arrangement
kicks = []
THEME = [77, 81, 84, 88]          # F A C E — the theme, heard first on the four statements
THEME_MINOR = [74, 77, 81, 84]    # D F A C — the same shape in the minor of «как сейчас»


def stage(a, b, bpm, prog, *, bars=2, gain=1.0, pad=1.0, cut=1500, kick=None, rim=None, ticks=None, bass=None,
          pluck=None, bells=None, marimba=None, piano=None, motif=None, motif_notes=THEME, motif_every=8, heart=None, half=False):
    """One stage of the score: its own tempo and instruments over the shared theme.
    a..b are v5 story times; the music itself runs on real time, straight through reading holds.
    Each layer is either None (off) or a v5 time from which it plays."""
    A, B = NT(a), NT(b)
    beat = 60.0 / bpm
    bar = 4 * beat
    on = lambda tt, frm: frm is not None and tt >= NT(frm) - 1e-6
    t0, bi = A, 0
    while t0 < B - 0.05:
        notes, root = prog[(bi // bars) % len(prog)]
        L = min(bar, B - t0)
        if bi % bars == 0:
            dl = min(bar * bars, B - t0)
            _m_raw(air_pad(notes, dl + 1.6, cut=cut * 1.3, a=0.6, r=1.4), t0 - 0.15, 0.3 * gain * pad)
        for q in range(16):
            tt = t0 + q * beat / 4
            if tt >= B - 0.02:
                break
            qb = q // 4  # beat in bar
            if q % 4 == 0:
                if on(tt, kick) and (not half or qb == 0):
                    _m_raw(st(kick_c(0.9)), tt, 0.36 * gain)
                    kicks.append(tt)
                if on(tt, heart) and qb in (0, 2):
                    _m_raw(st(kick_c(0.7)), tt, 0.32 * gain)
                    _m_raw(st(kick_c(0.45)), tt + beat * 0.42, 0.22 * gain)
                    kicks.append(tt)
                if on(tt, rim) and qb == (2 if half else 1) or (on(tt, rim) and not half and qb == 3):
                    _m_raw(D.verb(st(rim_c(0.8), 0.15), 0.25), tt, 0.2 * gain)
            if q % 2 == 0 and q % 4 == 2 and on(tt, ticks):
                _m_raw(st(tick_c(0.7), 0.3), tt, 0.09 * gain)
            if q % 2 == 0 and on(tt, bass):
                m = root + (12 if q in (6, 14) else 0)
                _m_raw(st(bass_c(m, beat / 2 * 0.9)), tt, 0.15 * gain)
            if on(tt, pluck):
                seq = [notes[0], notes[1], notes[2], notes[3], notes[2], notes[1], notes[3], notes[2]]
                if q % 2 == 0 or bpm >= 110:
                    m = seq[(q // (1 if bpm >= 110 else 2)) % 8] + 12
                    _m_raw(st(ks(m, 0.7, 0.55, 0.9965, 0.8 if q % 4 == 0 else 0.55), 0.35 * np.sin(q * 0.8)), tt, 0.17 * gain)
            if on(tt, bells):
                m = [notes[0], notes[2], notes[3], notes[1]][q % 4] + 24
                _m_raw(st(fm_bell(m, 0.6, 0.6 if q % 4 == 0 else 0.4), 0.5 * np.sin(q * 1.3)), tt, 0.11 * gain)
            if on(tt, marimba) and q % 2 == 0 and q not in (6, 14):
                m = [notes[0], notes[2], notes[1], notes[3]][(q // 2) % 4] + 24
                _m_raw(st(ks(m, 0.45, 0.85, 0.990, 0.7), 0.4 * np.sin(q)), tt, 0.19 * gain)
            if on(tt, piano) and q in (2, 10):
                for nn in notes[1:]:
                    _m_raw(D.verb(st(felt(nn + 12, 1.3, 0.6), -0.15), 0.3), tt, 0.13 * gain)
        if on(t0, motif) and bi % motif_every == 0:
            for j, m in enumerate(motif_notes):
                _m_raw(D.verb(st(lead_c(m - 12, beat * (1.8 if j == 3 else 0.9), 0.9), -0.1), 0.35), t0 + j * beat, 0.12 * gain)
                _m_raw(D.verb(st(fm_bell(m + 12, 1.4, 0.5)), 0.4), t0 + j * beat, 0.05 * gain)
        t0 += bar
        bi += 1


F9 = [([48, 57, 64, 67], 41)]
# 1 · night: a heartbeat that grows with every statement
stage(0.0, 8.0, 92, F9, bars=4, cut=900, pad=1.4, heart=0.5, gain=0.9)
# 2 · «как сейчас»: the minor; layers join problem by problem
stage(8.0, 33.4, 100, NOW_P, cut=1150, pluck=8.0, kick=9.0, ticks=13.8, bass=18.6, motif=23.4, motif_notes=THEME_MINOR, motif_every=4, gain=0.95)
# 3 · dawn: no grid — the chord opens, the theme rises in major
for (a, b, notes, root) in [(33.4, 35.2, [53, 57, 60, 62], 34), (35.2, 36.8, [52, 55, 60, 64], 36), (36.8, 39.0, [53, 57, 60, 64, 67], 41)]:
    _m_raw(air_pad(notes, NT(b) - NT(a) + 1.8, cut=1900 + (a - 33.4) * 300, a=0.9, r=1.6), NT(a), 0.42)
    _m_raw(st(sub(root, NT(b) - NT(a) + 1.2, 0.6, 1.0)), NT(a), 0.12)
# 4 · the product: warm groove
stage(38.8, 75.7, 112, DAY_P, cut=1700, piano=38.8, bass=38.8, kick=40.0, rim=40.9, ticks=46.0, pluck=46.0, motif=50.0, gain=0.9)
# 5 · the AI: half-time, glass
stage(75.7, 94.5, 112, DAY_P, cut=2600, kick=75.7, rim=75.7, half=True, bells=76.0, bass=75.7, motif=81.0, gain=0.85)
# 6 · the marketplace: playful
stage(94.5, 108.5, 112, DAY_P, cut=1900, kick=94.5, rim=94.5, ticks=95.0, bass=94.5, marimba=94.5, motif=100.5, gain=0.9)
# 7 · the signature: breakdown, the theme held in suspense
stage(108.5, 114.5, 112, SIGN_P, bars=1, cut=1100, pad=1.2, gain=0.8)
_fx_add(D.shepard_riser(2.6, 150, gate=False), 111.2, 0.12)
# 8 · the effect: everything at once
stage(114.5, 138.6, 112, EFF_P, cut=2200, kick=114.5, rim=114.5, ticks=115.0, bass=114.5, pluck=115.0, piano=114.5, bells=123.0, motif=115.0, motif_every=4, gain=1.0)
stage(138.6, 140.9, 112, [([52, 55, 60, 62], 36)], bars=2, cut=2000, pad=1.2, gain=0.85)
# 9 · the mark: the theme, slowly, on the piano
_m_raw(air_pad([53, 57, 60, 64, 67, 72], 10.0, cut=2600, a=0.25, r=5.0), NT(140.9), 0.4)
_m_raw(st(sub(41, 8.0, 0.05, 5.0)), NT(140.9), 0.2)
for j, m in enumerate(THEME):
    _fx_add(D.verb(st(felt(m - 12, 4.0, 0.7), (j - 1.5) / 5), 0.5), 142.2 + j * 0.55, 0.2)




# ---- 0–8 night: one long breath on F, the four statements bloom in
for k, t0 in enumerate(TL["hook"]["slams"]):
    fx.add(D.reverse_swell(0.55, 5000), t0 - 0.55, 0.14)
    fx.add(bloom([41, 43, 45, 46][k], 0.8), t0, 0.42)
    fx.add(D.verb(st(felt([77, 81, 84, 88][k], 3.5, 0.75)), 0.4), t0, 0.36)
    for j in range(10):
        fx.add(D.ui_tick(3800 + j * 80, 0.3, body=False), t0 + 0.05 + j * 0.07, 0.08)

# ---- 8–33 «как сейчас»: the minor bed; the hero object speaks in morphs
P = [9.0, 13.8, 18.6, 23.4, 28.2]
O = [p - 0.45 for p in P[1:]] + [32.55]
_fx_add(D.verb(st(felt(69, 3.0, 0.6) + felt(74, 3.0, 0.5)), 0.4), 8.1, 0.3)          # the title rises
_fx_add(morph(0.45, 62, 69, (0, 0)), 8.95, 0.12)                                         # the title docks
for i in range(5):
    _fx_add(D.ui_tick(1800 + i * 120, 0.45, body=False), P[i] + 0.05, 0.12, -0.6)        # the counter rolls
# 01 · the question opens and splits into four systems
t = P[0]
for q, tq in enumerate(np.linspace(t + 0.05, t + 0.75, 15)):
    _fx_add(D.ui_tick(3200 + (q % 5) * 170, 0.3, body=False), tq, 0.08, 0.2)               # the question types
for j in range(4):
    _fx_add(morph(0.55, 60 + j * 3, 67 + j * 3, (-0.4 + j * 0.27, -0.4 + j * 0.27), 3500), t + 0.5 + j * 0.12, 0.08)  # slabs rise out of depth
    _fx_add(land([72, 76, 79, 83][j], 0.4, -0.5 + j * 0.33), t + 1.25 + j * 0.12, 0.1)
    _fx_add(D.data_chirps(0.6, 22, 2500, 6000, seed=100 + j), t + 1.1 + j * 0.12, 0.04)        # numbers count
_fx_add(D.verb(st(felt(76, 2.4, 0.55) + felt(77, 2.4, 0.45)), 0.45), t + 2.15, 0.14)          # the «?» — a rub of seconds
_fx_add(D.verb(st(felt(74, 2.4, 0.6) + felt(77, 2.4, 0.5)), 0.4), t + 2.9, 0.24)
# → four become one request
o_ = O[0]
_fx_add(morph(0.8, 74, 62, (-0.4, 0.0)), o_, 0.2)
_fx_add(land(69, 0.8), o_ + 0.72, 0.2)
# 02 · versions, stamps, hand checks
t = P[1]
for j, ta in enumerate([t + 1.35, t + 2.5]):
    _fx_add(paper(0.4, 0.6), ta - 0.1, 0.22)
    _fx_add(land([72, 74][j], 0.5, 0.3), ta + 0.2, 0.12)
for ts in (t + 1.7, t + 2.85):                                                               # the old version is struck out
    _fx_add(paper(0.35, -0.5), ts, 0.16)
    _fx_add(D.verb(st(felt(63, 1.6, 0.45)), 0.4), ts + 0.05, 0.12)
for j, tc in enumerate([t + 1.0, t + 2.1, t + 3.2]):
    for q in range(7):
        _fx_add(D.ui_tick(5200 + q * 90, 0.22, body=False), tc + q * 0.075, 0.05)
    _fx_add(D.glass_ping([81, 84, 86][j], 0.5, 1.0), tc + 0.55, 0.1)
_fx_add(D.verb(st(felt(72, 2.4, 0.6) + felt(77, 2.4, 0.5)), 0.4), t + 3.6, 0.24)
# → the request is loaded as the truck's cargo; the street grows around it
o_ = O[1]
_fx_add(morph(0.8, 69, 57, (0.0, -0.4)), o_ + 0.02, 0.2)
_fx_add(D.glass_ping(84, 0.6, 1.8), o_ + 0.8, 0.14, -0.4)                                 # a point of light
_fx_add(morph(0.7, 55, 62, (-0.6, 0.6), 3000), o_ + 0.55, 0.08)                         # the route draws out
t = P[2]
for j, tb in enumerate([t + 0.1, t + 0.22]):
    _fx_add(D.glass_ping([81, 84][j], 0.45, 1.4), tb, 0.08, [-0.5, 0.5][j])                 # the two ends of the route
for j, (a, b, up) in enumerate([(t + 0.7, t + 1.7, 1), (t + 2.25, t + 3.1, -1), (t + 3.3, t + 4.15, 1)]):
    _fx_add(morph(b - a + 0.1, 64 + j * 2, 64 + j * 2 + 5 * up, (-0.6 * up, 0.6 * up), 3800), a, 0.13)  # each trip, an arc of light
_fx_add(D.verb(st(felt(64, 2.0, 0.6) + felt(65, 2.0, 0.45)), 0.4), t + 1.75, 0.2)         # the object is not ready
for tc in (t + 2.25, t + 3.3):
    _fx_add(D.ui_tick(1400, 0.55), tc, 0.14, -0.6)                                         # the counter rolls
_fx_add(D.verb(st(felt(72, 2.4, 0.6) + felt(76, 2.4, 0.5)), 0.4), t + 3.6, 0.24)
# → the street sinks, the truck becomes a dot of light, the road bends into a ring
o_ = O[2]
_fx_add(morph(0.4, 64, 55, (0, 0), 2500), o_, 0.1)
_fx_add(D.glass_ping(88, 0.5, 1.4), o_ + 0.15, 0.12, 0.4)
_fx_add(morph(0.75, 60, 72, (0.5, -0.5)), o_ + 0.25, 0.2)
_fx_add(land(72, 0.7), o_ + 0.95, 0.16)
# 04 · the comet passes each status; the ring turns red; annulled
t = P[3]
for j in range(4):
    _fx_add(D.glass_ping([79, 81, 84, 86][j], 0.4, 1.0), t + 0.2 + j * 0.1, 0.07, [0, 0.6, 0, -0.6][j])


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
_xs = np.linspace(0, 1, 4001)
_turn = np.array([1.75 * _inout(x) for x in _xs])
A0 = -90                                                                                    # the point of light lands on top
for kq, node in enumerate([0, 90, 180, 270, 360, 450, 540]):
    need = (node - A0) / 360
    if need > 1.75:
        break
    tp = t + 0.6 + _xs[np.argmax(_turn >= need)] * 2.45
    pan = [0.6, 0, -0.6, 0][kq % 4]
    _fx_add(D.ui_tick([1700, 2100, 1700, 2400][kq % 4], 0.45), tp, 0.12, pan)
    _fx_add(D.glass_ping([76, 81, 79, 84][kq % 4], 0.45, 0.9), tp, 0.07, pan)
_fx_add(morph(2.45, 64, 69, (-0.6, 0.6), 2200), t + 0.6, 0.05)                         # the comet's hum
_fx_add(D.verb(st(felt(57, 2.0, 0.6) + felt(58, 2.0, 0.5)), 0.4), t + 3.05, 0.2)          # the ring turns red
_fx_add(D.reverse_swell(0.3, 5000), t + 2.95, 0.12)
_fx_add(bloom(38, 0.6), t + 3.15, 0.3)                                                     # «АННУЛИРОВАНА» — a red bloom
_fx_add(morph(0.8, 62, 50, (0, 0), 2500), t + 3.45, 0.08)                                # shockwave
# → the ring folds into a sheet of paper; the sheet is copied three times
o_ = O[3]
_fx_add(morph(0.75, 57, 69, (0, 0)), o_ + 0.12, 0.18)
_fx_add(land(69, 0.6), o_ + 0.85, 0.14)
t = P[4]
_fx_add(paper(0.45, -0.7), t + 0.4, 0.2)
_fx_add(paper(0.45, 0.7), t + 0.45, 0.2)
for i in range(3):
    at0 = t + 0.95 + i * 0.25
    for q, tq in enumerate(np.linspace(at0, at0 + 1.0, 16)):
        _fx_add(D.ui_tick(3200 + (q % 5) * 170, 0.3, body=False), tq, 0.08, -0.6 + i * 0.6)
for i in range(3):
    _fx_add(paper(0.3, -0.6 + i * 0.6), t + 2.45 + i * 0.12, 0.1)                             # the marker passes
_fx_add(st(felt(76, 1.6, 0.5) + felt(77, 1.6, 0.4)), t + 2.2, 0.12, 0.6)                 # one copy is wrong
_fx_add(D.verb(st(felt(74, 2.6, 0.6) + felt(79, 2.6, 0.5)), 0.4), t + 3.0, 0.26)          # «Это одна позиция?»
# → three copies merge into one lit window that drops into the waking city
o_ = O[4]
_fx_add(paper(0.4, 0.0), o_, 0.22)
_fx_add(morph(0.4, 65, 77, (0, 0), 6000), o_ + 0.3, 0.16)
_fx_add(D.shimmer(1.0, 89, 10, seed=31), o_ + 0.45, 0.1)
_fx_add(morph(0.45, 77, 60, (0, 0), 3500), o_ + 0.6, 0.16)

# ---- 33–39 dawn: the city wakes, the mark draws, its frame becomes the window
fx.add(D.shepard_riser(1.3, 140, gate=False), 32.9, 0.1)
fx.add(swell(1.0, 300, 7000), 33.4, 0.16)
fx.add(bloom(41, 0.8), 34.35, 0.4)
for i, tb in enumerate(np.linspace(35.25, 36.15, 7)):
    fx.add(D.verb(st(felt([65, 69, 72, 76, 77, 81, 84][i], 2.4, 0.5), (i - 3) / 5), 0.4), tb, 0.14)  # the mark draws
for i, tb in enumerate([35.6, 35.85, 36.1, 36.35, 36.6, 36.85]):
    _fx_add(D.verb(st(bell([77, 81, 84, 88, 89, 93][i], 2.2, 1.0), (i - 2.5) / 4), 0.45), tb, 0.16)
fx.add(D.shimmer(1.4, 86, 12, seed=3), 37.0, 0.12)
_fx_add(morph(0.85, 60, 72, (0, 0), 6000), 37.98, 0.22)                                # frame → window
_fx_add(land(77, 0.9), 38.8, 0.2)

# ---- 39–148.5 the product: a warm, slowly turning bed with a soft felt ripple
_fx_add(bloom(41, 1.0), 140.9, 0.36)
for i, tb in enumerate([140.92, 140.96, 141.0, 141.04, 141.08, 141.12]):
    _fx_add(D.verb(st(felt([77, 81, 84, 88, 89, 93][i], 3.0, 0.55), (i - 2.5) / 4), 0.5), tb, 0.16)
_fx_add(D.verb(st(felt(72, 5.0, 0.7) + felt(77, 5.0, 0.5)), 0.6), 142.0, 0.3)
_fx_add(D.shimmer(2.6, 84, 18, seed=9), 143.1, 0.14)
_fx_add(D.shepard_riser(1.8, 160, gate=False), 138.6, 0.12)
_fx_add(swell(1.2, 400, 12000), 139.7, 0.18)

# ---------------------------------------------------------------- UI sound design
def click(t, pan=0.0, g=1.0):
    fx.add(D.ui_tick(2600, 0.75), t, 0.3 * g, pan)
    fx.add(st(np.sin(2 * np.pi * 140 * T(0.08)) * np.exp(-T(0.08) * 45)), t, 0.12 * g, pan)


def key(t, i, pan=0.0):
    fx.add(D.ui_tick(3300 + (i % 5) * 170, 0.42, body=False), t, 0.2, pan + 0.1 * np.sin(i * 1.7))


def cam(t, d, f0=250, f1=2800, pan=(-0.3, 0.3), g=0.16, tone=None):
    fx.add(D.tonal_whoosh(d, f0, f1, pan[0], pan[1], tone_midi=tone, q=3.5), t, g)


def ping(t, m, g=0.14, pan=0.0):
    fx.add(D.glass_ping(m, 0.8, 1.3), t, g, pan)


o = lambda x: x + 19
d = TL["dashboard"]
for i, t in enumerate(d["cards"]):
    ping(o(t) - 0.7 + 0.04, 84 + [0, 4, 7, 11][i], 0.12, -0.5 + i * 0.33)
fx.add(D.data_chirps(0.8, 30, 1500, 4800, seed=21), o(20.0), 0.05)
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
_fx_add(morph(0.75, 62, 74, (0.3, 0.0)), 64.45, 0.2)   # «Смета» opens into the ТМЦ window
_fx_add(land(74, 0.8, 0.1), 65.18, 0.18)
tm = TL["tmc"]
cam(o(46.25), 0.6, 300, 2200, (0.1, -0.1), 0.08)
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
_fx_add(morph(0.65, 64, 76, (0.6, 0.2)), 94.48, 0.2)   # «Прогноз потребности» opens into the market
_fx_add(land(76, 0.8, 0.2), 95.12, 0.18)
_fx_add(D.tonal_whoosh(0.6, 300, 2200, 0.1, -0.1, q=3.5), 95.2, 0.07)
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
_fx_add(D.tonal_whoosh(0.8, 300, 2400, 0.3, 0.0, q=3.5), 107.8, 0.08)   # the window straightens
_fx_add(morph(0.55, 72, 64, (0.0, 0.0)), 108.72, 0.2)                    # …and condenses into the dialog
_fx_add(land(69, 0.8), 109.22, 0.18)

# Signature (v1 + 50)
g = TL["sign"]
s_ = lambda x: x + 50  # v3 clock; fx.add maps it
click(s_(g["clickSign"]), 0.2)
for i, t in enumerate(g["steps"]):
    fx.add(D.data_chirps(0.35, 35, 1600, 5000, seed=50 + i), s_(t) - 0.35, 0.05)
    ping(s_(t), [84, 86, 88, 91][i], 0.12)
fx.add(swell(1.6, 300, 9000), s_(g["stamp"]) - 1.3, 0.22)
fx.add(D.reverse_swell(0.6, 8000), s_(g["stamp"]) - 0.3, 0.25)
fx.add(D.stamp(1.0), s_(g["stamp"]) + 0.28, 0.5)
fx.add(warm_hit(41, 0.8), s_(g["stamp"]) + 0.28, 0.35)
_fx_add(morph(0.45, 72, 60, (0, 0), 4000), 114.05, 0.2)   # the signed document condenses into a point
_fx_add(bloom(41, 0.7), 114.5, 0.3)                           # …which blooms into the effects
_fx_add(D.shimmer(1.2, 89, 10, seed=61), 114.55, 0.1)

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
F = fx.b[:N]
M = D.verb(M, 0.12)[:N]
duck = np.ones(N)
tt_ = np.arange(int(0.32 * SR)) / SR
shape = 1 - 0.28 * np.exp(-tt_ / 0.09)
for kq in kicks:
    i0 = int(kq * SR)
    j0 = min(N, i0 + len(shape))
    if i0 < N:
        duck[i0:j0] = np.minimum(duck[i0:j0], shape[: j0 - i0])
M = M - bp(M, 170, 420) * 0.3  # de-box the pads
tsec = np.arange(N) / SR
# breathe out before the big moments
auto = np.ones(N)
for a, b, depth in [(NT(x), NT(y), z) for x, y, z in [(33.9, 34.35, 0.5), (g["stamp"] + 52.5 - 0.3, g["stamp"] + 52.5 + 0.28, 0.55), (140.55, 140.9, 0.35)]]:
    m = (tsec >= a) & (tsec < b)
    k = np.clip((tsec - a) / (b - a), 0, 1)
    auto[m] = np.minimum(auto[m], 1 - (1 - depth) * k[m] ** 0.7)
M *= auto[:, None]
mix = M * duck[:, None] * 0.95 + F * 0.9
rms = np.sqrt(signal.lfilter([1 - 0.9995], [1, -0.9995], (mix ** 2).mean(1)) + 1e-12)
mix *= np.minimum(1, (0.16 / np.maximum(rms, 1e-6)) ** 0.22)[:, None]
mix = hp(mix, 30, 2)
mix = mix - lp(mix, 110) * 0.4 + hp(mix, 2500) * 0.25 + hp(mix, 7000) * 0.4  # clean low end, a little air on top
mix *= (np.clip((DUR - tsec) / 2.5, 0, 1) ** 1.5)[:, None]

# ---------------------------------------------------------------- the 1.2 s ФКР card in front
INTRO = 1.2  # = INTRO in src/v3/Intro.tsx
I0 = int(INTRO * SR)
full = np.zeros((N + I0, 2))
full[I0:] += mix


def put(x, at, gg):
    x = st(x) if x.ndim == 1 else x
    i = int(at * SR)
    j = min(i + len(x), len(full))
    full[i:j] += x[: j - i] * gg


put(air_pad([65, 69, 72, 76], 3.2, cut=3000, a=0.12, r=2.0), 0.0, 0.16)
for i, m in enumerate([65, 69, 72, 77]):
    put(D.verb(st(felt(m, 3.0, 0.55), (i - 1.5) / 4), 0.45), 0.02 + i * 0.05, 0.12)
put(D.glass_ping(89, 0.6, 1.8), 0.1, 0.06)
put(morph(0.7, 65, 77, (0, 0), 5000) * 0.9, 0.62, 0.22)                 # into the lit window
put(land(65, 0.6), 1.26, 0.12)

meter = pyln.Meter(SR)
full = pyln.normalize.loudness(full, meter.integrated_loudness(full), -14.0)
peak = np.abs(full).max(1)
gl = np.minimum(1, 0.88 / np.maximum(peak, 1e-9))
gl = minimum_filter1d(gl, int(0.004 * SR))
a = np.exp(-1 / (0.06 * SR))
out = np.empty_like(gl)
cur = 1.0
for i in range(len(gl)):
    cur = gl[i] if gl[i] < cur else a * cur + (1 - a) * gl[i]
    out[i] = cur
full *= out[:, None]
print("LUFS", round(meter.integrated_loudness(full), 2), "peak", round(float(np.abs(full).max()), 3), "dur", round(len(full) / SR, 2))
os.makedirs(os.path.join(ROOT, "public/audio/v7"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/v7/soundtrack.wav"), full.astype(np.float32), SR, subtype="PCM_24")
print("ok")
