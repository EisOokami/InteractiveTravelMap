import React, { Dispatch, SetStateAction } from "react";
import { IoClose } from "react-icons/io5";

interface ClearFilterButtonProps {
    setValueLocation: Dispatch<SetStateAction<string>>;
    setValueName: Dispatch<SetStateAction<string>>;
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}

export default function ClearFilterButton({
    setValueLocation,
    setValueName,
    setSelectedCategories,
}: ClearFilterButtonProps) {
    const handleClearFilters = () => {
        setValueLocation("");
        setValueName("");
        setSelectedCategories([]);
    };

    return (
        <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 w-full h-10 px-4 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-dark-mode-black hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
        >
            <IoClose className="w-5 h-5" />
            Clear filters
        </button>
    );
}
