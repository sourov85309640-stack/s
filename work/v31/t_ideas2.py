from playwright.sync_api import sync_playwright
F='/tmp/claude-0/-home-claude/d95ffac0-591c-525e-b9e4-2b56d578c3cb/scratchpad/v31/out_ideas2.html'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    pg=b.new_page(viewport={'width':1440,'height':900})
    pg.goto('file://'+F); pg.wait_for_timeout(2500)
    for y in range(0,3000,200):
        pg.mouse.wheel(0,200); pg.wait_for_timeout(120)
    pg.wait_for_timeout(1200)
    print(pg.evaluate("""()=>{var h=document.getElementById('header'),p=document.getElementById('progress');var r=p.getBoundingClientRect();return {hidden:h.classList.contains('is-hidden'),progTop:r.top,progBottom:r.bottom,pv:p.style.getPropertyValue('--p'),y:scrollY}}"""))
    pg.screenshot(path='shots/ideas2_1440_hdrhidden.png',clip={'x':0,'y':0,'width':1440,'height':120})
    b.close()
