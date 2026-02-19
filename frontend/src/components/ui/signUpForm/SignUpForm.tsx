"use client";

import { useActionState } from "react";
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

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function SignUpForm() {
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
