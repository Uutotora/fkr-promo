#!/bin/zsh
# Save the whole v13 film project as a self-contained folder (for ~/Documents/Ролики):
#   <dest>/fkr-promo   — the Remotion project (code, v13 assets, audio build, scripts)
#   <dest>/ИИ_промо    — concepts, scenario, notes, keyframes, AI clips, music, sfx, tools
#   <dest>/Фильм       — the finished film (1080p60) and the 4K master
# Heavy things that are rebuilt by `npm install` / the venv / a render stay out.
# usage: scripts/export_v13.sh ~/Documents/Ролики/ФКР_промо_v13
set -e
DEST=${1:?usage: scripts/export_v13.sh <dest>}
SRC="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(dirname "$SRC")"
mkdir -p "$DEST/fkr-promo/public/audio/v13" "$DEST/Фильм"
rsync -a --delete \
  --exclude .git --exclude node_modules --exclude .venv --exclude out --exclude stills --exclude __pycache__ \
  --exclude 'public/**' --exclude 'audio/samples' --exclude capture --exclude preview \
  --exclude '*repetition*' --exclude src/repetition \
  "$SRC/" "$DEST/fkr-promo/"
rsync -a "$SRC/public/v13" "$SRC/public/fonts" "$DEST/fkr-promo/public/"
cp "$SRC/public/audio/v13/soundtrack.wav" "$DEST/fkr-promo/public/audio/v13/"
rsync -a --delete --exclude 'v13/drafts' --exclude __pycache__ "$WORK/ИИ_промо/" "$DEST/ИИ_промо/"
cp "$SRC/out/fkr-promo-v13.mp4" "$DEST/Фильм/ФКР_промо_v13.mp4"
# 4K master with the soundtrack (video stream copied, no re-encode)
/opt/homebrew/bin/ffmpeg -v error -y -i "$SRC/out/v13_4k.mp4" -i "$SRC/public/audio/v13/soundtrack.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$DEST/Фильм/ФКР_промо_v13_4K.mp4"
du -sh "$DEST"/*
