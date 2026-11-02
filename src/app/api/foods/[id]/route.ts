import { NextResponse } from "next/server";

import { getFood } from "@/modules/foods/application/food-api";
import type { FoodRepository } from "@/modules/foods/application/food-repository";
import { foodRepository } from "@/modules/foods/infrastructure/food-repository";

type RouteContext = { params: Promise<{ id: string }> };

export function createGetFoodHandler(repository: FoodRepository) {
  return async function getFoodHandler(_request: Request, context: RouteContext) {
    const { id } = await context.params;
    const result = await getFood(repository, id);
    return NextResponse.json(result.body, { status: result.status });
  };
}

export const GET = createGetFoodHandler(foodRepository);
