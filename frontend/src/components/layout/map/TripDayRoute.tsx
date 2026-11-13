"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import type { IPlace } from "@/interfaces/interfaces";
import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { TravelMode } from "@/types/store";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";
import {
    createRouteCache,
    normalizeCoordinates,
    planDayRoute,
} from "@/libs/utils";

function requestMapboxRoute(
    points: [number, number][],
    mode: TravelMode,
    signal: AbortSignal,
): Promise<L.Routing.IRoute> {
    return new Promise((resolve, reject) => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

        if (!token) {
            reject(new Error("Routing is currently unavailable."));

            return;
        }

        const router = L.Routing.mapbox(token, {
            profile: `mapbox/${mode}`,
            timeout: 15000,
            routingOptions: { alternatives: false, steps: true },
        });
        const waypoints = points.map(([latitude, longitude]) =>
            L.Routing.waypoint(L.latLng(latitude, longitude)),
        );

        let request: unknown;

        const abort = () => {
            if (
                request &&
                typeof request === "object" &&
                "abort" in request &&
                typeof request.abort === "function"
            ) {
                request.abort();
            }

            reject(
                new Error(
                    "The route could not be calculated. Please try again.",
                ),
            );
        };

        if (signal.aborted) {
            abort();

            return;
        }

        signal.addEventListener("abort", abort, { once: true });

        try {
            request = router.route(
                waypoints,
                (error?: L.Routing.IError, routes?: L.Routing.IRoute[]) => {
                    signal.removeEventListener("abort", abort);

                    if (signal.aborted) {
                        return;
                    }

                    const route = routes?.[0];

                    if (
                        error ||
                        !route?.summary ||
                        !(
                            Number.isFinite(route.summary.totalDistance) &&
                            route.summary.totalDistance >= 0 &&
                            Number.isFinite(route.summary.totalTime) &&
                            route.summary.totalTime >= 0
                        ) ||
                        !route.coordinates ||
                        !route.coordinates.length ||
                        !route.coordinates.every(
                            (point) =>
                                normalizeCoordinates({
                                    x: point.lat,
                                    y: point.lng,
                                }) !== null,
                        ) ||
                        !Array.isArray(route.instructions)
                    ) {
                        reject(
                            new Error(
                                "The route could not be calculated. Please try again.",
                            ),
                        );
                    } else {
                        resolve(route);
                    }
                },
            );
        } catch {
            signal.removeEventListener("abort", abort);

            reject(
                new Error(
                    "The route could not be calculated. Please try again.",
                ),
            );
        }
    });
}

export default function TripDayRoute({
    places,
}: Readonly<{ places: IPlace[] }>) {
    const map = useMap();
    const tripId = useTripsStore((state) => state.selectedTripId);
    const date = useTripsStore((state) => state.selectedDay);
    const day = useTripsStore((state) =>
        state.trips
            .find((trip) => trip.id === state.selectedTripId)
            ?.days.find((day) => day.date === state.selectedDay),
    );
    const retry = useTripsStore((state) => state.routeRetry);
    const beginRoute = useTripsStore((state) => state.beginRoute);
    const setRouteState = useTripsStore((state) => state.setRouteState);
    const clearPendingRoute = useTripsStore((state) => state.clearPendingRoute);
    const openTrip = useMapStore((state) => state.ui.openTrip);
    const controlRef = useRef<
        (L.Routing.Control & Pick<L.Evented, "off">) | null
    >(null);
    const cacheRef = useRef(createRouteCache<L.Routing.IRoute>());
    const requestsRef = useRef(new Set<AbortController>());
    const boundsRef = useRef<L.LatLng[]>([]);
    const generationRef = useRef(0);
    const cacheEpochRef = useRef(0);

    const byId = useMemo(
        () => new Map(places.map((place) => [place.id, place])),
        [places],
    );
    const plan = useMemo(
        () => (day ? planDayRoute(day, byId) : null),
        [day, byId],
    );

    const inputRef = useRef({ plan, mode: day?.travelMode });

    useEffect(() => {
        inputRef.current = { plan, mode: day?.travelMode };
    }, [plan, day?.travelMode]);

    useEffect(() => {
        const requests = requestsRef.current;
        const cache = cacheRef.current;

        return () => {
            cacheEpochRef.current += 1;

            requests.forEach((request) => request.abort());
            requests.clear();

            cache.clear();
        };
    }, []);

    useEffect(() => {
        const { plan, mode } = inputRef.current;
        const generation = ++generationRef.current;
        const cacheEpoch = cacheEpochRef.current;

        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let requestId: number | null = null;

        function clearControl() {
            const control = controlRef.current;

            controlRef.current = null;

            if (control) {
                control.off();
                control.remove();
                control.getPlan().off();
            }
        }

        clearControl();

        boundsRef.current =
            plan?.points.map(([latitude, longitude]) =>
                L.latLng(latitude, longitude),
            ) ?? [];

        if (boundsRef.current.length) {
            map.fitBounds(L.latLngBounds(boundsRef.current), {
                padding: [48, 48],
                maxZoom: 14,
                animate: false,
            });
        }

        if (plan && mode && !plan.issues.length && plan.stopCount >= 2) {
            const current = plan;

            const currentRequestId = beginRoute(current.key);

            if (currentRequestId === null) {
                return;
            }

            requestId = currentRequestId;

            timer = setTimeout(
                () => {
                    cacheRef.current
                        .load(current.key, async () => {
                            const controller = new AbortController();

                            requestsRef.current.add(controller);

                            return requestMapboxRoute(
                                current.points,
                                mode,
                                controller.signal,
                            ).finally(() =>
                                requestsRef.current.delete(controller),
                            );
                        })
                        .then((route) => {
                            if (
                                !active ||
                                generationRef.current !== generation ||
                                cacheEpochRef.current !== cacheEpoch
                            ) {
                                return;
                            }

                            if (
                                !route.summary ||
                                !setRouteState(current.key, currentRequestId, {
                                    status: "ready",
                                    metrics: {
                                        totalDistance:
                                            route.summary.totalDistance,
                                        totalTime: route.summary.totalTime,
                                    },
                                })
                            ) {
                                return;
                            }

                            if (
                                !active ||
                                generationRef.current !== generation
                            ) {
                                return;
                            }

                            const router: L.Routing.IRouter = {
                                route: (_waypoints, callback, context) => {
                                    if (
                                        active &&
                                        generationRef.current === generation
                                    ) {
                                        callback.call(context, undefined, [
                                            route,
                                        ]);
                                    }
                                },
                            };

                            const options: L.Routing.RoutingControlOptions &
                                L.Routing.PlanOptions = {
                                waypoints: current.points.map(
                                    ([latitude, longitude]) =>
                                        L.latLng(latitude, longitude),
                                ),
                                router,
                                autoRoute: false,
                                routeWhileDragging: false,
                                addWaypoints: false,
                                draggableWaypoints: false,
                                createMarker: () => false,
                                showAlternatives: false,
                                fitSelectedRoutes: false,
                                show: false,
                                collapsible: false,
                                containerClassName: "trip-day-routing-control",
                                defaultErrorHandler: () => {},
                                lineOptions: {
                                    styles: [{ color: "#0096FF", weight: 4 }],
                                    extendToWaypoints: false,
                                    missingRouteTolerance: 0,
                                },
                            };

                            const control = L.Routing.control(
                                options,
                            ) as L.Routing.Control & Pick<L.Evented, "off">;

                            controlRef.current = control;

                            control.addTo(map);
                            control.route();

                            boundsRef.current = route.coordinates ?? [];

                            if (boundsRef.current.length) {
                                map.fitBounds(
                                    L.latLngBounds(boundsRef.current),
                                    {
                                        padding: [48, 48],
                                        maxZoom: 14,
                                        animate: false,
                                    },
                                );
                            }
                        })
                        .catch((error: unknown) => {
                            if (
                                !active ||
                                generationRef.current !== generation
                            ) {
                                return;
                            }

                            clearControl();

                            setRouteState(current.key, currentRequestId, {
                                status: "error",
                                message:
                                    error instanceof Error &&
                                    error.message ===
                                        "Routing is currently unavailable."
                                        ? error.message
                                        : "The route could not be calculated. Please try again.",
                            });
                        });
                },
                cacheRef.current.peek(current.key) ? 0 : 150,
            );
        }
        return () => {
            active = false;

            generationRef.current += 1;

            clearTimeout(timer);
            clearControl();

            if (plan && requestId !== null) {
                clearPendingRoute(plan.key, requestId);
            }
        };
    }, [
        map,
        plan?.key,
        tripId,
        date,
        retry,
        beginRoute,
        setRouteState,
        clearPendingRoute,
    ]);

    useEffect(() => {
        if (!openTrip) {
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const fit = () => {
            clearTimeout(timer);

            timer = setTimeout(() => {
                if (boundsRef.current.length) {
                    map.fitBounds(L.latLngBounds(boundsRef.current), {
                        padding: [48, 48],
                        maxZoom: 14,
                        animate: false,
                    });
                }
            }, 150);
        };

        map.on("resize", fit);

        fit();

        return () => {
            map.off("resize", fit);

            clearTimeout(timer);
        };
    }, [map, openTrip]);

    return null;
}
