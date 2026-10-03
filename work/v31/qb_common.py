from playwright.sync_api import sync_playwright
F='/tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/out_qa_b.html'
ARGS=['--use-gl=swiftshader','--enable-unsafe-swiftshader']
def mk(p,w,h,**kw):
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=ARGS)
    ctx=b.new_context(viewport={'width':w,'height':h},**kw)
    pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m:errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    return b,pg,errs
STATE='''()=>{
 const q=s=>[...document.querySelectorAll(s)];
 const pins=q('.dia-art .pin'),items=q('.dia-list li'),ticks=q('#ticks i');
 const m=document.querySelector('#marker'),art=document.querySelector('.dia-art');
 const ar=art.getBoundingClientRect(),mr=m.getBoundingClientRect();
 const on=pins.findIndex(p=>p.classList.contains('is-on'));
 const pr=on>=0?pins[on].getBoundingClientRect():null;
 const parts=q('.dg [data-part]').map(g=>g.classList.contains('is-on')?1:0).join('');
 return {y:Math.round(scrollY),pinOn:on,liOn:items.map((l,i)=>l.classList.contains('is-on')?i:-1).filter(i=>i>=0).join(','),
  ticksOn:ticks.map(t=>t.classList.contains('is-on')?'o':t.classList.contains('is-done')?'d':'-').join(''),parts,
  lock:m.classList.contains('is-lock'),flip:m.classList.contains('flip'),tag:m.querySelector('.m-tag').textContent,
  mk:[Math.round(mr.left-ar.left),Math.round(mr.top-ar.top)],
  pinPos:pr?[Math.round(pr.left+pr.width/2-ar.left),Math.round(pr.top+pr.height/2-ar.top)]:null,
  artTop:Math.round(ar.top),artH:Math.round(ar.height),artW:Math.round(ar.width),
  cls:document.documentElement.className, sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}
}'''
