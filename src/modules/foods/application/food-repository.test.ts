// @vitest-environment node

import { describe, expect, it } from "vitest";

import { InMemoryFoodRepository } from "@/modules/foods/application/food-repository";
import { TEST_ONLY_DRAFT_FOOD, TEST_ONLY_PUBLISHED_FOOD } from "@/modules/foods/testing/test-food";

describe("FoodRepository 게시 경계", () => {
  const repository = new InMemoryFoodRepository([TEST_ONLY_DRAFT_FOOD, TEST_ONLY_PUBLISHED_FOOD]);

  it("목록과 상세에서 미게시 데이터를 차단한다", async () => {
    await expect(repository.listPublished({ limit: 20 })).resolves.toMatchObject({
      items: [{ id: TEST_ONLY_PUBLISHED_FOOD.id }],
      total: 1,
    });
    await expect(repository.findPublishedById(TEST_ONLY_DRAFT_FOOD.id)).resolves.toBeNull();
  });

  it("한국어 이름을 검색한다", async () => {
    const result = await repository.listPublished({ q: "운영 사용 금지", limit: 20 });
    expect(result.items).toHaveLength(1);
  });
});
