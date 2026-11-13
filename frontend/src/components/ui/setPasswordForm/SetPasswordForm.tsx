import { useActionState } from "react";
import { Info, Loader2 } from "lucide-react";
import { setPasswordAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import { Label } from "@/components/ui/shadcn/label";
import { PasswordInput } from "@/components/ui/shadcn/password-input";
import { Separator } from "@/components/ui/shadcn/separator";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface SetPasswordFormProps {
    onPasswordSet: () => void;
}

export default function SetPasswordForm({
    onPasswordSet,
}: Readonly<SetPasswordFormProps>) {
    const [formState, formAction, isPending] = useActionState(
        async (prevState: IBaseAction | undefined, formData: FormData) => {
            const result = await setPasswordAction(prevState, formData);

            if (result?.status === "success") {
                onPasswordSet();
            }

            return result;
        },
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="grid gap-6" noValidate>
            <div className="grid gap-4">
                <div>
                    <h3 className="mb-1 text-sm font-medium">Set a password</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                        You signed up with Google. Add a password to also sign
                        in with your email.
                    </p>
                </div>
                <div className="grid gap-4 px-px">
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            className={
                                formState?.zodErrors?.newPassword
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("newPassword")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="new-password"
                        />
                        <ZodErrors error={formState?.zodErrors?.newPassword} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">
                            Confirm New Password
                        </Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            className={
                                formState?.zodErrors?.confirmPassword
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("confirmPassword")
                                    ?.toString() ?? undefined
                            }
                            autoComplete="new-password"
                        />
                        <ZodErrors
                            error={formState?.zodErrors?.confirmPassword}
                        />
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
                </div>
            </div>
            <Separator />
            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="text-white bg-bright-blue hover:bg-blue-600"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Set a password...
                        </>
                    ) : (
                        "Set Password"
                    )}
                </Button>
            </div>
        </form>
    );
}
