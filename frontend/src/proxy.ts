import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshAccessToken } from "./data/refreshAccessToken";
import { bffHeaders } from "./data/clientIp";

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
const csrfTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const protectedAuthRoutes = ["/signIn", "/signUp"];

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

function isProtectedAuthRoute(path: string): boolean {
    return protectedAuthRoutes.some((route) => path.startsWith(route));
}

async function isAccessTokenValid(
    accessToken: string,
    forwardedHeaders: Record<string, string>,
): Promise<boolean> {
    try {
        const response = await fetch(new URL("/users/me", baseUrl), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...forwardedHeaders,
            },
            cache: "no-store",
        });

        return response.status !== 401;
    } catch {
        return true;
    }
}

export async function proxy(request: NextRequest) {
    const currentPath = request.nextUrl.pathname;
    let accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const csrfToken = request.cookies.get("csrfToken")?.value;
    let tokens = null;
    let isSessionExpired = false;
    let isRefreshUnavailable = false;
    const forwardedHeaders = bffHeaders(request.headers);

    if (
        accessToken &&
        !(await isAccessTokenValid(accessToken, forwardedHeaders))
    ) {
        accessToken = undefined;
    }

    if (!accessToken && refreshToken && csrfToken) {
        const refreshResult = await refreshAccessToken(
            refreshToken,
            csrfToken,
            request.headers.get("user-agent") ?? undefined,
            forwardedHeaders,
        );

        if (refreshResult.status === "success") {
            tokens = refreshResult;
            accessToken = tokens.accessToken;
        }

        if (refreshResult.status === "rejected") {
            isSessionExpired = true;
        }

        if (refreshResult.status === "unavailable") {
            isRefreshUnavailable = true;
        }
    }

    if (isProtectedAuthRoute(currentPath) && accessToken) {
        return NextResponse.redirect(new URL("/map", request.url));
    }

    if (tokens) {
        request.cookies.set("accessToken", tokens.accessToken);
        request.cookies.set("refreshToken", tokens.refreshToken);
        request.cookies.set("csrfToken", tokens.csrfToken);
    }

    if (isSessionExpired || isRefreshUnavailable) {
        request.cookies.delete("accessToken");
        request.cookies.delete("refreshToken");
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = `
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
            style-src 'self' 'nonce-${nonce}';
            style-src-attr 'self' 'unsafe-inline';
            img-src 'self' http://127.0.0.1:3001 http://localhost:3001 https://*.tile.openstreetmap.org https://api.mapbox.com https://tile.thunderforest.com blob: data:;
            connect-src 'self' http://127.0.0.1:3001 http://localhost:3001 https://api.mapbox.com;
            font-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
        `
        .replace(/\s{2,}/g, " ")
        .trim();

    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, " ")
        .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    requestHeaders.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
    );

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (tokens) {
        response.cookies.set(
            "accessToken",
            tokens.accessToken,
            accessTokenConfig,
        );
        response.cookies.set(
            "refreshToken",
            tokens.refreshToken,
            refreshTokenConfig,
        );
        response.cookies.set("csrfToken", tokens.csrfToken, csrfTokenConfig);
    }

    if (isSessionExpired) {
        response.cookies.set("accessToken", "", {
            ...accessTokenConfig,
            maxAge: 0,
        });
        response.cookies.set("refreshToken", "", {
            ...refreshTokenConfig,
            maxAge: 0,
        });
    }

    response.headers.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
    );
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
