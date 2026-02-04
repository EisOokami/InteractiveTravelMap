"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, store } from "@/libs/redux/store";

export function StoreProvider({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const storeRef = useRef<AppStore | null>(null);

    // eslint-disable-next-line react-hooks/refs
    if (!storeRef.current) {
        storeRef.current = store;
    }

    return <Provider store={store}>{children}</Provider>;
}
