// 补齐缺的缩略图。走智谱 cogview-3-flash（免费），不烧火山的额度。
// 产出 data/thumbs-src/{id}.jpg，再由 compress-thumbs2.py 裁水印压成 288 webp。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = "D:/AI/workspace-d/forge-studio";
const cfg = JSON.parse(readFileSync("D:/AI/workspace-d/freegen/freegen.config.json", "utf8"));
const KEY = cfg.zhipu_key;
const SRC = `${ROOT}/data/thumbs-src`;
const OUT = `${ROOT}/data/thumbs`;
mkdirSync(SRC, { recursive: true });

const SUBJECT = "一只猫坐在窗台上，窗外是夜晚的城市灯光";

/* 颜色 → 中文词（和 index.js 里同一套思路，独立一份免得互相依赖） */
function hueName(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d < 0.06) return l > 0.86 ? "近白" : l < 0.14 ? "近黑" : l > 0.5 ? "浅灰" : "深灰";
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const name =
    h < 14 || h >= 345 ? "红" : h < 40 ? "橙" : h < 66 ? "黄" : h < 90 ? "黄绿" :
    h < 155 ? "绿" : h < 190 ? "青" : h < 215 ? "天蓝" : h < 250 ? "蓝" :
    h < 285 ? "紫" : h < 320 ? "品红" : "玫红";
  const pre = l > 0.78 ? "浅" : l < 0.24 ? "深" : d > 0.6 ? "鲜" : "柔";
  return pre + name;
}
const colors = (p) => (p || []).slice(0, 4).map(hueName).join("、");

const cleanComp = (s) =>
  (s || "")
    .replace(/[，、]?\s*(?:留给|留|放|压|写|给)?标题(?:留上方\s*\d+%|上方\s*\d+%)?/g, "")
    .replace(/可$/, "")
    .replace(/[，、。]$/, "");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RAW = JSON.parse(readFileSync(`${ROOT}/data/styles.json`, "utf8"));
const STYLES = Array.isArray(RAW) ? RAW : RAW.styles;
const todo = STYLES.filter((s) => !existsSync(`${OUT}/${s.id}.webp`));
console.log(`共 ${STYLES.length} 条，待补 ${todo.length} 条`);

let ok = 0, fail = 0;
for (const st of todo) {
  const isLayout = /图文版式|编辑设计/.test(st.c || "");
  const hole = isLayout
    ? "画面上方约五分之一是干净的空白区域，与背景同色、不加任何元素。"
    : "画面上方约五分之一是干净、低细节、偏暗的背景区域。";
  const prompt =
    `${st.z}风格插画。画面主体：${SUBJECT}。` +
    (cleanComp(st.comp) ? `构图：${cleanComp(st.comp)}。` : "") +
    hole +
    (colors(st.p) ? `配色：${colors(st.p)}。` : "") +
    "方形构图。画面纯净，只有画面元素本身，没有任何文字、字母、数字、水印和 logo。";

  for (let attempt = 0; attempt < 3; attempt++) {
    const t0 = Date.now();
    try {
      const r = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
        method: "POST",
        headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ model: "cogview-3-flash", prompt, size: "1024x1024" }),
      });
      if (r.status === 429) {
        console.log(`  ${st.id} 限流，等 6s`);
        await sleep(6000);
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 120)}`);
      const j = await r.json();
      const url = j?.data?.[0]?.url;
      if (!url) throw new Error("没返回图");
      const img = await fetch(url);
      const buf = Buffer.from(await img.arrayBuffer());
      writeFileSync(`${SRC}/${st.id}.jpg`, buf);
      ok++;
      console.log(`[${ok}/${todo.length}] ${st.id} ${st.z} ✅ ${Math.round(buf.length / 1024)}KB ${Date.now() - t0}ms`);
      break;
    } catch (e) {
      if (attempt === 2) {
        fail++;
        console.log(`[${st.id}] ${st.z} ❌ ${e.message}`);
      } else {
        await sleep(3000);
      }
    }
  }
  await sleep(600);
}

console.log(`\n完成 ${ok} / 失败 ${fail}`);
