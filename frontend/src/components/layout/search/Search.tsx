"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import useClickOutside from "@/hooks/UseClickOutside";
import { IoFilter, IoSearchOutline } from "react-icons/io5";
import { IPositions } from "@/interfaces/interfaces";

import PlaceCard from "@/components/ui/placeCard/PlaceCard";
import SearchInputs from "@/components/ui/searchInputs/SearchInputs";
import CategoryDropdown from "@/components/ui/categoryDropdown/CategoryDropdown";
import ClearFilterButton from "@/components/ui/clearFilterButton/ClearFilterButton";

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
    const refDropdown = useRef<HTMLDivElement | null>(null);

    useClickOutside(refDropdown, () => setDropdownVisible(false));

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
                        <SearchInputs
                            valueName={valueName}
                            valueLocation={valueLocation}
                            setValueLocation={setValueLocation}
                            setValueName={setValueName}
                        />
                        <CategoryDropdown
                            uniqueCategories={uniqueCategories}
                            selectedCategories={selectedCategories}
                            dropdownVisible={dropdownVisible}
                            refDropdown={refDropdown}
                            setDropdownVisible={setDropdownVisible}
                            setSelectedCategories={setSelectedCategories}
                        />
                        {hasActiveFilters && (
                            <ClearFilterButton
                                setSelectedCategories={setSelectedCategories}
                                setValueLocation={setValueLocation}
                                setValueName={setValueName}
                            />
                        )}
                    </div>
                )}
                <div className="hidden md:grid gap-3">
                    <SearchInputs
                        valueName={valueName}
                        valueLocation={valueLocation}
                        setValueLocation={setValueLocation}
                        setValueName={setValueName}
                    />
                    <CategoryDropdown
                        uniqueCategories={uniqueCategories}
                        selectedCategories={selectedCategories}
                        dropdownVisible={dropdownVisible}
                        refDropdown={refDropdown}
                        setDropdownVisible={setDropdownVisible}
                        setSelectedCategories={setSelectedCategories}
                    />
                    {hasActiveFilters && (
                        <ClearFilterButton
                            setSelectedCategories={setSelectedCategories}
                            setValueLocation={setValueLocation}
                            setValueName={setValueName}
                        />
                    )}
                </div>
            </div>
            <div className="custom-scroll grid sm:grid-cols-2 place-content-start justify-center gap-5 h-full p-4 overflow-y-auto">
                {filteredPositions.length ? (
                    filteredPositions.map((position) => (
                        <PlaceCard
                            key={position.id}
                            position={position}
                            setOpenPlaceDetails={setOpenPlaceDetails}
                            setSelectedPosition={setSelectedPosition}
                            setZoomLocationX={setZoomLocationX}
                            setZoomLocationY={setZoomLocationY}
                        />
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
                        <span className="font-semibold text-black dark:text-white">
                            {filteredPositions.length}
                        </span>{" "}
                        {filteredPositions.length === 1 ? "place" : "places"}
                    </p>
                </div>
            )}
        </section>
    );
}
