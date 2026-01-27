import { IPosition } from "@/interfaces/interfaces";
import Image from "next/image";
import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import {
    setOpenPlaceDetails,
    setOpenSearch,
} from "@/libs/redux/features/ui/uiSlice";
import {
    setSelectedPosition,
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";

interface PlaceCardProps {
    position: IPosition;
}

export default function PlaceCard({ position }: PlaceCardProps) {
    const dispatch = useDispatch();

    const handleZoomLocation = (x: number, y: number, key: number) => {
        dispatch(setZoomLocationX(x));
        dispatch(setZoomLocationY(y));
        dispatch(setSelectedPosition(key));
        dispatch(setOpenPlaceDetails(true));
        dispatch(setOpenSearch(true));
    };


    return (
        <div
            onClick={() =>
                handleZoomLocation(position.x, position.y, position.id)
            }
            className="flex flex-col bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                <div className="relative w-full h-full max-h-52 rounded-t-xl pointer-events-none select-none">
                    <Image
                        src={position.img}
                        alt={position.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="absolute bottom-3 left-3 grid lg:flex items-center gap-1.5">
                    <Badge className="gap-1 w-fit text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                        <Star className="w-3 h-3" />
                        {position.rating}
                    </Badge>
                    <Badge className="w-fit text-xs font-semibold text-white bg-bright-blue rounded-full">
                        {position.category}
                    </Badge>
                </div>
            </div>
            <div className="grid content-between h-full p-4">
                <div>
                    <h3 className="mb-2 text-lg font-bold text-black dark:text-white line-clamp-2">
                        {position.name}
                    </h3>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {position.description_short}
                    </p>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-bright-blue" />
                        <span className="truncate">{position.location}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatPrice(position.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-bright-blue" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatDuration(
                                    position.average_visit_duration,
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {position.facilities.parking && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <ParkingSquare className="w-3 h-3" />
                            </Badge>
                        )}
                        {position.facilities.pet_friendly && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <PawPrint className="w-3 h-3" />
                            </Badge>
                        )}
                        {position.facilities.wheelchair_access && (
                            <Badge className="px-1.5 py-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <Accessibility className="w-3 h-3" />
                            </Badge>
                        )}
                        {position.facilities.wifi && (
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
