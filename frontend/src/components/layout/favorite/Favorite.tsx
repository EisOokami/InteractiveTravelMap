import { useSelector } from "react-redux";
import { Bookmark } from "lucide-react";
import { RootState } from "@/libs/redux/store";
import { IPlace } from "@/interfaces/interfaces";

import PlaceCard from "@/components/ui/placeCard/PlaceCard";

interface FavoriteProps {
    places: IPlace[];
}

export default function Favorite({ places }: Readonly<FavoriteProps>) {
    const favorites = useSelector(
        (state: RootState) => state.favorites.favorites,
    );
    const favoritePlaces = places.filter((place) =>
        favorites.includes(place.id),
    );

    return (
        <section className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1002] transition-colors">
            <div className="p-4 md:p-6 border-b dark:border-gray-800">
                <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                    Favorite places
                </h1>
            </div>
            <div className="custom-scroll grid sm:grid-cols-2 gap-8 p-3 md:p-6 overflow-x-hidden overflow-y-auto">
                {favoritePlaces.length ? (
                    favoritePlaces.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))
                ) : (
                    <div className="md:col-span-2 grid justify-items-center py-16 text-center">
                        <Bookmark className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                            No favorite places yet
                        </h3>
                        <p className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                            Try adding a place to your favorites to save your
                            favorite places
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
