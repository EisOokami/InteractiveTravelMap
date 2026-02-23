"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { IPlace, IUser } from "@/interfaces/interfaces";

import PlaceCard from "@/components/ui/placeCard/PlaceCard";
import PlaceFilterAndSort from "@/components/ui/placeFilterAndSort/PlaceFilterAndSort";

interface SearchProps {
    places: IPlace[];
    userData: IUser;
}

export default function Search({ places, userData }: Readonly<SearchProps>) {
    const [filteredPlaces, setFilteredPlaces] = useState<IPlace[]>(places);

    return (
        <section className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1002] transition-colors">
            <div className="p-4 md:p-6 border-b dark:border-gray-800">
                <div className="flex justify-between items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                        Search Places
                    </h1>
                    <PlaceFilterAndSort
                        placesData={places}
                        setFilteredPlaces={setFilteredPlaces}
                    />
                </div>
            </div>
            <div className="custom-scroll grid sm:grid-cols-2 place-content-start justify-center gap-5 h-full p-4 overflow-y-auto">
                {filteredPlaces.length ? (
                    filteredPlaces.map((place) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            userData={userData}
                        />
                    ))
                ) : (
                    <div className="md:col-span-2 grid justify-items-center py-16 text-center">
                        <SearchIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
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
            {filteredPlaces.length > 0 && (
                <div className="px-6 py-2 md:py-4 bg-gray-50 dark:bg-dark-mode-black/50 border-t dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Found{" "}
                        <span className="font-semibold text-black dark:text-white">
                            {filteredPlaces.length}
                        </span>{" "}
                        {filteredPlaces.length === 1 ? "place" : "places"}
                    </p>
                </div>
            )}
        </section>
    );
}
