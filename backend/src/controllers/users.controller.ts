import { Request, Response } from "express";
import {
    IAccountDeletionSession,
    IGetUserRequest,
    IMfaBackupCode,
    IUser,
} from "../types/interfaces.js";
import {
    acceptTermsSchema,
    changePasswordSchema,
    confirmAccountDeletionSchema,
    confirmEmailChangeSchema,
    deleteAccountSchema,
    resendAccountDeletionSchema,
    setPasswordSchema,
    updateProfileSchema,
    validateParamsIdSchema,
} from "../validation/validation.js";
import { pool } from "../db/pool.js";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import dotenv from "dotenv";
import {
    generateEmailCode,
    hashDeletionCode,
    safeEqualHex,
} from "../utils/codes.js";
import { decryptMfaSecret, generateRawToken, hashToken } from "../utils/mfa.js";
import { OTP } from "otplib";
import { emailTemplate } from "../utils/emailTemplate.js";
import { transporter } from "../utils/email.js";
import { revokeAllUserSessions } from "../utils/jwt.js";
import {
    sendEmailChangeApproval,
    sendEmailChangeConfirmation,
    sendEmailChangedNotice,
} from "../utils/emailChangeEmails.js";
import { isTermsVersionCurrent } from "../utils/googleAuth.js";

dotenv.config({ quiet: true });

const otp = new OTP({ strategy: "totp" });

export const me = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.user;

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE id = ?",
            [id],
        );

        if (!user.length) {
            res.status(409).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "User found",
            id,
            email: user[0].email,
            username: user[0].username,
            mfa_enabled: user[0].mfa_enabled,
            auth_provider: user[0].auth_provider,
            requires_terms_acceptance: !isTermsVersionCurrent(user[0]),
            terms_version: process.env.TERMS_VERSION,
            privacy_version: process.env.PRIVACY_VERSION,
        });
    } catch (error) {
        req.log.error(
            { err: error, event: "user.me_failed", operation: "me" },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const acceptTerms = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        acceptTermsSchema.parse(req.body);

        const { id } = req.user;

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET terms_accepted_at = ?,
                    terms_version = ?,
                    privacy_accepted_at = ?,
                    privacy_version = ?
                WHERE id = ?
            `,
            [
                new Date(),
                process.env.TERMS_VERSION!,
                new Date(),
                process.env.PRIVACY_VERSION!,
                id,
            ],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        req.log.info(
            {
                event: "auth.terms_accepted",
                audit: true,
                userId: id,
                termsVersion: process.env.TERMS_VERSION,
                privacyVersion: process.env.PRIVACY_VERSION,
            },
            "Operation completed",
        );

        res.status(200).json({
            status: "success",
            message: "Terms accepted",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.accept_terms_failed",
                operation: "acceptTerms",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while accepting terms",
        });
    }
};

export const updateProfile = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = updateProfileSchema.parse(req.body);

        const { username, email, currentPassword } = validateData;

        const { id } = req.user;

        const [rows] = await pool.execute<
            (Pick<IUser, "id" | "username" | "email" | "password"> &
                RowDataPacket)[]
        >("SELECT id, username, email, password FROM users WHERE id = ?", [id]);

        const currentUser = rows[0];

        if (!currentUser) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const isEmailChanged = email !== currentUser.email.trim().toLowerCase();

        if (isEmailChanged && currentUser.password) {
            const isPasswordValid =
                !!currentPassword &&
                (await bcrypt.compare(currentPassword, currentUser.password));

            if (!isPasswordValid) {
                req.log.warn(
                    {
                        audit: true,
                        event: "user.password_verification_failed",
                        operation: "updateProfile",
                    },
                    "Password verification failed",
                );

                res.status(401).json({
                    status: "error",
                    message: "Enter your current password to change your email",
                });

                return;
            }
        }

        if (isEmailChanged) {
            const [emailOwner] = await pool.execute<
                (Pick<IUser, "id"> & RowDataPacket)[]
            >("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);

            if (emailOwner.length) {
                res.status(409).json({
                    status: "error",
                    message: "Email already in use",
                });

                return;
            }
        }

        if (username !== currentUser.username) {
            const [usernameOwner] = await pool.execute<
                (Pick<IUser, "id"> & RowDataPacket)[]
            >("SELECT id FROM users WHERE username = ? AND id != ?", [
                username,
                id,
            ]);

            if (usernameOwner.length) {
                res.status(409).json({
                    status: "error",
                    message: "Username already in use",
                });

                return;
            }

            await pool.execute("UPDATE users SET username = ? WHERE id = ?", [
                username,
                id,
            ]);
        }

        if (!isEmailChanged) {
            req.log.info(
                { event: "user.profile_updated", audit: true, userId: id },
                "Operation completed",
            );

            res.status(200).json({
                status: "success",
                message: "User data updated",
            });

            return;
        }

        const approvalToken = generateRawToken();

        await pool.execute(
            `
                UPDATE users
                SET pending_email = ?,
                    email_change_stage = 'current',
                    email_change_token_hash = ?,
                    email_change_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
                WHERE id = ?
            `,
            [email, hashToken(approvalToken), id],
        );

        try {
            await sendEmailChangeApproval(
                username,
                currentUser.email,
                email,
                approvalToken,
            );
        } catch (error) {
            req.log.error(
                {
                    err: error,
                    event: "email.delivery_failed",
                    operation: "updateProfile",
                },
                "Operation failed",
            );

            res.status(500).json({
                status: "error",
                message:
                    "Failed to send the confirmation email. Please try again.",
            });

            return;
        }

        req.log.info(
            { event: "user.email_change_requested", audit: true, userId: id },
            "Email change requested",
        );

        res.status(200).json({
            status: "success",
            message:
                "To change your email, open the link we sent to your current address. After that we will send a confirmation link to the new one.",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.update_profile_failed",
                operation: "updateProfile",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const confirmEmailChange = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { token } = confirmEmailChangeSchema.parse(req.body);

        const tokenHash = hashToken(token);

        const [rows] = await pool.execute<
            (Pick<
                IUser,
                | "id"
                | "username"
                | "email"
                | "pending_email"
                | "email_change_stage"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, username, email, pending_email, email_change_stage
                FROM users
                WHERE email_change_token_hash = ?
                    AND email_change_expires_at > NOW()
                    AND pending_email IS NOT NULL
            `,
            [tokenHash],
        );

        const user = rows[0];

        if (!user || !user.pending_email || !user.email_change_stage) {
            req.log.warn(
                {
                    audit: true,
                    event: "user.email_change_rejected",
                    reason: "invalid_or_expired",
                },
                "Email change rejected",
            );

            res.status(400).json({
                status: "error",
                message: "Invalid or expired confirmation link",
            });

            return;
        }

        if (user.email_change_stage === "current") {
            const confirmationToken = generateRawToken();

            const [result] = await pool.execute<ResultSetHeader>(
                `
                    UPDATE users
                    SET email_change_stage = 'new',
                        email_change_token_hash = ?,
                        email_change_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
                    WHERE id = ?
                        AND email_change_token_hash = ?
                        AND email_change_stage = 'current'
                `,
                [hashToken(confirmationToken), user.id, tokenHash],
            );

            if (result.affectedRows === 0) {
                res.status(400).json({
                    status: "error",
                    message: "Invalid or expired confirmation link",
                });

                return;
            }

            try {
                await sendEmailChangeConfirmation(
                    user.username,
                    user.pending_email,
                    confirmationToken,
                );
            } catch (error) {
                req.log.error(
                    {
                        err: error,
                        event: "email.delivery_failed",
                        operation: "confirmEmailChange",
                    },
                    "Operation failed",
                );

                res.status(500).json({
                    status: "error",
                    message:
                        "Failed to send the confirmation email to the new address. Please change your email again.",
                });

                return;
            }

            req.log.info(
                {
                    event: "user.email_change_approved",
                    audit: true,
                    userId: user.id,
                },
                "Email change approved from the current address",
            );

            res.status(200).json({
                status: "success",
                stage: "new",
                message:
                    "Change approved. Open the link we sent to the new address to finish it.",
            });

            return;
        }

        const [emailOwner] = await pool.execute<
            (Pick<IUser, "id"> & RowDataPacket)[]
        >("SELECT id FROM users WHERE email = ? AND id != ?", [
            user.pending_email,
            user.id,
        ]);

        if (emailOwner.length) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET email = pending_email,
                    pending_email = NULL,
                    email_change_stage = NULL,
                    email_change_token_hash = NULL,
                    email_change_expires_at = NULL,
                    reset_token = NULL,
                    reset_token_expires_at = NULL,
                    is_verified = TRUE
                WHERE id = ?
                    AND email_change_token_hash = ?
                    AND email_change_stage = 'new'
            `,
            [user.id, tokenHash],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Invalid or expired confirmation link",
            });

            return;
        }

        await revokeAllUserSessions(user.id);
        await pool.execute("DELETE FROM login_email_codes WHERE user_id = ?", [
            user.id,
        ]);

        req.log.info(
            { event: "user.email_changed", audit: true, userId: user.id },
            "Email changed",
        );

        sendEmailChangedNotice(
            user.username,
            user.email,
            user.pending_email,
        ).catch((error: unknown) => {
            req.log.error(
                {
                    err: error,
                    event: "email.delivery_failed",
                    operation: "confirmEmailChange",
                },
                "Operation failed",
            );
        });

        res.status(200).json({
            status: "success",
            stage: "done",
            message:
                "Your email address has been changed. Sign in again with the new address.",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid or expired confirmation link",
            });

            return;
        }

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ER_DUP_ENTRY"
        ) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.confirm_email_change_failed",
                operation: "confirmEmailChange",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while changing the email address",
        });
    }
};

export const changePassword = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = changePasswordSchema.parse(req.body);

        const { currentPassword, newPassword } = validateData;

        const { id } = req.user;

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE id = ?",
            [id],
        );

        if (!user.length || !user[0].password) {
            res.status(401).json({
                status: "error",
                message: "Invalid data",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user[0].password,
        );

        if (!isPasswordValid) {
            req.log.warn(
                { audit: true, event: "user.password_verification_failed" },
                "Password verification failed",
            );

            res.status(401).json({
                status: "error",
                message: "Invalid password",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "fail",
                message: "User not found",
            });

            return;
        }

        req.log.info(
            { event: "user.password_changed", audit: true, userId: id },
            "Operation completed",
        );

        res.status(200).json({
            status: "success",
            message: "Password updated",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.change_password_failed",
                operation: "changePassword",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const initiateAccountDeletion = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateParamsIdSchema.parse(req.params);

        const userId = +req.user.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid ID",
            });

            return;
        }

        const paramId = +id;

        if (userId !== paramId) {
            req.log.warn(
                {
                    audit: true,
                    event: "security.authorization_failed",
                    operation: "initiateAccountDeletion",
                },
                "Authorization denied",
            );

            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const validatedData = deleteAccountSchema.parse(req.body);

        const [users] = await pool.execute<
            (Pick<
                IUser,
                | "id"
                | "password"
                | "email"
                | "username"
                | "mfa_enabled"
                | "auth_provider"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, password, email, username, mfa_enabled, auth_provider
                FROM users
                WHERE id = ?
            `,
            [paramId],
        );

        const user = users[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (user.auth_provider !== "google" || user.password) {
            if (!validatedData.password || !user.password) {
                res.status(401).json({
                    status: "error",
                    message: "Incorrect password",
                });

                return;
            }

            const isPasswordValid = await bcrypt.compare(
                validatedData.password,
                user.password,
            );

            if (!isPasswordValid) {
                req.log.warn(
                    {
                        audit: true,
                        event: "user.password_verification_failed",
                        operation: "initiateAccountDeletion",
                    },
                    "Password verification failed",
                );

                res.status(401).json({
                    status: "error",
                    message: "Incorrect password",
                });

                return;
            }
        }

        await pool.execute(
            `DELETE FROM account_deletion_sessions WHERE user_id = ?`,
            [paramId],
        );

        const rawTempToken = generateRawToken();
        const tempTokenHash = hashToken(rawTempToken);

        if (
            (user.auth_provider !== "google" || user.password) &&
            user.mfa_enabled
        ) {
            await pool.execute<ResultSetHeader>(
                `
                    INSERT INTO account_deletion_sessions
                        (token_hash, user_id, method, expires_at)
                    VALUES (?, ?, 'totp', DATE_ADD(NOW(), INTERVAL ? MINUTE))
                `,
                [tempTokenHash, paramId, 10],
            );

            req.log.debug(
                {
                    event: "user.challenge_created",
                    userId: paramId,
                    method: "totp",
                    operation: "initiateAccountDeletion",
                },
                "Account deletion challenge created",
            );

            res.status(200).json({
                status: "success",
                message:
                    "Enter the code from your authenticator app to confirm",
                data: {
                    requiresMfa: true,
                    tempToken: rawTempToken,
                },
            });

            return;
        }

        const code = generateEmailCode();

        await pool.execute<ResultSetHeader>(
            `
                INSERT INTO account_deletion_sessions
                    (token_hash, user_id, method, code_hash, expires_at)
                VALUES (?, ?, 'email', ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
            `,
            [tempTokenHash, paramId, hashDeletionCode(paramId, code), 10],
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `${code} - confirm account deletion`,
            html: emailTemplate({
                logo: "cid:app-logo",
                title: "Account deletion code",
                heading: `Hi, ${user.username}!`,
                description: `
                        Use this code to confirm deleting your account:
                        <br />
                        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                        It expires in 10 minutes.
                    `,
                footer: "If this wasn't you, please change your password immediately and contact support.",
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: "./assets/generallogo.png",
                    cid: "app-logo",
                },
            ],
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                req.log.error(
                    {
                        err: error,
                        event: "email.delivery_failed",
                        operation: "initiateAccountDeletion",
                    },
                    "Operation failed",
                );

                if (!res.headersSent) {
                    res.status(500).send({
                        status: "error",
                        message: "Error sending email",
                    });
                }
            } else {
                req.log.debug(
                    {
                        event: "email.sent",
                        operation: "initiateAccountDeletion",
                    },
                    "Email accepted by transport",
                );
            }
        });

        req.log.debug(
            {
                event: "user.challenge_created",
                userId: paramId,
                method: "email",
                operation: "initiateAccountDeletion",
            },
            "Account deletion challenge created",
        );

        res.status(200).json({
            status: "success",
            message: "Verification code sent to your email",
            data: {
                requiresEmailCode: true,
                tempToken: rawTempToken,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.initiate_account_deletion_failed",
                operation: "initiateAccountDeletion",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while starting account deletion",
        });
    }
};

export const confirmAccountDeletion = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateParamsIdSchema.parse(req.params);

        const { tempToken, code } = confirmAccountDeletionSchema.parse(
            req.body,
        );

        const userId = +req.user.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid ID",
            });

            return;
        }

        const paramId = +id;

        if (userId !== paramId) {
            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const tokenHash = hashToken(tempToken);

        const [bump] = await pool.execute<ResultSetHeader>(
            `
                UPDATE account_deletion_sessions
                SET attempts = attempts + 1
                WHERE token_hash = ?
                    AND user_id = ?
                    AND expires_at > NOW()
                    AND attempts < ?
            `,
            [tokenHash, paramId, 5],
        );

        if (bump.affectedRows === 0) {
            res.status(401).json({
                status: "error",
                message:
                    "Code expired or too many attempts. Please start again",
                data: { requiresRestart: true },
            });

            return;
        }

        const [sessions] = await pool.execute<
            (Pick<
                IAccountDeletionSession,
                "id" | "user_id" | "method" | "code_hash" | "attempts"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, user_id, method, code_hash, attempts
                FROM account_deletion_sessions
                WHERE token_hash = ?
            `,
            [tokenHash],
        );

        const session = sessions[0];

        if (!session) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired session",
                data: { requiresRestart: true },
            });

            return;
        }

        let isCodeValid = false;

        if (session.method === "email") {
            isCodeValid =
                session.code_hash !== null &&
                safeEqualHex(
                    session.code_hash,
                    hashDeletionCode(paramId, code),
                );
        }

        if (session.method !== "email") {
            const [userRows] = await pool.execute<
                (Pick<IUser, "id" | "mfa_secret" | "password"> &
                    RowDataPacket)[]
            >("SELECT id, mfa_secret, password FROM users WHERE id = ?", [
                paramId,
            ]);

            const user = userRows[0];

            if (!user || !user.password) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                });

                return;
            }

            if (user.mfa_secret && /^\d{6}$/.test(code)) {
                const decryptedSecret = decryptMfaSecret(user.mfa_secret);

                const result = await otp.verify({
                    token: code,
                    secret: decryptedSecret,
                    epochTolerance: 1,
                });

                isCodeValid = result.valid;
            }

            if (user.mfa_secret && !/^\d{6}$/.test(code)) {
                const codeHash = hashToken(code.toUpperCase());

                const [backupRows] = await pool.execute<
                    (Pick<IMfaBackupCode, "id"> & RowDataPacket)[]
                >(
                    `
                        SELECT id
                        FROM mfa_backup_codes
                        WHERE user_id = ? AND code_hash = ? AND used_at IS NULL
                    `,
                    [paramId, codeHash],
                );

                const backupCode = backupRows[0];

                if (backupCode) {
                    const [updateResult] = await pool.execute<ResultSetHeader>(
                        "UPDATE mfa_backup_codes SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
                        [backupCode.id],
                    );

                    isCodeValid = updateResult.affectedRows > 0;
                }
            }
        }

        if (!isCodeValid) {
            req.log.warn(
                {
                    audit: true,
                    event: "account.deletion_verification_failed",
                    operation: "confirmAccountDeletion",
                    userId: paramId,
                },
                "Verification rejected",
            );

            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
                data: {
                    attemptsLeft: 5 - session.attempts,
                },
            });

            return;
        }

        const [deleteRows] = await pool.execute<ResultSetHeader>(
            `DELETE FROM account_deletion_sessions WHERE id = ?`,
            [session.id],
        );

        if (deleteRows.affectedRows === 0) {
            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
            });

            return;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await connection.execute<ResultSetHeader>(
                "DELETE FROM favorites WHERE user_id = ?",
                [paramId],
            );

            const [result] = await connection.execute<ResultSetHeader>(
                "DELETE FROM users WHERE id = ?",
                [paramId],
            );

            if (result.affectedRows === 0) {
                await connection.rollback();

                res.status(404).json({
                    status: "error",
                    message: "Account not found",
                });

                return;
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();

            throw error;
        } finally {
            connection.release();
        }

        req.log.info(
            { event: "user.deleted", audit: true, userId },
            "Operation completed",
        );

        res.status(200).json({
            status: "success",
            message: "The account has been successfully deleted",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.confirm_account_deletion_failed",
                operation: "confirmAccountDeletion",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while deleting account",
        });
    }
};

export const resendAccountDeletionCode = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateParamsIdSchema.parse(req.params);

        const { tempToken } = resendAccountDeletionSchema.parse(req.body);

        const { id } = req.params;
        const userId = +req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid ID",
            });

            return;
        }

        const paramId = +id;

        if (userId !== paramId) {
            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const tokenHash = hashToken(tempToken);

        const [sessions] = await pool.execute<
            (Pick<
                IAccountDeletionSession,
                "id" | "user_id" | "method" | "attempts"
            > & { seconds_since_sent: number } & Pick<
                    IUser,
                    "email" | "username"
                > &
                RowDataPacket)[]
        >(
            `
                SELECT
                    s.id,
                    s.user_id,
                    s.method,
                    s.attempts,
                    TIMESTAMPDIFF(SECOND, s.last_sent_at, NOW()) AS seconds_since_sent,
                    u.email,
                    u.username
                FROM account_deletion_sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = ? AND s.user_id = ?
            `,
            [tokenHash, paramId],
        );

        const session = sessions[0];

        if (!session || session.method !== "email") {
            res.status(401).json({
                status: "error",
                message: "Session expired. Please start again",
                data: { requiresRestart: true },
            });

            return;
        }

        if (session.seconds_since_sent < 60) {
            res.status(429).json({
                status: "error",
                message: "Please wait before requesting a new code",
                data: {
                    retryAfter: 60 - session.seconds_since_sent,
                },
            });

            return;
        }

        const code = generateEmailCode();

        await pool.execute(
            `
                UPDATE account_deletion_sessions
                SET code_hash = ?,
                    attempts = 0,
                    last_sent_at = NOW(),
                    expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                WHERE id = ?
            `,
            [hashDeletionCode(paramId, code), 10, session.id],
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: session.email,
            subject: `${code} - confirm account deletion`,
            html: emailTemplate({
                logo: "cid:app-logo",
                title: "Account deletion code",
                heading: `Hi, ${session.username}!`,
                description: `
                        Use this code to confirm deleting your account:
                        <br />
                        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                        It expires in 10 minutes.
                    `,
                footer: "If this wasn't you, please change your password immediately and contact support.",
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: "./assets/generallogo.png",
                    cid: "app-logo",
                },
            ],
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                req.log.error(
                    {
                        err: error,
                        event: "email.delivery_failed",
                        operation: "resendAccountDeletionCode",
                    },
                    "Operation failed",
                );

                if (!res.headersSent) {
                    res.status(500).send({
                        status: "error",
                        message: "Error sending email",
                    });
                }
            } else {
                req.log.debug(
                    {
                        event: "email.sent",
                        operation: "resendAccountDeletionCode",
                    },
                    "Email accepted by transport",
                );
            }
        });

        res.status(200).json({
            status: "success",
            message: "A new verification code has been sent",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.resend_account_deletion_code_failed",
                operation: "resendAccountDeletionCode",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while resending code",
        });
    }
};

export const setPassword = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = setPasswordSchema.parse(req.body);

        const { newPassword } = validateData;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [rows] = await pool.execute<
            (Pick<IUser, "id" | "password"> & RowDataPacket)[]
        >("SELECT id, password FROM users WHERE id = ?", [userId]);

        const user = rows[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (user.password) {
            res.status(400).json({
                status: "error",
                message: "Password already set. Use change password instead.",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET password = ?, auth_provider = 'local' WHERE id = ?",
            [hashedPassword, userId],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to set password",
            });

            return;
        }

        req.log.info(
            { event: "user.password_set", audit: true, userId },
            "Operation completed",
        );

        res.status(200).json({
            status: "success",
            message: "Password set successfully",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.set_password_failed",
                operation: "setPassword",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while setting password",
        });
    }
};
