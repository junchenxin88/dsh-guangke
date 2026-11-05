// 加智谱 CogView（免费，但右下角水印关不掉）作为第四个 provider，
// 顺带修两件事：智谱只认 7 个固定尺寸要映射；它返回的是 jpeg 不能硬存 .png。
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/index.js";
let s = readFileSync(P, "utf8");
const log = [];
function sub(n, a, b) {
  if (!s.includes(a)) {
    log.push("❌ " + n);
    return;
  }
  s = s.replace(a, b);
  log.push("✅ " + n);
}

/* 1. provider 表加 zhipu */
sub(
  "PROVIDERS 加 zhipu",
  `  custom: {`,
  `  zhipu: {
    label: "智谱 · CogView（免费）",
    hint: "不用充值，但右下角固定有「AI生成」水印，关不掉。要干净底图就后期裁掉右下角（x>80%、y>88% 那块），或者用百炼。",
    proto: "openai",
    base: "https://open.bigmodel.cn/api/paas/v4",
    model: "cogview-3-flash",
    keyEnv: "ZHIPU_API_KEY",
  },
  custom: {`
);

/* 2. 智谱尺寸映射 */
sub(
  "智谱尺寸映射函数",
  "function stamp() {",
  `// 智谱只认这 7 个尺寸，给别的会报错；按宽高比挑最接近的一个
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

function stamp() {`
);

/* 3. 请求时替换尺寸 */
sub(
  "openai 分支用映射尺寸",
  `      size: \`\${u.w}x\${u.h}\`,`,
  `      size: pid === "zhipu" ? nearestZhipuSize(u.w, u.h) : \`\${u.w}x\${u.h}\`,`
);

/* 4. 按真实格式存盘 */
sub(
  "按 magic 定扩展名",
  `  const name = \`\${stamp()}-\${style.id}-\${slug(topic)}.png\`;`,
  `  // 智谱返回的是 jpeg，硬存 .png 会让看图工具报格式不符
  const ext = buf[0] === 0xff && buf[1] === 0xd8 ? "jpg" : "png";
  const name = \`\${stamp()}-\${style.id}-\${slug(topic)}.\${ext}\`;`
);

writeFileSync(P, s);
console.log(log.join("\n"));
