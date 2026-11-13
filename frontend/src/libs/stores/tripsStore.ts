import { createStore } from "zustand/vanilla";
import type { Trip, TripDay, TripsStore } from "@/interfaces/store";
import {
    createTripSchema,
    idSchema,
    storedTripsSchema,
    travelModeSchema,
    tripNameSchema,
} from "../validation/store";
import { calendarDates } from "../utils";

export function createTripsStore(
    userId: number | null,
    options: {
        getStorage?: () => Pick<Storage, "getItem" | "setItem"> | null;
    } = {},
) {
    const key =
        userId === null
            ? null
            : `interactive-map-trip:trips:v${1}:user:${userId}`;
    const getStorage =
        options.getStorage ??
        (() => (typeof window === "undefined" ? null : window.localStorage));

    let connected = false;
    let writable = false;
    let storage: Pick<Storage, "getItem" | "setItem"> | null = null;
    let nextRouteRequestId = 0;

    return createStore<TripsStore>()((set, get) => {
        function ready(): { ok: true } | { ok: false; error: string } {
            if (key === null) {
                return {
                    ok: false,
                    error: "Sign in before editing trips",
                };
            }

            return connected
                ? { ok: true }
                : {
                      ok: false,
                      error: "Wait for saved trips to load",
                  };
        }

        function save(trips: Trip[]): void {
            if (!connected || !writable || storage === null || key === null) {
                return;
            }

            try {
                storage.setItem(
                    key,
                    JSON.stringify({
                        version: 1,
                        userId,
                        trips,
                    }),
                );

                if (
                    get().storageError !== null ||
                    get().hydrationStatus !== "ready"
                ) {
                    set({ storageError: null, hydrationStatus: "ready" });
                }
            } catch {
                set({
                    storageError:
                        "Trips could not be saved. Changes remain in memory.",
                });
            }
        }

        function commit(
            trips: Trip[],
            selection?: Pick<TripsStore, "selectedTripId" | "selectedDay">,
        ): void {
            set({ trips, ...selection });
            save(trips);
        }

        function updateDay(
            tripId: string,
            date: string,
            update: (day: TripDay) => TripDay,
        ): { ok: true } | { ok: false; error: string } {
            const status = ready();

            if (!status.ok) {
                return status;
            }

            const trip = get().trips.find((item) => item.id === tripId);
            const day = trip?.days.find((item) => item.date === date);

            if (!trip || !day) {
                return {
                    ok: false,
                    error: "Trip day not found",
                };
            }

            const updatedDay = update(day);

            if (updatedDay === day) {
                return { ok: true };
            }

            commit(
                get().trips.map((item) =>
                    item === trip
                        ? {
                              ...trip,
                              days: trip.days.map((item) =>
                                  item === day ? updatedDay : item,
                              ),
                          }
                        : item,
                ),
            );

            return { ok: true };
        }

        return {
            trips: [],
            selectedTripId: null,
            selectedDay: null,
            hydrationStatus: key === null ? "unauthenticated" : "pending",
            storageError: null,
            routeStates: {},
            routeRetry: 0,
            beginRoute: (key) => {
                if (!connected) {
                    return null;
                }

                const requestId = ++nextRouteRequestId;

                set({
                    routeStates: {
                        ...get().routeStates,
                        [key]: { status: "loading", requestId },
                    },
                });

                return requestId;
            },
            setRouteState: (key, requestId, state) => {
                if (
                    !connected ||
                    (state.status === "ready" &&
                        !(
                            Number.isFinite(state.metrics.totalDistance) &&
                            state.metrics.totalDistance >= 0 &&
                            Number.isFinite(state.metrics.totalTime) &&
                            state.metrics.totalTime >= 0
                        ))
                ) {
                    return false;
                }

                const current = get().routeStates[key];

                if (
                    current === undefined ||
                    current.status !== "loading" ||
                    current.requestId !== requestId
                ) {
                    return false;
                }

                set({ routeStates: { ...get().routeStates, [key]: state } });

                return true;
            },
            clearPendingRoute: (key, requestId) => {
                const current = get().routeStates[key];

                if (
                    current === undefined ||
                    current.status !== "loading" ||
                    current.requestId !== requestId
                ) {
                    return;
                }

                const next = { ...get().routeStates };

                delete next[key];

                set({ routeStates: next });
            },
            retryRoute: () => set({ routeRetry: get().routeRetry + 1 }),
            createTrip: (input) => {
                const status = ready();

                if (!status.ok) {
                    return status;
                }

                const validatedData = createTripSchema.safeParse(input);

                if (!validatedData.success) {
                    return {
                        ok: false,
                        error: validatedData.error.issues[0].message,
                    };
                }

                let id: string;

                try {
                    id = globalThis.crypto.randomUUID();
                } catch {
                    return {
                        ok: false,
                        error: "A unique trip ID could not be generated",
                    };
                }

                if (get().trips.some((trip) => trip.id === id)) {
                    return {
                        ok: false,
                        error: "Trip ID already exists; retry creation",
                    };
                }

                const trip: Trip = {
                    id,
                    ...validatedData.data,
                    days: calendarDates(
                        validatedData.data.startDate,
                        validatedData.data.endDate,
                    ).map((date) => ({
                        date,
                        placeIds: [],
                        travelMode: "driving",
                    })),
                };

                commit([...get().trips, trip], {
                    selectedTripId: id,
                    selectedDay: trip.startDate,
                });

                return { ok: true, tripId: id };
            },
            renameTrip: (tripId, name) => {
                const status = ready();

                if (!status.ok) {
                    return status;
                }

                const validatedData = tripNameSchema.safeParse(name);

                if (!validatedData.success) {
                    return {
                        ok: false,
                        error: validatedData.error.issues[0].message,
                    };
                }

                const trip = get().trips.find((item) => item.id === tripId);

                if (!trip) {
                    return {
                        ok: false,
                        error: "Trip not found",
                    };
                }

                if (trip.name !== validatedData.data) {
                    commit(
                        get().trips.map((item) =>
                            item === trip
                                ? { ...trip, name: validatedData.data }
                                : item,
                        ),
                    );
                }

                return { ok: true };
            },
            deleteTrip: (tripId) => {
                const status = ready();

                if (!status.ok) {
                    return status;
                }

                if (!get().trips.some((trip) => trip.id === tripId)) {
                    return {
                        ok: false,
                        error: "Trip not found",
                    };
                }

                commit(
                    get().trips.filter((trip) => trip.id !== tripId),
                    get().selectedTripId === tripId
                        ? { selectedTripId: null, selectedDay: null }
                        : undefined,
                );

                return { ok: true };
            },
            selectTrip: (tripId) => {
                const trip = get().trips.find((item) => item.id === tripId);

                if (tripId !== null && !trip) {
                    return {
                        ok: false,
                        error: "Trip not found",
                    };
                }

                set({
                    selectedTripId: tripId,
                    selectedDay: trip?.startDate ?? null,
                });

                return { ok: true };
            },
            selectDay: (date) => {
                const trip = get().trips.find(
                    (item) => item.id === get().selectedTripId,
                );

                if (
                    date !== null &&
                    !trip?.days.some((day) => day.date === date)
                ) {
                    return {
                        ok: false,
                        error: "Trip day not found",
                    };
                }

                set({ selectedDay: date });

                return { ok: true };
            },
            addPlaceToDay: (tripId, date, placeId) => {
                if (!idSchema.safeParse(placeId).success) {
                    return {
                        ok: false,
                        error: "Invalid place ID",
                    };
                }

                return updateDay(tripId, date, (day) =>
                    day.placeIds.includes(placeId)
                        ? day
                        : { ...day, placeIds: [...day.placeIds, placeId] },
                );
            },
            removePlaceFromDay: (tripId, date, placeId) => {
                if (!idSchema.safeParse(placeId).success) {
                    return {
                        ok: false,
                        error: "Invalid place ID",
                    };
                }

                return updateDay(tripId, date, (day) =>
                    day.placeIds.includes(placeId)
                        ? {
                              ...day,
                              placeIds: day.placeIds.filter(
                                  (id) => id !== placeId,
                              ),
                          }
                        : day,
                );
            },
            reorderPlaces: (tripId, date, placeIds) => {
                const status = ready();

                if (!status.ok) {
                    return status;
                }

                const day = get()
                    .trips.find((trip) => trip.id === tripId)
                    ?.days.find((day) => day.date === date);

                if (!day) {
                    return {
                        ok: false,
                        error: "Trip day not found",
                    };
                }

                if (
                    !Array.isArray(placeIds) ||
                    placeIds.length !== day.placeIds.length ||
                    new Set(placeIds).size !== placeIds.length ||
                    !placeIds.every(
                        (id) =>
                            idSchema.safeParse(id).success &&
                            day.placeIds.includes(id),
                    )
                ) {
                    return {
                        ok: false,
                        error: "Reordering must preserve the day's existing place IDs",
                    };
                }

                return updateDay(tripId, date, (day) =>
                    day.placeIds.every((id, index) => id === placeIds[index])
                        ? day
                        : { ...day, placeIds: [...placeIds] },
                );
            },
            setDayTravelMode: (tripId, date, mode) => {
                if (!travelModeSchema.safeParse(mode).success) {
                    return {
                        ok: false,
                        error: "Invalid travel mode",
                    };
                }

                return updateDay(tripId, date, (day) =>
                    day.travelMode === mode
                        ? day
                        : { ...day, travelMode: mode },
                );
            },
            resetTrips: () => {
                const status = ready();

                if (!status.ok) {
                    return status;
                }

                try {
                    storage = getStorage();

                    if (storage === null) {
                        throw new Error("Storage unavailable");
                    }

                    writable = true;
                } catch {
                    writable = false;

                    set({
                        storageError:
                            "Trips could not be saved. Changes remain in memory.",
                    });
                }

                set({ routeStates: {}, routeRetry: 0 });
                commit([], { selectedTripId: null, selectedDay: null });

                return { ok: true };
            },
            hydrate: () => {
                if (key === null || connected) {
                    return;
                }

                connected = true;

                try {
                    storage = getStorage();

                    if (storage === null) {
                        throw new Error("Storage unavailable");
                    }

                    const raw = storage.getItem(key);

                    let trips: Trip[] = [];

                    if (raw !== null) {
                        const data: unknown = JSON.parse(raw);
                        const validatedData = storedTripsSchema.safeParse(data);

                        if (
                            !validatedData.success ||
                            validatedData.data.userId !== userId
                        ) {
                            throw new Error("Invalid saved trips");
                        }

                        trips = validatedData.data.trips.map((trip) => ({
                            ...trip,
                            id: String(trip.id),
                        }));
                    }

                    writable = true;

                    set({
                        trips,
                        selectedTripId: null,
                        selectedDay: null,
                        hydrationStatus: "ready",
                        storageError: null,
                    });
                } catch {
                    writable = false;

                    set({
                        hydrationStatus: "error",
                        storageError:
                            "Saved trips could not be restored. Stored data was left unchanged.",
                    });
                }
            },
            disconnect: () => {
                connected = false;
                writable = false;
                storage = null;

                set({
                    trips: [],
                    selectedTripId: null,
                    selectedDay: null,
                    storageError: null,
                    routeStates: {},
                    routeRetry: 0,
                    hydrationStatus:
                        key === null ? "unauthenticated" : "pending",
                });
            },
        };
    });
}
