from pathlib import Path
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'out/repetition/qa/delivery-frames'
OUT.mkdir(exist_ok=True)
frames = sorted(set([
    60,210,360,470,480,493,540,702,835,910,951,960,972,
    1280,1395,1428,1440,1470,1590,1665,1812,1890,2052,2130,
    2250,2279,2280,2350,2540,2730,2860,2970,2990,2999,3000,
    3210,3312,3540,3599
]))
expr = '+'.join(f'eq(n,{f})' for f in frames)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'out/repetition/fkr-price-of-repetition-1080p60.mp4'),
    '-vf', f"select='{expr}',scale=960:540",'-fps_mode','vfr','-q:v','2',str(OUT/'frame-%03d.jpg')],check=True)
for offset in range(0,len(frames),12):
    subset = frames[offset:offset+12]
    sheet = Image.new('RGB',(1920,392*((len(subset)+2)//3)), '#E7EBF3')
    draw = ImageDraw.Draw(sheet)
    for i,f in enumerate(subset):
        im=Image.open(OUT/f'frame-{offset+i+1:03d}.jpg').resize((640,360),Image.Resampling.LANCZOS)
        x=(i%3)*640;y=(i//3)*392
        sheet.paste(im,(x,y));draw.text((x+12,y+370),f'{f:04d}  |  {f//60:02d}:{f%60:02d}',fill='#000230')
    path=OUT.parent/f'delivery-contact-{offset//12+1:02d}.jpg'
    sheet.save(path,quality=94)
    print(path)
