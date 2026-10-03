import sys
from probe import *
# usage: t_rel.py W H tag selector off1 off2 ...
w=int(sys.argv[1]);h=int(sys.argv[2]);tag=sys.argv[3];sel=sys.argv[4];offs=[int(x) for x in sys.argv[5:]]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':w,'height':h},has_touch=(w<700),is_mobile=(w<700))
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file://'+F); pg.wait_for_timeout(3000)
    top=pg.evaluate('(s)=>{const e=document.querySelector(s);return e.getBoundingClientRect().top+scrollY}',sel)
    print('top',top,'h',pg.evaluate('document.documentElement.scrollHeight'),'sw',pg.evaluate('document.documentElement.scrollWidth'))
    for i,o in enumerate(offs):
        pg.evaluate('(y)=>window.scrollTo(0,y)',top+o); pg.wait_for_timeout(1700)
        pg.screenshot(path=f'shots/{tag}_{w}_{i}.png')
    print(errs)
    b.close()
