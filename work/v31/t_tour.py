import sys
from probe import *
w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':w,'height':h})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file://'+F); pg.wait_for_timeout(3000)
    st=pg.evaluate('()=>{const s=rwMotion.tour();return s?{start:s.start,end:s.end}:null}')
    print(st)
    if st:
        for i,pr in enumerate([-0.08,0.0,0.12,0.3,0.5,0.75,1.0,1.05]):
            y=st['start']+pr*(st['end']-st['start'])
            pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(1500)
            pg.screenshot(path=f'shots/{tag}_{w}_{i}.png')
    print(errs)
    b.close()
