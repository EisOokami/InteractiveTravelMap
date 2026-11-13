"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Info, Loader2, ShieldCheck } from "lucide-react";
import { loginAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";
import { formatBackupCode } from "@/libs/utils";

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
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";
import EmailCodeForm from "@/components/ui/emailCodeForm/EmailCodeForm";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import GoogleIcon from "@/components/ui/googleIcon/GoogleIcon";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

export default function LoginForm() {
    const [backupCode, setBackupCode] = useState<string>("");
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [dismissedToken, setDismissedToken] = useState<string | null>(null);
    const [formState, formAction, isPending] = useActionState(
        loginAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    const handleOtpComplete = () => {
        formRef.current?.requestSubmit();
    };

    if (
        formState?.data &&
        formState?.data.requiresMfa &&
        formState?.data.tempToken
    ) {
        return (
            <Card className="w-full max-w-sm mx-auto z-50">
                <CardHeader className="pb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="size-6 text-bright-blue" />
                        <CardTitle className="text-2xl">
                            Two-factor verification
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Enter the 6-digit code from your authenticator app, or
                        one of your backup codes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        ref={formRef}
                        action={formAction}
                        className="grid gap-4"
                    >
                        <input
                            type="hidden"
                            name="tempToken"
                            value={formState.data.tempToken}
                        />
                        {useBackupCode ? (
                            <div className="grid gap-2">
                                <Label htmlFor="token">Backup code</Label>
                                <Input
                                    id="token"
                                    name="token"
                                    type="text"
                                    placeholder="XXXX-XXXX"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    value={backupCode}
                                    onChange={(e) =>
                                        setBackupCode(
                                            formatBackupCode(e.target.value),
                                        )
                                    }
                                    maxLength={9}
                                    className="font-mono text-center uppercase tracking-widest"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    name="token"
                                    autoFocus
                                    onComplete={handleOtpComplete}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        )}
                        <ZodErrors error={formState?.zodErrors?.token} />
                        {formState?.message && (
                            <div
                                className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : "text-yellow-300"}`}
                            >
                                <Info className="w-4 h-4 shrink-0" />
                                <p>{formState?.message}</p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full mt-3 text-white bg-bright-blue hover:bg-blue-600"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify"
                            )}
                        </Button>
                        <button
                            type="button"
                            onClick={() => {
                                setUseBackupCode((prevState) => !prevState);
                                setBackupCode("");
                            }}
                            className="text-sm text-center underline text-muted-foreground"
                        >
                            {useBackupCode
                                ? "Use authenticator code instead"
                                : "Use a backup code instead"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    if (
        formState?.data?.requiresEmailCode &&
        formState.data.tempToken &&
        formState.data.tempToken !== dismissedToken
    ) {
        const emailTempToken = formState.data.tempToken;

        return (
            <EmailCodeForm
                tempToken={emailTempToken}
                onBack={() => setDismissedToken(emailTempToken)}
            />
        );
    }

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your details to access your account.
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
                                undefined
                            }
                            autoComplete="email"
                        />
                        <ZodErrors error={formState?.zodErrors?.email} />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgotPassword"
                                className="text-sm underline text-muted-foreground"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            className={
                                formState?.zodErrors?.password
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("password")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="current-password"
                        />
                        <ZodErrors error={formState?.zodErrors?.password} />
                    </div>
                    {formState?.message && (
                        <div
                            className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : formState?.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                        >
                            <Info className="w-4 h-4" />
                            <p>{formState?.message}</p>
                        </div>
                    )}
                    {formState?.data?.requiresTermsAcceptance && (
                        <div className="flex items-start gap-2">
                            <Checkbox id="acceptTerms" name="acceptTerms" />
                            <Label
                                htmlFor="acceptTerms"
                                className="text-sm font-normal leading-snug text-muted-foreground"
                            >
                                I agree to the updated{" "}
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    className="underline text-primary"
                                >
                                    Terms &amp; Conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    className="underline text-primary"
                                >
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                    )}
                    {formState?.data?.requiresVerification && (
                        <Link
                            href={`/resendVerification${
                                formState?.formData?.get("email")
                                    ? `?email=${encodeURIComponent(
                                          formState.formData
                                              .get("email")!
                                              .toString(),
                                      )}`
                                    : ""
                            }`}
                            className="text-sm text-center underline text-primary"
                        >
                            Resend verification email
                        </Link>
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
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Login...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>
                <Button
                    asChild
                    type="button"
                    variant="outline"
                    className="w-full"
                >
                    <a href={`${process.env.NEXT_PUBLIC_DB_URL}/auth/google`}>
                        <GoogleIcon className="size-4 mr-2" />
                        Continue with Google
                    </a>
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signUp" className="underline text-primary">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
