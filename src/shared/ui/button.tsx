import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClasses =
    variant === "primary"
      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white enabled:hover:bg-[var(--color-brand-hover)]"
      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] enabled:hover:bg-[var(--color-brand-soft)]";

  return (
    <button
      className={`min-h-11 rounded-lg border px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${className}`}
      {...props}
    />
  );
}
