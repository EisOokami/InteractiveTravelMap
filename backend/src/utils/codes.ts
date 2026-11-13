import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const generateEmailCode = (): string => {
    return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
};

export const hashEmailCode = (
    userId: number | string,
    code: string,
): string => {
    return crypto
        .createHmac("sha256", process.env.LOGIN_CODE_SECRET!)
        .update(`${userId}:${code}`)
        .digest("hex");
};

export const hashDeletionCode = (
    userId: number | string,
    code: string,
): string => {
    return crypto
        .createHmac("sha256", process.env.DELETION_CODE_SECRET!)
        .update(`delete:${userId}:${code}`)
        .digest("hex");
};

export const safeEqualHex = (a: string, b: string): boolean => {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");

    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};
