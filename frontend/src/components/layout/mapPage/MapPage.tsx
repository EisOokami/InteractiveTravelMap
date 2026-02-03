"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { IPlace } from "@/interfaces/interfaces";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "@/components/ui/sidebar/Sidebar";
import Search from "@/components/layout/search/Search";
import PlaceDetailsSkeleton from "@/components/layout/placeDetails/PlaceDetailsSkeleton";
import Favorite from "../favorite/Favorite";
import { RootState } from "@/libs/redux/store";
import { useDispatch, useSelector } from "react-redux";
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
import DarkModeBtn from "@/components/ui/darkModeBtn/DarkModeBtn";
import { getPlaceData } from "@/data/loaders";

const Map = dynamic(() => import("@/components/layout/map/Map"), {
    loading: () => (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
    ),
    ssr: false,
});
const Trip = dynamic(() => import("@/components/layout/trip/Trip"), {
    loading: () => <div></div>,
    ssr: false,
});
const PlaceDetails = dynamic(
    () => import("@/components/layout/placeDetails/PlaceDetails"),
    {
        loading: () => <PlaceDetailsSkeleton />,
        ssr: false,
    },
);

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
}

export default function MapPage({ placesData }: Readonly<MapPageProps>) {
    const [placeDetailsData, setPlaceDetailsData] = useState<IPlace | null>(
        null,
    );
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
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
    const favorites = useSelector(
        (state: RootState) => state.favorites.favorites,
    );
    const dispatch = useDispatch();
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const raw = localStorage.getItem("favorites");

        if (raw) {
            dispatch(setFavorites(JSON.parse(raw)));
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsInitialized(true);
    }, [dispatch]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites, isInitialized]);

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
        <section className="flex flex-col h-svh">
            <div className="grow flex">
                <div className="hidden md:flex">
                    <Sidebar />
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
                            <Search places={placesData} />
                            {openPlaceDetails &&
                                openSearch &&
                                placeDetailsData &&
                                (isPlaceDetailsLoading ? (
                                    <PlaceDetailsSkeleton />
                                ) : (
                                    <PlaceDetails
                                        placeDetailsData={placeDetailsData}
                                    />
                                ))}
                        </motion.div>
                    )}
                    {openTrip && (
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
                    )}
                    {openFavorite && (
                        <motion.div
                            key="favorite"
                            className="relative h-full md:h-screen z-1001 md:z-0"
                            variants={animationSettings}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <Favorite places={placesData} />
                            {openPlaceDetails &&
                                openFavorite &&
                                placeDetailsData &&
                                (isPlaceDetailsLoading ? (
                                    <PlaceDetailsSkeleton />
                                ) : (
                                    <PlaceDetails
                                        placeDetailsData={placeDetailsData}
                                    />
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <main className="md:relative grow h-full">
                    <Map places={placesData} mapRef={mapRef} />
                    <DarkModeBtn
                        variant="secondary"
                        className="absolute top-20 left-2.5 p-2"
                    />
                </main>
            </div>
            <div className="md:hidden">
                <Sidebar />
            </div>
        </section>
    );
}
