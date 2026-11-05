// 追加「图文版式」与「编辑设计」两个大类共 20 条——小红书/B站图文里真正在用的那些。
// 这批和纯插画的区别：它们自带「文字容器」（便签、卡片、气泡、分屏）或「留白结构」，
// 所以 comp 里必须写清楚空白区在哪。但绝不能出现「标题/字/文案」这些词——
// qwen-image 看到这些词会直接在图上画字（实测过，写"不要文字"也压不住）。
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/data/styles.json";
const raw = JSON.parse(readFileSync(P, "utf8"));
const list = Array.isArray(raw) ? raw : raw.styles;

if (list.some((s) => s.id === "S62")) {
  console.log("已追加过，跳过");
  process.exit(0);
}

copyFileSync(P, P.replace(".json", ".backup-61.json"));

const BLANK = "大面积干净的低细节区域";

const NEW = [
  /* ---------- 图文版式：自带容器，适合放字 ---------- */
  {
    id: "S62", z: "清单大字", n: "Big Type List Cover", c: "图文版式", s: 4,
    az: "纯色或极浅渐变背景，画面被一条水平线分成上下两块，上块完全空白，下块只有一个极简的主视觉物件",
    ae: "flat solid background split by one horizontal line, empty upper block, single minimal object in lower block, generous negative space, no texture",
    p: ["#F7F3EC", "#E8DFD2", "#1F1D1B", "#D9622B"],
    comp: "画面被水平线分成上下两块，上半区完全留空（约占 45%），下半区只放一个极简物件，四边留出均匀白边",
    u: "工具合集、步骤教程、知识总结类封面",
    w: "模型爱把装饰铺满整张——必须写明上半区完全留空；也不能画成海报，它就是一张干净的底，字是后加的",
    m: "nano-banana / gpt-image",
  },
  {
    id: "S63", z: "手绘便签", n: "Sticky Note Doodle", c: "图文版式", s: 3,
    az: "米白纸张底，几张圆角便签斜着叠放，边缘贴一段半透明胶带，旁边散落手绘箭头和小涂鸦",
    ae: "cream paper background, a few rounded sticky notes stacked at slight angles, a strip of translucent washi tape, hand-drawn arrows and tiny doodles scattered around, soft drop shadows",
    p: ["#FBF6EA", "#F2C94C", "#F7A8B8", "#7FB8A4", "#3D3A35"],
    comp: "便签集中在中部偏右，左侧和上方留出整片干净纸面，便签之间错落叠压、投影很淡",
    u: "学习笔记、入门教程、手账风产品种草",
    w: "便签上会被模型自动补字——一定要在负面里强调表面是纯色纸；涂鸦别超过 5 个，多了就脏",
    m: "nano-banana / gpt-image",
  },
  {
    id: "S64", z: "备忘录界面", n: "Notes App Screen", c: "图文版式", s: 4,
    az: "浅黄色纸张质感，顶部一条细分隔线，正文区是等宽排版的短横线占位块，整体像手机备忘录截图",
    ae: "pale yellow paper texture, thin divider line at top, monospaced placeholder lines in body area, flat UI screenshot feel, no device frame",
    p: ["#FDF6D8", "#F5E9B8", "#8A7F55", "#FFFFFF"],
    comp: "整张就是一块纸面，顶部 12% 是标题带，正文区排着若干条短横线占位块，四周留白均匀",
    u: "经验分享、避坑清单、口播稿截图感",
    w: "横线占位块是示意，不是真字——模型会把它们画成乱码字符，负面里必须压掉；不要画手机外框",
    m: "gpt-image",
  },
  {
    id: "S65", z: "聊天记录", n: "Chat Bubbles", c: "图文版式", s: 4,
    az: "纯色背景上悬浮两组对话气泡，左灰右绿，气泡里只有色块占位，没有真文字，气泡带圆角和小尾巴",
    ae: "flat background with two groups of floating chat bubbles, light grey on the left and mint green on the right, rounded corners with small tails, empty placeholder blocks inside, soft shadow",
    p: ["#EDEDED", "#FFFFFF", "#95EC69", "#2B2B2B"],
    comp: "气泡从左上到右下斜着排开，四周留出大片纯色背景，气泡之间留呼吸间距",
    u: "对话体干货、案例复盘、观点对撞",
    w: "气泡里会被塞满乱码字——必须写气泡内是空白色块；气泡别超过 5 个，多了就乱",
    m: "gpt-image",
  },
  {
    id: "S66", z: "左右对比", n: "Split Comparison", c: "图文版式", s: 3,
    az: "画面正中被一条细线竖直切开，左半边冷灰调、右半边暖亮调，两侧各有一个同构的极简主体",
    ae: "canvas split vertically by a thin line, cold grey palette on the left half, warm bright palette on the right half, one minimal subject mirrored on each side, flat lighting",
    p: ["#D9DEE3", "#8FA3B0", "#FFE9C7", "#F2994A"],
    comp: "正中竖线一分为二，两侧主体同位置同大小，各自在角上留出干净空白",
    u: "前后对比、错误vs正确、痛点vs爽点",
    w: "两侧必须同构，否则看着不像对比；模型容易把两边画成两张不同的画，要强调 mirrored composition",
    m: "nano-banana",
  },
  {
    id: "S67", z: "数字清单", n: "Numbered List", c: "图文版式", s: 3,
    az: "浅色背景上竖排四个超大阿拉伯数字色块，每个数字右侧跟一条短横线占位，数字是主体",
    ae: "light background, four oversized numerals stacked vertically as color blocks, a short placeholder bar to the right of each numeral, numerals as the hero, flat design",
    p: ["#FFFFFF", "#111111", "#FF5A5F", "#2D9CDB", "#F2C94C"],
    comp: "数字竖排占画面中间 70%，左右两侧留出窄边，底部留出一条干净横带",
    u: "步骤拆解、排行榜、干货清单",
    w: "数字是唯一允许出现的字符——但模型会把右侧占位条也画成乱码，要写明占位条是纯色矩形",
    m: "gpt-image",
  },
  {
    id: "S68", z: "拍立得拼贴", n: "Polaroid Collage", c: "图文版式", s: 4,
    az: "米色桌面上斜放着三张白色边框的拍立得相纸，互相叠压，边角贴纸胶带，投影柔和",
    ae: "beige tabletop, three polaroid prints with thick white borders overlapping at angles, washi tape on corners, soft natural shadows, film grain",
    p: ["#EFE7DA", "#FFFFFF", "#C9B79C", "#8E7C68"],
    comp: "三张相纸错落叠在画面中部，四周露出桌面，右上角留出整块干净区域",
    u: "旅行、穿搭、好物、生活记录",
    w: "相纸白边里会被补字——强调白色边框是纯白的、没有印刷内容；三张足够，五张就糊",
    m: "nano-banana",
  },
  {
    id: "S69", z: "知识卡片", n: "Knowledge Card", c: "图文版式", s: 3,
    az: "浅灰背景正中一张大圆角白卡，卡内顶部一个圆形图标、中部三条圆角横条占位、右下角一个小色块编号",
    ae: "light grey background, one large rounded white card centered, a circular icon at the card top, three rounded placeholder bars in the middle, a small color chip at the bottom right, soft shadow",
    p: ["#F5F5F7", "#FFFFFF", "#4A90D9", "#F5A623"],
    comp: "白卡占画面 68%，居中，四周留均匀灰边，卡内元素之间留足呼吸空间",
    u: "干货卡片、方法论拆解、系列图统一视觉",
    w: "卡内横条是示意不是字；别加多余插图，一张卡只讲一件事",
    m: "gpt-image",
  },
  {
    id: "S70", z: "环形标注", n: "Radial Callout", c: "图文版式", s: 3,
    az: "中心一个极简主体，四周环绕细线引出的圆形节点，节点内是纯色小圆点，整体像科普信息图的骨架",
    ae: "one minimal subject at center, thin radial lines leading to circular nodes around it, each node holding a small solid dot, clean infographic skeleton, white background",
    p: ["#FFFFFF", "#1A1A1A", "#E85D4A", "#3E7CB1"],
    comp: "主体在正中占 30%，环形节点均匀分布在外圈，节点之间留大片空白",
    u: "原理科普、结构拆解、产品卖点",
    w: "节点内会被补字——写明节点是纯色圆点；引线要细，粗了就变成箭头图",
    m: "gpt-image",
  },
  {
    id: "S71", z: "实景涂鸦", n: "Photo Doodle Overlay", c: "图文版式", s: 4,
    az: "真实场景照片上叠加白色手绘线条，圈出重点、拉出箭头、画几个小星星和波浪线，像用马克笔在照片上标注",
    ae: "real photograph with white hand-drawn marker annotations on top, circles around key areas, arrows, small stars and squiggles, slightly imperfect strokes",
    p: ["#7A6A58", "#FFFFFF", "#FFD84D"],
    comp: "照片占满画面，手绘标注集中在主体周围，画面上方或一角留出没有标注的干净区域",
    u: "产品实拍标注、教程步骤、探店",
    w: "手绘线条要少而准，超过 6 处就成涂鸦墙；线条不能写字，只能是圈、箭头、波浪",
    m: "nano-banana",
  },
  {
    id: "S72", z: "九宫格拼图", n: "Grid Collage", c: "图文版式", s: 3,
    az: "画面被等分成九个方格，格与格之间 6px 白缝，每格是一块纯色或极简图形，整体像相册缩略墙",
    ae: "canvas evenly divided into nine tiles with thin white gutters, each tile a flat color or a single minimal shape, clean grid, no border radius",
    p: ["#FFFFFF", "#F2B5A7", "#A8C8C0", "#F5E6A8", "#8E9AAF"],
    comp: "严格九宫格等分，白缝均匀，视觉重心可以放在中心格",
    u: "合集、多图预告、清单九图",
    w: "格子必须严格等大，模型爱画出大小不一；别在格子里放细节，一格一个色块就够",
    m: "gpt-image",
  },

  /* ---------- 编辑设计：靠配色和版式气质取胜 ---------- */
  {
    id: "S73", z: "酸性设计", n: "Acid Graphic", c: "编辑设计", s: 4,
    az: "高饱和荧光渐变背景，扭曲的液态金属立体形，细密网格线叠加，整体刺眼又前卫",
    ae: "high saturation fluorescent gradient background, twisted liquid chrome 3D shapes, fine grid lines overlaid, acid graphic style, chrome reflections, high contrast",
    p: ["#C6FF00", "#FF00A8", "#00E5FF", "#0A0A0A"],
    comp: "主体立体形居中偏下，背景渐变压满，网格线极淡地铺一层，四周留出暗角",
    u: "潮牌、音乐、年轻化活动",
    w: "荧光色一多就脏——只留两个荧光加一个黑；网格线要压到 20% 透明度，否则抢戏",
    m: "seedream / mj",
  },
  {
    id: "S74", z: "瑞士国际主义", n: "Swiss International", c: "编辑设计", s: 4,
    az: "纯白背景，严格网格对齐的几何色块与细线，无衬线黑体感，大量留白，冷静克制",
    ae: "pure white background, strictly grid-aligned geometric color blocks and hairlines, grotesque sans-serif sensibility, massive negative space, restrained and clinical",
    p: ["#FFFFFF", "#111111", "#E63946", "#457B9D"],
    comp: "以 12 栏网格为骨架，色块只占其中几栏，其余全部留白，视觉重量压在左下或右上",
    u: "品牌、B端、严肃内容、高端感",
    w: "留白必须真的空，模型会忍不住加细节；颜色只用一到两个，多一个就俗",
    m: "mj / gpt-image",
  },
  {
    id: "S75", z: "包豪斯几何", n: "Bauhaus Geometry", c: "编辑设计", s: 5,
    az: "红黄蓝三原色加黑，圆形三角形矩形互相咬合，平涂无渐变，构图严谨",
    ae: "primary red yellow blue plus black, interlocking circles triangles and rectangles, flat color without gradients, bauhaus poster composition, geometric precision",
    p: ["#D62828", "#F7B801", "#1D3557", "#111111", "#F1FAEE"],
    comp: "基本形沿对角线或中心轴咬合，色块之间留 2~3 处干净缝隙，底部留一条横带",
    u: "文化、设计、教育、海报感强的封面",
    w: "绝对不能有渐变和投影，一有就变塑料；三原色比例失衡会土，主色占 60% 才稳",
    m: "mj / gpt-image",
  },
  {
    id: "S76", z: "双色调", n: "Duotone", c: "编辑设计", s: 5,
    az: "整幅只用两种颜色套印，暗部一色亮部一色，中间调由网点过渡，像老式印刷",
    ae: "two-color duotone print, shadows in one hue and highlights in another, halftone dots in the midtones, silkscreen printing feel, no full color",
    p: ["#0B1D3A", "#F25F5C", "#F6F7EB"],
    comp: "主体剪影化处理，占到画面 70%，背景纯色，边缘留出窄白边",
    u: "情绪类、人物、书影音、高级感封面",
    w: "一定要「只有两个颜色」，模型会偷偷加第三色；网点要细，粗了像旧报纸",
    m: "mj / seedream",
  },
  {
    id: "S77", z: "莫兰迪灰调", n: "Morandi Muted", c: "编辑设计", s: 5,
    az: "低饱和灰粉灰绿灰蓝堆叠，柔光，没有纯黑纯白，整体像蒙了一层灰雾",
    ae: "desaturated dusty pink sage and slate blue layered together, soft diffused light, no pure black or pure white, muted film grade, gentle contrast",
    p: ["#C9BDB4", "#A8B5A2", "#8E9BAE", "#E5DED6"],
    comp: "大面积色块平铺，主体占比小、位置偏一侧，另一侧留整片灰调空白",
    u: "生活方式、家居、护肤、文艺内容",
    w: "最怕被模型加饱和度——必须写 no pure black or pure white；颜色超过四种就乱",
    m: "seedream / mj",
  },
  {
    id: "S78", z: "多巴胺撞色", n: "Dopamine Color Block", c: "编辑设计", s: 4,
    az: "高饱和的橙粉黄蓝四色大色块硬边拼接，明快刺眼，没有渐变没有阴影",
    ae: "large hard-edged color blocks in saturated orange pink yellow and blue, flat fill, no gradient no shadow, playful and loud, crisp edges",
    p: ["#FF6B35", "#FF3E8E", "#FFD23F", "#3B8BD4"],
    comp: "色块按几何形状拼贴占满画面，交界处留细白缝，中部可以留一块纯色当视觉落点",
    u: "年轻向、活动、促销、情绪内容",
    w: "撞色不等于乱配色——最多四色且要有一个主角占 50%；别加描边，一加就变儿童画",
    m: "mj",
  },
  {
    id: "S79", z: "奶油风", n: "Creamy Soft", c: "编辑设计", s: 4,
    az: "米白奶油底色，圆润的软几何体，柔光打在正面，边缘有一点点暖色反光，安静柔软",
    ae: "creamy off-white base, rounded soft geometric volumes, frontal soft light, faint warm bounce on edges, matte surface, extremely gentle contrast",
    p: ["#FBF3E9", "#F0DCC4", "#E0BFA0", "#C89B76"],
    comp: "主体偏右下，左上方留出整片奶油色空白，投影极淡且柔和",
    u: "母婴、家居、烘焙、温柔系内容",
    w: "容易糊成一片——必须给一点明暗对比，但要写 no hard shadow；别加高光，一加就油",
    m: "seedream / nano-banana",
  },
  {
    id: "S80", z: "复古胶片", n: "Vintage Film", c: "编辑设计", s: 4,
    az: "明显颗粒感，略微褪色的暖调，四角暗角，右上角有一道极淡的漏光",
    ae: "visible film grain, slightly faded warm grade, heavy vignette, faint light leak in the top right corner, 35mm analog feel, soft halation",
    p: ["#B08968", "#E6D5B8", "#5C4033", "#F1E9DA"],
    comp: "主体居中略偏左，暗角吃掉四边，漏光只占右上角一小块",
    u: "怀旧、旅行、生活方式、个人故事",
    w: "颗粒要细密均匀，粗了就成噪点图；漏光别超过画面 8%，多了像曝光失误",
    m: "seedream / mj",
  },
  {
    id: "S81", z: "手绘信息图", n: "Sketch Notes", c: "编辑设计", s: 4,
    az: "暖米色纸底，黑色手绘细线勾出圆角分区框，框内是柔和的粉彩色块，散布很小的手绘图标",
    ae: "warm cream paper, black hand-drawn thin lines forming rounded section boxes, soft pastel color blocks inside, tiny hand-drawn icons scattered, sketch-notes infographic, neat handwriting feel without any letters",
    p: ["#FAF3E0", "#2B2B2B", "#F4C7C3", "#B5D8CC", "#F7E1A0"],
    comp: "画面被手绘框分成 3~4 个区块，区块之间留手绘虚线间隔，四周留出纸边",
    u: "知识科普、方法论、课程笔记、干货长图",
    w: "最容易翻车的一类：模型会往框里塞乱码字——必须写明框内是纯色块；线条要细，粗了就变漫画",
    m: "nano-banana / gpt-image",
  },
];

for (const s of NEW) list.push(s);

const out = Array.isArray(raw) ? list : { ...raw, styles: list, note: (raw.note || "") + " | 2026-11-06 追加图文版式与编辑设计 20 条" };
writeFileSync(P, JSON.stringify(out, null, 2));

const by = {};
for (const s of list) by[s.c] = (by[s.c] || 0) + 1;
console.log("总数:", list.length);
console.log(by);
console.log("新增大类:", ["图文版式", "编辑设计"].map((c) => `${c} ${by[c]} 条`).join(" / "));
