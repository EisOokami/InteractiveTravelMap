import { useActionState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { deleteAccountAction } from "@/data/actions";
import { IBaseAction } from "@/interfaces/actions";
import { IUser } from "@/interfaces/interfaces";

import { Button } from "@/components/ui/shadcn/button";

const INITIAL_STATE: Pick<IBaseAction, "status" | "message"> = {
    status: null,
    message: null,
};

interface DangerZoneFormProps {
    userData: IUser | undefined;
}

export default function DangerZoneForm({
    userData,
}: Readonly<DangerZoneFormProps>) {
    const [formState, formAction, isPending] = useActionState(
        deleteAccountAction,
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="grid gap-4">
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
                        <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                            className="w-fit"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Delete an account...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </Button>
                        <input
                            type="hidden"
                            name="id"
                            value={userData?.data?.id}
                        />
                    </div>
                </div>
            </div>
            {formState?.message && (
                <div
                    className={`flex items-center gap-2 text-sm rounded-md ${formState?.status === "error" ? "text-red-500" : formState?.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                >
                    <Info className="w-4 h-4" />
                    <p>{formState?.message}</p>
                </div>
            )}
        </form>
    );
}
