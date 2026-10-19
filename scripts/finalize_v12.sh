#!/bin/zsh
# Join the 4K chunks, downscale to 1080p60 (lanczos), mux the v8 soundtrack, embed the ФКР logo card
# as cover art, copy to ~/Downloads/ФКР_промо_v12.mp4.
set -e
cd "$(dirname "$0")/.."
FF=/opt/homebrew/bin/ffmpeg
WAV=public/audio/v8/soundtrack.wav
$FF -v error -y -i preview/poster.png -q:v 2 out/v12/cover.jpg
$FF -v error -y -i out/v12/v12_1.mp4 -i out/v12/v12_2.mp4 -i out/v12/v12_3.mp4 -i out/v12/v12_4.mp4 -i $WAV \
  -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0,scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,fps=60[v]" \
  -map "[v]" -map 4:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 out/v12/v12_nocover.mp4
$FF -v error -y -i out/v12/v12_nocover.mp4 -i out/v12/cover.jpg -map 0 -map 1 -c copy -disposition:v:1 attached_pic -movflags +faststart out/fkr-promo-v12.mp4
cp out/fkr-promo-v12.mp4 "$HOME/Downloads/ФКР_промо_v12.mp4"
/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,nb_frames -of compact out/fkr-promo-v12.mp4
