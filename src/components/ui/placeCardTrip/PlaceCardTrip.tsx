import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IPositions } from "@/interfaces/interfaces";
import Image from "next/image";
import styles from "../../layout/trip/Trip.module.scss";

interface PlaceCardTripProps {
    place: IPositions;
    convertTime: (totalSeconds: number) => string;
}

export default function PlaceCardTrip({
    place,
    convertTime,
}: PlaceCardTripProps) {
    const id = place.id;
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({
            id,
        });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        position: isDragging ? "relative" : "inherit",
        zIndex: isDragging ? 1000 : 0,
        cursor: isDragging ? "grabbing" : "grab",
    };

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
            <div className="grid w-80 mr-4 mb-3 bg-white dark:bg-dark-mode-black hover:bg-gray-100 dark:hover:bg-dark-mode-gray-2 border border-gray-200 dark:border-gray-800 rounded-lg shadow transition">
                <div className="relative w-full h-36">
                    <Image
                        src={place.img}
                        alt={place.name}
                        className="object-cover w-full h-36 rounded-t-lg"
                        fill
                    />
                </div>
                <div className="flex flex-col justify-between p-4 leading-normal">
                    <h3 className={styles["trip__place-card--paragraph"]}>
                        {place.name}
                    </h3>
                    <p
                        className={`${styles["trip__place-card--paragraph"]} italic`}
                    >
                        {place.location}
                    </p>
                    <p className={styles["trip__place-card--paragraph"]}>
                        Category: {place.category}
                    </p>
                    <p className={styles["trip__place-card--paragraph"]}>
                        Time spent: ≈{convertTime(place.time)} hours
                    </p>
                </div>
            </div>
        </div>
    );
}
