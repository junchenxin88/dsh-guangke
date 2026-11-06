# 生成 README 用的两张图：风格总览网格 + 顶部 banner。
# 全部用本地已有的 87 张 288x288 webp 缩略图，不调任何接口。
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = r"D:/AI/workspace-d/forge-studio"
THUMB = os.path.join(ROOT, "data", "thumbs")
OUT = os.path.join(ROOT, "docs")
os.makedirs(OUT, exist_ok=True)

BOLD = r"C:/Windows/Fonts/msyhbd.ttc"
REG = r"C:/Windows/Fonts/msyh.ttc"

ids = sorted(
    [f[:-5] for f in os.listdir(THUMB) if f.endswith(".webp")],
    key=lambda x: int(x[1:]) if x[1:].isdigit() else 999,
)

# ---------- 1. 风格总览 ----------
COLS, CELL, GAP, PAD = 12, 150, 8, 22
rows = (len(ids) + COLS - 1) // COLS
W = PAD * 2 + COLS * CELL + (COLS - 1) * GAP
H = PAD * 2 + rows * CELL + (rows - 1) * GAP
sheet = Image.new("RGB", (W, H), (6, 9, 14))
for i, sid in enumerate(ids):
    im = Image.open(os.path.join(THUMB, sid + ".webp")).convert("RGB")
    im = im.resize((CELL, CELL), Image.LANCZOS)
    x = PAD + (i % COLS) * (CELL + GAP)
    y = PAD + (i // COLS) * (CELL + GAP)
    sheet.paste(im, (x, y))
sheet.save(os.path.join(OUT, "styles-grid.png"), optimize=True)
print(f"styles-grid.png  {W}x{H}  {len(ids)} 张")

# ---------- 2. Banner ----------
BW, BH = 1600, 460
banner = Image.new("RGB", (BW, BH), (5, 8, 13))
d = ImageDraw.Draw(banner)

# 冷光网格
for x in range(0, BW, 40):
    d.line([(x, 0), (x, BH)], fill=(11, 26, 34))
for y in range(0, BH, 40):
    d.line([(0, y), (BW, y)], fill=(11, 26, 34))

# 右侧：斜着排一部风格墙，压暗当背景
wall = sheet.resize((int(sheet.width * 0.62), int(sheet.height * 0.62)), Image.LANCZOS)
wall = wall.rotate(-8, expand=True, resample=Image.BICUBIC)
dark = Image.new("RGB", wall.size, (4, 7, 11))
wall = Image.blend(wall, dark, 0.62)
banner.paste(wall, (BW - wall.width + 180, (BH - wall.height) // 2))

# 左侧横向压暗，让文字浮出来（负底数开小数次方会变复数，先 clamp）
grad = Image.new("L", (BW, 1))
for x in range(BW):
    t = max(0.0, 1.0 - x / (BW * 0.72))
    grad.putpixel((x, 0), max(0, min(255, int(255 * (t ** 1.35)))))
grad = grad.resize((BW, BH))
banner = Image.composite(Image.new("RGB", (BW, BH), (4, 7, 11)), banner, grad.point(lambda v: int(v * 0.88)))
d = ImageDraw.Draw(banner)

# 青色装饰线
d.rectangle([72, 96, 76, 96 + 96], fill=(34, 211, 238))

f_title = ImageFont.truetype(BOLD, 96)
f_sub = ImageFont.truetype(REG, 27)
f_tag = ImageFont.truetype(BOLD, 20)

d.text((104, 78), "光刻", font=f_title, fill=(240, 248, 255))
d.text((330, 132), "LITHO", font=ImageFont.truetype(BOLD, 44), fill=(90, 200, 220))
d.text((106, 208), "把一句话刻成一张图", font=f_sub, fill=(226, 238, 250))
d.text((106, 252), "87 种插画 / 二次元 / 图文版式 / 信息图风格 · 出的是能直接压字的干净底图",
       font=ImageFont.truetype(REG, 22), fill=(126, 147, 172))

# 底部标签
tags = ["公众号封面", "小红书首图", "内文配图", "四家接口"]
tx = 106
for t in tags:
    tw = d.textlength(t, font=f_tag)
    d.rounded_rectangle([tx, 322, tx + tw + 34, 322 + 44], radius=22, outline=(40, 92, 110), width=1)
    d.text((tx + 17, 332), t, font=f_tag, fill=(110, 190, 210))
    tx += tw + 34 + 14

banner.save(os.path.join(OUT, "banner.png"), optimize=True)
print(f"banner.png  {BW}x{BH}")
