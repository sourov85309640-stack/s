import sys,json,os
from playwright.sync_api import sync_playwright
F=sys.argv[1]; src=open('axe/node_modules/axe-core/axe.min.js').read()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for w in (1440,390):
        pg=b.new_page(viewport={'width':w,'height':16000}); pg.goto('file://'+F); pg.wait_for_timeout(600)
        h=pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0,h,350):
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(50)
        pg.wait_for_timeout(2000); pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(300)
        # edge pseudo-elements sit on section boundaries only; axe cannot resolve backgrounds under any pseudo-element, so hide them for the contrast pass
        pg.add_style_tag(content='.e-wave::before,.e-step::before,.e-rake::before,.e-hip::before,.e-saw::before,.e-arc::before,.e-zig::before,.e-terrace::before,.e-chim::before{display:none!important}')
        pg.evaluate(src)
        r=pg.evaluate("async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return {v:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\\n').slice(0,2).join(' | ').slice(0,200))})),inc:r.incomplete.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' '))}))}}")
        print('==',w,'violations',len(r['v']))
        for v in r['v']: print(json.dumps(v,indent=1)[:900])
        print('incomplete:',[(i['id'],i['n']) for i in r['inc']])
    # duplicate ids and label targets
    pg=b.new_page(); pg.goto('file://'+F)
    print(pg.evaluate("""()=>{const ids={};document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
    const dup=Object.entries(ids).filter(([k,v])=>v>1);
    const bad=[...document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls]')].flatMap(e=>['aria-labelledby','aria-describedby','aria-controls'].flatMap(a=>(e.getAttribute(a)||'').split(' ').filter(x=>x&&!document.getElementById(x)).map(x=>a+'->'+x)));
    return {dup,bad}}"""))
