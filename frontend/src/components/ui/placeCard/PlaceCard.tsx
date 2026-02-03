import { IPlace } from "@/interfaces/interfaces";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
    Accessibility,
    Banknote,
    Clock,
    Heart,
    MapPin,
    ParkingSquare,
    PawPrint,
    Star,
    Wifi,
} from "lucide-react";
import { formatPrice } from "@/libs/formatPrice";
import { formatDuration } from "@/libs/formatDuration";
import { RootState } from "@/libs/redux/store";
import {
    setOpenFavorite,
    setOpenPlaceDetails,
    setOpenSearch,
} from "@/libs/redux/features/ui/uiSlice";
import {
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";
import { toggleFavorite } from "@/libs/redux/features/favorites/favoritesSlice";

import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";

interface PlaceCardProps {
    place: IPlace;
}

export default function PlaceCard({ place }: Readonly<PlaceCardProps>) {
    const favorites = useSelector(
        (state: RootState) => state.favorites.favorites,
    );
    const dispatch = useDispatch();
    const pathname = usePathname();
    const router = useRouter();

    const handleZoomLocation = (x: number, y: number, placeId: number) => {
        dispatch(setZoomLocationX(x));
        dispatch(setZoomLocationY(y));
        dispatch(setOpenPlaceDetails(true));
        dispatch(setOpenSearch(true));
        dispatch(setOpenFavorite(false));
        router.push(`${pathname}?placeId=${placeId}`);
    };

    const isFavorite = favorites.includes(place.id);

    return (
        <div
            onClick={() => handleZoomLocation(place.x, place.y, place.id)}
            className="flex flex-col bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();

                        dispatch(toggleFavorite(place.id));
                    }}
                    aria-label={
                        isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }
                    className="absolute top-3 left-3 text-red-500 bg-white/90 hover:bg-gray-100 dark:bg-dark-mode-black/90 rounded-full hover:scale-110 transition-transform z-30"
                    size="icon"
                    variant="secondary"
                >
                    <Heart
                        fill={isFavorite ? "#ef4444" : "transparent"}
                        className="w-4 h-4"
                    />
                </Button>
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
        </div>
    );
}
