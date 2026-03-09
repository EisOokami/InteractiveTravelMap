"use client";

import { ReactNode, useEffect, useState } from "react";

export default function CookieRefresher({
    children,
    status,
}: {
    children: ReactNode;
    status: number;
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        if (status === 401) {
            setIsLoading(true);

            import("@/data/refreshAccessToken").then(
                ({ refreshAccessToken }) => {
                    refreshAccessToken(status).finally(() => {
                        if (active) {
                            setIsLoading(false);
                        }
                    });
                },
            );
        }

        return () => {
            active = false;
        };
    }, [status]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen justify-center items-center flex-col">
                <div className="pb-4">
                    <h3 className="text-2xl">Just give us a second.</h3>
                </div>
                <div className="flex justify-center items-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
