"use client";

import { ReactNode, useEffect, useState } from "react";

export default function CookieRefresher({
    children,
    status,
}: {
    children: ReactNode;
    status: number;
}) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        if (status === 401) {
            setLoading(true);

            import("@/data/refreshAccessToken").then(
                ({ refreshAccessToken }) => {
                    refreshAccessToken(status).finally(() => {
                        if (active) {
                            setLoading(false);
                        }
                    });
                },
            );
        }

        return () => {
            active = false;
        };
    }, [status]);

    if (loading) {
        return null;
    }

    return <>{children}</>;
}
