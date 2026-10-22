#!/bin/zsh
# v14: 4K render → 1080p60 (lanczos), soundtrack loudness to -14 LUFS / -1 dBTP
# (two-pass loudnorm), end-card logo frame as the cover.
# usage: scripts/finalize_v14.sh → out/fkr-promo-v14.mp4 and ~/Downloads/ФКР_промо_v14.mp4
set -e
cd "$(dirname "$0")/.."
FF=/opt/homebrew/bin/ffmpeg
SRC=out/v14_4k.mp4
COVER=stills/v14_cover/f08000.jpg
[[ -f $COVER ]] || node scripts/st13.mjs V14Film v14_cover 8000
J=$($FF -hide_banner -i $SRC -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/{/,/}/p')
val() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true"
$FF -v error -y -i $SRC -vf "scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,fps=60" -af "$LN" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 out/v14_nocover.mp4
$FF -v error -y -i out/v14_nocover.mp4 -i $COVER -map 0 -map 1 -c copy -disposition:v:1 attached_pic -movflags +faststart out/fkr-promo-v14.mp4
cp out/fkr-promo-v14.mp4 ~/Downloads/ФКР_промо_v14.mp4
/opt/homebrew/bin/ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of compact out/fkr-promo-v14.mp4
