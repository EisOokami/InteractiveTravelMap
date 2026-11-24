"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Info, Loader2, Pencil, Plus } from "lucide-react";
import { z } from "zod";
import { formatTripDate } from "@/libs/utils";
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
import { Button } from "@/components/ui/shadcn/button";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";
import type { Trip } from "@/interfaces/store";
import type { IBaseAction } from "@/interfaces/actions";
import { createTripSchema } from "@/libs/validation/store";
import { ZodErrors } from "@/components/ui/zodErrors/ZodErrors";
import { DetailsErrors } from "@/components/ui/detailsErrors/DetailsErrors";

type TripFormActionState = IBaseAction;

const INITIAL_STATE: TripFormActionState = {
    formData: null,
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
};

interface TripFormDialogProps {
    trip?: Trip;
    disabled?: boolean;
}

export default function TripFormDialog({
    trip,
    disabled = false,
}: Readonly<TripFormDialogProps>) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={trip ? "outline" : "default"}
                    disabled={disabled}
                    className={
                        trip
                            ? ""
                            : "bg-bright-blue text-white hover:bg-blue-600"
                    }
                >
                    {trip ? <Pencil /> : <Plus />}{" "}
                    {trip ? "Rename" : "New trip"}
                </Button>
            </DialogTrigger>
            <DialogContent
                overlayClassName="z-[2200]"
                className="z-[2201] w-[92vw] max-h-[90svh] overflow-y-auto rounded-lg"
            >
                <DialogHeader>
                    <DialogTitle>
                        {trip ? "Rename trip" : "Create a trip"}
                    </DialogTitle>
                    <DialogDescription>
                        {trip
                            ? "Update your trip name. The dates stay the same."
                            : "Choose a name and dates. You can add places to each day afterward."}
                    </DialogDescription>
                </DialogHeader>
                {open && (
                    <TripForm
                        key={trip?.id ?? "create"}
                        trip={trip}
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function TripForm({
    trip,
    onSuccess,
}: Readonly<{ trip?: Trip; onSuccess: () => void }>) {
    const createTrip = useTripsStore((state) => state.createTrip);
    const renameTrip = useTripsStore((state) => state.renameTrip);
    const active = useRef(true);
    const succeeded = useRef(false);

    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);

    async function tripFormAction(
        prevState: TripFormActionState,
        formData: FormData,
    ): Promise<TripFormActionState> {
        if (!active.current || succeeded.current) return prevState;

        const validatedFields = createTripSchema.safeParse({
            name: formData.get("name") ?? "",
            startDate: trip?.startDate ?? formData.get("startDate") ?? "",
            endDate: trip?.endDate ?? formData.get("endDate") ?? "",
        });

        if (!validatedFields.success) {
            return {
                ...INITIAL_STATE,
                formData,
                zodErrors: z.flattenError(validatedFields.error).fieldErrors,
            };
        }

        try {
            const result = trip
                ? await renameTrip(trip.id, validatedFields.data.name)
                : await createTrip(validatedFields.data);

            if (!result.ok) {
                return {
                    ...INITIAL_STATE,
                    formData,
                    status: "error",
                    message: result.error,
                };
            }

            succeeded.current = true;
            if (active.current) onSuccess();
            return {
                ...INITIAL_STATE,
                status: "success",
                message: trip ? "Trip renamed." : "Trip created.",
            };
        } catch {
            return {
                ...INITIAL_STATE,
                formData,
                status: "error",
                error: "The trip could not be saved. Please try again.",
            };
        }
    }

    const [formState, formAction, isPending] = useActionState(
        tripFormAction,
        INITIAL_STATE,
    );

    return (
        <form action={formAction} className="grid gap-4" noValidate>
            <div className="grid gap-2">
                <Label htmlFor="trip-name">Trip name</Label>
                <Input
                    id="trip-name"
                    name="name"
                    defaultValue={
                        formState.formData?.get("name")?.toString() ??
                        trip?.name ??
                        ""
                    }
                    className={
                        formState.zodErrors?.name ? "border-red-500" : ""
                    }
                    disabled={isPending}
                    required
                />
                {formState.zodErrors?.name && (
                    <div id="trip-name-errors">
                        <ZodErrors error={formState.zodErrors.name} />
                    </div>
                )}
            </div>
            {trip ? (
                <p className="text-sm text-muted-foreground">
                    {formatTripDate(trip.startDate)} -{" "}
                    {formatTripDate(trip.endDate)}
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid content-start gap-2">
                        <Label htmlFor="trip-start">Start date</Label>
                        <Input
                            id="trip-start"
                            name="startDate"
                            type="date"
                            defaultValue={
                                formState.formData
                                    ?.get("startDate")
                                    ?.toString() ?? ""
                            }
                            className={
                                formState.zodErrors?.startDate
                                    ? "border-red-500"
                                    : ""
                            }
                            disabled={isPending}
                            required
                            min="0001-01-01"
                            max="9999-12-31"
                        />
                        {formState.zodErrors?.startDate && (
                            <div id="trip-start-errors">
                                <ZodErrors
                                    error={formState.zodErrors.startDate}
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid content-start gap-2">
                        <Label htmlFor="trip-end">End date</Label>
                        <Input
                            id="trip-end"
                            name="endDate"
                            type="date"
                            defaultValue={
                                formState.formData
                                    ?.get("endDate")
                                    ?.toString() ?? ""
                            }
                            className={
                                formState.zodErrors?.endDate
                                    ? "border-red-500"
                                    : ""
                            }
                            disabled={isPending}
                            required
                            min="0001-01-01"
                            max="9999-12-31"
                        />
                        {formState.zodErrors?.endDate && (
                            <div id="trip-end-errors">
                                <ZodErrors
                                    error={formState.zodErrors.endDate}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {formState.message && (
                <div
                    className={`flex items-center gap-2 text-sm rounded-md ${formState.status === "error" ? "text-red-500" : formState.status === "success" ? "text-green-500" : "text-yellow-300"}`}
                >
                    <Info className="w-4 h-4" />
                    <p>{formState.message}</p>
                </div>
            )}
            {(formState.error || !!formState.details?.length) && (
                <div>
                    {formState.error && (
                        <DetailsErrors
                            error={{ field: "trip", message: formState.error }}
                        />
                    )}
                    {formState.details?.map((error) => (
                        <DetailsErrors
                            key={error.field + error.message}
                            error={error}
                        />
                    ))}
                </div>
            )}
            <DialogFooter className="gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-bright-blue text-white hover:bg-blue-600"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {trip ? "Saving..." : "Creating..."}
                        </>
                    ) : trip ? (
                        "Save name"
                    ) : (
                        "Create trip"
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
