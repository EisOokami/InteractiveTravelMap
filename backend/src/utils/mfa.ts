import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

function getEncryptionKey(): Buffer {
    const key = process.env.MFA_ENCRYPTION_KEY;

    if (!key) {
        throw new Error("Invalid key");
    }

    if (Buffer.byteLength(key, "utf8") < 32) {
        throw new Error("Invalid key");
    }

    return crypto.createHash("sha256").update(key, "utf8").digest();
}

export function encryptMfaSecret(plainSecret: string): Buffer {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
        cipher.update(plainSecret, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]);
}

export function decryptMfaSecret(encryptedData: Buffer): string {
    const key = getEncryptionKey();

    const iv = encryptedData.subarray(0, 12);
    const authTag = encryptedData.subarray(12, 12 + 16);
    const ciphertext = encryptedData.subarray(12 + 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
}

export function generateRawToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateBackupCode(): string {
    const part1 = crypto.randomBytes(4).toString("hex").slice(0, 4);
    const part2 = crypto.randomBytes(4).toString("hex").slice(0, 4);

    return `${part1}-${part2}`.toUpperCase();
}
