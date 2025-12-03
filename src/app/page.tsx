"use client";

import { Suspense, useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import "@/style/leaflet-routing-machine.scss";
import MapPage from "./map/page";
import LoadingMapPage from "@/components/loadings/loadingMapPage/LoadingMapPage";

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                signInAnonymously(auth)
                    .then(() => {
                        setIsAuthenticated(true);
                    })
                    .catch((error) => {
                        console.error(error.message);
                    });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col justify-center items-center w-screen h-screen">
                <div className="grid justify-items-center gap-5">
                    <h3 className="text-4xl">Loading...</h3>
                    <h3 className="text-2xl">You are signing in as a Guest</h3>
                </div>
            </div>
        );
    }

    return (
        <>
            <Suspense fallback={<LoadingMapPage />}>
                <MapPage />
            </Suspense>
        </>
    );
}
