# Builds deliver/roofing-options.html: a picture of every version of every section, each opening that version in a new tab.
# usage: python3 tools/gallery.py deliver/roofing-master-v3.1.html deliver/roofing-options.html
import asyncio, base64, io, json, os, sys, html
from playwright.async_api import async_playwright
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
PAGE = os.path.basename(SRC)
URL = 'file://' + os.path.abspath(SRC)
CLEAN = 'pal=off&cur=ring&options=off'

async def shot(pg, query, sec):
    await pg.goto(URL + '?' + query + '&' + CLEAN)
    await pg.wait_for_timeout(700)
    await pg.evaluate("""id=>{var e=document.getElementById(id); if(!e) return; var y=e.getBoundingClientRect().top+scrollY-10;
      if(window.RW&&RW.lenis) RW.lenis.scrollTo(y,{immediate:true}); else scrollTo(0,y)}""", sec)
    await pg.wait_for_timeout(1900)
    await pg.evaluate("()=>{var o=document.querySelector('.rwopt'); if(o) o.remove(); var h=document.querySelector('.hdr'); if(h) h.style.visibility='hidden'}")
    png = await pg.screenshot(clip={'x': 0, 'y': 0, 'width': 1440, 'height': 860})
    im = Image.open(io.BytesIO(png)).convert('RGB').resize((640, 382), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=72, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        pg = await br.new_page(viewport={'width': 1440, 'height': 900})
        await pg.goto(URL + '?' + CLEAN); await pg.wait_for_timeout(800)
        opts = await pg.evaluate("""()=>{var L={};RW.options.forEach(function(o){L[o.param]={id:o.id,param:o.param,allowed:o.allowed,names:o.names,label:o.label||''}});
           var order=[].slice.call(document.querySelectorAll('main > section[id]')).map(function(s){return s.id});
           return {opts:Object.keys(L).map(function(k){return L[k]}),order:order}}""")
        order = opts['order']; rows = []
        GLOBAL = {'cursor', 'companion', 'team', 'atmosphere'}
        rows.append({'id': 'top', 'param': 'hero', 'allowed': ['a', 'b', 'c'], 'names': ['Headline left', 'Gable plate', 'Centred'], 'label': 'Hero layout'})
        for o in sorted(opts['opts'], key=lambda o: order.index(o['id']) if o['id'] in order else 999):
            rows.append(o)
        out = []
        for o in rows:
            glob = o['id'] in GLOBAL or o['id'] not in order
            cards = []
            for i, v in enumerate(o['allowed']):
                name = (o['names'][i] if i < len(o['names']) else v)
                sketch = name.startswith('Sketch: '); name = name.replace('Sketch: ', '')
                link = PAGE + '?' + o['param'] + '=' + v + ('' if glob or o['id'] == 'top' else '#' + o['id'])
                img = '' if glob else await shot(pg, o['param'] + '=' + v, o['id'])
                cards.append((chr(65 + i), name, sketch, link, img, i == 0))
                print(o['param'], v, flush=True)
            out.append((o, glob, cards))
        await br.close()
    LBL = {'top': 'Hero', 'reviews': 'Reviews', 'services': 'What we do', 'problems': 'Start with what you can see', 'where': 'Where water gets in', 'decide': 'Repair or replace', 'whole': '3D roof', 'projects': 'Recent project', 'how': 'How it works', 'checks': 'Checks from the ground', 'areas': 'Areas', 'faq': 'FAQ', 'contact': 'Contact', 'types': 'Roofs we work on', 'quiz': 'Quick roof check', 'before': 'Before and after', 'sectors': 'Who we work for', 'survey': 'Free survey band', 'care': 'Seasonal care', 'advice': 'Advice guides', 'accred': 'Accreditations', 'cursor': 'Cursor', 'companion': 'Roofer who peeks in', 'team': 'Team section', 'atmosphere': 'Atmosphere'}
    secs = []
    for o, glob, cards in out:
        title = o.get('label') or LBL.get(o['id'], o['id'])
        if o['id'] == 'top' and o['param'] != 'hero': title = 'Hero motion'
        items = ''
        for L, name, sketch, link, img, dflt in cards:
            tags = ('<span class="t">default</span>' if dflt else '') + ('<span class="t s">rough sketch</span>' if sketch else '')
            pic = '<img src="%s" alt="" loading="lazy">' % img if img else '<span class="noimg">Whole page setting</span>'
            items += '<li><a href="%s" target="_blank" rel="noopener">%s<span class="cap"><b>%s</b><span>%s</span>%s<span class="go">Open in a new tab &#8599;</span></span></a></li>' % (html.escape(link), pic, L, html.escape(name), tags)
        secs.append('<section><h2>%s <small>%d versions</small></h2><ul>%s</ul></section>' % (html.escape(title), len(cards), items))
    doc = '''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Roofing template: every version</title>
<style>:root{--paper:#FAF9F6;--ink:#1F2B30;--muted:#4D575C;--copper:#985632;--line:#D7D1C5}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 "Source Sans 3",Arial,sans-serif}
header{padding:40px 24px 8px;max-width:1240px;margin:0 auto}h1{font:700 2rem/1.15 Arial,sans-serif;margin:0 0 .5rem}header p{color:var(--muted);max-width:46rem;margin:.3rem 0}
nav{position:sticky;top:0;z-index:2;background:rgba(250,249,246,.95);border-bottom:1px solid var(--line);padding:10px 24px;overflow-x:auto;white-space:nowrap}nav a{display:inline-block;margin-right:14px;color:var(--copper);font-weight:600;text-decoration:none;font-size:.9rem}
main{max-width:1240px;margin:0 auto;padding:0 24px 64px}section{padding:28px 0;border-bottom:1px solid var(--line)}h2{font:700 1.375rem/1.2 Arial,sans-serif;margin:0 0 14px}h2 small{font:400 .9rem "Source Sans 3",Arial;color:var(--muted);margin-left:.4rem}
ul{list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}li a{display:block;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 8px 24px -12px rgba(31,43,48,.3);color:inherit;text-decoration:none;transition:transform .2s cubic-bezier(.2,.7,.2,1),box-shadow .2s}
li a:hover{transform:translateY(-3px);box-shadow:0 0 0 2px var(--copper),0 14px 30px -14px rgba(31,43,48,.4)}li a:focus-visible{outline:3px solid var(--copper);outline-offset:3px}
img{display:block;width:100%;height:auto;aspect-ratio:640/382;object-fit:cover;border-bottom:1px solid var(--line)}.noimg{display:grid;place-items:center;height:90px;background:#F0ECE3;color:var(--muted);font-size:.9rem}
.cap{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:12px 14px}.cap b{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--copper);color:#fff}.cap>span:first-of-type{font-weight:600}
.t{font-size:.75rem;padding:2px 8px;border-radius:99px;background:#F0ECE3;color:var(--muted)}.t.s{border:1px dashed var(--line);background:none}.go{flex-basis:100%;font-size:.85rem;color:var(--copper);font-weight:600}</style></head><body>
<header><h1>Every version, side by side</h1><p>Each section of the homepage has two or more designs. Click any picture to open the full page with that version in a new tab, scrolled to that section.</p><p>When you have picked, tell us the letters (for example: Reviews B, Quick roof check A).</p></header>
<nav>''' + ''.join('<a href="#s%d">%s</a>' % (i, html.escape((o.get('label') or LBL.get(o['id'], o['id'])) if not (o['id']=='top' and o['param']!='hero') else 'Hero motion')) for i, (o, g, c) in enumerate(out)) + '''</nav><main>''' + ''.join(s.replace('<section>', '<section id="s%d">' % i, 1) for i, s in enumerate(secs)) + '</main></body></html>'
    open(OUT, 'w').write(doc)
    print('wrote', OUT, round(len(doc) / 1024), 'KB')
asyncio.run(main())
