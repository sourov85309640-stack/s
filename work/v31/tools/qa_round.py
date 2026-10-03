"""Lead QA round: python3 tools/qa_round.py out/lead.html TAG  -> prints a report, screenshots in shots/TAG_*"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *

F = 'file://' + os.path.abspath(sys.argv[1]); TAG = sys.argv[2] if len(sys.argv) > 2 else 'qa'
only = sys.argv[3].split(',') if len(sys.argv) > 3 else ['overflow', 'walk', 'reduced', 'off', 'axe', 'focus', 'reload', 'perf']
R = {}
with sync_playwright() as p:
    b = launch(p)
    if 'overflow' in only:
        R['overflow'] = {}
        for w in WIDTHS:
            pg = newpage(b, w, 900 if w > 600 else 844, mob=w < 768)
            goto(pg, F, 1800); walk(pg, 600, 40)
            o = overflow(pg)
            R['overflow'][w] = {'sw': o['scrollW'], 'cw': o['clientW'], 'off': o['offenders'][:6], 'errs': pg.errs[:5]}
            pg.context.close()
    if 'walk' in only:
        R['walk'] = {}
        for (w, h, m) in [(1440, 900, False), (390, 844, True), (1024, 768, False)]:
            pg = newpage(b, w, h, mob=m)
            goto(pg, F, 2000); walk(pg, 350, 90)
            ht = hidden_text(pg)
            # reverse and fast
            pg.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)'); pg.wait_for_timeout(1500)
            pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(1500)
            shot(pg, f'{TAG}_top_after_fast_{w}')
            R['walk'][w] = {'hidden': ht, 'errs': pg.errs[:8]}
            pg.context.close()
    for mode in ('reduced', 'off'):
        if mode not in only: continue
        R[mode] = {}
        for (w, h, m) in [(1440, 900, False), (390, 844, True)]:
            pg = newpage(b, w, h, mob=m, reduced=(mode == 'reduced'))
            goto(pg, F, 1500, motion_off=(mode == 'off'))
            info = pg.evaluate("()=>({motion:document.documentElement.classList.contains('has-motion'),attr:document.documentElement.getAttribute('data-motion'),spacers:document.querySelectorAll('.pin-spacer').length,canv:document.querySelectorAll('[data-fx-canvas] canvas, canvas').length})")
            ht = hidden_text(pg)
            pg.screenshot(path=f'{ROOT}/shots/{TAG}_{mode}_{w}_full.png', full_page=True)
            R[mode][w] = {'info': info, 'hidden': ht, 'errs': pg.errs[:5]}
            pg.context.close()
    if 'axe' in only:
        R['axe'] = {}
        for (w, m) in [(1440, False), (390, True)]:
            pg = newpage(b, w, 900, mob=m)
            goto(pg, F, 1500); walk(pg, 500, 40); jump(pg, 0, 800)
            R['axe'][w] = axe(pg)
            pg.context.close()
    if 'focus' in only:
        R['focus'] = {}
        for (w, h, m) in [(1440, 900, False), (390, 844, True)]:
            pg = newpage(b, w, h, mob=m)
            goto(pg, F, 1800)
            fw = focus_walk(pg, 90)
            bad = [f for f in fw if f and (f['underHdr'] or f['underBar'] or not f['ring'] or (f['w'] < 24 or f['h'] < 24))]
            R['focus'][w] = {'stops': len([f for f in fw if f]), 'bad': bad[:15]}
            pg.context.close()
    if 'reload' in only:
        R['reload'] = {}
        for (w, h) in [(1440, 900), (1280, 720), (1024, 768)]:
            for sel in ('#where', '#whole', '#decide', '#how'):
                pg = newpage(b, w, h)
                goto(pg, F, 1500)
                y = top_of(pg, sel)
                jump(pg, y + h * 0.9, 1500)
                pg.reload(); pg.wait_for_timeout(2500)
                nm = sel[1:]
                shot(pg, f'{TAG}_reload_{nm}_{w}x{h}')
                # resize while there
                pg.set_viewport_size({'width': w - 200, 'height': h}); pg.wait_for_timeout(1500)
                shot(pg, f'{TAG}_resize_{nm}_{w}x{h}')
                R['reload'][f'{nm}_{w}x{h}'] = pg.errs[:4]
                pg.context.close()
    if 'perf' in only:
        R['perf'] = {}
        for (w, h, m) in [(1440, 900, False), (390, 844, True)]:
            pg = newpage(b, w, h, mob=m)
            goto(pg, F, 2000)
            hgt = pg.evaluate('document.documentElement.scrollHeight')
            R['perf'][w] = frame_times(pg, 6000, hgt - h)
            pg.context.close()
    b.close()
print(json.dumps(R, indent=1)[:20000])
