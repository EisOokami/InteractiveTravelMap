import {
    CreateTripInput,
    RouteResult,
    RouteStates,
    TravelMode,
} from "@/types/store";
import { IDateStorage, IPlace } from "./interfaces";

export interface FavoriteServices {
    add: (
        placeId: number,
    ) => Promise<{ ok: boolean; message: string } | undefined>;
    remove: (
        placeId: number,
    ) => Promise<{ ok: boolean; message: string } | undefined>;
    notify: (
        kind: "success" | "error",
        title: string,
        description: string,
    ) => void;
}

export interface MapState {
    map: { zoomLocationX: number; zoomLocationY: number };
    ui: {
        openSearch: boolean;
        openTrip: boolean;
        openFavorite: boolean;
        openPlaceDetails: boolean;
        isPlaceDetailsLoading: boolean;
    };
    dates: { datesStorage: IDateStorage };
    favorites: { favorites: IPlace[]; loading: boolean; error: string | null };
}

export interface MapActions {
    setZoomLocationX: (value: number) => void;
    setZoomLocationY: (value: number) => void;
    setOpenSearch: (value: boolean) => void;
    setOpenTrip: (value: boolean) => void;
    setOpenFavorite: (value: boolean) => void;
    setOpenPlaceDetails: (value: boolean) => void;
    setIsPlaceDetailsLoading: (value: boolean) => void;
    setDatesStorage: (value: IDateStorage) => void;
    setFavorites: (value: IPlace[]) => void;
    toggleFavoriteAsync: (place: IPlace) => Promise<void>;
    cancelPendingFavorites: () => void;
    reset: () => void;
}

export interface TripDay {
    date: string;
    placeIds: number[];
    travelMode: TravelMode;
}

export interface Trip {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    days: TripDay[];
}

export interface TripsStore {
    trips: Trip[];
    selectedTripId: string | null;
    selectedDay: string | null;
    hydrationStatus: "pending" | "ready" | "error" | "unauthenticated";
    storageError: string | null;
    routeStates: RouteStates;
    routeRetry: number;
    beginRoute: (key: string) => number | null;
    setRouteState: (key: string, requestId: number, state: RouteResult) => boolean;
    clearPendingRoute: (key: string, requestId: number) => void;
    retryRoute: () => void;
    createTrip: (
        input: CreateTripInput,
    ) => { ok: true; tripId: string } | { ok: false; error: string };
    renameTrip: (
        tripId: string,
        name: string,
    ) => { ok: true } | { ok: false; error: string };
    deleteTrip: (tripId: string) => { ok: true } | { ok: false; error: string };
    selectTrip: (
        tripId: string | null,
    ) => { ok: true } | { ok: false; error: string };
    selectDay: (
        date: string | null,
    ) => { ok: true } | { ok: false; error: string };
    addPlaceToDay: (
        tripId: string,
        date: string,
        placeId: number,
    ) => { ok: true } | { ok: false; error: string };
    removePlaceFromDay: (
        tripId: string,
        date: string,
        placeId: number,
    ) => { ok: true } | { ok: false; error: string };
    reorderPlaces: (
        tripId: string,
        date: string,
        placeIds: number[],
    ) => { ok: true } | { ok: false; error: string };
    setDayTravelMode: (
        tripId: string,
        date: string,
        mode: TravelMode,
    ) => { ok: true } | { ok: false; error: string };
    resetTrips: () => { ok: true } | { ok: false; error: string };
    hydrate: () => void;
    disconnect: () => void;
}
