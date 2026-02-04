"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/libs/utils";

import { Button } from "../shadcn/button";

interface DarkModeBtnProps {
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link"
        | null;
    size?: "default" | "sm" | "lg" | "icon" | null;
    className?: string;
}

export default function DarkModeBtn({
    variant,
    size,
    className,
}: Readonly<DarkModeBtnProps>) {
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button
            aria-label="Toggle dark mode"
            variant={variant}
            size={size}
            className={cn(
                className,
                "bg-white hover:bg-gray-100 dark:bg-dark-mode-black dark:hover:bg-dark-mode-gray-2 rounded-lg z-[1001]",
            )}
            onClick={toggleDarkMode}
        >
            {theme === "dark" ? <Moon /> : <Sun />}
        </Button>
    );
}
