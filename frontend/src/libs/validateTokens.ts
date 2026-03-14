"use server";

import { getAccessToken, getRefreshToken } from "@/data/getToken";
import { refreshAccessToken } from "@/data/refreshAccessToken";

export const validateTokens = async (): Promise<boolean> => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    if (!accessToken) {
        await refreshAccessToken(401);

        return true;
    }

    return true;
};
