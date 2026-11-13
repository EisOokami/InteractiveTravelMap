"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import MfaSetupModal from "./mfaSetupModal/MfaSetupModal";
import MfaDisableModal from "./mfaDisableModal/MfaDisableModal";
import MfaBackupCodesModal from "./mfaBackupCodesModal/MfaBackupCodesModal";

interface MfaSectionProps {
    mfaEnabled: boolean;
    onMfaEnabledChange: (enabled: boolean) => void;
}

export default function MfaSection({
    mfaEnabled,
    onMfaEnabledChange,
}: Readonly<MfaSectionProps>) {
    const [setupOpen, setSetupOpen] = useState<boolean>(false);
    const [disableOpen, setDisableOpen] = useState<boolean>(false);
    const [backupCodesOpen, setBackupCodesOpen] = useState<boolean>(false);

    return (
        <div className="grid gap-4">
            <div>
                <h3 className="mb-1 text-sm font-medium">
                    Two-factor authentication
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                </p>
            </div>
            <div className="flex justify-between items-center gap-3 p-4 border rounded-lg">
                <div>
                    <p className="text-sm font-medium">Authenticator app</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        TOTP via Google Authenticator, Authy, or similar
                    </p>
                    {mfaEnabled && (
                        <Badge className="mt-1 text-[10px] text-emerald-700 bg-emerald-100 border-emerald-200 shadow-none hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900 dark:border-emerald-800 dark:hover:bg-emerald-900">
                            Enabled
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {mfaEnabled ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setBackupCodesOpen(true)}
                            >
                                Backup codes
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setDisableOpen(true)}
                            >
                                Disable
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSetupOpen(true)}
                        >
                            Enable
                        </Button>
                    )}
                </div>
            </div>
            <MfaSetupModal
                open={setupOpen}
                onOpenChange={setSetupOpen}
                onEnabled={() => {
                    onMfaEnabledChange(true);
                    setSetupOpen(false);
                }}
            />
            <MfaDisableModal
                open={disableOpen}
                onOpenChange={setDisableOpen}
                onDisabled={() => {
                    onMfaEnabledChange(false);
                    setDisableOpen(false);
                }}
            />
            <MfaBackupCodesModal
                open={backupCodesOpen}
                onOpenChange={setBackupCodesOpen}
            />
        </div>
    );
}
