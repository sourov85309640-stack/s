import sys,json
from qb_common import *
w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3]
kw={}
if len(sys.argv)>4 and sys.argv[4]=='touch': kw=dict(has_touch=True,is_mobile=True,device_scale_factor=2)
with sync_playwright() as p:
    b,pg,errs=mk(p,w,h,**kw)
    pg.goto('file://'+F); pg.wait_for_timeout(3000)
    info=pg.evaluate('()=>{const s=rwMotion.tour();const e=document.querySelector("#where").getBoundingClientRect();return {st:s?[s.start,s.end]:null,top:e.top+scrollY,h:e.height,cls:document.documentElement.className}}')
    print(w,h,info)
    if info['st']:
        s,e=info['st']; ys=[s+(e-s)*f for f in (-0.1,0,.08,.2,.3,.4,.5,.6,.7,.8,.92,1,1.1)]
    else:
        # flow mode: scroll each list item to the reading line
        pg.evaluate('()=>window.scrollTo(0,document.querySelector("#where").getBoundingClientRect().top+scrollY-200)')
        ys=None
    if ys:
        for i,y in enumerate(ys):
            pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(1500)
            st=pg.evaluate(STATE); print(i,json.dumps(st))
            if i in (0,2,5,8,11): pg.screenshot(path=f'shots/qa_b_tour_{tag}_{i}.png')
    else:
        n=pg.evaluate('document.querySelectorAll(".dia-list li").length')
        for k in range(n):
            pg.evaluate('(k)=>{const li=document.querySelectorAll(".dia-list li")[k];const r=li.getBoundingClientRect();window.scrollTo(0,r.top+scrollY-innerHeight*0.55)}',k)
            pg.wait_for_timeout(1800)
            st=pg.evaluate(STATE); print(k,json.dumps(st))
            pg.screenshot(path=f'shots/qa_b_tour_{tag}_{k}.png')
    print('errs',errs)
    b.close()
