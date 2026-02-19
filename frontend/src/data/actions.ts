"use server";

import { z } from "zod";
import { loginService } from "./services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ILoginAction } from "@/interfaces/actions";

const accessTokenConfig = {
    maxAge: 15 * 60 * 1000,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
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

    const responseData = await loginService(validatedFields.data);

    console.log(responseData);

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
