import { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IUser } from "../types/interfaces.js";
import { pool } from "../db/pool.js";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../validation/validation.js";
import { ZodError } from "zod";
import { ResultSetHeader } from "mysql2";
import { transporter } from "../utils/email.js";
import {
    createAccessToken,
    createRefreshToken,
    revokeAllUserTokens,
} from "../utils/jwt.js";
import { jwtVerify } from "jose";

dotenv.config();

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = registerSchema.parse(req.body);

        const { username, email, password } = validateData;

        const [existingEmailUser] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );

        if (existingEmailUser.length) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        const [existingUsernameUser] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE username = ?",
            [username],
        );

        if (existingUsernameUser.length) {
            res.status(409).json({
                status: "error",
                message: "Username already in use",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to register",
            });

            return;
        }

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );

        const accessToken = await createAccessToken({
            id: user[0].id,
        });

        const refreshToken = await createRefreshToken(user[0].id.toString());

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            accessToken,
            refreshToken,
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

        console.error("Registration error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during registration",
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = loginSchema.parse(req.body);

        const { email, password } = validateData;

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );

        if (!user.length) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user[0].password,
        );

        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });

            return;
        }

        const accessToken = await createAccessToken({
            id: user[0].id,
        });

        const refreshToken = await createRefreshToken(user[0].id.toString());

        res.status(200).json({
            status: "success",
            message: "Login successful",
            accessToken,
            refreshToken,
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

        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during login",
        });
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const validateData = forgotPasswordSchema.parse(req.body);

        const { email } = validateData;

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );

        if (!user.length) {
            res.status(401).json({
                status: "error",
                message: "Invalid email",
            });

            return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(token, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET reset_token = ? WHERE id = ?",
            [hash, user[0].id],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Something went wrong... Try again",
            });

            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Click the following link to reset your password: ${process.env.WEB_URL}/resetPassword?token=${token}&id=${user[0].id}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send({
                    status: "error",
                    message: "Error sending email",
                });
            } else {
                console.log(`Email sent: ${info.response}`);
                res.status(200).send({
                    status: "message",
                    message:
                        "Check your email for instructions on resetting your password",
                });
            }
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

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const validateData = resetPasswordSchema.parse(req.body);

        const { token, password, id } = validateData;

        const [existingIdUser] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE id = ?",
            [id],
        );

        if (!existingIdUser.length) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        if (!existingIdUser[0].reset_token) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        const isTokenValid = await bcrypt.compare(
            token,
            existingIdUser[0].reset_token,
        );

        if (!isTokenValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [updatePasswordQuery] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id],
        );

        if (updatePasswordQuery.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to reset password",
            });

            return;
        }

        const [deleteTokenQuery] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET reset_token = ? WHERE id = ?",
            [null, id],
        );

        if (deleteTokenQuery.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to reset password",
            });

            return;
        }

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE password = ?",
            [hashedPassword],
        );

        const accessToken = await createAccessToken({
            id: user[0].id,
        });

        const refreshToken = await createRefreshToken(user[0].id.toString());

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user[0].email,
            subject: "Password Reset Successfully",
            text: `Your password has been changed successfully`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send({
                    status: "error",
                    message: "Error sending email",
                });
            } else {
                console.log(`Email sent: ${info.response}`);
            }
        });

        res.status(201).json({
            status: "success",
            message: "Password Reset successfully",
            accessToken,
            refreshToken,
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

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const { payload } = await jwtVerify(refreshToken, refreshSecret);
        const jti = payload.jti;
        const userId = payload.sub;

        const [refreshTokenRows] = await pool.execute<IUser[]>(
            "SELECT * FROM refresh_tokens WHERE id = ?",
            [jti],
        );

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        if (!refreshTokenRows.length) {
            await revokeAllUserTokens(userId);

            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const storedToken = refreshTokenRows[0];

        if (storedToken.revoked) {
            console.log("revoked");

            await revokeAllUserTokens(userId);

            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE refresh_tokens SET revoked = true WHERE id = ?",
            [jti],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const newAccessToken = await createAccessToken({ id: userId });
        const newRefreshToken = await createRefreshToken(userId);

        res.status(201).json({
            status: "success",
            message: "Token is refresh",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid token",
                details: errorMessages,
            });

            return;
        }

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const { payload } = await jwtVerify(refreshToken, refreshSecret);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE refresh_tokens SET revoked = true WHERE id = ?",
            [payload.jti],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to reset password",
            });

            return;
        }

        res.status(201).json({
            status: "success",
            message: "Logout successfully",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid token",
                details: errorMessages,
            });

            return;
        }

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
