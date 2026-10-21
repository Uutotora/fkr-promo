#!/bin/zsh
# v13: splice the re-rendered ending (frames 15480… in v13_4k_end.mp4, if present) into the
# 4K render, downscale to 1080p60 (lanczos), mux the soundtrack, embed the end-card logo
# frame as the cover (Finder / Quick Look thumbnail).
# usage: scripts/finalize_v13.sh  →  out/fkr-promo-v13.mp4 and ~/Downloads/ФКР_промо_v13.mp4
set -e
cd "$(dirname "$0")/.."
FF=/opt/homebrew/bin/ffmpeg
SRC=out/v13_4k.mp4
WAV=public/audio/v13/soundtrack.wav
COVER=stills/v13_cover/f16020.jpg
[[ -f $COVER ]] || node scripts/st13.mjs V13Film v13_cover 16020
END=out/v13_4k_end.mp4
CUT=15480
SCALE="scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int,fps=60"
if [[ -f $END ]]; then
  VF="[0:v]trim=end_frame=$CUT,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,$SCALE[v]"
  IN=(-i $SRC -i $END -i $WAV); A=2
else
  VF="[0:v]$SCALE[v]"
  IN=(-i $SRC -i $WAV); A=1
fi
$FF -v error -y $IN -filter_complex "$VF" \
  -map "[v]" -map $A:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 -shortest out/v13_nocover.mp4
$FF -v error -y -i out/v13_nocover.mp4 -i $COVER -map 0 -map 1 -c copy -disposition:v:1 attached_pic -movflags +faststart out/fkr-promo-v13.mp4
cp out/fkr-promo-v13.mp4 ~/Downloads/ФКР_промо_v13.mp4
/opt/homebrew/bin/ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of compact out/fkr-promo-v13.mp4
