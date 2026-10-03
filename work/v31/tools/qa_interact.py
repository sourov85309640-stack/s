"""Interaction checks: python3 tools/qa_interact.py out/lead.html TAG"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *
F = 'file://' + os.path.abspath(sys.argv[1]); TAG = sys.argv[2] if len(sys.argv) > 2 else 'ia'
out = {}
def ev(pg, js, arg=None): return pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)
with sync_playwright() as p:
    b = launch(p)
    # 1. every design option loads clean
    opts = [('hm', ['1', '2', '6']), ('rv', ['1', '2', '6']), ('sv', ['1', '2', '6']), ('wv', ['2', '3', '6']), ('dv', ['2', '1', '4']),
            ('xv', ['1', '2', '5']), ('pv', ['1', '2']), ('hv', ['1', '2', '4']), ('cv', ['1', '4']), ('av', ['1', '2']), ('fv', ['1', '2']),
            ('ctv', ['4', '2', '5']), ('fxv', ['6', '3', '1', '0']), ('hero', ['a', 'b', 'c'])]
    out['options'] = {}
    for (w, h, m) in [(1440, 900, False), (390, 844, True)]:
        pg = newpage(b, w, h, mob=m)
        for prm, vals in opts:
            for v in vals[1:]:
                pg.errs.clear()
                goto(pg, F + f'?{prm}={v}', 1200); walk(pg, 700, 25)
                o = overflow(pg)
                ht = [x for x in hidden_text(pg) if 'faq' not in x.lower()]
                if pg.errs or o['scrollW'] > o['clientW'] or ht:
                    out['options'][f'{w} {prm}={v}'] = {'errs': pg.errs[:4], 'ovf': o['offenders'][:3] if o['scrollW'] > o['clientW'] else [], 'hidden': ht[:6]}
        pg.context.close()
    print('OPTIONS', json.dumps(out['options'], indent=1), flush=True)
    # 2. reviews carousel: arrows, keyboard, read more
    pg = newpage(b, 1440, 900); goto(pg, F, 1500); jump_to(pg, '#reviews')
    r = {}
    r['before'] = ev(pg, "()=>document.querySelector('.rv-track')?getComputedStyle(document.querySelector('.rv-track')).transform:null")
    nx = pg.query_selector('#reviews button[aria-label*="Next" i]')
    if nx: nx.click(); pg.wait_for_timeout(900)
    r['after_next'] = ev(pg, "()=>document.querySelector('.rv-track')?getComputedStyle(document.querySelector('.rv-track')).transform:null")
    more = None
    for cand in pg.query_selector_all('#reviews button[aria-expanded]'):
        if cand.is_visible() and pg.evaluate("(e)=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}", cand): more = cand; break
    if more:
        more.click(); pg.wait_for_timeout(500); r['readmore'] = more.get_attribute('aria-expanded')
    shot(pg, f'{TAG}_reviews_after')
    r['errs'] = pg.errs[:3]; out['reviews'] = r
    # 3. whole switch tiles/slates
    jump_to(pg, '#whole'); pg.wait_for_timeout(600)
    sl = pg.query_selector('#whole [role="radio"]:not([aria-checked="true"]), #whole button[aria-pressed="false"][data-cover]')
    if sl: sl.click(); pg.wait_for_timeout(900)
    out['whole'] = {'cover': ev(pg, "()=>document.querySelector('#whole').getAttribute('data-cover')"), 'errs': pg.errs[:3]}
    shot(pg, f'{TAG}_whole_slates')
    # 4. decide pick
    jump_to(pg, '#decide');
    picks = pg.query_selector_all('#decide .dec-pick')
    if len(picks) > 3: picks[3].click(); pg.wait_for_timeout(700)
    out['decide'] = {'pressed': [x.get_attribute('aria-pressed') for x in picks], 'state': ev(pg, "()=>{const b=document.querySelector('.dec-body');return b?getComputedStyle(b).getPropertyValue('--s'):null}")}
    shot(pg, f'{TAG}_decide_pick')
    # 5. faq deep link + toggle
    pg2 = newpage(b, 1440, 900); goto(pg2, F + '#q4', 2500)
    out['faq_deeplink'] = ev(pg2, "()=>document.getElementById('q4')?.getAttribute('aria-expanded')")
    pg2.context.close()
    jump_to(pg, '#faq'); q = pg.query_selector('#q2');
    if q: q.click(); pg.wait_for_timeout(500); out['faq_toggle'] = q.get_attribute('aria-expanded')
    # 6. service link prefill + form validation + success
    jump_to(pg, '#services'); a = pg.query_selector('#services a[href*="issue=leak"]')
    if a: a.click(); pg.wait_for_timeout(1800)
    out['issue'] = ev(pg, "()=>({tag:(document.getElementById('issue-tag')||{}).textContent, hidden:(document.getElementById('issue-tag')||{}).hidden, val:(document.getElementById('f-issue')||{}).value, url:location.search, focused:document.activeElement&&document.activeElement.id})")
    pg.click('#enquiry button[type=submit]'); pg.wait_for_timeout(400)
    out['invalid'] = ev(pg, "()=>[...document.querySelectorAll('#enquiry [aria-invalid=true]')].map(e=>e.id).concat([document.activeElement.id])")
    shot(pg, f'{TAG}_form_errors')
    pg.fill('#f-name', 'Sam Lee'); pg.fill('#f-post', 'GL7 1AA'); pg.fill('#f-contact', '01632 960 482')
    chip = pg.query_selector('#contact button[data-chip], #contact .ct-chip, #contact .chip')
    if chip: chip.click(); pg.wait_for_timeout(200)
    out['notes_after_chip'] = ev(pg, "()=>document.getElementById('f-notes').value")
    pg.click('#enquiry button[type=submit]'); pg.wait_for_timeout(1500)
    out['success'] = ev(pg, "()=>({ok:!document.getElementById('form-ok').hidden, focus:document.activeElement.id})")
    shot(pg, f'{TAG}_form_ok')
    out['errs_main'] = pg.errs[:5]
    pg.context.close()
    # 7. areas town link
    pg = newpage(b, 390, 844, mob=True); goto(pg, F, 1500); jump_to(pg, '#areas')
    t = pg.query_selector('#areas a[href*="town=Tetbury"]')
    if t: t.tap(); pg.wait_for_timeout(1800)
    out['town'] = ev(pg, "()=>({tags:[...document.querySelectorAll('#contact .issue-tag,#contact [id*=town]')].map(e=>e.textContent+'|'+e.hidden+'|'+(e.value||'')), url:location.search})")
    shot(pg, f'{TAG}_town_390')
    # 8. mobile menu
    goto(pg, F, 1200); pg.tap('#menu-btn'); pg.wait_for_timeout(500)
    out['menu'] = ev(pg, "()=>({exp:document.getElementById('menu-btn').getAttribute('aria-expanded'),open:document.getElementById('nav').classList.contains('is-open')})")
    shot(pg, f'{TAG}_menu_390')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    out['menu_esc'] = ev(pg, "()=>document.getElementById('menu-btn').getAttribute('aria-expanded')")
    # 9. touch swipe on reviews at 390
    jump_to(pg, '#reviews'); vp = pg.query_selector('#reviews .rv-vp')
    if vp:
        bb = vp.bounding_box(); y = bb['y'] + bb['height'] / 2
        before = ev(pg, "()=>getComputedStyle(document.querySelector('.rv-track')).transform")
        pg.mouse.move(bb['x'] + bb['width'] * 0.8, y); pg.mouse.down(); pg.mouse.move(bb['x'] + bb['width'] * 0.2, y, steps=8); pg.mouse.up(); pg.wait_for_timeout(900)
        out['swipe'] = [before, ev(pg, "()=>getComputedStyle(document.querySelector('.rv-track')).transform")]
    out['errs_390'] = pg.errs[:5]
    pg.context.close()
    # 10. hover sweep at desktop on cards/buttons
    pg = newpage(b, 1440, 900); goto(pg, F, 1500)
    sels = ['.btn', '#services .svc', '#reviews .rv-card', '#decide .dec-card', '#areas a', '#faq button', '.hdr-phone', '.nav a']
    for s in sels:
        for el in pg.query_selector_all(s)[:4]:
            try:
                el.scroll_into_view_if_needed(); el.hover(); pg.wait_for_timeout(120)
            except Exception as e:
                pass
    out['hover_errs'] = pg.errs[:5]
    pg.context.close()
    b.close()
print(json.dumps(out, indent=1))

