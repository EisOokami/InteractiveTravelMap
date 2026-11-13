"use server";

import { IPlace, IUser, IUserSession } from "@/interfaces/interfaces";
import { getAccessToken, getRefreshToken } from "./getToken";
import { fetchWithRefresh } from "./fetchWithRefresh";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

async function fetchData(url: string, options?: RequestInit) {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    try {
        const response = await fetchWithRefresh(
            url,
            accessToken,
            refreshToken,
            options,
        );

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export async function getPlacesData(
    queryParams?: Record<string, string | number | boolean>,
): Promise<IPlace[]> {
    const url = new URL("/places", baseUrl);

    if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
        });
    }

    const fetchedData = await fetchData(url.href);

    if (fetchedData.error) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.error,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getPlaceData(placeId: number | string): Promise<IPlace> {
    const url = new URL(`/places/${placeId}`, baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.error) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.error,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getUserData(): Promise<IUser> {
    const url = new URL("/users/me", baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.status === "error") {
        return {
            status: fetchedData.status,
            message: fetchedData.message,
            data: null,
        };
    }

    return {
        status: fetchedData.status,
        message: fetchedData.message,
        data: {
            id: fetchedData.id,
            username: fetchedData.username,
            email: fetchedData.email,
            mfa_enabled: fetchedData.mfa_enabled,
            auth_provider: fetchedData.auth_provider,
        },
    };
}

export async function getFavoritesData(): Promise<IPlace[]> {
    const user = await getUserData();

    if (user.status === "error") {
        return [];
    }

    const url = new URL("/favorites", baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.error) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.error,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getVerifyEmailData(
    token: string,
): Promise<
    | { status: "success"; message: string }
    | { status: "error"; message: string }
> {
    if (!token) {
        return { status: "error", message: "Token missing" };
    }

    const url = new URL(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        baseUrl,
    );

    const fetchedData = await fetchData(url.href, { cache: "no-store" });

    if (fetchedData.status === "error") {
        return {
            status: "error",
            message:
                fetchedData.message || "Unable to verify the email address",
        };
    }

    return fetchedData;
}

export async function getUserSessionsData(): Promise<
    | { status: "success"; message: string; data: IUserSession[] }
    | { status: "error"; message: string }
> {
    const url = new URL("/users/me/sessions", baseUrl);

    const fetchedData = await fetchData(url.href, { cache: "no-store" });

    if (fetchedData.status === "error") {
        return {
            status: "error",
            message: fetchedData.message,
        };
    }

    return {
        status: "success",
        message: fetchedData.message,
        data: fetchedData.data,
    };
}
