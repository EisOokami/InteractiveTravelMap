"use client";

import { useState, useEffect, RefObject } from "react";
import { useDispatch, useSelector } from "react-redux";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Bike, Car, CircleCheck, Footprints, Info, Trash2 } from "lucide-react";
import { RootState } from "@/libs/redux/store";
import {
    setRouteSegments,
    setRoutingControl,
    setShowRoute,
    setTransportMode,
} from "@/libs/redux/features/routes/routesSlice";
import { setSortedDates } from "@/libs/redux/features/dates/datesSlice";
import { IDateMap, IPlace } from "@/interfaces/interfaces";

import PlaceCardTrip from "../../ui/placeCardTrip/PlaceCardTrip";
import TransportButton from "@/components/ui/transportButton/TransportButton";
import { Button } from "@/components/ui/shadcn/button";

interface TripProps {
    places: IPlace[];
    mapRef: RefObject<L.Map | null>;
}

const transportModes = [
    { id: "car", icon: Car, label: "Car" },
    { id: "bike", icon: Bike, label: "Bike" },
    { id: "walk", icon: Footprints, label: "Walk" },
];

export default function Trip({ places, mapRef }: Readonly<TripProps>) {
    const [isRoute, setIsRoute] = useState<string | null>(null);
    const [isNavigationDisabled, setIsNavigationDisabled] =
        useState<boolean>(false);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    const datesStorage = useSelector(
        (state: RootState) => state.dates.datesStorage,
    );
    const showRoute = useSelector((state: RootState) => state.routes.showRoute);
    const transportMode = useSelector(
        (state: RootState) => state.routes.transportMode,
    );
    const routingControl = useSelector(
        (state: RootState) => state.routes.routingControl,
    );
    const routeSegments = useSelector(
        (state: RootState) => state.routes.routeSegments,
    );
    const sortedDates = useSelector(
        (state: RootState) => state.dates.sortedDates,
    );
    const dispatch = useDispatch();

    useEffect(() => {
        const datesMap: IDateMap = {};

        Object.keys(datesStorage).forEach((placeId) => {
            const dates = datesStorage[+placeId];

            dates.forEach((dateObj) => {
                if (dateObj.active) {
                    if (!datesMap[dateObj.date]) {
                        datesMap[dateObj.date] = [];
                    }

                    datesMap[dateObj.date].push(places[+placeId]);
                }
            });
        });

        const sortedDatesArray = Object.keys(datesMap)
            .sort((a, b) => {
                const [dayA, monthA] = a.split("/").map(Number);
                const [dayB, monthB] = b.split("/").map(Number);
                return (
                    new Date(2024, monthA - 1, dayA).getTime() -
                    new Date(2024, monthB - 1, dayB).getTime()
                );
            })
            .map((date) => ({ date, places: datesMap[date] }));

        dispatch(setSortedDates(sortedDatesArray));
    }, [datesStorage, dispatch, places]);

    const convertTime = (totalSeconds: number): string => {
        const totalMinutes = totalSeconds / 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        return `${hours}.${minutes.toString().padStart(2, "0")}`;
    };

    const handleNavigation = (places: IPlace[], date: string) => {
        setIsNavigationDisabled(true);
        setIsRoute(null);
        dispatch(setRouteSegments([]));

        if (showRoute && routingControl) {
            routingControl.remove();
            dispatch(setRoutingControl(null));
            dispatch(setShowRoute(false));
            setIsNavigationDisabled(false);

            return;
        }

        if (places.length < 2) {
            return;
        }

        const waypoints = places.map((place) => L.latLng(place.x, place.y));
        const profile =
            transportMode === "car"
                ? "driving"
                : transportMode === "bike"
                  ? "cycling"
                  : "walking";

        const newRoutingControl = L.Routing.control({
            waypoints,
            lineOptions: {
                styles: [{ color: "#6FA1EC", weight: 4 }],
                extendToWaypoints: false,
                missingRouteTolerance: 0,
            },
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: () => null,
            router: L.Routing.mapbox(process.env.NEXT_PUBLIC_MAPBOX_API_KEY!, {
                profile: `mapbox/${profile}`,
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        newRoutingControl.on("routesfound", (e) => {
            const route = e.routes[0];
            const totalDistance = (route.summary.totalDistance / 1000).toFixed(
                2,
            );
            const totalTime = (route.summary.totalTime / 3600).toFixed(2);

            dispatch(
                setRouteSegments([
                    { distance: totalDistance, time: totalTime },
                ]),
            );
            dispatch(setShowRoute(true));
            setIsNavigationDisabled(false);
        });

        if (mapRef?.current) {
            newRoutingControl.addTo(mapRef?.current);

            setIsRoute(date);

            dispatch(setRoutingControl(newRoutingControl));
            mapRef?.current.fitBounds(L.latLngBounds(waypoints));
        }
    };

    const handleDragEnd = (
        event: DragEndEvent,
        date: string,
        places: IPlace[],
    ) => {
        const { active, over } = event;

        if (over && active.id !== over.id && routeSegments.length === 0) {
            const activeIndex = places.findIndex(
                (place) => place.id === active.id,
            );
            const overIndex = places.findIndex((place) => place.id === over.id);

            const newPlaces = [...places];
            const [removed] = newPlaces.splice(activeIndex, 1);
            newPlaces.splice(overIndex, 0, removed);

            const newSortedDates = sortedDates.map((sortedDate) =>
                sortedDate.date === date
                    ? { date, places: newPlaces }
                    : sortedDate,
            );

            dispatch(setSortedDates(newSortedDates));
        }
    };

    return (
        <aside className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1999] transition-colors">
            <div className="p-4 md:p-6 border-b dark:border-gray-800">
                <h1 className="mb-4 md:mb-6 text-2xl md:text-3xl font-bold text-black dark:text-white">
                    Trip Planner
                </h1>
                <div className="grid grid-cols-3 gap-3">
                    {transportModes.map((mode) => (
                        <TransportButton
                            key={mode.id}
                            id={mode.id}
                            icon={mode.icon}
                            label={mode.label}
                            transportMode={transportMode}
                            setTransportMode={(value: string) =>
                                dispatch(setTransportMode(value))
                            }
                        />
                    ))}
                </div>
            </div>
            <div className="custom-scroll grid gap-8 p-3 md:p-6 overflow-x-hidden overflow-y-auto">
                {sortedDates.length > 0 ? (
                    sortedDates.map(({ date, places }, dateIndex) => (
                        <div key={dateIndex} className="grid gap-4">
                            <div className="sticky -top-3 md:-top-6 py-3 bg-white dark:bg-dark-mode-black z-50 transition-colors">
                                <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-black dark:text-white">
                                    <span className="flex justify-center items-center w-8 md:w-10 h-8 md:h-10 text-sm font-bold bg-bright-blue text-white rounded-full">
                                        {dateIndex + 1}
                                    </span>
                                    {date}
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <DndContext
                                    sensors={sensors}
                                    onDragEnd={(e: DragEndEvent) =>
                                        handleDragEnd(e, date, places)
                                    }
                                    modifiers={[]}
                                    collisionDetection={closestCenter}
                                >
                                    <SortableContext
                                        items={places}
                                        strategy={rectSortingStrategy}
                                    >
                                        {places.map((place) => (
                                            <div key={place.id}>
                                                <PlaceCardTrip
                                                    place={place}
                                                    convertTime={convertTime}
                                                />
                                            </div>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    style={{
                                        backgroundColor: isRoute
                                            ? "#ef4444"
                                            : "",
                                    }}
                                    onClick={() =>
                                        handleNavigation(places, date)
                                    }
                                    disabled={
                                        isNavigationDisabled ||
                                        places.length < 2
                                    }
                                    className="gap-2 px-6 py-6 font-medium text-white bg-bright-blue hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-md transition [&_svg]:size-5"
                                >
                                    {isNavigationDisabled ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Loading...
                                        </>
                                    ) : isRoute ? (
                                        <>
                                            <Trash2 className="mb-0.5" />
                                            Clear Route
                                        </>
                                    ) : (
                                        <>
                                            <Info className="mb-0.5" />
                                            Plan Route
                                        </>
                                    )}
                                </Button>
                                {isRoute === date &&
                                    routeSegments.length > 0 && (
                                        <div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                                            <CircleCheck className="w-5 h-5" />
                                            <span className="text-sm">
                                                Route planned
                                            </span>
                                        </div>
                                    )}
                            </div>
                            {places.length < 2 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Add at least 2 places to plan a route
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 grid justify-items-center py-16 text-center">
                        <Info className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                            No trips planned yet
                        </h3>
                        <p className="max-w-xs text-sm text-gray-600 dark:text-gray-400">
                            Start adding places to your trip to create an
                            itinerary
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}
