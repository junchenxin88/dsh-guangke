window.__ModuleLoader__.load({
  id: "dsh-guangke",
  factory(require) {
    const React = require("react");
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const h = React.createElement;

    const PANEL_ID = "forge-studio";

    const CSS = `
.fs-root { height: 100%; overflow: auto; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.fs-wrap { max-width: 1080px; margin: 0 auto; padding: 28px 28px 80px; }
.fs-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.fs-headtext { flex: 1; min-width: 0; }
.fs-gear { flex: none; cursor: pointer; font-family: inherit; font-size: 12.5px; padding: 7px 13px;
  border-radius: 9px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.fs-gear:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.fs-gear[data-on="1"] { color: var(--dsw-alias-bg-base); background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary); }
.fs-set { margin-bottom: 20px; padding: 15px 16px 16px; border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.fs-setrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
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
.fs-setnote { margin-top: 12px; font-size: 12px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
.fs-title { font-size: 20px; font-weight: 650; letter-spacing: -0.01em; margin: 0 0 6px; }
.fs-sub { font-size: 13px; line-height: 1.65; color: var(--dsw-alias-label-secondary); margin: 0; }

.fs-block { margin-bottom: 16px; }
.fs-label { font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: none;
  color: var(--dsw-alias-label-secondary); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
.fs-label::after { content: ""; flex: 1; height: 1px; background: var(--dsw-alias-border-l1); }

.fs-input { width: 100%; box-sizing: border-box; min-height: 60px; resize: vertical;
  padding: 12px 14px; border-radius: 10px; font: inherit; font-size: 14px; line-height: 1.7;
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l2); outline: none; transition: border-color .15s; }
.fs-input:focus { border-color: var(--dsw-alias-brand-primary); }
.fs-input::placeholder { color: var(--dsw-alias-label-secondary); opacity: .7; }
.fs-hint { font-size: 12px; color: var(--dsw-alias-label-secondary); margin-top: 7px; }

.fs-chips { display: flex; flex-wrap: wrap; gap: 6px 7px; margin-bottom: 12px; }
.fs-chips::-webkit-scrollbar { display: none; }
.fs-chips > * { flex: 0 0 auto; }
.fs-chip { font-size: 12px; padding: 4px 12px; border-radius: 999px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l1); background: transparent;
  color: var(--dsw-alias-label-secondary); transition: all .14s; font-family: inherit; }
.fs-chip:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }
.fs-chip[data-on="1"] { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-bg-base); font-weight: 600; }

.fs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 10px;
  -webkit-mask-image: linear-gradient(to bottom, #000 88%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 88%, transparent 100%);
  max-height: 448px; overflow-y: auto; padding-right: 4px;
  scrollbar-width: thin; }
.fs-card { position: relative; text-align: left; cursor: pointer; padding: 0; overflow: hidden;
  border-radius: 10px; background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1); transition: all .14s; font-family: inherit; }
.fs-card:hover { border-color: var(--dsw-alias-border-l2); transform: translateY(-1px); }
.fs-card[data-on="1"] { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary) inset; }
.fs-thumb-ph { width: 100%; height: 100%; }
.fs-thumb { aspect-ratio: 4 / 3; background: var(--dsw-alias-bg-layer-2); overflow: hidden; }
.fs-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fs-tools { display: flex; align-items: center; gap: 12px; margin-top: 9px; flex-wrap: wrap; }
.fs-ghost { cursor: pointer; font-family: inherit; font-size: 12px; padding: 6px 12px;
  border-radius: 8px; background: transparent; border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary); transition: all .14s; }
.fs-ghost:hover:not(:disabled) { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-brand-primary); }
.fs-ghost:disabled { opacity: .4; cursor: default; }
.fs-switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
  color: var(--dsw-alias-label-secondary); cursor: pointer; user-select: none; }
.fs-switch input { accent-color: var(--dsw-alias-brand-primary); margin: 0; cursor: pointer; }
.fs-cardbody { padding: 9px 10px 10px; }
.fs-name { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary);
  line-height: 1.3; margin-bottom: 3px; }
.fs-cat { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.fs-check { position: absolute; top: 6px; right: 6px; width: 16px; height: 16px; border-radius: 50%;
  background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); font-size: 11px; font-weight: 700; line-height: 16px;
  text-align: center; display: none; }
.fs-card[data-on="1"] .fs-check { display: block; }

.fs-uses { display: flex; flex-wrap: wrap; gap: 8px; }
.fs-use { cursor: pointer; padding: 8px 14px; border-radius: 9px; font-family: inherit;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary); font-size: 13px; display: flex; align-items: baseline; gap: 7px;
  transition: all .14s; }
.fs-use:hover { border-color: var(--dsw-alias-border-l2); }
.fs-use[data-on="1"] { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-2);
  box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary) inset; }
.fs-use small { font-size: 11px; color: var(--dsw-alias-label-secondary); }

.fs-go { margin-top: 4px; display: flex; gap: 10px; align-items: center; }
.fs-primary { cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600;
  padding: 11px 26px; border-radius: 10px; border: 0; color: var(--dsw-alias-bg-base);
  background: var(--dsw-alias-brand-primary); transition: opacity .14s; }
.fs-primary:hover { opacity: .9; }
.fs-primary:disabled { opacity: .45; cursor: default; }
.fs-ghost { cursor: pointer; font-family: inherit; font-size: 13px; padding: 10px 18px;
  border-radius: 10px; background: transparent; color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l2); transition: all .14s; text-decoration: none;
  display: inline-block; }
.fs-ghost:hover { border-color: var(--dsw-alias-brand-primary); }
.fs-status { font-size: 12.5px; color: var(--dsw-alias-label-secondary); }

.fs-grid-out { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px; }
.fs-thumb-out { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--dsw-alias-border-l1); }
.fs-thumb-out img { display: block; width: 100%; height: auto; }
.fs-thumb-out span { position: absolute; left: 8px; bottom: 6px; font-size: 11px; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.9); }
.fs-out { margin-top: 8px; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); }
.fs-out img { display: block; width: 100%; height: auto; }
.fs-empty { padding: 46px 20px; text-align: center; color: var(--dsw-alias-label-secondary);
  font-size: 13px; line-height: 1.8; }
.fs-err { padding: 16px 18px; border-radius: 10px; font-size: 13px; line-height: 1.7;
  color: var(--dsw-alias-state-error-primary);
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-state-error-primary); }
.fs-note { margin-bottom: 10px; padding: 9px 12px; border-radius: 9px; font-size: 12.5px; line-height: 1.6;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary); }
.fs-note b { color: var(--dsw-alias-label-primary); font-weight: 600; }
.fs-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px;
  color: var(--dsw-alias-label-secondary); padding: 10px 14px;
  border-top: 1px solid var(--dsw-alias-border-l1); }
.fs-prompt { margin-top: 10px; font-size: 12px; line-height: 1.75;
  color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2);
  border-radius: 8px; padding: 10px 12px; white-space: pre-wrap; word-break: break-word; }
.fs-spin { display: inline-block; width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid var(--dsw-alias-bg-base); opacity: .55; border-top-color: var(--dsw-alias-bg-base); animation: fs-rot .8s linear infinite;
  vertical-align: -2px; margin-right: 7px; }
@keyframes fs-rot { to { transform: rotate(360deg); } }

/* ===== SKIN:INDUSTRIAL ===== */
/* 在根节点重定义主题变量：整棵树跟着换色，DOM 一行不用动 */
.fs-root {
  --dsw-alias-bg-base: #04070C;
  --dsw-alias-bg-layer-1: rgba(12, 18, 28, 0.74);
  --dsw-alias-bg-layer-2: rgba(20, 28, 42, 0.88);
  --dsw-alias-bg-overlay: rgba(6, 10, 16, 0.92);
  --dsw-alias-border-l1: rgba(34, 211, 238, 0.14);
  --dsw-alias-border-l2: rgba(34, 211, 238, 0.34);
  --dsw-alias-label-primary: #E8F3FF;
  --dsw-alias-label-secondary: #7E93AC;
  --dsw-alias-brand-primary: #22D3EE;
  --dsw-alias-state-success-primary: #34D399;
  --dsw-alias-state-error-primary: #FB7185;
  --dsw-alias-state-warn-primary: #FBBF24;
  --dsw-alias-state-idle-primary: #64748B;

  --fs-cyan: #22D3EE;
  --fs-violet: #7C3AED;
  --fs-amber: #F59E0B;

  position: relative;
  isolation: isolate;
  background: #04070C;
  color: #E8F3FF;
  font-feature-settings: "tnum" 1, "ss01" 1;
}

/* 背景第一层：工程网格 + 双光晕，缓慢漂移 */
.fs-root::before {
  content: "";
  position: fixed;
  inset: -10%;
  z-index: -2;
  pointer-events: none;
  background-image:
    radial-gradient(60rem 40rem at 18% -10%, rgba(34, 211, 238, 0.16), transparent 60%),
    radial-gradient(50rem 36rem at 88% 8%, rgba(124, 58, 237, 0.18), transparent 62%),
    radial-gradient(40rem 30rem at 60% 108%, rgba(34, 211, 238, 0.10), transparent 65%),
    linear-gradient(rgba(34, 211, 238, 0.032) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.032) 1px, transparent 1px);
  background-size: auto, auto, auto, 56px 56px, 56px 56px;
  animation: fs-drift 26s ease-in-out infinite alternate;
  will-change: transform;
}

/* 背景第二层：一条自下而上的扫描光带，科幻仪表盘那种 */
.fs-root::after {
  content: "";
  position: fixed;
  left: 0; right: 0; top: 0;
  height: 34vh;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(34, 211, 238, 0.045) 45%,
    rgba(34, 211, 238, 0.11) 50%,
    rgba(34, 211, 238, 0.045) 55%,
    transparent 100%
  );
  animation: fs-scan 9s linear infinite;
  will-change: transform;
}

@keyframes fs-drift {
  from { transform: translate3d(-1.2%, -0.8%, 0) scale(1); }
  to   { transform: translate3d(1.2%, 1.6%, 0) scale(1.04); }
}
@keyframes fs-scan {
  from { transform: translateY(-40vh); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  to   { transform: translateY(110vh); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .fs-root::before, .fs-root::after { animation: none; }
}

/* —— 排版：大字号对比 + 字距收紧，2026 网页主流做法 —— */
.fs-wrap { max-width: 1180px; padding: 12px 32px 96px; }

.fs-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
  margin: 0 0 4px;
  background: linear-gradient(96deg, #F2F8FF 4%, #5EEAD4 34%, #22D3EE 58%, #A78BFA 92%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.35)) drop-shadow(0 0 46px rgba(124, 58, 237, 0.22));
}
.fs-sub {
  font-size: 12.5px;
  line-height: 1.5;
  letter-spacing: 0.01em;
  color: #7E93AC;
  max-width: 62ch;
}

/* —— 卡片与面板：深色玻璃 + 1px 冷光边 —— */
.fs-set, .fs-input, .fs-card, .fs-out, .fs-note {
  backdrop-filter: blur(14px) saturate(1.15);
  -webkit-backdrop-filter: blur(14px) saturate(1.15);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 18px 40px -28px rgba(0, 0, 0, 0.9);
}
.fs-set { border-radius: 16px; border-color: rgba(34, 211, 238, 0.18); }
.fs-input { border-radius: 14px; }
.fs-input:focus {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.10), 0 0 34px -10px rgba(34, 211, 238, 0.55);
}

/* 分区标题：短横线改成发光刻度 */
.fs-label { font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; }
.fs-label::after {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.45), transparent);
}

/* —— 分类 chip —— */
.fs-chip {
  border-radius: 999px;
  letter-spacing: 0.02em;
  transition: color .15s, border-color .15s, background .15s, box-shadow .15s, transform .12s;
}
.fs-chip:hover { border-color: rgba(34, 211, 238, 0.4); transform: translateY(-1px); }
.fs-chip[data-on="1"] {
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.95), rgba(14, 165, 200, 0.95));
  border-color: transparent;
  color: #04070C;
  font-weight: 700;
  box-shadow: 0 0 22px -4px rgba(34, 211, 238, 0.75);
}

/* —— 风格卡 —— */
.fs-card {
  border-radius: 14px;
  overflow: hidden;
  transition: transform .16s cubic-bezier(.2,.7,.3,1), border-color .16s, box-shadow .16s;
}
.fs-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 22px 46px -26px rgba(34, 211, 238, 0.55), 0 1px 0 rgba(255,255,255,.06) inset;
}
.fs-card[data-on="1"] {
  border-color: rgba(34, 211, 238, 0.85);
  box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.55), 0 22px 50px -28px rgba(34, 211, 238, 0.8);
}
.fs-card .fs-thumb img { transition: transform .5s cubic-bezier(.2,.7,.3,1); }
.fs-card:hover .fs-thumb img { transform: scale(1.045); }

/* —— 用途按钮 —— */
.fs-use { border-radius: 11px; transition: border-color .15s, box-shadow .15s, transform .12s; }
.fs-use:hover { border-color: rgba(34, 211, 238, 0.4); transform: translateY(-1px); }
.fs-use[data-on="1"] {
  border-color: rgba(34, 211, 238, 0.8);
  box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.45) inset, 0 0 20px -8px rgba(34, 211, 238, 0.7);
}

/* —— 主按钮：青→紫渐变，按下有内陷感 —— */
.fs-primary {
  min-width: 132px;
  background: linear-gradient(100deg, #22D3EE 0%, #38BDF8 42%, #A78BFA 100%);
  color: #04070C;
  font-weight: 700;
  letter-spacing: 0.01em;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 10px 30px -12px rgba(34, 211, 238, 0.85), 0 1px 0 rgba(255,255,255,.28) inset;
  transition: filter .15s, transform .1s, box-shadow .15s;
}
.fs-primary:hover { filter: brightness(1.08); box-shadow: 0 14px 40px -12px rgba(34, 211, 238, 1); }
.fs-primary:active { transform: translateY(1px) scale(.995); }
.fs-primary:disabled { filter: grayscale(.6) brightness(.7); box-shadow: none; }

/* —— 齿轮 / 次级按钮 —— */
.fs-gear { border-radius: 10px; letter-spacing: 0.02em; }
.fs-gear:hover { border-color: rgba(34, 211, 238, 0.5); box-shadow: 0 0 18px -8px rgba(34, 211, 238, 0.9); }
.fs-gear[data-on="1"] {
  background: linear-gradient(100deg, #22D3EE, #A78BFA);
  color: #04070C;
  border-color: transparent;
}

/* —— 结果图 —— */
.fs-out { border-radius: 16px; border-color: rgba(34, 211, 238, 0.22); }

/* 滚动条也换成工业冷灰 */
.fs-root ::-webkit-scrollbar { width: 10px; height: 10px; }
.fs-root ::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.22);
  border-radius: 99px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.fs-root ::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.42); background-clip: padding-box; }
.fs-root ::-webkit-scrollbar-track { background: transparent; }
.fs-title { display: flex; align-items: baseline; gap: 13px; }
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
/* ===== /SKIN:INDUSTRIAL ===== */

`;

    function useStyles() {
      useEffect(() => {
        const id = "forge-studio-css";
        if (document.getElementById(id)) return;
        const el = document.createElement("style");
        el.id = id;
        el.textContent = CSS;
        document.head.appendChild(el);
        return () => {
          try {
            el.remove();
          } catch {}
        };
      }, []);
    }

    function Panel() {
      useStyles();
      const [cfg, setCfg] = useState(null);
      const [cat, setCat] = useState("全部");
      const [styleId, setStyleId] = useState("");
      const [use, setUse] = useState("gzh-cover");
      const [topic, setTopic] = useState("");
      const [busy, setBusy] = useState(false);
      const [optBusy, setOptBusy] = useState(false);
      const [autoOpt, setAutoOpt] = useState(true);
      const [showSet, setShowSet] = useState(false);
      const [pid, setPid] = useState("");
      const [keyDraft, setKeyDraft] = useState("");
      const [customBase, setCustomBase] = useState("");
      const [customModel, setCustomModel] = useState("");
      const [testing, setTesting] = useState(false);
      const [filling, setFilling] = useState(false);
      const [testMsg, setTestMsg] = useState(null);
      const [err, setErr] = useState("");
      const [out, setOut] = useState(null);
      const [batch, setBatch] = useState(1);
      const [title, setTitle] = useState("");
      const [titleSub, setTitleSub] = useState("");
      const [overlaying, setOverlaying] = useState(false);
      const [hist, setHist] = useState([]);
      const alive = useRef(true);

      useEffect(() => {
        alive.current = true;
        fetch("/api/forge-studio/config")
          .then((r) => r.json())
          .then((j) => {
            if (!alive.current) return;
            setCfg(j);
            setPid(j.provider || "dashscope");
            const me = (j.providers || []).find((p) => p.id === (j.provider || "dashscope"));
            if (me) {
              setCustomBase(me.base || "");
              setCustomModel(me.model || "");
            }
            if (j.styles && j.styles.length) setStyleId(j.styles[0].id);
          })
          .catch((e) => alive.current && setErr(String(e)));
        return () => {
          alive.current = false;
        };
      }, []);

      const styles = cfg?.styles || [];
      const uses = cfg?.uses || [];
      const cats = useMemo(() => {
        const set = [];
        for (const s of styles) if (s.cat && !set.includes(s.cat)) set.push(s.cat);
        return ["全部", ...set];
      }, [styles]);
      const shown = useMemo(
        () => (cat === "全部" ? styles : styles.filter((s) => s.cat === cat)),
        [styles, cat]
      );

      const go = useCallback(async () => {
        if (busy) return;
        if (!topic.trim()) {
          setErr("先写一句你想要什么画面");
          return;
        }
        setBusy(true);
        setErr("");
        try {
          const r = await fetch("/api/forge-studio/render", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ topic: topic.trim(), styleId, use, autoOptimize: autoOpt, n: batch }),
          });
          const j = await r.json();
          if (!r.ok || !j.ok) throw new Error(j.error || `生成失败（${r.status}）`);
          setOut(j);
          fetch("/api/forge-studio/history?limit=24")
            .then((x) => x.json())
            .then((h) => { if (alive.current && h.ok) setHist(h.items); })
            .catch(() => {});
        } catch (e) {
          setErr(String(e.message || e));
        } finally {
          if (alive.current) setBusy(false);
        }
      }, [busy, topic, styleId, use, autoOpt, batch]);

      const doOverlay = async (src) => {
        if (overlaying) return;
        if (!title.trim()) {
          setErr("先写个标题");
          return;
        }
        setOverlaying(true);
        setErr("");
        try {
          const r = await fetch("/api/forge-studio/overlay", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: src || out?.name,
              title: title.trim(),
              sub: titleSub.trim(),
            }),
          });
          const j = await r.json();
          if (!r.ok || !j.ok) throw new Error(j.error || "叠字失败");
          setOut({ ...out, ok: true, name: j.name, url: j.url, path: j.path, prompt: out?.prompt });
        } catch (e) {
          setErr(String(e.message || e));
        } finally {
          if (alive.current) setOverlaying(false);
        }
      };

      const curProv = (cfg?.providers || []).find((p) => p.id === pid) || {};

      const missingThumbs = (cfg?.styles || []).filter((x) => x.thumb === false).length;

      const fillThumbs = async () => {
        if (filling) return;
        setFilling(true);
        setTestMsg({ ok: true, text: "正在一张张补齐，每张 1~2 秒，别关页面…" });
        try {
          const r = await fetch("/api/forge-studio/thumbs/fill", { method: "POST" });
          const j = await r.json();
          if (!r.ok || !j.ok) throw new Error(j.error || "补图失败");
          const c = await fetch("/api/forge-studio/config").then((x) => x.json());
          if (!alive.current) return;
          setCfg(c);
          setTestMsg({
            ok: !j.fail || !j.fail.length,
            text: j.fail && j.fail.length ? `补了 ${j.made} 张，${j.fail[0]}` : `补完了 ${j.made} 张`,
          });
        } catch (e) {
          if (alive.current) setTestMsg({ ok: false, text: String(e.message || e) });
        } finally {
          if (alive.current) setFilling(false);
        }
      };

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
              ? { ok: true, text: `通了，用时 ${Math.round((j.ms || 0) / 100) / 10}s` }
              : { ok: false, text: (j.error || "没通").slice(0, 200) }
          );
        } catch (e) {
          if (alive.current) setTestMsg({ ok: false, text: String(e.message || e) });
        } finally {
          if (alive.current) setTesting(false);
        }
      };

      const doOptimize = async () => {
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

      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") go();
      };

      return h(
        "div",
        { className: "fs-root" },
        h(
          "div",
          { className: "fs-wrap" },

          h(
            "div",
            { className: "fs-head" },
            h(
              "div",
              { className: "fs-headtext" },
              h("h1", { className: "fs-title" }, "光刻", h("span", { className: "fs-title-en" }, "LITHO")),
              h(
                "p",
                { className: "fs-sub" },
                "把一句话刻成一张图。剩下的交给我。"
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
                  missingThumbs > 0
                    ? h(
                        "button",
                        { className: "fs-ghost", onClick: fillThumbs, disabled: filling },
                        filling ? "正在补…" : `补齐预览图（缺 ${missingThumbs} 张）`
                      )
                    : null,
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
            : null,

          h(
            "div",
            { className: "fs-block" },
            h("div", { className: "fs-label" }, "你想要什么画面"),
            h("textarea", {
              className: "fs-input",
              value: topic,
              placeholder: "例：一块巨大的 AI 芯片悬浮在夜色里，表面电路像一座俯瞰的城市",
              onChange: (e) => setTopic(e.target.value),
              onKeyDown: onKey,
            }),
            h(
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
              ),
              h(
                "label",
                { className: "fs-switch" },
                h("input", {
                  type: "checkbox",
                  checked: batch === 4,
                  onChange: (e) => setBatch(e.target.checked ? 4 : 1),
                }),
                "一次出 4 张"
              )
            ),

          ),

          h(
            "div",
            { className: "fs-block" },
            h("div", { className: "fs-label" }, "选个感觉"),
            h(
              "div",
              { className: "fs-chips" },
              cats.map((c) =>
                h(
                  "button",
                  {
                    key: c,
                    className: "fs-chip",
                    "data-on": c === cat ? "1" : "0",
                    onClick: () => {
                      setCat(c);
                      // 切分类后原来选的风格就看不见了，用户不知道自己选了什么；自动落到该分类第一张。
                      if (c !== "全部" && !styles.some((x) => x.id === styleId && x.cat === c)) {
                        const first = styles.find((x) => x.cat === c);
                        if (first) setStyleId(first.id);
                      }
                    },
                  },
                  c
                )
              )
            ),
            h(
              "div",
              { className: "fs-grid" },
              shown.map((s) =>
                h(
                  "button",
                  {
                    key: s.id,
                    className: "fs-card",
                    "data-on": s.id === styleId ? "1" : "0",
                    onClick: () => setStyleId(s.id),
                    title: s.use || "",
                  },
                  h(
                    "div",
                    { className: "fs-thumb" },
                    // 新增风格还没出缩略图（百炼欠费），回退成原来的色带
                    s.thumb === false
                      ? h("div", {
                          className: "fs-thumb-ph",
                          style: {
                            background:
                              "linear-gradient(90deg," +
                              (s.colors || []).map((c, i, arr) => `${c} ${(100 / arr.length) * i}% ${(100 / arr.length) * (i + 1)}%`).join(",") +
                              ")",
                          },
                        })
                      : h("img", {
                          src: "/api/forge-studio/thumb?id=" + s.id,
                          alt: s.name,
                          loading: "lazy",
                          decoding: "async",
                        })
                  ),
                  h(
                    "div",
                    { className: "fs-cardbody" },
                    h("div", { className: "fs-name" }, s.name),
                    h("div", { className: "fs-cat" }, s.cat)
                  ),
                  h("span", { className: "fs-check" }, "✓")
                )
              )
            )
          ),

          h(
            "div",
            { className: "fs-block" },
            h("div", { className: "fs-label" }, "用在哪"),
            h(
              "div",
              { className: "fs-uses" },
              uses.map((u) =>
                h(
                  "button",
                  {
                    key: u.id,
                    className: "fs-use",
                    "data-on": u.id === use ? "1" : "0",
                    onClick: () => setUse(u.id),
                  },
                  u.label,
                  h("small", null, u.hint)
                )
              )
            )
          ),

          h(
            "div",
            { className: "fs-go" },
            h(
              "button",
              { className: "fs-primary", disabled: busy, onClick: go },
              busy ? h("span", { className: "fs-spin" }) : null,
              busy ? "正在出图…" : out ? "再出一张" : "生成图片"
            ),
            cfg && !cfg.hasKey
              ? h(
                  "span",
                  { className: "fs-status" },
                  "没找到 key，先写进 ~/.dsh/forge-studio/config.json"
                )
              : null
          ),

          err
            ? h("div", { className: "fs-block" }, h("div", { className: "fs-err" }, err))
            : null,

          h(
            "div",
            { className: "fs-block", style: { marginTop: 22 } },
            out
              ? h(
                  "div",
                  null,
                  out.optimized
                    ? h(
                        "div",
                        { className: "fs-note" },
                        "你写的「",
                        h("b", null, out.original),
                        "」太短，我补成了：",
                        h("b", null, out.topic)
                      )
                    : null,
                  out.items && out.items.length > 1
                    ? h(
                        "div",
                        { className: "fs-grid-out" },
                        out.items.map((it) =>
                          h(
                            "div",
                            { key: it.name, className: "fs-thumb-out" },
                            h("img", { src: it.url, alt: it.style || "" }),
                            h("span", null, it.style)
                          )
                        )
                      )
                    : null,
                  h(
                    "div",
                    { className: "fs-out" },
                    h("img", { src: out.url, alt: out.prompt || "生成的图片" }),
                    h(
                      "div",
                      { className: "fs-meta" },
                      h("span", null, out.style),
                      h("span", null, out.use),
                      h("span", null, out.size),
                      h("span", { style: { opacity: 0.7 } }, out.path)
                    )
                  ),
                  h(
                    "div",
                    { className: "fs-go", style: { marginTop: 12 } },
                    h(
                      "a",
                      { className: "fs-ghost", href: out.url, download: out.name },
                      "保存到本地"
                    ),
                    h(
                      "button",
                      { className: "fs-ghost", onClick: go, disabled: busy },
                      busy ? "正在出图…" : "再出一张"
                    )
                  ),
                  h(
                    "div",
                    { className: "fs-line", style: { marginTop: 12, gap: 8 } },
                    h("input", {
                      className: "fs-input",
                      style: { minHeight: 0, height: 38, flex: "1 1 150px" },
                      placeholder: "标题（叠到图上）",
                      value: title,
                      onChange: (e) => setTitle(e.target.value),
                    }),
                    h("input", {
                      className: "fs-input",
                      style: { minHeight: 0, height: 38, flex: "1 1 110px" },
                      placeholder: "英文副标（可选）",
                      value: titleSub,
                      onChange: (e) => setTitleSub(e.target.value),
                    }),
                    h(
                      "button",
                      {
                        className: "fs-primary",
                        style: { minWidth: 96 },
                        onClick: () => doOverlay(out.name),
                        disabled: overlaying || !title.trim(),
                      },
                      overlaying ? "正在叠…" : "叠标题"
                    )
                  ),
                  h(
                    "details",
                    { style: { marginTop: 14 } },
                    h(
                      "summary",
                      {
                        className: "fs-hint",
                        style: { cursor: "pointer", userSelect: "none" },
                      },
                      "看看这次用的描述（可复制去别处用）"
                    ),
                    h("div", { className: "fs-prompt" }, out.prompt)
                  )
                )
              : h(
                  "div",
                  { className: "fs-out" },
                  h(
                    "div",
                    { className: "fs-empty" },
                    h("div", { style: { fontSize: 14, marginBottom: 6 } }, "还没有图"),
                    h("div", null, "上面写一句话，点「生成图片」。")
                  )
                )
          )
        )
      );
    }

    function Icon({ size }) {
      return h(
        "svg",
        {
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.7,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
        h("path", { d: "M12 3.2 13.45 7.4 17.6 8.85 13.45 10.3 12 14.5 10.55 10.3 6.4 8.85 10.55 7.4Z" }),
        h("path", { d: "M5.4 14.6 6.1 16.6 8.1 17.3 6.1 18 5.4 20 4.7 18 2.7 17.3 4.7 16.6Z" }),
        h("path", { d: "M17.2 14.2v5.6" }),
        h("path", { d: "M14.6 16.9h5.2" })
      );
    }

    return {
      inject: ["slots"],
      apply(ctx) {
        ctx.slots.inject("main", () =>
          ctx.slots.register(
            { name: "main", key: PANEL_ID, order: 0 },
            Panel
          )
        );
        ctx.slots.inject("sidebar.panellist", () =>
          ctx.slots.register(
            {
              name: "sidebar.panellist",
              id: PANEL_ID,
              order: 2,
              label: () => "光刻",
            },
            (owner = {}) => h(Icon, { size: owner.size ?? 16 })
          )
        );
      },
    };
  },
});
