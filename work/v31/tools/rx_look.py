# Quick look at the pointer reactions: moves the mouse through sections and screenshots each.
import sys, asyncio
from playwright.async_api import async_playwright
OUT = sys.argv[2]
SECS = sys.argv[3].split(',')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
        await pg.goto('file://' + sys.argv[1])
        await pg.wait_for_timeout(1200)
        for s in SECS:
            await pg.evaluate("id=>{var e=document.getElementById(id)||document.querySelector(id);var y=e.getBoundingClientRect().top+scrollY;(window.RW&&RW.lenis)?RW.lenis.scrollTo(y-60,{immediate:true}):scrollTo(0,y-60)}", s)
            await pg.wait_for_timeout(900)
            await pg.mouse.move(200, 120)
            for i in range(26):
                await pg.mouse.move(300 + i * 30, 300 + (i % 7) * 25)
                await pg.wait_for_timeout(30)
            await pg.wait_for_timeout(120)
            await pg.screenshot(path=f'{OUT}/{s.strip("#.")}.png')
        print('errors:', errs[:10])
        await b.close()
asyncio.run(main())
