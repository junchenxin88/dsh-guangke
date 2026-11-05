// 给 41 条风格各出一张缩略图，用同一个主体，方便直接看"这个风格长什么样"。
// 输出 512 方图到 data/thumbs-raw/，之后由 make-thumbs.py 压成小 webp。
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const RAW = JSON.parse(readFileSync(join(ROOT, "data", "styles.json"), "utf8"));
const STYLES = Array.isArray(RAW) ? RAW : RAW.styles || [];
const OUT = join(ROOT, "data", "thumbs-raw");
mkdirSync(OUT, { recursive: true });

const CFG = JSON.parse(readFileSync("D:/AI/workspace-d/freegen/freegen.config.json", "utf8"));
const KEY = CFG.ali_key;
const API = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

// 同一个主体，才能比出风格差异。猫有形体、有场景、有光，41 种风格都画得出来。
const SUBJECT = "一只猫坐在窗台上，窗外是夜晚的城市灯光";

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255,
    g = ((n >> 8) & 255) / 255,
    b = (n & 255) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = ((max + min) / 2) * 100;
  const d = max - min;
  let h = 0,
    s = 0;
  if (d) {
    s = (l > 50 ? d / (2 - max - min) : d / (max + min)) * 100;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, l };
}

function hueName(hex) {
  const c = hexToHsl(hex);
  if (!c) return "";
  const { h, l, s } = c;
  if (l < 10) return "近黑";
  if (l > 93) return "近白";
  if (s < 9) return l < 45 ? "深灰" : "浅灰";
  const bands = [
    [12, "红"], [38, "橙"], [62, "黄"], [88, "黄绿"], [148, "绿"], [175, "青绿"],
    [196, "青"], [222, "天蓝"], [252, "蓝"], [285, "紫"], [322, "品红"], [346, "玫红"], [361, "红"],
  ];
  let base = "红";
  for (const [e, n] of bands) if (h < e) { base = n; break; }
  if (l < 26) return "深" + base;
  if (l > 76) return "浅" + base;
  if (s > 78) return "荧光" + base;
  return base;
}

function colors(p) {
  const out = [];
  for (const hex of (p || []).slice(0, 3)) {
    const w = hueName(hex);
    if (w && !out.includes(w)) out.push(w);
  }
  return out.join("、");
}

function prompt(st) {
  const comp = String(st.comp || "").replace(/(放|压|写)标题/g, "留白").replace(/留白[^。]*/g, "");
  return [
    `${st.z}风格插画。`,
    `画面主体：${SUBJECT}。`,
    comp ? `构图：${comp}。` : "",
    `配色：${colors(st.p)}。`,
    "方形构图。这是纯插画，画面里不要出现任何文字、字母、数字、水印和 logo。",
  ].filter(Boolean).join("");
}

async function draw(st) {
  const dst = join(OUT, `${st.id}.png`);
  if (existsSync(dst)) return -1;
  const r = await fetch(API, {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "qwen-image-2.0",
      input: { messages: [{ role: "user", content: [{ text: prompt(st) }] }] },
      parameters: { size: "512*512", prompt_extend: false, watermark: false },
    }),
  });
  if (!r.ok) { const t = await r.text(); const e = new Error(`HTTP ${r.status}: ${t.slice(0, 120)}`); e.status = r.status; throw e; }
  const j = await r.json();
  const url = j?.output?.choices?.[0]?.message?.content?.find((c) => c.image)?.image;
  if (!url) throw new Error("接口没给图");
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(join(OUT, `${st.id}.png`), buf);
  return buf.length;
}

let done = 0, fail = 0;
const queue = [...STYLES];

async function worker() {
  for (;;) {
    const st = queue.shift();
    if (!st) return;
    try {
      const n = await draw(st);
      done++;
      process.stdout.write(`[${done + fail}/${STYLES.length}] ${st.id} ${st.z} ✅ ${Math.round(n / 1024)}KB\n`);
    } catch (e) {
      if (e.status === 429) { queue.unshift(st); await new Promise(r=>setTimeout(r, 4000)); continue; }
      fail++;
      process.stdout.write(`[${done + fail}/${STYLES.length}] ${st.id} ${st.z} ❌ ${e.message}\n`);
    }
  }
}

await worker();
console.log(`\n完成 ${done} / 失败 ${fail}`);
