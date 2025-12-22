// scripts/download_picsum.js
// 用法：node scripts/download_picsum.js guess 50 12
//       参数1=feedName(比如 guess) 参数2=pages(页数) 参数3=perPage(每页张数)

import fs from "fs";
import path from "path";

const feedName = process.argv[2] || "guess";
const pages = Number(process.argv[3] || 50);
const perPage = Number(process.argv[4] || 12);

// ✅ 这里改成你的静态资源根目录（常见：public 或者 src/assets 由构建复制）
// 如果你是 express 静态托管 public，那就用 public
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const OUT_DIR = path.join(PUBLIC_DIR, "images", "picsum", feedName);

// 头像也存一份（可选）
const AVATAR_DIR = path.join(PUBLIC_DIR, "images", "picsum", "avatar", feedName);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Node18+ 自带 fetch；如果你 Node < 18，先升级或装 node-fetch
async function downloadToFile(url, filepath) {
  // 已存在就跳过
  if (fs.existsSync(filepath)) return { ok: true, skipped: true };

  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(filepath, buf);
  return { ok: true, skipped: false };
}

// 简单并发池
async function runPool(tasks, concurrency = 12) {
  let idx = 0;
  let ok = 0, fail = 0, skip = 0;

  const workers = new Array(concurrency).fill(0).map(async () => {
    while (idx < tasks.length) {
      const t = tasks[idx++];
      try {
        const r = await t();
        ok++;
        if (r?.skipped) skip++;
      } catch (e) {
        fail++;
        console.error("❌", e.message);
      }
    }
  });

  await Promise.all(workers);
  return { ok, fail, skip, total: tasks.length };
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(AVATAR_DIR);

  const tasks = [];

  for (let page = 1; page <= pages; page++) {
    for (let i = 1; i <= perPage; i++) {
      // 主图：400x400
      const seed = `${feedName}-${page}-${i}`;
      const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400`;
      const filepath = path.join(OUT_DIR, `${seed}.jpg`);

      tasks.push(() => downloadToFile(url, filepath));

      // 头像：80x80（可选：你代码里头像是 /80/80）
      const avSeed = `avatar-${seed}`;
      const avUrl = `https://picsum.photos/seed/${encodeURIComponent(avSeed)}/80/80`;
      const avPath = path.join(AVATAR_DIR, `${avSeed}.jpg`);

      tasks.push(() => downloadToFile(avUrl, avPath));
    }
  }

  const r = await runPool(tasks, 16);
  console.log("✅ done:", r);
  console.log("OUT_DIR:", OUT_DIR);
  console.log("AVATAR_DIR:", AVATAR_DIR);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
