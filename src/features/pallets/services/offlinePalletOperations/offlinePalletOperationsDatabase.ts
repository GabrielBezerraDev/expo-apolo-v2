import * as SQLite from "expo-sqlite";
import {
  OfflineExitExtraEvidenceData,
  OfflinePalletEvidenceData,
  OfflinePalletFormData,
  OfflinePalletOperation,
  OfflinePalletOperationPatch,
  OfflinePalletOperationStep,
  OfflinePalletOperationStatus,
  OfflinePalletOperationType,
  OfflineShipGoodsData,
  OfflineValidationIssue,
} from "../../protocol";
import { deletePalletOperationImageDirectory } from "../palletImageStorage";

type OfflinePalletOperationRow = {
  created_at: string;
  current_step: OfflinePalletOperationStep;
  exit_extra_evidence_json: string | null;
  form_data_json: string | null;
  id: string;
  last_error: string | null;
  operation_type: OfflinePalletOperationType;
  pallet_evidence_json: string | null;
  roadmap: string | null;
  ship_goods_json: string | null;
  status: OfflinePalletOperationStatus;
  updated_at: string;
  validation_issues_json: string | null;
};

const DATABASE_NAME = "valorlog_offline.db";
const TABLE_NAME = "offline_pallet_operations";
const OFFLINE_OPERATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STALE_SYNCING_MS = 5 * 60 * 1000;

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export async function getOfflinePalletOperationsDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async database => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id TEXT PRIMARY KEY NOT NULL,
          roadmap TEXT,
          operation_type TEXT NOT NULL,
          status TEXT NOT NULL,
          current_step TEXT NOT NULL,
          form_data_json TEXT,
          pallet_evidence_json TEXT,
          ship_goods_json TEXT,
          exit_extra_evidence_json TEXT,
          last_error TEXT,
          validation_issues_json TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await ensureColumn(database, "validation_issues_json", "TEXT");
      await database.execAsync(`
        DELETE FROM ${TABLE_NAME}
        WHERE roadmap IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM ${TABLE_NAME} newer
            WHERE newer.roadmap = ${TABLE_NAME}.roadmap
              AND newer.operation_type = ${TABLE_NAME}.operation_type
              AND (
                newer.updated_at > ${TABLE_NAME}.updated_at
                OR (newer.updated_at = ${TABLE_NAME}.updated_at AND newer.id > ${TABLE_NAME}.id)
              )
          );

        DROP INDEX IF EXISTS ${TABLE_NAME}_roadmap_unique;

        CREATE UNIQUE INDEX IF NOT EXISTS ${TABLE_NAME}_operation_roadmap_unique
        ON ${TABLE_NAME}(operation_type, roadmap)
        WHERE roadmap IS NOT NULL;
      `);
      await cleanupExpiredOfflinePalletOperations(database);

      return database;
    });
  }

  return databasePromise;
}

export async function upsertOfflinePalletOperation(
  patch: OfflinePalletOperationPatch,
): Promise<OfflinePalletOperation> {
  const database = await getOfflinePalletOperationsDatabase();
  const roadmap = normalizeRoadmap(patch.roadmap);
  const existing = await getExistingOperation({
    id: patch.id,
    operationType: patch.operationType,
    roadmap,
  });
  const shouldApplyPatch = !existing || existing.id === patch.id;
  const now = new Date().toISOString();
  const nextStatus = shouldApplyPatch ? patch.status ?? existing?.status ?? "draft" : existing.status;
  const operation: OfflinePalletOperation = {
    createdAt: existing?.createdAt ?? now,
    currentStep: shouldApplyPatch ? patch.currentStep ?? existing?.currentStep ?? "form" : existing.currentStep,
    exitExtraEvidenceData: shouldApplyPatch ? patch.exitExtraEvidenceData ?? existing?.exitExtraEvidenceData : existing.exitExtraEvidenceData,
    formData: shouldApplyPatch ? patch.formData ?? existing?.formData : existing.formData,
    id: existing?.id ?? patch.id ?? createOfflinePalletOperationId(patch.operationType, roadmap),
    lastError: shouldApplyPatch ? patch.lastError ?? existing?.lastError ?? null : existing.lastError,
    operationType: existing?.operationType ?? patch.operationType,
    palletEvidenceData: shouldApplyPatch ? patch.palletEvidenceData ?? existing?.palletEvidenceData : existing.palletEvidenceData,
    roadmap: roadmap ?? existing?.roadmap ?? null,
    shipGoodsData: shouldApplyPatch ? patch.shipGoodsData ?? existing?.shipGoodsData : existing.shipGoodsData,
    status: nextStatus,
    updatedAt: shouldApplyPatch ? now : existing.updatedAt,
    validationIssues: nextStatus === "validation_failed"
      ? patch.validationIssues ?? existing?.validationIssues
      : patch.validationIssues,
  };

  await database.runAsync(
    `INSERT OR REPLACE INTO ${TABLE_NAME} (
      id,
      roadmap,
      operation_type,
      status,
      current_step,
      form_data_json,
      pallet_evidence_json,
      ship_goods_json,
      exit_extra_evidence_json,
      last_error,
      validation_issues_json,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    operation.id,
    operation.roadmap ?? null,
    operation.operationType,
    operation.status,
    operation.currentStep,
    stringify(operation.formData),
    stringify(operation.palletEvidenceData),
    stringify(operation.shipGoodsData),
    stringify(operation.exitExtraEvidenceData),
    operation.lastError ?? null,
    stringify(operation.validationIssues),
    operation.createdAt,
    operation.updatedAt,
  );

  return operation;
}

export async function getOfflinePalletOperation(id: string) {
  const database = await getOfflinePalletOperationsDatabase();
  const row = await database.getFirstAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
    id,
  );

  return row ? mapRowToOperation(row) : null;
}

export async function getOfflinePalletOperationByRoadmap(
  roadmap: string,
  operationType?: OfflinePalletOperationType,
) {
  const normalizedRoadmap = normalizeRoadmap(roadmap);
  if (!normalizedRoadmap) return null;

  const database = await getOfflinePalletOperationsDatabase();
  const operationTypeFilter = operationType ? "AND operation_type = ?" : "";
  const params = operationType
    ? [normalizedRoadmap, operationType]
    : [normalizedRoadmap];
  const row = await database.getFirstAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE roadmap = ? ${operationTypeFilter} AND status != 'synced'
     ORDER BY updated_at DESC
     LIMIT 1`,
    ...params,
  );

  return row ? mapRowToOperation(row) : null;
}

export async function listOfflinePalletOperations(operationType: OfflinePalletOperationType) {
  const database = await getOfflinePalletOperationsDatabase();
  const rows = await database.getAllAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE operation_type = ? AND status != 'synced'
     ORDER BY updated_at DESC`,
    operationType,
  );

  return rows.map(mapRowToOperation);
}

export async function listPendingSyncPalletOperations() {
  const database = await getOfflinePalletOperationsDatabase();
  const staleSyncingBefore = new Date(Date.now() - STALE_SYNCING_MS).toISOString();
  const rows = await database.getAllAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE status IN ('pending_sync', 'failed')
        OR (status = 'syncing' AND updated_at < ?)
     ORDER BY updated_at ASC`,
    staleSyncingBefore,
  );

  return rows.map(mapRowToOperation);
}

export async function listValidationFailedPalletOperations() {
  const database = await getOfflinePalletOperationsDatabase();
  const rows = await database.getAllAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE status = 'validation_failed'
     ORDER BY updated_at DESC`,
  );

  return rows.map(mapRowToOperation);
}

export async function updateOfflinePalletOperationStatus({
  id,
  lastError = null,
  status,
  validationIssues,
}: {
  id: string;
  lastError?: string | null;
  status: OfflinePalletOperationStatus;
  validationIssues?: OfflineValidationIssue[];
}) {
  const database = await getOfflinePalletOperationsDatabase();
  const updatedAt = new Date().toISOString();

  if (validationIssues) {
    await database.runAsync(
      `UPDATE ${TABLE_NAME}
       SET status = ?, last_error = ?, validation_issues_json = ?, updated_at = ?
       WHERE id = ?`,
      status,
      lastError,
      stringify(validationIssues),
      updatedAt,
      id,
    );
    return;
  }

  await database.runAsync(
    `UPDATE ${TABLE_NAME}
     SET status = ?, last_error = ?, validation_issues_json = NULL, updated_at = ?
     WHERE id = ?`,
    status,
    lastError,
    updatedAt,
    id,
  );
}

export async function deleteOfflinePalletOperation(id: string) {
  const database = await getOfflinePalletOperationsDatabase();
  await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
}

async function cleanupExpiredOfflinePalletOperations(database: SQLite.SQLiteDatabase) {
  const expiresBefore = new Date(Date.now() - OFFLINE_OPERATION_TTL_MS).toISOString();
  const rows = await database.getAllAsync<OfflinePalletOperationRow>(
    `SELECT * FROM ${TABLE_NAME}
     WHERE updated_at < ? AND status IN ('draft', 'synced')`,
    expiresBefore,
  );

  for (const row of rows) {
    await deletePalletOperationImageDirectory({
      operationId: row.id,
      operationType: row.operation_type,
      roadmap: row.roadmap,
    }).catch(() => undefined);

    await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, row.id);
  }
}

async function getExistingOperation({
  id,
  operationType,
  roadmap,
}: {
  id?: string;
  operationType: OfflinePalletOperationType;
  roadmap?: string | null;
}) {
  const database = await getOfflinePalletOperationsDatabase();

  if (id) {
    const row = await database.getFirstAsync<OfflinePalletOperationRow>(
      `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
      id,
    );

    if (row) return mapRowToOperation(row);
  }

  if (roadmap) {
    const row = await database.getFirstAsync<OfflinePalletOperationRow>(
      `SELECT * FROM ${TABLE_NAME}
       WHERE roadmap = ? AND operation_type = ? AND status != 'synced'`,
      roadmap,
      operationType,
    );

    if (row) return mapRowToOperation(row);
  }

  return null;
}

function mapRowToOperation(row: OfflinePalletOperationRow): OfflinePalletOperation {
  return {
    createdAt: row.created_at,
    currentStep: row.current_step,
    exitExtraEvidenceData: parseJson<OfflineExitExtraEvidenceData>(row.exit_extra_evidence_json),
    formData: parseJson<OfflinePalletFormData>(row.form_data_json),
    id: row.id,
    lastError: row.last_error,
    operationType: row.operation_type,
    palletEvidenceData: parseJson<OfflinePalletEvidenceData>(row.pallet_evidence_json),
    roadmap: row.roadmap,
    shipGoodsData: parseJson<OfflineShipGoodsData>(row.ship_goods_json),
    status: row.status,
    updatedAt: row.updated_at,
    validationIssues: parseJson<OfflineValidationIssue[]>(row.validation_issues_json),
  };
}

async function ensureColumn(
  database: SQLite.SQLiteDatabase,
  columnName: string,
  columnType: string,
) {
  const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${TABLE_NAME})`);
  if (columns.some(column => column.name === columnName)) return;

  await database.execAsync(`ALTER TABLE ${TABLE_NAME} ADD COLUMN ${columnName} ${columnType}`);
}

function createOfflinePalletOperationId(operationType: OfflinePalletOperationType, roadmap?: string | null) {
  const suffix = roadmap ? sanitizeIdPart(roadmap) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${operationType}-${suffix}`;
}

function normalizeRoadmap(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function sanitizeIdPart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
}

function stringify(value: unknown) {
  return value == null ? null : JSON.stringify(value);
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
