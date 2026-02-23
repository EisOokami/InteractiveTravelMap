import { useActionState } from "react";
import { Info, Loader2 } from "lucide-react";
import { changePasswordAction } from "@/data/actions";
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

export default function SecurityForm() {
    const [formState, formAction, isPending] = useActionState(
        changePasswordAction,
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="grid gap-6" noValidate>
            <div className="grid gap-4">
                <div>
                    <h3 className="mb-1 text-sm font-medium">
                        Change Password
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                        Ensure your account is using a strong password.
                    </p>
                </div>
                <div className="custom-scroll grid gap-4 max-h-[400px] px-px overflow-y-auto">
                    <div className="grid gap-2">
                        <Label htmlFor="currentPassword">
                            Current Password
                        </Label>
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            className={
                                formState?.zodErrors?.currentPassword
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("currentPassword")
                                    ?.toString() ?? undefined
                            }
                        />
                        <ZodErrors
                            error={formState?.zodErrors?.currentPassword}
                        />
                    </div>
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
                            Update a password...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </div>
        </form>
    );
}
