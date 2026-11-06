// 一条命令完成发布：建 GitHub 仓库 → push → npm publish。
// 用法（token 只走环境变量，不落盘）：
//   GITHUB_TOKEN=ghp_xxx NPM_TOKEN=npm_xxx node scripts/publish.mjs [owner/repo]
//
// 如果只想做其中一步：
//   node scripts/publish.mjs --npm-only
//   node scripts/publish.mjs --gh-only
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(dirname(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const npmOnly = argv.includes("--npm-only");
const ghOnly = argv.includes("--gh-only");
const repoArg = argv.find((a) => a.includes("/") && !a.startsWith("--"));

const pkg = JSON.parse(readFileSync(join(HERE, "package.json"), "utf8"));
const GH = process.env.GITHUB_TOKEN || "";
const NPM = process.env.NPM_TOKEN || "";

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: HERE, stdio: "inherit", ...opts });
}

function step(msg) {
  console.log(`\n=== ${msg} ===`);
}

// ---- 1. GitHub ----
if (!npmOnly) {
  if (!GH) {
    console.log("跳过 GitHub：没有 GITHUB_TOKEN（要 repo 权限）。");
  } else {
    step("GitHub：确认/创建仓库");
    const me = await (
      await fetch("https://api.github.com/user", {
        headers: { authorization: `Bearer ${GH}`, "user-agent": "dsh-guangke" },
      })
    ).json();
    if (!me.login) {
      console.error("token 无效：", JSON.stringify(me).slice(0, 200));
      process.exit(1);
    }
    const name = repoArg ? repoArg.split("/")[1] : pkg.name;
    const owner = repoArg ? repoArg.split("/")[0] : me.login;

    const check = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { authorization: `Bearer ${GH}`, "user-agent": "dsh-guangke" },
    });
    if (check.status === 404) {
      const made = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          authorization: `Bearer ${GH}`,
          "user-agent": "dsh-guangke",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: pkg.description,
          private: false,
          has_issues: true,
          has_wiki: false,
        }),
      });
      console.log(made.status === 201 ? `已创建 ${owner}/${name}` : `创建失败 ${made.status}`);
      if (made.status !== 201) console.log((await made.text()).slice(0, 300));
    } else {
      console.log(`仓库已存在：${owner}/${name}`);
    }

    step("git push");
    const remote = `https://x-access-token:${GH}@github.com/${owner}/${name}.git`;
    try {
      run("git", ["remote", "remove", "origin"]);
    } catch {}
    run("git", ["remote", "add", "origin", remote]);
    run("git", ["push", "-u", "origin", "HEAD:main", "--force"]);
    // 不把带 token 的 remote 留在仓库里
    try {
      run("git", ["remote", "set-url", "origin", `https://github.com/${owner}/${name}.git`]);
    } catch {}

    // project.json 里补 repository（npm 页面显示源码链接）
    if (!pkg.repository) {
      pkg.repository = { type: "git", url: `git://github.com/${owner}/${name}.git` };
      pkg.homepage = `https://github.com/${owner}/${name}#readme`;
      writeFileSync(join(HERE, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
      run("git", ["add", "package.json"]);
      run("git", ["commit", "-m", "chore: 补 repository / homepage"]);
      run("git", ["push"]);
      console.log("已补 repository 字段并推送。");
    }
  }
}

// ---- 2. npm ----
if (!ghOnly) {
  if (!NPM) {
    console.log("跳过 npm：没有 NPM_TOKEN（Automation 类型，publish 权限）。");
  } else {
    step("npm publish");
    const rc = join(HERE, ".npmrc");
    const hadRc = existsSync(rc);
    const backup = hadRc ? readFileSync(rc, "utf8") : null;
    writeFileSync(rc, `//registry.npmjs.org/:_authToken=${NPM}\n`);
    try {
      run("npm", ["publish", "--access", "public"]);
    } finally {
      if (backup !== null) writeFileSync(rc, backup);
      else if (existsSync(rc)) unlinkSync(rc);
    }
    console.log(`\n已发布 ${pkg.name}@${pkg.version}`);
    console.log(`验证：npm view ${pkg.name} version`);
  }
}

step("下一步：上架插件市场");
console.log(`市场索引来自 https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
条目已备好：.publish/catalog-entry.json（把 OWNER 换成你的 GitHub 用户名）
去那里开 PR，加一行；站点与市场通常一天内自动收录。`);
