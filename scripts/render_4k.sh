#!/bin/zsh
# Render the whole film (intro + film, silent) supersampled in 4K, in 4 chunks.
# usage: scripts/render_4k.sh v10            → out/v10_1.mp4 … out/v10_4.mp4
# Takes ~25 min. Do NOT edit src/ while it runs: every chunk re-bundles the project.
set -e
TAG=${1:?usage: scripts/render_4k.sh <tag>}
cd "$(dirname "$0")/.."
R=(0-2879 2880-5759 5760-8639 8640-11351)   # 11352 frames = 189.2 s @ 60 fps (PromoFinalSilent)
for i in 1 2 3 4; do
  npx remotion render PromoFinalSilent out/${TAG}_$i.mp4 --frames=${R[$i]} --scale=2 --codec h264 --crf 10 --concurrency 8 > out/${TAG}_$i.log 2>&1 || { echo "chunk $i failed (see out/${TAG}_$i.log)"; exit 1; }
  echo "chunk $i done $(date +%T)"
done
