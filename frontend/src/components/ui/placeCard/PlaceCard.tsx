import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { IPlace, IUser } from "@/interfaces/interfaces";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Accessibility,
    Banknote,
    Clock,
    Heart,
    MapPin,
    ParkingSquare,
    PawPrint,
    Plus,
    Check,
    Star,
    Wifi,
} from "lucide-react";
import {
    formatDuration,
    formatPrice,
    normalizeCoordinates,
} from "@/libs/utils";

import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";

interface PlaceCardProps {
    place: IPlace;
    userData: IUser;
    onAddToTrip?: () => void;
    isInTripDay?: boolean;
}

export default function PlaceCard({
    place,
    userData,
    onAddToTrip,
    isInTripDay = false,
}: Readonly<PlaceCardProps>) {
    const setOpenFavorite = useMapStore((state) => state.setOpenFavorite);
    const setOpenPlaceDetails = useMapStore(
        (state) => state.setOpenPlaceDetails,
    );
    const setOpenSearch = useMapStore((state) => state.setOpenSearch);
    const setZoomLocationX = useMapStore((state) => state.setZoomLocationX);
    const setZoomLocationY = useMapStore((state) => state.setZoomLocationY);
    const toggleFavoriteAsync = useMapStore(
        (state) => state.toggleFavoriteAsync,
    );
    const isFavorite = useMapStore(
        (state) =>
            userData.status === "success" &&
            !!userData.data &&
            state.favorites.favorites.some(
                (favorite) => favorite.id === place.id,
            ),
    );
    const loading = useMapStore((state) => state.favorites.loading);
    const pathname = usePathname();
    const router = useRouter();

    const handleZoomLocation = (place: IPlace) => {
        const coordinates = normalizeCoordinates(place);

        if (coordinates !== null) {
            setZoomLocationX(coordinates[0]);
            setZoomLocationY(coordinates[1]);
        }

        setOpenPlaceDetails(true);
        setOpenSearch(true);
        setOpenFavorite(false);

        router.push(`${pathname}?placeId=${place.id}`);
    };

    return (
        <div
            onClick={onAddToTrip ? undefined : () => handleZoomLocation(place)}
            className={`flex flex-col min-w-0 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group ${onAddToTrip ? "" : "cursor-pointer"}`}
        >
            <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                {userData.status === "success" && userData.data && (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();

                            toggleFavoriteAsync(place);
                        }}
                        className="absolute top-3 left-3 text-red-500 bg-white/90 hover:bg-gray-100 dark:bg-dark-mode-black/90 rounded-full hover:scale-110 transition-transform z-30"
                        size="icon"
                        variant="secondary"
                        disabled={loading}
                    >
                        <Heart
                            fill={isFavorite ? "#ef4444" : "transparent"}
                            className="w-4 h-4"
                        />
                    </Button>
                )}
                <div className="relative w-full h-full max-h-52 rounded-t-xl pointer-events-none select-none">
                    <Image
                        src={place.img}
                        alt={place.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="absolute bottom-3 left-3 grid lg:flex items-center gap-1.5">
                    <Badge className="gap-1 w-fit text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                        <Star className="w-3 h-3" fill="#fff" />
                        {place.rating}
                    </Badge>
                    <Badge className="w-fit text-xs font-semibold text-white bg-bright-blue rounded-full">
                        {place.category}
                    </Badge>
                </div>
            </div>
            <div className="grid content-between h-full p-4">
                <div>
                    <h3 className="mb-2 text-lg font-bold text-black dark:text-white line-clamp-2">
                        {place.name}
                    </h3>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {place.description_short}
                    </p>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-bright-blue" />
                        <span className="truncate">{place.location}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1 lg:gap-2">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatPrice(place.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2">
                            <Clock className="w-5 h-5 text-bright-blue" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatDuration(place.average_visit_duration)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {place.facilities.parking && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <ParkingSquare className="w-3 h-3" />
                            </Badge>
                        )}
                        {place.facilities.pet_friendly && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <PawPrint className="w-3 h-3" />
                            </Badge>
                        )}
                        {place.facilities.wheelchair_access && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <Accessibility className="w-3 h-3" />
                            </Badge>
                        )}
                        {place.facilities.wifi && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <Wifi className="w-3 h-3" />
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            {onAddToTrip && (
                <div className="px-4 pb-4">
                    <Button
                        disabled={isInTripDay}
                        className="w-full bg-bright-blue text-white hover:bg-blue-600"
                        onClick={(event) => {
                            event.stopPropagation();

                            onAddToTrip();
                        }}
                    >
                        {isInTripDay ? <Check /> : <Plus />}
                        {isInTripDay ? "Added" : "Add to day"}
                    </Button>
                </div>
            )}
        </div>
    );
}
