import { useActionState } from "react";
import { Info, Loader2 } from "lucide-react";
import { updateProfileAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";

import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Separator } from "@/components/ui/shadcn/separator";
import { Button } from "@/components/ui/shadcn/button";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";
import { IUser } from "@/interfaces/interfaces";

const INITIAL_STATE: IBaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

interface ProfileFormProps {
    userData: IUser | undefined;
}

export default function ProfileForm({ userData }: Readonly<ProfileFormProps>) {
    const [formState, formAction, isPending] = useActionState(
        updateProfileAction,
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="grid gap-6" noValidate>
            <div className="grid gap-4">
                <div>
                    <h3 className="mb-1 text-sm font-medium">
                        Profile Information
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                        Update your personal information and email address.
                    </p>
                </div>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            placeholder="newUsername123"
                            className={
                                formState?.zodErrors?.username
                                    ? "border-red-500"
                                    : ""
                            }
                            defaultValue={
                                formState?.formData
                                    ?.get("username")
                                    ?.toString() ?? userData?.data?.username
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
                                userData?.data?.email
                            }
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
                            Save changes...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </form>
    );
}
