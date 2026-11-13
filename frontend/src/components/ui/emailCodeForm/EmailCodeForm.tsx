"use client";

import { useActionState, useEffect, useState } from "react";
import { Info, Loader2, Mail } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { emailCodeAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface EmailCodeFormProps {
    tempToken: string;
    onBack: () => void;
}

export default function EmailCodeForm({
    tempToken,
    onBack,
}: Readonly<EmailCodeFormProps>) {
    const [code, setCode] = useState<string>("");
    const [cooldown, setCooldown] = useState<number>(60);
    const [intent, setIntent] = useState<"verify" | "resend">("verify");
    const [formState, formAction, isPending] = useActionState(
        emailCodeAction,
        INITIAL_STATE,
    );

    const isResending = isPending && intent === "resend";
    const requiresRelogin = formState.data?.requiresRelogin === true;

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setTimeout(
            () => setCooldown((prevState) => prevState - 1),
            1000,
        );

        return () => clearTimeout(timer);
    }, [cooldown]);

    useEffect(() => {
        if (!formState.status) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCode("");
        setIntent("verify");

        if (formState.data?.sentAt) {
            setCooldown(60);
        }

        if (!formState.data?.sentAt && formState.data?.retryAfter) {
            setCooldown(formState.data.retryAfter);
        }
    }, [formState]);

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <div className="flex items-center gap-2 mb-2">
                    <Mail className="size-6 text-bright-blue" />
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                </div>
                <CardDescription>
                    We sent a 6-digit verification code to your email. Enter it
                    below to finish signing in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="email-code-form"
                    action={formAction}
                    className="grid gap-4"
                >
                    <input type="hidden" name="tempToken" value={tempToken} />
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            name="code"
                            value={code}
                            onChange={setCode}
                            pattern={REGEXP_ONLY_DIGITS}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            disabled={isPending || requiresRelogin}
                            onComplete={() =>
                                document
                                    .getElementById("email-code-form")
                                    ?.dispatchEvent(
                                        new Event("submit", {
                                            bubbles: true,
                                            cancelable: true,
                                        }),
                                    )
                            }
                        >
                            <InputOTPGroup>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <ZodErrors error={formState.zodErrors?.code} />
                    {formState.message && (
                        <div
                            className={`flex items-center gap-2 text-sm rounded-md ${formState.status === "error" ? "text-red-500" : "text-green-500"}`}
                        >
                            <Info className="w-4 h-4 shrink-0" />
                            <p>{formState.message}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        name="intent"
                        value="verify"
                        className="w-full mt-3 text-white bg-bright-blue hover:bg-blue-600"
                        disabled={isPending || requiresRelogin}
                    >
                        {isPending && !isResending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                    <Button
                        type="submit"
                        name="intent"
                        value="resend"
                        variant="outline"
                        className="w-full"
                        disabled={isPending || cooldown > 0 || requiresRelogin}
                        onClick={() => setIntent("resend")}
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : cooldown > 0 ? (
                            `Resend code in ${cooldown}s`
                        ) : (
                            "Resend code"
                        )}
                    </Button>
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-center underline text-muted-foreground"
                    >
                        Back to login
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
