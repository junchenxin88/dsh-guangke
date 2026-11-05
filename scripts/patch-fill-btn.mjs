// 设置面板加「补齐预览图」按钮
import { readFileSync, writeFileSync } from "node:fs";

const P = "D:/AI/workspace-d/forge-studio/client.js";
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

sub(
  "filling 状态",
  "      const [testing, setTesting] = useState(false);",
  "      const [testing, setTesting] = useState(false);\n      const [filling, setFilling] = useState(false);"
);

sub(
  "fillThumbs 函数",
  "      const saveSet = async () => {",
  `      const missingThumbs = (cfg?.styles || []).filter((x) => x.thumb === false).length;

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
            text: j.fail && j.fail.length ? \`补了 \${j.made} 张，\${j.fail[0]}\` : \`补完了 \${j.made} 张\`,
          });
        } catch (e) {
          if (alive.current) setTestMsg({ ok: false, text: String(e.message || e) });
        } finally {
          if (alive.current) setFilling(false);
        }
      };

      const saveSet = async () => {`
);

sub(
  "补图按钮",
  `                  h(
                    "button",
                    { className: "fs-primary", style: { padding: "7px 18px", fontSize: "12.5px" }, onClick: saveSet },
                    "保存"
                  ),`,
  `                  h(
                    "button",
                    { className: "fs-primary", style: { padding: "7px 18px", fontSize: "12.5px" }, onClick: saveSet },
                    "保存"
                  ),
                  missingThumbs > 0
                    ? h(
                        "button",
                        { className: "fs-ghost", onClick: fillThumbs, disabled: filling },
                        filling ? "正在补…" : \`补齐预览图（缺 \${missingThumbs} 张）\`
                      )
                    : null,`
);

writeFileSync(P, s);
console.log(log.join("\n"));
