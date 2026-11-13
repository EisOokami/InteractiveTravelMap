"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Info, X } from "lucide-react";
import { mfaRegenerateBackupCodesAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import { Button } from "@/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
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

interface MfaBackupCodesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MfaBackupCodesModal({
    open,
    onOpenChange,
}: Readonly<MfaBackupCodesModalProps>) {
    const [formState, formAction, isPending] = useActionState(
        mfaRegenerateBackupCodesAction,
        INITIAL_STATE,
    );
    const [copiedAll, setCopiedAll] = useState<boolean>(false);

    const handleCopyAll = async () => {
        if (!formState || !formState.data.backupCodes) {
            return;
        }

        await navigator.clipboard.writeText(
            formState.data.backupCodes.join("\n"),
        );

        setCopiedAll(true);

        setTimeout(() => setCopiedAll(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-11/12 sm:max-w-md rounded-md z-[1000] [&>button:first-of-type]:hidden">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="mb-0.5">
                                Backup codes
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Generating new codes invalidates any codes you
                                saved previously. Each code can be used once.
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
                {!formState ||
                !formState.data ||
                !formState.data.backupCodes ? (
                    <form action={formAction} className="grid gap-3">
                        <div className="grid gap-1">
                            <PasswordInput
                                name="password"
                                placeholder="Confirm your password"
                                autoComplete="current-password"
                                disabled={isPending}
                            />
                            <ZodErrors error={formState?.zodErrors?.password} />
                        </div>
                        {formState?.message &&
                            formState?.status === "error" && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
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
                                ? "Generating..."
                                : "Generate backup codes"}
                        </Button>
                    </form>
                ) : (
                    <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-2 p-3 font-mono text-sm border rounded-md">
                            {formState.data.backupCodes.map((code: string) => (
                                <span key={code}>{code}</span>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleCopyAll}
                        >
                            {copiedAll ? (
                                <>
                                    <Check className="size-4 mr-2 text-emerald-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="size-4 mr-2" />
                                    Copy all codes
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Save these somewhere safe - they won&apos;t be shown
                            again.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
