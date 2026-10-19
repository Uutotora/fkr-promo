#!/bin/zsh
# Stills of the v12 film at STORY times (s12): scripts/st12.sh <tag> <s12…>  → stills/<tag>/t<film>.png + sheet
set -e
cd "$(dirname "$0")/.."
TAG=$1; shift
T=($(.venv/bin/python scripts/pace.py "$@" | tail -n $# | awk '{print $3}'))
COMP=FilmV12 node stills.mjs $TAG ${T[@]} > /dev/null
.venv/bin/python - "$TAG" ${T[@]} <<'PY'
import sys
from PIL import Image
tag, ts = sys.argv[1], sys.argv[2:]
ims = [Image.open(f"stills/{tag}/t{float(t):.2f}.png").convert("RGB").resize((960, 540)) for t in ts]
cols = 2; rows = (len(ims) + 1) // 2
sh = Image.new("RGB", (960 * cols, 540 * rows), "black")
for i, im in enumerate(ims): sh.paste(im, ((i % cols) * 960, (i // cols) * 540))
sh.save(f"stills/{tag}/sheet.jpg", quality=85)
print(f"stills/{tag}/sheet.jpg", ts)
PY
