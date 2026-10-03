"""Lead's judging helper: screenshot every section for variants 1..N, then montage per section.
python3 tools/judge_shots.py out/lead.html 1440 900 6 [sections...]"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *
from PIL import Image

F = os.path.abspath(sys.argv[1]); W = int(sys.argv[2]); H = int(sys.argv[3]); N = int(sys.argv[4])
SECS = sys.argv[5:] or ['top', 'reviews', 'services', 'where', 'decide', 'whole', 'projects', 'how', 'checks', 'areas', 'faq', 'contact']
EXTRA = {'where': [0.6, 1.4], 'whole': [0.5, 1.2]}
mob = W < 600
os.makedirs(ROOT + '/shots/judge', exist_ok=True)
with sync_playwright() as p:
    b = launch(p)
    for v in range(1, N + 1):
        pg = newpage(b, W, H, mob=mob)
        q = '&'.join(f'{k}={v}' for k in ['v', 'rv', 'sv', 'dv', 'cv', 'av', 'fv', 'pv', 'hv'])
        goto(pg, 'file://' + F + '?' + q, wait=2500)
        for s in SECS:
            y = top_of(pg, '#' + s)
            if y is None: continue
            jump(pg, max(0, y - 64), 1300)
            pg.screenshot(path=f'{ROOT}/shots/judge/{s}_{W}_v{v}_0.png')
            for i, f in enumerate(EXTRA.get(s, [])):
                jump(pg, y - 64 + f * H, 1500)
                pg.screenshot(path=f'{ROOT}/shots/judge/{s}_{W}_v{v}_{i+1}.png')
        print('v', v, 'errors', pg.errs[:5])
        pg.context.close()
    b.close()
# montages: one image per section, variants in a grid (2 columns), frames per variant side by side
for s in SECS:
    rows = []
    for v in range(1, N + 1):
        fr = [f'{ROOT}/shots/judge/{s}_{W}_v{v}_{i}.png' for i in range(3)]
        fr = [Image.open(x) for x in fr if os.path.exists(x)]
        if not fr: continue
        sc = 0.5 if not mob else 0.6
        fr = [im.resize((int(im.width * sc), int(im.height * sc))) for im in fr]
        row = Image.new('RGB', (sum(im.width for im in fr) + 8 * len(fr), fr[0].height + 8), 'black')
        x = 0
        for im in fr: row.paste(im, (x, 0)); x += im.width + 8
        rows.append(row)
    if not rows: continue
    cols = 2 if len(rows[0].getbbox() and [1]) and rows[0].width < 1600 else 1
    cols = 2 if rows[0].width <= 1000 else 1
    rw = max(r.width for r in rows); rh = rows[0].height
    nr = (len(rows) + cols - 1) // cols
    m = Image.new('RGB', (rw * cols, rh * nr), 'black')
    for i, r in enumerate(rows): m.paste(r, ((i % cols) * rw, (i // cols) * rh))
    m.save(f'{ROOT}/shots/judge/M_{s}_{W}.jpg', quality=72)
    print('montage', s, m.size)
