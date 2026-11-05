// 补「风格预览图」用的提示词拼装。
// 主体固定成同一只猫，风格差异才比得出来——换主体就没法横向比了。
export const THUMB_SUBJECT = "一只猫坐在窗台上，窗外是夜晚的城市灯光";

/**
 * @param {object} st styles.json 里的一条
 * @param {(p: string[]) => string} colorWords 把色板翻成中文颜色词（由 index.js 注入）
 */
export function thumbPrompt(st, colorWords) {
  // 构图里凡是带「留给标题」的字样，qwen-image 会真的画一行字出来，先削掉
  const comp = String(st.comp || "").replace(
    /[，、]?\s*(?:留给|留|放|压|写|给)?标题(?:留上方\s*\d+%|上方\s*\d+%)?/g,
    ""
  );
  const colors = colorWords(st.p || []);
  return [
    `${st.z}风格插画。`,
    `画面主体：${THUMB_SUBJECT}。`,
    comp ? `构图：${comp}。` : "",
    colors ? `配色：${colors}。` : "",
    "方形构图。",
    "画面纯净，只有画面元素本身，没有任何排版元素、符号标记或标识牌。物体表面保持纯材质纹理，不刻字、不放标签。",
  ]
    .filter(Boolean)
    .join("");
}
