import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import crypto from "crypto";
import type { IGoogleProfile, IUser } from "../types/interfaces.js";
import { pool } from "../db/pool.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

dotenv.config({ quiet: true });

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

export function getGoogleAuthUrl(state: string): string {
    return client.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account",
    });
}

export async function exchangeCodeForProfile(
    code: string,
): Promise<IGoogleProfile> {
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
        throw new Error("No token returned from Google");
    }

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
        throw new Error("Invalid Google token payload");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified ?? false,
        name: payload.name ?? payload.given_name ?? "",
    };
}

async function createUsername(profile: {
    email: string;
    name: string;
}): Promise<string> {
    const cleanName = profile.name.replace(/[<>]/g, "").trim();
    const emailName = (profile.email.split("@")[0] ?? "").replace(/[<>]/g, "");
    const base = (cleanName.length >= 2 ? cleanName : emailName)
        .slice(0, 40)
        .padEnd(2, "_");

    for (let attempt = 0; attempt < 5; attempt++) {
        const username =
            attempt === 0 ? base : `${base}${crypto.randomInt(1000, 10000)}`;

        const [existingUsernameUser] = await pool.execute<
            (Pick<IUser, "id"> & RowDataPacket)[]
        >("SELECT id FROM users WHERE username = ?", [username]);

        if (!existingUsernameUser.length) {
            return username;
        }
    }

    return `${base}${crypto.randomBytes(4).toString("hex")}`;
}

export async function findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
}): Promise<number> {
    const [byGoogleId] = await pool.execute<
        (Pick<IUser, "id"> & RowDataPacket)[]
    >(`SELECT id FROM users WHERE google_id = ?`, [profile.googleId]);

    if (byGoogleId[0]) {
        return byGoogleId[0].id;
    }

    const [byEmail] = await pool.execute<
        (Pick<IUser, "id" | "google_id" | "is_verified"> & RowDataPacket)[]
    >(`SELECT id, google_id, is_verified FROM users WHERE email = ?`, [
        profile.email,
    ]);

    if (byEmail[0] && byEmail[0].is_verified) {
        await pool.execute(
            `
                UPDATE users 
                SET google_id = ?
                WHERE id = ?
            `,
            [profile.googleId, byEmail[0].id],
        );

        return byEmail[0].id;
    }

    if (byEmail[0]) {
        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET google_id = ?,
                    auth_provider = 'google',
                    password = NULL,
                    reset_token = NULL,
                    is_verified = TRUE,
                    verification_token = NULL,
                    verification_token_expires = NULL
                WHERE id = ? AND is_verified = FALSE
            `,
            [profile.googleId, byEmail[0].id],
        );

        if (result.affectedRows === 0) {
            throw new Error("Account state changed during Google sign-in");
        }

        return byEmail[0].id;
    }

    const username = await createUsername(profile);

    const [result] = await pool.execute<ResultSetHeader>(
        `
            INSERT INTO users 
                (
                    email, 
                    google_id, 
                    auth_provider, 
                    username,
                    password,
                    is_verified,
                    terms_accepted_at,
                    terms_version,
                    privacy_accepted_at,
                    privacy_version
                )
            VALUES (?, ?, 'google', ?, NULL, TRUE, ?, ?, ?, ?)
        `,
        [
            profile.email,
            profile.googleId,
            username,
            new Date(),
            process.env.TERMS_VERSION!,
            new Date(),
            process.env.PRIVACY_VERSION!,
        ],
    );

    return result.insertId;
}
