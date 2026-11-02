import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const directory = resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? "3000");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const requestedPath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  let filePath = resolve(directory, `.${requestedPath}`);

  if (filePath !== directory && !filePath.startsWith(`${directory}${sep}`)) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("잘못된 요청이에요.");
    return;
  }

  try {
    if (statSync(filePath).isDirectory()) filePath = resolve(filePath, "index.html");
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("페이지를 찾을 수 없어요.");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`정적 미리보기: http://127.0.0.1:${port}`);
});
