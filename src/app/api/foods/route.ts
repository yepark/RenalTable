import { NextResponse, type NextRequest } from "next/server";

import { listFoods } from "@/modules/foods/application/food-api";
import type { FoodRepository } from "@/modules/foods/application/food-repository";
import { foodRepository } from "@/modules/foods/infrastructure/food-repository";

export function createListFoodsHandler(repository: FoodRepository) {
  return async function listFoodsHandler(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const result = await listFoods(repository, {
      ...(params.has("q") ? { q: params.get("q") ?? undefined } : {}),
      ...(params.has("category") ? { category: params.get("category") ?? undefined } : {}),
      ...(params.has("cursor") ? { cursor: params.get("cursor") ?? undefined } : {}),
      ...(params.has("limit") ? { limit: params.get("limit") ?? undefined } : {}),
    });
    return NextResponse.json(result.body, { status: result.status });
  };
}

export const GET = createListFoodsHandler(foodRepository);
