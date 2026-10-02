from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
import sys
root=Path(__file__).parent/'out/repetition/qa'
files=[root/f'f{int(n):04d}.jpg' for n in sys.argv[1:]] or sorted(root.glob('f*.jpg'))
w,h=640,360
cols=3
rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*w,rows*(h+32)), '#E7EBF2')
draw=ImageDraw.Draw(sheet)
for i,path in enumerate(files):
    x=(i%cols)*w; y=(i//cols)*(h+32)
    sheet.paste(Image.open(path).resize((w,h)),(x,y))
    draw.text((x+12,y+h+8),path.stem,fill='#000230')
sheet.save(root/'sheet.jpg',quality=92)
print(root/'sheet.jpg')
