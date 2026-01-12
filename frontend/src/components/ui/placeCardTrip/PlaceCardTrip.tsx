import { CSSProperties } from "react";
import Image from "next/image";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Accessibility,
    Banknote,
    Clock,
    Grip,
    MapPin,
    ParkingSquare,
    PawPrint,
    Star,
    Wifi,
} from "lucide-react";
import { IPositions } from "@/interfaces/interfaces";
import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
import { formatPrice } from "@/libs/formatPrice";
import { formatDuration } from "@/libs/formatDuration";

interface PlaceCardTripProps {
    place: IPositions;
    convertTime: (totalSeconds: number) => string;
}

export default function PlaceCardTrip({ place }: PlaceCardTripProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: place.id,
        animateLayoutChanges: (args) =>
            defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        position: isDragging ? "relative" : undefined,
        zIndex: isDragging ? 1000 : 0,
        cursor: isDragging ? "grabbing" : "grab",
        transition: transition || "transform 200ms ease",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="relative flex md:grid w-full max-w-full mb-4 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-default">
                <Button
                    {...listeners}
                    size="icon"
                    className="absolute top-3 left-3 bg-white/90 hover:bg-white dark:bg-dark-mode-black dark:hover:bg-gray-900 shadow-md cursor-grab backdrop-blur-sm active:cursor-grabbing z-10 touch-none"
                >
                    <Grip className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
                <div className="relative w-1/3 md:w-full max-w-48 md:max-w-full h-48 max-h-40 md:max-h-48 overflow-hidden">
                    <div className="relative w-full h-full">
                        <Image
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            src={place.img}
                            alt={place.name}
                            width={270}
                            height={200}
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 grid lg:flex items-center gap-1.5">
                        <Badge className="gap-1 w-fit text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                            <Star className="w-3 h-3" />
                            {place.rating}
                        </Badge>
                        <Badge className="hidden sm:block w-fit text-xs font-semibold text-white bg-bright-blue rounded-full">
                            {place.category}
                        </Badge>
                    </div>
                </div>
                <div className="w-2/3 md:w-full p-4">
                    <h3 className="mb-2 text-lg font-bold text-black dark:text-white line-clamp-1">
                        {place.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-bright-blue" />
                        <span className="truncate">{place.location}</span>
                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {place.description_short}
                    </p>
                    <div className="hidden xl:grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Banknote className="w-5 h-5 text-green-600 " />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Price
                                </p>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                    {formatPrice(place.price)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Clock className="w-5 h-5 text-bright-blue" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Duration
                                </p>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                    {formatDuration(
                                        place.average_visit_duration,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
