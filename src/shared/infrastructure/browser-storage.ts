import type {
  StorageDeleteResult,
  StorageReadResult,
  StorageWriteResult,
  VersionedStoragePort,
} from "@/shared/application/versioned-storage";

type StorageDriver = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StoredEnvelope = {
  schemaVersion: number;
  savedAt: string;
  value: unknown;
};

type Migration = (value: unknown) => unknown;

type VersionedStorageOptions<T> = {
  storage: StorageDriver;
  keyPrefix: string;
  schemaVersion: number;
  validate: (value: unknown) => value is T;
  migrations?: Readonly<Record<number, Migration>>;
  now?: () => Date;
};

function parseEnvelope(raw: string): StoredEnvelope | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return undefined;

    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.schemaVersion !== "number" ||
      !Number.isInteger(candidate.schemaVersion) ||
      typeof candidate.savedAt !== "string" ||
      !("value" in candidate)
    ) {
      return undefined;
    }

    return {
      schemaVersion: candidate.schemaVersion,
      savedAt: candidate.savedAt,
      value: candidate.value,
    };
  } catch {
    return undefined;
  }
}

export function createVersionedBrowserStorage<T>({
  storage,
  keyPrefix,
  schemaVersion,
  validate,
  migrations = {},
  now = () => new Date(),
}: VersionedStorageOptions<T>): VersionedStoragePort<T> {
  const currentKey = `${keyPrefix}.v${schemaVersion}`;

  function save(value: T): StorageWriteResult {
    if (!validate(value)) {
      return { status: "invalid-data", message: "저장할 데이터 형식을 확인해 주세요." };
    }

    try {
      storage.setItem(
        currentKey,
        JSON.stringify({ schemaVersion, savedAt: now().toISOString(), value }),
      );
      return { status: "success" };
    } catch {
      return { status: "storage-failed", message: "이 브라우저에 데이터를 저장하지 못했어요." };
    }
  }

  function readCurrent(raw: string): StorageReadResult<T> {
    const envelope = parseEnvelope(raw);
    if (!envelope || envelope.schemaVersion !== schemaVersion || !validate(envelope.value)) {
      return {
        status: "invalid-data",
        message: "저장된 데이터 형식을 확인할 수 없어요. 원본은 변경하지 않았어요.",
        raw,
      };
    }

    return { status: "success", value: envelope.value, migrated: false };
  }

  function migrate(raw: string, sourceKey: string): StorageReadResult<T> {
    const envelope = parseEnvelope(raw);
    if (!envelope || envelope.schemaVersion >= schemaVersion) {
      return {
        status: "migration-failed",
        message: "이전 버전 데이터를 읽을 수 없어요. 원본은 변경하지 않았어요.",
        raw,
        sourceKey,
      };
    }

    try {
      let value = envelope.value;
      for (let version = envelope.schemaVersion; version < schemaVersion; version += 1) {
        const migration = migrations[version];
        if (!migration) throw new Error("migration-not-found");
        value = migration(value);
      }
      if (!validate(value)) throw new Error("migration-invalid-result");

      const writeResult = save(value);
      if (writeResult.status !== "success") throw new Error("migration-write-failed");
      storage.removeItem(sourceKey);
      return { status: "success", value, migrated: true };
    } catch {
      return {
        status: "migration-failed",
        message: "이전 버전 데이터를 옮기지 못했어요. 원본은 변경하지 않았어요.",
        raw,
        sourceKey,
      };
    }
  }

  return {
    read() {
      const currentRaw = storage.getItem(currentKey);
      if (currentRaw !== null) return readCurrent(currentRaw);

      for (let version = schemaVersion - 1; version >= 0; version -= 1) {
        const sourceKey = `${keyPrefix}.v${version}`;
        const raw = storage.getItem(sourceKey);
        if (raw !== null) return migrate(raw, sourceKey);
      }

      return { status: "empty" };
    },
    save,
    delete(): StorageDeleteResult {
      try {
        for (let version = 0; version <= schemaVersion; version += 1) {
          storage.removeItem(`${keyPrefix}.v${version}`);
        }
        return { status: "success" };
      } catch {
        return { status: "storage-failed", message: "브라우저의 저장 데이터를 삭제하지 못했어요." };
      }
    },
  };
}
