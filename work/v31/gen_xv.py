#!/usr/bin/env python3
"""Generates src/svg/xv-layers.svg: five stacked roof layers (bottom to top) for the 3D exploded view.
Layer art is drawn on a 520x340 plane. Each layer is a div (3D plane) holding an inline svg and a label."""
W,H=520,340
def svg(inner,cls=''):
    return '<svg viewBox="0 0 %d %d" aria-hidden="true" focusable="false"%s>%s</svg>'%(W,H,(' class="%s"'%cls) if cls else '',inner)

# 0 rafters: ridge board, 11 rafters, wall plate
r=['<rect class="xv-bg" width="520" height="340"/>','<rect class="xv-t" x="0" y="0" width="520" height="12"/>','<rect class="xv-t" x="0" y="326" width="520" height="14"/>']
for k in range(11):
    r.append('<rect class="xv-t" x="%d" y="12" width="12" height="314"/>'%(14+k*46))
L0=svg(''.join(r))

# 1 underlay: sheet with overlap lines and fixings
u=['<rect class="xv-bg xv-sheet" width="520" height="340"/>']
for y in (68,136,204,272):
    u.append('<path class="xv-ln" d="M0 %d.5H520"/>'%y)
for y in (68,136,204,272):
    for x in range(30,520,60):
        u.append('<circle class="xv-dot" cx="%d" cy="%d" r="1.6"/>'%(x,y-6))
L1=svg(''.join(u))

# 2 battens: horizontal laths
b=['<rect class="xv-bg" width="520" height="340"/>']
for y in range(14,340,34):
    b.append('<rect class="xv-b" x="0" y="%d" width="520" height="9"/>'%y)
L2=svg(''.join(b))

# 3 tiles: staggered courses, one slipped, one missing
t=['<rect class="xv-bg" width="520" height="340"/>']
tw,th=58,34
row=0
for y in range(0,340,th):
    off=0 if row%2==0 else -tw//2
    x=off
    col=0
    while x<520:
        cx=max(0,x); cw=min(520,x+tw)-cx
        if cw>6:
            key=(row,col)
            if key==(4,5):
                t.append('<rect class="xv-gap" x="%d" y="%d" width="%d" height="%d"/>'%(cx+2,y+2,cw-4,th-4))
            elif key==(6,3):
                t.append('<rect class="xv-slip" x="%d" y="%d" width="%d" height="%d" transform="rotate(4 %d %d)"/>'%(cx+1,y+8,cw-2,th-2,cx+cw//2,y+th//2))
            else:
                t.append('<rect class="xv-tile" x="%d" y="%d" width="%d" height="%d"/>'%(cx+1,y+1,cw-2,th-2))
        x+=tw; col+=1
    row+=1
L3=svg(''.join(t))

# 4 ridge and lead: ridge cap, step flashing up the right edge, valley strip
g=['<rect class="xv-ridge" x="-6" y="-4" width="532" height="26" rx="13"/>']
for x in range(24,520,52):
    g.append('<path class="xv-ln2" d="M%d 0V18"/>'%x)
g.append('<path class="xv-lead" d="M492 40V320"/>')
for y in range(60,320,38):
    g.append('<path class="xv-lead2" d="M470 %d H506"/>'%y)
g.append('<path class="xv-lead" d="M0 326H520"/>')
L4=svg(''.join(g))

names=['Rafters','Underlay','Battens','Tiles','Ridge and lead']
layers=[L0,L1,L2,L3,L4]
out=[]
for i,(n,s) in enumerate(zip(names,layers)):
    out.append('<div class="xv-l" data-layer="%d" style="--i:%d">%s<span class="xv-tag" aria-hidden="true"><i>0%d</i>%s</span></div>'%(i,i,s,5-i,n))
open('src/svg/xv-layers.svg','w').write('\n'.join(out)+'\n')
print(len('\n'.join(out)))
