import type { Food } from "@/modules/foods/domain/food";

export type FoodListQuery = {
  q?: string;
  category?: string;
  cursor?: string;
  limit: number;
};

export type FoodListResult = {
  items: Food[];
  nextCursor: string | null;
  total: number;
};

export interface FoodRepository {
  listPublished(query: FoodListQuery): Promise<FoodListResult>;
  findPublishedById(id: string): Promise<Food | null>;
}

export class InMemoryFoodRepository implements FoodRepository {
  readonly #foods: readonly Food[];

  constructor(foods: readonly Food[] = []) {
    this.#foods = foods;
  }

  async listPublished(query: FoodListQuery): Promise<FoodListResult> {
    const search = query.q?.trim().normalize("NFC").toLocaleLowerCase("ko") ?? "";
    const start = decodeCursor(query.cursor);
    const matches = this.#foods
      .filter((food) => food.status === "PUBLISHED" && food.publishedAt !== null)
      .filter((food) => !query.category || food.categoryCode === query.category)
      .filter(
        (food) =>
          !search || food.canonicalNameKo.normalize("NFC").toLocaleLowerCase("ko").includes(search),
      )
      .sort(
        (a, b) =>
          a.canonicalNameKo.localeCompare(b.canonicalNameKo, "ko") || a.id.localeCompare(b.id),
      );
    const items = matches.slice(start, start + query.limit);
    const nextOffset = start + items.length;

    return {
      items,
      nextCursor: nextOffset < matches.length ? encodeCursor(nextOffset) : null,
      total: matches.length,
    };
  }

  async findPublishedById(id: string): Promise<Food | null> {
    return (
      this.#foods.find(
        (food) => food.id === id && food.status === "PUBLISHED" && food.publishedAt !== null,
      ) ?? null
    );
  }
}

function encodeCursor(offset: number) {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function decodeCursor(cursor?: string) {
  if (!cursor) return 0;
  const decoded = Number(Buffer.from(cursor, "base64url").toString("utf8"));
  return Number.isSafeInteger(decoded) && decoded >= 0 ? decoded : 0;
}
