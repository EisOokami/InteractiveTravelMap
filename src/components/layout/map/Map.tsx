"use client";

import {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
} from "react";
import { renderToString } from "react-dom/server";
import {
    LayersControl,
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    LayerGroup,
} from "react-leaflet";
import { Icon } from "leaflet";
import { IPositions } from "@/interfaces/interfaces";
import "leaflet/dist/leaflet.css";
import "./Map.scss";

interface MapProps {
    setOpenSearch: Dispatch<SetStateAction<boolean>>;
    positions: IPositions[];
    zoomLocationX: number;
    zoomLocationY: number;
    setZoomLocationX: Dispatch<SetStateAction<number>>;
    setZoomLocationY: Dispatch<SetStateAction<number>>;
    setSelectedPosition: Dispatch<SetStateAction<number | null>>;
    setOpenPlaceCard: Dispatch<SetStateAction<boolean>>;
    setOpenTrip: Dispatch<SetStateAction<boolean>>;
    openPlaceCard: boolean;
    mapRef: RefObject<L.Map | null>;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
        window.map = map;
    }, [center, map]);

    return null;
}

export default function Map({
    setOpenSearch,
    positions,
    zoomLocationX,
    zoomLocationY,
    setZoomLocationX,
    setZoomLocationY,
    setSelectedPosition,
    setOpenPlaceCard,
    setOpenTrip,
    openPlaceCard,
    mapRef,
}: MapProps) {
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

    const handleZoomLocation = useCallback(
        (x: number, y: number, key: number) => {
            setOpenSearch(true);
            setOpenPlaceCard(true);
            setOpenTrip(false);
            setZoomLocationX(x);
            setZoomLocationY(y);
            setSelectedPosition(key);
        },
        [
            setOpenPlaceCard,
            setOpenSearch,
            setOpenTrip,
            setSelectedPosition,
            setZoomLocationX,
            setZoomLocationY,
        ],
    );

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
                            attribution="<a href='https://www.google.com/maps'>Google Maps Satellite</a>"
                            url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                        />
                    </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Circle">
                    <TileLayer
                        className="dark-leaflet-layer"
                        attribution="&copy; <a href='https://www.thunderforest.com/'>Thunderforest</a>"
                        url="https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=fa595c9430dc4c019d1d936817687bb3"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            {positions.map((elem) => (
                <Marker
                    key={elem.id}
                    position={[elem.x, elem.y]}
                    icon={
                        new Icon({
                            iconUrl:
                                "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-Picture.png",
                            shadowUrl: elem.img,
                            iconSize: [50, 50],
                            iconAnchor: [25, 50],
                            shadowSize: [26, 26],
                            shadowAnchor: [13, 44],
                        })
                    }
                    eventHandlers={{
                        click: () =>
                            handleZoomLocation(elem.x, elem.y, elem.id),
                    }}
                />
            ))}
        </MapContainer>
    );
}
