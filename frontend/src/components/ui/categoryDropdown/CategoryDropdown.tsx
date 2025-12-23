import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, RefObject, SetStateAction } from "react";
import { BiSolidCategory } from "react-icons/bi";
import { FaChevronDown } from "react-icons/fa";

interface CategoryDropdownProps {
    uniqueCategories: string[];
    selectedCategories: string[];
    dropdownVisible: boolean;
    refDropdown: RefObject<HTMLDivElement | null>;
    setDropdownVisible: Dispatch<SetStateAction<boolean>>;
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}

export default function CategoryDropdown({
    uniqueCategories,
    selectedCategories,
    dropdownVisible,
    refDropdown,
    setDropdownVisible,
    setSelectedCategories,
}: CategoryDropdownProps) {
    const handleDropdownToggle = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(category)
                ? prevSelected.filter((cat) => cat !== category)
                : [...prevSelected, category],
        );
    };

    return (
        <div ref={refDropdown} className="relative">
            <button
                onClick={handleDropdownToggle}
                className="flex items-center justify-between w-full px-4 py-2 md:py-3 text-white font-medium bg-bright-blue hover:bg-blue-600 rounded-lg transition"
            >
                <span className="flex items-center gap-2">
                    <BiSolidCategory className="w-5 h-5" />
                    {selectedCategories.length
                        ? `${selectedCategories.length} selected`
                        : "Select categories"}
                </span>
                <FaChevronDown
                    className={`w-4 h-4 transition-transform ${
                        dropdownVisible ? "rotate-180" : ""
                    }`}
                />
            </button>
            <AnimatePresence>
                {dropdownVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="custom-scroll absolute top-full w-full max-h-64 mt-2 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-y-auto"
                    >
                        <ul className="p-2">
                            {uniqueCategories.map((category) => (
                                <li key={category}>
                                    <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(
                                                category,
                                            )}
                                            onChange={() =>
                                                handleCategoryChange(category)
                                            }
                                            className="w-4 h-4 text-bg-bright-blue bg-gray-100 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm font-medium">
                                            {category}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
