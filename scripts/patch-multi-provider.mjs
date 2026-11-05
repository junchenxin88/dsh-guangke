// 把单 provider（阿里百炼）改成多 provider：阿里百炼 / 火山方舟 / 自定义 OpenAI 兼容。
// 顺带加设置读写与「测一下」路由，前端就能自己填 key。
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/index.js";
let s = readFileSync(P, "utf8");
const log = [];
function sub(name, from, to) {
  if (!s.includes(from)) {
    log.push("❌ " + name);
    return;
  }
  s = s.replace(from, to);
  log.push("✅ " + name);
}

/* ---------- 1. provider 表 ---------- */
sub(
  "provider 表",
  `const MODEL = "qwen-image-2.0";`,
  `const MODEL = "qwen-image-2.0";

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
    model: "doubao-seedream-4-0-250828",
    hint: "方舟控制台 → API Key。要先去「开通管理」开通 Seedream 模型，没开通会报 InvalidEndpointOrModel。",
    chatBase: "https://ark.cn-beijing.volces.com/api/v3",
    chatModel: "doubao-seed-1-6-250615",
    env: "ARK_API_KEY",
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
};`
);

/* ---------- 2. 配置读写 + 多 key ---------- */
sub(
  "apiKey 多 provider",
  `function apiKey() {
  if (process.env.DASHSCOPE_API_KEY) return process.env.DASHSCOPE_API_KEY.trim();
  try {
    if (existsSync(HOME_CFG)) {
      const c = JSON.parse(readFileSync(HOME_CFG, "utf8"));
      if (c.apiKey) return String(c.apiKey).trim();
      if (c.ali_key) return String(c.ali_key).trim();
    }
  } catch {}
  try {
    const p = "D:/AI/workspace-d/freegen/freegen.config.json";
    if (existsSync(p)) {
      const c = JSON.parse(readFileSync(p, "utf8"));
      if (c.ali_key) return String(c.ali_key).trim();
    }
  } catch {}
  return "";
}`,
  `function loadCfg() {
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
  if (pid === "dashscope") {
    if (process.env.DASHSCOPE_API_KEY) return String(process.env.DASHSCOPE_API_KEY).trim();
    try {
      const p = "D:/AI/workspace-d/freegen/freegen.config.json";
      if (existsSync(p)) {
        const c = JSON.parse(readFileSync(p, "utf8"));
        if (c.ali_key) return String(c.ali_key).trim();
      }
    } catch {}
  }
  return "";
}

function activeProv() {
  const cfg = loadCfg();
  const pid = PROVIDERS[cfg.provider] ? cfg.provider : "dashscope";
  const prov = PROVIDERS[pid];
  const base = (pid === "custom" ? cfg.customBase : prov.base || "").replace(/\\/+$/, "");
  const model = pid === "custom" ? cfg.customModel : prov.model;
  return { pid, prov, base, model, key: apiKey(pid) };
}`
);

/* ---------- 3. optimize 走当前 provider 的对话接口 ---------- */
sub(
  "optimize 多 provider",
  `async function optimize(text) {
  const key = apiKey();
  if (!key) throw Object.assign(new Error("没有 key，没法优化描述"), { status: 500 });
  const r = await fetch(CHAT_URL, {`,
  `async function optimize(text) {
  const { pid, prov, key } = activeProv();
  if (!key) throw Object.assign(new Error("还没有填 key，没法扩写描述"), { status: 400 });
  // 自定义 provider 没配对话接口，扩写就退回阿里（它对中文扩写最好也最便宜）。
  const chatBase = prov.chatBase || PROVIDERS.dashscope.chatBase;
  const chatModel = prov.chatModel || PROVIDERS.dashscope.chatModel;
  const chatKey = pid === "custom" ? apiKey("dashscope") : key;
  if (!chatKey) throw Object.assign(new Error("这个 provider 只配了出图，扩写需要另配百炼 key"), { status: 400 });
  const r = await fetch(chatBase + "/chat/completions", {`
);
sub("optimize headers key", `      authorization: \`Bearer \${key}\`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "qwen-plus",`, `      authorization: \`Bearer \${chatKey}\`, "content-type": "application/json" },
    body: JSON.stringify({
      model: chatModel,`);

/* ---------- 4. render 按 proto 出请求 ---------- */
sub(
  "render 取 provider",
  `  const key = apiKey();
  if (!key) {
    const e = new Error("没有找到阿里百炼的 key（可写进 ~/.dsh/forge-studio/config.json 的 apiKey）");
    e.status = 500;
    throw e;
  }

  const res = await fetch(ALI_URL, {
    method: "POST",
    headers: {
      authorization: \`Bearer \${key}\`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: { messages: [{ role: "user", content: [{ text: prompt }] }] },
      parameters: {
        size: \`\${u.w}*\${u.h}\`,
        prompt_extend: false,
        watermark: false,
      },
    }),
  });`,
  `  const { pid, prov, base, model, key } = activeProv();
  if (!key) {
    const e = new Error(\`「\${prov.label}」还没填 API Key，点右上角齿轮填一下。\`);
    e.status = 400;
    throw e;
  }
  if (!base || !model) {
    const e = new Error("自定义 provider 的 base 或模型名是空的，去设置里补齐。");
    e.status = 400;
    throw e;
  }

  let url, body;
  if (prov.proto === "dashscope") {
    url = base + "/api/v1/services/aigc/multimodal-generation/generation";
    body = {
      model,
      input: { messages: [{ role: "user", content: [{ text: prompt }] }] },
      parameters: { size: \`\${u.w}*\${u.h}\`, prompt_extend: false, watermark: false },
    };
  } else {
    // 火山方舟与各类中转站都是这条：size 用 x 分隔，response_format 要 url
    url = base + "/images/generations";
    body = {
      model,
      prompt,
      size: \`\${u.w}x\${u.h}\`,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: \`Bearer \${key}\`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });`
);

/* ---------- 5. 错误文案按 provider 分人话 ---------- */
sub(
  "错误文案",
  `    if (/Throttling|RateQuota|rate limit/i.test(text)) {
      const e = new Error("出图太快被限流了，等十来秒再点一次。");
      e.status = 429;
      throw e;
    }`,
  `    if (/Throttling|RateQuota|rate limit/i.test(text)) {
      const e = new Error("出图太快被限流了，等十来秒再点一次。");
      e.status = 429;
      throw e;
    }
    if (/InvalidEndpointOrModel|does not exist or you have no access/i.test(text)) {
      const e = new Error(\`「\${model}」这个模型在你账号里用不了。火山方舟要先去控制台「开通管理」把 Seedream 开通，或把模型名换成已开通的版本。\`);
      e.status = 400;
      throw e;
    }
    if (/invalid.*api.?key|AuthenticationError|401/i.test(text)) {
      const e = new Error("API Key 不对或已失效，点右上角齿轮重填。");
      e.status = 401;
      throw e;
    }`
);

/* ---------- 6. pickImageUrl 认方舟返回 ---------- */
sub(
  "pickImageUrl 兼容",
  `  const results = j?.output?.results;
  if (Array.isArray(results) && results[0]?.url) return results[0].url;
  return "";`,
  `  const results = j?.output?.results;
  if (Array.isArray(results) && results[0]?.url) return results[0].url;
  // 火山方舟 / OpenAI 兼容：data[0].url 或 data[0].b64_json
  const data = j?.data;
  if (Array.isArray(data)) {
    if (data[0]?.url) return data[0].url;
    if (data[0]?.b64_json) return "data:image/png;base64," + data[0].b64_json;
  }
  return "";`
);

/* ---------- 7. 下载支持 data: ---------- */
sub(
  "下载支持 data url",
  `  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) {
    const e = new Error(\`下载图片失败 \${imgRes.status}\`);
    e.status = 502;
    throw e;
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());`,
  `  let buf;
  if (imgUrl.startsWith("data:")) {
    buf = Buffer.from(imgUrl.slice(imgUrl.indexOf(",") + 1), "base64");
  } else {
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) {
      const e = new Error(\`下载图片失败 \${imgRes.status}\`);
      e.status = 502;
      throw e;
    }
    buf = Buffer.from(await imgRes.arrayBuffer());
  }`
);

/* ---------- 8. config 路由带 provider 信息 ---------- */
sub(
  "config 路由",
  `      sendJson(res, 200, {
        styles: PUBLIC_STYLES,
        uses: Object.entries(USES).map(([id, u]) => ({ id, label: u.label, hint: u.hint })),
        hasKey: Boolean(apiKey()),
        outDir: OUT_DIR,
      });`,
  `      const cfg = loadCfg();
      sendJson(res, 200, {
        styles: PUBLIC_STYLES,
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
      });`
);

/* ---------- 9. 设置与测试路由 ---------- */
sub(
  "settings/test 路由",
  `  add({
    kind: "exact",
    path: "/api/forge-studio/thumb",
    handler: serveThumb,
  });`,
  `  add({
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
        const base = ((pid === "custom" ? body.base || cfg.customBase : prov.base) || "").replace(/\\/+$/, "");
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
          headers: { authorization: \`Bearer \${key}\`, "content-type": "application/json" },
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
  });`
);

writeFileSync(P, s);
console.log(log.join("\n"));
