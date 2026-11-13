"use client";

import { IUser } from "@/interfaces/interfaces";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/shadcn/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import ProfileForm from "@/components/ui/profileForm/ProfileForm";
import SecurityForm from "@/components/ui/securityForm/SecurityForm";
import DangerZoneForm from "@/components/ui/dangerZoneForm/DangerZoneForm";

interface AccountSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userData: IUser | undefined;
}

export function AccountSettingsModal({
    open,
    onOpenChange,
    userData,
}: Readonly<AccountSettingsModalProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 w-11/12 md:max-w-2xl p-0 rounded-md z-[1000]">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl font-semibold">
                        Settings
                    </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="profile" className="w-full">
                    <div className="border-b">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none">
                            <TabsTrigger
                                value="profile"
                                className="px-3 md:px-6 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="px-3 md:px-6 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Security
                            </TabsTrigger>
                            <TabsTrigger
                                value="danger"
                                className="px-3 md:px-6 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-destructive data-[state=active]:bg-transparent data-[state=active]:text-destructive"
                            >
                                Danger Zone
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="px-6 py-6">
                        <TabsContent value="profile">
                            <ProfileForm userData={userData} />
                        </TabsContent>
                        <TabsContent value="security">
                            <SecurityForm />
                        </TabsContent>
                        <TabsContent value="danger">
                            <DangerZoneForm userData={userData} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
