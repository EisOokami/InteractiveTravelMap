import { IPositions } from "@/interfaces/interfaces";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { BiMoney } from "react-icons/bi";
import { FaParking, FaPaw, FaStar, FaWheelchair, FaWifi } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";

interface PlaceCardProps {
    position: IPositions;
    setZoomLocationX: Dispatch<SetStateAction<number>>;
    setZoomLocationY: Dispatch<SetStateAction<number>>;
    setSelectedPosition: Dispatch<SetStateAction<number | null>>;
    setOpenPlaceDetails: Dispatch<SetStateAction<boolean>>;
}

export default function PlaceCard({
    position,
    setZoomLocationX,
    setZoomLocationY,
    setSelectedPosition,
    setOpenPlaceDetails,
}: PlaceCardProps) {
    const handleZoomLocation = (x: number, y: number, key: number) => {
        setZoomLocationX(x);
        setZoomLocationY(y);
        setSelectedPosition(key);
        setOpenPlaceDetails(true);
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
        <div
            onClick={() =>
                handleZoomLocation(position.x, position.y, position.id)
            }
            className="flex flex-col bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                <div className="relative w-full h-full max-h-52 rounded-t-xl">
                    <Image
                        className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                        src={position.img}
                        alt={position.name}
                        width={300}
                        height={200}
                    />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 text-sm font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                    <FaStar className="w-3.5 h-3.5" />
                    {position.rating}
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-bright-blue rounded-full">
                    {position.category}
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
                        <IoLocationSharp className="w-4 h-4 text-bright-blue" />
                        <span className="truncate">{position.location}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <BiMoney className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatPrice(position.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MdAccessTime className="w-5 h-5 text-bright-blue" />
                            <span className="text-sm font-semibold text-black dark:text-white">
                                {formatDuration(
                                    position.average_visit_duration,
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {position.facilities.parking && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaParking className="w-3 h-3" />
                            </div>
                        )}
                        {position.facilities.pet_friendly && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaPaw className="w-3 h-3" />
                            </div>
                        )}
                        {position.facilities.wheelchair_access && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded">
                                <FaWheelchair className="w-3 h-3" />
                            </div>
                        )}
                        {position.facilities.wifi && (
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
