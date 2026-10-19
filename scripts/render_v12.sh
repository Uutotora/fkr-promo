#!/bin/zsh
# Render PromoV12Silent supersampled in 4K, in 4 chunks → out/v12/v12_1.mp4 … v12_4.mp4.
# Do NOT edit src/ while it runs: every chunk re-bundles the project.
set -e
cd "$(dirname "$0")/.."
mkdir -p out/v12
N=$(node -e "const p=require('./src/v12/pace.json'); console.log(p.s.length + 72)")
Q=$(( (N + 3) / 4 ))
for i in 1 2 3 4; do
  A=$(( (i - 1) * Q )); B=$(( i * Q - 1 )); (( B > N - 1 )) && B=$(( N - 1 ))
  npx remotion render PromoV12Silent out/v12/v12_$i.mp4 --frames=$A-$B --scale=2 --codec h264 --crf 10 --concurrency 8 > out/v12/v12_$i.log 2>&1 || { echo "chunk $i failed (see out/v12/v12_$i.log)"; exit 1; }
  echo "chunk $i ($A-$B) done $(date +%T)"
done
