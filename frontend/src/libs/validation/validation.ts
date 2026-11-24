import { z } from "zod";

export const analysisSchema = z.strictObject({
    summary: z
        .string()
        .trim()
        .min(1, "Summary cannot be empty")
        .max(600, "Summary must be at most 600 characters"),
    suggestedPlaceIds: z
        .array(
            z.number().int().positive("Place ID must be a positive number"),
            "Suggested place IDs must be an array",
        )
        .min(1, "At least 1 suggested place ID is required")
        .max(15, "No more than 15 suggested place IDs are allowed"),
    recommendations: z
        .array(
            z.strictObject({
                type: z.enum(["order", "pace", "planning"]),
                message: z
                    .string()
                    .trim()
                    .min(1, "Message cannot be empty")
                    .max(400, "Message must be at most 400 characters"),
            }),
            "Recommendations must be an array",
        )
        .min(1, "At least 1 recommendation is required")
        .max(3, "No more than 3 recommendations are allowed"),
    warnings: z
        .array(
            z
                .string()
                .trim()
                .min(1, "Warning cannot be empty")
                .max(400, "Warning must be at most 400 characters"),
            "Warnings must be an array",
        )
        .max(3, "No more than 3 warnings are allowed"),
});

export const mfaVerifySchema = z.object({
    tempToken: z.string().min(1),
    token: z.string().trim().min(1, "Code is required").max(9),
});

export const mfaEnableSchema = z.object({
    token: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const mfaDisableSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be less than 50 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
            "Password must contain at least one special character",
        ),
    token: z.string().optional(),
});

export const mfaBackupCodesSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be less than 50 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
            "Password must contain at least one special character",
        ),
});

export const resendVerificationSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
});

export const emailCodeVerifySchema = z.object({
    intent: z.literal("verify"),
    tempToken: z
        .string()
        .trim()
        .min(1, "Session expired. Please log in again")
        .max(256, "Invalid session"),
    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const emailCodeResendSchema = z.object({
    intent: z.literal("resend"),
    tempToken: z
        .string()
        .trim()
        .min(1, "Session expired. Please log in again")
        .max(256, "Invalid session"),
});

export const emailCodeFormSchema = z.discriminatedUnion("intent", [
    emailCodeVerifySchema,
    emailCodeResendSchema,
]);

export const setPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm New Password must be the same as New Password",
        path: ["confirmPassword"],
    });

export const deleteAccountPasswordSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, "Invalid data")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "Invalid data",
        }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password must be less than 50 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
            "Password must contain at least one special character",
        ).optional(),
});

export const geminiApiKeySchema = z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{20,200}$/, "Invalid Gemini API key");

export const deleteAccountConfirmSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, "Invalid data")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "Invalid data",
        }),
    tempToken: z.string().min(1, "Session expired. Please start again"),
    code: z
        .string()
        .trim()
        .regex(
            /^(\d{6}|[A-Za-z0-9]{4}-[A-Za-z0-9]{4})$/,
            "Enter the 6-digit code or a backup code",
        ),
});

export const deleteAccountResendSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, "Invalid data")
        .transform(Number)
        .refine((value) => Number.isSafeInteger(value), {
            message: "Invalid data",
        }),
    tempToken: z.string().min(1),
});

export const sessionIdSchema = z.uuid();
