"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createTripsStore } from "./tripsStore";
import { TripsStore } from "@/interfaces/store";

const TripsStoreContext = createContext<ReturnType<
    typeof createTripsStore
> | null>(null);

type ProviderProps = Readonly<{ userId: number | null; children: ReactNode }>;

export function TripsStoreProvider({ userId, children }: ProviderProps) {
    return (
        <TripsStoreScope key={userId ?? "guest"} userId={userId}>
            {children}
        </TripsStoreScope>
    );
}

function TripsStoreScope({ userId, children }: ProviderProps) {
    const [store] = useState(() => createTripsStore(userId));

    useEffect(() => {
        store.getState().hydrate();

        return () => store.getState().disconnect();
    }, [store]);

    return (
        <TripsStoreContext.Provider value={store}>
            {children}
        </TripsStoreContext.Provider>
    );
}

export function useTripsStoreApi() {
    const store = useContext(TripsStoreContext);

    if (!store) {
        throw new Error("useTripsStore must be used within TripsStoreProvider");
    }

    return store;
}

export function useTripsStore<T>(selector: (state: TripsStore) => T): T {
    return useStore(useTripsStoreApi(), selector);
}
