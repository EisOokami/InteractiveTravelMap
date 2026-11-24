"use client";

import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { Button } from "../shadcn/button";
import { formatTripDate } from "@/libs/utils";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";

interface AddPlaceToTripProps {
    placeId: number;
}

export default function AddPlaceToTrip({
    placeId,
}: Readonly<AddPlaceToTripProps>) {
    const trip = useTripsStore((state) =>
        state.trips.find((item) => item.id === state.selectedTripId),
    );
    const selectedDay = useTripsStore((state) => state.selectedDay);
    const hydrationStatus = useTripsStore((state) => state.hydrationStatus);
    const storageError = useTripsStore((state) => state.storageError);
    const addPlaceToDay = useTripsStore((state) => state.addPlaceToDay);
    const setOpenTrip = useMapStore((state) => state.setOpenTrip);
    const setOpenSearch = useMapStore((state) => state.setOpenSearch);
    const setOpenFavorite = useMapStore((state) => state.setOpenFavorite);
    const setOpenPlaceDetails = useMapStore(
        (state) => state.setOpenPlaceDetails,
    );

    const day = trip?.days.find((item) => item.date === selectedDay);
    const added = day?.placeIds.includes(placeId) ?? false;

    return (
        <section className="grid gap-3 mb-6">
            <h2 className="text-lg font-bold text-black dark:text-white">
                Add to trip
            </h2>
            {storageError && (
                <p className="text-sm text-amber-700 dark:text-amber-400">
                    {storageError}
                </p>
            )}
            {hydrationStatus === "pending" ? (
                <p>Loading saved trips...</p>
            ) : trip && day ? (
                <>
                    <p className="text-sm text-muted-foreground break-words">
                        {trip.name} · {formatTripDate(day.date)}
                    </p>
                    <Button
                        disabled={added}
                        className="w-fit bg-bright-blue text-white hover:bg-blue-600"
                        onClick={() => {
                            const result = addPlaceToDay(
                                trip.id,
                                day.date,
                                placeId,
                            );

                            if (!result.ok) {
                                toast.error(result.error);
                            }

                            if (result.ok) {
                                toast.success("Added to itinerary");
                            }
                        }}
                    >
                        {added ? <Check /> : <Plus />}
                        {added
                            ? "Already added to this day"
                            : "Add to selected day"}
                    </Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Choose a trip and day in Trip Planner to add this place.
                    </p>
                    <Button
                        variant="outline"
                        className="w-fit"
                        onClick={() => {
                            setOpenSearch(false);
                            setOpenFavorite(false);
                            setOpenPlaceDetails(false);
                            setOpenTrip(true);
                        }}
                    >
                        Open Trip Planner
                    </Button>
                </>
            )}
        </section>
    );
}
