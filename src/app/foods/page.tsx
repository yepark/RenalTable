import type { Metadata } from "next";

import { foodRepository } from "@/modules/foods/infrastructure/food-repository";
import { FoodSearchResults } from "@/modules/foods/ui/food-search-results";
import { Notice } from "@/shared/ui/notice";

export const metadata: Metadata = { title: "음식 정보 찾기" };

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = await foodRepository.listPublished({ q, limit: 20 });

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6" tabIndex={-1}>
      <h1 className="text-3xl font-bold">음식 정보 찾기</h1>
      <p className="mt-3 text-[var(--color-muted)]">
        검토 후 게시된 음식만 보여 드리며, 값이 없는 영양소는 정보 없음으로 표시해요.
      </p>
      <Notice className="mt-6" title="영양값을 확인할 때" variant="medical">
        표시된 수치는 출처와 기준량을 함께 확인해 주세요. 개인별 섭취 목표는 의료진에게 안내받은
        값이 있을 때만 비교해야 해요.
      </Notice>
      <form
        action="/foods"
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        method="get"
        role="search"
      >
        <label className="flex-1 font-semibold" htmlFor="food-query">
          음식 이름
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3"
            defaultValue={q}
            id="food-query"
            maxLength={80}
            name="q"
            placeholder="음식 이름을 입력해 주세요"
            type="search"
          />
        </label>
        <button
          className="min-h-11 self-end rounded-lg bg-[var(--color-brand)] px-5 font-semibold text-white"
          type="submit"
        >
          검색
        </button>
      </form>
      <FoodSearchResults foods={result.items} query={q} />
    </main>
  );
}
