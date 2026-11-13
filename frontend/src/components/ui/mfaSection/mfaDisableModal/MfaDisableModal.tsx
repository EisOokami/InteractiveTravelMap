"use client";

import { useActionState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { mfaDisableAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface MfaDisableModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDisabled: () => void;
}

export default function MfaDisableModal({
    open,
    onOpenChange,
    onDisabled,
}: Readonly<MfaDisableModalProps>) {
    const [formState, formAction, isPending] = useActionState(
        mfaDisableAction,
        INITIAL_STATE,
    );

    useEffect(() => {
        if (formState?.status === "success") {
            onDisabled();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-11/12 max-w-md rounded-md z-[1000] [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="mb-0.5">
                                Disable two-factor authentication
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Confirm your password to disable 2FA. Your
                                authenticator code is optional if your device is
                                unavailable.
                            </DialogDescription>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="size-6 text-muted-foreground [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <X />
                        </Button>
                    </div>
                </DialogHeader>
                <form action={formAction} className="grid gap-3">
                    <div className="grid gap-1">
                        <PasswordInput
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            disabled={isPending}
                        />
                        <ZodErrors error={formState?.zodErrors?.password} />
                    </div>
                    <div className="grid gap-1">
                        <Input
                            name="token"
                            placeholder="6-digit code (optional)"
                            maxLength={6}
                            autoComplete="one-time-code"
                            disabled={isPending}
                        />
                    </div>
                    {formState?.message && (
                        <div
                            className={`flex items-center gap-2 text-sm ${formState?.status === "error" ? "text-red-500" : "text-emerald-500"}`}
                        >
                            <Info className="w-4 h-4 shrink-0" />
                            <p>{formState.message}</p>
                        </div>
                    )}
                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Disabling..." : "Disable 2FA"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
