"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Monitor, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/data/actions";
import { getUserSessionsData } from "@/data/loaders";
import type { IUserSession } from "@/interfaces/interfaces";
import {
    formatSessionDate,
    getSessionActivity,
    getSessionLabel,
} from "@/libs/accountSettings";

import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/shadcn/alert-dialog";

export default function SessionManagement() {
    const [sessions, setSessions] = useState<IUserSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<
        IUserSession | "others" | null
    >(null);
    const requestId = useRef(0);
    const isRevoking = useRef(false);

    const loadSessions = useCallback(() => {
        const id = ++requestId.current;

        return getUserSessionsData()
            .then((result) => {
                if (id !== requestId.current) {
                    return;
                }

                if (result.status === "success") {
                    setError(null);

                    setSessions(result.data);
                }

                if (result.status === "error") {
                    setError(result.message);

                    toast.error(result.message);
                }
            })
            .catch(() => {
                if (id !== requestId.current) {
                    return;
                }

                setError("Unable to load sessions. Please try again.");

                toast.error("Unable to load sessions. Please try again.");
            })
            .finally(() => {
                if (id === requestId.current) {
                    setIsLoading(false);
                }
            });
    }, []);

    useEffect(() => {
        const requests = requestId;

        void loadSessions();

        return () => {
            requests.current++;
        };
    }, [loadSessions]);

    const handleRefresh = () => {
        setIsLoading(true);
        setError(null);

        void loadSessions();
    };

    const handleRevoke = async () => {
        if (!confirmation || isRevoking.current) {
            return;
        }

        isRevoking.current = true;

        setIsPending(true);

        try {
            const result =
                confirmation === "others"
                    ? await revokeOtherSessionsAction()
                    : await revokeSessionAction(confirmation.id);

            if (!result.ok) {
                toast.error(result.message);

                return;
            }

            setSessions((current) =>
                current.filter((session) =>
                    confirmation === "others"
                        ? session.isCurrent
                        : session.id !== confirmation.id,
                ),
            );

            toast.success(
                confirmation === "others"
                    ? `${result.revokedCount} other sessions signed out`
                    : "Session revoked",
            );

            setConfirmation(null);

            await loadSessions();
        } catch {
            toast.error("Unable to revoke sessions. Please try again.");
        } finally {
            setIsPending(false);

            isRevoking.current = false;
        }
    };

    return (
        <section className="grid gap-4">
            <div>
                <h3 className="mb-1 text-sm font-medium">Sessions / Devices</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                    Manage devices signed in to your account. Use Sign out to
                    end your current session.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                            isLoading ||
                            isPending ||
                            !!error ||
                            !sessions.some((session) => !session.isCurrent)
                        }
                        onClick={() => setConfirmation("others")}
                    >
                        Log out all other sessions
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading || isPending}
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <div className="grid gap-3 p-4 border rounded-lg">
                    <span className="sr-only">Loading sessions</span>
                    {[0, 1].map((index) => (
                        <Skeleton key={index} className="w-full h-28" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-4 text-sm border rounded-lg">
                    <p>{error}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleRefresh}
                    >
                        Try again
                    </Button>
                </div>
            ) : sessions.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground border rounded-lg">
                    No active sessions to display. Refresh the list or sign in
                    again.
                </p>
            ) : (
                <ul className="border rounded-lg divide-y overflow-hidden">
                    {sessions.map((session) => {
                        const Icon =
                            session.device.type === "mobile"
                                ? Smartphone
                                : session.device.type === "tablet"
                                  ? Tablet
                                  : Monitor;

                        return (
                            <li
                                key={session.id}
                                className="flex items-start gap-3 p-4"
                            >
                                <Icon className="size-6 mt-1 shrink-0 text-muted-foreground" />
                                <div className="flex-1 grid gap-2 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium break-words">
                                            {getSessionLabel(session)}
                                        </p>
                                        {session.isCurrent && (
                                            <Badge variant="secondary">
                                                Current session
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid gap-1 text-xs text-muted-foreground break-words">
                                        <p>
                                            {[
                                                session.browser.name,
                                                session.browser.version,
                                                session.os.name,
                                                session.os.version,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ") ||
                                                "Device details unavailable"}
                                        </p>
                                        <p>IP: {session.ip ?? "Unknown"}</p>
                                        <p
                                            title={formatSessionDate(
                                                session.lastUsedAt,
                                            )}
                                        >
                                            {getSessionActivity(session)}
                                        </p>
                                        <p>
                                            Signed in:{" "}
                                            <time dateTime={session.createdAt}>
                                                {formatSessionDate(
                                                    session.createdAt,
                                                )}
                                            </time>
                                        </p>
                                        <p>
                                            Expires:{" "}
                                            <time dateTime={session.expiresAt}>
                                                {formatSessionDate(
                                                    session.expiresAt,
                                                )}
                                            </time>
                                        </p>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-fit"
                                            disabled={isPending}
                                            onClick={() =>
                                                setConfirmation(session)
                                            }
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <AlertDialog
                open={confirmation !== null}
                onOpenChange={(open) => {
                    if (!open && !isPending) {
                        setConfirmation(null);
                    }
                }}
            >
                <AlertDialogContent className="w-11/12 rounded-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-500" />
                            {confirmation === "others"
                                ? "Log out all other sessions?"
                                : "Revoke session?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmation === "others"
                                ? "All other devices will be signed out. Your current session will remain active."
                                : `This device${confirmation ? ` (${getSessionLabel(confirmation)})` : ""} will be signed out and will need to authenticate again.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            className="text-sm"
                            disabled={isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="button"
                            onClick={(event) => {
                                event.preventDefault();
                                void handleRevoke();
                            }}
                            className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Signing out..."
                                : confirmation === "others"
                                  ? "Log out other sessions"
                                  : "Revoke session"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
