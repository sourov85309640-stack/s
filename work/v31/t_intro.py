from probe import *
from PIL import Image
w,h=1440,900
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':w,'height':h})
    pg.goto('file://'+F,wait_until='commit')
    fs=[]
    for i,t in enumerate([200,500,500,600,900]):
        pg.wait_for_timeout(t); f=f'shots/intro_{i}.png'; pg.screenshot(path=f); fs.append(f)
    ims=[Image.open(f).convert('RGB').resize((720,450)) for f in fs]
    sh=Image.new('RGB',(720*3+16,450*2+8),'white')
    for k,im in enumerate(ims): sh.paste(im,((k%3)*728,(k//3)*458))
    sh.save('shots/intro_sheet.png')
    b.close()
