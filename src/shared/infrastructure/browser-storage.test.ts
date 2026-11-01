import { describe, expect, it } from "vitest";
import { isProfile, type Profile } from "@/modules/profile/domain/profile";
import { createVersionedBrowserStorage } from "./browser-storage";

const emptyProfile: Profile = {
  treatmentMode: "unset",
  allergies: [],
  excludedIngredients: [],
  nutritionTargets: [],
};

function createProfileStorage(
  migrations: Readonly<Record<number, (value: unknown) => unknown>> = {},
) {
  return createVersionedBrowserStorage({
    storage: window.localStorage,
    keyPrefix: "renaltable.profile.test",
    schemaVersion: 1,
    validate: isProfile,
    migrations,
    now: () => new Date("2026-11-01T00:00:00.000Z"),
  });
}

describe("버전이 있는 브라우저 저장소", () => {
  it("프로필을 저장하고 같은 값으로 읽는다", () => {
    const repository = createProfileStorage();

    expect(repository.save(emptyProfile)).toEqual({ status: "success" });
    expect(repository.read()).toEqual({ status: "success", value: emptyProfile, migrated: false });
  });

  it("현재 버전과 이전 버전 데이터를 모두 삭제한다", () => {
    const repository = createProfileStorage();
    window.localStorage.setItem("renaltable.profile.test.v0", "이전 원본");
    repository.save(emptyProfile);

    expect(repository.delete()).toEqual({ status: "success" });
    expect(window.localStorage.getItem("renaltable.profile.test.v0")).toBeNull();
    expect(window.localStorage.getItem("renaltable.profile.test.v1")).toBeNull();
    expect(repository.read()).toEqual({ status: "empty" });
  });

  it("마이그레이션 실패 시 이전 원본을 덮어쓰거나 삭제하지 않는다", () => {
    const raw = JSON.stringify({
      schemaVersion: 0,
      savedAt: "2026-10-01T00:00:00.000Z",
      value: { treatmentMode: "unknown" },
    });
    window.localStorage.setItem("renaltable.profile.test.v0", raw);
    const repository = createProfileStorage({
      0: () => {
        throw new Error("의도한 마이그레이션 실패");
      },
    });

    expect(repository.read()).toEqual({
      status: "migration-failed",
      message: "이전 버전 데이터를 옮기지 못했어요. 원본은 변경하지 않았어요.",
      raw,
      sourceKey: "renaltable.profile.test.v0",
    });
    expect(window.localStorage.getItem("renaltable.profile.test.v0")).toBe(raw);
    expect(window.localStorage.getItem("renaltable.profile.test.v1")).toBeNull();
  });

  it("영양 목표가 없을 때 임의의 0을 추가하지 않는다", () => {
    const repository = createProfileStorage();
    repository.save(emptyProfile);

    const result = repository.read();
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.value.nutritionTargets).toEqual([]);
      expect(JSON.stringify(result.value)).not.toContain('"value":0');
    }
  });
});
