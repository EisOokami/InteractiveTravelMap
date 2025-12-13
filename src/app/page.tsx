"use client";

import MapPage from "@/components/layout/mapPage/MapPage";
import { IPositions } from "@/interfaces/interfaces";
import { auth } from "@/services/firebaseConfig";
import { fetchPositions } from "@/services/firebaseDatabase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [positionsData, setPositionsData] = useState<IPositions[]>([]);
    const [isPositionLoading, setIsPositionLoading] = useState<boolean>(true);

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

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        fetchPositions(setPositionsData, setIsPositionLoading);
    }, [isAuthenticated]);

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

    if (isPositionLoading) {
        return (
            <div className="flex flex-col justify-center items-center w-screen h-screen p-5 md:p-0">
                <div className="grid justify-items-center gap-5">
                    <h3 className="text-4xl">Loading...</h3>
                    <h3 className="text-2xl text-center">
                        Fetching positions from the database
                    </h3>
                </div>
            </div>
        );
    }

    return <MapPage positionsData={positionsData} />;
}
