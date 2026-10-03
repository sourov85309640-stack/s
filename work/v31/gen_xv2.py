#!/usr/bin/env python3
"""Generates the light, company-neutral artwork for the #whole section (owner: whole team).

  src/svg/xv-model.svg   five stacked roof planes for the CSS 3D exploded view (bottom to top):
                         0 rafters, 1 underlay, 2 battens, 3 covering (tiles AND slates groups), 4 ridge and lead
                         (tile ridge AND slate ridge groups). The section's data-cover="tiles|slates" picks one.
  src/svg/xv-cut.svg     the same planes as a cut-away corner block (variant 4): each layer clipped with a stepped
                         notch, thickness strips on the cut walls, a loose wedge that lifts out, and callouts.

All art is drawn on a 520x340 plane. Colours come from classes styled in src/whole.css.
Run:  python3 gen_xv2.py
"""
W, H = 520, 340


def svg(inner, cls='', style=''):
    return '<svg viewBox="0 0 %d %d" aria-hidden="true" focusable="false"%s%s>%s</svg>' % (
        W, H, (' class="%s"' % cls) if cls else '', (' style="%s"' % style) if style else '', inner)


# ---------- layer art ----------
def rafters():
    r = ['<rect class="xv-pl" x=".5" y=".5" width="519" height="339"/>',
         '<rect class="xv-t" x="0" y="0" width="520" height="12"/>',
         '<rect class="xv-t" x="0" y="326" width="520" height="14"/>']
    for k in range(11):
        r.append('<rect class="xv-t" x="%d" y="12" width="12" height="314"/>' % (14 + k * 46))
    return ''.join(r)


def underlay():
    u = ['<rect class="xv-sheet" x=".5" y=".5" width="519" height="339"/>']
    for y in (68, 136, 204, 272):
        u.append('<path class="xv-ln" d="M0 %d.5H520"/>' % y)
    for y in (68, 136, 204, 272):
        for x in range(30, 520, 60):
            u.append('<circle class="xv-dot" cx="%d" cy="%d" r="1.6"/>' % (x, y - 6))
    return ''.join(u)


def battens():
    b = ['<rect class="xv-pl" x=".5" y=".5" width="519" height="339"/>']
    for y in range(14, 340, 34):
        b.append('<rect class="xv-b" x="0" y="%d" width="520" height="9"/>' % y)
    return ''.join(b)


GAP_PT = (320, 150)   # missing piece (variant 5: the drop goes through here)
SLIP_PT = (205, 222)  # slipped piece


def courses(tw, th, cls, tones, gap_cls='xv-gap', slip_cls='xv-slip'):
    out = []
    row = 0
    for y in range(0, H, th):
        off = 0 if row % 2 == 0 else -tw // 2
        x = off
        while x < W:
            cx = max(0, x)
            cw = min(W, x + tw) - cx
            ch = min(H, y + th) - y
            if cw > 6 and ch > 6:
                inside = lambda p: cx <= p[0] < cx + cw and y <= p[1] < y + ch
                tone = tones[(row * 7 + (x // tw) * 3) % len(tones)]
                if inside(GAP_PT):
                    out.append('<rect class="%s" x="%d" y="%d" width="%d" height="%d" rx="1.5"/>' % (gap_cls, cx + 2, y + 2, cw - 4, ch - 4))
                elif inside(SLIP_PT):
                    out.append('<rect class="%s %s" x="%d" y="%d" width="%d" height="%d" rx="1.5" transform="rotate(4 %d %d)"/>' % (
                        cls, slip_cls, cx + 1, y + 7, cw - 2, ch - 2, cx + cw // 2, y + ch // 2))
                else:
                    out.append('<rect class="%s %s" data-r="%d" x="%d" y="%d" width="%d" height="%d" rx="1.5"/>' % (
                        cls, tone, row, cx + 1, y + 1, cw - 2, ch - 2))
            x += tw
        row += 1
    return ''.join(out)


def covering():
    tiles = '<g class="xv-c xv-c-tiles">' + courses(58, 34, 'xv-tile', ['t1', 't2', 't3', 't2']) + '</g>'
    slates = '<g class="xv-c xv-c-slates">' + courses(44, 26, 'xv-slate', ['s1', 's2', 's3', 's1', 's2']) + '</g>'
    return '<rect class="xv-pl" x=".5" y=".5" width="519" height="339"/>' + tiles + slates


def ridge():
    # tile ridge: half-round cap with joints; slate ridge: angled cap with a centre line
    t = ['<g class="xv-c xv-c-tiles"><rect class="xv-ridge" x="-6" y="-5" width="532" height="26" rx="13"/>']
    for x in range(24, 520, 52):
        t.append('<path class="xv-ln2" d="M%d -3V19"/>' % x)
    t.append('</g>')
    s = ['<g class="xv-c xv-c-slates"><path class="xv-ridge-s" d="M-6 -4H526V16H-6Z"/><path class="xv-ln3" d="M-6 6H526"/>']
    for x in range(30, 520, 64):
        s.append('<path class="xv-ln2" d="M%d -4V16"/>' % x)
    s.append('</g>')
    g = [''.join(t), ''.join(s), '<path class="xv-lead" d="M492 40V320"/>']
    for y in range(60, 320, 38):
        g.append('<path class="xv-lead2" d="M470 %d H506"/>' % y)
    g.append('<path class="xv-lead" d="M0 330H520"/>')
    return ''.join(g)


ART = [rafters(), underlay(), battens(), covering(), ridge()]
NAMES = ['Rafters', 'Underlay', 'Battens', None, 'Ridge and lead']


def name_html(i):
    if i == 3:
        return '<span class="xv-cname">Tiles</span>'
    return NAMES[i]


# ---------- 1. exploded model ----------
out = []
for i, art in enumerate(ART):
    out.append('<div class="xv-l" data-layer="%d" style="--i:%d">%s<span class="xv-tag" aria-hidden="true"><i>0%d</i><b>%s</b></span></div>'
               % (i, i, svg(art), 5 - i, name_html(i)))
open('src/svg/xv-model.svg', 'w').write('\n'.join(out) + '\n')

# ---------- 2. cut-away corner block ----------
CUT = [(0, 0), (120, 78), (186, 122), (250, 166), (250, 166)]   # notch (cx, cy) per layer, near corner = bottom right
THICK = [24, 5, 12, 14, 0]                                      # strip depth per layer (px, exaggerated)
STRIP = ['xs-raf', 'xs-und', 'xs-bat', 'xs-cov', '']


def poly(cx, cy):
    if not cx:
        return ''
    return 'clip-path:polygon(0 0,%dpx 0,%dpx %dpx,%dpx %dpx,%dpx %dpx,%dpx %dpx,0 %dpx)' % (
        W, W, H - cy, W - cx, H - cy, W - cx, H, W - cx, H, H)


def strip_x(x0, x1, y, t, cls):   # along x at y, hangs down (rotateX(-90deg))
    return '<i class="xs xs-x %s" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"></i>' % (cls, x0, y, x1 - x0, t)


def strip_y(y0, y1, x, t, cls):   # along y at x, hangs down (rotateY(90deg))
    return '<i class="xs xs-y %s" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"></i>' % (cls, x, y0, t, y1 - y0)


CALL = [  # (layer, x, y, side) anchor on the plane and which side the label sits
    (0, 470, 300, 'r'),
    (1, 352, 286, 'r'),
    (2, 300, 222, 'l'),
    (3, 180, 120, 'l'),
    (4, 150, 6, 'l'),
]
cut = []
for i, art in enumerate(ART):
    cx, cy = CUT[i]
    t = THICK[i]
    parts = [svg(art, 'xv-main', poly(cx, cy))]
    if t:
        cls = STRIP[i]
        if cx:
            parts.append(strip_x(0, W - cx, H, t, cls))
            parts.append(strip_y(0, H - cy, W, t, cls))
            parts.append(strip_x(W - cx, W, H - cy, t, cls + ' xs-in'))
            parts.append(strip_y(H - cy, H, W - cx, t, cls + ' xs-in'))
        else:
            parts.append(strip_x(0, W, H, t, cls))
            parts.append(strip_y(0, H, W, t, cls))
    # loose wedge: the cut-out corner, lifts away on scroll
    if cx:
        wedge = [svg(art, 'xv-wsvg', 'clip-path:inset(%dpx 0 0 %dpx)' % (H - cy, W - cx))]
        if t:
            wedge.append(strip_x(W - cx, W, H, t, STRIP[i]))
            wedge.append(strip_y(H - cy, H, W, t, STRIP[i]))
        parts.append('<div class="xv-wedge">%s</div>' % ''.join(wedge))
    lay, ax, ay, side = CALL[i]
    parts.append('<span class="xv-call xv-call-%s" style="left:%dpx;top:%dpx" aria-hidden="true"><span class="xv-cin"><i>0%d</i><b>%s</b></span></span>'
                 % (side, ax, ay, 5 - i, name_html(i)))
    cut.append('<div class="xv-l xv-k" data-layer="%d" style="--i:%d">%s</div>' % (i, i, ''.join(parts)))
open('src/svg/xv-cut.svg', 'w').write('\n'.join(cut) + '\n')

# ---------- 3. turntable plate (variant 3) ----------
ticks = []
import math
for k in range(0, 360, 10):
    a = math.radians(k)
    r1, r2 = 300, (286 if k % 30 else 276)
    ticks.append('<path d="M%.1f %.1fL%.1f %.1f"/>' % (310 + r1 * math.cos(a), 310 + r1 * math.sin(a), 310 + r2 * math.cos(a), 310 + r2 * math.sin(a)))
plate = ('<svg class="xv-plate-svg" viewBox="0 0 620 620" aria-hidden="true" focusable="false">'
         '<circle class="xv-pl-c" cx="310" cy="310" r="306"/><circle class="xv-pl-r" cx="310" cy="310" r="262"/>'
         '<g class="xv-pl-t">%s</g></svg>' % ''.join(ticks))
open('src/svg/xv-plate.svg', 'w').write(plate + '\n')
print('ok', len('\n'.join(out)), len('\n'.join(cut)))
