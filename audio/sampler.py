"""Sampled instruments for the v8 score: Salamander Grand Piano (CC-BY 3.0, Alexander Holm) and
VSCO-2 CE string sections (CC0). Notes are repitched from the nearest sample (polyphase resampling),
cached, and returned as stereo float arrays at 48 kHz that start at zero and end at zero."""
import os, re, functools
from fractions import Fraction
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
PIANO_DIR = os.path.join(HERE, "samples/SalamanderGrandPiano/Samples")
STR_DIR = os.path.join(HERE, "samples/VSCO-2-CE/Strings")
NAMES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def midi_of(name):
    m = re.match(r"([A-G]#?)(-?\d)", name)
    return 12 * (int(m.group(2)) + 1) + NAMES[m.group(1)]


@functools.lru_cache(maxsize=None)
def _load(path):
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    if sr != SR:
        f = Fraction(SR, sr).limit_denominator(1000)
        x = signal.resample_poly(x, f.numerator, f.denominator, axis=0).astype(np.float32)
    # trim leading silence to the onset
    env = np.abs(x).max(1)
    on = int(np.argmax(env > env.max() * 0.02))
    return x[max(0, on - 48):]


def _repitch(x, semis):
    if abs(semis) < 1e-6:
        return x
    r = 2 ** (semis / 12)
    f = Fraction(1 / r).limit_denominator(400)
    return signal.resample_poly(x, f.numerator, f.denominator, axis=0).astype(np.float32)


# ---------------------------------------------------------------- piano
_PIANO = {}
for fn in os.listdir(PIANO_DIR) if os.path.isdir(PIANO_DIR) else []:
    m = re.match(r"([A-G]#?\d)v(\d+)\.flac", fn)
    if m:
        _PIANO.setdefault(midi_of(m.group(1)), {})[int(m.group(2))] = os.path.join(PIANO_DIR, fn)
_PN = sorted(_PIANO)


@functools.lru_cache(maxsize=None)
def _piano_note(m, layer):
    n = min(_PN, key=lambda q: abs(q - m))
    vs = sorted(_PIANO[n])
    v = min(vs, key=lambda q: abs(q - layer))
    return _repitch(_load(_PIANO[n][v]), m - n)


def piano(m, d=2.0, vel=0.7, felt=0.0, release=0.35):
    """One piano note (midi m) held for d seconds, then the damper (release). vel 0..1.
    felt > 0 softens the hammer: a low-pass that closes with felt (0..1)."""
    layer = 4 + round(np.clip(vel, 0, 1) * 12 / 3) * 3   # 4, 7, 10, 13, 16
    x = _piano_note(int(round(m)), int(layer))
    n = min(len(x), int((d + release) * SR))
    y = x[:n].copy()
    k = int(d * SR)
    if k < n:
        y[k:] *= np.linspace(1, 0, n - k)[:, None] ** 2
    y[-64:] *= np.linspace(1, 0, min(64, len(y)))[:, None]
    if felt > 0:
        sos = signal.butter(2, 4200 - 2900 * felt, "low", fs=SR, output="sos")
        y = signal.sosfilt(sos, y, axis=0)
    g = 0.35 + 0.65 * vel
    return (y * g).astype(np.float32)


# ---------------------------------------------------------------- strings (sustain, vibrato)
def _index_strings():
    idx = {}
    for sec, sub in [("violins", "Violin Section/susVib"), ("violas", "Viola Section/susVib"), ("celli", "Cello Section/susvib")]:
        d = os.path.join(STR_DIR, sub)
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            m = re.search(r"_([A-G]#?\d)_v(\d)", fn)
            if m:
                idx.setdefault(sec, {}).setdefault(midi_of(m.group(1)), {})[int(m.group(2))] = os.path.join(d, fn)
    return idx


_STR = _index_strings()


@functools.lru_cache(maxsize=None)
def _str_note(sec, m, layer):
    notes = sorted(_STR[sec])
    n = min(notes, key=lambda q: abs(q - m))
    vs = sorted(_STR[sec][n])
    v = min(vs, key=lambda q: abs(q - layer))
    return _repitch(_load(_STR[sec][n][v]), m - n)


def strings(sec, m, d=3.0, vel=0.5, att=0.35, rel=0.8):
    """A sustained section note with a soft attack; notes longer than the sample are looped with a crossfade."""
    if sec not in _STR:
        return np.zeros((int((d + rel) * SR), 2), np.float32)
    x = _str_note(sec, int(round(m)), 2 if vel > 0.6 else 1)
    need = int((d + rel) * SR)
    body = x[int(0.15 * SR):]
    out = x.copy()
    while len(out) < need:
        L = int(0.4 * SR)
        a, b = out[-L:], body[:L]
        w = np.linspace(0, 1, L)[:, None]
        out = np.concatenate([out[:-L], a * np.sqrt(1 - w) + b * np.sqrt(w), body[L:]])
    y = out[:need].copy()
    ka = int(att * SR)
    y[:ka] *= np.linspace(0, 1, ka)[:, None] ** 1.6
    kr = int(rel * SR)
    y[-kr:] *= np.linspace(1, 0, kr)[:, None] ** 1.5
    return (y * (0.25 + 0.6 * vel)).astype(np.float32)


CREDITS = "Piano: Salamander Grand Piano by Alexander Holm (CC-BY 3.0); strings: VSCO-2 Community Edition (CC0)"
