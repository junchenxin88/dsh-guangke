// 加「补齐风格预览图」路由：新加的 20 条风格还没缩略图，点一下就用当前 provider 串行补。
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/index.js";
let s = readFileSync(P, "utf8");

if (s.includes("/api/forge-studio/thumbs/fill")) {
  console.log("已存在，跳过");
  process.exit(0);
}

const i = s.indexOf("  add({");
if (i < 0) {
  console.log("❌ 找不到 add({ 锚点");
  process.exit(1);
}

const block = `  add({
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

`;

s = s.slice(0, i) + block + s.slice(i);
writeFileSync(P, s);
console.log("✅ 已插入 thumbs/fill 路由");
