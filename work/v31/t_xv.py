import sys
from probe import *
w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3]
prs=[float(x) for x in sys.argv[4:]] or [-0.1,0.0,0.1,0.25,0.5,0.8,1.0,1.1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':w,'height':h})
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file://'+F); pg.wait_for_timeout(3000)
    st=pg.evaluate('()=>{const s=rwMotion.ST.getAll().find(s=>s.pin&&s.trigger&&s.trigger.classList.contains("whole-grid"));return s?{start:s.start,end:s.end}:null}')
    print(st)
    if st:
        for i,pr in enumerate(prs):
            y=st['start']+pr*(st['end']-st['start'])
            pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(1600)
            pg.screenshot(path=f'shots/{tag}_{w}_{i}.png')
    print(errs)
    b.close()
