"""Cinematic / futuristic sound design elements, synthesized and layered.

Modelled on what modern trailer libraries ship (hits, braams, risers, sub drops,
reverse swells, tonal whooshes, tech glitches) — built from scratch so the film
has its own palette.
"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(42)


def T(d):
    return np.arange(int(d * SR)) / SR


def st(x, pan=0.0, width=0.0):
    a = (pan + 1) * np.pi / 4
    if width:
        d = int(0.012 * SR * width)
        y = np.stack([x * np.cos(a), np.roll(x, d) * np.sin(a)], 1)
        y[:d, 1] = 0
        return y
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def _sos(kind, f, order=2):
    if isinstance(f, (list, tuple)):
        f = [max(20, f[0]), min(f[1], SR * 0.45)]
    else:
        f = min(max(f, 20), SR * 0.45)
    return signal.butter(order, f, kind, fs=SR, output="sos")


def lp(x, f, o=2):
    return signal.sosfilt(_sos("low", f, o), x, axis=0)


def hp(x, f, o=2):
    return signal.sosfilt(_sos("high", f, o), x, axis=0)


def bp(x, lo, hi, o=2):
    return signal.sosfilt(_sos("band", [lo, hi], o), x, axis=0)


def resonant_sweep(x, f0, f1, q=6.0, block=128):
    """Band-pass with a moving centre (log), constant Q — tonal whoosh core."""
    out = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    for b in range(nb):
        k = b / max(nb - 1, 1)
        fc = f0 * (f1 / f0) ** k
        bw = fc / q
        sos = signal.butter(2, [max(30, fc - bw / 2), min(SR * 0.45, fc + bw / 2)], "band", fs=SR, output="sos")
        seg = x[b * block:(b + 1) * block]
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[b * block:(b + 1) * block] = y
    return out


def sweep_lp(x, f0, f1, block=128):
    out = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    for b in range(nb):
        k = b / max(nb - 1, 1)
        fc = f0 * (f1 / f0) ** k
        sos = _sos("low", fc, 2)
        seg = x[b * block:(b + 1) * block]
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[b * block:(b + 1) * block] = y
    return out


def norm(x, peak=1.0):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def soft(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


def ir(dur=3.0, damp=5000, seed=1, predelay=0.025):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = r.standard_normal((n, 2)) * np.exp(-t * 6.9 / dur)[:, None]
    y = lp(y, damp)
    y = np.concatenate([np.zeros((int(predelay * SR), 2)), y])
    return y / np.sqrt(np.sum(y ** 2))


HALL = ir(3.4, 5200, 11)
PLATE = ir(1.8, 9000, 12, 0.008)


def verb(x, wet=0.3, space=None):
    space = HALL if space is None else space
    if x.ndim == 1:
        x = st(x)
    y = np.stack([signal.fftconvolve(x[:, c], space[:, c]) for c in range(2)], 1)
    out = np.zeros_like(y)
    out[: len(x)] += x * (1 - wet)
    out += y * wet * 2.0
    return out


# ------------------------------------------------------------------ elements

def sub_drop(dur=2.2, f0=70, f1=26):
    t = T(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 2.4)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    x[:64] *= np.linspace(0, 1, 64)
    return soft(x, 1.3)


def punch(dur=0.35, f0=180, f1=48):
    t = T(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 35)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    return soft(x, 3.0)


def crack(dur=0.12):
    t = T(dur)
    n = rng.standard_normal(len(t))
    return bp(n, 1200, 11000) * np.exp(-t * 60)


def metal_ring(f0=96.0, dur=3.0):
    t = T(dur)
    ratios = [1.0, 2.76, 5.40, 8.93, 13.34, 2.0]
    amps = [1.0, 0.6, 0.45, 0.3, 0.18, 0.4]
    x = sum(a * np.sin(2 * np.pi * f0 * r * t + rng.random() * 6) * np.exp(-t * (1.2 + r * 0.35)) for r, a in zip(ratios, amps))
    x[:48] *= np.linspace(0, 1, 48)
    return x


def air_tail(dur=3.0, f=2500):
    t = T(dur)
    return lp(rng.standard_normal(len(t)), f) * np.exp(-t * 2.2)


def cine_hit(size=1.0, ring=96.0, extra=None):
    """Trailer impact: sub drop + punch + crack + metal ring + air, into a hall."""
    d = 3.6
    n = int(d * SR)
    layers = np.zeros(n)

    def put(x, g):
        layers[: len(x)] += x[:n] * g

    put(sub_drop(3.0, 72, 26), 1.0 * size)
    put(punch(), 0.8 * size)
    put(crack(), 0.35)
    put(metal_ring(ring, 3.0), 0.16)
    put(air_tail(3.0), 0.12)
    y = st(layers, 0, width=0.6)
    if extra is not None:
        e = extra[: n]
        y[: len(e)] += e * 0.5
    return verb(y, 0.28)


def braam(root_midi=38, dur=2.6, bright=1.0):
    """Low brass-like braam: stacked detuned saws, fast filter bloom, distortion."""
    t = T(dur)
    x = np.zeros(len(t))
    for m in (root_midi, root_midi + 12, root_midi + 19, root_midi + 24):
        f = 440 * 2 ** ((m - 69) / 12)
        for det in (-9, -3, 3, 9):
            ff = f * 2 ** (det / 1200)
            ph = (rng.random() + np.cumsum(np.full(len(t), ff / SR))) % 1
            x += 2 * ph - 1
    env_f = 180 + 2600 * bright * (np.exp(-t * 2.2) * (1 - np.exp(-t * 40)))
    # piecewise filter bloom
    out = np.zeros_like(x)
    blk = 256
    zi = np.zeros((1, 2))
    for b in range(0, len(x), blk):
        sos = _sos("low", float(env_f[b]), 2)
        if zi.shape[0] != sos.shape[0]:
            zi = np.zeros((sos.shape[0], 2))
        yb, zi = signal.sosfilt(sos, x[b:b + blk], zi=zi)
        out[b:b + blk] = yb
    out = soft(norm(out) * 2.2, 2.0)
    amp = (1 - np.exp(-t * 30)) * np.exp(-t * 1.1)
    sub = np.sin(2 * np.pi * 440 * 2 ** ((root_midi - 12 - 69) / 12) * t) * amp
    y = out * amp * 0.7 + sub * 0.6
    return verb(st(y, 0, 0.8), 0.32)


def shepard_riser(dur=4.0, start=110.0, octaves=6, gate=True):
    """Endless-rising Shepard tone + accelerating tremolo: tension that never peaks."""
    t = T(dur)
    k = t / dur
    x = np.zeros(len(t))
    for o in range(octaves):
        pos = (o + k * 1.6) % octaves  # glide 1.6 octaves over the riser
        f = start * 2 ** pos
        amp = np.exp(-0.5 * ((pos - octaves / 2) / (octaves / 5)) ** 2)
        x += np.sin(2 * np.pi * np.cumsum(f) / SR) * amp
    x = norm(x) * k ** 1.6
    if gate:
        rate = 4 + 28 * k ** 2
        trem = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * np.cumsum(rate) / SR))
        trem = lp(trem, 60)
        x = x * trem
    nz = sweep_lp(rng.standard_normal(len(t)), 300, 14000) * k ** 2.5 * 0.5
    return verb(st(x * 0.8 + nz, 0, 0.7), 0.25)


def reverse_swell(dur=1.2, bright=6000):
    """Reverse reverb swell — sucks the ear into the next hit."""
    src = np.zeros(int(0.25 * SR))
    src[:int(0.08 * SR)] = bp(rng.standard_normal(int(0.08 * SR)), 300, bright) * np.exp(-T(0.08) * 25)
    y = verb(src, 1.0)[: int(dur * SR)]
    y = y[::-1]
    y *= np.linspace(0, 1, len(y))[:, None] ** 1.5
    return norm(y, 0.9)


def tonal_whoosh(dur=0.8, f0=300, f1=3200, pan_from=-0.7, pan_to=0.7, tone_midi=None, q=5.0):
    t = T(dur)
    k = t / dur
    n = rng.standard_normal(len(t))
    core = resonant_sweep(n, f0, f1, q)
    body = sweep_lp(rng.standard_normal(len(t)), f0 * 0.5, f1 * 1.5) * 0.35
    env = np.where(k < 0.62, (k / 0.62) ** 2.2, ((1 - k) / 0.38) ** 1.4)
    x = (norm(core) + norm(body) * 0.5) * env
    if tone_midi is not None:
        f = 440 * 2 ** ((tone_midi - 69) / 12) * (0.92 + 0.16 * k)  # doppler glide
        x += np.sin(2 * np.pi * np.cumsum(f) / SR) * env * 0.25
    pans = pan_from + (pan_to - pan_from) * k
    a = (pans + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def whip(dur=0.35):
    return tonal_whoosh(dur, 900, 9000, -0.9, 0.9, q=3.0) * 1.2


def data_chirps(dur=0.6, density=40, lo=1400, hi=5200, seed=0):
    """Fast FM blips — computers thinking."""
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros((n, 2))
    tcur = 0.0
    while tcur < dur:
        L = r.uniform(0.008, 0.028)
        f = r.uniform(lo, hi)
        tt = T(L)
        mod = np.sin(2 * np.pi * f * r.uniform(0.5, 2.5) * tt) * r.uniform(0.5, 3)
        b = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * r.uniform(60, 160))
        i = int(tcur * SR)
        j = min(n, i + len(b))
        out[i:j] += st(b[: j - i], r.uniform(-0.8, 0.8))
        tcur += 1 / density * r.uniform(0.5, 1.5)
    return out * 0.6


def glitch_stutter(src, slices=8, slice_ms=24, crush=6):
    """Repeat a short slice with bit-crush — digital stutter."""
    if src.ndim == 1:
        src = st(src)
    L = int(slice_ms / 1000 * SR)
    piece = src[:L].copy()
    out = np.concatenate([piece * (1 - i / (slices + 2)) for i in range(slices)])
    out = np.round(out * crush) / crush
    return out


def stutter_glitch(dur=0.18, seed=3):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        seg = int(r.uniform(0.004, 0.018) * SR)
        f = r.uniform(120, 3200)
        tt = np.arange(min(seg, n - i)) / SR
        kind = r.integers(0, 3)
        if kind == 0:
            w = np.sign(np.sin(2 * np.pi * f * tt))
        elif kind == 1:
            w = r.standard_normal(len(tt))
        else:
            w = np.sin(2 * np.pi * f * tt) * np.sin(2 * np.pi * f * 7.1 * tt)
        x[i:i + len(tt)] = w * r.uniform(0.3, 1)
        i += seg
    x = np.round(x * 5) / 5
    x = bp(x, 200, 9000)
    return st(x * np.hanning(n) ** 0.3, r.uniform(-0.6, 0.6))


def ui_tick(f=2400, vel=1.0, body=True):
    """Premium UI click: tiny sine blip + noise snap + a whisper of low thump."""
    t = T(0.06)
    blip = np.sin(2 * np.pi * f * t) * np.exp(-t * 180)
    snap = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 400) * 0.5
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 70) * (0.55 if body else 0)
    return st((blip * 0.6 + snap + thump) * vel)


def glass_ping(midi=88, vel=1.0, dur=1.6):
    t = T(dur)
    f = 440 * 2 ** ((midi - 69) / 12)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2)
    x += np.sin(2 * np.pi * f * 2.0 * t) * 0.3 * np.exp(-t * 5)
    x += np.sin(2 * np.pi * f * 3.01 * t) * 0.12 * np.exp(-t * 8)
    x[:32] *= np.linspace(0, 1, 32)
    return verb(st(x * vel), 0.35, PLATE)


def shimmer(dur=2.0, base=84, count=16, seed=5):
    """Granular sparkle of high bell grains."""
    r = np.random.default_rng(seed)
    out = np.zeros((int((dur + 1.6) * SR), 2))
    scale = [0, 2, 4, 7, 9, 12, 14, 16]
    for i in range(count):
        t0 = r.uniform(0, dur) * (i / count) ** 0.5
        m = base + r.choice(scale)
        g = glass_ping(m, r.uniform(0.15, 0.4), 1.2)
        g = g * np.array([r.uniform(0.3, 1), r.uniform(0.3, 1)])
        a = int(t0 * SR)
        b = min(len(out), a + len(g))
        out[a:b] += g[: b - a]
    return out


def scan_sweep(dur=0.9, up=True):
    """Holographic scan: comb-filtered noise sweeping."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    d = (np.linspace(0.004, 0.0006, len(t)) if up else np.linspace(0.0006, 0.004, len(t)))
    idx = np.arange(len(t)) - (d * SR).astype(int)
    idx = np.clip(idx, 0, len(t) - 1)
    comb = n + 0.85 * n[idx]
    x = hp(comb, 800) * np.hanning(len(t))
    return st(x * 0.5, 0, 0.5)


def power_down(dur=0.9):
    """Tape-stop style descent for the implosion."""
    t = T(dur)
    k = t / dur
    f = 420 * (1 - k) ** 2 + 30
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 0.5) / SR)
    x = lp(x, 1800) * (1 - k) ** 0.5
    return st(x * 0.6)


def stamp(vel=1.0):
    """Heavy rubber stamp on a desk + digital confirmation tail."""
    d = 2.6
    n = int(d * SR)
    x = np.zeros(n)
    p = punch(0.4, 140, 52)
    x[: len(p)] += p * 1.0
    thud = bp(rng.standard_normal(int(0.2 * SR)), 150, 1800) * np.exp(-T(0.2) * 35)
    x[: len(thud)] += thud * 0.9
    sd = sub_drop(2.2, 60, 28)
    x[: len(sd)] += sd * 0.7
    y = st(x * vel, 0, 0.4)
    return verb(y, 0.22)
