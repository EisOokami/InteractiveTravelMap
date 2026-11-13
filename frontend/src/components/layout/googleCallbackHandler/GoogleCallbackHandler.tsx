"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { exchangeGoogleCodeAction } from "@/data/actions";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackHandler({ code }: { code: string }) {
    const router = useRouter();
    const called = useRef(false);

    useEffect(() => {
        if (called.current) {
            return;
        }

        called.current = true;

        exchangeGoogleCodeAction(code)
            .then((result) => {
                if (!result) {
                    router.replace("/signIn?error=oauth_failed");

                    return;
                }

                if (result.ok) {
                    router.replace("/map");
                } else {
                    router.replace("/signIn?error=oauth_failed");
                }
            })
            .catch(() => router.replace("/signIn?error=oauth_failed"));
    }, [code, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-5 px-10 py-8 bg-card border rounded-2xl z-50">
                <div className="flex justify-center items-center size-16 bg-primary/10 rounded-full">
                    <Loader2 className="size-8 text-primary animate-spin" />
                </div>
                <div className="grid gap-1 text-center">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Signing you in
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Verifying your credentials and preparing your session...
                    </p>
                </div>
                <div className="flex gap-1">
                    <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
