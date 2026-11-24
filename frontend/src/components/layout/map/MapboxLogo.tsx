"use client";

import { useState } from "react";
import Image from "next/image";
import { useMapEvents } from "react-leaflet";

export default function MapboxLogo({
    layerName,
    initiallyActive = false,
}: Readonly<{ layerName: string; initiallyActive?: boolean }>) {
    const [active, setActive] = useState<boolean>(initiallyActive);

    useMapEvents({
        baselayerchange(event) {
            setActive(event.name === layerName);
        },
    });

    if (!active) {
        return null;
    }

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className="leaflet-control">
                <a
                    href="https://www.mapbox.com/about/maps/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        src="/mapbox-logo.svg"
                        alt="Mapbox"
                        width={88}
                        height={23}
                        unoptimized
                    />
                </a>
            </div>
        </div>
    );
}
