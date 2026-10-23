#!/bin/zsh
# Save the whole v14 film project as a self-contained folder (for ~/Documents/Ролики):
#   <dest>/fkr-promo   — the Remotion project (code, v14 media, the v13 plates and snaps it reuses, fonts)
#   <dest>/ИИ_промо    — notes, prompt, Seedance clips, music, prototype recorder and shot scripts, tools
#   <dest>/Фильм       — the finished film (1080p60) and the 4K master
# Heavy things that are rebuilt stay out: node_modules, the venv, renders, the recorder's
# raw JPEG frames (v14/rec — the recordings themselves are public/v14/u*.mp4) and the
# Chrome that Remotion downloads (v14/.remotion).
# usage: scripts/export_v14.sh ~/Documents/Ролики/ФКР_промо_v14
set -e
DEST=${1:?usage: scripts/export_v14.sh <dest>}
SRC="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(dirname "$SRC")"
mkdir -p "$DEST/fkr-promo/public" "$DEST/Фильм"
rsync -a --delete \
  --exclude .git --exclude node_modules --exclude .venv --exclude out --exclude stills --exclude __pycache__ \
  --exclude 'public/**' --exclude 'audio/samples' --exclude capture --exclude preview \
  --exclude '*repetition*' --exclude src/repetition \
  "$SRC/" "$DEST/fkr-promo/"
rsync -a --delete "$SRC/public/v14" "$SRC/public/v13" "$SRC/public/fonts" "$DEST/fkr-promo/public/"
rsync -a --delete --exclude 'v13/drafts' --exclude 'v14/rec' --exclude 'v14/.remotion' --exclude __pycache__ --exclude .DS_Store "$WORK/ИИ_промо/" "$DEST/ИИ_промо/"
cp "$SRC/out/fkr-promo-v14.mp4" "$DEST/Фильм/ФКР_промо_v14.mp4"
# the 4K render already carries the soundtrack (Remotion mixes it); loudness is set in the 1080p final only
cp "$SRC/out/v14_4k.mp4" "$DEST/Фильм/ФКР_промо_v14_4K.mp4"
du -sh "$DEST"/*
