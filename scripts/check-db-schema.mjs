import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function drizzleStatus() {
  const result = spawnSync("git", ["status", "--porcelain", "--", "drizzle"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    console.error("데이터베이스 마이그레이션 상태를 확인하지 못했어요.");
    process.exit(1);
  }
  return result.stdout;
}

const before = drizzleStatus();
const generate = spawnSync(npmCommand, ["run", "db:generate"], { stdio: "inherit" });
if (generate.status !== 0) process.exit(generate.status ?? 1);

if (drizzleStatus() !== before) {
  console.error("Drizzle schema와 migration이 일치하지 않아요. 생성된 변경을 검토해 주세요.");
  process.exit(1);
}

console.log("Drizzle schema와 migration이 일치해요.");
