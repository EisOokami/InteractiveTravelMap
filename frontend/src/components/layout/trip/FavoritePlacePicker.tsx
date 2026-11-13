"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { IUser } from "@/interfaces/interfaces";
import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";
import PlaceCard from "@/components/ui/placeCard/PlaceCard";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/shadcn/dialog";
import { formatTripDate } from "@/libs/utils";
import { TripDay } from "@/interfaces/store";

interface FavoritePlacePickerProps {
    tripId: string;
    day: TripDay;
    userData: IUser;
}

export default function FavoritePlacePicker({
    tripId,
    day,
    userData,
}: Readonly<FavoritePlacePickerProps>) {
    const [query, setQuery] = useState("");
    const favorites = useMapStore((state) => state.favorites.favorites);
    const addPlaceToDay = useTripsStore((state) => state.addPlaceToDay);

    const normalizedQuery = query.trim().toLowerCase();
    const matches = favorites.filter((place) =>
        `${place.name} ${place.location}`
            .toLowerCase()
            .includes(normalizedQuery),
    );

    return (
        <Dialog onOpenChange={() => setQuery("")}>
            <DialogTrigger asChild>
                <Button className="bg-bright-blue text-white hover:bg-blue-600">
                    <Plus /> Add saved places
                </Button>
            </DialogTrigger>
            <DialogContent
                overlayClassName="z-[2200]"
                className="z-[2201] w-[92vw] max-w-3xl max-h-[90svh] overflow-y-auto rounded-lg"
            >
                <DialogHeader>
                    <DialogTitle>Add saved places</DialogTitle>
                    <DialogDescription>
                        Choose favorites for {formatTripDate(day.date)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="favorite-place-search">
                        Search saved places
                    </Label>
                    <Input
                        id="favorite-place-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Name or location"
                    />
                </div>
                <div className="custom-scroll grid gap-3 sm:grid-cols-2 max-h-[50svh] overflow-y-auto p-1">
                    {matches.map((place) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            userData={userData}
                            isInTripDay={day.placeIds.includes(place.id)}
                            onAddToTrip={() => {
                                const result = addPlaceToDay(
                                    tripId,
                                    day.date,
                                    place.id,
                                );

                                if (!result.ok) {
                                    toast.error(result.error);
                                }
                            }}
                        />
                    ))}
                    {!matches.length && (
                        <p
                            role="status"
                            className="py-8 text-sm text-muted-foreground sm:col-span-2"
                        >
                            {favorites.length
                                ? "No saved places match your search."
                                : "Save places using the heart on a place card, then add them here."}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
