import { getRandomBytesAsync } from "expo-crypto";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

const SALT_BYTES = 16;
const SCRYPT_OPTIONS = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  dkLen: 32,
  asyncTick: 16,
  maxmem: 64 * 1024 * 1024,
} as const;

export async function createPasswordVerifier(password: string) {
  const salt = await getRandomBytesAsync(SALT_BYTES);
  const verifier = await scryptAsync(encodeUtf8(password), salt, SCRYPT_OPTIONS);

  return {
    salt: bytesToHex(salt),
    verifier: bytesToHex(verifier),
  };
}

export async function verifyPassword(password: string, saltHex: string, verifierHex: string) {
  try {
    const salt = hexToBytes(saltHex);
    const expected = hexToBytes(verifierHex);
    const actual = await scryptAsync(encodeUtf8(password), salt, SCRYPT_OPTIONS);

    if (actual.length !== expected.length) return false;

    let difference = 0;
    for (let index = 0; index < actual.length; index += 1) {
      difference |= actual[index] ^ expected[index];
    }

    return difference === 0;
  } catch {
    return false;
  }
}

function encodeUtf8(value: string) {
  const bytes: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        index += 1;
      } else {
        codePoint = 0xfffd;
      }
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }

  return Uint8Array.from(bytes);
}
