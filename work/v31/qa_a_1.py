import json
from playwright.sync_api import sync_playwright
F='file:///tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/out_qa_a.html'
ARGS=['--use-gl=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=ARGS)
    for (w,h) in [(360,740),(390,844),(430,932),(768,1024),(1024,768),(1280,720),(1440,900),(1920,1080)]:
        pg=b.new_page(viewport={'width':w,'height':h})
        errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
        pg.goto(F); pg.wait_for_timeout(3500)
        r=pg.evaluate('''()=>{
          const de=document.documentElement;
          const out={sw:de.scrollWidth,cw:de.clientWidth,bsw:document.body.scrollWidth,h:de.scrollHeight};
          // elements overflowing right in header/hero/reviews
          const bad=[];
          for(const sel of ['#header','#top','#reviews']){
            const root=document.querySelector(sel);
            root.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width&&r.right>de.clientWidth+1 && !e.closest('.feed')&&!e.closest('.hero-outline')) bad.push(sel+' '+e.tagName+'.'+(e.className.baseVal??e.className)+' right='+Math.round(r.right))});
          }
          out.bad=bad.slice(0,8);
          return out}''')
        print(w,h,r,errs)
        pg.screenshot(path=f'shots/qa_a_load_{w}.png')
        pg.close()
    b.close()
