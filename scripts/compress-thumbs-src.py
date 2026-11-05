# 智谱出的图右下角有「AI生成」水印（关不掉）。缩略图只有 288px，
# 把底部 12% 整条裁掉就没了——水印固定在 y >= 88.5% 的位置。
import glob
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "thumbs-src")
DST = os.path.join(ROOT, "data", "thumbs")
os.makedirs(DST, exist_ok=True)

n = 0
for f in sorted(glob.glob(os.path.join(SRC, "*.jpg"))):
    sid = os.path.splitext(os.path.basename(f))[0]
    out = os.path.join(DST, sid + ".webp")
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f):
        continue
    im = Image.open(f).convert("RGB")
    w, h = im.size
    im = im.crop((0, 0, w, int(h * 0.88)))  # 切掉底部 12%，水印在这条里
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
    im = im.resize((288, 288), Image.LANCZOS)
    im.save(out, "WEBP", quality=80, method=6)
    n += 1

total = sum(os.path.getsize(os.path.join(DST, x)) for x in os.listdir(DST))
print(f"新增 {n} 张，目录共 {len(os.listdir(DST))} 个，合计 {total/1024:.0f}KB")
