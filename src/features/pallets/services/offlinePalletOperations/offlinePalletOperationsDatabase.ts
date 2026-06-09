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
} from "../../types/offlinePalletOperation";

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
};

const DATABASE_NAME = "valorlog_offline.db";
const TABLE_NAME = "offline_pallet_operations";

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
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(operation_type, roadmap)
        );
      `);

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
  const existing = await getExistingOperation({ id: patch.id, operationType: patch.operationType, roadmap });
  const now = new Date().toISOString();
  const operation: OfflinePalletOperation = {
    createdAt: existing?.createdAt ?? now,
    currentStep: patch.currentStep ?? existing?.currentStep ?? "form",
    exitExtraEvidenceData: patch.exitExtraEvidenceData ?? existing?.exitExtraEvidenceData,
    formData: patch.formData ?? existing?.formData,
    id: existing?.id ?? patch.id ?? createOfflinePalletOperationId(patch.operationType, roadmap),
    lastError: patch.lastError ?? existing?.lastError ?? null,
    operationType: patch.operationType,
    palletEvidenceData: patch.palletEvidenceData ?? existing?.palletEvidenceData,
    roadmap: roadmap ?? existing?.roadmap ?? null,
    shipGoodsData: patch.shipGoodsData ?? existing?.shipGoodsData,
    status: patch.status ?? existing?.status ?? "draft",
    updatedAt: now,
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
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

export async function deleteOfflinePalletOperation(id: string) {
  const database = await getOfflinePalletOperationsDatabase();
  await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
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
      `SELECT * FROM ${TABLE_NAME} WHERE operation_type = ? AND roadmap = ?`,
      operationType,
      roadmap,
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
  };
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
