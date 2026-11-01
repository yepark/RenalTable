import type { ReactNode } from "react";

type NoticeProps = {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: "info" | "medical";
};

export function Notice({ title, children, className = "", variant = "info" }: NoticeProps) {
  const colors =
    variant === "medical"
      ? "border-[var(--color-warning-text)] bg-[var(--color-warning-bg)]"
      : "border-[var(--color-brand)] bg-[var(--color-brand-soft)]";

  return (
    <aside className={`rounded-xl border-l-4 p-4 ${colors} ${className}`} aria-label={title}>
      <h2 className="font-bold">{title}</h2>
      <div className="mt-1">{children}</div>
    </aside>
  );
}
