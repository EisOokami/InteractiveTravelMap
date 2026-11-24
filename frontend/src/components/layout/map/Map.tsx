"use client";

import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { RefObject, useEffect, useMemo } from "react";
import { renderToString } from "react-dom/server";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import L, { divIcon } from "leaflet";
import {
    LayersControl,
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    LayerGroup,
    Popup,
} from "react-leaflet";
import { MapPin, Star } from "lucide-react";
import { IPlace } from "@/interfaces/interfaces";
import "leaflet/dist/leaflet.css";
import "./Map.scss";
import TripDayRoute from "./TripDayRoute";
import MapboxLogo from "./MapboxLogo";

import { Button } from "@/components/ui/shadcn/button";
import { normalizeCoordinates } from "@/libs/utils";

interface MapProps {
    places: IPlace[];
    mapRef: RefObject<L.Map | null>;
}

function ChangeView({ center }: Readonly<{ center: [number, number] }>) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}

function ResizeMapObserver() {
    const map = useMap();

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });

        const mapContainer = map.getContainer();

        observer.observe(mapContainer);

        return () => observer.disconnect();
    }, [map]);

    return null;
}

export default function Map({ places, mapRef }: Readonly<MapProps>) {
    const setIsPlaceDetailsLoading = useMapStore(
        (state) => state.setIsPlaceDetailsLoading,
    );
    const setOpenPlaceDetails = useMapStore(
        (state) => state.setOpenPlaceDetails,
    );
    const setOpenSearch = useMapStore((state) => state.setOpenSearch);
    const setOpenTrip = useMapStore((state) => state.setOpenTrip);
    const setZoomLocationX = useMapStore((state) => state.setZoomLocationX);
    const setZoomLocationY = useMapStore((state) => state.setZoomLocationY);
    const openPlaceDetails = useMapStore((state) => state.ui.openPlaceDetails);
    const zoomLocationX = useMapStore((state) => state.map.zoomLocationX);
    const zoomLocationY = useMapStore((state) => state.map.zoomLocationY);
    const pathname = usePathname();
    const router = useRouter();

    const markerPlaces = useMemo(
        () =>
            places.flatMap((place) => {
                const coordinates = normalizeCoordinates(place);

                return coordinates === null ? [] : [{ place, coordinates }];
            }),
        [places],
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const mapContainer = document.querySelector(".leaflet-container");

            if (
                mapRef?.current &&
                mapContainer &&
                !mapContainer.contains(e.target as Node)
            ) {
                mapRef?.current.closePopup();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mapRef]);

    const handleZoomLocation = (x: number, y: number) => {
        setZoomLocationX(x);
        setZoomLocationY(y);
    };

    const handleButtonClick = (placeId: number) => {
        router.push(`${pathname}?placeId=${placeId}`);

        setIsPlaceDetailsLoading(true);
        setOpenSearch(true);
        setOpenPlaceDetails(true);
        setOpenTrip(false);
    };

    return (
        <MapContainer
            ref={mapRef}
            center={[zoomLocationX, zoomLocationY]}
            zoom={7}
            scrollWheelZoom={true}
        >
            <ChangeView center={[zoomLocationX, zoomLocationY]} />
            <ResizeMapObserver />
            <TripDayRoute places={places} />
            <LayersControl>
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        className="dark-leaflet-layer"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                    <LayerGroup>
                        <TileLayer
                            attribution="&copy; <a href='https://www.mapbox.com/about/maps/' target='_blank' rel='noopener noreferrer'>Mapbox</a> &copy; <a href='https://www.openstreetmap.org/copyright' target='_blank' rel='noopener noreferrer'>OpenStreetMap</a> &copy; <a href='https://www.maxar.com/' target='_blank' rel='noopener noreferrer'>Maxar</a> <strong><a href='https://apps.mapbox.com/feedback/' target='_blank' rel='noopener noreferrer'>Improve this map</a></strong>"
                            url={`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}{r}.jpg90?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
                        />
                    </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Circle">
                    <TileLayer
                        className="dark-leaflet-layer"
                        attribution="Maps &copy; <a href='https://www.thunderforest.com/'>Thunderforest</a>, Data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
                        url={`https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`}
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            <MapboxLogo layerName="Satellite" />
            {markerPlaces.map(({ place, coordinates }) => (
                <Marker
                    key={place.id}
                    position={coordinates}
                    icon={divIcon({
                        html: renderToString(
                            <div
                                className={`relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg hover:ring-4 hover:ring-blue-300 hover:ring-opacity-50 hover:scale-110 transition-all duration-400 cursor-pointer select-none ${
                                    coordinates[0] === zoomLocationX &&
                                    coordinates[1] === zoomLocationY &&
                                    openPlaceDetails
                                        ? "ring-4 ring-blue-300 ring-opacity-70 scale-110 animate-bounce"
                                        : ""
                                }`}
                            >
                                <div className="flex justify-center items-center w-9 h-9 overflow-hidden rounded-full">
                                    <Image
                                        src={place.img}
                                        alt={place.name}
                                        className="w-10 h-10 object-contain"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                            </div>,
                        ),
                        className: "custom-marker-icon",
                        iconSize: [48, 48],
                        iconAnchor: [24, 48],
                        popupAnchor: [0, -48],
                    })}
                    eventHandlers={{
                        click: () =>
                            handleZoomLocation(coordinates[0], coordinates[1]),
                    }}
                >
                    <Popup className="custom-popup" closeButton={true}>
                        <div className="w-full bg-white dark:bg-dark-mode-black overflow-hidden transition-colors">
                            <div className="relative w-full h-36 md:h-52">
                                <Image
                                    src={place.img}
                                    alt={place.name}
                                    className="w-full h-full object-cover"
                                    width={200}
                                    height={200}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm font-semibold text-white bg-yellow-500 rounded-full">
                                            <Star
                                                className="w-3 md:w-4 h-3 md:h-4"
                                                fill="#fff"
                                            />
                                            {place.rating}
                                        </div>
                                        <span className="px-3 py-1 text-xs md:text-sm text-white font-semibold bg-bright-blue rounded-full">
                                            {place.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 md:px-6 py-4 md:py-5">
                                <h3 className="mb-2 text-xl md:text-2xl font-bold text-black dark:text-white transition-colors line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                    {place.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2 md:mb-4 text-gray-600 dark:text-gray-300">
                                    <MapPin className="min-w-4 md:min-w-5 min-h-4 md:min-h-5 text-bright-blue" />
                                    <span className="text-sm line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                        {place.address}
                                    </span>
                                </div>
                                <p className="mb-3 md:mb-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                                    {place.description_short}
                                </p>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        handleButtonClick(place.id);
                                    }}
                                    className="w-full px-4 py-2 md:py-3 text-white font-semibold bg-bright-blue hover:bg-blue-600 rounded-lg transition-colors shadow-lg"
                                >
                                    More Details
                                </Button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
