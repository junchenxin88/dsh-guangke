// 改名：生图工作台 → 光刻 LITHO
// 光刻是造芯片的工艺，这儿是"用一句话刻出一张图"，工业感 + 精密感，
// 比"生图工作台"这种后台管理系统名有味道。
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "D:/AI/workspace-d/forge-studio";
const log = [];

function patch(file, pairs) {
  const p = `${ROOT}/${file}`;
  let s = readFileSync(p, "utf8");
  for (const [name, a, b] of pairs) {
    if (!s.includes(a)) {
      log.push(`❌ ${file} · ${name}`);
      continue;
    }
    s = s.replace(a, b);
    log.push(`✅ ${file} · ${name}`);
  }
  writeFileSync(p, s);
}

patch("locale/zh.json", [
  ["meta.title", '"title": "生图工作台"', '"title": "光刻 LITHO"'],
  [
    "meta.description",
    '"description": "说一句话、选个感觉，直接出公众号封面和内文配图。不用写提示词。"',
    '"description": "把一句话刻成一张图。81 种风格，出的是能直接压字的干净底图——封面、内文配图、小红书首图。"',
  ],
  ["nav", '"nav": "生图"', '"nav": "光刻"'],
  ["panel.title", '"title": "生图工作台"', '"title": "光刻"'],
  [
    "panel.subtitle",
    '"subtitle": "描述你想要的画面，选一张看着顺眼的卡片，剩下的交给我。"',
    '"subtitle": "把一句话刻成一张图。选一张看着顺眼的卡片，剩下的交给我。"',
  ],
]);

patch("locale/en.json", [
  ["meta.title", '"title": "Image Studio"', '"title": "LITHO"'],
  [
    "meta.description",
    '"description": "Describe a picture, pick a look, get a ready-to-use cover or inline illustration. No prompt writing needed."',
    '"description": "Etch a sentence into an image. 81 styles, clean底图 built for overlaying type — covers, inline art, social headers."',
  ],
  ["nav", '"nav": "Images"', '"nav": "LITHO"'],
  ["panel.title", '"title": "Image Studio"', '"title": "LITHO"'],
  [
    "panel.subtitle",
    '"subtitle": "Describe the scene, pick the look that feels right, and that\'s it."',
    '"subtitle": "Etch a sentence into an image. Pick the look that feels right."',
  ],
]);

patch("client.js", [
  [
    "h1",
    'h("h1", { className: "fs-title" }, "生图工作台")',
    'h("h1", { className: "fs-title" }, "光刻", h("span", { className: "fs-title-en" }, "LITHO"))',
  ],
  ["侧栏 label", 'label: () => "生图"', 'label: () => "光刻"'],
  [
    "标题英文小字样式",
    "/* ===== /SKIN:INDUSTRIAL ===== */",
    `.fs-title { display: flex; align-items: baseline; gap: 13px; }
.fs-title-en {
  font-size: .34em;
  font-weight: 600;
  letter-spacing: .26em;
  color: #5B7391;
  -webkit-text-fill-color: #5B7391;
  background: none;
  filter: none;
  transform: translateY(-.08em);
}
/* ===== /SKIN:INDUSTRIAL ===== */`,
  ],
]);

console.log(log.join("\n"));
