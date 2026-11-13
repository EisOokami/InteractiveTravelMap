"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useStore } from "zustand";
import { toast } from "sonner";
import {
    addItemToFavoriteAction,
    removeItemFromFavoriteAction,
} from "@/data/actions";
import type { IPlace } from "@/interfaces/interfaces";
import { createMapStore } from "./mapStore";
import { FavoriteServices, MapActions, MapState } from "@/interfaces/store";

const favoriteServices: FavoriteServices = {
    add: addItemToFavoriteAction,
    remove: removeItemFromFavoriteAction,
    notify: (kind, title, description) => {
        toast[kind](title, { description });
    },
};

const MapStoreContext = createContext<ReturnType<typeof createMapStore> | null>(
    null,
);

export function MapStoreProvider({
    children,
    initialFavorites,
}: Readonly<{ children: ReactNode; initialFavorites: IPlace[] }>) {
    const [store] = useState(() =>
        createMapStore(favoriteServices, initialFavorites),
    );

    useEffect(() => () => store.getState().cancelPendingFavorites(), [store]);

    return (
        <MapStoreContext.Provider value={store}>
            {children}
        </MapStoreContext.Provider>
    );
}

export function useMapStore<T>(
    selector: (state: MapState & MapActions) => T,
): T {
    const store = useContext(MapStoreContext);

    if (!store) {
        throw new Error("useMapStore must be used within MapStoreProvider");
    }

    return useStore(store, selector);
}
