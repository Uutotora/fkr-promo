#!/bin/zsh
# Join the 4K chunks, downscale to 1080p60 (lanczos), mux the soundtrack, embed the logo cover
# (so Finder / Quick Look show the white ФКР card as the thumbnail).
# usage: scripts/finalize.sh v10 public/audio/v8/soundtrack.wav   → out/fkr-promo-v10.mp4
set -e
TAG=${1:?usage: scripts/finalize.sh <tag> <soundtrack.wav>}
WAV=${2:?usage: scripts/finalize.sh <tag> <soundtrack.wav>}
cd "$(dirname "$0")/.."
FF=/opt/homebrew/bin/ffmpeg   # the ffmpeg bundled with Remotion lacks setpts/xstack — use Homebrew's
$FF -v error -y -i preview/poster.png -q:v 2 out/cover.jpg
$FF -v error -y -i out/${TAG}_1.mp4 -i out/${TAG}_2.mp4 -i out/${TAG}_3.mp4 -i out/${TAG}_4.mp4 -i $WAV \
  -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0,scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,fps=60[v]" \
  -map "[v]" -map 4:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 -shortest out/${TAG}_nocover.mp4
$FF -v error -y -i out/${TAG}_nocover.mp4 -i out/cover.jpg -map 0 -map 1 -c copy -disposition:v:1 attached_pic -movflags +faststart out/fkr-promo-${TAG}.mp4
/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,nb_frames -of compact out/fkr-promo-${TAG}.mp4
