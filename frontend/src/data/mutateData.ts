import "server-only";

import { getAccessToken, getRefreshToken } from "./getToken";
import { fetchWithRefresh } from "./fetchWithRefresh";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

export async function mutateData(
    method: string,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    extraHeaders?: Record<string, string>,
): Promise<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { status: "error" | "message" | "success"; message: string; data?: any }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken) throw new Error("No auth token found");
    if (!refreshToken) throw new Error("No auth token found");

    const url = new URL(path, baseUrl);

    try {
        const response = await fetchWithRefresh(
            url,
            accessToken,
            refreshToken,
            {
                method,
                ...(payload && {
                    body: JSON.stringify({ ...payload }),
                }),
                ...(extraHeaders && { headers: extraHeaders }),
            },
        );

        if (
            method === "DELETE" &&
            !response.headers.get("content-type")?.includes("application/json")
        ) {
            return {
                status: response.ok ? "success" : "error",
                message: response.ok ? "Success" : "Error",
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}
