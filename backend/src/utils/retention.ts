import type { ResultSetHeader } from "mysql2";
import { pool } from "../db/pool.js";
import { logger } from "./logger.js";

const retentionIntervalMs = 60 * 60 * 1000;

const retentionQueries: { name: string; sql: string }[] = [
    {
        name: "user_sessions",
        sql: `
            DELETE FROM user_sessions
            WHERE expires_at < NOW() - INTERVAL 30 DAY
                OR (
                    revoked = 1
                    AND COALESCE(replaced_at, last_used_at) < NOW() - INTERVAL 30 DAY
                )
        `,
    },
    {
        name: "login_email_codes",
        sql: `DELETE FROM login_email_codes WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "mfa_login_sessions",
        sql: `DELETE FROM mfa_login_sessions WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "oauth_exchange_codes",
        sql: `DELETE FROM oauth_exchange_codes WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "account_deletion_sessions",
        sql: `DELETE FROM account_deletion_sessions WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "reset_tokens",
        sql: `
            UPDATE users
            SET reset_token = NULL,
                reset_token_expires_at = NULL
            WHERE reset_token IS NOT NULL
                AND (
                    reset_token_expires_at IS NULL
                    OR reset_token_expires_at < NOW()
                )
        `,
    },
    {
        name: "pending_email_changes",
        sql: `
            UPDATE users
            SET pending_email = NULL,
                email_change_stage = NULL,
                email_change_token_hash = NULL,
                email_change_expires_at = NULL
            WHERE email_change_expires_at < NOW()
        `,
    },
    {
        name: "unverified_users_favorites",
        sql: `
            DELETE favorites
            FROM favorites
            JOIN users ON users.id = favorites.user_id
            WHERE users.is_verified = 0
                AND users.google_id IS NULL
                AND COALESCE(users.verification_token_expires, users.created_at)
                    < NOW() - INTERVAL 7 DAY
        `,
    },
    {
        name: "unverified_users",
        sql: `
            DELETE FROM users
            WHERE is_verified = 0
                AND google_id IS NULL
                AND COALESCE(verification_token_expires, created_at)
                    < NOW() - INTERVAL 7 DAY
        `,
    },
];

export async function runRetentionCleanup(): Promise<Record<string, number>> {
    const removed: Record<string, number> = {};

    for (const query of retentionQueries) {
        try {
            const [result] = await pool.execute<ResultSetHeader>(query.sql);

            removed[query.name] = result.affectedRows;
        } catch (error) {
            logger.error(
                {
                    err: error,
                    event: "retention.cleanup_failed",
                    operation: query.name,
                },
                "Operation failed",
            );
        }
    }

    logger.info(
        { event: "retention.cleanup_completed", removed },
        "Retention cleanup completed",
    );

    return removed;
}

export function startRetentionJob(): NodeJS.Timeout {
    void runRetentionCleanup();

    const timer = setInterval(() => {
        void runRetentionCleanup();
    }, retentionIntervalMs);

    timer.unref();

    return timer;
}
