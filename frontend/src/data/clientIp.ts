import "server-only";

function isIpAddress(value: string) {
    if (
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(
            value,
        )
    ) {
        return true;
    }

    if (!value.includes(":") || !/^[0-9a-fA-F:.]+$/.test(value)) {
        return false;
    }

    try {
        return new URL("http://[" + value + "]").hostname.length > 0;
    } catch {
        return false;
    }
}

function clientIpHeader(): string | undefined {
    const configured = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();

    if (configured) {
        return configured;
    }

    return process.env.VERCEL === "1" ? "x-real-ip" : undefined;
}

export function bffHeaders(
    incoming: Pick<Headers, "get">,
): Record<string, string> {
    const secret = process.env.BFF_SHARED_SECRET;
    const header = clientIpHeader();

    if (!secret || !header) {
        return {};
    }

    const clientIp = incoming.get(header)?.split(",").pop()?.trim();

    if (!clientIp || !isIpAddress(clientIp)) {
        return {};
    }

    return {
        "X-Client-IP": clientIp,
        "X-BFF-Secret": secret,
    };
}
