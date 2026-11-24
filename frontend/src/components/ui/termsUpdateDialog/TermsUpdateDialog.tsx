"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Loader2 } from "lucide-react";
import { acceptTermsAction, logoutAction } from "@/data/actions";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";

export default function TermsUpdateDialog() {
    const [open, setOpen] = useState<boolean>(true);
    const [accepted, setAccepted] = useState<boolean>(false);
    const [pending, setPending] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleAccept = async () => {
        if (!accepted || pending) {
            return;
        }

        setPending(true);
        setMessage("");

        const result = await acceptTermsAction();

        setPending(false);

        if (!result.ok) {
            setMessage(result.message);

            return;
        }

        setOpen(false);
    };

    const handleSignOut = async () => {
        setPending(true);

        await logoutAction();

        window.location.reload();
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="w-11/12 rounded-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Our terms have been updated
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the updated documents. To keep using your
                        account, accept them below or sign out.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-start gap-2">
                    <Checkbox
                        id="acceptUpdatedTerms"
                        checked={accepted}
                        onCheckedChange={(checked) =>
                            setAccepted(checked === true)
                        }
                        disabled={pending}
                        className="mt-0.5"
                    />
                    <Label
                        htmlFor="acceptUpdatedTerms"
                        className="text-sm font-normal leading-snug text-muted-foreground"
                    >
                        I accept the updated{" "}
                        <Link
                            href="/terms"
                            target="_blank"
                            className="underline text-primary"
                        >
                            Terms &amp; Conditions
                        </Link>
                        . I have read the updated{" "}
                        <Link
                            href="/privacy"
                            target="_blank"
                            className="underline text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </Label>
                </div>
                {message && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                        <Info className="size-4 shrink-0" />
                        <p>{message}</p>
                    </div>
                )}
                <AlertDialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        disabled={pending}
                    >
                        Sign out
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!accepted || pending}
                        className="text-white bg-bright-blue hover:bg-blue-600"
                    >
                        {pending && (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                        )}
                        Accept and continue
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
