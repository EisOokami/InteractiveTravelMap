import Link from "next/link";
import Image from "next/image";
import { getPositionsData } from "@/data/loaders";
import { MapPin, Star } from "lucide-react";
import { IPosition } from "@/interfaces/interfaces";
import PlaceFilterAndSort from "@/components/ui/placeFilterAndSort/PlaceFilterAndSort";
import { Button } from "@/components/ui/shadcn/button";

const features = [
    {
        id: 1,
        title: "Explore on Map",
        description:
            "View all places on an interactive map, see photos, ratings, and detailed information.",
        component: (positionsData: IPosition[]) => (
            <div className="relative grid content-center justify-items-center h-40 bg-[url(/map1.png)] bg-center">
                <input
                    type="checkbox"
                    id="popup-toggle"
                    className="peer hidden w-min"
                />
                <div className="absolute bottom-32 w-80 opacity-0 scale-95 pointer-events-none transition-all duration-300 peer-checked:opacity-100 peer-checked:scale-100 peer-checked:pointer-events-auto z-10">
                    <div className="relative">
                        <div className="w-full bg-white dark:bg-dark-mode-black dark:border rounded-xl shadow-xl overflow-hidden transition-colors">
                            <div className="relative w-full h-36 md:h-52">
                                <Image
                                    src={positionsData[0].img}
                                    alt={positionsData[0].name}
                                    className="w-full h-full object-cover"
                                    width={320}
                                    height={210}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm font-semibold text-white bg-yellow-500 rounded-full">
                                            <Star className="w-3 md:w-4 h-3 md:h-4" />
                                            {positionsData[0].rating}
                                        </div>
                                        <span className="px-3 py-1 text-xs md:text-sm text-white font-semibold bg-bright-blue rounded-full">
                                            {positionsData[0].category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 md:px-6 py-4 md:py-5">
                                <h3 className="mb-2 text-xl md:text-2xl font-bold text-black dark:text-white transition-colors line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                    {positionsData[0].name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2 md:mb-4 text-gray-600 dark:text-gray-300">
                                    <MapPin className="min-w-4 md:min-w-5 min-h-4 md:min-h-5 text-bright-blue" />
                                    <span className="text-sm line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                        {positionsData[0].address}
                                    </span>
                                </div>
                                <p className="mb-3 md:mb-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                                    {positionsData[0].description_short}
                                </p>
                                <Button
                                    className="w-full px-4 py-2 md:py-3 text-white font-semibold bg-bright-blue hover:bg-blue-600 rounded-lg transition-colors shadow-lg"
                                    asChild
                                >
                                    <Link
                                        href={`/map?placeCard=${positionsData[0].id}&x=${positionsData[0].x}&y=${positionsData[0].y}`}
                                    >
                                        More Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="absolute left-1/2 w-10 h-5 -mt-[3px] ml-2.5 overflow-hidden -translate-x-1/2 z-10">
                            <div className="w-4 h-4 -mt-2 p-px bg-white dark:bg-dark-mode-black shadow-xl rotate-45 z-10"></div>
                        </div>
                    </div>
                </div>
                <label
                    htmlFor="popup-toggle"
                    className="flex justify-center items-center w-fit h-fit [&_.marker]:peer-checked:ring-4 [&_.marker]:peer-checked:ring-blue-300 [&_.marker]:peer-checked:ring-opacity-70 [&_.marker]:peer-checked:scale-110 [&_.marker]:peer-checked:animate-bounce"
                >
                    <div className="marker flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg hover:ring-4 hover:ring-blue-300 hover:ring-opacity-50 hover:scale-110 cursor-pointer transition-all duration-400">
                        <div className="flex justify-center items-center w-9 h-9 overflow-hidden rounded-full">
                            <Image
                                src={positionsData[0].img}
                                alt={positionsData[0].name}
                                className="w-10 h-10 object-cover pointer-events-none select-none"
                                width={50}
                                height={50}
                            />
                        </div>
                    </div>
                </label>
            </div>
        ),
    },
    {
        id: 2,
        title: "Search & Discover",
        description:
            "Browse through thousands of destinations or search for specific places you want to visit.",
        component: (positionsData: IPositions[]) => (
            <div className="grid place-content-center h-44 lg:h-48 xl:h-full">
                <PlaceFilterAndSort positionsData={positionsData} />
            </div>
        ),
    },
    {
        id: 3,
        title: "Create a Route",
        description:
            "Select the date of your trip, type of transport, and find out the distance and travel time.",
        component: () => {
            const todayDate = new Date();
            const nextDay = new Date(todayDate);
            nextDay.setDate(todayDate.getDate() + 1);

            const formatDate = (date: Date) =>
                `${date.getDate().toString().padStart(2, "0")}/${(
                    date.getMonth() + 1
                )
                    .toString()
                    .padStart(2, "0")}`;

            return (
                <div className="flex flex-wrap justify-center items-center gap-2 h-44 lg:h-48 xl:h-full">
                    <div>
                        <input
                            type="checkbox"
                            id="today"
                            className="peer hidden"
                        />
                        <label
                            htmlFor="today"
                            className="flex justify-center items-center w-28 h-14 text-white bg-bright-blue rounded-lg cursor-pointer transition-all duration-300 peer-checked:bg-blue-600 peer-checked:scale-105"
                        >
                            <span className="text-sm sm:text-base md:text-lg font-semibold">
                                {formatDate(todayDate)}
                            </span>
                        </label>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            id="next-day"
                            className="peer hidden"
                        />
                        <label
                            htmlFor="next-day"
                            className="flex justify-center items-center w-28 h-14 text-white bg-bright-blue rounded-lg cursor-pointer transition-all duration-300 peer-checked:bg-blue-600 peer-checked:scale-105"
                        >
                            <span className="text-sm sm:text-base md:text-lg font-semibold">
                                {formatDate(nextDay)}
                            </span>
                        </label>
                    </div>
                </div>
            );
        },
    },
    {
        id: 4,
        title: "Start Your Journey",
        description:
            "Get directions, plan your route, and embark on your perfect adventure.",
        component: (positionsData: IPositions[]) => (
            <div className="relative w-full h-44 lg:h-48 xl:h-full bg-[url(/line.svg)] bg-center bg-no-repeat bg-cover pointer-events-none select-none">
                <div className="absolute top-7 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                    <div className="flex justify-center items-center w-9 h-9 overflow-hidden rounded-full">
                        <Image
                            src={positionsData[0].img}
                            alt={positionsData[0].name}
                            className="w-10 h-10 object-cover"
                            width={50}
                            height={50}
                        />
                    </div>
                </div>
                <div className="absolute right-0 bottom-7 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
                    <div className="flex justify-center items-center w-9 h-9 overflow-hidden rounded-full">
                        <Image
                            src={positionsData[1].img}
                            alt={positionsData[1].name}
                            className="w-10 h-10 object-cover"
                            width={50}
                            height={50}
                        />
                    </div>
                </div>
            </div>
        ),
    },
];

export default async function HowItWorks() {
    const positionsData = await getPositionsData();

    return (
        <section
            id="how-it-works"
            className="grid place-items-center gap-5 container mx-auto scroll-mt-28 px-4 py-16 md:py-28 lg:py-32"
        >
            <h2 className="max-w-[820px] text-center text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold">
                How It Works
            </h2>
            <p className="max-w-[750px] text-center text-base md:text-xl text-muted-foreground leading-relaxed">
                Start planning your dream trip in four simple steps
            </p>
            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4 mt-10">
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="flex flex-col p-8 bg-white dark:bg-dark-mode-black border-2 rounded-xl"
                    >
                        <div className="flex items-center gap-3 h-min mb-5">
                            <div className="flex justify-center items-center w-9 h-9 bg-bright-blue rounded-full">
                                <span className="text-white">
                                    0{feature.id}
                                </span>
                            </div>
                            <h3 className="text-xl dark:text-white font-medium">
                                {feature.title}
                            </h3>
                        </div>
                        <div className="relative h-full mb-5">
                            {feature.component(positionsData)}
                        </div>
                        <p className="self-end text-muted-foreground leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
