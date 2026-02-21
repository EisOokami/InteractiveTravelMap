"use server";

import { IPlace, IUser } from "@/interfaces/interfaces";
import { getAccessToken } from "./getToken";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

async function fetchData(url: string) {
    const accessToken = await getAccessToken();

    const headers = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };

    try {
        const response = await fetch(url, accessToken ? headers : {});

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
        },
    };
}
