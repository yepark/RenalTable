import { expect, test } from "@playwright/test";

test("모바일 홈에서 핵심 안내와 키보드 이동을 제공하고 외부로 데이터를 보내지 않는다", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  const browserErrors: string[] = [];
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "renaltable.profile.v1",
      JSON.stringify({
        schemaVersion: 1,
        savedAt: "2026-11-01T00:00:00.000Z",
        value: {
          treatmentMode: "unset",
          allergies: [],
          excludedIngredients: [],
          nutritionTargets: [],
        },
      }),
    );
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3000") externalRequests.push(request.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.goto("/");

  await expect(page).toHaveTitle(/RenalTable/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "식사 정보를 차분하게 확인하세요",
  );
  await expect(page.getByText("의료진의 진료와 상담을 대신하지 않아요.")).toBeVisible();
  await expect(page.getByText("정보 없음", { exact: true })).toBeVisible();

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문으로 바로가기" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  expect(externalRequests).toEqual([]);
  expect(browserErrors).toEqual([]);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("renaltable.profile.v1")))
    .not.toBeNull();
});

test("200% 확대에서도 가로 스크롤 없이 핵심 내용을 읽을 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "200%";
  });

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
