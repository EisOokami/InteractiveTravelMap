"use client";

import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { getLegacyDates } from "@/libs/stores/mapStore";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Accessibility,
    ArrowLeft,
    Banknote,
    Clock,
    Heart,
    MapPin,
    ParkingSquare,
    PawPrint,
    Star,
    Wifi,
} from "lucide-react";
import { formatDuration, formatPrice } from "@/libs/utils";
import { IPlace, IUser } from "@/interfaces/interfaces";

import InfoCard from "@/components/ui/infoCard/InfoCard";
import WorkingHours from "@/components/ui/workingHours/WorkingHours";
import FacilityBadge from "@/components/ui/facilityBadge/FacilityBadge";
import AddPlaceToTrip from "@/components/ui/addPlaceToTrip/AddPlaceToTrip";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";

interface PlaceDetailsProps {
    placeDetailsData: IPlace;
    userData: IUser;
}

export default function PlaceDetails({
    placeDetailsData,
    userData,
}: Readonly<PlaceDetailsProps>) {
    const setIsPlaceDetailsLoading = useMapStore(
        (state) => state.setIsPlaceDetailsLoading,
    );
    const setOpenPlaceDetails = useMapStore(
        (state) => state.setOpenPlaceDetails,
    );
    const setZoomLocationX = useMapStore((state) => state.setZoomLocationX);
    const setZoomLocationY = useMapStore((state) => state.setZoomLocationY);
    const toggleFavoriteAsync = useMapStore(
        (state) => state.toggleFavoriteAsync,
    );
    const isFavorite = useMapStore((state) =>
        state.favorites.favorites.some(
            (favorite) => favorite.id === placeDetailsData.id,
        ),
    );
    const loading = useMapStore((state) => state.favorites.loading);
    const legacyDates = useMapStore((state) =>
        getLegacyDates(state.dates.datesStorage, placeDetailsData.id),
    );
    const pathname = usePathname();
    const router = useRouter();

    const handleOpenPlaceDetails = () => {
        router.push(pathname);

        setIsPlaceDetailsLoading(true);
        setOpenPlaceDetails(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
    };

    return (
        <aside className="absolute w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black overflow-y-hidden z-[1099] transition-colors">
            <div className="custom-scroll h-full overflow-y-auto">
                <div className="absolute top-4 left-4 flex gap-2">
                    <Button
                        className="bg-bright-blue hover:bg-blue-600 rounded-full z-50 shadow-lg"
                        size="icon"
                        onClick={handleOpenPlaceDetails}
                    >
                        <ArrowLeft className="w-10 h-10 text-white" />
                    </Button>
                    {userData.status === "success" && userData.data && (
                        <Button
                            className="text-red-500 bg-white/90 dark:bg-dark-mode-black/90 rounded-full shadow-lg z-50"
                            size="icon"
                            variant="secondary"
                            onClick={() =>
                                placeDetailsData &&
                                toggleFavoriteAsync(placeDetailsData)
                            }
                            disabled={loading}
                        >
                            <Heart
                                fill={isFavorite ? "#ef4444" : "transparent"}
                                className="w-6 h-6"
                            />
                        </Button>
                    )}
                </div>
                <div className="relative w-full h-80">
                    <div className="relative w-full h-full">
                        <Image
                            className="w-full h-full object-cover"
                            src={placeDetailsData.img}
                            alt={placeDetailsData.name}
                            width={600}
                            height={320}
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="gap-1 text-sm font-semibold bg-yellow-500 text-white rounded-full">
                                <Star className="w-4 h-4" fill="#fff" />
                                {placeDetailsData.rating}
                            </Badge>
                            <Badge className="text-sm text-white font-semibold bg-bright-blue rounded-full">
                                {placeDetailsData.category}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
                    <h1 className="mb-2 text-3xl font-bold text-black dark:text-white transition-colors">
                        {placeDetailsData.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-5 h-5 text-bright-blue" />
                        <span className="text-sm">
                            {placeDetailsData.address}
                        </span>
                    </div>
                    <p className="mb-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {placeDetailsData.description_full}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <InfoCard
                            icon={Banknote}
                            title="Price"
                            info={formatPrice(placeDetailsData.price)}
                        />
                        <InfoCard
                            icon={Clock}
                            title="Duration"
                            info={formatDuration(
                                placeDetailsData.average_visit_duration,
                            )}
                        />
                    </div>
                    <div className="mb-6">
                        <h2 className="flex items-center gap-2 mb-3 text-lg font-bold text-black dark:text-white">
                            <Clock className="w-5 h-5 text-bright-blue" />
                            Working Hours
                        </h2>
                        <WorkingHours
                            workingHours={placeDetailsData.working_hours}
                        />
                    </div>
                    <div className="mb-6">
                        <h2 className="mb-3 text-lg font-bold text-black dark:text-white">
                            Facilities
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {placeDetailsData.facilities.parking && (
                                <FacilityBadge
                                    icon={ParkingSquare}
                                    name="Parking"
                                />
                            )}
                            {placeDetailsData.facilities.pet_friendly && (
                                <FacilityBadge
                                    icon={PawPrint}
                                    name="Pet Friendly"
                                />
                            )}
                            {placeDetailsData.facilities.wheelchair_access && (
                                <FacilityBadge
                                    icon={Accessibility}
                                    name="Wheelchair Access"
                                />
                            )}
                            {placeDetailsData.facilities.wifi && (
                                <FacilityBadge icon={Wifi} name="WiFi" />
                            )}
                            {!placeDetailsData.facilities.parking &&
                                !placeDetailsData.facilities.pet_friendly &&
                                !placeDetailsData.facilities
                                    .wheelchair_access &&
                                !placeDetailsData.facilities.wifi && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No facilities information available
                                    </p>
                                )}
                        </div>
                    </div>
                    {userData.status === "success" && userData.data && (
                        <>
                            <AddPlaceToTrip placeId={placeDetailsData.id} />
                            {!!legacyDates.length && (
                                <details className="mb-6 rounded-lg border p-3 text-sm">
                                    <summary className="cursor-pointer font-medium">
                                        Previous date assignments
                                    </summary>
                                    <ul className="mt-3 grid gap-2">
                                        {legacyDates.map((date) => (
                                            <li key={date.id}>
                                                {date.date} ·{" "}
                                                {date.active
                                                    ? "Selected"
                                                    : "Not selected"}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
