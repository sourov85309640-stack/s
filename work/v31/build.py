#!/usr/bin/env python3
"""Build the single-file master from src/.

Usage:  python3 build.py [out.html]        (default: roofing-master-v3.1.html next to this file)

Reads src/index.html and inlines, in this order:
  1. <!-- @include path -->     any file under src/ (sections/*.html, svg/*.svg); nested includes work
  2. src="img/x" href="img/x" url(img/x) url(fonts/x)   -> base64 data URIs
  3. <link rel="stylesheet" href="x.css">               -> <style>
  4. <script src="x.js"></script>                       -> <script>
Also writes SWAP-MAP.txt (from src/swap-map.txt) next to build.py, and prints lint warnings.
Standard library only.
"""
import base64, mimetypes, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
CLIENT = '--client' in sys.argv   # client build: the owner Versions tool is left out
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
OUT = ARGS[0] if ARGS else os.path.join(HERE, 'roofing-master-v3.1.html')

mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('image/webp', '.webp')


def read(p):
    with open(os.path.join(SRC, p), encoding='utf8') as f:
        return f.read()


_cache = {}
def data_uri(rel):
    path = os.path.join(SRC, rel)
    if path not in _cache:
        mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        with open(path, 'rb') as f:
            _cache[path] = 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())
    return _cache[path]


def exists(rel):
    return os.path.exists(os.path.join(SRC, rel))


def assets(code):
    """swap img/ and fonts/ references for data URIs (missing files are left alone and reported)"""
    def a(m):
        return m.group(1) + data_uri(m.group(2)) + m.group(3) if exists(m.group(2)) else m.group(0)
    code = re.sub(r'((?:src|href)=")(img/[^"]+)(")', a, code)
    code = re.sub(r"(url\(['\"]?)((?:fonts|img)/[^)'\"]+)(['\"]?\))", a, code)
    return code


errors, warns = [], []

html = read('index.html')
if CLIENT:
    html = re.sub(r'<!-- OWNER TOOL:.*?-->\s*<link rel="stylesheet" href="options.css">\s*', '', html, flags=re.S)
    html = html.replace('<script src="options.js"></script>', '')
# 1. includes (nested)
for _ in range(6):
    new = re.sub(r'<!--\s*@include\s+(\S+)\s*-->', lambda m: read(m.group(1)).strip() if exists(m.group(1)) else (errors.append('missing include ' + m.group(1)) or ''), html)
    if new == html:
        break
    html = new
# 2. assets in the markup
html = assets(html)


# 3. css, 4. js
def inline_css(m):
    if not exists(m.group(1)):
        errors.append('missing css ' + m.group(1)); return ''
    code = assets(read(m.group(1)))
    if re.search(r'transition\s*:\s*all\b', code):
        errors.append('transition:all in ' + m.group(1))
    if re.search(r'scale\(\s*0\s*\)', code):
        warns.append('scale(0) in ' + m.group(1))
    return '<style>\n' + code.strip() + '\n</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)">', inline_css, html)


def inline_js(m):
    if not exists(m.group(1)):
        errors.append('missing js ' + m.group(1)); return ''
    code = read(m.group(1)).strip()
    if '</script' in code.lower():
        errors.append('</script in ' + m.group(1))
    return '<script>\n' + code + '\n</script>'
html = re.sub(r'<script src="([^"]+\.js)"></script>', inline_js, html)

live = re.sub(r'<!--.*?-->', '', html, flags=re.S)
if 'src="img/' in live or re.search(r'<link rel="stylesheet" href=', html) or re.search(r'<script src=', live):
    errors.append('unresolved src/link/script left in output')

# lint: dashes in text, duplicate ids, unresolved asset names
text_only = re.sub(r'<(script|style)\b.*?</\1>', '', live, flags=re.S)
text_only = re.sub(r'<[^>]+>', ' ', text_only)
if '—' in text_only or '–' in text_only:
    errors.append('em/en dash in visible text')
for name in ('script', 'style'):
    for blk in re.findall(r'<%s\b[^>]*>(.*?)</%s>' % (name, name), live, flags=re.S):
        if '—' in blk:
            warns.append('em dash character inside a <%s> block (check it is not user-visible text)' % name)
ids = re.findall(r'\sid="([^"]+)"', re.sub(r'<script\b.*?</script>', '', live, flags=re.S))
dups = sorted({i for i in ids if ids.count(i) > 1})
if dups:
    errors.append('duplicate ids: ' + ', '.join(dups))
for m in re.finditer(r'(?:img|fonts)/[\w\-./]+\.(?:webp|png|jpg|jpeg|svg|woff2)', live):
    if not exists(m.group(0)):
        errors.append('missing asset ' + m.group(0))

with open(OUT, 'w', encoding='utf8') as f:
    f.write(html)

swap_path = os.path.join(SRC, 'swap-map.txt')
if os.path.exists(swap_path):
    with open(swap_path, encoding='utf8') as f:
        swap = f.read().strip()
    with open(os.path.join(HERE, 'SWAP-MAP.txt'), 'w', encoding='utf8') as f:
        f.write(swap + '\n')

print('wrote %s (%d KB)' % (OUT, os.path.getsize(OUT) // 1024))
for w in warns:
    print('WARN  ' + w)
for e in errors:
    print('ERROR ' + e)
sys.exit(1 if errors else 0)
