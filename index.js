import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { thumbPrompt } from "./lib-thumb.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = JSON.parse(readFileSync(join(HERE, "data", "styles.json"), "utf8"));
const STYLES = Array.isArray(RAW) ? RAW : RAW.styles || RAW.items || [];

const ALI_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const MODEL = "qwen-image-2.0";

// 每家出图协议不一样：阿里是 multimodal-generation（size 用星号），
// 火山方舟和绝大多数中转站是 OpenAI 的 /images/generations（size 用 x）。
const PROVIDERS = {
  dashscope: {
    label: "阿里百炼 · qwen-image",
    proto: "dashscope",
    base: "https://dashscope.aliyuncs.com",
    model: "qwen-image-2.0",
    hint: "百炼控制台 → API-KEY。qwen-image 同步出图、无水印，免费额度用完会提示欠费。",
    chatBase: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    chatModel: "qwen-plus",
    env: "DASHSCOPE_API_KEY",
  },
  ark: {
    label: "火山方舟 · Seedream",
    proto: "openai",
    base: "https://ark.cn-beijing.volces.com/api/v3",
    model: "doubao-seedream-5-0-flash-260915",
    hint: "方舟控制台 → API Key，并在「开通管理」里开通 Seedream。模型名要写账号里真有的：2026 年在售的是 seedream-5-0-flash / 5-0 / 4-5（3.0 和 4.0 已下架，写了会报 InvalidEndpointOrModel）。",
    chatBase: "https://ark.cn-beijing.volces.com/api/v3",
    chatModel: "doubao-seed-2-1-lite-260915",
    env: "ARK_API_KEY",
  },
  zhipu: {
    label: "智谱 · CogView（免费）",
    hint: "不用充值，但右下角固定有「AI生成」水印，关不掉。要干净底图就后期裁掉右下角（x>80%、y>88% 那块），或者用百炼。",
    proto: "openai",
    base: "https://open.bigmodel.cn/api/paas/v4",
    model: "cogview-3-flash",
    keyEnv: "ZHIPU_API_KEY",
  },
  custom: {
    label: "自定义（OpenAI 兼容）",
    proto: "openai",
    base: "",
    model: "",
    hint: "任何 OpenAI 兼容的 /images/generations：中转站、硅基流动、智谱都能接。填好 base 和模型名。",
    chatBase: "",
    chatModel: "",
    env: "IMAGE_API_KEY",
  },
};
const OUT_DIR = join(homedir(), ".dsh", "forge-studio", "out");
const THUMB_DIR = join(HERE, "data", "thumbs");
const HOME_CFG = join(homedir(), ".dsh", "forge-studio", "config.json");

// 用户看到的不是"S30"，而是"用在哪"。尺寸和留白跟着用途走。
const USES = {
  "gzh-cover": {
    label: "公众号头图",
    hint: "2.35:1",
    ratio: "2.35:1",
    w: 1664,
    h: 708,
    hole: "画面上方约五分之一是干净、低细节、偏暗的背景区域，主体重心落在三分线交叉点。",
  },
  "gzh-inline": {
    label: "内文配图",
    hint: "16:9",
    ratio: "16:9",
    w: 1664,
    h: 936,
    hole: "",
  },
  "xhs-cover": {
    label: "小红书封面",
    hint: "3:4",
    ratio: "3:4",
    w: 1248,
    h: 1664,
    hole: "画面上方约四分之一是干净、低细节、偏暗的背景区域。",
  },
  square: { label: "方图", hint: "1:1", ratio: "1:1", w: 1328, h: 1328, hole: "" },
  story: { label: "竖屏长图", hint: "9:16", ratio: "9:16", w: 936, h: 1664, hole: "" },
};

/* ---------- 颜色：hex 绝对不能进中文提示词，模型会把色值当正文画上去 ---------- */

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s, l: l * 100, s100: s * 100 };
}

function hueName(hex) {
  const c = hexToHsl(hex);
  if (!c) return "";
  const { h, l, s100 } = c;
  if (l < 10) return "近黑";
  if (l > 93) return "近白";
  if (s100 < 9) return l < 45 ? "深灰" : "浅灰";
  const bands = [
    [12, "红"],
    [38, "橙"],
    [62, "黄"],
    [88, "黄绿"],
    [148, "绿"],
    [175, "青绿"],
    [196, "青"],
    [222, "天蓝"],
    [252, "蓝"],
    [285, "紫"],
    [322, "品红"],
    [346, "玫红"],
    [361, "红"],
  ];
  let base = "红";
  for (const [edge, name] of bands) {
    if (h < edge) {
      base = name;
      break;
    }
  }
  if (l < 26) return "深" + base;
  if (l > 76) return "浅" + base;
  if (s100 > 78) return "荧光" + base;
  return base;
}

function colorWords(palette) {
  const words = [];
  for (const hex of (palette || []).slice(0, 4)) {
    const w = hueName(hex);
    if (w && !words.includes(w)) words.push(w);
  }
  return words.join("、");
}

/* ---------- 提示词 ---------- */

function buildPrompt(style, topic, use) {
  const u = USES[use] || USES["gzh-cover"];
  const t = String(topic || "").trim().replace(/[。；;]+$/, "");
  // 构图里凡出现「标题」二字，模型就真的给你画一行字——实测三次，右上角固定冒出三个乱码汉字。
  // 不是只认「放标题」，还有「留给标题」「标题留上方 20%」这些写法，统一削掉，保留「背景压暗」这类有用的部分。
  const cleanComp = (s) =>
    String(s || "")
      .replace(/[，、]?\s*(?:留给|留|放|压|写|给)?标题(?:留上方\s*\d+%|上方\s*\d+%)?/g, "")
      .replace(/[，、]\s*可\s*$/, "")
      .replace(/\s*可\s*$/, "")
      .replace(/[，、\s]+$/, "")
      .trim();
  const isMacro = /微距|特写|局部|近景|细节|close-?up|macro/i.test(t);
  const comp = isMacro
    ? "主体充满画面，浅景深，焦点落在材质细节上"
    : cleanComp(style.comp);
  // 图文版式/编辑设计这类，上方留白要的是「同色干净纸面」，套用「偏暗背景」会出戏
  const holeText = /图文版式|编辑设计/.test(style.c || "")
    ? "画面上方约五分之一是干净的空白区域，与背景同色、不加任何元素。"
    : u.hole || "";
  const colors = colorWords(style.p);
  return [
    `${style.z}风格插画。`,
    `画面主体：${t}。`,
    comp ? `构图：${comp}。` : "",
    holeText,
    colors ? `配色：${colors}。` : "",
    `画面比例 ${u.ratio}。`,
    "画面纯净，只有画面元素本身，没有任何排版元素、符号标记或标识牌。" +
      "物体表面保持纯材质纹理，不刻字、不放标签。",
  ]
    .filter(Boolean)
    .join("");
}

/* ---------- key ---------- */

function loadCfg() {
  let c = {};
  try {
    if (existsSync(HOME_CFG)) c = JSON.parse(readFileSync(HOME_CFG, "utf8")) || {};
  } catch {}
  return {
    provider: c.provider || "dashscope",
    keys: c.keys || {},
    customBase: c.customBase || "",
    customModel: c.customModel || "",
    autoOptimize: c.autoOptimize !== false,
  };
}

function saveCfg(next) {
  const dir = dirname(HOME_CFG);
  mkdirSync(dir, { recursive: true });
  writeFileSync(HOME_CFG, JSON.stringify(next, null, 2), "utf8");
}

// 顺序：界面里存的 → 环境变量 → 老项目 freegen 配置（只对阿里有效）。
function apiKey(pid) {
  const cfg = loadCfg();
  const saved = cfg.keys?.[pid];
  if (saved && String(saved).trim()) return String(saved).trim();
  const prov = PROVIDERS[pid];
  if (prov?.env && process.env[prov.env]) return String(process.env[prov.env]).trim();
  // 老 freegen 那套 key 文件：只在设了 FORGE_KEYFILE 时读，绝不能写死本机路径
  // （包要发到市场，别人机器上没有 D:/AI/workspace-d 这种东西）
  const FREEGEN_FIELD = { dashscope: "ali_key", ark: "ark_key", zhipu: "zhipu_key" };
  const field = FREEGEN_FIELD[pid];
  const kf = process.env.FORGE_KEYFILE;
  if (field && kf) {
    try {
      if (existsSync(kf)) {
        const c = JSON.parse(readFileSync(kf, "utf8"));
        if (c[field]) return String(c[field]).trim();
      }
    } catch {}
  }
  return "";
}

function activeProv(override) {
  const cfg = loadCfg();
  const pid = PROVIDERS[override] ? override : PROVIDERS[cfg.provider] ? cfg.provider : "dashscope";
  const prov = PROVIDERS[pid];
  const base = (pid === "custom" ? cfg.customBase : prov.base || "").replace(/\/+$/, "");
  const model = pid === "custom" ? cfg.customModel : prov.model;
  return { pid, prov, base, model, key: apiKey(pid) };
}

/* ---------- 描述优化：用户只会说"AI芯片"，剩下的交给模型补 ---------- */

const CHAT_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const OPT_SYS =
  "你是画面描述助手。用户给一句话想法，你把它扩写成 60-120 字的画面描述，只写看得见的东西：主体长什么样、在做什么、周围是什么环境、光从哪来、整体什么氛围。" +
  "不提风格名、不提画质、不提参数、不写'一张/一幅'这类量词开头、不加解释和引号。直接输出描述本身。";

async function optimize(text) {
  const { pid, prov, key } = activeProv();
  if (!key) throw Object.assign(new Error("还没有填 key，没法扩写描述"), { status: 400 });
  // 自定义 provider 没配对话接口，扩写就退回阿里（它对中文扩写最好也最便宜）。
  const chatBase = prov.chatBase || PROVIDERS.dashscope.chatBase;
  const chatModel = prov.chatModel || PROVIDERS.dashscope.chatModel;
  const chatKey = pid === "custom" ? apiKey("dashscope") : key;
  if (!chatKey) throw Object.assign(new Error("这个 provider 只配了出图，扩写需要另配百炼 key"), { status: 400 });
  const r = await fetch(chatBase + "/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${chatKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: chatModel,
      messages: [
        { role: "system", content: OPT_SYS },
        { role: "user", content: String(text || "").slice(0, 300) },
      ],
      max_tokens: 400,
      temperature: 0.85,
    }),
  });
  const t = await r.text();
  if (!r.ok) {
    if (/Arrearage|overdue|in good standing/i.test(t)) {
      const e = new Error("阿里百炼的额度用完了（账号提示欠费），扩写也用不了。去百炼控制台充值后再试。");
      e.status = 402;
      throw e;
    }
    throw Object.assign(new Error(`优化失败 ${r.status}：${t.slice(0, 160)}`), { status: 502 });
  }
  let j;
  try {
    j = JSON.parse(t);
  } catch {
    throw Object.assign(new Error("优化接口返回异常"), { status: 502 });
  }
  const out = j?.choices?.[0]?.message?.content;
  if (!out) throw Object.assign(new Error("优化没有返回内容"), { status: 502 });
  return String(out).trim().replace(/^["'“”]|["'“”]$/g, "");
}

/* ---------- http ---------- */

function sendJson(res, code, obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "content-length": body.length,
    "cache-control": "no-store",
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw new Error("请求体太大");
    chunks.push(c);
  }
  const s = Buffer.concat(chunks).toString("utf8");
  return s ? JSON.parse(s) : {};
}

function pickImageUrl(j) {
  const parts = j?.output?.choices?.[0]?.message?.content;
  if (Array.isArray(parts)) {
    for (const p of parts) if (p && p.image) return p.image;
  }
  const results = j?.output?.results;
  if (Array.isArray(results) && results[0]?.url) return results[0].url;
  // 火山方舟 / OpenAI 兼容：data[0].url 或 data[0].b64_json
  const data = j?.data;
  if (Array.isArray(data)) {
    if (data[0]?.url) return data[0].url;
    if (data[0]?.b64_json) return "data:image/png;base64," + data[0].b64_json;
  }
  return "";
}

// 智谱只认这 7 个尺寸，给别的会报错；按宽高比挑最接近的一个
const ZHIPU_SIZES = ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440"];
function nearestZhipuSize(w, h) {
  const want = w / h;
  let best = ZHIPU_SIZES[0];
  let bestDiff = Infinity;
  for (const sd of ZHIPU_SIZES) {
    const [sw, sh] = sd.split("x").map(Number);
    const diff = Math.abs(Math.log(sw / sh / want));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = sd;
    }
  }
  return best;
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function slug(s) {
  return String(s || "image")
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28) || "image";
}

async function render(body) {
  const raw = String(body.topic || "").trim();
  if (!raw) {
    const e = new Error("先写一句你想要什么画面");
    e.status = 400;
    throw e;
  }
  if (raw.length > 300) {
    const e = new Error("描述太长了，压缩到 300 字以内");
    e.status = 400;
    throw e;
  }
  // 用户那句"AI芯片"太干，出图会很空。18 字以内先让 qwen-plus 补成画面描述；
  // 关掉自动优化、或者优化失败时，原句照用，不能因为优化挂了就不出图。
  let topic = raw;
  let optimized = false;
  if (body.autoOptimize !== false && raw.length < 18) {
    try {
      topic = await optimize(raw);
      optimized = true;
    } catch {}
  }
  const style = STYLES.find((s) => s.id === body.styleId) || STYLES[0];
  const use = USES[body.use] ? body.use : "gzh-cover";
  const u = USES[use];
  // body.prompt 是「补齐风格预览图」用的完整提示词，不走拼装、也不做自动优化
  const prompt = body.prompt ? String(body.prompt) : buildPrompt(style, topic, use);

  const { pid, prov, base, model, key } = activeProv(body.provider);
  if (!key) {
    const e = new Error(`「${prov.label}」还没填 API Key，点右上角齿轮填一下。`);
    e.status = 400;
    throw e;
  }
  if (!base || !model) {
    const e = new Error("自定义 provider 的 base 或模型名是空的，去设置里补齐。");
    e.status = 400;
    throw e;
  }

  let url, payload;
  if (prov.proto === "dashscope") {
    url = base + "/api/v1/services/aigc/multimodal-generation/generation";
    payload = {
      model,
      input: { messages: [{ role: "user", content: [{ text: prompt }] }] },
      parameters: { size: `${u.w}*${u.h}`, prompt_extend: false, watermark: false },
    };
  } else {
    // 火山方舟与各类中转站都是这条：size 用 x 分隔，response_format 要 url
    url = base + "/images/generations";
    payload = {
      model,
      prompt,
      size: pid === "zhipu" ? nearestZhipuSize(u.w, u.h) : `${u.w}x${u.h}`,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    // 额度用完时阿里只回一个 Arrearage，直接把错误码丢给用户等于没说。
    if (/Arrearage|overdue|in good standing/i.test(text)) {
      const e = new Error("阿里百炼的额度用完了（账号提示欠费）。去百炼控制台充值或领一下免费额度，回来点「再出一张」就行。");
      e.status = 402;
      throw e;
    }
    if (/Throttling|RateQuota|rate limit/i.test(text)) {
      const e = new Error("出图太快被限流了，等十来秒再点一次。");
      e.status = 429;
      throw e;
    }
    if (/InvalidEndpointOrModel|does not exist or you have no access/i.test(text)) {
      const e = new Error(`「${model}」这个模型在你账号里用不了。火山方舟要先去控制台「开通管理」把 Seedream 开通，或把模型名换成已开通的版本。`);
      e.status = 400;
      throw e;
    }
    if (/invalid.*api.?key|AuthenticationError|401/i.test(text)) {
      const e = new Error("API Key 不对或已失效，点右上角齿轮重填。");
      e.status = 401;
      throw e;
    }
    const e = new Error(`出图接口返回 ${res.status}：${text.slice(0, 240)}`);
    e.status = 502;
    throw e;
  }
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    const e = new Error(`接口返回的不是 JSON：${text.slice(0, 240)}`);
    e.status = 502;
    throw e;
  }
  const imgUrl = pickImageUrl(j);
  if (!imgUrl) {
    const e = new Error(`接口没给图：${JSON.stringify(j).slice(0, 240)}`);
    e.status = 502;
    throw e;
  }

  let buf;
  if (imgUrl.startsWith("data:")) {
    buf = Buffer.from(imgUrl.slice(imgUrl.indexOf(",") + 1), "base64");
  } else {
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      const e = new Error(`下载图片失败 ${imgRes.status}`);
      e.status = 502;
      throw e;
    }
    buf = Buffer.from(await imgRes.arrayBuffer());
  }
  mkdirSync(OUT_DIR, { recursive: true });
  // 智谱返回的是 jpeg，硬存 .png 会让看图工具报格式不符
  const ext = buf[0] === 0xff && buf[1] === 0xd8 ? "jpg" : "png";
  const name = `${stamp()}-${style.id}-${slug(topic)}.${ext}`;
  writeFileSync(join(OUT_DIR, name), buf);

  return {
    ok: true,
    name,
    url: `/api/forge-studio/file?name=${encodeURIComponent(name)}`,
    path: join(OUT_DIR, name),
    prompt,
    topic,
    optimized,
    original: optimized ? raw : undefined,
    style: style.z,
    use: u.label,
    size: `${u.w}x${u.h}`,
  };
}


// 补风格预览图用：和出图同一套拼装，只是主体固定成那只猫（见 lib-thumb.mjs）
function serveThumb(req, res) {
  let id = "";
  try {
    id = new URL(req.url, "http://127.0.0.1").searchParams.get("id") || "";
  } catch {}
  const safe = id.replace(/[^A-Za-z0-9_-]/g, "");
  // 老的 41 张是压好的 webp；新补的是直接落盘的 png，两个都认
  let file = "";
  if (safe) {
    for (const ext of ["webp", "png"]) {
      const f = join(THUMB_DIR, `${safe}.${ext}`);
      if (existsSync(f)) { file = f; break; }
    }
  }
  if (!file) {
    res.writeHead(404);
    res.end("no thumb");
    return;
  }
  try {
    const buf = readFileSync(file);
    res.writeHead(200, {
      "content-type": file.endsWith(".webp") ? "image/webp" : "image/png",
      "cache-control": "public, max-age=604800",
      "content-length": buf.length,
    });
    res.end(buf);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err));
  }
}

function serveFile(req, res) {
  let name = "";
  try {
    name = new URL(req.url, "http://127.0.0.1").searchParams.get("name") || "";
  } catch {}
  const safe = name.replace(/[\\/]/g, "").replace(/\.\./g, "");
  if (!safe) {
    res.writeHead(400);
    res.end("bad name");
    return;
  }
  try {
    const buf = readFileSync(join(OUT_DIR, safe));
    res.writeHead(200, {
      // 智谱返回 jpeg，content-type 不能写死 png
      "content-type": /\.jpe?g$/i.test(safe) ? "image/jpeg" : "image/png",
      "content-length": buf.length,
      "cache-control": "no-store",
    });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}

const PUBLIC_STYLES = STYLES.map((s) => ({
  id: s.id,
  name: s.z,
  cat: s.c,
  colors: (s.p || []).slice(0, 4),
  use: s.u || "",
}));

export const inject = ["webServer"];

// 本地自测入口：node -e "import('...index.js').then(m=>m.__test.render({...}))"
export const __test = { render, buildPrompt, apiKey, OUT_DIR, USES, STYLES };

export function apply(ctx) {
  const offs = [];
  const add = (route) => {
    offs.push(ctx.webServer.register(route));
  };

  add({
    kind: "exact",
    path: "/api/forge-studio/thumbs/fill",
    handler: async (req, res) => {
      const { prov, key } = activeProv();
      if (!key) {
        return sendJson(res, 400, { ok: false, error: "「" + prov.label + "」还没填 API Key" });
      }
      const missing = STYLES.filter(
        (st) =>
          !existsSync(join(THUMB_DIR, st.id + ".webp")) && !existsSync(join(THUMB_DIR, st.id + ".png"))
      );
      if (!missing.length) {
        return sendJson(res, 200, { ok: true, made: 0, total: 0, fail: [] });
      }
      let made = 0;
      const fail = [];
      for (const st of missing) {
        try {
          const r = await render({
            topic: "风格预览图",
            styleId: st.id,
            use: "square",
            prompt: thumbPrompt(st, colorWords),
            autoOptimize: false,
          });
          renameSync(r.path, join(THUMB_DIR, st.id + ".png"));
          made += 1;
        } catch (e) {
          fail.push(st.z + "：" + String(e.message || e).slice(0, 60));
        }
      }
      sendJson(res, 200, { ok: true, made, total: missing.length, fail: fail.slice(0, 6) });
    },
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/config",
    handler: (req, res) => {
      const cfg = loadCfg();
      sendJson(res, 200, {
        // 新增的 20 条风格还没出缩略图（百炼欠费），前端据此回退到色带
        styles: PUBLIC_STYLES.map((st) => ({
          ...st,
          thumb: existsSync(join(THUMB_DIR, st.id + ".webp")),
        })),
        uses: Object.entries(USES).map(([id, u]) => ({ id, label: u.label, hint: u.hint })),
        hasKey: Boolean(activeProv().key),
        outDir: OUT_DIR,
        provider: cfg.provider,
        providers: Object.entries(PROVIDERS).map(([id, p]) => ({
          id,
          label: p.label,
          hint: p.hint,
          base: id === "custom" ? cfg.customBase : p.base,
          model: id === "custom" ? cfg.customModel : p.model,
          hasKey: Boolean(apiKey(id)),
        })),
      });
    },
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/render",
    handler: async (req, res) => {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "只接受 POST" });
      try {
        const body = await readBody(req);
        const out = await render(body);
        return sendJson(res, 200, out);
      } catch (err) {
        return sendJson(res, err.status || 500, {
          ok: false,
          error: err.message || String(err),
        });
      }
    },
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/file",
    handler: serveFile,
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/thumb",
    handler: serveThumb,
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/settings",
    handler: async (req, res) => {
      if (req.method !== "POST") {
        const cfg = loadCfg();
        return sendJson(res, 200, {
          provider: cfg.provider,
          customBase: cfg.customBase,
          customModel: cfg.customModel,
          keys: Object.fromEntries(
            Object.keys(PROVIDERS).map((id) => [id, apiKey(id) ? "已设置" : ""])
          ),
        });
      }
      try {
        const body = await readBody(req);
        const cfg = loadCfg();
        const next = {
          ...cfg,
          provider: PROVIDERS[body.provider] ? body.provider : cfg.provider,
          keys: { ...cfg.keys },
          customBase: String(body.customBase ?? cfg.customBase ?? "").trim(),
          customModel: String(body.customModel ?? cfg.customModel ?? "").trim(),
        };
        // 只覆盖传了非空值的 key，切换 provider 时不会把别家 key 清掉
        for (const [id, v] of Object.entries(body.keys || {})) {
          if (typeof v === "string" && v.trim()) next.keys[id] = v.trim();
        }
        saveCfg(next);
        return sendJson(res, 200, { ok: true, provider: next.provider });
      } catch (err) {
        return sendJson(res, 500, { ok: false, error: String(err.message || err) });
      }
    },
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/test",
    handler: async (req, res) => {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "只接受 POST" });
      try {
        const body = await readBody(req);
        const pid = PROVIDERS[body.provider] ? body.provider : loadCfg().provider;
        const cfg = loadCfg();
        const prov = PROVIDERS[pid];
        const key = (body.key && String(body.key).trim()) || apiKey(pid);
        const base = ((pid === "custom" ? body.base || cfg.customBase : prov.base) || "").replace(/\/+$/, "");
        const model = pid === "custom" ? body.model || cfg.customModel : prov.model;
        if (!key) return sendJson(res, 400, { ok: false, error: "还没填 key" });
        if (!base || !model) return sendJson(res, 400, { ok: false, error: "base 或模型名是空的" });

        const t0 = Date.now();
        let url, payload;
        if (prov.proto === "dashscope") {
          url = base + "/api/v1/services/aigc/multimodal-generation/generation";
          payload = {
            model,
            input: { messages: [{ role: "user", content: [{ text: "一只橘猫，正方形，单色背景" }] }] },
            parameters: { size: "512*512", prompt_extend: false, watermark: false },
          };
        } else {
          url = base + "/images/generations";
          payload = { model, prompt: "一只橘猫，正方形，单色背景", size: "1024x1024", response_format: "url", watermark: false };
        }
        const r = await fetch(url, {
          method: "POST",
          headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await r.text();
        if (!r.ok) {
          return sendJson(res, 200, {
            ok: false,
            ms: Date.now() - t0,
            error: text.slice(0, 300),
          });
        }
        let j = {};
        try { j = JSON.parse(text); } catch {}
        const img = pickImageUrl(j);
        return sendJson(res, 200, { ok: Boolean(img), ms: Date.now() - t0, hasImage: Boolean(img), model });
      } catch (err) {
        return sendJson(res, 200, { ok: false, error: String(err.message || err) });
      }
    },
  });

  add({
    kind: "exact",
    path: "/api/forge-studio/optimize",
    handler: async (req, res) => {
      if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "只接受 POST" });
      try {
        const body = await readBody(req);
        const text = String(body.text || "").trim();
        if (!text) return sendJson(res, 400, { ok: false, error: "先写点什么" });
        const out = await optimize(text);
        return sendJson(res, 200, { ok: true, text: out });
      } catch (err) {
        return sendJson(res, err.status || 500, { ok: false, error: err.message || String(err) });
      }
    },
  });

  const dispose = () => {
    for (const off of offs) {
      try {
        off();
      } catch {}
    }
  };
  if (typeof ctx.effect === "function") ctx.effect(() => dispose);
  else if (typeof ctx.on === "function") ctx.on("dispose", dispose);
}
