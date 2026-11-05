// 一次性补丁：色带换缩略图 + 加「帮我扩写」和自动优化开关。
// 这个文件是 h() 手写 JSX，改点多且有引号，用脚本做精确替换比手改稳。
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/client.js";
let s = readFileSync(P, "utf8");
const log = [];

function sub(name, from, to) {
  if (!s.includes(from)) {
    log.push(`❌ 未命中：${name}`);
    return;
  }
  s = s.replace(from, to);
  log.push(`✅ ${name}`);
}

/* ---------- 1. 样式：色带 → 缩略图 + 工具条 ---------- */
sub(
  "css 色带→缩略图",
  `.fs-bar { height: 26px; display: flex; }
.fs-bar > i { flex: 1; display: block; }`,
  `.fs-thumb { aspect-ratio: 4 / 3; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.fs-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fs-tools { display: flex; align-items: center; gap: 12px; margin-top: 9px; flex-wrap: wrap; }
.fs-ghost { cursor: pointer; font-family: inherit; font-size: 12px; padding: 6px 12px;
  border-radius: 8px; background: transparent; border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary); transition: all .14s; }
.fs-ghost:hover:not(:disabled) { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-brand-primary); }
.fs-ghost:disabled { opacity: .4; cursor: default; }
.fs-switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
  color: var(--dsw-alias-label-secondary); cursor: pointer; user-select: none; }
.fs-switch input { accent-color: var(--dsw-alias-brand-primary); margin: 0; cursor: pointer; }`
);

/* ---------- 2. 状态 ---------- */
sub(
  "state autoOpt/optBusy",
  `      const [busy, setBusy] = useState(false);`,
  `      const [busy, setBusy] = useState(false);
      const [optBusy, setOptBusy] = useState(false);
      const [autoOpt, setAutoOpt] = useState(true);`
);

/* ---------- 3. 请求带上 autoOptimize ---------- */
sub(
  "render 传 autoOptimize",
  `body: JSON.stringify({ topic: topic.trim(), styleId, use }),`,
  `body: JSON.stringify({ topic: topic.trim(), styleId, use, autoOptimize: autoOpt }),`
);
sub("go 依赖加 autoOpt", `}, [busy, topic, styleId, use]);`, `}, [busy, topic, styleId, use, autoOpt]);`);

/* ---------- 4. 扩写函数 ---------- */
sub(
  "doOptimize",
  `      const onKey = (e) => {`,
  `      const doOptimize = async () => {
        const t = topic.trim();
        if (!t || optBusy) return;
        setOptBusy(true);
        setErr("");
        try {
          const r = await fetch("/api/forge-studio/optimize", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text: t }),
          });
          const j = await r.json();
          if (!r.ok || !j.ok) throw new Error(j.error || "扩写失败");
          if (alive.current) setTopic(j.text);
        } catch (e) {
          if (alive.current) setErr(String(e.message || e));
        } finally {
          if (alive.current) setOptBusy(false);
        }
      };

      const onKey = (e) => {`
);

/* ---------- 5. 输入框下面的工具条 ---------- */
sub(
  "工具条",
  `            h(
              "div",
              { className: "fs-hint" },
              "写清「什么东西 + 什么环境」就够，不用写风格和参数。Ctrl/Cmd + Enter 直接生成。"
            )`,
  `            h(
              "div",
              { className: "fs-tools" },
              h(
                "button",
                { className: "fs-ghost", onClick: doOptimize, disabled: busy || optBusy },
                optBusy ? "正在扩写…" : "✨ 帮我扩写"
              ),
              h(
                "label",
                { className: "fs-switch" },
                h("input", {
                  type: "checkbox",
                  checked: autoOpt,
                  onChange: (e) => setAutoOpt(e.target.checked),
                }),
                "短句自动补全画面"
              )
            ),
            h(
              "div",
              { className: "fs-hint" },
              "写清「什么东西 + 什么环境」就够，不用写风格和参数。句子太短时我会先替你补全。Ctrl/Cmd + Enter 直接生成。"
            )`
);

/* ---------- 6. 卡片图 ---------- */
sub(
  "卡片色带→缩略图",
  `                  h(
                    "div",
                    { className: "fs-bar" },
                    (s.colors || []).map((c, i) => h("i", { key: i, style: { background: c } }))
                  ),`,
  `                  h(
                    "div",
                    { className: "fs-thumb" },
                    h("img", {
                      src: "/api/forge-studio/thumb?id=" + s.id,
                      alt: s.name,
                      loading: "lazy",
                      decoding: "async",
                    })
                  ),`
);

writeFileSync(P, s);
console.log(log.join("\n"));
