import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required for token encryption");
  }

  const keyBuffer = Buffer.from(key, "hex");
  
  if (keyBuffer.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${ENCRYPTION_KEY_LENGTH * 2} hex characters (${ENCRYPTION_KEY_LENGTH} bytes)`);
  }

  return keyBuffer;
}

export function encryptToken(token: string): string {
  if (!token) {
    throw new Error("Token is required for encryption");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error("Encrypted token is required for decryption");
  }

  const parts = encryptedToken.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, authTagHex, encrypted] = parts;
  
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(ENCRYPTION_KEY_LENGTH).toString("hex");
}
