"""Shared Playwright helpers for QA agents.  from qa_lib import *
Usage example:
    with sync_playwright() as p:
        b = launch(p)
        pg = newpage(b, 1440, 900)            # mob=True for touch/mobile, reduced=True for reduced motion
        goto(pg, F)                            # F = 'file://' + absolute path of your built html
        jump_to(pg, '#where'); shot(pg, 'qa_x_where_1440')
        print(overflow(pg), pg.errs)
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

EXE = '/opt/pw-browsers/chromium'
ROOT = '/home/user/s/work/v31'
AXE = '/home/user/s/work/tools/node_modules/axe-core/axe.min.js'
WIDTHS = [360, 390, 430, 768, 1024, 1280, 1440, 1920]


def launch(p):
    return p.chromium.launch(executable_path=EXE, args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])


def newpage(b, w, h=900, mob=False, reduced=False, **kw):
    ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=mob, is_mobile=mob,
                        reduced_motion='reduce' if reduced else 'no-preference', **kw)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.errs = errs
    return pg


def goto(pg, url, wait=2500, motion_off=False):
    if motion_off:
        pg.add_init_script("(function(){function set(){document.documentElement.setAttribute('data-motion','off')}if(document.documentElement)set();else new MutationObserver(function(m,o){if(document.documentElement){set();o.disconnect()}}).observe(document,{childList:true})})()")
    pg.goto(url if url.startswith('file://') else 'file://' + url)
    pg.wait_for_timeout(wait)


def jump(pg, y, wait=1500):
    pg.evaluate('(y)=>window.scrollTo(0,y)', y)
    pg.wait_for_timeout(wait)


def top_of(pg, sel):
    return pg.evaluate("(s)=>{const e=document.querySelector(s);return e?e.getBoundingClientRect().top+scrollY:null}", sel)


def jump_to(pg, sel, offset=-64, wait=1500):
    y = top_of(pg, sel)
    if y is not None:
        jump(pg, max(0, y + offset), wait)
    return y


def walk(pg, step=400, wait=60):
    """scroll the whole page slowly so once-only reveals fire"""
    h = pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0, h, step):
        pg.evaluate(f'window.scrollTo(0,{y})')
        pg.wait_for_timeout(wait)
    pg.wait_for_timeout(1500)


def overflow(pg):
    return pg.evaluate("""()=>{const W=document.documentElement.clientWidth;const bad=[];
      document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();
        if(r.width&&(r.right>W+1||r.left<-1)){const cs=getComputedStyle(e);if(cs.position==='fixed')return;
          let p=e.parentElement,clipped=false;while(p&&p!==document.body){const s=getComputedStyle(p);if(/(hidden|clip)/.test(s.overflowX)){const pr=p.getBoundingClientRect();if(pr.right<=W+1&&pr.left>=-1){clipped=true;break}}p=p.parentElement}
          if(!clipped)bad.push((e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].join('.'))+' '+Math.round(r.left)+'..'+Math.round(r.right))}});
      return {scrollW:document.documentElement.scrollWidth,clientW:W,offenders:bad.slice(0,15)}}""")


def hidden_text(pg, scope='main'):
    """visible-text elements that are still transparent or translated away after scrolling"""
    return pg.evaluate("""(scope)=>{const out=[];document.querySelectorAll(scope+' h1,'+scope+' h2,'+scope+' h3,'+scope+' p,'+scope+' li,'+scope+' a,'+scope+' button,'+scope+' dd').forEach(e=>{
      if(!e.textContent.trim())return;let n=e,op=1;while(n&&n!==document.body){const s=getComputedStyle(n);op*=parseFloat(s.opacity);if(s.visibility==='hidden'||s.display==='none'){op=-1;break}n=n.parentElement}
      if(op>=0&&op<0.95)out.push(e.tagName+' '+e.textContent.trim().slice(0,50)+' op='+op.toFixed(2))});return out.slice(0,30)}""", scope)


def shot(pg, name, full=False):
    os.makedirs(ROOT + '/shots', exist_ok=True)
    path = f'{ROOT}/shots/{name}.png'
    pg.screenshot(path=path, full_page=full)
    return path


def axe(pg, include=None):
    pg.add_style_tag(content='.e-wave::before,.e-step::before,.e-rake::before,.e-hip::before,.e-saw::before,.e-arc::before,.e-zig::before,.e-terrace::before,.e-chim::before{display:none!important}')
    pg.evaluate(open(AXE).read())
    ctx = json.dumps(include) if include else 'document'
    return pg.evaluate("async()=>{const r=await axe.run(%s,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});return r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\\n').slice(0,2).join(' | ').slice(0,180))}))}" % ctx)


def frame_times(pg, ms=2000, scroll_px=0):
    """sample rAF frame durations while optionally scrolling by scroll_px over the window"""
    return pg.evaluate("""async([ms,px])=>{const t=[];let last=performance.now();const y0=scrollY;const s=performance.now();
      await new Promise(res=>{function f(n){t.push(n-last);last=n;if(px)window.scrollTo(0,y0+px*Math.min(1,(n-s)/ms));if(n-s<ms)requestAnimationFrame(f);else res()}requestAnimationFrame(f)});
      t.sort((a,b)=>a-b);const p=q=>t[Math.floor(q*(t.length-1))];return {frames:t.length,p50:+p(.5).toFixed(1),p95:+p(.95).toFixed(1),max:+t[t.length-1].toFixed(1)}}""", [ms, scroll_px])


def focus_walk(pg, n=40):
    """tab through n stops; report focused element, whether its ring is covered by the header or the mobile bar"""
    out = []
    for i in range(n):
        pg.keyboard.press('Tab')
        pg.wait_for_timeout(120)
        out.append(pg.evaluate("""()=>{const e=document.activeElement;if(!e||e===document.body)return null;const r=e.getBoundingClientRect();
          const h=document.querySelector('#header');const hb=h?h.getBoundingClientRect():null;const bar=document.querySelector('.bar');const bb=bar&&getComputedStyle(bar).display!=='none'?bar.getBoundingClientRect():null;
          const underHdr=hb&&hb.bottom>0&&r.top<hb.bottom-2&&!h.contains(e);const underBar=bb&&r.bottom>bb.top+2&&!bar.contains(e);
          const os=getComputedStyle(e);return {el:e.tagName+(e.id?'#'+e.id:'')+' '+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,40),top:Math.round(r.top),h:Math.round(r.height),w:Math.round(r.width),underHdr,underBar,ring:os.outlineStyle!=='none'||os.boxShadow!=='none'}}"""))
    return out
