type SourceDisclosureProps = {
  sourceName?: string;
  basis?: string;
  updatedAt?: string;
  className?: string;
};

export function SourceDisclosure({
  sourceName,
  basis,
  updatedAt,
  className = "",
}: SourceDisclosureProps) {
  const hasSource = Boolean(sourceName && basis && updatedAt);

  return (
    <details
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}
    >
      <summary className="min-h-6 cursor-pointer font-semibold">출처와 기준 확인</summary>
      {hasSource ? (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-semibold">원본 출처</dt>
          <dd>{sourceName}</dd>
          <dt className="font-semibold">기준량</dt>
          <dd>{basis}</dd>
          <dt className="font-semibold">수집 시점</dt>
          <dd>{updatedAt}</dd>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          게시할 데이터에는 원본 출처, 기준량, 단위, 수집 시점과 계산 버전을 함께 표시해요.
        </p>
      )}
    </details>
  );
}
