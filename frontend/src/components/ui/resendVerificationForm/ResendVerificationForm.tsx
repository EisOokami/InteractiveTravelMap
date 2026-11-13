"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Loader2, Mail } from "lucide-react";
import { resendVerificationAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface ResendVerificationFormProps {
    defaultEmail?: string;
}

export default function ResendVerificationForm({
    defaultEmail,
}: Readonly<ResendVerificationFormProps>) {
    const [secondsLeft, setSecondsLeft] = useState<number>(5);
    const [formState, formAction, isPending] = useActionState(
        resendVerificationAction,
        INITIAL_STATE,
    );
    const router = useRouter();

    useEffect(() => {
        if (formState?.status !== "success") {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondsLeft(30);

        const interval = setInterval(() => {
            setSecondsLeft((prevState) => (prevState > 0 ? prevState - 1 : 0));
        }, 1000);

        const timeout = setTimeout(() => {
            router.push("/signIn");
        }, 30 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [formState?.status, router]);

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <div className="flex items-center gap-2 mb-2">
                    <Mail className="size-6 text-bright-blue" />
                    <CardTitle className="text-2xl">
                        Resend verification
                    </CardTitle>
                </div>
                <CardDescription>
                    Enter your email and we&apos;ll send you a new verification
                    link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            className={
                                formState?.zodErrors?.email
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData?.get("email")?.toString() ??
                                defaultEmail ??
                                undefined
                            }
                            autoComplete="email"
                        />
                        <ZodErrors error={formState?.zodErrors?.email} />
                    </div>
                    {formState?.message && (
                        <div
                            className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : formState?.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                        >
                            <Info className="w-4 h-4 shrink-0" />
                            <p>
                                {formState?.message}
                                {formState?.status === "success" && (
                                    <span className="block text-xs text-muted-foreground">
                                        Redirecting to sign in in {secondsLeft}
                                        s...
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                    {formState?.details &&
                        formState?.details?.length &&
                        formState.details.map((error) => (
                            <DetailsErrors
                                key={error.message + error.field}
                                error={error}
                            />
                        ))}
                    <Button
                        type="submit"
                        className="w-full mt-3 text-white bg-bright-blue hover:bg-blue-600"
                        disabled={isPending || formState?.status === "success"}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send verification link"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already verified?{" "}
                    <Link href="/signIn" className="underline text-primary">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
