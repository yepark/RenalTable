import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
  error?: string;
};

export function Input({ label, helperText, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  const descriptionId = inputId ? `${inputId}-description` : undefined;

  return (
    <div className={className}>
      <label className="block font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={helperText || error ? descriptionId : undefined}
        aria-invalid={error ? true : undefined}
        className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base"
        id={inputId}
        {...props}
      />
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${error ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]"}`}
          id={descriptionId}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
