"use client";

import { lazy, Suspense, useCallback, useRef, useState } from "react";
import {
    IDates,
    IDatesStorage,
    IPositions,
    ISortedDates,
} from "@/interfaces/interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { Routing } from "leaflet";
import dynamic from "next/dynamic";

import Sidebar from "@/components/ui/sidebar/Sidebar";
import Trip from "@/components/layout/trip/Trip";
import DarkModeBtn from "@/components/ui/darkModeBtn/DarkModeBtn";
import Map from "@/components/layout/map/Map";
import LoadingPlaceCard from "@/components/ui/placeCard/PlaceCardSkeleton";
import Search from "@/components/layout/search/Search";

const PlaceCard = lazy(() => import("@/components/ui/placeCard/PlaceCard"));

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
    const [openSearch, setOpenSearch] = useState<boolean>(false);
    const [openTrip, setOpenTrip] = useState<boolean>(false);
    const [openPlaceCard, setOpenPlaceCard] = useState<boolean>(false);
    const [zoomLocationX, setZoomLocationX] = useState<number>(52.083);
    const [zoomLocationY, setZoomLocationY] = useState<number>(19.375);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(
        null,
    );
    const [datesStorage, setDatesStorage] = useState<IDatesStorage>({});
    const [showRoute, setShowRoute] = useState<boolean>(false);
    const [transportMode, setTransportMode] = useState<string>("car");
    const [routingControl, setRoutingControl] =
        useState<Routing.Control | null>(null);
    const [sortedDates, setSortedDates] = useState<ISortedDates[]>([]);
    const [dates, setDates] = useState<IDates[]>([]);
    const mapRef = useRef<L.Map | null>(null);

    const updateDatesStorage = useCallback(
        (markerId: number, dates: IDates[]) => {
            setDatesStorage((prevState) => ({
                ...prevState,
                [markerId]: dates,
            }));
        },
        [],
    );

    return (
        <section className="flex flex-col h-svh">
            <div className="grow flex">
                <div className="hidden md:flex">
                    <Sidebar
                        openSearch={openSearch}
                        setOpenSearch={setOpenSearch}
                        setOpenPlaceCard={setOpenPlaceCard}
                        openTrip={openTrip}
                        setOpenTrip={setOpenTrip}
                        setZoomLocationX={setZoomLocationX}
                        setZoomLocationY={setZoomLocationY}
                    />
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
                            <Search
                                positions={positionsData}
                                setZoomLocationX={setZoomLocationX}
                                setZoomLocationY={setZoomLocationY}
                                setSelectedPosition={setSelectedPosition}
                                setOpenPlaceCard={setOpenPlaceCard}
                            />
                            {openPlaceCard && (
                                <Suspense fallback={<LoadingPlaceCard />}>
                                    <PlaceCard
                                        positions={positionsData}
                                        selectedPosition={selectedPosition}
                                        setOpenPlaceCard={setOpenPlaceCard}
                                        datesStorage={datesStorage}
                                        updateDatesStorage={updateDatesStorage}
                                        dates={dates}
                                        setDates={setDates}
                                        setZoomLocationX={setZoomLocationX}
                                        setZoomLocationY={setZoomLocationY}
                                        routingControl={routingControl}
                                        setRoutingControl={setRoutingControl}
                                    />
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
                            <Trip
                                positions={positionsData}
                                datesStorage={datesStorage}
                                showRoute={showRoute}
                                setShowRoute={setShowRoute}
                                routingControl={routingControl}
                                setRoutingControl={setRoutingControl}
                                transportMode={transportMode}
                                setTransportMode={setTransportMode}
                                sortedDates={sortedDates}
                                setSortedDates={setSortedDates}
                                mapRef={mapRef}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <main className="md:relative grow h-full">
                    <Map
                        setOpenSearch={setOpenSearch}
                        positions={positionsData}
                        zoomLocationX={zoomLocationX}
                        zoomLocationY={zoomLocationY}
                        setZoomLocationX={setZoomLocationX}
                        setZoomLocationY={setZoomLocationY}
                        setSelectedPosition={setSelectedPosition}
                        setOpenPlaceCard={setOpenPlaceCard}
                        setOpenTrip={setOpenTrip}
                        openPlaceCard={openPlaceCard}
                        mapRef={mapRef}
                    />
                    <DarkModeBtn />
                </main>
            </div>
            <div className="md:hidden">
                <Sidebar
                    openSearch={openSearch}
                    setOpenSearch={setOpenSearch}
                    setOpenPlaceCard={setOpenPlaceCard}
                    openTrip={openTrip}
                    setOpenTrip={setOpenTrip}
                    setZoomLocationX={setZoomLocationX}
                    setZoomLocationY={setZoomLocationY}
                />
            </div>
        </section>
    );
}
