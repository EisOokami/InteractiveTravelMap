"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, CircleAlert, Copy, Info, X } from "lucide-react";
import { mfaEnableAction, mfaSetupAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface MfaSetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnabled: () => void;
}

export default function MfaSetupModal({
    open,
    onOpenChange,
    onEnabled,
}: Readonly<MfaSetupModalProps>) {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);
    const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
    const [setupError, setSetupError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        mfaEnableAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!open) {
            setQrCode(null);
            setManualEntryKey(null);
            setSetupError(null);

            return;
        }

        setIsLoadingQr(true);

        mfaSetupAction()
            .then((result) => {
                if (!result) {
                    setSetupError("Failed to start MFA setup");

                    return;
                }

                if (result.status === "success") {
                    setQrCode(result.data.qrCode ?? null);
                    setManualEntryKey(result.data.manualEntryKey ?? null);
                }

                if (result.status === "error") {
                    setSetupError(
                        result.message ?? "Failed to start MFA setup",
                    );
                }
            })
            .catch(() => setSetupError("Failed to start MFA setup"))
            .finally(() => setIsLoadingQr(false));
    }, [open]);

    useEffect(() => {
        if (formState?.status === "success") {
            onEnabled();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formState]);

    const handleCopy = async () => {
        if (!manualEntryKey) {
            return;
        }

        await navigator.clipboard.writeText(manualEntryKey);

        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    };

    const handleOtpComplete = () => {
        formRef.current?.requestSubmit();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-11/12 sm:max-w-md rounded-md z-[1000] [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="mb-0.5">
                                Set up two-factor authentication
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Scan the QR code with your authenticator app,
                                then enter the 6-digit code to confirm.
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
                {isLoadingQr && (
                    <div className="flex justify-center items-center py-10 text-sm text-muted-foreground">
                        Generating QR code...
                    </div>
                )}
                {setupError && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                        <CircleAlert className="size-4 shrink-0" />
                        <p>{setupError}</p>
                    </div>
                )}
                {qrCode && (
                    <div className="grid gap-4">
                        <div className="flex justify-center p-4 bg-white border rounded-md">
                            <Image
                                src={qrCode}
                                alt="MFA QR code"
                                width={160}
                                height={160}
                            />
                        </div>
                        {manualEntryKey && (
                            <div className="grid gap-1">
                                <p className="text-xs text-muted-foreground">
                                    Or enter this code manually
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex justify-between items-center w-full px-3 py-2 font-mono text-xs text-left border rounded-md hover:bg-accent"
                                    disabled={isPending}
                                >
                                    <span className="truncate">
                                        {manualEntryKey}
                                    </span>
                                    {copied ? (
                                        <Check className="size-3.5 shrink-0 text-emerald-500" />
                                    ) : (
                                        <Copy className="size-3.5 shrink-0 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        )}
                        <form
                            ref={formRef}
                            action={formAction}
                            className="grid gap-3"
                        >
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    name="token"
                                    autoFocus
                                    onComplete={handleOtpComplete}
                                    disabled={isPending}
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
                            <ZodErrors error={formState?.zodErrors?.token} />
                            {formState?.message &&
                                formState?.status === "error" && (
                                    <div className="flex justify-center items-center gap-2 text-sm text-red-500">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <p>{formState.message}</p>
                                    </div>
                                )}
                            <Button
                                type="submit"
                                className="w-full text-white bg-bright-blue hover:bg-blue-600"
                                disabled={isPending}
                            >
                                {isPending
                                    ? "Verifying..."
                                    : "Confirm and enable"}
                            </Button>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
