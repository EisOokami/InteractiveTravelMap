import { useActionState, useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { deleteAccountAction } from "@/data/actions";
import { IDeleteAccountAction } from "@/interfaces/actions";
import { IUser } from "@/interfaces/interfaces";
import { formatBackupCode } from "@/libs/utils";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/shadcn/input-otp";
import { Label } from "@/components/ui/shadcn/label";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";

const INITIAL_STATE: IDeleteAccountAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
    data: null,
};

interface DangerZoneFormProps {
    userData: IUser | undefined;
}

export default function DangerZoneForm({
    userData,
}: Readonly<DangerZoneFormProps>) {
    const [password, setPassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [cooldown, setCooldown] = useState<number>(60);
    const [intent, setIntent] = useState<"verify" | "resend">("verify");
    const [backupCode, setBackupCode] = useState<string>("");
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [formState, formAction, isPending] = useActionState(
        deleteAccountAction,
        INITIAL_STATE,
    );
    const formRef = useRef<HTMLFormElement>(null);

    const hasPassword = userData?.data?.auth_provider !== "google";
    const step = formState?.data?.tempToken ? "code" : "password";
    const isResending = isPending && intent === "resend";
    const requiresRestart = formState?.data?.requiresRestart === true;

    useEffect(() => {
        if (formState?.status === "error") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpen(true);
        }
    }, [formState]);

    useEffect(() => {
        if (step !== "code" || cooldown <= 0) {
            return;
        }

        const timer = setTimeout(
            () => setCooldown((prevState) => prevState - 1),
            1000,
        );

        return () => clearTimeout(timer);
    }, [step, cooldown]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCode("");
        setBackupCode("");
        setUseBackupCode(false);
        setIntent("verify");

        if (formState?.data?.sentAt) {
            setCooldown(60);
        } 
        
        if (!formState?.data?.sentAt && formState?.data?.retryAfter) {
            setCooldown(formState?.data.retryAfter);
        }
    }, [formState]);

    const resetFlow = () => {
        setOpen(false);
        setPassword("");
        setCode("");
    };

    return (
        <form
            ref={formRef}
            id="delete-account-form"
            action={formAction}
            className="grid gap-4"
        >
            <div>
                <h3 className="mb-1 text-sm font-medium">Delete Account</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                </p>
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 text-destructive" />
                    <div className="flex-1 grid gap-3">
                        <div>
                            <h4 className="mb-1 text-sm font-medium text-destructive">
                                This action cannot be undone
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Deleting your account will permanently remove
                                all your data, including your profile, settings,
                                and any content you&apos;ve created. This action
                                is irreversible.
                            </p>
                        </div>
                        <AlertDialog
                            open={open}
                            onOpenChange={(nextOpen) => {
                                if (isPending) return;

                                if (!nextOpen) {
                                    resetFlow();
                                    return;
                                }

                                setOpen(true);
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="w-fit"
                                    disabled={isPending}
                                >
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-11/12 rounded-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-red-500" />
                                        {step === "password"
                                            ? "Delete your account?"
                                            : "Confirm deletion"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {step === "password"
                                            ? !hasPassword
                                                ? "This will permanently delete your account, your favorites, and data. We'll send a verification code to your email to confirm. This action cannot be undone."
                                                : "This will permanently delete your account, your favorites, and data. This action cannot be undone."
                                            : formState?.data?.requiresMfa
                                              ? "Enter the 6-digit code from your authenticator app."
                                              : "We sent a 6-digit code to your email."}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {step === "password" && hasPassword ? (
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="delete-account-password"
                                            className="text-sm"
                                        >
                                            Enter your password to confirm
                                        </Label>
                                        <PasswordInput
                                            id="delete-account-password"
                                            name="password"
                                            form="delete-account-form"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();

                                                    if (
                                                        !isPending &&
                                                        password.length > 0
                                                    ) {
                                                        formRef.current?.requestSubmit();
                                                    }
                                                }
                                            }}
                                            placeholder="Your password"
                                            disabled={isPending}
                                        />
                                        <ZodErrors
                                            error={
                                                formState?.zodErrors?.password
                                            }
                                        />
                                    </div>
                                ) : step === "code" ? (
                                    <div className="grid gap-3">
                                        <input
                                            type="hidden"
                                            name="tempToken"
                                            form="delete-account-form"
                                            value={
                                                formState?.data?.tempToken ?? ""
                                            }
                                        />
                                        <input
                                            type="hidden"
                                            name="method"
                                            form="delete-account-form"
                                            value={
                                                formState?.data?.requiresMfa
                                                    ? "totp"
                                                    : "email"
                                            }
                                        />
                                        {formState?.data?.requiresMfa &&
                                        useBackupCode ? (
                                            <div className="grid gap-2">
                                                <Label htmlFor="delete-backup-code">
                                                    Backup code
                                                </Label>
                                                <Input
                                                    id="delete-backup-code"
                                                    name="code"
                                                    form="delete-account-form"
                                                    type="text"
                                                    placeholder="XXXX-XXXX"
                                                    autoComplete="one-time-code"
                                                    autoFocus
                                                    value={backupCode}
                                                    onChange={(e) =>
                                                        setBackupCode(
                                                            formatBackupCode(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    maxLength={9}
                                                    disabled={
                                                        isPending ||
                                                        requiresRestart
                                                    }
                                                    className="font-mono text-center uppercase tracking-widest"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <InputOTP
                                                    maxLength={6}
                                                    name="code"
                                                    form="delete-account-form"
                                                    value={code}
                                                    onChange={setCode}
                                                    autoFocus
                                                    disabled={
                                                        isPending ||
                                                        requiresRestart
                                                    }
                                                    onComplete={() =>
                                                        formRef.current?.requestSubmit()
                                                    }
                                                >
                                                    <InputOTPGroup>
                                                        {[0, 1, 2, 3, 4, 5].map(
                                                            (index) => (
                                                                <InputOTPSlot
                                                                    key={index}
                                                                    index={
                                                                        index
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </div>
                                        )}
                                        <ZodErrors
                                            error={formState?.zodErrors?.code}
                                        />
                                        {formState?.data?.requiresMfa && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUseBackupCode(
                                                        (prevState) =>
                                                            !prevState,
                                                    );
                                                    setBackupCode("");
                                                    setCode("");
                                                }}
                                                className="text-sm text-center underline text-muted-foreground"
                                            >
                                                {useBackupCode
                                                    ? "Use authenticator code instead"
                                                    : "Use a backup code instead"}
                                            </button>
                                        )}
                                        {formState?.data?.requiresEmailCode && (
                                            <Button
                                                type="submit"
                                                name="intent"
                                                form="delete-account-form"
                                                value="resend"
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                disabled={
                                                    isPending ||
                                                    requiresRestart ||
                                                    cooldown > 0
                                                }
                                                onClick={() =>
                                                    setIntent("resend")
                                                }
                                            >
                                                {isResending
                                                    ? "Sending..."
                                                    : cooldown > 0
                                                      ? `Resend code in ${cooldown}s`
                                                      : "Resend code"}
                                            </Button>
                                        )}
                                    </div>
                                ) : null}
                                {formState?.message && (
                                    <div
                                        className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : "text-green-500"}`}
                                    >
                                        <Info className="w-4 h-4 shrink-0" />
                                        <p>{formState?.message}</p>
                                    </div>
                                )}
                                {formState?.details &&
                                    formState.details.length > 0 &&
                                    formState.details.map((error) => (
                                        <DetailsErrors
                                            key={error.message + error.field}
                                            error={error}
                                        />
                                    ))}
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        type="button"
                                        className="text-sm"
                                        disabled={isPending}
                                        onClick={resetFlow}
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                            setIntent("verify");
                                            formRef.current?.requestSubmit();
                                        }}
                                        disabled={
                                            isPending ||
                                            requiresRestart ||
                                            (step === "password"
                                                ? hasPassword &&
                                                  password.length === 0
                                                : useBackupCode
                                                  ? backupCode.length === 0
                                                  : code.length !== 6)
                                        }
                                    >
                                        {isPending && !isResending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {step === "password"
                                                    ? "Checking..."
                                                    : "Deleting..."}
                                            </>
                                        ) : step === "password" ? (
                                            "Continue"
                                        ) : (
                                            "Yes, delete everything"
                                        )}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <input
                            type="hidden"
                            name="id"
                            value={userData?.data?.id ?? ""}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
