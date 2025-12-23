"use client";

import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useCallback,
    useRef,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import useClickOutside from "@/hooks/UseClickOutside";
import { IPositions } from "@/interfaces/interfaces";
import Image from "next/image";
import {
    IoClose,
    IoFilter,
    IoLocationSharp,
    IoSearchOutline,
} from "react-icons/io5";
import {
    FaChevronDown,
    FaParking,
    FaPaw,
    FaStar,
    FaWheelchair,
    FaWifi,
} from "react-icons/fa";
import { BiMoney, BiSolidCategory } from "react-icons/bi";
import { MdAccessTime } from "react-icons/md";

interface SearchProps {
    positions: IPositions[];
    setZoomLocationX: Dispatch<SetStateAction<number>>;
    setZoomLocationY: Dispatch<SetStateAction<number>>;
    setSelectedPosition: Dispatch<SetStateAction<number | null>>;
    setOpenPlaceDetails: Dispatch<SetStateAction<boolean>>;
}

export default function Search({
    positions,
    setZoomLocationX,
    setZoomLocationY,
    setSelectedPosition,
    setOpenPlaceDetails,
}: SearchProps) {
    const [valueLocation, setValueLocation] = useState<string>("");
    const [valueName, setValueName] = useState<string>("");
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [filterVisible, setFilterVisible] = useState<boolean>(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const refDropdown = useRef<HTMLDivElement>(null);

    useClickOutside(refDropdown, () => setDropdownVisible(false));

    const handleChangeLocation = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setValueLocation(e.target.value);
        },
        [setValueLocation],
    );

    const handleChangeName = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setValueName(e.target.value);
        },
        [setValueName],
    );

    const handleDropdownToggle = useCallback(() => {
        setDropdownVisible(!dropdownVisible);
    }, [setDropdownVisible, dropdownVisible]);

    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(category)
                ? prevSelected.filter((cat) => cat !== category)
                : [...prevSelected, category],
        );
    }, []);

    const handleZoomLocation = useCallback(
        (x: number, y: number, key: number) => {
            setZoomLocationX(x);
            setZoomLocationY(y);
            setSelectedPosition(key);
            setOpenPlaceDetails(true);
        },
        [
            setZoomLocationX,
            setZoomLocationY,
            setSelectedPosition,
            setOpenPlaceDetails,
        ],
    );

    const handleClearFilters = () => {
        setValueLocation("");
        setValueName("");
        setSelectedCategories([]);
    };

    const handleShowFilter = () => {
        setFilterVisible(!filterVisible);
    };

    const uniqueCategories = [...new Set(positions.map((pos) => pos.category))];

    const filteredPositions = positions.filter(
        (elem) =>
            elem.name.toLowerCase().includes(valueName.toLowerCase()) &&
            elem.location.toLowerCase().includes(valueLocation.toLowerCase()) &&
            (selectedCategories.length === 0 ||
                selectedCategories.includes(elem.category)),
    );

    const formatPrice = (price: number) => {
        return price === 0 ? "Free" : `${price} PLN`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    const hasActiveFilters =
        valueLocation || valueName || selectedCategories.length > 0;

    return (
        <section className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1002] transition-colors">
            <div className="p-4 md:p-6 border-b dark:border-gray-800">
                <div className="flex justify-between items-center">
                    <h1 className="md:mb-6 text-2xl md:text-3xl font-bold text-black dark:text-white">
                        Search Places
                    </h1>
                    <button
                        className="flex md:hidden flex-col justify-center items-center gap-2 p-2 md:p-4 font-medium bg-gray-100 dark:bg-dark-mode-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
                        onClick={handleShowFilter}
                    >
                        <IoFilter className="w-5 h-5" />
                    </button>
                </div>
                {filterVisible && (
                    <div className="grid gap-3 mt-4">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                            <input
                                className="w-full py-2 md:py-3 pl-12 pr-4 text-black dark:text-white bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                type="text"
                                placeholder="Search by name..."
                                value={valueName}
                                onChange={handleChangeName}
                            />
                        </div>
                        <div className="relative">
                            <IoLocationSharp className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                            <input
                                className="w-full py-2 md:py-3 pl-12 pr-4 text-black dark:text-white bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                type="text"
                                placeholder="Search by location..."
                                value={valueLocation}
                                onChange={handleChangeLocation}
                            />
                        </div>
                        <div ref={refDropdown} className="relative">
                            <button
                                onClick={handleDropdownToggle}
                                className="flex items-center justify-between w-full px-4 py-2 md:py-3 text-white font-medium bg-bright-blue hover:bg-blue-600 rounded-lg transition"
                            >
                                <span className="flex items-center gap-2">
                                    <BiSolidCategory className="w-5 h-5" />
                                    {selectedCategories.length > 0
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
                                        initial={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeOut",
                                        }}
                                        className="custom-scroll absolute top-full w-full max-h-64 mt-2 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-y-auto"
                                    >
                                        <ul className="p-2">
                                            {uniqueCategories.map(
                                                (category, key) => (
                                                    <li key={key}>
                                                        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition">
                                                            <input
                                                                type="checkbox"
                                                                value={category}
                                                                checked={selectedCategories.includes(
                                                                    category,
                                                                )}
                                                                className="w-4 h-4 text-bg-bright-blue bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                onChange={() =>
                                                                    handleCategoryChange(
                                                                        category,
                                                                    )
                                                                }
                                                            />
                                                            <span className="ml-3 text-sm font-medium text-black dark:text-gray-100">
                                                                {category}
                                                            </span>
                                                        </label>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center justify-center gap-2 w-full h-10 px-4 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-dark-mode-black hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <IoClose className="w-5 h-5" />
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
                <div className="hidden md:grid gap-3">
                    <div className="relative">
                        <IoSearchOutline className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                        <input
                            className="w-full py-2 md:py-3 pl-12 pr-4 text-black dark:text-white bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            type="text"
                            placeholder="Search by name..."
                            value={valueName}
                            onChange={handleChangeName}
                        />
                    </div>
                    <div className="relative">
                        <IoLocationSharp className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                        <input
                            className="w-full py-2 md:py-3 pl-12 pr-4 text-black dark:text-white bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            type="text"
                            placeholder="Search by location..."
                            value={valueLocation}
                            onChange={handleChangeLocation}
                        />
                    </div>
                    <div ref={refDropdown} className="relative">
                        <button
                            onClick={handleDropdownToggle}
                            className="flex items-center justify-between w-full px-4 py-2 md:py-3 text-white font-medium bg-bright-blue hover:bg-blue-600 rounded-lg transition"
                        >
                            <span className="flex items-center gap-2">
                                <BiSolidCategory className="w-5 h-5" />
                                {selectedCategories.length > 0
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
                                    initial={{
                                        opacity: 0,
                                        y: -10,
                                        scale: 0.95,
                                    }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeOut",
                                    }}
                                    className="custom-scroll absolute top-full w-full max-h-64 mt-2 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-y-auto"
                                >
                                    <ul className="p-2">
                                        {uniqueCategories.map(
                                            (category, key) => (
                                                <li key={key}>
                                                    <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition">
                                                        <input
                                                            type="checkbox"
                                                            value={category}
                                                            checked={selectedCategories.includes(
                                                                category,
                                                            )}
                                                            className="w-4 h-4 text-bg-bright-blue bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            onChange={() =>
                                                                handleCategoryChange(
                                                                    category,
                                                                )
                                                            }
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-black dark:text-gray-100">
                                                            {category}
                                                        </span>
                                                    </label>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center justify-center gap-2 w-full h-10 px-4 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-dark-mode-black hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            <IoClose className="w-5 h-5" />
                            Clear filters
                        </button>
                    )}
                </div>
            </div>
            <div className="custom-scroll grid sm:grid-cols-2 place-content-start justify-center gap-5 h-full p-4 overflow-y-auto">
                {filteredPositions.length ? (
                    filteredPositions.map((elem) => (
                        <div
                            key={elem.id}
                            onClick={() =>
                                handleZoomLocation(elem.x, elem.y, elem.id)
                            }
                            className="flex flex-col bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                                <div className="relative w-full h-full max-h-52 rounded-t-xl">
                                    <Image
                                        className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                                        src={elem.img}
                                        alt={elem.name}
                                        width={300}
                                        height={200}
                                    />
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                                    <FaStar className="w-3.5 h-3.5" />
                                    {elem.rating}
                                </div>
                                <div className="absolute bottom-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-bright-blue rounded-full">
                                    {elem.category}
                                </div>
                            </div>
                            <div className="grid content-between h-full p-4">
                                <div>
                                    <h3 className="mb-2 text-lg font-bold text-black dark:text-white line-clamp-2">
                                        {elem.name}
                                    </h3>
                                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {elem.description_short}
                                    </p>
                                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                        <IoLocationSharp className="w-4 h-4 text-bright-blue" />
                                        <span className="truncate">
                                            {elem.location}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <BiMoney className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-semibold text-black dark:text-white">
                                                {formatPrice(elem.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MdAccessTime className="w-5 h-5 text-bright-blue" />
                                            <span className="text-sm font-semibold text-black dark:text-white">
                                                {formatDuration(
                                                    elem.average_visit_duration,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {elem.facilities.parking && (
                                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                                <FaParking className="w-3 h-3" />
                                            </div>
                                        )}
                                        {elem.facilities.pet_friendly && (
                                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                                <FaPaw className="w-3 h-3" />
                                            </div>
                                        )}
                                        {elem.facilities.wheelchair_access && (
                                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                                <FaWheelchair className="w-3 h-3" />
                                            </div>
                                        )}
                                        {elem.facilities.wifi && (
                                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                                <FaWifi className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 grid justify-items-center py-16 text-center">
                        <IoSearchOutline className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                            No places found
                        </h3>
                        <p className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                            Try adjusting your filters or search terms to find
                            what you&apos;re looking for
                        </p>
                    </div>
                )}
            </div>
            {filteredPositions.length > 0 && (
                <div className="px-6 py-2 md:py-4 bg-gray-50 dark:bg-dark-mode-black/50 border-t dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Found{" "}
                        <span className="font-bold text-black dark:text-white">
                            {filteredPositions.length}
                        </span>{" "}
                        {filteredPositions.length === 1 ? "place" : "places"}
                    </p>
                </div>
            )}
        </section>
    );
}
