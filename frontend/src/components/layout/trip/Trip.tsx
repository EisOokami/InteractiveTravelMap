"use client";

import { useMemo } from "react";
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Bike, Car, Footprints, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { IPlace, IUser } from "@/interfaces/interfaces";
import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { getLegacyDates } from "@/libs/stores/mapStore";
import PlaceCardTrip from "@/components/ui/placeCardTrip/PlaceCardTrip";
import TransportButton from "@/components/ui/transportButton/TransportButton";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import FavoritePlacePicker from "./FavoritePlacePicker";
import RouteSummary from "./RouteSummary";
import TripAssistant from "./TripAssistant";
import { formatTripDate } from "@/libs/utils";
import TripFormDialog from "./TripFormDialog";
import DeleteTripDialog from "./DeleteTripDialog";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";

const travelModes = [
    { id: "driving", icon: Car, label: "Car" },
    { id: "cycling", icon: Bike, label: "Bike" },
    { id: "walking", icon: Footprints, label: "Walk" },
] as const;

interface TripProps {
    places: IPlace[];
    userData: IUser;
}

export default function Trip({ places, userData }: Readonly<TripProps>) {
    const trips = useTripsStore((state) => state.trips);
    const trip = useTripsStore((state) =>
        state.trips.find((item) => item.id === state.selectedTripId),
    );
    const selectedDay = useTripsStore((state) => state.selectedDay);
    const hydrationStatus = useTripsStore((state) => state.hydrationStatus);
    const storageError = useTripsStore((state) => state.storageError);
    const selectTrip = useTripsStore((state) => state.selectTrip);
    const selectDay = useTripsStore((state) => state.selectDay);
    const removePlaceFromDay = useTripsStore(
        (state) => state.removePlaceFromDay,
    );
    const reorderPlaces = useTripsStore((state) => state.reorderPlaces);
    const setDayTravelMode = useTripsStore((state) => state.setDayTravelMode);
    const legacyDates = useMapStore((state) => state.dates.datesStorage);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const placesById = useMemo(
        () => new Map(places.map((place) => [place.id, place])),
        [places],
    );

    const day = trip?.days.find((item) => item.date === selectedDay);
    const loading = hydrationStatus === "pending";
    const legacyAssignments = Object.keys(legacyDates).flatMap((placeId) =>
        getLegacyDates(legacyDates, Number(placeId))
            .filter((date) => date.active)
            .map((date) => ({ placeId: Number(placeId), ...date })),
    );

    function handleDragEnd({ active, over }: DragEndEvent) {
        if (
            !trip ||
            !day ||
            !over ||
            active.id === over.id ||
            typeof active.id !== "number" ||
            typeof over.id !== "number"
        ) {
            return;
        }

        const from = day.placeIds.indexOf(active.id);
        const to = day.placeIds.indexOf(over.id);

        if (from < 0 || to < 0) {
            return;
        }

        const result = reorderPlaces(
            trip.id,
            day.date,
            arrayMove(day.placeIds, from, to),
        );

        if (!result.ok) {
            toast.error(result.error);
        }
    }

    return (
        <aside className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1999] transition-colors">
            <div className="shrink-0 p-4 md:p-6 border-b dark:border-gray-800 grid gap-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                        Trip Planner
                    </h1>
                    <TripFormDialog disabled={loading} />
                </div>
                {trips.length > 0 && (
                    <div className="grid gap-2">
                        <Label htmlFor="trip-selector">Your trips</Label>
                        <Select
                            value={trip?.id ?? ""}
                            onValueChange={(id) => {
                                const result = selectTrip(id);

                                if (!result.ok) {
                                    toast.error(result.error);
                                }
                            }}
                        >
                            <SelectTrigger id="trip-selector">
                                <SelectValue placeholder="Choose a trip" />
                            </SelectTrigger>
                            <SelectContent className="z-[2202] max-w-[90vw]">
                                {trips.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {trip && (
                    <div className="flex flex-wrap items-center gap-2">
                        <TripFormDialog trip={trip} />
                        <DeleteTripDialog trip={trip} />
                        <span className="text-xs text-muted-foreground">
                            {trip.days.length}{" "}
                            {trip.days.length === 1 ? "day" : "days"}
                        </span>
                    </div>
                )}
            </div>
            <div className="custom-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 grid content-start gap-5">
                {storageError && (
                    <div
                        role="alert"
                        className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300"
                    >
                        {storageError}{" "}
                        {hydrationStatus === "error" &&
                            "Changes will be temporary until saved trips can be recovered."}
                    </div>
                )}
                {loading ? (
                    <p role="status" className="text-sm text-muted-foreground">
                        Loading saved trips...
                    </p>
                ) : !trip ? (
                    <div className="grid justify-items-center gap-3 py-10 text-center">
                        <MapPin className="w-10 h-10 text-bright-blue" />
                        <h2 className="text-lg font-semibold">
                            {trips.length
                                ? "Choose a trip to plan your days"
                                : "Your next trip starts here"}
                        </h2>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            {trips.length
                                ? "Select one of your trips above, or create a new one."
                                : "Create a trip with a name and dates, then add your saved places to each day."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-2">
                            <h2 className="font-semibold">Trip days</h2>
                            <div className="custom-scroll grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto p-1">
                                {trip.days.map((item) => (
                                    <Button
                                        key={item.date}
                                        variant="outline"
                                        className={`h-auto min-h-14 items-start flex-col gap-1 whitespace-normal text-left ${item.date === selectedDay ? "border-bright-blue bg-bright-blue text-white hover:bg-blue-600 hover:text-white" : ""}`}
                                        onClick={() => {
                                            const result = selectDay(item.date);

                                            if (!result.ok) {
                                                toast.error(result.error);
                                            }
                                        }}
                                    >
                                        <span>{formatTripDate(item.date)}</span>
                                        <span className="text-xs opacity-80">
                                            {item.placeIds.length}{" "}
                                            {item.placeIds.length === 1
                                                ? "place"
                                                : "places"}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {day ? (
                            <section className="grid gap-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="font-semibold">
                                        {formatTripDate(day.date)}
                                    </h2>
                                    <FavoritePlacePicker
                                        tripId={trip.id}
                                        day={day}
                                        userData={userData}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {travelModes.map((mode) => (
                                        <TransportButton
                                            key={mode.id}
                                            id={mode.id}
                                            icon={mode.icon}
                                            label={mode.label}
                                            transportMode={day.travelMode}
                                            setTransportMode={() => {
                                                const result = setDayTravelMode(
                                                    trip.id,
                                                    day.date,
                                                    mode.id,
                                                );

                                                if (!result.ok) {
                                                    toast.error(result.error);
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <RouteSummary
                                    trip={trip}
                                    day={day}
                                    placesById={placesById}
                                />
                                <TripAssistant
                                    key={JSON.stringify([trip.id, day, day.placeIds.map((id) => {
                                        const place = placesById.get(id);
                                        return [place?.name, place?.x, place?.y];
                                    })])}
                                    tripId={trip.id}
                                    day={day}
                                    placesById={placesById}
                                />
                                {day.placeIds.length ? (
                                    <DndContext
                                        key={`${trip.id}:${day.date}`}
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={day.placeIds}
                                            strategy={rectSortingStrategy}
                                        >
                                            <ol className="grid gap-3 md:grid-cols-2">
                                                {day.placeIds.map((placeId) => (
                                                    <PlaceCardTrip
                                                        key={placeId}
                                                        placeId={placeId}
                                                        place={placesById.get(
                                                            placeId,
                                                        )}
                                                        onRemove={() => {
                                                            const result =
                                                                removePlaceFromDay(
                                                                    trip.id,
                                                                    day.date,
                                                                    placeId,
                                                                );

                                                            if (!result.ok) {
                                                                toast.error(
                                                                    result.error,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </ol>
                                        </SortableContext>
                                    </DndContext>
                                ) : (
                                    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        No stops yet. Add saved places, or open
                                        a place on the map and add it to this
                                        day.
                                    </p>
                                )}
                            </section>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose a day above to manage its stops.
                            </p>
                        )}
                    </>
                )}
                {legacyAssignments.length > 0 && (
                    <details className="rounded-lg border p-3 text-sm">
                        <summary className="cursor-pointer font-medium">
                            Previous date assignments (
                            {legacyAssignments.length})
                        </summary>
                        <p className="my-2 text-muted-foreground">
                            These assignments are kept separately from your
                            trips.
                        </p>
                        <ul className="grid gap-2">
                            {legacyAssignments.map((item) => (
                                <li key={`${item.placeId}:${item.id}`}>
                                    {item.date} ·{" "}
                                    {placesById.get(item.placeId)?.name ??
                                        `Place #${item.placeId}`}
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
        </aside>
    );
}
