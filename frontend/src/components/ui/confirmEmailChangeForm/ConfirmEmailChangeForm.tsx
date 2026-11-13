"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Info, Loader2 } from "lucide-react";
import { confirmEmailChangeAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    status: null,
    error: null,
    details: null,
    message: null,
    formData: null,
};

interface ConfirmEmailChangeFormProps {
    token: string;
}

export default function ConfirmEmailChangeForm({
    token,
}: Readonly<ConfirmEmailChangeFormProps>) {
    const [formState, formAction, isPending] = useActionState(
        confirmEmailChangeAction,
        INITIAL_STATE,
    );
    const isConfirmed = formState?.status === "success";

    return (
        <Card className="w-full max-w-sm mx-auto z-50">
            <CardHeader className="pb-5">
                <CardTitle className="text-2xl">Change email address</CardTitle>
                <CardDescription>
                    Confirm the change of the email address of your account.
                    If you did not ask for it, close this page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-4">
                    <input type="hidden" name="token" value={token} />
                    {!token && (
                        <p className="text-sm text-red-500">
                            The link is incomplete. Open it again from the
                            email.
                        </p>
                    )}
                    {formState?.message && (
                        <div
                            className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : formState?.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                        >
                            <Info className="w-4 h-4" />
                            <p>{formState?.message}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full mt-3 text-white bg-bright-blue hover:bg-blue-600"
                        disabled={isPending || isConfirmed || !token}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            "Confirm email change"
                        )}
                    </Button>
                    {isConfirmed && formState?.data?.stage === "done" && (
                        <Link
                            href="/signIn"
                            className="inline-flex justify-center items-center h-10 px-4 text-sm font-medium text-white bg-bright-blue rounded-md"
                        >
                            Go to Login
                        </Link>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
