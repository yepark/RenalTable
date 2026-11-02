import type { Metadata, Route, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RenalTable | 식사 정보를 차분하게 확인하세요",
    template: "%s | RenalTable",
  },
  description: "신장 질환 환자와 보호자가 출처 있는 식사 정보를 확인하도록 돕는 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffcf7",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 바로가기
        </a>
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto flex min-h-16 max-w-5xl items-center px-4 sm:px-6">
            <Link className="rounded-sm text-xl font-bold tracking-tight" href="/">
              RenalTable
            </Link>
            <span className="ml-3 hidden text-sm text-[var(--color-muted)] sm:inline">
              Eat Well, Care Better.
            </span>
            <nav aria-label="주요 메뉴" className="ml-auto">
              <Link
                className="rounded-sm font-semibold text-[var(--color-brand)]"
                href={"/foods" as Route}
              >
                음식 정보
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-12 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-[var(--color-muted)] sm:px-6">
            <p>RenalTable은 진단이나 처방, 의료 상담을 대신하지 않아요.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
