"use server";

import { IPosition } from "@/interfaces/interfaces";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

async function fetchData(url: string) {
    const headers = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    };

    try {
        const response = await fetch(url, headers);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export async function getPositionsData(): Promise<IPosition[]> {
    const url = new URL("/positions", baseUrl);

    const fetchedData = await fetchData(url.href);

    return fetchedData;
}
