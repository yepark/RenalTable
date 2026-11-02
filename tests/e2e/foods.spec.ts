import { expect, test } from "@playwright/test";

test("음식 검색은 한국어 빈 상태와 공개 데이터 경계를 안내한다", async ({ page }) => {
  await page.goto("/foods");

  await expect(page.getByRole("heading", { name: "음식 정보 찾기" })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByRole("heading", { name: "표시할 음식 정보가 없어요" })).toBeVisible();
  await expect(page.getByText("검토 후 게시된 음식 데이터가 아직 없어요.")).toBeVisible();

  await page.getByLabel("음식 이름").fill("테스트");
  await page.getByRole("button", { name: "검색" }).click();
  await expect(page).toHaveURL(/\/foods\?q=/);
  await expect(page.getByText(/검토 후 게시된 데이터만 검색 결과에 표시해요/)).toBeVisible();
});
