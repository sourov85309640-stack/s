"""Viewport screenshots down the whole page + montages.  python3 tools/tour.py out/lead.html 1440 900 TAG [query]"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from qa_lib import *
from PIL import Image
F = 'file://' + os.path.abspath(sys.argv[1]); W = int(sys.argv[2]); H = int(sys.argv[3]); TAG = sys.argv[4]
Q = sys.argv[5] if len(sys.argv) > 5 else ''
d = f'{ROOT}/shots/{TAG}'; os.makedirs(d, exist_ok=True)
with sync_playwright() as p:
    b = launch(p)
    pg = newpage(b, W, H, mob=W < 768)
    goto(pg, F + Q, 2500)
    hgt = pg.evaluate('document.documentElement.scrollHeight')
    y, i, files = 0, 0, []
    while y < hgt - H + 10:
        # walk there gently so scrubbed scenes settle
        pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(1300)
        f = f'{d}/{i:02d}.png'; pg.screenshot(path=f); files.append(f)
        y += int(H * 0.85); i += 1
        hgt = pg.evaluate('document.documentElement.scrollHeight')
    print('shots', i, 'height', hgt, 'errs', pg.errs[:6])
    b.close()
# montages of 6
sc = 0.5 if W > 600 else 0.7
for k in range(0, len(files), 6):
    ims = [Image.open(f) for f in files[k:k + 6]]
    ims = [im.resize((int(im.width * sc), int(im.height * sc))) for im in ims]
    cols = 3 if W > 600 else 6
    cols = min(cols, len(ims)); rows = (len(ims) + cols - 1) // cols
    m = Image.new('RGB', (cols * (ims[0].width + 6), rows * (ims[0].height + 6)), 'black')
    for j, im in enumerate(ims): m.paste(im, ((j % cols) * (im.width + 6), (j // cols) * (im.height + 6)))
    m.save(f'{d}/M{k // 6:02d}.jpg', quality=75)
