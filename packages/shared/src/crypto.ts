/**
 * AES-256-GCM encryption/decryption using the Web Crypto API (SubtleCrypto).
 * Works in both Node.js (>=20) and Cloudflare Workers.
 *
 * Master key: 32-byte hex string from ENCRYPTION_KEY env var.
 * Output format: { iv: base64, ciphertext: base64 }
 */

import type { EncryptedBlob } from "./index";

/** Import a 32-byte hex string as an AES-256-GCM CryptoKey. */
export async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = hexToBytes(hexKey);
  if (raw.byteLength !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars)");
  }
  return crypto.subtle.importKey(
    "raw",
    raw.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt a plaintext string. Returns { iv, ciphertext } as base64 strings. */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuf)),
  };
}

/** Decrypt an EncryptedBlob back to the original plaintext string. */
export async function decrypt(
  blob: EncryptedBlob,
  key: CryptoKey,
): Promise<string> {
  const iv = base64ToBytes(blob.iv);
  const ciphertext = base64ToBytes(blob.ciphertext);

  const plaintextBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(plaintextBuf);
}

// ── Helpers ─────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/^0x/, "");
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  // Works in both Node.js and Cloudflare Workers
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
