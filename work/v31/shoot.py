import sys,json
from playwright.sync_api import sync_playwright
f=sys.argv[1]; tag=sys.argv[2]
rep={}
def settle(pg):
    h=pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0,h,350):
        pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(60)
    pg.wait_for_timeout(2000); pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(300)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w in ([int(x) for x in sys.argv[3:]] or (1440,1024,768,390,360)):
        pg=b.new_page(viewport={'width':w,'height':900})
        reqs=[];errs=[]
        pg.on('request',lambda r:reqs.append(r.url) if not r.url.startswith(('data:','file:')) else None)
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        pg.goto('file://'+f); pg.wait_for_timeout(1500); settle(pg)
        m=pg.evaluate('()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,h:document.documentElement.scrollHeight})')
        m['ext']=reqs; m['err']=errs; rep[w]=m
        pg.screenshot(path=f'shots/{tag}_{w}.png',full_page=True); pg.close()
    b.close()
json.dump(rep,open(f'report_{tag}.json','w'),indent=1)
for w,m in rep.items(): print(w,m['sw'],m['cw'],m['h'],m['ext'],m['err'])
