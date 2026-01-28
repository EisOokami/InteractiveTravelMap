import Image from "next/image";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "../../ui/shadcn/navigation-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "../../ui/shadcn/sheet";
import Link from "next/link";
import { Button } from "../../ui/shadcn/button";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import DarkModeBtn from "@/components/ui/darkModeBtn/DarkModeBtn";

export default function Header() {
    return (
        <header className="fixed w-full bg-white dark:bg-dark-mode-black border-b z-50">
            <div className="flex justify-between items-center container mx-auto px-4 py-3">
                <a
                    href="#hero"
                    className="flex items-center gap-3 w-64 select-none"
                >
                    <Image
                        src="/logo.png"
                        alt="logo"
                        width={35}
                        height={35}
                        className="pointer-events-none"
                    />
                    <span className="md:text-lg">Interactive Travel Map</span>
                </a>
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                href="#features"
                                className={navigationMenuTriggerStyle()}
                            >
                                Features
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                href="#how-it-works"
                                className={navigationMenuTriggerStyle()}
                            >
                                How It Works
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                href="#explore"
                                className={navigationMenuTriggerStyle()}
                            >
                                Explore
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="hidden md:flex justify-end items-center gap-3 w-64">
                    <DarkModeBtn variant="outline" size="icon" />
                    <Button
                        className="inline-flex text-white bg-bright-blue hover:bg-blue-600"
                        asChild
                    >
                        <Link href="/map">Get Started</Link>
                    </Button>
                </div>
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="flex flex-col gap-6 w-svw sm:w-3/4 pt-10"
                        >
                            <VisuallyHidden>
                                <SheetTitle>Mobile navigation</SheetTitle>
                                <SheetDescription>
                                    Main navigation links
                                </SheetDescription>
                            </VisuallyHidden>
                            <nav className="flex flex-col gap-6">
                                <SheetClose asChild>
                                    <Link
                                        href="#features"
                                        className="text-lg font-medium"
                                    >
                                        Features
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link
                                        href="#how-it-works"
                                        className="text-lg font-medium"
                                    >
                                        How It Works
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link
                                        href="#explore"
                                        className="text-lg font-medium"
                                    >
                                        Explore
                                    </Link>
                                </SheetClose>
                                <Button
                                    className="mt-4 bg-bright-blue hover:bg-blue-600"
                                    asChild
                                >
                                    <Link href="/map">Get Started</Link>
                                </Button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
