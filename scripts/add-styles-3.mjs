// S82–S87：补「信息图」大类。
// 依据：2026 年小红书星云 5.0 把图片信息密度权重提上去了，「图即内容」；
// 公众号侧则是长文→一张信息图（Infography 那类做法）。现有 81 条里
// S32 是科技风数据可视化（流线），S69/S81/S66 是卡片和对比，
// 缺的是「步骤/时间/矩阵/图表/层级/表格」这六种结构化表达。
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";

const FILE = new URL("../data/styles.json", import.meta.url);
const raw = JSON.parse(readFileSync(FILE, "utf8"));
const list = Array.isArray(raw) ? raw : raw.styles;

copyFileSync(FILE, new URL("../data/styles.backup-81.json", import.meta.url));

const ADD = [
  {
    id: "S82", n: "Step Flow", z: "步骤流程", c: "信息图", s: 4,
    ae: "horizontal step flow diagram, 3 to 4 numbered nodes connected by arrows, flat isometric icons, generous white space, clean grid",
    az: "横向步骤流程，三到四个编号节点用箭头串联，扁平图标，大量留白",
    p: ["#0F172A", "#38BDF8", "#F8FAFC", "#F59E0B"],
    comp: "横向等距四步排开，每步一个编号圆 + 上方图标 + 下方留出两行空白，步骤之间箭头连接，四周留出均匀白边",
    u: "教程、操作流程、方法论拆解",
    w: "节点超过 4 个会挤成一团；箭头必须指向下一个编号，不能乱连；每个节点下方必须留白，否则没地方写字",
    m: "Nano Banana Pro / GPT-Image（要排版）｜qwen-image 只能出个大概",
  },
  {
    id: "S83", n: "Timeline", z: "时间线", c: "信息图", s: 4,
    ae: "vertical timeline infographic, central spine line, alternating circular nodes with dates, muted palette, clean typography zones",
    az: "竖向时间线，中央主轴上交替排列圆形节点与日期，低饱和配色",
    p: ["#1E293B", "#94A3B8", "#E2E8F0", "#F472B6"],
    comp: "一条竖线贯穿画面，节点左右交替分布，每个节点旁留出一块空白写事件，顶部留标题带",
    u: "发展史、项目复盘、品牌历程",
    w: "节点间距不均会显得潦草；左右交替时同一侧不要超过两个；日期位置必须对齐竖线",
    m: "Nano Banana Pro / GPT-Image",
  },
  {
    id: "S84", n: "2x2 Matrix", z: "四象限矩阵", c: "信息图", s: 4,
    ae: "2x2 matrix diagram, two crossing axes with labels, four quadrants in distinct muted colors, minimal icons, white space",
    az: "四象限矩阵，横纵两条坐标轴交叉，四个象限用低饱和色区分",
    p: ["#0F172A", "#60A5FA", "#34D399", "#FBBF24"],
    comp: "画面正中十字轴线，四个象限等大，轴线两端留出空白写维度名，四角留白",
    u: "优先级判断、竞品定位、取舍分析",
    w: "象限颜色过多会花；轴线标签位置要留白，不要让字压在色块上",
    m: "Nano Banana Pro / GPT-Image",
  },
  {
    id: "S85", n: "Data Chart", z: "数据图表", c: "信息图", s: 4,
    ae: "clean bar and donut chart infographic, single accent color, grid baseline, no 3D, generous margins, editorial style",
    az: "简洁柱状与环形图表，单一强调色，细网格线，无 3D 效果",
    p: ["#111827", "#22D3EE", "#E5E7EB", "#FB7185"],
    comp: "左侧柱状图占 60%，右侧环形图占 35%，图例在下方横排，四周留出白边",
    u: "数据复盘、增长拆解、行业对比",
    w: "千万不要写具体数字（必乱码），只画图形骨架；3D 柱状图一律不要",
    m: "Nano Banana Pro / GPT-Image｜数字后期标",
  },
  {
    id: "S86", n: "Pyramid", z: "金字塔层级", c: "信息图", s: 4,
    ae: "three tier pyramid diagram, stacked trapezoids, gradient from dark base to light top, labels on right side with dotted leaders",
    az: "三层金字塔，梯形堆叠，底部深色向上渐浅，右侧用虚线引出标签",
    p: ["#1E293B", "#64748B", "#CBD5E1", "#F59E0B"],
    comp: "金字塔居中占画面 55%，右侧留出三块空白分别对准三层，用细虚线连接",
    u: "需求层次、能力模型、价值分层",
    w: "层数超过 4 层会失去「金字塔」的语义；右侧标签区必须留白",
    m: "Nano Banana Pro / GPT-Image",
  },
  {
    id: "S87", n: "Comparison Table", z: "对比表格", c: "信息图", s: 4,
    ae: "two column comparison table, clean rows with hairline dividers, check and cross icons, no grid borders, editorial minimal",
    az: "两列对比表格，细线分隔行，用对勾与叉号图标，无外框",
    p: ["#0F172A", "#E2E8F0", "#4ADE80", "#F87171"],
    comp: "两列等宽并排，每行一条极细横线分隔，行高统一，顶部留出表头区，四周留白",
    u: "方案对比、优缺点、竞品横评",
    w: "表格里绝不写文字（会变乱码），只画行与图标；分隔线要细，粗线会像 Excel",
    m: "Nano Banana Pro / GPT-Image｜文字后期加",
  },
];

const have = new Set(list.map((s) => s.id));
const added = ADD.filter((s) => !have.has(s.id));
list.push(...added);

const out = Array.isArray(raw) ? list : { ...raw, styles: list };
writeFileSync(FILE, JSON.stringify(out, null, 1));

console.log(`新增 ${added.length} 条：${added.map((s) => s.id + " " + s.z).join(" / ")}`);
console.log(`总数 ${list.length}，大类 ${[...new Set(list.map((s) => s.c))].length} 个`);
console.log("新大类：信息图", list.filter((s) => s.c === "信息图").length, "条");
