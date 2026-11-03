from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, subprocess
U="/root/.claude/uploads/57976dad-b6ca-5331-a4bf-b135f753d48d/"
logo=Image.open(U+"62233117-image.jpg").convert("RGB").crop((60,280,650,430))
s1=Image.open(U+"3ca631c0-image.jpg").convert("RGB"); s2=Image.open(U+"be99b18a-image.jpg").convert("RGB")
rows=[(800,1015),(1015,1240),(1240,1458)]
tiles=[];k_=1080/923
for s in (s1,s2):
  for a,b in rows:
    tiles.append(s.crop(tuple(int(v*k_) for v in (38,a,470,b)))); tiles.append(s.crop(tuple(int(v*k_) for v in (470,a,880,b))))
W,H,F=1080,1920,30
B=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
out="frames"; os.makedirs(out,exist_ok=True)
RED=(225,20,30); YEL=(255,200,0)
def ease(t): t=max(0,min(1,t)); return 1-(1-t)**3
def base():
  im=Image.new("RGB",(W,H),RED); d=ImageDraw.Draw(im)
  for i in range(0,W+H,120): d.polygon([(i,0),(i+50,0),(i-H+50,H),(i-H,H)],fill=(205,12,22))
  return im
def header(im,d):
  d.rounded_rectangle((60,70,1020,330),40,fill="white")
  lg=logo.resize((820,int(820*logo.height/logo.width))); im.paste(lg,(130,100))
  d.rounded_rectangle((170,1720,910,1840),60,fill=YEL)
  t="FECHA MÊS • 30/10 a 01/11"; f=B(44); w=d.textlength(t,font=f); d.text(((W-w)/2,1752),t,font=f,fill=RED)
N=7*F; frames=[]
intro=int(0.8*F); outro=int(0.8*F); per=(N-intro-outro)/6
for i in range(N):
  im=base(); d=ImageDraw.Draw(im)
  if i<intro:
    t=ease(i/intro*1.3); lg=logo.resize((int(900*t)+1,int(900*t*logo.height/logo.width)+1))
    d.ellipse((W/2-480*t,H/2-480*t,W/2+480*t,H/2+480*t),fill="white"); im.paste(lg,(int((W-lg.width)/2),int((H-lg.height)/2)))
  elif i>=N-outro:
    t=ease((i-(N-outro))/outro*1.5); header(im,d)
    f=B(92); 
    for k,tx in enumerate(["Comprar bem","compensa!"]):
      w=d.textlength(tx,font=f); d.text(((W-w)/2,760+k*130+(1-t)*200),tx,font=f,fill="white")
    f=B(40); tx="Ofertas enquanto durarem os estoques"; w=d.textlength(tx,font=f); d.text(((W-w)/2,1080),tx,font=f,fill=YEL)
  else:
    j=i-intro; k=int(j//per); lt=(j-k*per)/per; header(im,d)
    for m in range(2):
      tl=tiles[2*k+m]; t=ease(0.35+lt*3.5-m*0.2)
      sc=(940/tl.width)*(0.92+0.08*min(1,lt*1.2)); tw,th=int(tl.width*sc),int(tl.height*sc)
      card=tl.resize((tw,th),Image.LANCZOS)
      y=420+m*640; x=int((W-tw)/2+(1-t)*(W if m==0 else -W))
      d.rounded_rectangle((x-20,y-20,x+tw+20,y+th+20),36,fill="white")
      im.paste(card,(x,y))
  im.save(f"{out}/{i:04d}.png")
subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(F),"-i",f"{out}/%04d.png","-c:v","libx264","-pix_fmt","yuv420p","-crf","18","compensa_fecha_mes.mp4"],check=True)
