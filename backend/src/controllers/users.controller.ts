import { Response } from "express";
import { IGetUserRequest, IUser } from "../types/interfaces.js";
import {
    changePasswordSchema,
    updateProfileSchema,
    validateIdSchema,
} from "../validation/validation.js";
import { pool } from "../db/pool.js";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2";

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
        });
    } catch (error) {
        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const updateProfile = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = updateProfileSchema.parse(req.body);

        const { username, email } = validateData;
        const { id } = req.user;

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );

        if (email !== req.user.email && user.length) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        await pool.execute(
            "UPDATE users SET username = ?, email = ? WHERE id = ?",
            [username, email, id],
        );

        res.status(200).json({
            status: "success",
            message: "User data updated",
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

        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
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

        if (!user.length) {
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

        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const deleteAccount = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);

        const userId = +req.user.id;
        const paramId = +req.params.id;

        if (userId !== paramId) {
            res.status(401).json({
                status: "error",
                message: "Invalid id",
            });

            return;
        }

        const [user] = await pool.execute<IUser[]>(
            "SELECT * FROM users WHERE id = ?",
            [paramId],
        );

        if (!user.length) {
            res.status(401).json({
                status: "error",
                message: "Invalid id",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "DELETE FROM users WHERE id = ?",
            [paramId],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Account not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Account deleted",
        });
    } catch (error) {
        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};
