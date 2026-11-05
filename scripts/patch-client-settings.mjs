// 前端加「接口设置」：选 provider、填 key、测连通、保存。
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/client.js";
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

/* ---------- 样式 ---------- */
sub(
  "head 改 flex + 设置样式",
  `.fs-head { margin-bottom: 18px; }`,
  `.fs-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
.fs-headtext { flex: 1; min-width: 0; }
.fs-gear { flex: none; cursor: pointer; font-family: inherit; font-size: 12.5px; padding: 7px 13px;
  border-radius: 9px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.fs-gear:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.fs-gear[data-on="1"] { color: var(--dsw-alias-bg-base); background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary); }
.fs-set { margin-bottom: 18px; padding: 15px 16px 16px; border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.fs-setrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
.fs-setrow:first-of-type { margin-top: 8px; }
.fs-line { flex: 1; min-width: 190px; font-family: inherit; font-size: 13px; padding: 8px 11px;
  border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1); outline: none; }
.fs-line:focus { border-color: var(--dsw-alias-brand-primary); }
.fs-line::placeholder { color: var(--dsw-alias-label-secondary); opacity: .7; }
.fs-tag { font-size: 11.5px; padding: 3px 9px; border-radius: 6px; white-space: nowrap;
  background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l1); }
.fs-tag[data-ok="1"] { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.fs-tag[data-ok="0"] { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.fs-setnote { margin-top: 10px; font-size: 12px; line-height: 1.65; color: var(--dsw-alias-label-secondary); }`
);

/* ---------- 状态 ---------- */
sub(
  "settings 状态",
  `      const [autoOpt, setAutoOpt] = useState(true);`,
  `      const [autoOpt, setAutoOpt] = useState(true);
      const [showSet, setShowSet] = useState(false);
      const [pid, setPid] = useState("");
      const [keyDraft, setKeyDraft] = useState("");
      const [customBase, setCustomBase] = useState("");
      const [customModel, setCustomModel] = useState("");
      const [testing, setTesting] = useState(false);
      const [testMsg, setTestMsg] = useState(null);`
);

/* ---------- 拉 config 时初始化 provider ---------- */
sub(
  "config 初始化 provider",
  `            setCfg(j);
            if (j.styles && j.styles.length) setStyleId(j.styles[0].id);`,
  `            setCfg(j);
            setPid(j.provider || "dashscope");
            const me = (j.providers || []).find((p) => p.id === (j.provider || "dashscope"));
            if (me) {
              setCustomBase(me.base || "");
              setCustomModel(me.model || "");
            }
            if (j.styles && j.styles.length) setStyleId(j.styles[0].id);`
);

/* ---------- 保存 / 测试 ---------- */
sub(
  "saveSet / testSet",
  `      const doOptimize = async () => {`,
  `      const curProv = (cfg?.providers || []).find((p) => p.id === pid) || {};

      const saveSet = async () => {
        setTestMsg(null);
        try {
          const r = await fetch("/api/forge-studio/settings", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              provider: pid,
              keys: keyDraft.trim() ? { [pid]: keyDraft.trim() } : {},
              customBase: pid === "custom" ? customBase.trim() : undefined,
              customModel: pid === "custom" ? customModel.trim() : undefined,
            }),
          });
          const j = await r.json();
          if (!r.ok || !j.ok) throw new Error(j.error || "保存失败");
          setKeyDraft("");
          const c = await fetch("/api/forge-studio/config").then((x) => x.json());
          if (!alive.current) return;
          setCfg(c);
          setTestMsg({ ok: true, text: "已保存" });
        } catch (e) {
          if (alive.current) setTestMsg({ ok: false, text: String(e.message || e) });
        }
      };

      const testSet = async () => {
        if (testing) return;
        setTesting(true);
        setTestMsg(null);
        try {
          const r = await fetch("/api/forge-studio/test", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              provider: pid,
              key: keyDraft.trim() || undefined,
              base: pid === "custom" ? customBase.trim() : undefined,
              model: pid === "custom" ? customModel.trim() : undefined,
            }),
          });
          const j = await r.json();
          if (!alive.current) return;
          setTestMsg(
            j.ok
              ? { ok: true, text: \`通了，用时 \${Math.round((j.ms || 0) / 100) / 10}s\` }
              : { ok: false, text: (j.error || "没通").slice(0, 200) }
          );
        } catch (e) {
          if (alive.current) setTestMsg({ ok: false, text: String(e.message || e) });
        } finally {
          if (alive.current) setTesting(false);
        }
      };

      const doOptimize = async () => {`
);

/* ---------- 头部：齿轮 + 设置面板 ---------- */
sub(
  "头部 UI",
  `          h(
            "div",
            { className: "fs-head" },
            h("h1", { className: "fs-title" }, "生图工作台"),
            h(
              "p",
              { className: "fs-sub" },
              "描述你想要的画面，选一张看着顺眼的卡片，剩下的交给我。出的是干净底图，标题后期用排版工具叠——模型写中文字会翻车，这一步别省。"
            )
          ),`,
  `          h(
            "div",
            { className: "fs-head" },
            h(
              "div",
              { className: "fs-headtext" },
              h("h1", { className: "fs-title" }, "生图工作台"),
              h(
                "p",
                { className: "fs-sub" },
                "描述你想要的画面，选一张看着顺眼的卡片，剩下的交给我。出的是干净底图，标题后期用排版工具叠——模型写中文字会翻车，这一步别省。"
              )
            ),
            h(
              "button",
              {
                className: "fs-gear",
                "data-on": showSet ? "1" : "0",
                onClick: () => {
                  setShowSet((v) => !v);
                  setTestMsg(null);
                },
                title: "配置出图接口",
              },
              showSet ? "收起设置" : "⚙ " + (curProv.label || "接口")
            )
          ),

          showSet
            ? h(
                "div",
                { className: "fs-set" },
                h("div", { className: "fs-label" }, "用哪家的接口"),
                h(
                  "div",
                  { className: "fs-setrow" },
                  (cfg?.providers || []).map((p) =>
                    h(
                      "button",
                      {
                        key: p.id,
                        className: "fs-use",
                        "data-on": p.id === pid ? "1" : "0",
                        onClick: () => {
                          setPid(p.id);
                          setKeyDraft("");
                          setTestMsg(null);
                          setCustomBase(p.base || "");
                          setCustomModel(p.model || "");
                        },
                      },
                      p.label,
                      p.hasKey ? h("small", null, "已有 key") : null
                    )
                  )
                ),
                h(
                  "div",
                  { className: "fs-setrow" },
                  h("input", {
                    className: "fs-line",
                    type: "password",
                    value: keyDraft,
                    placeholder: curProv.hasKey ? "已存过 key，留空表示不改" : "粘贴 API Key",
                    onChange: (e) => setKeyDraft(e.target.value),
                  }),
                  curProv.hasKey ? h("span", { className: "fs-tag", "data-ok": "1" }, "已配置") : h("span", { className: "fs-tag" }, "未配置")
                ),
                pid === "custom"
                  ? h(
                      "div",
                      { className: "fs-setrow" },
                      h("input", {
                        className: "fs-line",
                        value: customBase,
                        placeholder: "Base URL，例如 https://api.xxx.com/v1",
                        onChange: (e) => setCustomBase(e.target.value),
                      }),
                      h("input", {
                        className: "fs-line",
                        style: { flex: "0 0 220px" },
                        value: customModel,
                        placeholder: "模型名，例如 kolors",
                        onChange: (e) => setCustomModel(e.target.value),
                      })
                    )
                  : null,
                h(
                  "div",
                  { className: "fs-setrow" },
                  h(
                    "button",
                    { className: "fs-ghost", onClick: testSet, disabled: testing },
                    testing ? "正在测…" : "测一下"
                  ),
                  h(
                    "button",
                    { className: "fs-primary", style: { padding: "7px 18px", fontSize: "12.5px" }, onClick: saveSet },
                    "保存"
                  ),
                  testMsg
                    ? h(
                        "span",
                        { className: "fs-tag", "data-ok": testMsg.ok ? "1" : "0" },
                        testMsg.text
                      )
                    : null
                ),
                h(
                  "div",
                  { className: "fs-setnote" },
                  curProv.hint || "",
                  curProv.model && pid !== "custom" ? " 当前模型：" + curProv.model + "。" : ""
                )
              )
            : null,`
);

writeFileSync(P, s);
console.log(log.join("\n"));
