"use client";

import { useActionState } from "react";
import { Info, Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import {
    Card,
    CardContent,
    CardDescription,
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
};

export default function ForgotPasswordForm() {
    const [formState, formAction, isPending] = useActionState(
        forgotPasswordAction,
        INITIAL_STATE,
    );

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                <CardDescription>
                    No worries, we&apos;ll send you reset instructions.
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
                        disabled={
                            isPending ||
                            formState?.status === "success" ||
                            formState?.status === "message"
                        }
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Reset password...
                            </>
                        ) : (
                            "Reset password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
