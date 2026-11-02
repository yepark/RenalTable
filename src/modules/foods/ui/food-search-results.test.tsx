import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TEST_ONLY_PUBLISHED_FOOD } from "@/modules/foods/testing/test-food";
import { FoodSearchResults } from "@/modules/foods/ui/food-search-results";

describe("음식 검색 결과 UI", () => {
  it("빈 상태를 한국어로 안내한다", () => {
    render(<FoodSearchResults foods={[]} query="검색어" />);
    expect(screen.getByRole("heading", { name: "표시할 음식 정보가 없어요" })).toBeInTheDocument();
    expect(screen.getByText(/검토 후 게시된 데이터만/)).toBeInTheDocument();
  });

  it("정보 없음과 출처·기준량·수집 시점을 표시한다", async () => {
    render(<FoodSearchResults foods={[TEST_ONLY_PUBLISHED_FOOD]} query="" />);

    expect(screen.getByText("정보 없음")).toBeInTheDocument();
    expect(screen.getByText("출처와 기준 확인")).toBeInTheDocument();
    expect(screen.getByText(/TEST ONLY — 계약 검증 출처/)).toBeInTheDocument();
    expect(screen.getAllByText("100 G").length).toBeGreaterThan(0);
    expect(screen.getByText("2026-11-02T00:00:00.000Z")).toBeInTheDocument();
  });
});
