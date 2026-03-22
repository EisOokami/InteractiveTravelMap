"use client";

import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RootState } from "@/libs/redux/store";
import { setFavorites } from "@/libs/redux/features/favorites/favoritesSlice";
import {
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";
import {
    setIsPlaceDetailsLoading,
    setOpenPlaceDetails,
    setOpenSearch,
} from "@/libs/redux/features/ui/uiSlice";
import { getPlaceData } from "@/data/loaders";
import { IPlace, IUser } from "@/interfaces/interfaces";

import Sidebar from "@/components/ui/sidebar/Sidebar";
import Search from "@/components/layout/search/Search";
import PlaceDetailsSkeleton from "@/components/layout/placeDetails/PlaceDetailsSkeleton";
import Favorite from "../favorite/Favorite";
import DarkModeBtn from "@/components/ui/darkModeBtn/DarkModeBtn";
import TripSkeleton from "../trip/TripSkeleton";
import NotLoggedInMsg from "@/components/ui/notLoggedInMsg/NotLoggedInMsg";

const Map = dynamic(() => import("@/components/layout/map/Map"), {
    loading: () => (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
    ),
    ssr: false,
});
const Trip = dynamic(() => import("@/components/layout/trip/Trip"), {
    loading: () => <TripSkeleton />,
    ssr: false,
});
const PlaceDetails = dynamic(
    () => import("@/components/layout/placeDetails/PlaceDetails"),
    {
        loading: () => <PlaceDetailsSkeleton />,
        ssr: false,
    },
);
const Profile = dynamic(() => import("@/components/ui/profile/Profile"), {
    loading: () => (
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full z-50 animate-pulse"></div>
    ),
    ssr: false,
});

const animationSettings = {
    initial: {
        width: 0,
    },
    animate: {
        width: "var(--menu-width)",
        transition: {
            duration: 0.5,
            delay: 0.5,
        },
    },
    exit: {
        width: 0,
        transition: {
            duration: 0.5,
        },
    },
};

interface MapPageProps {
    placesData: IPlace[];
    userData: IUser;
    favoritesData: IPlace[];
}

export default function MapPage({
    placesData,
    userData,
    favoritesData,
}: Readonly<MapPageProps>) {
    const [placeDetailsData, setPlaceDetailsData] = useState<IPlace | null>(
        null,
    );
    const searchParams = useSearchParams();
    const placeId = searchParams.get("placeId");
    const x = searchParams.get("x");
    const y = searchParams.get("y");
    const openSearch = useSelector((state: RootState) => state.ui.openSearch);
    const openTrip = useSelector((state: RootState) => state.ui.openTrip);
    const openFavorite = useSelector(
        (state: RootState) => state.ui.openFavorite,
    );
    const openPlaceDetails = useSelector(
        (state: RootState) => state.ui.openPlaceDetails,
    );
    const isPlaceDetailsLoading = useSelector(
        (state: RootState) => state.ui.isPlaceDetailsLoading,
    );
    const dispatch = useDispatch();
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        dispatch(setFavorites(favoritesData));
    }, [dispatch, favoritesData]);

    useEffect(() => {
        if (!placeId) {
            return;
        }

        dispatch(setOpenSearch(!!placeId));

        dispatch(
            setOpenPlaceDetails(placeId && Number.isInteger(Number(placeId))),
        );

        if (x) {
            dispatch(setZoomLocationX(+x));
        }

        if (y) {
            dispatch(setZoomLocationY(+y));
        }
    }, [dispatch, placeId, x, y]);

    useEffect(() => {
        (async () => {
            if (!placeId) {
                return;
            }

            const placeData = await getPlaceData(placeId);

            setPlaceDetailsData(placeData);
            dispatch(setIsPlaceDetailsLoading(false));
        })();
    }, [placeId, dispatch]);

    return (
        <div className="flex flex-col h-svh">
            <div className="grow flex">
                <div className="hidden md:flex">
                    <Sidebar userData={userData} />
                </div>
                <AnimatePresence>
                    {openSearch && (
                        <motion.div
                            key="search"
                            className="relative h-full md:h-screen z-1001 md:z-0"
                            variants={animationSettings}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <Search places={placesData} userData={userData} />
                            {openPlaceDetails &&
                                openSearch &&
                                placeDetailsData &&
                                (isPlaceDetailsLoading ? (
                                    <PlaceDetailsSkeleton />
                                ) : (
                                    <PlaceDetails
                                        placeDetailsData={placeDetailsData}
                                        userData={userData}
                                    />
                                ))}
                        </motion.div>
                    )}
                    {openTrip &&
                        (userData.status === "error" || !userData.data ? (
                            <motion.div
                                key="trip"
                                className="relative h-full md:h-screen z-1001 md:z-0"
                                variants={animationSettings}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <NotLoggedInMsg message="Sign in to your account to plan your trips." />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="trip"
                                className="relative h-full md:h-screen z-1001 md:z-0"
                                variants={animationSettings}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <Trip places={placesData} mapRef={mapRef} />
                            </motion.div>
                        ))}
                    {openFavorite &&
                        (userData.status === "error" || !userData.data ? (
                            <motion.div
                                key="favorite"
                                className="relative h-full md:h-screen z-1001 md:z-0"
                                variants={animationSettings}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <NotLoggedInMsg message="Sign in to your account to see your favorite places." />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="favorite"
                                className="relative h-full md:h-screen z-1001 md:z-0"
                                variants={animationSettings}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <Favorite userData={userData} />
                                {openPlaceDetails &&
                                    openFavorite &&
                                    placeDetailsData &&
                                    (isPlaceDetailsLoading ? (
                                        <PlaceDetailsSkeleton />
                                    ) : (
                                        <PlaceDetails
                                            placeDetailsData={placeDetailsData}
                                            userData={userData}
                                        />
                                    ))}
                            </motion.div>
                        ))}
                </AnimatePresence>
                <main className="md:relative grow h-full">
                    <Map places={placesData} mapRef={mapRef} />
                    <DarkModeBtn
                        variant="secondary"
                        className="absolute top-20 left-2.5 p-2"
                    />
                    <div className="absolute top-16 right-3.5 block md:hidden z-[600]">
                        <Profile userData={userData} />
                    </div>
                </main>
            </div>
            <div className="md:hidden">
                <Sidebar />
            </div>
        </div>
    );
}
