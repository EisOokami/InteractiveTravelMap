"use client";

import Link from "next/link";
import { logoutAction } from "@/data/actions";
import { CirclePlus, LogIn, UserPlus, Settings, LogOut } from "lucide-react";
import { IUser } from "@/interfaces/interfaces";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Button } from "../shadcn/button";
import { Separator } from "../shadcn/separator";

const listItems = [
    {
        id: 1,
        icon: LogIn,
        href: "/signIn",
        property: "Sign in",
        auth: false,
    },
    {
        id: 2,
        icon: UserPlus,
        href: "/signUp",
        property: "Sign up",
        auth: false,
    },
    {
        id: 3,
        icon: Settings,
        href: "",
        property: "Settings",
        auth: true,
    },
    {
        id: 4,
        icon: LogOut,
        href: "/signOut",
        property: "Sign Out",
        auth: true,
        action: async () => {
            await logoutAction();
            window.location.reload();
        },
    },
];

interface ProfileProps {
    userData: IUser | undefined;
}

export default function Profile({ userData }: Readonly<ProfileProps>) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-min rounded-full"
                    >
                        <Avatar>
                            <AvatarImage
                                src={undefined}
                                alt={
                                    userData &&
                                    userData.status === "success" &&
                                    userData.data
                                        ? userData.data.username.slice(0, 4)
                                        : "quest"
                                }
                            />
                            <AvatarFallback className="text-sm bg-white dark:bg-dark-mode-black border-2 transition-colors">
                                {userData &&
                                userData.status === "success" &&
                                userData.data
                                    ? userData.data.username.slice(0, 4)
                                    : "Quest"}
                            </AvatarFallback>
                        </Avatar>
                        {userData &&
                            (userData.status === "error" || !userData.data) && (
                                <div className="absolute -right-1 -bottom-1 inline-flex justify-center items-center rounded-full cursor-pointer">
                                    <CirclePlus className="text-background size-5 fill-slate-400" />
                                    <span className="sr-only">Add</span>
                                </div>
                            )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-48 ml-2 z-[400]"
                    side={window.innerWidth > 768 ? "right" : "bottom"}
                    align="end"
                >
                    {userData &&
                        userData.status === "success" &&
                        userData.data && (
                            <>
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <Separator />
                            </>
                        )}
                    <DropdownMenuGroup>
                        {listItems.map(
                            (item) =>
                                userData &&
                                item.auth ===
                                    (userData.status === "success") && (
                                    <DropdownMenuItem asChild key={item.id}>
                                        {item.property === "Settings" ? (
                                            <button className="w-full">
                                                <item.icon />
                                                <span className="text-popover-foreground">
                                                    {item.property}
                                                </span>
                                            </button>
                                        ) : item.action ? (
                                            <form action={item.action}>
                                                <button
                                                    type="submit"
                                                    className="flex items-center gap-2 text-sm [&>svg]:size-4 [&>svg]:shrink-0"
                                                >
                                                    <item.icon />
                                                    <span className="text-popover-foreground">
                                                        {item.property}
                                                    </span>
                                                </button>
                                            </form>
                                        ) : (
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span className="text-popover-foreground">
                                                    {item.property}
                                                </span>
                                            </Link>
                                        )}
                                    </DropdownMenuItem>
                                ),
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
