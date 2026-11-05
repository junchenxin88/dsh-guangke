// 给工作台换一层"工业 / 科技 / 科幻"的皮肤。
// 做法：只往 CSS 末尾追加覆盖层，不改任何 DOM 和原规则——
// 原样式全部走 var(--dsw-alias-*)，所以只要在 .fs-root 里重定义这批变量，
// 整棵树会自动换色，不用碰 h() 结构。
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "D:/AI/workspace-d/forge-studio/client.js";
let s = readFileSync(FILE, "utf8");

const START = "const CSS = `";
const i = s.indexOf(START);
if (i < 0) throw new Error("找不到 const CSS = `");

// CSS 模板字符串的结束：换行 + 反引号
const endMark = "\n`;";
const j = s.indexOf(endMark, i);
if (j < 0) throw new Error("找不到 CSS 结尾");

// 幂等：已经贴过就不重复贴
if (s.slice(i, j).includes("/* ===== SKIN:INDUSTRIAL =====")) {
  console.log("皮肤已经贴过了，跳过");
  process.exit(0);
}

const SKIN = String.raw`

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
    linear-gradient(rgba(34, 211, 238, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.055) 1px, transparent 1px);
  background-size: auto, auto, auto, 44px 44px, 44px 44px;
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
.fs-wrap { max-width: 1180px; padding: 40px 32px 96px; }

.fs-title {
  font-size: clamp(26px, 2.6vw, 34px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
  margin: 0 0 10px;
  background: linear-gradient(96deg, #E8F3FF 12%, #22D3EE 58%, #A78BFA 96%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 42px rgba(34, 211, 238, 0.18);
}
.fs-sub {
  font-size: 13.5px;
  line-height: 1.75;
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
.fs-primary, .fs-go {
  background: linear-gradient(100deg, #22D3EE 0%, #38BDF8 42%, #A78BFA 100%);
  color: #04070C;
  font-weight: 700;
  letter-spacing: 0.01em;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 10px 30px -12px rgba(34, 211, 238, 0.85), 0 1px 0 rgba(255,255,255,.28) inset;
  transition: filter .15s, transform .1s, box-shadow .15s;
}
.fs-primary:hover, .fs-go:hover { filter: brightness(1.08); box-shadow: 0 14px 40px -12px rgba(34, 211, 238, 1); }
.fs-primary:active, .fs-go:active { transform: translateY(1px) scale(.995); }
.fs-primary:disabled, .fs-go:disabled { filter: grayscale(.6) brightness(.7); box-shadow: none; }

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
/* ===== /SKIN:INDUSTRIAL ===== */
`;

s = s.slice(0, j) + SKIN + s.slice(j);
writeFileSync(FILE, s);
console.log("✅ 皮肤已追加，client.js 现在", s.split("\n").length, "行");
