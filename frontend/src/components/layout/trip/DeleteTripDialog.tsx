"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
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
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";
import { Trip } from "@/interfaces/store";

interface DeleteTripDialogProps {
    trip: Trip;
}

export default function DeleteTripDialog({
    trip,
}: Readonly<DeleteTripDialogProps>) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const deleteTrip = useTripsStore((state) => state.deleteTrip);

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);
                setError(null);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Trash2 /> Delete
                </Button>
            </DialogTrigger>
            <DialogContent
                overlayClassName="z-[2200]"
                className="z-[2201] w-[92vw] rounded-lg"
            >
                <DialogHeader>
                    <DialogTitle>Delete trip?</DialogTitle>
                    <DialogDescription className="break-words">
                        Delete “{trip.name}” and all its itinerary stops? This
                        cannot be undone. Your favorite places will be kept.
                    </DialogDescription>
                </DialogHeader>
                {error && (
                    <p
                        role="alert"
                        className="text-sm text-red-600 dark:text-red-400"
                    >
                        {error}
                    </p>
                )}
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline" autoFocus>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            const result = deleteTrip(trip.id);
                            if (!result.ok) setError(result.error);
                            else setOpen(false);
                        }}
                    >
                        Delete trip
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
