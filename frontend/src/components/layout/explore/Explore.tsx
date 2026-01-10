import { Button } from "@/components/ui/shadcn/button";
import { getPositionsData } from "@/data/loaders";
import Image from "next/image";
import Link from "next/link";
import { BiMoney } from "react-icons/bi";
import { FaParking, FaPaw, FaStar, FaWheelchair, FaWifi } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";

export default async function Explore() {
    const positionsData = await getPositionsData();

    const formatPrice = (price: number) => {
        return price === 0 ? "Free" : `${price} $`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    return (
        <section
            id="explore"
            className="grid place-items-center gap-5 container mx-auto scroll-mt-28 px-4 pb-16 md:pb-28 lg:pb-32"
        >
            <h2 className="max-w-[820px] text-center text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold">
                Popular Destinations
            </h2>
            <p className="max-w-[750px] text-center text-base md:text-xl text-muted-foreground leading-relaxed">
                Explore trending places and hidden gems loved by travelers
            </p>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-10 mt-10">
                {positionsData.slice(0, 4).map((position) => (
                    <Link
                        key={position.id}
                        href={`/map?placeCard=${position.id}&x=${position.x}&y=${position.y}`}
                        className="flex flex-col bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="relative min-h-48 overflow-hidden rounded-t-xl">
                            <div className="relative w-full h-full max-h-52 rounded-t-xl">
                                <Image
                                    className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300  pointer-events-none select-none"
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
                                    <span className="truncate">
                                        {position.location}
                                    </span>
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
                    </Link>
                ))}
            </div>
            <Button
                className="text-white bg-bright-blue hover:bg-blue-600"
                size="lg"
                asChild
            >
                <Link href="/map?placeCard=all">Explore All Places</Link>
            </Button>
        </section>
    );
}
