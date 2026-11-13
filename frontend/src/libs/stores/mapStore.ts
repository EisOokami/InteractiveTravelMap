import { createStore } from "zustand/vanilla";
import type { IDate, IDateStorage, IPlace } from "@/interfaces/interfaces";
import type {
    FavoriteServices,
    MapActions,
    MapState,
} from "@/interfaces/store";

const emptyDates: readonly IDate[] = Object.freeze([]);

export function getLegacyDates(
    datesStorage: IDateStorage,
    placeId: number,
): readonly IDate[] {
    const dates = datesStorage[placeId];

    return dates === undefined ? emptyDates : dates;
}

function initialState(favorites: IPlace[] = []): MapState {
    return {
        map: { zoomLocationX: 52.083, zoomLocationY: 19.375 },
        ui: {
            openSearch: false,
            openTrip: false,
            openFavorite: false,
            openPlaceDetails: false,
            isPlaceDetailsLoading: true,
        },
        dates: { datesStorage: {} },
        favorites: { favorites: [...favorites], loading: false, error: null },
    };
}

export function createMapStore(
    services: FavoriteServices,
    favorites: IPlace[] = [],
) {
    let generation = 0;

    return createStore<MapState & MapActions>()((set, get) => ({
        ...initialState(favorites),
        setZoomLocationX: (zoomLocationX) =>
            set((state) => ({ map: { ...state.map, zoomLocationX } })),
        setZoomLocationY: (zoomLocationY) =>
            set((state) => ({ map: { ...state.map, zoomLocationY } })),
        setOpenSearch: (openSearch) =>
            set((state) => ({ ui: { ...state.ui, openSearch } })),
        setOpenTrip: (openTrip) =>
            set((state) => ({ ui: { ...state.ui, openTrip } })),
        setOpenFavorite: (openFavorite) =>
            set((state) => ({ ui: { ...state.ui, openFavorite } })),
        setOpenPlaceDetails: (openPlaceDetails) =>
            set((state) => ({ ui: { ...state.ui, openPlaceDetails } })),
        setIsPlaceDetailsLoading: (isPlaceDetailsLoading) =>
            set((state) => ({ ui: { ...state.ui, isPlaceDetailsLoading } })),
        setDatesStorage: (datesStorage) =>
            set((state) => ({ dates: { ...state.dates, datesStorage } })),
        setFavorites: (favorites) =>
            set((state) => ({ favorites: { ...state.favorites, favorites } })),
        toggleFavoriteAsync: async (place) => {
            if (get().favorites.loading) {
                return;
            }

            const requestGeneration = generation;
            const isFavorite = get().favorites.favorites.some(
                (item) => item.id === place.id,
            );

            set((state) => ({
                favorites: { ...state.favorites, loading: true, error: null },
            }));

            let result: { ok: boolean; message: string } | undefined;

            try {
                result = await (isFavorite
                    ? services.remove(place.id)
                    : services.add(place.id));
            } catch {
                if (requestGeneration !== generation) {
                    return;
                }

                set((state) => ({
                    favorites: {
                        ...state.favorites,
                        loading: false,
                        error: "Failed to add to favorites",
                    },
                }));

                services.notify("error", "Error", "Failed to update favorites");

                return;
            }

            if (requestGeneration !== generation) {
                return;
            }

            if (!result || !result.ok) {
                const error = result?.message || "Something went wrong";

                set((state) => ({
                    favorites: { ...state.favorites, loading: false, error },
                }));

                services.notify("error", "Error", error);

                return;
            }

            const currentFavorites = get().favorites.favorites;
            const removing = currentFavorites.some(
                (item) => item.id === place.id,
            );

            set({
                favorites: {
                    favorites: removing
                        ? currentFavorites.filter(
                              (item) => item.id !== place.id,
                          )
                        : [...currentFavorites, place],
                    loading: false,
                    error: null,
                },
            });

            services.notify(
                "success",
                removing ? "Removed from favorites" : "Added to favorites",
                `${place.name || "Place"} has been ${removing ? "removed from" : "added to"} your favorites`,
            );
        },
        cancelPendingFavorites: () => {
            generation += 1;

            if (get().favorites.loading) {
                set((state) => ({
                    favorites: { ...state.favorites, loading: false },
                }));
            }
        },
        reset: () => {
            generation += 1;

            set(initialState());
        },
    }));
}
