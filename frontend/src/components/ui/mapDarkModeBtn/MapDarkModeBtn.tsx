"use client";

import { FiMoon } from "react-icons/fi";
import { LuSun } from "react-icons/lu";
import { Button } from "../shadcn/button";
import { useTheme } from "next-themes";

export default function MapDarkModeBtn() {
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button
            variant="secondary"
            className="absolute top-20 left-2.5 p-2 bg-white hover:bg-gray-100 dark:bg-dark-mode-black dark:hover:bg-dark-mode-gray-2 rounded-lg z-[1001] cursor-pointer"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
        >
            {theme === "dark" ? <FiMoon /> : <LuSun />}
        </Button>
    );
}
