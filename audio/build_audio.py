"""Soundtrack for the ФКР promo: music bed + sound design, locked to src/timeline.json.

Everything is synthesized here except a few CC0 UI sounds (Kenney, via soundcn) and
Remotion's public SFX. Output: public/audio/soundtrack.wav (48 kHz stereo, ~-14 LUFS).
"""
import json
import os
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src/timeline.json")))
SR = 48000
DUR = TL["duration"]
N = int(DUR * SR)
BEAT = 60 / TL["bpm"]
BAR = BEAT * 4
rng = np.random.default_rng(7)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def stereo(x, pan=0.0):
    """Equal-power pan, pan in [-1, 1]."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


class Bus:
    def __init__(self):
        self.buf = np.zeros((N + SR * 4, 2))

    def add(self, x, at, gain=1.0, pan=0.0):
        if x.ndim == 1:
            x = stereo(x, pan)
        i = int(round(at * SR))
        if i < 0:
            x = x[-i:]
            i = 0
        j = min(i + len(x), len(self.buf))
        self.buf[i:j] += x[: j - i] * gain


def polyblep(t, dt):
    dt = np.broadcast_to(dt, t.shape)
    out = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    out[m] = x + x - x * x - 1
    m2 = t > 1 - dt
    x = (t[m2] - 1) / dt[m2]
    out[m2] = x * x + x + x + 1
    return out


def saw(freq, dur, phase0=0.0, detune_cents=0.0, vib=0.0):
    n = int(dur * SR)
    f = freq * 2 ** (detune_cents / 1200) * np.ones(n)
    if vib:
        f *= 1 + vib * np.sin(2 * np.pi * 5.2 * np.arange(n) / SR)
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    return 2 * ph - 1 - polyblep(ph, dt)


def sine(freq, dur, phase=0.0):
    return np.sin(2 * np.pi * freq * t_arr(dur) + phase)


def adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    s_len = max(0, n - a - d - r)
    env = np.concatenate([
        np.linspace(0, 1, max(a, 1), endpoint=False),
        np.linspace(1, s, max(d, 1), endpoint=False),
        np.full(s_len, s),
        np.linspace(s, 0, max(r, 1)),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def lp(x, fc, order=2):
    fc = min(fc, SR * 0.45)
    sos = signal.butter(order, fc, "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def sweep_lp(x, f_start, f_end, block=256, q_order=2):
    """Time-varying low-pass (log sweep)."""
    out = np.zeros_like(x)
    nb = int(np.ceil(len(x) / block))
    zi = None
    for b in range(nb):
        k = b / max(nb - 1, 1)
        fc = f_start * (f_end / f_start) ** k
        sos = signal.butter(q_order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
        seg = x[b * block:(b + 1) * block]
        if zi is None:
            zi = np.zeros((sos.shape[0], 2)) if seg.ndim == 1 else np.zeros((sos.shape[0], 2, seg.shape[1]))
        y, zi = signal.sosfilt(sos, seg, axis=0, zi=zi)
        out[b * block:(b + 1) * block] = y
    return out


def make_ir(dur=2.6, predelay=0.02, damp=6000, seed=3):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 6.9 / dur)
    ir = r.standard_normal((n, 2)) * env[:, None]
    ir = lp(ir, damp)
    ir[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]
    ir = np.concatenate([np.zeros((int(predelay * SR), 2)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


IR_HALL = make_ir(3.2, 0.03, 5200)
IR_ROOM = make_ir(1.1, 0.01, 7000, seed=9)


def reverb(x, ir, wet):
    if x.ndim == 1:
        x = stereo(x)
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet * 2.2


def delay(x, time, fb=0.35, mix=0.3, pingpong=True):
    if x.ndim == 1:
        x = stereo(x)
    d = int(time * SR)
    out = x.copy()
    tap = x.copy()
    for k in range(1, 7):
        tap = np.roll(tap, d, axis=0) * fb
        tap[:d] = 0
        if pingpong:
            tap = tap[:, ::-1]
        out += tap * mix / fb
    return out


def load(path, gain=1.0):
    x, sr = sf.read(path, always_2d=True)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr, axis=0)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    x = x / (np.max(np.abs(x)) + 1e-9)
    return x * gain


SFX = os.path.join(ROOT, "sfxsrc")


def K(name, gain=1.0):
    return load(os.path.join(SFX, name + ".ogg"), gain)


def RM(name, gain=1.0):
    return load(os.path.join(SFX, "rm_" + name + ".wav"), gain)


# ------------------------------------------------------------------ instruments

def kick(vel=1.0):
    d = 0.5
    t = t_arr(d)
    f = 48 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * 0.25
    x = np.tanh((body + click) * 1.6) * vel
    return x


def clap(vel=1.0):
    d = 0.45
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    env = np.zeros(len(t))
    for o in (0.0, 0.011, 0.022):
        i = int(o * SR)
        env[i:] += np.exp(-(t[: len(t) - i]) * 90) * 0.7
    env += np.exp(-t * 16) * 0.35
    x = bp(n * env, 900, 5200)
    return x * vel * 1.4


def hat(vel=1.0, open_=False):
    d = 0.35 if open_ else 0.07
    t = t_arr(d)
    x = hp(rng.standard_normal(len(t)), 7500) * np.exp(-t * (9 if open_ else 55))
    return x * vel


def snare(vel=1.0):
    d = 0.3
    t = t_arr(d)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30)
    nz = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 22)
    return (tone * 0.5 + nz) * vel


def supersaw(notes, dur, cutoff=2400, voices=5, spread=18, attack=0.3, release=0.6):
    out = np.zeros(int(dur * SR))
    for m in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) * spread / ((voices - 1) / 2)
            out += saw(midi_hz(m), dur, phase0=rng.random(), detune_cents=det)
    out = lp(out, cutoff, 2) / (len(notes) * voices) * 2.2
    return out * adsr(len(out), attack, 0.2, 0.9, release)


def pad_stereo(notes, dur, cutoff=2400, attack=0.3, release=0.8):
    L = supersaw(notes, dur, cutoff, attack=attack, release=release)
    R = supersaw(notes, dur, cutoff, attack=attack, release=release)
    return hp(np.stack([L, R], axis=1), 140)


def bass(m, dur, cutoff=420):
    x = saw(midi_hz(m), dur) * 0.6 + np.sign(sine(midi_hz(m), dur)) * 0.25 + sine(midi_hz(m) / 2, dur) * 0.0
    sub = sine(midi_hz(m - 12), dur) * 0.9
    x = lp(x, cutoff, 2) + sub
    return x * adsr(len(x), 0.005, 0.1, 0.85, 0.06)


def pluck(m, dur=0.4, bright=4500, vel=1.0):
    x = saw(midi_hz(m), dur) * 0.7 + saw(midi_hz(m), dur, detune_cents=7) * 0.5
    n = len(x)
    t = np.arange(n) / SR
    # filter envelope approximated by blending a bright and a dark copy
    bright_x = lp(x, bright)
    dark_x = lp(x, 700)
    mixk = np.exp(-t * 14)
    y = bright_x * mixk + dark_x * (1 - mixk)
    return y * np.exp(-t * 7) * vel


def bell(m, dur=2.5, vel=1.0):
    t = t_arr(dur)
    f = midi_hz(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2)
    x += np.sin(2 * np.pi * f * 2 * t) * 0.25 * np.exp(-t * 4)
    x[: 96] *= np.linspace(0, 1, 96)
    return x * vel * 0.6


def boom(dur=2.4, f0=70, f1=32, vel=1.0):
    t = t_arr(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 1.8)
    x += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 9) * 0.5
    x[:48] *= np.linspace(0, 1, 48)
    return np.tanh(x * 1.5) * vel


def noise_riser(dur, f0=300, f1=9000, curve=2.2):
    n = rng.standard_normal(int(dur * SR))
    y = sweep_lp(n, f0, f1)
    y = hp(y, 150)
    env = np.linspace(0, 1, len(y)) ** curve
    return y * env


def whoosh(dur=0.7, f0=400, f1=4000, peak=0.55):
    n = rng.standard_normal(int(dur * SR))
    k = np.linspace(0, 1, len(n))
    y = sweep_lp(n, f0, f1) if f1 > f0 else sweep_lp(n, f0, f1)
    y = hp(y, 200)
    env = np.where(k < peak, (k / peak) ** 2, ((1 - k) / (1 - peak)) ** 1.5)
    return y * env


def tick(vel=1.0, f=3200):
    t = t_arr(0.03)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * vel


def glitch(dur=0.14):
    n = int(dur * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        seg = int(rng.uniform(0.006, 0.02) * SR)
        f = rng.uniform(200, 2400)
        tt = np.arange(min(seg, n - i)) / SR
        x[i:i + len(tt)] = np.sign(np.sin(2 * np.pi * f * tt)) * rng.uniform(0.3, 1)
        i += seg
    x = np.round(x * 6) / 6
    return bp(x, 300, 6000) * adsr(n, 0.002, 0.02, 0.8, 0.03)


# ------------------------------------------------------------------ arrangement
import design as D

music = Bus()
drums = Bus()
sfx = Bus()
kicks = []  # times for sidechain


def put(x, at, gain=1.0, pan=0.0):
    sfx.add(x, at, gain, pan)


USER = os.path.join(ROOT, "sfx_user")


def slot(name, fallback, gain_user=0.8):
    """Licensed library sound dropped into sfx_user/<name>.(wav|mp3|aif|ogg) replaces the synthesized layer."""
    for ext in ("wav", "mp3", "aif", "aiff", "ogg", "flac"):
        f = os.path.join(USER, f"{name}.{ext}")
        if os.path.exists(f):
            print("  slot", name, "<-", os.path.basename(f))
            return load(f, gain_user)
    return fallback


S = TL["scenes"]
GROOVE = [  # (pad notes, bass root) per bar: F – C – Dm – Bb
    ([53, 57, 60, 65, 69], 41),
    ([52, 55, 60, 64, 67], 36),
    ([50, 53, 57, 62, 65], 38),
    ([50, 53, 58, 62, 65], 34),
]
TENSION = [([50, 53, 57, 62], 38), ([50, 53, 58, 62], 34), ([50, 55, 58, 62], 43), ([49, 52, 57, 61], 45)]

# ================= HOOK 0–8 · night city, four statements
drone = (sine(midi_hz(26), 8.4) * 0.5 + sine(midi_hz(38), 8.4) * 0.2) * adsr(int(8.4 * SR), 1.5, 0.5, 1, 1.2)
music.add(drone, 0.0, 0.5)
music.add(reverb(pad_stereo([50, 57, 62, 65], 8.2, cutoff=900, attack=2.0, release=1.5), IR_HALL, 0.45), 0.0, 0.26)
# city ambience: low engine hum + distant air
_amb = K("sf_spaceEngineLow_000", 1.0)
_amb = np.tile(_amb, (int(np.ceil(8 * SR / len(_amb))), 1))[: int(8 * SR)] * np.linspace(0, 1, int(8 * SR))[:, None] ** 0.5
put(lp(_amb, 900), 0.0, 0.08)
for i in range(16):
    drums.add(D.ui_tick(2200 if i % 2 else 3000, 0.35, body=False), i * BEAT, 0.35, pan=0.3 if i % 2 else -0.3)
for k, t0 in enumerate(TL["hook"]["slams"]):
    put(D.reverse_swell(0.6, 7000), t0 - 0.6, 0.35)
    put(slot("hit_small", D.cine_hit(0.85 + 0.05 * k, ring=[92, 104, 116, 124][k])), t0, 0.62)
    put(D.data_chirps(0.55, 55, 1800, 6400, seed=k), t0 + 0.02, 0.18)  # the counter rolling
    music.add(bell([74, 72, 77, 81][k], 2.5, 0.55), t0 + 0.02, 0.22)
put(D.tonal_whoosh(1.0, 200, 3800, 0.6, -0.6, tone_midi=62, q=4), 7.25, 0.5)

# ================= CHAOS 8–16 · fragmented systems
for b in range(4):
    notes, root = TENSION[b]
    t0 = 8 + b * BAR
    music.add(reverb(pad_stereo(notes, BAR + 0.4, cutoff=1300 + b * 400, attack=0.15, release=0.4), IR_HALL, 0.3), t0, 0.3)
    for e in range(8):
        music.add(bass(root, BEAT / 2 * 0.9, cutoff=300 + b * 120 + e * 20), t0 + e * BEAT / 2, 0.4)
    for e in range(16):
        drums.add(hat(0.35 + 0.25 * (e % 2)), t0 + e * BEAT / 4, 0.3, pan=0.25 * np.sin(e))
    drums.add(kick(0.8), t0, 0.7)
    drums.add(kick(0.6), t0 + 2 * BEAT, 0.6)
CARD_X = [330, 1440, 1600, 420, 900, 1080, 180, 1720]
for i, t0 in enumerate(TL["chaos"]["cards"]):
    pan = (CARD_X[i] - 960) / 960
    put(D.tonal_whoosh(0.45, 600, 5000, pan * 0.3, pan, q=6), t0 - 0.3, 0.22)
    put(D.glass_ping(76 + [0, 5, 7, 3, 10, 2, 8, 12][i], 0.7, 1.4), t0 + 0.05, 0.16, )
    put(D.ui_tick(1600, 0.6), t0 + 0.05, 0.25, pan)
for j, t0 in enumerate(TL["chaos"]["glitches"]):
    put(D.stutter_glitch(0.2, seed=j + 10), t0, 0.5)
    put(K("sf_computerNoise_00%d" % (j % 2 * 2)), t0, 0.1)
put(slot("braam", D.braam(38, 2.6, 0.8)), TL["chaos"]["head2"], 0.5)          # "общей картины нет"
put(slot("riser_long", D.shepard_riser(4.0, 110))[: int(4.0 * SR)], 12.0, 0.42)
t0 = 14.0
while t0 < 15.9:
    step = BEAT / 2 if t0 < 14.5 else BEAT / 4 if t0 < 15.0 else BEAT / 8
    drums.add(snare(0.3 + 0.7 * (t0 - 14) / 2), t0, 0.42)
    t0 += step
put(D.power_down(0.9), 15.05, 0.35)
put(D.reverse_swell(1.0, 9000), 15.0, 0.6)

# ================= TURN 16–20 · flash, logo, the drop
imp = TL["turn"]["flash"]
put(slot("hit_main", D.cine_hit(1.15, ring=88, extra=K("sf_lowFrequency_explosion_000"))), imp, 0.85)
put(K("im_impactBell_heavy_001"), imp, 0.18)
music.add(reverb(pad_stereo([53, 57, 60, 64, 67, 72], 4.6, cutoff=3200, attack=0.6, release=1.2), IR_HALL, 0.5), imp, 0.4)
music.add(sine(midi_hz(29), 4.4) * adsr(int(4.4 * SR), 0.2, 0.5, 0.7, 1.5), imp, 0.4)
put(D.scan_sweep(1.1, True), TL["turn"]["draw"][0], 0.35)       # the frame being drawn
for i, t0 in enumerate(TL["turn"]["windows"]):
    put(D.glass_ping([77, 81, 84, 88, 91, 93][i], 0.9, 2.0), t0, 0.26, (i - 2.5) / 4)
put(D.shimmer(1.6, 86, 14), TL["turn"]["title"], 0.3)
_r = slot("riser_short", D.shepard_riser(1.4, 220, gate=True))
put(_r[-int(1.0 * SR):] if len(_r) > SR else _r, 20.0 - min(1.0, len(_r) / SR), 0.45)
put(D.reverse_swell(0.6, 10000), 19.4, 0.5)
put(D.tonal_whoosh(0.9, 250, 7000, 0, 0, tone_midi=65, q=3), TL["turn"]["expand"], 0.55)  # fly through the frame
put(slot("braam_drop", D.braam(41, 2.4, 1.0)), 20.0, 0.38)                           # the drop
put(D.cine_hit(0.9, ring=110), 20.0, 0.55)


# ================= GROOVE
def groove(start, end, arp=False, intensity=1.0, drums_on=True, filt=None):
    t0 = start
    while t0 < end - 1e-6:
        bar_len = min(BAR, end - t0)
        notes, root = GROOVE[int(round((t0 - 20.0) / BAR)) % 4]
        cutoff = 2600 if filt is None else filt
        music.add(pad_stereo(notes, bar_len + 0.25, cutoff=cutoff, attack=0.02, release=0.25), t0, 0.28 * intensity)
        for e in range(int(bar_len / (BEAT / 2) + 1e-6)):
            m = root + (12 if e in (3, 7) else 0)
            music.add(bass(m, BEAT / 2 * 0.85, cutoff=520), t0 + e * BEAT / 2, 0.42 * intensity)
        if arp:
            seq = [notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[4] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12]
            for e in range(int(bar_len / (BEAT / 4) + 1e-6)):
                music.add(stereo(pluck(seq[e % 8], 0.3, 5200, 0.8 if e % 4 == 0 else 0.55), 0.35 * np.sin(e * 0.9)), t0 + e * BEAT / 4, 0.15 * intensity)
        if drums_on:
            for bt in range(int(bar_len / BEAT + 1e-6)):
                tb = t0 + bt * BEAT
                drums.add(kick(1.0), tb, 0.95 * intensity)
                kicks.append(tb)
                if bt % 2 == 1:
                    drums.add(reverb(clap(1.0), IR_ROOM, 0.25), tb, 0.4 * intensity)
                drums.add(hat(0.7, open_=True), tb + BEAT / 2, 0.15 * intensity, pan=0.2)
                for s16 in range(4):
                    drums.add(hat(0.4 + 0.3 * (s16 % 2)), tb + s16 * BEAT / 4, 0.15 * intensity, pan=-0.25)
        t0 += BAR


groove(20.0, 36.0, arp=False)
groove(36.0, 50.0, arp=True)
for i in range(8):
    drums.add(snare(0.4 + i * 0.08), 50.5 + i * BEAT / 8, 0.45)
groove(51.0, 56.0, arp=True)
groove(56.0, 60.0, arp=False, drums_on=False, filt=900, intensity=0.85)
for bt in range(8):
    if bt % 2 == 0:
        drums.add(kick(0.55), 56.0 + bt * BEAT, 0.5)
groove(60.0, 68.0, arp=True)

# ================= OUTRO
music.add(reverb(pad_stereo([41, 53, 57, 60, 64, 67, 72], 7.5, cutoff=3800, attack=0.02, release=4.0), IR_HALL, 0.55), 68.4, 0.42)
music.add(sine(midi_hz(29), 6.0) * adsr(int(6.0 * SR), 0.01, 0.5, 0.6, 4.0), 68.4, 0.45)

# ------------------------------------------------------------------ UI sound design
def click(t0, pan=0.0, gain=1.0):
    put(slot("ui_click", K("click_002", 1.0)), t0 - 0.004, 0.32 * gain, pan)
    put(D.ui_tick(2600, 0.8), t0, 0.32 * gain, pan)


def key(t0, i, pan=0.0):
    put(D.ui_tick(3400 + (i % 5) * 180, 0.45, body=False), t0, 0.28, pan + 0.1 * np.sin(i * 1.7))
    put(K(["tick_001", "tick_002", "click_004"][i % 3], 1.0), t0, 0.1, pan)


def cam(t0, dur, f0=250, f1=2800, pan=(-0.3, 0.3), gain=0.22, tone=None):
    """Every camera move gets an air whoosh."""
    put(slot("whoosh_%d" % (int(t0 * 10) % 3 + 1), D.tonal_whoosh(dur, f0, f1, pan[0], pan[1], tone_midi=tone, q=3.5)), t0, gain)


d = TL["dashboard"]
cam(19.45, 0.9, 200, 4500, (0, 0), 0.35, tone=60)
put(D.scan_sweep(0.8), 20.3, 0.18)
for i, t0 in enumerate(d["cards"]):
    put(D.glass_ping(84 + [0, 4, 7, 11][i], 0.8, 1.2), t0 + 0.04, 0.14, -0.5 + i * 0.33)
    put(D.ui_tick(1800, 0.5), t0 + 0.04, 0.2, -0.5 + i * 0.33)
put(D.data_chirps(0.8, 35, 1500, 4800, seed=21), 20.7, 0.1)   # numbers counting up
click(d["clickYears"], 0.3)
cam(24.35, 1.0, 300, 3000, (0.2, -0.2), 0.28)
put(D.scan_sweep(1.2, True), d["mapPush"], 0.22)               # map draws in
for i, t0 in enumerate(d["clusters"]):
    put(D.glass_ping(84 + [0, 3, 5, 7, 10, 12, 15, 12, 10, 7, 5, 3][i], 0.7, 1.0), t0, 0.12, -0.6 + i / 9)
click(d["clickCluster"], -0.1)
put(D.ui_tick(1200, 0.8), d["clickCluster"] + 0.05, 0.25)
cam(28.6, 0.9, 2800, 300, (-0.2, 0.2), 0.22)

o = TL["objects"]
click(o["clickNav"], -0.6)
put(D.tonal_whoosh(0.4, 1500, 6000, -0.5, 0.5, q=6), o["clickNav"] + 0.02, 0.14)
for i, t0 in enumerate(o["rows"]):
    put(D.ui_tick(2000 + i * 160, 0.5, body=False), t0 + 0.05, 0.25, 0.4)
cam(31.9, 0.8, 300, 3500, (0.4, 0.0), 0.22)
click(o["clickSearch"], 0.4)
for i, t0 in enumerate(o["type"]):
    key(t0, i, 0.3)
put(D.data_chirps(0.35, 60, 2500, 7000, seed=31), o["filter"] - 0.05, 0.16)
put(D.tonal_whoosh(0.5, 4000, 700, 0.3, -0.3, q=5), o["filter"], 0.22)  # rows collapse
click(o["clickRow"], -0.3)
put(K("sf_doorOpen_000"), o["open"] - 0.05, 0.1)
cam(o["open"] - 0.05, 0.8, 400, 5000, (-0.5, 0.5), 0.25, tone=67)
cam(37.1, 0.9, 2500, 300, (0.3, -0.3), 0.18)

ob = TL["object"]
cam(39.0, 0.9, 300, 3200, (0.3, -0.1), 0.22)
click(ob["clickGantt"], 0.2)
for i, t0 in enumerate(ob["bars"]):
    put(D.tonal_whoosh(1.1, 500, 4500, -0.6, 0.6, tone_midi=72 + i * 4, q=7), t0, 0.14)
put(D.glass_ping(91, 0.8), ob["bars"][2] + 0.6, 0.15)            # "today" line
cam(ob["fan"] - 0.1, 1.2, 200, 4000, (0, 0), 0.32, tone=62)
put(D.reverse_swell(0.5), ob["fan"] - 0.5, 0.25)
for i, t0 in enumerate(ob["fanCards"]):
    put(K(["drop_001", "drop_002", "drop_003"][i % 3], 1.0), t0 + 0.08, 0.13, -0.7 + i * 0.2)
    put(D.glass_ping(79 + [0, 2, 4, 7, 9, 12, 14, 16][i], 0.6, 1.0), t0 + 0.08, 0.09, -0.7 + i * 0.2)
put(slot("whip", D.whip(0.42)), 45.7, 0.6)
put(D.cine_hit(0.5, ring=130), 46.1, 0.25)

tm = TL["tmc"]
cam(46.2, 0.7, 5000, 400, (0.8, 0.0), 0.32)
put(K("maximize_001"), 46.35, 0.12)
cam(47.3, 0.8, 300, 3000, (0, 0.2), 0.22)
click(tm["clickQty"], 0.1)
for i, t0 in enumerate(tm["type"]):
    key(t0, i, 0.1)
put(D.data_chirps(0.3, 70, 3000, 7000, seed=41), tm["limit"] - 0.28, 0.16)  # the check runs
put(slot("ui_alert", K("error_004")), tm["limit"], 0.42)
put(D.braam(38, 1.8, 0.7), tm["limit"], 0.32)
put(D.stutter_glitch(0.16, seed=77), tm["limit"] + 0.02, 0.3)
put(D.glass_ping(70, 0.7), tm["limit"] + 0.12, 0.14)
click(49.45, -0.2)
for i in range(14):
    key(49.6 + i * 0.055, i, -0.1)
cam(50.05, 0.7, 2000, 500, (0.2, -0.2), 0.16)
click(tm["clickSend"], 0.3)
put(K("confirmation_001"), tm["clickSend"] + 0.12, 0.2)
cam(tm["clickSend"] + 0.2, 1.0, 300, 6000, (0, 0), 0.32, tone=67)
put(D.scan_sweep(1.0, True), tm["route"], 0.2)
for i, t0 in enumerate([tm["route"] + 0.3] + tm["steps"]):
    put(D.glass_ping([72, 74, 77, 79, 84][i], 1.0, 1.6), t0, 0.22, -0.6 + i * 0.3)
    put(D.ui_tick(2200, 0.7), t0, 0.22, -0.6 + i * 0.3)
    put(D.tonal_whoosh(0.5, 800, 4000, -0.8 + i * 0.3, -0.5 + i * 0.3, q=8), t0 - 0.45, 0.1)
cam(55.85, 0.6, 3000, 300, (0, 0), 0.16)

g = TL["sign"]
put(K("maximize_006"), g["dialog"], 0.16)
cam(g["dialog"] - 0.1, 0.7, 300, 3500, (0, 0), 0.18)
click(g["clickSign"], 0.2)
for i, t0 in enumerate(g["steps"]):
    put(D.data_chirps(0.4, 45, 1600, 5000, seed=50 + i), t0 - 0.38, 0.1)
    put(D.glass_ping(84 + [0, 2, 4, 7][i], 0.7, 1.0), t0, 0.15)
put(D.reverse_swell(0.7, 9000), g["stamp"] - 0.4, 0.45)
put(slot("hit_stamp", D.stamp(1.0)), g["stamp"] + 0.28, 0.75)
put(D.cine_hit(0.7, ring=98), g["stamp"] + 0.28, 0.35)
put(D.shimmer(1.4, 88, 10, seed=8), g["stamp"] + 0.5, 0.18)

r = TL["roles"]
for i in range(3):
    cam(r["fan"] + i * 0.18 - 0.1, 0.9, 300, 4200, (-0.8 + i * 0.8, -0.8 + i * 0.8), 0.2)
for i, t0 in enumerate(r["links"]):
    put(D.scan_sweep(0.7, True), t0, 0.1)
    put(D.glass_ping([79, 84, 88][i], 0.8, 1.4), t0 + 0.05, 0.16, -0.5 + i * 0.5)
put(D.data_chirps(3.0, 14, 2000, 6000, seed=61), 63.6, 0.06)    # data flowing between cabinets

c = TL["close"]
put(D.shepard_riser(0.9, 300), 67.0, 0.3)
put(D.tonal_whoosh(0.9, 300, 6000, 0, 0, tone_midi=72, q=3), 67.55, 0.4)  # converge
put(slot("hit_final", D.cine_hit(1.1, ring=88, extra=K("sf_lowFrequency_explosion_001"))), 68.4, 0.7)
for t0, m in zip([68.4, 68.75, 68.95, 69.15], [77, 81, 84, 89]):
    put(D.glass_ping(m, 1.0, 2.2), t0, 0.24)
put(D.scan_sweep(1.0, True), 68.55, 0.2)                         # the frame redraws
put(D.glass_ping(72, 1.0, 3.5), c["logo"], 0.28)
put(D.shimmer(2.4, 84, 18, seed=9), c["tagline"], 0.22)

# ------------------------------------------------------------------ mix
mus = music.buf[:N]
dr = drums.buf[:N]
fx = sfx.buf[:N]

# sidechain pump on the music bed
env = np.ones(N)
tt = np.arange(int(0.32 * SR)) / SR
duck = 1 - 0.55 * np.exp(-tt / 0.09)
for kt in kicks:
    i = int(kt * SR)
    j = min(N, i + len(duck))
    env[i:j] = np.minimum(env[i:j], duck[: j - i])
mus = mus * env[:, None]

# glue reverb on music
mus = reverb(mus, IR_HALL, 0.12)

# hold, then hit: the bed breathes out right before each big moment
auto = np.ones(N)
tsec = np.arange(N) / SR
for a, b, depth in [(15.55, 16.0, 0.08), (19.7, 20.0, 0.12), (59.9, 60.28, 0.35), (68.05, 68.4, 0.1), (47.9, 48.5, 0.6)]:
    k = np.clip((tsec - a) / (b - a), 0, 1)
    m = (tsec >= a) & (tsec < b)
    auto[m] = np.minimum(auto[m], 1 - (1 - depth) * k[m] ** 0.6)
# hook: let the statements land on a quiet bed
auto[tsec < 8] *= 0.7
mus = mus * auto[:, None]
dr = dr * auto[:, None]
mix = mus * 0.62 + dr * 0.6 + fx * 1.0

# a breath of near-silence right before the two biggest hits
for a, b in [(15.92, 16.0), (19.95, 20.0)]:
    i, j = int(a * SR), int(b * SR)
    ramp = np.concatenate([np.linspace(1, 0.04, int(0.012 * SR)), np.full(j - i - int(0.012 * SR), 0.04)])
    mix[i:j] *= ramp[:, None]

# gentle tilt EQ and fades
mix = mix - lp(mix, 35) * 0.6  # tame sub rumble below 35 Hz
fade_in = np.minimum(1, np.arange(N) / (0.05 * SR))
fade_out = np.clip((DUR - np.arange(N) / SR) / 3.0, 0, 1) ** 1.5
mix *= (fade_in * fade_out)[:, None]

# loudness to -14 LUFS, then a soft limiter
meter = pyln.Meter(SR)
loud = meter.integrated_loudness(mix)
mix = pyln.normalize.loudness(mix, loud, -14.0)


def limiter(x, ceiling=0.89, release=0.08):
    peak = np.max(np.abs(x), axis=1)
    gain = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    # look-ahead smoothing: minimum filter then release
    win = int(0.003 * SR)
    g = np.minimum.accumulate(gain[::-1])[::-1] if False else gain
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(g, size=win * 2 + 1)
    a = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]
        out[i] = cur
    return x * out[:, None]


mix = limiter(mix)
print("LUFS in:", round(loud, 2), "→ out:", round(meter.integrated_loudness(mix), 2), "peak:", round(float(np.max(np.abs(mix))), 3))
os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
sf.write(os.path.join(ROOT, "public/audio/soundtrack.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(ROOT, "public/audio/music_only.wav"), (mus * 0.9 + dr * 0.75).astype(np.float32) / max(1e-9, np.max(np.abs(mus * 0.9 + dr * 0.75))) * 0.8, SR, subtype="PCM_16")
print("ok")
