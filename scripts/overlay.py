#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""底图 → 成稿：裁到目标比例、局部压暗、叠发光标题 + 英文副标。

这是 visual-prompt-forge 的"下半场"：AI 只管出底图，标题用它叠。
图内写字交给模型必翻车（中文尤其），底图 + 程序化排版才是稳定路线。

用法：
    python cover.py <底图> <输出.png> --title "算力战争" --sub "AI COMPUTE WAR"
    python cover.py bg.png out.png --title "算力战争" --size 1664x708 --darken 0.55
    python cover.py bg.png out.png --title "算力战争" --anchor center --accent FF2E88

只用 Pillow。字体优先微软雅黑粗体，其次思源黑体 / 黑体 / 苹方 / Noto CJK。
"""
import os
import sys
import argparse

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    sys.exit("缺 Pillow：pip install pillow")

FONT_CANDIDATES_BOLD = [
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\NotoSansSC-VF.ttf",
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\Dengb.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]
FONT_CANDIDATES_REG = [
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\NotoSansSC-VF.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
]


def pick_font(cands, size):
    for p in cands:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def parse_hex(s, default):
    s = (s or "").lstrip("#")
    if len(s) != 6:
        return default
    try:
        return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return default


def fit(img, W, H, bias=0.35):
    """按 cover 方式裁到目标比例。bias 控制纵向裁切重心：0=顶部对齐，1=底部对齐。"""
    sw, sh = img.size
    target = W / H
    if sw / sh > target:
        nw = int(sh * target)
        left = (sw - nw) // 2
        img = img.crop((left, 0, left + nw, sh))
    else:
        nh = int(sw / target)
        top = int((sh - nh) * bias)
        img = img.crop((0, top, sw, top + nh))
    return img.resize((W, H), Image.LANCZOS)


def draw_tracked(draw, xy, text, font, fill, tracking=0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def text_width(draw, text, font, tracking=0):
    return sum(draw.textlength(c, font=font) for c in text) + tracking * max(0, len(text) - 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--title", default="")
    ap.add_argument("--sub", default="")
    ap.add_argument("--size", default="auto", help="目标尺寸 WxH，默认 auto 跟随原图")
    ap.add_argument("--darken", type=float, default=0.55, help="标题侧压暗强度 0~1")
    ap.add_argument("--anchor", default="left", choices=["left", "center"], help="标题位置")
    ap.add_argument("--accent", default="FFD16E", help="强调色 hex，用在细线和副标")
    ap.add_argument("--ratio", type=float, default=None, help="标题字号占画面高度的比例，默认按尺寸自动")
    a = ap.parse_args()

    if a.size == "auto":
        W, H = Image.open(a.src).size
    else:
        W, H = [int(x) for x in a.size.lower().replace("*", "x").split("x")]
    accent = parse_hex(a.accent, (255, 209, 110))

    img = fit(Image.open(a.src).convert("RGBA"), W, H)

    # 标题侧压暗：不做全图压暗，保住主体的光，只把放字那侧压下去
    if a.darken > 0 and a.title:
        shade = Image.new("L", (W, H), 0)
        sd = ImageDraw.Draw(shade)
        span = int(W * (0.62 if a.anchor == "left" else 1.0))
        cy = H * 0.52
        for x in range(span):
            if a.anchor == "left":
                v = int(255 * a.darken * (1 - x / span) ** 1.6)
                sd.line([(x, 0), (x, H)], fill=v)
            else:
                for y in range(H):
                    d = abs(y - cy) / (H * 0.55)
                    if d < 1:
                        shade.putpixel((x, y), int(255 * a.darken * (1 - d) ** 1.8))
        if a.anchor == "left":
            layer = Image.new("RGBA", (W, H), (4, 6, 16, 255))
            layer.putalpha(shade)
            img.alpha_composite(layer)

    if a.title:
        ratio = a.ratio or (0.185 if W / H > 2 else 0.16)
        title_size = max(28, int(H * ratio))
        title_font = pick_font(FONT_CANDIDATES_BOLD, title_size)
        sub_size = max(13, int(title_size * 0.19))
        sub_font = pick_font(FONT_CANDIDATES_REG, sub_size)

        probe = ImageDraw.Draw(img)
        tw = text_width(probe, a.title, title_font, tracking=-title_size * 0.045)
        x0 = int((W - tw) / 2) if a.anchor == "center" else int(W * 0.06)
        y0 = int(H * 0.235)

        # 发光层 + 实心层
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        draw_tracked(gd, (x0, y0), a.title, title_font, (255, 255, 255, 140), -title_size * 0.045)
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(max(6, title_size // 6))))

        d = ImageDraw.Draw(img)
        draw_tracked(d, (x0, y0), a.title, title_font, (255, 255, 255, 255), -title_size * 0.045)

        line_y = y0 + int(title_size * 1.26)
        line_w = max(60, min(int(tw * 0.52), int(W * 0.18)))
        d.rectangle([x0 + 2, line_y, x0 + 2 + line_w, line_y + max(2, H // 300)], fill=accent + (255,))
        if a.sub:
            # 副标排在细线下方、与标题左对齐：放细线右侧会顶到主体亮部，小字在亮区直接糊掉
            draw_tracked(d, (x0 + 4, line_y + int(sub_size * 0.95)), a.sub,
                         sub_font, accent + (235,), sub_size * 0.34)

    img.convert("RGB").save(a.out, quality=95)
    print("saved", a.out, img.size)


if __name__ == "__main__":
    main()
