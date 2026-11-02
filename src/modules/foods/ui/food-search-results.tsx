import type { Route } from "next";
import Link from "next/link";

import type { Food } from "@/modules/foods/domain/food";
import { DataStatusBadge } from "@/shared/ui/data-status-badge";
import { SourceDisclosure } from "@/shared/ui/source-disclosure";

export function FoodSearchResults({ foods, query }: { foods: readonly Food[]; query: string }) {
  if (foods.length === 0) {
    return (
      <section
        aria-live="polite"
        className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-xl font-bold">표시할 음식 정보가 없어요</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          {query
            ? "검색어를 바꾸어 보세요. 검토 후 게시된 데이터만 검색 결과에 표시해요."
            : "검토 후 게시된 음식 데이터가 아직 없어요."}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="food-results-title" className="mt-8">
      <h2 id="food-results-title" className="text-xl font-bold">
        검색 결과
      </h2>
      <ul className="mt-4 grid list-none gap-4 p-0">
        {foods.map((food) => (
          <li
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            key={food.id}
          >
            <h3 className="text-lg font-bold">
              <Link href={`/foods/${food.id}` as Route}>{food.canonicalNameKo}</Link>
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              기준량 {food.defaultBasis.amount} {food.defaultBasis.unit}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {food.nutrients.map((nutrient) => (
                <div
                  className="flex items-center justify-between gap-3"
                  key={nutrient.nutrientCode}
                >
                  <dt>{nutrient.nutrientCode}</dt>
                  <dd>
                    {nutrient.status === "PRESENT" ? (
                      `${nutrient.displayText} ${nutrient.unit}`
                    ) : (
                      <DataStatusBadge
                        status={nutrient.status === "MISSING" ? "missing" : "needsReview"}
                      />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {food.sources.map((source) => (
              <SourceDisclosure
                basis={`${food.defaultBasis.amount} ${food.defaultBasis.unit}`}
                className="mt-4"
                key={source.id}
                sourceName={`${source.publisher} · ${source.title}`}
                updatedAt={source.retrievedAt}
              />
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
