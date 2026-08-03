import type {
  ParsedBinCode,
  ParsedMaterialCode,
} from "../protocol";

const BIN_CODE_PATTERN = /^\d{3}\s+(.+)$/;
const MATERIAL_CODE_PATTERN =
  /^(ID[^#*_]+)[#*_]([^#*_]+)[#*_]L([^#*_]+)[#*_]Q(\d+(?:[.,]\d+)?)[#*_]D(\d{8})[#*_]E(\d{8})(?:[#*_][^#*_]+)*[#*_]?$/i;

export function parseBinCode(value: string): ParsedBinCode | null {
  const rawData = value.trim();
  const match = BIN_CODE_PATTERN.exec(rawData);
  if (!match) return null;

  const address = match[1]?.trim().replace(/\s+/g, " ").toUpperCase();
  if (!address) return null;

  return { address, rawData };
}

export function parseMaterialCode(value: string): ParsedMaterialCode | null {
  const rawData = value.trim();
  const match = MATERIAL_CODE_PATTERN.exec(rawData);
  if (!match) return null;

  const [, labelId, materialCode, lot, quantityValue, printedValue, expiresValue] =
    match;
  const quantity = Number(quantityValue.replace(",", "."));
  const printedAt = parseCompactDate(printedValue);
  const expiresAt = parseCompactDate(expiresValue);

  if (!Number.isFinite(quantity) || !printedAt || !expiresAt) return null;

  return {
    expiresAt,
    labelId: labelId.trim().toUpperCase(),
    lot: lot.trim().toUpperCase(),
    materialCode: materialCode.trim().toUpperCase(),
    printedAt,
    quantity,
    rawData,
  };
}

export function formatInventoryDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function parseCompactDate(value: string) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
