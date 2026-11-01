const STATUS_LABELS = {
  available: "정보 있음",
  partial: "부분 정보",
  missing: "정보 없음",
  needsReview: "확인 필요",
} as const;

type DataStatus = keyof typeof STATUS_LABELS;

export function DataStatusBadge({ status }: { status: DataStatus }) {
  const needsAttention = status !== "available";

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold ${
        needsAttention
          ? "border-[var(--color-warning-text)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
          : "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
