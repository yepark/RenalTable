export type StorageReadResult<T> =
  | { status: "empty" }
  | { status: "success"; value: T; migrated: boolean }
  | { status: "invalid-data"; message: string; raw: string }
  | { status: "migration-failed"; message: string; raw: string; sourceKey: string };

export type StorageWriteResult =
  | { status: "success" }
  | { status: "invalid-data"; message: string }
  | { status: "storage-failed"; message: string };

export type StorageDeleteResult =
  { status: "success" } | { status: "storage-failed"; message: string };

export interface VersionedStoragePort<T> {
  read(): StorageReadResult<T>;
  save(value: T): StorageWriteResult;
  delete(): StorageDeleteResult;
}
