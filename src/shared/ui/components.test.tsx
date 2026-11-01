import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { DataStatusBadge } from "./data-status-badge";
import { Input } from "./input";
import { Notice } from "./notice";
import { SourceDisclosure } from "./source-disclosure";

describe("기본 디자인 시스템 컴포넌트", () => {
  it("입력 오류를 레이블 및 입력과 연결한다", () => {
    render(<Input error="입력값을 확인해 주세요." label="검색어" name="query" />);

    const input = screen.getByRole("textbox", { name: "검색어" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("입력값을 확인해 주세요.");
  });

  it("버튼은 키보드로 작동한다", async () => {
    const user = userEvent.setup();
    render(<Button type="button">확인</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "확인" })).toHaveFocus();
  });

  it("누락 상태를 0이 아닌 한국어 텍스트로 알린다", () => {
    render(<DataStatusBadge status="missing" />);
    expect(screen.getByText("정보 없음")).toBeVisible();
  });

  it("안내와 출처 미입력 상태를 명확히 표시한다", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Notice title="확인 안내">의료진과 상의해 주세요.</Notice>
        <SourceDisclosure />
      </>,
    );

    expect(screen.getByRole("complementary", { name: "확인 안내" })).toBeVisible();
    await user.click(screen.getByText("출처와 기준 확인"));
    expect(screen.getByText(/원본 출처, 기준량, 단위/)).toBeVisible();
  });
});
