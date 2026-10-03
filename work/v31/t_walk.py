import sys
from probe import *
from PIL import Image
w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3];step=int(sys.argv[4]);start=int(sys.argv[5]) if len(sys.argv)>5 else 0;end=int(sys.argv[6]) if len(sys.argv)>6 else 99999
mob=w<700
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':w,'height':h},has_touch=mob,is_mobile=mob)
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file://'+F); pg.wait_for_timeout(3000)
    H=pg.evaluate('document.documentElement.scrollHeight')
    ys=list(range(start,min(H-h,end)+1,step)); 
    files=[]
    for i,y in enumerate(ys):
        # scroll in two hops so reveals trigger naturally
        pg.evaluate('(y)=>window.scrollTo(0,y-200)',y); pg.wait_for_timeout(250)
        pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(1500)
        f=f'shots/{tag}_{w}_{i:02d}.png'; pg.screenshot(path=f); files.append((y,f))
    print(H,len(files),errs)
    # contact sheets of 4 (2x2)
    for s in range(0,len(files),4):
        grp=files[s:s+4]; ims=[Image.open(f).convert('RGB') for _,f in grp]
        sc=0.5 if w>700 else 0.7
        ims=[i.resize((int(i.width*sc),int(i.height*sc))) for i in ims]
        cw=ims[0].width; ch=ims[0].height
        cols=2 if w>700 else 4
        rows=(len(ims)+cols-1)//cols
        sheet=Image.new('RGB',(cols*cw+(cols-1)*8,rows*ch+(rows-1)*8),'white')
        for k,im in enumerate(ims): sheet.paste(im,((k%cols)*(cw+8),(k//cols)*(ch+8)))
        sheet.save(f'shots/{tag}_{w}_sheet{s//4}.png'); print(f'sheet{s//4}',[y for y,_ in grp])
    b.close()
