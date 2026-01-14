"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { IPositions } from "@/interfaces/interfaces";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import Sidebar from "@/components/ui/sidebar/Sidebar";
import MapDarkModeBtn from "@/components/ui/mapDarkModeBtn/MapDarkModeBtn";
import Search from "@/components/layout/search/Search";
import PlaceDetailsSkeleton from "@/components/layout/placeDetails/PlaceDetailsSkeleton";
import { RootState } from "@/libs/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
    setSelectedPosition,
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";
import {
    setOpenPlaceDetails,
    setOpenSearch,
} from "@/libs/redux/features/ui/uiSlice";

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

export default function MapPage({
    positionsData,
}: {
    positionsData: IPositions[];
}) {
    const searchParams = useSearchParams();
    const search = searchParams.get("placeCard");
    const x = searchParams.get("x");
    const y = searchParams.get("y");
    const openSearch = useSelector((state: RootState) => state.ui.openSearch);
    const openTrip = useSelector((state: RootState) => state.ui.openTrip);
    const openPlaceDetails = useSelector(
        (state: RootState) => state.ui.openPlaceDetails,
    );
    const dispatch = useDispatch();
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        dispatch(setOpenSearch(!!search));

        dispatch(
            setOpenPlaceDetails(search && Number.isInteger(Number(search))),
        );

        if (Number.isInteger(Number(search))) {
            dispatch(setSelectedPosition(Number(search)));
        }

        if (x) {
            dispatch(setZoomLocationX(+x));
        }

        if (y) {
            dispatch(setZoomLocationY(+y));
        }
    }, [dispatch, search, x, y]);

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
                            <Search positions={positionsData} />
                            {openPlaceDetails && openSearch && (
                                <Suspense fallback={<PlaceDetailsSkeleton />}>
                                    <PlaceDetails positions={positionsData} />
                                </Suspense>
                            )}
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
                            <Trip positions={positionsData} mapRef={mapRef} />
                        </motion.div>
                    )}
                </AnimatePresence>
                <main className="md:relative grow h-full">
                    <Map positions={positionsData} mapRef={mapRef} />
                    <MapDarkModeBtn />
                </main>
            </div>
            <div className="md:hidden">
                <Sidebar />
            </div>
        </section>
    );
}
