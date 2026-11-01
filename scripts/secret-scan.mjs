import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "utf8",
});

if (listed.status !== 0) {
  console.error("검사할 파일 목록을 읽지 못했어요.");
  process.exit(1);
}

const patterns = [
  { name: "개인 키", expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS 접근 키", expression: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub 토큰", expression: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  {
    name: "일반 비밀값 할당",
    expression: /(?:api[_-]?key|secret|token)\s*[=:]\s*["'][^"']{12,}["']/i,
  },
];

const findings = [];
for (const file of listed.stdout.split("\0").filter(Boolean)) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (content.includes("\0")) continue;

  for (const pattern of patterns) {
    if (pattern.expression.test(content)) findings.push(`${file}: ${pattern.name} 의심 패턴`);
  }
}

if (findings.length > 0) {
  console.error("비밀값으로 의심되는 내용을 확인해 주세요:\n" + findings.join("\n"));
  process.exit(1);
}

console.log("비밀값 의심 패턴이 없어요.");
