"use client";

import { Provider } from "react-redux";
import { AppStore, store } from "@/libs/redux/store";
import { useRef } from "react";

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
