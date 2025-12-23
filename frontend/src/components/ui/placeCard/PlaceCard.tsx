"use client";

import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import {
    FaClock,
    FaParking,
    FaPaw,
    FaPlusCircle,
    FaStar,
    FaWheelchair,
    FaWifi,
} from "react-icons/fa";
import { IoArrowBack, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import { BiMoney } from "react-icons/bi";
import { IDates, IDatesStorage, IPositions } from "@/interfaces/interfaces";
import Image from "next/image";
import { Routing } from "leaflet";

interface PlaceCardProps {
    positions: IPositions[];
    selectedPosition: number | null;
    setOpenPlaceCard: Dispatch<SetStateAction<boolean>>;
    datesStorage: IDatesStorage;
    updateDatesStorage: (markerId: number, dates: IDates[]) => void;
    dates: IDates[];
    setDates: Dispatch<SetStateAction<IDates[]>>;
    setZoomLocationX: Dispatch<SetStateAction<number>>;
    setZoomLocationY: Dispatch<SetStateAction<number>>;
    routingControl: Routing.Control | null;
    setRoutingControl: Dispatch<SetStateAction<Routing.Control | null>>;
}

export default function PlaceCard({
    positions,
    selectedPosition,
    setOpenPlaceCard,
    datesStorage,
    updateDatesStorage,
    dates,
    setDates,
    setZoomLocationX,
    setZoomLocationY,
    routingControl,
    setRoutingControl,
}: PlaceCardProps) {
    const todayDate = useMemo(() => new Date(), []);
    const formattedTodayDate = `${
        todayDate.getDate() < 10
            ? "0" + todayDate.getDate()
            : todayDate.getDate()
    }/${
        todayDate.getMonth() + 1 < 10
            ? "0" + (todayDate.getMonth() + 1)
            : todayDate.getMonth() + 1
    }`;
    const positionId = selectedPosition !== null ? selectedPosition - 1 : 0;

    useEffect(() => {
        setDates(datesStorage[positionId] || []);
    }, [setDates, datesStorage, positionId]);

    useEffect(() => {
        if (!dates.some((dateObj) => dateObj.date === formattedTodayDate)) {
            const newDates = [
                ...dates,
                {
                    id: dates.length + 1,
                    date: formattedTodayDate,
                    active: false,
                },
            ];

            setDates(newDates);
            updateDatesStorage(positionId, newDates);
        }
    }, [setDates, formattedTodayDate, dates, positionId, updateDatesStorage]);

    const handleDateStorage = useCallback(() => {
        const nextDay = new Date(todayDate);
        nextDay.setDate(todayDate.getDate() + dates.length);
        const formattedNextDay = `${
            nextDay.getDate() < 10 ? "0" + nextDay.getDate() : nextDay.getDate()
        }/${
            nextDay.getMonth() + 1 < 10
                ? "0" + (nextDay.getMonth() + 1)
                : nextDay.getMonth() + 1
        }`;

        const newDates = [
            ...dates,
            { id: dates.length + 1, date: formattedNextDay, active: false },
        ];

        setDates(newDates);
        updateDatesStorage(positionId, newDates);
    }, [dates, setDates, positionId, updateDatesStorage, todayDate]);

    const handleActivateDate = useCallback(
        (id: number) => {
            const updatedDates = dates.map((dateObj) => {
                if (dateObj.id === id) {
                    return { ...dateObj, active: !dateObj.active };
                }
                return dateObj;
            });

            setDates(updatedDates);
            updateDatesStorage(positionId, updatedDates);
        },
        [dates, setDates, positionId, updateDatesStorage],
    );

    useEffect(() => {
        const isAnyDateActive = dates.some((d) => d.active);

        if (!isAnyDateActive && routingControl) {
            routingControl.remove();
            setRoutingControl(null);
        }
    }, [dates, routingControl, setRoutingControl]);

    const handleOpenPlaceCard = useCallback(() => {
        setOpenPlaceCard(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
    }, [setOpenPlaceCard, setZoomLocationX, setZoomLocationY]);

    const getDayName = (
        key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    ) => {
        const days: Record<
            "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
            string
        > = {
            mon: "Monday",
            tue: "Tuesday",
            wed: "Wednesday",
            thu: "Thursday",
            fri: "Friday",
            sat: "Saturday",
            sun: "Sunday",
        };
        return days[key] || key;
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
        <section className="absolute w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black overflow-y-hidden z-[1099] transition-colors">
            <div className="custom-scroll h-full overflow-y-auto">
                <button
                    className="absolute top-4 left-4 flex justify-center items-center w-10 h-10 bg-bright-blue hover:bg-blue-600 rounded-full z-50 transition-colors shadow-lg"
                    onClick={handleOpenPlaceCard}
                >
                    <IoArrowBack className="w-6 h-6 text-white" />
                </button>
                <div className="relative w-full h-80">
                    <div className="relative w-full h-full">
                        <Image
                            className="w-full h-full object-cover"
                            src={positions[positionId].img}
                            alt={positions[positionId].name}
                            width={600}
                            height={320}
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-yellow-500 text-white rounded-full">
                                <FaStar className="w-4 h-4" />
                                {positions[positionId].rating}
                            </div>
                            <span className="px-3 py-1 text-sm text-white font-semibold bg-bright-blue rounded-full">
                                {positions[positionId].category}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
                    <h1 className="mb-2 text-3xl font-bold text-black dark:text-white transition-colors">
                        {positions[positionId].name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-300">
                        <IoLocationSharp className="w-5 h-5 text-bright-blue" />
                        <span className="text-sm">
                            {positions[positionId].address}
                        </span>
                    </div>
                    <p className="mb-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {positions[positionId].description_full}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                            <BiMoney className="w-6 h-6 text-bright-blue" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Price
                                </p>
                                <p className="font-semibold text-black dark:text-white">
                                    {formatPrice(positions[positionId].price)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                            <IoTimeOutline className="w-6 h-6 text-bright-blue" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Duration
                                </p>
                                <p className="font-semibold text-black dark:text-white">
                                    {formatDuration(
                                        positions[positionId]
                                            .average_visit_duration,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h2 className="flex items-center gap-2 mb-3 text-lg font-bold text-black dark:text-white">
                            <FaClock className="w-5 h-5 text-bright-blue" />
                            Working Hours
                        </h2>
                        <div className="grid gap-2 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            {Object.entries(
                                positions[positionId].working_hours,
                            ).map(([day, hours]) => (
                                <div
                                    key={day}
                                    className="flex justify-between items-center text-sm"
                                >
                                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {getDayName(
                                            day as
                                                | "mon"
                                                | "tue"
                                                | "wed"
                                                | "thu"
                                                | "fri"
                                                | "sat"
                                                | "sun",
                                        )}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {hours === "00:00-24:00"
                                            ? "Open 24 hours"
                                            : hours}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h2 className="mb-3 text-lg font-bold text-black dark:text-white">
                            Facilities
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {positions[positionId].facilities.parking && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                    <FaParking className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Parking
                                    </span>
                                </div>
                            )}
                            {positions[positionId].facilities.pet_friendly && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                    <FaPaw className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Pet Friendly
                                    </span>
                                </div>
                            )}
                            {positions[positionId].facilities
                                .wheelchair_access && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                    <FaWheelchair className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Wheelchair Access
                                    </span>
                                </div>
                            )}
                            {positions[positionId].facilities.wifi && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                                    <FaWifi className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        WiFi
                                    </span>
                                </div>
                            )}
                            {!positions[positionId].facilities.parking &&
                                !positions[positionId].facilities
                                    .pet_friendly &&
                                !positions[positionId].facilities
                                    .wheelchair_access &&
                                !positions[positionId].facilities.wifi && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No facilities information available
                                    </p>
                                )}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h2 className="mb-3 text-lg font-bold text-black dark:text-white">
                            Select Visit Date
                        </h2>
                        <div className="grid grid-cols-5 gap-2">
                            {dates.map((elem) => (
                                <button
                                    key={elem.id}
                                    className={`flex justify-center items-center h-14 text-white rounded-lg transition ${
                                        elem.active
                                            ? "bg-blue-600 shadow-lg scale-105"
                                            : "bg-bright-blue hover:bg-blue-600"
                                    }`}
                                    onClick={() => handleActivateDate(elem.id)}
                                >
                                    <span className="text-sm sm:text-base md:text-lg font-semibold">
                                        {elem.date}
                                    </span>
                                </button>
                            ))}
                            <button
                                className="flex justify-center items-center h-14 bg-bright-blue hover:bg-blue-700 text-white rounded-lg transition"
                                onClick={handleDateStorage}
                            >
                                <FaPlusCircle className="w-6 md:w-8 h-6 md:h-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
