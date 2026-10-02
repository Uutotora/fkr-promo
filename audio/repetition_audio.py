"""Original 60-second score and frame-locked sound design for «Цена повторения».

Run from fkr-promo: .venv/bin/python audio/repetition_audio.py
Only writes public/audio/repetition/. It never imports build_audio.py.
The safe, definition-only design.py supplies a few existing synthesis primitives.
All orchestration, music, routing and mastering below are specific to this film.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import time

import numpy as np
from scipy import signal, ndimage
import soundfile as sf
import pyloudnorm as pyln
import design as D

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/audio/repetition"
TIMELINE = ROOT / "src/repetition/timeline.json"
SR, FPS, SECONDS = 48000, 60, 60
N = SR * SECONDS
SILENCE = (1428, 1440)
RNG = np.random.default_rng(20472026)
EVENTS: list[dict] = []
BUSES = {name: np.zeros((N, 2), dtype=np.float64)
         for name in ("music", "motion", "ui", "impacts")}


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def ticks(d):
    return np.arange(round(d * SR), dtype=np.float64) / SR


def filt(x, cutoff, kind="lowpass", order=2):
    return signal.sosfilt(signal.butter(order, cutoff, kind, fs=SR, output="sos"), x, axis=0)


def normalize(x, peak=1):
    return x / max(float(np.max(np.abs(x))), 1e-12) * peak


def pan(x, position=0):
    if x.ndim == 2:
        mid, side = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2
        a = (np.clip(position, -1, 1) + 1) * np.pi / 4
        return np.stack((mid * np.cos(a) * np.sqrt(2) + side,
                         mid * np.sin(a) * np.sqrt(2) - side), 1)
    a = (np.clip(position, -1, 1) + 1) * np.pi / 4
    return np.stack((x * np.cos(a), x * np.sin(a)), 1)


def edge(x, attack=.004, release=.035):
    x = x.copy()
    a = min(len(x), max(1, round(attack * SR)))
    b = min(len(x), max(1, round(release * SR)))
    shape = (slice(None),) + (None,) * (x.ndim - 1)
    x[:a] *= (np.sin(np.linspace(0, np.pi / 2, a)) ** 2)[shape]
    x[-b:] *= (np.cos(np.linspace(0, np.pi / 2, b)) ** 2)[shape]
    return x


def record(bus, frame, label, **extra):
    EVENTS.append({"frame": round(frame), "seconds": round(frame / FPS, 6),
                   "bus": bus, "label": label, **extra})


def add(bus, x, sec, gain=1, position=0, label=None):
    x = pan(x, position) * gain
    a = round(sec * SR)
    if a < 0:
        x = x[-a:]
        a = 0
    b = min(N, a + len(x))
    if b > a:
        BUSES[bus][a:b] += x[:b-a]
    if label:
        record(bus, round(sec * FPS), label, gain=round(gain, 4), pan=position)


def reverb(x, length=1.8, wet=.18, seed=1, dark=5500):
    """Decorrelated, tapered late reflections with deterministic early taps."""
    if x.ndim == 1:
        x = pan(x)
    t = ticks(length)
    r = np.random.default_rng(seed)
    ir = filt(r.standard_normal((len(t), 2)), dark)
    ir *= (np.exp(-t * 7 / length) * np.minimum(1, t / .05))[:, None]
    ir = filt(ir, 180, "highpass")
    ir /= np.sqrt(np.sum(ir * ir, axis=0))[None, :]
    ir *= .29
    for delay, amp in ((.027, .34), (.053, .25), (.089, .15)):
        ir[round(delay*SR), 0] += amp
        ir[round((delay+.008)*SR), 1] += amp
    y = np.stack([signal.fftconvolve(x[:, ch], ir[:, ch]) for ch in (0, 1)], 1)
    y *= wet
    y[:len(x)] += x
    return edge(y, .002, .15)


def dotted_delay(x, delay=.375, amount=.14, taps=4):
    if x.ndim == 1:
        x = pan(x)
    d = round(delay * SR)
    out = np.zeros((len(x) + taps*d, 2))
    out[:len(x)] = x
    echo = filt(x, 4300)
    for i in range(1, taps+1):
        out[i*d:i*d+len(x)] += echo[:, ::-1] * amount * .53**(i-1)
        echo = echo[:, ::-1]
    return out


def analog_saw(f, t, phase=0):
    dt = f / SR
    ph = (t*f + phase) % 1
    y = 2*ph-1
    lo = ph < dt
    z = ph[lo]/dt
    y[lo] -= z+z-z*z-1
    hi = ph > 1-dt
    z = (ph[hi]-1)/dt
    y[hi] -= z*z+z+z+1
    return y


def felt(midi, dur=1.7, intensity=1, bright=.55):
    """Warm struck-string / muted electric-piano timbre; no alert-like blips."""
    t = ticks(dur)
    f = hz(midi)
    x = np.zeros(len(t))
    for n, level in ((1, 1), (2, .24), (3, .19), (4, .06), (5, .025)):
        decay = 1.6 + n*(1.1 + (1-bright)*.5)
        x += level*np.sin(2*np.pi*f*n*t + .018*np.sin(2*np.pi*1.8*t)) * np.exp(-t*decay)
    transient = filt(RNG.standard_normal(len(t)), [450, 3200], "bandpass")
    x += transient*np.exp(-t*105)*.065*bright
    return edge(x*intensity, .005, .12)


def chord(notes, dur, open_=False, tension=False):
    t = ticks(dur)
    x = np.zeros((len(t), 2))
    for j,m in enumerate(notes):
        f = hz(m)
        for ch in (0,1):
            det = (-1 if ch == 0 else 1)*(2.0+j*.28)
            ff = f*2**(det/1200)
            sine = np.sin(2*np.pi*ff*t + .16*np.sin(2*np.pi*(.11+j*.02)*t))
            harmonic = analog_saw(ff, t, j*.213+ch*.17)
            x[:, ch] += sine*.7 + filt(harmonic, 1100 if open_ else 480)*(.24 if tension else .16)
    x /= len(notes)**.65
    attack = .24 if open_ else .55
    env = (1-np.exp(-t/attack)) * np.clip((dur-t)/min(1.6,dur*.5),0,1)**1.3
    return edge(filt(x, 165, "highpass")*env[:,None], .01, .15)


def bass(midi, dur=.42, bright=.6):
    t = ticks(dur)
    f = hz(midi)
    fundamental = np.sin(2*np.pi*f*t)
    color = analog_saw(f, t)*.32 + analog_saw(f*1.0031, t, .23)*.2
    color = filt(color, 240+bright*460)
    env = (1-np.exp(-t*260))*np.exp(-t*.7) * np.clip((dur-t)/.065,0,1)
    y = np.tanh((fundamental+color)*1.15)*env
    return edge(y, .003, .03)


def bowed_lead(midi, dur=1.8):
    """Soft saturated sustained voice; an answering phrase above the struck motif."""
    t=ticks(dur)
    x=np.zeros((len(t),2))
    for ch,det in enumerate([-3.2,3.2]):
        f=hz(midi)*2**(det/1200)
        phase=2*np.pi*f*t + .025*np.sin(2*np.pi*4.6*t)
        y=np.sin(phase)+.21*np.sin(2*phase)+.085*np.sin(3*phase)
        y=np.tanh(y*1.15)
        x[:,ch]=y
    env=(1-np.exp(-t*14))*np.clip((dur-t)/.4,0,1)**1.5
    return edge(filt(x,2100)*env[:,None],.018,.12)


def kick(velocity=1, short=False):
    t = ticks(.46 if not short else .25)
    f = hz(26) + 99*np.exp(-t*37)
    y = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*(8 if short else 6.3))
    snap = filt(RNG.standard_normal(len(t)), [1400,6000], "bandpass")*np.exp(-t*270)*.12
    y = np.tanh((y+snap)*1.7)*velocity
    return edge(y, .0008, .045)


def snare(velocity=1, soft=False):
    t=ticks(.36)
    skin=(np.sin(2*np.pi*176*t)+.18*np.sin(2*np.pi*331*t))*np.exp(-t*28)
    air=filt(RNG.standard_normal(len(t)), [900,7800], "bandpass")
    clap_env=sum(np.where(t>=o,np.exp(-np.maximum(0,t-o)*95),0) for o in [0,.010,.019])
    out=skin*.36+air*(np.exp(-t*20)*.45+clap_env*.23)
    if soft:
        out=filt(out, 3900)*.7
    return edge(out*velocity,.0018,.05)


def hat(open_=False, velocity=1):
    t=ticks(.25 if open_ else .075)
    n=RNG.standard_normal(len(t))
    y=filt(n,[6800,14500],"bandpass")*np.exp(-t*(16 if open_ else 90))
    return edge(y*velocity,.001,.018)


def keycap(variant=0, heavy=False):
    """Mechanical actuation, switch body and damped upstroke; no pitched beep."""
    t=ticks(.11)
    noise=RNG.standard_normal(len(t))
    body=np.sin(2*np.pi*(230+17*(variant%4))*t)*np.exp(-t*95)*.35
    attack=filt(noise,[1000+90*(variant%3),6200],"bandpass")*np.exp(-t*260)
    reset=np.where(t>.038, np.exp(-np.maximum(0,t-.038)*240),0)
    y=body+attack*.32+filt(noise,[2600,10000],"bandpass")*reset*.095
    return edge(y*(1.15 if heavy else 1),.00065,.014)


def ui_click(variant=0):
    a=keycap(variant,True)
    b=keycap(variant+2)*.5
    z=np.zeros(len(a)+round(.018*SR))
    z[:len(a)]+=a
    z[round(.018*SR):]+=b
    return z


def tonal_air(dur=.65, rising=True, position=0, weight=1):
    y=D.tonal_whoosh(dur,180 if rising else 4200,4200 if rising else 220,
                      max(-.8,position-.35),min(.8,position+.35),q=3.2)
    y=filt(y,9000)
    y=filt(y,120,"highpass")
    return edge(y*weight,.012,.045)


def impact(weight=1, root=26, length=3):
    """Centred body and sub, broad textured crown, controlled stereo decay."""
    t=ticks(length)
    f=hz(root)+(82-hz(root))*np.exp(-t*8)
    sub=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.1)
    body=np.sin(2*np.pi*(72*t+(145/34)*(1-np.exp(-t*34))))*np.exp(-t*14)
    air=filt(RNG.standard_normal(len(t)),[270,6500],"bandpass")*np.exp(-t*22)
    ring=sum(np.sin(2*np.pi*hz(root+24)*q*t)*np.exp(-t*(2.8+q*.6))*a
             for q,a in [(1,.08),(2.71,.023),(5.12,.014)])
    z=np.tanh(sub*.8+body*.8)*.9+air*.27+ring
    y=reverb(edge(z,.0012,.12),1.65,.2,seed=44,dark=4300)
    return y*weight


def braam(midi=38,length=2.5,bright=.7):
    y=D.braam(midi,length,bright)
    y=filt(filt(y,3900),48,"highpass")
    return edge(y,.014,.3)


def note_at(sec,midi,gain=.15,position=0,delay=True,dur=1.45):
    x=pan(felt(midi,dur),position)
    if delay:
        x=dotted_delay(x)
    add("music",x,sec,gain)


def drums_bar(sec, intensity=1, halftime=False, final=False):
    kicks=[0,.75,1.0,1.625] if not halftime else [0,1.625]
    if final:
        kicks=[0,.75,1.375]
    for k in kicks:
        add("music",kick(.84 if k%1 else 1),sec+k,.34*intensity)
    for k in ([.5,1.5] if not halftime else [1.0]):
        add("music",pan(snare(.9,soft=halftime),.02),sec+k,.205*intensity)
    # Offbeat air is deliberately sparse enough to leave UI transients audible.
    for i in range(16 if not halftime else 8):
        if i%8==7 and not final:
            continue
        at=sec+i*(.125 if not halftime else .25)
        add("music",hat(i%4==2,.75 if i%2 else .45),at,.062*intensity,
            (-.27 if i%2 else .24))
    add("music",keycap(round(sec)%5,True),sec+.375,.1*intensity,-.36)
    add("music",keycap(round(sec+1)%5),sec+1.25,.085*intensity,.36)


def score():
    # ACT I / cost of repetition. D pedal and mechanical cells slowly accumulate.
    # These are quiet rhythmic material, distinct from loud frame-locked UI actions.
    bed=chord([50,57,60,65],8.5,tension=True)
    add("music",bed,0,.13,label="Act I — D minor, mechanical repetition")
    add("music",chord([46,53,57,62],8.2,tension=True),7.8,.13)
    for bar in range(8):
        sec=bar*2
        for j in (0,2,3,6):
            add("music",keycap(bar+j),sec+j*.25,.1+bar*.004,(-.23 if j%2 else .2))
        if bar>=2:
            add("music",kick(.65,True),sec,.12+(bar-2)*.018)
            note_at(sec+.75,[50,53,57,60][bar%4],.055,-.22,True)
        if bar>=4:
            for off in (0, .75,1.5):
                add("music",bass(26,.34,.13),sec+off,.085)
        if bar>=6:
            add("music",snare(.45,True),sec+1.5,.09,.12)
    add("motion",reverb(edge(filt(RNG.standard_normal(round(16*SR)),[160,900],"bandpass"),1.5,.5),1,.1),0,.013,label="Soft mechanical room air")

    # ACT II / expensive repetitions approach their breaking point.
    tension_notes=[[50,57,60,65],[46,53,57,62],[43,50,57,62],[45,52,55,61]]
    for b,notes in enumerate(tension_notes):
        sec=16+b*2
        add("music",chord(notes,2.5,True,True),sec,.19+b*.024,
            label="Build chord %d"%(b+1))
        for i in range(8):
            note_at(sec+i*.25,notes[1+i%3],.07+b*.017,(-.32 if i%2 else .32),True,.75)
        for i in (0,3,4,6):
            add("music",bass([26,22,31,33][b],.32,.4),sec+i*.25,.16)
        drums_bar(sec,.55+b*.1,False,b==3)
    for i in range(15):
        at=22+i*.125
        add("music",snare(.28+i*.024),at,.075+i*.004,(-.12 if i%2 else .12))
    rise=D.shepard_riser(7.8,73.416,6,False)
    add("motion",filt(rise,7000),16,.125,label="7.8 second harmonic tension rise")
    add("motion",D.reverse_swell(1.3,6000),22.5,.3,label="Reverse air toward vacuum")
    record("master",1428,"Absolute silence begins: 12 frames")

    # ACT III / one action becomes an intelligible musical phrase. 7 bars.
    harmony=[([50,57,60,65,69],26),([46,53,57,62,65],22),
             ([43,50,53,57,62],31),([45,52,55,60,64],33),
             ([50,57,60,65,69],26),([48,55,57,62,67],24),
             ([46,53,57,62,65],22)]
    motifs=[[74,69,77,76,74,72,69], [74,77,81,77,74,72,69],
            [74,77,79,77,74,72,69], [76,79,81,79,76,72,69],
            [74,69,77,81,79,77,74], [76,79,81,79,76,74,72],
            [74,77,81,77,74,72,69]]
    offsets=[0,.375,.75,1.0,1.375,1.625,1.875]
    for b,(notes,root) in enumerate(harmony):
        sec=24+b*2
        add("music",chord(notes,2.8,True),sec,.25,label="Drop progression bar %d"%(b+1))
        drums_bar(sec,.95 if b<4 else 1.03)
        for off,m in zip(offsets,motifs[b]):
            note_at(sec+off,m,.105 if off in [0,1] else .074,(-.16 if off<1 else .18),True,1.3)
        for off,delta in [(0,0),(.375,0),(.875,12),(1.25,0),(1.625,7)]:
            add("music",bass(root+delta,.31 if off else .42,.63),sec+off,.245)
        if b in (1,3,4,5):
            answer=[69,72,69,67][[1,3,4,5].index(b)]
            add("music",reverb(bowed_lead(answer,1.65),1.5,.14,seed=64+b),sec+.15,.063)
        if b in (1,3,5):
            # A descending low tom answers every second bar, with no stock riser loop.
            for off,m,g in [(1.5,45,.067),(1.75,38,.085),(1.875,33,.1)]:
                add("music",felt(m,.45,1,.12),sec+off,g,-.2+off*.2)
    add("impacts",impact(1.1,26,3.2),24,.64,label="MAIN DROP: sub + body + textured crown")
    add("impacts",braam(38,2.8,.95),24,.245,label="MAIN DROP: D2 brass-synth bloom")
    add("motion",reverb(tonal_air(1.3,True),2.6,.24,81),24,.09,label="Drop stereo air tail")
    # Add a brief fill at the end of the energetic block, then let the interface breathe.
    for i in range(4):
        add("music",snare(.35+i*.12,True),37.5+i*.125,.09,(-.2 if i%2 else .2))

    # ACT IV / clarity. Half-time, lower density, slower musical answers.
    clear=[([50,57,60,65,69],26),([46,53,57,62,65],22),([43,50,57,62,65],31),
           ([50,57,60,65,69],26),([48,55,60,64,67],24),([45,52,55,61,64],33)]
    for b,(notes,root) in enumerate(clear):
        sec=38+b*2
        add("music",chord(notes,3.0,True),sec,.19,label="Clarity bar %d"%(b+1))
        drums_bar(sec,.56,True)
        for off in (0,1.5):
            add("music",bass(root,.55,.18),sec+off,.17)
        for off,m in zip([0,.75,1.5],[[74,69,65],[74,77,69],[74,77,79],[77,74,69],[76,72,67],[73,76,69]][b]):
            note_at(sec+off,m,.088,(-.27 if off<1 else .27),True,2.0)
    add("motion",D.reverse_swell(.8,4200),49.2,.12,label="Lead-in to economic meaning")

    # ACT V / consequence, then brand. The motif resolves instead of looping out.
    add("impacts",impact(.85,26,2.5),50,.4,label="Meaning resolves at 50 seconds")
    for b,notes in enumerate([[50,57,60,65,69],[46,53,57,62,65]]):
        sec=50+b*2
        add("music",chord(notes,3.0,True),sec,.24)
        drums_bar(sec,.68,True)
        add("music",bass([26,22][b],.9,.2),sec,.2)
        for off,m in zip([0,.5,1.25],[74,77,81] if b==0 else [81,77,74]):
            note_at(sec+off,m,.11,(-.16 if off<1 else .16),True,2)
    add("music",chord([45,52,55,62],1.3,True),54,.13,label="Short suspended chord during brand convergence")
    add("motion",D.reverse_swell(1.2,4600),54,.15,label="Brand convergence anticipation to frame 3312")
    add("impacts",impact(.7,26,3.5),55.2,.3,label="Brand arrives at frame 3312: warm low impact")
    add("music",reverb(chord([50,57,62,65,69,76],4.6,True),2.8,.17,91),55.2,.32,
        label="Dm(add9) final resolution")
    add("music",edge(np.sin(2*np.pi*hz(26)*ticks(4.6))*np.exp(-ticks(4.6)*.65),.025,.4),55.2,.14)
    for at,m,g in [(55.2,74,.14),(55.7,77,.12),(56.2,81,.105),(56.5,77,.075),(57.5,74,.095)]:
        note_at(at,m,g,0,True,2.5)
    record("music",3480,"Resolution held; musical and reverberant tail to 60")


def read_events():
    if not TIMELINE.exists():
        raise FileNotFoundError("Awaiting the shared picture timeline: " + str(TIMELINE))
    data=json.loads(TIMELINE.read_text())
    events=data.get("audioEvents", data.get("soundEvents", []))
    if not events:
        raise ValueError("Timeline has no audioEvents/soundEvents; do not render unsynchronised UI audio")
    return data,events


def sound_events(events):
    for idx,e in enumerate(events):
        frame=int(e["frame"])
        sec=frame/FPS
        kind=e.get("type",e.get("kind","click"))
        gain=float(e.get("gain",1))
        position=float(e.get("pan",0))
        duration=float(e.get("durationFrames",36))/FPS
        label=e.get("id",e.get("label",f"{kind}-{frame}"))
        if SILENCE[0] <= frame < SILENCE[1]:
            record("master",frame,"Suppressed by intentional vacuum: "+label)
            continue
        if kind in ("key","type","typing"):
            add("ui",keycap(idx),sec,.24*gain,position,label)
        elif kind in ("click","press"):
            add("ui",ui_click(idx),sec,.34*gain,position,label)
            add("ui",edge(np.sin(2*np.pi*94*ticks(.09))*np.exp(-ticks(.09)*60),.001,.02),sec,.065*gain,position)
        elif kind in ("move","whoosh","camera","match"):
            add("motion",tonal_air(max(.15,duration),True,position),sec,.145*gain,0,label)
            if kind=="match":
                add("motion",keycap(idx,True),sec+max(0,duration*.62),.12*gain,position)
        elif kind in ("reveal","card","open"):
            add("motion",tonal_air(max(.2,duration),True,position),sec,.105*gain,0,label)
            add("ui",felt([62,65,69,72][idx%4],.65,.55,.25),sec+.035,.062*gain,position)
        elif kind in ("impact","slam","hit"):
            # Fixed score already supplies the large drop, meaning and brand hits.
            if frame in (1440,3000,3312):
                record("impacts",frame,"Timeline marker (score provides impact): "+label)
            else:
                add("impacts",impact(.65,26,1.8),sec,.24*gain,position,label)
        elif kind in ("alert","error","limit"):
            # Low, restrained dissonant mechanism; never a stock notification beep.
            x=keycap(idx,True)+filt(keycap(idx+1),900)*.5
            add("ui",x,sec,.29*gain,position,label)
            add("impacts",braam(38,1.15,.3),sec,.095*gain,position)
            add("ui",felt(61,.7,.4,.2),sec,.047*gain,position)
        elif kind in ("confirm","success","lock","check"):
            add("ui",ui_click(idx),sec,.2*gain,position,label)
            add("ui",reverb(pan(felt(69,1.0,.7,.25),position),.8,.11,idx),sec,.075*gain)
            add("ui",felt(74,.7,.55,.15),sec+.075,.04*gain,position)
        elif kind in ("scan","diff","line"):
            y=D.scan_sweep(max(.18,duration),True)
            add("motion",filt(y,6800),sec,.09*gain,position,label)
            add("ui",keycap(idx),sec+.04,.105*gain,position)
        elif kind in ("pause","silence","drop","brand","resolve"):
            record("master",frame,"Timeline structural marker: "+label)
        else:
            raise ValueError(f"Unknown audio event {kind!r}: {e!r}")


def db(v):
    return float(20*np.log10(max(float(v),1e-15)))


def true_peak(x):
    # ITU-style oversampled peak measurement; final delivered MP4 needs its own test.
    return float(np.max(np.abs(signal.resample_poly(x,4,1,axis=0))))


def render():
    started=time.time()
    timeline,events=read_events()
    print(f"Building 60s score against {TIMELINE}; {len(events)} picture events",flush=True)
    score()
    print("Music arranged; attaching frame events",flush=True)
    sound_events(events)
    sec=np.arange(N)/SR
    # Sidechain from the kick-grid in the main groove. Gentle envelope; ambience breathes.
    pump=np.ones(N)
    for start in np.arange(24,38,2):
        for off in (0,.75,1,1.625):
            a=round((start+off)*SR)
            n=round(.24*SR)
            k=1-.23*np.exp(-np.arange(n)/SR/.058)
            pump[a:a+n]=np.minimum(pump[a:a+n],k[:len(pump[a:a+n])])
    BUSES["music"] *= pump[:,None]
    # Keep interface clicks intelligible without lifting them into harshness.
    for e in events:
        if e.get("type",e.get("kind")) in ("click","key","type","typing","alert","confirm","lock"):
            a=max(0,round((e["frame"]/FPS-.012)*SR)); b=min(N,a+round(.13*SR))
            n=b-a
            depth=.3 if e.get("type",e.get("kind")) in ("key","type","typing") else .17
            BUSES["music"][a:b] *= (1-depth*np.sin(np.linspace(0,np.pi,n))**2)[:,None]
    # Less bed density preceding the semantic and brand hits.
    for a,b,depth in [(37.72,38,.3),(49.68,50,.4),(54.85,55.2,.45)]:
        lo,hi=round(a*SR),round(b*SR)
        env=1-(1-depth)*np.linspace(0,1,hi-lo)**.7
        BUSES["music"][lo:hi]*=env[:,None]
    fade_in=np.minimum(1,sec/.022)
    fade_out=np.clip((60-sec)/2.1,0,1)**1.6
    fade=fade_in*fade_out
    # One common linear treatment keeps stems additive. Cut DC before the vacuum gate.
    for name in BUSES:
        BUSES[name]=filt(BUSES[name],25,"highpass")*fade[:,None]
    cut,end=(round(f/FPS*SR) for f in SILENCE)
    for name in BUSES:
        # 12 ms down-ramp BEFORE the specified twelve silent frames, never within them.
        r=round(.012*SR)
        BUSES[name][cut-r:cut]*=(np.cos(np.linspace(0,np.pi/2,r))**2)[:,None]
        BUSES[name][cut:end]=0
        # Prevent old reverb tails from returning as a discontinuity at the drop.
        # A 1.5 ms attack is far below one frame and preserves the event at f1440.
        a=round(.0015*SR)
        BUSES[name][end:end+a]*=(np.sin(np.linspace(0,np.pi/2,a))**2)[:,None]
    mix=sum(BUSES.values())
    meter=pyln.Meter(SR)
    before=float(meter.integrated_loudness(mix))
    normal_gain=10**((-14-before)/20)
    for name in BUSES:
        BUSES[name]*=normal_gain
    mix=sum(BUSES.values())
    # Look-ahead linked limiter, maximum 4x-detected peaks; modest release preserves hits.
    oversampled=signal.resample_poly(mix,4,1,axis=0)
    peaks=np.max(np.abs(oversampled).reshape(N,4,2),axis=(1,2))
    ahead=ndimage.maximum_filter1d(peaks,size=193,mode="constant")
    ceiling=10**(-1.5/20)
    target=np.minimum(1,ceiling/np.maximum(ahead,1e-10))
    gain=np.empty(N)
    release=np.exp(-1/(.085*SR))
    now=1.
    for i in range(N):
        now=min(target[i],release*now+(1-release)*target[i])
        gain[i]=now
    for name in BUSES:
        BUSES[name]*=gain[:,None]
    mix=sum(BUSES.values())
    peak=true_peak(mix)
    # Guarantee oversampled PCM peak and leave codec headroom.
    final_gain=min(1,10**(-1.3/20)/max(peak,1e-10))
    for name in BUSES:
        BUSES[name]*=final_gain
        BUSES[name][cut:end]=0
    mix=sum(BUSES.values())
    OUT.mkdir(parents=True,exist_ok=True)
    for name,x in BUSES.items():
        sf.write(OUT/f"{name}.wav",x,SR,subtype="PCM_24")
    sf.write(OUT/"soundtrack.wav",mix,SR,subtype="PCM_24")
    EVENTS.sort(key=lambda e:(e["frame"],e["bus"],e["label"]))
    (OUT/"events.json").write_text(json.dumps(EVENTS,ensure_ascii=False,indent=2)+"\n")
    decoded,_=sf.read(OUT/"soundtrack.wav",always_2d=True)
    decoded_stems=[sf.read(OUT/f"{name}.wav",always_2d=True)[0] for name in BUSES]
    stem_error=float(np.max(np.abs(sum(decoded_stems)-decoded)))
    mono=np.mean(decoded,axis=1)
    rms_st=float(np.sqrt(np.mean(decoded*decoded)))
    rms_mono=float(np.sqrt(np.mean(mono*mono)))
    diff=np.max(np.abs(np.diff(decoded,axis=0)),axis=1)
    block_dc=np.abs(decoded.reshape(60,SR,2).mean(axis=1))
    def window(a,b):
        z=decoded[round(a*SR):round(b*SR)]
        return {"start":a,"end":b,"rms_dbfs":db(np.sqrt(np.mean(z*z))),"peak_dbfs":db(np.max(np.abs(z)))}
    # ffmpeg's EBU R128 provides an independent loudness / true peak measurement.
    process=subprocess.run(["ffmpeg","-hide_banner","-nostats","-i",str(OUT/"soundtrack.wav"),
        "-af","ebur128=peak=true:framelog=verbose","-f","null","-"],capture_output=True,text=True,check=True)
    ffsummary=process.stderr[process.stderr.rfind("Summary:"):]
    (OUT/"ffmpeg-loudness.txt").write_text(ffsummary)
    # Lossy-codec stress test: expected final MP4 uses AAC. No video generated here.
    aac=OUT/"qa-aac-320k.m4a"
    subprocess.run(["ffmpeg","-v","error","-i",str(OUT/"soundtrack.wav"),"-c:a","aac","-b:a","320k","-y",str(aac)],check=True)
    raw=subprocess.run(["ffmpeg","-v","error","-i",str(aac),"-f","f32le","-acodec","pcm_f32le","-ac","2","-ar",str(SR),"pipe:1"],capture_output=True,check=True).stdout
    lossy=np.frombuffer(raw,np.float32).reshape(-1,2)[:N]
    report={
        "title":"Цена повторения — audio QA", "duration_seconds":60,"frames":3600,
        "sample_rate":SR,"channels":2,"subtype":"PCM_24",
        "timeline_sha256":hashlib.sha256(TIMELINE.read_bytes()).hexdigest(),
        "picture_events":len(events),"logged_events":len(EVENTS),
        "loudness_lufs":float(meter.integrated_loudness(decoded)),
        "true_peak_dbfs_4x":db(true_peak(decoded)),
        "aac_320k_true_peak_dbfs_4x":db(true_peak(lossy)),
        "sample_peak_dbfs":db(np.max(np.abs(decoded))),
        "nonfinite_samples":int((~np.isfinite(decoded)).sum()),
        "clipped_samples":int((np.abs(decoded)>=1).sum()),
        "dc_left_right":decoded.mean(axis=0).tolist(),
        "worst_one_second_dc":float(block_dc.max()),
        "lr_correlation":float(np.corrcoef(decoded.T)[0,1]),
        "mono_to_stereo_rms_db":db(rms_mono/rms_st),
        "silence_frame_start":1428,"silence_frame_end_exclusive":1440,
        "silence_pcm_nonzero_samples":int(np.count_nonzero(decoded[cut:end])),
        "silence_pcm_rms_dbfs":db(np.sqrt(np.mean(decoded[cut:end]**2))),
        "silence_start_boundary_step":float(np.max(np.abs(decoded[cut]-decoded[cut-1]))),
        "drop_start_boundary_step":float(np.max(np.abs(decoded[end]-decoded[end-1]))),
        "stem_sum_max_absolute_error":stem_error,
        "aac_silence_interior_rms_dbfs":db(np.sqrt(np.mean(lossy[cut+512:end-512]**2))),
        "max_adjacent_sample_step":float(diff.max()),
        "max_adjacent_step_at_seconds":float(np.argmax(diff)/SR),
        "adjacent_step_percentile_99_99":float(np.quantile(diff,.9999)),
        "limiter_max_reduction_db":-db(gain.min()),
        "limiter_samples_reduced_over_3db_percent":float(np.mean(gain<10**(-3/20))*100),
        "last_frame_peak_dbfs":db(np.max(np.abs(decoded[-800:]))),
        "windows":[window(a,b) for a,b in [(0,8),(8,16),(16,23.8),(23.8,24),(24,24.3),(24,38),(38,50),(50,54),(54,58),(58,60)]],
        "render_seconds":round(time.time()-started,2),
        "verification_scope":"Code, numeric waveform/codec checks; no subjective listening claimed.",
        "sources":"Original synthesis; existing definition-only audio/design.py primitives. No external purchases or generated media.",
        "stem_note":"Shared master gain and linked limiter applied to every stem, so the four stems sum to master within PCM quantization error."
    }
    (OUT/"qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    doc=f"""# Цена повторения — звуковая партитура и проверка

60 секунд / 3600 кадров / 60 fps / 120 BPM / D minor. Все WAV — 48 kHz, stereo, PCM 24 bit.

## Драматургия
- 0–16: механическая клавишная клетка, низкая D-педаль, накапливающиеся фактуры.
- 16–23.8: расширение гармонии, ритмическое уплотнение, непрерывный райзер.
- 23.8–24.0: ровно 12 кадров абсолютного нуля на master и всех stems.
- 24: главный impact: тело, sub, braam, широкое воздушное послезвучие.
- 24–38: собственная мелодическая тема поверх синкопированного баса и полного грува.
- 38–50: половинный ритм и больше пространства для чтения интерфейса.
- 50–54: смысловой итог, сокращённое возвращение темы.
- 54–55.2: короткое гармоническое ожидание во время схождения элементов бренда.
- 55.2–60: Dm(add9), бренд точно на кадре 3312, естественное разрежение и затухание.

## Файлы
- soundtrack.wav — финальная стереосумма.
- music.wav — партитура, бас и ударные.
- motion.wav — движения камеры, переходы, воздух и райзеры.
- ui.wav — клавиши, клики, отклики интерфейса.
- impacts.wav — значимые низкочастотные удары и braam.
- events.json — журнал точных кадров; picture cues берутся из src/repetition/timeline.json.
- qa.json и ffmpeg-loudness.txt — числовые результаты.
- qa-aac-320k.m4a — только проверочный AAC; готовый MP4 нужно измерить отдельно.

Четыре stems проходят общий gain/limiter и суммируются в master с погрешностью PCM-квантования.

## Фактическая проверка
- Loudness: {report['loudness_lufs']:.2f} LUFS.
- True peak 4×: {report['true_peak_dbfs_4x']:.2f} dBFS; AAC stress-test: {report['aac_320k_true_peak_dbfs_4x']:.2f} dBFS.
- Клиппинг / NaN / Inf: {report['clipped_samples']} / {report['nonfinite_samples']}.
- Пауза [1428,1440): {report['silence_pcm_nonzero_samples']} ненулевых samples.
- Разрыв на входе/выходе паузы: {report['silence_start_boundary_step']:.9f} / {report['drop_start_boundary_step']:.9f}; атака после паузы сглажена за 1.5 мс.
- Максимальная ошибка суммы stems: {report['stem_sum_max_absolute_error']:.9f} (квантование PCM).
- Корреляция L/R: {report['lr_correlation']:.3f}; mono/stereo RMS: {report['mono_to_stereo_rms_db']:.2f} dB.
- Максимальный DC за 1 секунду: {report['worst_one_second_dc']:.7f}.
- Максимальное снижение limiter: {report['limiter_max_reduction_db']:.2f} dB; доля samples >3 dB: {report['limiter_samples_reduced_over_3db_percent']:.2f}%.

Проверены данные, форма волны и AAC-кодирование. Субъективное прослушивание не заявляется. Крупные sample-to-sample переходы от отмеченных ударов/клавиш — намеренные транзиенты, метрика сама по себе не доказывает слышимый дефект.

Новая оригинальная синтезированная партитура. build_audio.py не импортируется и старый soundtrack не изменяется.
"""
    (OUT/"README.md").write_text(doc)
    print(json.dumps({k:report[k] for k in ["loudness_lufs","true_peak_dbfs_4x","aac_320k_true_peak_dbfs_4x","silence_pcm_nonzero_samples","mono_to_stereo_rms_db","limiter_max_reduction_db","render_seconds"]},indent=2),flush=True)
    print(ffsummary,flush=True)


if __name__ == "__main__":
    render()
