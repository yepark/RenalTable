import type { Route } from "next";
import Link from "next/link";

export default function FoodNotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-12 sm:px-6" tabIndex={-1}>
      <h1 className="text-3xl font-bold">음식 정보를 찾을 수 없어요</h1>
      <p className="mt-3 text-[var(--color-muted)]">
        게시되지 않았거나 더 이상 제공하지 않는 음식 정보예요.
      </p>
      <Link
        className="mt-6 inline-block font-semibold text-[var(--color-brand)]"
        href={"/foods" as Route}
      >
        음식 검색으로 돌아가기
      </Link>
    </main>
  );
}
