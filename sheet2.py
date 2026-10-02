import sys,glob
from PIL import Image, ImageDraw
tag=sys.argv[1]
fs=sorted(glob.glob(f'stills/{tag}/t*.png'),key=lambda f: float(f.split('/t')[-1][:-4]))
W,H=960,540; cols=2; rows=(len(fs)+1)//2
s=Image.new('RGB',(W*cols,H*rows),'white'); d=ImageDraw.Draw(s)
for i,f in enumerate(fs):
  s.paste(Image.open(f).convert('RGB').resize((W,H)),((i%cols)*W,(i//cols)*H)); d.text(((i%cols)*W+8,(i//cols)*H+8),f.split('/')[-1],fill='red')
s.save(f'stills/{tag}.jpg',quality=82)
