"use client";

import { useState, useEffect } from "react";
import { FiMoon } from "react-icons/fi";
import { LuSun } from "react-icons/lu";

const getInitialDarkMode = () => {
    if (typeof window === "undefined") {
        return false;
    }

    const storedMode = localStorage.getItem("darkMode");

    if (storedMode !== null) {
        return storedMode === "true";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const applyDarkModeClass = (isDark: boolean) => {
    if (typeof window === "undefined") {
        return false;
    }

    if (isDark) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
};

export default function DarkModeBtn() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const initialMode = getInitialDarkMode();
        applyDarkModeClass(initialMode);

        return initialMode;
    });

    useEffect(() => {
        localStorage.setItem("darkMode", `${isDarkMode}`);

        applyDarkModeClass(isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    return (
        <div
            className="absolute top-20 left-2 p-2 dark:text-white text-xl bg-white dark:bg-dark-mode-black dark:hover:bg-dark-mode-gray-2 rounded-lg z-[1001] cursor-pointer transition"
            onClick={toggleDarkMode}
        >
            {isDarkMode ? <FiMoon /> : <LuSun />}
        </div>
    );
}
