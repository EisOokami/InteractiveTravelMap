"use server";

import { z } from "zod";
import {
    confirmEmailChangeService,
    emailCodeResendService,
    emailCodeVerifyService,
    forgotPasswordService,
    googleExchangeService,
    loginService,
    mfaVerifyService,
    registerService,
    resendVerificationService,
    resetPasswordService,
} from "./services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    IBaseAction,
    IChangePasswordAction,
    IDeleteAccountAction,
    IEmailCodeAction,
    IForgotPasswordAction,
    ILoginAction,
    IMfaDisableAction,
    IMfaEnableAction,
    IMfaRegenerateBackupCodesAction,
    IRegisterAction,
    IResendVerificationAction,
    IResetPasswordAction,
    ISetPasswordAction,
    IUpdateProfileAction,
} from "@/interfaces/actions";
import { mutateData } from "./mutateData";
import { getUserData } from "./loaders";
import {
    analysisSchema,
    deleteAccountConfirmSchema,
    deleteAccountPasswordSchema,
    geminiApiKeySchema,
    deleteAccountResendSchema,
    emailCodeFormSchema,
    mfaBackupCodesSchema,
    mfaDisableSchema,
    mfaEnableSchema,
    mfaVerifySchema,
    resendVerificationSchema,
    sessionIdSchema,
    setPasswordSchema,
} from "@/libs/validation/validation";
import { revalidatePath } from "next/cache";
import { TravelMode } from "@/types/store";

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const loginSchema = z.object({
    email: z
        .email("Incorrect email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
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

export async function loginAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ILoginAction | undefined> {
    const tempToken = formData.get("tempToken");

    if (tempToken) {
        const cookieStore = await cookies();

        cookieStore.delete("google_mfa_challenge");

        const validatedFields = mfaVerifySchema.safeParse({
            tempToken,
            token: formData.get("token"),
        });

        if (!validatedFields.success) {
            return {
                formData,
                zodErrors: z.flattenError(validatedFields.error).fieldErrors,
                error: null,
                status: null,
                details: null,
                message: null,
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
            };
        }

        const responseData = await mfaVerifyService(validatedFields.data);

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: null,
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
            };
        }

        if (
            "message" in responseData &&
            "status" in responseData &&
            responseData.message &&
            responseData.status !== "success"
        ) {
            return {
                formData: null,
                zodErrors: null,
                error: null,
                status: responseData.status,
                details: null,
                message: responseData.message,
                data: {
                    requiresMfa: true,
                    tempToken: tempToken.toString(),
                },
            };
        }

        if ("refreshToken" in responseData && "accessToken" in responseData) {
            const cookieStore = await cookies();
            cookieStore.set(
                "refreshToken",
                responseData.refreshToken,
                refreshTokenConfig,
            );
            cookieStore.set(
                "accessToken",
                responseData.accessToken,
                accessTokenConfig,
            );

            redirect("/map");
        }

        return;
    }

    const validatedFields = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await loginService({
        ...validatedFields.data,
        ...(formData.get("acceptTerms") === "on" && { acceptTerms: true }),
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success" &&
        "data" in responseData
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("requiresMfa" in responseData && responseData.requiresMfa) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "success",
            details: null,
            message: null,
            data: {
                requiresMfa: responseData.requiresMfa,
                tempToken: responseData.tempToken,
            },
        };
    }

    if ("requiresEmailCode" in responseData && responseData.requiresEmailCode) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "success",
            details: null,
            message: null,
            data: {
                requiresEmailCode: responseData.requiresEmailCode,
                tempToken: responseData.tempToken,
            },
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();
        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        redirect("/map");
    }
}

const registerSchema = z.object({
    username: z
        .string()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username must be less than 50 characters"),
    email: z
        .email("Please enter a valid email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
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
    terms: z.literal("on", {
        message:
            "You must accept the Terms & Conditions and confirm that you have read the Privacy Policy",
    }),
    confirmAge: z.literal("on", {
        message: "You must confirm that you are at least 18 years old",
    }),
});

export async function registerAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IRegisterAction | undefined> {
    const validatedFields = registerSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        terms: formData.get("terms"),
        confirmAge: formData.get("confirmAge"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await registerService({
        username: validatedFields.data.username,
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        acceptTerms: true,
        confirmAge: true,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message
    ) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function logoutAction() {
    const responseData = await mutateData("POST", "/auth/logout").catch(
        (error) => {
            console.error(error);

            return undefined;
        },
    );

    if (!responseData) {
        console.error("Unauthorized or invalid token");
    }

    if (
        responseData &&
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        console.error(responseData.message);
    }

    const cookieStore = await cookies();

    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
    cookieStore.delete("csrfToken");
}

const updateProfileSchema = z.object({
    username: z
        .string()
        .trim()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username must be less than 50 characters"),
    email: z
        .email("Please enter a valid email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
    currentPassword: z
        .string()
        .max(50, "Password must be less than 50 characters")
        .optional(),
});

export async function updateProfileAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IUpdateProfileAction | undefined> {
    const currentPassword = formData.get("currentPassword");

    formData.delete("currentPassword");

    const user = await getUserData();

    if (user.status === "error" || !user.data) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "You are not logged in",
        };
    }

    const validatedFields = updateProfileSchema.safeParse({
        username: formData.get("username"),
        email: formData.get("email"),
        currentPassword: currentPassword || undefined,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        "/users/update-profile",
        validatedFields.data,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }
}

const confirmEmailChangeSchema = z.object({
    token: z
        .string()
        .regex(/^[a-f0-9]{64}$/, "Invalid or expired confirmation link"),
});

export async function confirmEmailChangeAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IBaseAction | undefined> {
    const validatedFields = confirmEmailChangeSchema.safeParse({
        token: formData.get("token"),
    });

    if (!validatedFields.success) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Invalid or expired confirmation link",
        };
    }

    const responseData = await confirmEmailChangeService(
        validatedFields.data.token,
    );

    if (!responseData) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData: null,
            zodErrors: null,
            error: responseData.error,
            status: "error",
            details: null,
            message: "Invalid or expired confirmation link",
        };
    }

    if ("message" in responseData && "status" in responseData) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: { stage: responseData.stage ?? null },
        };
    }
}

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Passwords are the same",
        path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm New Password must be the same as New Password",
        path: ["confirmPassword"],
    });

export async function changePasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IChangePasswordAction | undefined> {
    const user = await getUserData();

    if (user.status === "error" || !user.data) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "You are not logged in",
        };
    }

    const validatedFields = changePasswordSchema.safeParse({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData("POST", "/users/change-password", {
        currentPassword: validatedFields.data.currentPassword,
        newPassword: validatedFields.data.newPassword,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }
}

export async function deleteAccountAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IDeleteAccountAction | undefined> {
    const id = formData.get("id");
    const tempToken = formData.get("tempToken");
    const method = formData.get("method");
    const intent = formData.get("intent");

    if (tempToken) {
        const requiresMfa = method === "totp";
        const requiresEmailCode = method === "email";

        if (intent === "resend") {
            const validatedFields = deleteAccountResendSchema.safeParse({
                id: id,
                tempToken: tempToken,
            });

            if (!validatedFields.success) {
                return {
                    formData,
                    zodErrors: z.flattenError(validatedFields.error)
                        .fieldErrors,
                    error: null,
                    status: "error",
                    details: null,
                    message: "Invalid request. Please start again",
                    data: { requiresRestart: true },
                };
            }

            const responseData = await mutateData(
                "POST",
                `/users/${validatedFields.data.id}/delete/resend-code`,
                {
                    tempToken: validatedFields.data.tempToken,
                },
            );

            if (!responseData) {
                return {
                    formData,
                    zodErrors: null,
                    error: null,
                    status: "error",
                    details: null,
                    message: "Ops! Something went wrong. Please try again.",
                    data: {
                        tempToken,
                        requiresEmailCode: true,
                    },
                };
            }

            if (
                "message" in responseData &&
                "status" in responseData &&
                responseData.message &&
                responseData.status !== "success"
            ) {
                return {
                    formData,
                    zodErrors: null,
                    error: null,
                    status: responseData.status,
                    details: null,
                    message: responseData.message,
                    data: {
                        tempToken,
                        requiresEmailCode: true,
                        requiresRestart: responseData.data?.requiresRestart,
                        retryAfter: responseData.data?.retryAfter,
                    },
                };
            }

            return {
                formData,
                zodErrors: null,
                error: null,
                status: "success",
                details: null,
                message: "A new verification code has been sent",
                data: {
                    tempToken,
                    requiresEmailCode: true,
                    sentAt: Date.now(),
                },
            };
        }

        const validatedFields = deleteAccountConfirmSchema.safeParse({
            id: id,
            tempToken: tempToken,
            code: formData.get("code"),
        });

        if (!validatedFields.success) {
            return {
                formData,
                zodErrors: z.flattenError(validatedFields.error).fieldErrors,
                error: null,
                status: null,
                details: null,
                message: null,
                data: {
                    tempToken: tempToken,
                    requiresMfa: requiresMfa,
                    requiresEmailCode: requiresEmailCode,
                },
            };
        }

        const responseData = await mutateData(
            "POST",
            `/users/${validatedFields.data.id}/delete/confirm`,
            {
                tempToken: validatedFields.data.tempToken,
                code: validatedFields.data.code,
            },
        );

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: {
                    tempToken: tempToken,
                    requiresMfa: requiresMfa,
                    requiresEmailCode: requiresEmailCode,
                },
            };
        }

        if (
            "message" in responseData &&
            "status" in responseData &&
            responseData.message &&
            responseData.status !== "success"
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: responseData.status,
                details: null,
                message:
                    responseData.data?.attemptsLeft !== undefined
                        ? `${responseData.message}. Attempts left: ${responseData.data.attemptsLeft}`
                        : responseData.message,
                data: {
                    tempToken,
                    requiresMfa,
                    requiresEmailCode,
                    attemptsLeft: responseData.data?.attemptsLeft,
                    requiresRestart: responseData.data?.requiresRestart,
                },
            };
        }

        if ("error" in responseData && responseData.error) {
            return {
                formData,
                zodErrors: null,
                error: responseData.error,
                status: null,
                details: responseData.details,
                message: null,
                data: {
                    tempToken,
                    requiresMfa,
                    requiresEmailCode,
                },
            };
        }

        await logoutAction();

        const cookieStore = await cookies();

        cookieStore.set("deletedAccountId", String(validatedFields.data.id), {
            maxAge: 5 * 60,
            path: "/",
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        redirect("/map");
    }

    const validatedFields = deleteAccountPasswordSchema.safeParse({
        id: formData.get("id"),
        password: formData.get("password") || undefined,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        `/users/${validatedFields.data.id}/delete/initiate`,
        {
            password: validatedFields.data.password,
        },
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: responseData.data,
        };
    }
}

export async function addItemToFavoriteAction(
    placeId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const user = await getUserData();

    if (user.status === "error" || !user.data) {
        return {
            ok: false,
            message: "You are not logged in",
        };
    }

    const responseData = await mutateData("POST", "/favorites", {
        id: placeId,
    });

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to Add Place to Favorites",
        };
    }

    return {
        ok: true,
        message: "Place add to favorites",
    };
}

export async function removeItemFromFavoriteAction(
    placeId: number,
): Promise<{ ok: boolean; message: string } | undefined> {
    const user = await getUserData();

    if (user.status === "error" || !user.data) {
        return {
            ok: false,
            message: "You are not logged in",
        };
    }

    const responseData = await mutateData("DELETE", `/favorites/${placeId}`);

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            ok: responseData.status === "error" ? false : true,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to Delete Place from Favorites",
        };
    }

    return {
        ok: true,
        message: "Place delete from Favorites",
    };
}

const forgotPasswordSchema = z.object({
    email: z
        .email("Incorrect email address")
        .trim()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
});

export async function forgotPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IForgotPasswordAction | undefined> {
    const validatedFields = forgotPasswordSchema.safeParse({
        email: formData.get("email"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await forgotPasswordService(validatedFields.data);

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }
}

const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(50, "Password must be less than 50 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/\d/, "Password must contain at least one number")
            .regex(
                /[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?]/,
                "Password must contain at least one special character",
            ),
        id: z.string("Invalid data"),
        token: z
            .string("Invalid data")
            .trim()
            .min(60, "Invalid data")
            .max(70, "Invalid data"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Confirm New Password must be the same as New Password",
        path: ["confirmPassword"],
    });

export async function resetPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IResetPasswordAction | undefined> {
    const validatedFields = resetPasswordSchema.safeParse({
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
        id: formData.get("id"),
        token: formData.get("token"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await resetPasswordService({
        token: validatedFields.data.token,
        password: validatedFields.data.newPassword,
        id: +validatedFields.data.id,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.status === "success"
    ) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "success",
            details: null,
            message: responseData.message,
        };
    }
}

export async function analyzeTripDay(
    data: {
        day: string;
        places: {
            id: number;
            name: string;
            latitude: number;
            longitude: number;
        }[];
        travelMode: TravelMode;
        routeMetrics?: { distanceMeters: number; durationSeconds: number };
        preferences: {
            pace?: "relaxed" | "balanced" | "intensive";
            instructions?: string;
        };
    },
    geminiApiKey: string,
): Promise<{
    ok: boolean;
    message: string;
    analysis?: z.infer<typeof analysisSchema>;
}> {
    const validatedKey = geminiApiKeySchema.safeParse(geminiApiKey);

    if (!validatedKey.success) {
        return {
            ok: false,
            message: "Add a valid Gemini API key to use AI analysis",
        };
    }

    const responseData = await mutateData("POST", "/ai/trip-analyze", data, {
        "X-Gemini-Api-Key": validatedKey.data,
    });

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return { ok: false, message: responseData.message };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return { ok: false, message: "Failed to analyze the trip day" };
    }

    if (!("data" in responseData)) {
        return { ok: false, message: "Failed to analyze the trip day" };
    }

    const validatedFields = analysisSchema.safeParse(
        responseData.data.analysis,
    );

    if (!validatedFields.success) {
        console.error(validatedFields.error);

        return {
            ok: false,
            message:
                "AI could not provide a valid suggestion. Please try again later.",
        };
    }

    const originalIds = data.places.map((place) => place.id);
    const suggestedIds = validatedFields.data.suggestedPlaceIds;

    if (
        !(
            suggestedIds.length === originalIds.length &&
            new Set(suggestedIds).size === originalIds.length &&
            suggestedIds.every((id) => originalIds.includes(id))
        )
    ) {
        console.error("Invalid suggested stops");

        return {
            ok: false,
            message:
                "AI could not provide a valid suggestion. Please try again later.",
        };
    }

    return {
        ok: true,
        message: "Trip day analysis is ready",
        analysis: validatedFields.data,
    };
}

export async function mfaSetupAction(): Promise<IBaseAction | undefined> {
    const responseData = await mutateData("POST", "/auth/mfa/setup");

    if (!responseData) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData: null,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                qrCode: responseData.data.qrCode,
                manualEntryKey: responseData.data.manualEntryKey,
            },
        };
    }
}

export async function mfaEnableAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IMfaEnableAction | undefined> {
    const validatedFields = mfaEnableSchema.safeParse({
        token: formData.get("token"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData("POST", "/auth/mfa/enable", {
        token: validatedFields.data.token,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                enable: true,
            },
        };
    }
}

export async function mfaDisableAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IMfaDisableAction | undefined> {
    const validatedFields = mfaDisableSchema.safeParse({
        password: formData.get("password"),
        token: formData.get("token") || undefined,
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData("POST", "/auth/mfa/disable", {
        password: validatedFields.data.password,
        token: validatedFields.data.token,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    revalidatePath("/");
}

export async function mfaRegenerateBackupCodesAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IMfaRegenerateBackupCodesAction | undefined> {
    const validatedFields = mfaBackupCodesSchema.safeParse({
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData(
        "POST",
        "/auth/mfa/regenerate-backup-codes",
        { password: validatedFields.data.password },
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
            data: {
                backupCodes: responseData.data.backupCodes,
            },
        };
    }
}

export async function resendVerificationAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IResendVerificationAction | undefined> {
    const validatedFields = resendVerificationSchema.safeParse({
        email: formData.get("email"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await resendVerificationService(
        validatedFields.data.email,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function emailCodeAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<IEmailCodeAction> {
    const rawTempToken = formData.get("tempToken") ?? "";

    const validatedFields = emailCodeFormSchema.safeParse({
        intent: formData.get("intent") ?? "verify",
        tempToken: formData.get("tempToken") ?? "",
        code: formData.get("code"),
    });

    if (!validatedFields.success) {
        if (
            z.flattenError(validatedFields.error).fieldErrors.tempToken ||
            z.flattenError(validatedFields.error).fieldErrors.intent
        ) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message:
                    z.flattenError(validatedFields.error).fieldErrors
                        .tempToken?.[0] ??
                    "Invalid request. Please log in again",
                data: { tempToken: rawTempToken, requiresRelogin: true },
            };
        }

        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
            data: { tempToken: rawTempToken },
        };
    }

    if (validatedFields.data.intent === "resend") {
        const responseData = await emailCodeResendService(
            validatedFields.data.tempToken,
        );

        if (!responseData) {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: "Ops! Something went wrong. Please try again.",
                data: { tempToken: validatedFields.data.tempToken },
            };
        }

        if ("error" in responseData && responseData.error) {
            return {
                formData,
                zodErrors: null,
                error: responseData.error,
                status: null,
                details: responseData.details,
                message: null,
                data: { tempToken: validatedFields.data.tempToken },
            };
        }

        if ("status" in responseData && responseData.status !== "success") {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "error",
                details: null,
                message: responseData.message,
                data: {
                    tempToken: validatedFields.data.tempToken,
                    requiresRelogin: responseData.data?.requiresRelogin,
                    retryAfter: responseData.data?.retryAfter,
                },
            };
        }

        if ("status" in responseData && responseData.status === "success") {
            return {
                formData,
                zodErrors: null,
                error: null,
                status: "success",
                details: null,
                message: responseData.message,
                data: {
                    tempToken: validatedFields.data.tempToken,
                    sentAt: Date.now(),
                },
            };
        }
    }

    if (validatedFields.data.intent !== "verify") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message: "Ops! Something went wrong. Please try again.",
            data: { tempToken: validatedFields.data.tempToken },
        };
    }

    const responseData = await emailCodeVerifyService(
        validatedFields.data.tempToken,
        validatedFields.data.code,
    );

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
            data: { tempToken: validatedFields.data.tempToken },
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
            data: { tempToken: validatedFields.data.tempToken },
        };
    }

    if ("status" in responseData && responseData.status !== "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: "error",
            details: null,
            message:
                responseData.data?.attemptsLeft !== undefined
                    ? `${responseData.message}. Attempts left: ${responseData.data?.attemptsLeft}`
                    : responseData.message,
            data: {
                tempToken: validatedFields.data.tempToken,
                attemptsLeft: responseData.data?.attemptsLeft,
                requiresRelogin: responseData.data?.requiresRelogin,
            },
        };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();

        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        redirect("/map");
    }

    return {
        formData: null,
        zodErrors: null,
        error: null,
        status: "error",
        details: null,
        message: "Ops! Something went wrong. Please try again.",
        data: { tempToken: validatedFields.data.tempToken },
    };
}

export async function setPasswordAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prevState: any,
    formData: FormData,
): Promise<ISetPasswordAction | undefined> {
    const validatedFields = setPasswordSchema.safeParse({
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
        return {
            formData,
            zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            error: null,
            status: null,
            details: null,
            message: null,
        };
    }

    const responseData = await mutateData("POST", "/users/set-password", {
        newPassword: validatedFields.data.newPassword,
    });

    if (!responseData) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: null,
            details: null,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            formData,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        return {
            formData,
            zodErrors: null,
            error: responseData.error,
            status: null,
            details: responseData.details,
            message: null,
        };
    }

    revalidatePath("/");

    if ("status" in responseData && responseData.status === "success") {
        return {
            formData: null,
            zodErrors: null,
            error: null,
            status: responseData.status,
            details: null,
            message: responseData.message,
        };
    }
}

export async function acceptTermsAction(): Promise<{
    ok: boolean;
    message: string;
}> {
    const responseData = await mutateData("POST", "/users/me/accept-terms", {
        acceptTerms: true,
    }).catch((error) => {
        console.error(error);

        return undefined;
    });

    if (!responseData) {
        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.status === "success"
    ) {
        return { ok: true, message: responseData.message };
    }

    return {
        ok: false,
        message:
            "message" in responseData && responseData.message
                ? responseData.message
                : "Failed to accept the updated terms",
    };
}

export async function exchangeGoogleCodeAction(
    code: string,
): Promise<
    { ok: boolean; message: string; requiresMfa?: boolean } | undefined
> {
    const responseData = await googleExchangeService(code);

    if (!responseData) {
        console.error("Ops! Something went wrong. Please try again.");

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again or later",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status === "error"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData && responseData.error) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Failed to login",
        };
    }

    if ("requiresMfa" in responseData && responseData.tempToken) {
        const cookieStore = await cookies();

        cookieStore.set("google_mfa_challenge", responseData.tempToken, {
            maxAge: 5 * 60,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return { ok: true, message: responseData.message, requiresMfa: true };
    }

    if ("refreshToken" in responseData && "accessToken" in responseData) {
        const cookieStore = await cookies();
        cookieStore.set(
            "refreshToken",
            responseData.refreshToken,
            refreshTokenConfig,
        );
        cookieStore.set(
            "accessToken",
            responseData.accessToken,
            accessTokenConfig,
        );

        return { ok: true, message: "User logged in successfully" };
    }

    return {
        ok: false,
        message: "Failed to login",
    };
}

export async function revokeSessionAction(
    sessionId: string,
): Promise<
    | { ok: true; message: string; revokedCount: number }
    | { ok: false; message: string }
> {
    const validatedFields = sessionIdSchema.safeParse(sessionId);

    if (!validatedFields.success) {
        return {
            ok: false,
            message: "Session not found",
        };
    }

    const responseData = await mutateData(
        "DELETE",
        `/users/me/sessions/${sessionId}`,
    );

    if (!responseData) {
        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    return {
        ok: true,
        message: responseData.message,
        revokedCount: responseData.data?.revokedCount ?? 0,
    };
}

export async function revokeOtherSessionsAction(): Promise<
    | { ok: true; message: string; revokedCount: number }
    | { ok: false; message: string }
> {
    const responseData = await mutateData("DELETE", "/users/me/sessions");

    if (!responseData) {
        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    if (
        "message" in responseData &&
        "status" in responseData &&
        responseData.message &&
        responseData.status !== "success"
    ) {
        return {
            ok: false,
            message: responseData.message,
        };
    }

    if ("error" in responseData) {
        console.error(responseData.error);

        return {
            ok: false,
            message: "Ops! Something went wrong. Please try again.",
        };
    }

    return {
        ok: true,
        message: responseData.message,
        revokedCount: responseData.data?.revokedCount ?? 0,
    };
}
