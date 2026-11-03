from PIL import Image, ImageDraw, ImageFont
import os, subprocess
U="/root/.claude/uploads/57976dad-b6ca-5331-a4bf-b135f753d48d/"
def L(n): return Image.open(U+n).convert("RGB")
p,a,b=L("6c7151e9-image.jpg"),L("fe6ccc72-image.jpg"),L("294ef442-image.jpg")
k=p.width/923
ImageDraw.Draw(a).rectangle(tuple(int(v*k) for v in (788,489,912,557)),fill="white")
C=lambda im,box: im.crop(tuple(int(v*k) for v in box))
logo=C(p,(158,693,767,1307)); mask=Image.new("L",logo.size,0); ImageDraw.Draw(mask).ellipse((0,0)+logo.size,fill=255)
tiles=[C(b,x) for x in [(45,770,335,1232),(338,772,625,1073),(632,772,918,1073),(338,1078,918,1268),(45,1235,335,1580),(338,1276,625,1580),(632,1276,918,1580)]]
cols=[(205,438),(442,668),(672,915)]; rows=[(488,835),(840,1190),(1200,1578)]
tiles+=[C(a,(x0,y0,x1,y1)) for y0,y1 in rows for x0,x1 in cols]
W,H,F=1080,1920,30
B=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
BLUE=(18,45,150); DB=(10,28,100); GOLD=(255,190,20); BR=(110,40,10)
ease=lambda t:1-(1-max(0,min(1,t)))**3
def circ(sz):
  r=logo.resize((sz,sz),Image.LANCZOS); m=mask.resize((sz,sz)); return r,m
def base():
  im=Image.new("RGB",(W,H),BLUE); d=ImageDraw.Draw(im)
  for i in range(0,W+H,120): d.polygon([(i,0),(i+50,0),(i-H+50,H),(i-H,H)],fill=DB)
  return im,d
def ctext(d,y,t,f,c): d.text(((W-d.textlength(t,font=f))/2,y),t,font=f,fill=c)
def header(im,d):
  r,m=circ(250); im.paste(r,(50,50),m)
  d.text((330,85),"TERÇA DA",font=B(64),fill="white"); d.text((330,165),"PADARIA",font=B(104),fill=GOLD)
  d.rounded_rectangle((140,1730,940,1840),55,fill=GOLD); ctext(d,1760,"SÓ HOJE • 03/11/2026",B(48),BR)
N=7*F; intro=int(.7*F); outro=int(.7*F); n=len(tiles)//2; per=(N-intro-outro)/n
os.makedirs("frames",exist_ok=True)
for i in range(N):
  im,d=base()
  if i<intro:
    t=ease(i/intro*1.4); sz=max(2,int(820*t)); r,m=circ(sz); im.paste(r,((W-sz)//2,(H-sz)//2),m)
  elif i>=N-outro:
    t=ease((i-N+outro)/outro*1.6); header(im,d); off=(1-t)*200
    ctext(d,720+off,"Terça é dia de",B(84),"white"); ctext(d,840+off,"cheirinho bom!",B(84),GOLD)
    ctext(d,1010,"Ofertas enquanto durarem os estoques",B(38),"white")
  else:
    j=i-intro; s=min(n-1,int(j//per)); lt=(j-s*per)/per; header(im,d)
    for q in range(2):
      tl=tiles[2*s+q]; t=ease(.35+lt*3.5-q*.2)
      sc=min(960/tl.width,640/tl.height)*(0.94+0.06*min(1,lt)); tw,th=int(tl.width*sc),int(tl.height*sc)
      cx=W/2+(1-t)*(W if q==0 else -W); cy=690+q*690
      x,y=int(cx-tw/2),int(cy-th/2)
      d.rounded_rectangle((x-18,y-18,x+tw+18,y+th+18),34,fill="white")
      im.paste(tl.resize((tw,th),Image.LANCZOS),(x,y))
  im.save(f"frames/{i:04d}.png")
subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(F),"-i","frames/%04d.png","-c:v","libx264","-pix_fmt","yuv420p","-crf","18","hoffmann_terca_padaria.mp4"],check=True)
