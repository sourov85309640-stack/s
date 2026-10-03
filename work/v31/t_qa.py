from probe import *
res=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w,h in [(360,740),(390,844),(430,932),(768,1024),(1024,768),(1280,720),(1440,900),(1920,1080)]:
        mob=w<700
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=mob,is_mobile=mob)
        errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
        pg.goto('file://'+F); pg.wait_for_timeout(2500)
        H=pg.evaluate('document.documentElement.scrollHeight'); maxsw=0
        y=0
        while y<H:
            pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(120)
            maxsw=max(maxsw,pg.evaluate('document.documentElement.scrollWidth'))
            y+=int(h*0.6)
        pg.wait_for_timeout(800)
        # everything visible at the end?
        hidden=pg.evaluate('''()=>{const bad=[];document.querySelectorAll('h2,.svc,.rcard,.steps4 li,.stages li,.checks li,.areas-big li,.q,.spec>div,.form,.big-wrap').forEach(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(cs.opacity<0.99)bad.push(e.className||e.tagName)});return bad.slice(0,8)}''')
        print(w,h,'H',H,'maxScrollW',maxsw,'cw',pg.evaluate('document.documentElement.clientWidth'),'notFullyVisibleAfterScroll',hidden,'errs',errs)
        pg.close()
    b.close()
