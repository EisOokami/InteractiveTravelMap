"use client";

import { useCallback, useEffect, useMemo } from "react";
import { IPosition } from "@/interfaces/interfaces";
import Image from "next/image";
import InfoCard from "@/components/ui/infoCard/InfoCard";
import WorkingHours from "@/components/ui/workingHours/WorkingHours";
import FacilityBadge from "@/components/ui/facilityBadge/FacilityBadge";
import DateButton from "@/components/ui/dateButton/DateButton";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import {
    Accessibility,
    ArrowLeft,
    Banknote,
    CirclePlus,
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
import { setOpenPlaceDetails } from "@/libs/redux/features/ui/uiSlice";
import {
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";
import { setRoutingControl } from "@/libs/redux/features/routes/routesSlice";
import {
    setDates,
    updateDatesStorage,
} from "@/libs/redux/features/dates/datesSlice";
import { toggleFavorite } from "@/libs/redux/features/favorites/favoritesSlice";

interface PlaceDetailsProps {
    positions: IPosition[];
}

export default function PlaceDetails({ positions }: PlaceDetailsProps) {
    const favorites = useSelector(
        (state: RootState) => state.favorites.favorites,
    );
    const selectedPosition = useSelector(
        (state: RootState) => state.map.selectedPosition,
    );
    const datesStorage = useSelector(
        (state: RootState) => state.dates.datesStorage,
    );
    const routingControl = useSelector(
        (state: RootState) => state.routes.routingControl,
    );
    const dates = useSelector((state: RootState) => state.dates.dates);
    const dispatch = useDispatch();
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
    const isFavorite = favorites.includes(positions[positionId].id);

    useEffect(() => {
        dispatch(setDates(datesStorage[positionId] || []));
    }, [dispatch, datesStorage, positionId]);

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

            dispatch(setDates(newDates));
            dispatch(
                updateDatesStorage({ markerId: positionId, dates: newDates }),
            );
        }
    }, [dispatch, formattedTodayDate, dates, positionId]);

    useEffect(() => {
        const isAnyDateActive = dates.some((d) => d.active);

        if (!isAnyDateActive && routingControl) {
            routingControl.remove();
            dispatch(setRoutingControl(null));
        }
    }, [dates, routingControl, dispatch]);

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

        dispatch(setDates(newDates));
        dispatch(updateDatesStorage({ markerId: positionId, dates: newDates }));
    }, [dates, dispatch, positionId, todayDate]);

    const handleOpenPlaceDetails = () => {
        dispatch(setOpenPlaceDetails(false));
        dispatch(setZoomLocationX(52.083));
        dispatch(setZoomLocationY(19.375));
    };

    return (
        <section className="absolute w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black overflow-y-hidden z-[1099] transition-colors">
            <div className="custom-scroll h-full overflow-y-auto">
                <div className="absolute top-4 left-4 flex gap-2">
                    <Button
                        className="bg-bright-blue hover:bg-blue-600 rounded-full z-50 shadow-lg"
                        size="icon"
                        onClick={handleOpenPlaceDetails}
                    >
                        <ArrowLeft className="w-10 h-10 text-white" />
                    </Button>
                    <Button
                        className="text-red-500 bg-white/90 dark:bg-dark-mode-black/90 rounded-full shadow-lg z-50"
                        size="icon"
                        variant="secondary"
                        onClick={() =>
                            positions[positionId] &&
                            dispatch(toggleFavorite(positions[positionId].id))
                        }
                    >
                        <Heart
                            fill={isFavorite ? "#ef4444" : "transparent"}
                            className="w-6 h-6"
                        />
                    </Button>
                </div>
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
                            <Badge className="gap-1 text-sm font-semibold bg-yellow-500 text-white rounded-full">
                                <Star className="w-4 h-4" />
                                {positions[positionId].rating}
                            </Badge>
                            <Badge className="text-sm text-white font-semibold bg-bright-blue rounded-full">
                                {positions[positionId].category}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
                    <h1 className="mb-2 text-3xl font-bold text-black dark:text-white transition-colors">
                        {positions[positionId].name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-5 h-5 text-bright-blue" />
                        <span className="text-sm">
                            {positions[positionId].address}
                        </span>
                    </div>
                    <p className="mb-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {positions[positionId].description_full}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <InfoCard
                            icon={Banknote}
                            title="Price"
                            info={formatPrice(positions[positionId].price)}
                        />
                        <InfoCard
                            icon={Clock}
                            title="Duration"
                            info={formatDuration(
                                positions[positionId].average_visit_duration,
                            )}
                        />
                    </div>
                    <div className="mb-6">
                        <h2 className="flex items-center gap-2 mb-3 text-lg font-bold text-black dark:text-white">
                            <Clock className="w-5 h-5 text-bright-blue" />
                            Working Hours
                        </h2>
                        <WorkingHours
                            workingHours={positions[positionId].working_hours}
                        />
                    </div>
                    <div className="mb-6">
                        <h2 className="mb-3 text-lg font-bold text-black dark:text-white">
                            Facilities
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {positions[positionId].facilities.parking && (
                                <FacilityBadge
                                    icon={ParkingSquare}
                                    name="Parking"
                                />
                            )}
                            {positions[positionId].facilities.pet_friendly && (
                                <FacilityBadge
                                    icon={PawPrint}
                                    name="Pet Friendly"
                                />
                            )}
                            {positions[positionId].facilities
                                .wheelchair_access && (
                                <FacilityBadge
                                    icon={Accessibility}
                                    name="Wheelchair Access"
                                />
                            )}
                            {positions[positionId].facilities.wifi && (
                                <FacilityBadge icon={Wifi} name="WiFi" />
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
                            {dates.map((date) => (
                                <DateButton
                                    key={date.id}
                                    id={date.id}
                                    active={date.active}
                                    date={date.date}
                                    dates={dates}
                                    positionId={positionId}
                                    setDates={(value) =>
                                        dispatch(setDates(value))
                                    }
                                    updateDatesStorage={(value) =>
                                        dispatch(updateDatesStorage(value))
                                    }
                                />
                            ))}
                            <Button
                                className="w-full h-14 bg-bright-blue hover:bg-blue-700 text-white rounded-lg [&_svg]:size-6 md:[&_svg]:size-7"
                                onClick={handleDateStorage}
                            >
                                <CirclePlus />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
