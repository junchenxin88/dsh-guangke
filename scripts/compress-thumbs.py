# 把 thumbs-raw 里的 512 png 压成 288 宽 webp，给卡片当缩略图用。
# 512 png 每张 300KB 上下，41 张直接塞进面板会很卡；288 webp 每张约 20KB。
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "thumbs-raw")
DST = os.path.join(ROOT, "data", "thumbs")
os.makedirs(DST, exist_ok=True)

n = 0
for f in sorted(glob.glob(os.path.join(SRC, "*.png"))):
    name = os.path.splitext(os.path.basename(f))[0]
    out = os.path.join(DST, name + ".webp")
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f):
        continue
    im = Image.open(f).convert("RGB")
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
    im = im.resize((288, 288), Image.LANCZOS)
    im.save(out, "WEBP", quality=82, method=6)
    n += 1

total = sum(os.path.getsize(os.path.join(DST, f)) for f in os.listdir(DST))
print(f"压缩 {n} 张，目录共 {len(os.listdir(DST))} 个文件，合计 {total/1024:.0f}KB")
