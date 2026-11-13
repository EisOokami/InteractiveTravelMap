"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Info, Loader2 } from "lucide-react";
import { registerAction } from "@/data/actions";
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
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import GoogleIcon from "@/components/ui/googleIcon/GoogleIcon";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function SignUpForm() {
    const [googleTermsAccepted, setGoogleTermsAccepted] =
        useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        registerAction,
        INITIAL_STATE,
    );

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Registration</CardTitle>
                <CardDescription>
                    Create a new account to get started.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            placeholder="chashkakefira"
                            className={
                                formState?.zodErrors?.username
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("username")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="username"
                        />
                        <ZodErrors error={formState?.zodErrors?.username} />
                    </div>
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
                        <Label htmlFor="password">Password</Label>
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
                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={googleTermsAccepted}
                            onCheckedChange={(checked) =>
                                setGoogleTermsAccepted(checked === true)
                            }
                            className={`mt-0.5 ${formState?.zodErrors?.terms ? "border-red-500" : ""}`}
                        />
                        <Label
                            htmlFor="terms"
                            className="text-sm font-normal leading-snug text-muted-foreground"
                        >
                            I agree to the{" "}
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
                    <ZodErrors error={formState?.zodErrors?.terms} />
                    {formState?.message && (
                        <div
                            className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : formState?.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                        >
                            <Info className="w-4 h-4" />
                            <p>{formState?.message}</p>
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
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Create an account...
                            </>
                        ) : (
                            "Sign up"
                        )}
                    </Button>
                </form>
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>
                <Button
                    asChild={googleTermsAccepted}
                    type="button"
                    variant="outline"
                    disabled={!googleTermsAccepted}
                    className="w-full"
                >
                    {googleTermsAccepted ? (
                        <a
                            href={`${process.env.NEXT_PUBLIC_DB_URL}/auth/google`}
                        >
                            <GoogleIcon className="size-4 mr-2" />
                            Continue with Google
                        </a>
                    ) : (
                        <>
                            <GoogleIcon className="size-4 mr-2" />
                            Continue with Google
                        </>
                    )}
                </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/signIn" className="underline text-primary">
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
