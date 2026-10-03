import sys, json, time
from playwright.sync_api import sync_playwright
W='/tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/'
F='file://'+W+'out_qa_e.html'
EXE='/opt/pw-browsers/chromium'
def launch(p): return p.chromium.launch(executable_path=EXE,args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
def newpage(b,w,h,mob=False,**kw):
    ctx=b.new_context(viewport={'width':w,'height':h},has_touch=mob,is_mobile=mob,**kw)
    pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    pg.errs=errs
    return pg
def goto(pg,url=F,wait=2800):
    pg.goto(url); pg.wait_for_timeout(wait)
def jump(pg,y,wait=1500):
    pg.evaluate('(y)=>window.scrollTo(0,y)',y); pg.wait_for_timeout(wait)
def top_of(pg,sel):
    return pg.evaluate("(s)=>{const e=document.querySelector(s);return e.getBoundingClientRect().top+scrollY}",sel)
