// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { createGetFoodHandler } from "@/app/api/foods/[id]/route";
import { createListFoodsHandler } from "@/app/api/foods/route";
import { InMemoryFoodRepository } from "@/modules/foods/application/food-repository";
import { TEST_ONLY_DRAFT_FOOD, TEST_ONLY_PUBLISHED_FOOD } from "@/modules/foods/testing/test-food";

describe("GET /api/foods 계약", () => {
  const repository = new InMemoryFoodRepository([TEST_ONLY_DRAFT_FOOD, TEST_ONLY_PUBLISHED_FOOD]);

  it("게시된 데이터만 반환하고 MISSING을 0으로 직렬화하지 않는다", async () => {
    const response = await createListFoodsHandler(repository)(
      new NextRequest("http://localhost/api/foods?q=운영&limit=20"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe(TEST_ONLY_PUBLISHED_FOOD.id);
    expect(body.items[0].nutrients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nutrientCode: "SODIUM", amount: 0, status: "PRESENT" }),
        expect.objectContaining({ nutrientCode: "POTASSIUM", amount: null, status: "MISSING" }),
      ]),
    );
  });

  it("잘못된 조회 조건은 한국어 400 오류를 반환한다", async () => {
    const response = await createListFoodsHandler(repository)(
      new NextRequest(`http://localhost/api/foods?q=${"가".repeat(81)}`),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_INPUT", message: "요청 값을 확인해 주세요." },
    });
  });

  it("상세에서도 미게시 데이터를 404로 차단한다", async () => {
    const response = await createGetFoodHandler(repository)(new Request("http://localhost"), {
      params: Promise.resolve({ id: TEST_ONLY_DRAFT_FOOD.id }),
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "FOOD_NOT_FOUND", message: "음식 정보를 찾을 수 없어요." },
    });
  });
});
