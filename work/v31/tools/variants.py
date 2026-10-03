# Screenshot every version of every section (full section, capped height) for rating.
# usage: python3 tools/variants.py out/lead.html WIDTH OUTDIR
import asyncio, os, sys, json
from playwright.async_api import async_playwright
SRC, W, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
URL = 'file://' + os.path.abspath(SRC)
os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        ctx = await br.new_context(viewport={'width': W, 'height': 900 if W > 700 else 844}, has_touch=W < 700, is_mobile=W < 700)
        pg = await ctx.new_page()
        await pg.goto(URL + '?pal=off'); await pg.wait_for_timeout(800)
        opts = await pg.evaluate("RW.options.filter(function(o){return document.getElementById(o.id)}).map(function(o){return {id:o.id,param:o.param,allowed:o.allowed,names:o.names}})")
        meta = []
        for o in opts:
            if o['id'] in ('top',): continue
            for i, v in enumerate(o['allowed']):
                await pg.goto(URL + '?pal=off&cur=off&' + o['param'] + '=' + v); await pg.wait_for_timeout(600)
                h = await pg.evaluate("""id=>{var e=document.getElementById(id);var r=e.getBoundingClientRect();var y=r.top+scrollY;
                    (window.RW&&RW.lenis)?RW.lenis.scrollTo(y-40,{immediate:true}):scrollTo(0,y-40); return r.height}""", o['id'])
                # walk through pinned/scrubbed sections a little
                for k in range(6):
                    await pg.mouse.wheel(0, 140); await pg.wait_for_timeout(120)
                await pg.evaluate("""id=>{var e=document.getElementById(id);var y=e.getBoundingClientRect().top+scrollY;(window.RW&&RW.lenis)?RW.lenis.scrollTo(y-40,{immediate:true}):scrollTo(0,y-40)}""", o['id'])
                await pg.wait_for_timeout(1600)
                await pg.evaluate("()=>{var o=document.querySelector('.rwopt');if(o)o.remove();var h=document.querySelector('.hdr');if(h)h.style.visibility='hidden'}")
                f = f"{OUT}/{o['id']}-{o['param']}{v}.png"
                hh = min(int(h) + 40, 1500 if W > 700 else 2600)
                await pg.screenshot(path=f, full_page=False, clip={'x': 0, 'y': 0, 'width': W, 'height': min(hh, 900 if W > 700 else 844)}) if hh <= (900 if W > 700 else 844) else await pg.screenshot(path=f, full_page=True, clip={'x': 0, 'y': await pg.evaluate("scrollY"), 'width': W, 'height': hh})
                meta.append({'id': o['id'], 'param': o['param'], 'v': v, 'name': o['names'][i] if i < len(o['names']) else v, 'file': f})
                print(f, flush=True)
        json.dump(meta, open(OUT + '/meta.json', 'w'), indent=1)
        await br.close()
asyncio.run(main())
