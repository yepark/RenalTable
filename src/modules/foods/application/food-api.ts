import { z } from "zod";

import type { FoodRepository } from "@/modules/foods/application/food-repository";
import type { Food, FoodNutrient } from "@/modules/foods/domain/food";

const listQuerySchema = z.object({
  q: z.string().trim().max(80, "검색어는 80자 이하로 입력해 주세요.").optional(),
  category: z.string().trim().max(40, "분류는 40자 이하로 입력해 주세요.").optional(),
  cursor: z
    .string()
    .regex(/^[A-Za-z0-9_-]+$/, "페이지 정보를 확인해 주세요.")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const idSchema = z.string().uuid("음식 ID 형식을 확인해 주세요.");

export async function listFoods(
  repository: FoodRepository,
  input: Record<string, string | undefined>,
) {
  const parsed = listQuerySchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const result = await repository.listPublished({
    limit: parsed.data.limit,
    ...(parsed.data.q !== undefined ? { q: parsed.data.q } : {}),
    ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
    ...(parsed.data.cursor !== undefined ? { cursor: parsed.data.cursor } : {}),
  });
  return {
    ok: true as const,
    status: 200,
    body: {
      items: result.items.map(toFoodListItem),
      nextCursor: result.nextCursor,
      total: result.total,
    },
  };
}

export async function getFood(repository: FoodRepository, id: string) {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return invalidInput(parsed.error);
  const food = await repository.findPublishedById(parsed.data);
  if (!food) {
    return {
      ok: false as const,
      status: 404,
      body: { error: { code: "FOOD_NOT_FOUND", message: "음식 정보를 찾을 수 없어요." } },
    };
  }
  return { ok: true as const, status: 200, body: toFoodDetail(food) };
}

export function toFoodListItem(food: Food) {
  return {
    id: food.id,
    name: food.canonicalNameKo,
    category: food.categoryCode,
    basis: food.defaultBasis,
    nutrients: food.nutrients.map(toNutrientResponse),
    sources: food.sources,
  };
}

function toFoodDetail(food: Food) {
  return {
    ...toFoodListItem(food),
    foodKind: food.foodKind,
    preparationState: food.preparationState,
    publishedAt: food.publishedAt,
  };
}

function toNutrientResponse(nutrient: FoodNutrient) {
  return {
    nutrientCode: nutrient.nutrientCode,
    amount: nutrient.status === "PRESENT" ? nutrient.amount : null,
    unit: nutrient.unit,
    basis: nutrient.basis,
    status: nutrient.status,
    displayText: nutrient.displayText,
    sourceId: nutrient.sourceId,
  };
}

function invalidInput(error: z.ZodError) {
  const fieldErrors = error.flatten().fieldErrors;
  return {
    ok: false as const,
    status: 400,
    body: {
      error: {
        code: "INVALID_INPUT",
        message: "요청 값을 확인해 주세요.",
        fieldErrors,
      },
    },
  };
}
