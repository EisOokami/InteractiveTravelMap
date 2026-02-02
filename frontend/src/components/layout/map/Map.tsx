"use client";

import { RefObject, useEffect } from "react";
import { renderToString } from "react-dom/server";
import {
    LayersControl,
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    LayerGroup,
    Popup,
} from "react-leaflet";
import { IPosition } from "@/interfaces/interfaces";
import "leaflet/dist/leaflet.css";
import "./Map.scss";
import Image from "next/image";
import L, { divIcon } from "leaflet";
import { Button } from "@/components/ui/shadcn/button";
import { MapPin, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    setOpenPlaceDetails,
    setOpenSearch,
    setOpenTrip,
} from "@/libs/redux/features/ui/uiSlice";
import { RootState } from "@/libs/redux/store";
import {
    setSelectedPosition,
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";

interface MapProps {
    positions: IPosition[];
    mapRef: RefObject<L.Map | null>;
}

function ChangeView({ center }: Readonly<{ center: [number, number] }>) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}

export default function Map({ positions, mapRef }: Readonly<MapProps>) {
    const openPlaceDetails = useSelector(
        (state: RootState) => state.ui.openPlaceDetails,
    );
    const zoomLocationX = useSelector(
        (state: RootState) => state.map.zoomLocationX,
    );
    const zoomLocationY = useSelector(
        (state: RootState) => state.map.zoomLocationY,
    );
    const dispatch = useDispatch();

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
        dispatch(setZoomLocationX(x));
        dispatch(setZoomLocationY(y));
    };

    const handleButtonClick = (id: number) => {
        dispatch(setSelectedPosition(id));
        dispatch(setOpenSearch(true));
        dispatch(setOpenPlaceDetails(true));
        dispatch(setOpenTrip(false));
    };

    return (
        <MapContainer
            ref={mapRef}
            center={[zoomLocationX, zoomLocationY]}
            zoom={7}
            scrollWheelZoom={true}
        >
            <ChangeView center={[zoomLocationX, zoomLocationY]} />
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
                            attribution="&copy; <a href='https://www.google.com/maps'>Google Maps Satellite</a>"
                            url="https://www.google.com/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                        />
                    </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Circle">
                    <TileLayer
                        className="dark-leaflet-layer"
                        attribution="&copy; <a href='https://www.thunderforest.com/'>Thunderforest</a>"
                        url={`https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`}
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            {positions.map((position) => (
                <Marker
                    key={position.id}
                    position={[position.x, position.y]}
                    icon={divIcon({
                        html: renderToString(
                            <div
                                className={`relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg hover:ring-4 hover:ring-blue-300 hover:ring-opacity-50 hover:scale-110 transition-all duration-400 cursor-pointer select-none ${
                                    position.x === zoomLocationX &&
                                    position.y === zoomLocationY &&
                                    openPlaceDetails
                                        ? "ring-4 ring-blue-300 ring-opacity-70 scale-110 animate-bounce"
                                        : ""
                                }`}
                            >
                                <div className="flex justify-center items-center w-9 h-9 overflow-hidden rounded-full">
                                    <Image
                                        src={position.img}
                                        alt={position.name}
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
                        click: () => handleZoomLocation(position.x, position.y),
                    }}
                >
                    <Popup className="custom-popup" closeButton={true}>
                        <div className="w-full bg-white dark:bg-dark-mode-black overflow-hidden transition-colors">
                            <div className="relative w-full h-36 md:h-52">
                                <Image
                                    src={position.img}
                                    alt={position.name}
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
                                            {position.rating}
                                        </div>
                                        <span className="px-3 py-1 text-xs md:text-sm text-white font-semibold bg-bright-blue rounded-full">
                                            {position.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 md:px-6 py-4 md:py-5">
                                <h3 className="mb-2 text-xl md:text-2xl font-bold text-black dark:text-white transition-colors line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                    {position.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2 md:mb-4 text-gray-600 dark:text-gray-300">
                                    <MapPin className="min-w-4 md:min-w-5 min-h-4 md:min-h-5 text-bright-blue" />
                                    <span className="text-sm line-clamp-1 sm:line-clamp-2 md:line-clamp-none">
                                        {position.address}
                                    </span>
                                </div>
                                <p className="mb-3 md:mb-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                                    {position.description_short}
                                </p>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleButtonClick(position.id);
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
