"use server";

import { handleRefreshToken } from "@/libs/refreshManager";
import { cookies } from "next/headers";

export async function refreshAccessToken(status: number) {
    if (status !== 401) {
        return;
    }

    const success = await handleRefreshToken();

    if (!success) {
        const cookieStore = await cookies();

        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
    }
}
