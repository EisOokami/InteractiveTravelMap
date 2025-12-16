import { CSSProperties } from "react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IPositions } from "@/interfaces/interfaces";
import Image from "next/image";
import {
    FaGripVertical,
    FaParking,
    FaPaw,
    FaStar,
    FaWheelchair,
    FaWifi,
} from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { BiMoney } from "react-icons/bi";
import { MdAccessTime } from "react-icons/md";

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

    const formatPrice = (price: number) => {
        return price === 0 ? "Free" : `${price} PLN`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="relative flex md:grid w-full max-w-full mb-4 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-default">
                <div
                    {...listeners}
                    className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white dark:bg-dark-mode-black dark:hover:bg-gray-900 rounded-lg shadow-md cursor-grab backdrop-blur-sm active:cursor-grabbing z-10 transition touch-none"
                >
                    <FaGripVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
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
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 md:px-2.5 py-0.5 md:py-1 text-xs md:text-sm font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                        <FaStar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        {place.rating}
                    </div>
                    <div className="absolute bottom-3 right-3 hidden sm:block px-3 py-1 text-xs font-semibold text-white bg-bright-blue rounded-full">
                        {place.category}
                    </div>
                </div>
                <div className="w-2/3 md:w-full p-4">
                    <h3 className="mb-2 text-lg font-bold text-black dark:text-white line-clamp-1">
                        {place.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <IoLocationSharp className="w-4 h-4 text-bright-blue" />
                        <span className="truncate">{place.location}</span>
                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {place.description_short}
                    </p>
                    <div className="hidden xl:grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            <BiMoney className="w-5 h-5 text-green-600 " />
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
                            <MdAccessTime className="w-5 h-5 text-bright-blue" />
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
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaParking className="w-3 h-3" />
                            </div>
                        )}
                        {place.facilities.pet_friendly && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaPaw className="w-3 h-3" />
                            </div>
                        )}
                        {place.facilities.wheelchair_access && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaWheelchair className="w-3 h-3" />
                            </div>
                        )}
                        {place.facilities.wifi && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaWifi className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
