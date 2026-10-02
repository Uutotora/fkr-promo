"""Story clock (v5) → film clock of PromoSilent/Film3 (reading holds added back).
Add 1.2 s (the logo card) to get the time in the final video / PromoFinalSilent.
usage: .venv/bin/python scripts/clock.py 13.35 33.5   →  17.450 45.600"""
import re, sys, os
src = open(os.path.join(os.path.dirname(__file__), "..", "src/v3/holds.ts")).read()
RAW = [tuple(map(float, m)) for m in re.findall(r"\[([\d.]+),\s*([\d.]+)\]", src.split("const RAW")[1].split("];")[0])]
F = lambda v: v + sum(e for a, e in RAW if v > a)
print(" ".join(f"{F(float(x)):.3f}" for x in sys.argv[1:]))
