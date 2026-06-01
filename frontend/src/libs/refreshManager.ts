"use server";

import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

const accessTokenConfig = {
    maxAge: 15 * 60,
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

let refreshInProgress: Promise<boolean> | null = null;

export const handleRefreshToken = async (): Promise<boolean> => {
    if (!refreshInProgress) {
        refreshInProgress = (async () => {
            try {
                const cookieStore = await cookies();
                const refreshToken = cookieStore.get("refreshToken")?.value;

                if (!refreshToken) {
                    cookieStore.delete("accessToken");
                    cookieStore.delete("refreshToken");

                    return false;
                }

                const response = await fetch(`${baseUrl}/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: `refreshToken=${refreshToken}`,
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    cookieStore.delete("accessToken");
                    cookieStore.delete("refreshToken");

                    return false;
                }

                const data = await response.json();

                if (data.status === "error") {
                    cookieStore.delete("accessToken");
                    cookieStore.delete("refreshToken");

                    console.error(data.message);

                    return false;
                }

                cookieStore.set(
                    "accessToken",
                    data.accessToken,
                    accessTokenConfig,
                );
                cookieStore.set(
                    "refreshToken",
                    data.refreshToken,
                    refreshTokenConfig,
                );

                return true;
            } catch (err) {
                console.error("Refresh token error", err);
                return false;
            } finally {
                refreshInProgress = null;
            }
        })();
    }

    return refreshInProgress;
};
