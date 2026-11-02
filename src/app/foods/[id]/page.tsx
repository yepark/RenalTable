import { notFound } from "next/navigation";

import { foodRepository } from "@/modules/foods/infrastructure/food-repository";
import { FoodSearchResults } from "@/modules/foods/ui/food-search-results";

export default async function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const food = await foodRepository.findPublishedById(id);
  if (!food) notFound();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6" tabIndex={-1}>
      <h1 className="text-3xl font-bold">음식 상세 정보</h1>
      <FoodSearchResults foods={[food]} query="" />
    </main>
  );
}
