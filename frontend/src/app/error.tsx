"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/shadcn/button";

type ParsedError = {
    status?: number;
    description?: string;
};

export default function Error({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    let parsed: ParsedError = {};

    try {
        parsed = JSON.parse(error.message);
    } catch {
        parsed.description = "This is an error page. Please try again later.";
        parsed.status = 404;
    }

    return (
        <main className="grid justify-items-center content-center mb-auto py-10 md:py-20 text-center">
            <h3 className="font-bold text-xl md:text-4xl">
                Oops! Something went wrong.
            </h3>
            <h3 className="font-bold text-xl md:text-4xl">
                {parsed.description}
            </h3>
            <h1 className="text-[200px] md:text-[300px] xl:text-[400px] font-bold">
                {parsed.status}
            </h1>
            {parsed.status !== 428 && (
                <div className="flex items-center gap-5">
                    <Button onClick={reset} size="lg">
                        Try again
                    </Button>
                </div>
            )}
        </main>
    );
}
