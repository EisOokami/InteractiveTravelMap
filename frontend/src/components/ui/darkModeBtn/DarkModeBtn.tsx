"use client";

import { useTheme } from "next-themes";
import { Button } from "../shadcn/button";
import { Moon, Sun } from "lucide-react";

export default function DarkModeBtn() {
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className="bg-white hover:bg-gray-100 dark:bg-dark-mode-black dark:hover:bg-dark-mode-gray-2 rounded-lg z-[1001] cursor-pointer"
            onClick={toggleDarkMode}
        >
            {theme === "dark" ? <Moon /> : <Sun />}
        </Button>
    );
}
