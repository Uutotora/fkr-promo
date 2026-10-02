import sys,glob
from PIL import Image, ImageDraw
fs=sys.argv[2:]; out=sys.argv[1]
W,H=960,540; cols=2
rows=(len(fs)+cols-1)//cols
s=Image.new('RGB',(W*cols,H*rows),'white'); d=ImageDraw.Draw(s)
for i,f in enumerate(fs):
  s.paste(Image.open(f).convert('RGB').resize((W,H)),((i%cols)*W,(i//cols)*H)); d.text(((i%cols)*W+8,(i//cols)*H+8),f.split('/')[-1],fill='red')
s.save(out,quality=85)
