import { Button } from "@/shared/ui/button";
import { DataStatusBadge } from "@/shared/ui/data-status-badge";
import { Input } from "@/shared/ui/input";
import { Notice } from "@/shared/ui/notice";
import { SourceDisclosure } from "@/shared/ui/source-disclosure";

const upcomingTasks = ["식단 조건 설정", "음식 정보 확인", "레시피 살펴보기", "주간 식단 작성"];

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12" tabIndex={-1}>
      <section aria-labelledby="intro-title" className="max-w-3xl">
        <p className="mb-2 font-semibold text-[var(--color-brand)]">Eat Well, Care Better.</p>
        <h1 id="intro-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
          식사 정보를 차분하게 확인하세요
        </h1>
        <p className="mt-4 text-lg text-[var(--color-muted)]">
          출처와 누락 여부를 함께 살펴보고, 의료진에게 안내받은 목표가 있을 때만 수치를 비교할 수
          있도록 준비하고 있어요.
        </p>
      </section>

      <Notice className="mt-8" title="먼저 확인해 주세요" variant="medical">
        사람마다 치료 상태와 검사 결과가 달라요. 이 서비스의 정보는 의료진의 진료와 상담을 대신하지
        않아요.
      </Notice>

      <section aria-labelledby="tasks-title" className="mt-10">
        <h2 id="tasks-title" className="text-2xl font-bold">
          준비 중인 기능
        </h2>
        <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
          {upcomingTasks.map((task) => (
            <li
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
              key={task}
            >
              <span className="font-semibold">{task}</span>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                아직 사용할 수 없는 기능이에요.
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="components-title" className="mt-10">
        <h2 id="components-title" className="text-2xl font-bold">
          정보 표시 원칙
        </h2>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="데이터 상태 예시">
          <DataStatusBadge status="available" />
          <DataStatusBadge status="partial" />
          <DataStatusBadge status="missing" />
        </div>
        <p className="mt-3 text-[var(--color-muted)]">
          값이 없을 때는 0으로 바꾸지 않고 정보 없음 또는 부분 정보로 알려드려요.
        </p>
        <SourceDisclosure className="mt-4" />
      </section>

      <section aria-labelledby="control-title" className="mt-10 max-w-xl">
        <h2 id="control-title" className="text-2xl font-bold">
          기본 입력 요소
        </h2>
        <div className="mt-4 space-y-4">
          <Input
            label="검색어 예시"
            name="example"
            helperText="현재는 저장하거나 전송하지 않아요."
          />
          <Button disabled type="button">
            기능 준비 중
          </Button>
        </div>
      </section>
    </main>
  );
}
