import * as SQLite from "expo-sqlite";
import type { AuthUser } from "@shared/services/authSession";
import type { OfflineAuthUser } from "../../protocol";

type OfflineAuthUserRow = {
  created_at: number;
  credential_storage_key: string;
  email_normalized: string;
  last_online_validated_at: number;
  offline_valid_until: number;
  updated_at: number;
  user_id: number;
  user_json: string;
};

const DATABASE_NAME = "apollo_auth.db";
const TABLE_NAME = "offline_auth_users";

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getOfflineAuthDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch(error => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

export async function upsertOfflineAuthUser(user: OfflineAuthUser) {
  const database = await getOfflineAuthDatabase();

  await database.withExclusiveTransactionAsync(async transaction => {
    await transaction.runAsync(
      `DELETE FROM ${TABLE_NAME} WHERE email_normalized = ? AND user_id != ?`,
      user.emailNormalized,
      user.userId,
    );
    await transaction.runAsync(
      `INSERT INTO ${TABLE_NAME} (
        user_id,
        email_normalized,
        user_json,
        credential_storage_key,
        last_online_validated_at,
        offline_valid_until,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        email_normalized = excluded.email_normalized,
        user_json = excluded.user_json,
        credential_storage_key = excluded.credential_storage_key,
        last_online_validated_at = excluded.last_online_validated_at,
        offline_valid_until = excluded.offline_valid_until,
        updated_at = excluded.updated_at`,
      user.userId,
      user.emailNormalized,
      JSON.stringify(user.user),
      user.credentialStorageKey,
      user.lastOnlineValidatedAt,
      user.offlineValidUntil,
      user.createdAt,
      user.updatedAt,
    );
  });
}

export async function getOfflineAuthUserByEmail(email: string) {
  const database = await getOfflineAuthDatabase();
  const row = await database.getFirstAsync<OfflineAuthUserRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE email_normalized = ?`,
    normalizeOfflineAuthEmail(email),
  );

  return row ? mapOfflineAuthUser(row) : null;
}

export async function getOfflineAuthUserById(userId: number) {
  const database = await getOfflineAuthDatabase();
  const row = await database.getFirstAsync<OfflineAuthUserRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE user_id = ?`,
    userId,
  );

  return row ? mapOfflineAuthUser(row) : null;
}

export async function deleteOfflineAuthUser(userId: number) {
  const database = await getOfflineAuthDatabase();
  await database.runAsync(`DELETE FROM ${TABLE_NAME} WHERE user_id = ?`, userId);
}

export function normalizeOfflineAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

async function initializeDatabase() {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await database.execAsync("PRAGMA journal_mode = WAL;");
  const versionRow = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const version = versionRow?.user_version ?? 0;

  if (version > 1) {
    throw new Error("A versão do banco de autenticação offline não é suportada.");
  }

  if (version === 1) return database;

  await database.withExclusiveTransactionAsync(async transaction => {
    await transaction.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        user_id INTEGER PRIMARY KEY NOT NULL,
        email_normalized TEXT NOT NULL UNIQUE,
        user_json TEXT NOT NULL,
        credential_storage_key TEXT NOT NULL,
        last_online_validated_at INTEGER NOT NULL,
        offline_valid_until INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_offline_valid_until
      ON ${TABLE_NAME}(offline_valid_until);
      PRAGMA user_version = 1;
    `);
  });
  return database;
}

function mapOfflineAuthUser(row: OfflineAuthUserRow): OfflineAuthUser {
  const user = parseAuthUser(row.user_json, row.user_id);
  return {
    createdAt: row.created_at,
    credentialStorageKey: row.credential_storage_key,
    emailNormalized: row.email_normalized,
    lastOnlineValidatedAt: row.last_online_validated_at,
    offlineValidUntil: row.offline_valid_until,
    updatedAt: row.updated_at,
    user,
    userId: row.user_id,
  };
}

function parseAuthUser(serialized: string, expectedUserId: number): AuthUser {
  try {
    const value = JSON.parse(serialized) as Record<string, unknown>;
    if (value && value.id === expectedUserId) return value as AuthUser;
  } catch {
    // Invalid cached identity is handled as an unavailable offline account.
  }

  throw new Error("Os dados locais deste usuário estão inválidos. Faça login online novamente.");
}
