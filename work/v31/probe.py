import sys, json
from playwright.sync_api import sync_playwright
F='/tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/roofing-master-v3.1.html'
def run(w,h,ys,tag,wait=1400,fn=None):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=b.new_page(viewport={'width':w,'height':h})
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
        pg.goto('file://'+F); pg.wait_for_timeout(3200)
        info=pg.evaluate('()=>({h:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,motion:document.documentElement.classList.contains("has-motion"),tour:document.documentElement.classList.contains("has-tour")})')
        print(w,h,info)
        for i,y in enumerate(ys):
            if isinstance(y,str):
                pg.evaluate("(s)=>{const e=document.querySelector(s);window.scrollTo(0,e.getBoundingClientRect().top+scrollY-64)}",y)
            else:
                pg.evaluate('(y)=>window.scrollTo(0,y)',y)
            pg.wait_for_timeout(wait)
            pg.screenshot(path=f'shots/{tag}_{w}_{i}.png')
        if fn: fn(pg)
        print('errors:',errs)
        b.close()
if __name__=='__main__':
    w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3]
    ys=[(int(a) if a.lstrip('-').isdigit() else a) for a in sys.argv[4:]]
    run(w,h,ys,tag)
